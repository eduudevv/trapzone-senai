<?php
header('Content-Type: application/json; charset=utf-8');
$q = trim($_GET['q'] ?? 'trap brasil');
$url = 'https://api.deezer.com/search?limit=20&q=' . urlencode($q);
$ch = curl_init($url);
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_TIMEOUT => 8,
  CURLOPT_SSL_VERIFYPEER => false, // só para o XAMPP local
]);
$res = curl_exec($ch);
if ($res === false) { http_response_code(502); echo json_encode(['erro' => curl_error($ch)]); exit; }
$d = json_decode($res, true);
$out = [];
foreach (($d['data'] ?? []) as $t) {
  if (empty($t['preview'])) continue;
  $out[] = ['id' => $t['id'], 'titulo' => $t['title'], 'artista' => $t['artist']['name'],
            'capa' => $t['album']['cover_medium'], 'preview' => $t['preview']];
}
echo json_encode($out);