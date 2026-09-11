import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppLayout } from "@/components/layout/app-layout";
import { OverviewPage } from "@/pages/overview-page";
import { GoalsPage } from "@/pages/goals-page";
import { HomePage } from "@/pages/home-page";
import { NotFoundPage } from "@/pages/not-found-page";
import { PortfolioPage } from "@/pages/portfolio-page";
import { SettingsPage } from "@/pages/settings-page";
import { ActivitiesPage } from "@/pages/activities-page";
import { SupportPage } from "@/pages/support-page";
import { TermsPage } from "@/pages/terms-page";
import { AboutPage } from "@/pages/about-page";
import { UiPlaygroundPage } from "@/pages/ui-playground-page";
import { WalletsPage } from "@/pages/wallets-page";
import { WebsitesPage } from "@/pages/websites-page";
import { SignInPage } from "@/pages/sign-in-page";
import { SignUpPage } from "@/pages/sign-up-page";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { PublicRoute } from "@/components/auth/public-route";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PublicRoute>
        <HomePage />
      </PublicRoute>
    ),
  },
  {
    path: "/sign-in",
    element: (
      <PublicRoute>
        <SignInPage />
      </PublicRoute>
    ),
  },
  {
    path: "/sign-up",
    element: (
      <PublicRoute>
        <SignUpPage />
      </PublicRoute>
    ),
  },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
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
        path: "about",
        element: <AboutPage />,
      },
      {
        path: "support",
        element: <SupportPage />,
      },
      {
        path: "terms",
        element: <TermsPage />,
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
