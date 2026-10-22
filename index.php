<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>TRAPZONE — O som da nova geração</title>
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<button id="burger" aria-label="Abrir menu">☰</button>
<aside id="side">
  <a class="logo" href="#/">TRAP<span>ZONE</span></a>
  <nav>
    <a href="#/" data-r="home">🏠 Início</a>
    <a href="#/explorar" data-r="explorar">🧭 Explorar</a>
    <a href="#/artistas" data-r="artistas">🎤 Artistas</a>
    <a href="#/playlists" data-r="playlists">📀 Playlists</a>
    <a href="#/favoritos" data-r="favoritos">♥ Favoritos</a>
  </nav>
  <div id="userbox"></div>
</aside>
<main>
  <header class="top"><input id="q" type="search" placeholder="Buscar músicas e artistas…" aria-label="Buscar"></header>
  <div id="app"></div>
  <footer>© 2026 TRAPZONE · Projeto escolar · Prévias de 30s via API do Deezer</footer>
</main>
<div id="player">
  <div class="np"><div id="pcov" class="ph">♪</div><div><b id="ptitle">Nada tocando</b><small id="partist">Escolha uma faixa</small></div>
    <button id="pfav" aria-label="Favoritar">♡</button></div>
  <div class="ctrl">
    <div class="btns"><button id="prev" aria-label="Anterior">⏮</button><button id="pp" class="big" aria-label="Tocar/Pausar">▶</button><button id="next" aria-label="Próxima">⏭</button></div>
    <div class="bar"><span id="cur">0:00</span><input id="seek" type="range" min="0" max="100" value="0" aria-label="Progresso"><span id="dur">0:00</span></div>
  </div>
  <div class="vol">🔊 <input id="vol" type="range" min="0" max="1" step="0.05" value="0.8" aria-label="Volume"></div>
  <audio id="audio"></audio>
</div>
<script src="assets/js/fallback.js"></script>
<script src="assets/js/app.js"></script>
</body>
</html>
