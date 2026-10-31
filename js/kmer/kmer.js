import { UNAMBIGUOUS_DNA } from '../core/constants.js';

export function computeKmerFrequencies(seq, k) {
    if (!Number.isInteger(k) || k < 1 || k > 12) throw new Error('k must be in [1,12]');
    if (k > seq.length) return {k, counts:{}, sorted:[], total:0, uniqueCount:0};
    const counts = {};
    let total = 0;
    for (let i = 0; i + k <= seq.length; i++) {
        const w = seq.substring(i, i+k);
        if (![...w].every(c => UNAMBIGUOUS_DNA.has(c))) continue;
        counts[w] = (counts[w] || 0) + 1;
        total++;
    }
    const sorted = Object.entries(counts).sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0]));
    return {k, counts, sorted, total, uniqueCount: sorted.length};
}