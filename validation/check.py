# check.py
import json
from Bio.Seq import Seq
from Bio.SeqUtils import MeltingTemp as mt
from Bio.Align import PairwiseAligner
from Bio.Restriction import EcoRI
import os

print("=" * 50)
print("مقایسه GeneScope با Biopython")
print("=" * 50)

# ============ ۱. Tm ============
seq_brca1 = "ATGGATTTATCTGCTCTTCGCGTTGAAGAAGTACAAAATGTCATTAATGCTATGCAGAAAATCTTAGAGTGTCCCATCTGTCTGGAGTTGATCAAGGAACCTGTCTCCACAAAGTGTGACCACATATTTTGCAAATTTTGCATGCTGAAACTTCTCAACCAGAAGAAAGGGCCTTCACAGTGTCCTTTATGTAAGAATGATATAACCAAAAGG"

if os.path.exists("brca1.json"):
    with open("brca1.json", encoding="utf-8") as f:
        gs = json.load(f)
    gs_tm = gs.get("statistics", {}).get("tm")
    bp_tm = mt.Tm_NN(Seq(seq_brca1), Na=50, Mg=0, dnac1=250, dnac2=250,
                     saltcorr=5, nn_table=mt.DNA_NN3)
    delta = abs(gs_tm - bp_tm) if gs_tm else None
    print(f"\n۱) Tm:")
    print(f"   GeneScope: {gs_tm:.2f}°C")
    print(f"   Biopython: {bp_tm:.2f}°C")
    print(f"   اختلاف:    {delta:.2f}°C")
    print(f"   نتیجه:     {'✓ قبول' if delta < 1.0 else '✗ رد'}")
else:
    print("\n۱) Tm: فایل brca1.json پیدا نشد")

# ============ ۲. ORF ============
seq_orf = "ATGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATAA"

if os.path.exists("orf.json"):
    with open("orf.json", encoding="utf-8") as f:
        gs = json.load(f)
    gs_orfs = gs.get("orfs", [])
    print(f"\n۲) ORF:")
    print(f"   GeneScope: {len(gs_orfs)} ORF یافت")
    if gs_orfs:
        print(f"   طول: {gs_orfs[0].get('length')} bp")
        print(f"   مختصات: {gs_orfs[0].get('start')} تا {gs_orfs[0].get('end')}")
    # انتظار: ۱ ORF به طول ۳۶ از ۱ تا ۳۶
    ok = len(gs_orfs) == 1 and gs_orfs[0].get("length") == 36
    print(f"   نتیجه: {'✓ قبول' if ok else '✗ رد'}")
else:
    print("\n۲) ORF: فایل orf.json پیدا نشد")

# ============ ۳. Restriction ============
seq_rest = "AAAGAATTCAAAAAATGAATTCAAAAAAGAATTCAAAAA"

if os.path.exists("restriction.json"):
    with open("restriction.json", encoding="utf-8") as f:
        gs = json.load(f)
    gs_sites = gs.get("restriction_sites", {}).get("EcoRI", [])
    bp_sites = list(EcoRI.search(Seq(seq_rest), linear=True))
    print(f"\n۳) Restriction (EcoRI):")
    print(f"   GeneScope: {gs_sites}")
    print(f"   Biopython: {bp_sites}")
    print(f"   نتیجه: {'✓ قبول' if gs_sites == bp_sites else '✗ رد (قرارداد مختصات متفاوت)'}")
else:
    print("\n۳) Restriction: فایل restriction.json پیدا نشد")

print("\n" + "=" * 50)
print("پایان")
print("=" * 50)