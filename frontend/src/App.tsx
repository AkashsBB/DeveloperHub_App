import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/Home";
import SignUpPage from "./pages/Signup";
import LoginPage from "./pages/Login";
import CommunitiesPage from "./pages/Communities";
import Navbar from "./components/Navbar";
import BrowseCommunities from "./pages/BrowseCommunities";
import CommunitySection from "./pages/CommunitySection";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import "./index.css";

interface RouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<RouteProps> = ({ children, requiredRole }) => {
  const { user, checkingAuth } = useAuthStore();
  const location = useLocation();

  if (checkingAuth) return null; // Wait for auth check

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<RouteProps> = ({ children }) => {
  const { user, checkingAuth } = useAuthStore();
  const location = useLocation();

  if (checkingAuth) return null;

  if (user) {
    const from = location.state?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const { checkAuth, checkingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth(); // Single auth check on mount
  }, [checkAuth]);

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/communities" element={
            <ProtectedRoute>
              <CommunitiesPage />
            </ProtectedRoute>
          } />
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
              <SignUpPage />
            </PublicRoute>
          } />
          <Route path="/browse-communities" element={
            <ProtectedRoute>
              <BrowseCommunities />
            </ProtectedRoute>
          } />
          <Route path="/community/:communityId" element={
            <ProtectedRoute>
              <CommunitySection />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;