import { cleanSequence, showToast } from '../core/utils.js';
import { needlemanWunsch } from './needleman-wunsch.js';
import { smithWaterman } from './smith-waterman.js';
import { computeAlignmentIdentity } from './identity.js';

export function render() {}

function addMetricCards(grid, cards) {
    cards.forEach(c => {
        const card = document.createElement('div');
        card.className = 'metric-card ' + (c.accent || '');
        const h = document.createElement('div'); h.className = 'metric-header';
        const hs = document.createElement('span'); hs.textContent = c.label; h.appendChild(hs);
        const v = document.createElement('div'); v.className = 'metric-value';
        const vs = document.createElement('span'); vs.textContent = c.val;
        if (c.color) vs.style.color = c.color;
        v.appendChild(vs);
        card.appendChild(h); card.appendChild(v);
        grid.appendChild(card);
    });
}

function renderAlignmentView(container, r) {
    if (!container) return;
    container.innerHTML = '';
    const chunkSize = 80;
    for (let i = 0; i < r.aligned1.length; i += chunkSize) {
        const c1 = r.aligned1.substring(i, i+chunkSize);
        const c2 = r.aligned2.substring(i, i+chunkSize);
        const cm = r.mid.substring(i, i+chunkSize);
        const wrap = document.createElement('div');
        wrap.style.cssText = 'background:var(--bg-base);border:1px solid var(--border);border-radius:6px;padding:10px 14px;margin-bottom:8px;font-family:var(--font-mono);font-size:12px;direction:ltr;text-align:left;';
        const mk = (label, text, color) => {
            const d = document.createElement('div');
            d.style.cssText = 'white-space:pre-wrap;word-break:break-all;';
            const lbl = document.createElement('span');
            lbl.style.cssText = 'color:var(--text-muted);display:inline-block;width:65px;';
            lbl.textContent = label + ':';
            const t = document.createElement('span');
            t.style.color = color;
            t.textContent = text;
            d.appendChild(lbl); d.appendChild(t);
            return d;
        };
        wrap.appendChild(mk('REF', c1, 'var(--text-primary)'));
        wrap.appendChild(mk('Match', cm, 'var(--emerald)'));
        wrap.appendChild(mk('SAMPLE', c2, '#93C5FD'));
        container.appendChild(wrap);
    }
}

export function run() {
    const s1 = cleanSequence(document.getElementById('compSeqRef')?.value || '');
    const s2 = cleanSequence(document.getElementById('compSeqSample')?.value || '');
    if (!s1 || !s2) { showToast('هر دو توالی را وارد کنید.'); return; }
    const algo = document.getElementById('compAlgoSelect')?.value || 'nw';
    const useAffine = document.getElementById('compAffineGap')?.checked || false;
    const outputView = document.getElementById('diffOutputView');
    const alignView = document.getElementById('alignmentOutput');
    const grid = document.getElementById('diffMetricsGrid');
    if (!outputView || !grid) return;
    grid.innerHTML = '';

    if (algo === 'positional') {
        const len = Math.min(s1.length, s2.length);
        const mismatchFlag = s1.length !== s2.length;
        const diffs = [];
        for (let i = 0; i < len; i++) if (s1[i] !== s2[i]) diffs.push({pos: i+1, ref: s1[i], alt: s2[i]});
        const identity = len ? ((len - diffs.length)/len)*100 : 0;
        outputView.textContent = 'Method: Positional\nREF: ' + s1.length + ' | SAMPLE: ' + s2.length + (mismatchFlag ? ' [WARN unequal]' : '') + '\nIdentity: ' + identity.toFixed(2) + '%\nSubstitutions: ' + diffs.length + '\n' + (diffs.slice(0, 60).map(d => d.pos + d.ref + '>' + d.alt).join(' ') || 'none');
        if (alignView) alignView.innerHTML = '';
        addMetricCards(grid, [
            {label:'Identity', val: identity.toFixed(1)+'%', accent:'accent-cyan'},
            {label:'Substitutions', val: String(diffs.length), accent:'accent-amber', color:'var(--amber)'},
            {label:'Compared length', val: len+' bp'}
        ]);
    } else if (algo === 'nw') {
        const r = needlemanWunsch(s1, s2, useAffine ? {useAffine: true} : {});
        outputView.textContent = `Method: Needleman-Wunsch [${r.params.mode}]\nScore: ${r.score}\nGap: open=${r.params.gapOpen} extend=${r.params.gapExtend}\nAligned: ${r.aligned1.length} bp\nIdentity: ${(computeAlignmentIdentity(r)*100).toFixed(2)}%`;
        renderAlignmentView(alignView, r);
        addMetricCards(grid, [
            {label:'Score', val: String(r.score), accent:'accent-cyan'},
            {label:'Identity', val: (computeAlignmentIdentity(r)*100).toFixed(1)+'%', accent:'accent-emerald', color:'var(--emerald)'},
            {label:'Aligned length', val: r.aligned1.length+' bp'},
            {label:'Mode', val: r.params.mode, accent:'accent-blue'}
        ]);
    } else if (algo === 'sw') {
        const r = smithWaterman(s1, s2, useAffine ? {useAffine: true} : {});
        outputView.textContent = `Method: Smith-Waterman [${r.params.mode}]\nScore: ${r.score}\nLocal start: REF ${r.startRef}, SAMPLE ${r.startSample}\nAligned: ${r.aligned1.length} bp\nIdentity: ${(computeAlignmentIdentity(r)*100).toFixed(2)}%`;
        renderAlignmentView(alignView, r);
        addMetricCards(grid, [
            {label:'Local score', val: String(r.score), accent:'accent-cyan'},
            {label:'Identity', val: (computeAlignmentIdentity(r)*100).toFixed(1)+'%', accent:'accent-emerald', color:'var(--emerald)'},
            {label:'Aligned length', val: r.aligned1.length+' bp'},
            {label:'Mode', val: r.params.mode, accent:'accent-blue'}
        ]);
    }
    document.getElementById('diffResultsPanel').style.display = 'block';
}

export function loadExample(type) {
    const examples = {
        identical: {ref:'ATGGATTTATCTGCTCTTCGCGTTGAAGAAGTACAAAATGTCATTAATGCTATGCAGAAA', sample:'ATGGATTTATCTGCTCTTCGCGTTGAAGAAGTACAAAATGTCATTAATGCTATGCAGAAA'},
        substitution: {ref:'ATGGATTTATCTGCTCTTCGCGTTGAAGAAGTACAAAATGTCATTAATGCTATGCAGAAA', sample:'ATGGATTTATATGCTCTTCGCGTTGAAGAAGTACAAAATGTCATTAATGCTATGCAGAAA'},
        indel: {ref:'ATGGATTTATCTGCTCTTCGCGTTGAAGAAGTACAAAATGTCATTAATGCTATGCAGAAA', sample:'ATGGATTTATCTGCTCTTCGCGGTTGAAGAAGTACAAAATGTCATTAATGCTATGCAGAAA'}
    };
    const ex = examples[type];
    if (!ex) return;
    document.getElementById('compSeqRef').value = ex.ref;
    document.getElementById('compSeqSample').value = ex.sample;
    run();
}