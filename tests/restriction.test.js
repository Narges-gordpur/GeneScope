import { findRestrictionSites, digestLinear } from '../js/restriction/enzymes.js';
import { GENESCOPE } from '../js/core/state.js';

// Guard: ensures enzymes.json is loaded before tests run
const guardEnzymes = () => {
    if (!GENESCOPE.enzymes || !GENESCOPE.enzymes.EcoRI) {
        return {pass: false, detail: 'enzymes.json not loaded'};
    }
    return null;
};

export const testSuite = [
    {cat:'Restriction', name:'Enzymes loaded', fn:()=>{
        const n = Object.keys(GENESCOPE.enzymes || {}).length;
        return {
            pass: n >= 12,
            detail: `loaded=${n} enzymes`
        };
    }},

    {cat:'Restriction', name:'Two EcoRI sites', fn:()=>{
        const g = guardEnzymes(); if (g) return g;
        const s = 'AAAGAATTCAAAAAATGAATTCAAAAA';
        const count = findRestrictionSites(s, 'EcoRI').count;
        return {
            pass: count === 2,
            detail: `sites=${count}`
        };
    }},

    {cat:'Restriction', name:'Linear digest 3 fragments', fn:()=>{
        const g = guardEnzymes(); if (g) return g;
        const s = 'AAAGAATTCAAAAAATGAATTCAAAAA';
        const n = digestLinear(s, ['EcoRI']).fragmentCount;
        return {
            pass: n === 3,
            detail: `fragments=${n}`
        };
    }},

    {cat:'Restriction', name:'Sum of fragments = seq length', fn:()=>{
        const g = guardEnzymes(); if (g) return g;
        const s = 'AAAGAATTCAAAAAATGAATTCAAAAA';
        const d = digestLinear(s, ['EcoRI']);
        const total = d.fragments.reduce((a, b) => a + b.length, 0);
        return {
            pass: total === s.length,
            detail: `${total}/${s.length} bp`
        };
    }},

    {cat:'Restriction', name:'No site = 1 fragment', fn:()=>{
        const g = guardEnzymes(); if (g) return g;
        const n = digestLinear('AAAAAAAAAAAAAAAAA', ['EcoRI']).fragmentCount;
        return {
            pass: n === 1,
            detail: `fragments=${n}`
        };
    }},

    {cat:'Restriction', name:'12 enzymes defined', fn:()=>{
        const n = Object.keys(GENESCOPE.enzymes || {}).length;
        return {
            pass: n === 12,
            detail: `count=${n}`
        };
    }}
];