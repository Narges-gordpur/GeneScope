import { IUPAC_DNA } from '../core/constants.js';
import { detectMoleculeType } from '../core/types.js';
import { estimateTm } from './tm.js';
import { SETTINGS } from '../core/settings.js';

export function calculateStats(seq) {
    const c = {A:0,T:0,C:0,G:0,U:0};
    const amb = {};
    const invalid = [];
    let unamb = 0;
    for (const ch of seq) {
        if (ch in c) { c[ch]++; unamb++; }
        else if (ch in IUPAC_DNA) amb[ch] = (amb[ch]||0)+1;
        else if (ch !== '*') invalid.push(ch);
    }
    const Te = c.T + c.U;
    const denom = unamb;
    const gc = denom > 0 ? ((c.G + c.C) / denom * 100) : 0;
    let entropy = 0;
    if (denom > 0) for (const b of ['A','T','C','G','U']) if (c[b] > 0) { const p = c[b]/denom; entropy -= p * Math.log2(p); }
    const purines = c.A + c.G, pyrimidines = c.C + Te;
    const purineRatio = pyrimidines > 0 ? purines/pyrimidines : null;
    const gcSkew = (c.G + c.C) > 0 ? (c.G - c.C)/(c.G + c.C) : null;

    const type = detectMoleculeType(seq).type;
    let tmResult;
    if (type === 'DNA' || type === 'RNA') tmResult = estimateTm(seq);
    else tmResult = {tm:null, method:null, applicable:false, reason:`Tm فقط DNA/RNA (نوع: ${type || 'نامشخص'})`};
    const tm = tmResult.applicable ? tmResult.tm : null;

    const warnings = [];
    if (c.U > 0 && c.T > 0 && SETTINGS.warnTU) warnings.push('ترکیب T و U');
    if (invalid.length) warnings.push('نویسهٔ نامعتبر: ' + [...new Set(invalid)].join(','));
    if ((c.N || 0) / (seq.length || 1) * 100 > SETTINGS.maxNPercent) warnings.push('محتوای N بیش از ' + SETTINGS.maxNPercent + '%');
    if (type === 'PROTEIN') warnings.push('پروتئین — GC/Entropy/Tm معنی زیستی ندارند');
    if (type === 'UNKNOWN') warnings.push('نوع مولکول قابل تشخیص نیست');

    return { len: seq.length, effectiveLen: denom, A: c.A, T: Te, C: c.C, G: c.G, U: c.U,
        ambiguous: amb, invalid, gc, gcDenominator: denom, gcSkew, entropy, entropyMax: 2.0, purineRatio,
        tm, tmMethod: tmResult.method, tmAlt: tmResult.tmAlt || null, tmMethodAlt: tmResult.methodAlt || null,
        tmApplicable: tmResult.applicable, tmReason: tmResult.reason || null, tmDetails: tmResult.details || null,
        moleculeType: type, warnings };
}

export function calculateGRQS(stats) {
    if (stats.len === 0 || stats.effectiveLen === 0) {
        return {grqs: 0, tier: 'نامناسب', tierEn: 'Unfit', color: 'var(--rose)',
            components: {completeness:0, baseQuality:0, gcBalance:0, complexity:0},
            details: {effectiveLen:0, ambiguousCount:0, invalidCount:0, gc:0, entropy:0}};
    }
    const totalLen = stats.len, effectiveLen = stats.effectiveLen;
    const ambiguousCount = Object.values(stats.ambiguous).reduce((s, v) => s + v, 0);
    const invalidCount = stats.invalid.length;
    const gc = stats.gc, entropy = stats.entropy;
    const completenessScore = (effectiveLen / totalLen) * 100;
    const baseQualityScore = 100 * (1 - (ambiguousCount + invalidCount) / totalLen);
    const GC_MIN = SETTINGS.gcMin, GC_MAX = SETTINGS.gcMax;
    let gcBalanceScore;
    if (gc >= GC_MIN && gc <= GC_MAX) gcBalanceScore = 100;
    else if (gc < GC_MIN) gcBalanceScore = Math.max(0, 100 * (gc / GC_MIN));
    else gcBalanceScore = Math.max(0, 100 * (1 - (gc - GC_MAX) / (100 - GC_MAX)));
    const complexityScore = (entropy / 2.0) * 100;
    const grqsRaw = 0.25 * completenessScore + 0.25 * baseQualityScore + 0.25 * gcBalanceScore + 0.25 * complexityScore;
    const grqs = Math.min(100, Math.max(0, grqsRaw));
    let tier, tierEn, color;
    if (grqs >= 90) { tier='عالی'; tierEn='Excellent'; color='var(--emerald)'; }
    else if (grqs >= 75) { tier='خوب'; tierEn='Good'; color='#34D399'; }
    else if (grqs >= 60) { tier='متوسط'; tierEn='Fair'; color='var(--amber)'; }
    else if (grqs >= 40) { tier='ضعیف'; tierEn='Poor'; color='#F97316'; }
    else { tier='نامناسب'; tierEn='Unfit'; color='var(--rose)'; }
    return {grqs: Math.round(grqs*10)/10, tier, tierEn, color,
        components: {completeness: Math.round(completenessScore*10)/10, baseQuality: Math.round(baseQualityScore*10)/10,
            gcBalance: Math.round(gcBalanceScore*10)/10, complexity: Math.round(complexityScore*10)/10},
        details: {effectiveLen, ambiguousCount, invalidCount, gc: Math.round(gc*100)/100, entropy: Math.round(entropy*1000)/1000}};
}