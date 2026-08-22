import { useLanguage } from "../context/useLanguage";

function LanguageSelector() {
    const { languages, selectedLanguage, setSelectedLanguage } =
        useLanguage();

    const handleChange = (event) => {
        setSelectedLanguage(event.target.value);
    };

    return (
        <select
            className="language-selector"
            value={selectedLanguage}
            onChange={handleChange}
            aria-label="Select language"
        >
            {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                    {lang.label}
                </option>
            ))}
        </select>
    );
}

export default LanguageSelector;
