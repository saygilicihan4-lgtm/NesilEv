import http from "node:http";
import crypto from "node:crypto";
import { Pool } from "pg";

const PORT = Number(process.env.PORT || 3000);
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
});

await pool.query(`
  create table if not exists pilot_waitlist (
    id bigserial primary key,
    name varchar(80) not null,
    email varchar(320) not null,
    role varchar(12) not null check (role in ('host','seeker','both')),
    city varchar(80) not null default 'İstanbul',
    note varchar(800),
    created_at timestamptz not null default now()
  );
  create unique index if not exists pilot_waitlist_email_lower_idx
    on pilot_waitlist (lower(email));
`);

const allowedOrigins = new Set([
  "https://saygilicihan4-lgtm.github.io",
]);

const buckets = new Map();

function cors(origin) {
  const headers = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
  if (origin && allowedOrigins.has(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

function sendJson(res, status, body, extra={}) {
  const data = Buffer.from(JSON.stringify(body));
  res.writeHead(status, {
    "Content-Type":"application/json; charset=utf-8",
    "Content-Length": data.length,
    "Cache-Control":"no-store",
    "X-Content-Type-Options":"nosniff",
    ...extra,
  });
  res.end(data);
}

function clientKey(req) {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = Array.isArray(forwarded) ? forwarded[0] : String(forwarded || req.socket.remoteAddress || "").split(",")[0].trim();
  return crypto.createHash("sha256").update(ip).digest("hex");
}

function rateLimited(req) {
  const key = clientKey(req);
  const now = Date.now();
  const item = buckets.get(key) || { count: 0, reset: now + 60_000 };
  if (now > item.reset) {
    item.count = 0;
    item.reset = now + 60_000;
  }
  item.count += 1;
  buckets.set(key, item);
  return item.count > 8;
}

async function readJson(req) {
  return await new Promise((resolve, reject) => {
    let size = 0;
    let raw = "";
    req.on("data", chunk => {
      size += chunk.length;
      if (size > 5_000) {
        reject(Object.assign(new Error("payload_too_large"), { status: 413 }));
        req.destroy();
        return;
      }
      raw += chunk;
    });
    req.on("end", () => {
      try { resolve(JSON.parse(raw || "{}")); }
      catch { reject(Object.assign(new Error("invalid_json"), { status: 400 })); }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || null;

  if (req.method === "OPTIONS") {
    res.writeHead(204, cors(origin));
    return res.end();
  }

  if (req.method === "GET" && req.url === "/health") {
    try {
      await pool.query("select 1");
      return sendJson(res, 200, { ok:true, service:"nesilev-api", database:"ok" });
    } catch {
      return sendJson(res, 503, { ok:false, service:"nesilev-api", database:"unavailable" });
    }
  }

  if (req.method === "POST" && req.url === "/api/waitlist") {
    if (!origin || !allowedOrigins.has(origin)) {
      return sendJson(res, 403, { error:"origin_not_allowed" }, cors(origin));
    }
    if (rateLimited(req)) {
      return sendJson(res, 429, { error:"Çok fazla deneme. Bir dakika sonra tekrar deneyin." }, cors(origin));
    }

    try {
      const body = await readJson(req);
      const name = String(body.name ?? "").trim();
      const email = String(body.email ?? "").trim().toLowerCase();
      const role = String(body.role ?? "");
      const city = String(body.city ?? "İstanbul").trim();
      const note = String(body.note ?? "").trim();
      const website = String(body.website ?? "").trim();

      // Honeypot: bots get a neutral success response without being stored.
      if (website) return sendJson(res, 201, { ok:true }, cors(origin));

      if (name.length < 2 || name.length > 80) return sendJson(res, 400, { error:"Ad alanını kontrol et." }, cors(origin));
      if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 320) return sendJson(res, 400, { error:"Geçerli bir e-posta gir." }, cors(origin));
      if (!["host","seeker","both"].includes(role)) return sendJson(res, 400, { error:"Rol seçimi geçersiz." }, cors(origin));
      if (city.length < 2 || city.length > 80) return sendJson(res, 400, { error:"Şehir alanını kontrol et." }, cors(origin));
      if (note.length > 800) return sendJson(res, 400, { error:"Not çok uzun." }, cors(origin));

      await pool.query(
        "insert into pilot_waitlist(name,email,role,city,note) values($1,$2,$3,$4,$5)",
        [name,email,role,city,note || null]
      );
      return sendJson(res, 201, { ok:true }, cors(origin));
    } catch (err) {
      if (err?.code === "23505") return sendJson(res, 409, { error:"Bu e-posta zaten erken erişim listesinde." }, cors(origin));
      const status = err?.status || 500;
      return sendJson(res, status, { error: status === 500 ? "Başvuru kaydedilemedi." : err.message }, cors(origin));
    }
  }

  return sendJson(res, 404, { error:"not_found" }, cors(origin));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`NesilEv API listening on ${PORT}`);
});
