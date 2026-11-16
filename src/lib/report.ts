import { jsPDF } from 'jspdf';
import { PHASES } from './constants';
import type { PhaseKey, RpeLog, TrainingLog, PerformanceAssessment, Athlete } from './types';

export interface ReportData {
  athlete: Athlete;
  phase: PhaseKey | null;
  rpeLogs: RpeLog[];
  trainingLogs: TrainingLog[];
  assessment: PerformanceAssessment | null;
  coachNotes: string;
}

export function buildReportText(d: ReportData): string {
  const { athlete, phase, rpeLogs, trainingLogs, assessment, coachNotes } = d;
  const sessions = rpeLogs.length;
  const avgRpe = sessions ? (rpeLogs.reduce((s, r) => s + r.rpe_value, 0) / sessions).toFixed(1) : '-';
  const totalLoad = rpeLogs.reduce((s, r) => s + (r.session_load ?? r.rpe_value * r.duration_minutes), 0);
  const lines = [
    '*LAPORAN LATIHAN PENCAK SILAT*',
    '',
    `Atlet: ${athlete.name}`,
    `Kategori: ${athlete.category === 'Seni' ? `Seni ${athlete.sub_category ?? ''}`.trim() : 'Tanding'} · Sabuk ${athlete.belt_level ?? '-'}`,
    `Fase Latihan: ${phase ? PHASES[phase].name : '-'}`,
    `Tanggal Laporan: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    '',
    '*Rekap RPE & Beban*',
    `• Jumlah sesi tercatat: ${sessions}`,
    `• Rata-rata RPE: ${avgRpe}`,
    `• Total beban latihan: ${totalLoad.toLocaleString('id-ID')} AU`,
    '',
  ];
  if (assessment) {
    lines.push(
      '*Struktur Prestasi (terakhir)*',
      `• Fisik: ${assessment.physical_score}/100`,
      `• Teknik: ${assessment.technique_score}/100`,
      `• Taktik: ${assessment.tactical_score}/100`,
      `• Psikologis: ${assessment.psychological_score}/100`,
      '',
    );
  }
  if (trainingLogs.length) {
    lines.push('*Sesi Latihan Terakhir*');
    for (const t of trainingLogs.slice(0, 5)) {
      lines.push(`• ${t.log_date}: ${t.session_type ?? 'Latihan'} (${t.phase}) — fisik ${t.physical_minutes ?? 0}m, teknik ${t.technique_minutes ?? 0}m`);
    }
    lines.push('');
  }
  if (coachNotes.trim()) {
    lines.push('*Catatan Pelatih*', coachNotes.trim(), '');
  }
  lines.push('Dikirim via aplikasi Periodisasi Silat');
  return lines.join('\n');
}

export function openWhatsAppReport(d: ReportData, phone: string): void {
  const digits = phone.replace(/\D/g, '');
  const intl = digits.startsWith('0') ? `62${digits.slice(1)}` : digits;
  const url = `https://wa.me/${intl}?text=${encodeURIComponent(buildReportText(d))}`;
  window.open(url, '_blank', 'noopener');
}

export function generateReportPdf(d: ReportData): void {
  const { athlete, phase, rpeLogs, trainingLogs, assessment, coachNotes } = d;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  let y = 18;

  const line = (t: string, size: number, bold: boolean, x = 16, color: [number, number, number] = [30, 41, 59]) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.text(t, x, y);
  };
  const advance = (n: number) => {
    y += n;
    if (y > 275) {
      doc.addPage();
      y = 18;
    }
  };

  // Header band
  doc.setFillColor(11, 135, 240);
  doc.rect(0, 0, W, 34, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Laporan Latihan Pencak Silat', 16, 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Periodisasi Latihan — Model Schroeter & Bauersfeld', 16, 23);
  doc.text(new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), 16, 29);
  y = 44;

  line(`Atlet: ${athlete.name}`, 13, true);
  advance(7);
  line(
    `${athlete.category === 'Seni' ? `Seni ${athlete.sub_category ?? ''}`.trim() : 'Tanding'} · Sabuk ${athlete.belt_level ?? '-'} · Usia ${athlete.age ?? '-'} · Berat ${athlete.weight ?? '-'} kg`,
    10, false, 16, [100, 116, 139],
  );
  advance(7);
  line(`Fase Latihan: ${phase ? PHASES[phase].name : '-'}`, 10, false, 16, [100, 116, 139]);
  advance(12);

  // Summary stats
  const sessions = rpeLogs.length;
  const avgRpe = sessions ? rpeLogs.reduce((s, r) => s + r.rpe_value, 0) / sessions : 0;
  const totalLoad = rpeLogs.reduce((s, r) => s + (r.session_load ?? r.rpe_value * r.duration_minutes), 0);
  const stats: [string, string][] = [
    ['Sesi Tercatat', String(sessions)],
    ['Rata-rata RPE', sessions ? avgRpe.toFixed(1) : '-'],
    ['Total Beban', `${totalLoad.toLocaleString('id-ID')} AU`],
  ];
  const bw = (W - 32 - 8) / 3;
  stats.forEach(([label, val], i) => {
    const x = 16 + i * (bw + 4);
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, y - 6, bw, 18, 2, 2, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(label.toUpperCase(), x + 4, y + 1);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(val, x + 4, y + 8);
  });
  advance(26);

  // RPE load bar chart (vector)
  line('Grafik Beban Latihan (Session Load)', 12, true);
  advance(6);
  const recent = [...rpeLogs].slice(0, 14).reverse();
  const maxLoad = Math.max(1, ...recent.map((r) => r.session_load ?? r.rpe_value * r.duration_minutes));
  const chartH = 40;
  const chartW = W - 32;
  const barW = recent.length ? chartW / recent.length - 2 : chartW;
  doc.setDrawColor(226, 232, 240);
  doc.line(16, y + chartH, 16 + chartW, y + chartH);
  recent.forEach((r, i) => {
    const load = r.session_load ?? r.rpe_value * r.duration_minutes;
    const h = Math.max(2, (load / maxLoad) * (chartH - 6));
    const x = 16 + i * (chartW / recent.length) + 1;
    const color: [number, number, number] = r.rpe_value >= 8 ? [239, 68, 68] : r.rpe_value >= 6 ? [245, 158, 11] : [11, 135, 240];
    doc.setFillColor(...color);
    doc.roundedRect(x, y + chartH - h, barW, h, 1, 1, 'F');
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text(String(new Date(r.log_date).getDate()), x + barW / 2, y + chartH + 3, { align: 'center' });
  });
  advance(chartH + 12);

  // Training summary table (vector)
  line('Rekapitulasi Latihan', 12, true);
  advance(6);
  const cols = [26, 30, 42, 24, 24, 32];
  const headers = ['Tanggal', 'Fase', 'Jenis Sesi', 'Fisik', 'Teknik', 'Intensitas'];
  const drawRow = (vals: string[], bold = false, fill = false) => {
    let x = 16;
    if (fill) {
      doc.setFillColor(241, 245, 249);
      doc.rect(16, y - 4.5, W - 32, 7, 'F');
    }
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...(bold ? [15, 23, 42] : [51, 65, 85]) as [number, number, number]);
    vals.forEach((v, i) => {
      doc.text(doc.splitTextToSize(v, cols[i] - 2)[0] ?? '', x, y);
      x += cols[i];
    });
    advance(7);
  };
  drawRow(headers, true, true);
  const rows = [...trainingLogs].slice(0, 12);
  if (rows.length === 0) {
    drawRow(['-', '-', 'Belum ada log latihan', '-', '-', '-']);
  }
  rows.forEach((t, i) => {
    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(16, y - 4.5, W - 32, 7, 'F');
    }
    drawRow([
      t.log_date,
      PHASES[t.phase as PhaseKey]?.short ?? t.phase,
      t.session_type ?? '-',
      `${t.physical_minutes ?? 0}m`,
      `${t.technique_minutes ?? 0}m`,
      t.intensity ?? '-',
    ]);
  });
  advance(6);

  // Assessment scores
  if (assessment) {
    line('Struktur Prestasi (Asesmen Terakhir)', 12, true);
    advance(6);
    const pillars: [string, number][] = [
      ['Fisik', assessment.physical_score],
      ['Teknik', assessment.technique_score],
      ['Taktik', assessment.tactical_score],
      ['Psikologis', assessment.psychological_score],
    ];
    const colors: [number, number, number][] = [[11, 135, 240], [224, 169, 46], [245, 158, 11], [239, 68, 68]];
    const labelW = 26;
    const barMax = 90;
    pillars.forEach(([name, val], i) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text(name, 16, y + 3);
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(16 + labelW, y, barMax, 4, 2, 2, 'F');
      doc.setFillColor(...colors[i]);
      doc.roundedRect(16 + labelW, y, Math.max(4, (val / 100) * barMax), 4, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text(`${val}`, 16 + labelW + barMax + 4, y + 3);
      advance(7);
    });
    advance(4);
  }

  if (coachNotes.trim()) {
    line('Catatan Pelatih', 12, true);
    advance(6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const wrapped = doc.splitTextToSize(coachNotes.trim(), W - 32);
    doc.text(wrapped, 16, y);
    advance(wrapped.length * 5 + 4);
  }

  // Footer
  doc.setDrawColor(226, 232, 240);
  doc.line(16, 282, W - 16, 282);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('© 2026. Muhammad Farid | v1. Periodisasi Silat', 16, 288);

  doc.save(`Laporan-${athlete.name.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
