import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "@/pages/Home";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminPipeline from "@/pages/admin/AdminPipeline";
import AdminLoanPrep from "@/pages/admin/AdminLoanPrep";
import AdminQuotes from "@/pages/admin/AdminQuotes";
import AdminAddClient from "@/pages/admin/AdminAddClient";
import AdminAddComment from "@/pages/admin/AdminAddComment";
import AdminAddVendor from "@/pages/admin/AdminAddVendor";
import AdminSearch from "@/pages/admin/AdminSearch";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={() => <Redirect to="/admin/login" />} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard">
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/pipeline">
        <ProtectedRoute>
          <AdminPipeline />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/loan-prep">
        <ProtectedRoute>
          <AdminLoanPrep />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/quotes">
        <ProtectedRoute>
          <AdminQuotes />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/add-client">
        <ProtectedRoute>
          <AdminAddClient />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/add-comment">
        <ProtectedRoute>
          <AdminAddComment />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/add-vendor">
        <ProtectedRoute>
          <AdminAddVendor />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/search">
        <ProtectedRoute>
          <AdminSearch />
        </ProtectedRoute>
      </Route>
      {/* Fallback to 404 */}
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
