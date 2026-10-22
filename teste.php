<?php // Abra http://localhost/trapzone/teste.php para diagnosticar. Apague antes de publicar, se quiser.
header('Content-Type: text/html; charset=utf-8');
function ok($t, $v) { echo ($v ? '✅ ' : '❌ ') . $t . '<br>'; }
echo '<h2>Diagnóstico TRAPZONE</h2>';
ok('config.php existe', is_file(__DIR__ . '/config.php'));
ok('extensão curl ativa', function_exists('curl_init'));
ok('extensão pdo_mysql ativa', extension_loaded('pdo_mysql'));
try {
  require __DIR__ . '/includes/bootstrap.php';
  db()->query('SELECT 1 FROM tz_usuarios LIMIT 1'); db()->query('SELECT 1 FROM tz_favoritos LIMIT 1');
  ok('Banco e tabelas (criados automaticamente)', true);
} catch (Throwable $e) { ok('Banco: ' . htmlspecialchars($e->getMessage()), false); }
if (function_exists('curl_init')) {
  $r = @file_get_contents('php://memory');
  $ch = curl_init('https://api.deezer.com/search?limit=1&q=trap'); curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8, CURLOPT_SSL_VERIFYPEER => false]);
  $res = curl_exec($ch); $err = curl_error($ch); curl_close($ch);
  ok('Deezer responde' . ($err ? ' (' . htmlspecialchars($err) . ')' : ''), $res && isset(json_decode($res, true)['data']));
}
ok('Arquivos novos (assets/js/app.js tem "carregar")', strpos(@file_get_contents(__DIR__ . '/assets/js/app.js'), 'carregar') !== false);
