<?php
// Proxy da API pública do Deezer (sem chave). Evita CORS e permite cache.
require __DIR__ . '/../includes/bootstrap.php';
$a = $_GET['a'] ?? ''; $q = $_GET['q'] ?? ''; $id = (int)($_GET['id'] ?? 0); $n = min(max((int)($_GET['n'] ?? 12), 1), 50);
switch ($a) {
  case 'search':        $p = '/search?q='.urlencode($q)."&limit=$n"; break;
  case 'artist_search': $p = '/search/artist?q='.urlencode($q).'&limit=1'; break;
  case 'artist':        $p = "/artist/$id"; break;
  case 'top':           $p = "/artist/$id/top?limit=$n"; break;
  case 'related':       $p = "/artist/$id/related?limit=$n"; break;
  case 'albums':        $p = "/artist/$id/albums?limit=$n"; break;
  case 'track':         $p = "/track/$id"; break;
  default: json_out(['error'=>'Ação inválida'], 400);
}
$cf = sys_get_temp_dir().'/tz_'.md5($p).'.json';
if (file_exists($cf) && time() - filemtime($cf) < 600) { echo file_get_contents($cf); exit; }
$ch = curl_init('https://api.deezer.com'.$p);
curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER=>true, CURLOPT_TIMEOUT=>8, CURLOPT_FOLLOWLOCATION=>true]);
$r = curl_exec($ch); $c = curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
if (!$r || $c !== 200 || isset(json_decode($r, true)['error'])) json_out(['error'=>'Deezer indisponível'], 502);
file_put_contents($cf, $r); echo $r;
