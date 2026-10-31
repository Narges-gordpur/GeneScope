import { GENESCOPE } from '../core/state.js';
import { SETTINGS } from '../core/settings.js';
import { showToast, downloadBlob } from '../core/utils.js';
import { calculateStats, calculateGRQS } from '../sequence/stats.js';
import { findORFs } from '../orf/orf.js';
import { computeCpGObsExp, detectCpGIslands } from '../kmer/cpg.js';
import { findRestrictionSites } from '../restriction/enzymes.js';

// ============================================================
// ⭐ NEW: جمع‌آوری موقعیت‌های برش همه آنزیم‌ها
// ============================================================
function collectAllRestrictionSites(seq) {
    const result = {};
    if (!GENESCOPE.enzymes || !seq) return result;

    for (const enzymeName of Object.keys(GENESCOPE.enzymes)) {
        const sites = findRestrictionSites(seq, enzymeName);
        result[enzymeName] = sites.sites.map(s => s.cutTop);
    }
    return result;
}

export function exportAnalysisJSON() {
    if (!GENESCOPE.currentSeq) {
        showToast('ابتدا تحلیل کنید.');
        return;
    }

    const stats = calculateStats(GENESCOPE.currentSeq);
    const oe = computeCpGObsExp(GENESCOPE.currentSeq);
    const islands = detectCpGIslands(GENESCOPE.currentSeq);
    const orfs = findORFs(GENESCOPE.currentSeq);
    const grqs = calculateGRQS(stats);

    // ⭐ NEW: محاسبه restriction sites
    const restrictionSites = collectAllRestrictionSites(GENESCOPE.currentSeq);

    const payload = {
        schemaVersion: '11.1',
        generatedAt: new Date().toISOString(),
        software: 'GeneScope Pro v11.1',
        moleculeType: GENESCOPE.currentType,
        sample: GENESCOPE.sampleMeta || 'user-provided',

        settings: {
            geneticCode: SETTINGS.geneticCode,
            minORFLen: SETTINGS.minORFLen,
            gcRange: [SETTINGS.gcMin, SETTINGS.gcMax],
        },

        sequence: {
            length: stats.len,
            effectiveLength: stats.effectiveLen,
            baseCounts: {
                A: stats.A,
                T: stats.T,
                C: stats.C,
                G: stats.G,
            },
        },

        statistics: {
            gc: parseFloat(stats.gc.toFixed(4)),
            gcDenominator: stats.gcDenominator,
            gcSkew: stats.gcSkew,
            entropy: parseFloat(stats.entropy.toFixed(4)),
            tm: stats.tm,
            tmApplicable: stats.tmApplicable,
            tmReason: stats.tmReason,
            tmMethod: stats.tmMethod,
        },

        grqs: {
            score: grqs.grqs,
            tier: grqs.tier,
            tierEn: grqs.tierEn,
            components: grqs.components,
        },

        cpg: {
            totalCount: oe.obs,
            obsExpRatio: oe.ratio,
            islandsDetected: islands.length,
        },

        orfs: orfs.slice(0, 50).map(o => ({
            strand: o.strand,
            frame: o.frame,
            start: o.start,
            end: o.end,
            length: o.length,
            aa: o.aaLength,
        })),

        // ⭐ NEW: فیلد restriction_sites
        restriction_sites: restrictionSites,

        warnings: stats.warnings,

        limitations: {
            tmUnits: 'kcal/mol, kcal/(mol·K), R=0.001987',
            saltCondition: '50mM Na+, 0mM Mg2+, 0.25µM primer',
            orfCoords: '1-based inclusive (GFF3-compatible)',
            gapMode: 'Linear: k×gapOpen | Affine: gapOpen+(k−1)×gapExtend',
        },
    };

    downloadBlob(
        JSON.stringify(payload, null, 2),
        'GeneScope_Report_' + Date.now() + '.json',
        'application/json'
    );
    showToast('JSON صادر شد.');
}

export function exportORFFasta() {
    const seq = GENESCOPE.currentSeq;
    if (!seq) {
        showToast('ابتدا توالی وارد کنید.');
        return;
    }
    const minLen = parseInt(document.getElementById('orfMinLen')?.value || SETTINGS.minORFLen, 10);
    const orfs = findORFs(seq, {
        minLen,
        includeReverse: SETTINGS.includeReverseORF,
    });

    if (!orfs.length) {
        showToast('هیچ ORF یافت نشد.');
        return;
    }

    let fasta = '';
    orfs.forEach((o, i) => {
        fasta += `>ORF${i+1}_strand${o.strand}_frame${o.frame}_${o.start}-${o.end}\n${o.protein}\n`;
    });

    downloadBlob(
        fasta,
        'GeneScope_ORFs_' + Date.now() + '.fasta',
        'text/plain'
    );
    showToast(orfs.length + ' پپتید FASTA صادر شد.');
}

export function exportORFGFF() {
    const seq = GENESCOPE.currentSeq;
    if (!seq) {
        showToast('ابتدا توالی وارد کنید.');
        return;
    }
    const minLen = parseInt(document.getElementById('orfMinLen')?.value || SETTINGS.minORFLen, 10);
    const orfs = findORFs(seq, {
        minLen,
        includeReverse: SETTINGS.includeReverseORF,
    });

    if (!orfs.length) {
        showToast('هیچ ORF یافت نشد.');
        return;
    }

    let gff = '##gff-version 3\n##sequence-region seq1 1 ' + seq.length + '\n';
    orfs.forEach((o, i) => {
        gff += `seq1\tGeneScope\tORF\t${o.start}\t${o.end}\t.\t${o.strand}\t.\tID=ORF${i+1};frame=${o.frame};length=${o.length}\n`;
    });

    downloadBlob(
        gff,
        'GeneScope_ORFs_' + Date.now() + '.gff3',
        'text/plain'
    );
    showToast('GFF3 صادر شد.');
}