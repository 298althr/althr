function setLanguage(lang) {
    console.log('Setting language to:', lang);
    localStorage.setItem('althr_lang', lang);
    applyLanguage(lang);
    updateSelector(lang);
}

function updateSelector(lang) {
    const els = document.querySelectorAll('#current-lang');
    els.forEach(el => {
        el.innerText = lang.toUpperCase();
    });

    // Update HTML lang attribute for accessibility/SEO
    document.documentElement.lang = lang;
}

function applyLanguage(lang) {
    console.log('Applying language:', lang);
    if (!window.translations || !window.translations[lang]) {
        console.warn('Translations not found for language:', lang);
        return;
    }
    const dictionary = window.translations[lang];

    // DETERMINISTIC KEY-BASED REPLACEMENT
    const elements = document.querySelectorAll('[data-i18n]');
    console.log('Found', elements.length, 'i18n elements');

    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dictionary[key]) {
            // Support HTML tags like <br /> in translations
            el.innerHTML = dictionary[key];
        }
    });
}

function initI18n() {
    console.log('Initializing i18n...');
    const savedLang = localStorage.getItem('althr_lang') || 'en';
    updateSelector(savedLang);
    applyLanguage(savedLang);
}

// Global click listener for language buttons (supports dynamic content)
document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-lang]');
    if (btn) {
        e.preventDefault();
        const lang = btn.getAttribute('data-lang');
        setLanguage(lang);
    }
});

// Run on DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n);
} else {
    initI18n();
}

// In case translations.js is loaded with defer or async, or just late
window.addEventListener('load', () => {
    const savedLang = localStorage.getItem('althr_lang') || 'en';
    if (window.translations && window.translations[savedLang]) {
        applyLanguage(savedLang);
    }
});
