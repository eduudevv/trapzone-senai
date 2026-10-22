<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
$f = __DIR__ . '/../config.php';
if (!file_exists($f)) { http_response_code(500); echo json_encode(['error'=>'Crie o config.php a partir do config.example.php']); exit; }
$CFG = require $f;
function json_out($d, $c = 200) { http_response_code($c); echo json_encode($d, JSON_UNESCAPED_UNICODE); exit; }
function body() { return json_decode(file_get_contents('php://input'), true) ?: []; }
function db() {
  global $CFG; static $p;
  if (!$p) {
    try { $p = new PDO("mysql:host={$CFG['db_host']};dbname={$CFG['db_name']};charset=utf8mb4", $CFG['db_user'], $CFG['db_pass'],
      [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]); }
    catch (Exception $e) { json_out(['error'=>'Falha ao conectar no banco'], 500); }
  }
  return $p;
}
function require_login() { if (empty($_SESSION['uid'])) json_out(['error'=>'Faça login'], 401); return (int)$_SESSION['uid']; }
function send_mail($to, $subject, $html) {
  global $CFG;
  $ch = curl_init('https://api.resend.com/emails');
  curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER=>true, CURLOPT_POST=>true, CURLOPT_TIMEOUT=>10,
    CURLOPT_HTTPHEADER=>['Authorization: Bearer '.$CFG['resend_key'], 'Content-Type: application/json'],
    CURLOPT_POSTFIELDS=>json_encode(['from'=>'TRAPZONE <onboarding@resend.dev>','to'=>[$to],'subject'=>$subject,'html'=>$html])]);
  curl_exec($ch); $code = curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
  return $code >= 200 && $code < 300;
}
