"""
plot_validation.py
==================
تولید Figure 10 — خلاصه اعتبارسنجی همه ماژول‌ها
"""

import matplotlib.pyplot as plt
import numpy as np
from pathlib import Path

# داده‌های اعتبارسنجی
modules = [
    'Restriction\n(12 enzymes)',
    'Alignment\n(NW + SW)',
    'FASTA\nParsing',
    'Tm\n(>200 bp)',
    'Tm\n(<50 bp)',
    'ORF\n(internal only)',
]

# نرخ تطابق (0-100)
match_rates = [100, 100, 100, 100, 11.1, 100]
# رنگ‌بندی بر اساس وضعیت
colors = [
    '#10B981',  # Restriction — سبز (عالی)
    '#10B981',  # Alignment — سبز
    '#10B981',  # FASTA — سبز
    '#10B981',  # Tm long — سبز
    '#EF4444',  # Tm short — قرمز
    '#F59E0B',  # ORF — زرد (نیاز به توجه)
]

fig, ax = plt.subplots(figsize=(10, 5))

x = np.arange(len(modules))
bars = ax.bar(x, match_rates, color=colors, edgecolor='black', linewidth=0.5)

# خط آستانه
ax.axhline(y=90, color='gray', linestyle='--', linewidth=1.5,
           label='Paper-ready threshold (90%)')

ax.set_ylabel('Validation match rate (%)')
ax.set_title('GeneScope Validation Summary Across Modules')
ax.set_xticks(x)
ax.set_xticklabels(modules, fontsize=9, rotation=20, ha='right')
ax.set_ylim(0, 115)
ax.legend(loc='lower right')
ax.grid(True, axis='y', alpha=0.3)

# Annotate
for bar, rate in zip(bars, match_rates):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 2,
            f'{rate:.1f}%', ha='center', fontsize=10, fontweight='bold')

plt.tight_layout()

Path('figures').mkdir(exist_ok=True)
plt.savefig('figures/figure10_validation_summary.png', dpi=300, bbox_inches='tight')
print('✓ Saved: figures/figure10_validation_summary.png')
plt.show()