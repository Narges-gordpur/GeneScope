import { GENESCOPE } from './state.js';

export const CODON_TABLES = {};
export const STOP_CODONS_BY_TABLE = {};

export async function loadCodonTables() {
    const res = await fetch('data/codons.json');
    if (!res.ok) throw new Error('Failed to load codons.json: ' + res.status);
    const data = await res.json();
    for (const [id, table] of Object.entries(data.tables)) CODON_TABLES[id] = table;
    for (const [id, stops] of Object.entries(data.stopCodons)) STOP_CODONS_BY_TABLE[id] = stops;
    GENESCOPE.codonTables = CODON_TABLES;
    GENESCOPE.stopCodons = STOP_CODONS_BY_TABLE;
}