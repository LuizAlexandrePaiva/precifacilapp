import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InfoModal } from '@/components/InfoModal';
import type { RegimeTributario, AtividadeMEI, FaixaRendaPF, AnexoSimples, FaixaFaturamentoSimples } from '@/lib/calculator';

interface RegimeFieldsProps {
  regime: RegimeTributario;
  onRegimeChange: (v: RegimeTributario) => void;
  atividadeMEI: AtividadeMEI | '';
  onAtividadeMEIChange: (v: AtividadeMEI) => void;
  faixaRendaPF: FaixaRendaPF | '';
  onFaixaRendaPFChange: (v: FaixaRendaPF) => void;
  anexoSimples: AnexoSimples | '';
  onAnexoSimplesChange: (v: AnexoSimples) => void;
  faixaFaturamentoSimples: FaixaFaturamentoSimples | '';
  onFaixaFaturamentoSimplesChange: (v: FaixaFaturamentoSimples) => void;
}

export function RegimeFields({
  regime, onRegimeChange,
  atividadeMEI, onAtividadeMEIChange,
  faixaRendaPF, onFaixaRendaPFChange,
  anexoSimples, onAnexoSimplesChange,
  faixaFaturamentoSimples, onFaixaFaturamentoSimplesChange,
}: RegimeFieldsProps) {
  return (
    <>
      {/* Regime principal */}
      <div className="space-y-2">
        <Label className="flex items-center gap-1 h-5">
          Regime tributário
          <InfoModal
            title="Regime tributário"
            content={
              <ul style={{ margin: 0, paddingLeft: 16, listStyleType: 'disc' }}>
                <li style={{ marginBottom: 8 }}><strong>MEI</strong>: paga DAS fixo mensal, sem imposto sobre faturamento.</li>
                <li style={{ marginBottom: 8 }}><strong>Autônomo PF</strong>: IR progressivo + INSS sobre o rendimento.</li>
                <li><strong>Simples Nacional</strong>: alíquota varia por anexo e faixa de faturamento.</li>
              </ul>
            }
          />
        </Label>
        <Select value={regime} onValueChange={(v) => onRegimeChange(v as RegimeTributario)}>
          <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="mei">MEI (DAS fixo)</SelectItem>
            <SelectItem value="autonomo_pf">Autônomo PF (IR progressivo)</SelectItem>
            <SelectItem value="pj_simples">PJ Simples Nacional</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground hidden md:block">Como você emite nota fiscal</p>
      </div>

      {/* Sub-campos MEI */}
      {regime === 'mei' && (
        <div className="space-y-2">
          <Label className="flex items-center gap-1 h-5">
            Tipo de atividade MEI
            <InfoModal
              title="DAS-MEI 2026"
              content="Valor do DAS-MEI 2026, baseado no salário mínimo de R$ 1.621. Atualizado anualmente."
            />
          </Label>
          <Select value={atividadeMEI} onValueChange={(v) => onAtividadeMEIChange(v as AtividadeMEI)}>
            <SelectTrigger className="h-11"><SelectValue placeholder="Selecione a atividade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="comercio_industria">Comércio ou Indústria — R$ 82,05/mês</SelectItem>
              <SelectItem value="servicos">Prestação de Serviços — R$ 86,05/mês</SelectItem>
              <SelectItem value="comercio_servicos">Comércio e Serviços — R$ 87,05/mês</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground hidden md:block">O DAS será somado aos seus custos fixos</p>
        </div>
      )}

      {/* Sub-campos Autônomo PF */}
      {regime === 'autonomo_pf' && (
        <div className="space-y-2">
          <Label className="flex items-center gap-1 h-5">
            Renda mensal esperada
            <InfoModal
              title="Renda mensal esperada"
              content={
                <ul style={{ margin: 0, paddingLeft: 16, listStyleType: 'disc' }}>
                  <li style={{ marginBottom: 8 }}><strong>O que é</strong>: quanto você espera <strong>receber por mês</strong> como autônomo PF.</li>
                  <li style={{ marginBottom: 8 }}><strong>Para que serve</strong>: define a <strong>alíquota efetiva</strong> (IR + INSS) aplicada no cálculo do preço/hora.</li>
                  <li style={{ marginBottom: 8 }}><strong>Faixas</strong>: baseadas na <strong>tabela progressiva 2026</strong> (Lei nº 15.270/2025).</li>
                  <li><strong>Importante</strong>: é uma estimativa. <strong>Consulte um contador</strong> para cálculo exato.</li>
                </ul>
              }
            />
          </Label>
          <Select value={faixaRendaPF} onValueChange={(v) => onFaixaRendaPFChange(v as FaixaRendaPF)}>
            <SelectTrigger className="h-11"><SelectValue placeholder="Selecione a faixa" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ate_5000">Até R$ 5.000/mês — 11%</SelectItem>
              <SelectItem value="5001_7350">R$ 5.001 a R$ 7.350/mês — 18%</SelectItem>
              <SelectItem value="7351_10000">R$ 7.351 a R$ 10.000/mês — 26%</SelectItem>
              <SelectItem value="acima_10000">Acima de R$ 10.000/mês — 33%</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground hidden md:block">Quanto você espera ganhar por mês</p>
        </div>
      )}

      {/* Sub-campos PJ Simples */}
      {regime === 'pj_simples' && (
        <>
          <div className="space-y-2">
            <Label className="flex items-center gap-1 h-5">
              Anexo do Simples Nacional
              <InfoModal
                title="Anexos do Simples Nacional"
                content={
                  <ul style={{ margin: 0, paddingLeft: 16, listStyleType: 'disc' }}>
                    <li style={{ marginBottom: 8 }}><strong>Anexo III</strong>: Serviços gerais (manutenção, contabilidade, educação, agências, etc.)</li>
                    <li><strong>Anexo V</strong>: Serviços técnicos (TI, publicidade, consultoria, engenharia, arquitetura)</li>
                  </ul>
                }
              />
            </Label>
            <Select value={anexoSimples} onValueChange={(v) => onAnexoSimplesChange(v as AnexoSimples)}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Selecione o anexo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="anexo_iii">Anexo III — Serviços gerais</SelectItem>
                <SelectItem value="anexo_v">Anexo V — Serviços técnicos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1 h-5">
              Faturamento anual estimado
              <InfoModal
                title="Alíquota do Simples Nacional"
                content="Alíquota nominal do Simples Nacional 2026. A alíquota efetiva pode ser menor após deduções."
              />
            </Label>
            <Select value={faixaFaturamentoSimples} onValueChange={(v) => onFaixaFaturamentoSimplesChange(v as FaixaFaturamentoSimples)}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Selecione a faixa" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ate_180k">Até R$ 180.000</SelectItem>
                <SelectItem value="180k_360k">R$ 180.001 a R$ 360.000</SelectItem>
                <SelectItem value="360k_720k">R$ 360.001 a R$ 720.000</SelectItem>
                <SelectItem value="acima_720k">Acima de R$ 720.000</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </>
  );
}
