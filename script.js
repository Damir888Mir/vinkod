(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const fmt = (n) => n.toLocaleString("ru-RU").replace(/,/g, " ") + " ₸";
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const BRANDS = window.VK_BRANDS || {};
  const OTHER = window.VK_OTHER || "Другая";
  const CATS = window.VK_CATEGORIES || [];
  const WA = (window.VK_CONTACT && window.VK_CONTACT.whatsapp) || "77005278490";
  let PRODUCTS = window.VK_PRODUCTS || [];

  const state = { cat: "all", brand: "all", query: "", model: "" };

  const store = {
    get() { try { return JSON.parse(localStorage.getItem("vk_cart") || "[]"); } catch (e) { return []; } },
    set(v) { try { localStorage.setItem("vk_cart", JSON.stringify(v)); } catch (e) {} }
  };
  let cart = store.get();

  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("is-show"), 2200);
  }

  function waLink(text, phone = WA) {
    return "https://wa.me/" + phone + "?text=" + encodeURIComponent(text);
  }

  /* ---------- Категории ---------- */
  function renderCategories() {
    $("#catTrack").innerHTML = CATS.map((c) => `
      <button class="cat" data-cat="${c.id}">
        <div class="cat__img"><span>${c.icon}</span>${c.img ? `<img src="${c.img}" alt="" loading="lazy" onerror="this.remove()">` : ""}</div>
        <b>${esc(c.name)}</b>
      </button>`).join("");
    $$(".cat").forEach((el) => el.addEventListener("click", () => {
      setCat(state.cat === el.dataset.cat ? "all" : el.dataset.cat);
      $("#catalog").scrollIntoView({ behavior: "smooth" });
    }));
  }
  function setCat(id) {
    state.cat = id;
    $$(".cat").forEach((el) => el.classList.toggle("is-active", el.dataset.cat === id));
    renderProducts();
  }

  /* ---------- Марки ---------- */
  function renderBrandChips() {
    const used = ["all", ...new Set(PRODUCTS.map((p) => p.brand))];
    $("#brandChips").innerHTML = used.map((b) =>
      `<button class="chip${b === state.brand ? " is-active" : ""}" data-brand="${esc(b)}">${b === "all" ? "Все марки" : esc(b.replace(/\s*\(.*\)/, ""))}</button>`
    ).join("");
    $$(".chip").forEach((el) => el.addEventListener("click", () => {
      state.brand = el.dataset.brand;
      state.model = "";
      renderBrandChips();
      renderProducts();
    }));
  }

  function renderBrandGrid() {
    $("#brandGrid").innerHTML = Object.keys(BRANDS).map((b) => {
      const short = b.replace(/\s*\(.*\)/, "");
      const sub = (b.match(/\((.*)\)/) || [])[1] || BRANDS[b].slice(0, 3).join(" · ");
      return `<button class="brand" data-brand="${esc(b)}">${esc(short)}<small>${esc(sub)}</small></button>`;
    }).join("") +
      `<button class="brand brand--other" data-brand="${OTHER}">${OTHER}<small>Нет вашей марки? Напишите её</small></button>`;
    $$(".brand").forEach((el) => el.addEventListener("click", () => {
      $("#pBrand").value = el.dataset.brand;
      $("#pBrand").dispatchEvent(new Event("change"));
      document.querySelector(".hero").scrollIntoView({ behavior: "smooth" });
    }));
  }

  /* ---------- Каталог ---------- */
  function filtered() {
    const q = state.query.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      if (state.cat !== "all" && p.cat !== state.cat) return false;
      if (state.brand !== "all" && p.brand !== state.brand) return false;
      if (state.model && p.models.length && !p.models.includes(state.model)) return false;
      if (q) {
        const hay = (p.name + " " + p.brand + " " + p.models.join(" ") + " " + (p.note || "")).toLowerCase();
        if (!q.split(/\s+/).every((w) => hay.includes(w))) return false;
      }
      return true;
    });
  }

  function renderProducts() {
    const list = filtered();
    const catName = (CATS.find((c) => c.id === state.cat) || {}).name;
    const parts = [];
    if (catName) parts.push(catName);
    if (state.brand !== "all") parts.push(state.brand + (state.model ? " " + state.model : ""));
    if (state.query) parts.push("«" + state.query + "»");
    $("#catalogInfo").textContent = (parts.length ? parts.join(" · ") + " — " : "") + "найдено: " + list.length;

    $("#products").innerHTML = list.map((p) => {
      const icon = (CATS.find((c) => c.id === p.cat) || {}).icon || "📦";
      return `
      <article class="product reveal">
        <div class="product__img">
          <span class="stock stock--${p.stock}">${p.stock === "in" ? "В наличии" : "Под заказ"}</span>
          <div class="product__ph"><i>${icon}</i>Место для фото</div>
          ${p.img ? `<img src="${p.img}" alt="${esc(p.name)}" loading="lazy" onerror="this.remove()">` : ""}
        </div>
        <div class="product__body">
          <span class="product__brand">${esc(p.brand.replace(/\s*\(.*\)/, ""))}${p.models.length ? " · " + esc(p.models.join(", ")) : ""}</span>
          <h3 class="product__name">${esc(p.name)}</h3>
          ${p.note ? `<p class="product__note">${esc(p.note)}</p>` : ""}
          <div class="product__foot">
            ${p.price ? `<span class="price">${fmt(p.price)}</span>` : `<span class="price price--req">Цена по запросу</span>`}
            <button class="add" data-add="${p.id}" aria-label="В корзину">+</button>
          </div>
        </div>
      </article>`;
    }).join("");

    const empty = list.length === 0;
    $("#emptyState").hidden = !empty;
    if (empty) {
      $("#emptyAsk").href = waLink("Здравствуйте! Ищу запчасть: " + (state.query || catName || "") + (state.brand !== "all" ? " для " + state.brand + " " + state.model : ""));
    }
    $$("[data-add]").forEach((b) => b.addEventListener("click", () => addToCart(b.dataset.add)));
    observeReveal();
  }

  /* ---------- Подбор ---------- */
  function initPicker() {
    const brandSel = $("#pBrand"), modelSel = $("#pModel");
    const modelWrap = modelSel.closest("label");
    const brandOtherWrap = $("#pBrandOtherWrap"), brandOther = $("#pBrandOther");
    const modelOtherWrap = $("#pModelOtherWrap"), modelOther = $("#pModelOther");

    function toggle(wrap, input, on) {
      wrap.hidden = !on;
      input.required = on;
      if (!on) { input.value = ""; wrap.classList.remove("is-error"); }
    }
    function syncModelOther() {
      const brandIsOther = brandSel.value === OTHER;
      toggle(modelOtherWrap, modelOther, brandIsOther || modelSel.value === OTHER);
      modelOther.placeholder = brandIsOther ? "Напишите модель автомобиля" : "Напишите вашу модель";
    }

    brandSel.innerHTML += Object.keys(BRANDS).map((b) => `<option>${esc(b)}</option>`).join("") +
      `<option value="${OTHER}">${OTHER} (нет в списке)</option>`;

    brandSel.addEventListener("change", () => {
      const brandIsOther = brandSel.value === OTHER;
      const models = BRANDS[brandSel.value] || [];
      modelSel.innerHTML = `<option value="">Модель</option>` +
        models.map((m) => `<option>${esc(m)}</option>`).join("") +
        (models.length ? `<option value="${OTHER}">${OTHER} (нет в списке)</option>` : "");
      modelSel.disabled = !models.length;
      modelSel.required = !brandIsOther;
      modelWrap.hidden = brandIsOther;
      toggle(brandOtherWrap, brandOther, brandIsOther);
      syncModelOther();
      if (brandIsOther) brandOther.focus();
    });
    modelSel.addEventListener("change", () => {
      syncModelOther();
      if (modelSel.value === OTHER) modelOther.focus();
    });
    [brandOther, modelOther].forEach((inp) => {
      inp.addEventListener("invalid", () => inp.closest("label").classList.add("is-error"));
      inp.addEventListener("input", () => inp.closest("label").classList.remove("is-error"));
    });

    $("#pShow").addEventListener("click", () => {
      const b = brandSel.value;
      state.brand = PRODUCTS.some((p) => p.brand === b) ? b : "all";
      state.model = state.brand === "all" || modelSel.value === OTHER ? "" : modelSel.value;
      state.query = $("#pPart").value.trim();
      $("#searchInput").value = state.query;
      renderBrandChips();
      renderProducts();
      $("#catalog").scrollIntoView({ behavior: "smooth" });
    });
    $("#picker").addEventListener("submit", (e) => {
      e.preventDefault();
      const vin = $("#pVin").value.trim().toUpperCase();
      const brand = brandSel.value === OTHER ? brandOther.value.trim() : brandSel.value;
      const model = (brandSel.value === OTHER || modelSel.value === OTHER) ? modelOther.value.trim() : modelSel.value;
      if (!brand || !model) {
        const bad = !brand ? brandOther : modelOther;
        bad.closest("label").classList.add("is-error");
        bad.focus();
        return;
      }
      const msg = [
        "Здравствуйте! Хочу подобрать запчасть.",
        "Авто: " + brand + " " + model,
        vin ? "VIN: " + vin : "",
        $("#pPart").value.trim() ? "Нужно: " + $("#pPart").value.trim() : ""
      ].filter(Boolean).join("\n");
      window.open(waLink(msg), "_blank");
    });
  }

  /* ---------- Поиск ---------- */
  function initSearch() {
    const input = $("#searchInput");
    let t;
    input.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(() => { state.query = input.value; renderProducts(); }, 200);
    });
    $("#searchForm").addEventListener("submit", (e) => {
      e.preventDefault();
      state.query = input.value;
      renderProducts();
      $("#catalog").scrollIntoView({ behavior: "smooth" });
    });
  }

  /* ---------- Корзина ---------- */
  function addToCart(id) {
    const item = cart.find((i) => i.id === id);
    if (item) item.qty++; else cart.push({ id, qty: 1 });
    saveCart();
    const c = $("#cartCount");
    c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump");
    toast("Товар добавлен в корзину");
  }
  function saveCart() { store.set(cart); renderCart(); }

  function renderCart() {
    const lines = cart.map((i) => ({ ...i, p: PRODUCTS.find((p) => p.id === i.id) })).filter((l) => l.p);
    $("#cartCount").textContent = lines.reduce((s, l) => s + l.qty, 0);
    const total = lines.reduce((s, l) => s + (l.p.price || 0) * l.qty, 0);
    const hasReq = lines.some((l) => !l.p.price);
    $("#cartTotal").textContent = lines.length ? fmt(total) + (hasReq ? " + по запросу" : "") : "0 ₸";
    $("#cartItems").innerHTML = lines.length ? lines.map((l) => `
      <div class="line">
        <div><div class="line__name">${esc(l.p.name)}</div>
          <div class="line__price">${l.p.price ? fmt(l.p.price) + " × " + l.qty : "Цена по запросу"}</div></div>
        <div class="qty"><button data-dec="${l.id}" aria-label="Меньше">−</button><span>${l.qty}</span><button data-inc="${l.id}" aria-label="Больше">+</button></div>
        <button class="line__rm" data-rm="${l.id}">Удалить</button>
      </div>`).join("") : `<div class="drawer__empty">Корзина пуста<br><br><a class="btn btn--ghost" href="#catalog" data-close>Перейти в каталог</a></div>`;
    $("#orderForm").style.display = lines.length ? "" : "none";
    $$("[data-inc]").forEach((b) => b.onclick = () => { cart.find((i) => i.id === b.dataset.inc).qty++; saveCart(); });
    $$("[data-dec]").forEach((b) => b.onclick = () => { const it = cart.find((i) => i.id === b.dataset.dec); it.qty--; if (it.qty < 1) cart = cart.filter((i) => i !== it); saveCart(); });
    $$("[data-rm]").forEach((b) => b.onclick = () => { cart = cart.filter((i) => i.id !== b.dataset.rm); saveCart(); });
    $$("[data-close]").forEach((b) => b.onclick = closeCart);
  }

  function openCart() { $("#cart").classList.add("is-open"); $("#cart").setAttribute("aria-hidden", "false"); $("#overlay").hidden = false; }
  function closeCart() { $("#cart").classList.remove("is-open"); $("#cart").setAttribute("aria-hidden", "true"); $("#overlay").hidden = true; }

  function initCart() {
    $("#cartOpen").addEventListener("click", openCart);
    $("#cartClose").addEventListener("click", closeCart);
    $("#overlay").addEventListener("click", closeCart);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });
    $("#orderForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const lines = cart.map((i) => ({ ...i, p: PRODUCTS.find((p) => p.id === i.id) })).filter((l) => l.p);
      const total = lines.reduce((s, l) => s + (l.p.price || 0) * l.qty, 0);
      const msg = [
        "Здравствуйте! Хочу оформить заказ на сайте Vinкод:",
        "",
        ...lines.map((l, n) => `${n + 1}. ${l.p.name} — ${l.qty} шт.${l.p.price ? " (" + fmt(l.p.price * l.qty) + ")" : " (цена по запросу)"}`),
        "",
        total ? "Сумма: " + fmt(total) : "",
        "Имя: " + $("#oName").value.trim(),
        "Телефон: " + $("#oPhone").value.trim(),
        $("#oCar").value.trim() ? "Авто / VIN: " + $("#oCar").value.trim() : "",
        "Получение: " + $("#oDelivery").value
      ].filter((s) => s !== null).join("\n");
      window.open(waLink(msg), "_blank");
      cart = []; saveCart(); closeCart();
      toast("Заказ отправлен менеджеру в WhatsApp");
    });
  }

  /* ---------- Прочее ---------- */
  function initMisc() {
    $("#year").textContent = new Date().getFullYear();
    $("#burger").addEventListener("click", () => $("#nav").classList.toggle("is-open"));
    $$("#nav a").forEach((a) => a.addEventListener("click", () => $("#nav").classList.remove("is-open")));
    $$("[data-scroll]").forEach((b) => b.addEventListener("click", () => {
      const track = $(b.dataset.scroll);
      track.scrollBy({ left: track.clientWidth * 0.8 * Number(b.dataset.dir), behavior: "smooth" });
    }));
    $$("[data-cat-link]").forEach((a) => a.addEventListener("click", () => setCat(a.dataset.catLink)));
    $$('[data-filter="all"]').forEach((a) => a.addEventListener("click", () => {
      state.cat = "all"; state.brand = "all"; state.model = ""; state.query = ""; $("#searchInput").value = "";
      renderBrandChips(); setCat("all");
    }));
    $$(".section .h2, .service, .review, .brand, .offer, .about__photos, .contacts__map").forEach((el) => el.classList.add("reveal"));
    observeReveal();
  }

  let io;
  function observeReveal() {
    if (!("IntersectionObserver" in window)) { $$(".reveal").forEach((el) => el.classList.add("is-in")); return; }
    io = io || new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
    }), { rootMargin: "0px 0px -40px 0px" });
    $$(".reveal:not(.is-in)").forEach((el) => io.observe(el));
  }

  /* ---------- Эффекты ---------- */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function initEffects() {
    // Бегущая строка марок (список дублируется для бесшовной прокрутки)
    const mq = $("#marquee");
    if (mq) {
      const names = Object.keys(window.VK_BRANDS || {}).map((b) => `<span>${b}</span>`).join("");
      mq.innerHTML = names + names;
    }

    // Полоса прокрутки и тень шапки
    const bar = $("#progress"), header = $(".header");
    let ticking = false;
    const onScroll = () => {
      const h = document.documentElement;
      const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
      if (bar) bar.style.transform = `scaleX(${p})`;
      if (header) header.classList.toggle("is-scrolled", h.scrollTop > 10);
      ticking = false;
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();

    // Каскадное появление карточек одной сетки
    $$(".reveal").forEach((el) => {
      const sibs = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
      const i = sibs.indexOf(el);
      if (i > 0) el.style.transitionDelay = `${Math.min(i, 8) * 70}ms`;
    });

    // Счётчики в hero
    if (!reduceMotion) $$("[data-count]").forEach((el) => {
      const to = parseFloat(el.dataset.count), dec = Number(el.dataset.dec || 0), t0 = performance.now() + 500, dur = 1600;
      el.textContent = (0).toFixed(dec);
      const step = (t) => {
        const k = Math.min(1, Math.max(0, (t - t0) / dur)), e = 1 - Math.pow(1 - k, 3);
        el.textContent = (to * e).toFixed(dec);
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });

    if (reduceMotion || !finePointer) return;

    // Прожектор за курсором в hero
    const hero = $(".hero");
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", `${e.clientX - r.left}px`);
      hero.style.setProperty("--my", `${e.clientY - r.top}px`);
    });

    // 3D-наклон карточек за курсором
    const SEL = ".product, .cat, .service, .brand, .offer, .review";
    let cur = null;
    const release = () => { if (cur) { cur.style.transform = ""; cur.classList.remove("is-tilting"); cur = null; } };
    document.addEventListener("pointermove", (e) => {
      const card = e.target.closest && e.target.closest(SEL);
      if (cur && cur !== card) release();
      if (!card) return;
      card.classList.add("tilt");
      cur = card;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      const max = card.matches(".brand, .cat") ? 10 : 6;
      card.style.transition = "transform .12s ease-out, box-shadow .25s, border-color .25s, opacity .6s";
      card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * max}deg) rotateY(${(x - 0.5) * max}deg) translateY(-4px)`;
      card.style.setProperty("--gx", `${x * 100}%`);
      card.style.setProperty("--gy", `${y * 100}%`);
      card.classList.add("is-tilting");
    });
    document.documentElement.addEventListener("pointerleave", release);
  }

  /* Загрузка товаров из МойСклад (когда будет подключён API /api/products) */
  async function loadRemoteProducts() {
    try {
      const r = await fetch("/api/products", { headers: { Accept: "application/json" } });
      if (!r.ok) return;
      const data = await r.json();
      if (Array.isArray(data) && data.length) {
        PRODUCTS = data;
        renderBrandChips(); renderProducts(); renderCart();
      }
    } catch (e) { /* используем локальные данные */ }
  }

  renderCategories();
  renderBrandChips();
  renderBrandGrid();
  renderProducts();
  initPicker();
  initSearch();
  initCart();
  renderCart();
  initMisc();
  initEffects();
  loadRemoteProducts();
})();
