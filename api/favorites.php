<?php
require __DIR__ . '/../includes/bootstrap.php';
$uid = require_login();
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $t = body()['track'] ?? null;
  if (!$t || empty($t['id'])) json_out(['error'=>'Faixa inválida'], 422);
  $s = db()->prepare('SELECT id FROM favoritos WHERE usuario_id=? AND track_id=?'); $s->execute([$uid, $t['id']]);
  if ($s->fetch()) { db()->prepare('DELETE FROM favoritos WHERE usuario_id=? AND track_id=?')->execute([$uid, $t['id']]); json_out(['fav'=>false]); }
  db()->prepare('INSERT INTO favoritos(usuario_id,track_id,dados) VALUES(?,?,?)')->execute([$uid, $t['id'], json_encode($t, JSON_UNESCAPED_UNICODE)]);
  json_out(['fav'=>true]);
}
$s = db()->prepare('SELECT dados FROM favoritos WHERE usuario_id=? ORDER BY id DESC'); $s->execute([$uid]);
json_out(['tracks'=>array_map(fn($r)=>json_decode($r['dados'], true), $s->fetchAll())]);
