"""
compare_stats.py
================
مقایسه Sequence Statistics: GeneScope vs Biopython

مقایسه:
- GC content
- Shannon entropy
- Base counts
"""

import json
import math
import csv
from pathlib import Path
from Bio.Seq import Seq
from Bio.SeqUtils import gc_fraction

GENESCOPE_DIR = Path("genesco_json")
RESULTS_DIR = Path("results")


def shannon_entropy(seq: str) -> float:
    """محاسبه Shannon entropy"""
    counts = {}
    for c in seq:
        counts[c] = counts.get(c, 0) + 1
    n = len(seq)
    entropy = 0
    for count in counts.values():
        p = count / n
        if p > 0:
            entropy -= p * math.log2(p)
    return entropy


def compute_stats_reference(seq: str) -> dict:
    """محاسبه مرجع آمار توالی"""
    seq = seq.upper()
    counts = {b: seq.count(b) for b in 'ATGC'}

    # GC (بدون ambiguous)
    denom = sum(counts.values())
    gc = (counts['G'] + counts['C']) / denom * 100 if denom > 0 else 0

    # Entropy
    entropy = shannon_entropy(seq)

    # GC skew
    g, c = counts['G'], counts['C']
    gc_skew = (g - c) / (g + c) if (g + c) > 0 else 0

    return {
        'length': len(seq),
        'gc': gc,
        'entropy': entropy,
        'gc_skew': gc_skew,
        'A': counts['A'],
        'T': counts['T'],
        'G': counts['G'],
        'C': counts['C'],
    }


def load_genesco_stats(seq_name: str):
    path = GENESCOPE_DIR / f"{seq_name}.json"
    if not path.exists():
        return None
    try:
        with open(path, encoding='utf-8') as f:
            data = json.load(f)
        stats = data.get('statistics', {})
        seq_info = data.get('sequence', {})
        return {
            'gc': stats.get('gc'),
            'entropy': stats.get('entropy'),
            'gc_skew': stats.get('gcSkew'),
            'length': seq_info.get('length'),
        }
    except Exception:
        return None


def main():
    RESULTS_DIR.mkdir(exist_ok=True)

    print("=" * 70)
    print("Sequence Statistics: GeneScope vs Biopython/Reference")
    print("=" * 70)

    # توالی‌های آزمون
    test_sequences = {
        'Random_balanced_1kb': ''.join(__import__('random').choice('ATGC') for _ in range(1000)),
        'GC_rich_1kb': 'GC' * 500,
        'AT_rich_1kb': 'AT' * 500,
    }

    results = []

    for name, seq in test_sequences.items():
        print(f"\n▶ {name} ({len(seq)} bp)")

        ref = compute_stats_reference(seq)
        gs = load_genesco_stats(name)

        print(f"  Reference: GC={ref['gc']:.2f}%, H={ref['entropy']:.4f}, Skew={ref['gc_skew']:.4f}")

        if gs:
            print(f"  GeneScope: GC={gs['gc']:.2f}%, H={gs['entropy']:.4f}, Skew={gs['gc_skew']:.4f}")

            # بررسی تطابق
            gc_match = abs(ref['gc'] - gs['gc']) < 0.1
            h_match = abs(ref['entropy'] - gs['entropy']) < 0.01
            skew_match = abs(ref['gc_skew'] - gs['gc_skew']) < 0.01

            print(f"  Match: GC={'✓' if gc_match else '✗'}  "
                  f"Entropy={'✓' if h_match else '✗'}  "
                  f"Skew={'✓' if skew_match else '✗'}")

            results.append({
                'name': name,
                'length': len(seq),
                'ref_gc': round(ref['gc'], 2),
                'gs_gc': round(gs['gc'], 2),
                'ref_entropy': round(ref['entropy'], 4),
                'gs_entropy': round(gs['entropy'], 4),
                'ref_skew': round(ref['gc_skew'], 4),
                'gs_skew': round(gs['gc_skew'], 4),
                'all_match': gc_match and h_match and skew_match,
            })
        else:
            print(f"  GeneScope: (no JSON)")

    # ذخیره
    if results:
        csv_path = RESULTS_DIR / "stats_comparison.csv"
        with open(csv_path, 'w', newline='', encoding='utf-8-sig') as f:
            writer = csv.DictWriter(f, fieldnames=results[0].keys())
            writer.writeheader()
            writer.writerows(results)
        print(f"\n✓ Saved: {csv_path}")


if __name__ == '__main__':
    main()