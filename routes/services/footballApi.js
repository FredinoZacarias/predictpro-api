// =============================================
// Football-Data.org — API gratuita
// Regista em https://www.football-data.org/
// e coloca a API key no .env como FOOTBALL_API_KEY
// =============================================

const BASE_URL = "https://api.football-data.org/v4";
const API_KEY  = process.env.FOOTBALL_API_KEY;

// Cache simples em memória (evita gastar quota)
let cache = { data: null, ts: 0 };
const CACHE_TTL = 60 * 60 * 1000; // 1 hora

export async function getGames() {
  // Usar cache se ainda válido
  if (cache.data && (Date.now() - cache.ts < CACHE_TTL)) {
    console.log("[footballApi] a usar cache");
    return cache.data;
  }

  const today = getTodayStr();

  const res = await fetch(
    `${BASE_URL}/matches?dateFrom=${today}&dateTo=${today}&status=SCHEDULED,LIVE`,
    {
      headers: { "X-Auth-Token": API_KEY }
    }
  );

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Football API erro ${res.status}: ${txt}`);
  }

  const json = await res.json();
  const matches = json.matches || [];

  // Normalizar dados relevantes
  const games = matches.slice(0, 8).map(m => ({
    id:          m.id,
    homeTeam:    m.homeTeam.name,
    awayTeam:    m.awayTeam.name,
    competition: m.competition.name,
    utcDate:     m.utcDate,
    status:      m.status,
    score:       m.score
  }));

  // Guardar cache
  cache = { data: games, ts: Date.now() };

  return games;
}

function getTodayStr() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  }
