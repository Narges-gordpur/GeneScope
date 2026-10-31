import { GENESCOPE } from '../core/state.js';
import { SETTINGS } from '../core/settings.js';
import { calculateStats, calculateGRQS } from '../sequence/stats.js';
import { findORFs } from '../orf/orf.js';
import { computeCpGObsExp, detectCpGIslands } from '../kmer/cpg.js';

function createReportSection(title, rows) {
    const div = document.createElement('div');
    div.style.cssText = 'margin-bottom:20px;';
    const h = document.createElement('h3');
    h.style.cssText = 'font-size:14px;font-weight:800;color:var(--cyan);margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--border);';
    h.textContent = title;
    div.appendChild(h);
    const table = document.createElement('div');
    table.style.cssText = 'font-family:var(--font-mono);font-size:12px;line-height:1.9;';
    rows.forEach(([k, v]) => {
        const row = document.createElement('div');
        row.style.cssText = 'display:grid;grid-template-columns:minmax(220px,1fr) 2fr;gap:12px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.03);';
        const kk = document.createElement('span'); kk.style.color = 'var(--text-muted)'; kk.textContent = k + ':';
        const vv = document.createElement('span'); vv.style.color = 'var(--text-primary)'; vv.textContent = v;
        row.appendChild(kk); row.appendChild(vv);
        table.appendChild(row);
    });
    div.appendChild(table);
    return div;
}

export function updateReportContent() {
    const el = document.getElementById('reportContentArea');
    if (!el) return;
    if (!GENESCOPE.currentSeq) {
        el.innerHTML = '<div class="empty-state">ابتدا توالی تحلیل کنید.</div>';
        return;
    }
    const seq = GENESCOPE.currentSeq;
    const stats = calculateStats(seq);
    const oe = computeCpGObsExp(seq);
    const islands = detectCpGIslands(seq);
    const orfs = findORFs(seq);
    const grqsReport = calculateGRQS(stats);
    const reportId = 'GS-' + Date.now().toString(36).toUpperCase();

    el.innerHTML = '';
    const header = document.createElement('div');
    header.style.cssText = 'border-bottom:2px solid var(--cyan);padding-bottom:16px;margin-bottom:24px;';
    header.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
        <div><div style="font-size:11px;color:var(--cyan);font-weight:700;">GeneScope Pro — Scientific Report</div>
        <h2 style="font-size:22px;font-weight:900;margin-top:6px;">Bioinformatic Analysis Report</h2></div>
        <div style="background:var(--surface-elevated);border:1px solid var(--border);border-radius:var(--radius-md);padding:10px 16px;font-family:var(--font-mono);font-size:11px;line-height:1.7;min-width:260px;">
            <div><span style="color:var(--text-muted);">Report ID:</span> <span style="color:var(--cyan);">${reportId}</span></div>
            <div><span style="color:var(--text-muted);">Software:</span> GeneScope Pro v11.1</div>
            <div><span style="color:var(--text-muted);">Generated:</span> ${new Date().toISOString()}</div>
        </div></div>`;
    el.appendChild(header);

    el.appendChild(createReportSection('1. Sequence', [
        ['Molecule', GENESCOPE.currentType],
        ['Sample', GENESCOPE.sampleMeta || 'user-provided'],
        ['Length', stats.len + ' nt'],
        ['Effective', stats.effectiveLen + ' bp']
    ]));
    el.appendChild(createReportSection('2. Statistics', [
        ['GC', stats.gc.toFixed(2) + '% (denom ' + stats.gcDenominator + ')'],
        ['Entropy', stats.entropy.toFixed(4) + ' bits'],
        ['GC Skew', stats.gcSkew !== null ? stats.gcSkew.toFixed(4) : 'n/a'],
        ['Tm', stats.tm !== null ? stats.tm.toFixed(2) + ' °C' : 'n/a — ' + (stats.tmReason || '—')],
        ['Tm Method', stats.tmMethod || 'n/a']
    ]));
    el.appendChild(createReportSection('3. CpG', [
        ['Total CpG', oe.obs],
        ['Obs/Exp', oe.ratio !== null ? oe.ratio.toFixed(4) : 'n/a'],
        ['Islands', islands.length + ' (len≥' + SETTINGS.cpgWindow + ', GC≥50%, O/E≥' + SETTINGS.cpgObsExp + ')']
    ]));
    el.appendChild(createReportSection('4. GRQS', [
        ['Score', grqsReport.grqs.toFixed(1) + ' / 100'],
        ['Tier', grqsReport.tier + ' (' + grqsReport.tierEn + ')'],
        ['Completeness', grqsReport.components.completeness.toFixed(1)],
        ['BaseQuality', grqsReport.components.baseQuality.toFixed(1)],
        ['GC Balance', grqsReport.components.gcBalance.toFixed(1)],
        ['Complexity', grqsReport.components.complexity.toFixed(1)]
    ]));
    el.appendChild(createReportSection('5. ORF', [
        ['Total', orfs.length],
        ['Longest', orfs.length > 0 ? orfs[0].length + ' bp (' + orfs[0].aaLength + ' aa)' : 'n/a'],
        ['Position', orfs.length > 0 ? 'Strand ' + orfs[0].strand + ', ' + orfs[0].start + '–' + orfs[0].end + ' (1-based inclusive)' : 'n/a']
    ]));
    el.appendChild(createReportSection('6. Limitations', [
        ['Tm units', 'ΔH kcal/mol, ΔS kcal/(mol·K), R=0.001987'],
        ['Tm applicability', stats.tmApplicable ? 'Applied (DNA/RNA only)' : 'Not applied — ' + (stats.tmReason || 'n/a')],
        ['Salt condition', '50mM Na⁺, 0mM Mg²⁺, 0.25µM primer'],
        ['ORF coordinates', '1-based inclusive (GFF3 standard)'],
        ['Gap penalty', 'Linear: k×gapOpen | Affine: gapOpen+(k−1)×gapExtend']
    ]));
}