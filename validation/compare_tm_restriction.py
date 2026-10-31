"""
compare_tm_restriction.py
==========================
مقایسه Tm و Restriction Mapping بین GeneScope و Biopython.

استفاده:
    python compare_tm_restriction.py
"""

import json
import os
import time
import csv
from pathlib import Path

from biopython_reference import (
    get_tm_biopython,
    get_restriction_sites_biopython,
)


GENESCOPE_DIR = Path("genesco_json")
RESULTS_DIR = Path("results")
SEQUENCES_FILE = Path("test_sequences.fasta")


def load_fasta(fasta_path):
    """خواندن فایل FASTA → dict {name: sequence}"""
    sequences = {}
    current_name = None
    current_seq = []

    with open(fasta_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line.startswith(">"):
                if current_name is not None:
                    sequences[current_name] = "".join(current_seq)
                current_name = line[1:].strip()
                current_seq = []
            elif line:
                current_seq.append(line)

        if current_name is not None:
            sequences[current_name] = "".join(current_seq)

    return sequences


def load_genesco_json(seq_name):
    """بارگذاری خروجی GeneScope برای یک توالی"""
    json_path = GENESCOPE_DIR / f"{seq_name}.json"
    if not json_path.exists():
        return None

    try:
        with open(json_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"  [خطا در خواندن {json_path}]: {e}")
        return None


def compare_tm(seq_name, seq_str, gs_json):
    """مقایسه Tm"""
    gs_tm = gs_json.get("statistics", {}).get("tm")

    # زمان‌گیری Biopython
    t0 = time.perf_counter()
    bp_tm = get_tm_biopython(seq_str)
    bp_time_ms = (time.perf_counter() - t0) * 1000

    if gs_tm is None or bp_tm is None:
        return {
            "sequence": seq_name,
            "length": len(seq_str),
            "genesco_tm": gs_tm,
            "biopython_tm": bp_tm,
            "delta": None,
            "pass": False,
            "biopython_ms": round(bp_time_ms, 2),
            "note": "یکی از ابزارها قادر به محاسبه نبود"
        }

    delta = abs(gs_tm - bp_tm)
    return {
        "sequence": seq_name,
        "length": len(seq_str),
        "genesco_tm": round(gs_tm, 2),
        "biopython_tm": round(bp_tm, 2),
        "delta": round(delta, 2),
        "pass": delta < 1.0,
        "biopython_ms": round(bp_time_ms, 2),
        "note": ""
    }


def compare_restriction(seq_name, seq_str, gs_json, enzyme="EcoRI"):
    """مقایسه موقعیت‌های برش آنزیم"""
    gs_sites = gs_json.get("restriction_sites", {}).get(enzyme, [])

    if not gs_sites:
        # اگر GeneScope این فیلد را ندارد، محاسبه دستی انجام می‌دهیم
        gs_sites = []

    t0 = time.perf_counter()
    bp_sites = get_restriction_sites_biopython(seq_str, enzyme)
    bp_time_ms = (time.perf_counter() - t0) * 1000

    gs_set = set(gs_sites)
    bp_set = set(bp_sites)

    return {
        "sequence": seq_name,
        "enzyme": enzyme,
        "genesco_sites": sorted(gs_set),
        "biopython_sites": sorted(bp_set),
        "matched": len(gs_set & bp_set),
        "genesco_only": sorted(gs_set - bp_set),
        "biopython_only": sorted(bp_set - gs_set),
        "match": gs_set == bp_set,
        "biopython_ms": round(bp_time_ms, 2)
    }


def write_csv(path, rows, fieldnames):
    """نوشتن نتایج به CSV"""
    if not rows:
        print(f"  [هشدار] داده‌ای برای نوشتن در {path} وجود ندارد")
        return

    with open(path, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"  ✓ نوشته شد: {path}")


def main():
    RESULTS_DIR.mkdir(exist_ok=True)

    print("=" * 60)
    print("مقایسه Tm و Restriction: GeneScope vs Biopython")
    print("=" * 60)

    sequences = load_fasta(SEQUENCES_FILE)
    print(f"تعداد توالی‌های آزمون: {len(sequences)}\n")

    tm_results = []
    restriction_results = []

    for name, seq in sequences.items():
        gs_json = load_genesco_json(name)
        if gs_json is None:
            print(f"⚠ {name}: خروجی GeneScope یافت نشد — رد شد")
            continue

        # Tm
        print(f"→ {name} ({len(seq)} bp)")
        tm_row = compare_tm(name, seq, gs_json)
        tm_results.append(tm_row)
        if tm_row["genesco_tm"] is not None:
            print(f"  Tm: GS={tm_row['genesco_tm']}°C, "
                  f"BP={tm_row['biopython_tm']}°C, "
                  f"Δ={tm_row['delta']}°C "
                  f"{'✓' if tm_row['pass'] else '✗'}")
        else:
            print(f"  Tm: {tm_row['note']}")

        # Restriction
        for enzyme in ["EcoRI", "BamHI", "HindIII"]:
            rest_row = compare_restriction(name, seq, gs_json, enzyme)
            if rest_row["genesco_sites"] or rest_row["biopython_sites"]:
                restriction_results.append(rest_row)
                print(f"  {enzyme}: GS={rest_row['genesco_sites']}, "
                      f"BP={rest_row['biopython_sites']} "
                      f"{'✓' if rest_row['match'] else '✗'}")

        print()

    # ذخیره Tm
    if tm_results:
        write_csv(
            RESULTS_DIR / "tm_comparison.csv",
            tm_results,
            ["sequence", "length", "genesco_tm", "biopython_tm",
             "delta", "pass", "biopython_ms", "note"]
        )

    # ذخیره Restriction
    if restriction_results:
        write_csv(
            RESULTS_DIR / "restriction_comparison.csv",
            restriction_results,
            ["sequence", "enzyme", "genesco_sites", "biopython_sites",
             "matched", "genesco_only", "biopython_only", "match", "biopython_ms"]
        )

    # خلاصه
    print("\n" + "=" * 60)
    print("خلاصه Tm")
    print("=" * 60)
    valid = [r for r in tm_results if r["delta"] is not None]
    if valid:
        passed = sum(1 for r in valid if r["pass"])
        avg_delta = sum(r["delta"] for r in valid) / len(valid)
        print(f"تعداد: {len(valid)}")
        print(f"قبول: {passed}/{len(valid)} ({passed / len(valid) * 100:.1f}%)")
        print(f"میانگین |ΔTm|: {avg_delta:.2f}°C")


if __name__ == "__main__":
    main()