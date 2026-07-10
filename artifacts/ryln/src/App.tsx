import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Public Layout Components
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/hooks/use-auth";

// Public Pages
import Home from "@/pages/home";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Activities from "@/pages/activities";
import Gallery from "@/pages/gallery";
import Login from "@/pages/login";
import MemberPage from "@/pages/member";
import Register from "@/pages/register";
import NotFound from "@/pages/not-found";

// Dashboard Components
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import DashboardOverview from "@/pages/dashboard/index";
import DashboardMembers from "@/pages/dashboard/members";
import DashboardAnnouncements from "@/pages/dashboard/announcements";
import DashboardActivities from "@/pages/dashboard/activities";
import DashboardGallery from "@/pages/dashboard/gallery";
import DashboardMessages from "@/pages/dashboard/messages";
import DashboardLeadership from "@/pages/dashboard/leadership";

const queryClient = new QueryClient();

// Wrap public pages with Navbar and Footer
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Dashboard Routes - Protected */}
      <Route path="/dashboard">
        <DashboardLayout>
          <DashboardOverview />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/members">
        <DashboardLayout>
          <DashboardMembers />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/announcements">
        <DashboardLayout>
          <DashboardAnnouncements />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/activities">
        <DashboardLayout>
          <DashboardActivities />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/gallery">
        <DashboardLayout>
          <DashboardGallery />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/messages">
        <DashboardLayout>
          <DashboardMessages />
        </DashboardLayout>
      </Route>
      <Route path="/dashboard/leadership">
        <DashboardLayout>
          <DashboardLeadership />
        </DashboardLayout>
      </Route>

      {/* Public Routes */}
      <Route path="/">
        <PublicLayout><Home /></PublicLayout>
      </Route>
      <Route path="/about">
        <PublicLayout><About /></PublicLayout>
      </Route>
      <Route path="/contact">
        <PublicLayout><Contact /></PublicLayout>
      </Route>
      <Route path="/activities">
        <PublicLayout><Activities /></PublicLayout>
      </Route>
      <Route path="/gallery">
        <PublicLayout><Gallery /></PublicLayout>
      </Route>
      <Route path="/member">
        <PublicLayout><MemberPage /></PublicLayout>
      </Route>
      
      {/* Auth Routes */}
      <Route path="/login">
        <PublicLayout><Login /></PublicLayout>
      </Route>
      <Route path="/register">
        <PublicLayout><Register /></PublicLayout>
      </Route>

      {/* 404 */}
      <Route>
        <PublicLayout><NotFound /></PublicLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

