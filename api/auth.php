<?php
require __DIR__ . '/../includes/bootstrap.php';
$a = $_GET['a'] ?? '';
$b = body();
if ($a === 'me') {
  if (empty($_SESSION['uid'])) json_out(['user'=>null]);
  $s = db()->prepare('SELECT id,nome,email FROM usuarios WHERE id=?'); $s->execute([$_SESSION['uid']]);
  json_out(['user'=>$s->fetch() ?: null]);
}
if ($a === 'logout') { session_destroy(); json_out(['ok'=>true]); }
$email = strtolower(trim($b['email'] ?? ''));
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) json_out(['error'=>'E-mail inválido'], 422);

if ($a === 'register') {
  $nome = trim($b['nome'] ?? ''); $senha = $b['senha'] ?? '';
  if (mb_strlen($nome) < 2 || strlen($senha) < 6) json_out(['error'=>'Nome (2+) e senha (6+ caracteres) obrigatórios'], 422);
  $s = db()->prepare('SELECT id FROM usuarios WHERE email=?'); $s->execute([$email]);
  if ($s->fetch()) json_out(['error'=>'Este e-mail já está cadastrado'], 409);
  db()->prepare('INSERT INTO usuarios(nome,email,senha) VALUES(?,?,?)')->execute([$nome, $email, password_hash($senha, PASSWORD_DEFAULT)]);
  session_regenerate_id(true); $_SESSION['uid'] = (int)db()->lastInsertId();
  send_mail($CFG['owner_email'], 'Novo cadastro na TRAPZONE',
    '<h2>Nova conta criada</h2><p><b>Nome:</b> '.htmlspecialchars($nome).'</p><p><b>E-mail:</b> '.htmlspecialchars($email).'</p>');
  json_out(['user'=>['id'=>$_SESSION['uid'],'nome'=>$nome,'email'=>$email]]);
}
if ($a === 'login') {
  $s = db()->prepare('SELECT * FROM usuarios WHERE email=?'); $s->execute([$email]); $u = $s->fetch();
  if (!$u || !password_verify($b['senha'] ?? '', $u['senha'])) json_out(['error'=>'E-mail ou senha incorretos'], 401);
  session_regenerate_id(true); $_SESSION['uid'] = (int)$u['id'];
  json_out(['user'=>['id'=>$u['id'],'nome'=>$u['nome'],'email'=>$u['email']]]);
}
if ($a === 'forgot') {
  $s = db()->prepare('SELECT nome FROM usuarios WHERE email=?'); $s->execute([$email]);
  if (!$s->fetch()) json_out(['error'=>'E-mail não encontrado'], 404);
  // Simulação: no modo de teste do Resend só entrega ao dono da conta.
  send_mail($CFG['owner_email'], 'Pedido de redefinição de senha',
    '<p>Pedido de redefinição para <b>'.htmlspecialchars($email).'</b>. (simulação — a senha não é trocada)</p>');
  json_out(['ok'=>true,'msg'=>'Pedido enviado! Verifique sua caixa de entrada.']);
}
json_out(['error'=>'Ação inválida'], 400);
