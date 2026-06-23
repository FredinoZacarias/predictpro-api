import express from "express";
import cors from "cors";
import gamesRoute from "./routes/games.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Permitir só o teu domínio GitHub Pages em produção
const allowedOrigins = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  process.env.FRONTEND_URL || "*"  // ex: https://teu-user.github.io
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error("CORS bloqueado"));
    }
  }
}));

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "PredictPro API", ts: new Date().toISOString() });
});

// Rotas
app.use("/games", gamesRoute);

// Handler de erros global
app.use((err, req, res, next) => {
  console.error("[ERRO]", err.message);
  res.status(500).json({ error: "Erro interno do servidor." });
});

app.listen(PORT, () => {
  console.log(`✅ PredictPro API a correr na porta ${PORT}`);
});
