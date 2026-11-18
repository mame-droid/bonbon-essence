# Bonbon Essence

Sito vetrina di Bonbon Essence (huiles parfumées), con ordini via WhatsApp.

## Struttura

- `site/` contiene i file del sito. Netlify esegue `build.mjs`, che copia `site/` in `dist/` e crea una pagina per ogni profumo (`/parfums/<id>/`) con anteprima per i social, `sitemap.xml` e `robots.txt`.
  - `index.html` contiene pagina, stile e script.
  - `content/products.json` contiene i profumi (testi FR/EN, note, foto, video, ingredienti).
  - `content/settings.json` contiene prezzi a lotti, spedizioni, contatti e il testo "Notre histoire".
  - `assets/` contiene immagini e video; `assets/uploads/` riceve i file caricati dal pannello.
  - `admin/` è il pannello di gestione (Decap CMS), raggiungibile su `/admin`.
- `brand/` contiene i file originali del logo.
- `build.mjs` è lo script di build (Node, senza dipendenze).
- `docs/LANCIO.md` è la checklist per il lancio sul dominio (acquisto, DNS, interruttore `LAUNCHED` in `netlify.toml`).
- `tools/qr.py` crea QR code e biglietto per i pacchi in `brand/qr/` (`python tools/qr.py <indirizzo> <nome>`, serve `pip install segno pillow fonttools brotli`).
- `netlify.toml` contiene la configurazione di Netlify.

## Come funziona il pannello

1. La titolare entra su `/admin` con il suo account GitHub.
2. Modifica profumi, prezzi o testi e preme "Pubblica".
3. Il pannello salva la modifica su GitHub e Netlify ripubblica il sito in meno di un minuto.

## Provare il sito in locale

```bash
node build.mjs
```

```bash
cd dist && python3 -m http.server 8080
```

Poi apri http://localhost:8080. Il sito legge i file JSON, quindi aprirlo con doppio clic non funziona.
