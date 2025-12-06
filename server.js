// ============================================================
// 🌐 Sistema PCD Eventos - Backend com Upload Múltiplo Cloudinary
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// ☁️ CONFIGURAÇÃO DO CLOUDINARY
// ============================================================
// ⚠️ Certifique-se de definir as variáveis no painel do Render:
// CLOUD_NAME, CLOUD_KEY, CLOUD_SECRET
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,  // Exemplo: djln3mjwd
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

// ============================================================
// 📦 CONFIGURAÇÃO DO MULTER + CLOUDINARY STORAGE
// ============================================================
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads_pcd_eventos", // pasta no Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    transformation: [{ width: 1200, crop: "limit" }],
  },
});

const upload = multer({ storage });

// ============================================================
// 🌍 ROTAS
// ============================================================

// 🔹 Rota de teste para verificar se o servidor está rodando
app.get("/", (req, res) => {
  res.send("🚀 Servidor PCD Eventos ativo e pronto para receber uploads!");
});

// ============================================================
// 📤 ROTA DE UPLOAD DE DOCUMENTOS
// Aceita todos os campos do formulário de pessoa no index.html
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

      const urls = {};
      for (const campo in req.files) {
        urls[campo] = {
          url: req.files[campo][0].path,
          id: req.files[campo][0].filename,
        };
      }

      console.log("📁 Upload concluído com sucesso:", Object.keys(urls));

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
// 🗑️ ROTA OPCIONAL PARA EXCLUSÃO DE ARQUIVOS
// ============================================================
// Exemplo de uso: DELETE /delete?public_id=uploads_pcd_eventos/meuarquivo
app.delete("/delete", async (req, res) => {
  try {
    const { public_id } = req.query;
    if (!public_id)
      return res.status(400).json({ error: "Informe o parâmetro public_id" });

    await cloudinary.uploader.destroy(public_id);
    res.json({ message: "Arquivo removido do Cloudinary com sucesso." });
  } catch (error) {
    console.error("❌ Erro ao deletar arquivo:", error);
    res.status(500).json({ error: "Erro ao remover arquivo." });
  }
});

// ============================================================
// 📄 ROTA OPCIONAL: LISTAGEM DE ARQUIVOS NA PASTA
// ============================================================
// Exemplo: GET /listar
app.get("/listar", async (req, res) => {
  try {
    const resources = await cloudinary.api.resources({
      type: "upload",
      prefix: "uploads_pcd_eventos/",
      max_results: 100,
    });
    res.json(resources.resources.map(r => ({
      id: r.public_id,
      url: r.secure_url,
      formato: r.format,
      tamanhoKB: Math.round(r.bytes / 1024),
      criado: r.created_at
    })));
  } catch (error) {
    console.error("❌ Erro ao listar arquivos:", error);
    res.status(500).json({ error: "Erro ao listar arquivos." });
  }
});

// ============================================================
// 🧩 SERVIDOR ONLINE / LOCAL
// ============================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor PCD Eventos rodando na porta ${PORT}`);
});
