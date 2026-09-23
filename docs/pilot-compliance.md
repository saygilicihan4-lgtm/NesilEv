# NesilEv Pilot Compliance Gate

_Last reviewed: 2026-09-23_

## Launch mode

NesilEv is currently an **early-access / waitlist pilot**. It must not open real rental matching, payments, deposits, or contract execution until the legal flow below is resolved.

## Minimum-stay rule

For the Turkey pilot, product logic should be designed around **101+ day stays** unless qualified Turkish counsel confirms a different compliant structure for host-occupied room sharing.

Reason: the current tourism-rental framework defines rentals of a dwelling for **100 days or less in one instance** as tourism-purpose rental, regardless of purpose. The relevant regulation also states that rooms of a permitted tourism-rental dwelling may not be separately contracted to different persons.

Official references:
- Resmi Gazete, 28.12.2023, No. 32413 — Konutların Turizm Amacli Kiralanmasi Faaliyetlerinin Duzenlenmesine Iliskin Yonetmelik
- T.C. Kultur ve Turizm Bakanligi current guidance / application materials

## Product gates before real matching

1. Replace all “30+ gun” product rules with **101+ gun** unless legal review says otherwise.
2. Keep the service framed as long-term home sharing, not tourism accommodation.
3. Obtain legal review specifically for **host-occupied spare-room sharing** and whether the 7464 regime applies to the intended contract structure.
4. No payments, deposits, rent collection, or auto-generated binding contracts until tax/payment/intermediary obligations are reviewed.
5. Add a KVKK-compliant privacy notice at data collection.
6. Define retention periods for waitlist, verification, messages, reports, and identity documents.
7. Identity/address documents must remain private and access-logged.
8. No medical, personal-care, banking, cash-withdrawal, power-of-attorney, or similar duties.
9. Human moderation before verification approval and before pilot activation.

## Current technical controls

- Public waitlist data is not directly readable by anon/authenticated roles.
- early_access_signups and signup_rate_limits have RLS enabled.
- Direct anon/authenticated table privileges for those tables were revoked.
- Admin role checks use restricted function execution and empty search_path.
- Rate-limit hashes are pruned after 24 hours.
- Admin data remains role-gated.
- Live Lovable site: https://nesilev.lovable.app
- GitHub Pages fallback: https://saygilicihan4-lgtm.github.io/NesilEv/

## Current launch decision

**Allowed now:** landing page, early-access waitlist, non-binding research interviews.

**Not allowed yet:** live room listings, accepting a rental, collecting money, matching into a rental contract, verification-document collection at scale, or representing the flow as legally cleared.
