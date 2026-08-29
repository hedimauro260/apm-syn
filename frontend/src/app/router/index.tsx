import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppLayout } from "@/components/layout/app-layout";
import { OverviewPage } from "@/pages/overview-page";
import { GoalsPage } from "@/pages/goals-page";
import { HomePage } from "@/pages/home-page";
import { NotFoundPage } from "@/pages/not-found-page";
import { PortfolioPage } from "@/pages/portfolio-page";
import { SettingsPage } from "@/pages/settings-page";
import { ActivitiesPage } from "@/pages/activities-page";
import { UiPlaygroundPage } from "@/pages/ui-playground-page";
import { WalletsPage } from "@/pages/wallets-page";
import { WebsitesPage } from "@/pages/websites-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/app",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/app/overview" replace />,
      },
      {
        path: "overview",
        element: <OverviewPage />,
      },
      {
        path: "wallets",
        element: <WalletsPage />,
      },
      {
        path: "activities",
        element: <ActivitiesPage />,
      },
      {
        path: "websites",
        element: <WebsitesPage />,
      },
      {
        path: "goals",
        element: <GoalsPage />,
      },
      {
        path: "portfolio",
        element: <PortfolioPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "ui",
        element: <UiPlaygroundPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
