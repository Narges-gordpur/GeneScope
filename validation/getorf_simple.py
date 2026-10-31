# getorf_simple.py
from Bio.Seq import Seq
from Bio.SeqUtils import six_frame_translations
from pathlib import Path

def find_orfs(seq_str, min_size=30, table=1):
    """شبیه‌سازی getorf: یافتن ORFهای بین START و STOP در ۶ فریم"""
    seq = Seq(seq_str.upper())
    orfs = []
    start_codons = ["ATG"]
    stop_codons = ["TAA", "TAG", "TGA"]  # جدول ۱ استاندارد

    for strand, nuc in [(+1, seq), (-1, seq.reverse_complement())]:
        for frame in range(3):
            trans = nuc[frame:].translate(table=table)
            trans_str = str(trans)
            for i in range(len(trans_str)):
                if trans_str[i:i+3] in start_codons:
                    for j in range(i+3, len(trans_str), 3):
                        if trans_str[j:j+3] in stop_codons:
                            start = i * 3 + frame
                            end = j * 3 + frame + 3
                            if end - start >= min_size:
                                orfs.append({
                                    "start": start + 1,  # 1-based
                                    "end": end,
                                    "strand": "+" if strand == +1 else "-",
                                    "length": end - start
                                })
                            break
    return orfs

def run_getorf_fallback(input_fasta, min_size=30):
    """معادل getorf با پایتون"""
    from Bio import SeqIO
    results = {}
    for record in SeqIO.parse(input_fasta, "fasta"):
        orfs = find_orfs(str(record.seq), min_size)
        results[record.id] = orfs
    return results