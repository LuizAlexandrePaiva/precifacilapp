export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  content: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'quanto-cobrar-por-hora-freelancer-2026',
    title: 'Quanto cobrar por hora como freelancer em 2026?',
    description:
      'Aprenda a calcular seu preço mínimo por hora como freelancer em 2026. Guia completo com fórmula, exemplos práticos para MEI, autônomo e PJ.',
    date: '2026-03-08',
    readTime: '7 min de leitura',
    content: `
## Por que a maioria dos freelancers cobra errado?

A grande armadilha do trabalho freelancer é olhar para o mercado, pegar o preço médio e usar como referência. Isso ignora completamente os **seus** custos, os **seus** impostos e a **sua** realidade.

Dois freelancers com a mesma especialidade podem (e devem) ter preços por hora diferentes — porque têm custos fixos, regimes tributários e metas de renda distintas.

## A fórmula do preço mínimo por hora

O cálculo correto leva em conta quatro variáveis:

1. **Meta de ganho líquido mensal** — quanto você quer ter na conta no final do mês, depois de pagar tudo.
2. **Custos fixos mensais** — aluguel, internet, softwares, coworking, contador, plano de saúde.
3. **Carga tributária** — depende do seu regime: MEI (~5%), Autônomo PF (~27,5%) ou PJ Simples Nacional (~12%).
4. **Horas úteis por mês** — descontando fins de semana, feriados, férias e horas não-faturáveis (prospecção, reuniões, administrativo).

A fórmula simplificada:

**Preço mínimo/hora = (Meta líquida + Custos fixos) ÷ (1 − alíquota de imposto) ÷ Horas faturáveis**

## Exemplo prático: designer freelancer MEI

- Meta líquida: R$ 5.000/mês
- Custos fixos: R$ 1.200/mês
- Regime: MEI (~5% de imposto)
- Horas faturáveis: 120h/mês (6h/dia × 20 dias)

Cálculo: (5.000 + 1.200) ÷ 0,95 ÷ 120 = **R$ 54,39/hora**

Esse é o **mínimo**. Abaixo disso, você está pagando para trabalhar.

## E se eu for PJ Simples Nacional?

Com os mesmos números mas regime PJ (~12%):

(5.000 + 1.200) ÷ 0,88 ÷ 120 = **R$ 58,71/hora**

A diferença parece pequena por hora, mas em um mês inteiro representa mais de R$ 500 a menos no bolso se você não ajustar.

## Erros comuns ao precificar

- **Ignorar horas não-faturáveis**: reuniões, prospecção e administrativo consomem 20-40% do seu tempo.
- **Esquecer dos impostos**: o valor que chega na conta não é o que você cobrou.
- **Não incluir férias e 13º**: como CLT você teria esses benefícios — seu preço precisa compensá-los.
- **Copiar o preço do colega**: a realidade de custos de cada um é diferente.

## Como o PreciFácil resolve isso

Em vez de abrir uma planilha e fazer contas manuais, o PreciFácil pede apenas as informações essenciais e calcula automaticamente:

- Seu preço mínimo por hora
- O valor sugerido por projeto
- Três níveis de proposta (Mínimo, Justo e Premium)

Tudo considerando seu regime tributário, custos reais e horas disponíveis.

## Conclusão

Saber seu preço mínimo é o primeiro passo para parar de trabalhar no prejuízo. Não existe preço "certo" universal — existe o preço certo **para você**, baseado nos seus números reais.
    `.trim(),
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
