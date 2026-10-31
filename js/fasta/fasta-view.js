import { GENESCOPE } from '../core/state.js';
import { showToast, downloadBlob } from '../core/utils.js';
import { validateFasta } from './fasta-engine.js';
import { runSuite } from '../../tests/runner.js';

export function render() {}

export function validate() {
    const raw = document.getElementById('fastaRawArea')?.value || '';
    if (!raw.trim()) { showToast('محتوای FASTA خالی است.'); return; }
    const perf = document.getElementById('fastaPerfLabel');
    if (perf) perf.textContent = 'در حال پردازش...';
    setTimeout(() => {
        const report = validateFasta(raw);
        GENESCOPE.lastFastaReport = report;
        renderReport(report);
        if (perf) perf.textContent = `پردازش ${report.elapsedMs} ms | ${report.fileSizeKB} KB`;
    }, 20);
}

export function clear() {
    const ta = document.getElementById('fastaRawArea'); if (ta) ta.value = '';
    GENESCOPE.lastFastaReport = null;
    updateLiveStats();
    ['fastaSummaryPanel','fastaRecordsPanel','fastaAnalyzeAllPanel'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    const badge = document.getElementById('fastaGlobalStatusBadge');
    if (badge) { badge.className = 'status-pill'; badge.textContent = 'در انتظار'; }
    const perf = document.getElementById('fastaPerfLabel'); if (perf) perf.textContent = 'آماده';
    showToast('باکس FASTA پاک شد.');
}

function renderReport(report) {
    const s = report.summary;
    const badge = document.getElementById('fastaGlobalStatusBadge');
    if (badge) {
        if (s.errorRecords > 0) { badge.className = 'status-pill error'; badge.textContent = s.errorRecords + ' خطا'; }
        else if (s.warningRecords > 0) { badge.className = 'status-pill warning'; badge.textContent = s.warningRecords + ' هشدار'; }
        else { badge.className = 'status-pill valid'; badge.textContent = 'همه ' + s.totalRecords + ' معتبر'; }
    }
    const sumEl = document.getElementById('fastaSummaryMetrics');
    if (sumEl) {
        sumEl.innerHTML = '';
        const metrics = [
            ['کل رکوردها', s.totalRecords, ''],
            ['معتبر', s.validRecords, 'var(--emerald)'],
            ['هشدار', s.warningRecords, 'var(--amber)'],
            ['خطا', s.errorRecords, 'var(--rose)'],
            ['توالی خالی', s.emptySequences, ''],
            ['کاراکتر نامعتبر', s.invalidChars, 'var(--rose)'],
            ['IUPAC', s.iupacCount, 'var(--amber)'],
            ['ID تکراری', s.duplicateIds, 'var(--amber)'],
            ['توالی تکراری', s.duplicateSeqs, 'var(--amber)'],
            ['میانگین طول', s.avgLength, ''],
            ['میانگین GC%', s.avgGC.toFixed(1), ''],
            ['زمان (ms)', report.elapsedMs, '']
        ];
        metrics.forEach(([label, val, color]) => {
            const card = document.createElement('div');
            card.className = 'metric-card';
            const h = document.createElement('div'); h.className = 'metric-header';
            const hs = document.createElement('span'); hs.textContent = label; h.appendChild(hs);
            const v = document.createElement('div'); v.className = 'metric-value';
            const vs = document.createElement('span'); vs.textContent = val;
            if (color) vs.style.color = color;
            v.appendChild(vs);
            card.appendChild(h); card.appendChild(v);
            sumEl.appendChild(card);
        });
    }
    const issues = document.getElementById('fastaIssuesBox');
    if (issues) {
        issues.innerHTML = '';
        const recsWith = report.records.filter(r => r.errors.length || r.warnings.length || r.headerIssues.length);
        if (!recsWith.length) {
            const ok = document.createElement('div');
            ok.style.cssText = 'background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.3);border-radius:var(--radius-md);padding:12px;color:var(--emerald);text-align:center;font-weight:600;';
            ok.textContent = 'بدون خطا یا هشدار.';
            issues.appendChild(ok);
        } else {
            recsWith.forEach((rec, i) => {
                const box = document.createElement('div');
                box.style.cssText = `background:var(--surface-elevated);border:1px solid var(--border);border-right:3px solid ${rec.errors.length ? 'var(--rose)' : 'var(--amber)'};border-radius:var(--radius-sm);padding:10px 14px;margin-bottom:8px;`;
                const head = document.createElement('div');
                head.style.cssText = 'font-weight:700;font-size:12.5px;margin-bottom:6px;';
                head.textContent = `#${i+1} — ${(rec.header || '').split(/\s+/)[0] || 'unnamed'}`;
                box.appendChild(head);
                const ul = document.createElement('ul');
                ul.style.cssText = 'list-style:none;padding:0;margin:0;font-size:11.5px;';
                [...rec.headerIssues, ...rec.errors, ...rec.warnings].forEach(iss => {
                    const li = document.createElement('li');
                    li.style.color = iss.severity === 'error' ? 'var(--rose)' : iss.severity === 'info' ? 'var(--cyan)' : 'var(--amber)';
                    li.style.padding = '2px 0';
                    li.textContent = `[${iss.severity}] ${iss.message}`;
                    ul.appendChild(li);
                });
                box.appendChild(ul);
                issues.appendChild(box);
            });
        }
    }
    document.getElementById('fastaRecordsPanel').style.display = 'block';
    renderRecordsTable(report);
    document.getElementById('fastaSummaryPanel').style.display = 'block';
}

function renderRecordsTable(report) {
    const tbody = document.getElementById('fastaParsedTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!report.records.length) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:var(--text-muted);padding:24px;">رکوردی نیست.</td></tr>';
        return;
    }
    report.records.forEach((rec, idx) => {
        const id = (rec.header || '').split(/\s+/)[0] || ('Record_' + (idx+1));
        const desc = (rec.header || '').substring(id.length).trim() || '—';
        const status = (rec.errors.length > 0 || !rec.headerValid) ? 'خطا' : (rec.warnings.length > 0 || rec.headerIssues.length > 0) ? 'هشدار' : 'معتبر';
        const statusClass = status === 'خطا' ? 'error' : status === 'هشدار' ? 'warning' : 'valid';
        const tr = document.createElement('tr');
        const gcStr = rec.gc !== null ? `${rec.gc.toFixed(1)}% (den=${rec.gcDenominator})` : '—';
        const cells = [
            {v: idx+1, cls: 'mono'},
            {v: rec.startLine, cls: 'mono'},
            {v: id, cls: 'mono', style: 'font-weight:600;font-size:11px;'},
            {v: desc, style: 'font-size:11px;color:var(--text-muted);max-width:200px;overflow:hidden;text-overflow:ellipsis;'},
            {v: rec.type, style: 'color:var(--cyan);font-weight:700;'},
            {v: rec.length, cls: 'mono'},
            {v: gcStr, cls: 'mono'},
            {v: rec.hasAmbiguity ? Object.keys(rec.iupacCodes).join(', ') : 'ندارد'}
        ];
        cells.forEach(c => {
            const td = document.createElement('td');
            if (c.cls) td.className = c.cls;
            if (c.style) td.style.cssText = c.style;
            td.textContent = c.v;
            tr.appendChild(td);
        });
        const stat = document.createElement('td');
        stat.innerHTML = `<span class="status-pill ${statusClass}">${status}</span>`;
        tr.appendChild(stat);
        const act = document.createElement('td');
        const btn = document.createElement('button');
        btn.className = 'btn btn-cyan btn-xs';
        btn.textContent = 'آنالیز';
        btn.addEventListener('click', () => {
            document.getElementById('mainSeqInput').value = rec.cleanedSeq;
            window.switchView('analyzer');
            window.runComprehensiveAnalysis();
        });
        act.appendChild(btn);
        tr.appendChild(act);
        tbody.appendChild(tr);
    });
}

export function analyzeAll() {
    if (!GENESCOPE.lastFastaReport) { showToast('ابتدا اعتبارسنجی را اجرا کنید.'); return; }
    const valid = GENESCOPE.lastFastaReport.records.filter(r =>
        (r.type === 'DNA' || r.type === 'RNA') && r.isValid && r.length >= 10);
    if (!valid.length) { showToast('رکورد معتبر DNA/RNA یافت نشد.'); return; }
    const container = document.getElementById('fastaAnalyzeAllContent');
    if (!container) return;
    container.innerHTML = '';
    const tbl = document.createElement('table');
    tbl.className = 'data-table';
    tbl.innerHTML = '<thead><tr><th>#</th><th>ID</th><th>Type</th><th>Length</th><th>GC%</th></tr></thead>';
    const tb = document.createElement('tbody');
    valid.forEach((rec, i) => {
        const tr = document.createElement('tr');
        const id = (rec.header || '').split(/\s+/)[0];
        [i+1, id, rec.type, rec.length, rec.gc !== null ? rec.gc.toFixed(1) : '—'].forEach(v => {
            const td = document.createElement('td');
            td.textContent = v;
            tr.appendChild(td);
        });
        tb.appendChild(tr);
    });
    tbl.appendChild(tb);
    container.appendChild(tbl);
    document.getElementById('fastaAnalyzeAllPanel').style.display = 'block';
}

export function exportCSV() {
    if (!GENESCOPE.lastFastaReport || !GENESCOPE.lastFastaReport.records.length) {
        showToast('ابتدا اعتبارسنجی.');
        return;
    }
    const headers = ['Index','Line','Header_ID','Type','Length','GC','GC_Denom','IUPAC','Errors','Warnings','Status'];
    const rows = GENESCOPE.lastFastaReport.records.map((r, i) => {
        const status = (r.errors.length || !r.headerValid) ? 'ERROR' : (r.warnings.length ? 'WARNING' : 'VALID');
        return [i+1, r.startLine, (r.header||'').split(/\s+/)[0], r.type, r.length,
            r.gc !== null ? r.gc.toFixed(2) : '',
            r.gcDenominator || '',
            Object.keys(r.iupacCodes).join('|'),
            r.errors.length, r.warnings.length, status]
            .map(v => '"' + String(v).replace(/"/g,'""') + '"').join(',');
    });
    const csv = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');
    downloadBlob(csv, 'GeneScope_FASTA_' + Date.now() + '.csv', 'text/csv;charset=utf-8;');
    showToast('CSV صادر شد (' + rows.length + ' ردیف).');
}

export function handleUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { showToast('بزرگ‌تر از ۵۰MB.'); return; }
    const reader = new FileReader();
    reader.onload = e => {
        document.getElementById('fastaRawArea').value = e.target.result;
        updateLiveStats();
        validate();
    };
    reader.onerror = () => showToast('خطا در خواندن.');
    reader.readAsText(file);
}

export function updateLiveStats() {
    const raw = document.getElementById('fastaRawArea')?.value || '';
    const lines = raw.split('\n').length, chars = raw.length;
    const el = document.getElementById('fastaLiveStats');
    if (el) el.textContent = 'خطوط: ' + lines.toLocaleString() + ' | کاراکترها: ' + chars.toLocaleString();
}

export function runTests() {
    const container = document.getElementById('testResultsContainer');
    const badge = document.getElementById('testSummaryBadge');
    if (!container) return;
    const summary = runSuite();
    if (badge) {
        badge.innerHTML = summary.failed === 0
            ? `<span class="status-pill valid"><i class="fa-solid fa-circle-check"></i> ${summary.passed}/${summary.total} موفق در ${summary.elapsed} ms</span>`
            : `<span class="status-pill error"><i class="fa-solid fa-circle-xmark"></i> ${summary.failed} ناموفق</span>`;
    }
    container.innerHTML = '';
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'test-summary-bar';
    const mk = (label, val, color) => {
        const card = document.createElement('div');
        card.className = 'metric-card';
        const h = document.createElement('div'); h.className = 'metric-header';
        const hs = document.createElement('span'); hs.textContent = label; h.appendChild(hs);
        const v = document.createElement('div'); v.className = 'metric-value';
        const vs = document.createElement('span'); vs.textContent = val; vs.style.color = color; v.appendChild(vs);
        card.appendChild(h); card.appendChild(v);
        return card;
    };
    summaryDiv.appendChild(mk('موفق', String(summary.passed), 'var(--emerald)'));
    summaryDiv.appendChild(mk('ناموفق', String(summary.failed), summary.failed > 0 ? 'var(--rose)' : 'var(--text-muted)'));
    summaryDiv.appendChild(mk('نرخ', ((summary.passed/summary.total)*100).toFixed(1) + '%', summary.failed === 0 ? 'var(--emerald)' : 'var(--amber)'));
    summaryDiv.appendChild(mk('زمان', summary.elapsed + ' ms', 'var(--cyan)'));
    container.appendChild(summaryDiv);

    const categories = [...new Set(summary.results.map(r => r.cat))];
    categories.forEach(cat => {
        const catResults = summary.results.filter(r => r.cat === cat);
        const catPassed = catResults.filter(r => r.pass).length;
        const catHeader = document.createElement('div');
        catHeader.className = 'test-category-header';
        catHeader.innerHTML = `<div style="font-weight:700;color:var(--cyan);font-size:13.5px;"><i class="fa-solid fa-folder" style="margin-left:6px;"></i>${cat}</div><div style="font-size:12px;font-family:var(--font-mono);color:${catPassed === catResults.length ? 'var(--emerald)' : 'var(--amber)'};">${catPassed}/${catResults.length}</div>`;
        container.appendChild(catHeader);

        const tbl = document.createElement('table');
        tbl.className = 'data-table';
        tbl.style.marginBottom = '12px';
        tbl.innerHTML = '<thead><tr><th style="width:50px;">#</th><th>نام تست</th><th style="width:90px;">نتیجه</th><th>جزئیات</th></tr></thead>';
        const tb = document.createElement('tbody');
        catResults.forEach(r => {
            const tr = document.createElement('tr');
            const td1 = document.createElement('td'); td1.className = 'mono'; td1.textContent = r.idx;
            const td2 = document.createElement('td'); td2.style.cssText = 'font-weight:600;font-size:12px;'; td2.textContent = r.name;
            const td3 = document.createElement('td');
            td3.innerHTML = r.pass
                ? '<span class="status-pill valid"><i class="fa-solid fa-check"></i> PASS</span>'
                : '<span class="status-pill error"><i class="fa-solid fa-xmark"></i> FAIL</span>';
            const td4 = document.createElement('td');
            td4.style.cssText = `font-family:var(--font-mono);font-size:11px;color:${r.pass ? 'var(--text-secondary)' : 'var(--rose)'};`;
            td4.textContent = r.error ? 'Exception: ' + r.error : r.detail;
            tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3); tr.appendChild(td4);
            tb.appendChild(tr);
        });
        tbl.appendChild(tb);
        container.appendChild(tbl);
    });
    showToast(`Test Suite: ${summary.passed}/${summary.total}`);
}