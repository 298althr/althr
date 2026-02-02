function setLanguage(lang) {
    localStorage.setItem('althr_lang', lang);
    applyLanguage(lang);
    updateSelector(lang);
    // Reload if needed for complex changes, but dynamic is better
    // window.location.reload(); 
}

function updateSelector(lang) {
    const el = document.getElementById('current-lang');
    if (el) el.innerText = lang.toUpperCase();
}

function applyLanguage(lang) {
    if (!window.translations || !window.translations[lang]) return;

    const dictionary = window.translations[lang];

    // 1. Simple data-i18n replacement
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dictionary[key]) {
            el.innerText = dictionary[key];
        }
    });

    // 2. Global Text Replacement (Deep walk)
    // This is more aggressive for when we haven't tagged everything
    if (lang !== 'en') {
        walkAndReplace(document.body, dictionary);
    } else {
        // If switching back to English, we might need a reload or a stored original
        window.location.reload();
    }
}

function walkAndReplace(node, dict) {
    if (node.nodeType === Node.TEXT_NODE) {
        let text = node.textContent.trim();
        if (dict[text]) {
            node.textContent = node.textContent.replace(text, dict[text]);
        }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE') return;
        node.childNodes.forEach(child => walkAndReplace(child, dict));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('althr_lang') || 'en';
    updateSelector(savedLang);
    if (savedLang !== 'en') {
        // Delay slightly for translations.js to be fully ready if needed
        setTimeout(() => applyLanguage(savedLang), 10);
    }
});
