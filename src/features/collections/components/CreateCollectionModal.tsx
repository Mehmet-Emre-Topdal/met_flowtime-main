import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { dialogPt } from '@/utils/dialogStyles';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '@/hooks/storeHooks';
import { closeCreateCollectionModal, setSelectedCollectionId } from '../slices/collectionSlice';
import { useCreateCollectionMutation } from '../api/collectionsApi';

const CreateCollectionModal = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const isOpen = useAppSelector((state) => state.collection.isCreateModalOpen);
    const [createCollection, { isLoading }] = useCreateCollectionMutation();
    const [name, setName] = useState('');

    const handleHide = () => {
        dispatch(closeCreateCollectionModal());
        setName('');
    };

    const handleCreate = async () => {
        const trimmed = name.trim();
        if (!trimmed) return;
        try {
            const result = await createCollection({ name: trimmed }).unwrap();
            dispatch(setSelectedCollectionId(result.id));
            handleHide();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Dialog
            header={t("collections.newCollection")}
            visible={isOpen}
            onHide={handleHide}
            className="w-full max-w-md bg-[#ffffff] border border-[#ededf2]"
            pt={dialogPt}
        >
            <div className="flex flex-col gap-5 mt-2">
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-[#6b6b75] font-medium">{t("collections.nameLabel")}</label>
                    <InputText
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        placeholder={t("collections.namePlaceholder")}
                        autoFocus
                        className="bg-[#f4f4f7] border-[#ededf2] text-[#1d1d22] focus:border-[#7c6cd4]"
                    />
                </div>
                <Button
                    label={t("collections.create")}
                    loading={isLoading}
                    disabled={!name.trim()}
                    onClick={handleCreate}
                    className="bg-[#7c6cd4] border-none text-white py-2.5 rounded-lg hover:bg-[#6b59c9] font-medium disabled:opacity-50"
                />
            </div>
        </Dialog>
    );
};

export default CreateCollectionModal;
