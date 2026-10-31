import { AA_MASS, WATER_MASS, KD_HYDRO, PKA, HUMAN_CODON_FREQ, AA_MAX_CODON_FREQ } from '../core/constants.js';
import { CODON_TABLES } from '../core/codon-tables.js';
import { getReverseComplement } from '../core/utils.js';

export function getTranslation(seq, frame, tableId) {
    const table = CODON_TABLES[tableId || '1'];
    let protein = '';
    for (let i = frame; i + 3 <= seq.length; i += 3) {
        const codon = seq.substring(i, i+3);
        if (!/^[ACGTU]{3}$/.test(codon)) { protein += 'X'; continue; }
        const aa = table[codon.replace(/U/g,'T')];
        protein += (aa === undefined) ? 'X' : aa;
    }
    return { protein };
}

export function getCodonSplit(seq) {
    const arr = [];
    for (let i = 0; i+3 <= seq.length; i += 3) arr.push(seq.substring(i, i+3));
    return arr.join(' · ');
}

export function getSixFrameTranslation(seq, tableId) {
    const rc = getReverseComplement(seq);
    const out = [];
    for (let f = 0; f < 3; f++) out.push({frame:`+${f+1}`, strand:'+', protein:getTranslation(seq, f, tableId).protein});
    for (let f = 0; f < 3; f++) out.push({frame:`-${f+1}`, strand:'-', protein:getTranslation(rc, f, tableId).protein});
    return out;
}

export function computeMolecularWeight(protein) {
    let mass = WATER_MASS;
    for (const aa of protein) if (AA_MASS[aa]) mass += AA_MASS[aa];
    return mass;
}

export function computeIsoelectricPoint(protein) {
    const counts = {D:0,E:0,C:0,Y:0,H:0,K:0,R:0};
    let valid = 0;
    for (const aa of protein) {
        if (aa in counts) counts[aa]++;
        if ('ACDEFGHIKLMNPQRSTVWY'.includes(aa)) valid++;
    }
    if (valid === 0) return null;
    function netCharge(pH) {
        let neg = 1/(1+Math.pow(10, PKA.Cterm - pH));
        neg += counts.D/(1+Math.pow(10, PKA.D - pH));
        neg += counts.E/(1+Math.pow(10, PKA.E - pH));
        neg += counts.C/(1+Math.pow(10, PKA.C - pH));
        neg += counts.Y/(1+Math.pow(10, PKA.Y - pH));
        let pos = 1/(1+Math.pow(10, pH - PKA.Nterm));
        pos += counts.K/(1+Math.pow(10, pH - PKA.K));
        pos += counts.R/(1+Math.pow(10, pH - PKA.R));
        pos += counts.H/(1+Math.pow(10, pH - PKA.H));
        return pos - neg;
    }
    let lo = 0, hi = 14;
    for (let i = 0; i < 60; i++) { const mid = (lo+hi)/2; if (netCharge(mid) > 0) lo = mid; else hi = mid; }
    return (lo+hi)/2;
}

export function computeGRAVY(protein) {
    let sum = 0, n = 0;
    for (const aa of protein) if (KD_HYDRO[aa] !== undefined) { sum += KD_HYDRO[aa]; n++; }
    return n > 0 ? sum/n : null;
}

export function computeCAI(seq) {
    let logSum = 0, count = 0;
    for (let i = 0; i+3 <= seq.length; i += 3) {
        const codon = seq.substring(i, i+3).replace(/U/g, 'T');
        const aa = CODON_TABLES['1'][codon];
        if (!aa || aa === '*' || aa === 'X') continue;
        const freq = HUMAN_CODON_FREQ[codon], maxFreq = AA_MAX_CODON_FREQ[aa];
        if (freq && maxFreq) { const w = freq/maxFreq; if (w > 0) { logSum += Math.log(w); count++; } }
    }
    return count === 0 ? null : Math.exp(logSum/count);
}