import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import FlowtimeTimer from "@/features/timer/FlowtimeTimer";
import KanbanBoard from "@/features/kanban/KanbanBoard";
import TaskListView from "@/features/kanban/TaskListView";
import { SelectButton } from "primereact/selectbutton";
import { useAppSelector } from "@/hooks/storeHooks";
import StickyNotes from "@/components/notes/StickyNotes";
import CollectionSelector from "@/features/collections/components/CollectionSelector";
import { useTranslation } from "react-i18next";

type DashboardLayout = "A" | "B";

const LAYOUT_STORAGE_KEY = "flowtime.dashboardLayout";

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const [view, setView] = useState<"list" | "kanban">("kanban");
  const [filterDaily, setFilterDaily] = useState(false);
  const [layout, setLayout] = useState<DashboardLayout>("B");

  useEffect(() => {
    const saved = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (saved === "A" || saved === "B") setLayout(saved);
  }, []);

  const changeLayout = (next: DashboardLayout) => {
    setLayout(next);
    window.localStorage.setItem(LAYOUT_STORAGE_KEY, next);
  };

  const viewOptions = [
    { label: t("views.list"), value: 'list', icon: 'pi pi-list' },
    { label: t("views.board"), value: 'kanban', icon: 'pi pi-th-large' }
  ];

  const firstName = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "";
  const hour = new Date().getHours();
  const greetingKey = hour < 12 ? "goodMorning" : hour < 18 ? "goodAfternoon" : "goodEvening";

  const boardContent = view === "list" ? (
    <div className="animate-fade-in">
      <TaskListView filterDaily={filterDaily} />
    </div>
  ) : (
    <div className="animate-fade-in">
      <KanbanBoard filterDaily={filterDaily} />
    </div>
  );

  return (
    <MainLayout>
      <div className="dashboard animate-fade-in">
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-header__greeting">
              {t(`dashboard.${greetingKey}`, { name: firstName })}
            </h1>
            <p className="dashboard-header__summary">{t("dashboard.summary")}</p>
          </div>
          <div className="dashboard-header__actions">
            <CollectionSelector />
            <SelectButton
              value={view}
              onChange={(e) => e.value && setView(e.value)}
              options={viewOptions}
              itemTemplate={(option) => (
                <div className="flex items-center gap-2 px-4 py-1">
                  <i className={option.icon}></i>
                  <span className="text-sm font-medium">{option.label}</span>
                </div>
              )}
              className="custom-switcher"
            />
            <button
              onClick={() => setFilterDaily(!filterDaily)}
              className={`dashboard-daily-filter ${filterDaily ? "dashboard-daily-filter--active" : ""}`}
            >
              <i className="pi pi-replay text-[10px]" />
              <span>{t("views.daily")}</span>
            </button>
            <div className="dashboard-layout-toggle">
              <span className="dashboard-layout-toggle__label">{t("dashboard.layout")}</span>
              <div className="dashboard-layout-toggle__group">
                <button
                  onClick={() => changeLayout("A")}
                  className={`dashboard-layout-toggle__btn ${layout === "A" ? "dashboard-layout-toggle__btn--active" : ""}`}
                >
                  {t("dashboard.panelA")}
                </button>
                <button
                  onClick={() => changeLayout("B")}
                  className={`dashboard-layout-toggle__btn ${layout === "B" ? "dashboard-layout-toggle__btn--active" : ""}`}
                >
                  {t("dashboard.panelB")}
                </button>
              </div>
            </div>
          </div>
        </header>

        {layout === "A" ? (
          <div className="dashboard-variant-a">
            <main className="dashboard-board-area">
              {boardContent}
            </main>
            <aside className="dashboard-focus-panel">
              <FlowtimeTimer variant="panel" />
            </aside>
          </div>
        ) : (
          <>
            <section className="dashboard-focus">
              <FlowtimeTimer variant="bar" />
            </section>
            <main className="dashboard-board">
              {boardContent}
            </main>
          </>
        )}
      </div>

      <StickyNotes />
    </MainLayout>
  );
}
