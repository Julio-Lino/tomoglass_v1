const API_ENDPOINT = "/api/orcamento";

const GMAPS_KEY = "";

const EMPRESA_LAT = -23.447488;
const EMPRESA_LNG = -46.460918;
const EMPRESA_ENDERECO = "Rua Manoel Alonso Almendra, nº 146, Jd. das Nações, Guarulhos, SP, CEP 07182-120";
const EMPRESA_NOME = "Tomoglass";

const RECAPTCHA_SITE_KEY = "";

const HORARIO_FUNCIONAMENTO = "";

var FOTOS = {
  empresa: "",
  p1: "",
  p2: "",
  p3: "",
  p4: "",
  p5: "",
  p6: ""
};

var VIDEO_EMPRESA = "";

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

var heroStage = document.getElementById("hero-video");
if (heroStage && VIDEO_EMPRESA) {
  var video = document.createElement("video");
  video.src = VIDEO_EMPRESA;
  video.className = "hero-video";
  video.controls = true;
  video.autoplay = true;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = "metadata";
  video.title = "Vídeo da empresa Tomoglass";
  heroStage.appendChild(video);
  heroStage.classList.add("has");
}

var hd = document.getElementById("hd");

function sc() {
  hd.classList.toggle("s", window.scrollY > 40);
}
sc();
addEventListener("scroll", sc, { passive: true });

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

function configurarBotoesOrcamento() {
  document.querySelectorAll(".btn-orcamento").forEach(function (btn) {
    btn.addEventListener("click", function (ev) {
      ev.preventDefault();
      var form = document.getElementById("orcamento");
      if (!form) return;
      form.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(function () {
        var primeiroCampo = document.getElementById("n");
        if (primeiroCampo) primeiroCampo.focus({ preventScroll: true });
      }, 600);
    });
  });
}
configurarBotoesOrcamento();

var btnCatalogo = document.getElementById("btn-catalogo");
if (btnCatalogo) {
  btnCatalogo.addEventListener("click", function (ev) {
    ev.preventDefault();
    document.querySelectorAll(".fl button").forEach(function (x) {
      x.classList.toggle("on", x.dataset.f === "all");
    });
    document.querySelectorAll(".pc").forEach(function (c) {
      c.classList.remove("h");
    });
    var produtos = document.getElementById("produtos");
    if (produtos) produtos.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function mascaraTelefone(valor) {
  var digits = valor.replace(/\D/g, "");
  digits = digits.substring(0, 11);

  if (digits.length <= 2) {
    return digits.length ? "(" + digits : "";
  }

  var ddd = digits.substring(0, 2);
  var numero = digits.substring(2);

  if (numero.length <= 4) {
    return "(" + ddd + ") " + numero;
  }

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

  document.querySelectorAll(".error").forEach(function (el) {
    el.textContent = "";
  });

  if (!campos.n.value.trim() || campos.n.value.trim().length < 3) {
    erros.nome = "Informe seu nome completo (mín. 3 caracteres).";
  }

  var telDigits = campos.t.value.replace(/\D/g, "");
  if (!campos.t.value.trim()) {
    erros.telefone = "Informe seu telefone.";
  } else if (telDigits.length < 10 || telDigits.length > 11) {
    erros.telefone = "Telefone inválido. Use (11) 91234-5678 ou (11) 2345-6789.";
  }

  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!campos.m.value.trim()) {
    erros.email = "Informe seu e-mail.";
  } else if (!emailRegex.test(campos.m.value.trim())) {
    erros.email = "E-mail inválido.";
  }

  if (!campos.p.value) {
    erros.peca = "Selecione o tipo de peça.";
  }

  if (!campos.d.value.trim() || campos.d.value.trim().length < 10) {
    erros.detalhes = "Informe os detalhes (mín. 10 caracteres).";
  }

  if (!campos.lgpd.checked) {
    erros.lgpd = "É necessário concordar com a Política de Privacidade.";
  }

  var anexoInput = document.getElementById("anexo");
  if (anexoInput && anexoInput.files.length > 0) {
    var arquivo = anexoInput.files[0];
    var tamanhoMax = 5 * 1024 * 1024;
    var extensoesPermitidas = ["jpg", "jpeg", "png", "pdf"];
    var ext = arquivo.name.split(".").pop().toLowerCase();

    if (arquivo.size > tamanhoMax) {
      erros.anexo = "Arquivo muito grande. Máximo de 5 MB.";
    } else if (extensoesPermitidas.indexOf(ext) === -1) {
      erros.anexo = "Formato não permitido. Use JPG, PNG ou PDF.";
    }
  }

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

function enviarFormulario(form) {
  var botao = form.querySelector(".btn-submit");
  var btnText = botao.querySelector(".btn-text");
  var btnLoading = botao.querySelector(".btn-loading");
  var ok = document.getElementById("ok");

  botao.disabled = true;
  btnText.style.display = "none";
  btnLoading.style.display = "inline-flex";
  ok.textContent = "";
  ok.className = "ok";

  var recaptchaToken = document.getElementById("recaptcha_token");
  var promise = Promise.resolve();

  if (RECAPTCHA_SITE_KEY && window.grecaptcha) {
    promise = grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: "orcamento" })
      .then(function (token) {
        if (recaptchaToken) recaptchaToken.value = token;
      })
      .catch(function () {});
  }

  promise.then(function () {
    var formData = new FormData(form);
    formData.delete("honeypot");
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
      ok.textContent = "Recebemos sua cotação, entraremos em contato em breve.";
      ok.className = "ok success";
      form.reset();
    } else {
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
    botao.disabled = false;
    btnText.style.display = "inline";
    btnLoading.style.display = "none";
  });
}

var form = document.getElementById("fm");
if (form) {
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();

    var honeypot = document.getElementById("honeypot");
    if (honeypot && honeypot.value) {
      var ok = document.getElementById("ok");
      ok.textContent = "Recebemos sua cotação, entraremos em contato em breve.";
      ok.className = "ok success";
      form.reset();
      return;
    }

    var validacao = validarFormulario();
    if (!validacao.valido) {
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

  if (!GMAPS_KEY) {
    mostrarFallbackMapa();
    return;
  }

  var script = document.createElement("script");
  script.src = "https://maps.googleapis.com/maps/api/js?key=" + encodeURIComponent(GMAPS_KEY) + "&callback=inicializarMapa";
  script.async = true;
  script.defer = true;
  script.onerror = function () {
    mostrarFallbackMapa();
  };
  document.head.appendChild(script);

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

  fallback.style.display = "none";
}

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

if (HORARIO_FUNCIONAMENTO) {
  var horarioEl = document.getElementById("horario-funcionamento");
  if (horarioEl) horarioEl.textContent = HORARIO_FUNCIONAMENTO;
}
