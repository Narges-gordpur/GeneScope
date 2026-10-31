import { findORFs } from '../js/orf/orf.js';

export const testSuite = [
    {cat:'ORF', name:'Forward ORF 1-based inclusive', fn:()=>{
        const seq = 'ATG' + 'AAA'.repeat(10) + 'TAA';
        const orfs = findORFs(seq, {minLen:30, includeReverse:false, tableId:'1'});
        return {
            pass: orfs.length === 1
                && orfs[0].start === 1
                && orfs[0].end === 36
                && orfs[0].length === 36,
            detail: `start=${orfs[0]?.start} end=${orfs[0]?.end} len=${orfs[0]?.length}`
        };
    }},

    {cat:'ORF', name:'Reverse ORF coordinates valid', fn:()=>{
        const rc = 'TTA' + 'TTT'.repeat(10) + 'CAT';
        const orfs = findORFs(rc, {minLen:30, includeReverse:true, tableId:'1'});
        const rev = orfs.filter(o => o.strand === '-');
        if (!rev.length) return {pass:false, detail:'no reverse ORF found'};
        const o = rev[0];
        return {
            pass: o.start >= 1
                && o.end <= rc.length
                && (o.end - o.start + 1) === o.length,
            detail: `${o.start}-${o.end} len=${o.length}`
        };
    }},

    {cat:'ORF', name:'Min length filter', fn:()=>{
        const seq = 'ATG' + 'AAA'.repeat(10) + 'TAA';
        const orfs = findORFs(seq, {minLen:100, includeReverse:false, tableId:'1'});
        return {
            pass: orfs.length === 0,
            detail: `filtered count=${orfs.length}`
        };
    }},

    {cat:'ORF', name:'Table 2 stop codon AGA', fn:()=>{
        const seq = 'ATG' + 'AAA'.repeat(10) + 'AGA';
        const orfs2 = findORFs(seq, {minLen:30, includeReverse:false, tableId:'2'});
        const orfs1 = findORFs(seq, {minLen:30, includeReverse:false, tableId:'1'});
        return {
            pass: orfs2.length > 0 && orfs1.length === 0,
            detail: `T2=${orfs2.length} T1=${orfs1.length}`
        };
    }},

    {cat:'ORF', name:'Round-trip ORF minus strand', fn:()=>{
        const rc = 'TTA' + 'TTT'.repeat(10) + 'CAT';
        const orfs = findORFs(rc, {minLen:30, includeReverse:true, tableId:'1'});
        const rev = orfs.filter(o => o.strand === '-');
        return {
            pass: rev.length === 1
                && rev[0].length === 36
                && rev[0].protein.startsWith('MK'),
            detail: `n=${rev.length} len=${rev[0]?.length} prefix=${rev[0]?.protein?.substring(0,3)}`
        };
    }}
];