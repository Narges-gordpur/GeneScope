import { GENESCOPE } from '../core/state.js';
import { showToast } from '../core/utils.js';

const viewRegistry = {};

export function registerView(id, renderFn) {
    viewRegistry[id] = renderFn;
}

export function switchView(viewId) {
    GENESCOPE.activeView = viewId;
    document.querySelectorAll('.workspace-view').forEach(el => el.classList.remove('active'));
    const target = document.getElementById('view-' + viewId);
    if (target) target.classList.add('active');
    document.querySelectorAll('.nav-item').forEach(el =>
        el.classList.toggle('active', el.getAttribute('data-view') === viewId));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.innerWidth <= 900) {
        document.getElementById('appSidebar')?.classList.remove('mobile-open');
        document.getElementById('sidebarOverlay')?.classList.remove('active');
    }
    try { viewRegistry[viewId]?.(); } catch(e) { console.error('View render error:', e); }
}

export function toggleMobileSidebar() {
    document.getElementById('appSidebar')?.classList.toggle('mobile-open');
    document.getElementById('sidebarOverlay')?.classList.toggle('active');
}

export function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.altKey && !e.ctrlKey && !e.metaKey) {
            const shortcuts = {'1':'dashboard','2':'analyzer','3':'fasta','4':'datasets','5':'orf','6':'kmer','7':'enzymes','8':'comparison','9':'reports'};
            if (shortcuts[e.key]) { e.preventDefault(); switchView(shortcuts[e.key]); showToast('صفحه: ' + shortcuts[e.key]); return; }
        }
        if (e.key === 'Escape') {
            ['fastaAnalyzeAllPanel','diffResultsPanel','ncbiFetchPanel'].forEach(id => {
                const el = document.getElementById(id);
                if (el && el.style.display !== 'none') el.style.display = 'none';
            });
        }
    });
}