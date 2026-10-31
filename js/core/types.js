export function detectMoleculeType(seq) {
    if (!seq) return { type: null, reason: 'empty' };
    const c = {A:0,T:0,C:0,G:0,U:0,star:0}; const aa = 'ACDEFGHIKLMNPQRSTVWY'; let pc = 0;
    for (const ch of seq) {
        if (ch in c) c[ch]++;
        else if (aa.includes(ch)) pc++;
        if (ch === '*') c.star++;
    }
    const len = seq.length;
    const dnaR = (c.A+c.T+c.C+c.G)/len, rnaR = (c.A+c.U+c.C+c.G)/len, protR = pc/len;
    if (c.star > 0) return {type:'PROTEIN', reason:'توقف *'};
    if (rnaR > 0.9 && c.U > 0 && c.T === 0) return {type:'RNA', reason:'U بدون T'};
    if (dnaR > 0.9 && c.T > 0) return {type:'DNA', reason:'T حاضر'};
    if (protR > 0.9 && dnaR < 0.7) return {type:'PROTEIN', reason:'اسیدآمینه غالب'};
    const best = Math.max(dnaR, rnaR, protR);
    if (best < 0.7) return {type:'UNKNOWN', reason:'<70%'};
    if (dnaR === best) return {type:'DNA', reason:'best fit'};
    if (rnaR === best) return {type:'RNA', reason:'best fit'};
    return {type:'PROTEIN', reason:'best fit'};
}