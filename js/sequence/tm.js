import { NN_PARAMS } from '../core/constants.js';

// ============================================================
// FIX #1: Tm with consistent units — ΔH kcal/mol, ΔS kcal/(mol·K)
// R = 0.001987 kcal/(mol·K)
// ============================================================
export function computeTmNearestNeighbor(seq, opts = {}) {
    const {
        naConc = 0.05,
        primerConc = 0.25e-6,
        mgConc = 0,
        dntpConc = 0,
        useSaltCorrection = true
    } = opts;

    const cleanSeq = seq.replace(/[^ATGC]/g, '');
    if (cleanSeq.length < 2) {
        return {applicable: false, reason: 'طول کمتر از ۲ باز'};
    }
    if (cleanSeq.length > 1000) {
        return {applicable: false, reason: 'بیش از ۱۰۰۰ bp'};
    }

    // Accumulate NN contributions
    let dh = 0;   // kcal/mol
    let ds = 0;   // cal/(mol·K)

    for (let i = 0; i < cleanSeq.length - 1; i++) {
        const d = cleanSeq.substring(i, i + 2);
        if (NN_PARAMS[d]) {
            dh += NN_PARAMS[d][0];
            ds += NN_PARAMS[d][1];
        }
    }

    // Terminal initiations (only for oligos ≤ 30 nt)
    if (cleanSeq.length <= 30) {
        const f = cleanSeq[0];
        const l = cleanSeq[cleanSeq.length - 1];
        if (f === 'A' || f === 'T') { dh += 2.3; ds += 4.1; }
        else { dh += 0.1; ds += -2.8; }
        if (l === 'A' || l === 'T') { dh += 2.3; ds += 4.1; }
        else { dh += 0.1; ds += -2.8; }
    }

    // Salt correction
    const N = cleanSeq.length;
    if (useSaltCorrection && N > 1) {
        const mono = naConc + 120 * Math.sqrt(Math.max(0, mgConc - dntpConc));
        ds += 0.368 * (N - 1) * Math.log(Math.max(mono, 1e-6));
    }

    // Unit alignment: work in kcal
    const dh_kcal = dh;            // already kcal/mol
    const ds_kcal = ds / 1000;     // cal -> kcal
    const R_kcal  = 0.001987;      // kcal/(mol·K)

    const CT = primerConc;
    const denom = ds_kcal + R_kcal * Math.log(CT / 4);

    if (denom >= 0) {
        return {
            applicable: false,
            reason: 'مخرج غیرمنفی — پارامترها نامعتبر',
            details: {dh, ds, denom}
        };
    }

    const tmK = dh_kcal / denom;
    const tmC = tmK - 273.15;

    if (!isFinite(tmC) || tmC < -50 || tmC > 150) {
        return {
            applicable: false,
            reason: 'خارج از بازه فیزیکی',
            rawValue: tmC
        };
    }

    return {
        tm: tmC,
        dh: dh_kcal,
        ds: ds_kcal,
        method: 'Nearest-Neighbor (SantaLucia 1998)',
        naConc: naConc * 1000,
        primerConc: primerConc * 1e6,
        seqLength: N,
        applicable: true,
        units: {
            dh: 'kcal/mol',
            ds: 'kcal/(mol·K)',
            R: 'kcal/(mol·K)'
        }
    };
}

// ============================================================
// FIX #4: Strict type & alphabet validation before Tm computation
// - T/U mix checked FIRST (before alphabet validation)
// - Protein detection before IUPAC check (since M,K,R,Y,S,W,B,D,H,V are shared)
// ============================================================
export function estimateTm(seq) {
    const s = seq.toUpperCase();

    // ---- CHECK 1: T/U mix (must be first) ----
    if (/U/.test(s) && /T/.test(s)) {
        return {
            tm: null, method: null, applicable: false,
            reason: 'مخلوط T و U — Tm محاسبه نمی‌شود'
        };
    }

    const validDNA = /^[ATGC]+$/.test(s);
    const validRNA = /^[AUGC]+$/.test(s);

    if (!validDNA && !validRNA) {
        // ---- CHECK 2: Protein detection (before IUPAC) ----
        // Letters that ONLY appear in proteins (not in DNA/RNA IUPAC)
        const aaOnlyChars = s.match(/[EFILPQZ]/g);
        if (aaOnlyChars && aaOnlyChars.length > 0) {
            return {
                tm: null, method: null, applicable: false,
                reason: 'توالی پروتئینی — Tm معنی زیستی ندارد'
            };
        }

        // ---- CHECK 3: IUPAC ambiguity ----
        const ambig = s.match(/[NRYSWKMBDHV]/g);
        if (ambig && ambig.length) {
            return {
                tm: null, method: null, applicable: false,
                reason: 'توالی حاوی IUPAC مبهم — Tm محاسبه نمی‌شود'
            };
        }

        // ---- CHECK 4: Invalid characters ----
        const invalid = s.match(/[^ATGCU]/g);
        if (invalid && invalid.length) {
            const u = [...new Set(invalid)].join(', ');
            return {
                tm: null, method: null, applicable: false,
                reason: `کاراکتر غیرمجاز (${u})`
            };
        }

        return {
            tm: null, method: null, applicable: false,
            reason: 'نوع مولکول پشتیبانی نمی‌شود'
        };
    }

    // ---- Valid DNA or RNA ----
    const dnaEq = /U/.test(s) ? s.replace(/U/g, 'T') : s;
    const len = dnaEq.length;

    if (len < 13) {
        return {
            tm: null, method: null, applicable: false,
            reason: 'طول کمتر از ۱۳ bp'
        };
    }
    if (len > 1000) {
        return {
            tm: null, method: null, applicable: false,
            reason: 'بیش از ۱۰۰۰ bp'
        };
    }

    const nn = computeTmNearestNeighbor(dnaEq);
    if (!nn.applicable) return nn;

    if (len <= 50) {
        const gc = (dnaEq.match(/[GC]/g) || []).length;
        const cm = 64.9 + 41 * (gc - 16.4) / len;
        return {
            tm: nn.tm,
            tmAlt: cm,
            method: nn.method,
            methodAlt: 'Chester-Marshak',
            applicable: true,
            seqLength: len,
            details: nn
        };
    }

    return {
        tm: nn.tm,
        method: nn.method,
        applicable: true,
        seqLength: len,
        details: nn
    };
}