import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/useLanguage";

const nativeNames = {
    en: "English",
    hi: "हिन्दी",
    mr: "मराठी",
};

function Language() {
    const { languages, selectedLanguage, setSelectedLanguage, t } =
        useLanguage();

    const navigate = useNavigate();

    const handleContinue = () => {
        navigate("/");
    };

    return (
        <main className="language-page">
            <section className="language-card">

                <h1>{t("language.choose")}</h1>

                <p className="language-subtext">
                    Select your preferred language to continue
                </p>

                <div
                    className="language-options"
                    role="radiogroup"
                    aria-label="Language selection"
                >
                    {languages.map((lang) => {
                        const isActive =
                            selectedLanguage === lang.code;

                        return (
                            <button
                                key={lang.code}
                                type="button"
                                role="radio"
                                aria-checked={isActive}
                                className={
                                    "language-option" +
                                    (isActive
                                        ? " language-option-active"
                                        : "")
                                }
                                onClick={() =>
                                    setSelectedLanguage(lang.code)
                                }
                            >
                                <span className="language-name">
                                    {lang.label}
                                </span>

                                <span className="language-native">
                                    {nativeNames[lang.code]}
                                </span>

                                {isActive && (
                                    <span className="language-check">
                                        ✓
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <button
                    type="button"
                    className="language-continue"
                    onClick={handleContinue}
                >
                    {t("language.continue")}
                </button>

            </section>
        </main>
    );
}

export default Language;