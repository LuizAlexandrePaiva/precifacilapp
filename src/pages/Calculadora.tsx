import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calcularPreco, CalculationInput, CalculationResult, RegimeTributario } from '@/lib/calculator';
import { Calculator, ArrowRight } from 'lucide-react';

export default function Calculadora() {
  const navigate = useNavigate();
  const [input, setInput] = useState<CalculationInput>({
    metaLiquida: 5000,
    horasPorSemana: 40,
    regime: 'mei',
    custosFixos: 500,
    semanasFerias: 4,
  });
  const [result, setResult] = useState<CalculationResult | null>(null);

  const handleCalc = (e: React.FormEvent) => {
    e.preventDefault();
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
                <Input type="number" min={0} value={input.metaLiquida} onChange={(e) => setInput({ ...input, metaLiquida: +e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Horas de trabalho por semana</Label>
                <Input type="number" min={1} max={80} value={input.horasPorSemana} onChange={(e) => setInput({ ...input, horasPorSemana: +e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Regime tributário</Label>
                <Select value={input.regime} onValueChange={(v) => setInput({ ...input, regime: v as RegimeTributario })}>
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
                <Input type="number" min={0} value={input.custosFixos} onChange={(e) => setInput({ ...input, custosFixos: +e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Semanas de férias por ano</Label>
                <Input type="number" min={0} max={12} value={input.semanasFerias} onChange={(e) => setInput({ ...input, semanasFerias: +e.target.value })} required />
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

            <div className="bg-muted rounded-lg p-4">
              <h4 className="font-semibold mb-2">Como chegamos nesse valor?</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{result.explicacao}</p>
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
