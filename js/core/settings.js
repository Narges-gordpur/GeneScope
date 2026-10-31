export const SETTINGS_KEY = 'genesco.settings.v11';

export const DEFAULT_SETTINGS = {
    theme: 'dark', helixSpeed: 16, helixAnimated: true, pulseDot: true, compactMode: false,
    geneticCode: '1', minORFLen: 30, includeReverseORF: true, defaultK: 3,
    cpgWindow: 200, cpgStep: 50, cpgObsExp: 0.6,
    nwMatch: 1, nwMismatch: -1, gapOpen: -2, gapExtend: -1,
    gcMin: 35, gcMax: 65, grqsMin: 70, maxNPercent: 10, minSeqLen: 3,
    warnTU: true, warnProtein: true, ncbiKey: '', apiTimeout: 20,
    storageMode: 'auto', lastSaved: null
};

function loadSettings() {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) return {...DEFAULT_SETTINGS};
        return {...DEFAULT_SETTINGS, ...JSON.parse(raw)};
    } catch(e) { return {...DEFAULT_SETTINGS}; }
}

export let SETTINGS = loadSettings();

export function persistSettings(s = SETTINGS) {
    try {
        if (s.storageMode === 'none') { localStorage.removeItem(SETTINGS_KEY); return; }
        s.lastSaved = new Date().toISOString();
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    } catch(e) {}
}

export function updateSetting(key, value) {
    SETTINGS[key] = value;
    persistSettings(SETTINGS);
}

export function replaceSettings(newSettings) {
    SETTINGS = newSettings;
    persistSettings(SETTINGS);
}