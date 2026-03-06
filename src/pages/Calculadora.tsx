import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CurrencyInput } from '@/components/CurrencyInput';
import { InfoModal } from '@/components/InfoModal';
import { calcularPreco, CalculationInput, CalculationResult, RegimeTributario } from '@/lib/calculator';
import { Calculator, ArrowRight, Lock } from 'lucide-react';
import { useSubscription, PLANS_CONFIG } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMeta } from '@/contexts/MetaContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const formatBR = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Calculadora() {
  const navigate = useNavigate();
  const { plan, canCalculate, incrementCalcCount } = useSubscription();
  const { user } = useAuth();
  const { metaMensal: ctxMetaMensal, metaLiquida: ctxMetaLiquida, metaLoaded, carregarMeta, atualizarMeta } = useMeta();

  const [metaLiquida, setMetaLiquida] = useState(0);
  const [horasPorSemana, setHorasPorSemana] = useState('');
  const [regime, setRegime] = useState<RegimeTributario>('mei');
  const [custosFixos, setCustosFixos] = useState(0);
  const [semanasFerias, setSemanasFerias] = useState('');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Confirmation modal state
  const [showMetaConfirm, setShowMetaConfirm] = useState(false);
  const [pendingResult, setPendingResult] = useState<CalculationResult | null>(null);
  const [isClosingConfirm, setIsClosingConfirm] = useState(false);

  // Load meta from context
  useEffect(() => {
    if (user && !metaLoaded) {
      carregarMeta(user.id);
    }
  }, [user, metaLoaded, carregarMeta]);

  // Pre-fill from context when loaded
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

    const newMeta = calcResult.custoTotal;
    if (ctxMetaMensal !== null && Math.abs(newMeta - ctxMetaMensal) > 0.01) {
      setPendingResult(calcResult);
      setShowMetaConfirm(true);
    } else if (ctxMetaMensal === null) {
      setPendingResult(calcResult);
      saveMetaAndFinish(calcResult);
    } else {
      setResult(calcResult);
    }
    if (plan === 'free') incrementCalcCount();
  };

  const saveMetaAndFinish = async (calcResult: CalculationResult) => {
    const newMeta = calcResult.custoTotal;
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({ meta_mensal: newMeta, meta_liquida: metaLiquida } as any)
        .eq('id', user.id);
      if (error) {
        console.error('Erro ao salvar meta:', error);
        toast.error('Erro ao salvar meta. Tente novamente.');
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

  const handleUpgrade = async () => {
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: PLANS_CONFIG.essencial.price_id },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch {
      toast.error('Erro ao iniciar checkout');
    } finally {
      setCheckoutLoading(false);
    }
  };

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
          <form onSubmit={handleCalc} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Col 1 Row 1 */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1 h-5">
                  Quanto quero ganhar por mês (R$)
                  <InfoModal
                    title="Quanto quero ganhar por mês"
                    content="Informe o valor que você quer receber no bolso ao final do mês, já descontados impostos e despesas. Este valor é usado para calcular seu preço mínimo por hora e também define a Meta de Faturamento exibida no seu Dashboard."
                  />
                </Label>
                <CurrencyInput
                  value={metaLiquida}
                  onValueChange={setMetaLiquida}
                  placeholder="R$ 0,00"
                />
                <p className="text-xs text-muted-foreground">Valor que você quer receber no bolso, após impostos e despesas</p>
              </div>

              {/* Col 2 Row 1 */}
              <div className="space-y-2">
                <Label className="h-5 flex items-center">Horas de trabalho por semana</Label>
                <Input
                  inputMode="decimal"
                  placeholder="Ex: 40 horas"
                  value={horasPorSemana}
                  onChange={(e) => setHorasPorSemana(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">Quantas horas por semana você dedica ao trabalho</p>
              </div>

              {/* Col 1 Row 2 */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1 h-5">
                  Regime tributário
                  <InfoModal
                    title="Regime tributário"
                    content="Selecione como você emite nota fiscal. MEI: para microempreendedores individuais (~5% de imposto). Autônomo PF: pessoa física com carnê-leão (~27,5%). PJ Simples Nacional: empresa no Simples (~12%). Se não sabe, escolha o que mais se aproxima — você pode alterar depois."
                  />
                </Label>
                <Select value={regime} onValueChange={(v) => setRegime(v as RegimeTributario)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mei">MEI (~5% de imposto)</SelectItem>
                    <SelectItem value="autonomo_pf">Autônomo PF (~27,5%)</SelectItem>
                    <SelectItem value="pj_simples">PJ Simples Nacional (~12%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Col 2 Row 2 */}
              <div className="space-y-2">
                <Label className="h-5 flex items-center">Custos fixos mensais (R$)</Label>
                <CurrencyInput
                  value={custosFixos}
                  onValueChange={setCustosFixos}
                  placeholder="R$ 0,00"
                />
                <p className="text-xs text-muted-foreground">Aluguel, internet, ferramentas, assinaturas e outros gastos recorrentes</p>
              </div>

              {/* Col 1 Row 3 */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1 h-5">
                  Semanas sem trabalhar por ano
                  <InfoModal
                    title="Semanas sem trabalhar"
                    content="Usamos esse número para calcular quantas semanas você realmente trabalha no ano. Se você não tira férias, coloque 0. Exemplo: 4 semanas = aproximadamente 1 mês de descanso por ano."
                  />
                </Label>
                <Input
                  inputMode="decimal"
                  placeholder="Ex: 4 semanas"
                  value={semanasFerias}
                  onChange={(e) => setSemanasFerias(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={!canCalculate && plan === 'free'}>
              {!canCalculate && plan === 'free' ? 'Limite atingido — Faça upgrade' : 'Calcular'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-primary">
          <CardContent className="pt-6 space-y-6">
            <h3 className="text-lg font-bold text-center">Seu Preço Mínimo</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-accent rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Por hora</p>
                <p className="text-2xl sm:text-3xl font-bold text-primary whitespace-nowrap">
                  R$ {result.precoHora.toFixed(2).replace('.', ',')}
                </p>
              </div>
              <div className="text-center p-4 bg-accent rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Por dia (8h)</p>
                <p className="text-2xl sm:text-3xl font-bold text-primary whitespace-nowrap">
                  R$ {result.precoDia.toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4 space-y-3">
              <h4 className="font-semibold mb-3">Como chegamos nesse valor?</h4>
              {[
                { icon: '💰', label: 'Salário desejado', value: `R$ ${formatBR(metaLiquida)}` },
                { icon: '🧾', label: `Impostos estimados (${regime === 'mei' ? 'MEI ~5%' : regime === 'autonomo_pf' ? 'Autônomo PF ~27,5%' : 'Simples Nacional ~12%'})`, value: `R$ ${formatBR(result.impostoEstimado)}` },
                { icon: '🏠', label: 'Custos fixos', value: `R$ ${formatBR(custosFixos)}` },
                { icon: '⏱️', label: 'Horas faturáveis reais/mês', value: `${result.horasFaturaveis.toFixed(0)}h`, tooltipTitle: 'Horas faturáveis', tooltip: 'Horas que você realmente trabalha para clientes, descontando reuniões, e-mails e imprevistos.' },
                { icon: '📊', label: 'Total necessário', value: `R$ ${formatBR(result.custoTotal)}` },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span className="text-muted-foreground">{item.label}</span>
                    {item.tooltip && (
                      <InfoModal
                        title={item.tooltipTitle!}
                        content={item.tooltip}
                        iconSize="h-3.5 w-3.5"
                      />
                    )}
                  </span>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
              <div className="border-t border-border pt-3 mt-3 flex items-center justify-between font-bold">
                <span>✅ Resultado</span>
                <span className="text-primary text-lg">R$ {result.precoHora.toFixed(2).replace('.', ',')}/hora</span>
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
            No plano Grátis você pode fazer apenas 1 cálculo por mês. Faça upgrade para o plano Essencial e tenha cálculos ilimitados, gerador de propostas e muito mais.
          </p>
          <Button onClick={() => { setShowLimitModal(false); handleUpgrade(); }} disabled={checkoutLoading} className="w-full">
            {checkoutLoading ? 'Redirecionando...' : 'Fazer upgrade — R$ 29/mês'}
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
