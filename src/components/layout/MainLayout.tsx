import React, { ReactNode, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { LayoutGrid, Target } from "lucide-react";
import { Menu } from "primereact/menu";
import { useAppSelector, useAppDispatch } from "@/hooks/storeHooks";
import { useLogoutMutation } from "@/features/auth/api/authApi";
import { resetTimer } from "@/features/timer/slices/timerSlice";
import { resetTask } from "@/features/kanban/slices/taskSlice";
import { resetCollection, setSelectedCollectionId, openCreateCollectionModal, openEditCollectionModal } from "@/features/collections/slices/collectionSlice";
import { useCollections } from "@/features/collections/hooks/useCollections";
import { useDeleteCollectionMutation } from "@/features/collections/api/collectionsApi";
import { useGetTasksQuery } from "@/features/kanban/api/tasksApi";
import CreateCollectionModal from "@/features/collections/components/CreateCollectionModal";
import EditCollectionModal from "@/features/collections/components/EditCollectionModal";
import { CollectionDto } from "@/types/collection";
import { MenuItem } from "primereact/menuitem";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import SettingsModal from "@/components/settings/SettingsModal";
import { useTranslation } from "react-i18next";

import { baseApi } from "@/store/api/baseApi";

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
    const { t } = useTranslation();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const menuRef = useRef<Menu>(null);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
    const [logout] = useLogoutMutation();
    const { collections, selectedCollectionId, countTasksInCollection } = useCollections();
    const { data: tasks = [] } = useGetTasksQuery(user?.uid || "", { skip: !user?.uid });
    const [deleteCollection] = useDeleteCollectionMutation();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, isLoading, router]);

    const handleLogout = async () => {
        try {
            await logout().unwrap();
            dispatch(resetTimer());
            dispatch(resetTask());
            dispatch(resetCollection());
            dispatch(baseApi.util.resetApiState());
            router.push("/login");
        } catch (error) {
            console.error(t("auth.logoutFailed"), error);
        }
    };

    const userMenuItems: MenuItem[] = [
        {
            label: t("nav.settings"),
            icon: "pi pi-cog",
            command: () => setSettingsVisible(true)
        },
        {
            label: t("nav.logout"),
            icon: "pi pi-sign-out",
            command: handleLogout
        }
    ];

    if (isLoading || !isAuthenticated) {
        return null;
    }

    const handleDeleteCollection = (collection: CollectionDto) => {
        confirmDialog({
            group: "collection-delete",
            message: `"${collection.name}" ${t("collections.deleteConfirm")}`,
            header: t("collections.deleteHeader"),
            icon: "pi pi-exclamation-triangle",
            acceptClassName: "bg-red-500 text-white border-red-500 px-4 py-2 rounded-lg ml-2",
            rejectClassName: "border border-[#e2e2ea] text-[#6b6b75] px-4 py-2 rounded-lg",
            acceptLabel: t("common.delete"),
            rejectLabel: t("common.cancel"),
            accept: async () => {
                if (collection.id === selectedCollectionId) {
                    const next = collections.find((c) => c.id !== collection.id);
                    dispatch(setSelectedCollectionId(next ? next.id : null));
                }
                try {
                    await deleteCollection({ collectionId: collection.id }).unwrap();
                } catch (error) {
                    console.error(error);
                }
            },
        });
    };

    const navItemClass = (path: string) =>
        `sidebar-nav-item ${router.pathname === path ? "sidebar-nav-item--active" : ""}`;

    const userName = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "";
    const userInitial = userName.charAt(0).toUpperCase();

    return (
        <div className="layout-root">
            <nav className="sidebar">
                <Link href="/" className="sidebar-logo no-underline">
                    <span className="sidebar-logo__mark" />
                    <span className="sidebar-logo__text">{t("common.appName")}</span>
                </Link>

                <div className="sidebar-nav">
                    <Link href="/" className={navItemClass("/")}>
                        <LayoutGrid size={18} strokeWidth={1.8} />
                        <span>{t("nav.home")}</span>
                    </Link>
                    <Link href="/gps" className={navItemClass("/gps")}>
                        <Target size={18} strokeWidth={1.8} />
                        <span>
                            {t("nav.goals")} <span className="sidebar-nav-item__tag">{t("gps.nav")}</span>
                        </span>
                    </Link>
                </div>

                <div className="sidebar-section">
                    <span className="sidebar-section__title">{t("nav.collections")}</span>
                </div>

                <div className="sidebar-collections">
                    {collections.map((collection) => (
                        <div
                            key={collection.id}
                            onClick={() => {
                                dispatch(setSelectedCollectionId(collection.id));
                                if (router.pathname !== "/") router.push("/");
                            }}
                            className={`sidebar-collection ${collection.id === selectedCollectionId ? "sidebar-collection--active" : ""}`}
                        >
                            <span className="sidebar-collection__dot" style={{ background: collection.color }} />
                            <span className="sidebar-collection__name">{collection.name}</span>
                            <span className="sidebar-collection__count">{countTasksInCollection(tasks, collection.id)}</span>
                            <span className="sidebar-collection__actions">
                                <button
                                    type="button"
                                    aria-label={t("collections.editCollection")}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch(openEditCollectionModal(collection.id));
                                    }}
                                    className="sidebar-collection__action"
                                >
                                    <i className="pi pi-pencil" />
                                </button>
                                <button
                                    type="button"
                                    aria-label={t("collections.deleteHeader")}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteCollection(collection);
                                    }}
                                    className="sidebar-collection__action sidebar-collection__action--danger"
                                >
                                    <i className="pi pi-trash" />
                                </button>
                            </span>
                        </div>
                    ))}
                </div>

                <button
                    className="sidebar-add-collection"
                    type="button"
                    onClick={() => dispatch(openCreateCollectionModal())}
                >
                    {t("nav.addCollection")}
                </button>

                <button
                    className="sidebar-user"
                    onClick={(e) => menuRef.current?.toggle(e)}
                    aria-label="User menu"
                    type="button"
                >
                    <span className="sidebar-user__avatar">{userInitial}</span>
                    <span className="sidebar-user__info">
                        <span className="sidebar-user__name">{userName}</span>
                        <span className="sidebar-user__status">{t("nav.focusModeOn")}</span>
                    </span>
                </button>
                <Menu model={userMenuItems} popup ref={menuRef} id="user_menu" />
            </nav>

            <main className="layout-main">
                {children}
            </main>

            <SettingsModal
                visible={settingsVisible}
                onHide={() => setSettingsVisible(false)}
            />

            <CreateCollectionModal />
            <EditCollectionModal />
            <ConfirmDialog group="collection-delete" />
        </div>
    );
};

export default MainLayout;
