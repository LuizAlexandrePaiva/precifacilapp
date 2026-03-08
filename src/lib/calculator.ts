export type RegimeTributario = 'mei' | 'autonomo_pf' | 'pj_simples';

export type AtividadeMEI = 'comercio_industria' | 'servicos' | 'comercio_servicos';
export type FaixaRendaPF = 'ate_5000' | '5001_7350' | '7351_10000' | 'acima_10000';
export type AnexoSimples = 'anexo_iii' | 'anexo_v';
export type FaixaFaturamentoSimples = 'ate_180k' | '180k_360k' | '360k_720k' | 'acima_720k';

export interface CalculationInput {
  metaLiquida: number;
  horasPorSemana: number;
  regime: RegimeTributario;
  custosFixos: number;
  semanasFerias: number;
  // MEI
  atividadeMEI?: AtividadeMEI;
  // Autônomo PF
  faixaRendaPF?: FaixaRendaPF;
  // PJ Simples
  anexoSimples?: AnexoSimples;
  faixaFaturamentoSimples?: FaixaFaturamentoSimples;
}

export interface CalculationResult {
  precoHora: number;
  precoDia: number;
  horasFaturaveis: number;
  impostoEstimado: number;
  custoTotal: number;
  explicacao: string;
  dasMEI?: number;
}

function getDASMEI(atividade: AtividadeMEI): number {
  switch (atividade) {
    case 'comercio_industria': return 82.05;
    case 'servicos': return 86.05;
    case 'comercio_servicos': return 87.05;
  }
}

function getAliquotaPF(faixa: FaixaRendaPF): number {
  switch (faixa) {
    case 'ate_5000': return 0.11;
    case '5001_7350': return 0.18;
    case '7351_10000': return 0.26;
    case 'acima_10000': return 0.33;
  }
}

function getAliquotaSimples(anexo: AnexoSimples, faixa: FaixaFaturamentoSimples): number {
  const tabela: Record<AnexoSimples, Record<FaixaFaturamentoSimples, number>> = {
    anexo_iii: {
      ate_180k: 0.06,
      '180k_360k': 0.112,
      '360k_720k': 0.135,
      acima_720k: 0.16,
    },
    anexo_v: {
      ate_180k: 0.155,
      '180k_360k': 0.18,
      '360k_720k': 0.195,
      acima_720k: 0.21,
    },
  };
  return tabela[anexo][faixa];
}

function getRegimeNome(regime: RegimeTributario): string {
  switch (regime) {
    case 'mei': return 'MEI (DAS fixo)';
    case 'autonomo_pf': return 'Autônomo PF';
    case 'pj_simples': return 'PJ Simples Nacional';
  }
}

export function calcularPreco(input: CalculationInput): CalculationResult {
  const semanasTrabalho = 52 - input.semanasFerias;
  const horasTotaisMes = (input.horasPorSemana * semanasTrabalho) / 12;
  const horasFaturaveis = horasTotaisMes * 0.7;

  let impostoEstimado = 0;
  let custosFixosAjustados = input.custosFixos;
  let dasMEI: number | undefined;
  let detalheImposto = '';

  if (input.regime === 'mei' && input.atividadeMEI) {
    dasMEI = getDASMEI(input.atividadeMEI);
    custosFixosAjustados += dasMEI;
    impostoEstimado = 0;
    detalheImposto = `DAS-MEI de R$ ${dasMEI.toFixed(2).replace('.', ',')} incluído nos custos fixos`;
  } else if (input.regime === 'autonomo_pf' && input.faixaRendaPF) {
    const aliquota = getAliquotaPF(input.faixaRendaPF);
    impostoEstimado = input.metaLiquida * aliquota;
    detalheImposto = `alíquota efetiva de ${(aliquota * 100).toFixed(0)}% (IR + INSS)`;
  } else if (input.regime === 'pj_simples' && input.anexoSimples && input.faixaFaturamentoSimples) {
    const aliquota = getAliquotaSimples(input.anexoSimples, input.faixaFaturamentoSimples);
    impostoEstimado = input.metaLiquida * aliquota;
    detalheImposto = `alíquota nominal de ${(aliquota * 100).toFixed(1).replace('.', ',')}%`;
  }

  const custoTotal = input.metaLiquida + custosFixosAjustados + impostoEstimado;
  const precoHora = custoTotal / horasFaturaveis;
  const precoDia = precoHora * 8;

  const explicacao = `Para garantir R$ ${input.metaLiquida.toLocaleString('pt-BR')}/mês no bolso, ` +
    `somamos seus custos fixos de R$ ${custosFixosAjustados.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}` +
    (dasMEI ? ` (inclui DAS-MEI de R$ ${dasMEI.toFixed(2).replace('.', ',')})` : '') +
    ` e o imposto estimado de R$ ${impostoEstimado.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} (regime ${getRegimeNome(input.regime)}, ${detalheImposto}). ` +
    `Isso dá um custo total de R$ ${custoTotal.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}/mês. ` +
    `Trabalhando ${input.horasPorSemana}h/semana com ${input.semanasFerias} semanas de férias, ` +
    `você tem ${horasFaturaveis.toFixed(0)} horas faturáveis por mês (já descontando 30% de horas não faturáveis). ` +
    `Dividindo o custo total pelas horas faturáveis: R$ ${precoHora.toFixed(2).replace('.', ',')} por hora.`;

  return { precoHora, precoDia, horasFaturaveis, impostoEstimado, custoTotal, explicacao, dasMEI };
}
