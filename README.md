# NesilEv

Türkiye odaklı, güvenli nesiller arası ev paylaşımı platformu.

## Canlı pilot
- Aktif uygulama: https://eyiflkmadiaurzzwring.supabase.co/functions/v1/nesilev-web
- GitHub Pages hedefi: https://saygilicihan4-lgtm.github.io/NesilEv/

## GitHub Pages
Repo içindeki `.github/workflows/pages.yml` production yayınına hazırdır.
GitHub repo ayarlarında **Settings → Pages → Source → GitHub Actions** seçildiğinde workflow yeniden çalıştırılabilir.

## Durum
- Supabase backend: canlı
- RLS / security advisor: temiz
- Moderation Edge Function: aktif
- Public pilot web: aktif
- GitHub kaynak deposu: senkron
- GitHub Pages frontend: `site/index.html`
- Erken erişim API: `waitlist` Edge Function
- Erken erişim başvuruları: `pilot_waitlist`
- Güvenlik sınırları: tıbbi bakım, kişisel bakım ve finansal işlemler yasak

Secret/service-role anahtarları repoya yazılmaz.
