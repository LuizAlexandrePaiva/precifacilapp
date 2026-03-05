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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { CurrencyInput } from '@/components/CurrencyInput';
import { FileText, Plus, Check, X, Clock, HelpCircle, Trash2, Lock, Download } from 'lucide-react';
import { generateProposalPdf } from '@/lib/generatePdf';

import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription, PLANS_CONFIG } from '@/contexts/SubscriptionContext';
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
  const { canAccessProposals, canExportPdf } = useSubscription();
  const precoHoraFromCalc = (location.state as any)?.precoHora || 0;
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const isMobile = useIsMobile();

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Form fields
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

  // Freelancer info
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
      .select('*')
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

  const handleUpgrade = async () => {
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: PLANS_CONFIG.essencial.price_id },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (err: any) {
      toast.error('Erro ao iniciar checkout');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!canAccessProposals) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Propostas
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie suas propostas enviadas a clientes</p>
        </div>
        <Card className="border-amber-500/50">
          <CardContent className="py-12 text-center space-y-4">
            <Lock className="h-12 w-12 text-amber-600 mx-auto" />
            <h2 className="text-xl font-semibold">Recurso disponível nos planos pagos</h2>
            <p className="text-muted-foreground">O gerador de propostas está disponível a partir do plano Essencial (R$ 29/mês).</p>
            <Button onClick={handleUpgrade} disabled={checkoutLoading}>
              {checkoutLoading ? 'Redirecionando...' : 'Assinar Essencial'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderProposalActions = (p: Proposal) => (
    <div className="flex flex-col gap-1.5">
      {p.status === 'pendente' && (
        <div className="flex gap-1.5">
          <Button size="sm" variant="outline" className="h-8 text-xs flex-1 min-w-0" onClick={() => handleStatusChange(p, 'aprovada')}>
            <Check className="h-3 w-3 mr-1" />Aprovar
          </Button>
          <Button size="sm" variant="ghost" className="h-8 text-xs text-destructive flex-1 min-w-0" onClick={() => handleStatusChange(p, 'recusada')}>
            <X className="h-3 w-3 mr-1" />Recusar
          </Button>
        </div>
      )}
      <div className="flex gap-1.5">
        {canExportPdf ? (
          <Button size="sm" variant="outline" className="h-8 text-xs flex-1 min-w-0" onClick={() => handleDownloadPdf(p)}>
            <Download className="h-3 w-3 mr-1" />PDF
          </Button>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 text-xs flex-1 min-w-0 opacity-50 cursor-not-allowed" disabled>
                  <Lock className="h-3 w-3 mr-1" />PDF
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" className="max-w-xs z-[9999]">
                Disponível no plano Pro. Faça upgrade para exportar propostas em PDF.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="ghost" className="h-8 text-xs text-destructive flex-1 min-w-0">
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
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Proposta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              {/* Freelancer Info */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Seus dados (aparecem no PDF)</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Seu nome</Label>
                    <Input value={freelancerNome} onChange={(e) => setFreelancerNome(e.target.value)} placeholder="Seu nome" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Email</Label>
                    <Input value={freelancerEmail} onChange={(e) => setFreelancerEmail(e.target.value)} placeholder="seu@email.com" type="email" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">WhatsApp</Label>
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
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Client & Project */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do cliente</Label>
                  <Input value={cliente} onChange={(e) => setCliente(e.target.value)} required placeholder="Ex: João Silva" />
                </div>
                <div className="space-y-2">
                  <Label>Nome do projeto</Label>
                  <Input value={projeto} onChange={(e) => setProjeto(e.target.value)} required placeholder="Ex: Site institucional" />
                </div>
              </div>

              {/* Scope - Inclusos */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Está incluído
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="inline-flex">
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" align="start" className="max-w-xs z-[9999]">
                        Tudo que será entregue ao cliente conforme combinado.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Textarea value={inclusos} onChange={(e) => setInclusos(e.target.value)} placeholder={"Design de 5 páginas\n2 rodadas de revisão\nResponsivo mobile"} rows={3} />
              </div>

              {/* Scope - Não inclusos */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Não está incluído
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="inline-flex">
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" align="start" className="max-w-xs z-[9999]">
                        Tudo que está fora do escopo para evitar mal-entendidos.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Textarea value={naoInclusos} onChange={(e) => setNaoInclusos(e.target.value)} placeholder={"Textos e conteúdo\nFotografia\nManutenção mensal"} rows={2} />
              </div>

              {/* Price & Package */}
              <div className="grid grid-cols-2 gap-4 items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-1 h-5">
                    <Label>Preço/hora (R$)</Label>
                  </div>
                  <CurrencyInput
                    value={precoHora}
                    onValueChange={setPrecoHora}
                    placeholder="R$ 0,00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1 h-5">
                    <Label>Nível da proposta</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="inline-flex">
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" align="start" className="max-w-xs z-[9999]">
                          O nível define o valor final da proposta. Preço mínimo cobre exatamente seus custos. Preço justo adiciona uma margem saudável de 40% — recomendado para a maioria dos projetos. Preço premium dobra o valor base — ideal para projetos urgentes, complexos ou fora da sua especialidade.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Select value={pacote} onValueChange={(v) => setPacote(v as any)}>
                    <SelectTrigger className={pacote === 'selecione' ? 'text-muted-foreground' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="selecione" disabled>Selecione o nível...</SelectItem>
                      <SelectItem value="basico">Preço mínimo (×1)</SelectItem>
                      <SelectItem value="padrao">Preço justo (×1,4) — Recomendado</SelectItem>
                      <SelectItem value="premium">Preço premium (×2)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <Label>Prazo estimado</Label>
                <div className="flex gap-2">
                  <Input
                    inputMode="decimal"
                    placeholder="Ex: 40"
                    value={prazo}
                    onChange={(e) => setPrazo(e.target.value)}
                    required
                    className="flex-1"
                  />
                  <Select value={prazoUnidade} onValueChange={(v) => setPrazoUnidade(v as PrazoUnidade)}>
                    <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="horas">Horas</SelectItem>
                      <SelectItem value="dias">Dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Payment & Validity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Forma de pagamento</Label>
                  <Input value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} placeholder="50% na assinatura · 50% na entrega" />
                </div>
                <div className="space-y-2">
                  <Label>Validade (dias)</Label>
                  <Input type="number" min={1} value={validadeDias} onChange={(e) => setValidadeDias(parseInt(e.target.value) || 7)} />
                </div>
              </div>

              {precoHora > 0 && (
                <div className="bg-accent rounded-lg p-3 text-center">
                  <p className="text-sm text-muted-foreground">Valor do pacote {pacoteLabel[getActivePacote()]}</p>
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
                  <TableHead>
                    <div className="flex items-center gap-1 justify-end">
                      Ações
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="inline-flex">
                              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" align="start" className="max-w-xs z-[9999]">
                            Marque Aprovada quando o cliente aceitar a proposta — ela irá automaticamente para o Histórico. Marque Recusada para registrar propostas não aceitas.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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
                    <TableCell>R$ {Number(p.valor_pacote).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell>{new Date(p.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{statusBadge(p.status)}</TableCell>
                    <TableCell>
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
