import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginPage } from "./components/LoginPage";
import { SignUpPage } from "./components/SignUpPage";
import { StudentDashboard } from "./components/StudentDashboard";
import { StaffDashboard } from "./components/StaffDashboard";
import { HODDashboard } from "./components/HODDashboard";
import { GeneralDashboard } from "./components/GeneralDashboard";

type Page = "login" | "signup";
type DashboardView = "role-specific" | "general";

function AppContent() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>("login");
  const [dashboardView, setDashboardView] = useState<DashboardView>("role-specific");

  const handleLoginSuccess = () => {
    // Navigation is handled by checking user state
  };

  const handleSignupSuccess = () => {
    // Navigation is handled by checking user state
  };

  const handleLogout = () => {
    setCurrentPage("login");
    setDashboardView("role-specific");
  };

  const handleViewGeneral = () => {
    setDashboardView("general");
  };

  const handleViewRoleSpecific = () => {
    setDashboardView("role-specific");
  };

  // If user is logged in, show appropriate dashboard
  if (user) {
    // Show General Dashboard if selected
    if (dashboardView === "general") {
      return (
        <GeneralDashboard 
          onLogout={handleLogout}
          onBackToRoleDashboard={handleViewRoleSpecific}
        />
      );
    }

    // Show role-specific dashboard
    switch (user.role) {
      case "student":
        return (
          <StudentDashboard 
            onLogout={handleLogout}
            onViewGeneral={handleViewGeneral}
          />
        );
      case "staff":
        return (
          <StaffDashboard 
            onLogout={handleLogout}
            onViewGeneral={handleViewGeneral}
          />
        );
      case "hod":
        return (
          <HODDashboard 
            onLogout={handleLogout}
            onViewGeneral={handleViewGeneral}
          />
        );
      default:
        return null;
    }
  }

  // If user is not logged in, show login or signup page
  if (currentPage === "login") {
    return (
      <LoginPage
        onNavigateToSignup={() => setCurrentPage("signup")}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <SignUpPage
      onNavigateToLogin={() => setCurrentPage("login")}
      onSignupSuccess={handleSignupSuccess}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}