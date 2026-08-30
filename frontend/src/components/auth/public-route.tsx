import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { LoadingState } from "@/components/ui/loading-state";

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <LoadingState>Loading...</LoadingState>;
  }

  if (isSignedIn) {
    return <Navigate to="/app/overview" replace />;
  }

  return children;
}
