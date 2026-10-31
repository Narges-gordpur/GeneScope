"""
plot_performance.py
===================
تولید Figure 4 — مقایسه عملکرد GeneScope vs Biopython
"""

import matplotlib.pyplot as plt
import numpy as np
from pathlib import Path

# داده‌ها از بنچمارک
sizes = np.array([100, 1000, 10000, 100000, 1000000])

# Sequence statistics
bio_stats = np.array([0.04, 0.08, 0.71, 4.52, 49.35])
gs_stats = np.array([0.30, 0.20, 1.70, 13.40, 116.60])

# ORF detection
bio_orf = np.array([0.08, 1.14, 10.46, 99.36, 1304.46])
gs_orf = np.array([0.20, 2.10, 20.80, 201.70, 2272.00])

# Restriction (per enzyme — normalized)
bio_restrict = np.array([0.033, 0.057, 1.04, 4.12, 41.4])
gs_restrict = np.array([0.008, 0.058, 0.55, 5.63, 56.1])

# استایل
plt.rcParams.update({
    'font.family': 'sans-serif',
    'font.size': 11,
    'axes.labelsize': 12,
    'axes.titlesize': 13,
    'legend.fontsize': 10,
    'figure.dpi': 150,
})

# ایجاد شکل
fig, axes = plt.subplots(1, 3, figsize=(15, 4.5))

# ─────────────────────────────────────────
# Panel A: Sequence Statistics
# ─────────────────────────────────────────
ax = axes[0]
ax.loglog(sizes, bio_stats, 'o-', color='#F59E0B',
          linewidth=2.5, markersize=9, label='Biopython 1.88')
ax.loglog(sizes, gs_stats, 's-', color='#06B6D4',
          linewidth=2.5, markersize=9, label='GeneScope v11.1')
ax.set_xlabel('Sequence length (bp)')
ax.set_ylabel('Runtime (ms)')
ax.set_title('(a) Sequence Statistics')
ax.grid(True, alpha=0.3, which='both')
ax.legend(loc='upper left')

# ─────────────────────────────────────────
# Panel B: ORF Detection
# ─────────────────────────────────────────
ax = axes[1]
ax.loglog(sizes, bio_orf, 'o-', color='#F59E0B',
          linewidth=2.5, markersize=9, label='Biopython 1.88')
ax.loglog(sizes, gs_orf, 's-', color='#06B6D4',
          linewidth=2.5, markersize=9, label='GeneScope v11.1')
ax.set_xlabel('Sequence length (bp)')
ax.set_ylabel('Runtime (ms)')
ax.set_title('(b) ORF Detection')
ax.grid(True, alpha=0.3, which='both')
ax.legend(loc='upper left')

# ─────────────────────────────────────────
# Panel C: Restriction (per enzyme)
# ─────────────────────────────────────────
ax = axes[2]
ax.loglog(sizes, bio_restrict, 'o-', color='#F59E0B',
          linewidth=2.5, markersize=9, label='Biopython (per enzyme)')
ax.loglog(sizes, gs_restrict, 's-', color='#06B6D4',
          linewidth=2.5, markersize=9, label='GeneScope (per enzyme)')
ax.set_xlabel('Sequence length (bp)')
ax.set_ylabel('Runtime (ms per enzyme)')
ax.set_title('(c) Restriction Mapping')
ax.grid(True, alpha=0.3, which='both')
ax.legend(loc='upper left')

plt.tight_layout()

# ذخیره
Path('figures').mkdir(exist_ok=True)
plt.savefig('figures/figure4_performance.png', dpi=300, bbox_inches='tight')
plt.savefig('figures/figure4_performance.pdf', bbox_inches='tight')
print('✓ Saved: figures/figure4_performance.png (300 dpi)')
print('✓ Saved: figures/figure4_performance.pdf')
plt.show()