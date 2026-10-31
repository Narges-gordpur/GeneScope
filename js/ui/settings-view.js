import { SETTINGS, updateSetting, persistSettings, replaceSettings, DEFAULT_SETTINGS, SETTINGS_KEY } from '../core/settings.js';
import { showToast } from '../core/utils.js';
import { GENESCOPE } from '../core/state.js';
import { refresh as refreshDashboard } from './dashboard.js';
import { updateTable as updateORFTable, renderMap as renderORFMap } from '../orf/orf-view.js';
import { computeKmers, computeCpG } from '../kmer/kmer-view.js';

export function switchTab(paneId, btn) {
    document.querySelectorAll('.settings-pane').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.settings-tab-btn').forEach(b => b.classList.remove('active'));
    const p = document.getElementById(paneId);
    if (p) p.classList.add('active');
    if (btn) btn.classList.add('active');
}

function applyTheme(theme) {
    const root = document.documentElement;
    const themes = {
        dark: {'--bg-base':'#07111F','--bg-subtle':'#0B1626','--surface':'#101D30','--surface-elevated':'#14243A','--surface-hover':'#192D47','--border':'#243449','--text-primary':'#F8FAFC','--text-secondary':'#94A3B8','--text-muted':'#64748B'},
        midnight: {'--bg-base':'#020617','--bg-subtle':'#0A0F1F','--surface':'#0F172A','--surface-elevated':'#1E293B','--surface-hover':'#334155','--border':'#1E293B','--text-primary':'#F1F5F9','--text-secondary':'#94A3B8','--text-muted':'#64748B'},
        solar: {'--bg-base':'#0F0524','--bg-subtle':'#1A0B3D','--surface':'#221347','--surface-elevated':'#2D1A57','--surface-hover':'#3B2468','--border':'#3B2468','--text-primary':'#F5F3FF','--text-secondary':'#C4B5FD','--text-muted':'#A78BFA'},
        light: {'--bg-base':'#F8FAFC','--bg-subtle':'#F1F5F9','--surface':'#FFFFFF','--surface-elevated':'#F1F5F9','--surface-hover':'#E2E8F0','--border':'#CBD5E1','--text-primary':'#0F172A','--text-secondary':'#475569','--text-muted':'#64748B'}
    };
    const t = themes[theme] || themes.dark;
    for (const [k, v] of Object.entries(t)) root.style.setProperty(k, v);
}

function applyCompactMode(on) {
    const style = document.getElementById('compactModeStyle') || document.createElement('style');
    style.id = 'compactModeStyle';
    style.textContent = on ? '.data-table th,.data-table td{padding:6px 8px!important;font-size:11.5px!important}' : '';
    if (!style.parentNode) document.head.appendChild(style);
}

export function applyToUI() {
    document.querySelectorAll('#themeGroup .settings-pill').forEach(b =>
        b.classList.toggle('active', b.dataset.theme === SETTINGS.theme));
    applyTheme(SETTINGS.theme);

    const hs = document.getElementById('helixSpeedRange');
    if (hs) {
        hs.value = SETTINGS.helixSpeed;
        document.getElementById('helixSpeedValue').textContent = SETTINGS.helixSpeed + 's';
    }
    document.documentElement.style.setProperty('--helix-speed', SETTINGS.helixSpeed + 's');
    const chkHelix = document.getElementById('chkHelixAnimated');
    if (chkHelix) chkHelix.checked = SETTINGS.helixAnimated;
    const chkPulse = document.getElementById('chkPulseDot');
    if (chkPulse) chkPulse.checked = SETTINGS.pulseDot;
    const chkCompact = document.getElementById('chkCompactMode');
    if (chkCompact) chkCompact.checked = SETTINGS.compactMode;
    applyCompactMode(SETTINGS.compactMode);

    const gc = document.getElementById('setGeneticCode');
    if (gc) gc.value = SETTINGS.geneticCode;
    const gcs = document.getElementById('geneticCodeSelect');
    if (gcs) gcs.value = SETTINGS.geneticCode;

    const orf = document.getElementById('setMinORFLen');
    if (orf) {
        orf.value = SETTINGS.minORFLen;
        document.getElementById('setMinORFLenValue').textContent = SETTINGS.minORFLen + ' bp';
    }
    const orfi = document.getElementById('orfMinLen');
    if (orfi) orfi.value = SETTINGS.minORFLen;
    const rev = document.getElementById('chkIncludeReverseORF');
    if (rev) rev.checked = SETTINGS.includeReverseORF;

    document.querySelectorAll('#settings-pane-algorithms .settings-pill[data-k]').forEach(b =>
        b.classList.toggle('active', parseInt(b.dataset.k) === SETTINGS.defaultK));
    const cw = document.getElementById('setCpGWindow');
    if (cw) cw.value = SETTINGS.cpgWindow;
    const cs = document.getElementById('setCpGStep');
    if (cs) cs.value = SETTINGS.cpgStep;
    const co = document.getElementById('setCpGObsExp');
    if (co) {
        co.value = SETTINGS.cpgObsExp;
        document.getElementById('setCpGObsExpValue').textContent = SETTINGS.cpgObsExp.toFixed(2);
    }

    const nm = document.getElementById('setNWMatch'); if (nm) nm.value = SETTINGS.nwMatch;
    const nmi = document.getElementById('setNWMismatch'); if (nmi) nmi.value = SETTINGS.nwMismatch;
    const go = document.getElementById('setGapOpen'); if (go) go.value = SETTINGS.gapOpen;
    const ge = document.getElementById('setGapExtend'); if (ge) ge.value = SETTINGS.gapExtend;

    const gmin = document.getElementById('setGCMin'); if (gmin) gmin.value = SETTINGS.gcMin;
    const gmax = document.getElementById('setGCMax'); if (gmax) gmax.value = SETTINGS.gcMax;
    const gm = document.getElementById('setGRQSMin');
    if (gm) {
        gm.value = SETTINGS.grqsMin;
        document.getElementById('setGRQSMinValue').textContent = SETTINGS.grqsMin;
    }
    const mn = document.getElementById('setMaxNPercent');
    if (mn) {
        mn.value = SETTINGS.maxNPercent;
        document.getElementById('setMaxNPercentValue').textContent = SETTINGS.maxNPercent + '%';
    }
    const ml = document.getElementById('setMinSeqLen'); if (ml) ml.value = SETTINGS.minSeqLen;
    const warnTU = document.getElementById('chkWarnTU'); if (warnTU) warnTU.checked = SETTINGS.warnTU;
    const warnProt = document.getElementById('chkWarnProtein'); if (warnProt) warnProt.checked = SETTINGS.warnProtein;

    const nk = document.getElementById('setNCBIKey'); if (nk) nk.value = SETTINGS.ncbiKey;
    const at = document.getElementById('setAPITimeout'); if (at) at.value = SETTINGS.apiTimeout;
    document.querySelectorAll('#settings-pane-network .settings-pill').forEach(b => {
        const mode = SETTINGS.storageMode;
        const txt = b.textContent;
        b.classList.toggle('active',
            (mode === 'auto' && txt.includes('خودکار')) ||
            (mode === 'session' && txt.includes('نشست')) ||
            (mode === 'none' && txt.includes('بدون')));
    });
    const ss = document.getElementById('storageStatus');
    if (ss) {
        ss.textContent = 'حالت فعلی: ' + (SETTINGS.storageMode === 'auto'
            ? 'ذخیره خودکار'
            : SETTINGS.storageMode === 'session'
                ? 'فقط این نشست'
                : 'بدون ذخیره');
    }
    if (SETTINGS.lastSaved) {
        const lsl = document.getElementById('lastSavedLabel');
        if (lsl) lsl.textContent = 'آخرین ذخیره: ' + new Date(SETTINGS.lastSaved).toLocaleString('fa-IR');
    }
}

export function setTheme(theme, btn) {
    updateSetting('theme', theme);
    document.querySelectorAll('#themeGroup .settings-pill').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    applyTheme(theme);
    showToast('تم ' + theme + ' اعمال شد.');
}
export function setHelixSpeed(val) {
    updateSetting('helixSpeed', parseInt(val));
    document.getElementById('helixSpeedValue').textContent = val + 's';
    document.documentElement.style.setProperty('--helix-speed', val + 's');
}
export function toggleHelixAnimation(on) {
    updateSetting('helixAnimated', on);
    document.getElementById('helixLadder')?.classList.toggle('paused', !on);
}
export function togglePulseDot(on) {
    updateSetting('pulseDot', on);
    const dot = document.querySelector('.stream-pulse');
    if (dot) { dot.style.animationPlayState = on ? 'running' : 'paused'; dot.style.opacity = on ? '1' : '0.3'; }
}
export function toggleCompactMode(on) {
    updateSetting('compactMode', on);
    applyCompactMode(on);
}
export function setDefaultK(k, btn) {
    updateSetting('defaultK', k);
    document.querySelectorAll('#settings-pane-algorithms .settings-pill[data-k]').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    computeKmers(k, null);
}
export function setMinORFLen(v) {
    updateSetting('minORFLen', parseInt(v));
    document.getElementById('setMinORFLenValue').textContent = v + ' bp';
    const oi = document.getElementById('orfMinLen'); if (oi) oi.value = v;
}
export function applyGeneticCode(v) {
    updateSetting('geneticCode', v);
    const s = document.getElementById('geneticCodeSelect'); if (s) s.value = v;
    if (GENESCOPE.currentSeq) { updateORFTable(); renderORFMap(); }
    showToast('جدول ژنتیکی: ' + v);
}
export function applyReverseORF(on) {
    updateSetting('includeReverseORF', on);
    if (GENESCOPE.currentSeq) { updateORFTable(); renderORFMap(); }
}
export function setCpGWindow(v) { updateSetting('cpgWindow', parseInt(v)); if (GENESCOPE.currentSeq) computeCpG(); }
export function setCpGStep(v) { updateSetting('cpgStep', parseInt(v)); if (GENESCOPE.currentSeq) computeCpG(); }
export function setCpGObsExp(v) {
    updateSetting('cpgObsExp', parseFloat(v));
    document.getElementById('setCpGObsExpValue').textContent = parseFloat(v).toFixed(2);
    if (GENESCOPE.currentSeq) computeCpG();
}
export function applyNWMatch(v) { updateSetting('nwMatch', parseInt(v)); }
export function applyNWMismatch(v) { updateSetting('nwMismatch', parseInt(v)); }
export function applyGapOpen(v) { updateSetting('gapOpen', parseInt(v)); }
export function applyGapExtend(v) { updateSetting('gapExtend', parseInt(v)); }
export function applyGCRange() {
    const min = parseInt(document.getElementById('setGCMin').value);
    const max = parseInt(document.getElementById('setGCMax').value);
    if (min >= max) { showToast('بازه GC نامعتبر.'); return; }
    updateSetting('gcMin', min);
    updateSetting('gcMax', max);
    if (GENESCOPE.currentSeq) refreshDashboard();
}
export function setGRQSMin(v) {
    updateSetting('grqsMin', parseInt(v));
    document.getElementById('setGRQSMinValue').textContent = v;
}
export function setMaxNPercent(v) {
    updateSetting('maxNPercent', parseInt(v));
    document.getElementById('setMaxNPercentValue').textContent = v + '%';
}
export function setMinSeqLen(v) { updateSetting('minSeqLen', parseInt(v)); }
export function applyWarnTU(on) { updateSetting('warnTU', on); }
export function applyWarnProtein(on) { updateSetting('warnProtein', on); }
export function saveNCBIKey(v) { updateSetting('ncbiKey', v); showToast('کلید NCBI ذخیره شد.'); }
export function applyAPITimeout(v) { updateSetting('apiTimeout', parseInt(v)); }
export function setStorageMode(mode, btn) {
    updateSetting('storageMode', mode);
    document.querySelectorAll('#settings-pane-network .settings-pill').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const status = document.getElementById('storageStatus');
    if (status) {
        status.textContent = 'حالت فعلی: ' + (mode === 'auto' ? 'ذخیره خودکار' : mode === 'session' ? 'فقط این نشست' : 'بدون ذخیره');
    }
    showToast('حالت ذخیره‌سازی: ' + mode);
}
export function clearLocalStorage() {
    if (!confirm('تمام داده‌ها حذف شوند؟')) return;
    localStorage.removeItem(SETTINGS_KEY);
    showToast('localStorage پاک شد.');
}
export function save() {
    persistSettings(SETTINGS);
    const el = document.getElementById('lastSavedLabel');
    if (el) el.textContent = 'آخرین ذخیره: ' + new Date().toLocaleString('fa-IR');
    showToast('تنظیمات ذخیره شد.');
}
export function reset() {
    if (!confirm('بازنشانی به پیش‌فرض؟')) return;
    localStorage.removeItem(SETTINGS_KEY);
    replaceSettings({...DEFAULT_SETTINGS});
    applyToUI();
    showToast('تنظیمات بازنشانی شد.');
}