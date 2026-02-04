function setLanguage(lang) {
    const currentLang = localStorage.getItem('althr_lang') || 'en';
    if (lang === currentLang) return;

    localStorage.setItem('althr_lang', lang);
    applyLanguage(lang);
    updateSelector(lang);
}

function updateSelector(lang) {
    const els = document.querySelectorAll('#current-lang');
    els.forEach(el => el.innerText = lang.toUpperCase());

    // Update HTML lang attribute for accessibility/SEO
    document.documentElement.lang = lang;
}

function applyLanguage(lang) {
    if (!window.translations || !window.translations[lang]) return;
    const dictionary = window.translations[lang];

    // DETERMINISTIC KEY-BASED REPLACEMENT
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dictionary[key]) {
            // Support HTML tags like <br /> in translations
            el.innerHTML = dictionary[key];
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('althr_lang') || 'en';
    updateSelector(savedLang);
    applyLanguage(savedLang);

    // Attach event listeners to all language buttons (CSP-compliant)
    const langButtons = document.querySelectorAll('[data-lang]');
    langButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = btn.getAttribute('data-lang');
            setLanguage(lang);
        });
    });
});
