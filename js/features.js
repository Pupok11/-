/* ============================================
   FEATURES.JS — корзина, quick view, поиск, отзывы,
   FAQ, подписка, чат, PWA, scroll-top с прогрессом
   + ИСПРАВЛЕНО: тёмные 3D-модели в быстром просмотре
   ============================================ */

(function() {
    'use strict';

    const IS_MOBILE = window.innerWidth <= 1000;
    const IN_PRODUCTS_FOLDER = /\/products\//.test(location.pathname);

    function productUrl(file) {
        if (!file) return '#';
        if (IN_PRODUCTS_FOLDER && file.startsWith('products/')) {
            return '../' + file;
        }
        return file;
    }

    function getProductIdFromCard(card) {
        const href = card.getAttribute('href');
        if (!href) return null;
        const m = href.match(/[?&]id=([^&]+)/);
        if (m) return m[1];
        return href.replace(/\.html.*$/, '').replace(/.*\//, '');
    }

    function findProduct(id) {
        if (!window.TECHNOPRESTIGE_DATA) return null;
        return window.TECHNOPRESTIGE_DATA.products.find(p => p.id === id);
    }

    function formatPrice(n) {
        return n.toLocaleString('ru-RU') + ' ₽';
    }

    // ============================================
    // 1. CART
    // ============================================
    const Cart = {
        key: 'cart',
        get() {
            try { return JSON.parse(localStorage.getItem(this.key) || '[]'); }
            catch (e) { return []; }
        },
        save(list) { localStorage.setItem(this.key, JSON.stringify(list)); },
        count() { return this.get().reduce((s, i) => s + i.qty, 0); },
        total() {
            return this.get().reduce((s, i) => {
                const p = findProduct(i.id);
                return s + (p ? p.priceNum * i.qty : 0);
            }, 0);
        },
        add(id) {
            const list = this.get();
            const found = list.find(i => i.id === id);
            if (found) found.qty += 1;
            else list.push({ id, qty: 1 });
            this.save(list);
            this.renderPanel();
            this.updateBadge(true);
            this.flashButton(id);
        },
        remove(id) {
            this.save(this.get().filter(i => i.id !== id));
            this.renderPanel();
            this.updateBadge();
        },
        setQty(id, qty) {
            const list = this.get();
            const found = list.find(i => i.id === id);
            if (found) {
                if (qty <= 0) this.remove(id);
                else { found.qty = qty; this.save(list); this.renderPanel(); this.updateBadge(); }
            }
        },
        clear() { this.save([]); this.renderPanel(); this.updateBadge(); },
        updateBadge(pulse) {
            const badge = document.querySelector('.cart-count');
            if (!badge) return;
            const count = this.count();
            badge.textContent = count;
            if (count > 0) badge.classList.add('is-visible');
            else badge.classList.remove('is-visible');
            if (pulse) {
                badge.classList.remove('is-pulse');
                void badge.offsetWidth;
                badge.classList.add('is-pulse');
            }
        },
        flashButton(id) {
            const btn = document.querySelector(`.add-to-cart[data-id="${id}"]`);
            if (!btn) return;
            const original = btn.innerHTML;
            btn.innerHTML = '✓ Добавлено';
            btn.style.background = '#C7A06F';
            btn.style.color = '#0A0A0A';
            setTimeout(() => {
                btn.innerHTML = original;
                btn.style.background = '';
                btn.style.color = '';
            }, 1400);
        },
        renderPanel() {
            const body = document.querySelector('.cart-panel__body');
            const totalEl = document.querySelector('.cart-total strong');
            if (!body) return;

            const list = this.get();
            if (!list.length) {
                body.innerHTML = '<div class="cart-empty">Корзина пуста</div>';
                if (totalEl) totalEl.textContent = '0 ₽';
                return;
            }

            body.innerHTML = list.map(item => {
                const p = findProduct(item.id);
                if (!p) return '';
                return `
                    <div class="cart-item">
                        <div class="cart-item__img"></div>
                        <div class="cart-item__info">
                            <h4>${p.name}</h4>
                            <p>${p.tag}</p>
                            <div class="cart-item__qty">
                                <button type="button" data-cart-dec="${item.id}">−</button>
                                <span>${item.qty}</span>
                                <button type="button" data-cart-inc="${item.id}">+</button>
                            </div>
                        </div>
                        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:10px;">
                            <button class="cart-item__remove" type="button" data-cart-remove="${item.id}" aria-label="Удалить">×</button>
                            <div class="cart-item__price">${formatPrice(p.priceNum * item.qty)}</div>
                        </div>
                    </div>
                `;
            }).join('');

            if (totalEl) totalEl.textContent = formatPrice(this.total());

            body.querySelectorAll('[data-cart-inc]').forEach(b => {
                b.addEventListener('click', () => {
                    const id = b.dataset.cartInc;
                    const cur = this.get().find(i => i.id === id);
                    this.setQty(id, (cur?.qty || 0) + 1);
                });
            });
            body.querySelectorAll('[data-cart-dec]').forEach(b => {
                b.addEventListener('click', () => {
                    const id = b.dataset.cartDec;
                    const cur = this.get().find(i => i.id === id);
                    this.setQty(id, (cur?.qty || 0) - 1);
                });
            });
            body.querySelectorAll('[data-cart-remove]').forEach(b => {
                b.addEventListener('click', () => this.remove(b.dataset.cartRemove));
            });
        }
    };

    window.__Cart = Cart;

    function initCart() {
        const nav = document.querySelector('.nav');
        if (!nav) return;

        let btn = nav.querySelector('.cart-btn');
        if (!btn) {
            const cta = nav.querySelector('.nav__cta');
            btn = document.createElement('button');
            btn.className = 'cart-btn';
            btn.setAttribute('aria-label', 'Корзина');
            btn.setAttribute('type', 'button');
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                <span class="cart-count">0</span>
            `;
            if (cta) nav.insertBefore(btn, cta);
            else nav.appendChild(btn);
        }

        if (!document.querySelector('.cart-panel')) {
            const panel = document.createElement('div');
            panel.className = 'cart-panel';
            panel.innerHTML = `
                <div class="cart-panel__head">
                    <h3>Корзина</h3>
                    <button class="cart-panel__close" type="button" aria-label="Закрыть">×</button>
                </div>
                <div class="cart-panel__body"></div>
                <div class="cart-panel__foot">
                    <div class="cart-total"><span>Итого</span><strong>0 ₽</strong></div>
                    <button class="btn btn--primary" type="button" id="cart-checkout">
                        <span class="btn__text">Оформить заказ</span><span class="arrow">→</span>
                    </button>
                </div>
            `;
            document.body.appendChild(panel);

            const overlay = document.createElement('div');
            overlay.className = 'cart-overlay';
            document.body.appendChild(overlay);

            btn.addEventListener('click', () => {
                panel.classList.add('is-open');
                overlay.classList.add('is-open');
            });
            panel.querySelector('.cart-panel__close').addEventListener('click', close);
            overlay.addEventListener('click', close);

            function close() {
                panel.classList.remove('is-open');
                overlay.classList.remove('is-open');
            }

            panel.querySelector('#cart-checkout').addEventListener('click', () => {
                if (Cart.count() === 0) { alert('Корзина пуста'); return; }
                const contacts = IN_PRODUCTS_FOLDER ? '../contacts.html' : 'contacts.html';
                window.location.href = contacts;
            });
        }

        Cart.renderPanel();
        Cart.updateBadge();
    }

    // ============================================
    // 2. ДОБАВЛЕНИЕ КНОПОК НА КАРТОЧКИ
    // ============================================
    function attachCardButtons() {
        document.querySelectorAll('.project-card').forEach(card => {
            const id = getProductIdFromCard(card);
            if (!id) return;

            if (!card.querySelector('.add-to-cart')) {
                const cartBtn = document.createElement('button');
                cartBtn.type = 'button';
                cartBtn.className = 'add-to-cart';
                cartBtn.dataset.id = id;
                cartBtn.setAttribute('aria-label', 'Добавить в корзину');
                cartBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    В корзину
                `;
                cartBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    Cart.add(id);
                });
                card.appendChild(cartBtn);
            }

            if (!card.querySelector('.quick-view-btn')) {
                const qbtn = document.createElement('button');
                qbtn.className = 'quick-view-btn';
                qbtn.type = 'button';
                qbtn.setAttribute('aria-label', 'Быстрый просмотр');
                qbtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
                qbtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (window.__openQuickView) window.__openQuickView(id);
                });
                card.appendChild(qbtn);
            }
        });
    }

    // ============================================
    // 3. QUICK VIEW
    // ============================================
    let miniScene = null;
    let currentQuickId = null;

    function initQuickView() {
        if (document.querySelector('.quick-modal')) return;

        const modal = document.createElement('div');
        modal.className = 'quick-modal';
        modal.innerHTML = `
            <div class="quick-modal__inner">
                <button class="quick-modal__close" type="button" aria-label="Закрыть">×</button>
                <div class="quick-modal__viewer" id="quick-viewer"></div>
                <div class="quick-modal__info">
                    <p class="eyebrow" id="quick-tag">—</p>
                    <h3 id="quick-name">—</h3>
                    <p id="quick-desc">—</p>
                    <div class="quick-modal__price" id="quick-price">—</div>
                    <div class="quick-modal__actions">
                        <button class="btn btn--primary" type="button" id="quick-add">
                            <span class="btn__text">В корзину</span><span class="arrow">→</span>
                        </button>
                        <a class="btn btn--ghost" id="quick-full" href="#">Подробнее</a>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        function open(id) {
            const p = findProduct(id);
            if (!p) return;
            currentQuickId = id;

            modal.querySelector('#quick-tag').textContent = '◆ ' + p.tag;
            modal.querySelector('#quick-name').textContent = p.name;
            modal.querySelector('#quick-desc').textContent = p.long;
            modal.querySelector('#quick-price').textContent = p.price;
            modal.querySelector('#quick-full').href = productUrl(p.file);

            const viewer = modal.querySelector('#quick-viewer');
            viewer.innerHTML = '';
            if (typeof THREE !== 'undefined') {
                if (miniScene && miniScene.renderer) miniScene.renderer.dispose();
                miniScene = buildQuickScene(viewer, p.modelType);
            }

            modal.classList.add('is-open');
        }

        function close() {
            modal.classList.remove('is-open');
            if (miniScene && miniScene.renderer) miniScene.renderer.dispose();
            miniScene = null;
        }

        modal.querySelector('.quick-modal__close').addEventListener('click', close);
        modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
        });

        modal.querySelector('#quick-add').addEventListener('click', () => {
            if (currentQuickId) {
                Cart.add(currentQuickId);
                const btn = modal.querySelector('#quick-add .btn__text');
                const orig = btn.textContent;
                btn.textContent = '✓ Добавлено';
                setTimeout(() => { btn.textContent = orig; }, 1200);
            }
        });

        window.__openQuickView = open;
    }

    function buildQuickScene(container, modelType) {
        const rect = container.getBoundingClientRect();
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, rect.width / rect.height, 0.1, 100);
        camera.position.set(5, 5, 8);
        camera.lookAt(0, 1.5, 0);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(rect.width, rect.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.domElement.style.display = 'block';
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        container.appendChild(renderer.domElement);

        scene.add(new THREE.AmbientLight(0xffffff, 0.75));
        const key = new THREE.DirectionalLight(0xffffff, 1.4);
        key.position.set(5, 8, 6); key.castShadow = true; scene.add(key);
        const fill = new THREE.DirectionalLight(0xC7A06F, 0.6);
        fill.position.set(-4, 3, 4); scene.add(fill);

        const group = new THREE.Group();
        scene.add(group);

        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2A2A2A, metalness: 0.35, roughness: 0.5 });
        const doorMat = new THREE.MeshStandardMaterial({ color: 0xF5F3EF, metalness: 0.2, roughness: 0.3 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xC7A06F, metalness: 1, roughness: 0.25 });
        const darkMat = new THREE.MeshStandardMaterial({ color: 0x0A0A0A, metalness: 0.9, roughness: 0.1 });
        const screenMat = new THREE.MeshStandardMaterial({ color: 0xC7A06F, emissive: 0xC7A06F, emissiveIntensity: 1.2, metalness: 1, roughness: 0.2 });
        const steelMat = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, metalness: 0.9, roughness: 0.3 });

        let lookAtY = 1;
        if (modelType === 'fridge') {
            const b = new THREE.Mesh(new THREE.BoxGeometry(2.2, 4.5, 1.6), bodyMat); b.position.y = 2.25; b.castShadow = true; group.add(b);
            const d1 = new THREE.Mesh(new THREE.BoxGeometry(2.15, 1.1, 0.05), doorMat); d1.position.set(0, 3.9, 0.83); group.add(d1);
            const d2 = new THREE.Mesh(new THREE.BoxGeometry(2.15, 3.1, 0.05), doorMat); d2.position.set(0, 2.1, 0.83); group.add(d2);
            const h1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 0.08), goldMat); h1.position.set(1.05, 3.9, 0.9); group.add(h1);
            const h2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.6, 0.08), goldMat); h2.position.set(1.05, 2.1, 0.9); group.add(h2);
            const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.3), screenMat); disp.position.set(-0.5, 3.9, 0.87); group.add(disp);
            lookAtY = 2.5;
            camera.position.set(5, 6, 9);
        } else if (modelType === 'washer') {
            const b = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 2.0), bodyMat); b.position.y = 1.2; b.castShadow = true; group.add(b);
            const t = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.4, 2.0), doorMat); t.position.y = 2.2; group.add(t);
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.1, 16, 32), goldMat); ring.position.set(0, 1.2, 1.02); group.add(ring);
            const g = new THREE.Mesh(new THREE.CircleGeometry(0.65, 32), darkMat); g.position.set(0, 1.2, 1.01); group.add(g);
            const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.25), screenMat); disp.position.set(-0.5, 2.2, 1.02); group.add(disp);
            for (let i = 0; i < 4; i++) {
                const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 12), goldMat);
                btn.rotation.x = Math.PI / 2; btn.position.set(0.4 + i * 0.2, 2.2, 1.02); group.add(btn);
            }
            lookAtY = 1.2;
            camera.position.set(4, 4, 7);
        } else if (modelType === 'microwave') {
            const b = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.5, 1.6), bodyMat); b.position.y = 0.75; b.castShadow = true; group.add(b);
            const d = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.3, 0.05), doorMat); d.position.set(-0.3, 0.75, 0.82); group.add(d);
            const w = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.0), darkMat); w.position.set(-0.3, 0.75, 0.85); group.add(w);
            const p = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.3, 0.05), new THREE.MeshStandardMaterial({ color: 0x1A1A1A, metalness: 0.5, roughness: 0.5 })); p.position.set(0.85, 0.75, 0.82); group.add(p);
            const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.2), screenMat); disp.position.set(0.85, 1.1, 0.85); group.add(disp);
            for (let i = 0; i < 6; i++) {
                const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 12), goldMat);
                btn.rotation.x = Math.PI / 2;
                btn.position.set(0.7 + (i % 2) * 0.25, 0.9 - Math.floor(i / 2) * 0.2, 0.85); group.add(btn);
            }
            const handle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.08), goldMat);
            handle.position.set(0.5, 0.75, 0.85); group.add(handle);
            lookAtY = 0.75;
            camera.position.set(4, 3, 6);
        } else if (modelType === 'vacuum') {
            const b = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 1.5, 16), bodyMat); b.position.y = 0.75; b.castShadow = true; group.add(b);
            const t = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.2, 0.6, 16), doorMat); t.position.y = 1.8; group.add(t);
            const h = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.2, 0.15), goldMat); h.position.set(0.5, 2.2, 0); group.add(h);
            const hose = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.1, 8, 20), goldMat); hose.position.set(-0.8, 1.2, 0); hose.rotation.x = Math.PI / 3; group.add(hose);
            const wheel1 = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.2, 12), steelMat);
            wheel1.rotation.z = Math.PI / 2; wheel1.position.set(-0.9, 0.35, 0.6); group.add(wheel1);
            const wheel2 = wheel1.clone(); wheel2.position.set(0.9, 0.35, 0.6); group.add(wheel2);
            lookAtY = 1.2;
            camera.position.set(4, 4, 7);
        } else if (modelType === 'blender') {
            const base = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 0.4, 16), bodyMat); base.position.y = 0.2; base.castShadow = true; group.add(base);
            const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.8, 16), doorMat); jar.position.y = 1.2; group.add(jar);
            const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.15, 16), goldMat); lid.position.y = 2.15; group.add(lid);
            const h = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.2, 0.15), goldMat); h.position.set(0.7, 1.2, 0); group.add(h);
            const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 12), goldMat);
            btn.rotation.x = Math.PI / 2; btn.position.set(0, 0.4, 0.75); group.add(btn);
            lookAtY = 1.1;
            camera.position.set(4, 4, 6);
        } else if (modelType === 'multicooker') {
            const b = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.1, 1.6, 16), bodyMat); b.position.y = 0.8; b.castShadow = true; group.add(b);
            const lid = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.0, 0.3, 16), doorMat); lid.position.y = 1.75; group.add(lid);
            const h = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.6), goldMat); h.position.set(0, 2.0, 0.8); group.add(h);
            const panel = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.1), doorMat); panel.position.set(0, 1.2, 1.0); group.add(panel);
            const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.2), screenMat); disp.position.set(0, 1.25, 1.06); group.add(disp);
            const btn1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 12), goldMat);
            btn1.rotation.x = Math.PI / 2; btn1.position.set(-0.25, 0.9, 1.05); group.add(btn1);
            const btn2 = btn1.clone(); btn2.position.set(0.25, 0.9, 1.05); group.add(btn2);
            lookAtY = 1.0;
            camera.position.set(4, 4, 6);
        }

        function resize() {
            const r = container.getBoundingClientRect();
            if (r.width < 10 || r.height < 10) return;
            camera.aspect = r.width / r.height;
            camera.updateProjectionMatrix();
            renderer.setSize(r.width, r.height, false);
            renderer.domElement.style.width = '100%';
            renderer.domElement.style.height = '100%';
        }

        let ro = null;
        if ('ResizeObserver' in window) {
            ro = new ResizeObserver(() => resize());
            ro.observe(container);
        }
        window.addEventListener('resize', resize);

        const clock = new THREE.Clock();
        function animate() {
            if (!container.isConnected) {
                if (ro) ro.disconnect();
                return;
            }
            const t = clock.getElapsedTime();
            group.rotation.y = -0.4 + Math.sin(t * 0.5) * 0.4;
            camera.lookAt(0, lookAtY, 0);
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        }
        animate();

        return { renderer, scene, camera };
    }

    // ============================================
    // 4. ГЛОБАЛЬНЫЙ ПОИСК
    // ============================================
    function initGlobalSearch() {
        const nav = document.querySelector('.nav');
        if (!nav) return;
        if (nav.querySelector('.search-open-btn')) return;

        const btn = document.createElement('button');
        btn.className = 'search-open-btn';
        btn.setAttribute('aria-label', 'Открыть поиск');
        btn.setAttribute('type', 'button');
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>';
        const cartBtn = nav.querySelector('.cart-btn');
        if (cartBtn) nav.insertBefore(btn, cartBtn);
        else nav.insertBefore(btn, nav.querySelector('.nav__cta'));

        const overlay = document.createElement('div');
        overlay.className = 'search-overlay';
        overlay.innerHTML = `
            <div class="search-overlay__inner">
                <input type="search" placeholder="Что ищете?" id="global-search-input" autocomplete="off" aria-label="Поиск по сайту">
                <div class="search-results" id="global-search-results"></div>
            </div>
        `;
        document.body.appendChild(overlay);

        const input = overlay.querySelector('#global-search-input');
        const results = overlay.querySelector('#global-search-results');

        function open() {
            overlay.classList.add('is-open');
            setTimeout(() => input.focus(), 100);
        }
        function close() {
            overlay.classList.remove('is-open');
            input.value = '';
            results.innerHTML = '';
        }

        btn.addEventListener('click', open);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); open(); }
        });

        input.addEventListener('input', () => {
            const q = input.value.trim().toLowerCase();
            if (!q || !window.TECHNOPRESTIGE_DATA) { results.innerHTML = ''; return; }
            const list = window.TECHNOPRESTIGE_DATA.products.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.tag.toLowerCase().includes(q) ||
                p.short.toLowerCase().includes(q)
            );
            if (!list.length) {
                results.innerHTML = '<p style="color:rgba(255,255,255,0.5);font-family:var(--font-mono);font-size:12px;letter-spacing:0.15em;text-transform:uppercase;padding:20px 0;">Ничего не найдено</p>';
                return;
            }
            results.innerHTML = list.map(p => `
                <a href="${productUrl(p.file)}" class="search-result-item">
                    <div class="search-result-item__img"></div>
                    <div>
                        <h4>${p.name}</h4>
                        <p>${p.tag}</p>
                    </div>
                    <div class="search-result-item__price">${p.price}</div>
                </a>
            `).join('');
        });
    }

    // ============================================
    // 5. КНОПКА "В КОРЗИНУ" НА СТРАНИЦЕ ТОВАРА
    // ============================================
    function initProductPageCart() {
        if (!/products\/product\.html/.test(location.pathname)) return;
        if (document.querySelector('.product-buy-bar')) return;

        const params = new URLSearchParams(location.search);
        const id = params.get('id');
        if (!id) return;

        const product = findProduct(id);
        if (!product) return;

        const bar = document.createElement('div');
        bar.className = 'product-buy-bar';
        bar.style.cssText = `
            position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
            background: var(--bg); border: 1px solid var(--gold);
            padding: 14px 24px; z-index: 400;
            box-shadow: 0 12px 40px rgba(0,0,0,0.12);
            display: flex; align-items: center; gap: 20px;
            font-family: var(--font-mono); font-size: 11px;
            letter-spacing: 0.15em; text-transform: uppercase;
        `;
        bar.innerHTML = `
            <span style="color:var(--text-3);">Цена</span>
            <strong style="font-family:var(--font-display);font-size:24px;color:var(--gold);font-weight:400;">${product.price}</strong>
            <button class="btn btn--primary" type="button" id="product-buy-btn" style="padding:12px 24px;">
                <span class="btn__text">В корзину</span><span class="arrow">→</span>
            </button>
        `;
        document.body.appendChild(bar);

        bar.querySelector('#product-buy-btn').addEventListener('click', () => {
            Cart.add(id);
            const btnText = bar.querySelector('#product-buy-btn .btn__text');
            const orig = btnText.textContent;
            btnText.textContent = '✓ Добавлено';
            setTimeout(() => { btnText.textContent = orig; }, 1500);
        });
    }

    // ============================================
    // 6. ОТЗЫВЫ
    // ============================================
    const REVIEWS = [
        { name: 'Анна К.', date: '15.08.2025', rating: 5, text: 'Холодильник X500 — огонь. Тихий, удобный, дети довольны. Доставили за 2 дня, установили быстро.' },
        { name: 'Игорь П.', date: '03.07.2025', rating: 5, text: 'Купил стиралку W300 для дачи. Работает без нареканий. Мотор тихий, отжим отличный.' },
        { name: 'Мария Л.', date: '22.06.2025', rating: 4, text: 'Мультиварка C400 хорошая, но хотелось бы побольше программ. В остальном — супер.' }
    ];

    function initReviews() {
        if (document.querySelector('.reviews')) return;
        const main = document.querySelector('.main');
        if (!main) return;

        const section = document.createElement('section');
        section.className = 'reviews';
        const avg = (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length).toFixed(1);

        function stars(rating) {
            let html = '';
            for (let i = 1; i <= 5; i++) {
                html += i <= rating
                    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
                    : '<svg class="empty" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
            }
            return html;
        }

        section.innerHTML = `
            <div class="section-head" style="padding:0 0 20px;border:none;">
                <p class="eyebrow">◆ ОТЗЫВЫ</p>
                <div class="reviews__head">
                    <h2 class="section-title" style="font-size:clamp(32px,4vw,56px);">Что говорят<br><em>клиенты</em></h2>
                    <div class="reviews__rating">
                        <strong>${avg}</strong>
                        <div>
                            <div class="reviews__stars">${stars(Math.round(avg))}</div>
                            <p style="font-family:var(--font-mono);font-size:11px;color:var(--text-3);letter-spacing:0.15em;text-transform:uppercase;margin-top:6px;">${REVIEWS.length} отзыва</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="reviews__grid">
                ${REVIEWS.map(r => `
                    <div class="review-card">
                        <div class="review-card__head">
                            <div>
                                <div class="review-card__name">${r.name}</div>
                                <div class="review-card__date">${r.date}</div>
                            </div>
                            <div class="review-card__stars">${stars(r.rating)}</div>
                        </div>
                        <p>${r.text}</p>
                    </div>
                `).join('')}
            </div>
            <form class="reviews__form" id="review-form">
                <h3>Оставить отзыв</h3>
                <div class="star-input" id="star-input">
                    ${[1,2,3,4,5].map(i => `<svg data-star="${i}" viewBox="0 0 24 24" aria-label="${i} из 5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`).join('')}
                </div>
                <div class="field">
                    <label>Имя *</label>
                    <input type="text" name="review-name" required>
                </div>
                <div class="field">
                    <label>Отзыв *</label>
                    <textarea name="review-text" rows="4" required></textarea>
                </div>
                <button type="submit" class="btn btn--primary" style="width:100%;justify-content:center;"><span class="btn__text">Отправить</span></button>
            </form>
        `;

        const footer = document.querySelector('.footer');
        if (footer) main.insertBefore(section, footer);
        else main.appendChild(section);

        let selectedRating = 5;
        const starsEls = section.querySelectorAll('#star-input svg');
        starsEls.forEach(s => {
            s.classList.add('is-active');
            s.addEventListener('click', () => {
                selectedRating = parseInt(s.dataset.star);
                starsEls.forEach((el, i) => el.classList.toggle('is-active', i < selectedRating));
            });
            s.addEventListener('mouseenter', () => {
                const h = parseInt(s.dataset.star);
                starsEls.forEach((el, i) => el.classList.toggle('is-active', i < h));
            });
        });
        section.querySelector('#star-input').addEventListener('mouseleave', () => {
            starsEls.forEach((el, i) => el.classList.toggle('is-active', i < selectedRating));
        });

        section.querySelector('#review-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const form = e.target;
            const name = form.querySelector('[name="review-name"]').value.trim();
            const text = form.querySelector('[name="review-text"]').value.trim();
            if (!name || !text) return;

            const list = JSON.parse(localStorage.getItem('userReviews') || '[]');
            list.push({ name, text, rating: selectedRating, date: new Date().toLocaleDateString('ru-RU') });
            localStorage.setItem('userReviews', JSON.stringify(list));

            form.reset();
            starsEls.forEach(el => el.classList.add('is-active'));
            selectedRating = 5;

            const thanks = document.createElement('p');
            thanks.style.cssText = 'text-align:center;color:var(--gold);font-family:var(--font-mono);font-size:12px;letter-spacing:0.15em;text-transform:uppercase;margin-top:20px;';
            thanks.textContent = '✓ Спасибо! Ваш отзыв добавлен';
            form.appendChild(thanks);
            setTimeout(() => thanks.remove(), 3000);
        });
    }

    // ============================================
    // 7. FAQ
    // ============================================
    const FAQ_DATA = [
        { q: 'Какая гарантия на технику?', a: 'На всю продукцию «ТехноПрестиж» действует гарантия 3 года. На инверторные моторы и компрессоры — 10 лет. Сервисное обслуживание доступно более чем в 100 городах России.' },
        { q: 'Сколько стоит доставка?', a: 'Доставка по Санкт-Петербургу — 500 ₽, по Москве — 800 ₽, в другие регионы — от 1200 ₽. Бесплатно при заказе от 10 000 ₽. Срок — 2–5 дней.' },
        { q: 'Можно ли вернуть товар?', a: 'Да, в течение 14 дней с момента покупки, если товар не был в использовании и сохранена упаковка. Возврат денег — в течение 10 рабочих дней.' },
        { q: 'Есть ли оптовые скидки?', a: 'Да, для офисов, гостиниц, кафе и других корпоративных клиентов действуют скидки от 15%. Возможен договор с отсрочкой платежа.' },
        { q: 'Как связаться с поддержкой?', a: 'Позвоните по номеру 8 (800) 123-45-67 (бесплатно по России), напишите на info@technoprestige.ru или воспользуйтесь чатом на сайте.' }
    ];

    function initFAQ() {
        if (document.querySelector('.faq')) return;
        const main = document.querySelector('.main');
        if (!main) return;

        const section = document.createElement('section');
        section.className = 'faq';
        section.innerHTML = `
            <div class="section-head" style="padding:0;border:none;">
                <p class="eyebrow">◆ ВОПРОСЫ</p>
                <h2 class="section-title" style="font-size:clamp(32px,4vw,56px);">Частые<br><em>вопросы</em></h2>
            </div>
            <div class="faq__list">
                ${FAQ_DATA.map((item, i) => `
                    <div class="faq-item ${i === 0 ? 'is-open' : ''}">
                        <button class="faq-item__q" type="button">
                            <span>${item.q}</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
                        </button>
                        <div class="faq-item__a"><p>${item.a}</p></div>
                    </div>
                `).join('')}
            </div>
        `;

        const footer = document.querySelector('.footer');
        if (footer) main.insertBefore(section, footer);
        else main.appendChild(section);

        section.querySelectorAll('.faq-item__q').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = btn.closest('.faq-item');
                const isOpen = item.classList.contains('is-open');
                section.querySelectorAll('.faq-item').forEach(i => i.classList.remove('is-open'));
                if (!isOpen) item.classList.add('is-open');
            });
        });
    }

    // ============================================
    // 8. NEWSLETTER
    // ============================================
    function initNewsletter() {
        if (document.querySelector('.newsletter')) return;
        const main = document.querySelector('.main');
        if (!main) return;

        const section = document.createElement('section');
        section.className = 'newsletter';
        section.innerHTML = `
            <h3>Будьте в курсе <em style="color:var(--gold);font-style:italic;">новинок</em></h3>
            <p>Подпишитесь на рассылку — получайте скидки и анонсы первыми.</p>
            <form class="newsletter__form" id="newsletter-form">
                <input type="email" placeholder="Ваш email" required aria-label="Email для подписки">
                <button type="submit" class="btn btn--primary"><span class="btn__text">Подписаться</span></button>
            </form>
            <p class="newsletter__success" id="newsletter-success">✓ Спасибо за подписку!</p>
        `;

        const footer = document.querySelector('.footer');
        if (footer) main.insertBefore(section, footer);
        else main.appendChild(section);

        section.querySelector('#newsletter-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const input = e.target.querySelector('input');
            localStorage.setItem('newsletterEmail', input.value);
            input.value = '';
            section.querySelector('#newsletter-success').classList.add('is-visible');
            setTimeout(() => section.querySelector('#newsletter-success').classList.remove('is-visible'), 4000);
        });
    }

    // ============================================
    // 9. CHAT WIDGET
    // ============================================
    function initChat() {
        if (document.querySelector('.chat-widget')) return;

        const w = document.createElement('div');
        w.className = 'chat-widget';
        w.innerHTML = `
            <div class="chat-widget__window" id="chat-window">
                <div class="chat-widget__head">
                    <h4>ТехноПрестиж</h4>
                    <button type="button" id="chat-close" aria-label="Закрыть">×</button>
                </div>
                <div class="chat-widget__body" id="chat-body">
                    <div class="chat-msg chat-msg--bot">Здравствуйте! Чем могу помочь?</div>
                </div>
                <div class="chat-widget__foot">
                    <input type="text" placeholder="Введите сообщение..." id="chat-input" aria-label="Сообщение">
                    <button type="button" id="chat-send" aria-label="Отправить">→</button>
                </div>
            </div>
            <button class="chat-widget__btn" type="button" id="chat-open" aria-label="Открыть чат">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </button>
        `;
        document.body.appendChild(w);

        const win = w.querySelector('#chat-window');
        const body = w.querySelector('#chat-body');
        const input = w.querySelector('#chat-input');

        w.querySelector('#chat-open').addEventListener('click', () => win.classList.toggle('is-open'));
        w.querySelector('#chat-close').addEventListener('click', () => win.classList.remove('is-open'));

        const responses = [
            'Отлично! Уточните, пожалуйста, какой товар вас интересует.',
            'Хорошо, передам ваш вопрос менеджеру.',
            'Спасибо! Мы свяжемся с вами в течение 15 минут.',
            'Могу предложить посмотреть наш каталог — там все актуальные модели.',
            'Понял. Оставьте, пожалуйста, ваш номер телефона.'
        ];

        function send() {
            const text = input.value.trim();
            if (!text) return;
            const userMsg = document.createElement('div');
            userMsg.className = 'chat-msg chat-msg--user';
            userMsg.textContent = text;
            body.appendChild(userMsg);
            input.value = '';
            body.scrollTop = body.scrollHeight;

            setTimeout(() => {
                const botMsg = document.createElement('div');
                botMsg.className = 'chat-msg chat-msg--bot';
                botMsg.textContent = responses[Math.floor(Math.random() * responses.length)];
                body.appendChild(botMsg);
                body.scrollTop = body.scrollHeight;
            }, 800);
        }

        w.querySelector('#chat-send').addEventListener('click', send);
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
    }

    // ============================================
    // 10. SCROLL-TOP С ПРОГРЕССОМ
    // ============================================
    function initScrollTopProgress() {
        if (IS_MOBILE) return;
        let btn = document.querySelector('.scroll-top');
        if (!btn) {
            btn = document.createElement('button');
            btn.className = 'scroll-top';
            btn.setAttribute('aria-label', 'Наверх');
            btn.setAttribute('type', 'button');
            btn.innerHTML = `
                <svg class="scroll-top__svg" viewBox="0 0 48 48" aria-hidden="true">
                    <circle class="scroll-top__track" cx="24" cy="24" r="22"/>
                    <circle class="scroll-top__progress" cx="24" cy="24" r="22"/>
                </svg>
                <span class="scroll-top__bg"></span>
                <span class="scroll-top__arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                </span>
            `;
            document.body.appendChild(btn);
        }

        const progressCircle = btn.querySelector('.scroll-top__progress');
        const CIRC = 2 * Math.PI * 22;

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const top = window.scrollY;
                    const docH = document.documentElement.scrollHeight - window.innerHeight;
                    const percent = docH > 0 ? top / docH : 0;
                    progressCircle.style.strokeDashoffset = CIRC * (1 - percent);
                    if (top > 500) btn.classList.add('is-visible');
                    else btn.classList.remove('is-visible');
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // ============================================
    // 11. PWA
    // ============================================
    function initPWA() {
        if ('serviceWorker' in navigator && location.protocol !== 'file:') {
            window.addEventListener('load', () => {
                const swPath = IN_PRODUCTS_FOLDER ? '../sw.js' : 'sw.js';
                navigator.serviceWorker.register(swPath).catch(() => {});
            });
        }

        let deferredPrompt = null;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            if (sessionStorage.getItem('pwaDismissed') === 'true') return;
            if (document.querySelector('.pwa-install')) return;

            const box = document.createElement('div');
            box.className = 'pwa-install is-visible';
            box.innerHTML = `
                <p>Установить ТЕХНОПРЕСТИЖ как приложение?</p>
                <button type="button" id="pwa-yes">Да</button>
                <button type="button" class="pwa-install__close" id="pwa-no" aria-label="Закрыть">×</button>
            `;
            document.body.appendChild(box);

            box.querySelector('#pwa-yes').addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    await deferredPrompt.userChoice;
                    deferredPrompt = null;
                }
                box.remove();
            });
            box.querySelector('#pwa-no').addEventListener('click', () => {
                sessionStorage.setItem('pwaDismissed', 'true');
                box.remove();
            });
        });
    }

    // ============================================
    // 12. PREFETCH
    // ============================================
    function initPrefetch() {
        if (!('requestIdleCallback' in window)) return;
        const prefetched = new Set();
        document.querySelectorAll('a[href$=".html"], a[href*="?id="]').forEach(link => {
            link.addEventListener('mouseenter', () => {
                const href = link.getAttribute('href');
                if (!href || prefetched.has(href) || href.startsWith('http') || href.startsWith('#')) return;
                prefetched.add(href);
                const l = document.createElement('link');
                l.rel = 'prefetch';
                l.href = href;
                document.head.appendChild(l);
            });
        });
    }

    // ============================================
    // 13. LAZY IMAGES
    // ============================================
    function initLazyImages() {
        document.querySelectorAll('img:not([loading])').forEach(img => {
            img.setAttribute('loading', 'lazy');
        });
    }

    // ============================================
    // 14. SPINNER 3D
    // ============================================
    function initSpinners() {
        document.querySelectorAll('.mini-3d, .carousel-3d, .project-viewer').forEach(el => {
            if (el.querySelector('.mini-3d-loading, .carousel-3d-loading')) return;
            const sp = document.createElement('div');
            sp.className = el.classList.contains('carousel-3d') || el.classList.contains('project-viewer')
                ? 'carousel-3d-loading'
                : 'mini-3d-loading';
            sp.innerHTML = `
                <div class="cube-spinner">
                    <div class="cube-spinner__inner">
                        <div class="cube-spinner__face"></div>
                        <div class="cube-spinner__face"></div>
                        <div class="cube-spinner__face"></div>
                        <div class="cube-spinner__face"></div>
                        <div class="cube-spinner__face"></div>
                        <div class="cube-spinner__face"></div>
                    </div>
                </div>
            `;
            el.style.position = 'relative';
            el.appendChild(sp);
            setTimeout(() => sp.classList.add('is-hidden'), 2000);
        });
    }

    // ============================================
    // 15. СЧЁТЧИКИ +1
    // ============================================
    function bumpCounters() {
        document.querySelectorAll('.metric-card__val [data-count]').forEach(el => {
            const target = parseInt(el.dataset.count, 10);
            if (!target || el.dataset.bumped === 'true') return;
            el.dataset.bumped = 'true';
            setTimeout(() => {
                const newVal = target + 1;
                el.textContent = newVal;
                el.style.transition = 'color 0.5s ease';
                el.style.color = '#E0C27E';
                setTimeout(() => el.style.color = '', 500);
            }, 2500);
        });
    }

    // ============================================
    // 16. SCHEMA.ORG PRODUCT
    // ============================================
    function initSchemaOrg() {
        if (!/product\.html/.test(location.pathname)) return;
        const params = new URLSearchParams(location.search);
        const id = params.get('id');
        if (!id || !window.TECHNOPRESTIGE_DATA) return;
        const p = window.TECHNOPRESTIGE_DATA.products.find(x => x.id === id);
        if (!p) return;

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": p.name,
            "description": p.long,
            "brand": { "@type": "Brand", "name": "ТЕХНОПРЕСТИЖ" },
            "offers": {
                "@type": "Offer",
                "priceCurrency": "RUB",
                "price": p.priceNum,
                "availability": "https://schema.org/InStock"
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "127"
            }
        });
        document.head.appendChild(script);
    }

    // ============================================
    // 17. BREADCRUMBS SCHEMA
    // ============================================
    function initBreadcrumbSchema() {
        const bc = document.querySelector('.breadcrumbs');
        if (!bc) return;
        const items = bc.querySelectorAll('a, .current');
        if (!items.length) return;

        const list = [];
        items.forEach((el, i) => {
            const name = el.textContent.trim();
            let url = location.href;
            if (el.tagName === 'A') {
                try { url = new URL(el.getAttribute('href'), location.href).href; } catch (e) {}
            }
            list.push({ "@type": "ListItem", "position": i + 1, "name": name, "item": url });
        });

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": list
        });
        document.head.appendChild(script);
    }

    // ============================================
    // INIT
    // ============================================
    function initAll() {
        initSpinners();
        initCart();
        initQuickView();
        initGlobalSearch();
        initChat();
        initScrollTopProgress();
        initPWA();
        initPrefetch();
        initLazyImages();
        initSchemaOrg();
        initProductPageCart();
        bumpCounters();
        attachCardButtons();

        const path = location.pathname;
        if (/index\.html$|\/$|about\.html|contacts\.html/.test(path) || path.endsWith('/')) {
            initReviews();
            initFAQ();
            initNewsletter();
        }

        setTimeout(initBreadcrumbSchema, 500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }

    document.addEventListener('contentRendered', () => {
        initSpinners();
        initCart();
        attachCardButtons();
    });
})();
