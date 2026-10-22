const $ = s => document.querySelector(s), app = $('#app'), audio = $('#audio');
const S = { user: null, favs: new Map(), tracks: new Map(), queue: [], i: -1, demo: false };
// Para trocar artistas, edite só esta área.
const ARTISTS = ['Ryu, the Runner', 'GA', 'Niink', 'Trux', 'Jovem Dex', 'Jé', 'Derek', 'Ghard', 'luangelus', 'Phl Notunrboy'];
const CATS = [
  { name: 'Em alta no Trap BR', artists: ['Ryu, the Runner', 'Jovem Dex', 'Niink', 'GA'] },
  { name: 'Trap Melódico', artists: ['Derek', 'Jé', 'luangelus'] },
  { name: 'Rimas e Flow', artists: ['Trux', 'Ghard', 'Phl Notunrboy'] },
  { name: 'Nova Geração', artists: ['Niink', 'Jovem Dex', 'Jé'] },
  { name: 'Underground', artists: ['Ghard', 'luangelus', 'Trux'] },
  { name: 'Romântico', artists: ['Derek', 'GA', 'Jé'] }];

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const api = async (u, o) => { const r = await fetch(u, o); const j = await r.json().catch(() => ({})); if (!r.ok) throw Object.assign(new Error(j.error || 'Erro'), { status: r.status }); return j; };
const post = (u, b) => api(u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
const dz = (a, p = {}) => api('api/deezer.php?' + new URLSearchParams({ a, ...p }));
const norm = d => ({ id: d.id, title: d.title || d.title_short, artist: d.artist?.name || '', artistId: d.artist?.id || 0,
  cover: d.album?.cover_medium || d.album?.cover_big || '', album: d.album?.title || '', preview: d.preview || '', dur: d.duration || 30 });
const keep = list => { list.forEach(t => S.tracks.set(t.id, t)); return list; };
const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const cov = (t, id = '') => t.cover ? `<img ${id} src="${esc(t.cover)}" alt="Capa de ${esc(t.title)}" loading="lazy">` : `<div class="ph" ${id}>♪</div>`;
const loading = () => (app.innerHTML = '<div class="state"><span class="spin"></span><p>Carregando…</p></div>');
const empty = m => `<div class="state">${m}</div>`;

async function searchTracks(q, n = 12) {
  const j = await dz('search', { q, n }); return keep((j.data || []).map(norm));
}
const ARTCACHE = new Map();
async function findArtist(n) {
  if (!ARTCACHE.has(n)) ARTCACHE.set(n, dz('artist_search', { q: n }).then(j => j.data?.[0] || null).catch(() => null));
  return ARTCACHE.get(n);
}
async function loadCat(c) {
  try {
    const parts = await Promise.all(c.artists.map(async n => {
      const a = await findArtist(n); if (!a) return [];
      return ((await dz('top', { id: a.id, n: 5 })).data || []).map(norm);
    }));
    const l = []; for (let i = 0; i < 5; i++) parts.forEach(p => p[i] && l.push(p[i]));
    const u = keep([...new Map(l.map(t => [t.id, t])).values()]).slice(0, 12);
    if (u.length) return u;
  } catch (e) {}
  S.demo = true; return keep(FALLBACK[c.name] || []);
}

/* ---------- cards ---------- */
const trackCard = t => `<article class="card"><a class="cv" href="#/faixa/${t.id}">${cov(t)}</a>
  <button class="play" data-play="${t.id}" aria-label="Tocar ${esc(t.title)}">▶</button>
  <h3>${esc(t.title)}</h3><p>${esc(t.artist)}</p></article>`;
const trackRow = t => `<div class="tr">${cov(t)}<div class="i"><a href="#/faixa/${t.id}"><b>${esc(t.title)}</b></a><small>${esc(t.artist)} · ${esc(t.album)}</small></div>
  <button class="ib" data-play="${t.id}" aria-label="Tocar">▶</button>
  <button class="ib ${S.favs.has(t.id) ? 'on' : ''}" data-fav="${t.id}" aria-label="Favoritar">${S.favs.has(t.id) ? '♥' : '♡'}</button></div>`;
const artistCard = a => `<article class="card artist"><a class="cv" href="#/artista/${a.id}"><img src="${esc(a.picture_medium)}" alt="${esc(a.name)}" loading="lazy"></a>
  <h3>${esc(a.name)}</h3><a class="btn ghost" style="font-size:12px;padding:6px 14px;margin-top:6px" href="#/artista/${a.id}">Ver perfil</a></article>`;
const demoTag = () => S.demo ? '<p><span class="tag">MODO DEMONSTRAÇÃO · API indisponível</span></p>' : '';
const setQueue = list => { S.queue = list.map(t => t.id); };

/* ---------- views ---------- */
const V = {
  async home() {
    const hist = JSON.parse(localStorage.tz_hist || '[]');
    app.innerHTML = `<section class="hero"><h1>O som da<br>nova geração.</h1><p>Descubra, explore e acompanhe o Trap Brasileiro. Prévias de 30s via Deezer.</p>
      <a class="btn" href="#/explorar">Explorar agora</a></section><div id="demo"></div>
      ${hist.length ? `<h2>Tocadas recentemente</h2><div class="row">${hist.map(trackCard).join('')}</div>` : ''}<div id="rows"></div>`;
    keep(hist);
    const lists = await Promise.all(CATS.map(loadCat));
    $('#demo').innerHTML = demoTag();
    $('#rows').innerHTML = CATS.map((c, i) => `<h2>${i == 0 ? '🔥 ' : ''}${c.name}</h2><div class="row">${lists[i].slice(0, 6).map(trackCard).join('')}</div>`).join('') +
      '<h2>✨ Sua próxima descoberta</h2><p style="color:var(--mut)">Vá em <a href="#/playlists" style="color:var(--lilac)">Playlists</a> e descubra seu estilo.</p>';
  },
  async explorar(cat = CATS[0].name) {
    loading();
    const c = CATS.find(x => x.name === cat) || CATS[0], list = await loadCat(c);
    setQueue(list);
    app.innerHTML = `<h2>Explorar</h2><div class="chips">${CATS.map(x => `<a class="chip ${x.name === c.name ? 'on' : ''}" href="#/explorar/${encodeURIComponent(x.name)}">${x.name}</a>`).join('')}</div>
      ${demoTag()}<input id="flt" class="form" style="max-width:100%;margin:0 0 16px;padding:12px;flex-direction:row" placeholder="Filtrar nesta categoria…" aria-label="Filtrar">
      <div class="row" id="grid">${list.map(trackCard).join('')}</div>`;
    $('#flt').oninput = e => { const v = e.target.value.toLowerCase(); const r = list.filter(t => (t.title + t.artist).toLowerCase().includes(v));
      $('#grid').innerHTML = r.length ? r.map(trackCard).join('') : empty('Nada encontrado'); };
  },
  async artistas() {
    loading();
    const l = (await Promise.all(ARTISTS.map(findArtist))).filter(Boolean);
    const seen = new Set(l.map(a => a.id));
    const rel = (await Promise.all(l.slice(0, 6).map(a => dz('related', { id: a.id, n: 3 }).then(j => j.data || []).catch(() => [])))).flat()
      .filter(a => !seen.has(a.id) && seen.add(a.id)).slice(0, 12);
    app.innerHTML = '<h2>Artistas em destaque</h2>' + (l.length ? `<div class="row">${l.map(artistCard).join('')}</div>` : empty('Não foi possível carregar os artistas agora.')) +
      (rel.length ? `<h2>Artistas relacionados</h2><div class="row">${rel.map(artistCard).join('')}</div>` : '');
  },
  async artista(id) {
    loading();
    try {
      const [a, top, alb, rel] = await Promise.all([dz('artist', { id }), dz('top', { id, n: 15 }), dz('albums', { id, n: 8 }), dz('related', { id, n: 6 }).catch(() => ({ data: [] }))]);
      const l = keep((top.data || []).map(norm)); setQueue(l);
      app.innerHTML = `<div class="banner" style="background-image:linear-gradient(transparent,#0b090d),url('${esc(a.picture_xl)}')"><div><h1>${esc(a.name)}</h1><p>${a.nb_fan?.toLocaleString('pt-BR')} fãs · Trap BR</p></div></div>
        <h2>Principais músicas</h2><div class="tracks">${l.map(trackRow).join('') || empty('Sem faixas')}</div>
        <h2>Álbuns e EPs</h2><div class="row">${(alb.data || []).map(x => `<article class="card"><img class="ph" src="${esc(x.cover_medium)}" alt="${esc(x.title)}" loading="lazy"><h3>${esc(x.title)}</h3><p>${(x.release_date || '').slice(0, 4)}</p></article>`).join('')}</div>\n        ${(rel.data || []).length ? `<h2>Artistas relacionados</h2><div class="row">${rel.data.map(artistCard).join('')}</div>` : ''}`;
    } catch (e) { app.innerHTML = empty('Artista indisponível. <a href="#/artistas">Voltar</a>'); }
  },
  async faixa(id) {
    loading();
    let t = S.tracks.get(+id);
    if (!t) try { t = norm(await dz('track', { id })); S.tracks.set(t.id, t); } catch (e) {}
    if (!t) return (app.innerHTML = empty('Faixa não encontrada. <a href="#/">Início</a>'));
    setQueue([t]);
    app.innerHTML = `<div class="detail">${cov(t)}<div><span class="tag">FAIXA</span><h1 style="font-size:40px">${esc(t.title)}</h1>
      <p>${t.artistId ? `<a href="#/artista/${t.artistId}" style="color:var(--lilac)">${esc(t.artist)}</a>` : esc(t.artist)} · ${esc(t.album)}</p>
      <p style="color:var(--mut)">${t.preview ? 'Prévia de 30s (Deezer)' : 'Sem áudio no modo demonstração'}</p>
      <p style="margin-top:16px"><button class="btn" data-play="${t.id}">▶ Tocar</button> <button class="btn ghost" data-fav="${t.id}">${S.favs.has(t.id) ? '♥ Favoritada' : '♡ Favoritar'}</button></p></div></div>`;
  },
  playlists() {
    const prefs = ['Melódico', 'Pesado', 'Romântico', 'Underground'];
    app.innerHTML = `<h2>Playlists temáticas</h2><div class="row">${CATS.map(c => `<a class="card" href="#/explorar/${encodeURIComponent(c.name)}"><div class="ph" style="height:140px">♫</div><h3>${c.name}</h3><p>Playlist editorial</p></a>`).join('')}</div>
      <h2>Descubra seu estilo</h2><div class="chips">${prefs.map(p => `<button class="chip" data-style="${p}">${p}</button>`).join('')}</div><div id="sug"></div>`;
    const map = { Melódico: 'Trap Melódico', Pesado: 'Underground', Romântico: 'Romântico', Underground: 'Underground' };
    app.querySelectorAll('[data-style]').forEach(b => b.onclick = () => { $('#sug').innerHTML = `<p>Sugestão para você: <a class="btn" href="#/explorar/${encodeURIComponent(map[b.dataset.style])}">${map[b.dataset.style]}</a></p>`; });
  },
  favoritos() {
    const l = [...S.favs.values()]; setQueue(l);
    app.innerHTML = '<h2>♥ Favoritos</h2>' + (l.length ? `<div class="tracks">${l.map(trackRow).join('')}</div>` : empty('Você ainda não favoritou nenhuma faixa.'));
  },
  perfil() {
    const h = JSON.parse(localStorage.tz_hist || '[]');
    app.innerHTML = `<h2>Perfil</h2><div class="form" style="max-width:100%"><div class="ph" style="width:80px;height:80px;border-radius:50%">${esc(S.user.nome[0])}</div>
      <h3>${esc(S.user.nome)}</h3><p>${esc(S.user.email)}</p><p>${S.favs.size} músicas favoritas</p></div><h2>Histórico recente</h2>
      ${h.length ? `<div class="tracks">${h.map(trackRow).join('')}</div>` : empty('Nada tocado ainda.')}`;
  },
  async busca(q) {
    q = decodeURIComponent(q); loading();
    try { const l = await searchTracks(q, 24); setQueue(l);
      app.innerHTML = `<h2>Resultados para “${esc(q)}”</h2>` + (l.length ? `<div class="tracks">${l.map(trackRow).join('')}</div>` : empty('Nenhum resultado.')); }
    catch (e) { app.innerHTML = empty('Erro na busca. Tente novamente.'); }
  },
  login() { form('Entrar', [['email', 'E-mail', 'email'], ['senha', 'Senha', 'password']], 'login', '<a href="#/esqueci">Esqueci a senha</a> · <a href="#/cadastro">Criar conta</a>'); },
  cadastro() { form('Criar conta', [['nome', 'Nome', 'text'], ['email', 'E-mail', 'email'], ['senha', 'Senha (mín. 6)', 'password']], 'register', '<a href="#/login">Já tenho conta</a>'); },
  esqueci() { form('Redefinir senha', [['email', 'Seu e-mail', 'email']], 'forgot', '<a href="#/login">Voltar</a>'); }
};
function form(title, fields, action, links) {
  app.innerHTML = `<form class="form" id="f"><h2 style="margin:0">${title}</h2>${fields.map(([n, p, t]) => `<input name="${n}" type="${t}" placeholder="${p}" aria-label="${p}" required>`).join('')}
    <div id="fm"></div><button class="btn">${title}</button><small style="color:var(--mut)">${links}</small></form>`;
  $('#f').onsubmit = async e => {
    e.preventDefault(); const fm = $('#fm');
    try { const r = await post('api/auth.php?a=' + action, Object.fromEntries(new FormData(e.target)));
      if (action === 'forgot') return (fm.innerHTML = `<div class="msg ok">${esc(r.msg)}</div>`);
      S.user = r.user; await loadFavs(); userbox(); location.hash = '#/'; }
    catch (err) { fm.innerHTML = `<div class="msg">${esc(err.message)}</div>`; }
  };
}

/* ---------- router ---------- */
const PROTECTED = ['favoritos', 'perfil'];
async function route() {
  const [, r = '', arg] = location.hash.split('/');
  const name = r || 'home';
  $('#side').classList.remove('open');
  document.querySelectorAll('#side nav a').forEach(a => a.classList.toggle('on', a.dataset.r === name));
  if (PROTECTED.includes(name) && !S.user) return (location.hash = '#/login');
  const v = V[name]; if (!v) return (app.innerHTML = empty('Página não encontrada. <a href="#/">Início</a>'));
  try { await v(arg ? decodeURIComponent(arg) : undefined); } catch (e) { app.innerHTML = empty('Algo deu errado. Tente novamente.'); }
  window.scrollTo(0, 0);
}
addEventListener('hashchange', route);
$('#burger').onclick = () => $('#side').classList.toggle('open');
let tm; $('#q').oninput = e => { clearTimeout(tm); const v = e.target.value.trim(); tm = setTimeout(() => { if (v) location.hash = '#/busca/' + encodeURIComponent(v); }, 400); };

/* ---------- auth / favs ---------- */
async function loadFavs() {
  S.favs.clear(); if (!S.user) return;
  try { (await api('api/favorites.php')).tracks.forEach(t => S.favs.set(t.id, t)); } catch (e) {}
}
function userbox() {
  $('#userbox').innerHTML = S.user ? `<a href="#/perfil"><b>👤 ${esc(S.user.nome)}</b></a><button class="btn ghost" id="out">Sair</button>`
    : '<a class="btn" href="#/login">Entrar</a><a class="btn ghost" href="#/cadastro">Cadastrar</a>';
  const o = $('#out'); if (o) o.onclick = async () => { await post('api/auth.php?a=logout', {}); S.user = null; S.favs.clear(); userbox(); location.hash = '#/login'; };
}
async function toggleFav(id) {
  if (!S.user) return (location.hash = '#/login');
  const t = S.tracks.get(+id); if (!t) return;
  try { const r = await post('api/favorites.php', { track: t }); r.fav ? S.favs.set(t.id, t) : S.favs.delete(t.id); refreshFav(); if (location.hash === '#/favoritos') V.favoritos(); else route(); }
  catch (e) { alert(e.message); }
}

/* ---------- player ---------- */
function playId(id) {
  id = +id; S.i = S.queue.indexOf(id); if (S.i < 0) { S.queue.push(id); S.i = S.queue.length - 1; }
  const t = S.tracks.get(id); if (!t) return;
  $('#ptitle').textContent = t.title; $('#partist').textContent = t.artist;
  const c = $('#pcov'); c.outerHTML = cov(t, 'id="pcov"'); refreshFav();
  const h = JSON.parse(localStorage.tz_hist || '[]').filter(x => x.id !== t.id); h.unshift(t); localStorage.tz_hist = JSON.stringify(h.slice(0, 10));
  localStorage.tz_last = JSON.stringify(t);
  if (!t.preview) { audio.removeAttribute('src'); setPlaying(false); alert('Faixa demonstrativa: sem áudio disponível.'); return; }
  audio.src = t.preview; audio.play().catch(() => {});
}
function refreshFav() {
  const t = S.tracks.get(S.queue[S.i]); const on = t && S.favs.has(t.id);
  $('#pfav').textContent = on ? '♥' : '♡'; $('#pfav').classList.toggle('on', !!on);
}
const setPlaying = p => { $('#pp').textContent = p ? '⏸' : '▶'; $('#pcov').classList.toggle('spinning', p); };
const step = d => { if (S.queue.length) playId(S.queue[(S.i + d + S.queue.length) % S.queue.length]); };
$('#pp').onclick = () => { if (!audio.src) return S.queue.length ? playId(S.queue[Math.max(S.i, 0)]) : null; audio.paused ? audio.play() : audio.pause(); };
$('#prev').onclick = () => step(-1); $('#next').onclick = () => step(1);
$('#pfav').onclick = () => S.queue[S.i] && toggleFav(S.queue[S.i]);
audio.onplay = () => setPlaying(true); audio.onpause = () => setPlaying(false); audio.onended = () => step(1);
audio.onerror = () => setPlaying(false);
audio.ontimeupdate = () => { $('#cur').textContent = fmt(audio.currentTime); if (audio.duration) $('#seek').value = audio.currentTime / audio.duration * 100; localStorage.tz_pos = audio.currentTime; };
audio.onloadedmetadata = () => $('#dur').textContent = fmt(audio.duration);
$('#seek').oninput = e => { if (audio.duration) audio.currentTime = e.target.value / 100 * audio.duration; };
audio.volume = 0.8; $('#vol').oninput = e => audio.volume = e.target.value;
document.addEventListener('click', e => {
  const p = e.target.closest('[data-play]'), f = e.target.closest('[data-fav]');
  if (p) { if (!S.queue.includes(+p.dataset.play)) setQueue([...S.tracks.values()].filter(t => S.queue.includes(t.id))); playId(p.dataset.play); }
  if (f) toggleFav(f.dataset.fav);
});

/* ---------- init ---------- */
(async () => {
  try { S.user = (await api('api/auth.php?a=me')).user; } catch (e) {}
  await loadFavs(); userbox();
  try { const t = JSON.parse(localStorage.tz_last || 'null'); if (t) { S.tracks.set(t.id, t); S.queue = [t.id]; S.i = 0; // continuar de onde parou
    $('#ptitle').textContent = t.title; $('#partist').textContent = t.artist; $('#pcov').outerHTML = cov(t, 'id="pcov"');
    if (t.preview) { audio.src = t.preview; audio.currentTime = +localStorage.tz_pos || 0; } } } catch (e) {}
  route();
})();
