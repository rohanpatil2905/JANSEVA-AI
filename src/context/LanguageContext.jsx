import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'Hindi' },
    { code: 'mr', label: 'Marathi' },
];

const validCodes = languages.map((lang) => lang.code);

function getInitialLanguage() {
    try {
        const stored = localStorage.getItem('selectedLanguage');
        if (stored && validCodes.includes(stored)) {
            return stored;
        }
    } catch {
        // localStorage unavailable — fall through to default
    }
    return 'en';
}

export function LanguageProvider({ children }) {
    const [selectedLanguage, setSelectedLanguage] = useState(getInitialLanguage);

    const handleSetLanguage = (langCode) => {
        if (!validCodes.includes(langCode)) return;
        setSelectedLanguage(langCode);
        try {
            localStorage.setItem('selectedLanguage', langCode);
        } catch {
            // localStorage unavailable — silently ignore
        }
    };

    return (
        <LanguageContext.Provider
            value={{
                selectedLanguage,
                setSelectedLanguage: handleSetLanguage,
                languages,
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

export default LanguageContext;
