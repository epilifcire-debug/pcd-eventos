// ===============================
//  SERVIDOR PCD EVENTOS - VERSÃO APRIMORADA
//  Upload de documentos + Porta dinâmica + Logs coloridos
// ===============================
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk"; // ← para logs coloridos

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ===============================
//  CONFIGURAÇÕES
// ===============================

// Porta dinâmica (Render usa process.env.PORT)
const DEFAULT_PORT = 3000;
let PORT = process.env.PORT || DEFAULT_PORT;

// Pasta principal de documentos
const pastaDocumentos = path.join(__dirname, "documentos");

// Garante que a pasta exista
if (!fs.existsSync(pastaDocumentos)) {
  fs.mkdirSync(pastaDocumentos, { recursive: true });
  console.log(chalk.green("📁 Pasta de documentos criada com sucesso."));
}

// Servir arquivos estáticos (index.html, CSS, etc.)
app.use(express.static(__dirname));

// ===============================
//  MULTER - Uploads
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
    const nomeFinal = `${mapaNomes[tipoCampo]}${extensao}`;
    cb(null, nomeFinal);
  }
});

const upload = multer({ storage });

// ===============================
//  ROTAS
// ===============================
app.post("/upload", upload.any(), (req, res) => {
  try {
    const nomePessoa = req.body.nomePessoa?.trim();
    if (!nomePessoa) return res.status(400).json({ erro: "Nome da pessoa é obrigatório" });

    console.log(chalk.greenBright(`📦 Upload recebido de ${nomePessoa}:`));
    req.files.forEach(f => console.log("   →", chalk.cyan(f.originalname), chalk.gray("=>"), chalk.yellow(f.path)));

    res.json({ sucesso: true, mensagem: "Arquivos enviados com sucesso!" });
  } catch (err) {
    console.error(chalk.red("❌ Erro ao salvar arquivos:"), err);
    res.status(500).json({ erro: "Erro ao salvar arquivos." });
  }
});

// ===============================
//  PORTA DINÂMICA + ERROS
// ===============================
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(chalk.greenBright(`✅ Servidor rodando em:`), chalk.cyan(`http://localhost:${port}`));
    console.log(chalk.gray(`📂 Pasta de documentos: ${pastaDocumentos}`));
  });

  // Caso a porta esteja em uso
  server.on("error", err => {
    if (err.code === "EADDRINUSE") {
      console.warn(chalk.yellow(`⚠️ Porta ${port} em uso. Tentando a próxima...`));
      startServer(port + 1); // tenta a próxima porta livre
    } else {
      console.error(chalk.red("❌ Erro no servidor:"), err);
    }
  });
}

// Inicia o servidor
startServer(parseInt(PORT, 10));
