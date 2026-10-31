import { IUPAC_DNA, IUPAC_RNA } from '../core/constants.js';
import { SETTINGS } from '../core/settings.js';

const PROTEIN_AA = new Set('ACDEFGHIKLMNPQRSTVWY'.split(''));
const PROTEIN_AMBIG = new Set('BZXJUO'.split(''));

export function analyzeRecord(rawSeq, header, startLine) {
    const result = {
        header, startLine,
        cleanedSeq: '',
        type: 'UNKNOWN',
        warnings: [],
        errors: [],
        iupacCodes: {},
        charCounts: {},
        gc: null,
        gcDenominator: null,
        gcExcluded: 0,
        length: 0,
        hasAmbiguity: false,
        hasStopCodon: false,
        invalidChars: [],
        isValid: false,
        firstInvalidPos: -1,
        headerValid: false,
        headerIssues: []
    };

    // ---- Header validation ----
    const h = (header || '').trim();
    if (!h) {
        result.headerIssues.push({severity: 'error', message: 'شناسه هدر خالی است.'});
    } else {
        const id = h.split(/\s+/)[0];
        if (/[<>{}[\]\\|]/.test(id)) {
            result.headerIssues.push({severity: 'error', message: 'هدر حاوی کاراکتر غیرمجاز.'});
        }
    }

    // ---- Clean sequence ----
    const cleaned = rawSeq
        .replace(/\r/g, '\n')
        .split('\n')
        .map(l => l.replace(/^\s*\d+\s*/, ''))
        .join('')
        .replace(/[\s\t]/g, '')
        .toUpperCase();

    result.cleanedSeq = cleaned;
    result.length = cleaned.length;

    if (!cleaned) {
        result.errors.push({severity: 'error', message: 'توالی خالی است.', position: 0, line: startLine});
        return result;
    }

    // ---- Character counting ----
    const charCounts = {};
    const invalidChars = [];
    let dnaCount = 0, rnaCount = 0, proteinCount = 0;
    let hasU = false, hasT = false, hasStar = false;

    for (let i = 0; i < cleaned.length; i++) {
        const ch = cleaned[i];
        charCounts[ch] = (charCounts[ch] || 0) + 1;

        if (IUPAC_DNA[ch]) dnaCount++;
        if (IUPAC_RNA[ch]) rnaCount++;
        if (PROTEIN_AA.has(ch) || PROTEIN_AMBIG.has(ch)) proteinCount++;
        if (ch === 'U') hasU = true;
        if (ch === 'T') hasT = true;
        if (ch === '*') {
            hasStar = true;
            proteinCount++;
        }

        const vD = IUPAC_DNA[ch];
        const vR = IUPAC_RNA[ch];
        const vP = PROTEIN_AA.has(ch) || PROTEIN_AMBIG.has(ch) || ch === '*';

        if (!vD && !vR && !vP) {
            invalidChars.push({char: ch, position: i});
            if (result.firstInvalidPos === -1) result.firstInvalidPos = i;
        }
    }

    result.charCounts = charCounts;
    result.invalidChars = invalidChars;

    // ---- Type detection ----
    const totalLen = cleaned.length;
    const dnaR = dnaCount / totalLen;
    const rnaR = rnaCount / totalLen;
    const protR = proteinCount / totalLen;

    if (hasStar) {
        result.type = 'PROTEIN';
        result.hasStopCodon = true;
    } else if (hasU && !hasT && rnaR > 0.9) {
        result.type = 'RNA';
    } else if (hasT && dnaR > 0.9) {
        result.type = 'DNA';
    } else if (protR > 0.95 && dnaR < 0.7) {
        result.type = 'PROTEIN';
    } else if (dnaR > 0.7) {
        result.type = 'DNA';
    } else if (rnaR > 0.7) {
        result.type = 'RNA';
    } else if (protR > 0.7) {
        result.type = 'PROTEIN';
    } else {
        result.type = 'UNKNOWN';
        result.errors.push({severity: 'error', message: 'نوع توالی قابل تشخیص نیست.'});
    }

    // ---- T/U mix warning ----
    if (hasU && hasT && SETTINGS.warnTU) {
        result.warnings.push({severity: 'warning', message: 'هم U و هم T.'});
    }

    // ---- IUPAC ambiguous codes ----
    if (result.type === 'DNA' || result.type === 'RNA') {
        const codes = result.type === 'DNA' ? IUPAC_DNA : IUPAC_RNA;
        const canonical = result.type === 'DNA' ? 'ATGC' : 'AUGC';
        for (const [ch, cnt] of Object.entries(charCounts)) {
            if (codes[ch] && !canonical.includes(ch)) {
                result.iupacCodes[ch] = {count: cnt};
            }
        }
        result.hasAmbiguity = Object.keys(result.iupacCodes).length > 0;
    }

    // ---- Invalid char errors ----
    if (invalidChars.length > 0) {
        const grouped = {};
        invalidChars.forEach(ic => {
            (grouped[ic.char] = grouped[ic.char] || []).push(ic.position);
        });
        for (const [ch, positions] of Object.entries(grouped)) {
            result.errors.push({
                severity: 'error',
                message: `"${ch}" در ${positions.length} موقعیت`,
                position: positions[0]
            });
        }
    }

    // ---- GC computation (FIXED: no double-counting of N) ----
    if (result.type === 'DNA' || result.type === 'RNA') {
        const g = charCounts['G'] || 0;
        const cCount = charCounts['C'] || 0;

        // ambCount already includes N and all IUPAC ambiguity codes
        const ambCount = Object.values(result.iupacCodes)
            .reduce((s, x) => s + x.count, 0);

        const gcDenom = totalLen - ambCount;   // FIX: subtract once

        result.gcDenominator = gcDenom;
        result.gcExcluded = ambCount;
        result.gc = gcDenom > 0 ? ((g + cCount) / gcDenom * 100) : null;

        if (gcDenom < totalLen) {
            result.warnings.push({
                severity: 'info',
                message: `GC بر مبنای ${gcDenom} باز معتبر (${ambCount} باز N/IUPAC حذف شد)`
            });
        }
    }

    // ---- Length and N-content warnings ----
    if (totalLen < 10) {
        result.warnings.push({severity: 'warning', message: `توالی کوتاه (${totalLen})`});
    }
    if ((charCounts['N'] || 0) / totalLen * 100 > SETTINGS.maxNPercent) {
        result.warnings.push({severity: 'warning', message: 'محتوای N بالا'});
    }

    result.isValid = result.errors.length === 0;
    result.headerValid = result.headerIssues.filter(x => x.severity === 'error').length === 0;

    return result;
}

export function validateFasta(rawText) {
    const t0 = performance.now();
    const report = {
        records: [],
        errors: [],
        summary: {
            totalRecords: 0,
            validRecords: 0,
            warningRecords: 0,
            errorRecords: 0,
            emptySequences: 0,
            invalidChars: 0,
            iupacCount: 0,
            duplicateIds: 0,
            duplicateSeqs: 0,
            dnaCount: 0,
            rnaCount: 0,
            proteinCount: 0,
            unknownCount: 0,
            totalBases: 0,
            avgLength: 0,
            avgGC: 0
        },
        duplicateIdList: [],
        duplicateSeqList: [],
        typeDistribution: {},
        elapsedMs: 0,
        fileSizeKB: (rawText.length / 1024).toFixed(2)
    };

    if (!rawText || !rawText.trim()) {
        report.errors.push({severity: 'error', message: 'ورودی خالی.'});
        report.elapsedMs = (performance.now() - t0).toFixed(2);
        return report;
    }

    const lines = rawText.split(/\r?\n/);
    let currHeader = null, currLine = 0, currParts = [];
    const hasHeader = lines.some(l => l.trim().startsWith('>'));

    if (!hasHeader) {
        const rec = analyzeRecord(lines.join(''), 'Raw_Sequence_NoHeader', 1);
        rec.headerIssues.push({severity: 'error', message: 'هدر FASTA یافت نشد'});
        rec.isValid = false;
        report.records.push(rec);
        report.errors.push({severity: 'error', message: 'ساختار FASTA نامعتبر — هدر وجود ندارد.'});
        report.summary.totalRecords = 1;
        report.summary.errorRecords = 1;
        report.summary.totalBases = rec.length;
        report.summary.avgLength = rec.length;
        report.elapsedMs = (performance.now() - t0).toFixed(2);
        return report;
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i], trimmed = line.trim();
        if (trimmed.startsWith('>')) {
            if (currHeader !== null) {
                report.records.push(analyzeRecord(currParts.join(''), currHeader, currLine));
            }
            currHeader = trimmed.substring(1).trim();
            currLine = i + 1;
            currParts = [];
        } else if (trimmed) {
            currParts.push(trimmed);
        }
    }
    if (currHeader !== null) {
        report.records.push(analyzeRecord(currParts.join(''), currHeader, currLine));
    }

    // Duplicate IDs
    const idMap = {};
    report.records.forEach((rec, idx) => {
        const id = (rec.header || '').split(/\s+/)[0];
        if (!id) return;
        (idMap[id] = idMap[id] || []).push(idx);
    });
    for (const [id, indices] of Object.entries(idMap)) {
        if (indices.length > 1) {
            report.duplicateIdList.push({id, indices, count: indices.length});
            report.summary.duplicateIds++;
            indices.forEach(i => report.records[i].warnings.push({
                severity: 'warning',
                message: `ID تکراری "${id}"`
            }));
        }
    }

    // Duplicate sequences (>=20bp only)
    const seqMap = {};
    report.records.forEach((rec, idx) => {
        const s = rec.cleanedSeq;
        if (!s || s.length < 20) return;
        (seqMap[s] = seqMap[s] || []).push(idx);
    });
    for (const [s, indices] of Object.entries(seqMap)) {
        if (indices.length > 1) {
            report.duplicateSeqList.push({
                hash: s.substring(0, 30) + '...',
                indices,
                count: indices.length,
                length: s.length
            });
            report.summary.duplicateSeqs++;
            indices.forEach(i => report.records[i].warnings.push({
                severity: 'warning',
                message: `توالی تکراری (${s.length} bp)`
            }));
        }
    }

    // Aggregate
    let totalGC = 0, gcCount = 0;
    report.records.forEach(rec => {
        report.summary.totalRecords++;
        if (rec.length === 0) report.summary.emptySequences++;
        report.summary.invalidChars += rec.invalidChars.length;
        if (rec.hasAmbiguity) report.summary.iupacCount++;
        report.summary.totalBases += rec.length;

        const hasErr = rec.errors.length > 0 || !rec.headerValid;
        const hasWarn = rec.warnings.length > 0 || rec.headerIssues.length > 0;

        if (hasErr) {
            report.summary.errorRecords++;
            rec.isValid = false;
        } else if (hasWarn) {
            report.summary.warningRecords++;
            rec.isValid = true;
        } else {
            report.summary.validRecords++;
            rec.isValid = true;
        }

        if (rec.type === 'DNA') report.summary.dnaCount++;
        else if (rec.type === 'RNA') report.summary.rnaCount++;
        else if (rec.type === 'PROTEIN') report.summary.proteinCount++;
        else report.summary.unknownCount++;

        report.typeDistribution[rec.type] = (report.typeDistribution[rec.type] || 0) + 1;

        if ((rec.type === 'DNA' || rec.type === 'RNA') && rec.gc !== null) {
            totalGC += rec.gc;
            gcCount++;
        }
    });

    report.summary.avgLength = report.summary.totalRecords > 0
        ? Math.round(report.summary.totalBases / report.summary.totalRecords)
        : 0;
    report.summary.avgGC = gcCount > 0 ? totalGC / gcCount : 0;
    report.elapsedMs = (performance.now() - t0).toFixed(2);

    return report;
}