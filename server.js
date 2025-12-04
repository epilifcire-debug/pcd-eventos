// server.js — backend “online / API only”
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";  // adicionar CORS

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Habilita CORS para todas origens (ou restrinja conforme necessário)
app.use(cors());

// JSON body parsing (se necessário)
app.use(express.json());

// Configura diretório de documentos
const pastaDocumentos = path.join(__dirname, "documentos");
if (!fs.existsSync(pastaDocumentos)) {
  fs.mkdirSync(pastaDocumentos, { recursive: true });
}

// Serve arquivos estáticos da pasta documentos (para download/visualização)
app.use("/documentos", express.static(pastaDocumentos));

// Multer — upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const nomePessoa = req.body.nomePessoa?.trim();
    if (!nomePessoa) return cb(new Error("Nome da pessoa não informado"));

    const pastaPessoa = path.join(pastaDocumentos, nomePessoa);
    if (!fs.existsSync(pastaPessoa)) {
      fs.mkdirSync(pastaPessoa, { recursive: true });
    }
    cb(null, pastaPessoa);
  },
  filename: (req, file, cb) => {
    // você pode manter mesma lógica de nomes
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + ext);
  }
});

const upload = multer({ storage });

// Rota de upload — recebe arquivos
app.post("/upload", upload.any(), (req, res) => {
  if (!req.body.nomePessoa) {
    return res.status(400).json({ erro: "nomePessoa obrigatório" });
  }
  // sucesso
  res.json({ sucesso: true, arquivos: req.files.map(f => f.filename) });
});

// Rota para logs (pode adaptar de sua versão anterior)
// ...

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend online rodando na porta ${PORT}`);
  console.log(`Documentos servidos em /documentos`);
});
