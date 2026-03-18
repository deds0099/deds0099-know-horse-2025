import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Lazy loading pages
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const NewsList = lazy(() => import("./pages/News"));
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const Submission = lazy(() => import("./pages/Submission"));
const ScheduleList = lazy(() => import("./pages/Schedule"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminNews = lazy(() => import("./pages/admin/News"));
const AdminNewsCreate = lazy(() => import("./pages/admin/NewsCreate"));
const AdminNewsEdit = lazy(() => import("./pages/admin/NewsEdit"));
const AdminSchedule = lazy(() => import("./pages/admin/Schedule"));
const ScheduleForm = lazy(() => import("./pages/admin/ScheduleForm"));
const AdminSubscriptions = lazy(() => import("./pages/admin/Subscriptions"));
const AdminReports = lazy(() => import("./pages/admin/Reports"));
const MinicourseList = lazy(() => import("./pages/Minicourses"));
const MinicourseRegister = lazy(() => import("./pages/MinicourseRegister"));
const MinicourseConfirmation = lazy(() => import("./pages/MinicourseConfirmation"));
const AdminMinicourses = lazy(() => import("./pages/admin/Minicourses"));
const MinicourseForm = lazy(() => import("./pages/admin/MinicourseForm"));
const MinicourseRegistrations = lazy(() => import("./pages/admin/MinicourseRegistrations"));
const MemberDashboard = lazy(() => import("./pages/member/Dashboard"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2 border-transparent"></div>
  </div>
);

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
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/news" element={<NewsList />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/submission" element={<Submission />} />
                  <Route path="/schedule" element={<ScheduleList />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} /> 

                  {/* Rotas para Minicursos (Público) */}
                  <Route path="/minicourses" element={<MinicourseList />} />
                  <Route path="/minicourses/register/:id" element={<MinicourseRegister />} />
                  <Route path="/minicourses/confirmation/:id" element={<MinicourseConfirmation />} />

                  {/* Rotas de Membro */}
                  <Route path="/member/dashboard" element={<MemberDashboard />} />

                  {/* Rotas Admin */}
                  <Route path="/admin/dashboard" element={<Dashboard />} />
                  <Route path="/admin/news" element={<AdminNews />} />
                  <Route path="/admin/news/new" element={<AdminNewsCreate />} />
                  <Route path="/admin/news/edit/:id" element={<AdminNewsEdit />} />
                  <Route path="/admin/schedule" element={<AdminSchedule />} />
                  <Route path="/admin/schedule/new" element={<ScheduleForm />} />
                  <Route path="/admin/schedule/edit/:id" element={<ScheduleForm />} />
                  <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
                  <Route path="/admin/reports" element={<AdminReports />} />

                  {/* Rotas para Minicursos (Admin) */}
                  <Route path="/admin/minicourses" element={<AdminMinicourses />} />
                  <Route path="/admin/minicourses/new" element={<MinicourseForm />} />
                  <Route path="/admin/minicourses/:id/edit" element={<MinicourseForm />} />
                  <Route path="/admin/minicourses/registrations/:id" element={<MinicourseRegistrations />} />
                  <Route path="/admin/settings" element={<AdminSettings />} />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
