"""
compare_cpg.py
==============
مقایسه CpG island detection: GeneScope vs Biopython/تحلیل دستی

GeneScope از Gardiner-Garden 1987 استفاده می‌کند:
- طول ≥ 200 bp
- GC% ≥ 50%
- Obs/Exp CpG ≥ 0.6

روش مقایسه:
- محاسبه دستی طبق فرمول Gardiner-Garden
- مقایسه با خروجی GeneScope
"""

import json
from pathlib import Path
from Bio.Seq import Seq
from Bio.SeqUtils import gc_fraction

GENESCOPE_DIR = Path("genesco_json")
RESULTS_DIR = Path("results")


def count_cpg(seq: str) -> int:
    """شمارش دایناوکلئوتید CpG"""
    return sum(1 for i in range(len(seq) - 1) if seq[i:i+2] == 'CG')


def detect_cpg_islands_reference(seq: str, window: int = 200, step: int = 50,
                                  gc_min: float = 50.0,
                                  oe_min: float = 0.6) -> list:
    """
    تشخیص جزایر CpG طبق Gardiner-Garden 1987 (پیاده‌سازی مرجع).

    برمی‌گرداند: لیستی از (start, end, gc_pct, obs_exp)
    """
    seq = seq.upper()
    if len(seq) < window:
        return []

    candidates = []
    for i in range(0, len(seq) - window + 1, step):
        sub = seq[i:i+window]
        length = len(sub)

        # GC%
        gc = (sub.count('G') + sub.count('C')) / length * 100

        # Observed/Expected CpG
        obs = count_cpg(sub)
        c_count = sub.count('C')
        g_count = sub.count('G')
        exp = (c_count * g_count) / length if length > 0 else 0
        oe = obs / exp if exp > 0 else 0

        if gc >= gc_min and oe >= oe_min:
            candidates.append({
                'start': i + 1,       # 1-based
                'end': i + window,
                'gc': gc,
                'oe': oe,
            })

    # ادغام جزایر مجاور
    merged = []
    for c in candidates:
        if merged and c['start'] <= merged[-1]['end'] + step:
            merged[-1]['end'] = max(merged[-1]['end'], c['end'])
            merged[-1]['gc'] = (merged[-1]['gc'] + c['gc']) / 2
            merged[-1]['oe'] = (merged[-1]['oe'] + c['oe']) / 2
        else:
            merged.append(c.copy())

    return merged


def load_genesco_cpg(seq_name: str):
    """خواندن CpG islands از JSON GeneScope"""
    path = GENESCOPE_DIR / f"{seq_name}.json"
    if not path.exists():
        return None
    try:
        with open(path, encoding='utf-8') as f:
            data = json.load(f)
        return data.get('cpg', {}).get('islandsDetected'), data.get('cpg', {})
    except Exception:
        return None


def main():
    RESULTS_DIR.mkdir(exist_ok=True)

    print("=" * 70)
    print("CpG Island Detection: GeneScope vs Reference (Gardiner-Garden 1987)")
    print("=" * 70)

    # توالی‌های آزمون — مخصوص CpG
    test_sequences = {
        'CpG_rich_synthetic': 'GC' * 150,  # ۳۰۰ bp، غنی از CpG
        'CpG_medium': 'GCGC' * 50 + 'ATAT' * 50,  # متوسط
        'CpG_poor': 'AT' * 150,  # فقیر
    }

    results = []

    for name, seq in test_sequences.items():
        print(f"\n▶ {name} ({len(seq)} bp)")

        # مرجع
        ref_islands = detect_cpg_islands_reference(seq)
        print(f"  Reference: {len(ref_islands)} island(s)")
        for isl in ref_islands:
            print(f"    - {isl['start']}-{isl['end']} (GC={isl['gc']:.1f}%, O/E={isl['oe']:.2f})")

        # GeneScope (اگر JSON موجود است)
        gs_data = load_genesco_cpg(name)
        if gs_data and gs_data[0] is not None:
            gs_count, gs_cpg = gs_data
            print(f"  GeneScope: {gs_count} island(s)")

            # تطابق
            if gs_count == len(ref_islands):
                print(f"  Match: ✓")
            else:
                print(f"  Match: ✗ (Δ={abs(gs_count - len(ref_islands))})")
        else:
            print(f"  GeneScope: (no JSON — skipped)")

        results.append({
            'name': name,
            'length': len(seq),
            'ref_count': len(ref_islands),
            'gs_count': gs_data[0] if gs_data else None,
            'match': (gs_data and gs_data[0] == len(ref_islands)) if gs_data else None,
        })

    # ذخیره CSV
    import csv
    csv_path = RESULTS_DIR / "cpg_comparison.csv"
    with open(csv_path, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        writer.writerow(['Sequence', 'Length', 'Reference_count', 'GeneScope_count', 'Match'])
        for r in results:
            writer.writerow([r['name'], r['length'], r['ref_count'], r['gs_count'], r['match']])
    print(f"\n✓ Saved: {csv_path}")


if __name__ == '__main__':
    main()