import { GENESCOPE } from '../core/state.js';

export async function loadEnzymes() {
    const res = await fetch('data/enzymes.json');
    if (!res.ok) throw new Error('Failed to load enzymes.json: ' + res.status);
    GENESCOPE.enzymes = await res.json();
    return GENESCOPE.enzymes;
}

export function findRestrictionSites(seq, enzymeName) {
    const def = GENESCOPE.enzymes[enzymeName];
    if (!def) return {enzyme: enzymeName, supported: false, sites: []};
    const {site, cut} = def;
    const sites = [];
    for (let i = 0; i + site.length <= seq.length; i++)
        if (seq.substring(i, i+site.length) === site)
            sites.push({recognitionStart: i+1, cutTop: i+cut+1});
    return {enzyme: enzymeName, supported: true, site, cutOffset: cut, sites, count: sites.length};
}

export function digestLinear(seq, enzymeNames) {
    const cuts = new Set([0, seq.length]);
    const perEnzyme = {};
    enzymeNames.forEach(name => {
        const r = findRestrictionSites(seq, name);
        perEnzyme[name] = r;
        if (r.supported) r.sites.forEach(s => cuts.add(Math.max(0, Math.min(seq.length, s.cutTop - 1))));
    });
    const sorted = [...cuts].sort((a, b) => a-b);
    const fragments = [];
    for (let i = 0; i < sorted.length - 1; i++)
        if (sorted[i+1] > sorted[i]) fragments.push({length: sorted[i+1]-sorted[i]});
    return {fragments, fragmentCount: fragments.length, perEnzyme};
}