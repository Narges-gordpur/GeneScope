"""
bench_biopython.py
==================
بنچمارک مرجع Biopython برای مقایسه با GeneScope.

اجرا: py -3.12 benchmarks/bench_biopython.py
"""

import time
import statistics
import tracemalloc
import random
import csv
import math
from pathlib import Path

from Bio.Seq import Seq
from Bio.SeqUtils import gc_fraction, MeltingTemp as mt
from Bio.Align import PairwiseAligner
from Bio.Restriction import EcoRI, BamHI, HindIII


def generate_random_sequence(length: int, gc_ratio: float = 0.5) -> str:
    """تولید توالی تصادفی با نسبت GC مشخص"""
    gc = int(length * gc_ratio)
    at = length - gc
    pool = (
        ['G'] * (gc // 2) + ['C'] * (gc // 2) +
        ['A'] * (at // 2) + ['T'] * (at // 2)
    )
    random.shuffle(pool)
    return ''.join(pool)


def measure(fn, iterations: int = 10, warmup: int = 3) -> dict:
    """اندازه‌گیری زمان با warmup"""
    for _ in range(warmup):
        fn()

    times = []
    for _ in range(iterations):
        t0 = time.perf_counter()
        fn()
        dt = (time.perf_counter() - t0) * 1000  # ms
        times.append(dt)

    return {
        'mean': statistics.mean(times),
        'median': statistics.median(times),
        'min': min(times),
        'max': max(times),
        'std': statistics.stdev(times) if len(times) > 1 else 0,
    }


def bench_calculate_stats(seq: str) -> dict:
    """معادل calculateStats در GeneScope"""
    def op():
        s = Seq(seq)
        gc = gc_fraction(s) * 100
        counts = {b: seq.count(b) for b in 'ATGC'}
        entropy = 0
        total = len(seq)
        for b in 'ATGC':
            if counts[b] > 0:
                p = counts[b] / total
                entropy -= p * math.log2(p)
        return gc, entropy, counts
    return measure(op)


def bench_estimate_tm(seq: str) -> dict:
    """معادل estimateTm در GeneScope"""
    def op():
        return mt.Tm_NN(
            Seq(seq),
            Na=50, Mg=0, dnac1=125, dnac2=125,
            saltcorr=4, nn_table=mt.DNA_NN3
        )
    return measure(op)


def bench_alignment(seq1: str, seq2: str, mode: str = 'global') -> dict:
    """معادل needlemanWunsch / smithWaterman"""
    def op():
        aligner = PairwiseAligner()
        aligner.mode = mode
        aligner.match_score = 1
        aligner.mismatch_score = -1
        aligner.open_gap_score = -2
        aligner.extend_gap_score = -1
        return aligner.align(seq1, seq2)[0].score
    return measure(op, iterations=5)


def bench_restriction(seq: str) -> dict:
    """معادل findRestrictionSites برای سه آنزیم"""
    def op():
        s = Seq(seq)
        total = 0
        for enzyme in [EcoRI, BamHI, HindIII]:
            total += len(enzyme.search(s, linear=True))
        return total
    return measure(op)


def bench_orf_simple(seq: str, min_len: int = 30) -> dict:
    """ORF fallback ساده (مشابه pure_python در validation)"""
    stop = {'TAA', 'TAG', 'TGA'}

    def op():
        orfs = []
        for strand_seq in [seq, _revcomp(seq)]:
            for frame in range(3):
                start = -1
                for i in range(frame, len(strand_seq) - 2, 3):
                    codon = strand_seq[i:i+3]
                    if start == -1 and codon == 'ATG':
                        start = i
                    elif start != -1 and codon in stop:
                        if i + 3 - start >= min_len:
                            orfs.append((start, i + 3))
                        start = -1
        return orfs
    return measure(op)


def _revcomp(seq: str) -> str:
    """Reverse complement"""
    comp = {'A': 'T', 'T': 'A', 'G': 'C', 'C': 'G', 'N': 'N'}
    return ''.join(comp.get(c, 'N') for c in reversed(seq))


def main():
    print('═' * 70)
    print('Biopython Benchmark — Reference Implementation')
    print('═' * 70)
    import sys
    print(f'Python: {sys.version.split()[0]}')
    import Bio
    print(f'Biopython: {Bio.__version__}')
    print('Iterations: 10 (+ 3 warmup)')
    print('')

    sizes = [100, 1000, 10000, 100000, 1000000]
    results = []

    for size in sizes:
        print(f'\n▶ Size: {size:,} bp')
        seq = generate_random_sequence(size)
        seq2 = generate_random_sequence(size)

        # 1. Stats
        r = bench_calculate_stats(seq)
        r.update({'op': 'calculateStats', 'size': size})
        results.append(r)
        print(f'  calculateStats: {r["mean"]:.2f} ms')

        # 2. Tm (فقط تا 1kb)
        if size <= 1000:
            r = bench_estimate_tm(seq)
            r.update({'op': 'estimateTm', 'size': size})
            results.append(r)
            print(f'  estimateTm: {r["mean"]:.2f} ms')

        # 3. Restriction
        r = bench_restriction(seq)
        r.update({'op': 'restriction (3 enzymes)', 'size': size})
        results.append(r)
        print(f'  restriction: {r["mean"]:.2f} ms')

        # 4. ORF (fallback)
        r = bench_orf_simple(seq)
        r.update({'op': 'findORFs (fallback)', 'size': size})
        results.append(r)
        print(f'  findORFs: {r["mean"]:.2f} ms')

        # 5. Alignment (فقط تا 500 bp)
        if size <= 10000:
            n = min(size, 500)
            s1, s2 = seq[:n], seq2[:n]

            r = bench_alignment(s1, s2, mode='global')
            r.update({'op': 'NW alignment', 'size': n})
            results.append(r)
            print(f'  NW alignment (n={n}): {r["mean"]:.2f} ms')

            r = bench_alignment(s1, s2, mode='local')
            r.update({'op': 'SW alignment', 'size': n})
            results.append(r)
            print(f'  SW alignment (n={n}): {r["mean"]:.2f} ms')

    # خروجی CSV
    Path('results').mkdir(exist_ok=True)
    csv_path = 'results/benchmark_biopython.csv'
    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['Operation', 'Size', 'Mean_ms', 'Median_ms',
                        'Min_ms', 'Max_ms', 'Std_ms', 'Throughput_Mbps'])
        for r in results:
            writer.writerow([
                r['op'], r['size'],
                f'{r["mean"]:.3f}', f'{r["median"]:.3f}',
                f'{r["min"]:.3f}', f'{r["max"]:.3f}', f'{r["std"]:.3f}',
                f'{r["size"] / r["mean"] / 1000:.2f}'
            ])
    print(f'\n✓ Results saved to: {csv_path}')


if __name__ == '__main__':
    main()