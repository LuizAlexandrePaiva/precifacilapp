import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { History, Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Project {
  id: string;
  cliente: string;
  valorCotado: number;
  horasReais: number;
  precoMinHora: number;
  status: 'aprovado' | 'recusado';
}

export default function Historico() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ cliente: '', valorCotado: 0, horasReais: 0, precoMinHora: 0, status: 'aprovado' as 'aprovado' | 'recusado' });

  const addProject = (e: React.FormEvent) => {
    e.preventDefault();
    setProjects([...projects, { ...form, id: crypto.randomUUID() }]);
    setForm({ cliente: '', valorCotado: 0, horasReais: 0, precoMinHora: 0, status: 'aprovado' });
    setOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            Histórico de Projetos
          </h1>
          <p className="text-muted-foreground mt-1">Acompanhe seus projetos e compare com o preço mínimo</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Adicionar</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Projeto</DialogTitle>
            </DialogHeader>
            <form onSubmit={addProject} className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Input value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor cotado (R$)</Label>
                  <Input type="number" min={0} value={form.valorCotado} onChange={(e) => setForm({ ...form, valorCotado: +e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Horas reais gastas</Label>
                  <Input type="number" min={0} value={form.horasReais} onChange={(e) => setForm({ ...form, horasReais: +e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Preço mínimo/hora (R$)</Label>
                <Input type="number" min={0} step={0.01} value={form.precoMinHora} onChange={(e) => setForm({ ...form, precoMinHora: +e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as 'aprovado' | 'recusado' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="recusado">Recusado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Salvar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum projeto registrado ainda. Clique em "Adicionar" para começar.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor Cotado</TableHead>
                  <TableHead>Horas Reais</TableHead>
                  <TableHead>Valor/Hora Real</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Margem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p) => {
                  const valorHoraReal = p.horasReais > 0 ? p.valorCotado / p.horasReais : 0;
                  const acimaMin = valorHoraReal >= p.precoMinHora;
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.cliente}</TableCell>
                      <TableCell>R$ {p.valorCotado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>{p.horasReais}h</TableCell>
                      <TableCell>R$ {valorHoraReal.toFixed(2).replace('.', ',')}</TableCell>
                      <TableCell>
                        <Badge variant={p.status === 'aprovado' ? 'default' : 'destructive'}>
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={acimaMin ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}>
                          {acimaMin ? '✓ Acima' : '✗ Abaixo'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
