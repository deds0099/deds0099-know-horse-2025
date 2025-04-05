import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import NewsList from "./pages/News";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Submission from "./pages/Submission";
import ScheduleList from "./pages/Schedule";
import Dashboard from "./pages/admin/Dashboard";
import AdminNews from "./pages/admin/News";
import AdminNewsCreate from "./pages/admin/NewsCreate";
import AdminNewsEdit from "./pages/admin/NewsEdit";
import AdminSchedule from "./pages/admin/Schedule";
import ScheduleForm from "./pages/admin/ScheduleForm";
import AdminSubscriptions from "./pages/admin/Subscriptions";
import AdminReports from "./pages/admin/Reports";
import { AuthProvider } from "./context/AuthContext";

// Create a new client
const queryClient = new QueryClient();

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/news" element={<NewsList />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/submission" element={<Submission />} />
                <Route path="/schedule" element={<ScheduleList />} />
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/news" element={<AdminNews />} />
                <Route path="/admin/news/new" element={<AdminNewsCreate />} />
                <Route path="/admin/news/edit/:id" element={<AdminNewsEdit />} />
                <Route path="/admin/schedule" element={<AdminSchedule />} />
                <Route path="/admin/schedule/new" element={<ScheduleForm />} />
                <Route path="/admin/schedule/edit/:id" element={<ScheduleForm />} />
                <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
                <Route path="/admin/reports" element={<AdminReports />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
