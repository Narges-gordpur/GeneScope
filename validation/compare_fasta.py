"""
مقایسه FASTA parsing GeneScope vs Biopython SeqIO
نسخه نهایی — با اصلاح denom برای RNA و پروتئین
"""

from Bio import SeqIO
from Bio.SeqUtils import gc_fraction
from io import StringIO


def detect_type(seq: str) -> str:
    """تشخیص نوع توالی (DNA/RNA/PROTEIN/UNKNOWN) — مشابه GeneScope"""
    s = seq.upper()
    if not s:
        return "UNKNOWN"

    # پروتئین: حاوی حروف اختصاصی پروتئین یا *
    if '*' in s or any(c in s for c in 'EFILPQZ'):
        return "PROTEIN"

    # RNA: U دارد ولی T ندارد
    if 'U' in s and 'T' not in s:
        return "RNA"

    # DNA: T دارد
    if 'T' in s:
        return "DNA"

    # فقط ACG (بدون T/U) → DNA به‌طور پیش‌فرض
    return "DNA"


def compute_gc(seq: str, seq_type: str) -> dict:
    """
    محاسبه GC با denominator شفاف — مشابه GeneScope.

    برای RNA: U جزء بازهای معتبر است (denominator = A+U+G+C)
    برای DNA: T جزء بازهای معتبر است (denominator = A+T+G+C)
    برای PROTEIN: GC محاسبه نمی‌شود
    """
    s = seq.upper()
    length = len(s)

    if seq_type == "PROTEIN":
        return {
            "gc": None,
            "denom": None,
            "excluded": None,
            "note": "N/A (protein)",
        }

    if seq_type == "RNA":
        valid_bases = 'AUGC'
    else:  # DNA
        valid_bases = 'ATGC'

    # شمارش بازهای معتبر
    g = s.count('G')
    c = s.count('C')
    denom = sum(1 for ch in s if ch in valid_bases)
    excluded = length - denom

    if denom == 0:
        return {
            "gc": None,
            "denom": 0,
            "excluded": excluded,
            "note": "no valid bases",
        }

    return {
        "gc": (g + c) / denom * 100,
        "denom": denom,
        "excluded": excluded,
        "note": "",
    }


test_cases = [
    (">s1\nATGCGTACGTAGCTAGCTAGCTAGC", "valid DNA"),
    (">r\nAUGGAUUUAUCUGCUCUUCGCGUUGAAGAAGUACAAAAUGUCAUUAAUGC", "RNA"),
    (">g\nATGCNNNNATGC", "with N (4 ambiguous)"),
    (">x\nATGCATGC", "no ambiguity"),
    (">p\nMKVLAAGIVG*", "protein with stop"),
    (">d\nATGCGTACGT\n>d\nGCGCGCATAT", "duplicate IDs"),
]


def main():
    print("=" * 72)
    print("GeneScope vs Biopython SeqIO — FASTA parsing comparison")
    print("=" * 72)
    print("Biopython: 1.88")
    print("gc_fraction(ambiguous='remove') — standard")
    print("=" * 72)

    for seq_text, label in test_cases:
        print(f"\n▶ {label}")

        try:
            records = list(SeqIO.parse(StringIO(seq_text), "fasta"))

            if not records:
                print("  ✗ No records parsed")
                continue

            for i, rec in enumerate(records):
                seq = str(rec.seq).upper()
                length = len(seq)
                seq_type = detect_type(seq)

                # محاسبه GC با منطق GeneScope
                gs_gc = compute_gc(seq, seq_type)

                # محاسبه GC با Biopython (فقط برای DNA/RNA)
                if seq_type == "PROTEIN":
                    bp_gc_val = None
                else:
                    try:
                        bp_gc_val = gc_fraction(rec.seq, ambiguous="remove") * 100
                    except Exception:
                        bp_gc_val = None

                # نمایش
                if len(records) > 1:
                    print(f"  Record {i+1}:")
                    print(f"    ID: {rec.id}")
                else:
                    print(f"  ID: {rec.id}")

                print(f"    Length: {length}")
                print(f"    Type: {seq_type}")

                if seq_type == "PROTEIN":
                    print(f"    GC: N/A (protein sequence)")
                else:
                    print(f"    GeneScope GC:  {gs_gc['gc']:.1f}% (denom={gs_gc['denom']}, excluded={gs_gc['excluded']})")
                    if bp_gc_val is not None:
                        print(f"    Biopython GC:  {bp_gc_val:.1f}%")

                        # بررسی تطابق
                        if abs(gs_gc['gc'] - bp_gc_val) < 0.1:
                            print(f"    Match: ✓")
                        else:
                            print(f"    Match: ✗ (Δ={abs(gs_gc['gc'] - bp_gc_val):.1f}%)")

                print()

        except Exception as e:
            print(f"  ✗ Error: {e}")

    print("=" * 72)
    print("Done.")


if __name__ == "__main__":
    main()