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

// 20 LANGUAGES (keeping your original 10 + adding 10 new)
const languageCodes = [
  // YOUR EXISTING 10:
  'es',      // Spanish
  'fr',      // French
  'de',      // German
  'pt_br',   // Portuguese (Brazil)
  'it',      // Italian
  'ru',      // Russian
  'ja',      // Japanese
  'zh_cn',   // Chinese (Simplified)
  'ar',      // Arabic
  'hi',      // Hindi
  
  // KEEPING THESE (from your original code):
  'ko',      // Korean
  'tr',      // Turkish
  'nl',      // Dutch
  'pl',      // Polish
  'id',      // Indonesian
  'th',      // Thai
  'vi',      // Vietnamese
  'uk',      // Ukrainian
  'ro',      // Romanian ✅ KEPT
  'no',      // Norwegian ✅ KEPT
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
//last successfull 10 lanugages
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

// // ONLY 20 WORKING LANGUAGES (plus en_us = 21 total)
// const languageCodes = [
//   'es', 'fr', 'de', 'pt_br', 'it', 'ru', 'ja', 'zh_cn', 'ar', 'hi',
//   'ko', 'tr', 'nl', 'pl', 'id', 'th', 'vi', 'uk', 'ro', 'no'
// ];

// async function loadAllLanguages() {
//   for (const code of languageCodes) {
//     try {
//       const trans = await loadLang(code);
//       if (trans) {
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
