import fetch from "node-fetch";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Cache de previsões para não gastar quota
const predCache = new Map();

export async function getPrediction(game) {
  const key = `${game.homeTeam}-${game.awayTeam}`;

  if (predCache.has(key)) {
    console.log(`[aiService] cache hit: ${key}`);
    return predCache.get(key);
  }

  const prompt = `És um analista de futebol experiente e objectivo.

Analisa o jogo: ${game.homeTeam} vs ${game.awayTeam}
Competição: ${game.competition}

Responde APENAS com:
1. Quem tem mais probabilidade de ganhar e porquê (2-3 frases)
2. Probabilidade de golos: baixo / médio / alto
3. Resultado mais provável (ex: 1-0, 1-1, 2-1)

Sê directo. Sem introduções. Sem "claro que" ou outros enchimentos.`;

  const res = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 250,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI erro ${res.status}: ${err}`);
  }

  const json = await res.json();
  const text = json.choices[0].message.content.trim();

  // Cache por 6 horas
  predCache.set(key, text);
  setTimeout(() => predCache.delete(key), 6 * 60 * 60 * 1000);

  return text;
    }
      
