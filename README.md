# TRAPZONE — O som da nova geração

Streaming de **Trap Brasileiro**. Projeto Express (HTML, CSS, JavaScript e PHP + MySQL, sem framework).

**Tema:** Trap BR / cultura urbana nacional

**Integrantes:**
- Nome 1
- Nome 2
- Nome 3

## Funcionalidades
Home · 6 categorias (10+ faixas cada) · detalhe · favoritos (no banco) · busca/filtro sem recarregar ·
cadastro, login e redefinição de senha (MySQL, `password_hash`) · e-mail ao dono via **Resend** a cada novo cadastro ·
player fixo com prévias de 30s da **API do Deezer** · lista local de fallback se a API falhar.

## Como rodar (XAMPP)
1. Copie a pasta para `htdocs/trapzone`.
2. No phpMyAdmin, importe `database.sql`.
3. Copie `config.example.php` para `config.php` e preencha banco, chave do Resend e `owner_email`
   (no modo de teste, o Resend só entrega ao e-mail da própria conta).
4. Habilite a extensão `curl` no PHP e acesse `http://localhost/trapzone/`.

## Segurança
Senhas com hash, consultas preparadas (PDO), sessão no servidor, favoritos protegidos por login, chave só no `config.php` (ignorado pelo Git).
Áudios: apenas prévias oficiais oferecidas pelo Deezer.
