# 🧬 GeneScope

## Intelligent Web-Based DNA Sequence Analysis Platform

**GeneScope** is a modern web-based bioinformatics platform designed for DNA sequence analysis, visualization, validation, and educational exploration. It provides an interactive environment where users can upload or enter DNA sequences, validate biological sequence data, perform computational analyses, visualize results, and generate research-oriented reports.

---

## 📖 Overview

Bioinformatics analysis often requires researchers and students to use multiple independent tools for sequence validation, nucleotide composition, GC-content analysis, reverse complement generation, transcription, translation, ORF analysis, k-mer analysis, and other computational tasks. **GeneScope** aims to provide these capabilities through a unified and user-friendly web interface.

The current version focuses on creating a **scientific front-end prototype** with a modular architecture that can later be connected to a Python-based backend (Flask) and real biological databases (NCBI, Ensembl, UniProt, TCGA, cBioPortal).

---

## 🎯 Project Goals

The main goals of GeneScope are:

- Provide an accessible interface for DNA sequence analysis
- Support real FASTA and Multi-FASTA files
- Validate biological sequence data
- Calculate nucleotide composition and GC/AT content
- Perform common DNA/RNA computational transformations
- Provide basic sequence statistics
- Analyze codons and protein translation
- Detect potential ORFs
- Perform k-mer analysis
- Perform CpG pattern analysis
- Analyze restriction enzyme recognition sites
- Provide basic primer property estimation
- Compare reference and sample sequences
- Visualize sequence characteristics
- Generate computational reports
- Provide an extensible architecture for future research functionality
- Prepare the platform for real biological datasets and backend integration

---

## ✨ Features

### 🧬 DNA Sequence Analysis

GeneScope provides several basic and intermediate sequence analysis functions:

| **Feature** | **Description** |
|-------------|-----------------|
| Sequence Length | Total number of nucleotides |
| Nucleotide Composition | A, T, C, G counts and percentages |
| GC Content | Percentage of G and C bases over canonical bases |
| AT Content | Percentage of A and T bases over canonical bases |
| GC/AT Ratio | Ratio of GC to AT content |
| GC Skew | (G-C)/(G+C) |
| AT Skew | (A-T)/(A+T) |
| Shannon Entropy | Sequence complexity measure: -Σ p(x) log₂ p(x) |
| Homopolymer Analysis | Longest repeated sequence |

### 🔄 Sequence Transformations

| **Transformation** | **Description** |
|--------------------|-----------------|
| Complement | A↔T, C↔G |
| Reverse Complement | Complement then reverse the sequence |
| DNA → RNA | T → U transcription |
| Codon Generation | Group RNA into triplets |
| Protein Translation | Convert codons to amino acids using standard genetic code |

### 🧪 Advanced Analysis Modules

| **Module** | **Description** |
|------------|-----------------|
| ORF Analysis | Detection of open reading frames (start ATG → stop TAA/TAG/TGA) |
| K-mer Analysis | Configurable k-mer frequency analysis (K=2,3,4,5) |
| CpG Pattern Analysis | CpG dinucleotide detection and island identification |
| Restriction Enzyme Analysis | Recognition site detection for EcoRI, BamHI, HindIII, NotI, XhoI |
| Primer Analysis | Basic primer property estimation (length, GC%, Tm using Wallace rule) |
| Mutation Analysis | Position-wise sequence difference analysis between reference and sample |

### 📊 Visualization & Reporting

| **Feature** | **Description** |
|-------------|-----------------|
| Interactive Charts | Pie chart, bar chart, circular progress indicators |
| GRQS | GeneScope Research Quality Score (Experimental) |
| Sequence Viewer | Color-coded nucleotide display with position numbering |
| PDF Report | Comprehensive report generation |
| CSV Export | FASTA analysis results export |
| History Tracking | Search, filter, export, and delete functionality |

### 📁 FASTA Support

| **Feature** | **Description** |
|-------------|-----------------|
| Single FASTA | Support for single sequence files |
| Multi-FASTA | Support for multiple sequences in one file |
| IUPAC Support | Ambiguity codes: R,Y,S,W,K,M,B,D,H,V,N |
| Drag & Drop | File upload via drag and drop |
| File Validation | Format, extension, and size validation |
| Header Parsing | ID and description extraction |
| Per-Sequence Statistics | Length, GC%, N% for each sequence |
| Aggregate Statistics | Total sequences, total bases, average length, average GC%, average N% |
| Status Indicators | VALID / WARNING / ERROR status per sequence |
| Sequence Viewer | Color-coded sequence display |

---

## 🛠️ Technology Stack

| **Layer** | **Technology** |
|-----------|----------------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **UI Design** | Glassmorphism, Neumorphism, Dark Theme |
| **Charts** | Chart.js v4.4.0 |
| **PDF Generation** | jsPDF v2.5.1 |
| **Fonts** | Vazirmatn (Persian font) |
| **Icons** | Font Awesome v6.5.0 |
| **Deployment** | Static HTML (no server required) |

---

### Quick Start

| **Step** | **Action** |
|----------|------------|
| 1 | Enter a DNA sequence in the text area (only A, T, C, G allowed) |
| 2 | Click "تحلیل جامع" (Comprehensive Analysis) |
| 3 | Upload a FASTA file on the FASTA page |
| 4 | View results including composition, transformations, ORFs, charts, and interpretation |
| 5 | Generate a PDF report using the "گزارش PDF" button |

---

## 🔬 FASTA Workflow


---

## 📊 Analysis Modules

### 1. DNA Analysis Engine

| **Metric** | **Description** | **Formula** |
|------------|-----------------|-------------|
| Length | Number of nucleotides | - |
| GC% | Percentage of G and C | (G+C)/(A+T+G+C) × 100 |
| AT% | Percentage of A and T | (A+T)/(A+T+G+C) × 100 |
| GC/AT Ratio | Ratio of GC to AT | (G+C)/(A+T) |
| GC Skew | Strand bias indicator | (G-C)/(G+C) |
| AT Skew | Strand bias indicator | (A-T)/(A+T) |
| Shannon Entropy | Complexity measure | -Σ p(x) log₂ p(x) |
| Homopolymer | Longest repeat | - |

### 2. ORF Analysis

| **Parameter** | **Value** |
|---------------|-----------|
| Start Codon | ATG |
| Stop Codons | TAA, TAG, TGA |
| Method | Scan for ATG, find nearest in-frame stop codon |
| Output | Start position, stop position, ORF length, ORF sequence |

### 3. K-mer Analysis

| **Parameter** | **Options** |
|---------------|-------------|
| K Value | 2, 3, 4, 5 |
| Method | Count frequency of all k-length substrings |
| Output | Sorted frequency table, top k-mers display |

### 4. Restriction Enzymes

| **Enzyme** | **Recognition Site** |
|------------|---------------------|
| EcoRI | GAATTC |
| BamHI | GGATCC |
| HindIII | AAGCTT |
| NotI | GCGGCCGC |
| XhoI | CTCGAG |

### 5. Primer Properties

| **Property** | **Method** |
|--------------|------------|
| Length | Number of nucleotides |
| GC% | (G+C)/Length × 100 |
| Tm | Wallace rule: 4×(G+C) + 2×(A+T) |
| Quality | GC% between 40-60% is "good" |

---

## 🧠 Scientific Interpretation

### GC Content Interpretation

| **GC% Range** | **Interpretation** |
|---------------|-------------------|
| 30-70% | محتوای GC متعادل نشان‌دهنده پایداری ساختاری مناسب است |
| >70% | محتوای GC بالا ممکن است باعث افزایش پایداری و کاهش انعطاف‌پذیری شود |
| <30% | محتوای GC پایین ممکن است باعث کاهش پایداری ساختاری شود |

### GRQS (GeneScope Research Quality Score)

**Status:** Experimental

**Formula:**


**Components:**

| **Component** | **Score Range** | **Scoring Criteria** |
|---------------|-----------------|---------------------|
| GC Score | 0-20 | Balanced GC (30-70%) = 20 |
| Length Score | 0-15 | Length ≥30bp = 15 |
| Complexity Score | 0-20 | Entropy ≥1.8 = 20 |
| ORF Score | 0-20 | ORF present = 20 |
| Protein Score | 0-15 | >5 amino acids = 15 |
| Balance Score | 0-10 | Balanced AT/GC = 10 |

**Important:** This is an **experimental** composite score. It is not a clinical or diagnostic standard.

### Scientific Disclaimer

All results include the following disclaimer:

> نتایج ارائه‌شده صرفاً برای اهداف آموزشی، پژوهشی و تحلیل مقدماتی طراحی شده‌اند و نباید به‌عنوان مبنای تصمیم‌گیری پزشکی یا تشخیص بیماری استفاده شوند.

---

## 🔮 Future Integration

| **Service** | **Purpose** | **Status** |
|-------------|-------------|------------|
| NCBI | Gene search and sequence retrieval | Ready for integration |
| Ensembl | Genome database access | Ready for integration |
| UniProt | Protein data | Ready for integration |
| TCGA / GDC | Cancer genomics data | Ready for integration |
| cBioPortal | Cancer genomics analysis | Ready for integration |
| GEO | Gene expression data | Ready for integration |
| Flask Backend | API and database services | Planned |
| REST API | Service communication | Planned |
| SQLite/PostgreSQL | Data persistence | Planned |

---

## 🔬 Research Readiness

| **Feature** | **Status** |
|-------------|------------|
| FASTA Support | ✅ Complete |
| DNA Analysis | ✅ Complete |
| RNA Transcription | ✅ Complete |
| Protein Translation | ✅ Complete |
| ORF Detection | ✅ Complete |
| Mutation Analysis | ✅ Complete |
| Restriction Analysis | ✅ Complete |
| Primer Analysis | ✅ Complete |
| K-mer Analysis | ✅ Complete |
| CpG Pattern Analysis | ✅ Complete |
| GRQS (Experimental) | ✅ Complete |
| PDF Report | ✅ Complete |
| Visualization | ✅ Complete |
| Educational Content | ✅ Complete |
| Scientific Resources | ✅ Complete |
| Future API Ready | ✅ Complete |
| Future Database Ready | ✅ Complete |

### Features Awaiting Validation

- GRQS (requires empirical validation)
- ORF Prediction (requires biological validation)
- Restriction Site Detection (requires wet-lab validation)

---

## ⚠️ Known Limitations

| **Limitation** | **Description** |
|----------------|-----------------|
| Front-end Only | All analysis runs client-side. No server-side persistence. |
| Large Sequences | Performance may degrade with sequences >50,000 bp. |
| No Real Alignment | Mutation analysis uses position-wise comparison, not true sequence alignment. |
| Basic Primer Analysis | Primer design is not provided; only property estimation. |
| Experimental GRQS | The quality score is experimental and not clinically validated. |
| No Clinical Interpretation | No diagnostic or medical claims are made. |
| Limited Enzyme Set | Only five restriction enzymes are currently supported. |


---


## 📝 Version History

| **Version** | **Description** | **Date** |
|-------------|-----------------|----------|
| v1.0 | Base platform with DNA analysis | 2025 |
| v2.0 | Research Edition with ORF and Mutation | 2025 |
| v3.0 | Protein and Multi-FASTA support | 2026 |
| v4.0 | Intelligent Interpretation and GRQS | 2026 |
| v4.1 | Scientific refinement, validation, and benchmark readiness | Aug 2026 |

---

## 🧬 IUPAC Codes Reference

| **Code** | **Meaning** | **Bases** |
|----------|-------------|-----------|
| A | Adenine | A |
| C | Cytosine | C |
| G | Guanine | G |
| T | Thymine | T |
| R | Purine | A/G |
| Y | Pyrimidine | C/T |
| S | Strong | G/C |
| W | Weak | A/T |
| K | Keto | G/T |
| M | Amino | A/C |
| B | Not A | C/G/T |
| D | Not C | A/G/T |
| H | Not G | A/C/T |
| V | Not T | A/C/G |
| N | Any base | A/C/G/T |

---
---

## 👩‍🔬 About

**Design and Execution:** Narges Gordpur

**Focus:** Bioinformatics, DNA Sequence Analysis, Scientific Software Development

**Last Updated:** August 2026
---

**🧬 GeneScope — Research Platform for DNA Sequence Analysis**

*"From Sequence to Understanding"*
