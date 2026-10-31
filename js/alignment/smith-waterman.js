import { SETTINGS } from '../core/settings.js';

export function smithWaterman(s1, s2, opts = {}) {
    const {
        match = 2, mismatch = -1,
        gapOpen = SETTINGS.gapOpen, gapExtend = SETTINGS.gapExtend,
        useAffine = false
    } = opts;
    const n = s1.length, m = s2.length;
    const NEG = -1e9;
    const go = gapOpen;
    const ge = useAffine ? gapExtend : gapOpen;

    const H  = Array.from({length:n+1}, () => new Array(m+1).fill(0));
    const Hx = Array.from({length:n+1}, () => new Array(m+1).fill(NEG));
    const Hy = Array.from({length:n+1}, () => new Array(m+1).fill(NEG));

    let maxScore = 0, maxI = 0, maxJ = 0, maxState = 'H';
    for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
        const s = s1[i-1] === s2[j-1] ? match : mismatch;
        H[i][j]  = Math.max(0, H[i-1][j-1] + s, Hx[i-1][j-1] + s, Hy[i-1][j-1] + s);
        Hx[i][j] = Math.max(H[i-1][j] + go, Hx[i-1][j] + ge);
        Hy[i][j] = Math.max(H[i][j-1] + go, Hy[i][j-1] + ge);
        const cand = Math.max(H[i][j], Hx[i][j], Hy[i][j]);
        if (cand > maxScore) {
            maxScore = cand; maxI = i; maxJ = j;
            maxState = cand === H[i][j] ? 'H' : (cand === Hx[i][j] ? 'Hx' : 'Hy');
        }
    }

    let i = maxI, j = maxJ, state = maxState;
    const a1 = [], a2 = [], mid = [];
    while (i > 0 && j > 0) {
        if (state === 'H') {
            if (H[i][j] === 0) break;
            const s = s1[i-1] === s2[j-1] ? match : mismatch;
            a1.push(s1[i-1]); a2.push(s2[j-1]); mid.push(s1[i-1] === s2[j-1] ? '|' : '.');
            const prev = H[i][j] - s; i--; j--;
            if (prev === Hx[i][j]) state = 'Hx';
            else if (prev === Hy[i][j]) state = 'Hy';
            else state = 'H';
        } else if (state === 'Hx') {
            a1.push(s1[i-1]); a2.push('-'); mid.push(' ');
            const cur = Hx[i][j]; i--; if (i < 0) break;
            state = (cur === H[i][j] + go) ? 'H' : 'Hx';
        } else {
            a1.push('-'); a2.push(s2[j-1]); mid.push(' ');
            const cur = Hy[i][j]; j--; if (j < 0) break;
            state = (cur === H[i][j] + go) ? 'H' : 'Hy';
        }
    }

    const params = useAffine
        ? {match, mismatch, gapOpen: go, gapExtend: ge, mode:'affine'}
        : {match, mismatch, gapOpen: go, gapExtend: ge, mode:'linear'};
    return {score: maxScore, aligned1: a1.reverse().join(''), aligned2: a2.reverse().join(''),
        mid: mid.reverse().join(''), startRef: i+1, startSample: j+1, params};
}