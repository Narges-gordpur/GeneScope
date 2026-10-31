import { GENESCOPE } from '../core/state.js';
import { showToast, escapeHtml } from '../core/utils.js';
import { findRestrictionSites, digestLinear } from './enzymes.js';

export function renderMap() {
    const tbody = document.getElementById('restrictionTableBody');
    if (!tbody) return;
    const seq = GENESCOPE.currentSeq;
    if (!seq) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:24px;">ابتدا توالی وارد کنید.</td></tr>'; return; }
    tbody.innerHTML = '';
    Object.keys(GENESCOPE.enzymes).forEach(name => {
        const r = findRestrictionSites(seq, name);
        const def = GENESCOPE.enzymes[name];
        const sitesDisplay = r.sites.length ? r.sites.map(s => s.cutTop).join(', ') : '—';
        const tr = document.createElement('tr');
        [
            {v: name, s: 'font-weight:700;'},
            {v: r.site, cls: 'mono', s: 'color:var(--cyan);'},
            {v: def.cut, cls: 'mono'},
            {v: def.type, s: 'font-size:11px;'},
            {v: r.count, cls: 'mono', s: r.count > 0 ? 'color:var(--emerald);font-weight:700;' : 'color:var(--text-muted);'},
            {v: sitesDisplay, cls: 'mono', s: 'font-size:11px;'}
        ].forEach(c => {
            const td = document.createElement('td');
            if (c.cls) td.className = c.cls;
            if (c.s) td.style.cssText = c.s;
            td.textContent = c.v;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

export function renderGel() {
    const lanesContainer = document.getElementById('gelLanesContainer');
    const fragTbody = document.getElementById('fragmentTable');
    if (!lanesContainer) return;
    const seq = GENESCOPE.currentSeq;
    if (!seq) {
        lanesContainer.innerHTML = '<div class="empty-state" style="width:100%;">ابتدا توالی وارد کنید.</div>';
        if (fragTbody) fragTbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px;">در انتظار ورودی</td></tr>';
        return;
    }
    const LADDER = [{bp:10000,rel:1.0},{bp:8000,rel:1.0},{bp:6000,rel:1.2},{bp:5000,rel:1.2},{bp:4000,rel:1.5},{bp:3000,rel:1.5},{bp:2000,rel:1.8},{bp:1500,rel:2.0},{bp:1000,rel:2.5},{bp:500,rel:3.0}];
    const TOP = 60, BOTTOM = 340;
    const LOG_MAX = Math.log10(10000), LOG_MIN = Math.log10(100);
    const bandTop = (bp) => {
        if (bp <= 0) return BOTTOM;
        const c = Math.max(100, Math.min(10000, bp));
        const l = Math.log10(c);
        const f = (LOG_MAX - l) / (LOG_MAX - LOG_MIN);
        return TOP + f * (BOTTOM - TOP);
    };

    lanesContainer.innerHTML = '';

    // Ladder
    const ladderWrap = document.createElement('div');
    ladderWrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;width:120px;';
    const ladderTitle = document.createElement('div');
    ladderTitle.style.cssText = 'font-size:11px;font-weight:700;color:#94A3B8;margin-bottom:8px;text-align:center;line-height:1.3;';
    ladderTitle.innerHTML = '<div style="color:#38BDF8;">لاین ۱ — L</div><span class="mono" style="font-size:9.5px;color:var(--cyan);">1 kb Plus Ladder</span>';
    ladderWrap.appendChild(ladderTitle);
    const ladderLane = document.createElement('div');
    ladderLane.className = 'gel-lane';
    ladderLane.style.cssText = 'position:relative;width:72px;height:340px;background:linear-gradient(180deg,rgba(255,255,255,0.01),rgba(255,255,255,0.03));border-radius:3px;border-left:1px dashed rgba(255,255,255,0.06);border-right:1px dashed rgba(255,255,255,0.06);';
    LADDER.forEach(b => {
        const band = document.createElement('div');
        band.style.cssText = `position:absolute;top:${bandTop(b.bp)}px;left:50%;transform:translateX(-50%);width:56px;height:${2+b.rel}px;background:#E0F2FE;border-radius:2px;opacity:${0.65+b.rel*0.1};filter:drop-shadow(0 0 4px #38BDF8);`;
        ladderLane.appendChild(band);
    });
    ladderWrap.appendChild(ladderLane);
    const ladderCaption = document.createElement('div');
    ladderCaption.style.cssText = 'font-size:9.5px;color:var(--text-muted);margin-top:8px;font-family:var(--font-mono);text-align:center;';
    ladderCaption.textContent = '10 باند';
    ladderWrap.appendChild(ladderCaption);
    lanesContainer.appendChild(ladderWrap);

    const activeEnzymes = Object.keys(GENESCOPE.enzymes).filter(n => findRestrictionSites(seq, n).count > 0);
    if (!activeEnzymes.length) {
        const e = document.createElement('div');
        e.className = 'empty-state';
        e.style.cssText = 'flex:1;display:flex;align-items:center;justify-content:center;min-width:300px;';
        e.innerHTML = '<div><i class="fa-solid fa-scissors" style="font-size:32px;color:var(--text-muted);display:block;margin-bottom:8px;"></i><br>هیچ آنزیمی جایگاه برش ندارد.</div>';
        lanesContainer.appendChild(e);
    } else {
        activeEnzymes.slice(0, 5).forEach((name, idx) => {
            const r = findRestrictionSites(seq, name);
            const cuts = [0, ...r.sites.map(s => s.cutTop - 1), seq.length].sort((a,b)=>a-b);
            const frags = [];
            for (let i = 0; i < cuts.length - 1; i++) if (cuts[i+1] > cuts[i]) frags.push(cuts[i+1] - cuts[i]);
            const wrap = document.createElement('div');
            wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;width:120px;';
            const title = document.createElement('div');
            title.style.cssText = 'font-size:11px;font-weight:700;color:#34D399;margin-bottom:8px;text-align:center;line-height:1.3;';
            title.innerHTML = `<div>لاین ${idx+2}</div><span class="mono" style="font-size:9.5px;color:#34D399;">${escapeHtml(name)}</span>`;
            wrap.appendChild(title);
            const lane = document.createElement('div');
            lane.className = 'gel-lane';
            lane.style.cssText = 'position:relative;width:72px;height:340px;background:linear-gradient(180deg,rgba(255,255,255,0.01),rgba(255,255,255,0.03));border-radius:3px;border-left:1px dashed rgba(255,255,255,0.06);border-right:1px dashed rgba(255,255,255,0.06);';
            const totalBp = frags.reduce((s,f)=>s+f,0) || 1;
            frags.forEach(frag => {
                const prop = frag / totalBp;
                const intensity = Math.max(0.35, Math.min(1.0, 0.3 + prop * 2.5));
                const height = Math.max(2, Math.min(6, 1 + intensity * 4));
                const width = 48 + intensity * 8;
                const band = document.createElement('div');
                band.className = 'gel-band';
                band.style.cssText = `position:absolute;top:${bandTop(frag)}px;left:50%;transform:translateX(-50%);width:${width}px;height:${height}px;border-radius:2px;opacity:${intensity};`;
                if (frag > 3000) band.style.background = '#67E8F9';
                else if (frag > 1000) band.style.background = '#BBF7D0';
                else if (frag > 500) band.style.background = '#86EFAC';
                else band.style.background = '#4ADE80';
                band.style.filter = 'drop-shadow(0 0 4px rgba(74,222,128,0.6))';
                lane.appendChild(band);
                const lbl = document.createElement('div');
                lbl.style.cssText = `position:absolute;top:${bandTop(frag)-6}px;left:78px;font-size:9px;font-family:var(--font-mono);color:#93C5FD;white-space:nowrap;font-weight:600;`;
                lbl.textContent = frag + ' bp';
                lane.appendChild(lbl);
            });
            wrap.appendChild(lane);
            const status = document.createElement('span');
            status.className = 'status-pill valid';
            status.style.cssText = 'padding:2px 8px;font-size:9.5px;margin-top:8px;';
            status.textContent = r.count + ' برش';
            wrap.appendChild(status);
            lanesContainer.appendChild(wrap);
        });
    }

    if (fragTbody) {
        fragTbody.innerHTML = '';
        if (!activeEnzymes.length) {
            fragTbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px;">هیچ آنزیمی برش نمی‌دهد.</td></tr>';
        } else {
            activeEnzymes.forEach(name => {
                const d = digestLinear(seq, [name]);
                const sizes = d.fragments.map(f => f.length).sort((a,b)=>b-a);
                const total = sizes.reduce((a,b)=>a+b,0);
                const tr = document.createElement('tr');
                [name, d.fragmentCount, sizes.join(' + '), total + ' bp'].forEach((v, i) => {
                    const td = document.createElement('td');
                    td.textContent = v;
                    if (i === 0) td.style.fontWeight = '700';
                    if (i === 2 || i === 3) td.className = 'mono';
                    tr.appendChild(td);
                });
                const status = document.createElement('td');
                status.innerHTML = total === seq.length
                    ? '<span class="status-pill valid"><i class="fa-solid fa-check"></i> مجموع صحیح</span>'
                    : '<span class="status-pill error">نامطابق</span>';
                tr.appendChild(status);
                fragTbody.appendChild(tr);
            });
        }
    }
}

export function setGelLight(mode) {
    const surface = document.getElementById('gelViewboxSurface');
    const uv = document.getElementById('btnUvLight');
    const blue = document.getElementById('btnBlueLight');
    if (!surface) return;
    if (mode === 'uv') {
        surface.classList.remove('blue-light');
        uv.style.cssText = 'border-radius:var(--radius-sm);padding:4px 10px;font-size:11px;font-weight:700;border:1px solid var(--cyan);color:#FFF;background:rgba(6,182,212,.15);';
        blue.style.cssText = 'border-radius:var(--radius-sm);padding:4px 10px;font-size:11px;font-weight:700;border:1px solid transparent;color:var(--text-secondary);background:transparent;';
        showToast('UV 302nm فعال.');
    } else {
        surface.classList.add('blue-light');
        blue.style.cssText = 'border-radius:var(--radius-sm);padding:4px 10px;font-size:11px;font-weight:700;border:1px solid var(--cyan);color:#FFF;background:rgba(6,182,212,.15);';
        uv.style.cssText = 'border-radius:var(--radius-sm);padding:4px 10px;font-size:11px;font-weight:700;border:1px solid transparent;color:var(--text-secondary);background:transparent;';
        showToast('Blue LED 470nm فعال.');
    }
}

export function toggleInvert() {
    const surface = document.getElementById('gelViewboxSurface');
    if (!surface) return;
    surface.classList.toggle('inverted');
    showToast(surface.classList.contains('inverted') ? 'حالت نگاتیو.' : 'حالت فلورسانس.');
}

export function savePhoto() {
    showToast('فتوگراف ژل — از Ctrl+P.');
    setTimeout(() => window.print(), 300);
}