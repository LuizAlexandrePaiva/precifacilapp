import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CurrencyInput } from '@/components/CurrencyInput';
import { InfoModal } from '@/components/InfoModal';
import { calcularPreco, CalculationInput, CalculationResult, RegimeTributario } from '@/lib/calculator';
import { Calculator, ArrowRight, Lock } from 'lucide-react';
import { useSubscription, PLANS_CONFIG } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const formatBR = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Calculadora() {
  const navigate = useNavigate();
  const { plan, canCalculate, incrementCalcCount, monthlyCalcCount } = useSubscription();

  const [metaLiquida, setMetaLiquida] = useState(0);
  const [horasPorSemana, setHorasPorSemana] = useState('');
  const [regime, setRegime] = useState<RegimeTributario>('mei');
  const [custosFixos, setCustosFixos] = useState(0);
  const [semanasFerias, setSemanasFerias] = useState('');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

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
    setResult(calcularPreco(input));
    if (plan === 'free') incrementCalcCount();
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
              <div className="space-y-2">
                <Label>Meta líquida mensal (R$)</Label>
                <CurrencyInput
                  value={metaLiquida}
                  onValueChange={setMetaLiquida}
                  placeholder="R$ 0,00"
                />
              </div>
              <div className="space-y-2">
                <Label>Horas de trabalho por semana</Label>
                <Input
                  inputMode="decimal"
                  placeholder="Ex: 40"
                  value={horasPorSemana}
                  onChange={(e) => setHorasPorSemana(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Regime tributário</Label>
                <Select value={regime} onValueChange={(v) => setRegime(v as RegimeTributario)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mei">MEI</SelectItem>
                    <SelectItem value="autonomo_pf">Autônomo PF</SelectItem>
                    <SelectItem value="pj_simples">PJ Simples Nacional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Custos fixos mensais (R$)</Label>
                <CurrencyInput
                  value={custosFixos}
                  onValueChange={setCustosFixos}
                  placeholder="R$ 0,00"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Semanas sem trabalhar por ano
                  <InfoModal
                    title="Semanas sem trabalhar"
                    content="Usamos esse número para calcular quantas semanas você realmente trabalha no ano. Se você não tira férias, coloque 0. Exemplo: 4 semanas = aproximadamente 1 mês de descanso por ano."
                  />
                </Label>
                <Input
                  inputMode="decimal"
                  placeholder="Ex: 4"
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
          <CardHeader>
            <CardTitle className="text-center">Seu Preço Mínimo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
                { icon: '💰', label: 'Meta líquida', value: `R$ ${formatBR(metaLiquida)}` },
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

      {/* Modal de limite atingido — Plano Grátis */}
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
    </div>
  );
}
