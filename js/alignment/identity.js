export function computeAlignmentIdentity(r) {
    let id = 0, total = 0;
    for (let i = 0; i < r.mid.length; i++) {
        if (r.mid[i] === '|') id++;
        if (r.aligned1[i] !== '-' && r.aligned2[i] !== '-') total++;
    }
    return total > 0 ? id/total : 0;
}