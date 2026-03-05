import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { History, HelpCircle, Trash2 } from 'lucide-react';
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
      .select('*')
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
    if (acimaMin === null) return <span className="text-muted-foreground text-xs">—</span>;
    return acimaMin
      ? <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200 text-xs font-medium px-2 py-0.5">✓ Acima</Badge>
      : <Badge className="bg-red-50 text-red-700 hover:bg-red-50 border-red-200 text-xs font-medium px-2 py-0.5">✗ Abaixo</Badge>;
  };

  const margemTooltipText = 'Mostra se o projeto ficou acima ou abaixo do seu preço mínimo por hora. Verde significa que foi rentável. Vermelho significa que você cobrou menos do que o necessário.';

  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const renderMobileCards = () => (
    <div className="space-y-4">
      {projects.map((p) => {
        const { valorHoraReal, acimaMin } = getProjectData(p);
        return (
          <Card key={p.id}>
            <CardContent className="p-4 space-y-2.5">
              {/* Linha 1: Cliente + Badge */}
              <div className="flex items-center justify-between">
                <p className="font-bold text-base text-foreground">{p.cliente}</p>
                {margemBadge(acimaMin)}
              </div>
              {/* Linha 2: Projeto */}
              <p className="text-sm text-muted-foreground -mt-1">{p.projeto}</p>

              <Separator />

              {/* Data grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Valor Cotado</p>
                  <p className="font-semibold text-foreground">{formatCurrency(Number(p.valor_cotado))}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Horas Reais</p>
                  {p.horas_reais !== null ? (
                    <p className="font-semibold text-foreground">{p.horas_reais}h</p>
                  ) : (
                    <Button size="sm" variant="outline" className="h-7 text-xs mt-0.5" onClick={() => { setEditProject(p); setHorasReais(''); }}>
                      Informar horas
                    </Button>
                  )}
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Valor/Hora Real</p>
                  <p className="font-semibold text-foreground">
                    {valorHoraReal !== null
                      ? formatCurrency(valorHoraReal)
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5 flex items-center gap-1">
                    Margem
                    {helpIcon(margemTooltipText)}
                  </p>
                  <div>{margemBadge(acimaMin)}</div>
                </div>
              </div>

              {/* Linha 5: Excluir */}
              <div className="flex justify-end pt-1">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-red-400 hover:text-red-600">
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

  const helpIcon = (text: string) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
                      {helpIcon('Informe quantas horas você realmente trabalhou neste projeto após concluí-lo. Isso permite comparar com o que foi cotado e descobrir se o projeto foi rentável.')}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Valor/Hora Real
                      {helpIcon('Calculamos dividindo o valor total do projeto pelas horas que você realmente trabalhou. Se estiver abaixo do seu preço mínimo, o projeto foi menos rentável do que o esperado.')}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Margem
                      {helpIcon('Mostra se o projeto ficou acima ou abaixo do seu preço mínimo por hora. Verde significa que foi rentável. Vermelho significa que você cobrou menos do que o necessário.')}
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
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setEditProject(p); setHorasReais(''); }}>
                            Informar horas
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        {valorHoraReal !== null
                          ? `R$ ${valorHoraReal.toFixed(2).replace('.', ',')}`
                          : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        {margemBadge(acimaMin)}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive">
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
            Projeto: <strong>{editProject?.projeto}</strong> — Cliente: <strong>{editProject?.cliente}</strong>
          </p>
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              Horas reais gastas
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger type="button">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    Informe quantas horas você realmente trabalhou neste projeto após concluí-lo. Isso permite comparar com o que foi cotado e descobrir se o projeto foi rentável.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
