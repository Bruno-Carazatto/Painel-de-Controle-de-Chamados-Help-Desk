// =========================
// Help Desk - Front-end Only
// =========================

const STORAGE_KEY = "chamados_helpdesk_v1";

let chamados = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

const form = document.getElementById("formChamado");
const lista = document.getElementById("listaChamados");
const filtro = document.getElementById("filtroStatus");
const busca = document.getElementById("busca");
const infoResultados = document.getElementById("infoResultados");
const emptyState = document.getElementById("emptyState");

const countAberto = document.getElementById("countAberto");
const countAndamento = document.getElementById("countAndamento");
const countFinalizado = document.getElementById("countFinalizado");

const btnLimparTudo = document.getElementById("btnLimparTudo");

// Helpers
function salvarStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chamados));
}

function normalizarTexto(v) {
  return String(v || "").toLowerCase().trim();
}

function getBadgeHTML(status) {
  if (status === "Aberto") {
    return `<span class="badge-status badge-aberto"><i class="bi bi-exclamation-circle"></i> Aberto</span>`;
  }
  if (status === "Em andamento") {
    return `<span class="badge-status badge-andamento"><i class="bi bi-arrow-repeat"></i> Em andamento</span>`;
  }
  return `<span class="badge-status badge-finalizado"><i class="bi bi-check-circle"></i> Finalizado</span>`;
}

function atualizarContadores() {
  // Contadores SEMPRE com base em todos os chamados
  let abertos = 0;
  let andamento = 0;
  let finalizados = 0;

  chamados.forEach(c => {
    if (c.status === "Aberto") abertos++;
    else if (c.status === "Em andamento") andamento++;
    else if (c.status === "Finalizado") finalizados++;
  });

  countAberto.innerText = abertos;
  countAndamento.innerText = andamento;
  countFinalizado.innerText = finalizados;
}

function filtrarChamados() {
  const f = filtro.value;
  const b = normalizarTexto(busca.value);

  return chamados.filter(c => {
    const passaStatus = (f === "Todos") ? true : (c.status === f);
    const passaBusca = b
      ? normalizarTexto(c.titulo).includes(b) || normalizarTexto(c.usuario).includes(b)
      : true;

    return passaStatus && passaBusca;
  });
}

function renderizar() {
  atualizarContadores();

  const filtrados = filtrarChamados();
  lista.innerHTML = "";

  if (filtrados.length === 0) {
    emptyState.classList.remove("d-none");
    infoResultados.innerText = "0 resultados";
    return;
  }

  emptyState.classList.add("d-none");
  infoResultados.innerText = `${filtrados.length} resultado(s)`;

  filtrados.forEach((c) => {
    lista.innerHTML += `
      <tr>
        <td class="text-light-50">#${c.id}</td>
        <td>
        <div class="titulo-wrapper">
            <span class="titulo-text fw-semibold">${c.titulo}</span>
            <span class="titulo-data text-light-50 small">
            <i class="bi bi-clock"></i> ${c.criadoEm}
            </span>
        </div>
        </td>
        <td>${c.usuario}</td>
        <td>${getBadgeHTML(c.status)}</td>
        <td>
          <button class="btn btn-sm btn-outline-light" data-action="delete" data-id="${c.id}">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });
}

// Criar chamado
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const titulo = document.getElementById("titulo").value.trim();
  const usuario = document.getElementById("usuario").value.trim();
  const status = document.getElementById("status").value;

  if (!titulo || !usuario) return;

  const agora = new Date();
  const criadoEm = agora.toLocaleDateString("pt-BR") + " " + agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const novo = {
    id: Date.now(),       // ID simples (front-only)
    titulo,
    usuario,
    status,
    criadoEm
  };

  chamados.unshift(novo); // coloca no topo
  salvarStorage();
  form.reset();

  renderizar();
});

// Filtro e busca
filtro.addEventListener("change", renderizar);
busca.addEventListener("input", renderizar);

// Deletar
lista.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const action = btn.getAttribute("data-action");
  const id = Number(btn.getAttribute("data-id"));

  if (action === "delete") {
    chamados = chamados.filter(c => c.id !== id);
    salvarStorage();
    renderizar();
  }
});

// Limpar tudo
btnLimparTudo.addEventListener("click", () => {
  const ok = confirm("Você tem certeza que deseja apagar TODOS os chamados salvos?");
  if (!ok) return;

  chamados = [];
  salvarStorage();
  renderizar();
});

// Inicial
renderizar();