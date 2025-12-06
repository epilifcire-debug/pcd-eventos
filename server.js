// ============================================
// 🔹 SERVER.JS - COMPATÍVEL COM CLOUDINARY
// ============================================

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ============================================
// 🔹 CONFIGURAÇÃO DO CLOUDINARY (.env)
// ============================================
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// ============================================
// 🔹 CONFIGURAÇÃO DO MULTER (com Cloudinary)
// ============================================
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const nomePessoa = req.body.nomePessoa?.trim() || "desconhecido";
    const folderName = `documentos/${nomePessoa.replace(/\s+/g, "_")}`;
    return {
      folder: folderName,
      allowed_formats: ["jpg", "png", "jpeg", "pdf"],
      public_id: `${Date.now()}-${file.fieldname}`,
    };
  },
});
const upload = multer({ storage });

// ============================================
// 🔹 ROTA: UPLOAD DE DOCUMENTOS
// ============================================
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
        req.files[campo].forEach((file) => {
          arquivos.push({
            campo,
            url: file.path,
            formato: file.format,
            tamanhoKB: (file.bytes / 1024).toFixed(2),
          });
        });
      });

      res.json({
        success: true,
        message: "Arquivos enviados com sucesso para o Cloudinary!",
        arquivos,
      });
    } catch (error) {
      console.error("Erro ao enviar:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao enviar arquivos.",
        error: error.message,
      });
    }
  }
);

// ============================================
// 🔹 ROTA: VISUALIZAR DOCUMENTOS
// ============================================
app.get("/visualizar/:nomePessoa", async (req, res) => {
  try {
    const nomePessoa = req.params.nomePessoa.replace(/\s+/g, "_");
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: `documentos/${nomePessoa}`,
      max_results: 100,
    });

    const arquivos = result.resources.map((r) => r.secure_url);
    res.json({ success: true, arquivos });
  } catch (error) {
    console.error("Erro ao listar documentos:", error);
    res
      .status(500)
      .json({ success: false, message: "Erro ao listar documentos." });
  }
});

// ============================================
// 🔹 FRONTEND (index.html)
// ============================================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ============================================
// 🔹 PORTA
// ============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Servidor rodando na porta ${PORT} e conectado ao Cloudinary!`)
);
