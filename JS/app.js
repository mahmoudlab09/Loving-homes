(function () {
  const storage = {
    get(k, fallback) {
      try { return localStorage.getItem(k) ?? fallback; } catch { return fallback; }
    },
    set(k, v) {
      try { localStorage.setItem(k, v); } catch {}
    }
  };

  const root = document.documentElement;

  const themeBtn = document.querySelector('[data-action="toggle-theme"]');
  const langBtn  = document.querySelector('[data-action="toggle-lang"]');
  const fontBtn  = document.querySelector('[data-action="toggle-font"]');

  const dict = window.I18N || {};

  function t(key) {
    const lang = storage.get('lang', 'ar');
    return (dict[lang] && dict[lang][key]) ? dict[lang][key] : null;
  }

  function applyTranslations(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = (dict[lang] && dict[lang][key]) ? dict[lang][key] : null;
      if (val !== null) {
        if (el.hasAttribute('data-i18n-html')) el.innerHTML = val;
        else el.textContent = val;
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = (dict[lang] && dict[lang][key]) ? dict[lang][key] : null;
      if (val !== null) el.setAttribute('placeholder', val);
    });

    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      const spec = el.getAttribute('data-i18n-attr') || '';
      spec.split(';').map(s => s.trim()).filter(Boolean).forEach(pair => {
        const parts = pair.split(':');
        const attr = (parts[0] || '').trim();
        const key  = (parts[1] || '').trim();
        if (!attr || !key) return;

        const val = (dict[lang] && Object.prototype.hasOwnProperty.call(dict[lang], key))
          ? dict[lang][key]
          : null;

        if (val !== null) el.setAttribute(attr, val);
      });
    });
  }

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    storage.set('theme', theme);

    if (themeBtn) {
      themeBtn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');

      const sp = themeBtn.querySelector('span');
      if (sp) {
        sp.setAttribute('data-i18n', theme === 'dark' ? 'lightMode' : 'darkMode');
        applyTranslations(root.lang);
      }
    }
  }

  function setLang(lang) {
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';

    document.body.classList.toggle('rtl', lang === 'ar');
    document.body.classList.toggle('ltr', lang !== 'ar');

    storage.set('lang', lang);

    applyTranslations(lang);

    const titleKey = document.body.getAttribute('data-title-key');
    if (titleKey && dict[lang] && dict[lang][titleKey]) {
      document.title = dict[lang][titleKey] + " | " + (t("brandName") || "Loving Homes");
    }

    if (langBtn) {
      langBtn.setAttribute('aria-pressed', lang === 'ar' ? 'true' : 'false');
      const sp = langBtn.querySelector('span');
      if (sp) {
        sp.setAttribute('data-i18n', lang === "ar" ? "switchToEnglish" : "switchToArabic");
        applyTranslations(lang);
      }
    }
  }

  function setFontScale(scale) {
    root.style.fontSize = scale === 'lg' ? '18px' : '16px';
    storage.set('font', scale);

    if (fontBtn) {
      fontBtn.setAttribute('aria-pressed', scale === 'lg' ? 'true' : 'false');

      const sp = fontBtn.querySelector("span");
      if (sp) {
        sp.setAttribute('data-i18n', scale === 'lg' ? 'decreaseText' : 'increaseText');
        applyTranslations(root.lang);
      }
    }
  }

  const path = location.pathname.split('/').pop();
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.setAttribute('aria-current', 'page');
    }
  });

  const savedTheme = storage.get('theme', null);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

  const savedLang = storage.get('lang', 'ar');
  setLang(savedLang);

  const savedFont = storage.get('font', 'md');
  setFontScale(savedFont);

  themeBtn && themeBtn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next);
  });

  langBtn && langBtn.addEventListener('click', () => {
    const next = root.lang === 'ar' ? 'en' : 'ar';
    setLang(next);
  });

  fontBtn && fontBtn.addEventListener('click', () => {
    const next = storage.get('font', 'md') === 'lg' ? 'md' : 'lg';
    setFontScale(next);
  });

  const form = document.querySelector('#contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const data = Object.fromEntries(new FormData(form).entries());
      const required = ['name', 'email', 'message'];
      const missing = required.filter(k => !String(data[k] || '').trim());

      const out = document.querySelector('#formResult');
      if (!out) return;

      if (missing.length) {
        out.textContent = root.lang === 'ar'
          ? 'يرجى تعبئة الحقول المطلوبة.'
          : 'Please fill in the required fields.';
        out.classList.remove('ok');
        return;
      }

      out.textContent = root.lang === 'ar'
        ? 'تم استلام رسالتك. سنرد عليك قريبًا.'
        : 'We received your message. We will reply soon.';
      out.classList.add('ok');
      form.reset();
    });
  }
})();