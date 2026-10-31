import { GENESCOPE } from '../core/state.js';
import { SETTINGS } from '../core/settings.js';
import { detectMoleculeType } from '../core/types.js';
import { cleanSequence, getComplement, getReverseComplement, getRNA, showToast, copyText } from '../core/utils.js';
import { calculateStats, calculateGRQS } from '../sequence/stats.js';
import { getTranslation, getCodonSplit, getSixFrameTranslation } from '../sequence/translation.js';
import { getCurrentGeneticCode } from '../orf/orf.js';
import { refresh as refreshDashboard } from './dashboard.js';
import { computeKmers, computeCpG } from '../kmer/kmer-view.js';
import { updateTable as updateORFTable, renderMap as renderORFMap } from '../orf/orf-view.js';
import { renderMap as renderRestrictionMap, renderGel } from '../restriction/enzymes-view.js';

export function render() {}

export function loadSample(key) {
    const s = GENESCOPE.samples[key];
    if (!s) { showToast('نمونه یافت نشد.'); return; }
    const ta = document.getElementById('mainSeqInput');
    if (ta) ta.value = s.seq;
    GENESCOPE.sampleMeta = s.label;
    run();
}

export function clear() {
    const ta = document.getElementById('mainSeqInput');
    if (ta) ta.value = '';
    GENESCOPE.currentSeq = null;
    GENESCOPE.currentType = null;
    GENESCOPE.sampleMeta = null;
    ['outputComplement','outputRevComp','outputRNA','outputProtein','outputCodons'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '';
    });
    const sf = document.getElementById('outputSixFrames');
    if (sf) sf.innerHTML = '';
    const el = document.getElementById('detectedMoleculeType');
    if (el) el.textContent = 'در انتظار ورودی';
    const el2 = document.getElementById('liveSeqStatsLabel');
    if (el2) el2.textContent = '0 bp';
    ['resCountA','resCountT','resCountC','resCountG','resEntropy','resTm','resTotalLen'].forEach(id => {
        const e = document.getElementById(id);
        if (e) e.textContent = '—';
    });
    const grq = document.getElementById('resGRQS');
    if (grq) grq.textContent = '—';
    const proj = document.getElementById('currentProjectLabel');
    if (proj) proj.textContent = 'بدون توالی';
    refreshDashboard();
}

export function switchTransTab(tabId, btn) {
    document.querySelectorAll('.trans-tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.trans-tabs-nav .tab-btn').forEach(el => el.classList.remove('active'));
    const t = document.getElementById(tabId);
    if (t) t.classList.add('active');
    if (btn) btn.classList.add('active');
}

export function copyOutput(id) {
    const el = document.getElementById(id);
    if (!el) return;
    copyText(el.textContent || '');
}

export function run() {
    const ta = document.getElementById('mainSeqInput');
    if (!ta) return;
    const rawInput = ta.value || '';
    const seq = cleanSequence(rawInput);
    if (!seq || seq.length < SETTINGS.minSeqLen) {
        showToast('حداقل ' + SETTINGS.minSeqLen + ' کاراکتر معتبر وارد کنید.');
        return;
    }

    const det = detectMoleculeType(seq);
    GENESCOPE.currentSeq = seq;
    GENESCOPE.currentType = det.type;
    const typeLbl = document.getElementById('detectedMoleculeType');
    if (typeLbl) typeLbl.textContent = det.type + ' — ' + det.reason;
    if (det.type === 'PROTEIN' && SETTINGS.warnProtein) {
        showToast('توجه: پروتئین — شاخص‌های GC/Entropy/Tm معنی زیستی ندارند.');
    }

    const stats = calculateStats(rawInput.replace(/[^A-Za-z*]/g, '').toUpperCase());
    if (stats.invalid.length > 0) {
        showToast('⚠ نویسهٔ نامعتبر: ' + [...new Set(stats.invalid)].join(','));
    }

    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('liveSeqStatsLabel', `${stats.len} bp | GC: ${stats.gc.toFixed(1)}% (denom ${stats.gcDenominator})`);
    set('resCountA', stats.A);
    set('resCountT', stats.T);
    set('resCountC', stats.C);
    set('resCountG', stats.G);
    set('resTotalLen', stats.len);
    set('resEntropy', stats.entropy.toFixed(3));

    const tmEl = document.getElementById('resTm');
    const tmMethodEl = document.getElementById('resTmMethod');
    const tmDetailEl = document.getElementById('resTmDetail');
    if (stats.tm !== null) {
        tmEl.textContent = stats.tm.toFixed(1);
        tmEl.style.color = 'var(--rose)';
        tmMethodEl.textContent = stats.tmMethod || 'Nearest-Neighbor';
        if (stats.tmAlt) {
            tmDetailEl.textContent = `مقایسه: ${stats.tmAlt.toFixed(1)}°C (${stats.tmMethodAlt})`;
        } else if (stats.tmDetails) {
            tmDetailEl.textContent = `ΔH=${stats.tmDetails.dh.toFixed(1)} kcal/mol · [Na⁺]=${stats.tmDetails.naConc} mM`;
        }
    } else {
        tmEl.textContent = 'n/a';
        tmEl.style.color = 'var(--text-muted)';
        tmMethodEl.textContent = stats.tmReason || 'نامعتبر';
        tmDetailEl.textContent = '';
    }

    const grqsResult = calculateGRQS(stats);
    const grqsEl = document.getElementById('resGRQS');
    const tierEl = document.getElementById('resGRQSTier');
    if (grqsEl) {
        grqsEl.textContent = grqsResult.grqs.toFixed(1);
        grqsEl.style.color = grqsResult.color;
    }
    if (tierEl) {
        tierEl.textContent = grqsResult.tier + ' · ' + grqsResult.tierEn;
        tierEl.className = 'status-pill ' + (grqsResult.grqs >= 75 ? 'valid' : grqsResult.grqs >= 60 ? 'warning' : 'error');
    }
    const setComp = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v.toFixed(0); };
    setComp('grqsCompC', grqsResult.components.completeness);
    setComp('grqsCompB', grqsResult.components.baseQuality);
    setComp('grqsCompG', grqsResult.components.gcBalance);
    setComp('grqsCompX', grqsResult.components.complexity);

    set('outputComplement', getComplement(seq));
    set('outputRevComp', getReverseComplement(seq));
    set('outputRNA', getRNA(seq));
    const tableId = getCurrentGeneticCode();
    const tr = getTranslation(seq, 0, tableId);
    set('outputProtein', tr.protein);
    set('outputCodons', getCodonSplit(seq));

    const sixFramesEl = document.getElementById('outputSixFrames');
    if (sixFramesEl) {
        sixFramesEl.innerHTML = '';
        const frames = getSixFrameTranslation(seq, tableId);
        frames.forEach(f => {
            const d = document.createElement('div');
            d.style.cssText = 'margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,.05);';
            const head = document.createElement('span');
            head.style.cssText = `color:${f.strand === '+' ? '#38BDF8' : '#F472B6'};font-weight:700;display:inline-block;width:40px;`;
            head.textContent = f.frame;
            const body = document.createElement('span');
            body.style.color = '#E2E8F0';
            body.textContent = f.protein.substring(0, 200) + (f.protein.length > 200 ? '...' : '');
            d.appendChild(head);
            d.appendChild(body);
            sixFramesEl.appendChild(d);
        });
    }

    refreshDashboard();
    if (GENESCOPE.activeView === 'orf') { updateORFTable(); renderORFMap(); }
    if (GENESCOPE.activeView === 'enzymes') { renderRestrictionMap(); renderGel(); }
    if (GENESCOPE.activeView === 'kmer') { computeKmers(SETTINGS.defaultK, null); computeCpG(); }

    const proj = document.getElementById('currentProjectLabel');
    if (proj) proj.textContent = stats.len + ' bp';
    showToast('تحلیل کامل شد.');
}