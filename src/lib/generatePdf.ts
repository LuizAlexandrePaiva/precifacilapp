import jsPDF from 'jspdf';

export interface ProposalPdfData {
  cliente: string;
  projeto: string;
  escopo: string;
  inclusos: string;
  nao_inclusos: string;
  forma_pagamento: string;
  validade_dias: number;
  prazo: number;
  prazo_unidade: string;
  preco_hora: number;
  created_at: string;
  freelancer_nome: string;
  freelancer_email: string;
  freelancer_whatsapp: string;
}

const pacoteMultiplier = { basico: 1, padrao: 1.4, premium: 2 };

const formatBRL = (v: number) =>
  `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function splitLines(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

export function generateProposalPdf(proposal: ProposalPdfData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 22;
  const contentWidth = pageWidth - margin * 2;
  let y = 28;

  const BLUE_PRIMARY: [number, number, number] = [37, 99, 235];
  const BLUE_DARK: [number, number, number] = [15, 23, 42];
  const BLUE_LIGHT_BG: [number, number, number] = [239, 246, 255];
  const GRAY_TEXT: [number, number, number] = [100, 116, 139];
  const DARK_TEXT: [number, number, number] = [30, 41, 59];
  const LIGHT_GRAY: [number, number, number] = [148, 163, 184];

  const checkPageBreak = (needed: number) => {
    if (y + needed > pageHeight - 30) {
      doc.addPage();
      y = 25;
    }
  };

  // ─── 1. HEADER ───
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK_TEXT);
  doc.text(proposal.freelancer_nome || 'Freelancer', margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY_TEXT);
  const contactParts: string[] = [];
  if (proposal.freelancer_email) contactParts.push(proposal.freelancer_email);
  if (proposal.freelancer_whatsapp) contactParts.push(proposal.freelancer_whatsapp);
  if (contactParts.length > 0) {
    doc.text(contactParts.join('  |  '), margin, y);
    y += 6;
  }

  // Blue divider
  y += 2;
  doc.setDrawColor(...BLUE_PRIMARY);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 16;

  // ─── 2. PROPOSAL INFO BLOCK ───
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK_TEXT);
  doc.text('Proposta Comercial', margin, y);
  y += 12;

  const createdDate = new Date(proposal.created_at);
  const validUntil = new Date(createdDate);
  validUntil.setDate(validUntil.getDate() + (proposal.validade_dias || 7));

  const infoItems = [
    { label: 'Cliente', value: proposal.cliente },
    { label: 'Projeto', value: proposal.projeto },
    { label: 'Data de emissao', value: createdDate.toLocaleDateString('pt-BR') },
  ];

  doc.setFontSize(10);
  infoItems.forEach((item) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...GRAY_TEXT);
    doc.text(`${item.label}:`, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK_TEXT);
    doc.text(item.value, margin + 45, y);
    y += 7;
  });

  // Validity highlight
  y += 2;
  doc.setFillColor(...BLUE_LIGHT_BG);
  doc.roundedRect(margin, y - 4.5, contentWidth, 10, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BLUE_PRIMARY);
  doc.setFontSize(10);
  doc.text(`Valida ate: ${validUntil.toLocaleDateString('pt-BR')}`, margin + 4, y + 2);
  y += 18;

  // ─── 3. SCOPE ───
  const hasInclusos = proposal.inclusos && proposal.inclusos.trim().length > 0;
  const hasNaoInclusos = proposal.nao_inclusos && proposal.nao_inclusos.trim().length > 0;
  const hasEscopo = proposal.escopo && proposal.escopo.trim().length > 0;

  if (hasInclusos || hasNaoInclusos || hasEscopo) {
    checkPageBreak(40);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK_TEXT);
    doc.text('Escopo do Projeto', margin, y);
    y += 10;

    if (hasInclusos) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...DARK_TEXT);
      doc.text('Esta incluido:', margin, y);
      y += 7;

      const items = splitLines(proposal.inclusos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...DARK_TEXT);
      items.forEach((item) => {
        checkPageBreak(7);
        doc.text('—', margin + 4, y);
        const lines = doc.splitTextToSize(item, contentWidth - 14);
        doc.text(lines, margin + 12, y);
        y += lines.length * 5 + 2;
      });
      y += 4;
    }

    if (hasNaoInclusos) {
      checkPageBreak(15);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...DARK_TEXT);
      doc.text('Nao esta incluido:', margin, y);
      y += 7;

      const items = splitLines(proposal.nao_inclusos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...LIGHT_GRAY);
      items.forEach((item) => {
        checkPageBreak(7);
        doc.text('—', margin + 4, y);
        const lines = doc.splitTextToSize(item, contentWidth - 14);
        doc.text(lines, margin + 12, y);
        y += lines.length * 5 + 2;
      });
      y += 4;
    }

    if (hasEscopo && !hasInclusos) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...DARK_TEXT);
      const scopeLines = doc.splitTextToSize(proposal.escopo, contentWidth);
      checkPageBreak(scopeLines.length * 5 + 5);
      doc.text(scopeLines, margin, y);
      y += scopeLines.length * 5 + 6;
    }

    y += 6;
  }

  // ─── 4. INVESTMENT OPTIONS ───
  checkPageBreak(60);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK_TEXT);
  doc.text('Opcoes de Investimento', margin, y);
  y += 12;

  const prazoHoras = proposal.prazo_unidade === 'dias' ? proposal.prazo * 8 : proposal.prazo;
  const packages = [
    { key: 'basico', name: 'Preco Minimo', mult: pacoteMultiplier.basico, desc: 'Cobre custos operacionais' },
    { key: 'padrao', name: 'Preco Justo', mult: pacoteMultiplier.padrao, desc: 'Margem saudavel de 40%', recommended: true },
    { key: 'premium', name: 'Preco Premium', mult: pacoteMultiplier.premium, desc: 'Projetos urgentes ou complexos' },
  ];

  // Table header
  const col1X = margin;
  const col2X = margin + 65;
  const col3X = margin + 115;
  const rowHeight = 14;

  doc.setFillColor(...BLUE_DARK);
  doc.roundedRect(margin, y - 5, contentWidth, rowHeight, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('PACOTE', col1X + 4, y + 3);
  doc.text('VALOR', col2X + 4, y + 3);
  doc.text('OBSERVACAO', col3X + 4, y + 3);
  y += rowHeight + 1;

  // Table rows
  packages.forEach((pkg) => {
    const valor = proposal.preco_hora * prazoHoras * pkg.mult;

    if (pkg.recommended) {
      doc.setFillColor(...BLUE_LIGHT_BG);
      doc.rect(margin, y - 5, contentWidth, rowHeight + 2, 'F');
    } else {
      doc.setFillColor(250, 250, 252);
      doc.rect(margin, y - 5, contentWidth, rowHeight + 2, 'F');
    }

    // Draw light border
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.rect(margin, y - 5, contentWidth, rowHeight + 2, 'S');

    doc.setFontSize(10);
    doc.setTextColor(...DARK_TEXT);
    doc.setFont('helvetica', pkg.recommended ? 'bold' : 'normal');
    doc.text(pkg.name, col1X + 4, y + 2);

    // "Recomendado" badge
    if (pkg.recommended) {
      const badgeText = 'Recomendado';
      const nameWidth = doc.getTextWidth(pkg.name);
      const badgeX = col1X + 4 + nameWidth + 3;
      doc.setFontSize(7);
      doc.setFillColor(...BLUE_PRIMARY);
      const badgeW = doc.getTextWidth(badgeText) + 5;
      doc.roundedRect(badgeX, y - 2, badgeW, 6, 1.5, 1.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text(badgeText, badgeX + 2.5, y + 2.5);
      doc.setFontSize(10);
    }

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK_TEXT);
    doc.text(formatBRL(valor), col2X + 4, y + 2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...GRAY_TEXT);
    doc.text(pkg.desc, col3X + 4, y + 2);

    // Prazo below value
    doc.setFontSize(8);
    doc.setTextColor(...LIGHT_GRAY);
    doc.text(`${prazoHoras}h estimadas`, col2X + 4, y + 8);

    y += rowHeight + 3;
  });

  y += 10;

  // ─── 5. PAYMENT CONDITIONS ───
  checkPageBreak(30);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK_TEXT);
  doc.text('Condicoes de Pagamento', margin, y);
  y += 9;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...DARK_TEXT);
  const paymentText = proposal.forma_pagamento || '50% na assinatura · 50% na entrega final';
  const paymentLines = doc.splitTextToSize(paymentText, contentWidth);
  doc.text(paymentLines, margin, y);
  y += paymentLines.length * 5 + 12;

  // ─── 6. NEXT STEP ───
  checkPageBreak(40);
  const boxHeight = 36;
  doc.setFillColor(...BLUE_DARK);
  doc.roundedRect(margin, y, contentWidth, boxHeight, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Como prosseguir', margin + 8, y + 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const ctaText = 'Para aceitar esta proposta, responda este email ou entre em contato pelo WhatsApp informado acima.';
  const ctaLines = doc.splitTextToSize(ctaText, contentWidth - 16);
  doc.text(ctaLines, margin + 8, y + 20);
  y += boxHeight + 12;

  // ─── 7. FOOTER ───
  const footerY = pageHeight - 14;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);
  doc.setFontSize(8);
  doc.setTextColor(...LIGHT_GRAY);
  doc.setFont('helvetica', 'normal');
  doc.text('Gerado via PreciFacil · precifacil.app.br', margin, footerY);

  doc.save(
    `Proposta_${proposal.cliente.replace(/\s+/g, '_')}_${proposal.projeto.replace(/\s+/g, '_')}.pdf`
  );
}
