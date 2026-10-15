// Genera las landings de "Categorías destacadas" (/escritorios/, /estanterias/),
// la sección de la home que las enlaza y el sitemap.xml.
// Lee los productos directamente del array `products` de index.html, así que
// después de actualizar el catálogo alcanza con correr:  node scripts/build-landings.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://paraisohogar.uy';
const TODAY = new Date().toISOString().slice(0, 10);
const WA = 'https://wa.me/59899451258';

const LANDINGS = [
    {
        slug: 'escritorios',
        prefix: 'escritorio',
        name: 'Escritorios',
        singular: 'escritorio',
        title: 'Escritorios en Uruguay | Gamer, de Oficina y Modernos | Paraíso Hogar',
        description: 'Comprá escritorios en Uruguay: modelos gamer, de oficina, con cajones, estantes y plegables. Envíos a todo el país, hasta 12 cuotas y compra protegida.',
        h1: 'Escritorios',
        tagline: 'Para tu oficina, home office o setup gamer',
        intro: 'Encontrá el escritorio ideal para trabajar o estudiar en casa. Tenemos escritorios de madera y metal, modelos gamer con luces RGB, escritorios con cajones, estantes y gabinete, compactos con ruedas y plegables para espacios chicos. Todos con envío a todo Uruguay y compra protegida por Mercado Libre.',
        tips: [
            ['fa-ruler-combined', 'Medí tu espacio', 'Para una notebook alcanza con 80–100 cm de ancho; para dos monitores conviene 120 cm o más.'],
            ['fa-layer-group', 'Pensá en el guardado', 'Los modelos con cajones, estantes o gabinete te ayudan a mantener el orden.'],
            ['fa-gamepad', 'Setup gamer', 'Elegí modelos con elevación para monitor, superficie de fibra de carbono y luces RGB.']
        ]
    },
    {
        slug: 'estanterias',
        prefix: 'estanteria',
        name: 'Estanterías',
        singular: 'estantería',
        title: 'Estanterías y Bibliotecas en Uruguay | Madera y Metal | Paraíso Hogar',
        description: 'Comprá estanterías y bibliotecas en Uruguay: de madera, metal y bambú, con puertas, para living, oficina, baño o lavadero. Envíos a todo el país y hasta 12 cuotas.',
        h1: 'Estanterías',
        tagline: 'Orden y estilo para cada ambiente',
        intro: 'Sumá espacio de guardado con nuestras estanterías y bibliotecas. Hay modelos de madera, metal y bambú, con 3 a 7 estantes, con puertas, reforzadas para carga pesada y organizadores para el baño o el lavadero. Envíos a todo Uruguay y compra protegida por Mercado Libre.',
        tips: [
            ['fa-arrows-up-down', 'Altura y niveles', 'Las de 180 cm o más aprovechan la pared; las bajas sirven como mueble auxiliar.'],
            ['fa-weight-hanging', 'Material', 'Metal y madera combinan resistencia y estilo; el bambú suma calidez natural.'],
            ['fa-door-closed', 'Con o sin puertas', 'Las puertas ocultan lo que no querés a la vista y protegen del polvo.']
        ]
    }
];

// --- utilidades ---
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const parsePrice = s => parseInt(String(s).replace(/\D/g, ''), 10) || 0;
const hasMl = p => p.ml_url && p.ml_url !== 'nan';

function loadProducts() {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const line = html.split(/\r?\n/).find(l => l.trim().startsWith('const products = '));
    if (!line) throw new Error('No se encontró `const products = [...]` en index.html');
    return JSON.parse(line.trim().replace(/^const products = /, '').replace(/;$/, ''));
}

// Solo productos cuyo nombre arranca con la palabra (ej: "Escritorio ...", no "Silla ... Escritorio")
const productsFor = (products, landing) => products.filter(p => norm(p.title).startsWith(landing.prefix));

// --- tarjeta de producto (misma estética que la grilla de index.html) ---
function productCard(p, i) {
    const img = `<img src="${esc(p.image)}" alt="${esc(p.title)}" width="300" height="300" ${i < 4 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"
                                class="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300">`;
    return `
                <li class="bg-white rounded-xl shadow-sm hover:shadow-xl border border-stone-200/80 overflow-hidden flex flex-col justify-between transition-all duration-200 group" data-price="${parsePrice(p.price_final)}" data-pos="${i}">
                    <article class="p-2.5 sm:p-4 relative">
                        <div class="w-full h-28 sm:h-48 bg-white flex items-center justify-center overflow-hidden mb-2 sm:mb-3 relative">
                            ${p.discount_pct ? `<span class="absolute top-0 right-0 bg-brandOrange text-white text-[10px] sm:text-xs font-black px-1.5 sm:px-2 py-0.5 rounded-bl-lg rounded-tr-sm z-10">-${p.discount_pct}%</span>` : ''}
                            ${img}
                        </div>
                        <h3 class="font-bold text-stone-800 text-xs sm:text-sm line-clamp-2 leading-snug mb-2 group-hover:text-brandNavy transition-colors" title="${esc(p.title)}">${esc(p.title)}</h3>
                        <div class="mt-2 pt-2 border-t border-stone-100">
                            <div class="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                                ${p.price_old && p.price_old !== '-' ? `<span class="text-[10px] sm:text-xs text-stone-400 line-through">${esc(p.price_old)}</span>` : ''}
                                <span class="text-base sm:text-lg font-black text-brandOrange">${esc(p.price_final)}</span>
                            </div>
                            ${p.installments ? `<p class="text-[10px] sm:text-[11px] text-stone-500 mt-0.5">${esc(p.installments)}</p>` : ''}
                        </div>
                    </article>
                    <div class="p-2.5 sm:p-4 pt-0 space-y-1.5 sm:space-y-2">
                        <a href="${esc(p.wa_url)}" target="_blank" rel="noopener noreferrer nofollow" title="Consultar por WhatsApp"
                            class="w-full flex items-center justify-center gap-1.5 sm:gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] sm:text-xs font-bold py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg shadow-sm transition-colors duration-150">
                            <i class="fa-brands fa-whatsapp text-sm sm:text-base"></i><span>Consultar</span>
                        </a>
                        ${hasMl(p) ? `<a href="${esc(p.ml_url)}" target="_blank" rel="noopener noreferrer" title="Ver ${esc(p.title)} en Mercado Libre"
                            class="w-full flex items-center justify-center gap-1 sm:gap-1.5 bg-brandYellow hover:bg-brandYellowHover text-brandBlue text-[11px] sm:text-xs font-bold py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg transition-colors duration-150">
                            <i class="fa-solid fa-cart-shopping text-[10px] sm:text-xs"></i><span>Ver más</span>
                        </a>` : ''}
                    </div>
                </li>`;
}

// --- datos estructurados (schema.org) ---
function jsonLd(landing, items) {
    const url = `${SITE}/${landing.slug}/`;
    const data = [
        {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE}/` },
                { '@type': 'ListItem', position: 2, name: landing.name, item: url }
            ]
        },
        {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: landing.title,
            description: landing.description,
            url,
            inLanguage: 'es-UY',
            isPartOf: { '@type': 'WebSite', name: 'Paraíso Hogar', url: `${SITE}/` },
            mainEntity: {
                '@type': 'ItemList',
                numberOfItems: items.length,
                itemListElement: items.map((p, i) => ({
                    '@type': 'ListItem',
                    position: i + 1,
                    name: p.title,
                    image: p.image,
                    url: hasMl(p) ? p.ml_url : url
                }))
            }
        }
    ];
    return JSON.stringify(data, null, 2).replace(/</g, '\\u003c');
}

// --- página de landing ---
function landingPage(landing, items, other) {
    const url = `${SITE}/${landing.slug}/`;
    const minPrice = Math.min(...items.map(p => parsePrice(p.price_final)).filter(Boolean));
    const ogImage = items[0] ? items[0].image : `${SITE}/og-image.png?v=2`;
    const waText = encodeURIComponent(`Hola! Vengo desde la web de paraisohogar.uy y quiero más información sobre ${landing.name.toLowerCase()}`);

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <!-- Página generada por scripts/build-landings.js: no editar a mano, volver a correr el script -->
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-KQN5MBPM');</script>
    <!-- End Google Tag Manager -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <title>${esc(landing.title)}</title>
    <meta name="description" content="${esc(landing.description)}">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <link rel="canonical" href="${url}">

    <!-- Open Graph / WhatsApp -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${esc(landing.name)} | Paraíso Hogar Uruguay">
    <meta property="og:description" content="${esc(landing.description)}">
    <meta property="og:site_name" content="Paraíso Hogar">
    <meta property="og:locale" content="es_UY">
    <meta property="og:image" content="${esc(ogImage)}">
    <meta property="og:image:alt" content="${esc(landing.name)} en Paraíso Hogar">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(landing.name)} | Paraíso Hogar Uruguay">
    <meta name="twitter:description" content="${esc(landing.description)}">
    <meta name="twitter:image" content="${esc(ogImage)}">

    <!-- Datos estructurados -->
    <script type="application/ld+json">
${jsonLd(landing, items)}
    </script>

    <!-- Google Fonts: Montserrat (logo) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&display=swap" rel="stylesheet">

    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        /* Misma paleta que index.html */
                        brandNavy: '#0E2A47',
                        brandNavyDark: '#081B30',
                        brandOrange: '#F49C38',
                        brandOrangeHover: '#DB8620',
                        brandSand: '#A8C4E0',
                        mlYellow: '#FFE600',
                        brandCream: '#F5F8FB',
                        brandBlue: '#003399',
                        brandYellow: '#FFCC00',
                        brandYellowHover: '#E6B800'
                    },
                    fontFamily: {
                        logo: ['Montserrat', 'sans-serif']
                    }
                }
            }
        }
    </script>
    <!-- FontAwesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-brandCream font-sans text-stone-800 antialiased min-h-screen flex flex-col overflow-x-hidden">
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KQN5MBPM"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->

    <!-- Header -->
    <header class="bg-mlYellow text-brandNavy shadow-md">
        <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <a href="/" class="flex items-center gap-3">
                <img src="/logo.webp" alt="Paraíso Hogar - Artículos para tu casa" width="64" height="64" class="h-14 w-14 sm:h-16 sm:w-16 rounded-full shrink-0">
                <span class="hidden sm:inline font-logo uppercase text-2xl font-extrabold tracking-tight text-brandNavy leading-none">Paraiso<span class="font-semibold">hogar</span></span>
            </a>
            <a href="/" class="inline-flex items-center gap-2 text-brandNavy hover:underline text-sm font-semibold transition-colors">
                <i class="fa-solid fa-arrow-left text-xs"></i> Volver a la tienda
            </a>
        </div>
    </header>

    <main class="flex-1 w-full">
        <!-- Breadcrumb -->
        <nav class="max-w-7xl mx-auto px-4 pt-4 text-xs text-stone-500" aria-label="Ruta de navegación">
            <ol class="flex items-center gap-1.5">
                <li><a href="/" class="hover:text-brandNavy hover:underline">Inicio</a></li>
                <li aria-hidden="true"><i class="fa-solid fa-chevron-right text-[9px]"></i></li>
                <li aria-current="page" class="font-semibold text-stone-700">${esc(landing.name)}</li>
            </ol>
        </nav>

        <!-- Hero -->
        <section class="max-w-7xl mx-auto px-4 pt-4">
            <div class="bg-gradient-to-r from-brandNavyDark via-brandNavy to-brandNavyDark text-white rounded-2xl px-6 py-8 sm:px-10 sm:py-10">
                <p class="text-brandSand text-xs sm:text-sm font-semibold uppercase tracking-widest">${esc(landing.tagline)}</p>
                <h1 class="text-3xl sm:text-5xl font-black leading-tight mt-1">${esc(landing.h1)}</h1>
                <p class="text-brandSand text-sm sm:text-base mt-3 max-w-3xl leading-relaxed">${esc(landing.intro)}</p>
                <ul class="flex flex-wrap gap-x-5 gap-y-2 mt-5 text-xs sm:text-sm">
                    <li class="inline-flex items-center gap-1.5"><i class="fa-solid fa-truck-fast text-brandOrange"></i> Envíos a todo Uruguay</li>
                    <li class="inline-flex items-center gap-1.5"><i class="fa-solid fa-credit-card text-brandOrange"></i> Hasta 12 cuotas</li>
                    <li class="inline-flex items-center gap-1.5"><i class="fa-solid fa-shield-halved text-brandOrange"></i> Compra protegida</li>
                </ul>
            </div>
        </section>

        <!-- Productos -->
        <section class="max-w-7xl mx-auto px-4 py-8" aria-labelledby="listadoTitle">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-stone-200 gap-2">
                <div>
                    <h2 id="listadoTitle" class="text-2xl font-bold text-stone-800">${items.length} ${esc(landing.name.toLowerCase())} disponibles</h2>
                    <p class="text-xs text-stone-500">Desde ${esc('$' + minPrice.toLocaleString('es-UY'))} · precios en pesos uruguayos</p>
                </div>
                <label class="flex items-center gap-2 text-xs text-stone-500">
                    <span>Ordenar por</span>
                    <select id="sortSelect"
                        class="text-sm text-stone-700 bg-white border border-stone-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brandOrange/40 focus:border-brandOrange cursor-pointer">
                        <option value="relevance">Más relevantes</option>
                        <option value="price-asc">Menor precio</option>
                        <option value="price-desc">Mayor precio</option>
                    </select>
                </label>
            </div>

            <ul id="productsGrid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">${items.map(productCard).join('')}
            </ul>
        </section>

        <!-- Guía de compra -->
        <section class="bg-white border-y border-stone-200" aria-labelledby="guiaTitle">
            <div class="max-w-7xl mx-auto px-4 py-10">
                <h2 id="guiaTitle" class="text-xl sm:text-2xl font-bold text-stone-800">¿Cómo elegir tu ${esc(landing.singular)}?</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-6">${landing.tips.map(([icon, t, d]) => `
                    <div class="rounded-2xl bg-brandCream p-5">
                        <i class="fa-solid ${icon} text-2xl text-brandOrange"></i>
                        <h3 class="font-bold text-stone-800 mt-3">${esc(t)}</h3>
                        <p class="text-sm text-stone-500 mt-1 leading-relaxed">${esc(d)}</p>
                    </div>`).join('')}
                </div>
                <div class="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-stone-200 p-5">
                    <p class="text-sm text-stone-600">¿Tenés dudas sobre medidas, stock o envío? Te asesoramos sin compromiso.</p>
                    <a href="${WA}?text=${waText}" target="_blank" rel="noopener noreferrer nofollow"
                        class="self-start sm:self-auto inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold py-2.5 px-5 rounded-full transition-colors">
                        <i class="fa-brands fa-whatsapp text-base"></i> Consultar por WhatsApp
                    </a>
                </div>
            </div>
        </section>

        <!-- Otras categorías -->
        <section class="max-w-7xl mx-auto px-4 py-10" aria-labelledby="otrasTitle">
            <h2 id="otrasTitle" class="text-xl font-bold text-stone-800 mb-4">Seguí explorando</h2>
            <div class="flex flex-wrap gap-3">
                <a href="/${other.slug}/" class="inline-flex items-center gap-2 bg-brandNavy hover:bg-brandNavyDark text-white text-sm font-bold py-2.5 px-5 rounded-full transition-colors">
                    Ver ${esc(other.name.toLowerCase())} <i class="fa-solid fa-arrow-right text-xs"></i>
                </a>
                <a href="/#catalogo" class="inline-flex items-center gap-2 bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 text-sm font-bold py-2.5 px-5 rounded-full transition-colors">
                    Todo el catálogo
                </a>
                <a href="/como-comprar/" class="inline-flex items-center gap-2 bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 text-sm font-bold py-2.5 px-5 rounded-full transition-colors">
                    Cómo comprar
                </a>
            </div>
        </section>
    </main>

    <!-- Floating WhatsApp Button -->
    <a href="${WA}?text=${waText}" target="_blank" rel="noopener noreferrer nofollow"
        class="fixed bottom-6 right-6 bg-brandNavyDark hover:bg-brandNavy text-white w-14 h-14 rounded-full shadow-2xl z-50 flex items-center justify-center text-2xl transition-transform hover:scale-110 active:scale-95"
        title="Consultar por WhatsApp" aria-label="Consultar por WhatsApp">
        <i class="fa-brands fa-whatsapp"></i>
    </a>

    <!-- Footer -->
    <footer class="bg-brandNavyDark text-brandSand text-xs py-6 px-4 border-t-4 border-brandOrange text-center">
        © 2026 Paraíso Hogar Uruguay. Todos los derechos reservados.
    </footer>

    <script>
        // Ordenar la grilla sin recargar (los productos ya vienen en el HTML para que Google los indexe)
        document.getElementById('sortSelect').addEventListener('change', function () {
            const grid = document.getElementById('productsGrid');
            const key = this.value;
            [...grid.children].sort((a, b) => key === 'relevance'
                ? a.dataset.pos - b.dataset.pos
                : (a.dataset.price - b.dataset.price) * (key === 'price-asc' ? 1 : -1)
            ).forEach(el => grid.appendChild(el));
        });
    </script>
</body>
</html>
`;
}

// --- sección "Categorías destacadas" de la home ---
function homeSection(groups) {
    const cards = groups.map(({ landing, items }) => {
        // Imagen propia de la categoría (1200x900, 4:3) en la raíz del sitio; mientras no exista se usa la foto del primer producto
        const file = ['webp', 'png', 'jpg', 'jpeg']
            .map(ext => `categoria-${landing.slug}.${ext}`)
            .find(f => fs.existsSync(path.join(ROOT, f)));
        const hasBanner = Boolean(file);
        const img = hasBanner
            ? `<img src="${file}" alt="${esc(landing.name)} en Paraíso Hogar" width="1200" height="900" loading="lazy" decoding="async"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">`
            : `<img src="${esc(items[0].image)}" alt="${esc(landing.name)} en Paraíso Hogar" width="1200" height="900" loading="lazy" decoding="async"
                        class="w-full h-full object-contain p-3 sm:p-6 bg-white group-hover:scale-105 transition-transform duration-500">`;
        return `
            <a href="/${landing.slug}/" class="group block" title="Ver ${esc(landing.name.toLowerCase())}">
                <div class="aspect-[4/3] overflow-hidden rounded-2xl shadow-sm group-hover:shadow-xl border border-stone-200/80 bg-white transition-shadow">
                    ${img}
                </div>
                <h3 class="mt-2 sm:mt-3 text-base sm:text-xl font-black text-stone-800 group-hover:text-brandNavy transition-colors">${esc(landing.name)}</h3>
                <p class="text-[11px] sm:text-sm text-stone-500">${items.length} modelos · ${esc(landing.tagline.toLowerCase())}</p>
            </a>`;
    }).join('');

    return `<!-- CATEGORIAS-DESTACADAS:START (generado por scripts/build-landings.js) -->
    <section id="categorias-destacadas" class="max-w-7xl mx-auto px-4 pt-8 w-full" aria-labelledby="categoriasDestacadasTitle">
        <h2 id="categoriasDestacadasTitle" class="text-2xl font-bold text-stone-800 mb-4">Categorías destacadas</h2>
        <div class="grid grid-cols-2 gap-3 sm:gap-6">${cards}
        </div>
    </section>
    <!-- CATEGORIAS-DESTACADAS:END -->`;
}

function updateHome(groups) {
    const file = path.join(ROOT, 'index.html');
    let html = fs.readFileSync(file, 'utf8');
    const section = homeSection(groups);
    const re = /<!-- CATEGORIAS-DESTACADAS:START[\s\S]*?<!-- CATEGORIAS-DESTACADAS:END -->/;
    if (re.test(html)) {
        html = html.replace(re, () => section);
    } else {
        const anchor = '    <!-- Main Content Container -->';
        if (!html.includes(anchor)) throw new Error('No se encontró el comentario "Main Content Container" en index.html');
        html = html.replace(anchor, () => `    ${section}\n\n${anchor}`);
    }
    fs.writeFileSync(file, html);
}

function writeSitemap() {
    const urls = ['/', ...LANDINGS.map(l => `/${l.slug}/`), '/como-comprar/'];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `    <url>
        <loc>${SITE}${u}</loc>
        <lastmod>${TODAY}</lastmod>
    </url>`).join('\n')}
</urlset>
`;
    fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
}

// --- main ---
const products = loadProducts();
const groups = LANDINGS.map(landing => ({ landing, items: productsFor(products, landing) }));
groups.forEach(({ landing, items }, i) => {
    if (items.length === 0) throw new Error(`No hay productos para ${landing.name}`);
    const other = LANDINGS[(i + 1) % LANDINGS.length];
    fs.mkdirSync(path.join(ROOT, landing.slug), { recursive: true });
    fs.writeFileSync(path.join(ROOT, landing.slug, 'index.html'), landingPage(landing, items, other));
    console.log(`/${landing.slug}/ -> ${items.length} productos`);
});
updateHome(groups);
writeSitemap();
console.log('index.html (Categorías destacadas) y sitemap.xml actualizados');
