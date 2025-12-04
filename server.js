// ===============================
//  SERVIDOR PCD EVENTOS
//  Upload de documentos e estáticos
// ===============================
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Pasta principal de documentos
const pastaDocumentos = path.join(__dirname, "documentos");

// Cria se não existir
if (!fs.existsSync(pastaDocumentos)) {
  fs.mkdirSync(pastaDocumentos, { recursive: true });
}

// Middleware para servir o index.html e arquivos estáticos
app.use(express.static(__dirname));

// ===============================
//  CONFIGURAÇÃO DO MULTER
// ===============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const nomePessoa = req.body.nomePessoa?.trim();
    if (!nomePessoa) return cb(new Error("Nome da pessoa não informado"));

    // Cria a pasta com o nome da pessoa dentro de /documentos
    const pastaPessoa = path.join(pastaDocumentos, nomePessoa);
    if (!fs.existsSync(pastaPessoa)) {
      fs.mkdirSync(pastaPessoa, { recursive: true });
    }

    cb(null, pastaPessoa);
  },

  filename: (req, file, cb) => {
    // Define nomes padronizados
    const mapaNomes = {
      "foto": "foto",
      "doc-nacional": "documento_nacional",
      "cad": "cadastro_baixa_renda",
      "comprovante": "comprovante_residencia",
      "bpc": "cartao_bpc",
      "inss": "documento_inss",
      "laudo": "laudo_medico"
    };

    // Extrai tipo (do campo) e extensão
    const tipoCampo = Object.keys(mapaNomes).find(campo => file.fieldname.includes(campo)) || "documento";
    const extensao = path.extname(file.originalname).toLowerCase();
    const nomeFinal = `${mapaNomes[tipoCampo]}${extensao}`;
    cb(null, nomeFinal);
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

    console.log(`📁 Upload recebido de ${nomePessoa}:`);
    req.files.forEach(f => console.log(" -", f.originalname, "→", f.path));

    res.json({ sucesso: true, mensagem: "Arquivos enviados com sucesso!" });
  } catch (err) {
    console.error("Erro ao salvar arquivos:", err);
    res.status(500).json({ erro: "Erro ao salvar arquivos." });
  }
});

// ===============================
//  SERVIDOR RODANDO
// ===============================
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em: http://localhost:${PORT}`);
  console.log(`📂 Pasta de documentos: ${pastaDocumentos}`);
});
