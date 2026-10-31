import { GENESCOPE } from '../core/state.js';
import { showToast } from '../core/utils.js';
import { loadCodonTables } from '../core/codon-tables.js';
import { loadEnzymes } from '../restriction/enzymes.js';
import { registerView, switchView, toggleMobileSidebar, setupKeyboardShortcuts } from './navigation.js';
import * as Dashboard from './dashboard.js';
import * as Analyzer from './analyzer.js';
import * as FastaView from '../fasta/fasta-view.js';
import * as DatasetsView from './datasets-view.js';
import * as OrfView from '../orf/orf-view.js';
import * as KmerView from '../kmer/kmer-view.js';
import * as EnzymesView from '../restriction/enzymes-view.js';
import * as ComparisonView from '../alignment/comparison-view.js';
import * as ReportsView from './reports-view.js';
import * as Education from './education.js';
import * as SettingsView from './settings-view.js';
import * as Exports from '../reporting/exports.js';
import { updateReportContent } from '../reporting/report.js';
import { SETTINGS } from '../core/settings.js';

// Expose to window for inline onclick handlers
Object.assign(window, {
    showToast,
    switchView,
    toggleMobileSidebar,

    // Dashboard
    refreshDashboard: Dashboard.refresh,

    // Analyzer
    runComprehensiveAnalysis: Analyzer.run,
    loadSampleSeq: Analyzer.loadSample,
    clearSeqInput: Analyzer.clear,
    switchTransTab: Analyzer.switchTransTab,
    copyOutputText: Analyzer.copyOutput,

    // FASTA
    validateFastaContent: FastaView.validate,
    clearFastaBox: FastaView.clear,
    handleFastaFileUpload: FastaView.handleUpload,
    exportFastaCSV: FastaView.exportCSV,
    analyzeAllFastaSequences: FastaView.analyzeAll,
    runFullTestSuite: FastaView.runTests,
    updateFastaLiveStats: FastaView.updateLiveStats,

    // Datasets
    showNCBIFetchDialog: DatasetsView.showFetchDialog,
    fetchFromNCBI: DatasetsView.fetchFromNCBI,
    testNCBIConnectivity: DatasetsView.testConnectivity,
    clearDatasetCache: DatasetsView.clearCache,
    deleteDataset: DatasetsView.deleteDataset,
    renderDatasetsTable: DatasetsView.render,

    // ORF
    updateORFTable: OrfView.updateTable,
    renderORFMap: OrfView.renderMap,
    exportORFFasta: Exports.exportORFFasta,
    exportORFGFF: Exports.exportORFGFF,

    // K-mer
    computeKmers: KmerView.computeKmers,
    computeCpGAnalysis: KmerView.computeCpG,

    // Enzymes
    renderRestrictionMap: EnzymesView.renderMap,
    renderGel: EnzymesView.renderGel,
    setGelLight: EnzymesView.setGelLight,
    toggleGelInvert: EnzymesView.toggleInvert,
    saveGelPhoto: EnzymesView.savePhoto,

    // Comparison
    runComparison: ComparisonView.run,
    loadCompExample: ComparisonView.loadExample,

    // Reports
    printReport: ReportsView.print,
    exportAnalysisJSON: Exports.exportAnalysisJSON,
    updateReportContent,

    // Education
    switchEduTab: Education.switchTab,
    exportEducationReport: Education.exportJSON,
    printEducation: Education.printPDF,

    // Settings
    switchSettingsTab: SettingsView.switchTab,
    setTheme: SettingsView.setTheme,
    setHelixSpeed: SettingsView.setHelixSpeed,
    toggleHelixAnimation: SettingsView.toggleHelixAnimation,
    togglePulseDot: SettingsView.togglePulseDot,
    toggleCompactMode: SettingsView.toggleCompactMode,
    setDefaultK: SettingsView.setDefaultK,
    setMinORFLen: SettingsView.setMinORFLen,
    applyGeneticCodeDefault: SettingsView.applyGeneticCode,
    applyReverseORF: SettingsView.applyReverseORF,
    setCpGWindow: SettingsView.setCpGWindow,
    setCpGStep: SettingsView.setCpGStep,
    setCpGObsExp: SettingsView.setCpGObsExp,
    applyNWMatch: SettingsView.applyNWMatch,
    applyNWMismatch: SettingsView.applyNWMismatch,
    applyGapOpen: SettingsView.applyGapOpen,
    applyGapExtend: SettingsView.applyGapExtend,
    applyGCRange: SettingsView.applyGCRange,
    setGRQSMin: SettingsView.setGRQSMin,
    setMaxNPercent: SettingsView.setMaxNPercent,
    setMinSeqLen: SettingsView.setMinSeqLen,
    applyWarnTU: SettingsView.applyWarnTU,
    applyWarnProtein: SettingsView.applyWarnProtein,
    saveNCBIKey: SettingsView.saveNCBIKey,
    applyAPITimeout: SettingsView.applyAPITimeout,
    setStorageMode: SettingsView.setStorageMode,
    clearLocalStorage: SettingsView.clearLocalStorage,
    saveSettings: SettingsView.save,
    resetSettingsToDefault: SettingsView.reset,
    applyAllSettingsToUI: SettingsView.applyToUI
});

// Register views
registerView('dashboard', () => Dashboard.render());
registerView('analyzer', () => Analyzer.render());
registerView('fasta', () => FastaView.render());
registerView('datasets', () => DatasetsView.render());
registerView('orf', () => { OrfView.updateTable(); OrfView.renderMap(); });
registerView('kmer', () => { KmerView.computeKmers(SETTINGS.defaultK, null); KmerView.computeCpG(); });
registerView('enzymes', () => { EnzymesView.renderMap(); EnzymesView.renderGel(); });
registerView('comparison', () => ComparisonView.render());
registerView('reports', () => ReportsView.render());
registerView('education', () => Education.init());
registerView('settings', () => SettingsView.applyToUI());

async function boot() {
    try {
        await loadCodonTables();
        await loadEnzymes();
    } catch (e) {
        console.error('Failed to load data:', e);
        showToast('⚠ خطا در بارگذاری فایل‌های داده — از local server استفاده کنید');
        return;
    }

    document.getElementById('toggleSidebarBtn')?.addEventListener('click', () => {
        const sb = document.getElementById('appSidebar');
        sb.classList.toggle('collapsed');
        const icon = document.getElementById('toggleSidebarBtn').querySelector('i');
        icon.className = sb.classList.contains('collapsed')
            ? 'fa-solid fa-angles-left'
            : 'fa-solid fa-angles-right';
    });

    document.getElementById('sidebarOverlay')?.addEventListener('click', () => {
        document.getElementById('appSidebar').classList.remove('mobile-open');
        document.getElementById('sidebarOverlay').classList.remove('active');
    });

    const checkMobile = () => {
        const btn = document.getElementById('mobileMenuBtn');
        if (btn) btn.style.display = window.innerWidth <= 900 ? 'flex' : 'none';
    };
    window.addEventListener('resize', checkMobile);
    checkMobile();

    setupKeyboardShortcuts();
    SettingsView.applyToUI();
    Education.init();

    const ta = document.getElementById('fastaRawArea');
    if (ta) {
        ta.addEventListener('input', FastaView.updateLiveStats);
        ta.addEventListener('paste', () => setTimeout(FastaView.updateLiveStats, 10));
    }

    const dz = document.getElementById('fastaDropBox');
    if (dz) {
        ['dragenter','dragover'].forEach(ev =>
            dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add('dragover'); }));
        ['dragleave','drop'].forEach(ev =>
            dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove('dragover'); }));
        dz.addEventListener('drop', e => {
            const file = e.dataTransfer.files[0];
            if (file) FastaView.handleUpload({target: {files: [file]}});
        });
    }

    switchView('dashboard');
    showToast('GeneScope Pro v11.1 آماده است.');
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();