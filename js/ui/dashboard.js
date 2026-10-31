import { GENESCOPE } from '../core/state.js';
import { calculateStats, calculateGRQS } from '../sequence/stats.js';
import { findORFs } from '../orf/orf.js';
import { detectCpGIslands } from '../kmer/cpg.js';
import { findRestrictionSites } from '../restriction/enzymes.js';

export function render() { refresh(); }

export function refresh() {
    const seq = GENESCOPE.currentSeq;
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };

    if (!seq) {
        ['dashMoleculeType','dashSeqLen','dashGC','dashEffLen','dashEntropy','dashSkew','dashTm',
         'dashORFCount','dashCpGIslands','dashRestrictionSites','dashWarnings','dashGCDensity',
         'dashATDensity','dashGRQS'].forEach(id => set(id, '—'));
        set('dashProjectLabel', 'بدون پروژه');
        set('dashDescription', 'برای شروع، به «تحلیل توالی» بروید.');
        set('dashCompTotal', '—');
        const tier = document.getElementById('dashGRQSTier');
        if (tier) { tier.textContent = '—'; tier.className = 'status-pill'; }
        const frame = document.getElementById('streamCodonFrame');
        if (frame) frame.textContent = 'CODON FRAME: +1';
        if (GENESCOPE.chartInstances.dashComp) { GENESCOPE.chartInstances.dashComp.destroy(); GENESCOPE.chartInstances.dashComp = null; }
        if (GENESCOPE.chartInstances.dashSkew) { GENESCOPE.chartInstances.dashSkew.destroy(); GENESCOPE.chartInstances.dashSkew = null; }
        const gb = document.getElementById('dashGCBar'); if (gb) gb.style.width = '0%';
        const ab = document.getElementById('dashATBar'); if (ab) ab.style.width = '0%';
        return;
    }

    const stats = calculateStats(seq);
    set('dashProjectLabel', GENESCOPE.sampleMeta || 'user-provided');
    set('dashMoleculeType', GENESCOPE.currentType || '—');
    set('dashSeqLen', seq.length.toLocaleString());
    set('dashGC', stats.gc.toFixed(1) + '٪');
    set('dashEffLen', stats.effectiveLen.toLocaleString() + ' bp');
    set('dashEntropy', stats.entropy.toFixed(3) + ' bits');
    set('dashSkew', stats.gcSkew !== null ? stats.gcSkew.toFixed(3) : '—');
    set('dashTm', stats.tm !== null ? stats.tm.toFixed(1) + '°C' : 'n/a');
    set('dashCompTotal', stats.effectiveLen.toLocaleString() + ' bases');

    const gcVal = stats.gc, atVal = 100 - gcVal;
    set('dashGCDensity', gcVal.toFixed(1) + '%');
    set('dashATDensity', atVal.toFixed(1) + '%');
    const gb = document.getElementById('dashGCBar');
    if (gb) gb.style.width = Math.min(100, gcVal) + '%';
    const ab = document.getElementById('dashATBar');
    if (ab) ab.style.width = Math.min(100, atVal) + '%';

    const grqsResult = calculateGRQS(stats);
    set('dashGRQS', grqsResult.grqs.toFixed(1));
    const grqsEl = document.getElementById('dashGRQS');
    if (grqsEl) grqsEl.style.color = grqsResult.color;
    const tierEl = document.getElementById('dashGRQSTier');
    if (tierEl) {
        tierEl.textContent = grqsResult.tier + ' (' + grqsResult.tierEn + ')';
        tierEl.className = 'status-pill ' + (grqsResult.grqs >= 75 ? 'valid' : grqsResult.grqs >= 60 ? 'warning' : 'error');
    }

    const orfs = findORFs(seq);
    set('dashORFCount', orfs.length);
    set('dashCpGIslands', detectCpGIslands(seq).length);
    let siteCount = 0;
    Object.keys(GENESCOPE.enzymes).forEach(n => { siteCount += findRestrictionSites(seq, n).count; });
    set('dashRestrictionSites', siteCount);
    set('dashWarnings', stats.warnings.length);

    const frameEl = document.getElementById('streamCodonFrame');
    if (frameEl) {
        frameEl.textContent = orfs.length > 0
            ? 'CODON FRAME: ' + orfs[0].strand + orfs[0].frame
            : 'CODON FRAME: +1';
    }

    const compCanvas = document.getElementById('dashCompositionChart');
    if (compCanvas && typeof Chart !== 'undefined') {
        if (GENESCOPE.chartInstances.dashComp) GENESCOPE.chartInstances.dashComp.destroy();
        GENESCOPE.chartInstances.dashComp = new Chart(compCanvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['A', 'T', 'C', 'G'],
                datasets: [{
                    data: [stats.A, stats.T, stats.C, stats.G],
                    backgroundColor: ['#10B981','#EF4444','#06B6D4','#F59E0B'],
                    borderColor: 'rgba(7,17,31,0.9)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false, cutout: '60%',
                plugins: { legend: { position: 'bottom', labels: {color: '#94A3B8', font: {family:'Vazirmatn', size:11}, padding: 12}}}
            }
        });
    }

    const skewCanvas = document.getElementById('dashSkewChart');
    if (skewCanvas && seq.length >= 100 && typeof Chart !== 'undefined') {
        const win = 100, step = Math.max(1, Math.floor(seq.length/200));
        const positions = [], skews = [];
        for (let i = 0; i + win <= seq.length; i += step) {
            const sub = seq.substring(i, i+win);
            let G = 0, C = 0;
            for (const ch of sub) { if (ch === 'G') G++; else if (ch === 'C') C++; }
            positions.push(i+1);
            skews.push((G + C) > 0 ? (G - C)/(G + C) : 0);
        }
        if (GENESCOPE.chartInstances.dashSkew) GENESCOPE.chartInstances.dashSkew.destroy();
        GENESCOPE.chartInstances.dashSkew = new Chart(skewCanvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: positions,
                datasets: [{
                    label: 'GC Skew', data: skews,
                    borderColor: '#38BDF8', backgroundColor: 'rgba(56,189,248,0.1)',
                    fill: true, tension: 0.2, pointRadius: 0, borderWidth: 2
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: {display: false}},
                scales: {
                    x: { ticks: {color: '#64748B', maxTicksLimit: 8}, grid: {color: 'rgba(255,255,255,0.04)'}},
                    y: { ticks: {color: '#64748B'}, grid: {color: '#1E293B'}}
                }
            }
        });
    } else if (skewCanvas && GENESCOPE.chartInstances.dashSkew) {
        GENESCOPE.chartInstances.dashSkew.destroy();
        GENESCOPE.chartInstances.dashSkew = null;
    }
}