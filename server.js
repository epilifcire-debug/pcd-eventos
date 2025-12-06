// ===============================
//  SERVER.JS - CLOUDINARY ENABLED
// ===============================
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ===============================
// 🔹 CONFIGURAÇÃO DO CLOUDINARY
// ===============================
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME || "SEU_CLOUD_NAME_AQUI",
  api_key: process.env.CLOUD_API_KEY || "SUA_API_KEY_AQUI",
  api_secret: process.env.CLOUD_API_SECRET || "SEU_API_SECRET_AQUI",
});

// ===============================
// 🔹 CONFIGURAÇÃO DO STORAGE (multer + cloudinary)
// ===============================
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const nomePessoa = req.body.nomePessoa || "sem_nome";
    const pasta = `documentos/${nomePessoa.replace(/\s+/g, "_")}`;
    return {
      folder: pasta,
      allowed_formats: ["jpg", "png", "jpeg", "pdf"],
      public_id: `${Date.now()}-${file.fieldname}`,
    };
  },
});

const upload = multer({ storage });

// ===============================
// 🔹 ROTAS DE UPLOAD
// ===============================
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
    try {
      const arquivos = [];
      Object.keys(req.files).forEach((campo) => {
        req.files[campo].forEach((arquivo) => {
          arquivos.push({
            campo,
            url: arquivo.path,
            formato: arquivo.format,
            tamanhoKB: (arquivo.bytes / 1024).toFixed(2),
          });
        });
      });

      res.json({
        success: true,
        message: "Arquivos enviados com sucesso para o Cloudinary!",
        arquivos,
      });
    } catch (err) {
      console.error("Erro no upload:", err);
      res.status(500).json({ success: false, message: "Erro ao enviar arquivos.", error: err.message });
    }
  }
);

// ===============================
// 🔹 VISUALIZAÇÃO DE DOCUMENTOS
// ===============================
app.get("/visualizar/:nomePessoa", async (req, res) => {
  const nomePessoa = req.params.nomePessoa.replace(/\s+/g, "_");
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: `documentos/${nomePessoa}`,
      max_results: 100,
    });

    const arquivos = result.resources.map((r) => r.secure_url);
    res.json({ success: true, arquivos });
  } catch (error) {
    console.error("Erro ao listar documentos:", error);
    res.status(500).json({ success: false, message: "Erro ao listar documentos." });
  }
});

// ===============================
// 🔹 FRONTEND SERVE INDEX.HTML
// ===============================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ===============================
// 🔹 PORTA DE EXECUÇÃO
// ===============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
