import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en_us from './locales/en_us.json';

// Dynamic import helper
async function loadLang(code) {
  try {
    const module = await import(`./locales/${code}.json`);
    return module.default;
    /*eslint-disable*/
  } catch (e) {
    console.warn(`Could not load ${code}.json`);
    return null;
  }
}

// Initialize with ONLY English first
const resources = {
  en_us: { translation: en_us }
};

const getUserLanguage = () => {
  const stored = localStorage.getItem('userLanguage');
  if (stored) return stored;
  
  const userData = localStorage.getItem('userData');
  if (userData) {
    try {
      const parsed = JSON.parse(userData);
      if (parsed.language) return parsed.language;
    } catch (e) {}
  }
  
  return 'en_us';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getUserLanguage(),
    fallbackLng: 'en_us',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

i18n.on('languageChanged', (lng) => {
  console.log('✅ Language changed to:', lng);
  localStorage.setItem('userLanguage', lng);
  
  const userData = localStorage.getItem('userData');
  if (userData) {
    try {
      const parsed = JSON.parse(userData);
      parsed.language = lng;
      localStorage.setItem('userData', JSON.stringify(parsed));
    } catch (e) {}
  }
  
  const rtl = ['ar', 'he', 'fa', 'ur'];
  document.documentElement.dir = rtl.includes(lng) ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

// ONLY 20 WORKING LANGUAGES (plus en_us = 21 total)
const languageCodes = [
  'es', 'fr', 'de', 'pt_br', 'it', 'ru', 'ja', 'zh_cn', 'ar', 'hi',
  'ko', 'tr', 'nl', 'pl', 'id', 'th', 'vi', 'uk', 'ro', 'no'
];

async function loadAllLanguages() {
  for (const code of languageCodes) {
    try {
      const trans = await loadLang(code);
      if (trans) {
        i18n.addResourceBundle(code, 'translation', trans, false, false);
        console.log(`✅ Loaded ${code}`);
      }
    } catch (e) {
      console.warn(`❌ Failed to load ${code}`);
    }
  }
}

// Set initial direction
const currentLang = getUserLanguage();
const rtl = ['ar', 'he', 'fa', 'ur'];
document.documentElement.dir = rtl.includes(currentLang) ? 'rtl' : 'ltr';
document.documentElement.lang = currentLang;

// Load translations in background
loadAllLanguages();

export default i18n;
//last workable perfect code
// import i18n from 'i18next';
// import { initReactI18next } from 'react-i18next';
// import en_us from './locales/en_us.json';

// // Dynamic import helper
// async function loadLang(code) {
//   try {
//     const module = await import(`./locales/${code}.json`);
//     return module.default;
//     /*eslint-disable*/
//   } catch (e) {
//     console.warn(`Could not load ${code}.json`);
//     return null;
//   }
// }

// // Initialize with ONLY English first
// const resources = {
//   en_us: { translation: en_us }
// };

// const getUserLanguage = () => {
//   const stored = localStorage.getItem('userLanguage');
//   if (stored) return stored;
  
//   const userData = localStorage.getItem('userData');
//   if (userData) {
//     try {
//       const parsed = JSON.parse(userData);
//       if (parsed.language) return parsed.language;
//     } catch (e) {}
//   }
  
//   return 'en_us';
// };

// i18n
//   .use(initReactI18next)
//   .init({
//     resources,
//     lng: getUserLanguage(),
//     fallbackLng: 'en_us',
//     interpolation: { escapeValue: false },
//     react: { useSuspense: false },
//   });

// i18n.on('languageChanged', (lng) => {
//   console.log('✅ Language changed to:', lng);
//   localStorage.setItem('userLanguage', lng);
  
//   const userData = localStorage.getItem('userData');
//   if (userData) {
//     try {
//       const parsed = JSON.parse(userData);
//       parsed.language = lng;
//       localStorage.setItem('userData', JSON.stringify(parsed));
//     } catch (e) {}
//   }
  
//   const rtl = ['ar', 'he', 'fa', 'ur'];
//   document.documentElement.dir = rtl.includes(lng) ? 'rtl' : 'ltr';
//   document.documentElement.lang = lng;
// });

// // Load all other languages AFTER initialization
// const languageCodes = [
//   'es', 'fr', 'de', 'it', 'pt_br', 'nl', 'pl', 'ru', 'ja', 'ko', 
//   'zh_cn', 'ar', 'hi', 'tr', 'sv', 'da', 'fi', 'no', 'cs', 'hu'
// ];

// async function loadAllLanguages() {
//   for (const code of languageCodes) {
//     try {
//       const trans = await loadLang(code);
//       if (trans) {
//         // Add language WITHOUT overwriting
//         i18n.addResourceBundle(code, 'translation', trans, false, false);
//         console.log(`✅ Loaded ${code}`);
//       }
//     } catch (e) {
//       console.warn(`❌ Failed to load ${code}`);
//     }
//   }
// }

// // Set initial direction
// const currentLang = getUserLanguage();
// const rtl = ['ar', 'he', 'fa', 'ur'];
// document.documentElement.dir = rtl.includes(currentLang) ? 'rtl' : 'ltr';
// document.documentElement.lang = currentLang;

// // Load translations in background
// loadAllLanguages();

// export default i18n;