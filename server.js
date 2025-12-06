const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const pessoa = req.body.nomePessoa?.trim() || "desconhecido";
    const dir = path.join(__dirname, "documentos", pessoa);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.fieldname}-${file.originalname}`);
  },
});

const upload = multer({ storage });

app.post(
  "/upload",
  upload.fields([
    { name: "doc-requerimento", maxCount: 1 },
    { name: "doc-foto", maxCount: 1 },
    { name: "doc-docoficial", maxCount: 1 },
    { name: "doc-laudo", maxCount: 1 },
    { name: "doc-cadunico", maxCount: 1 },
    { name: "doc-bpc", maxCount: 1 },
    { name: "doc-comprovante", maxCount: 1 },
  ]),
  (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Nenhum documento recebido." });
    }

    res.json({
      success: true,
      message: "📁 Documentos enviados com sucesso!",
      arquivos: Object.keys(req.files).map((key) => ({
        campo: key,
        nome: req.files[key][0].originalname,
      })),
    });
  }
);

app.get("/visualizar/:pessoa", (req, res) => {
  const dir = path.join(__dirname, "documentos", req.params.pessoa);
  if (!fs.existsSync(dir)) {
    return res.status(404).json({ error: "Pasta não encontrada" });
  }
  const arquivos = fs.readdirSync(dir);
  res.json({ pessoa: req.params.pessoa, arquivos });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () =>
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
);
