// ============================================================
// 🌐 Sistema PCD Eventos - Backend com Upload + Backup Cloudinary
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

// ============================================================
// 🔧 CONFIGURAÇÕES BÁSICAS
// ============================================================
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ============================================================
// ☁️ CONFIGURAÇÃO DO CLOUDINARY
// ============================================================
// Certifique-se de ter no .env ou nas variáveis do Render:
// CLOUD_NAME, CLOUD_KEY, CLOUD_SECRET
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,  // ex: djln3mjwd
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

// ============================================================
// 📦 CONFIGURAÇÃO DO MULTER + CLOUDINARY (DOCUMENTOS)
// ============================================================
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads_pcd_eventos/documentos",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    transformation: [{ width: 1200, crop: "limit" }],
  },
});

const upload = multer({ storage });

// ============================================================
// 🌍 ROTAS
// ============================================================

// Rota de teste simples
app.get("/", (req, res) => {
  res.send("🚀 Servidor PCD Eventos ativo com Cloudinary!");
});

// ============================================================
// 📤 UPLOAD DE DOCUMENTOS (PDF/IMAGENS)
// Front usa campos:
//  doc-requerimento, doc-foto, doc-docoficial, doc-laudo,
//  doc-cadunico, doc-bpc, doc-comprovante
// ============================================================
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

      const arquivos = {};
      for (const campo in req.files) {
        const f = req.files[campo][0];
        arquivos[campo] = {
          url: f.path,         // URL pública no Cloudinary
          id: f.filename,      // public_id
          mimetype: f.mimetype,
          size: f.size,
        };
      }

      console.log("📁 Upload concluído:", Object.keys(arquivos));

      res.json({
        message: "Upload(s) realizado(s) com sucesso!",
        arquivos,
      });
    } catch (error) {
      console.error("❌ Erro no upload:", error);
      res.status(500).json({ error: "Erro ao enviar arquivo(s)." });
    }
  }
);

// ============================================================
// 📦 BACKUP JSON NO CLOUDINARY
// Sempre que o frontend chamar /backup-json, salvamos um arquivo
// com eventos + pessoas + usuários em:
// uploads_pcd_eventos/backups/backup-<timestamp>.json
// ============================================================
app.post("/backup-json", async (req, res) => {
  try {
    const { eventos, pessoas, usuarios } = req.body;

    const backup = {
      eventos: eventos || [],
      pessoas: pessoas || [],
      usuarios: usuarios || [],
      ts: new Date().toISOString(),
    };

    const jsonStr = JSON.stringify(backup, null, 2);
    const base64 = Buffer.from(jsonStr, "utf-8").toString("base64");

    const result = await cloudinary.uploader.upload(
      `data:application/json;base64,${base64}`,
      {
        resource_type: "raw",
        folder: "uploads_pcd_eventos/backups",
        format: "json",
        public_id: `backup-${Date.now()}`,
        overwrite: false,
      }
    );

    console.log("💾 Backup JSON salvo no Cloudinary:", result.public_id);

    res.json({
      message: "Backup salvo no Cloudinary com sucesso.",
      public_id: result.public_id,
      url: result.secure_url,
    });
  } catch (error) {
    console.error("❌ Erro ao salvar backup JSON:", error);
    res.status(500).json({ error: "Erro ao salvar backup no Cloudinary." });
  }
});

// ============================================================
// 🗑️ ROTA OPCIONAL PARA REMOVER ARQUIVOS (DOCUMENTOS)
// Exemplo: DELETE /delete?public_id=uploads_pcd_eventos/documentos/abc123
// ============================================================
app.delete("/delete", async (req, res) => {
  try {
    const { public_id } = req.query;
    if (!public_id) {
      return res.status(400).json({ error: "Informe o parâmetro public_id." });
    }

    await cloudinary.uploader.destroy(public_id, { resource_type: "raw" });
    res.json({ message: "Arquivo removido do Cloudinary." });
  } catch (error) {
    console.error("❌ Erro ao deletar arquivo:", error);
    res.status(500).json({ error: "Erro ao remover arquivo." });
  }
});

// ============================================================
// 🚀 SUBIDA DO SERVIDOR
// ============================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor PCD Eventos rodando na porta ${PORT}`);
});
