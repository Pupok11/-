/* ============================================
   EXTRAS.JS — доп. функции
   ============================================ */

(function() {
    'use strict';

    const IS_MOBILE = window.innerWidth <= 1000;
    const IS_PRODUCT_PAGE = /\/products\/product\.html/.test(window.location.pathname);
    const IS_CATALOG_PAGE = /catalog\.html/.test(window.location.pathname);
    const IS_HOME_PAGE = /index\.html$|\/$/.test(window.location.pathname);

    // ============================================
    // THEME
    // ============================================
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
        if (IS_MOBILE) return;

        let btn = document.querySelector('.theme-toggle');
        if (!btn) {
            btn = document.createElement('button');
            btn.className = 'theme-toggle';
            btn.setAttribute('aria-label', 'Переключить тему');
            btn.innerHTML = `
                <svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                <svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
            `;
            document.body.appendChild(btn);
            btn.addEventListener('click', () => {
                const html = document.documentElement;
                const isDark = html.getAttribute('data-theme') === 'dark';
                if (isDark) { html.removeAttribute('data-theme'); localStorage.setItem('theme', 'light'); }
                else { html.setAttribute('data-theme', 'dark'); localStorage.setItem('theme', 'dark'); }
            });
        }
    }

    // ============================================
    // BURGER
    // ============================================
    function initBurger() {
        if (!IS_MOBILE) return;
        const nav = document.querySelector('.nav');
        if (!nav || nav.querySelector('.burger')) return;

        const burger = document.createElement('button');
        burger.className = 'burger';
        burger.setAttribute('aria-label', 'Меню');
        burger.innerHTML = '<span></span>';
        nav.appendChild(burger);

        const menu = document.createElement('div');
        menu.className = 'mobile-menu';
        document.querySelectorAll('.nav__menu .nav__link').forEach(link => {
            const clone = document.createElement('a');
            clone.href = link.getAttribute('href');
            clone.textContent = link.textContent;
            if (link.classList.contains('is-active')) clone.classList.add('is-active');
            menu.appendChild(clone);
        });
        document.body.appendChild(menu);

        burger.addEventListener('click', () => {
            burger.classList.toggle('is-active');
            menu.classList.toggle('is-open');
        });
        menu.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                burger.classList.remove('is-active');
                menu.classList.remove('is-open');
            });
        });
    }

    // ============================================
    // SCROLL TOP
    // ============================================
    function initScrollTop() {
        if (IS_MOBILE) return;
        if (document.querySelector('.scroll-top')) return;
        const btn = document.createElement('button');
        btn.className = 'scroll-top';
        btn.setAttribute('aria-label', 'Наверх');
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
        document.body.appendChild(btn);
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    if (window.scrollY > 500) btn.classList.add('is-visible');
                    else btn.classList.remove('is-visible');
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
        btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // ============================================
    // PARALLAX
    // ============================================
    function initParallax() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const els = [];
        [{ s: '.hero__spotlight--1', sp: 0.3 }, { s: '.hero__spotlight--2', sp: -0.2 }, { s: '.cta__title', sp: 0.15 }].forEach(({ s, sp }) => {
            document.querySelectorAll(s).forEach(el => els.push({ el, sp }));
        });
        if (!els.length) return;
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const y = window.scrollY;
                    els.forEach(({ el, sp }) => { el.style.transform = `translateY(${y * sp * 0.1}px)`; });
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // ============================================
    // SPLIT TEXT
    // ============================================
    function initSplitText() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        document.querySelectorAll('.section-title, .cta__title').forEach(el => {
            if (el.dataset.split === 'true') return;
            const html = el.innerHTML;
            const words = html.split(/(\s+|<br\s*\/?>)/).filter(Boolean);
            el.innerHTML = words.map(word => {
                if (word.match(/^\s+$/) || word.match(/^<br/)) return word;
                return `<span style="display:inline-block;opacity:0;transform:translateY(30px);transition:opacity 0.8s ease,transform 0.8s ease;">${word}</span>`;
            }).join('');
            el.dataset.split = 'true';
        });
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.querySelectorAll('span[style*="opacity:0"]').forEach((s, i) => {
                        setTimeout(() => { s.style.opacity = '1'; s.style.transform = 'translateY(0)'; }, i * 60);
                    });
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        document.querySelectorAll('[data-split="true"]').forEach(el => obs.observe(el));
    }

    // ============================================
    // TILT
    // ============================================
    function initTilt() {
        if (IS_MOBILE) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        document.querySelectorAll('.project-card, .metric-card').forEach(card => {
            if (card.dataset.tiltBound === 'true') return;
            card.dataset.tiltBound = 'true';
            card.classList.add('tilt');
            let raf = null;
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                if (raf) cancelAnimationFrame(raf);
                raf = requestAnimationFrame(() => {
                    card.style.transform = `perspective(1000px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
                });
            });
            card.addEventListener('mouseleave', () => {
                if (raf) cancelAnimationFrame(raf);
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
            });
        });
    }

    // ============================================
    // MAGNETIC NAV
    // ============================================
    function initMagneticNav() {
        if (IS_MOBILE) return;
        document.querySelectorAll('.nav__link, .footer__nav a').forEach(el => {
            if (el.dataset.magBound === 'true') return;
            el.dataset.magBound = 'true';
            let raf = null;
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                if (raf) cancelAnimationFrame(raf);
                raf = requestAnimationFrame(() => { el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`; });
            });
            el.addEventListener('mouseleave', () => {
                if (raf) cancelAnimationFrame(raf);
                el.style.transform = '';
            });
        });
    }

    // ============================================
    // READ PROGRESS
    // ============================================
    function initReadProgress() {
        if (!IS_PRODUCT_PAGE) return;
        let bar = document.querySelector('.read-progress');
        if (!bar) {
            bar = document.createElement('div');
            bar.className = 'read-progress';
            document.body.appendChild(bar);
        }
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const top = window.scrollY;
                    const docH = document.documentElement.scrollHeight - window.innerHeight;
                    bar.style.width = (docH > 0 ? (top / docH) * 100 : 0) + '%';
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // ============================================
    // FAVORITES (глобальная логика)
    // ============================================
    function getFavoritesList() {
        try { return JSON.parse(localStorage.getItem('favorites') || '[]'); }
        catch (e) { return []; }
    }

    function updateFavCounter() {
        const count = getFavoritesList().length;
        const badge = document.querySelector('.fav-counter');
        if (!badge) return;
        badge.textContent = count;
        if (count > 0) badge.classList.add('is-visible');
        else badge.classList.remove('is-visible');
    }

    window.__updateFavCount = updateFavCounter;

    function initFavorites() {
        const favs = getFavoritesList();

        document.querySelectorAll('.project-card').forEach(card => {
            if (card.querySelector('.fav-btn')) return;
            const href = card.getAttribute('href');
            if (!href) return;
            const id = href.match(/[?&]id=([^&]+)/) ? href.match(/[?&]id=([^&]+)/)[1] : href.replace(/\.html.*$/, '').replace(/.*\//, '');
            const btn = document.createElement('button');
            btn.className = 'fav-btn';
            btn.setAttribute('aria-label', 'В избранное');
            btn.setAttribute('title', 'В избранное');
            btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
            if (favs.includes(id)) btn.classList.add('is-active');

            btn.addEventListener('click', (e) => {
                e.preventDefault(); e.stopPropagation();
                const list = getFavoritesList();
                const idx = list.indexOf(id);
                if (idx >= 0) {
                    list.splice(idx, 1);
                    btn.classList.remove('is-active');
                } else {
                    list.push(id);
                    btn.classList.add('is-active');
                    btn.style.transform = 'scale(1.3)';
                    setTimeout(() => btn.style.transform = '', 250);
                }
                localStorage.setItem('favorites', JSON.stringify(list));
                updateFavCounter();
            });
            card.appendChild(btn);
        });

        updateFavCounter();
    }

    // ============================================
    // ИКОНКА ИЗБРАННОГО В ШАПКЕ
    // ============================================
    function initFavoritesIcon() {
        const nav = document.querySelector('.nav');
        if (!nav) return;
        if (nav.querySelector('.fav-icon')) return;

        const btn = document.createElement('a');
        // если мы в папке products — путь ../favorites.html
        const inProducts = /\/products\//.test(window.location.pathname);
        btn.href = inProducts ? '../favorites.html' : 'favorites.html';
        btn.className = 'fav-icon';
        btn.setAttribute('aria-label', 'Избранное');
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span class="fav-counter">0</span>
        `;

        const cartBtn = nav.querySelector('.cart-btn');
        const cta = nav.querySelector('.nav__cta');
        if (cartBtn) nav.insertBefore(btn, cartBtn);
        else if (cta) nav.insertBefore(btn, cta);
        else nav.appendChild(btn);

        updateFavCounter();
    }

    // ============================================
    // COMPARE
    // ============================================
    function initCompare() {
        let bar = document.querySelector('.compare-bar');
        if (!bar) {
            bar = document.createElement('div');
            bar.className = 'compare-bar';
            bar.innerHTML = `
                <span>Сравнить: <span class="compare-bar__count">0</span></span>
                <button class="compare-bar__btn" type="button">Открыть</button>
                <button class="compare-bar__clear" type="button">Очистить</button>
            `;
            document.body.appendChild(bar);
        }

        let modal = document.querySelector('.compare-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'compare-modal';
            modal.innerHTML = `
                <div class="compare-modal__inner">
                    <button class="compare-modal__close" type="button">×</button>
                    <h3 style="font-family:var(--font-display);font-size:32px;font-weight:400;margin-bottom:16px;">Сравнение товаров</h3>
                    <div id="compare-table-wrap"></div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        document.querySelectorAll('.project-card').forEach(card => {
            if (card.querySelector('[data-compare-id]')) return;
            const href = card.getAttribute('href');
            if (!href) return;
            const id = href.match(/[?&]id=([^&]+)/) ? href.match(/[?&]id=([^&]+)/)[1] : href.replace(/\.html.*$/, '').replace(/.*\//, '');
            const items = JSON.parse(localStorage.getItem('compare') || '[]');
            const label = document.createElement('label');
            label.style.cssText = 'position:absolute;bottom:16px;right:16px;z-index:10;background:rgba(255,255,255,0.9);backdrop-filter:blur(10px);border:1px solid var(--border);padding:6px 10px;font-family:var(--font-mono);font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:var(--text-2);display:flex;align-items:center;gap:6px;cursor:pointer;';
            label.innerHTML = `<input type="checkbox" data-compare-id="${id}" ${items.includes(id) ? 'checked' : ''} style="accent-color:#C7A06F;"> Сравнить`;
            card.appendChild(label);
            label.querySelector('input').addEventListener('change', onCompareToggle);
        });

        function onCompareToggle(e) {
            const cb = e.target;
            const id = cb.dataset.compareId;
            let list = JSON.parse(localStorage.getItem('compare') || '[]');
            if (cb.checked) {
                if (!list.includes(id)) list.push(id);
                if (list.length > 3) {
                    list = list.slice(-3);
                    alert('Можно сравнивать до 3 товаров');
                }
            } else {
                list = list.filter(x => x !== id);
            }
            localStorage.setItem('compare', JSON.stringify(list));
            document.querySelectorAll('[data-compare-id]').forEach(c => { c.checked = list.includes(c.dataset.compareId); });
            updateBar();
        }

        function updateBar() {
            const list = JSON.parse(localStorage.getItem('compare') || '[]');
            bar.querySelector('.compare-bar__count').textContent = list.length;
            if (list.length > 0) bar.classList.add('is-visible');
            else bar.classList.remove('is-visible');
        }

        bar.querySelector('.compare-bar__clear').addEventListener('click', () => {
            localStorage.setItem('compare', '[]');
            document.querySelectorAll('[data-compare-id]').forEach(c => { c.checked = false; });
            updateBar();
        });

        bar.querySelector('.compare-bar__btn').addEventListener('click', () => {
            const list = JSON.parse(localStorage.getItem('compare') || '[]');
            if (!list.length) return;
            if (!window.TECHNOPRESTIGE_DATA) return;
            const products = list.map(id => window.TECHNOPRESTIGE_DATA.products.find(p => p.id === id)).filter(Boolean);
            if (!products.length) return;

            const wrap = modal.querySelector('#compare-table-wrap');
            let html = '<table class="compare-table"><tr><th>Параметр</th>';
            products.forEach(p => html += `<th>${p.name}</th>`);
            html += '</tr><tr><td>Категория</td>';
            products.forEach(p => html += `<td>${p.tag}</td>`);
            html += '</tr><tr><td>Цена</td>';
            products.forEach(p => html += `<td style="color:var(--gold);font-family:var(--font-display);font-size:20px;">${p.price}</td>`);
            html += '</tr><tr><td>Кратко</td>';
            products.forEach(p => html += `<td>${p.short}</td>`);
            html += '</tr>';
            for (let i = 0; i < 6; i++) {
                const title = products[0].specs[i]?.title || `Пункт ${i + 1}`;
                html += `<tr><td>${title}</td>`;
                products.forEach(p => html += `<td>${p.specs[i]?.text || '—'}</td>`);
                html += '</tr>';
            }
            html += '</table>';
            wrap.innerHTML = html;
            modal.classList.add('is-open');
        });

        modal.querySelector('.compare-modal__close').addEventListener('click', () => modal.classList.remove('is-open'));
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('is-open'); });

        updateBar();
    }

    // ============================================
    // FORM AUTOFILL
    // ============================================
    function initFormAutofill() {
        const form = document.getElementById('contact-form');
        if (!form || form.dataset.autofillBound === 'true') return;
        form.dataset.autofillBound = 'true';
        const saved = JSON.parse(localStorage.getItem('formData') || '{}');
        let filled = false;
        Object.keys(saved).forEach(key => {
            const field = form.querySelector(`[name="${key}"]`);
            if (field && saved[key]) { field.value = saved[key]; filled = true; }
        });
        if (filled) {
            const note = document.createElement('p');
            note.className = 'autofill-note is-visible';
            note.textContent = '✓ Данные восстановлены';
            form.insertBefore(note, form.firstChild);
        }
        form.addEventListener('submit', () => {
            const data = {};
            form.querySelectorAll('input, textarea, select').forEach(f => { if (f.name && f.value) data[f.name] = f.value; });
            localStorage.setItem('formData', JSON.stringify(data));
        });
    }

    // ============================================
    // RECENTLY VIEWED
    // ============================================
    function initRecentlyViewed() {
        if (!IS_HOME_PAGE && !IS_CATALOG_PAGE) return;
        const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        if (viewed.length < 2) return;
        if (document.querySelector('.recently-viewed')) return;
        const box = document.createElement('div');
        box.className = 'recently-viewed';
        box.innerHTML = `
            <button class="recently-viewed__close" type="button" aria-label="Закрыть">×</button>
            <div class="recently-viewed__title">Вы смотрели</div>
            ${viewed.slice(-3).reverse().map(v => `<a href="${v.url}" class="recently-viewed__item">${v.name}</a>`).join('')}
        `;
        document.body.appendChild(box);
        setTimeout(() => box.classList.add('is-visible'), 2000);
        box.querySelector('.recently-viewed__close').addEventListener('click', () => {
            box.classList.remove('is-visible');
            setTimeout(() => box.remove(), 500);
        });
    }

    function saveViewed() {
        if (!IS_PRODUCT_PAGE) return;
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if (!id || !window.TECHNOPRESTIGE_DATA) return;
        const product = window.TECHNOPRESTIGE_DATA.products.find(p => p.id === id);
        if (!product) return;
        const url = window.location.pathname + window.location.search;
        const list = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const filtered = list.filter(x => x.url !== url);
        filtered.push({ name: product.name, url });
        localStorage.setItem('recentlyViewed', JSON.stringify(filtered.slice(-5)));
    }

    // ============================================
    // PRICE COUNT-UP
    // ============================================
    function initPriceCount() {
        document.querySelectorAll('.price-count').forEach(el => {
            if (el.dataset.counted === 'true') return;
            const target = parseInt(el.dataset.price, 10);
            if (!target) return;
            const obs = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        el.dataset.counted = 'true';
                        const start = performance.now();
                        const tick = (now) => {
                            const t = Math.min((now - start) / 1200, 1);
                            const eased = 1 - Math.pow(1 - t, 3);
                            el.textContent = Math.floor(eased * target).toLocaleString('ru-RU');
                            if (t < 1) requestAnimationFrame(tick);
                            else el.textContent = target.toLocaleString('ru-RU');
                        };
                        requestAnimationFrame(tick);
                        obs.unobserve(el);
                    }
                });
            }, { threshold: 0.5 });
            obs.observe(el);
        });
    }

    // ============================================
    // STICKY CTA
    // ============================================
    function initStickyCTA() {
        if (!IS_PRODUCT_PAGE || !IS_MOBILE) return;
        if (document.querySelector('.sticky-cta')) return;
        const bar = document.createElement('div');
        bar.className = 'sticky-cta';
        bar.innerHTML = `<a href="../contacts.html" class="btn btn--primary"><span class="btn__text">Заказать</span><span class="arrow">→</span></a>`;
        document.body.appendChild(bar);
    }

    // ============================================
    // BREADCRUMBS
    // ============================================
    function initBreadcrumbs() {
        if (document.querySelector('.breadcrumbs')) return;
        if (!IS_PRODUCT_PAGE && !IS_CATALOG_PAGE) return;
        const main = document.querySelector('.main');
        if (!main) return;
        const bc = document.createElement('nav');
        bc.className = 'breadcrumbs';
        bc.setAttribute('aria-label', 'Хлебные крошки');

        if (IS_PRODUCT_PAGE) {
            const params = new URLSearchParams(window.location.search);
            const id = params.get('id');
            const product = window.TECHNOPRESTIGE_DATA?.products.find(p => p.id === id);
            const name = product ? product.name : 'Товар';
            bc.innerHTML = `<a href="../index.html">Главная</a><span class="sep">/</span><a href="../catalog.html">Каталог</a><span class="sep">/</span><span class="current">${name}</span>`;
        } else {
            bc.innerHTML = `<a href="index.html">Главная</a><span class="sep">/</span><span class="current">Каталог</span>`;
        }
        main.insertBefore(bc, main.firstChild);
    }

    // ============================================
    // DELIVERY CALC
    // ============================================
    function initDeliveryCalc() {
        if (!IS_CATALOG_PAGE && !IS_PRODUCT_PAGE) return;
        if (document.querySelector('.delivery-calc')) return;
        const section = document.createElement('section');
        section.className = 'delivery-calc';
        section.innerHTML = `
            <header class="section-head" style="padding:0 0 20px;border:none;">
                <p class="eyebrow">◆ ДОСТАВКА</p>
                <h2 class="section-title" style="font-size:clamp(28px,4vw,48px);">Калькулятор доставки</h2>
            </header>
            <div class="delivery-calc__form">
                <div class="field">
                    <label>Город</label>
                    <select id="calc-city">
                        <option value="spb">Санкт-Петербург</option>
                        <option value="msk">Москва</option>
                        <option value="other">Другой город</option>
                    </select>
                </div>
                <div class="field">
                    <label>Вес, кг</label>
                    <input type="number" id="calc-weight" min="1" max="500" value="30">
                </div>
                <button class="btn btn--primary" type="button" id="calc-btn"><span class="btn__text">Рассчитать</span></button>
            </div>
            <div class="delivery-calc__result" id="calc-result"></div>
        `;
        const footer = document.querySelector('.footer');
        if (footer && footer.parentNode) {
            footer.parentNode.insertBefore(section, footer);
        } else {
            document.body.appendChild(section);
        }

        document.getElementById('calc-btn').addEventListener('click', () => {
            const city = document.getElementById('calc-city').value;
            const weight = parseFloat(document.getElementById('calc-weight').value) || 0;
            let base = city === 'spb' ? 500 : city === 'msk' ? 800 : 1200;
            const price = base + Math.max(0, weight - 20) * 30;
            const days = city === 'spb' ? '1–2 дня' : city === 'msk' ? '2–3 дня' : '4–7 дней';
            document.getElementById('calc-result').innerHTML = `${price.toLocaleString('ru-RU')} ₽<small>Срок: ${days}</small>`;
        });
    }

    // ============================================
    // INIT ALL
    // ============================================
    function init() {
        initTheme();
        initBurger();
        initScrollTop();
        initBreadcrumbs();
        initReadProgress();
        initFavorites();
        initFavoritesIcon();
        initCompare();
        initFormAutofill();
        initRecentlyViewed();
        saveViewed();
        initPriceCount();
        initStickyCTA();
        initTilt();
        initMagneticNav();
        initParallax();
        initSplitText();
        initDeliveryCalc();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    document.addEventListener('contentRendered', () => {
        initFavorites();
        initFavoritesIcon();
        initCompare();
        initTilt();
        initPriceCount();
        initBreadcrumbs();
    });

    /* SKIP-LINK — переносит фокус на #main-content */
    function initSkipLink() {
        document.querySelectorAll('a.skip-link').forEach(function(link) {
            if (link.dataset.skipBound === 'true') return;
            link.dataset.skipBound = 'true';
            link.addEventListener('click', function(e) {
                var href = link.getAttribute('href');
                if (!href || href.charAt(0) !== '#') return;
                var target = document.querySelector(href);
                if (!target) return;
                e.preventDefault();
                e.stopPropagation();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                if (target.getAttribute('tabindex') !== '-1') {
                    target.setAttribute('tabindex', '-1');
                }
                target.focus({ preventScroll: true });
                if (history.replaceState) {
                    history.replaceState(null, '', href);
                }
            });
        });
    }
    initSkipLink();
})();