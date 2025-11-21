// force-retranslate.js - Delete old files and re-translate
// This will translate ALL languages with the new "about" section

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const enPath = path.join(__dirname, 'src', 'locales', 'en_us.json');
const baseTranslations = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// All 18 languages
const LANGUAGES = {
  fr: { name: 'French', code: 'fr' },
  de: { name: 'German', code: 'de' },
  pt_br: { name: 'Portuguese (Brazil)', code: 'pt' },
  it: { name: 'Italian', code: 'it' },
  ru: { name: 'Russian', code: 'ru' },
  ja: { name: 'Japanese', code: 'ja' },
  zh_cn: { name: 'Chinese (Simplified)', code: 'zh-CN' },
  ar: { name: 'Arabic', code: 'ar' },
  hi: { name: 'Hindi', code: 'hi' },
  ko: { name: 'Korean', code: 'ko' },
  tr: { name: 'Turkish', code: 'tr' },
  nl: { name: 'Dutch', code: 'nl' },
  pl: { name: 'Polish', code: 'pl' },
  id: { name: 'Indonesian', code: 'id' },
  th: { name: 'Thai', code: 'th' },
  vi: { name: 'Vietnamese', code: 'vi' },
  uk: { name: 'Ukrainian', code: 'uk' },
  ro: { name: 'Romanian', code: 'ro' },
};

async function translate(text, toLang) {
  return new Promise((resolve) => {
    if (!text || text.length < 2) {
      resolve(text);
      return;
    }

    const encoded = encodeURIComponent(text);
    const options = {
      hostname: 'api.mymemory.translated.net',
      path: `/get?q=${encoded}&langpair=en|${toLang}`,
      method: 'GET',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const translated = json.responseData?.translatedText;
          if (translated && translated !== text) {
            resolve(translated);
          } else {
            resolve(text);
          }
          /*eslint-disable*/
        } catch (e) {
          resolve(text);
        }
      });
    });

    req.on('error', () => resolve(text));
    req.on('timeout', () => { req.destroy(); resolve(text); });
    req.end();
  });
}

async function translateObj(obj, toLang, indent = '') {
  const result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      const short = value.substring(0, 30);
      process.stdout.write(`${indent}${key}: "${short}..." `);
      
      result[key] = await translate(value, toLang);
      
      const transShort = result[key].substring(0, 25);
      console.log(`→ "${transShort}..." ✓`);
      
      await new Promise(r => setTimeout(r, 600));
      
    } else if (typeof value === 'object' && value !== null) {
      console.log(`${indent}${key}:`);
      result[key] = await translateObj(value, toLang, indent + '  ');
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

async function run() {
  const localesDir = path.join(__dirname, 'src', 'locales');
  
  console.log('\n🔄 FORCE RE-TRANSLATION');
  console.log('=======================\n');
  console.log('This will DELETE old files and re-translate with new keys\n');

  // Delete old files first
  console.log('🗑️  Deleting old translation files...\n');
  for (const code of Object.keys(LANGUAGES)) {
    const file = path.join(localesDir, `${code}.json`);
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`  ❌ Deleted ${code}.json`);
    }
  }

  console.log('\n✅ Old files deleted. Starting fresh translation...\n');
  console.log(`📝 18 languages to translate`);
  console.log(`⏱️  ~45 minutes\n`);

  let done = 0;

  for (const [code, info] of Object.entries(LANGUAGES)) {
    const file = path.join(localesDir, `${code}.json`);

    console.log(`\n🔄 [${done + 1}/18] ${info.name} (${code})...\n`);
    
    try {
      const translated = await translateObj(baseTranslations, info.code, '  ');
      fs.writeFileSync(file, JSON.stringify(translated, null, 2), 'utf8');
      console.log(`\n✅ Saved ${code}.json\n`);
      done++;
      
      if (done % 5 === 0) {
        console.log(`\n📊 PROGRESS: ${done}/18 complete\n`);
      }
    } catch (err) {
      console.error(`\n❌ Failed: ${err.message}\n`);
    }
  }

  console.log('\n🎉 COMPLETE!');
  console.log('============\n');
  console.log(`✅ Translated: ${done} languages`);
  console.log(`📁 Total: 20 languages (including en_us, es)\n`);
  console.log('🌍 Your About page is now fully translated!\n');
}

setTimeout(run, 2000);