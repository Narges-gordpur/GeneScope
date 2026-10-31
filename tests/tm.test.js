import { estimateTm, computeTmNearestNeighbor } from '../js/sequence/tm.js';

export const testSuite = [
    {cat:'Tm', name:'Tm for 15bp in physical range', fn:()=>{
        const r = estimateTm('ACGTACGTACGTACG');
        return {
            pass: r.applicable && r.tm > 20 && r.tm < 80,
            detail: `tm=${r.tm?.toFixed(1)}°C`
        };
    }},

    {cat:'Tm', name:'Tm for 40bp in physical range', fn:()=>{
        const r = estimateTm('ATGC'.repeat(10));
        return {
            pass: r.applicable && r.tm > 40 && r.tm < 90,
            detail: `tm=${r.tm?.toFixed(1)}°C`
        };
    }},

    {cat:'Tm', name:'Tm null for < 13bp', fn:()=>{
        const r = estimateTm('ATGCATGC');
        return {
            pass: r.tm === null && !r.applicable,
            detail: r.reason || 'n/a'
        };
    }},

    {cat:'Tm', name:'Tm null for IUPAC', fn:()=>{
        const r = estimateTm('ATGCRYSWKMATGC');
        return {
            pass: r.tm === null && r.reason?.includes('IUPAC'),
            detail: r.reason || 'n/a'
        };
    }},

    {cat:'Tm', name:'Tm null for T/U mix', fn:()=>{
        const r = estimateTm('ATGCUATGCATGC');
        return {
            pass: r.tm === null,
            detail: r.reason || 'n/a'
        };
    }},

    {cat:'Tm', name:'Tm null for protein', fn:()=>{
        const r = estimateTm('MKVLAAGIVGKVLLA');
        return {
            pass: r.tm === null,
            detail: r.reason || 'n/a'
        };
    }},

    {cat:'Tm', name:'NN units consistent', fn:()=>{
        const r = computeTmNearestNeighbor('ATGC'.repeat(5));
        return {
            pass: r.applicable && r.units?.R === 'kcal/(mol·K)',
            detail: r.units?.R || 'n/a'
        };
    }},

    {cat:'Tm', name:'T/U mix reason is specific', fn:()=>{
        const r = estimateTm('ATGCUATGCATGC');
        return {
            pass: r.tm === null && r.reason?.includes('T') && r.reason?.includes('U'),
            detail: r.reason || 'n/a'
        };
    }},

    {cat:'Tm', name:'Protein reason is specific', fn:()=>{
        const r = estimateTm('MKVLAAGIVGKVLLA');
        return {
            pass: r.tm === null
                && (r.reason?.includes('پروتئین') || r.reason?.toLowerCase().includes('protein')),
            detail: r.reason || 'n/a'
        };
    }}
];