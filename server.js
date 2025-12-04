// ===============================
//  SERVIDOR PCD EVENTOS - FINAL PRO
//  Upload de documentos + Porta dinâmica + Logs automáticos
// ===============================
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// ===============================
//  CONFIGURAÇÕES
// ===============================
const DEFAULT_PORT = 3000;
let PORT = process.env.PORT || DEFAULT_PORT;

// Pasta principal de documentos
const pastaDocumentos = path.join(__dirname, "documentos");
const pastaLogs = path.join(pastaDocumentos, "logs");
const arquivoLog = path.join(pastaLogs, "logs.json");

// Garante que as pastas existam
if (!fs.existsSync(pastaDocumentos)) fs.mkdirSync(pastaDocumentos, { recursive: true });
if (!fs.existsSync(pastaLogs)) fs.mkdirSync(pastaLogs, { recursive: true });

// Servir o frontend (index.html, etc.)
app.use(express.static(__dirname));

// ===============================
//  MULTER (UPLOADS)
// ===============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const nomePessoa = req.body.nomePessoa?.trim();
    if (!nomePessoa) return cb(new Error("Nome da pessoa não informado"));

    const pastaPessoa = path.join(pastaDocumentos, nomePessoa);
    if (!fs.existsSync(pastaPessoa)) {
      fs.mkdirSync(pastaPessoa, { recursive: true });
      console.log(chalk.blue(`📂 Criada pasta: documentos/${nomePessoa}`));
    }

    cb(null, pastaPessoa);
  },

  filename: (req, file, cb) => {
    const mapaNomes = {
      "foto": "foto",
      "doc-nacional": "documento_nacional",
      "cad": "cadastro_baixa_renda",
      "comprovante": "comprovante_residencia",
      "bpc": "cartao_bpc",
      "inss": "documento_inss",
      "laudo": "laudo_medico"
    };
    const tipoCampo = Object.keys(mapaNomes).find(campo => file.fieldname.includes(campo)) || "documento";
    const extensao = path.extname(file.originalname).toLowerCase();
    cb(null, `${mapaNomes[tipoCampo]}${extensao}`);
  }
});

const upload = multer({ storage });

// ===============================
//  ROTA DE UPLOAD
// ===============================
app.post("/upload", upload.any(), (req, res) => {
  try {
    const nomePessoa = req.body.nomePessoa?.trim();
    if (!nomePessoa) return res.status(400).json({ erro: "Nome da pessoa é obrigatório" });

    const arquivos = req.files.map(f => f.originalname);
    const hora = new Date().toLocaleString("pt-BR");

    console.log(chalk.greenBright(`📦 Upload recebido de ${chalk.cyan(nomePessoa)} às ${chalk.yellow(hora)}`));
    arquivos.forEach(f => console.log("   →", chalk.gray(f)));

    // Salva no log JSON
    salvarLog({ nomePessoa, dataHora: hora, arquivos });

    res.json({ sucesso: true, mensagem: "Arquivos enviados e log registrados com sucesso!" });
  } catch (err) {
    console.error(chalk.red("❌ Erro ao salvar arquivos:"), err);
    res.status(500).json({ erro: "Erro ao salvar arquivos." });
  }
});

// ===============================
//  FUNÇÃO PARA SALVAR LOG
// ===============================
function salvarLog(novoRegistro) {
  let logs = [];
  try {
    if (fs.existsSync(arquivoLog)) {
      const conteudo = fs.readFileSync(arquivoLog, "utf8");
      logs = conteudo ? JSON.parse(conteudo) : [];
    }
  } catch {
    logs = [];
  }

  logs.push(novoRegistro);
  fs.writeFileSync(arquivoLog, JSON.stringify(logs, null, 2), "utf8");

  console.log(chalk.magenta(`🧾 Log registrado para ${novoRegistro.nomePessoa}`));
}

// ===============================
//  PORTA DINÂMICA + ERROS
// ===============================
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(chalk.greenBright(`✅ Servidor rodando em:`), chalk.cyan(`http://localhost:${port}`));
    console.log(chalk.gray(`📂 Pasta de documentos: ${pastaDocumentos}`));
  });

  server.on("error", err => {
    if (err.code === "EADDRINUSE") {
      console.warn(chalk.yellow(`⚠️ Porta ${port} em uso. Tentando a próxima...`));
      startServer(port + 1);
    } else {
      console.error(chalk.red("❌ Erro no servidor:"), err);
    }
  });
}

startServer(parseInt(PORT, 10));
