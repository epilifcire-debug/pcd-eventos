// ======================================================
// 🧾 SISTEMA PCD EVENTOS - SCRIPT PRINCIPAL
// ======================================================

// Detecta ambiente automaticamente (Local x Render)
const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "";

// ==========================
// 📤 ENVIO DE DOCUMENTOS
// ==========================
async function enviarDocumentos(nomePessoa, formElement) {
  const formData = new FormData(formElement);
  formData.append("nomePessoa", nomePessoa);

  try {
    const response = await fetch(`${BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.sucesso) {
      alert("📂 Documentos enviados com sucesso!");
      atualizarStatusSemaforo(nomePessoa, true);
    } else {
      alert("⚠️ Erro ao enviar documentos.");
      atualizarStatusSemaforo(nomePessoa, false);
    }
  } catch (err) {
    console.error("Erro no upload:", err);
    alert("❌ Falha ao conectar com o servidor.");
    atualizarStatusSemaforo(nomePessoa, false);
  }
}

// ==========================
// 🚦 ATUALIZA STATUS SEMÁFORO
// ==========================
function atualizarStatusSemaforo(nomePessoa, completo) {
  const item = document.querySelector(
    `.pessoa-item[data-nome="${nomePessoa}"] .status-circulo`
  );
  if (!item) return;
  item.style.backgroundColor = completo ? "green" : "red";
  item.title = completo
    ? "Todos os documentos obrigatórios enviados"
    : "Faltando documentos obrigatórios";
}

// ==========================
// 👁️ VISUALIZAR DOCUMENTOS
// ==========================
function visualizarDocumentos(nomePessoa) {
  window.open(`${BASE_URL}/documentos/${encodeURIComponent(nomePessoa)}/`, "_blank");
}

// ==========================
// 🧾 ADICIONAR PESSOA NA LISTA
// ==========================
function adicionarPessoaNaLista(nomePessoa) {
  const lista = document.getElementById("listaPessoas");
  const div = document.createElement("div");
  div.className = "pessoa-item flex justify-between items-center bg-white shadow p-2 rounded mb-2";
  div.dataset.nome = nomePessoa;

  div.innerHTML = `
    <span>${nomePessoa}</span>
    <div class="flex items-center gap-2">
      <div class="status-circulo w-4 h-4 rounded-full bg-red-500" title="Faltando documentos obrigatórios"></div>
      <button class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded" onclick="abrirModalEnvio('${nomePessoa}')">📤 Enviar</button>
      <button class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded" onclick="visualizarDocumentos('${nomePessoa}')">👁️ Visualizar</button>
    </div>
  `;

  lista.appendChild(div);
}

// ==========================
// 📋 MODAL DE ENVIO DE DOCUMENTOS
// ==========================
function abrirModalEnvio(nomePessoa) {
  const modal = document.getElementById("modalEnvio");
  const form = document.getElementById("formEnvio");
  modal.style.display = "flex";
  document.getElementById("modalPessoa").innerText = nomePessoa;

  form.onsubmit = async (e) => {
    e.preventDefault();
    await enviarDocumentos(nomePessoa, form);
    modal.style.display = "none";
  };
}

function fecharModal() {
  document.getElementById("modalEnvio").style.display = "none";
}

// ==========================
// 🧍 CADASTRAR NOVA PESSOA
// ==========================
function cadastrarPessoa() {
  const nome = document.getElementById("nomePessoa").value.trim();
  if (!nome) {
    alert("⚠️ Digite o nome da pessoa antes de cadastrar.");
    return;
  }
  adicionarPessoaNaLista(nome);
  document.getElementById("nomePessoa").value = "";
  alert("✅ Pessoa cadastrada!");
}

// ==========================
// 🪄 INICIALIZAÇÃO
// ==========================
window.addEventListener("DOMContentLoaded", () => {
  console.log("🌐 Ambiente atual:", BASE_URL || "Render (produção)");

  // Cria lista inicial se não existir
  const lista = document.getElementById("listaPessoas");
  if (!lista) {
    const div = document.createElement("div");
    div.id = "listaPessoas";
    document.body.appendChild(div);
  }

  // Configura botão de cadastro
  const btnCadastrar = document.getElementById("btnCadastrarPessoa");
  if (btnCadastrar) {
    btnCadastrar.onclick = cadastrarPessoa;
  }

  // Configura botão de fechar modal
  const btnFechar = document.getElementById("btnFecharModal");
  if (btnFechar) {
    btnFechar.onclick = fecharModal;
  }
});
