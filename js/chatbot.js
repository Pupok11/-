/* ============================================
   CHATBOT.JS v2 — Умный ассистент ТЕХНОПРЕСТИЖ
   Понимает опечатки, транслит, окончания.
   Правильный скролл (в т.ч. iOS, тач).
   ============================================ */
(function() {
    'use strict';

    /* ============================================================
       1. УДАЛЯЕМ СТАРЫЙ ЧАТ ИЗ features.js
       ============================================================ */
    function removeOldChat() {
        document.querySelectorAll('.chat-widget').forEach(el => {
            if (!el.dataset.newChat) el.remove();
        });
    }
    removeOldChat();
    // На случай, если features.js загрузится позже
    const oldChatObserver = new MutationObserver(() => {
        document.querySelectorAll('.chat-widget').forEach(el => {
            if (!el.dataset.newChat) el.remove();
        });
    });
    oldChatObserver.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => oldChatObserver.disconnect(), 5000);

    /* ============================================================
       2. ПУТИ
       ============================================================ */
    const IN_PRODUCTS = /\/products\//.test(location.pathname);
    const pathTo = (p) => IN_PRODUCTS ? '../' + p : p;

    /* ============================================================
       3. СТИЛИ (включая фикс скролла)
       ============================================================ */
    const style = document.createElement('style');
    style.textContent = `
    /* Окно чата — flex-контейнер с фиксированной высотой */
    .chat-widget__window {
        display: flex !important;
        flex-direction: column !important;
        height: min(560px, 78vh) !important;
        max-height: 78vh !important;
        overflow: hidden !important;
    }
    .chat-widget__head {
        flex-shrink: 0;
        position: relative;
    }
    .chat-widget__head > div {
        display: flex;
        flex-direction: column;
    }
    .chat-widget__head h4 { margin-bottom: 0 !important; }
    .chat-widget__head .chat-status {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-family: var(--font-mono);
        font-size: 9px;
        letter-spacing: 0.15em;
        opacity: 0.85;
        margin-top: 3px;
        text-transform: uppercase;
    }
    .chat-widget__head .chat-status::before {
        content: '';
        width: 6px; height: 6px;
        border-radius: 50%;
        background: #4ade80;
        box-shadow: 0 0 6px #4ade80;
        animation: chatPulse 2s infinite;
    }
    @keyframes chatPulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(0.85); }
    }

    /* Тело чата — скроллится */
    .chat-widget__body {
        flex: 1 1 auto !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        overscroll-behavior: contain !important;
        -webkit-overflow-scrolling: touch !important;
        scroll-behavior: smooth;
        padding: 20px !important;
        max-height: none !important;
        position: relative;
    }
    .chat-widget__body::-webkit-scrollbar { width: 5px; }
    .chat-widget__body::-webkit-scrollbar-track { background: transparent; }
    .chat-widget__body::-webkit-scrollbar-thumb {
        background: var(--border-strong);
        border-radius: 3px;
    }
    .chat-widget__body::-webkit-scrollbar-thumb:hover { background: var(--gold); }

    /* Кнопка «вниз» */
    .chat-scroll-down {
        position: absolute;
        left: 50%;
        bottom: 8px;
        transform: translateX(-50%) translateY(20px);
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--gold);
        color: #fff;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 10;
        box-shadow: 0 4px 12px rgba(199, 160, 111, 0.4);
    }
    .chat-scroll-down.is-visible {
        opacity: 1;
        visibility: visible;
        transform: translateX(-50%) translateY(0);
    }
    .chat-scroll-down:hover { transform: translateX(-50%) translateY(-2px); }
    .chat-scroll-down svg { width: 16px; height: 16px; }
    .chat-scroll-down .chat-scroll-badge {
        position: absolute;
        top: -6px;
        right: -6px;
        min-width: 18px;
        height: 18px;
        padding: 0 5px;
        border-radius: 9px;
        background: #D44A3A;
        color: #fff;
        font-family: var(--font-mono);
        font-size: 9px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: scale(0);
        transition: transform 0.25s ease;
    }
    .chat-scroll-down .chat-scroll-badge.is-visible { transform: scale(1); }

    /* Индикатор печати */
    .chat-typing {
        display: inline-flex;
        gap: 4px;
        padding: 12px 16px;
        background: var(--bg-soft);
        border-radius: 12px 12px 12px 4px;
        margin-bottom: 12px;
        max-width: 60px;
    }
    .chat-typing span {
        width: 6px; height: 6px;
        border-radius: 50%;
        background: var(--text-3);
        animation: chatDot 1.4s infinite;
    }
    .chat-typing span:nth-child(2) { animation-delay: 0.2s; }
    .chat-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes chatDot {
        0%, 60%, 100% { opacity: 0.25; transform: translateY(0); }
        30% { opacity: 1; transform: translateY(-3px); }
    }

    /* Быстрые ответы */
    .chat-quick-replies {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin: 4px 0 12px 0;
    }
    .chat-quick-reply {
        padding: 7px 12px;
        background: transparent;
        border: 1px solid var(--gold);
        color: var(--gold);
        font-family: var(--font-mono);
        font-size: 10px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        cursor: pointer;
        transition: all 0.25s ease;
        border-radius: 14px;
        white-space: nowrap;
    }
    .chat-quick-reply:hover {
        background: var(--gold);
        color: #fff;
    }
    html[data-theme="dark"] .chat-quick-reply:hover { color: #0A0A0A; }

    /* Карточка товара */
    .chat-product {
        margin: 8px 0 12px 0;
        border: 1px solid var(--border);
        background: var(--bg-soft);
        border-radius: 8px;
        overflow: hidden;
        transition: border-color 0.3s ease;
    }
    .chat-product:hover { border-color: var(--gold); }
    .chat-product a {
        display: block;
        padding: 12px 14px;
        text-decoration: none;
        color: var(--text);
    }
    .chat-product__tag {
        font-family: var(--font-mono);
        font-size: 9px;
        letter-spacing: 0.15em;
        color: var(--gold);
        text-transform: uppercase;
        display: block;
        margin-bottom: 4px;
    }
    .chat-product__name {
        font-family: var(--font-display);
        font-size: 16px;
        font-weight: 400;
        margin-bottom: 4px;
    }
    .chat-product__meta {
        font-family: var(--font-mono);
        font-size: 10px;
        color: var(--text-3);
        letter-spacing: 0.05em;
    }
    .chat-product__price {
        font-family: var(--font-display);
        font-size: 16px;
        color: var(--gold);
        margin-top: 6px;
        display: block;
    }

    .chat-msg a { color: var(--gold); text-decoration: underline; }
    .chat-msg strong { color: var(--text); font-weight: 600; }

    /* Бейдж непрочитанных */
    .chat-widget__btn { position: relative; }
    .chat-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        min-width: 20px;
        height: 20px;
        padding: 0 6px;
        border-radius: 10px;
        background: #D44A3A;
        color: #fff;
        font-family: var(--font-mono);
        font-size: 10px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: scale(0);
        transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        border: 2px solid var(--bg);
    }
    .chat-badge.is-visible { transform: scale(1); }

    /* Футер */
    .chat-widget__foot {
        flex-shrink: 0;
        border-top: 1px solid var(--border);
    }

    /* Хинт «печатает…» */
    .chat-hint {
        position: absolute;
        bottom: 78px;
        left: 20px;
        right: 20px;
        font-family: var(--font-mono);
        font-size: 9px;
        color: var(--text-3);
        letter-spacing: 0.1em;
        text-align: center;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    .chat-hint.is-visible { opacity: 0.7; }

    @media (max-width: 1000px) {
        .chat-quick-reply { font-size: 9px; padding: 6px 10px; }
        .chat-widget__window {
            height: min(560px, 82vh) !important;
            max-height: 82vh !important;
        }
    }
    @media (max-width: 480px) {
        .chat-widget__window {
            height: min(500px, 85vh) !important;
            max-height: 85vh !important;
        }
    }
    `;
    document.head.appendChild(style);

    /* ============================================================
       4. НОРМАЛИЗАЦИЯ ТЕКСТА
       ============================================================ */
    function normalize(text) {
        return String(text)
            .toLowerCase()
            .replace(/ё/g, 'е')
            .replace(/[^\wа-я0-9\s]/gi, ' ')
            .replace(/(.)\1{2,}/g, '$1')   // холооооодильник → холодильник
            .replace(/\s+/g, ' ')
            .trim();
    }

    /* Стемминг: срезаем типовые русские окончания */
    const ENDINGS = [
        'ами', 'ями', 'ого', 'его', 'ому', 'ему', 'ыми', 'ими',
        'ать', 'ять', 'ить', 'еть', 'ыть', 'уть', 'ает', 'ают', 'аешь',
        'ой', 'ей', 'ый', 'ий', 'ая', 'яя', 'ое', 'ее', 'ые', 'ие',
        'ов', 'ев', 'ам', 'ям', 'ах', 'ях', 'ом', 'ем', 'ую', 'юю',
        'а', 'я', 'о', 'е', 'у', 'ю', 'ы', 'и', 'й', 'ь'
    ];
    function stem(word) {
        if (word.length < 5) return word;
        for (const end of ENDINGS) {
            if (word.length > end.length + 2 && word.endsWith(end)) {
                return word.slice(0, -end.length);
            }
        }
        return word;
    }

    /* Транслит латиницы в кириллицу (для «holodilnik» → «холодильник») */
    const TRANSLIT_MULTI = [
        ['shch', 'щ'], ['sh', 'ш'], ['ch', 'ч'], ['zh', 'ж'], ['kh', 'х'],
        ['ts', 'ц'], ['yu', 'ю'], ['ya', 'я'], ['yo', 'е'], ['ye', 'е'],
        ['je', 'е'], ['iy', 'ий']
    ];
    const TRANSLIT_SINGLE = {
        'a': 'а', 'b': 'б', 'v': 'в', 'g': 'г', 'd': 'д', 'e': 'е',
        'z': 'з', 'i': 'и', 'y': 'й', 'k': 'к', 'l': 'л', 'm': 'м',
        'n': 'н', 'o': 'о', 'p': 'п', 'r': 'р', 's': 'с', 't': 'т',
        'u': 'у', 'f': 'ф', 'h': 'х', 'c': 'ц', 'q': 'к', 'w': 'в',
        'x': 'кс'
    };
    function translit(text) {
        let r = text;
        for (const [from, to] of TRANSLIT_MULTI) {
            r = r.split(from).join(to);
        }
        r = r.replace(/[a-z]/g, ch => TRANSLIT_SINGLE[ch] || ch);
        return r;
    }

    /* Схожесть через Dice coefficient (по биграммам) */
    function similarity(a, b) {
        if (a === b) return 1;
        if (!a || !b) return 0;
        if (a.length < 2 || b.length < 2) return a === b ? 1 : 0;

        const bigramsA = new Set();
        for (let i = 0; i < a.length - 1; i++) bigramsA.add(a.slice(i, i + 2));
        const bigramsB = new Set();
        for (let i = 0; i < b.length - 1; i++) bigramsB.add(b.slice(i, i + 2));

        let intersection = 0;
        bigramsA.forEach(bi => { if (bigramsB.has(bi)) intersection++; });
        return (2 * intersection) / (bigramsA.size + bigramsB.size);
    }

    /* Проверка: слово похоже на любое из keywords */
    function wordMatches(word, keywords) {
        const stemmed = stem(word);
        for (const kw of keywords) {
            if (word === kw || stemmed === kw) return 1;
            if (word.includes(kw) || kw.includes(word)) {
                if (Math.min(word.length, kw.length) >= 3) return 0.95;
            }
            const score = similarity(stemmed, kw);
            if (score > 0.78) return score;
        }
        return 0;
    }

    /* ============================================================
       5. ХРАНИЛИЩЕ
       ============================================================ */
    const HISTORY_KEY = 'tp_chat_history_v2';
    function loadHistory() {
        try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
        catch (e) { return []; }
    }
    function saveHistory(messages) {
        try {
            // Храним только последние 30 «логических» сообщений (объекты)
            localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-30)));
        } catch (e) {}
    }

    /* ============================================================
       6. УТИЛИТЫ
       ============================================================ */
    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));
    }
    function formatPrice(n) {
        return Number(n).toLocaleString('ru-RU') + ' ₽';
    }
    function getTimeOfDay() {
        const h = new Date().getHours();
        if (h < 5) return 'Доброй ночи';
        if (h < 12) return 'Доброе утро';
        if (h < 18) return 'Добрый день';
        return 'Добрый вечер';
    }
    function getProduct(id) {
        if (!window.TECHNOPRESTIGE_DATA) return null;
        return window.TECHNOPRESTIGE_DATA.products.find(p => p.id === id);
    }
    function getByTag(tag) {
        if (!window.TECHNOPRESTIGE_DATA) return [];
        return window.TECHNOPRESTIGE_DATA.products.filter(p => p.tag === tag);
    }
    function isQuestion(text) {
        return /[?]/.test(text) || /^(как|что|где|когда|почему|зачем|сколько|какой|какая|какие|чей|кто|куда|откуда)/i.test(text);
    }

    /* ============================================================
       7. КАТЕГОРИИ ТОВАРОВ
       ============================================================ */
    const CATEGORIES = [
        { tag: 'ХОЛОДИЛЬНИК',     keywords: ['холодильник', 'холодос', 'холод', 'fridge', 'рефрижератор'] },
        { tag: 'СТИРАЛЬНАЯ МАШИНА', keywords: ['стиральная', 'стиральнаямашина', 'стиралка', 'стирка', 'стиральник', 'машинка', 'washer', 'стирать'] },
        { tag: 'МИКРОВОЛНОВКА',   keywords: ['микроволновка', 'микроволновая', 'микроволноваяпечь', 'свч', 'печь', 'microwave', 'микроволновать'] },
        { tag: 'ПЫЛЕСОС',         keywords: ['пылесос', 'vacuum', 'пылесосить', 'уборка', 'пыль'] },
        { tag: 'БЛЕНДЕР',         keywords: ['блендер', 'blender', 'смузи', 'измельчитель'] },
        { tag: 'МУЛЬТИВАРКА',     keywords: ['мультиварка', 'multicooker', 'мультивар', 'кашеварка'] }
    ];

    function detectCategory(normalizedText, originalText) {
        // Сначала точное совпадение
        for (const cat of CATEGORIES) {
            for (const kw of cat.keywords) {
                if (normalizedText.includes(kw)) return cat.tag;
            }
        }
        // Транслит
        const tr = translit(normalizedText);
        if (tr !== normalizedText) {
            for (const cat of CATEGORIES) {
                for (const kw of cat.keywords) {
                    if (tr.includes(kw)) return cat.tag;
                }
            }
        }
        // Fuzzy по словам
        const words = normalizedText.split(/\s+/).filter(w => w.length >= 4);
        for (const word of words) {
            for (const cat of CATEGORIES) {
                if (wordMatches(word, cat.keywords) > 0) return cat.tag;
            }
        }
        return null;
    }

    /* ============================================================
       8. ИНТЕНТЫ
       ============================================================ */
    const INTENTS = [
        // ============ ПРИВЕТ / ПРОЩАНИЕ / БЛАГОДАРНОСТЬ ============
        {
            id: 'greeting',
            keywords: ['привет', 'здравствуй', 'здравствуйте', 'хай', 'hi', 'hello', 'здаров', 'здрасте', 'приветствую', 'добрый', 'доброе'],
            priority: 1, // низкий, чтобы "привет, сколько стоит" срабатывал по цене
            response: () => ({
                text: `${getTimeOfDay()}! 👋 Я виртуальный ассистент ТЕХНОПРЕСТИЖ. Помогу с выбором, расскажу про цены, доставку, гарантию. С чего начнём?`,
                quickReplies: ['Показать каталог', 'Цены', 'Доставка', 'Гарантия']
            })
        },
        {
            id: 'thanks',
            keywords: ['спасибо', 'благодар', 'спс', 'thanks', 'благодарю', 'пасиб'],
            priority: 1,
            response: () => ({
                text: 'Всегда рад помочь! 😊 Если появятся ещё вопросы — пишите, я на связи 24/7.',
                quickReplies: ['Показать каталог', 'Контакты']
            })
        },
        {
            id: 'bye',
            keywords: ['пока', 'свидания', 'прощай', 'bye', 'бывай', 'до'],
            priority: 1,
            response: () => ({
                text: 'До связи! Если что-то понадобится — возвращайтесь. 👋',
                quickReplies: []
            })
        },

        // ============ ПОМОЩЬ / ВОЗМОЖНОСТИ ============
        {
            id: 'help',
            keywords: ['помощь', 'помоги', 'умеешь', 'можешь', 'работаешь', 'функции', 'возможности', 'help', 'help'],
            priority: 2,
            response: () => ({
                text: 'Я умею отвечать на вопросы про:\n\n• 🔧 Нашу технику и цены\n• 🚚 Доставку и сроки\n• ✅ Гарантию, возврат, сервис\n• 📞 Контакты и режим работы\n• 🏢 Опт, партнёрство, скидки\n• 🛒 Как оформить заказ\n• 🔧 Установку и ремонт\n• 📐 Характеристики товаров\n\nСпросите что угодно — я пойму даже с опечатками 🙂',
                quickReplies: ['Каталог', 'Цены', 'Доставка', 'Гарантия', 'Контакты']
            })
        },

        // ============ ОПЕРАТОР ============
        {
            id: 'human',
            keywords: ['оператор', 'менеджер', 'человек', 'живой', 'позвонить', 'созвониться', 'поговорить', 'связь', 'поддержка'],
            priority: 3,
            response: () => ({
                text: 'Соединяю с живым специалистом 👤\n\n📞 **8 (800) 123-45-67** — бесплатно по России\n✉️ info@technoprestige.ru\n\nПн–Пт 9:00–20:00, Сб 10:00–18:00. Или оставьте заявку — перезвоним за 15 минут.',
                quickReplies: ['Оставить заявку', 'Режим работы']
            })
        },

        // ============ ЦЕНЫ ============
        {
            id: 'price',
            keywords: ['цена', 'цены', 'стоимость', 'стоит', 'сколько', 'прайс', 'почем', 'дешево', 'дорого', 'бюджет'],
            priority: 3,
            response: () => ({
                text: 'Примерные цены на технику ТЕХНОПРЕСТИЖ:\n\n• 🧊 Холодильники — от 45 000 ₽\n• 🧺 Стиральные машины — от 32 000 ₽\n• 📻 Микроволновки — от 8 500 ₽\n• 🌪️ Пылесосы — от 12 000 ₽\n• 🥤 Блендеры — от 4 500 ₽\n• 🍲 Мультиварки — от 6 800 ₽\n\nЧто вас интересует подробнее?',
                quickReplies: ['Холодильник', 'Стиральная машина', 'Мультиварка', 'Показать каталог']
            })
        },

        // ============ ДОСТАВКА ============
        {
            id: 'delivery',
            keywords: ['доставка', 'привезти', 'срок', 'курьер', 'доставить', 'привоз', 'отправка', 'получение', 'самовывоз'],
            priority: 3,
            response: () => ({
                text: '🚚 Доставка по России за **2–5 дней**.\n\n• Санкт-Петербург — 500 ₽\n• Москва — 800 ₽\n• Другие регионы — от 1 200 ₽\n\n✅ **Бесплатно при заказе от 10 000 ₽.**\nКрупногабаритную технику поднимаем на этаж бесплатно.\nЕсть самовывоз со склада в СПб.',
                quickReplies: ['Установка', 'Гарантия', 'Оформить заказ']
            })
        },

        // ============ ГАРАНТИЯ ============
        {
            id: 'warranty',
            keywords: ['гарантия', 'гарантийный', 'сломался', 'поломка', 'не работает', 'брак', 'дефект', 'ремонт'],
            priority: 3,
            response: () => ({
                text: '✅ На всю технику — **гарантия 3 года**.\nНа инверторные моторы и компрессоры — **10 лет**.\n\nБолее 100 сервисных центров по России. Ремонт за 3 дня. Оригинальные запчасти всегда в наличии.',
                quickReplies: ['Сервисные центры', 'Возврат', 'Контакты']
            })
        },

        // ============ ВОЗВРАТ ============
        {
            id: 'return',
            keywords: ['возврат', 'вернуть', 'обмен', 'обменять', 'отказ', 'не подошел'],
            priority: 3,
            response: () => ({
                text: '↩️ Возврат в течение **14 дней** с момента покупки.\n\nУсловия:\n• Товар не использовался\n• Сохранена оригинальная упаковка\n• Есть чек или подтверждение заказа\n\nВозврат денег — за 10 рабочих дней.',
                quickReplies: ['Оформить возврат', 'Контакты']
            })
        },

        // ============ КОНТАКТЫ ============
        {
            id: 'contacts',
            keywords: ['контакты', 'телефон', 'адрес', 'почта', 'email', 'позвонить', 'найти', 'где'],
            priority: 3,
            response: () => ({
                text: '📞 **8 (800) 123-45-67** — бесплатно по РФ\n✉️ info@technoprestige.ru\n📍 Санкт-Петербург, ул. Технологическая, 10\n\n🕒 Пн–Пт: 9:00–20:00\n🕒 Сб: 10:00–18:00\n🕒 Вс: выходной',
                quickReplies: ['Оставить заявку', 'Режим работы']
            })
        },

        // ============ РЕЖИМ РАБОТЫ ============
        {
            id: 'hours',
            keywords: ['режим', 'часы', 'график', 'работает', 'открыт', 'закрыт', 'выходной'],
            priority: 3,
            response: () => ({
                text: '🕒 График работы:\n\n• Пн–Пт: 9:00 – 20:00\n• Сб: 10:00 – 18:00\n• Вс: выходной\n\nЗаявки на сайте и по почте принимаем круглосуточно.',
                quickReplies: ['Контакты', 'Оставить заявку']
            })
        },

        // ============ О КОМПАНИИ ============
        {
            id: 'about',
            keywords: ['компания', 'компании', 'история', 'лет', 'давно', 'завод', 'производство', 'производитель', 'кто'],
            priority: 3,
            response: () => ({
                text: '🏢 ТЕХНОПРЕСТИЖ — российский производитель бытовой техники с **2012 года**.\n\n• Более **60 видов техники**\n• Собственный завод в Ленинградской области с 2021 г.\n• **10 000+ клиентов** по России\n• **100+ сервисных центров**\n• Гарантия 3 года\n\nДелаем технику для российских условий эксплуатации.',
                quickReplies: ['Каталог', 'Контакты', 'Опт']
            })
        },

        // ============ ОПТ / ПАРТНЁРСТВО ============
        {
            id: 'bulk',
            keywords: ['опт', 'оптом', 'оптовый', 'корпоратив', 'b2b', 'партнер', 'партнерство', 'сотрудничество', 'отель', 'гостиница', 'кафе', 'ресторан', 'офис'],
            priority: 3,
            response: () => ({
                text: '🤝 Работаем с корпоративными клиентами:\n\n• Скидки от **15%** при опте\n• Договор с отсрочкой платежа\n• Персональный менеджер\n• Доставка по графику\n• Приоритетный сервис\n\nДля расчёта напишите на info@technoprestige.ru или оставьте заявку.',
                quickReplies: ['Оставить заявку', 'Контакты']
            })
        },

        // ============ СКИДКИ / АКЦИИ ============
        {
            id: 'discount',
            keywords: ['скидка', 'скидки', 'акция', 'акции', 'промокод', 'распродажа', 'дешевле', 'выгодно'],
            priority: 3,
            response: () => ({
                text: '🎁 Актуальные предложения:\n\n• **Бесплатная доставка** от 10 000 ₽\n• Скидки при опте — от **15%**\n• Персональные акции для подписчиков\n\nПодпишитесь на рассылку на главной — анонсы приходят первыми.',
                quickReplies: ['Каталог', 'Оформить заказ']
            })
        },

        // ============ ЗАКАЗ ============
        {
            id: 'order',
            keywords: ['заказ', 'заказать', 'купить', 'оформить', 'приобрести', 'корзина', 'покупка'],
            priority: 3,
            response: () => ({
                text: '🛒 Оформить заказ просто:\n\n1. Откройте карточку товара в каталоге\n2. Нажмите «В корзину»\n3. Перейдите в корзину и оформите\n\nИли оставьте заявку — менеджер свяжется за 15 минут и поможет.',
                quickReplies: ['Показать каталог', 'Оставить заявку']
            })
        },

        // ============ УСТАНОВКА ============
        {
            id: 'install',
            keywords: ['установка', 'монтаж', 'подключение', 'настройка', 'сборка', 'подключить', 'установить'],
            priority: 3,
            response: () => ({
                text: '🔧 Установка и подключение:\n\n• Подключение техники — от **1 500 ₽**\n• Настройка и инструктаж включены\n• Гарантия на монтаж — **1 год**\n• Сертифицированные мастера\n\nМастер приедет в удобное время.',
                quickReplies: ['Оформить установку', 'Контакты']
            })
        },

        // ============ СЕРВИС / РЕМОНТ ============
        {
            id: 'service',
            keywords: ['сервис', 'ремонт', 'починить', 'мастер', 'вызов', 'диагностика', 'сервисный'],
            priority: 3,
            response: () => ({
                text: '🛠 Сервисное обслуживание:\n\n• Ремонт любой сложности\n• Оригинальные запчасти со склада\n• 100+ сервисных центров по РФ\n• Срок ремонта — **3 дня**\n\nГарантийный ремонт — бесплатно. Оставьте заявку или позвоните 8 (800) 123-45-67.',
                quickReplies: ['Оставить заявку', 'Контакты']
            })
        },

        // ============ ЗАПЧАСТИ ============
        {
            id: 'parts',
            keywords: ['запчасти', 'комплектующие', 'детали', 'фильтр', 'насадка', 'щетка'],
            priority: 3,
            response: () => ({
                text: '🔩 Оригинальные запчасти всегда в наличии на складе:\n\n• Фильтры для пылесосов\n• Насадки и щётки\n• Чаши для мультиварок\n• Компрессоры и моторы\n\nЗаказать можно через сервисный центр: 8 (800) 123-45-67.',
                quickReplies: ['Сервисные центры', 'Контакты']
            })
        },

        // ============ ОПЛАТА / РАССРОЧКА ============
        {
            id: 'payment',
            keywords: ['оплата', 'оплатить', 'рассрочка', 'кредит', 'карта', 'наличные', 'перевод', 'предоплата'],
            priority: 3,
            response: () => ({
                text: '💳 Способы оплаты:\n\n• Наличными при получении\n• Картой курьеру\n• Банковский перевод (для юрлиц)\n• Рассрочка от банков-партнёров\n\nДля крупных заказов — отсрочка по договору.',
                quickReplies: ['Оформить заказ', 'Контакты']
            })
        },

        // ============ ГАБАРИТЫ / РАЗМЕРЫ ============
        {
            id: 'dimensions',
            keywords: ['габариты', 'размеры', 'ширина', 'высота', 'глубина', 'вес', 'размер'],
            priority: 3,
            response: () => ({
                text: '📐 Точные габариты, вес и посадочные размеры указаны в карточке каждого товара — в разделе «Характеристики».\n\nОткройте нужный товар в каталоге, чтобы увидеть все параметры.',
                quickReplies: ['Показать каталог', 'Холодильник', 'Стиральная машина']
            })
        },

        // ============ ЭНЕРГОЭФФЕКТИВНОСТЬ / ШУМ ============
        {
            id: 'tech_specs',
            keywords: ['энергоэффективность', 'энергопотребление', 'класс', 'шум', 'громкость', 'децибел', 'мощность', 'потребление'],
            priority: 3,
            response: () => ({
                text: '⚡ Наши модели энергоэффективны:\n\n• Холодильники — класс А++ (220 кВт·ч/год)\n• Стиральные машины — инверторный мотор, тихий режим 52 дБ\n• Все модели — с низким энергопотреблением\n\nТочные характеристики — в карточке каждого товара.',
                quickReplies: ['Показать каталог', 'Гарантия']
            })
        },

        // ============ НАЛИЧИЕ / СРОКИ ============
        {
            id: 'stock',
            keywords: ['наличие', 'есть', 'склад', 'остатки', 'когда', 'будет'],
            priority: 3,
            response: () => ({
                text: '📦 Вся техника в наличии на складе в Санкт-Петербурге.\n\nСроки:\n• Отгрузка — 1 рабочий день\n• Доставка по СПб — 1–2 дня\n• Доставка по РФ — 2–5 дней\n\nЕсли товара нет — привезём под заказ за 7–10 дней.',
                quickReplies: ['Оформить заказ', 'Доставка']
            })
        },

        // ============ СРАВНЕНИЕ / ВЫБОР ============
        {
            id: 'compare',
            keywords: ['сравнить', 'сравнение', 'разница', 'лучше', 'посоветовать', 'порекомендовать', 'подсказать', 'подобрать', 'выбрать', 'выбор'],
            priority: 3,
            response: () => ({
                text: 'Помогу подобрать технику! 🙌\n\nУточните, пожалуйста:\n• Какой тип нужен?\n• Бюджет?\n• Особые пожелания (объём, функции, дизайн)?\n\nИли напишите «Каталог» — там все модели с характеристиками.',
                quickReplies: ['Холодильник', 'Стиральная машина', 'Мультиварка', 'Каталог']
            })
        },

        // ============ ОТЗЫВЫ ============
        {
            id: 'reviews',
            keywords: ['отзыв', 'отзывы', 'мнение', 'рейтинг', 'оценка', 'качество'],
            priority: 3,
            response: () => ({
                text: '⭐ Средний рейтинг — **4.9 из 5** на основе 127+ отзывов.\n\nРеальные отзывы покупателей можно прочитать на странице «Отзывы и FAQ» — там же можно оставить свой.',
                quickReplies: ['Оставить отзыв', 'Каталог']
            })
        },

        // ============ ПОДДЕРЖКА / ОБРАЩЕНИЕ ============
        {
            id: 'support',
            keywords: ['поддержка', 'обращение', 'жалоба', 'проблема', 'вопрос', 'спросить'],
            priority: 3,
            response: () => ({
                text: 'Мы всегда на связи:\n\n📞 **8 (800) 123-45-67** — бесплатно по РФ\n✉️ info@technoprestige.ru\n💬 Чат на сайте — 24/7\n\nСреднее время ответа — 15 минут.',
                quickReplies: ['Оставить заявку', 'Контакты']
            })
        },

        // ============ КАТАЛОГ ============
        {
            id: 'catalog',
            keywords: ['каталог', 'товары', 'ассортимент', 'что есть', 'модели', 'показать', 'посмотреть'],
            priority: 2,
            response: () => ({
                text: 'У нас более 60 видов техники. Что вас интересует?',
                quickReplies: ['Холодильник', 'Стиральная машина', 'Микроволновка', 'Пылесос', 'Блендер', 'Мультиварка']
            })
        }
    ];

    /* ============================================================
       9. ОПРЕДЕЛЕНИЕ ИНТЕНТА
       ============================================================ */
    function detectIntent(normalizedText, originalText) {
        const words = normalizedText.split(/\s+/).filter(w => w.length >= 3);

        // Сначала — категория товара (наивысший приоритет)
        const categoryTag = detectCategory(normalizedText, originalText);
        if (categoryTag) return { id: 'product', tag: categoryTag };

        // Затем — точное вхождение keyword
        const candidates = [];
        for (const intent of INTENTS) {
            for (const kw of intent.keywords) {
                if (normalizedText.includes(kw)) {
                    candidates.push({ intent, score: 1 + (intent.priority || 0) * 0.1 });
                }
            }
        }
        if (candidates.length) {
            candidates.sort((a, b) => b.score - a.score);
            return candidates[0].intent;
        }

        // Fuzzy по словам
        const fuzzyCandidates = [];
        for (const intent of INTENTS) {
            let bestScore = 0;
            for (const word of words) {
                const score = wordMatches(word, intent.keywords);
                if (score > bestScore) bestScore = score;
            }
            if (bestScore > 0.78) {
                fuzzyCandidates.push({ intent, score: bestScore + (intent.priority || 0) * 0.05 });
            }
        }
        if (fuzzyCandidates.length) {
            fuzzyCandidates.sort((a, b) => b.score - a.score);
            return fuzzyCandidates[0].intent;
        }

        // Попробуем через транслит
        const translitText = translit(normalizedText);
        if (translitText !== normalizedText) {
            const trWords = translitText.split(/\s+/).filter(w => w.length >= 3);
            for (const intent of INTENTS) {
                let bestScore = 0;
                for (const word of trWords) {
                    const score = wordMatches(word, intent.keywords);
                    if (score > bestScore) bestScore = score;
                }
                if (bestScore > 0.78) {
                    return intent;
                }
            }
        }

        return null;
    }

    /* ============================================================
       10. ОТВЕТЫ
       ============================================================ */
    function productResponse(tag) {
        const products = getByTag(tag);
        if (!products.length) {
            return {
                text: `У нас есть ${tag.toLowerCase()} в каталоге. Открыть каталог?`,
                quickReplies: ['Показать каталог']
            };
        }

        const p = products[0];
        state.lastCategory = p.id;

        return {
            text: `Вот что у нас есть в категории **${tag}**:`,
            product: p,
            quickReplies: ['Все характеристики', 'Доставка', 'Гарантия', 'Показать каталог']
        };
    }

    function productDetailResponse(productId) {
        const p = getProduct(productId);
        if (!p) return null;
        return {
            text: `**${p.name}** — ${p.price}\n\n${p.long}`,
            product: p,
            quickReplies: ['Доставка', 'Гарантия', 'Оформить заказ', 'Показать каталог']
        };
    }

    function fallbackResponse(text) {
        // Если спрашивают про конкретный товар, о котором говорили — уточняем
        if (state.lastCategory && isQuestion(text)) {
            const detail = productDetailResponse(state.lastCategory);
            if (detail) return detail;
        }

        // Если очень короткий запрос без понимания
        if (text.trim().length < 3) {
            return {
                text: 'Уточните, пожалуйста, вопрос — я постараюсь помочь 🙂',
                quickReplies: ['Каталог', 'Цены', 'Доставка', 'Гарантия', 'Контакты']
            };
        }

        return {
            text: 'Хм, не совсем понял 🤔\n\nЯ лучше всего разбираюсь в:\n• Нашей технике и ценах\n• Доставке и сроках\n• Гарантии и возврате\n• Контактах и режиме работы\n• Опте и партнёрстве\n\nПопробуйте переформулировать или выберите из подсказок:',
            quickReplies: ['Каталог', 'Цены', 'Доставка', 'Гарантия', 'Контакты', 'Опт']
        };
    }

    function buildResponse(userText) {
        const text = String(userText || '').trim();
        if (!text) return { text: 'Напишите вопрос 🙂', quickReplies: [] };
        if (text.length > 1000) return { text: 'Сообщение слишком длинное. Сформулируйте короче 🙂', quickReplies: [] };

        const normalized = normalize(text);
        const intent = detectIntent(normalized, text);

        if (intent && intent.id === 'product') {
            return productResponse(intent.tag);
        }
        if (intent && intent.response) {
            state.lastIntent = intent.id;
            return intent.response();
        }
        return fallbackResponse(text);
    }

    /* ============================================================
       11. СОСТОЯНИЕ
       ============================================================ */
    const state = {
        lastCategory: null,
        lastIntent: null,
        unread: 0,
        opened: false
    };

    /* ============================================================
       12. UI
       ============================================================ */
    const widget = document.createElement('div');
    widget.className = 'chat-widget';
    widget.dataset.newChat = 'true';
    widget.innerHTML = `
        <div class="chat-widget__window" id="chat-window" role="dialog" aria-label="Чат с ассистентом">
            <div class="chat-widget__head">
                <div>
                    <h4>ТехноПрестиж</h4>
                    <span class="chat-status">онлайн</span>
                </div>
                <button type="button" id="chat-close" aria-label="Закрыть">×</button>
            </div>
            <div class="chat-widget__body" id="chat-body" aria-live="polite"></div>
            <button class="chat-scroll-down" id="chat-scroll-down" type="button" aria-label="Вниз">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 5v14M5 12l7 7 7-7"/>
                </svg>
                <span class="chat-scroll-badge" id="chat-scroll-badge">0</span>
            </button>
            <div class="chat-widget__foot">
                <input type="text" placeholder="Введите сообщение..." id="chat-input" aria-label="Сообщение" autocomplete="off" maxlength="500">
                <button type="button" id="chat-send" aria-label="Отправить">→</button>
            </div>
        </div>
        <button class="chat-widget__btn" type="button" id="chat-open" aria-label="Открыть чат">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span class="chat-badge" id="chat-badge">0</span>
        </button>
    `;
    document.body.appendChild(widget);

    const win = widget.querySelector('#chat-window');
    const body = widget.querySelector('#chat-body');
    const input = widget.querySelector('#chat-input');
    const sendBtn = widget.querySelector('#chat-send');
    const badge = widget.querySelector('#chat-badge');
    const scrollDownBtn = widget.querySelector('#chat-scroll-down');
    const scrollBadge = widget.querySelector('#chat-scroll-badge');

    /* ============================================================
       13. ЛОГИЧЕСКАЯ ИСТОРИЯ (для сохранения)
       ============================================================ */
    let chatLog = loadHistory();

    /* ============================================================
       14. АВТОСКРОЛЛ (умный)
       ============================================================ */
    const SCROLL_THRESHOLD = 80;
    function isNearBottom() {
        return body.scrollHeight - body.scrollTop - body.clientHeight < SCROLL_THRESHOLD;
    }
    function scrollToBottom(smooth) {
        if (smooth) {
            body.scrollTo({ top: body.scrollHeight, behavior: 'smooth' });
        } else {
            body.scrollTop = body.scrollHeight;
        }
    }
    function updateScrollButton() {
        const scrolledUp = !isNearBottom();
        const hasContent = body.scrollHeight > body.clientHeight + 40;
        if (scrolledUp && hasContent) {
            scrollDownBtn.classList.add('is-visible');
        } else {
            scrollDownBtn.classList.remove('is-visible');
            // Обнуляем счётчик «новых», если пользователь вернулся вниз
            if (!scrolledUp) {
                state.unreadBelow = 0;
                scrollBadge.classList.remove('is-visible');
                scrollBadge.textContent = '0';
            }
        }
    }
    body.addEventListener('scroll', updateScrollButton, { passive: true });
    scrollDownBtn.addEventListener('click', () => {
        scrollToBottom(true);
        state.unreadBelow = 0;
        scrollBadge.classList.remove('is-visible');
        setTimeout(updateScrollButton, 400);
    });

    /* ============================================================
       15. РЕНДЕР СООБЩЕНИЙ
       ============================================================ */
    function renderMessage(msg) {
        // msg = {role: 'user'|'bot', text, product?, quickReplies?}
        const wrap = document.createElement('div');
        wrap.className = 'chat-msg chat-msg--' + (msg.role === 'user' ? 'user' : 'bot');

        const p = document.createElement('div');
        p.innerHTML = escapeHtml(msg.text)
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        wrap.appendChild(p);

        if (msg.product) {
            const prod = msg.product;
            const box = document.createElement('div');
            box.className = 'chat-product';
            box.innerHTML = `
                <a href="${pathTo(prod.file)}">
                    <span class="chat-product__tag">${escapeHtml(prod.tag)}</span>
                    <div class="chat-product__name">${escapeHtml(prod.name)}</div>
                    <div class="chat-product__meta">${escapeHtml(prod.short)}</div>
                    <span class="chat-product__price">${escapeHtml(prod.price)}</span>
                </a>
            `;
            wrap.appendChild(box);
        }

        if (msg.role === 'bot' && msg.quickReplies && msg.quickReplies.length) {
            const qr = document.createElement('div');
            qr.className = 'chat-quick-replies';
            msg.quickReplies.forEach(text => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'chat-quick-reply';
                btn.textContent = text;
                btn.addEventListener('click', () => {
                    body.querySelectorAll('.chat-quick-replies').forEach(el => el.remove());
                    handleUserMessage(text);
                });
                qr.appendChild(btn);
            });
            wrap.appendChild(qr);
        }

        return wrap;
    }

    function appendMessage(msg, opts) {
        opts = opts || {};
        const wasAtBottom = isNearBottom();
        const el = renderMessage(msg);
        body.appendChild(el);

        // Автоскролл если были внизу или это сообщение пользователя
        if (wasAtBottom || msg.role === 'user') {
            scrollToBottom(!opts.instant);
        } else {
            // Пользователь читает выше — покажем бейдж новых
            state.unreadBelow = (state.unreadBelow || 0) + 1;
            scrollBadge.textContent = state.unreadBelow > 9 ? '9+' : state.unreadBelow;
            scrollBadge.classList.add('is-visible');
        }
        updateScrollButton();
    }

    function appendTyping() {
        const el = document.createElement('div');
        el.className = 'chat-typing';
        el.id = 'chat-typing';
        el.innerHTML = '<span></span><span></span><span></span>';
        const wasAtBottom = isNearBottom();
        body.appendChild(el);
        if (wasAtBottom) scrollToBottom(true);
        return el;
    }

    function persist() {
        saveHistory(chatLog);
    }

    /* ============================================================
       16. ВОССТАНОВЛЕНИЕ ИСТОРИИ
       ============================================================ */
    function restoreHistory() {
        if (!chatLog.length) return false;
        chatLog.forEach(msg => body.appendChild(renderMessage(msg)));
        // Прокручиваем в самый низ, но БЕЗ анимации
        body.scrollTop = body.scrollHeight;
        return true;
    }

    /* ============================================================
       17. ЛОГИКА ДИАЛОГА
       ============================================================ */
    function handleUserMessage(text) {
        const cleanText = String(text || '').trim();
        if (!cleanText) return;

        // Сохраняем сообщение пользователя
        const userMsg = { role: 'user', text: cleanText };
        chatLog.push(userMsg);
        appendMessage(userMsg);

        input.value = '';
        input.focus();

        // Показываем «печатает…»
        const typing = appendTyping();

        const response = buildResponse(cleanText);
        const delay = Math.min(450 + response.text.length * 8, 1600);

        setTimeout(() => {
            typing.remove();
            const botMsg = { role: 'bot', ...response };
            chatLog.push(botMsg);
            persist();
            appendMessage(botMsg);
            playNotificationSound();

            if (!win.classList.contains('is-open')) {
                state.unread++;
                updateBadge();
            }
        }, delay);
    }

    /* ============================================================
       18. БЕЙДЖ И ЗВУК
       ============================================================ */
    function updateBadge() {
        if (state.unread > 0 && !win.classList.contains('is-open')) {
            badge.textContent = state.unread > 9 ? '9+' : state.unread;
            badge.classList.add('is-visible');
        } else {
            badge.classList.remove('is-visible');
        }
    }

    let audioCtx = null;
    function playNotificationSound() {
        const toggle = document.getElementById('sound-toggle');
        const soundEnabled = toggle && toggle.innerHTML.includes('🔊');
        if (!soundEnabled) return;
        try {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') audioCtx.resume();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.12);
            gain.gain.setValueAtTime(0, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.2);
        } catch (e) {}
    }

    /* ============================================================
       19. ПРИВЕТСТВИЕ
       ============================================================ */
    function greetOnce() {
        if (sessionStorage.getItem('tp_chatGreeted') === 'true') return;
        sessionStorage.setItem('tp_chatGreeted', 'true');

        const greeting = {
            role: 'bot',
            text: `${getTimeOfDay()}! Я виртуальный ассистент ТЕХНОПРЕСТИЖ 👋\n\nПомогу подобрать технику, расскажу про доставку и гарантию. Что вас интересует?`,
            quickReplies: ['Каталог', 'Цены', 'Доставка', 'Гарантия', 'Контакты']
        };
        chatLog.push(greeting);
        persist();
        appendMessage(greeting, { instant: true });
    }

    /* ============================================================
       20. ОБРАБОТЧИКИ UI
       ============================================================ */
    widget.querySelector('#chat-open').addEventListener('click', () => {
        const isOpen = win.classList.toggle('is-open');
        state.opened = isOpen;
        if (isOpen) {
            state.unread = 0;
            updateBadge();
            if (!body.children.length) {
                const restored = restoreHistory();
                if (!restored) greetOnce();
            } else {
                setTimeout(() => scrollToBottom(false), 300);
            }
            setTimeout(() => input.focus(), 250);
        }
    });

    widget.querySelector('#chat-close').addEventListener('click', () => {
        win.classList.remove('is-open');
        state.opened = false;
    });

    sendBtn.addEventListener('click', () => handleUserMessage(input.value));
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserMessage(input.value);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && win.classList.contains('is-open')) {
            win.classList.remove('is-open');
            state.opened = false;
        }
    });

    /* ============================================================
       21. БЛОКИРОВКА КОЛЕСА — ЧАТ НЕ ПРОКРУЧИВАЕТ СТРАНИЦУ
       ============================================================ */
    body.addEventListener('wheel', (e) => {
        e.stopPropagation();
    }, { passive: true });

    body.addEventListener('touchmove', (e) => {
        e.stopPropagation();
    }, { passive: true });

    /* ============================================================
       22. КОГДА ПОЛЬЗОВАТЕЛЬ ПЕЧАТАЕТ — ОН ВНИЗУ
       ============================================================ */
    input.addEventListener('input', () => {
        if (state.unreadBelow) {
            state.unreadBelow = 0;
            scrollBadge.classList.remove('is-visible');
        }
    });

    /* ============================================================
       23. ПОДСКАЗКА ЧЕРЕЗ 25 СЕКУНД
       ============================================================ */
    setTimeout(() => {
        if (!state.opened && !sessionStorage.getItem('tp_chatHintShown')) {
            sessionStorage.setItem('tp_chatHintShown', 'true');
            const btn = widget.querySelector('#chat-open');
            btn.style.animation = 'ctaPulse 2s infinite';
            setTimeout(() => { btn.style.animation = ''; }, 6000);
        }
    }, 25000);

    /* ============================================================
       24. ЭКСПОРТ
       ============================================================ */
    window.__openChatbot = () => widget.querySelector('#chat-open').click();
})();