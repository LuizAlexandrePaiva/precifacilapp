import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { History } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
      ) : (
        <Card>
          <CardContent className="pt-6 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Valor Cotado</TableHead>
                  <TableHead>Horas Reais</TableHead>
                  <TableHead>Valor/Hora Real</TableHead>
                  <TableHead>Margem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p) => {
                  const valorHoraReal = p.horas_reais && p.horas_reais > 0 ? Number(p.valor_cotado) / p.horas_reais : null;
                  const acimaMin = valorHoraReal !== null ? valorHoraReal >= Number(p.preco_min_hora) : null;
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.cliente}</TableCell>
                      <TableCell>{p.projeto}</TableCell>
                      <TableCell>R$ {Number(p.valor_cotado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
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
                        {acimaMin !== null ? (
                          <Badge className={acimaMin ? 'bg-emerald-600 text-white' : 'bg-destructive text-destructive-foreground'}>
                            {acimaMin ? '✓ Acima' : '✗ Abaixo'}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
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
            <Label>Horas reais gastas</Label>
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
