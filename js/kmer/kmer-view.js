import { GENESCOPE } from '../core/state.js';
import { SETTINGS } from '../core/settings.js';
import { computeKmerFrequencies } from './kmer.js';
import { computeCpGObsExp, detectCpGIslands } from './cpg.js';

export function computeKmers(k = SETTINGS.defaultK, btn) {
    const canvas = document.getElementById('kmerDistributionChart');
    if (!canvas) return;
    if (btn) {
        const group = btn.parentElement;
        if (group) group.querySelectorAll('.btn-tag-sample').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }
    const elK = document.getElementById('kmerCurrentK');
    if (elK) elK.textContent = 'k=' + k;
    const seq = GENESCOPE.currentSeq;
    if (!seq || seq.length < k) {
        if (GENESCOPE.chartInstances.kmer) { GENESCOPE.chartInstances.kmer.destroy(); GENESCOPE.chartInstances.kmer = null; }
        ['kmerTopMotif','kmerCoverage','kmerTotalWindows'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '—';
        });
        const topC = document.getElementById('topMotifsContainer');
        if (topC) topC.innerHTML = '<div class="empty-state" style="padding:20px 0;">ابتدا توالی را تحلیل کنید.</div>';
        return;
    }
    const result = computeKmerFrequencies(seq, k);
    const top = result.sorted.slice(0, 15);
    const labels = top.map(x => x[0]), data = top.map(x => x[1]);
    const palette = ['#06B6D4','#3B82F6','#10B981','#8B5CF6','#F59E0B','#EC4899'];
    if (GENESCOPE.chartInstances.kmer) GENESCOPE.chartInstances.kmer.destroy();
    if (typeof Chart !== 'undefined') {
        GENESCOPE.chartInstances.kmer = new Chart(canvas.getContext('2d'), {
            type: 'bar',
            data: { labels, datasets: [{ label: 'فراوانی', data, backgroundColor: data.map((_, i) => palette[i%palette.length]), borderRadius: 6 }]},
            options: { responsive: true, maintainAspectRatio: false,
                plugins: { legend: {display: false}},
                scales: { x: { ticks: {color: '#CBD5E1', font: {family:'JetBrains Mono', size:11}}, grid: {color: 'rgba(255,255,255,0.04)'}},
                    y: { beginAtZero: true, ticks: {color: '#64748B'}, grid: {color: '#1E293B'}}}}
        });
    }
    const t1 = result.sorted[0];
    const elT = document.getElementById('kmerTopMotif');
    if (elT) elT.textContent = t1 ? t1[0] + ' × ' + t1[1] : '—';
    const elC = document.getElementById('kmerCoverage');
    if (elC) elC.textContent = result.uniqueCount + ' / ' + Math.pow(4, k);
    const elW = document.getElementById('kmerTotalWindows');
    if (elW) elW.textContent = result.total.toLocaleString();
    const topContainer = document.getElementById('topMotifsContainer');
    if (topContainer) {
        topContainer.innerHTML = '';
        const top5 = result.sorted.slice(0, 5);
        const colors = ['#06B6D4','#3B82F6','#10B981','#EF4444','#F59E0B'];
        top5.forEach((m, i) => {
            const pct = result.total > 0 ? (m[1] / result.total * 100) : 0;
            const div = document.createElement('div');
            div.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;margin-bottom:5px;flex-wrap:wrap;gap:4px;">
                <span class="badge-tag mono" style="background:rgba(6,182,212,.15);color:${colors[i]};border:1px solid ${colors[i]}66;font-weight:800;font-size:12px;padding:2px 8px;border-radius:4px;">${m[0]}</span>
                <span style="font-family:var(--font-mono);font-size:11.5px;"><span style="color:var(--text-muted);">${m[1]} تکرار</span><span style="color:${colors[i]};font-weight:700;margin-right:8px;">${pct.toFixed(2)}٪</span></span>
            </div><div style="height:7px;width:100%;background:var(--surface-elevated);border-radius:4px;overflow:hidden;"><div style="height:100%;width:${Math.min(100, pct*3)}%;background:${colors[i]};border-radius:4px;"></div></div>`;
            topContainer.appendChild(div);
        });
    }
}

export function computeCpG() {
    const seq = GENESCOPE.currentSeq;
    const els = {
        oe: document.getElementById('cpgObsExp'),
        islands: document.getElementById('cpgIslandCount'),
        cCount: document.getElementById('cpgCCount'),
        gCount: document.getElementById('cpgGCount'),
        tbody: document.getElementById('cpgIslandTable')
    };
    if (!seq) {
        Object.values(els).forEach(el => { if (el && el.tagName !== 'TBODY') el.textContent = '—'; });
        if (els.tbody) els.tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:20px;">ابتدا توالی را تحلیل کنید.</td></tr>';
        return;
    }
    const oe = computeCpGObsExp(seq);
    if (els.oe) els.oe.textContent = oe.ratio !== null ? oe.ratio.toFixed(3) : 'n/a';
    if (els.cCount) els.cCount.textContent = oe.C;
    if (els.gCount) els.gCount.textContent = oe.G;
    const islands = detectCpGIslands(seq);
    if (els.islands) els.islands.textContent = islands.length;

    const canvas = document.getElementById('cpgWindowChart');
    if (canvas && seq.length >= SETTINGS.cpgWindow && typeof Chart !== 'undefined') {
        const step = Math.max(1, Math.floor(seq.length / 300));
        const windows = [];
        for (let i = 0; i + SETTINGS.cpgWindow <= seq.length; i += step) {
            const sub = seq.substring(i, i+SETTINGS.cpgWindow);
            const w = computeCpGObsExp(sub);
            windows.push({pos: i+1, oe: w.ratio});
        }
        const labels = windows.map(w => w.pos), data = windows.map(w => w.oe !== null ? w.oe : 0);
        if (GENESCOPE.chartInstances.cpg) GENESCOPE.chartInstances.cpg.destroy();
        GENESCOPE.chartInstances.cpg = new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: { labels, datasets: [
                {label: 'CpG Obs/Exp', data, borderColor: '#38BDF8', backgroundColor: 'rgba(56,189,248,0.1)', fill: true, tension: 0.2, pointRadius: 0, borderWidth: 2},
                {label: 'آستانه ' + SETTINGS.cpgObsExp.toFixed(2), data: new Array(labels.length).fill(SETTINGS.cpgObsExp), borderColor: '#F59E0B', borderDash: [4,4], borderWidth: 1.5, pointRadius: 0, fill: false}
            ]},
            options: { responsive: true, maintainAspectRatio: false,
                plugins: { legend: { labels: {color: '#94A3B8', font: {family:'Vazirmatn', size:11}}}},
                scales: { x: { ticks: {color: '#64748B', maxTicksLimit: 8}, grid: {color: 'rgba(255,255,255,0.04)'}},
                    y: { beginAtZero: true, ticks: {color: '#64748B'}, grid: {color: '#1E293B'}}}}
        });
    } else if (canvas && GENESCOPE.chartInstances.cpg) {
        GENESCOPE.chartInstances.cpg.destroy();
        GENESCOPE.chartInstances.cpg = null;
    }

    if (els.tbody) {
        if (!islands.length) {
            els.tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:20px;">هیچ جزیره CpG یافت نشد.</td></tr>';
        } else {
            els.tbody.innerHTML = '';
            islands.forEach((isl, i) => {
                const tr = document.createElement('tr');
                [i+1, isl.start, isl.end, isl.end-isl.start+1, isl.gc.toFixed(1)+'%', isl.oe.toFixed(3)].forEach(v => {
                    const td = document.createElement('td');
                    td.className = 'mono';
                    td.textContent = v;
                    tr.appendChild(td);
                });
                const td = document.createElement('td');
                td.innerHTML = '<span class="status-pill valid"><i class="fa-solid fa-check"></i> Candidate</span>';
                tr.appendChild(td);
                els.tbody.appendChild(tr);
            });
        }
    }
}