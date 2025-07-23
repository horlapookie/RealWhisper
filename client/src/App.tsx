import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { SocketProvider } from "@/hooks/use-socket";
import LoginPage from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import LoadingScreen from "@/components/loading-screen";
import ModernBackground from "@/components/modern-background";
import { useAuth } from "@/hooks/use-auth";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <ModernBackground />
      <Switch>
        <Route path="/" component={user ? Dashboard : LoginPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/dashboard" component={user ? Dashboard : LoginPage} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <TooltipProvider>
              <Toaster />
              <AppContent />
            </TooltipProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
