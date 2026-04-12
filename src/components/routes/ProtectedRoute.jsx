import { Navigate, Outlet, useLocation } from "react-router-dom"
import { authStore } from "../../stores/authStore"

function RouteLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070909] px-4 text-white">
      <div className="w-full max-w-md rounded-[28px] border border-white/8 bg-white/[0.03] p-8 text-center">
        <div className="text-white/40 uppercase tracking-widest text-xs font-bold mb-4">auth bootstrap</div>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white">
          Restoring session
        </h2>
        <p className="mt-4 text-sm leading-7 text-white/56">
          Checking your account and opening the workspace...
        </p>
      </div>
    </div>
  )
}

export default function ProtectedRoute() { // <-- Back to default export
  const location = useLocation()
  
  const isAuthenticated = authStore((s) => s.isAuthenticated) ?? false
  const isBootstrapping = authStore((s) => s.isBootstrapping) ?? true

  if (isBootstrapping) {
    return <RouteLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}