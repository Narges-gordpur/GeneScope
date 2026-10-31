import { GENESCOPE } from '../core/state.js';
import { SETTINGS } from '../core/settings.js';
import { showToast, copyText } from '../core/utils.js';
import { findORFs, getCurrentGeneticCode } from './orf.js';

export function updateTable() {
    const tbody = document.getElementById('orfTableBody');
    if (!tbody) return;
    const seq = GENESCOPE.currentSeq;
    if (!seq) { tbody.innerHTML = '<tr><td colspan="13" style="text-align:center;color:var(--text-muted);padding:24px;">ابتدا توالی وارد کنید.</td></tr>'; return; }
    const minLen = parseInt(document.getElementById('orfMinLen')?.value || SETTINGS.minORFLen, 10);
    const orfs = findORFs(seq, {minLen, includeReverse: SETTINGS.includeReverseORF, tableId: getCurrentGeneticCode()});
    const countBadge = document.getElementById('orfCountBadge');
    if (countBadge) countBadge.textContent = orfs.length + ' کاندید ORF';
    if (!orfs.length) { tbody.innerHTML = '<tr><td colspan="13" style="text-align:center;color:var(--text-muted);padding:24px;">هیچ ORF یافت نشد.</td></tr>'; return; }
    tbody.innerHTML = '';
    orfs.forEach((orf, i) => {
        const tr = document.createElement('tr');
        const preview = orf.protein.substring(0, 40) + (orf.protein.length > 40 ? '…' : '');
        const cells = [
            {v: 'ORF' + (i+1), cls: 'mono', color: 'var(--cyan)'},
            {v: orf.strand + orf.frame, cls: 'mono', color: orf.strand === '+' ? '#38BDF8' : '#F472B6'},
            {v: orf.strand === '+' ? '+ (Sense)' : '- (Antisense)', color: orf.strand === '+' ? '#10B981' : '#F472B6'},
            {v: orf.start, cls: 'mono'},
            {v: orf.end, cls: 'mono'},
            {v: orf.length + ' bp', cls: 'mono'},
            {v: orf.aaLength + ' aa', cls: 'mono', color: 'var(--cyan)'},
            {v: orf.molWeight.toFixed(1), cls: 'mono'},
            {v: orf.pI !== null ? orf.pI.toFixed(2) : '—', cls: 'mono'},
            {v: orf.gravy !== null ? orf.gravy.toFixed(3) : '—', cls: 'mono'},
            {v: orf.cai !== null ? orf.cai.toFixed(3) : '—', cls: 'mono', color: 'var(--emerald)'},
            {v: preview, cls: 'mono'}
        ];
        cells.forEach(c => {
            const td = document.createElement('td');
            if (c.cls) td.className = c.cls;
            if (c.color) td.style.color = c.color;
            td.textContent = c.v;
            tr.appendChild(td);
        });
        const act = document.createElement('td');
        const btn = document.createElement('button');
        btn.className = 'btn btn-cyan btn-xs';
        btn.innerHTML = '<i class="fa-regular fa-copy"></i> FASTA';
        btn.addEventListener('click', () => {
            const fasta = `>ORF_${i+1}_${orf.strand}${orf.frame}_${orf.start}-${orf.end}\n${orf.protein}`;
            copyText(fasta);
        });
        act.appendChild(btn);
        tr.appendChild(act);
        tbody.appendChild(tr);
    });
}

export function renderMap() {
    const container = document.getElementById('orfMapContainer');
    if (!container) return;
    const seq = GENESCOPE.currentSeq;
    if (!seq) { container.innerHTML = '<div class="empty-state">ابتدا توالی را وارد کنید.</div>'; return; }
    const minLen = parseInt(document.getElementById('orfMinLen')?.value || SETTINGS.minORFLen, 10);
    const orfs = findORFs(seq, {minLen, includeReverse: SETTINGS.includeReverseORF, tableId: getCurrentGeneticCode()});
    const seqLen = seq.length;
    const rows = ['+1','+2','+3','-1','-2','-3'];
    let html = '<div style="font-family:var(--font-mono);font-size:11px;min-width:700px;">';
    html += '<div style="display:grid;grid-template-columns:45px 1fr;gap:8px;margin-bottom:8px;color:var(--text-muted);"><div></div><div style="display:flex;justify-content:space-between;border-bottom:1px solid #334155;padding-bottom:4px;">';
    for (let p = 0; p <= 4; p++) {
        const bp = p === 0 ? 1 : Math.round(p * seqLen / 4);
        html += '<span>' + bp + ' bp</span>';
    }
    html += '</div></div>';
    rows.forEach(label => {
        const strand = label.startsWith('+') ? '+' : '-';
        const frame = parseInt(label.replace('+','').replace('-',''), 10);
        const frameOrfs = orfs.filter(o => o.strand === strand && o.frame === frame);
        html += '<div style="display:grid;grid-template-columns:45px 1fr;gap:8px;align-items:center;margin-bottom:5px;">';
        html += '<div style="color:' + (strand === '+' ? '#38BDF8' : '#F472B6') + ';font-weight:700;">' + label + '</div>';
        html += '<div style="position:relative;height:22px;background:rgba(255,255,255,0.03);border-radius:3px;border:1px dashed rgba(255,255,255,0.08);">';
        frameOrfs.forEach(o => {
            const left = (Math.min(o.start, o.end) - 1)/seqLen*100;
            const width = (Math.abs(o.end - o.start) + 1)/seqLen*100;
            const color = strand === '+' ? 'rgba(56,189,248,0.5)' : 'rgba(244,114,182,0.5)';
            const border = strand === '+' ? '#38BDF8' : '#F472B6';
            html += '<div class="orf-bar" style="left:' + left + '%;width:' + width + '%;background:' + color + ';border:1px solid ' + border + ';" title="ORF ' + o.start + '-' + o.end + '">';
            if (width > 12) html += '<span style="font-size:9px;color:#E0F2FE;">' + o.length + 'bp</span>';
            html += '</div>';
        });
        html += '</div></div>';
    });
    html += '</div>';
    container.innerHTML = html;
}