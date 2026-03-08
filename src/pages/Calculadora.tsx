import { useState, useEffect } from 'react';
import { SEO } from '@/components/SEO';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { CurrencyInput } from '@/components/CurrencyInput';
import { InputWithSuffix } from '@/components/InputWithSuffix';
import { InfoModal } from '@/components/InfoModal';
import { RegimeFields } from '@/components/RegimeFields';
import { calcularPreco, CalculationInput, CalculationResult, RegimeTributario, AtividadeMEI, FaixaRendaPF, AnexoSimples, FaixaFaturamentoSimples } from '@/lib/calculator';
import { Calculator, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMeta } from '@/contexts/MetaContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { trackEvent } from '@/lib/analytics';

const formatBR = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Calculadora() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { metaMensal: ctxMetaMensal, metaLiquida: ctxMetaLiquida, metaLoaded, carregarMeta, atualizarMeta } = useMeta();

  const [metaLiquida, setMetaLiquida] = useState(0);
  const [horasPorSemana, setHorasPorSemana] = useState('');
  const [regime, setRegime] = useState<RegimeTributario>('mei');
  const [custosFixos, setCustosFixos] = useState(0);
  const [semanasFerias, setSemanasFerias] = useState('');
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Sub-fields
  const [atividadeMEI, setAtividadeMEI] = useState<AtividadeMEI | ''>('');
  const [faixaRendaPF, setFaixaRendaPF] = useState<FaixaRendaPF | ''>('');
  const [anexoSimples, setAnexoSimples] = useState<AnexoSimples | ''>('');
  const [faixaFaturamentoSimples, setFaixaFaturamentoSimples] = useState<FaixaFaturamentoSimples | ''>('');

  const [showMetaConfirm, setShowMetaConfirm] = useState(false);
  const [pendingResult, setPendingResult] = useState<CalculationResult | null>(null);
  const [isClosingConfirm, setIsClosingConfirm] = useState(false);

  useEffect(() => {
    if (user && !metaLoaded) {
      carregarMeta(user.id);
    }
  }, [user, metaLoaded, carregarMeta]);

  useEffect(() => {
    if (metaLoaded && ctxMetaLiquida != null && ctxMetaLiquida > 0) {
      setMetaLiquida(ctxMetaLiquida);
    }
  }, [metaLoaded, ctxMetaLiquida]);

  // Clear sub-fields when regime changes
  const handleRegimeChange = (newRegime: RegimeTributario) => {
    setRegime(newRegime);
    setAtividadeMEI('');
    setFaixaRendaPF('');
    setAnexoSimples('');
    setFaixaFaturamentoSimples('');
  };

  const isSubFieldsComplete = (): boolean => {
    switch (regime) {
      case 'mei': return atividadeMEI !== '';
      case 'autonomo_pf': return faixaRendaPF !== '';
      case 'pj_simples': return anexoSimples !== '' && faixaFaturamentoSimples !== '';
    }
  };

  const getImpostoLabel = (): string => {
    if (regime === 'mei') return 'DAS-MEI (custo fixo)';
    if (regime === 'autonomo_pf') {
      const map: Record<string, string> = { ate_5000: '11%', '5001_7350': '18%', '7351_10000': '26%', acima_10000: '33%' };
      return `Impostos (PF ${map[faixaRendaPF] || ''})`;
    }
    return `Impostos (Simples Nacional)`;
  };

  const handleCalc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubFieldsComplete()) {
      toast.error('Preencha todos os campos do regime tributário.');
      return;
    }
    const input: CalculationInput = {
      metaLiquida,
      horasPorSemana: parseFloat(horasPorSemana) || 0,
      regime,
      custosFixos,
      semanasFerias: parseFloat(semanasFerias) || 0,
      atividadeMEI: atividadeMEI || undefined,
      faixaRendaPF: faixaRendaPF || undefined,
      anexoSimples: anexoSimples || undefined,
      faixaFaturamentoSimples: faixaFaturamentoSimples || undefined,
    };
    const calcResult = calcularPreco(input);
    trackEvent('first_calculation', { regime });

    const valorAtual = Number(metaLiquida);
    const valorSalvo = Number(ctxMetaLiquida ?? 0);

    if (valorAtual > 0 && valorAtual !== valorSalvo) {
      setPendingResult(calcResult);
      setShowMetaConfirm(true);
    } else {
      // Still save precoHora even if meta doesn't change
      if (user) {
        const { error } = await supabase.rpc('update_user_meta', {
          p_user_id: user.id,
          p_meta_mensal: Number(ctxMetaMensal ?? calcResult.custoTotal),
          p_meta_liquida: Number(metaLiquida),
          p_preco_hora: Number(calcResult.precoHora),
        } as any);
        if (!error) {
          atualizarMeta(ctxMetaMensal ?? calcResult.custoTotal, metaLiquida, calcResult.precoHora);
        }
      }
      setResult(calcResult);
    }
  };

  const saveMetaAndFinish = async (calcResult: CalculationResult) => {
    const newMeta = calcResult.custoTotal;
    if (user) {
      const { error } = await supabase.rpc('update_user_meta', {
        p_user_id: user.id,
        p_meta_mensal: Number(newMeta),
        p_meta_liquida: Number(metaLiquida),
        p_preco_hora: Number(calcResult.precoHora),
      } as any);
      if (error) {
        console.error('Erro ao salvar meta:', error);
        toast.error('Erro ao salvar meta: ' + error.message);
        return;
      }
      atualizarMeta(newMeta, metaLiquida, calcResult.precoHora);
      toast.success('Meta de faturamento atualizada no Dashboard!');
    }
    setResult(calcResult);
    setShowMetaConfirm(false);
    setPendingResult(null);
  };

  const handleConfirmMeta = () => {
    if (pendingResult) saveMetaAndFinish(pendingResult);
  };

  const handleDeclineMeta = () => {
    if (pendingResult) setResult(pendingResult);
    setShowMetaConfirm(false);
    setPendingResult(null);
  };

  const closeConfirmModal = () => {
    setIsClosingConfirm(true);
    setTimeout(() => {
      handleDeclineMeta();
      setIsClosingConfirm(false);
    }, 100);
  };

  const handleGoToProposal = () => {
    if (result) {
      navigate('/app/propostas', { state: { precoHora: result.precoHora } });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <SEO title="Calculadora de Preço" description="Calcule seu preço mínimo por hora como freelancer." path="/app/calculadora" noindex />
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calculator className="h-6 w-6 text-primary" />
          Calculadora de Preço
        </h1>
        <p className="text-muted-foreground mt-1">Descubra seu preço mínimo por hora e por dia</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleCalc} className="space-y-6 md:space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-5">
              <div className="space-y-2">
                <Label className="flex items-center gap-1 h-5">
                  Quanto quero ganhar por mês
                  <InfoModal
                    title="Quanto quero ganhar por mês"
                    content={
                      <ul style={{ margin: 0, paddingLeft: 16, listStyleType: 'disc' }}>
                        <li style={{ marginBottom: 8 }}><strong>Valor líquido</strong>: o que você quer receber no bolso, já descontados impostos e despesas.</li>
                        <li><strong>Define sua Meta de Faturamento</strong> no Dashboard e calcula seu preço mínimo por hora.</li>
                      </ul>
                    }
                  />
                </Label>
                <CurrencyInput value={metaLiquida} onValueChange={setMetaLiquida} placeholder="R$ 0,00" className="h-11" />
              </div>

              <div className="space-y-2">
                <Label className="h-5 flex items-center">Horas de trabalho por semana</Label>
                <InputWithSuffix inputMode="decimal" placeholder="Ex: 40" suffix="horas" value={horasPorSemana} onChange={(e) => setHorasPorSemana(e.target.value)} required />
                <p className="text-xs text-muted-foreground hidden md:block">Horas semanais dedicadas ao trabalho</p>
              </div>

              <RegimeFields
                regime={regime}
                onRegimeChange={handleRegimeChange}
                atividadeMEI={atividadeMEI}
                onAtividadeMEIChange={setAtividadeMEI}
                faixaRendaPF={faixaRendaPF}
                onFaixaRendaPFChange={setFaixaRendaPF}
                anexoSimples={anexoSimples}
                onAnexoSimplesChange={setAnexoSimples}
                faixaFaturamentoSimples={faixaFaturamentoSimples}
                onFaixaFaturamentoSimplesChange={setFaixaFaturamentoSimples}
              />

              {regime === 'pj_simples' && (
                <div className="space-y-2">
                  <Label className="h-5 flex items-center">Custos fixos mensais</Label>
                  <CurrencyInput value={custosFixos} onValueChange={setCustosFixos} placeholder="R$ 0,00" className="h-11" />
                   <p className="text-xs text-muted-foreground hidden md:block">Aluguel, internet, ferramentas e assinaturas</p>
                </div>
              )}
            </div>

            {(regime === 'mei' || regime === 'autonomo_pf') && (
              <div className="space-y-2">
                <Label className="h-5 flex items-center">Custos fixos mensais</Label>
                <CurrencyInput value={custosFixos} onValueChange={setCustosFixos} placeholder="R$ 0,00" className="h-11" />
                <p className="text-xs text-muted-foreground hidden md:block">Aluguel, internet, ferramentas e assinaturas</p>
              </div>
            )}

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                Semanas sem trabalhar por ano
                <InfoModal
                  title="Semanas sem trabalhar por ano"
                  content={
                    <div>
                      <p style={{ marginBottom: 8 }}>São as semanas em que você não vai faturar — férias, feriados e imprevistos.</p>
                      <ul style={{ margin: 0, paddingLeft: 16, listStyleType: 'disc' }}>
                        <li style={{ marginBottom: 8 }}><strong>Recomendado:</strong> pelo menos 4 semanas por ano.</li>
                        <li><strong>Quanto mais semanas</strong>, menos horas disponíveis — e maior será seu preço por hora.</li>
                      </ul>
                    </div>
                  }
                />
              </Label>
              <InputWithSuffix inputMode="decimal" placeholder="Ex: 4" suffix="semanas" value={semanasFerias} onChange={(e) => setSemanasFerias(e.target.value)} required />
            </div>

            <Button type="submit" className="w-full h-[52px] mt-6 text-base" size="lg" disabled={!isSubFieldsComplete()}>
              Calcular
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-primary">
          <CardContent className="pt-6 space-y-6">
            <h3 className="text-lg font-bold text-center">Seu Preço Mínimo</h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="text-center p-3 sm:p-4 bg-accent rounded-lg overflow-hidden">
                <p className="text-sm text-muted-foreground mb-1">Por hora</p>
                <p className="font-bold text-primary" style={{ fontSize: 'clamp(1rem, 4vw, 1.875rem)' }}>
                  R$ {formatBR(result.precoHora)}
                </p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-accent rounded-lg overflow-hidden">
                <p className="text-sm text-muted-foreground mb-1">Por dia (8h)</p>
                <p className="font-bold text-primary" style={{ fontSize: 'clamp(1rem, 4vw, 1.875rem)' }}>
                  R$ {formatBR(result.precoDia)}
                </p>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-3 sm:p-4 space-y-3">
              <h4 className="font-semibold mb-3">Como chegamos nesse valor?</h4>
              {[
                { label: 'Salário desejado', value: `R$ ${formatBR(metaLiquida)}` },
                {
                  label: getImpostoLabel(),
                  value: regime === 'mei'
                    ? `R$ ${formatBR(result.dasMEI ?? 0)}`
                    : `R$ ${formatBR(result.impostoEstimado)}`,
                },
                {
                  label: 'Custos fixos',
                  value: `R$ ${formatBR(custosFixos)}`,
                },
                {
                  label: 'Horas faturáveis/mês',
                  value: `${result.horasFaturaveis.toFixed(0)}h`,
                  tooltipTitle: 'Horas faturáveis',
                  tooltip: 'Horas que você realmente trabalha para clientes, descontando reuniões, e-mails e imprevistos.',
                },
                { label: 'Total necessário', value: `R$ ${formatBR(result.custoTotal)}` },
              ].map((item) => (
                <div key={item.label} className="flex items-start justify-between gap-2 text-[13px] sm:text-sm">
                  <span className="flex items-center gap-1 min-w-0 max-w-[55%]">
                    <span className="text-muted-foreground break-words">{item.label}</span>
                    {item.tooltip && (
                      <InfoModal title={item.tooltipTitle!} content={item.tooltip} iconSize="h-3.5 w-3.5" />
                    )}
                  </span>
                  <span className="font-semibold text-right max-w-[45%] break-words">{item.value}</span>
                </div>
              ))}
              <div className="border-t border-border pt-3 mt-3 flex items-center justify-between gap-2 font-bold">
                <span>Resultado</span>
                <span className="text-primary" style={{ fontSize: 'clamp(0.875rem, 3.5vw, 1.125rem)' }}>
                  R$ {formatBR(result.precoHora)}/hora
                </span>
              </div>
            </div>

            <Button onClick={handleGoToProposal} className="w-full" variant="outline" size="lg">
              Gerar Proposta <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Meta confirmation modal */}
      {showMetaConfirm && createPortal(
        <>
          <div
            style={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
              zIndex: 9999, background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
              pointerEvents: isClosingConfirm ? 'none' : 'auto',
            }}
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); closeConfirmModal(); }}
          />
          <div
            style={{
              position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
              zIndex: 10000, width: '90%', maxWidth: 400, padding: 24,
              borderRadius: 12, background: '#ffffff', border: '1px solid #e2e8f0',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
              Atualizar Meta de Faturamento?
            </h3>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: '#4a5568', marginBottom: 20 }}>
              Você alterou o valor que deseja ganhar por mês. Deseja atualizar sua Meta de Faturamento no Dashboard?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleConfirmMeta(); }}
                style={{
                  width: '100%', padding: '10px 0', background: '#3182ce', color: '#fff',
                  border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Sim, atualizar
              </button>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeclineMeta(); }}
                style={{
                  width: '100%', padding: '10px 0', background: 'transparent', color: '#4a5568',
                  border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Não, manter atual
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
