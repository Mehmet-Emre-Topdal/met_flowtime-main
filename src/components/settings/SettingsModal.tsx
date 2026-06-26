import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useAppSelector, useAppDispatch } from '@/hooks/storeHooks';
import { updateConfig } from '@/features/timer/slices/timerSlice';
import { useUpdateUserConfigMutation } from '@/features/timer/api/timerApi';
import { UserConfig } from '@/types/config';
import { useTranslation } from 'react-i18next';
import { dialogPt } from '@/utils/dialogStyles';
import LanguageSettings from './LanguageSettings';
import FlowIntervalsSettings from './FlowIntervalsSettings';

interface SettingsModalProps {
    visible: boolean;
    onHide: () => void;
}

const SettingsModal = ({ visible, onHide }: SettingsModalProps) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { config } = useAppSelector((state) => state.timer);
    const { user } = useAppSelector((state) => state.auth);
    const [updateUserConfig, { isLoading: isUpdating }] = useUpdateUserConfigMutation();
    const [localConfig, setLocalConfig] = useState<UserConfig>(config);

    useEffect(() => {
        if (visible) setLocalConfig(config);
    }, [visible, config]);

    const handleSave = async () => {
        dispatch(updateConfig(localConfig));
        if (user?.uid) {
            try {
                await updateUserConfig({ uid: user.uid, config: localConfig }).unwrap();
            } catch (err) {
                console.error("Failed to sync config to Firebase:", err);
            }
        }
        onHide();
    };

    return (
        <Dialog
            header={t("settings.title")}
            visible={visible}
            onHide={onHide}
            className="w-full max-w-2xl bg-[#ffffff] border border-[#ededf2]"
            pt={dialogPt}
            footer={
                <div className="flex justify-end gap-3">
                    <Button label={t("common.cancel")} onClick={onHide} className="p-button-text text-[#6b6b75] hover:text-[#9494a0]" />
                    <Button
                        label={isUpdating ? t("common.loading") : t("settings.saveChanges")}
                        onClick={handleSave}
                        disabled={isUpdating}
                        className="btn-primary px-5"
                    />
                </div>
            }
        >
            <div className="flex flex-col gap-6 mt-2">
                <LanguageSettings />

                <div className="h-px bg-[#ededf2]" />

                <FlowIntervalsSettings localConfig={localConfig} setLocalConfig={setLocalConfig} />
            </div>
        </Dialog>
    );
};

export default SettingsModal;
