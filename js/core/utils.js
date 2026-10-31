export function cleanSequence(str) { return (str || '').replace(/[^A-Za-z*]/g, '').toUpperCase(); }

export function getComplement(seq) {
    const m = {A:'T',T:'A',C:'G',G:'C',U:'A',N:'N',R:'Y',Y:'R',S:'S',W:'W',K:'M',M:'K',B:'V',V:'B',D:'H',H:'D'};
    return seq.split('').map(b => m[b] || b).join('');
}

export function getReverseComplement(seq) {
    return getComplement(seq).split('').reverse().join('');
}

export function getRNA(seq) { return seq.replace(/T/g, 'U'); }

export function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

export function showToast(msg) {
    const c = document.getElementById('toastBox'); if (!c) return;
    const t = document.createElement('div'); t.className = 'scientific-toast';
    const i = document.createElement('i'); i.className = 'fa-solid fa-circle-check'; i.style.color = 'var(--cyan)';
    const s = document.createElement('span'); s.textContent = msg;
    t.appendChild(i); t.appendChild(s); c.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 3000);
}

export async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
        try { await navigator.clipboard.writeText(text); showToast('کپی شد.'); return true; }
        catch(e) { /* fall through */ }
    }
    try {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px;top:0;';
        document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
        showToast('کپی شد.'); return true;
    } catch(e) { showToast('کپی ناموفق.'); return false; }
}

export function downloadBlob(content, filename, mime) {
    const blob = new Blob([content], {type: mime});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 100);
}