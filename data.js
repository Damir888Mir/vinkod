/* =========================================================
   ДАННЫЕ МАГАЗИНА VINКОД
   Сейчас товары заданы здесь вручную.
   На этапе интеграции с «МойСклад» этот список будет
   загружаться автоматически из API (/api/products).
   price: число в тенге, или null — «Цена по запросу»
   stock: "in" — в наличии, "order" — под заказ
   img:   путь к фото в папке images/ (можно оставить пустым)
   oem:   артикул производителя (необязательно, ищется в поиске)
   desc:  подробное описание для окна товара (необязательно)
   ========================================================= */

window.VK_CONTACT = {
  whatsapp: "77005278490",
  whatsapp2: "77089031461"
};

window.VK_BRANDS = {
  "Li Auto (Lixiang)": ["L6", "L7", "L8", "L9", "One"],
  "Zeekr": ["001", "007", "009", "X", "8X", "9X"],
  "BYD": ["Song Plus", "Han", "Tang", "Seal", "Qin Plus", "Yuan Up"],
  "Voyah": ["Free", "Dreamer", "Passion", "Courage"],
  "Leopard": ["Leopard 3", "Leopard 5", "Leopard 8"],
  "Changan Deepal": ["S07", "S09", "SL03", "G318"],
  "Honda": ["e:NS1", "e:NP1", "M-NV"],
  "Tesla": ["Model Y", "Model S", "Model X"],
  "Aito": ["M5", "M7", "M9"],
  "Volkswagen": ["ID.4", "ID.6", "ID.3"]
};

/* Пункт «Другая» добавляется автоматически в конец списка марок
   и в конец списка моделей каждой марки (см. script.js). */
window.VK_OTHER = "Другая";

window.VK_CATEGORIES = [
  { id: "to",     name: "Техобслуживание", icon: "🛠", img: "images/cat-to.jpg" },
  { id: "acc",    name: "Аксессуары",       icon: "✨", img: "images/cat-acc.jpg" },
  { id: "body",   name: "Кузовные детали",  icon: "🚘", img: "images/cat-body.jpg" },
  { id: "light",  name: "Оптика и свет",    icon: "💡", img: "images/cat-light.jpg" },
  { id: "susp",   name: "Подвеска",         icon: "⚙️", img: "images/cat-susp.jpg" },
  { id: "brake",  name: "Тормоза",          icon: "🛑", img: "images/cat-brake.jpg" },
  { id: "elec",   name: "Электрика",        icon: "⚡", img: "images/cat-elec.jpg" },
  { id: "charge", name: "Зарядка",          icon: "🔌", img: "images/cat-charge.jpg" },
  { id: "salon",  name: "Салон",            icon: "💺", img: "images/cat-salon.jpg" }
];

window.VK_PRODUCTS = [
  { id: "p1",  name: "Защитное стекло для экранов Lixiang — комплект на 3 монитора", brand: "Li Auto (Lixiang)", models: ["L6","L7","L8","L9"], cat: "acc",   price: 11000, stock: "in",    img: "images/p-glass.jpg", note: "Глянцевое / матовое / антибликовое" },
  { id: "p2",  name: "Оригинальные свечи зажигания Lixiang (комплект)",               brand: "Li Auto (Lixiang)", models: ["L7","L8","L9","One"], cat: "to", price: null,  stock: "in",    img: "images/p-plugs.jpg" },
  { id: "p3",  name: "Салонный фильтр Lixiang",                                       brand: "Li Auto (Lixiang)", models: ["L7","L8","L9"], cat: "to",       price: null,  stock: "in",    img: "" },
  { id: "p4",  name: "Масляный фильтр Lixiang (range extender)",                      brand: "Li Auto (Lixiang)", models: ["L7","L8","L9","One"], cat: "to", price: null,  stock: "in",    img: "" },
  { id: "p5",  name: "Комплект ковриков салона Zeekr 001",                            brand: "Zeekr",             models: ["001"],          cat: "salon",    price: null,  stock: "in",    img: "" },
  { id: "p6",  name: "Тормозные колодки передние Zeekr 001",                          brand: "Zeekr",             models: ["001","007"],    cat: "brake",    price: null,  stock: "order", img: "" },
  { id: "p7",  name: "Фара передняя LED BYD Song Plus",                               brand: "BYD",               models: ["Song Plus"],    cat: "light",    price: null,  stock: "order", img: "" },
  { id: "p8",  name: "Бампер передний BYD Han",                                       brand: "BYD",               models: ["Han"],          cat: "body",     price: null,  stock: "order", img: "" },
  { id: "p9",  name: "Амортизатор передний Voyah Free",                               brand: "Voyah",             models: ["Free"],         cat: "susp",     price: null,  stock: "order", img: "" },
  { id: "p10", name: "Зарядное устройство Type 2 / GB/T переходник",                  brand: "Универсальное",     models: [],               cat: "charge",   price: null,  stock: "in",    img: "" },
  { id: "p11", name: "Защитная плёнка для экрана Zeekr 001",                          brand: "Zeekr",             models: ["001"],          cat: "acc",      price: null,  stock: "in",    img: "" },
  { id: "p12", name: "Датчик парковки Changan Deepal S07", brand: "Changan Deepal", models: ["S07"],           cat: "elec",     price: null,  stock: "order", img: "" }
];
