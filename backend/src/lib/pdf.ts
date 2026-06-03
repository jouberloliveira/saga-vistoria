// eslint-disable-next-line @typescript-eslint/no-require-imports
const PdfPrinter = require('pdfmake');

const fonts = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  },
};

const printer = new PdfPrinter(fonts);

function row(label: string, value: string | number | null | undefined): object[] {
  return [
    { text: label, bold: true, fontSize: 9 },
    { text: String(value ?? '—'), fontSize: 9 },
  ];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildVistoriaPdf(vistoria: any): any {
  const { veiculo, cliente, funcionario, pneus = [], danos = [], itensFaltantes = [], assinaturas = [] } = vistoria;

  const docDefinition = {
    defaultStyle: { font: 'Helvetica' },
    content: [
      { text: 'SAGA — Vistoria Prévia Veicular', style: 'header' },
      { text: `Status: ${vistoria.status.toUpperCase()}`, fontSize: 10, margin: [0, 0, 0, 10] },

      { text: 'Veículo', style: 'section' },
      {
        table: {
          widths: ['30%', '70%'],
          body: [
            row('Placa', veiculo?.placa),
            row('Marca / Modelo', `${veiculo?.marca} ${veiculo?.modelo}`),
            row('Ano', veiculo?.ano),
            row('Cor', veiculo?.cor),
            row('Chassi', veiculo?.chassi),
            row('Quilometragem', veiculo?.quilometragem != null ? `${veiculo.quilometragem} km` : null),
          ],
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 10],
      },

      { text: 'Cliente', style: 'section' },
      {
        table: {
          widths: ['30%', '70%'],
          body: [
            row('Nome', cliente?.nome),
            row('Documento', cliente?.documento),
            row('Telefone', cliente?.telefone),
            row('E-mail', cliente?.email),
          ],
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 10],
      },

      { text: 'Informações da Vistoria', style: 'section' },
      {
        table: {
          widths: ['30%', '70%'],
          body: [
            row('Funcionário', funcionario?.nome),
            row('Data Início', vistoria.data_inicio ? new Date(vistoria.data_inicio).toLocaleString('pt-BR') : null),
            row('Data Fim', vistoria.data_fim ? new Date(vistoria.data_fim).toLocaleString('pt-BR') : null),
            row('Observações', vistoria.observacoes_gerais),
          ],
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 10],
      },

      ...(pneus.length > 0 ? [
        { text: 'Pneus', style: 'section' },
        {
          table: {
            headerRows: 1,
            widths: ['50%', '50%'],
            body: [
              [{ text: 'Posição', bold: true, fontSize: 9 }, { text: 'Estado', bold: true, fontSize: 9 }],
              ...pneus.map((p: { posicao: string; estado: string }) => [
                { text: p.posicao, fontSize: 9 },
                { text: p.estado, fontSize: 9 },
              ]),
            ],
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 10],
        },
      ] : []),

      ...(danos.length > 0 ? [
        { text: 'Danos', style: 'section' },
        {
          table: {
            headerRows: 1,
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [
                { text: 'Tipo', bold: true, fontSize: 9 },
                { text: 'Localização', bold: true, fontSize: 9 },
                { text: 'Gravidade', bold: true, fontSize: 9 },
                { text: 'Descrição', bold: true, fontSize: 9 },
              ],
              ...danos.map((d: { tipo: string; localizacao: string; gravidade: string; descricao?: string }) => [
                { text: d.tipo, fontSize: 9 },
                { text: d.localizacao, fontSize: 9 },
                { text: d.gravidade, fontSize: 9 },
                { text: d.descricao ?? '—', fontSize: 9 },
              ]),
            ],
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 10],
        },
      ] : []),

      ...(itensFaltantes.length > 0 ? [
        { text: 'Itens Faltantes', style: 'section' },
        {
          ul: itensFaltantes.map((i: { nome: string }) => ({ text: i.nome, fontSize: 9 })),
          margin: [0, 0, 0, 10],
        },
      ] : []),

      ...(assinaturas.length > 0 ? [
        { text: 'Assinaturas', style: 'section' },
        {
          columns: assinaturas.map((a: { tipo: string; imagem_base64: string }) => ({
            stack: [
              { text: a.tipo.charAt(0).toUpperCase() + a.tipo.slice(1), fontSize: 9, alignment: 'center' },
              ...(a.imagem_base64 ? [{
                image: a.imagem_base64.startsWith('data:') ? a.imagem_base64 : `data:image/png;base64,${a.imagem_base64}`,
                width: 150,
                alignment: 'center',
              }] : []),
            ],
          })),
          margin: [0, 0, 0, 10],
        },
      ] : []),
    ],
    styles: {
      header: { fontSize: 16, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
      section: { fontSize: 11, bold: true, margin: [0, 8, 0, 4], decoration: 'underline' },
    },
  };

  return printer.createPdfKitDocument(docDefinition);
}
