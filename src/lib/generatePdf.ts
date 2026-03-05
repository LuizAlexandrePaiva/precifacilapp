import jsPDF from 'jspdf';

interface ProposalPdfData {
  cliente: string;
  projeto: string;
  escopo: string;
  prazo: number;
  prazo_unidade: string;
  preco_hora: number;
  created_at: string;
}

const pacoteMultiplier = { basico: 1, padrao: 1.4, premium: 2 };

const formatBRL = (v: number) =>
  `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function generateProposalPdf(proposal: ProposalPdfData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 25;

  // Header
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235); // primary blue
  doc.text('PreciFácil', margin, y);
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Proposta Comercial', pageWidth - margin, y, { align: 'right' });

  y += 5;
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 15;

  // Client & Project info
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'bold');
  doc.text('Cliente:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(proposal.cliente, margin + 25, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.text('Projeto:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(proposal.projeto, margin + 25, y);
  y += 8;

  const prazoLabel = proposal.prazo_unidade === 'dias' ? 'dias' : 'horas';
  doc.setFont('helvetica', 'bold');
  doc.text('Prazo:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${proposal.prazo} ${prazoLabel}`, margin + 25, y);
  y += 12;

  // Scope
  if (proposal.escopo) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text('Escopo do Projeto', margin, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    const scopeLines = doc.splitTextToSize(proposal.escopo, pageWidth - margin * 2);
    doc.text(scopeLines, margin, y);
    y += scopeLines.length * 5 + 10;
  }

  // Packages table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 30, 30);
  doc.text('Opções de Investimento', margin, y);
  y += 10;

  const prazoHoras = proposal.prazo_unidade === 'dias' ? proposal.prazo * 8 : proposal.prazo;
  const packages = [
    { name: 'Preço Mínimo', mult: pacoteMultiplier.basico, desc: 'Cobre custos operacionais' },
    { name: 'Preço Justo (Recomendado)', mult: pacoteMultiplier.padrao, desc: 'Margem saudável de 40%' },
    { name: 'Preço Premium', mult: pacoteMultiplier.premium, desc: 'Projetos urgentes ou complexos' },
  ];

  const colX = [margin, margin + 70, margin + 110];
  const tableWidth = pageWidth - margin * 2;

  // Table header
  doc.setFillColor(37, 99, 235);
  doc.rect(margin, y - 5, tableWidth, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Pacote', colX[0] + 3, y + 1);
  doc.text('Valor', colX[1] + 3, y + 1);
  doc.text('Observação', colX[2] + 3, y + 1);
  y += 10;

  // Table rows
  packages.forEach((pkg, i) => {
    const valor = proposal.preco_hora * prazoHoras * pkg.mult;
    const bgColor = i % 2 === 0 ? 245 : 255;
    doc.setFillColor(bgColor, bgColor, bgColor);
    doc.rect(margin, y - 5, tableWidth, 10, 'F');

    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', i === 1 ? 'bold' : 'normal');
    doc.text(pkg.name, colX[0] + 3, y + 1);
    doc.setFont('helvetica', 'bold');
    doc.text(formatBRL(valor), colX[1] + 3, y + 1);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(pkg.desc, colX[2] + 3, y + 1);
    doc.setFontSize(10);
    y += 10;
  });

  // Footer
  y = doc.internal.pageSize.getHeight() - 20;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, y - 5, pageWidth - margin, y - 5);
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  const createdDate = new Date(proposal.created_at).toLocaleDateString('pt-BR');
  doc.text(`Proposta gerada em ${createdDate} via PreciFácil`, margin, y);
  doc.text('precifacil.com.br', pageWidth - margin, y, { align: 'right' });

  doc.save(`Proposta_${proposal.cliente.replace(/\s+/g, '_')}_${proposal.projeto.replace(/\s+/g, '_')}.pdf`);
}
