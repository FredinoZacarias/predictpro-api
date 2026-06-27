const BASE_URL = "https://v3.football.api-sports.io";
const API_KEY  = process.env.FOOTBALL_API_KEY;

let cache = { data: null, ts: 0 };
const CACHE_TTL = 60 * 60 * 1000;

export async function getGames() {
  if (cache.data && (Date.now() - cache.ts < CACHE_TTL)) {
    console.log("[footballApi] a usar cache");
    return cache.data;
  }

  const today = getTodayStr();

  const res = await fetch(`${BASE_URL}/fixtures?date=${today}`, {
    headers: {
      "x-apisports-key": API_KEY,
      "x-rapidapi-key": API_KEY,
      "x-rapidapi-host": "v3.football.api-sports.io"
    }
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Football API erro ${res.status}: ${txt}`);
  }

  const json = await res.json();

  // Verificar erro na resposta
  if (json.errors && json.errors.token) {
    throw new Error(`Chave inválida: ${json.errors.token}`);
  }

  const fixtures = json.response || [];

  if (!fixtures.length) return [];

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

  cache = { data: games, ts: Date.now() };
  return games;
}

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
                     }
    
