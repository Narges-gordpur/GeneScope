
# GeneScope: Scientific Methodology and Validation Plan

## 1. Introduction

GeneScope is designed to provide a unified environment for basic biological sequence analysis. Its intended functions include sequence validation, nucleotide statistics, k-mer analysis, ORF detection, sequence translation, sequence comparison, CpG analysis, and restriction-site mapping.

This document defines methodological principles and validation requirements for these functions. It distinguishes general scientific definitions from implementation details that must be verified in the current source code.

The purpose of this document is to improve transparency, reproducibility, and algorithmic reliability.

## 2. General Analysis Workflow

A reproducible analysis should follow these steps:

1. Read the input and preserve the original text for error reporting.
2. Parse FASTA records and retain sequence identifiers and headers.
3. Validate record structure and sequence characters.
4. Determine or verify the sequence type.
5. Apply the selected analysis algorithm and its parameters.
6. Return results with relevant warnings.
7. Record the parameters and software version where available.

Input normalization should be documented. For example, converting lowercase nucleotide characters to uppercase may be appropriate, but silently deleting invalid characters can alter the sequence and produce misleading results.

## 3. FASTA Parsing and Validation

### 3.1 FASTA Structure

A FASTA record normally consists of a header beginning with `>` followed by one or more sequence lines.

A Multi-FASTA file contains multiple records.

The parser should distinguish between:

- Missing headers.
- Empty headers.
- Empty sequences.
- Malformed records.
- Invalid sequence characters.
- Duplicate identifiers.
- Duplicate sequence content.

### 3.2 Sequence Types

DNA, RNA, and protein sequences require different validation rules.

The accepted alphabet should be defined explicitly for each sequence type. Nucleotide ambiguity symbols should be handled according to the applicable IUPAC conventions.

The validator should not silently interpret an invalid DNA character as a valid nucleotide or treat a protein sequence as DNA without an explicit rule.

### 3.3 Errors and Warnings

Validation output should distinguish between errors and warnings.

An error indicates that the input does not meet a requirement for the selected operation. A warning identifies a condition that may affect interpretation but does not necessarily prevent processing.

Where possible, diagnostic messages should include the sequence identifier and line or character position.

## 4. Sequence Statistics

### 4.1 Sequence Length

Sequence length should be calculated using a clearly defined representation of the sequence. If normalization is performed, the normalization procedure should be documented.

### 4.2 Nucleotide Composition

For nucleotide sequences, the implementation may report counts of A, C, G, and T or U, depending on whether the input is DNA or RNA.

Ambiguous nucleotide symbols should be counted separately or handled according to a documented policy.

### 4.3 GC Content

For an unambiguous DNA sequence, GC percentage is defined as:

`GC% = 100 × (G + C) / (A + C + G + T)`

When ambiguous nucleotide symbols are present, the denominator policy must be explicit. One possible policy is to calculate GC percentage using only unambiguous A, C, G, and T symbols and report ambiguous bases separately.

The implementation should not count ambiguous symbols inconsistently or silently remove them without documenting the effect.

### 4.4 Shannon Entropy

Sequence entropy can be calculated from symbol frequencies:

`H = -Σ pᵢ log₂(pᵢ)`

Here, `pᵢ` represents the frequency of symbol `i` within the selected sequence representation.

The symbols included in the calculation must be documented. Different policies for ambiguous bases can produce different entropy values.

### 4.5 Melting Temperature

Melting-temperature estimates depend on the selected equation and assumptions, including sequence length and experimental conditions.

Any estimate provided by GeneScope should identify the method and its applicable assumptions. A simplified estimate should not be presented as a universal or experimentally measured melting temperature.

## 5. K-mer Analysis

A k-mer is a subsequence of length `k`.

For a sequence of length `n`, the number of overlapping windows of length `k` is:

`max(0, n - k + 1)`

For example, the sequence `ATATA` with `k = 3` produces:

- `ATA`
- `TAT`
- `ATA`

The k-mer module should document:

- Whether overlapping windows are counted.
- How invalid or ambiguous symbols are handled.
- Whether reverse-complement-equivalent k-mers are combined.
- How invalid values of `k` are handled.

These choices affect the resulting frequency distribution and must remain consistent across tests and reports.

## 6. Open Reading Frame Analysis

ORF detection identifies candidate regions based on start codons, stop codons, reading frames, and the selected genetic code.

### 6.1 Required Parameters

The analysis should document:

- Genetic-code table.
- Start-codon policy.
- Stop-codon policy.
- Reading frames searched.
- Strand coverage.
- Minimum ORF length, if applicable.
- Coordinate convention.

If only forward reading frames are supported, the results must clearly state this limitation.

### 6.2 Coordinate Convention

A recommended convention for user-facing results is **1-based inclusive coordinates**.

Under this convention, both the start and end positions are included in the reported region.

If the internal algorithm uses zero-based indexing or exclusive end positions, conversions must be performed explicitly and tested.

### 6.3 Interpretation

An ORF is a sequence-based candidate. Its presence does not independently establish that the region is expressed, functional, or biologically significant.

## 7. Sequence Translation

Translation maps nucleotide codons to amino acids according to a genetic-code table.

The implementation should specify which genetic code is used and how it handles:

- Stop codons.
- Ambiguous codons.
- Incomplete codons at the end of a sequence.
- Alternative genetic codes.

The selected genetic-code table should be recorded with the result when possible.

An ambiguous codon should not be assigned a definite amino acid unless the selected method explicitly supports that interpretation.

## 8. Sequence Comparison and Alignment

### 8.1 Positional Comparison

Positional comparison examines symbols at matching sequence positions.

This approach can identify substitutions under a same-position assumption, but it does not generally account for insertions or deletions.

The user interface and documentation should distinguish positional comparison from sequence alignment.

### 8.2 Alignment Algorithms

If global or local alignment algorithms are implemented, the methodology should document:

- Algorithm name.
- Match score.
- Mismatch score.
- Gap penalty model.
- Matrix initialization.
- Traceback behavior.
- Handling of ambiguous symbols.
- Tie-breaking rules where relevant.

For example, Needleman–Wunsch is associated with global alignment, while Smith–Waterman is associated with local alignment.

Their names alone do not guarantee a correct implementation. The scoring recurrence, gap handling, and traceback must be tested.

### 8.3 Validation

Alignment tests should include short examples with manually verified optimal scores and alignments. Test cases should cover matches, mismatches, insertions, deletions, empty sequences, and ties between possible alignments.

## 9. CpG Analysis

CpG analysis examines the occurrence and distribution of cytosine-guanine dinucleotides.

The implementation should document the criteria used to identify candidate regions, including:

- Window size.
- Window step.
- GC-content threshold.
- Observed-to-expected CpG threshold, if used.
- Treatment of ambiguous symbols.
- Rules for merging overlapping regions.
- Coordinate convention.

These thresholds are operational parameters. They should not be presented as universal biological definitions.

Synthetic test sequences with known properties should be used to verify the behavior of the implementation.

## 10. Restriction-Site Mapping

Restriction mapping identifies occurrences of enzyme recognition motifs in a sequence.

### 10.1 Reference Data

Each enzyme entry should contain a stable name and recognition motif. Where available, the data should also document cut positions, motif ambiguity, source, and version.

The project should verify the accuracy and redistribution permissions of its enzyme data.

### 10.2 Analysis Considerations

Restriction-site results may depend on:

- Recognition-motif correctness.
- Reverse-complement handling.
- Overlapping recognition sites.
- Ambiguous nucleotide symbols.
- Linear versus circular sequence topology.
- Enzyme-specific cut positions.

### 10.3 Fragment Validation

Fragment calculations should be tested using short sequences with known restriction sites and expected fragment sizes.

If circular molecules are supported, circular-fragment behavior should be tested separately from linear-fragment behavior.

The assumptions used to calculate fragment lengths must be documented.

## 11. Testing Strategy

Testing should cover expected outputs, malformed inputs, edge cases, and integration between modules.

### 11.1 FASTA Validation Tests

The initial FASTA test set contains 15 scenarios:

| Test ID | Scenario |
|---|---|
| TC-01 | Valid DNA sequence |
| TC-02 | Empty sequence |
| TC-03 | Invalid characters |
| TC-04 | Duplicate sequence IDs |
| TC-05 | Duplicate sequences |
| TC-06 | RNA sequence |
| TC-07 | Protein sequence |
| TC-08 | IUPAC ambiguity codes |
| TC-09 | Mixed DNA/RNA characters |
| TC-10 | Missing FASTA header |
| TC-11 | Empty FASTA header |
| TC-12 | Line tracking |
| TC-13 | Short sequence |
| TC-14 | High percentage of `N` bases |
| TC-15 | Protein sequence with internal stop symbols |

The recorded initial result was 11 successful cases out of 15. Four cases exposed validation or specification inconsistencies that require investigation.

The exact failing cases and expected behavior should be recorded and converted into regression tests once the expected behavior has been specified.

### 11.2 Recommended Additional Tests

Additional tests should cover:

- Lowercase input.
- Leading and trailing whitespace.
- Empty and malformed Multi-FASTA records.
- Ambiguous nucleotide handling in statistics.
- ORF start and stop boundaries.
- Coordinate conversion.
- Genetic-code selection.
- K-mer boundary conditions.
- Alignment gap penalties and traceback.
- Restriction sites at sequence boundaries.
- Reporting of parameters and warnings.

### 11.3 Interpretation of Test Results

A passing test demonstrates that the tested behavior matched its expected result under the tested conditions.

It does not prove that every possible input is handled correctly. Test reports should include the number of tests, pass/fail counts, known failures, runtime environment, and test-suite version where available.

## 12. Benchmarking Against Established Tools

Benchmarking should be conducted only after the relevant GeneScope feature has a defined expected behavior and a repeatable test procedure.

A benchmark should:

1. Select established tools suitable for the same analysis task.
2. Record tool names, versions, sources, and access dates.
3. Use equivalent input sequences and analysis parameters.
4. Normalize output conventions before comparing results.
5. Define evaluation metrics before running the experiment.
6. Preserve inputs, scripts, outputs, and discrepancies.
7. Report both agreements and disagreements.

Comparisons should account for differences in genetic-code tables, coordinate conventions, sequence normalization, ambiguity policies, and algorithm parameters.

Claims of superior accuracy or performance should not be made without reproducible supporting evidence.

## 13. Reproducibility

Where practical, each analysis report should record:

- GeneScope version or commit.
- Input filename or sequence identifiers.
- Input checksum, where appropriate.
- Sequence type.
- Algorithm and parameters.
- Genetic-code or enzyme-data version.
- Validation warnings.
- Analysis date, if reliably available.

Reproducibility metadata should be provided without exposing sensitive sequence data unnecessarily.

## 14. Limitations and Responsible Use

GeneScope is intended for education and research-software development.

The reliability of its results depends on implementation correctness, input validation, reference-data quality, and the scope of testing.

ORF detection does not prove gene function. Sequence statistics depend on their definitions and assumptions. Alignment results depend on scoring parameters. Restriction mapping depends on reference motifs and cleavage rules.

GeneScope should not be treated as a clinical diagnostic system. Important biological conclusions should be independently verified using established methods and appropriate domain expertise.

## 15. References and Method Documentation

Before a research release, add verified references for the algorithms and reference datasets actually used by the implementation.

Relevant reference categories include:

- FASTA format documentation.
- IUPAC nucleotide ambiguity-code documentation.
- Original publications describing implemented sequence-alignment algorithms.
- Authoritative genetic-code tables.
- Documentation and sources for restriction-enzyme reference data.
- Documentation for external tools used in benchmarking.

Include complete bibliographic details and stable URLs or DOIs where available. Do not list a reference as consulted until it has been verified.


## Tm (Melting Temperature)

**Method:** Nearest-Neighbor (SantaLucia 1998 unified parameters)

**Formula:**


**Units (critical):**
- ΔH° — kcal/mol
- ΔS° — kcal/(mol·K) = raw cal/(mol·K) / 1000
- R — 0.001987 kcal/(mol·K)
- C_T — 0.25 µM (short oligos ≤ 30 nt) or 1 µM (long)
- Na⁺ = 50 mM, Mg²⁺ = 0

**Salt correction:** ΔS_salt = 0.368 × (N−1) × ln([Na⁺] + 120√[Mg²⁺])

**Applicability:**
- Only pure DNA/RNA (13–1000 bp)
- IUPAC ambiguous bases → `null`
- Protein → `null`
- T/U mix → `null`

**Cross-check:** Chester-Marshak (≤50 bp): `Tm = 64.9 + 41×(GC−16.4)/N`

## ORF (Open Reading Frame)

**Coordinates:** 1-based inclusive (GFF3 standard)
- `start` — first base of ATG
- `end` — last base of stop codon
- `length = end − start + 1`

**Stop codons (table-aware):**
- Table 1 (Standard): TAA, TAG, TGA
- Table 2 (Vertebrate Mito): TAA, TAG, AGA, AGG
- Table 5 (Invertebrate Mito): TAA, TAG, AGA, AGG
- Table 11 (Bacterial/Plastid): TAA, TAG, TGA

**Reverse strand:** coordinates converted via `L − p + 1`.

## Alignment

**Needleman-Wunsch (global):**
- Linear mode: `gapOpen = −2` → each gap position costs −2 (k×gapOpen for gap length k)
- Affine mode: `gapOpen = −2, gapExtend = −1` → k-length gap costs −2 + (k−1)×−1

**Smith-Waterman (local):** same gap logic.

## GRQS


- Completeness = effectiveLen / totalLen × 100
- BaseQuality = (1 − (ambiguous + invalid)/totalLen) × 100
- GCBalance = 100 if GC ∈ [35,65], else linear penalty
- Complexity = entropy / 2.0 × 100

