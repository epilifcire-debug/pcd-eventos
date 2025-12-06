// server.js
// Sistema PCD Eventos - Backend Estável (Cloudinary v1 + Multer Storage Cloudinary v4)

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const path = require("path");

dotenv.config();
const app = express();

// ===== CONFIGURAÇÕES BÁSICAS =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== CONFIGURAÇÃO DO CLOUDINARY =====
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

// ===== CONFIGURAÇÃO DO MULTER STORAGE CLOUDINARY =====
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads_pcd_eventos", // pasta no Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    transformation: [{ width: 1200, crop: "limit" }],
  },
});

const upload = multer({ storage });

// ===== ROTAS =====

// Teste simples
app.get("/", (req, res) => {
  res.send("🚀 Servidor PCD Eventos rodando com sucesso!");
});

// Upload de arquivo único
app.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado." });
    }
    res.json({
      message: "Upload realizado com sucesso!",
      fileUrl: req.file.path,
      public_id: req.file.filename,
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    res.status(500).json({ error: "Erro ao enviar arquivo." });
  }
});

// ===== SERVIDOR =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));
