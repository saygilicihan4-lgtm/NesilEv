import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
const secretKey = secretKeys["default"] || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(SUPABASE_URL, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const h = (s: unknown) => String(s ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const headers = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy": "default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
};

async function page() {
  const { data: listings } = await admin
    .from("listings")
    .select("id,title,city,district,monthly_rent,min_stay_days,description")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(6);

  const cards = (listings ?? []).length
    ? (listings ?? []).map((x) => `
      <article class="listing">
        <div class="pill">Doğrulanmış ilan ağı</div>
        <h3>${h(x.title)}</h3>
        <p class="where">${h(x.city)} · ${h(x.district)}</p>
        <p>${h((x.description || "Güvenli ev paylaşımı için pilot ilan.").slice(0,180))}</p>
        <div class="rent"><strong>₺${Number(x.monthly_rent).toLocaleString("tr-TR")}</strong><span>/ ay</span></div>
        <small>Minimum ${h(x.min_stay_days)} gün</small>
      </article>
    `).join("")
    : `
      <article class="listing empty">
        <div class="pill">İstanbul pilotu</div>
        <h3>İlk doğrulanmış evler hazırlanıyor</h3>
        <p>NesilEv şu anda kontrollü pilot aşamasında. Ev sahibi veya oda arayan olarak erken erişime katılabilirsin.</p>
        <div class="rent"><strong>0 komisyon</strong><span> pilot başvurusu</span></div>
      </article>
      <article class="listing">
        <div class="pill">Güvenlik sınırı</div>
        <h3>Bakım hizmeti değil, güvenli ev paylaşımı</h3>
        <p>Tıbbi bakım, ilaç verme, finans işlemleri ve kişisel bakım görevleri sistemde yasaktır.</p>
        <div class="rent"><strong>≤ 5 saat</strong><span>/ hafta düşük riskli destek</span></div>
      </article>
      <article class="listing">
        <div class="pill">Şeffaf eşleşme</div>
        <h3>Yaşam tarzına göre uyum</h3>
        <p>Bütçe, ilçe, sigara, evcil hayvan, sessiz saatler ve destek tercihleri eşleşmede birlikte değerlendirilir.</p>
        <div class="rent"><strong>30+ gün</strong><span> uzun dönem odak</span></div>
      </article>`;

  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>NesilEv — Güvenli nesiller arası ev paylaşımı</title>
<meta name="description" content="NesilEv, evinde boş odası olanlarla uygun oda arayanları güvenli ve şeffaf biçimde buluşturan Türkiye odaklı ev paylaşımı platformudur."/>
<style>
:root{--ink:#18352f;--muted:#667b75;--cream:#f7f4ec;--paper:#fffdf8;--mint:#dcebe3;--accent:#d96f45;--line:#dbe2dd;--green:#2d6b59}
*{box-sizing:border-box}body{margin:0;font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:var(--cream);color:var(--ink)}
a{color:inherit}.wrap{max-width:1160px;margin:auto;padding:0 22px}nav{display:flex;align-items:center;justify-content:space-between;padding:22px 0}.brand{font-size:26px;font-weight:850;letter-spacing:-1px}.brand i{font-style:normal;color:var(--accent)}.navtag{font-size:13px;border:1px solid var(--line);padding:8px 12px;border-radius:999px;background:rgba(255,255,255,.55)}
.hero{display:grid;grid-template-columns:1.15fr .85fr;gap:28px;align-items:center;padding:52px 0 34px}.eyebrow{display:inline-flex;gap:8px;align-items:center;background:var(--mint);border-radius:999px;padding:8px 12px;font-size:13px;font-weight:700}.dot{width:8px;height:8px;border-radius:50%;background:#41a17f}
h1{font-size:clamp(44px,7vw,80px);line-height:.96;letter-spacing:-4px;margin:18px 0 20px;max-width:800px}.lead{font-size:20px;line-height:1.6;color:var(--muted);max-width:730px}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:26px}.btn{border:0;border-radius:14px;padding:15px 19px;font-size:15px;font-weight:800;cursor:pointer;text-decoration:none;display:inline-block}.primary{background:var(--ink);color:white}.secondary{background:white;border:1px solid var(--line)}
.heroCard{background:var(--paper);border:1px solid var(--line);border-radius:28px;padding:26px;box-shadow:0 22px 60px rgba(31,62,53,.09)}.score{font-size:58px;font-weight:900;letter-spacing:-3px}.bar{height:10px;border-radius:999px;background:#e9ece8;overflow:hidden}.bar span{display:block;width:92%;height:100%;background:var(--green)}.checks{display:grid;gap:11px;margin-top:20px}.check{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--line);font-size:14px}.check b{color:var(--green)}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:24px 0 70px}.stat{background:rgba(255,255,255,.55);border:1px solid var(--line);border-radius:18px;padding:18px}.stat strong{display:block;font-size:24px}.stat span{font-size:13px;color:var(--muted)}
section{padding:32px 0 70px}.sectionHead{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:22px}.sectionHead h2{font-size:36px;letter-spacing:-1.7px;margin:0}.sectionHead p{color:var(--muted);max-width:540px;margin:0}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.listing{background:var(--paper);border:1px solid var(--line);border-radius:22px;padding:22px;min-height:270px}.listing h3{font-size:22px;margin:14px 0 6px;letter-spacing:-.6px}.listing p{line-height:1.55;color:var(--muted)}.pill{display:inline-block;font-size:11px;text-transform:uppercase;letter-spacing:.08em;font-weight:800;background:var(--mint);padding:7px 9px;border-radius:999px}.where{font-size:13px}.rent{display:flex;align-items:baseline;gap:5px;margin-top:24px}.rent strong{font-size:23px}.rent span,small{color:var(--muted)}
.safety{background:var(--ink);color:white;border-radius:28px;padding:32px;display:grid;grid-template-columns:1fr 1fr;gap:32px}.safety p{color:#c9d5d1;line-height:1.6}.safety ul{margin:0;padding-left:20px;line-height:2}.bad{color:#ffb89c}.good{color:#a9e7c9}
.join{display:grid;grid-template-columns:.8fr 1.2fr;gap:28px;align-items:start}.join h2{font-size:44px;letter-spacing:-2px;margin:0}.join p{color:var(--muted);line-height:1.6}.form{background:var(--paper);border:1px solid var(--line);border-radius:24px;padding:24px}.two{display:grid;grid-template-columns:1fr 1fr;gap:12px}.field{display:grid;gap:7px;margin-bottom:12px}.field label{font-size:13px;font-weight:800}.field input,.field select,.field textarea{width:100%;border:1px solid #cfd9d3;background:white;border-radius:12px;padding:13px;font:inherit;color:var(--ink)}.field textarea{min-height:90px;resize:vertical}.form button{width:100%;margin-top:5px}.msg{display:none;margin-top:12px;padding:12px;border-radius:12px;font-size:14px}.ok{background:#dff3e9;color:#1f5d47}.err{background:#f8ded4;color:#813c27}
footer{border-top:1px solid var(--line);padding:28px 0 42px;color:var(--muted);font-size:13px}
@media(max-width:840px){.hero,.join,.safety{grid-template-columns:1fr}.grid{grid-template-columns:1fr}.stats{grid-template-columns:1fr}.two{grid-template-columns:1fr}h1{letter-spacing:-2.5px}.navtag{display:none}}
</style>
</head>
<body>
<div class="wrap">
<nav><div class="brand">Nesil<i>Ev</i></div><div class="navtag">Türkiye · Kontrollü pilot</div></nav>
<main>
<section class="hero">
<div>
<div class="eyebrow"><span class="dot"></span>Erken erişim açıldı</div>
<h1>Bir oda.<br/>İki nesil.<br/>Daha iyi bir eşleşme.</h1>
<p class="lead">Evinde boş odası olanlarla uygun oda arayanları; yaşam tarzı, bütçe, güvenlik ve karşılıklı beklentiler üzerinden buluşturan yeni nesil ev paylaşımı.</p>
<div class="actions"><a class="btn primary" href="#katil">Pilota katıl</a><a class="btn secondary" href="#nasil">Nasıl çalışır?</a></div>
</div>
<div class="heroCard">
<div class="pill">Örnek eşleşme</div>
<div class="score">%92</div>
<div class="bar"><span></span></div>
<div class="checks">
<div class="check"><span>Bütçe uyumu</span><b>Güçlü</b></div>
<div class="check"><span>İlçe tercihi</span><b>Uygun</b></div>
<div class="check"><span>Yaşam tarzı</span><b>Uyumlu</b></div>
<div class="check"><span>Destek beklentisi</span><b>Sınırlar içinde</b></div>
</div>
</div>
</section>
<div class="stats">
<div class="stat"><strong>30+ gün</strong><span>uzun dönem konaklama odağı</span></div>
<div class="stat"><strong>≤ %30</strong><span>destek karşılığı kira indirimi sınırı</span></div>
<div class="stat"><strong>≤ 5 saat</strong><span>haftalık düşük riskli destek sınırı</span></div>
</div>

<section id="nasil">
<div class="sectionHead"><div><div class="pill">Canlı pilot</div><h2>Güvenli eşleşmeye odaklanıyoruz.</h2></div><p>İlk aşamada İstanbul'da sınırlı sayıda doğrulanmış ev sahibi ve oda arayanla kontrollü pilot yürütülecek.</p></div>
<div class="grid">${cards}</div>
</section>

<section>
<div class="safety">
<div><div class="pill">Trust & Safety</div><h2>Yardımla bakım hizmeti arasına net sınır koyuyoruz.</h2><p>NesilEv bir bakım, sağlık veya finansal vekâlet hizmeti değildir. Destek maddeleri açık, düşük riskli ve önceden anlaşılmış olmalıdır.</p></div>
<div><ul><li class="good">Market alışverişine yardımcı olmak</li><li class="good">Basit teknoloji desteği</li><li class="good">Evcil hayvan gezdirme</li><li class="good">Kargo/posta teslim almaya yardımcı olmak</li><li class="bad">İlaç verme / tıbbi müdahale — yasak</li><li class="bad">Banka / para çekme işlemleri — yasak</li><li class="bad">Kişisel bakım — yasak</li></ul></div>
</div>
</section>

<section id="katil" class="join">
<div><div class="pill">İstanbul pilotu</div><h2>İlk kullanıcılar arasında yer al.</h2><p>Başvurunu bırak. Pilot eşleşmeleri doğrulama ve güvenlik kontrollerinden sonra kademeli olarak açılacak.</p></div>
<form class="form" id="waitlist">
<div class="two">
<div class="field"><label>Adın</label><input name="name" minlength="2" maxlength="80" required placeholder="Ad Soyad"/></div>
<div class="field"><label>E-posta</label><input name="email" type="email" maxlength="320" required placeholder="ornek@mail.com"/></div>
</div>
<div class="two">
<div class="field"><label>Nasıl katılmak istiyorsun?</label><select name="role" required><option value="seeker">Oda arıyorum</option><option value="host">Evimde oda var</option><option value="both">İkisi de olabilir</option></select></div>
<div class="field"><label>Şehir</label><input name="city" maxlength="80" value="İstanbul" required/></div>
</div>
<div class="field"><label>Kısa not (isteğe bağlı)</label><textarea name="note" maxlength="800" placeholder="İlçe, bütçe veya beklentini kısaca yazabilirsin."></textarea></div>
<button class="btn primary" type="submit">Erken erişime katıl</button>
<div class="msg" id="msg"></div>
</form>
</section>
</main>
<footer>NesilEv · Kontrollü pilot · Bu sürüm konaklama veya bakım hizmeti taahhüdü vermez; başvurular pilot değerlendirmesine alınır.</footer>
</div>
<script>
const form=document.getElementById('waitlist'),msg=document.getElementById('msg');
form.addEventListener('submit',async(e)=>{
 e.preventDefault(); msg.style.display='none';
 const body=Object.fromEntries(new FormData(form).entries());
 try{
  const r=await fetch(location.href,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const j=await r.json();
  msg.className='msg '+(r.ok?'ok':'err');
  msg.textContent=r.ok?'Başvurun alındı. Pilot açıldığında sana haber vereceğiz.':(j.error||'Başvuru alınamadı.');
  msg.style.display='block';
  if(r.ok){form.reset(); form.city.value='İstanbul';}
 }catch{msg.className='msg err';msg.textContent='Bağlantı hatası. Tekrar deneyebilirsin.';msg.style.display='block'}
});
</script>
</body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "GET") {
    const url = new URL(req.url);
    if (url.searchParams.get("health") === "1") {
      return new Response(JSON.stringify({ ok: true, service: "nesilev-web", version: "0.6-live" }), {
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    }
    return new Response(await page(), { headers });
  }

  if (req.method === "POST") {
    try {
      const body = await req.json();
      const name = String(body.name ?? "").trim();
      const email = String(body.email ?? "").trim().toLowerCase();
      const role = String(body.role ?? "");
      const city = String(body.city ?? "İstanbul").trim();
      const note = String(body.note ?? "").trim();

      if (name.length < 2 || name.length > 80) return Response.json({ error: "Ad alanını kontrol et." }, { status: 400 });
      if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 320) return Response.json({ error: "Geçerli bir e-posta gir." }, { status: 400 });
      if (!["host","seeker","both"].includes(role)) return Response.json({ error: "Rol seçimi geçersiz." }, { status: 400 });
      if (city.length < 2 || city.length > 80) return Response.json({ error: "Şehir alanını kontrol et." }, { status: 400 });
      if (note.length > 800) return Response.json({ error: "Not çok uzun." }, { status: 400 });

      const { error } = await admin.from("pilot_waitlist").insert({ name, email, role, city, note: note || null });
      if (error) {
        if (error.code === "23505") return Response.json({ error: "Bu e-posta zaten erken erişim listesinde." }, { status: 409 });
        console.error(error);
        return Response.json({ error: "Başvuru kaydedilemedi." }, { status: 500 });
      }
      return Response.json({ ok: true }, { status: 201 });
    } catch {
      return Response.json({ error: "Geçersiz istek." }, { status: 400 });
    }
  }

  return new Response("Method Not Allowed", { status: 405 });
});