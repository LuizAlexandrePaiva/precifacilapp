import { useState, useEffect } from 'react';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { InfoModal } from '@/components/InfoModal';
import { History, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface Project {
  id: string;
  cliente: string;
  projeto: string;
  valor_cotado: number;
  horas_reais: number | null;
  preco_min_hora: number;
  status: string;
  created_at: string;
}

export default function Historico() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [horasReais, setHorasReais] = useState('');

  const fetchProjects = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('projects')
      .select('id, cliente, projeto, valor_cotado, horas_reais, preco_min_hora, status, created_at')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Erro ao carregar projetos');
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const handleSaveHoras = async () => {
    if (!editProject) return;
    const horas = parseFloat(horasReais.replace(',', '.'));
    if (isNaN(horas) || horas <= 0) {
      toast.error('Informe um número válido de horas');
      return;
    }
    const { error } = await supabase.from('projects').update({ horas_reais: horas }).eq('id', editProject.id);
    if (error) {
      toast.error('Erro ao salvar horas');
    } else {
      toast.success('Horas reais atualizadas!');
      setEditProject(null);
      setHorasReais('');
      fetchProjects();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      toast.error('Erro ao excluir projeto');
    } else {
      toast.success('Projeto excluído com sucesso');
      fetchProjects();
    }
  };

  const getProjectData = (p: Project) => {
    const valorHoraReal = p.horas_reais && p.horas_reais > 0 ? Number(p.valor_cotado) / p.horas_reais : null;
    const acimaMin = valorHoraReal !== null ? valorHoraReal >= Number(p.preco_min_hora) : null;
    return { valorHoraReal, acimaMin };
  };

  const margemBadge = (acimaMin: boolean | null) => {
    if (acimaMin === null) return <span className="text-muted-foreground text-xs">-</span>;
    return acimaMin
      ? <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200 text-xs font-medium px-2 py-0.5">✓ Acima</Badge>
      : <Badge className="bg-red-50 text-red-700 hover:bg-red-50 border-red-200 text-xs font-medium px-2 py-0.5">✗ Abaixo</Badge>;
  };

  const margemTooltipContent = (
    <div>
      <p style={{ marginBottom: 8 }}>Mostra se você cobrou acima ou abaixo do seu custo mínimo neste projeto.</p>
      <ul style={{ margin: 0, paddingLeft: 16, listStyleType: 'disc' }}>
        <li style={{ marginBottom: 8 }}><strong>Verde</strong>: você cobrou acima do mínimo. Resultado saudável.</li>
        <li><strong>Vermelho</strong>: você cobrou abaixo do mínimo. Prejuízo real.</li>
      </ul>
    </div>
  );

  const horasReaisContent = (
    <div>
      <p style={{ marginBottom: 8 }}>Registre as horas que você realmente trabalhou, não as estimadas.</p>
      <ul style={{ margin: 0, paddingLeft: 16, listStyleType: 'disc' }}>
        <li style={{ marginBottom: 8 }}><strong>Se for maior que o estimado</strong>, você cobrou menos do que deveria.</li>
        <li><strong>Use esse dado</strong> para melhorar suas estimativas nos próximos projetos.</li>
      </ul>
    </div>
  );

  const valorHoraRealContent = (
    <div>
      <p style={{ marginBottom: 8 }}>Calculado dividindo o valor total pelas horas reais trabalhadas.</p>
      <ul style={{ margin: 0, paddingLeft: 16, listStyleType: 'disc' }}>
        <li style={{ marginBottom: 8 }}><strong>Compare</strong> com seu preço mínimo da Calculadora.</li>
        <li><strong>Se for menor que o mínimo</strong>, você trabalhou no prejuízo neste projeto.</li>
      </ul>
    </div>
  );

  const formatCurrency = (value: number) =>
    `R$\u00A0${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const helpIcon = (title: string, text: React.ReactNode) => (
    <InfoModal title={title} content={text} iconSize="h-3.5 w-3.5" />
  );

  const renderMobileCards = () => (
    <div className="space-y-4">
      {projects.map((p) => {
        const { valorHoraReal, acimaMin } = getProjectData(p);
        return (
          <Card key={p.id} className="shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-bold text-base text-foreground">{p.cliente}</p>
                {margemBadge(acimaMin)}
              </div>
              <p className="text-sm text-muted-foreground -mt-2">{p.projeto}</p>

              <Separator />

              <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Valor Cotado</p>
                  <p className="text-[15px] font-semibold text-foreground whitespace-nowrap">{formatCurrency(Number(p.valor_cotado))}</p>
                </div>
                <div className="min-h-[2.5rem] flex flex-col">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Horas Reais</p>
                  {p.horas_reais !== null ? (
                    <p className="text-[15px] font-semibold text-foreground">{p.horas_reais}h</p>
                  ) : (
                    <button
                      className="text-xs font-semibold text-primary border border-primary bg-transparent rounded px-3 py-1.5 h-auto self-start hover:bg-primary hover:text-primary-foreground transition-all duration-200 cursor-pointer"
                      onClick={() => { setEditProject(p); setHorasReais(''); }}
                    >
                      Informar horas
                    </button>
                  )}
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Valor/Hora Real</p>
                  <p className="text-[15px] font-semibold text-foreground">
                    {valorHoraReal !== null ? formatCurrency(valorHoraReal) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                    Margem
                    {helpIcon('Margem do projeto', margemTooltipContent)}
                  </p>
                  <div>{margemBadge(acimaMin)}</div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-xs border border-destructive text-destructive bg-transparent hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 cursor-pointer px-4 py-2.5 h-auto">
                      <Trash2 className="h-3 w-3 mr-1" />Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir projeto</AlertDialogTitle>
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
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <SEO title="Histórico de Projetos" description="Acompanhe seus projetos aprovados e analise rentabilidade." path="/app/historico" noindex />
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <History className="h-6 w-6 text-primary" />
          Histórico de Projetos
        </h1>
        <p className="text-muted-foreground mt-1">Acompanhe seus projetos aprovados e compare com o preço mínimo</p>
      </div>

      {loading ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Carregando...</CardContent></Card>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum projeto registrado ainda. Projetos aparecem aqui automaticamente ao aprovar uma proposta.
          </CardContent>
        </Card>
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
                  <TableHead>Valor Cotado</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Horas Reais
                      {helpIcon('Horas reais trabalhadas', horasReaisContent)}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Valor/Hora Real
                      {helpIcon('Valor por hora real', valorHoraRealContent)}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Margem
                      {helpIcon('Margem do projeto', margemTooltipContent)}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p) => {
                  const { valorHoraReal, acimaMin } = getProjectData(p);
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.cliente}</TableCell>
                      <TableCell>{p.projeto}</TableCell>
                      <TableCell>{formatCurrency(Number(p.valor_cotado))}</TableCell>
                      <TableCell>
                        {p.horas_reais !== null ? (
                          `${p.horas_reais}h`
                        ) : (
                          <Button size="sm" variant="ghost" className="h-7 text-xs border border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground transition-all duration-200 cursor-pointer" onClick={() => { setEditProject(p); setHorasReais(''); }}>
                            Informar horas
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        {valorHoraReal !== null
                          ? `R$ ${valorHoraReal.toFixed(2).replace('.', ',')}`
                          : <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell>
                        {margemBadge(acimaMin)}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-7 text-xs border border-destructive text-destructive bg-transparent hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 cursor-pointer">
                              <Trash2 className="h-3 w-3 mr-1" />Excluir
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir projeto</AlertDialogTitle>
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
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!editProject} onOpenChange={(open) => !open && setEditProject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Informar Horas Reais</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Projeto: <strong>{editProject?.projeto}</strong> · Cliente: <strong>{editProject?.cliente}</strong>
          </p>
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              Horas reais gastas
              <InfoModal title="Horas reais trabalhadas" content={horasReaisContent} />
            </Label>
            <Input
              inputMode="decimal"
              placeholder="Ex: 45"
              value={horasReais}
              onChange={(e) => setHorasReais(e.target.value)}
            />
          </div>
          <Button onClick={handleSaveHoras} className="w-full">Salvar</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
