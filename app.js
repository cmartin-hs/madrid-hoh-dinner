async function load() {
  const res = await fetch('venues.json');
  const data = await res.json();
  window.__venues = data.venues || [];
  render();
}

function fmtMoney(x){
  if (x==null) return '—';
  if (typeof x === 'object') {
    const {min,max} = x;
    if (min!=null && max!=null) return `€${min.toFixed(0)}–${max.toFixed(0)}`;
  }
  return `€${Number(x).toFixed(0)}`;
}

function badge(text){return `<span class="badge">${text}</span>`;}

function normalizeAvail(s){
  if (!s) return '';
  s = String(s);
  if (s.toLowerCase().startsWith('conf')) return 'Confirmed';
  if (s.toLowerCase().startsWith('pend')) return 'Pending';
  return s;
}

function priceToNumber(pp){
  if (pp==null) return null;
  if (typeof pp === 'object') return pp.max ?? pp.min ?? null;
  const n = Number(pp);
  return isNaN(n) ? null : n;
}

function render(){
  const q = document.getElementById('search').value.toLowerCase();
  const priv = document.getElementById('privateFilter').value;
  const maxPrice = Number(document.getElementById('maxPrice').value);
  const availF = document.getElementById('availFilter').value;

  const cards = document.getElementById('cards');
  const venues = window.__venues
    .filter(v => {
      const hay = (v.venue||'') + ' ' + (v.neighborhood||'') + ' ' + (v.availabilityNotes||'') + ' ' + (v.menuOptions||'');
      if (q && !hay.toLowerCase().includes(q)) return false;
      if (priv && String(v.privateSpace).toLowerCase().indexOf(priv.toLowerCase()) === -1) return false;
      if (!isNaN(maxPrice) && document.getElementById('maxPrice').value) {
        const n = priceToNumber(v.pricePP);
        if (n!=null && n > maxPrice) return false;
      }
      if (availF && normalizeAvail(v.availability) !== availF) return false;
      return true;
    })
    .sort((a,b) => (b.weighted||0) - (a.weighted||0));

  cards.innerHTML = venues.map(v => {
    const price = v.pricePP==null ? '—' : (typeof v.pricePP==='object' ? `€${v.pricePP.min||''}–${v.pricePP.max||''}` : `€${v.pricePP}`);
    const total = v.estTotal==null ? '—' : (typeof v.estTotal==='object' ? `€${(v.estTotal.min||'')}–${(v.estTotal.max||'')}` : `€${v.estTotal}`);
    const ws = v.weighted!=null ? Math.max(0, Math.min(100, Number(v.weighted))).toFixed(0) : null;
    const scoreBar = ws ? `<div class="score"><div style="width:${ws}%"></div></div>` : '';
    const avail = normalizeAvail(v.availability) || '—';
    const priv = v.privateSpace || '—';
    const website = v.website ? `<a href="${v.website}" target="_blank" rel="noopener">Website</a>` : '';
    const email = v.contactEmail ? `<a href="mailto:${v.contactEmail}">Email</a>` : '';
    const phone = v.contactPhone ? `<a href="tel:${v.contactPhone}">Call</a>` : '';

    return `<div class="card">
      <h3>${v.venue}</h3>
      <div class="badges">
        ${badge(priv)} ${badge('Avail: ' + avail)} ${badge('€ pp: ' + price)} ${badge('Total: ' + total)}
      </div>
      <div class="row"><strong>Neighborhood:</strong> ${v.neighborhood||'—'}</div>
      <div class="row"><strong>Format:</strong> ${v.format||'—'}</div>
      <div class="row"><strong>Menu:</strong> ${v.menuOptions||'—'}</div>
      <div class="row"><strong>Drinks:</strong> ${v.drinksIncluded||'—'}</div>
      <div class="row"><strong>Notes:</strong> ${v.availabilityNotes||'—'}</div>
      ${scoreBar}
      <div class="actions">${website} ${email} ${phone}</div>
    </div>`;
  }).join('');
}

document.addEventListener('input', render);
document.getElementById('reset').addEventListener('click', () => {
  document.getElementById('search').value = '';
  document.getElementById('privateFilter').value = '';
  document.getElementById('maxPrice').value = '';
  document.getElementById('availFilter').value = '';
  render();
});

load();
