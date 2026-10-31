import { IUPAC_INFO, GLOSSARY, HUMAN_CODON_FREQ } from '../core/constants.js';
import { CODON_TABLES } from '../core/codon-tables.js';
import { showToast, downloadBlob } from '../core/utils.js';

export function switchTab(tabId, btn) {
    document.querySelectorAll('.edu-tab-pane').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('#view-education .tab-btn').forEach(el => el.classList.remove('active'));
    const t = document.getElementById(tabId);
    if (t) t.classList.add('active');
    if (btn) btn.classList.add('active');
}

export function init() {
    const codonBody = document.getElementById('codonTableBody');
    if (codonBody && !codonBody.dataset.built) {
        codonBody.innerHTML = '';
        const sorted = Object.keys(HUMAN_CODON_FREQ).sort();
        for (let i = 0; i < sorted.length; i += 2) {
            const tr = document.createElement('tr');
            [sorted[i], CODON_TABLES['1'][sorted[i]], HUMAN_CODON_FREQ[sorted[i]].toFixed(1)].forEach(v => {
                const td = document.createElement('td'); td.className = 'mono'; td.textContent = v; tr.appendChild(td);
            });
            if (sorted[i+1]) {
                [sorted[i+1], CODON_TABLES['1'][sorted[i+1]], HUMAN_CODON_FREQ[sorted[i+1]].toFixed(1)].forEach(v => {
                    const td = document.createElement('td'); td.className = 'mono'; td.textContent = v; tr.appendChild(td);
                });
            } else {
                ['—','—','—'].forEach(v => { const td = document.createElement('td'); td.className = 'mono'; td.textContent = v; tr.appendChild(td); });
            }
            codonBody.appendChild(tr);
        }
        codonBody.dataset.built = '1';
    }
    const iupacBody = document.getElementById('iupacTableBody');
    if (iupacBody && !iupacBody.dataset.built) {
        iupacBody.innerHTML = '';
        const colorMap = {A:'#10B981',T:'#EF4444',C:'#06B6D4',G:'#F59E0B'};
        IUPAC_INFO.forEach(info => {
            const tr = document.createElement('tr');
            const td1 = document.createElement('td');
            td1.className = 'mono';
            td1.style.cssText = `font-weight:800;font-size:14px;color:${colorMap[info.code] || 'var(--text-primary)'};`;
            td1.textContent = info.code;
            const td2 = document.createElement('td'); td2.className = 'mono'; td2.textContent = info.eq;
            const td3 = document.createElement('td'); td3.textContent = info.name;
            const td4 = document.createElement('td'); td4.className = 'mono'; td4.textContent = info.comp;
            const td5 = document.createElement('td'); td5.textContent = info.cat; td5.style.fontSize = '11px';
            [td1, td2, td3, td4, td5].forEach(td => tr.appendChild(td));
            iupacBody.appendChild(tr);
        });
        iupacBody.dataset.built = '1';
    }
    const glBody = document.getElementById('glossaryTableBody');
    if (glBody && !glBody.dataset.built) {
        glBody.innerHTML = '';
        GLOSSARY.forEach(([term, def]) => {
            const tr = document.createElement('tr');
            const td1 = document.createElement('td');
            td1.style.cssText = 'font-weight:700;color:var(--cyan);';
            td1.textContent = term;
            const td2 = document.createElement('td');
            td2.style.cssText = 'color:var(--text-secondary);font-size:12px;';
            td2.textContent = def;
            tr.appendChild(td1);
            tr.appendChild(td2);
            glBody.appendChild(tr);
        });
        glBody.dataset.built = '1';
    }
}

function collectSections() {
    const tabs = [
        {id:'edu-molecules', title:'مولکول‌های زیستی'},
        {id:'edu-central', title:'دگم مرکزی'},
        {id:'edu-stats', title:'آمار و پارامترها'},
        {id:'edu-codon', title:'جدول کدون‌ها'},
        {id:'edu-iupac', title:'کدهای IUPAC'},
        {id:'edu-enzymes', title:'آنزیم‌های برشی'},
        {id:'edu-seq', title:'توالی‌یابی'},
        {id:'edu-quality', title:'کنترل کیفیت'},
        {id:'edu-glossary', title:'واژه‌نامه'},
        {id:'edu-refs', title:'مراجع'}
    ];
    const sections = [];
    tabs.forEach(t => {
        const el = document.getElementById(t.id);
        if (!el) return;
        const modules = [...el.querySelectorAll('.edu-module')].map(m => ({
            title: m.querySelector('h3')?.textContent?.trim() || '',
            paragraphs: [...m.querySelectorAll('p')].map(p => p.textContent.trim()),
            lists: [...m.querySelectorAll('ul, ol')].map(ul => [...ul.querySelectorAll('li')].map(li => li.textContent.trim())),
            formulas: [...m.querySelectorAll('.formula')].map(f => f.textContent.trim())
        }));
        sections.push({ tab: t.title, modules });
    });
    return sections;
}

export function exportJSON() {
    const data = {
        schemaVersion: '11.1-EDU',
        generatedAt: new Date().toISOString(),
        software: 'GeneScope Pro v11.1 — Educational Module',
        sections: collectSections()
    };
    downloadBlob(JSON.stringify(data, null, 2), 'GeneScope_Education_Report_' + Date.now() + '.json', 'application/json');
    showToast('گزارش آموزشی JSON صادر شد.');
}

export function printPDF() {
    const w = window.open('', '_blank');
    if (!w) { showToast('اجازه popup را فعال کنید.'); return; }
    const sections = collectSections();
    let html = '<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="UTF-8"><title>GeneScope Education</title>';
    html += '<style>body{font-family:Tahoma,Arial;padding:32px;line-height:1.9;max-width:900px;margin:0 auto}h1{color:#0891b2;border-bottom:3px solid #0891b2;padding-bottom:12px}h2{color:#0e7490;margin-top:28px;border-bottom:1px solid #ccc}h3{color:#155e75}code{background:#f1f5f9;padding:2px 6px;border-radius:3px;font-family:monospace;direction:ltr}.formula{background:#f8fafc;border-right:3px solid #0891b2;padding:10px 14px;margin:8px 0;font-family:monospace;direction:ltr}.module{page-break-inside:avoid;margin-bottom:18px}</style></head><body>';
    html += '<h1>🧬 GeneScope Pro v11.1 — گزارش آموزشی</h1>';
    sections.forEach(s => {
        html += '<h2>' + s.tab + '</h2>';
        s.modules.forEach(m => {
            html += '<div class="module"><h3>' + m.title + '</h3>';
            m.paragraphs.forEach(p => html += '<p>' + p + '</p>');
            m.lists.forEach(l => { if (l.length) { html += '<ul>'; l.forEach(li => html += '<li>' + li + '</li>'); html += '</ul>'; } });
            m.formulas.forEach(f => html += '<div class="formula">' + f.replace(/\n/g,'<br>') + '</div>');
            html += '</div>';
        });
    });
    html += '</body></html>';
    w.document.open();
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 400);
    showToast('PDF در پنجره جدید آماده شد.');
}