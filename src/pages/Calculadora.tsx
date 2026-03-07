import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CurrencyInput } from '@/components/CurrencyInput';
import { InputWithSuffix } from '@/components/InputWithSuffix';
import { InfoModal } from '@/components/InfoModal';
import { calcularPreco, CalculationInput, CalculationResult, RegimeTributario } from '@/lib/calculator';
import { Calculator, ArrowRight, Lock } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMeta } from '@/contexts/MetaContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useStripeAction } from '@/hooks/useStripeAction';

const formatBR = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Calculadora() {
  const navigate = useNavigate();
  const { plan, canCalculate, incrementCalcCount, loading: subLoading } = useSubscription();
  const { user } = useAuth();
  const { metaMensal: ctxMetaMensal, metaLiquida: ctxMetaLiquida, metaLoaded, carregarMeta, atualizarMeta } = useMeta();

  const [metaLiquida, setMetaLiquida] = useState(0);
  const [horasPorSemana, setHorasPorSemana] = useState('');
  const [regime, setRegime] = useState<RegimeTributario>('mei');
  const [custosFixos, setCustosFixos] = useState(0);
  const [semanasFerias, setSemanasFerias] = useState('');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const { loading: stripeLoading, checkout: stripeCheckout } = useStripeAction();
  const [showLimitModal, setShowLimitModal] = useState(false);

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

  const handleCalc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCalculate) {
      setShowLimitModal(true);
      return;
    }
    const input: CalculationInput = {
      metaLiquida,
      horasPorSemana: parseFloat(horasPorSemana) || 0,
      regime,
      custosFixos,
      semanasFerias: parseFloat(semanasFerias) || 0,
    };
    const calcResult = calcularPreco(input);

    const valorAtual = Number(metaLiquida);
    const valorSalvo = Number(ctxMetaLiquida ?? 0);


    if (valorAtual > 0 && valorAtual !== valorSalvo) {
      setPendingResult(calcResult);
      setShowMetaConfirm(true);
    } else {
      setResult(calcResult);
    }
    if (plan === 'free') incrementCalcCount();
  };

  const saveMetaAndFinish = async (calcResult: CalculationResult) => {
    const newMeta = calcResult.custoTotal;
    if (user) {

      const { error } = await supabase.rpc('update_user_meta', {
        p_user_id: user.id,
        p_meta_mensal: Number(newMeta),
        p_meta_liquida: Number(metaLiquida),
      });


      if (error) {
        console.error('Erro ao salvar meta:', error);
        toast.error('Erro ao salvar meta: ' + error.message);
        return;
      }
      atualizarMeta(newMeta, metaLiquida);
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

  const handleUpgrade = () => stripeCheckout('essencial');

  if (subLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calculator className="h-6 w-6 text-primary" />
          Calculadora de Preço
        </h1>
        <p className="text-muted-foreground mt-1">Descubra seu preço mínimo por hora e por dia</p>
      </div>

      {plan === 'free' && (
        <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Lock className="h-4 w-4 text-amber-600" />
              <span>Plano Grátis: {canCalculate ? '1 cálculo restante' : '0 cálculos restantes'} este mês.</span>
            </div>
            <Button size="sm" variant="outline" onClick={handleUpgrade} disabled={checkoutLoading}>
              {checkoutLoading ? 'Aguarde...' : 'Fazer upgrade'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleCalc} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Col 1 Row 1 — Meta */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1 h-5">
                  Quanto quero ganhar por mês
                  <InfoModal
                    title="Quanto quero ganhar por mês"
                    content={
                      <ul style={{ margin: 0, paddingLeft: 16, listStyleType: 'disc' }}>
                        <li style={{ marginBottom: 8 }}><strong>Valor líquido</strong> — o que você quer receber no bolso, já descontados impostos e despesas.</li>
                        <li><strong>Define sua Meta de Faturamento</strong> no Dashboard e calcula seu preço mínimo por hora.</li>
                      </ul>
                    }
                  />
                </Label>
                <CurrencyInput
                  value={metaLiquida}
                  onValueChange={setMetaLiquida}
                  placeholder="R$ 0,00"
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">Valor líquido desejado após impostos e despesas</p>
              </div>

              {/* Col 2 Row 1 — Horas */}
              <div className="space-y-2">
                <Label className="h-5 flex items-center">Horas de trabalho por semana</Label>
                <InputWithSuffix
                  inputMode="decimal"
                  placeholder="Ex: 40"
                  suffix="horas"
                  value={horasPorSemana}
                  onChange={(e) => setHorasPorSemana(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">Horas semanais dedicadas ao trabalho</p>
              </div>

              {/* Col 1 Row 2 — Regime */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1 h-5">
                  Regime tributário
                  <InfoModal
                    title="Regime tributário"
                    content={
                      <div>
                        <ul style={{ margin: 0, paddingLeft: 16, listStyleType: 'disc' }}>
                          <li style={{ marginBottom: 8 }}><strong>MEI (~5%)</strong> — fatura até R$ 81 mil/ano. Imposto fixo e simples.</li>
                          <li style={{ marginBottom: 8 }}><strong>Autônomo (~27,5%)</strong> — sem CNPJ. Paga INSS e IR sobre o lucro.</li>
                          <li style={{ marginBottom: 8 }}><strong>Simples Nacional (~12%)</strong> — CNPJ até R$ 4,8 milhões. Alíquota varia por atividade.</li>
                          
                        </ul>
                        <p style={{ marginTop: 12 }}>Escolha o regime correto para calcular o impacto real no seu preço.</p>
                      </div>
                    }
                  />
                </Label>
                <Select value={regime} onValueChange={(v) => setRegime(v as RegimeTributario)}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mei">MEI (~5% de imposto)</SelectItem>
                    <SelectItem value="autonomo_pf">Autônomo PF (~27,5%)</SelectItem>
                    <SelectItem value="pj_simples">PJ Simples Nacional (~12%)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Como você emite nota fiscal</p>
              </div>

              {/* Col 2 Row 2 — Custos fixos */}
              <div className="space-y-2">
                <Label className="h-5 flex items-center">Custos fixos mensais</Label>
                <CurrencyInput
                  value={custosFixos}
                  onValueChange={setCustosFixos}
                  placeholder="R$ 0,00"
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">Aluguel, internet, ferramentas e assinaturas</p>
              </div>
            </div>

            {/* Full width — Semanas férias */}
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
              <InputWithSuffix
                inputMode="decimal"
                placeholder="Ex: 4"
                suffix="semanas"
                value={semanasFerias}
                onChange={(e) => setSemanasFerias(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full h-[52px] mt-6 text-base" size="lg" disabled={!canCalculate && plan === 'free'}>
              {!canCalculate && plan === 'free' ? 'Limite atingido — Faça upgrade' : 'Calcular'}
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
                { label: `Impostos (${regime === 'mei' ? 'MEI ~5%' : regime === 'autonomo_pf' ? 'PF ~27,5%' : 'Simples ~12%'})`, value: `R$ ${formatBR(result.impostoEstimado)}` },
                { label: 'Custos fixos', value: `R$ ${formatBR(custosFixos)}` },
                { label: 'Horas faturáveis/mês', value: `${result.horasFaturaveis.toFixed(0)}h`, tooltipTitle: 'Horas faturáveis', tooltip: 'Horas que você realmente trabalha para clientes, descontando reuniões, e-mails e imprevistos.' },
                { label: 'Total necessário', value: `R$ ${formatBR(result.custoTotal)}` },
              ].map((item) => (
                <div key={item.label} className="flex items-start justify-between gap-2 text-[13px] sm:text-sm">
                  <span className="flex items-center gap-1 min-w-0 max-w-[55%]">
                    <span className="text-muted-foreground break-words">{item.label}</span>
                    {item.tooltip && (
                      <InfoModal
                        title={item.tooltipTitle!}
                        content={item.tooltip}
                        iconSize="h-3.5 w-3.5"
                      />
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

      {/* Limit modal */}
      <Dialog open={showLimitModal} onOpenChange={setShowLimitModal}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center gap-3">
              <Lock className="h-10 w-10 text-amber-500" />
              Limite atingido
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Você atingiu o limite do plano Grátis. Assine o Essencial para cálculos ilimitados.
          </p>
          <Button onClick={() => { setShowLimitModal(false); handleUpgrade(); }} disabled={checkoutLoading} className="w-full">
            {checkoutLoading ? 'Redirecionando...' : 'Assinar agora'}
          </Button>
        </DialogContent>
      </Dialog>

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
