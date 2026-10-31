"""
biopython_reference.py — نسخه نهایی
همه پارامترها با GeneScope یکسان.
"""

from Bio.Seq import Seq
from Bio.SeqUtils import MeltingTemp as mt
from Bio.Align import PairwiseAligner
from Bio.Restriction import EcoRI, BamHI, HindIII


def get_tm_biopython(seq_str, na=50, mg=0, dnac=125,
                     nn_table=None, saltcorr=3):
    """
    Tm با Nearest-Neighbor — سازگار با GeneScope.
    saltcorr=3: تصحیح نمک Owczarzy 2008 (نزدیک‌ترین به GeneScope).
    dnac=125 → effective 62.5 nM (معادل primerConc/4 در GeneScope).
    """
    if nn_table is None:
        nn_table = mt.DNA_NN3
    if not seq_str or len(seq_str) < 13 or len(seq_str) > 1000:
        return None
    if any(c not in 'ATGC' for c in seq_str.upper()):
        return None
    try:
        return mt.Tm_NN(Seq(seq_str.upper()), Na=na, Mg=mg,
                        dnac1=dnac, dnac2=dnac,
                        saltcorr=saltcorr, nn_table=nn_table)
    except Exception as e:
        print(f"  [Tm error]: {e}")
        return None


def get_alignment_biopython(seq1, seq2, mode='global',
                            match=1, mismatch=-1,
                            gap_open=-2, gap_extend=-1):
    try:
        a = PairwiseAligner()
        a.mode = mode
        a.match_score = match
        a.mismatch_score = mismatch
        a.open_gap_score = gap_open
        a.extend_gap_score = gap_extend
        alignments = a.align(seq1.upper(), seq2.upper())
        if not alignments:
            return None
        best = alignments[0]
        return {"score": best.score, "aligned1": str(best[0]),
                "aligned2": str(best[1]), "length": len(best[0]), "mode": mode}
    except Exception as e:
        print(f"  [Alignment error]: {e}")
        return None


def get_restriction_sites_biopython(seq_str, enzyme_name='EcoRI'):
    em = {'EcoRI': EcoRI, 'BamHI': BamHI, 'HindIII': HindIII}
    enz = em.get(enzyme_name)
    if enz is None:
        raise ValueError(f"Unknown enzyme: {enzyme_name}")
    try:
        return list(enz.search(Seq(seq_str.upper()), linear=True))
    except Exception as e:
        print(f"  [Restriction error]: {e}")
        return []