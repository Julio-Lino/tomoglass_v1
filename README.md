# Tomoglass - Landing Page

Site da Tomoglass, empresa de peças em fibra de vidro para carrocerias de ônibus em Guarulhos/SP. No mercado desde 1990.

## Estrutura do Projeto

```
tomoglass/
├── index.html              # Página principal
├── privacidade.html        # Política de privacidade (LGPD)
├── server.js               # Servidor Node.js (frontend + API)
├── package.json            # Dependências
├── .env.example            # Exemplo de variáveis de ambiente
├── .env                    # CONFIGURAÇÃO REAL (não versionar!)
├── assets/
│   ├── css/
│   │   └── style.css       # Estilos (claro/escuro)
│   └── js/
│       └── main.js         # JavaScript (menu, formulário, mapa, 3D)
├── api/
│   └── logs/               # Logs de orçamentos (protegido)
└── README.md               # Este arquivo
```

## Requisitos

- **Node.js 18+** (usa `fetch` nativo)
- npm (já vem com Node)

## Instalação Rápida

```bash
# Na pasta do projeto
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com seus dados

# Inicie o servidor
npm start
```

Acesse: http://localhost:8000

## Variáveis de Ambiente (.env)

Copie `.env.example` para `.env` e configure:

```env
# Servidor
PORT=8000

# E-mail de destino (recebe os orçamentos)
EMAIL_DESTINO=vendas@tomoglass.com.br

# SMTP (deixe vazio para apenas logar em dev)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=contato@tomoglass.com.br
SMTP_PASS=sua-app-password
SMTP_FROM_EMAIL=contato@tomoglass.com.br
SMTP_FROM_NAME=Tomoglass

# reCAPTCHA v3 (deixe vazio para desabilitar)
RECAPTCHA_SECRET=

# CORS (domínios permitidos, separados por vírgula)
CORS_ORIGINS=https://tomoglass.com.br,http://localhost:8000

# Rate limiting (5 requisições por IP por hora)
RATE_LIMIT_MAX=5
RATE_LIMIT_WINDOW=3600000

# Anexo (5 MB em bytes)
MAX_FILE_SIZE=5242880
```

## Google Maps

### Como obter a chave

1. Acesse https://console.cloud.google.com/
2. Crie um projeto ou selecione um existente
3. Ative a **Maps JavaScript API**
4. Vá em "Credenciais" > "Criar credencial" > "Chave de API"
5. Copie a chave

### Como restringir a chave (IMPORTANTE)

Na console do Google Cloud:

1. Vá em "Credenciais" > clique na sua chave
2. Em **Restrições de chave**:
   - **Aplicação**: selecione "Sites da Web (referenciadores HTTP)"
   - Adicione: `https://tomoglass.com.br/*` e `https://www.tomoglass.com.br/*`
   - Para testes locais: `http://localhost:8000/*` e `http://localhost/*`
3. Em **Restrições de API**:
   - Selecione "Restringir chave"
   - Marque apenas: **Maps JavaScript API**
   - (Geocoding API só se for geocodificar o endereço uma vez)
4. Salve

**Nunca deixe a chave sem restrição ou com APIs desnecessárias habilitadas.**

### Configurar a chave

Em `assets/js/main.js`:

```javascript
const GMAPS_KEY = ""; // <-- Coloque sua chave aqui
```

### Coordenadas

As coordenadas da empresa já estão configuradas em `main.js`:

```javascript
const EMPRESA_LAT = -23.461784;
const EMPRESA_LNG = -46.533322;
```

Para descobrir coordenadas de outro endereço, use o Geocoding **uma vez** e atualize as constantes (não geocodifique a cada visita).

### Fallback (sem chave)

Se a chave estiver vazia, o mapa usa um iframe embed do Google Maps sem necessidade de chave.

## Formulário de Orçamento

### Front-end (main.js)

- Validação cliente: nome, telefone (máscara BR), e-mail, detalhes, LGPD
- Máscara de telefone: `(11) 91234-5678` ou `(11) 2345-6789`
- Upload de anexo: JPG, PNG ou PDF, até 5 MB
- Honeypot anti-spam (campo oculto)
- reCAPTCHA v3 (opcional)
- Consentimento LGPD obrigatório
- Botões "Faça seu orçamento" rolam até o formulário e focam o primeiro campo

### Back-end (server.js)

- Aceita apenas POST em `/api/orcamento`
- Valida e sanitiza tudo no servidor
- Rate limiting: 5 requisições por IP/hora (express-rate-limit)
- Valida anexo por tipo MIME, extensão e tamanho (multer + validação manual)
- Proteção contra injeção de cabeçalhos de e-mail
- Escapa HTML
- Envio via Nodemailer SMTP
- Resposta automática ao cliente
- Log protegido em `api/logs/` (com `.htaccess` Deny from all)
- CORS fechado (apenas domínio próprio)

### Configuração do SMTP

No `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_USER=contato@tomoglass.com.br
SMTP_PASS=sua-app-password
SMTP_PORT=587
SMTP_FROM_EMAIL=contato@tomoglass.com.br
```

**Gmail**: use "App Password" (senha de app), não a senha normal. Ative a verificação em 2 passos primeiro.

**Se não configurar SMTP**, o servidor apenas loga os orçamentos (útil para desenvolvimento).

### reCAPTCHA v3 (opcional)

1. Acesse https://www.google.com/recaptcha/admin
2. Registre seu site (tipo v3)
3. Copie a **chave do site** (site key) para `main.js`:
   ```javascript
   const RECAPTCHA_SITE_KEY = "sua-chave-do-site";
   ```
4. Copie a **chave secreta** para o `.env`:
   ```env
   RECAPTCHA_SECRET=sua-chave-secreta
   ```

## Publicação na Hospedagem

### Opção 1: VPS / Servidor com Node.js (recomendado)

```bash
# Na VPS
git clone <seu-repo>
cd tomoglass
npm install --production
cp .env.example .env
# Edite .env

# Use PM2 para manter rodando
npm install -g pm2
pm2 start server.js --name tomoglass
pm2 startup
pm2 save
```

Configure um proxy reverso (Nginx/Apache) para a porta 8000, ou use o PM2 com Nginx:

```nginx
server {
    listen 80;
    server_name tomoglass.com.br www.tomoglass.com.br;
    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Opção 2: Hospedagem compartilhada (cPanel) - SEM Node.js

Se sua hospedagem não tem Node.js, use a **versão PHP** (me peça para recriar) ou deploy em serviço serverless:

- **Vercel**: deploy do `server.js` como função serverless
- **Railway / Render**: deploy direto do repositório
- **Netlify Functions**: adaptar `server.js` para função

### Via cPanel (se tiver Node.js)

1. No cPanel, vá em "Setup Node.js App"
2. Crie app, mode `production`, aponte para `server.js`
3. Instale dependências
4. Configure variáveis de ambiente na interface

## Teste Local

```bash
npm install
npm start
```

Acesse: http://localhost:8000

Para testar o mapa localmente, adicione `http://localhost:8000/*` aos referenciadores permitidos na chave do Google Maps.

## Checklist de Testes

### Formulário

- [ ] **Válido**: preencha todos os campos corretamente, envie, receba e-mail
- [ ] **Inválido**: deixe campos obrigatórios vazios, verifique mensagens de erro por campo
- [ ] **Telefone**: teste máscara `(11) 91234-5678` e `(11) 2345-6789`
- [ ] **Anexo grande**: envie arquivo > 5 MB, verifique erro
- [ ] **Anexo inválido**: envie .exe ou .doc, verifique erro
- [ ] **Spam (honeypot)**: preencha o campo oculto, verifique resposta silenciosa
- [ ] **Rate limiting**: envie 6x seguido, verifique bloqueio (429)
- [ ] **Captcha**: se configurado, verifique se bloqueia bots

### Mapa

- [ ] **Com chave**: mapa carrega com marcador, InfoWindow, zoom 16
- [ ] **Sem chave**: fallback com iframe embed
- [ ] **Modo escuro**: estilo escuro aplicado no mapa
- [ ] **Modo claro**: estilo padrão

### Responsividade

- [ ] **Desktop**: layout em 2 colunas, menu horizontal
- [ ] **Tablet**: menu mobile funciona, mapa empilhado
- [ ] **Celular**: formulário em 1 coluna, botões empilhados

### Acessibilidade

- [ ] **Labels**: todos os inputs têm label associada
- [ ] **Foco visível**: tab navegação com outline âmbar
- [ ] **aria-live**: mensagens de erro/sucesso anunciadas
- [ ] **Teclado**: formulário navegável por teclado

### Temas

- [ ] **Claro**: fundo #eef2f6, texto escuro
- [ ] **Escuro**: fundo #0d1824, texto claro
- [ ] **Transição**: alternância suave de tema

## Segurança

- `.env` contém credenciais - **não versionar** (já está no `.gitignore`)
- `api/logs/` protegido por `.htaccess` (Deny from all)
- Rate limiting por IP
- Proteção contra injeção de cabeçalhos
- Validação MIME real de anexos
- CORS fechado (apenas domínio próprio)

## Preenchimento Manual Necessário

Antes de publicar, configure:

1. **Chave do Google Maps** (`assets/js/main.js`):
   ```javascript
   const GMAPS_KEY = ""; // sua chave aqui
   ```

2. **Horário de funcionamento** (`assets/js/main.js`):
   ```javascript
   const HORARIO_FUNCIONAMENTO = ""; // ex.: "Seg a sex, 08h às 17h"
   ```

3. **Dados SMTP** (`.env`):
   - `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_PORT`

4. **Chaves do captcha** (opcional):
   - `RECAPTCHA_SITE_KEY` em `main.js`
   - `RECAPTCHA_SECRET` em `.env`

5. **E-mail de destino** (`.env`):
   - `EMAIL_DESTINO`: `vendas@tomoglass.com.br` (já configurado)

## Suporte

- E-mail: vendas@tomoglass.com.br
- Telefone: 11 2431-1682 / 11 2431-9905
- Endereço: Rua Manoel Alonso Almendra, nº 146, Jd. das Nações, Guarulhos, SP, CEP 07182-120

## Licença

© Tomoglass. Todos os direitos reservados.