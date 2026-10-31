"""
plot_tm.py
==========
تولید Figure 9 — مقایسه Tm بین GeneScope و Biopython
"""

import matplotlib.pyplot as plt
import numpy as np
from pathlib import Path

# داده‌های Tm
sequences = [
    'BRCA1\n(213 bp)',
    'ORF\n(36 bp)',
    'Restriction\n(39 bp)',
    'GC-rich\n(51 bp)',
    'AT-rich\n(50 bp)',
    'Align-ref\n(43 bp)',
    'Align-ident\n(43 bp)',
    'Align-SNV\n(43 bp)',
    'Align-indel\n(39 bp)',
]

gs_tm = np.array([76.24, 53.89, 58.75, 97.68, 46.00, 72.19, 72.19, 72.68, 71.33])
bp_tm = np.array([76.81, 49.91, 55.40, 94.87, 43.49, 69.69, 69.69, 70.18, 68.43])

delta = np.abs(gs_tm - bp_tm)

# شکل
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

# Panel A: Bar chart — Tm values
x = np.arange(len(sequences))
width = 0.35

ax1.bar(x - width/2, gs_tm, width, label='GeneScope',
        color='#06B6D4', edgecolor='black', linewidth=0.5)
ax1.bar(x + width/2, bp_tm, width, label='Biopython',
        color='#F59E0B', edgecolor='black', linewidth=0.5)

ax1.set_ylabel('Tm (°C)')
ax1.set_title('(a) Melting Temperature: GeneScope vs Biopython')
ax1.set_xticks(x)
ax1.set_xticklabels(sequences, fontsize=8, rotation=45, ha='right')
ax1.legend(loc='upper right')
ax1.grid(True, axis='y', alpha=0.3)

# Panel B: Delta Tm (absolute difference)
colors = ['#10B981' if d < 1.0 else '#EF4444' for d in delta]
ax2.bar(x, delta, color=colors, edgecolor='black', linewidth=0.5)
ax2.axhline(y=0.5, color='#F59E0B', linestyle='--',
            linewidth=2, label='Acceptance threshold (0.5°C)')

ax2.set_ylabel('|ΔTm| (°C)')
ax2.set_title('(b) Absolute Difference from Biopython')
ax2.set_xticks(x)
ax2.set_xticklabels(sequences, fontsize=8, rotation=45, ha='right')
ax2.legend(loc='upper left')
ax2.grid(True, axis='y', alpha=0.3)

# Annotate values
for i, d in enumerate(delta):
    ax2.text(i, d + 0.1, f'{d:.2f}', ha='center', fontsize=8)

plt.tight_layout()

Path('figures').mkdir(exist_ok=True)
plt.savefig('figures/figure9_tm_comparison.png', dpi=300, bbox_inches='tight')
plt.savefig('figures/figure9_tm_comparison.pdf', bbox_inches='tight')
print('✓ Saved: figures/figure9_tm_comparison.png')
plt.show()