// Pagine legali: lingua (stessa scelta del sito) e valori presi da content/settings.json
(function () {
  var lang = "fr";
  try { var s = localStorage.getItem("be-lang"); if (s === "en" || s === "fr") lang = s; } catch (e) {}

  function setLang(l) {
    lang = l;
    document.documentElement.lang = l;
    document.querySelectorAll("article[lang]").forEach(function (a) { a.hidden = a.lang !== l; });
    document.querySelectorAll("[data-lang]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === l)); });
    var t = document.querySelector('article[lang="' + l + '"] h1');
    if (t) document.title = t.textContent + " · Bonbon Essence";
    try { localStorage.setItem("be-lang", l); } catch (e) {}
    fill();
  }
  document.querySelectorAll("[data-lang]").forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.dataset.lang); });
  });

  var cfg = null;
  function euro(n) {
    return new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-IE", { style: "currency", currency: "EUR", minimumFractionDigits: n % 1 ? 2 : 0 }).format(n);
  }
  function phone(d) {
    if (/^33\d{9}$/.test(d)) return "+33 " + d.slice(2, 3) + " " + d.slice(3).replace(/(\d{2})(?=\d)/g, "$1 ");
    return "+" + d;
  }
  function fill() {
    if (!cfg) return;
    var P = cfg.prices, S = cfg.shipping, C = cfg.contact;
    var v = {
      "ship-fr": euro(S.fr), "ship-eu": euro(S.eu), "delay": (S.delay && (S.delay[lang] || S.delay.fr)) || "",
      "unit": euro(P.unit), "lot2": euro(P.lot2), "lot3": euro(P.lot3), "lot4": euro(P.lot4), "extra": euro(P.extra),
      "whatsapp": phone(C.whatsapp)
    };
    document.querySelectorAll("[data-fill]").forEach(function (el) {
      var k = el.dataset.fill;
      if (k === "email") { el.textContent = C.email; if (el.tagName === "A") el.href = "mailto:" + C.email; }
      else if (k === "wa-link") { el.href = "https://wa.me/" + C.whatsapp; el.textContent = phone(C.whatsapp); }
      else if (k in v) el.textContent = v[k];
    });
  }
  fetch("/content/settings.json", { cache: "no-cache" })
    .then(function (r) { return r.json(); })
    .then(function (j) { cfg = j; fill(); })
    .catch(function () {});

  var y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();
  setLang(lang);
})();
