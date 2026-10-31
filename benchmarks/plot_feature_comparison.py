"""
plot_feature_comparison.py
==========================
تولید Figure 11 — مقایسه تصویری GeneScope با ۵ ابزار معتبر
"""

import matplotlib.pyplot as plt
import numpy as np
from pathlib import Path

# ═══════════════════════════════════════════════════════════
# تعریف داده‌ها
# ═══════════════════════════════════════════════════════════

tools = [
    'GeneScope\nv11.1',
    'Biopython\n1.88',
    'EMBOSS\n6.6',
    'Galaxy',
    'Benchling',
    'NCBI\nORFfinder',
]

features = [
    'Browser-based',
    'Zero install',
    'No server',
    'Local privacy',
    'Free/open',
    'Offline',
    'Tm (NN)',
    'ORF',
    'Alignment',
    'Restriction',
    'K-mer',
    'CpG',
    'GRQS (novel)',
    'Education',
    'NCBI fetch',
    'Multi-export',
]

# ماتریس: 3 = کامل، 2 = جزئی، 1 = ندارد
# ردیف = ویژگی، ستون = ابزار
matrix = np.array([
    # GS, BP, EM, GA, BE, NCBI
    [3, 1, 1, 3, 3, 3],  # Browser-based
    [3, 1, 1, 2, 2, 3],  # Zero install
    [3, 3, 3, 1, 1, 1],  # No server
    [3, 3, 3, 1, 1, 1],  # Local privacy
    [3, 3, 3, 3, 1, 3],  # Free/open
    [3, 3, 3, 1, 1, 1],  # Offline
    [3, 3, 2, 3, 3, 1],  # Tm (NN)
    [3, 2, 3, 3, 3, 3],  # ORF
    [3, 3, 3, 3, 3, 1],  # Alignment
    [3, 3, 3, 3, 3, 1],  # Restriction
    [3, 2, 2, 3, 2, 1],  # K-mer
    [3, 2, 2, 3, 2, 1],  # CpG
    [3, 1, 1, 1, 1, 1],  # GRQS (novel)
    [3, 1, 1, 2, 3, 2],  # Education
    [3, 3, 3, 3, 3, 3],  # NCBI fetch
    [3, 3, 3, 3, 3, 2],  # Multi-export
])

# ═══════════════════════════════════════════════════════════
# رسم heatmap
# ═══════════════════════════════════════════════════════════

fig, ax = plt.subplots(figsize=(11, 9))

# رنگ‌بندی: 3=سبز (کامل)، 2=زرد (جزئی)، 1=قرمز (ندارد)
from matplotlib.colors import ListedColormap
cmap = ListedColormap(['#EF4444', '#F59E0B', '#10B981'])  # قرمز، زرد، سبز

im = ax.imshow(matrix, cmap=cmap, aspect='auto', vmin=1, vmax=3)

# تنظیم محورها
ax.set_xticks(np.arange(len(tools)))
ax.set_yticks(np.arange(len(features)))
ax.set_xticklabels(tools, fontsize=11, fontweight='bold')
ax.set_yticklabels(features, fontsize=10)

# چرخش برچسب‌های X
plt.setp(ax.get_xticklabels(), rotation=0, ha="center")

# افزودن نمادها
symbols = {3: '●', 2: '◐', 1: '○'}
for i in range(len(features)):
    for j in range(len(tools)):
        val = matrix[i, j]
        symbol = symbols[val]
        color = 'white' if val == 3 else 'black'
        ax.text(j, i, symbol, ha='center', va='center',
                fontsize=18, color=color, fontweight='bold')

# خطوط شبکه
ax.set_xticks(np.arange(len(tools)+1)-0.5, minor=True)
ax.set_yticks(np.arange(len(features)+1)-0.5, minor=True)
ax.grid(which='minor', color='white', linewidth=2)
ax.tick_params(which='minor', bottom=False, left=False)

# برجسته‌سازی ستون GeneScope
from matplotlib.patches import Rectangle
rect = Rectangle((-0.5, -0.5), 1, len(features),
                  fill=False, edgecolor='#06B6D4', linewidth=4)
ax.add_patch(rect)

# عنوان
ax.set_title('Feature Comparison: GeneScope vs Existing Tools',
             fontsize=15, fontweight='bold', pad=15)

# Legend
from matplotlib.patches import Patch
legend_elements = [
    Patch(facecolor='#10B981', label='● Full support'),
    Patch(facecolor='#F59E0B', label='◐ Partial / custom code'),
    Patch(facecolor='#EF4444', label='○ Not supported'),
]
ax.legend(handles=legend_elements, loc='upper center',
          bbox_to_anchor=(0.5, -0.08), ncol=3, fontsize=11,
          frameon=True, shadow=True)

plt.tight_layout()

# ذخیره
Path('figures').mkdir(exist_ok=True)
plt.savefig('figures/figure11_feature_comparison.png',
            dpi=300, bbox_inches='tight')
plt.savefig('figures/figure11_feature_comparison.pdf',
            bbox_inches='tight')
print('✓ Saved: figures/figure11_feature_comparison.png (300 dpi)')
print('✓ Saved: figures/figure11_feature_comparison.pdf')
plt.show()