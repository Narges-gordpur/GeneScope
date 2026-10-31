import { SETTINGS } from '../core/settings.js';

export function countCpG(seq) {
    let n = 0;
    for (let i = 0; i+2 <= seq.length; i++)
        if (seq[i] === 'C' && seq[i+1] === 'G') n++;
    return n;
}

export function computeCpGObsExp(seq) {
    const len = seq.length;
    let C = 0, G = 0;
    for (const ch of seq) { if (ch === 'C') C++; else if (ch === 'G') G++; }
    const cpgs = countCpG(seq);
    if (C === 0 || G === 0 || len === 0) return {obs: cpgs, exp: 0, ratio: null, C, G};
    const exp = (C * G) / len;
    return {obs: cpgs, exp, ratio: cpgs/exp, C, G};
}

export function detectCpGIslands(seq) {
    const winSize = SETTINGS.cpgWindow, step = SETTINGS.cpgStep;
    if (seq.length < winSize) return [];
    const candidates = [];
    for (let i = 0; i + winSize <= seq.length; i += step) {
        const sub = seq.substring(i, i+winSize);
        let gc = 0;
        for (const ch of sub) if (ch === 'C' || ch === 'G') gc++;
        const gcPct = gc/winSize*100;
        const oe = computeCpGObsExp(sub);
        if (gcPct >= 50 && oe.ratio && oe.ratio >= SETTINGS.cpgObsExp)
            candidates.push({start: i+1, end: i+winSize, gc: gcPct, oe: oe.ratio});
    }
    const merged = [];
    for (const c of candidates) {
        const last = merged[merged.length - 1];
        if (last && c.start <= last.end + step) {
            last.end = Math.max(last.end, c.end);
            last.gc = (last.gc + c.gc)/2;
            last.oe = (last.oe + c.oe)/2;
        } else merged.push({...c});
    }
    return merged;
}