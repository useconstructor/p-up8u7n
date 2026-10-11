# Miga

Visitors recognize three example breads, select quantities, review and save a demonstration order, then consult its private link. No payments or fulfillment. The order form uses the dedicated Turso API rather than the generic contact endpoint because it creates an order and never sends contact promises.

Art direction: a bright bakery worktable, expressive sans typography and blue editorial surfaces instead of the conventional cream/serif/terracotta bakery. The six exact tokens are harina #F5F7FA, tinta #192D3A, azul obrador #2459A6, agua #DFEAF4, corteza #865325, error #B42332. Bricolage Grotesque headings 48/36/28 desktop, 32/26/22 phone; Source Sans 3 body 16–18, secondary 14. Spacing 4/8/12/16/24/32/48. A rectangular bread photograph and attached label form the window of crumb. Desktop pairs alternating editorial rows and a content-height summary; tablet uses the full catalogue width and an in-flow summary; phone shows a 200px photograph with an in-flow summary. The desktop summary starts at 1100px.

Database configuration: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are server only. There is no automatic fallback database. Migration is applied atomically once and seeds exactly three explicitly requested example products using a persistent marker. All order writes are transactional. Session and private order tokens contain 256 random bits; draft session tokens are stored only as SHA256 hashes. Draft updates use optimistic version checks plus a serialized browser queue. The draft stores the idempotency key before submission and rotates it only when content changes. Order content is canonicalized and compared on replay.

Limits: name 120 characters, email 254, observations 2000. Integer quantities 1–20. API body limit 16 KiB. No public listing or automatic deletion. Private responses use no-store, noindex, and no-referrer.

Assets: original Wikimedia Commons photos downloaded and resized locally to WebP, with responsive object-fit crops. No generated imagery. The specific verified photograph requirement takes precedence over the conflicting generic placeholder instruction at the end of the build document.

- hogaza.webp: “Sourdough bread - January 2026 - Sarah Stierch 02.jpg”, Sarah Stierch (Missvain), CC0. https://commons.wikimedia.org/wiki/File:Sourdough_bread_-_January_2026_-_Sarah_Stierch_02.jpg
- baguette.webp: “Baguette mie.jpg”, Popo le Chien, CC BY-SA 4.0. https://commons.wikimedia.org/wiki/File:Baguette_mie.jpg
- semillas.webp: “Seeded bread (14018953083).jpg”, Jim Lukach, CC BY 2.0. https://commons.wikimedia.org/wiki/File:Seeded_bread_(14018953083).jpg
  Photos downloaded at original resolution, resized to 2400px, and sharpened. Seeded bread has a light and saturation adjustment. Derived assets retain their corresponding licenses; attribution is visible in the catalogue. License terms: https://creativecommons.org/publicdomain/zero/1.0/ https://creativecommons.org/licenses/by-sa/4.0/ https://creativecommons.org/licenses/by/2.0/
  Local variable font files from google/fonts ofl/bricolagegrotesque and ofl/sourcesans3, SIL Open Font License 1.1, bundled alongside each font.
