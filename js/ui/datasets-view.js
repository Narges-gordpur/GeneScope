import { GENESCOPE } from '../core/state.js';
import { SETTINGS } from '../core/settings.js';
import { detectMoleculeType } from '../core/types.js';
import { cleanSequence, showToast } from '../core/utils.js';
import { switchView } from './navigation.js';
import { run as runAnalyzer } from './analyzer.js';

export function render() {
    const tbody = document.getElementById('datasetsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    const entries = Object.entries(GENESCOPE.samples);
    const counter = document.getElementById('datasetCount');
    if (counter) counter.textContent = entries.length + ' دیتاست';
    if (entries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:24px;">هیچ دیتاستی یافت نشد.</td></tr>';
        return;
    }
    entries.forEach(([key, s]) => {
        const tr = document.createElement('tr');
        const type = detectMoleculeType(cleanSequence(s.seq)).type || 'UNKNOWN';
        const isNCBI = key.startsWith('NCBI_');
        const source = isNCBI ? (s.source || 'NCBI') : 'Sample (Local)';
        const status = isNCBI
            ? '<span class="status-pill valid"><i class="fa-solid fa-cloud"></i> NCBI</span>'
            : '<span class="status-pill warning"><i class="fa-solid fa-flask"></i> Educational</span>';
        const cells = [
            {v: s.label, style: 'font-weight:700;'},
            {v: (s.desc || '—').substring(0, 60), style: 'font-size:11px;color:var(--text-muted);'},
            {v: s.seq.length.toLocaleString() + ' bp', cls: 'mono'},
            {v: type, style: 'color:var(--cyan);font-weight:700;'},
            {v: source, style: 'font-size:11px;color:var(--text-secondary);'},
            {html: status}
        ];
        cells.forEach(c => {
            const td = document.createElement('td');
            if (c.cls) td.className = c.cls;
            if (c.style) td.style.cssText = c.style;
            if (c.html) td.innerHTML = c.html; else td.textContent = c.v;
            tr.appendChild(td);
        });
        const act = document.createElement('td');
        const wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex;gap:6px;justify-content:center;flex-wrap:wrap;';
        const loadBtn = document.createElement('button');
        loadBtn.className = 'btn btn-primary btn-xs';
        loadBtn.innerHTML = '<i class="fa-solid fa-play"></i> بارگذاری';
        loadBtn.addEventListener('click', () => {
            document.getElementById('mainSeqInput').value = s.seq;
            GENESCOPE.sampleMeta = s.label;
            switchView('analyzer');
            runAnalyzer();
        });
        wrap.appendChild(loadBtn);
        if (isNCBI) {
            const delBtn = document.createElement('button');
            delBtn.className = 'btn btn-secondary btn-xs';
            delBtn.innerHTML = '<i class="fa-solid fa-trash" style="color:var(--rose);"></i>';
            delBtn.addEventListener('click', () => deleteDataset(key));
            wrap.appendChild(delBtn);
        }
        act.appendChild(wrap);
        tr.appendChild(act);
        tbody.appendChild(tr);
    });
}

export function showFetchDialog() {
    const p = document.getElementById('ncbiFetchPanel');
    if (p) p.style.display = 'block';
    const inp = document.getElementById('ncbiAccessionInput');
    if (inp) { inp.focus(); inp.select(); }
}

export async function testConnectivity() {
    const msg = document.getElementById('ncbiStatusMsg');
    if (msg) { msg.textContent = 'در حال آزمایش...'; msg.style.color = 'var(--cyan)'; }
    try {
        const resp = await fetch('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/einfo.fcgi?retmode=json');
        if (resp.ok) {
            if (msg) { msg.textContent = '✓ اتصال برقرار'; msg.style.color = 'var(--emerald)'; }
            showToast('اتصال NCBI موفق.');
        } else throw new Error('HTTP ' + resp.status);
    } catch (e) {
        if (msg) { msg.textContent = '✗ ' + e.message; msg.style.color = 'var(--rose)'; }
        showToast('اتصال ناموفق: ' + e.message);
    }
}

export async function fetchFromNCBI() {
    const accInp = document.getElementById('ncbiAccessionInput');
    const dbSel = document.getElementById('ncbiDbSelect');
    const statusMsg = document.getElementById('ncbiStatusMsg');
    const btn = document.getElementById('ncbiFetchBtn');
    if (!accInp || !accInp.value.trim()) { showToast('شناسه را وارد کنید.'); return; }

    const accession = accInp.value.trim();
    const db = dbSel ? dbSel.value : 'nuccore';
    btn.disabled = true;
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> دریافت...';

    try {
        let url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=${encodeURIComponent(db)}&id=${encodeURIComponent(accession)}&rettype=fasta&retmode=text`;
        if (SETTINGS.ncbiKey) url += '&api_key=' + encodeURIComponent(SETTINGS.ncbiKey);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), SETTINGS.apiTimeout * 1000);
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const fastaText = await response.text();
        if (!fastaText || !fastaText.trim().startsWith('>')) throw new Error('پاسخ نامعتبر.');
        const firstLine = fastaText.split('\n')[0];
        const seqLines = fastaText.split('\n').slice(1).join('').replace(/\s/g, '');
        const key = 'NCBI_' + accession.replace(/[^A-Za-z0-9]/g, '_');
        GENESCOPE.samples[key] = {
            seq: seqLines,
            label: accession,
            desc: firstLine.substring(1).trim().substring(0, 80),
            source: 'NCBI ' + db
        };
        if (statusMsg) { statusMsg.textContent = '✓ ' + seqLines.length + ' bp'; statusMsg.style.color = 'var(--emerald)'; }
        render();
        document.getElementById('mainSeqInput').value = seqLines;
        GENESCOPE.sampleMeta = accession + ' (' + db + ')';
        switchView('analyzer');
        runAnalyzer();
        showToast('دریافت موفق: ' + accession);
    } catch (e) {
        let m = e.message;
        if (e.name === 'AbortError') m = 'Timeout';
        else if (e.message.includes('Failed to fetch')) m = 'خطای شبکه/CORS';
        if (statusMsg) { statusMsg.textContent = '✗ ' + m; statusMsg.style.color = 'var(--rose)'; }
        showToast('دریافت ناموفق: ' + m);
    } finally {
        btn.disabled = false;
        btn.innerHTML = orig;
    }
}

export function clearCache() {
    const keys = Object.keys(GENESCOPE.samples).filter(k => k.startsWith('NCBI_'));
    if (!keys.length) { showToast('کش NCBI خالی است.'); return; }
    if (!confirm('حذف ' + keys.length + ' دیتاست؟')) return;
    keys.forEach(k => delete GENESCOPE.samples[k]);
    render();
    showToast(keys.length + ' حذف شد.');
}

export function deleteDataset(key) {
    if (!confirm('حذف «' + (GENESCOPE.samples[key]?.label || key) + '»؟')) return;
    delete GENESCOPE.samples[key];
    render();
    showToast('حذف شد.');
}