import { SETTINGS } from '../core/settings.js';

// FIX #3: linear gap penalty correctly applied
export function needlemanWunsch(s1, s2, opts = {}) {
    const {
        match = SETTINGS.nwMatch, mismatch = SETTINGS.nwMismatch,
        gapOpen = SETTINGS.gapOpen, gapExtend = SETTINGS.gapExtend,
        useAffine = false
    } = opts;
    const n = s1.length, m = s2.length;
    const NEG = -1e9;
    const go = gapOpen;
    const ge = useAffine ? gapExtend : gapOpen;

    const M  = Array.from({length:n+1}, () => new Array(m+1).fill(NEG));
    const Ix = Array.from({length:n+1}, () => new Array(m+1).fill(NEG));
    const Iy = Array.from({length:n+1}, () => new Array(m+1).fill(NEG));
    M[0][0] = 0;
    for (let i = 1; i <= n; i++) Ix[i][0] = go + (i-1) * ge;
    for (let j = 1; j <= m; j++) Iy[0][j] = go + (j-1) * ge;

    for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
        const s = s1[i-1] === s2[j-1] ? match : mismatch;
        M[i][j]  = Math.max(M[i-1][j-1], Ix[i-1][j-1], Iy[i-1][j-1]) + s;
        Ix[i][j] = Math.max(M[i-1][j] + go, Ix[i-1][j] + ge);
        Iy[i][j] = Math.max(M[i][j-1] + go, Iy[i][j-1] + ge);
    }

    const score = Math.max(M[n][m], Ix[n][m], Iy[n][m]);
    let i = n, j = m, state = 'M';
    if (score === Ix[n][m] && score > M[n][m]) state = 'Ix';
    if (score === Iy[n][m] && score > M[n][m] && score > Ix[n][m]) state = 'Iy';

    const a1 = [], a2 = [], mid = [];
    while (i > 0 || j > 0) {
        if (state === 'M') {
            if (i > 0 && j > 0) {
                const s = s1[i-1] === s2[j-1] ? match : mismatch;
                a1.push(s1[i-1]); a2.push(s2[j-1]); mid.push(s1[i-1] === s2[j-1] ? '|' : '.');
                const prev = M[i][j] - s; i--; j--;
                if (prev === M[i][j]) state = 'M';
                else if (prev === Ix[i][j]) state = 'Ix';
                else if (prev === Iy[i][j]) state = 'Iy';
            } else if (i > 0) { a1.push(s1[i-1]); a2.push('-'); mid.push(' '); i--; }
            else { a1.push('-'); a2.push(s2[j-1]); mid.push(' '); j--; }
        } else if (state === 'Ix') {
            if (i === 0) { state = 'M'; continue; }
            a1.push(s1[i-1]); a2.push('-'); mid.push(' ');
            const cur = Ix[i][j]; i--;
            if (i >= 0 && cur === M[i][j] + go) state = 'M'; else state = 'Ix';
        } else {
            if (j === 0) { state = 'M'; continue; }
            a1.push('-'); a2.push(s2[j-1]); mid.push(' ');
            const cur = Iy[i][j]; j--;
            if (j >= 0 && cur === M[i][j] + go) state = 'M'; else state = 'Iy';
        }
    }

    const params = useAffine
        ? {match, mismatch, gapOpen: go, gapExtend: ge, mode:'affine'}
        : {match, mismatch, gapOpen: go, gapExtend: ge, mode:'linear'};
    return {score, aligned1: a1.reverse().join(''), aligned2: a2.reverse().join(''), mid: mid.reverse().join(''), params};
}