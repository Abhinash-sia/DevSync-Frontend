import { createBrowserRouter, Navigate, useRouteError } from "react-router-dom"
import ProtectedRoute from "../components/routes/ProtectedRoute" // <-- Default
import AppShell from "../components/layout/AppShell" // <-- Default

import LandingPage from "../pages/LandingPage"
import LoginPage from "../pages/LoginPage"
import RegisterPage from "../pages/RegisterPage"
import FeedPage from "../pages/FeedPage"
import ConnectionsPage from "../pages/ConnectionsPage"
import ChatPage from "../pages/ChatPage"
import GigsPage from "../pages/GigsPage"
import ProfilePage from "../pages/ProfilePage"

function RouteErrorBoundary() {
  const error = useRouteError()
  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-4 text-base">
      <div className="w-full max-w-md rounded-[28px] border border-white/8 bg-white/[0.03] p-8 text-center">
        <div className="text-red-400">System Error</div>
        <h2 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-white">
          Something went wrong
        </h2>
        <p className="mt-4 text-sm leading-7 text-white/56">
          {error?.message || "An unexpected error occurred while loading this page."}
        </p>
        <button 
          onClick={() => window.location.href = "/"}
          className="mt-6 rounded-full bg-white/10 px-6 py-2 text-sm font-medium hover:bg-white/20 transition-colors"
        >
          Return Home
        </button>
      </div>
    </div>
  )
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    element: <ProtectedRoute />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: "/app",
        element: <AppShell />,
        children: [
          {
            index: true,
            element: <Navigate to="/app/feed" replace />,
          },
          {
            path: "feed",
            element: <FeedPage />,
          },
          {
            path: "connections",
            element: <ConnectionsPage />,
          },
          {
            path: "chat/:roomId",
            element: <ChatPage />,
          },
          {
            path: "gigs",
            element: <GigsPage />,
          },
          {
            path: "profile",
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
])