"""
compare_alignment.py
=====================
مقایسه Sequence Alignment بین GeneScope و Biopython.
"""

import json
import time
import csv
from pathlib import Path

from biopython_reference import get_alignment_biopython

GENESCOPE_DIR = Path("genesco_json")
RESULTS_DIR = Path("results")


def load_fasta(fasta_path):
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


def compare_alignment_pair(name1, seq1, name2, seq2,
                           mode='global', match=1, mismatch=-1,
                           gap_open=-2, gap_extend=-1):
    """مقایسه یک جفت توالی"""

    # اجرا در Biopython
    t0 = time.perf_counter()
    bp_result = get_alignment_biopython(
        seq1, seq2, mode=mode,
        match=match, mismatch=mismatch,
        gap_open=gap_open, gap_extend=gap_extend
    )
    bp_time_ms = (time.perf_counter() - t0) * 1000

    if bp_result is None:
        return None

    return {
        "seq1": name1,
        "seq2": name2,
        "mode": mode,
        "biopython_score": bp_result["score"],
        "biopython_length": bp_result["length"],
        "biopython_ms": round(bp_time_ms, 2)
    }


def main():
    RESULTS_DIR.mkdir(exist_ok=True)

    print("=" * 60)
    print("مقایسه Alignment: Biopython PairwiseAligner")
    print("=" * 60)

    sequences = load_fasta("test_sequences.fasta")

    # جفت‌های آزمون
    pairs = [
        ("Alignment_ref_sequence", "Alignment_sample_identical"),
        ("Alignment_ref_sequence", "Alignment_sample_snv"),
        ("Alignment_ref_sequence", "Alignment_sample_indel"),
    ]

    results = []

    for name1, name2 in pairs:
        seq1 = sequences.get(name1)
        seq2 = sequences.get(name2)

        if not seq1 or not seq2:
            print(f"⚠ {name1} یا {name2} یافت نشد")
            continue

        # NW (global)
        for mode, label in [('global', 'NW'), ('local', 'SW')]:
            result = compare_alignment_pair(name1, seq1, name2, seq2, mode=mode)

            if result:
                result["label"] = f"{label} ({name2})"
                results.append(result)
                print(f"  {label} {name1} vs {name2}: "
                      f"score={result['biopython_score']}, "
                      f"len={result['biopython_length']}")

    # ذخیره CSV
    if results:
        csv_path = RESULTS_DIR / "alignment_comparison.csv"
        with open(csv_path, "w", encoding="utf-8-sig", newline="") as f:
            writer = csv.DictWriter(
                f,
                fieldnames=["label", "seq1", "seq2", "mode",
                            "biopython_score", "biopython_length", "biopython_ms"]
            )
            writer.writeheader()
            for r in results:
                writer.writerow({k: r[k] for k in writer.fieldnames})
        print(f"\n  ✓ نوشته شد: {csv_path}")


if __name__ == "__main__":
    main()