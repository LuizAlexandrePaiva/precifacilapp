import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Check } from 'lucide-react';

type PrazoUnidade = 'horas' | 'dias';

interface ProposalForm {
  cliente: string;
  projeto: string;
  escopo: string;
  prazo: number;
  prazoUnidade: PrazoUnidade;
}

export default function Propostas() {
  const location = useLocation();
  const precoHora = (location.state as any)?.precoHora || 0;

  const [form, setForm] = useState<ProposalForm>({
    cliente: '',
    projeto: '',
    escopo: '',
    prazo: 40,
    prazoUnidade: 'horas',
  });
  const [generated, setGenerated] = useState(false);

  const prazoHoras = form.prazoUnidade === 'dias' ? form.prazo * 8 : form.prazo;
  const basico = precoHora * prazoHoras;
  const padrao = basico * 1.4;
  const premium = basico * 2;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setGenerated(true);
  };

  const packages = [
    { name: 'Básico', price: basico, features: ['Escopo definido', 'Entrega no prazo', 'Sem revisões extras'] },
    { name: 'Padrão', price: padrao, features: ['Escopo definido', 'Até 2 rodadas de revisão', 'Suporte por 7 dias após entrega'], highlighted: true },
    { name: 'Premium', price: premium, features: ['Escopo completo', 'Revisões ilimitadas', 'Suporte por 30 dias', 'Prioridade no atendimento'] },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Gerador de Proposta
        </h1>
        <p className="text-muted-foreground mt-1">
          {precoHora > 0
            ? `Preço base: R$ ${precoHora.toFixed(2).replace('.', ',')}/hora`
            : 'Calcule seu preço primeiro na Calculadora'}
        </p>
      </div>

      {precoHora <= 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Você precisa calcular seu preço mínimo primeiro. Vá para a <strong>Calculadora</strong> e depois clique em "Gerar Proposta".
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do cliente</Label>
                    <Input value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })} required placeholder="Ex: João Silva" />
                  </div>
                  <div className="space-y-2">
                    <Label>Nome do projeto</Label>
                    <Input value={form.projeto} onChange={(e) => setForm({ ...form, projeto: e.target.value })} required placeholder="Ex: Site institucional" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Descrição do escopo</Label>
                  <Textarea value={form.escopo} onChange={(e) => setForm({ ...form, escopo: e.target.value })} required placeholder="Descreva o que será entregue..." rows={3} />
                </div>
                <div className="space-y-2 max-w-sm">
                  <Label>Prazo estimado</Label>
                  <div className="flex gap-2">
                    <Input type="number" min={1} value={form.prazo} onChange={(e) => setForm({ ...form, prazo: +e.target.value })} required className="flex-1" />
                    <Select value={form.prazoUnidade} onValueChange={(v) => setForm({ ...form, prazoUnidade: v as PrazoUnidade })}>
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="horas">Horas</SelectItem>
                        <SelectItem value="dias">Dias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full" size="lg">Gerar Proposta</Button>
              </form>
            </CardContent>
          </Card>

          {generated && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-center">Proposta para {form.cliente}</h2>
              <p className="text-center text-muted-foreground">Projeto: {form.projeto}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                  <Card key={pkg.name} className={pkg.highlighted ? 'border-primary shadow-lg' : ''}>
                    {pkg.highlighted && (
                      <div className="bg-primary text-primary-foreground text-center text-xs font-semibold py-1 rounded-t-lg">
                        Recomendado
                      </div>
                    )}
                    <CardHeader className="text-center pb-2">
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      <CardDescription>
                        <span className="text-2xl font-bold text-foreground">
                          R$ {pkg.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {pkg.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Escopo do Projeto</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{form.escopo}</p>
                  <p className="text-sm text-muted-foreground mt-4">
                    <strong>Prazo estimado:</strong> {form.prazo} {form.prazoUnidade}{form.prazoUnidade === 'dias' ? ` (${prazoHoras}h)` : ''}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
