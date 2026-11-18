// Build del sito, eseguito da Netlify a ogni pubblicazione (anche quelle fatte dal pannello).
// Copia site/ in dist/, poi crea una pagina per ogni profumo (/parfums/<id>/) con titolo,
// descrizione e immagine di anteprima per WhatsApp, Instagram, Facebook e Google.
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const SRC = "site", OUT = "dist";
// Netlify fornisce l'indirizzo principale del sito (il dominio, quando sarà collegato).
const SITE = (process.env.URL || "https://bonbon-essence-anteprima.netlify.app").replace(/\/$/, "");

const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const plain = s => String(s ?? "").replace(/<[^>]*>/g, "");
const short = (s, n = 158) => { s = plain(s).replace(/\s+/g, " ").trim(); return s.length <= n ? s : s.slice(0, s.lastIndexOf(" ", n - 1)) + "…"; };
const fr = o => (o && (o.fr || o.en)) || "";
const abs = p => (/^https?:/.test(p) ? p : SITE + "/" + String(p).replace(/^\/+/, ""));
// Immagine 1200×630 ritagliata dal CDN di Netlify a partire dalla foto del profumo.
const ogImage = p => `${SITE}/.netlify/images?url=${encodeURIComponent("/" + String(p).replace(/^\/+/, ""))}&w=1200&h=630&fit=cover&fm=jpg`;

rmSync(OUT, { recursive: true, force: true });
cpSync(SRC, OUT, { recursive: true });

const products = JSON.parse(readFileSync(`${SRC}/content/products.json`, "utf8")).products.filter(p => p.visible !== false && p.id && p.name);
const settings = JSON.parse(readFileSync(`${SRC}/content/settings.json`, "utf8"));
const template = readFileSync(`${SRC}/index.html`, "utf8");
if (!template.includes("<!--SEO-->")) throw new Error("index.html: blocco <!--SEO--> mancante");
const withSeo = (html, block) => html.replace(/<!--SEO-->[\s\S]*?<!--\/SEO-->/, `<!--SEO-->\n${block}\n<!--/SEO-->`);

// Stessa regola dello script della pagina: su Netlify le foto passano dal CDN che le ridimensiona.
const ON_NETLIFY = process.env.NETLIFY === "true";
const media = (src, w) => (src && ON_NETLIFY && /\.(jpe?g|png|webp)$/i.test(src)) ? `/.netlify/images?url=/${String(src).replace(/^\/+/, "")}&w=${w}` : src;

// Parti comuni a tutte le pagine generate:
// - i contenuti dentro la pagina, così il sito non aspetta di scaricare i file JSON;
// - le 4 foto della home già al loro posto (lo script non le riscarica se sono uguali).
const contentScript = `<script>window.__CONTENT=${JSON.stringify({ products: { products: JSON.parse(readFileSync(`${SRC}/content/products.json`, "utf8")).products }, settings: JSON.parse(readFileSync(`${SRC}/content/settings.json`, "utf8")) }).replace(/</g, "\\u003c")}</script>`;
const heroKey = products.slice(0, 4).map(p => p.image).join("|");
const heroHtml = `<div class="hero__pill" id="heroPill" data-key="${esc(heroKey)}">\n` +
  products.slice(0, 4).map((p, i) => `          <img src="${esc(media(p.image, 600))}" alt="" width="621" height="625"${i ? "" : ' fetchpriority="high"'}>`).join("\n") + "\n        </div>";
const prepare = html => {
  const out = html.replace(/<div class="hero__pill" id="heroPill">[\s\S]*?<\/div>/, heroHtml).replace("</head>", `${contentScript}\n</head>`);
  if (!out.includes('data-key=') || !out.includes("window.__CONTENT")) throw new Error("index.html: impossibile inserire foto o contenuti");
  return out;
};

const common = (title, desc, url, image, w, h, type) => [
  `<title>${esc(title)}</title>`,
  `<meta name="description" content="${esc(desc)}">`,
  `<link rel="canonical" href="${esc(url)}">`,
  `<meta property="og:site_name" content="Bonbon Essence">`,
  `<meta property="og:type" content="${type}">`,
  `<meta property="og:locale" content="fr_FR">`,
  `<meta property="og:locale:alternate" content="en_GB">`,
  `<meta property="og:title" content="${esc(title)}">`,
  `<meta property="og:description" content="${esc(desc)}">`,
  `<meta property="og:url" content="${esc(url)}">`,
  `<meta property="og:image" content="${esc(image)}">`,
  `<meta property="og:image:width" content="${w}">`,
  `<meta property="og:image:height" content="${h}">`,
  `<meta name="twitter:card" content="summary_large_image">`,
].join("\n");

// Home
const names = products.map(p => p.name).join(", ");
const homeDesc = short(`Huiles parfumées de luxe, 15 ml : ${names}. Heritage. Elegance. Essence.`);
writeFileSync(`${OUT}/index.html`, withSeo(prepare(template),
  common("Bonbon Essence · Huiles parfumées de luxe", homeDesc, `${SITE}/`, `${SITE}/assets/og/bonbon-essence.jpg`, 1200, 630, "website")));

// Una pagina per profumo
for (const p of products) {
  const url = `${SITE}/parfums/${p.id}/`;
  const desc = short(fr(p.desc) || fr(p.tag));
  const price = Number(settings.prices.unit).toFixed(2);
  const jsonld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: plain(fr(p.desc)),
    image: abs(p.image),
    brand: { "@type": "Brand", name: "Bonbon Essence" },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "EUR",
      price,
      availability: p.soldout ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
    },
  };
  const block = [
    common(`${p.name} · Huile parfumée · Bonbon Essence`, desc, url, ogImage(p.image), 1200, 630, "product"),
    `<meta property="product:price:amount" content="${price}">`,
    `<meta property="product:price:currency" content="EUR">`,
    `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, "\\u003c")}</script>`,
    // la foto del profumo è la prima cosa che si vede: si scarica subito
    `<link rel="preload" as="image" href="${esc(media(p.image, 1000))}" fetchpriority="high">`,
  ].join("\n");
  // Sulla pagina del profumo la home parte nascosta: niente "lampo" prima che compaia il profumo.
  // e lo spazio del profumo è già riservato, così il piè di pagina non "salta" mentre si carica.
  const html = withSeo(prepare(template), block)
    .replace('<div id="viewHome">', '<div id="viewHome" hidden>')
    .replace('<div id="viewProduct" hidden></div>', '<div id="viewProduct" style="min-height:100vh"></div>');
  mkdirSync(`${OUT}/parfums/${p.id}`, { recursive: true });
  writeFileSync(`${OUT}/parfums/${p.id}/index.html`, html);
}

// Mappa del sito per Google
const pages = ["/", ...products.map(p => `/parfums/${p.id}/`), "/livraison-retours.html", "/cgv.html", "/mentions-legales.html", "/confidentialite.html"];
writeFileSync(`${OUT}/sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(u => `  <url><loc>${SITE}${u}</loc></url>`).join("\n")}\n</urlset>\n`);
writeFileSync(`${OUT}/robots.txt`, `User-agent: *\nDisallow: /admin/\n\nSitemap: ${SITE}/sitemap.xml\n`);

// Lancio: con LAUNCHED=true (in netlify.toml) il sito diventa visibile su Google e sparisce l'avviso demo.
const LAUNCHED = process.env.LAUNCHED === "true";
if (LAUNCHED) {
  const files = ["index.html", "mentions-legales.html", "cgv.html", "confidentialite.html", "livraison-retours.html", ...products.map(p => `parfums/${p.id}/index.html`)];
  for (const f of files) {
    const html = readFileSync(`${OUT}/${f}`, "utf8")
      .replace(/<meta name="robots" content="noindex, nofollow">\n?/, "")
      .replace(/<aside class="demo-note[^>]*>[\s\S]*?<\/aside>\n?/, "");
    writeFileSync(`${OUT}/${f}`, html);
  }
}

console.log(`Build ok: ${products.length} pagine profumo, sito ${SITE}, ${LAUNCHED ? "ONLINE (visibile su Google)" : "anteprima (non indicizzata)"}`);
