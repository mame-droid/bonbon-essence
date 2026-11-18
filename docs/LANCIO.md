# Lancio di Bonbon Essence su bonbonessence.com

Checklist per passare dall'anteprima (`bonbon-essence-anteprima.netlify.app`) al sito definitivo.
Tempo stimato, una volta comprato il dominio: circa 15 minuti, più l'attesa che il dominio si attivi (da pochi minuti fino a 24 ore).

---

## 1. Prima del lancio (contenuti)

- [ ] **Pagine legali completate:** nome, indirizzo, metodi di pagamento, banca o servizio di pagamento (vedi le parti gialle nelle pagine).
- [ ] **Storia scritta** dalla titolare nel pannello (sezione "Notre histoire").
- [ ] **Ingredienti (INCI)** inseriti per i profumi del nuovo stock, copiati dai documenti del fornitore.
- [ ] **Ordine di prova** completo: dal carrello a WhatsApp, fino alla conferma.
- [ ] **Facoltativo:** micro-entreprise aperta (SIRET, mediatore dei consumi e frase sull'IVA da aggiungere alle CGV).

## 2. Comprare il dominio (la titolare, a suo nome)

Consigliato: **OVHcloud** (francese, sito e assistenza in francese).

- Dominio: **bonbonessence.com**. Facoltativo anche **bonbonessence.fr**, per proteggere il nome.
- Prezzo del .com visto su OVHcloud a novembre 2026: 7,49 € il primo anno, poi 8,59 € all'anno. Controllare al momento dell'acquisto se il prezzo mostrato è con IVA (TTC) o senza (HT).
- Durante l'acquisto **rifiutare** hosting, siti web e altre opzioni: serve solo il dominio.
- Usare i dati della titolare e l'email bonbonessence.contact@gmail.com.

In alternativa si può comprare direttamente su Netlify: niente configurazione DNS (il punto 3 si salta), ma il pannello è in inglese e il prezzo di solito è un po' più alto.

## 3. Collegare il dominio a Netlify

**Su Netlify** (sito bonbon-essence-anteprima):

1. **Domain management** → **Add a domain** → scrivere `bonbonessence.com` → confermare.
2. Netlify propone di usare **www.bonbonessence.com** come indirizzo principale: accettare. L'indirizzo senza "www" ci porterà da solo.
3. Scegliere la configurazione con **DNS esterno** (il dominio resta su OVH).

**Su OVHcloud** → Nomi di dominio → bonbonessence.com → **Zona DNS**:

| Tipo | Sottodominio | Destinazione |
|---|---|---|
| A | *(vuoto)* | `75.2.60.5` |
| CNAME | `www` | `bonbon-essence-anteprima.netlify.app.` |

- **Eliminare** eventuali record A, AAAA o CNAME già presenti per *(vuoto)* e per `www`: OVH ne crea alcuni di default che punterebbero altrove.
- L'indirizzo `75.2.60.5` è quello indicato da Netlify per il suo bilanciatore. Prima di salvare, verificare che coincida con quello mostrato nel pannello Netlify (Domain management).

**Di nuovo su Netlify:**

4. Attendere che il dominio risulti verificato. Può volerci da qualche minuto a 24 ore.
5. In **HTTPS** il certificato si attiva da solo. Se non parte, premere "Verify DNS configuration" e poi "Provision certificate".
6. L'indirizzo `.netlify.app` continua a funzionare e porta automaticamente al nuovo dominio, quindi i vecchi link non si rompono.

## 4. Email con il dominio (facoltativo)

Su OVHcloud → Email → **Redirezioni**: creare `contact@bonbonessence.com` → `bonbonessence.contact@gmail.com`.
Le email arrivano nella solita Gmail. Poi la titolare aggiorna l'email nel pannello (Prezzi, spedizioni e testi → Contatti).

## 5. Ultimi ritocchi tecnici (da fare con Claude)

- [ ] `netlify.toml`: `LAUNCHED = "true"`. Toglie l'avviso demo e rende il sito visibile su Google.
- [ ] `site/admin/config.yml`: `site_url` e `display_url` → `https://www.bonbonessence.com`.
- [ ] Guida del pannello e note legali: aggiornare gli indirizzi.
- [ ] Controllare anteprime WhatsApp/Instagram, pagine prodotto, carrello e pannello sul nuovo dominio.
- [ ] Rigenerare il QR code con il nuovo indirizzo prima di stamparlo.
- [ ] Facoltativo: aggiungere il sito a **Google Search Console** (con l'account Google della titolare) e inviare `https://www.bonbonessence.com/sitemap.xml`, così Google lo trova prima.

## 6. Proprietà (consigliato)

Oggi repository GitHub e sito Netlify sono sull'account dello sviluppatore. Per far sì che tutto resti alla titolare anche in futuro:

- **GitHub:** Settings del repository → Danger Zone → **Transfer ownership** → account `bonbon-essence`. Lo sviluppatore resta collaboratore.
- **Netlify:** la titolare crea un account Netlify. Poi lo sviluppatore trasferisce il sito al suo team (Project configuration → General → **Transfer project**) e lei lo aggiunge come membro.
- Dopo il trasferimento su GitHub, aggiornare `repo:` in `site/admin/config.yml` (`bonbon-essence/bonbon-essence`) e rifare la "OAuth App" del pannello dal suo account GitHub.
