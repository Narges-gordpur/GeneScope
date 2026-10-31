<p align="center">
  <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/dna.svg" alt="GeneScope Logo" width="100">
</p>

<h1 align="center">GeneScope Pro v11.1</h1>

<p align="center">
  <strong>Intelligent Bioinformatics Platform for DNA Sequence Analysis</strong><br>
  <em>From Sequence to Understanding</em>
</p>

<p align="center">
  <a href="https://github.com/Narges-gordpur/GeneScope/releases"><img src="https://img.shields.io/badge/version-11.1.0-blue.svg" alt="Version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://narges-gordpur.github.io/GeneScope/"><img src="https://img.shields.io/badge/Live_Demo-Available-brightgreen" alt="Live Demo"></a>
  <a href="validation/results/RESULTS.md"><img src="https://img.shields.io/badge/Validation-Biopython_1.88-blue" alt="Validation"></a>
  <a href="https://github.com/Narges-gordpur/GeneScope"><img src="https://img.shields.io/badge/Tests-36%2F36_Passing-success" alt="Tests"></a>
</p>

---

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Why GeneScope?](#why-genescope)
4. [How It Works (Architecture)](#how-it-works-architecture)
5. [Requirements](#requirements)
6. [Installation](#installation)
7. [Quick Start](#quick-start)
8. [GRQS (Quality Score)](#grqs-quality-score)
9. [Scientific Validation](#scientific-validation)
10. [Performance Benchmarks](#performance-benchmarks)
11. [Comparison with Existing Tools](#comparison-with-existing-tools)
12. [Limitations](#limitations)
13. [Citation](#citation)
14. [License](#license)

---

## Overview

**GeneScope Pro v11.1** is a free, browser-based bioinformatics platform designed to simplify common biological sequence-analysis tasks in a single environment.

Developed using HTML5, CSS3, and JavaScript ES Modules (ECMAScript 2022), GeneScope Pro requires **no package installation, no build step, and no dedicated application analysis server**.

The platform integrates sequence statistics, melting-temperature estimation, ORF detection, pairwise alignment, restriction mapping, k-mer profiling, CpG-island detection, FASTA parsing, translation-derived descriptors, and structured reporting.

GeneScope Pro is designed for students, educators, and researchers who need an accessible environment for exploratory sequence analysis without relying on multiple independent command-line tools.

### Client-side processing and data handling

Core sequence computations are performed locally in the user's browser. The application does not require a dedicated GeneScope analysis backend to process submitted sequences.

The platform also supports offline-capable local analysis after the application assets are available. However, the optional NCBI E-utilities retrieval feature requires an internet connection and communicates with NCBI.

> **Project status:** GeneScope Pro v11.1 has been evaluated using nine sequence records, reference comparisons, and an internal test suite containing 36 tests. All 36 internal tests passed in the reported test run. The evaluation is limited to the datasets and configurations described in this README and does not establish genome-wide or clinical validity.

---

## Key Features

- **Browser-based interface:** Run sequence-analysis workflows without installing a local bioinformatics package.
- **Client-side processing:** Core analytical computations run locally in the browser.
- **FASTA parsing:** IUPAC-aware sequence parsing with explicit GC-content denominator handling.
- **Sequence statistics:** Nucleotide composition, GC content, and sequence-complexity analysis.
- **Melting temperature (Tm):** DNA nearest-neighbor thermodynamic estimation based on SantaLucia (1998).
- **Six-frame ORF detection:** Identification of complete open reading frames using start and stop codons.
- **Pairwise alignment:** Needleman–Wunsch global and Smith–Waterman local alignment, with linear and affine gap models.
- **Restriction mapping:** Recognition-site scanning for 12 Type II restriction enzymes.
- **K-mer profiling:** K-mer analysis for k values from 1 to 12.
- **CpG-island detection:** CpG analysis based on the Gardiner-Garden and Frommer approach.
- **Protein descriptors:** Translation-derived molecular weight, isoelectric point, GRAVY, and codon adaptation index.
- **GRQS:** GeneScope Research Quality Score, a four-component sequence-quality summary.
- **Educational module:** An integrated ten-tab educational environment.
- **Reporting and export:** Structured reports and JSON, CSV, FASTA, and GFF3 export support.
- **NCBI retrieval:** Optional dataset retrieval through NCBI E-utilities.

---

## Why GeneScope?

Many bioinformatics workflows require users to combine programming libraries, command-line utilities, and web-based resources. These tools are powerful, but their installation requirements, learning curves, and deployment models may create barriers for teaching and exploratory analysis.

GeneScope Pro addresses this practical gap by bringing selected sequence-analysis functions into one browser-based interface.

Its main design characteristics are:

- No local package installation or build process.
- Local sequence computation without a dedicated GeneScope analysis server.
- A graphical workflow for common sequence-analysis tasks.
- Integrated educational material.
- Offline-capable local analysis after application assets are available.
- Optional external NCBI dataset retrieval.

GeneScope Pro is intended to **complement rather than replace** established tools such as Biopython, EMBOSS, and Galaxy. These systems provide broader ecosystems and specialized capabilities that are outside the current scope of GeneScope Pro.

---

## How It Works (Architecture)

GeneScope Pro v11.1 is implemented using JavaScript ES Modules and ECMAScript 2022.

The project is reported to contain approximately **34 files, 6,900 lines of code, and nine modules**.

### Architectural layers

**1. Core Layer**

Provides shared application resources, including:

- IUPAC nucleotide definitions.
- Nearest-neighbor thermodynamic parameters.
- Amino-acid masses and pKa values.
- Hydropathy values and codon-frequency data.
- Genetic-code tables.
- Application settings and state.
- Molecule-type detection.
- Sequence cleaning and utility functions.

**2. Analytical Layer**

Contains the main sequence-analysis algorithms:

- Sequence statistics and Tm estimation.
- Translation and protein descriptors.
- Six-frame ORF detection.
- Needleman–Wunsch alignment.
- Smith–Waterman alignment.
- Sequence identity analysis.
- Restriction mapping and gel simulation.
- K-mer counting.
- CpG detection.
- FASTA parsing.

**3. Reporting Layer**

Provides:

- Eight-section structured report generation.
- JSON export.
- CSV export.
- FASTA export.
- GFF3 export.

**4. User Interface Layer**

Provides:

- Application bootstrap.
- Navigation.
- Dashboard.
- Sequence analyzer.
- Dataset interface.
- Reports.
- Educational module.
- Settings.

### Data flow

```text
User Input
    |
    v
cleanSequence()
    |
    v
detectMoleculeType()
    |
    v
GENESCOPE.currentSeq
    |
    v
Analytical Module Dispatch
    |
    v
UI Rendering
    |
    v
Optional Report and Export
```

NCBI dataset retrieval is an external network operation and is separate from the local analytical workflow.

> **Architecture note:** The project description reports 34 files. The documented layer-level file counts do not fully reconcile with that total; the architecture above therefore describes the documented responsibilities rather than claiming a verified file-by-file inventory.

---

## Requirements

- A modern web browser supporting JavaScript ES Modules and the ECMAScript 2022 features used by the application.
- No Python, Node.js, or package installation is required for normal online use.
- A local static HTTP server is recommended for development and local execution because ES Modules may be restricted when opening files directly through `file://`.

---

## Installation

GeneScope Pro does not require a package installation or a build process.

### Option 1: Try Online (Recommended)

<p align="center">
  <a href="https://narges-gordpur.github.io/GeneScope/">
    <strong>🌐 Launch GeneScope Pro Live Demo →</strong>
  </a>
</p>

### Option 2: Run Locally

Clone the repository:

```bash
git clone https://github.com/Narges-gordpur/GeneScope.git
cd GeneScope
```

Start a local static server:

```bash
python -m http.server 8000
```

Alternatively, if Node.js is available:

```bash
npx serve .
```

Open the application:

```text
http://localhost:8000
```

No package installation or compilation step is required.

---

## Quick Start

A typical analysis workflow consists of the following steps:

1. Open GeneScope Pro in a supported browser.
2. Paste a biological sequence or load a FASTA record.
3. Allow the application to normalize the sequence and identify its molecule type.
4. Select the desired analytical module.
5. Run the analysis and inspect the generated results.
6. Export the report when required.

### Typical analysis workflow

| Step | Operation | Description |
|---|---|---|
| 1 | Sequence input | Paste or load a biological sequence |
| 2 | Validation | Clean and validate sequence characters |
| 3 | Molecule detection | Identify DNA, RNA, or protein input |
| 4 | Analysis | Run the selected analytical module |
| 5 | Visualization | Inspect results in the browser |
| 6 | Export | Save supported report formats |

---

## GRQS (Quality Score)

The **GeneScope Research Quality Score (GRQS)** is a four-component composite score designed to summarize selected sequence-quality characteristics.

The implemented formula is:

\[
GRQS = 0.25 \times (C + Q + B + X)
\]

The four components are defined as follows.

### 1. Completeness (C)

\[
C = \frac{effectiveLen}{totalLen} \times 100
\]

This component represents the proportion of effective sequence length relative to total sequence length.

### 2. Base Quality (Q)

\[
Q = \left[1-\frac{ambiguous+invalid}{totalLen}\right]\times100
\]

This component penalizes ambiguous and invalid sequence characters.

### 3. GC Balance (B)

The GC-balance component assigns a score of 100 when GC content is between 35% and 65%.

Outside this interval, a linear penalty is applied.

The exact slope and implementation details of the penalty should be documented with the corresponding source code for full reproducibility.

### 4. Sequence Complexity (X)

\[
X = \frac{Shannon\ entropy}{2.0}\times100
\]

This component uses Shannon entropy to represent sequence complexity.

### GRQS interpretation

| Score | Interpretation |
|---|---|
| ≥ 90 | Excellent |
| 75–89 | Good |
| 60–74 | Fair |
| 40–59 | Poor |
| < 40 | Unfit |

**Important scientific note:** GRQS is an implemented composite score proposed by the developers. Its reliability, construct validity, sensitivity, and usefulness as a general biological quality measure have not yet been independently established. It should not be interpreted as a clinical quality metric.

---

## Scientific Validation

GeneScope Pro v11.1 was evaluated against established reference implementations using a small, method-focused test dataset.

### Validation environment

| Component | Version / Configuration |
|---|---|
| GeneScope Pro | v11.1 |
| Python | 3.12.10 |
| Biopython | 1.88 |
| NumPy | 1.26.4 |
| EMBOSS getorf | 6.6 (online service) |
| Genetic code | Table 1 |
| ORF start codon | ATG |
| ORF stop codons | TAA, TAG, TGA |
| Coordinate convention | 1-based inclusive |

EMBOSS getorf was accessed through the European Bioinformatics Institute's online service. It was not executed as a locally installed EMBOSS program.

### Validation dataset

The evaluation included nine sequence records:

| Record | Length | Type |
|---|---:|---|
| BRCA1_fragment_real | 213 bp | Real sequence fragment |
| ORF_synthetic_known | 36 bp | Synthetic |
| Restriction_synthetic_3sites | 39 bp | Synthetic |
| GC_rich_synthetic | 51 bp | Synthetic |
| AT_rich_synthetic | 50 bp | Synthetic |
| Alignment_ref_sequence | 43 bp | Synthetic |
| Alignment_sample_identical | 43 bp | Synthetic |
| Alignment_sample_snv | 43 bp | Synthetic |
| Alignment_sample_indel | 39 bp | Synthetic |

The dataset contained one real BRCA1 fragment and eight synthetic records. It was designed for selected method comparisons and does not represent a genome-wide validation cohort.

### 1. Melting-temperature validation

DNA melting-temperature estimates were compared with Biopython 1.88 using the nearest-neighbor framework.

| Sequence | Length (bp) | GeneScope (°C) | Biopython (°C) | Reported \|ΔTm\| (°C) |
|---|---:|---:|---:|---:|
| BRCA1 fragment | 213 | 76.05 | 76.81 | 0.77 |
| ORF synthetic | 36 | 52.82 | 49.91 | 2.91 |
| Restriction synthetic | 39 | 57.75 | 55.40 | 2.35 |
| GC-rich | 51 | 96.91 | 94.87 | 2.04 |
| AT-rich | 50 | 45.21 | 43.49 | 1.72 |
| Alignment reference | 43 | 71.26 | 69.69 | 1.56 |
| Alignment identical | 43 | 71.26 | 69.69 | 1.56 |
| Alignment SNV | 43 | 71.75 | 70.18 | 1.58 |
| Alignment indel | 39 | 70.31 | 68.43 | 1.88 |

Reported summary:

- Mean absolute difference across nine records: **1.82°C**.
- Difference for the 213-bp BRCA1 fragment: **0.77°C**.
- Mean difference for the 36–51-bp sequences: **1.95°C**.
- Reported pass rate for the threshold ΔTm < 0.5°C: **0/9**.

GeneScope values were consistently higher than Biopython values in the short-sequence comparisons. Differences in terminal-initiation handling were identified as a possible explanation.

These results indicate a short-sequence Tm limitation. Biopython is a computational comparator, not an experimental melting-temperature ground truth; no wet-lab melting measurements were included.

### 2. ORF detection validation

GeneScope Pro was compared with the online EMBOSS getorf 6.6 service.

- Overall reported agreement: **7/9 records (77.8%)**.
- GeneScope reports complete ATG-to-STOP ORFs.
- The comparison output can include partial ORFs.

For the BRCA1 fragment, GeneScope reported one complete ORF:

| Property | Result |
|---|---|
| Reading frame | +2 |
| Coordinates | 38–67 |
| Length | 30 bp |
| Peptide | MSLMLCRKS |
| Stop codon | TAG |

For the synthetic ORF record, GeneScope reported coordinates [1–36], while getorf reported [1–33]. This 3-bp difference is associated with stop-codon boundary handling.

The two tools therefore do not use identical ORF reporting definitions. The reported 7/9 agreement should not be interpreted as algorithmic equivalence.

### 3. Pairwise alignment validation

Needleman–Wunsch global and Smith–Waterman local alignment scores were compared with Biopython.

Scoring parameters:

- Match: +1
- Mismatch: −1
- Gap opening: −2
- Gap extension: −1

| Sequence pair | Algorithm | Biopython | GeneScope | Agreement |
|---|---|---:|---:|---|
| Reference vs identical | Needleman–Wunsch | 43 | 43 | Exact |
| Reference vs identical | Smith–Waterman | 43 | 43 | Exact |
| Reference vs SNV | Needleman–Wunsch | 41 | 41 | Exact |
| Reference vs SNV | Smith–Waterman | 41 | 41 | Exact |
| Reference vs indel | Needleman–Wunsch | 34 | 34 | Exact |
| Reference vs indel | Smith–Waterman | 34 | 34 | Exact |

**Score agreement: 6/6 (100%).**

These tests establish agreement for the evaluated scores and settings. They do not establish identical traceback strings for all possible optimal-alignment ties.

### 4. Restriction mapping validation

The 39-bp synthetic restriction record contained three EcoRI recognition sites.

| Enzyme | GeneScope positions | Biopython positions | Agreement |
|---|---|---|---|
| EcoRI | [5, 18, 30] | [5, 18, 30] | Exact |

**Coordinate agreement: 1/1 comparison (100%).**

This result applies to the single evaluated EcoRI record. It does not establish accuracy across all 12 supported enzymes.

### 5. FASTA parsing validation

Six selected FASTA cases were compared with Biopython.

| Test case | Type | Length | GeneScope GC | Biopython GC | Agreement |
|---|---|---:|---:|---:|---|
| Valid DNA | DNA | 25 | 52.0% | 52.0% | Exact |
| RNA | RNA | 50 | 36.0% | 36.0% | Exact |
| With 4 N | DNA | 12 | 50.0% | 50.0% | Exact |
| No ambiguity | DNA | 8 | 50.0% | 50.0% | Exact |
| Protein + stop | Protein | 11 | N/A | N/A | Exact |
| Duplicate IDs | DNA × 2 | 10 / 10 | 50% / 60% | 50% / 60% | Exact |

**FASTA agreement: 6/6 (100%).**

For the 12-base sequence containing four N symbols, the GC denominator was eight rather than twelve. This makes the treatment of ambiguous bases explicit.

### 6. Internal automated test suite

All 36 reported internal tests passed.

| Category | Tests | Passed | Failed |
|---|---:|---:|---:|
| FASTA | 10 | 10 | 0 |
| ORF | 5 | 5 | 0 |
| Alignment | 6 | 6 | 0 |
| Restriction | 6 | 6 | 0 |
| Tm | 9 | 9 | 0 |
| **Total** | **36** | **36** | **0** |

<sub>Reported internal test pass rate: 100.0% (36/36).</sub>

This result describes the supplied test run. It does not establish that every interface path, browser, input size, or biological use case has been exhaustively tested.

---

## Performance Benchmarks

### Benchmark environment

| Parameter | Configuration |
|---|---|
| Operating system | Windows 10 Pro (10.0.19044, Build 19044) |
| RAM | 6 GB |
| Hardware description | Legacy hardware; BIOS date April 2010 |
| Browser | Chrome (V8 JavaScript engine) |
| Python | 3.12.10 |
| Biopython | 1.88 |
| NumPy | 1.26.4 |
| Benchmark iterations | 10 measured iterations |
| Warm-up iterations | 3 |

The manuscript reports raw runtime values in milliseconds (ms).

### Reported benchmark values

| Operation | 100 bp | 1 kb | 10 kb | 100 kb | 1 Mb |
|---|---:|---:|---:|---:|---:|
| GeneScope calculateStats | 0.30 | 0.20 | 1.70 | 13.40 | 116.60 |
| GeneScope findORFs | 0.20 | 2.10 | 20.80 | 201.70 | 2272.00 |
| GeneScope restriction (12 enzymes) | 0.10 | 0.70 | 6.60 | 67.50 | 673.60 |
| GeneScope k-mer (k=6) | 0.20 | 3.00 | 16.10 | 81.40 | 813.10 |
| GeneScope NW alignment | 1.33 (n=100) | 36.33 (n=500) | 26.33 (n=500) | — | — |
| Biopython calculateStats | 0.04 | 0.08 | 0.71 | 4.52 | 49.35 |
| Biopython estimateTm | 0.51 | 3.73 | — | — | — |
| Biopython restriction (3 enzymes) | 0.10 | 0.17 | 3.13 | 12.36 | 124.19 |
| Biopython findORFs (fallback) | 0.08 | 1.14 | 10.46 | 99.36 | 1304.46 |
| Biopython NW alignment | 0.64 (n=100) | 13.34 (n=500) | 11.42 (n=500) | — | — |

### Selected relative performance

| Operation | Input / condition | GeneScope relative to Biopython |
|---|---|---:|
| Statistics | 1 kb | 2.5× |
| Statistics | 1 Mb | 2.4× |
| ORF detection | 1 kb | 1.8× |
| ORF detection | 1 Mb | 1.7× |
| Restriction mapping, per enzyme | 1 kb | 1.0× |
| Needleman–Wunsch alignment | n=500 | 2.7× |

Across the selected comparisons, GeneScope was reported to be approximately **1.7–3.0× slower** than Biopython.

The reported computational complexity is:

- Sequence statistics: O(n)
- ORF scanning: O(n)
- Pairwise alignment: O(n²) time and O(nm) dynamic-programming memory

GeneScope processed the reported 1-Mb inputs for statistics, ORF detection, restriction scanning, and k-mer profiling on the stated benchmark setup. Alignment was not benchmarked at 100 kb or 1 Mb.

**Benchmark qualification:** Restriction benchmarks used 12 enzymes in GeneScope and 3 enzymes in Biopython; raw times are therefore not directly comparable without normalization. The reported 1-kb per-enzyme ratio was 1.0×.

The suggestion that newer hardware may be 3–10× faster is an expectation, not a measured result. No modern-device benchmark was included.

---

## Comparison with Existing Tools

The following table reproduces the developer-supplied feature comparison. It is a high-level feature inventory, not an independent audit of every current version or deployment option.

| Feature | GeneScope Pro | Biopython | EMBOSS | Galaxy | Benchling | NCBI ORFfinder |
|---|---|---|---|---|---|---|
| Browser-based | Yes | No | No | Yes | Yes | Yes |
| Zero installation | Yes | No | No | Partial | Partial | Yes |
| No dedicated analysis server | Yes | Yes | Yes | No | No | No |
| Local sequence processing | Yes | Yes | Yes | No | No | No |
| Free / open (developer matrix) | Yes | Yes | Yes | Yes | No | Yes |
| Offline capability | Yes | Yes | Yes | No | No | No |
| Nearest-neighbor Tm | Yes | Yes | Partial | Yes | Yes | No |
| ORF analysis | Yes | Partial | Yes | Yes | Yes | Yes |
| Pairwise alignment | Yes | Yes | Yes | Yes | Yes | No |
| Restriction mapping | Yes | Yes | Yes | Yes | Yes | No |
| K-mer and CpG analysis | Yes | Partial | Partial | Yes | Partial | No |
| GRQS | Yes | No | No | No | No | No |
| Educational module | Yes | No | No | Partial | Yes | Partial |
| **Reported feature total** | **13/13** | **7/13** | **7/13** | **7/13** | **6/13** | **4/13** |


---

## Reproducibility

For reproducible research and independent evaluation, the following information should be preserved:

- Exact Git commit or release tag corresponding to the evaluated version.
- Input sequences or stable identifiers and checksums where appropriate.
- Algorithm parameters and genetic-code table selections.
- Coordinate conventions and ambiguity-handling rules.
- Browser name and full version.
- Operating system and hardware details.
- Benchmark scripts and raw runtime outputs.
- Test fixtures and expected outputs.
- Full GRQS component definitions and scoring rules.
- NCBI E-utilities request parameters and retrieval settings.

Deterministic calculations support reproducibility only when inputs, parameters, data tables, and software versions are also held constant.

---

## Citation

If you use GeneScope Pro in academic work, please cite the software and specify the version used.

**Suggested software citation:**

Gordpur N. *GeneScope Pro v11.1: Development and Experimental Validation of a Web-Based Platform for DNA Sequence Analysis.* GitHub repository. Available at:

https://github.com/Narges-gordpur/GeneScope

For reproducible research, include the exact release tag or Git commit, access date, input sequences, and analysis parameters.

---

## License

GeneScope Pro is distributed under the **MIT License**.

You are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software, subject to the conditions of the MIT License.

See the [LICENSE](LICENSE) file for the complete license text.

---

## Disclaimer

GeneScope Pro is intended for educational, research, and exploratory sequence-analysis purposes.

The software is provided "as is", without warranties of any kind. It is not intended for clinical diagnosis, medical decision-making, variant classification, or replacement of professional laboratory analysis.

Results should be independently evaluated using appropriate reference tools, experimental evidence, and domain expertise before being used in scientific conclusions.

---

## Author and Project Information

**Design and execution:** Narges Gordpur  
**Project name:** GeneScope Pro v11.1  
**Project focus:** Bioinformatics, DNA sequence analysis, and scientific software development.  
**Tagline:** *From Sequence to Understanding.*

**Repository:** https://github.com/Narges-gordpur/GeneScope

**Live Demo:** https://narges-gordpur.github.io/GeneScope/

---