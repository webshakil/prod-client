import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Search, Check } from 'lucide-react';

// ONLY 20 WORKING LANGUAGES
const LANGUAGES = [
  { code: 'en_us', name: 'English (US)', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'pt_br', name: 'Portuguese (Brazil)', flag: '🇧🇷' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'zh_cn', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  const currentLanguage = LANGUAGES.find(lang => lang.code === i18n.language) || LANGUAGES[0];

  const filteredLanguages = LANGUAGES.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const changeLanguage = async (languageCode) => {
    try {
      await i18n.changeLanguage(languageCode);
      localStorage.setItem('userLanguage', languageCode);
      setIsOpen(false);
      setSearchQuery('');
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="hidden sm:inline">{currentLanguage.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search languages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                  lang.code === i18n.language ? 'bg-indigo-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{lang.flag}</span>
                  <span className={`${lang.code === i18n.language ? 'font-semibold text-indigo-600' : 'text-gray-700'}`}>
                    {lang.name}
                  </span>
                </div>
                {lang.code === i18n.language && (
                  <Check className="w-4 h-4 text-indigo-600" />
                )}
              </button>
            ))}
          </div>

          <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 text-center">
            21 languages available
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
//last workable perfect code
// import React, { useState, useEffect, useRef } from 'react';
// import { useTranslation } from 'react-i18next';
// import { ChevronDown, Search, Check } from 'lucide-react';

// // FIRST 20 LANGUAGES ONLY
// const LANGUAGES = [
//   { code: 'en_us', name: 'English (US)', flag: '🇺🇸' },
//   { code: 'es', name: 'Spanish', flag: '🇪🇸' },
//   { code: 'fr', name: 'French', flag: '🇫🇷' },
//   { code: 'de', name: 'German', flag: '🇩🇪' },
//   { code: 'it', name: 'Italian', flag: '🇮🇹' },
//   { code: 'pt_br', name: 'Portuguese (Brazil)', flag: '🇧🇷' },
//   { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
//   { code: 'pl', name: 'Polish', flag: '🇵🇱' },
//   { code: 'ru', name: 'Russian', flag: '🇷🇺' },
//   { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
//   { code: 'ko', name: 'Korean', flag: '🇰🇷' },
//   { code: 'zh_cn', name: 'Chinese (Simplified)', flag: '🇨🇳' },
//   { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
//   { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
//   { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
//   { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
//   { code: 'da', name: 'Danish', flag: '🇩🇰' },
//   { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
//   { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
//   { code: 'cs', name: 'Czech', flag: '🇨🇿' },
//   { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
// ];

// const LanguageSelector = () => {
//   const { i18n } = useTranslation();
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const dropdownRef = useRef(null);

//   const currentLanguage = LANGUAGES.find(lang => lang.code === i18n.language) || LANGUAGES[0];

//   const filteredLanguages = LANGUAGES.filter(lang =>
//     lang.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const changeLanguage = async (languageCode) => {
//     try {
//       await i18n.changeLanguage(languageCode);
//       localStorage.setItem('userLanguage', languageCode);
//       setIsOpen(false);
//       setSearchQuery('');
//     } catch (error) {
//       console.error('Failed to change language:', error);
//     }
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsOpen(false);
//         setSearchQuery('');
//       }
//     };

//     if (isOpen) {
//       document.addEventListener('mousedown', handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [isOpen]);

//   return (
//     <div className="relative" ref={dropdownRef}>
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
//       >
//         <span className="text-lg">{currentLanguage.flag}</span>
//         <span className="hidden sm:inline">{currentLanguage.name}</span>
//         <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
//       </button>

//       {isOpen && (
//         <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
//           <div className="p-3 border-b border-gray-200">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search languages..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 autoFocus
//               />
//             </div>
//           </div>

//           <div className="max-h-96 overflow-y-auto">
//             {filteredLanguages.map((lang) => (
//               <button
//                 key={lang.code}
//                 onClick={() => changeLanguage(lang.code)}
//                 className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
//                   lang.code === i18n.language ? 'bg-indigo-50' : ''
//                 }`}
//               >
//                 <div className="flex items-center gap-3">
//                   <span className="text-lg">{lang.flag}</span>
//                   <span className={`${lang.code === i18n.language ? 'font-semibold text-indigo-600' : 'text-gray-700'}`}>
//                     {lang.name}
//                   </span>
//                 </div>
//                 {lang.code === i18n.language && (
//                   <Check className="w-4 h-4 text-indigo-600" />
//                 )}
//               </button>
//             ))}
//           </div>

//           <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 text-center">
//             20 languages available
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LanguageSelector;
