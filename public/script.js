const BASE = window.APP_BASE_PATH || '';

function fmtBytes(n) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let i = 0;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(n >= 100 || i === 0 ? 0 : 1)} ${units[i]}`;
}
function fmtCount(n) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function level(pct) { return pct >= 100 ? 'over' : pct >= 90 ? 'crit' : pct >= 75 ? 'warn' : 'ok'; }

function bar(label, usedText, limitText, pct) {
  return `
    <div class="meter">
      <div class="meter-head">
        <span><b>${usedText}</b> / <b>${limitText}</b> ${label}</span>
        <span class="muted">${Math.round(pct)}% used</span>
      </div>
      <div class="track"><div class="fill ${level(pct)}" style="width:${Math.min(pct, 100)}%"></div></div>
    </div>`;
}

function card(r) {
  const diskPct = r.used_bytes / r.limit_bytes * 100;
  const filePct = r.file_limit ? r.file_count / r.file_limit * 100 : null;
  const full = diskPct >= 100 || (filePct !== null && filePct >= 100);
  return `
    <section class="card">
      <div class="card-head">
        <h2>${esc(r.type)} <span class="muted">/ ${esc(r.location)}</span>
          ${diskPct >= 90 ? '<i class="fas fa-triangle-exclamation warn-icon" title="Over 90% of quota"></i>' : ''}</h2>
        <a class="btn" href="/pun/sys/dashboard/files/fs${encodeURI(r.path)}" target="_blank"><i class="fas fa-folder-open"></i> Browse</a>
      </div>
      ${full ? '<div class="alert">Quota reached. New writes may fail.</div>' : ''}
      ${bar('disk space', fmtBytes(r.used_bytes), fmtBytes(r.limit_bytes), diskPct)}
      ${filePct === null
        ? `<div class="meter muted"><b>${fmtCount(r.file_count)}</b> files (no file limit)</div>`
        : bar('files', fmtCount(r.file_count), fmtCount(r.file_limit), filePct)}
      <div class="path muted">${esc(r.path)}</div>
    </section>`;
}

async function load() {
  const err = document.getElementById('error');
  try {
    const res = await fetch(`${BASE}/api/storage`);
    const body = await res.json();
    if (!body.success) throw new Error(body.error);
    document.getElementById('cards').innerHTML = body.data.map(card).join('');
    document.getElementById('last-update').textContent = new Date().toLocaleTimeString();
    err.classList.add('hidden');
  } catch (e) {
    err.textContent = `Unable to load storage data: ${e.message}`;
    err.classList.remove('hidden');
  }
}
document.getElementById('refresh-btn').addEventListener('click', load);
load();
setInterval(load, 120000);
