import { GENESCOPE } from '../core/state.js';
import { showToast } from '../core/utils.js';
import { updateReportContent } from '../reporting/report.js';

export function render() { updateReportContent(); }

export function print() {
    if (!GENESCOPE.currentSeq) { showToast('ابتدا تحلیل کنید.'); return; }
    setTimeout(() => window.print(), 300);
}