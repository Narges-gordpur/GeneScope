import { STOP_CODONS_BY_TABLE } from '../core/codon-tables.js';
import { getTranslation, computeMolecularWeight, computeIsoelectricPoint, computeGRAVY, computeCAI } from '../sequence/translation.js';
import { getReverseComplement } from '../core/utils.js';
import { SETTINGS } from '../core/settings.js';

export function getCurrentGeneticCode() {
    return document.getElementById('geneticCodeSelect')?.value || SETTINGS.geneticCode || '1';
}

// FIX #2: 1-based inclusive coords (GFF3 standard)
// FIX #5: table-aware stop codons
export function findORFs(seq, opts = {}) {
    const {
        minLen = SETTINGS.minORFLen,
        includeReverse = SETTINGS.includeReverseORF,
        startCodons = ['ATG'],
        tableId = getCurrentGeneticCode()
    } = opts;

    const stopCodons = STOP_CODONS_BY_TABLE[tableId] || ['TAA','TAG','TGA'];
    const hits = [];

    const scan = (strandSeq, strand) => {
        for (let frame = 0; frame < 3; frame++) {
            let start0 = -1;
            for (let i0 = frame; i0 + 3 <= strandSeq.length; i0 += 3) {
                const codon = strandSeq.substring(i0, i0 + 3);
                if (start0 === -1 && startCodons.includes(codon)) {
                    start0 = i0;
                } else if (start0 !== -1 && stopCodons.includes(codon)) {
                    const endEx = i0 + 3;
                    const len = endEx - start0;
                    if (len >= minLen) {
                        hits.push({ strand, frame: frame + 1, startInStrand: start0 + 1, endInStrand: endEx, length: len });
                    }
                    start0 = -1;
                }
            }
        }
    };

    scan(seq, '+');
    for (const h of hits) { h.start = h.startInStrand; h.end = h.endInStrand; delete h.startInStrand; delete h.endInStrand; }

    if (includeReverse) {
        const rc = getReverseComplement(seq);
        const before = hits.length;
        scan(rc, '-');
        for (let k = before; k < hits.length; k++) {
            const r = hits[k];
            const origStart = seq.length - r.endInStrand + 1;
            const origEnd   = seq.length - r.startInStrand + 1;
            r.start = Math.min(origStart, origEnd);
            r.end   = Math.max(origStart, origEnd);
            delete r.startInStrand; delete r.endInStrand;
        }
    }

    for (const h of hits) {
        let sub;
        if (h.strand === '+') sub = seq.substring(h.start - 1, h.end);
        else { const fwd = seq.substring(h.start - 1, h.end); sub = getReverseComplement(fwd); }
        const { protein } = getTranslation(sub, 0, tableId);
        const trimmed = protein.replace(/\*$/, '');
        h.protein = trimmed;
        h.aaLength = trimmed.length;
        h.molWeight = computeMolecularWeight(trimmed);
        h.pI = computeIsoelectricPoint(trimmed);
        h.gravy = computeGRAVY(trimmed);
        h.cai = computeCAI(sub);
    }

    return hits.sort((a, b) => b.length - a.length);
}