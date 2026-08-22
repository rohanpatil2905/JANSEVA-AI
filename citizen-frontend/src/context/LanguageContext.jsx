import { useState } from "react";
import { LanguageContext } from "./useLanguage";
import en from "../translations/en";
import hi from "../translations/hi";
import mr from "../translations/mr";

const languages = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "mr", label: "Marathi" },
];

const validCodes = languages.map((lang) => lang.code);
const translations = { en, hi, mr };

function getTranslation(dictionary, key) {
  return key.split(".").reduce((value, part) => value?.[part], dictionary) || key;
}

function getInitialLanguage() {
  try {
    const stored = localStorage.getItem("selectedLanguage");
    if (stored && validCodes.includes(stored)) {
      return stored;
    }
  } catch {
    // localStorage unavailable — fall through to default
  }
  return "en";
}

export function LanguageProvider({ children }) {
  const [selectedLanguage, setSelectedLanguage] = useState(getInitialLanguage);

  const handleSetLanguage = (langCode) => {
    if (!validCodes.includes(langCode)) return;
    setSelectedLanguage(langCode);
    try {
      localStorage.setItem("selectedLanguage", langCode);
    } catch {
      // localStorage unavailable — silently ignore
    }
  };

  const t = (key) => getTranslation(translations[selectedLanguage], key);

  return (
    <LanguageContext.Provider
      value={{
        selectedLanguage,
        setSelectedLanguage: handleSetLanguage,
        languages,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export default LanguageProvider;