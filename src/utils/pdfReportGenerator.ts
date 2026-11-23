import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnalysisRecord, SupportedLanguage, TranslatedContent } from '../types';

/**
 * Renders a Unicode text block (supporting Kannada, Hindi/Devanagari, Telugu, and English)
 * onto an offscreen high-DPI HTML5 canvas and returns a PNG data URL with dimensions in mm.
 */
function renderUnicodeTextToImage(
  text: string,
  options: {
    widthMm: number;
    fontSizePt: number;
    fontWeight?: 'normal' | 'bold';
    color?: string;
    bgColor?: string;
  }
): { dataUrl: string; widthMm: number; heightMm: number } {
  const scale = 3; // 3x DPI for crisp print rendering
  const pxPerMm = 3.7795275591;
  const widthPx = Math.floor(options.widthMm * pxPerMm * scale);
  const fontSizePx = Math.floor(options.fontSizePt * 1.333 * scale);
  const lineHeightPx = Math.floor(fontSizePx * 1.48);
  const paddingPx = Math.floor(2 * pxPerMm * scale);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const fontStack = `'Plus Jakarta Sans', 'Noto Sans Kannada', 'Noto Sans Devanagari', 'Noto Sans Telugu', sans-serif`;
  ctx.font = `${options.fontWeight || 'normal'} ${fontSizePx}px ${fontStack}`;

  // Word-wrap paragraphs across widthPx
  const maxLineWidth = widthPx - paddingPx * 2;
  const paragraphs = (text || '').split('\n');
  const lines: string[] = [];

  for (const para of paragraphs) {
    const words = para.split(/\s+/);
    let currentLine = '';
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxLineWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
  }

  if (lines.length === 0) lines.push('—');

  const heightPx = lines.length * lineHeightPx + paddingPx * 2;
  canvas.width = widthPx;
  canvas.height = heightPx;

  const drawCtx = canvas.getContext('2d')!;
  if (options.bgColor) {
    drawCtx.fillStyle = options.bgColor;
    drawCtx.fillRect(0, 0, widthPx, heightPx);
  }
  drawCtx.fillStyle = options.color || '#0a0a0a';
  drawCtx.font = `${options.fontWeight || 'normal'} ${fontSizePx}px ${fontStack}`;
  drawCtx.textBaseline = 'top';

  lines.forEach((line, idx) => {
    drawCtx.fillText(line, paddingPx, paddingPx + idx * lineHeightPx);
  });

  const heightMm = heightPx / (pxPerMm * scale);
  return {
    dataUrl: canvas.toDataURL('image/png'),
    widthMm: options.widthMm,
    heightMm,
  };
}

export function generateLegalReportPDF(
  analysis: AnalysisRecord,
  selectedLanguage: SupportedLanguage,
  translatedContent?: TranslatedContent | null
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let currentY = 18;

  const ensureSpace = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 20) {
      doc.addPage();
      currentY = 18;
    }
  };

  // Minimal Black & White Legal Header
  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('AI-Powered Legal Document Risk Analysis Suite', margin, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(212, 212, 212);
  doc.text(
    `Official Legal Risk & Compliance Report  |  Selected Language: ${selectedLanguage}`,
    margin,
    20
  );
  doc.text(
    `Analysis Date: ${new Date(analysis.uploadDate).toLocaleString()}  |  Report ID: ${analysis.id}`,
    margin,
    26
  );

  currentY = 40;

  // Document Metadata Box
  doc.setDrawColor(212, 212, 212);
  doc.setFillColor(250, 250, 250);
  doc.rect(margin, currentY, contentWidth, 26, 'FD');

  doc.setTextColor(10, 10, 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text(`Document Name: ${analysis.documentName}`, margin + 4, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(64, 64, 64);
  doc.text(
    `Type: ${analysis.documentType}   |   Format: ${analysis.fileType}   |   Pages: ${analysis.pageCount}   |   Words: ${analysis.wordCount}`,
    margin + 4,
    currentY + 14
  );
  doc.text(
    `Overall Risk Level: ${analysis.riskLevel.toUpperCase()} RISK   |   Risk Score: ${analysis.overallRiskScore} / 100   |   Language: ${selectedLanguage}`,
    margin + 4,
    currentY + 21
  );

  currentY += 34;

  // If a non-English Indian script (Kannada, Hindi, Telugu) is selected and translatedContent is available,
  // render ALL report sections (Summary, Important Terms, Obligations, Risks, Contradictions, Ambiguities, Missing Info, Sensitive Info, and Disclaimer) using our high-DPI Unicode Canvas renderer so Indian scripts display cleanly!
  if (selectedLanguage !== 'English' && translatedContent) {
    const NATIVE_REPORT_HEADERS: Record<
      string,
      {
        summary: string;
        importantInfo: string;
        terms: string;
        obligations: string;
        deadlines: string;
        penalties: string;
        payments: string;
        termination: string;
        risks: string;
        checks: string;
        sensitive: string;
        disclaimer: string;
      }
    > = {
      Kannada: {
        summary: '1. ಕಾರ್ಯಕಾರಿ ದಾಖಲೆ ಸಾರಾಂಶ (Executive Summary - ಕನ್ನಡ)',
        importantInfo: '2. ಪ್ರಮುಖ ನಿಯಮಗಳು, ಜವಾಬ್ದಾರಿಗಳು, ಗಡುವುಗಳು ಮತ್ತು ದಂಡಗಳು (Important Terms & Obligations)',
        terms: 'ಪ್ರಮುಖ ನಿಯಮಗಳು',
        obligations: 'ಜವಾಬ್ದಾರಿಗಳು',
        deadlines: 'ಗಡುವುಗಳು',
        penalties: 'ದಂಡಗಳು',
        payments: 'ಪಾವತಿ ಷರತ್ತುಗಳು',
        termination: 'ರದ್ದತಿ ಷರತ್ತುಗಳು',
        risks: `3. ಪತ್ತೆಯಾದ ಸಂಭಾವ್ಯ ಕಾನೂನು ಅಪಾಯಗಳು (Potential Risks - ${analysis.risks.length})`,
        checks: '4. ವಿರೋಧಾಭಾಸಗಳು, ಅಸ್ಪಷ್ಟ ಪದಗಳು ಮತ್ತು ಬಿಟ್ಟುಹೋದ ಮಾಹಿತಿ (Contradictions, Ambiguities & Missing Info)',
        sensitive: `5. ಸೂಕ್ಷ್ಮ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ ಎಚ್ಚರಿಕೆಗಳು (Sensitive Personal Information - ${analysis.sensitiveInformation?.length || 0})`,
        disclaimer:
          'ಕಾನೂನು ಹಕ್ಕು ನಿರಾಕರಣೆ: ಈ ವಿಶ್ಲೇಷಣೆಯು ಕೇವಲ ಮಾಹಿತಿಗಾಗಿ ಮಾತ್ರವಾಗಿದ್ದು, ವೃತ್ತಿಪರ ಕಾನೂನು ಸಲಹೆಗೆ ಪರ್ಯಾಯವಲ್ಲ.',
      },
      Hindi: {
        summary: '1. कार्यकारी दस्तावेज़ सारांश (Executive Summary - हिन्दी)',
        importantInfo: '2. महत्वपूर्ण शर्तें, दायित्व, समय-सीमा और दंड (Important Terms & Obligations)',
        terms: 'महत्वपूर्ण शर्तें',
        obligations: 'दायित्व और जिम्मेदारियाँ',
        deadlines: 'समय-सीमा (Deadlines)',
        penalties: 'दंड और जुर्माना',
        payments: 'भुगतान की शर्तें',
        termination: 'समाप्ति की शर्तें',
        risks: `3. पहचाने गए संभावित कानूनी जोखिम (Potential Risks - ${analysis.risks.length})`,
        checks: '4. विरोधाभास, अस्पष्ट शब्द और अनुपलब्ध जानकारी (Contradictions, Ambiguities & Missing Info)',
        sensitive: `5. संवेदनशील व्यक्तिगत जानकारी चेतावनी (Sensitive Personal Information - ${analysis.sensitiveInformation?.length || 0})`,
        disclaimer:
          'कानूनी अस्वीकरण: यह विश्लेषण केवल सूचनात्मक उद्देश्यों के लिए है और पेशेवर कानूनी सलाह का विकल्प नहीं है।',
      },
      Telugu: {
        summary: '1. పత్ర విశ్లేషణ సారాంశం (Executive Summary - తెలుగు)',
        importantInfo: '2. ముఖ్యమైన నిబంధనలు, బాధ్యతలు, గడువులు & జరిమానాలు (Important Terms & Obligations)',
        terms: 'ముఖ్యమైన నిబంధనలు',
        obligations: 'బాధ్యతలు',
        deadlines: 'గడువులు (Deadlines)',
        penalties: 'జరిమానాలు (Penalties)',
        payments: 'చెల్లింపు నిబంధనలు',
        termination: 'రద్దు నిబంధనలు',
        risks: `3. గుర్తించిన సంభావ్య చట్టపరమైన ప్రమాదాలు (Potential Risks - ${analysis.risks.length})`,
        checks: '4. వైరుధ్యాలు, అస్పష్ట నిబంధనలు & లోపించిన సమాచారం (Contradictions, Ambiguities & Missing Info)',
        sensitive: `5. సున్నితమైన వ్యక్తిగత సమాచార హెచ్చరికలు (Sensitive Personal Information - ${analysis.sensitiveInformation?.length || 0})`,
        disclaimer:
          'చట్టపరమైన గమనిక: ఈ విశ్లేషణ కేవలం సమాచార ప్రయోజనాల కోసం మాత్రమే మరియు వృత్తిపరమైన న్యాయ సలహాకు ప్రత్యామ్నాయం కాదు.',
      },
    };

    const hdr = NATIVE_REPORT_HEADERS[selectedLanguage] || NATIVE_REPORT_HEADERS.Kannada;

    // 1. Translated Executive Summary
    const summaryBlock = renderUnicodeTextToImage(
      `${hdr.summary}\n\n${translatedContent.summary}`,
      {
        widthMm: contentWidth,
        fontSizePt: 9.5,
        color: '#171717',
        bgColor: '#f8fafc',
      }
    );
    ensureSpace(summaryBlock.heightMm + 6);
    doc.addImage(
      summaryBlock.dataUrl,
      'PNG',
      margin,
      currentY,
      summaryBlock.widthMm,
      summaryBlock.heightMm
    );
    currentY += summaryBlock.heightMm + 6;

    // 2. Translated Important Terms, Obligations, Deadlines, Penalties, Payment & Termination Conditions
    const tInfo = translatedContent.importantInformation || analysis.importantInformation;
    const importantLines = [
      hdr.importantInfo,
      '',
      `• ${hdr.terms}: ${(tInfo.importantTerms || []).join(' | ') || '—'}`,
      `• ${hdr.obligations}: ${(tInfo.obligations || []).join(' | ') || '—'}`,
      `• ${hdr.deadlines}: ${(tInfo.deadlines || []).join(' | ') || '—'}`,
      `• ${hdr.penalties}: ${(tInfo.penalties || []).join(' | ') || '—'}`,
      `• ${hdr.payments}: ${(tInfo.paymentConditions || []).join(' | ') || '—'}`,
      `• ${hdr.termination}: ${(tInfo.terminationConditions || []).join(' | ') || '—'}`,
    ].join('\n');

    const infoImg = renderUnicodeTextToImage(importantLines, {
      widthMm: contentWidth,
      fontSizePt: 8.8,
      color: '#171717',
      bgColor: '#ffffff',
    });
    ensureSpace(infoImg.heightMm + 6);
    doc.addImage(infoImg.dataUrl, 'PNG', margin, currentY, infoImg.widthMm, infoImg.heightMm);
    currentY += infoImg.heightMm + 6;

    // 3. Translated Potential Risks
    if (translatedContent.risks && translatedContent.risks.length > 0) {
      const riskHeaderImg = renderUnicodeTextToImage(hdr.risks, {
        widthMm: contentWidth,
        fontSizePt: 10,
        fontWeight: 'bold',
        color: '#0a0a0a',
      });
      ensureSpace(riskHeaderImg.heightMm + 4);
      doc.addImage(riskHeaderImg.dataUrl, 'PNG', margin, currentY, riskHeaderImg.widthMm, riskHeaderImg.heightMm);
      currentY += riskHeaderImg.heightMm + 2;

      for (let i = 0; i < translatedContent.risks.length; i++) {
        const tr = translatedContent.risks[i];
        const orig = analysis.risks.find((r) => r.id === tr.id) || analysis.risks[i];
        const blockText = `${i + 1}. ${tr.title} [${orig?.riskLevel || 'Medium'} Risk - ${orig?.pageOrSection || ''}]\n• ${tr.reason}\n• ${tr.simpleExplanation}\nEvidence: "${orig?.supportingEvidence || ''}"`;
        const img = renderUnicodeTextToImage(blockText, {
          widthMm: contentWidth,
          fontSizePt: 8.8,
          color: '#171717',
          bgColor: '#fafaf9',
        });
        ensureSpace(img.heightMm + 5);
        doc.addImage(img.dataUrl, 'PNG', margin, currentY, img.widthMm, img.heightMm);
        currentY += img.heightMm + 4;
      }
    }

    // 4. Translated Contradictions, Ambiguities, and Missing Information
    if (translatedContent.documentChecks && translatedContent.documentChecks.length > 0) {
      const checksHeaderImg = renderUnicodeTextToImage(hdr.checks, {
        widthMm: contentWidth,
        fontSizePt: 10,
        fontWeight: 'bold',
        color: '#0a0a0a',
      });
      ensureSpace(checksHeaderImg.heightMm + 4);
      doc.addImage(
        checksHeaderImg.dataUrl,
        'PNG',
        margin,
        currentY,
        checksHeaderImg.widthMm,
        checksHeaderImg.heightMm
      );
      currentY += checksHeaderImg.heightMm + 2;

      for (let i = 0; i < translatedContent.documentChecks.length; i++) {
        const tc = translatedContent.documentChecks[i];
        const checkText = `${i + 1}. ${tc.title}\n• ${tc.description}\n• ${tc.recommendation}`;
        const img = renderUnicodeTextToImage(checkText, {
          widthMm: contentWidth,
          fontSizePt: 8.8,
          color: '#171717',
          bgColor: '#ffffff',
        });
        ensureSpace(img.heightMm + 4);
        doc.addImage(img.dataUrl, 'PNG', margin, currentY, img.widthMm, img.heightMm);
        currentY += img.heightMm + 3;
      }
    }

    // 5. Translated Disclaimer Banner
    const discImg = renderUnicodeTextToImage(hdr.disclaimer, {
      widthMm: contentWidth,
      fontSizePt: 8.5,
      fontWeight: 'bold',
      color: '#171717',
      bgColor: '#f5f5f4',
    });
    ensureSpace(discImg.heightMm + 5);
    doc.addImage(discImg.dataUrl, 'PNG', margin, currentY, discImg.widthMm, discImg.heightMm);
    currentY += discImg.heightMm + 6;
  } else {
    // Standard English Executive Summary
    doc.setTextColor(10, 10, 10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.text('1. Executive Summary', margin, currentY);
    currentY += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(38, 38, 38);
    const summaryLines = doc.splitTextToSize(analysis.summary, contentWidth);
    doc.text(summaryLines, margin, currentY);
    currentY += summaryLines.length * 4.8 + 6;
  }

  // Important Terms & Obligations Table
  ensureSpace(40);
  doc.setTextColor(10, 10, 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.text('Important Terms, Obligations, Deadlines & Penalties', margin, currentY);
  currentY += 3;

  const info = analysis.importantInformation;
  const infoRows = [
    ['Important Terms', (info.importantTerms || []).length ? '• ' + info.importantTerms.join('\n• ') : 'None specified'],
    ['Obligations', (info.obligations || []).length ? '• ' + info.obligations.join('\n• ') : 'None specified'],
    ['Deadlines', (info.deadlines || []).length ? '• ' + info.deadlines.join('\n• ') : 'None specified'],
    ['Penalties', (info.penalties || []).length ? '• ' + info.penalties.join('\n• ') : 'None specified'],
    ['Payment Conditions', (info.paymentConditions || []).length ? '• ' + info.paymentConditions.join('\n• ') : 'None specified'],
    ['Termination Conditions', (info.terminationConditions || []).length ? '• ' + info.terminationConditions.join('\n• ') : 'None specified'],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Category', 'Extracted Details from Document']],
    body: infoRows,
    theme: 'grid',
    headStyles: { fillColor: [23, 23, 23], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 8.5, textColor: [23, 23, 23], cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 42, fontStyle: 'bold' },
      1: { cellWidth: contentWidth - 42 },
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 9;

  // Potential Risks Table
  ensureSpace(35);
  doc.setTextColor(10, 10, 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.text(`Potential Risks & Supporting Evidence (${analysis.risks.length})`, margin, currentY);
  currentY += 3;

  const riskRows = analysis.risks.map((r, idx) => [
    `${idx + 1}. ${r.title}\n[${r.riskLevel} Risk]\nRef: ${r.pageOrSection}`,
    `Reason: ${r.reason}\n\nExplanation: ${r.simpleExplanation}`,
    `${r.supportingEvidence}`,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Finding & Reference', 'Reason & Simple Explanation', 'Supporting Document Evidence']],
    body: riskRows.length ? riskRows : [['None', 'No major risks detected', 'N/A']],
    theme: 'grid',
    headStyles: { fillColor: [23, 23, 23], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 8, textColor: [23, 23, 23], cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 44, fontStyle: 'bold' },
      1: { cellWidth: 76 },
      2: { cellWidth: contentWidth - 120, fontStyle: 'italic' },
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 9;

  // Missing, Contradictory & Ambiguous Checks
  ensureSpace(35);
  doc.setTextColor(10, 10, 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.text('Missing Information, Contradictions & Ambiguous Terms', margin, currentY);
  currentY += 3;

  const checkRows = [
    ...(analysis.missingInformation || []).map((m) => [
      'MISSING',
      `${m.title}\n(${m.pageOrSection})`,
      m.description,
      m.recommendation,
    ]),
    ...(analysis.conflictingInformation || []).map((c) => [
      'CONTRADICTION',
      `${c.title}\n(${c.pageOrSection})`,
      `${c.description}\nEvidence: ${c.evidenceOrContext}`,
      c.recommendation,
    ]),
    ...(analysis.ambiguousInformation || []).map((a) => [
      'AMBIGUOUS',
      `${a.title}\n(${a.pageOrSection})`,
      `${a.description}\nPassage: ${a.evidenceOrContext}`,
      a.recommendation,
    ]),
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Type', 'Finding & Reference', 'Explanation & Supporting Passage', 'Recommendation']],
    body: checkRows.length
      ? checkRows
      : [['PASS', 'All checks completed', 'No missing, contradictory, or ambiguous clauses flagged.', 'N/A']],
    theme: 'grid',
    headStyles: { fillColor: [23, 23, 23], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 8, textColor: [23, 23, 23], cellPadding: 2.8 },
    columnStyles: {
      0: { cellWidth: 28, fontStyle: 'bold' },
      1: { cellWidth: 40, fontStyle: 'bold' },
      2: { cellWidth: 64 },
      3: { cellWidth: contentWidth - 132 },
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 9;

  // Sensitive Information Warnings
  ensureSpace(35);
  doc.setTextColor(10, 10, 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.text(
    `Sensitive Personal Information Warnings (${analysis.sensitiveInformation?.length || 0})`,
    margin,
    currentY
  );
  currentY += 4;

  if (analysis.sensitiveInformation && analysis.sensitiveInformation.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(10, 10, 10);
    doc.text(
      'Privacy Warning: Sensitive information detected. Check whether these details are required before uploading this document to another website.',
      margin,
      currentY
    );
    currentY += 3;

    const sensRows = analysis.sensitiveInformation.map((s) => [
      s.category,
      s.maskedValue,
      s.pageOrSection,
      s.severity,
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Category', 'Masked Value', 'Location', 'Sensitivity']],
      body: sensRows,
      theme: 'grid',
      headStyles: { fillColor: [23, 23, 23], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8.5, textColor: [23, 23, 23] },
      margin: { left: margin, right: margin },
    });

    currentY = (doc as any).lastAutoTable.finalY + 9;
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(82, 82, 82);
    doc.text('No sensitive personal identifiers were detected.', margin, currentY + 3);
    currentY += 10;
  }

  // Mandatory Legal Disclaimer Box
  ensureSpace(22);
  doc.setDrawColor(163, 163, 163);
  doc.setFillColor(250, 250, 250);
  doc.rect(margin, currentY, contentWidth, 16, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(10, 10, 10);
  doc.text('LEGAL DISCLAIMER:', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(38, 38, 38);
  doc.text(
    '“This analysis is for informational purposes only and is not a substitute for professional legal advice.”',
    margin + 4,
    currentY + 12
  );

  // Page numbering footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(115, 115, 115);
    doc.text(
      `AI-Powered Legal Document Risk Analysis Suite  •  Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  const safeFilename = analysis.documentName.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Legal_Risk_Report_${safeFilename}_${selectedLanguage}.pdf`);
}
