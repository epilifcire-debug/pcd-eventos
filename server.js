// ======================================
// 🧾 SISTEMA PCD EVENTOS (FULL BACKEND + FRONTEND)
// ======================================
import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ===============================
// 🔧 CONFIGURAÇÕES BÁSICAS
// ===============================
app.use(cors());
app.use(express.json());

// Caminhos principais
const pastaDocumentos = path.join(__dirname, "documentos");
const pastaFrontend = path.join(__dirname, "frontend");
const pastaLogs = path.join(pastaDocumentos, "logs");
const arquivoLog = path.join(pastaLogs, "logs.json");

// Garante pastas
if (!fs.existsSync(pastaDocumentos)) fs.mkdirSync(pastaDocumentos, { recursive: true });
if (!fs.existsSync(pastaLogs)) fs.mkdirSync(pastaLogs, { recursive: true });

// ===============================
// 🧩 FRONTEND ESTÁTICO
// ===============================
app.use(express.static(pastaFrontend));
app.get("/", (req, res) => {
  res.sendFile(path.join(pastaFrontend, "login.html"));
});

// ===============================
// 📂 SERVIR DOCUMENTOS
// ===============================
app.use("/documentos", express.static(pastaDocumentos));

// ===============================
// 📤 CONFIGURAÇÃO DE UPLOAD (MULTER)
// ===============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const nomePessoa = req.body.nomePessoa?.trim();
    if (!nomePessoa) return cb(new Error("Nome da pessoa não informado"));
    const pastaPessoa = path.join(pastaDocumentos, nomePessoa);
    if (!fs.existsSync(pastaPessoa)) fs.mkdirSync(pastaPessoa, { recursive: true });
    cb(null, pastaPessoa);
  },
  filename: (req, file, cb) => {
    const extensao = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}${extensao}`);
  }
});
const upload = multer({ storage });

// ===============================
// 📤 ROTA DE UPLOAD
// ===============================
app.post("/upload", upload.any(), (req, res) => {
  const nomePessoa = req.body.nomePessoa?.trim();
  if (!nomePessoa) return res.status(400).json({ erro: "Nome da pessoa é obrigatório" });

  const arquivos = req.files.map(f => f.originalname);
  const dataHora = new Date().toLocaleString("pt-BR");

  salvarLog({ nomePessoa, dataHora, arquivos });
  res.json({ sucesso: true, mensagem: "Upload concluído!", arquivos });
});

// ===============================
// 🧾 FUNÇÃO DE LOG
// ===============================
function salvarLog(novoRegistro) {
  let logs = [];
  try {
    if (fs.existsSync(arquivoLog)) {
      const conteudo = fs.readFileSync(arquivoLog, "utf8");
      logs = conteudo ? JSON.parse(conteudo) : [];
    }
  } catch { logs = []; }

  logs.push(novoRegistro);
  fs.writeFileSync(arquivoLog, JSON.stringify(logs, null, 2), "utf8");
  console.log(`📦 Upload registrado: ${novoRegistro.nomePessoa}`);
}

// ===============================
// 🧮 ROTA DE LOGS (SOMENTE ADMIN)
// ===============================
app.get("/logs", (req, res) => {
  const perfil = req.query.perfil || "usuario";
  if (perfil !== "admin") {
    return res.status(403).send(`
      <html lang="pt-BR">
      <head><meta charset="UTF-8"><title>Acesso Negado</title></head>
      <body style="font-family:sans-serif;text-align:center;margin-top:50px;background:#111;color:#fff">
        <h2>🚫 Acesso negado</h2>
        <p>Somente administradores podem ver os logs.</p>
      </body>
      </html>
    `);
  }

  if (!fs.existsSync(arquivoLog)) return res.send("<h3>Nenhum log encontrado.</h3>");
  const logs = JSON.parse(fs.readFileSync(arquivoLog, "utf8") || "[]");

  let html = `
  <html lang="pt-BR"><head><meta charset="UTF-8">
  <title>Logs</title>
  <style>
    body { font-family: Arial; margin: 20px; background: #f9f9f9; color: #333; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px; border: 1px solid #ccc; }
    th { background: #0078ff; color: #fff; }
    tr:nth-child(even) { background: #f2f2f2; }
    button { margin-top: 20px; padding: 10px; background:#0078ff; color:white; border:none; border-radius:6px; cursor:pointer; }
  </style></head><body>
  <h1>📋 Histórico de Uploads</h1>
  <table><tr><th>Data e Hora</th><th>Pessoa</th><th>Arquivos</th></tr>`;

  logs.reverse().forEach(l => {
    html += `<tr><td>${l.dataHora}</td><td>${l.nomePessoa}</td><td>${l.arquivos.join("<br>")}</td></tr>`;
  });

  html += `</table><button onclick="window.print()">📄 Exportar PDF</button></body></html>`;
  res.send(html);
});

// ===============================
// 🚀 INICIAR SERVIDOR
// ===============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em: http://localhost:${PORT}`);
  console.log(`📂 Frontend: ${pastaFrontend}`);
  console.log(`📁 Documentos: ${pastaDocumentos}`);
});
