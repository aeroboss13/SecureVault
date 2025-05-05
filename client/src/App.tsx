import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import ViewPassword from "@/pages/view-password";
import History from "@/pages/history";

function Router() {
  return (
    <Switch>
      {/* Public route for viewing shared passwords */}
      <Route path="/view/:token" component={ViewPassword} />
      
      {/* Auth routes */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected admin routes */}
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/history" component={History} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
