import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Analyze from "@/pages/analyze";
import Result from "@/pages/result";

function Router() {
  const sessionId = localStorage.getItem('auth-session');
  
  // Check authentication status
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    enabled: !!sessionId,
    retry: false,
  });

  const isAuthenticated = !!user;

  return (
    <Switch>
      <Route path="/">
        {isLoading ? (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#145da0] to-[#2e8bc0] rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                <div className="w-8 h-8 bg-white rounded-lg"></div>
              </div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        ) : isAuthenticated ? (
          <Home />
        ) : (
          <Landing />
        )}
      </Route>
      <Route path="/analyze" component={Analyze} />
      <Route path="/result" component={Result} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
