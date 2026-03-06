export type RegimeTributario = 'mei' | 'autonomo_pf' | 'pj_simples';

export interface CalculationInput {
  metaLiquida: number;
  horasPorSemana: number;
  regime: RegimeTributario;
  custosFixos: number;
  semanasFerias: number;
}

export interface CalculationResult {
  precoHora: number;
  precoDia: number;
  horasFaturaveis: number;
  impostoEstimado: number;
  custoTotal: number;
  explicacao: string;
}

function getAliquotaImposto(regime: RegimeTributario): number {
  switch (regime) {
    case 'mei': return 0.05;
    case 'autonomo_pf': return 0.275;
    case 'pj_simples': return 0.12;
  }
}

function getRegimeNome(regime: RegimeTributario): string {
  switch (regime) {
    case 'mei': return 'MEI (~5%)';
    case 'autonomo_pf': return 'Autônomo PF (~27,5%)';
    case 'pj_simples': return 'PJ Simples Nacional (~12%)';
  }
}

export function calcularPreco(input: CalculationInput): CalculationResult {
  const semanasTrabalho = 52 - input.semanasFerias;
  const horasTotaisMes = (input.horasPorSemana * semanasTrabalho) / 12;
  const horasFaturaveis = horasTotaisMes * 0.7; // 30% não faturáveis

  const aliquota = getAliquotaImposto(input.regime);
  const impostoEstimado = input.metaLiquida * aliquota;
  const custoTotal = input.metaLiquida + input.custosFixos + impostoEstimado;

  const precoHora = custoTotal / horasFaturaveis;
  const precoDia = precoHora * 8;

  const explicacao = `Para garantir R$ ${input.metaLiquida.toLocaleString('pt-BR')}/mês no bolso, ` +
    `somamos seus custos fixos de R$ ${input.custosFixos.toLocaleString('pt-BR')} ` +
    `e o imposto estimado de R$ ${impostoEstimado.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} (regime ${getRegimeNome(input.regime)}). ` +
    `Isso dá um custo total de R$ ${custoTotal.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}/mês. ` +
    `Trabalhando ${input.horasPorSemana}h/semana com ${input.semanasFerias} semanas de férias, ` +
    `você tem ${horasFaturaveis.toFixed(0)} horas faturáveis por mês (já descontando 30% de horas não faturáveis). ` +
    `Dividindo o custo total pelas horas faturáveis: R$ ${precoHora.toFixed(2).replace('.', ',')} por hora.`;

  return { precoHora, precoDia, horasFaturaveis, impostoEstimado, custoTotal, explicacao };
}
