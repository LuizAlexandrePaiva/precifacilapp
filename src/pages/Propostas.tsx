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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { InfoModal } from '@/components/InfoModal';
import { Separator } from '@/components/ui/separator';
import { CurrencyInput } from '@/components/CurrencyInput';
import { FileText, Plus, Check, X, Clock, Trash2, Download } from 'lucide-react';
import { generateProposalPdf } from '@/lib/generatePdf';

import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

type PrazoUnidade = 'horas' | 'dias';

interface Proposal {
  id: string;
  cliente: string;
  projeto: string;
  escopo: string;
  inclusos: string;
  nao_inclusos: string;
  forma_pagamento: string;
  validade_dias: number;
  freelancer_nome: string;
  freelancer_email: string;
  freelancer_whatsapp: string;
  prazo: number;
  prazo_unidade: string;
  preco_hora: number;
  pacote: string;
  valor_pacote: number;
  status: string;
  created_at: string;
}

const pacoteMultiplier = { basico: 1, padrao: 1.4, premium: 2 };
const pacoteLabel: Record<string, string> = { basico: 'Preço mínimo', padrao: 'Preço justo', premium: 'Preço premium' };

const parseBR = (v: string) => {
  const clean = v.replace(/\./g, '').replace(',', '.');
  return parseFloat(clean);
};

function maskPhone(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2')
    .slice(0, 15);
}

export default function Propostas() {
  const location = useLocation();
  const { user } = useAuth();
  const precoHoraFromCalc = (location.state as any)?.precoHora || 0;
  const isMobile = useIsMobile();

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [cliente, setCliente] = useState('');
  const [projeto, setProjeto] = useState('');
  const [escopo, setEscopo] = useState('');
  const [inclusos, setInclusos] = useState('');
  const [naoInclusos, setNaoInclusos] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('50% na assinatura · 50% na entrega final');
  const [validadeDias, setValidadeDias] = useState(7);
  const [prazo, setPrazo] = useState('');
  const [prazoUnidade, setPrazoUnidade] = useState<PrazoUnidade>('horas');
  const [precoHora, setPrecoHora] = useState(0);
  const [pacote, setPacote] = useState<'basico' | 'padrao' | 'premium' | 'selecione'>('selecione');

  const [freelancerNome, setFreelancerNome] = useState('');
  const [freelancerEmail, setFreelancerEmail] = useState('');
  const [freelancerWhatsapp, setFreelancerWhatsapp] = useState('');

  useEffect(() => {
    if (precoHoraFromCalc > 0) {
      setPrecoHora(precoHoraFromCalc);
      setOpen(true);
    }
  }, [precoHoraFromCalc]);

  const fetchProposals = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('proposals')
      .select('id, cliente, projeto, escopo, inclusos, nao_inclusos, forma_pagamento, validade_dias, freelancer_nome, freelancer_email, freelancer_whatsapp, prazo, prazo_unidade, preco_hora, pacote, valor_pacote, status, created_at')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Erro ao carregar propostas');
    } else {
      setProposals((data as any) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProposals();
  }, [user]);

  const getPrazoNum = () => parseBR(prazo) || 0;
  const getActivePacote = () => (pacote === 'selecione' ? 'padrao' : pacote);
  const calcValorPacote = () => {
    const prazoHoras = prazoUnidade === 'dias' ? getPrazoNum() * 8 : getPrazoNum();
    return precoHora * prazoHoras * pacoteMultiplier[getActivePacote()];
  };

  const resetForm = () => {
    setCliente('');
    setProjeto('');
    setEscopo('');
    setInclusos('');
    setNaoInclusos('');
    setFormaPagamento('50% na assinatura · 50% na entrega final');
    setValidadeDias(7);
    setPrazo('');
    setPrazoUnidade('horas');
    setPacote('selecione');
    setFreelancerNome('');
    setFreelancerEmail('');
    setFreelancerWhatsapp('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const valorPacote = calcValorPacote();
    const prazoHoras = prazoUnidade === 'dias' ? getPrazoNum() * 8 : getPrazoNum();

    const { error } = await supabase.from('proposals').insert({
      user_id: user.id,
      cliente,
      projeto,
      escopo,
      inclusos,
      nao_inclusos: naoInclusos,
      forma_pagamento: formaPagamento,
      validade_dias: validadeDias,
      freelancer_nome: freelancerNome,
      freelancer_email: freelancerEmail,
      freelancer_whatsapp: freelancerWhatsapp,
      prazo: prazoHoras,
      prazo_unidade: prazoUnidade,
      preco_hora: precoHora,
      pacote: getActivePacote(),
      valor_pacote: valorPacote,
      status: 'pendente',
    } as any);

    if (error) {
      toast.error('Erro ao salvar proposta');
    } else {
      toast.success('Proposta salva com sucesso!');
      resetForm();
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

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('proposals').delete().eq('id', id);
    if (error) {
      toast.error('Erro ao excluir proposta');
    } else {
      toast.success('Proposta excluída com sucesso');
      fetchProposals();
    }
  };

  const handleDownloadPdf = (p: Proposal) => {
    generateProposalPdf({
      cliente: p.cliente,
      projeto: p.projeto,
      escopo: p.escopo || '',
      inclusos: p.inclusos || '',
      nao_inclusos: p.nao_inclusos || '',
      forma_pagamento: p.forma_pagamento || '50% na assinatura · 50% na entrega final',
      validade_dias: p.validade_dias || 7,
      prazo: p.prazo,
      prazo_unidade: p.prazo_unidade,
      preco_hora: p.preco_hora,
      created_at: p.created_at,
      freelancer_nome: p.freelancer_nome || '',
      freelancer_email: p.freelancer_email || '',
      freelancer_whatsapp: p.freelancer_whatsapp || '',
    });
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pendente': return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Pendente</Badge>;
      case 'aprovada': return <Badge className="bg-emerald-600 hover:bg-emerald-700 gap-1"><Check className="h-3 w-3" />Aprovada</Badge>;
      case 'recusada': return <Badge variant="destructive" className="gap-1"><X className="h-3 w-3" />Recusada</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const actionBtnPrimary = "h-8 text-xs flex-1 min-w-0 border border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground transition-all duration-200 cursor-pointer";
  const actionBtnDestructive = "h-8 text-xs flex-1 min-w-0 border border-destructive text-destructive bg-transparent hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 cursor-pointer";

  const renderProposalActions = (p: Proposal) => (
    <div className="flex flex-col gap-1.5 w-full min-w-[180px]">
      {p.status === 'pendente' && (
        <div className="flex gap-1.5">
          <Button size="sm" variant="ghost" className={actionBtnPrimary} onClick={() => handleStatusChange(p, 'aprovada')}>
            <Check className="h-3 w-3 mr-1" />Aprovar
          </Button>
          <Button size="sm" variant="ghost" className={actionBtnDestructive} onClick={() => handleStatusChange(p, 'recusada')}>
            <X className="h-3 w-3 mr-1" />Recusar
          </Button>
        </div>
      )}
      <div className="flex gap-1.5">
        <Button size="sm" variant="ghost" className={actionBtnPrimary} onClick={() => handleDownloadPdf(p)}>
          <Download className="h-3 w-3 mr-1" />PDF
        </Button>
        <div className="flex-1 min-w-0">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost" className={`${actionBtnDestructive} w-full`}>
                <Trash2 className="h-3 w-3 mr-1" />Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir proposta</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir esta proposta? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(p.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );

  const renderMobileCards = () => (
    <div className="space-y-4">
      {proposals.map((p) => (
        <Card key={p.id}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-foreground">{p.cliente}</p>
                <p className="text-sm text-muted-foreground">{p.projeto}</p>
              </div>
              {statusBadge(p.status)}
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Nível</p>
                <p className="font-medium">{pacoteLabel[p.pacote] || p.pacote}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Valor</p>
                <p className="font-medium">R$ {Number(p.valor_pacote).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Data</p>
                <p className="font-medium">{new Date(p.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            {renderProposalActions(p)}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start md:items-center justify-between gap-4">
        <div className="min-w-0 w-min">
          <h1 className="text-2xl font-bold flex items-center gap-2 whitespace-nowrap">
            <FileText className="h-6 w-6 text-primary flex-shrink-0" />
            Propostas
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Gerencie suas propostas enviadas a clientes</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Nova Proposta</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
            <DialogHeader className="px-6 pt-6 pb-0">
              <DialogTitle>Nova Proposta</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 pb-0">
              <form id="proposal-form" onSubmit={handleSave} className="space-y-5 py-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Seus dados</h3>
                  <p className="text-xs text-muted-foreground -mt-2">Essas informações aparecem no PDF da proposta</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Seu nome</Label>
                      <Input value={freelancerNome} onChange={(e) => setFreelancerNome(e.target.value)} placeholder="Nome completo" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={freelancerEmail} onChange={(e) => setFreelancerEmail(e.target.value)} placeholder="seu@email.com" type="email" className="h-11" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp</Label>
                    <Input
                      value={freelancerWhatsapp}
                      onInput={(e) => {
                        const input = e.target as HTMLInputElement;
                        const masked = maskPhone(input.value);
                        setFreelancerWhatsapp(masked);
                        input.value = masked;
                      }}
                      placeholder="(11) 99999-9999"
                      maxLength={15}
                      inputMode="tel"
                      className="h-11 max-w-xs"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Dados do projeto</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome do cliente</Label>
                      <Input value={cliente} onChange={(e) => setCliente(e.target.value)} required placeholder="Ex: João Silva" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label>Nome do projeto</Label>
                      <Input value={projeto} onChange={(e) => setProjeto(e.target.value)} required placeholder="Ex: Site institucional" className="h-11" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      Está incluído
                      <InfoModal title="Está incluído" content="Tudo que será entregue ao cliente conforme combinado." />
                    </Label>
                    <Textarea value={inclusos} onChange={(e) => setInclusos(e.target.value)} placeholder="" className="min-h-[100px] resize-y" />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      Não está incluído
                      <InfoModal title="Não está incluído" content="Tudo que está fora do escopo para evitar mal-entendidos." />
                    </Label>
                    <Textarea value={naoInclusos} onChange={(e) => setNaoInclusos(e.target.value)} placeholder="" className="min-h-[100px] resize-y" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="h-5 flex items-center">Preço/hora</Label>
                      <CurrencyInput value={precoHora} onValueChange={setPrecoHora} placeholder="R$ 0,00" required className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1 h-5">
                        Nível da proposta
                        <InfoModal title="Nível da proposta" content={
                          <ul style={{ margin: 0, paddingLeft: 16, listStyleType: 'disc' }}>
                            <li style={{ marginBottom: 8 }}><strong>Preço Mínimo</strong> — cobre exatamente seus custos.</li>
                            <li style={{ marginBottom: 8 }}><strong>Preço Justo</strong> — margem saudável de 40%. Recomendado.</li>
                            <li><strong>Preço Premium</strong> — dobra o valor base. Para projetos urgentes ou complexos.</li>
                          </ul>
                        } />
                      </Label>
                      <Select value={pacote} onValueChange={(v) => setPacote(v as any)}>
                        <SelectTrigger className={`h-11 ${pacote === 'selecione' ? 'text-muted-foreground' : ''}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="selecione" disabled>Selecione...</SelectItem>
                          <SelectItem value="basico">Mínimo (×1)</SelectItem>
                          <SelectItem value="padrao">Justo (×1,4)</SelectItem>
                          <SelectItem value="premium">Premium (×2)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Prazo estimado</Label>
                      <div className="flex gap-2">
                        <Input inputMode="decimal" placeholder="Ex: 40" value={prazo} onChange={(e) => setPrazo(e.target.value)} required className="flex-1 h-11" />
                        <Select value={prazoUnidade} onValueChange={(v) => setPrazoUnidade(v as PrazoUnidade)}>
                          <SelectTrigger className="w-24 h-11"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="horas">Horas</SelectItem>
                            <SelectItem value="dias">Dias</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Validade (dias)</Label>
                      <Input type="number" min={1} value={validadeDias} onChange={(e) => setValidadeDias(parseInt(e.target.value) || 7)} className="h-11" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Forma de pagamento</Label>
                    <Input value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} placeholder="Ex: 50% na assinatura, 50% na entrega" className="h-11" />
                  </div>

                  {precoHora > 0 && (
                    <div className="bg-accent rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground">Valor do pacote {pacoteLabel[getActivePacote()]}</p>
                      <p className="text-xl font-bold text-primary">
                        R$ {calcValorPacote().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                </div>
              </form>
            </div>
            <div className="px-6 py-4 border-t bg-background">
              <Button type="submit" form="proposal-form" className="w-full h-12 text-base" size="lg">
                Salvar Proposta
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Carregando...</CardContent></Card>
      ) : proposals.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhuma proposta ainda. Clique em "Nova Proposta" para começar.</CardContent></Card>
      ) : isMobile ? (
        renderMobileCards()
      ) : (
        <Card>
          <CardContent className="pt-6 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[200px]">
                    <div className="flex items-center gap-1 justify-end">
                      Ações
                      <InfoModal title="Ações" content={
                        <ul style={{ margin: 0, paddingLeft: 16, listStyleType: 'disc' }}>
                          <li style={{ marginBottom: 8 }}><strong>Aprovar</strong> — cliente aceitou. A proposta vai automaticamente para o Histórico.</li>
                          <li style={{ marginBottom: 8 }}><strong>Recusar</strong> — registra propostas não aceitas.</li>
                          <li style={{ marginBottom: 8 }}><strong>Baixar PDF</strong> — exporta a proposta em PDF profissional.</li>
                          <li><strong>Excluir</strong> — remove a proposta permanentemente.</li>
                        </ul>
                      } iconSize="h-3.5 w-3.5" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposals.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.cliente}</TableCell>
                    <TableCell>{p.projeto}</TableCell>
                    <TableCell>{pacoteLabel[p.pacote] || p.pacote}</TableCell>
                    <TableCell className="whitespace-nowrap">R$ {Number(p.valor_pacote).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell>{new Date(p.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{statusBadge(p.status)}</TableCell>
                    <TableCell className="w-[200px]">
                      <div className="flex flex-col gap-1.5 items-end">
                        {renderProposalActions(p)}
                      </div>
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
