// ============================================================
// TOMOGLASS - Landing Page
// Arquivo: /assets/js/main.js
// ============================================================

// ============================================================
// ENDPOINT DA API
// Node.js: /api/orcamento
// PHP (alternativa): api/orcamento.php
// ============================================================
const API_ENDPOINT = "/api/orcamento";
// ------------------------------------------------------------
// IMPORTANTE: A chave do Google Maps (GMAPS_KEY) deve ser:
// 1. Restrita por "Referenciador HTTP" (HTTP referrers) ao domínio
//    tomoglass.com.br (e também localhost para testes).
// 2. Limitada às APIs: "Maps JavaScript API" (e "Geocoding API"
//    apenas se for geocodificar o endereço uma vez para descobrir
//    as coordenadas — não é necessário geocodificar a cada visita).
// 3. Nunca coloque uma chave real aqui. Deixe vazio para usar o
//    fallback (iframe embed sem chave).
// ============================================================
const GMAPS_KEY = ""; // <-- Coloque sua chave do Google Maps aqui (opcional)

// Coordenadas da Tomoglass (Rua Manoel Alonso Almendra, 146, Guarulhos/SP)
// Descobertas via Geocoding uma única vez (não geocodificar a cada visita).
const EMPRESA_LAT = -23.461784;
const EMPRESA_LNG = -46.533322;
const EMPRESA_ENDERECO = "Rua Manoel Alonso Almendra, nº 146, Jd. das Nações, Guarulhos, SP, CEP 07182-120";
const EMPRESA_NOME = "Tomoglass";

// ============================================================
// CONFIGURAÇÃO - reCAPTCHA v3 (opcional)
// ------------------------------------------------------------
// Chave do site (site key) do reCAPTCHA v3. Deixe vazio para
// desabilitar o captcha. A chave secreta fica no servidor
// (api/config.php).
// ============================================================
const RECAPTCHA_SITE_KEY = ""; // <-- Chave do site reCAPTCHA v3 (opcional)

// ============================================================
// CONFIGURAÇÃO - Horário de funcionamento (editável)
// ------------------------------------------------------------
// Edite o texto abaixo conforme o horário real da empresa.
// Este valor é exibido na seção "Onde estamos".
// ============================================================
const HORARIO_FUNCIONAMENTO = ""; // <-- Ex.: "Segunda a sexta, 08h às 17h"

// ============================================================
// FOTOS: coloque o endereço (URL) ou caminho de cada imagem.
// Vazio = espaço reservado (ilustração SVG ou 3D continua).
// ============================================================
var FOTOS = {
  hero: "",
  empresa: "",
  p1: "",
  p2: "",
  p3: "",
  p4: "",
  p5: "",
  p6: ""
};

// Carrega as fotos (quando configuradas)
document.querySelectorAll("[data-foto]").forEach(function (el) {
  var u = FOTOS[el.dataset.foto];
  if (!u) return;
  var i = new Image();
  i.alt = el.dataset.alt || "";
  i.loading = "lazy";
  i.onload = function () {
    el.appendChild(i);
    el.classList.add("has");
  };
  i.src = u;
});

// ============================================================
// HEADER - barra fixa com sombra ao rolar
// ============================================================
var hd = document.getElementById("hd");

function sc() {
  hd.classList.toggle("s", window.scrollY > 40);
}
sc();
addEventListener("scroll", sc, { passive: true });

// ============================================================
// MENU MOBILE
// ============================================================
var mb = document.getElementById("mb"),
  nv = document.getElementById("nv");

function tg(o) {
  nv.classList.toggle("o", o);
  mb.setAttribute("aria-expanded", o);
}

mb.onclick = function () {
  tg(!nv.classList.contains("o"));
};

nv.querySelectorAll("a").forEach(function (a) {
  a.onclick = function () {
    tg(false);
  };
});

// ============================================================
// ANIMAÇÕES DE SCROLL (reveal on scroll)
// ============================================================
var io = new IntersectionObserver(
  function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".rv").forEach(function (el, i) {
  el.style.transitionDelay = (i % 3) * 90 + "ms";
  io.observe(el);
});

// ============================================================
// FILTRO DE PRODUTOS
// ============================================================
document.querySelectorAll(".fl button").forEach(function (b) {
  b.onclick = function () {
    document.querySelectorAll(".fl button").forEach(function (x) {
      x.classList.remove("on");
    });
    b.classList.add("on");
    document.querySelectorAll(".pc").forEach(function (c) {
      c.classList.toggle(
        "h",
        b.dataset.f !== "all" && c.dataset.c.indexOf(b.dataset.f) < 0
      );
    });
  };
});

// ============================================================
// BOTÃO "FAÇA SEU ORÇAMENTO" - scroll suave + foco no campo
// ============================================================
function configurarBotoesOrcamento() {
  document.querySelectorAll(".btn-orcamento").forEach(function (btn) {
    btn.addEventListener("click", function (ev) {
      ev.preventDefault();
      var form = document.getElementById("orcamento");
      if (!form) return;

      // Scroll suave até o formulário
      form.scrollIntoView({ behavior: "smooth", block: "start" });

      // Foco no primeiro campo após o scroll (aguarda a transição)
      setTimeout(function () {
        var primeiroCampo = document.getElementById("n");
        if (primeiroCampo) primeiroCampo.focus({ preventScroll: true });
      }, 600);
    });
  });
}
configurarBotoesOrcamento();

// ============================================================
// MÁSCARA DE TELEFONE BRASILEIRO
// Formato: (11) 91234-5678 (celular) ou (11) 2345-6789 (fixo)
// ============================================================
function mascaraTelefone(valor) {
  // Remove tudo que não for dígito
  var digits = valor.replace(/\D/g, "");

  // Limita a 11 dígitos (DDD + número)
  digits = digits.substring(0, 11);

  if (digits.length <= 2) {
    return digits.length ? "(" + digits : "";
  }

  var ddd = digits.substring(0, 2);
  var numero = digits.substring(2);

  if (numero.length <= 4) {
    return "(" + ddd + ") " + numero;
  }

  // Celular: 5 dígitos antes do hífen (9xxxx-xxxx)
  // Fixo: 4 dígitos antes do hífen (xxxx-xxxx)
  if (digits.length === 11 && numero.charAt(0) === "9") {
    return "(" + ddd + ") " + numero.substring(0, 5) + "-" + numero.substring(5);
  } else {
    return "(" + ddd + ") " + numero.substring(0, 4) + "-" + numero.substring(4);
  }
}

var telefoneInput = document.getElementById("t");
if (telefoneInput) {
  telefoneInput.addEventListener("input", function (e) {
    e.target.value = mascaraTelefone(e.target.value);
  });
}

// ============================================================
// VALIDAÇÃO DO FORMULÁRIO (cliente)
// ============================================================
function validarFormulario() {
  var erros = {};
  var campos = {
    n: document.getElementById("n"),
    t: document.getElementById("t"),
    m: document.getElementById("m"),
    p: document.getElementById("p"),
    d: document.getElementById("d"),
    lgpd: document.getElementById("lgpd")
  };

  // Limpa erros anteriores
  document.querySelectorAll(".error").forEach(function (el) {
    el.textContent = "";
  });

  // Nome: obrigatório, mín. 3 caracteres
  if (!campos.n.value.trim() || campos.n.value.trim().length < 3) {
    erros.nome = "Informe seu nome completo (mín. 3 caracteres).";
  }

  // Telefone: obrigatório, formato brasileiro
  var telDigits = campos.t.value.replace(/\D/g, "");
  if (!campos.t.value.trim()) {
    erros.telefone = "Informe seu telefone.";
  } else if (telDigits.length < 10 || telDigits.length > 11) {
    erros.telefone = "Telefone inválido. Use (11) 91234-5678 ou (11) 2345-6789.";
  }

  // E-mail: obrigatório, formato válido
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!campos.m.value.trim()) {
    erros.email = "Informe seu e-mail.";
  } else if (!emailRegex.test(campos.m.value.trim())) {
    erros.email = "E-mail inválido.";
  }

  // Tipo de peça: obrigatório
  if (!campos.p.value) {
    erros.peca = "Selecione o tipo de peça.";
  }

  // Detalhes: obrigatório, mín. 10 caracteres
  if (!campos.d.value.trim() || campos.d.value.trim().length < 10) {
    erros.detalhes = "Informe os detalhes (mín. 10 caracteres).";
  }

  // LGPD: obrigatório
  if (!campos.lgpd.checked) {
    erros.lgpd = "É necessário concordar com a Política de Privacidade.";
  }

  // Anexo (opcional): validar se preenchido
  var anexoInput = document.getElementById("anexo");
  if (anexoInput && anexoInput.files.length > 0) {
    var arquivo = anexoInput.files[0];
    var tamanhoMax = 5 * 1024 * 1024; // 5 MB
    var extensoesPermitidas = ["jpg", "jpeg", "png", "pdf"];
    var ext = arquivo.name.split(".").pop().toLowerCase();

    if (arquivo.size > tamanhoMax) {
      erros.anexo = "Arquivo muito grande. Máximo de 5 MB.";
    } else if (extensoesPermitidas.indexOf(ext) === -1) {
      erros.anexo = "Formato não permitido. Use JPG, PNG ou PDF.";
    }
  }

  // Exibe erros
  var mapaErros = {
    nome: "err-n",
    telefone: "err-t",
    email: "err-m",
    peca: "err-p",
    detalhes: "err-d",
    lgpd: "err-lgpd",
    anexo: "err-anexo"
  };

  for (var campo in erros) {
    var el = document.getElementById(mapaErros[campo]);
    if (el) el.textContent = erros[campo];
  }

  return {
    valido: Object.keys(erros).length === 0,
    erros: erros
  };
}

// ============================================================
// ENVIO DO FORMULÁRIO (fetch + FormData)
// ============================================================
function enviarFormulario(form) {
  var botao = form.querySelector(".btn-submit");
  var btnText = botao.querySelector(".btn-text");
  var btnLoading = botao.querySelector(".btn-loading");
  var ok = document.getElementById("ok");

  // Estado: enviando
  botao.disabled = true;
  btnText.style.display = "none";
  btnLoading.style.display = "inline-flex";
  ok.textContent = "";
  ok.className = "ok";

  // Captura token reCAPTCHA v3 (se configurado)
  var recaptchaToken = document.getElementById("recaptcha_token");
  var promise = Promise.resolve();

  if (RECAPTCHA_SITE_KEY && window.grecaptcha) {
    promise = grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: "orcamento" })
      .then(function (token) {
        if (recaptchaToken) recaptchaToken.value = token;
      })
      .catch(function () {
        // Ignora erro do captcha (opcional)
      });
  }

  promise.then(function () {
    var formData = new FormData(form);

    // Remove campos que não devem ir no FormData
    formData.delete("honeypot"); // honeypot vai no cabeçalho

    return fetch(API_ENDPOINT, {
      method: "POST",
      body: formData,
      headers: {
        "X-Honeypot": form.querySelector("#honeypot") ? form.querySelector("#honeypot").value : "",
        "X-Requested-With": "XMLHttpRequest"
      }
    });
  })
  .then(function (response) {
    return response.json().then(function (data) {
      return { status: response.status, data: data };
    });
  })
  .then(function (result) {
    if (result.status === 200 && result.data.ok) {
      // Sucesso
      ok.textContent = "Recebemos sua cotação, entraremos em contato em breve.";
      ok.className = "ok success";
      form.reset();
    } else {
      // Erro do servidor
      var msg = result.data.errors ? Object.values(result.data.errors).join(" ") : "Erro ao enviar. Tente novamente.";
      ok.textContent = msg + " Ou ligue: 11 2431-1682 / 11 2431-9905";
      ok.className = "ok error";
    }
  })
  .catch(function () {
    ok.textContent = "Erro de conexão. Tente novamente ou ligue: 11 2431-1682 / 11 2431-9905";
    ok.className = "ok error";
  })
  .finally(function () {
    // Restaura botão
    botao.disabled = false;
    btnText.style.display = "inline";
    btnLoading.style.display = "none";
  });
}

var form = document.getElementById("fm");
if (form) {
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();

    // Verifica honeypot (se preenchido, é spam)
    var honeypot = document.getElementById("honeypot");
    if (honeypot && honeypot.value) {
      // Spam detectado - silenciosamente "aceita" para não revelar o honeypot
      var ok = document.getElementById("ok");
      ok.textContent = "Recebemos sua cotação, entraremos em contato em breve.";
      ok.className = "ok success";
      form.reset();
      return;
    }

    var validacao = validarFormulario();
    if (!validacao.valido) {
      // Foca no primeiro campo com erro
      var primeiroErro = form.querySelector(".error:not(:empty)");
      if (primeiroErro) {
        var campo = primeiroErro.closest(".f");
        if (campo) {
          var input = campo.querySelector("input, select, textarea");
          if (input) input.focus();
        }
      }
      return;
    }

    enviarFormulario(form);
  });
}

// ============================================================
// GOOGLE MAPS - Carregamento assíncrono com IntersectionObserver
// ============================================================
function detectarTemaEscuro() {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return document.documentElement.getAttribute("data-theme") !== "light";
  }
  return document.documentElement.getAttribute("data-theme") === "dark";
}

function carregarGoogleMaps() {
  var container = document.getElementById("mapa");
  var fallback = document.getElementById("mapa-fallback");
  if (!container) return;

  // Se não tem chave, usa fallback (iframe embed)
  if (!GMAPS_KEY) {
    mostrarFallbackMapa();
    return;
  }

  // Carrega a API do Google Maps de forma assíncrona
  var script = document.createElement("script");
  script.src = "https://maps.googleapis.com/maps/api/js?key=" + encodeURIComponent(GMAPS_KEY) + "&callback=inicializarMapa";
  script.async = true;
  script.defer = true;
  script.onerror = function () {
    mostrarFallbackMapa();
  };
  document.head.appendChild(script);

  // Callback global para a API
  window.inicializarMapa = function () {
    try {
      var escuro = detectarTemaEscuro();

      var mapa = new google.maps.Map(container, {
        center: { lat: EMPRESA_LAT, lng: EMPRESA_LNG },
        zoom: 16,
        styles: escuro ? estiloMapaEscuro : []
      });

      var marker = new google.maps.Marker({
        position: { lat: EMPRESA_LAT, lng: EMPRESA_LNG },
        map: mapa,
        title: EMPRESA_NOME,
        animation: google.maps.Animation.DROP
      });

      var infoWindow = new google.maps.InfoWindow({
        content: "<div style='padding:8px'><strong>" + EMPRESA_NOME + "</strong><br>" + EMPRESA_ENDERECO + "</div>",
        maxWidth: 280
      });

      marker.addListener("click", function () {
        infoWindow.open(mapa, marker);
      });

      // Abre InfoWindow automaticamente após carregar
      setTimeout(function () {
        infoWindow.open(mapa, marker);
      }, 800);
    } catch (err) {
      console.warn("Erro ao inicializar mapa", err);
      mostrarFallbackMapa();
    }
  };
}

function mostrarFallbackMapa() {
  var container = document.getElementById("mapa");
  var fallback = document.getElementById("mapa-fallback");
  if (!container || !fallback) return;

  // Tenta iframe embed (não precisa de chave)
  var iframe = document.createElement("iframe");
  var enderecoCodificado = encodeURIComponent(EMPRESA_ENDERECO);
  iframe.src = "https://www.google.com/maps?q=" + enderecoCodificado + "&output=embed";
  iframe.width = "100%";
  iframe.height = "100%";
  iframe.style.border = "0";
  iframe.loading = "lazy";
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = "no-referrer-when-downgrade";
  iframe.title = "Mapa da localização da Tomoglass";

  container.innerHTML = "";
  container.appendChild(iframe);

  // Esconde o cartão de fallback (o iframe é o fallback principal)
  fallback.style.display = "none";
}

// Estilo escuro para o mapa (quando em modo escuro)
var estiloMapaEscuro = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
  { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] }
];

// Carrega o mapa quando a seção entrar na tela
var mapaSection = document.getElementById("onde-estamos");
if (mapaSection) {
  var mapaObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          carregarGoogleMaps();
          mapaObserver.unobserve(mapaSection);
        }
      });
    },
    { threshold: 0.1 }
  );
  mapaObserver.observe(mapaSection);
}

// Atualiza horário de funcionamento (se configurado)
if (HORARIO_FUNCIONAMENTO) {
  var horarioEl = document.getElementById("horario-funcionamento");
  if (horarioEl) horarioEl.textContent = HORARIO_FUNCIONAMENTO;
}

// ============================================================
// ÔNIBUS 3D (Three.js). Se falhar, a ilustração 2D continua no lugar.
// ============================================================
(function () {
  var host = document.querySelector('[data-foto="hero"]');
  if (!host || FOTOS.hero || !window.THREE) return;
  try {
    var T = THREE;
    var E = T.sRGBEncoding;
    var R = new T.WebGLRenderer({ antialias: true, alpha: true });
    R.setPixelRatio(Math.min(devicePixelRatio, 2));
    R.shadowMap.enabled = true;
    R.shadowMap.type = T.PCFSoftShadowMap;
    R.outputEncoding = E;
    R.toneMapping = T.ACESFilmicToneMapping;

    var S = new T.Scene();
    S.fog = new T.Fog(0x10263b, 24, 62);

    var C = new T.PerspectiveCamera(30, 1.6, 0.1, 200);

    S.add(new T.HemisphereLight(0xcfe3ff, 0x10202f, 0.95));

    var D = new T.DirectionalLight(0xffffff, 1.15);
    D.position.set(8, 14, 10);
    D.castShadow = true;
    D.shadow.mapSize.set(1024, 1024);
    var sc = D.shadow.camera;
    sc.left = -11;
    sc.right = 11;
    sc.top = 11;
    sc.bottom = -11;
    sc.near = 1;
    sc.far = 45;
    D.shadow.bias = -0.0005;
    S.add(D);

    var P = new T.PointLight(0x4aa0ff, 1.3, 45);
    P.position.set(-8, 4, -8);
    S.add(P);

    var M = function (c, r, m, x) {
      return new T.MeshStandardMaterial(
        Object.assign({ color: c, roughness: r, metalness: m }, x || {})
      );
    };

    var bodyM = M(0xf2f6fa, 0.35, 0.15),
      glass = M(0x0a1623, 0.1, 0.8),
      dark = M(0x0a0f15, 0.8, 0.2),
      amber = M(0xf2a900, 0.4, 0.1),
      rim = M(0xc3ccd6, 0.3, 0.9),
      tire = M(0x0b0b0c, 0.9, 0),
      gray = M(0xb9c3ce, 0.5, 0.3);

    var B = new T.Group();
    S.add(B);

    var sh = new T.Shape();
    var PI = Math.PI;

    sh.moveTo(-5.8, 0.55);
    sh.lineTo(-4.35, 0.55);
    sh.absarc(-3.6, 0.55, 0.75, PI, 0, true);
    sh.lineTo(2.45, 0.55);
    sh.absarc(3.2, 0.55, 0.75, PI, 0, true);
    sh.lineTo(5.8, 0.55);
    sh.quadraticCurveTo(6, 0.55, 6, 0.85);
    sh.lineTo(6, 1.8);
    sh.lineTo(5.5, 3.3);
    sh.quadraticCurveTo(5.45, 3.45, 5.25, 3.45);
    sh.lineTo(-5.6, 3.45);
    sh.quadraticCurveTo(-6, 3.45, -6, 3.1);
    sh.lineTo(-6, 0.85);
    sh.quadraticCurveTo(-6, 0.55, -5.8, 0.55);

    var bg = new T.ExtrudeGeometry(sh, {
      depth: 2.5,
      bevelEnabled: true,
      bevelSize: 0.12,
      bevelThickness: 0.12,
      bevelSegments: 3,
      curveSegments: 14,
    });
    bg.translate(0, 0, -1.25);
    B.add(new T.Mesh(bg, bodyM));

    var bx = function (w, h, d, m, x, y, z) {
      var o = new T.Mesh(new T.BoxGeometry(w, h, d), m);
      o.position.set(x, y, z);
      B.add(o);
      return o;
    };

    var lc = document.createElement("canvas");
    lc.width = 1024;
    lc.height = 116;
    var lg = lc.getContext("2d");
    lg.fillStyle = "#123a63";
    lg.font = 'bold 92px "Barlow Condensed","Arial Narrow",Arial';
    lg.textAlign = "center";
    lg.textBaseline = "middle";
    lg.fillText("TOMOGLASS", 512, 62);

    var lx = new T.CanvasTexture(lc);
    lx.encoding = E;
    lx.anisotropy = 8;

    [1, -1].forEach(function (s) {
      for (var i = 0; i < 5; i++) bx(1.5, 1.1, 0.06, glass, -4.3 + i * 1.7, 2.35, s * 1.38);
      bx(1.1, 1.2, 0.06, glass, 4.55, 2.3, s * 1.38);
      bx(11.7, 0.12, 0.03, amber, 0, 1.55, s * 1.39);
      var lp = new T.Mesh(
        new T.PlaneGeometry(4.4, 0.5),
        new T.MeshBasicMaterial({ map: lx, transparent: true })
      );
      lp.position.set(0, 0.98, s * 1.375);
      if (s < 0) lp.rotation.y = PI;
      B.add(lp);

      var hl = M(0xffffff, 0.3, 0, { emissive: 0xfff2c0, emissiveIntensity: 1.5 });
      var tl = M(0xff2a2a, 0.4, 0, { emissive: 0xff1010, emissiveIntensity: 1.2 });
      bx(0.06, 0.22, 0.5, hl, 6.13, 1.05, s * 0.85);
      bx(0.06, 0.2, 0.4, tl, -6.13, 1.1, s * 0.85);
    });

    bx(0.05, 1.6, 2.3, glass, 5.92, 2.55, 0).rotation.z = 0.32;
    bx(0.05, 1, 2.2, glass, -6.15, 2.4, 0);
    bx(0.25, 0.3, 2.6, dark, 6.1, 0.72, 0);
    bx(0.25, 0.3, 2.6, dark, -6.1, 0.72, 0);
    bx(2.2, 0.3, 1.3, gray, -1.8, 3.6, 0);
    bx(1.2, 0.25, 1.3, gray, 1.2, 3.58, 0);

    var W = [];

    [-3.6, 3.2].forEach(function (x) {
      bx(1.6, 1, 1.5, dark, x, 0.95, 0);
      var ax = new T.Mesh(new T.CylinderGeometry(0.09, 0.09, 2.1, 12), dark);
      ax.rotation.x = PI / 2;
      ax.position.set(x, 0.55, 0);
      B.add(ax);
      [1, -1].forEach(function (s) {
        var g = new T.Group();
        var t = new T.Mesh(new T.CylinderGeometry(0.55, 0.55, 0.38, 36), tire);
        t.rotation.x = PI / 2;
        g.add(t);
        var r = new T.Mesh(new T.CylinderGeometry(0.34, 0.34, 0.4, 28), rim);
        r.rotation.x = PI / 2;
        g.add(r);
        for (var k = 0; k < 3; k++) {
          var sp = new T.Mesh(new T.BoxGeometry(0.5, 0.07, 0.42), dark);
          sp.rotation.z = k * PI / 3;
          g.add(sp);
        }
        g.position.set(x, 0.55, s * 1.0);
        B.add(g);
        W.push(g);
      });
    });

    B.traverse(function (o) {
      if (o.isMesh) o.castShadow = true;
    });

    var rd = new T.Mesh(
      new T.PlaneGeometry(200, 60),
      M(0x17222e, 0.95, 0)
    );
    rd.rotation.x = -PI / 2;
    rd.receiveShadow = true;
    S.add(rd);

    var dc = document.createElement("canvas");
    dc.width = 64;
    dc.height = 4;
    var dg = dc.getContext("2d");
    dg.fillStyle = "#e8eef5";
    dg.fillRect(0, 0, 34, 4);

    var dt = new T.CanvasTexture(dc);
    dt.wrapS = dt.wrapT = T.RepeatWrapping;
    dt.repeat.set(33, 1);
    dt.encoding = E;

    [4.2, -4.2].forEach(function (z) {
      var l = new T.Mesh(
        new T.PlaneGeometry(200, 0.28),
        new T.MeshBasicMaterial({ map: dt, transparent: true })
      );
      l.rotation.x = -PI / 2;
      l.position.set(0, 0.01, z);
      S.add(l);
    });

    var cv = R.domElement;
    var hint = document.createElement("div");
    hint.textContent = "Arraste para girar o ônibus em 3D";
    hint.style.cssText =
      "position:absolute;left:14px;bottom:12px;font-size:13px;color:#9db2c7;background:rgba(8,18,28,.6);padding:4px 10px;border-radius:999px;pointer-events:none";

    var rs = function () {
      var w = host.clientWidth;
      var h = host.clientHeight;
      if (!w || !h) return;
      R.setSize(w, h, false);
      C.aspect = w / h;
      C.updateProjectionMatrix();
    };

    var off = 0;
    var mx = 0;
    var sm = 0;
    var drag = false;
    var px = 0;
    var vis = true;
    var still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    var clk = new T.Clock();

    cv.addEventListener("pointerdown", function (e) {
      drag = true;
      px = e.clientX;
      cv.setPointerCapture(e.pointerId);
      cv.style.cursor = "grabbing";
    });

    cv.addEventListener("pointermove", function (e) {
      if (drag) {
        off += (e.clientX - px) * 0.006;
        px = e.clientX;
      } else {
        var b = cv.getBoundingClientRect();
        mx = (e.clientX - b.left) / b.width - 0.5;
      }
    });

    var up = function () {
      drag = false;
      cv.style.cursor = "grab";
    };
    cv.addEventListener("pointerup", up);
    cv.addEventListener("pointercancel", up);

    new IntersectionObserver(function (e) {
      vis = e[0].isIntersecting;
    }).observe(host);

    function fr() {
      requestAnimationFrame(fr);
      if (!vis || document.hidden) return;
      var d = Math.min(clk.getDelta(), 0.05);
      var t = clk.elapsedTime;
      var v = still ? 0 : 5;
      W.forEach(function (w) {
        w.rotation.z -= (v * d) / 0.55;
      });
      dt.offset.x += (v * d) / 6;
      if (!drag) off *= 0.985;
      sm += (mx - sm) * 0.05;
      var a = 0.85 + (still ? 0 : Math.sin(t * 0.3) * 0.3) + off + sm * 0.3;
      B.position.y = still ? 0 : Math.sin(t * 3) * 0.012;
      C.position.set(Math.sin(a) * 19, 4.2 - sm * 0.6, Math.cos(a) * 19);
      C.lookAt(0, 1.7, 0);
      R.render(S, C);
    }

    host.appendChild(cv);
    host.appendChild(hint);
    host.classList.add("has");
    new ResizeObserver(rs).observe(host);
    rs();
    fr();
  } catch (err) {
    console.warn("3D indisponível", err);
  }
})();