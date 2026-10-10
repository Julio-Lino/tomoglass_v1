/**
 * ============================================================
 * TOMOGLASS - Servidor Node.js
 * Arquivo: /server.js
 * Node.js 18+ (usa fetch nativo)
 * ============================================================
 * Serve o frontend estático + API /api/orcamento
 * Para usar: npm install && npm start
 * ============================================================
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8000;

// ----------------------------------------------------------
// Configuração (variáveis de ambiente / .env)
// ----------------------------------------------------------
const config = {
  emailDestino: process.env.EMAIL_DESTINO || 'vendas@tomoglass.com.br',
  allowedOrigins: (process.env.CORS_ORIGINS || 'https://tomoglass.com.br,http://localhost:8000').split(',').map(s => s.trim()),
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '3600000', 10), // 1 hora em ms
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '5', 10),
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || String(5 * 1024 * 1024), 10), // 5MB
  recaptchaSecret: process.env.RECAPTCHA_SECRET || '',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFromEmail: process.env.SMTP_FROM_EMAIL || '',
  smtpFromName: process.env.SMTP_FROM_NAME || 'Tomoglass',
};

// ----------------------------------------------------------
// Middleware
// ----------------------------------------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS fechado: aceitar apenas o próprio domínio
app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem Origin (mesmo servidor, apps locais)
    if (!origin) return callback(null, true);
    if (config.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origem não permitida pelo CORS'));
    }
  },
  methods: ['POST'],
  allowedHeaders: ['Content-Type', 'X-Honeypot', 'X-Requested-With'],
  credentials: true,
}));

// Rate limiting: 5 requisições por IP por hora
const limiter = rateLimit({
  windowMs: config.rateLimitWindow,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, errors: { limite: 'Muitas tentativas. Tente novamente em alguns minutos.' } },
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  },
});

// Multer: upload em memória (validação manual de MIME)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: config.maxFileSize },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Use JPG, PNG ou PDF.'));
    }
  },
});

// ----------------------------------------------------------
// Helpers de segurança
// ----------------------------------------------------------

// Limpa campo: remove tags HTML, quebras de linha e protege contra injeção de cabeçalho
function limparCampo(valor) {
  if (typeof valor !== 'string') return '';
  return valor
    .replace(/<[^>]*>/g, '')           // remove tags HTML
    .replace(/[\r\n]/g, '')            // remove quebras de linha (injeção)
    .replace(/(Content-Type:|Bcc:|Cc:)/gi, '') // proteção contra injeção
    .trim();
}

// Escapa HTML para exibição segura
function escaparHtml(str) {
  if (typeof str !== 'string') return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return str.replace(/[&<>"']/g, (m) => map[m]);
}

// Valida telefone brasileiro (10-11 dígitos)
function validarTelefone(telefone) {
  const digits = telefone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
}

// Valida formato de e-mail
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Verifica token reCAPTCHA v3
async function verificarRecaptcha(token) {
  if (!config.recaptchaSecret) return true; // captcha desabilitado
  if (!token) return false;

  try {
    const body = new URLSearchParams({
      secret: config.recaptchaSecret,
      response: token,
    }).toString();

    const resposta = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    const dados = await resposta.json();
    return dados.success === true;
  } catch (err) {
    console.error('Erro reCAPTCHA:', err.message);
    return false;
  }
}

// Cria transportador SMTP (se configurado)
function criarTransporter() {
  if (!config.smtpHost) return null;
  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465, // 465 = SSL, 587 = TLS
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });
}

// Salva log protegido
function salvarLog(entry) {
  const logDir = path.join(__dirname, 'api', 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // Protege diretório com .htaccess (caso esteja em hospedagem compartilhada)
  const htaccess = path.join(logDir, '.htaccess');
  if (!fs.existsSync(htaccess)) {
    fs.writeFileSync(htaccess, 'Deny from all\n');
  }

  const logFile = path.join(logDir, `orcamentos_${new Date().toISOString().slice(0, 7)}.log`);
  fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
}

// ----------------------------------------------------------
// ENDPOINT: POST /api/orcamento
// ----------------------------------------------------------
app.post('/api/orcamento', limiter, upload.single('anexo'), async (req, res) => {
  try {
    // ---------- Honeypot (anti-spam) ----------
    const honeypot = req.headers['x-honeypot'] || req.body.honeypot || '';
    if (honeypot) {
      // Spam detectado - resposta silenciosa (não revela o honeypot)
      return res.status(200).json({ ok: true, message: 'Recebemos sua cotação.' });
    }

    // ---------- reCAPTCHA v3 ----------
    const recaptchaOk = await verificarRecaptcha(req.body.recaptcha_token);
    if (!recaptchaOk) {
      return res.status(400).json({ ok: false, errors: { captcha: 'Verificação de segurança falhou.' } });
    }

    // ---------- Validação e sanitização ----------
    const erros = {};
    const nome = limparCampo(req.body.nome || '');
    const empresa = limparCampo(req.body.empresa || '');
    const telefone = limparCampo(req.body.telefone || '');
    const email = limparCampo(req.body.email || '');
    const peca = limparCampo(req.body.peca || '');
    const detalhes = limparCampo(req.body.detalhes || '');
    const lgpd = req.body.lgpd === 'on' || req.body.lgpd === true;

    if (!nome || nome.length < 3) {
      erros.nome = 'Informe seu nome completo (mín. 3 caracteres).';
    }

    if (!telefone || !validarTelefone(telefone)) {
      erros.telefone = 'Telefone inválido. Use (11) 91234-5678 ou (11) 2345-6789.';
    }

    if (!email || !validarEmail(email)) {
      erros.email = 'E-mail inválido.';
    }

    if (!peca) {
      erros.peca = 'Selecione o tipo de peça.';
    }

    if (!detalhes || detalhes.length < 10) {
      erros.detalhes = 'Informe os detalhes (mín. 10 caracteres).';
    }

    if (!lgpd) {
      erros.lgpd = 'É necessário concordar com a Política de Privacidade.';
    }

    // ---------- Validação do anexo ----------
    let anexo = null;
    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
      const allowedExt = ['jpg', 'jpeg', 'png', 'pdf'];

      if (!allowedExt.includes(ext)) {
        erros.anexo = 'Formato não permitido. Use JPG, PNG ou PDF.';
      } else if (req.file.size > config.maxFileSize) {
        erros.anexo = 'Arquivo muito grande. Máximo de 5 MB.';
      } else {
        anexo = {
          filename: req.file.originalname,
          content: req.file.buffer,
          contentType: req.file.mimetype,
        };
      }
    }

    // Erros de validação
    if (Object.keys(erros).length > 0) {
      return res.status(400).json({ ok: false, errors: erros });
    }

    // ---------- Prepara dados do e-mail ----------
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const dataHora = new Date().toLocaleString('pt-BR');
    const assunto = `Novo orçamento - Tomoglass - ${peca}`;

    let corpo = '=== NOVO ORÇAMENTO TOMOGLASS ===\n\n';
    corpo += `Nome: ${nome}\n`;
    corpo += `Empresa: ${empresa || '-'}\n`;
    corpo += `Telefone: ${telefone}\n`;
    corpo += `E-mail: ${email}\n`;
    corpo += `Tipo de peça: ${peca}\n`;
    corpo += `Detalhes:\n${detalhes}\n\n`;
    corpo += '--- Dados técnicos ---\n';
    corpo += `Data/hora: ${dataHora}\n`;
    corpo += `IP: ${ip}\n`;
    corpo += `User-Agent: ${limparCampo(req.headers['user-agent'] || '-')}\n`;

    // ---------- Envio do e-mail ----------
    let enviado = false;
    const transporter = criarTransporter();

    if (transporter) {
      try {
        const mailOptions = {
          from: `"${config.smtpFromName}" <${config.smtpFromEmail}>`,
          to: config.emailDestino,
          replyTo: `${nome} <${email}>`,
          subject: assunto,
          text: corpo,
        };
        if (anexo) mailOptions.attachments = [anexo];

        await transporter.sendMail(mailOptions);
        enviado = true;
      } catch (err) {
        console.error('Erro SMTP:', err.message);
      }
    } else {
      // Fallback: sem SMTP configurado, apenas log (em produção, configure SMTP)
      console.warn('SMTP não configurado. E-mail não enviado, apenas logado.');
      enviado = true; // considera "enviado" para não frustrar o usuário em dev
    }

    // ---------- Resposta automática ao cliente ----------
    if (enviado && email && transporter) {
      try {
        const autoRes = {
          from: `"${config.smtpFromName}" <${config.smtpFromEmail}>`,
          to: email,
          subject: 'Recebemos seu orçamento - Tomoglass',
          text: `Olá, ${nome}.\n\nRecebemos sua solicitação de orçamento para: ${peca}.\nNossa equipe entrará em contato em breve pelo telefone ${telefone} ou e-mail.\n\nAtenciosamente,\nEquipe Tomoglass\nhttps://tomoglass.com.br`,
        };
        await transporter.sendMail(autoRes);
      } catch (err) {
        console.error('Erro auto-reply:', err.message);
      }
    }

    // ---------- Salva log protegido ----------
    salvarLog({
      data: dataHora,
      nome,
      empresa,
      telefone,
      email,
      peca,
      detalhes,
      ip,
      anexo: anexo ? anexo.filename : null,
      enviado,
    });

    // ---------- Resposta ----------
    if (enviado) {
      res.status(200).json({
        ok: true,
        message: 'Recebemos sua cotação, entraremos em contato em breve.',
      });
    } else {
      res.status(500).json({
        ok: false,
        errors: {
          email: 'Erro ao enviar e-mail. Tente novamente ou ligue: 11 2431-1682 / 11 2431-9905',
        },
      });
    }
  } catch (err) {
    console.error('Erro no endpoint:', err);
    // Erro de multer (arquivo grande demais)
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ ok: false, errors: { anexo: 'Arquivo muito grande. Máximo de 5 MB.' } });
    }
    res.status(500).json({ ok: false, errors: { server: 'Erro interno do servidor.' } });
  }
});

// ----------------------------------------------------------
// Serve arquivos estáticos (frontend)
// ----------------------------------------------------------
app.use(express.static(path.join(__dirname)));

// Fallback: qualquer rota GET serve o index.html (SPA simples)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ----------------------------------------------------------
// Inicia o servidor
// ----------------------------------------------------------
app.listen(PORT, () => {
  console.log('========================================');
  console.log('  Tomoglass - Servidor Node.js');
  console.log(`  http://localhost:${PORT}`);
  console.log('========================================');
  if (!config.smtpHost) {
    console.log('⚠ SMTP não configurado (e-mails apenas logados)');
  }
  if (!process.env.RECAPTCHA_SECRET) {
    console.log('ℹ reCAPTCHA desabilitado');
  }
});