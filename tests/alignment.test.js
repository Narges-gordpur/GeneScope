import { needlemanWunsch } from '../js/alignment/needleman-wunsch.js';
import { smithWaterman } from '../js/alignment/smith-waterman.js';

export const testSuite = [
    {cat:'Alignment', name:'NW identical (linear)', fn:()=>{
        const r = needlemanWunsch('ATGC', 'ATGC', {
            useAffine:false, match:1, mismatch:-1, gapOpen:-2
        });
        return {
            pass: r.score === 4,
            detail: `score=${r.score} (expected 4)`
        };
    }},

    {cat:'Alignment', name:'NW linear gap k=3 costs 6', fn:()=>{
        // 1 match (+1) + 3 gap positions (-2 each) = -5
        const r = needlemanWunsch('AAAA', 'A', {
            useAffine:false, match:1, mismatch:-1, gapOpen:-2
        });
        return {
            pass: r.score === -5,
            detail: `score=${r.score} (expected -5)`
        };
    }},

    {cat:'Alignment', name:'SW identical local', fn:()=>{
        const r = smithWaterman('ATGC', 'ATGC', {useAffine:false});
        return {
            pass: r.score === 8,
            detail: `score=${r.score} (expected 8)`
        };
    }},

    {cat:'Alignment', name:'NW linear mode flag', fn:()=>{
        const r = needlemanWunsch('ATGC', 'ATGC', {useAffine:false});
        return {
            pass: r.params.mode === 'linear',
            detail: r.params.mode
        };
    }},

    {cat:'Alignment', name:'NW affine mode flag', fn:()=>{
        const r = needlemanWunsch('ATGC', 'ATGC', {useAffine:true});
        return {
            pass: r.params.mode === 'affine',
            detail: r.params.mode
        };
    }},

    {cat:'Alignment', name:'NW affine gap k=3 costs 3', fn:()=>{
        // match +1 + gapOpen -2 + 2×gapExtend -1 = -3
        const r = needlemanWunsch('AAAA', 'A', {
            useAffine:true, match:1, mismatch:-1, gapOpen:-2, gapExtend:-1
        });
        return {
            pass: r.score === -3,
            detail: `score=${r.score} (expected -3)`
        };
    }}
];