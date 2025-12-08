// ============================================================
// 🌐 SERVIDOR PCD EVENTOS + BACKUP CLOUDINARY (PROTEGIDO)
// ============================================================
import express from "express";
import cors from "cors";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
import streamifier from "streamifier";
import mongoose from "mongoose";

dotenv.config();
const app = express();

// ============================================================
// 🍃 CONEXÃO COM MONGODB ATLAS
// ============================================================
const mongoUri = process.env.MONGODB_URI;

mongoose.connect(mongoUri)
  .then(() => console.log("🍃 MongoDB conectado com sucesso!"))
  .catch((err) => console.error("❌ Erro ao conectar no MongoDB:", err));

// ============================================================
// 🔓 CORS — Permitir acesso do GitHub Pages e localhost
// ============================================================
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://epilifcire-debug.github.io",
    "https://epilifcire-debug.github.io/pcd-eventos"
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: true
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// 🚫 Evita cache em todas as rotas (garante sempre o backup mais recente)
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// ============================================================
// ☁️ CONFIGURAÇÃO DO CLOUDINARY
// ============================================================
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME || "djln3mjwd",
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

// ============================================================
// 📦 MULTER + CLOUDINARY (UPLOAD DE DOCUMENTOS)
// ============================================================
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "uploads_pcd_eventos/arquivos",
    resource_type: "auto",
    public_id: file.originalname.split(".")[0],
  }),
});
const upload = multer({ storage });

// ============================================================
// 🔼 UPLOAD DE DOCUMENTOS
// ============================================================
app.post("/upload", upload.any(), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "Nenhum arquivo recebido." });
    }

    const arquivos = {};
    req.files.forEach((file) => {
      arquivos[file.fieldname] = {
        url: file.path,
        id: file.filename,
        tipo: file.mimetype,
        tamanho: file.size,
      };
    });

    res.json({ message: "Upload concluído com sucesso!", arquivos });
  } catch (err) {
    console.error("❌ Erro no upload:", err);
    res.status(500).json({ error: "Erro ao enviar documentos." });
  }
});

// ============================================================
// 💾 BACKUP JSON — SOBRESCREVE ARQUIVO ÚNICO (DADOS SANITIZADOS)
// ============================================================
app.post("/backup-json", async (req, res) => {
  try {
    // Sanitiza e protege os dados pessoais
    const sanitized = { ...req.body };

    // Remove CPF do backup
    if (sanitized.cpf) delete sanitized.cpf;

    // Mascarar telefone, ex: ********1234
    if (sanitized.telefone) {
      sanitized.telefone = sanitized.telefone.replace(/\d(?=\d{2})/g, "*");
    }

    // Remover senha
    if (sanitized.senha) delete sanitized.senha;

    const jsonData = JSON.stringify(sanitized, null, 2);
    const nomeArquivo = "backup_ultimo.json";

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "uploads_pcd_eventos/backups",
        resource_type: "raw",
        public_id: nomeArquivo.replace(".json", ""),
        overwrite: true,
        type: "authenticated", // 🔒 Backup não público
      },
      (error, result) => {
        if (error) {
          console.error("❌ Erro ao enviar backup:", error);
          return res.status(500).json({ error: "Falha ao enviar backup." });
        }

        console.log("☁️ Backup atualizado:", result.secure_url);
        res.json({
          message: "Backup enviado com sucesso!",
          url: `${result.secure_url}?v=${Date.now()}`,
        });
      }
    );

    streamifier.createReadStream(Buffer.from(jsonData)).pipe(uploadStream);
  } catch (err) {
    console.error("❌ Erro ao processar backup:", err);
    res.status(500).json({ error: "Erro ao processar backup JSON." });
  }
});

// ============================================================
// 📋 LISTAR BACKUP MAIS RECENTE
// ============================================================
app.get("/listar-backups", async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      resource_type: "raw",
      prefix: "uploads_pcd_eventos/backups/backup_ultimo",
      max_results: 1,
      direction: "desc",
    });

    if (!result.resources || result.resources.length === 0) {
      return res.status(404).json({ error: "Nenhum backup encontrado." });
    }

    const ultimo = result.resources[0];
    console.log("🔍 Backup atual:", ultimo.secure_url);

    let backupJson = null;
    try {
      const backupRes = await fetch(ultimo.secure_url);
      backupJson = await backupRes.json();
    } catch (e) {
      console.warn("⚠️ Não foi possível baixar o conteúdo do backup:", e.message);
    }

    res.json({
      message: "Backup mais recente encontrado",
      public_id: ultimo.public_id,
      created_at: ultimo.created_at,
      url: `${ultimo.secure_url}?v=${Date.now()}`,
      data: backupJson,
    });
  } catch (err) {
    console.error("❌ Erro ao listar backups:", err);
    res.status(500).json({ error: "Erro ao listar backups." });
  }
});

// ============================================================
// 🔄 TESTE DO SERVIDOR
// ============================================================
app.get("/", (req, res) => {
  res.send("✅ Servidor PCD Eventos rodando e conectado ao Cloudinary (modo protegido).");
});

// ============================================================
// 🚀 INICIALIZAÇÃO
// ============================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
