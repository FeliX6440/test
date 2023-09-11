import { useUser } from "./UserContext";
import { Navigate } from "react-router-dom";

export function AuthenticatedRoute({ children }) {
  const { user, loading } = useUser();

  if (loading) return null;

  if (user) return children;

  return <Navigate to="/login" replace />;
}
