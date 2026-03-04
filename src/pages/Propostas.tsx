import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Plus, Check, X, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type PrazoUnidade = 'horas' | 'dias';

interface Proposal {
  id: string;
  cliente: string;
  projeto: string;
  escopo: string;
  prazo: number;
  prazo_unidade: string;
  preco_hora: number;
  pacote: string;
  valor_pacote: number;
  status: string;
  created_at: string;
}

interface ProposalForm {
  cliente: string;
  projeto: string;
  escopo: string;
  prazo: number;
  prazoUnidade: PrazoUnidade;
  precoHora: number;
  pacote: 'basico' | 'padrao' | 'premium';
}

const pacoteMultiplier = { basico: 1, padrao: 1.4, premium: 2 };
const pacoteLabel: Record<string, string> = { basico: 'Básico', padrao: 'Padrão', premium: 'Premium' };

export default function Propostas() {
  const location = useLocation();
  const { user } = useAuth();
  const precoHoraFromCalc = (location.state as any)?.precoHora || 0;

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ProposalForm>({
    cliente: '',
    projeto: '',
    escopo: '',
    prazo: 40,
    prazoUnidade: 'horas',
    precoHora: precoHoraFromCalc,
    pacote: 'padrao',
  });

  useEffect(() => {
    if (precoHoraFromCalc > 0) {
      setForm(f => ({ ...f, precoHora: precoHoraFromCalc }));
      setOpen(true);
    }
  }, [precoHoraFromCalc]);

  const fetchProposals = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Erro ao carregar propostas');
    } else {
      setProposals(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProposals();
  }, [user]);

  const calcValorPacote = () => {
    const prazoHoras = form.prazoUnidade === 'dias' ? form.prazo * 8 : form.prazo;
    return form.precoHora * prazoHoras * pacoteMultiplier[form.pacote];
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const valorPacote = calcValorPacote();
    const prazoHoras = form.prazoUnidade === 'dias' ? form.prazo * 8 : form.prazo;

    const { error } = await supabase.from('proposals').insert({
      user_id: user.id,
      cliente: form.cliente,
      projeto: form.projeto,
      escopo: form.escopo,
      prazo: prazoHoras,
      prazo_unidade: form.prazoUnidade,
      preco_hora: form.precoHora,
      pacote: form.pacote,
      valor_pacote: valorPacote,
      status: 'pendente',
    });

    if (error) {
      toast.error('Erro ao salvar proposta');
    } else {
      toast.success('Proposta salva com sucesso!');
      setForm({ cliente: '', projeto: '', escopo: '', prazo: 40, prazoUnidade: 'horas', precoHora: form.precoHora, pacote: 'padrao' });
      setOpen(false);
      fetchProposals();
    }
  };

  const handleStatusChange = async (proposal: Proposal, newStatus: 'aprovada' | 'recusada') => {
    const { error } = await supabase.from('proposals').update({ status: newStatus }).eq('id', proposal.id);
    if (error) {
      toast.error('Erro ao atualizar status');
      return;
    }

    if (newStatus === 'aprovada' && user) {
      const { error: projError } = await supabase.from('projects').insert({
        user_id: user.id,
        proposal_id: proposal.id,
        cliente: proposal.cliente,
        projeto: proposal.projeto,
        valor_cotado: proposal.valor_pacote,
        preco_min_hora: proposal.preco_hora,
        status: 'aprovado',
      });
      if (projError) {
        toast.error('Erro ao criar projeto no histórico');
      } else {
        toast.success('Proposta aprovada e projeto criado no histórico!');
      }
    } else {
      toast.success(`Proposta marcada como ${newStatus}`);
    }
    fetchProposals();
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pendente': return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Pendente</Badge>;
      case 'aprovada': return <Badge className="bg-emerald-600 hover:bg-emerald-700 gap-1"><Check className="h-3 w-3" />Aprovada</Badge>;
      case 'recusada': return <Badge variant="destructive" className="gap-1"><X className="h-3 w-3" />Recusada</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Propostas
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie suas propostas enviadas a clientes</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Nova Proposta</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nova Proposta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                <Textarea value={form.escopo} onChange={(e) => setForm({ ...form, escopo: e.target.value })} placeholder="Descreva o que será entregue..." rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preço/hora (R$)</Label>
                  <Input type="number" min={0} step={0.01} value={form.precoHora || ''} onChange={(e) => setForm({ ...form, precoHora: +e.target.value })} required placeholder="Ex: 51,34" />
                </div>
                <div className="space-y-2">
                  <Label>Pacote</Label>
                  <Select value={form.pacote} onValueChange={(v) => setForm({ ...form, pacote: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basico">Básico (1x)</SelectItem>
                      <SelectItem value="padrao">Padrão (1.4x)</SelectItem>
                      <SelectItem value="premium">Premium (2x)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Prazo estimado</Label>
                <div className="flex gap-2">
                  <Input type="number" min={1} value={form.prazo} onChange={(e) => setForm({ ...form, prazo: +e.target.value })} required className="flex-1" />
                  <Select value={form.prazoUnidade} onValueChange={(v) => setForm({ ...form, prazoUnidade: v as PrazoUnidade })}>
                    <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="horas">Horas</SelectItem>
                      <SelectItem value="dias">Dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {form.precoHora > 0 && (
                <div className="bg-accent rounded-lg p-3 text-center">
                  <p className="text-sm text-muted-foreground">Valor do pacote {pacoteLabel[form.pacote]}</p>
                  <p className="text-xl font-bold text-primary">
                    R$ {calcValorPacote().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              )}
              <Button type="submit" className="w-full" size="lg">Salvar Proposta</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Carregando...</CardContent></Card>
      ) : proposals.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhuma proposta ainda. Clique em "Nova Proposta" para começar.</CardContent></Card>
      ) : (
        <Card>
          <CardContent className="pt-6 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Pacote</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposals.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.cliente}</TableCell>
                    <TableCell>{p.projeto}</TableCell>
                    <TableCell>{pacoteLabel[p.pacote] || p.pacote}</TableCell>
                    <TableCell>R$ {Number(p.valor_pacote).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell>{new Date(p.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{statusBadge(p.status)}</TableCell>
                    <TableCell className="text-right">
                      {p.status === 'pendente' && (
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleStatusChange(p, 'aprovada')}>
                            <Check className="h-3 w-3 mr-1" />Aprovar
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => handleStatusChange(p, 'recusada')}>
                            <X className="h-3 w-3 mr-1" />Recusar
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
