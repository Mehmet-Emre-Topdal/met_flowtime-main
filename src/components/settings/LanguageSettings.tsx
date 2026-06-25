import React from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '@/lib/i18n';

const LanguageSettings: React.FC = () => {
    const { t, i18n } = useTranslation();

    return (
        <div className="flex flex-col gap-3">
            <header>
                <h4 className="text-sm font-medium text-[#1d1d22] mb-1">{t("settings.language")}</h4>
                <p className="text-xs text-[#6b6b75]">{t("settings.languageDesc")}</p>
            </header>
            <div className="flex gap-2">
                <button
                    onClick={() => changeLanguage('tr')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-medium transition-all duration-200
                        ${i18n.language === 'tr'
                            ? 'bg-[#7c6cd4]/10 border-[#7c6cd4]/30 text-[#7c6cd4]'
                            : 'bg-transparent border-[#ededf2] text-[#6b6b75] hover:border-[#e2e2ea] hover:text-[#9494a0]'
                        }`}
                >
                    <span className="text-base">🇹🇷</span>
                    <span>Türkçe</span>
                </button>
                <button
                    onClick={() => changeLanguage('en')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-medium transition-all duration-200
                        ${i18n.language === 'en'
                            ? 'bg-[#7c6cd4]/10 border-[#7c6cd4]/30 text-[#7c6cd4]'
                            : 'bg-transparent border-[#ededf2] text-[#6b6b75] hover:border-[#e2e2ea] hover:text-[#9494a0]'
                        }`}
                >
                    <span className="text-base">🇬🇧</span>
                    <span>English</span>
                </button>
            </div>
        </div>
    );
};

export default LanguageSettings;
