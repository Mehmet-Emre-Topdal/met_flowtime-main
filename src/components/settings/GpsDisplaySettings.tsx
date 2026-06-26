import React from 'react';
import { InputSwitch } from 'primereact/inputswitch';
import { UserConfig } from '@/types/config';
import { useTranslation } from 'react-i18next';

interface GpsDisplaySettingsProps {
    localConfig: UserConfig;
    setLocalConfig: React.Dispatch<React.SetStateAction<UserConfig>>;
}

const GpsDisplaySettings: React.FC<GpsDisplaySettingsProps> = ({ localConfig, setLocalConfig }) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-4">
            <header>
                <h4 className="text-sm font-medium text-[#1d1d22] mb-1">{t("settings.gpsDisplay")}</h4>
                <p className="text-xs text-[#6b6b75]">{t("settings.gpsDisplayDesc")}</p>
            </header>

            <div className="flex items-center justify-between bg-[#f4f4f7] p-3 rounded-lg border border-[#ededf2] px-3">
                <span className="text-sm text-[#1d1d22]">{t("settings.showGpsCounter")}</span>
                <InputSwitch
                    checked={localConfig.showGpsCounter}
                    onChange={(e) => setLocalConfig({ ...localConfig, showGpsCounter: e.value })}
                />
            </div>
        </div>
    );
};

export default GpsDisplaySettings;
