import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { dialogPt } from '@/utils/dialogStyles';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '@/hooks/storeHooks';
import { closeEditCollectionModal } from '../slices/collectionSlice';
import { useUpdateCollectionMutation } from '../api/collectionsApi';
import { useCollections } from '../hooks/useCollections';
import { COLLECTION_PALETTE } from '@/types/collection';

const EditCollectionModal = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const editingCollectionId = useAppSelector((state) => state.collection.editingCollectionId);
    const { collections } = useCollections();
    const [updateCollection, { isLoading }] = useUpdateCollectionMutation();

    const collection = collections.find((c) => c.id === editingCollectionId) ?? null;

    const [name, setName] = useState('');
    const [color, setColor] = useState(COLLECTION_PALETTE[0]);

    useEffect(() => {
        if (collection) {
            setName(collection.name);
            setColor(collection.color);
        }
    }, [collection]);

    const handleHide = () => dispatch(closeEditCollectionModal());

    const handleSave = async () => {
        const trimmed = name.trim();
        if (!trimmed || !editingCollectionId) return;
        try {
            await updateCollection({ collectionId: editingCollectionId, updates: { name: trimmed, color } }).unwrap();
            handleHide();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Dialog
            header={t("collections.editCollection")}
            visible={Boolean(editingCollectionId)}
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
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        autoFocus
                        className="bg-[#f4f4f7] border-[#ededf2] text-[#1d1d22] focus:border-[#7c6cd4]"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-[#6b6b75] font-medium">{t("collections.color")}</label>
                    <div className="flex items-center gap-2.5">
                        {COLLECTION_PALETTE.map((paletteColor) => (
                            <button
                                key={paletteColor}
                                type="button"
                                onClick={() => setColor(paletteColor)}
                                aria-label={paletteColor}
                                className={`w-7 h-7 rounded-lg transition-transform ${color === paletteColor ? 'ring-2 ring-offset-2 ring-[#7c6cd4] scale-105' : 'hover:scale-105'}`}
                                style={{ background: paletteColor }}
                            />
                        ))}
                    </div>
                </div>
                <Button
                    label={t("common.save")}
                    loading={isLoading}
                    disabled={!name.trim()}
                    onClick={handleSave}
                    className="btn-primary py-2.5"
                />
            </div>
        </Dialog>
    );
};

export default EditCollectionModal;
