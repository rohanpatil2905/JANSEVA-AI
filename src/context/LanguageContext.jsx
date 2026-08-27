import React, { createContext, useContext, useState, useEffect } from 'react';

export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🌐' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
];

const TRANSLATIONS = {
  en: {
    appTitle: 'JanSeva AI',
    tagline: 'AI-Powered Citizen Grievance Redressal & Civic Operations Portal',
    citizenPortal: 'Citizen Portal',
    officerPortal: 'Officer Console',
    submitGrievance: 'Submit Grievance',
    trackStatus: 'Track Grievance',
    myGrievances: 'My Grievances',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    dashboard: 'Dashboard',
    officerDesk: 'Municipal Officer Desk',
  },
  hi: {
    appTitle: 'जनसेवा एआई',
    tagline: 'एआई-संचालित नागरिक शिकायत निवारण एवं नगर निगम प्रणाली',
    citizenPortal: 'नागरिक पोर्टल',
    officerPortal: 'अधिकारी कंसोल',
    submitGrievance: 'शिकायत दर्ज करें',
    trackStatus: 'स्थिति ट्रैक करें',
    myGrievances: 'मेरी शिकायतें',
    login: 'लॉग इन',
    register: 'पंजीकरण',
    logout: 'लॉग आउट',
    dashboard: 'डैशबोर्ड',
    officerDesk: 'अधिकारी पटल',
  },
  mr: {
    appTitle: 'जनसेवा एआय',
    tagline: 'नागरिक तक्रार निवारण आणि महापालिका संचालन पोर्टल',
    citizenPortal: 'नागरिक पोर्टल',
    officerPortal: 'अधिकारी कन्सोल',
    submitGrievance: 'तक्रार नोंदवा',
    trackStatus: 'स्थिती ट्रॅक करा',
    myGrievances: 'माझ्या तक्रारी',
    login: 'लॉगिन',
    register: 'नोंदणी',
    logout: 'लॉगआउट',
    dashboard: 'डॅशबोर्ड',
    officerDesk: 'अधिकारी डेस्क',
  },
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('janseva_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('janseva_lang', language);
  }, [language]);

  const t = (key) => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return langDict[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, languages: LANGUAGES, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
