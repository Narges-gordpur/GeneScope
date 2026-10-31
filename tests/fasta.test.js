import { validateFasta } from '../js/fasta/fasta-engine.js';

export const testSuite = [
    {cat:'FASTA', name:'Valid DNA record', fn:()=>{
        const r = validateFasta('>s1\nATGCGTACGTAGCTAGCTAGCTAGC');
        const rec = r.records[0];
        return {
            pass: rec?.type === 'DNA' && rec?.isValid,
            detail: `type=${rec?.type} valid=${rec?.isValid}`
        };
    }},

    {cat:'FASTA', name:'No header = error', fn:()=>{
        const r = validateFasta('ATGCGTACGT');
        return {
            pass: r.errors.length >= 1,
            detail: `errors=${r.errors.length}`
        };
    }},

    {cat:'FASTA', name:'Invalid chars detected', fn:()=>{
        const r = validateFasta('>s4\nATGC123ZZZ');
        const inv = r.records[0].invalidChars.length;
        return {
            pass: inv >= 3,
            detail: `invalid=${inv}`
        };
    }},

    {cat:'FASTA', name:'Duplicate IDs', fn:()=>{
        const r = validateFasta('>d\nATGCGTACGT\n>d\nGCGCGCATAT');
        return {
            pass: r.summary.duplicateIds === 1,
            detail: `dups=${r.summary.duplicateIds}`
        };
    }},

    {cat:'FASTA', name:'RNA detection', fn:()=>{
        const r = validateFasta('>r\nAUGGAUUUAUCUGCUCUUCGCGUUGAAGAAGUACAAAAUGUCAUUAAUGC');
        return {
            pass: r.records[0].type === 'RNA',
            detail: `type=${r.records[0].type}`
        };
    }},

    {cat:'FASTA', name:'IUPAC codes detected', fn:()=>{
        const r = validateFasta('>i\nATGCRYSWKMBDHVNATGCGTACGTAGCT');
        return {
            pass: r.records[0].hasAmbiguity,
            detail: `ambiguity=${r.records[0].hasAmbiguity}`
        };
    }},

    {cat:'FASTA', name:'Transparent GC denominator', fn:()=>{
        // ATGC + NNNN + ATGC = 12 total, 4 ambiguous (N)
        // → denom should be 8, excluded should be 4
        const r = validateFasta('>g\nATGCNNNNATGC');
        const rec = r.records[0];
        return {
            pass: rec.gcDenominator === 8 && rec.gcExcluded === 4,
            detail: `denom=${rec.gcDenominator} excl=${rec.gcExcluded}`
        };
    }},

    {cat:'FASTA', name:'CRLF handling', fn:()=>{
        const r = validateFasta('>s1\r\nATGCGT\r\n>s2\r\nGCGCGC');
        return {
            pass: r.summary.totalRecords === 2,
            detail: `records=${r.summary.totalRecords}`
        };
    }},

    {cat:'FASTA', name:'Protein with * detected', fn:()=>{
        const r = validateFasta('>p\nMKVLAAGIVG*');
        const rec = r.records[0];
        return {
            pass: rec?.type === 'PROTEIN' && rec?.hasStopCodon === true,
            detail: `type=${rec?.type} stop=${rec?.hasStopCodon}`
        };
    }},

    {cat:'FASTA', name:'GC without ambiguity is exact', fn:()=>{
        // ATGCATGC → exactly 50% GC, denom=8
        const r = validateFasta('>x\nATGCATGC');
        const rec = r.records[0];
        return {
            pass: Math.abs(rec.gc - 50) < 0.01 && rec.gcDenominator === 8,
            detail: `gc=${rec.gc?.toFixed(1)}% denom=${rec.gcDenominator}`
        };
    }}
];