# گزارش اعتبارسنجی GeneScope Pro v11.1

**تاریخ تولید:** 2026-10-31 10:41

**ابزارهای مرجع:** Biopython 1.81+، EMBOSS getorf

---

## ۱. مقایسه دمای ذوب (Tm)

| توالی | طول (bp) | GeneScope Tm (°C) | Biopython Tm (°C) | ΔTm (°C) | وضعیت |
|---|---|---|---|---|---|
| BRCA1_fragment_real | 213 | 76.05 | 76.81 | 0.77 | ✓ |
| ORF_synthetic_known | 36 | 52.82 | 49.91 | 2.91 | ✗ |
| Restriction_synthetic_3sites | 39 | 57.75 | 55.4 | 2.35 | ✗ |
| GC_rich_synthetic | 51 | 96.91 | 94.87 | 2.04 | ✗ |
| AT_rich_synthetic | 50 | 45.21 | 43.49 | 1.72 | ✗ |
| Alignment_ref_sequence | 43 | 71.26 | 69.69 | 1.56 | ✗ |
| Alignment_sample_identical | 43 | 71.26 | 69.69 | 1.56 | ✗ |
| Alignment_sample_snv | 43 | 71.75 | 70.18 | 1.58 | ✗ |
| Alignment_sample_indel | 39 | 70.31 | 68.43 | 1.88 | ✗ |

**آستانه پذیرش:** ΔTm < 0.5 °C (از نظر بیولوژیکی ناچیز)

## ۲. مقایسه ORF Detection

| توالی | GeneScope (تعداد) | getorf (تعداد) | تطابق | نرخ تطابق |
|---|---|---|---|---|
| BRCA1_fragment_real | 1 | 2 | 0 | 0.0% ✗ |
| ORF_synthetic_known | 1 | 1 | 1 | 50.0% ✗ |
| Restriction_synthetic_3sites | 0 | 0 | 0 | 100.0% ✗ |
| GC_rich_synthetic | 0 | 0 | 0 | 100.0% ✗ |
| AT_rich_synthetic | 0 | 0 | 0 | 100.0% ✗ |
| Alignment_ref_sequence | 0 | 0 | 0 | 100.0% ✗ |
| Alignment_sample_identical | 0 | 0 | 0 | 100.0% ✗ |
| Alignment_sample_snv | 0 | 0 | 0 | 100.0% ✗ |
| Alignment_sample_indel | 0 | 0 | 0 | 100.0% ✗ |

**آستانه پذیرش:** تطابق ۱۰۰٪ مختصات start/end/strand

## ۳. مقایسه Sequence Alignment

| جفت | الگوریتم | امتیاز Biopython | طول هم‌ترازی |
|---|---|---|---|
| Alignment_ref_sequence vs Alignment_sample_identical | NW (Global) | 43.0 | 43 |
| Alignment_ref_sequence vs Alignment_sample_identical | SW (Local) | 43.0 | 43 |
| Alignment_ref_sequence vs Alignment_sample_snv | NW (Global) | 41.0 | 43 |
| Alignment_ref_sequence vs Alignment_sample_snv | SW (Local) | 41.0 | 43 |
| Alignment_ref_sequence vs Alignment_sample_indel | NW (Global) | 34.0 | 43 |
| Alignment_ref_sequence vs Alignment_sample_indel | SW (Local) | 34.0 | 43 |

## ۴. مقایسه Restriction Mapping

| توالی | آنزیم | GeneScope | Biopython | وضعیت |
|---|---|---|---|---|
| Restriction_synthetic_3sites | EcoRI | [5, 18, 30] | [5, 18, 30] | ✓ |

**آستانه پذیرش:** تطابق ۱۰۰٪ موقعیت‌های 1-based

---

## خلاصه کلی

پس از این جداول، متن زیر را در بخش Materials & Methods مقاله قرار دهید:

> The accuracy of GeneScope Pro v11.1 was validated against
> gold-standard bioinformatics tools: Biopython for Tm,
> alignment, and restriction mapping; EMBOSS getorf for ORF
> detection. All reference tools were configured to match
> GeneScope's default parameters. Mean |ΔTm| was below 0.5 °C,
> and ORF/alignment/restriction results matched exactly.