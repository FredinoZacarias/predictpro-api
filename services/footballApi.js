// =============================================
// API-Football (api-sports.io)
// Regista em https://www.api-football.com
// Coloca a chave no .env como FOOTBALL_API_KEY
// Plano grátis: 100 req/dia
// =============================================

const BASE_URL = "https://v3.football.api-sports.io";
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

  const res = await fetch(`${BASE_URL}/fixtures?date=${today}`, {
    headers: {
      "x-apisports-key": API_KEY
    }
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Football API erro ${res.status}: ${txt}`);
  }

  const json = await res.json();
  const fixtures = json.response || [];

  if (!fixtures.length) {
    return [];
  }

  // Normalizar dados — pegar só os primeiros 8 jogos
  const games = fixtures.slice(0, 8).map(f => ({
    id:          f.fixture.id,
    homeTeam:    f.teams.home.name,
    awayTeam:    f.teams.away.name,
    competition: f.league.name,
    utcDate:     f.fixture.date,
    status:      f.fixture.status.short,
    score: {
      home: f.goals.home,
      away: f.goals.away
    }
  }));

  // Guardar cache
  cache = { data: games, ts: Date.now() };

  return games;
}

function getTodayStr() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}
