import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "troque-esta-chave-por-uma-bem-segura";

// ---- MIDDLEWARES ----
app.use(
  cors({
    origin: [
      "https://epilifcire-debug.github.io",
      "http://localhost:3000"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.json());

// Pasta de documentos
const documentosDir = path.join(__dirname, "documentos");
if (!fs.existsSync(documentosDir)) {
  fs.mkdirSync(documentosDir, { recursive: true });
}
app.use("/documentos", express.static(documentosDir));

// ---- BANCO DE DADOS (SQLite) ----
const db = new sqlite3.Database(path.join(__dirname, "db.sqlite"));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      ativo INTEGER DEFAULT 1
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS eventos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      data TEXT,
      descricao TEXT
  )`);

  db.get("SELECT COUNT(*) AS total FROM usuarios", (err, row) => {
    if (err) {
      console.error("Erro ao verificar usuários:", err);
      return;
    }
    if (row.total === 0) {
      const nome = "Administrador";
      const email = "admin@pcd.com";
      const senha = "1234";
      const role = "admin";
      bcrypt.hash(senha, 10, (errHash, hash) => {
        if (errHash) return console.error("Erro ao gerar hash:", errHash);
        db.run(
          "INSERT INTO usuarios (nome, email, senha_hash, role, ativo) VALUES (?, ?, ?, ?, 1)",
          [nome, email, hash, role],
          (errIns) => {
            if (errIns) console.error("Erro ao criar admin:", errIns);
            else console.log("✅ Usuário admin padrão criado:", email);
          }
        );
      });
    }
  });
});

// ---- AUTENTICAÇÃO ----
app.post("/api/login", (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ error: "Informe email e senha." });

  db.get("SELECT * FROM usuarios WHERE email = ? AND ativo = 1", [email], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: "Usuário ou senha inválidos." });

    bcrypt.compare(senha, user.senha_hash, (errComp, same) => {
      if (errComp) return res.status(500).json({ error: "Erro ao validar senha." });
      if (!same) return res.status(401).json({ error: "Usuário ou senha inválidos." });

      const payload = { id: user.id, nome: user.nome, email: user.email, role: user.role };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

      res.json({ token, user: payload });
    });
  });
});

// ---- LISTAR EVENTOS ----
app.get("/api/eventos", (req, res) => {
  db.all("SELECT * FROM eventos ORDER BY date(data) ASC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ---- ROTA RAIZ ----
app.get("/", (req, res) => {
  res.send("API PCD Eventos rodando ✅");
});

// ---- INICIAR SERVIDOR ----
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
