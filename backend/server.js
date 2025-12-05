import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js"; // <-- Certifique-se de que seu index.js exporta todas as rotas

dotenv.config();

const app = express();

// -----------------------------------------------------
// 🔒 CORS CONFIGURADO PARA PRODUÇÃO + GITHUB PAGES
// -----------------------------------------------------
const whitelist = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://epilifcire-debug.github.io",
  "https://pcd-eventos.onrender.com"
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (whitelist.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("CORS bloqueou essa origem: " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));

// -----------------------------------------------------
// 🧩 Middlewares globais
// -----------------------------------------------------
app.use(express.json());
app.use(cookieParser());

// -----------------------------------------------------
// 🛣 Suas Rotas
// -----------------------------------------------------
app.use("/api", routes);

// -----------------------------------------------------
// ❗ Middleware Global de Erros (último sempre)
// -----------------------------------------------------
app.use((err, req, res, next) => {
  console.error("🔥 ERRO DETECTADO:", err.message);

  const status = res.statusCode !== 200 ? res.statusCode : 500;

  return res.status(status).json({
    success: false,
    message: err.message || "Erro interno no servidor",
    stack: process.env.NODE_ENV === "production" ? null : err.stack
  });
});

// -----------------------------------------------------
// 🚀 Inicialização no Render
// -----------------------------------------------------
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
