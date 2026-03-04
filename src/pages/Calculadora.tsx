import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CurrencyInput } from '@/components/CurrencyInput';
import { calcularPreco, CalculationInput, CalculationResult, RegimeTributario } from '@/lib/calculator';
import { Calculator, ArrowRight, HelpCircle } from 'lucide-react';

const formatBR = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Calculadora() {
  const navigate = useNavigate();

  const [metaLiquida, setMetaLiquida] = useState(0);
  const [horasPorSemana, setHorasPorSemana] = useState('');
  const [regime, setRegime] = useState<RegimeTributario>('mei');
  const [custosFixos, setCustosFixos] = useState(0);
  const [semanasFerias, setSemanasFerias] = useState('');
  const [result, setResult] = useState<CalculationResult | null>(null);

  const handleCalc = (e: React.FormEvent) => {
    e.preventDefault();
    const input: CalculationInput = {
      metaLiquida,
      horasPorSemana: parseFloat(horasPorSemana) || 0,
      regime,
      custosFixos,
      semanasFerias: parseFloat(semanasFerias) || 0,
    };
    setResult(calcularPreco(input));
  };

  const handleGoToProposal = () => {
    if (result) {
      navigate('/app/propostas', { state: { precoHora: result.precoHora } });
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
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        Usamos esse número para calcular quantas semanas você realmente trabalha no ano. Se você não tira férias, coloque 0. Exemplo: 4 semanas = aproximadamente 1 mês de descanso por ano.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
            <Button type="submit" className="w-full" size="lg">Calcular</Button>
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
                <p className="text-3xl font-bold text-primary">
                  R$ {result.precoHora.toFixed(2).replace('.', ',')}
                </p>
              </div>
              <div className="text-center p-4 bg-accent rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Por dia (8h)</p>
                <p className="text-3xl font-bold text-primary">
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
                { icon: '⏱️', label: 'Horas faturáveis reais/mês', value: `${result.horasFaturaveis.toFixed(0)}h`, tooltip: 'Horas que você realmente trabalha para clientes, descontando reuniões, e-mails e imprevistos.' },
                { icon: '📊', label: 'Total necessário', value: `R$ ${formatBR(result.custoTotal)}` },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span className="text-muted-foreground">{item.label}</span>
                    {item.tooltip && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger type="button">
                            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">{item.tooltip}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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
    </div>
  );
}
