// ============================================================
// 🌐 Sistema PCD Eventos - Servidor com Upload Múltiplo Cloudinary
// ============================================================

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
  cloud_name: process.env.CLOUD_NAME,   // Exemplo: djln3mjwd
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

// ===== CONFIGURAÇÃO DO MULTER + CLOUDINARY =====
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads_pcd_eventos",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    transformation: [{ width: 1200, crop: "limit" }],
  },
});

const upload = multer({ storage });

// ============================================================
// ✅ ROTAS
// ============================================================

// Teste simples
app.get("/", (req, res) => {
  res.send("🚀 Servidor PCD Eventos ativo e pronto para receber uploads!");
});

// ===== UPLOAD DE DOCUMENTOS =====
// Aceita múltiplos campos do formulário HTML (frontend)
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
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ error: "Nenhum arquivo enviado." });
      }

      const urls = {};
      for (const campo in req.files) {
        urls[campo] = {
          url: req.files[campo][0].path,
          id: req.files[campo][0].filename,
        };
      }

      res.json({
        message: "Upload(s) realizado(s) com sucesso!",
        arquivos: urls,
      });
    } catch (error) {
      console.error("❌ Erro no upload:", error);
      res.status(500).json({ error: "Erro ao enviar arquivo(s)." });
    }
  }
);

// ============================================================
// 🧹 ROTA DE LIMPEZA OPCIONAL (para testes)
// ============================================================
// Exemplo: DELETE /delete?public_id=uploads_pcd_eventos/abc123
app.delete("/delete", async (req, res) => {
  try {
    const { public_id } = req.query;
    if (!public_id) return res.status(400).json({ error: "Informe o public_id" });

    await cloudinary.uploader.destroy(public_id);
    res.json({ message: "Arquivo removido do Cloudinary." });
  } catch (error) {
    console.error("❌ Erro ao deletar:", error);
    res.status(500).json({ error: "Erro ao remover arquivo." });
  }
});

// ============================================================
// 🌍 SERVIDOR ONLINE
// ============================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
