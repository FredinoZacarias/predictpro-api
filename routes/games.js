import express from "express";
import { getGames } from "../services/footballApi.js";
import { getPrediction } from "../services/aiService.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    console.log("[/games] a buscar jogos…");
    const games = await getGames();

    if (!games.length) {
      return res.json([]);
    }

    // Gerar previsões em paralelo
    console.log(`[/games] a gerar previsões para ${games.length} jogos…`);
    const results = await Promise.allSettled(
      games.map(async (game) => {
        const prediction = await getPrediction(game);
        return { ...game, prediction };
      })
    );

    // Filtrar só os que tiveram sucesso
    const successful = results
      .filter(r => r.status === "fulfilled")
      .map(r => r.value);

    console.log(`[/games] enviados ${successful.length} jogos com previsão`);
    res.json(successful);

  } catch (err) {
    next(err);
  }
});

export default router;
  
