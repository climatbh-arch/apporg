import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Equipments from "./pages/Equipments";
import WorkOrders from "./pages/WorkOrders";
import Inventory from "./pages/Inventory";
import Financial from "./pages/Financial";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import WorkOrderEdit from "./pages/WorkOrderEdit";
import QuoteEdit from "./pages/QuoteEdit";
import ScheduleCalendar from "./pages/ScheduleCalendar";
import Notifications from "./pages/Notifications";

function Router() {
  return (
    <Switch>
      <Route path={"/login"} component={Login} />
      <Route path={"/"} component={Dashboard} />
      <Route path={"/clients"} component={Clients} />
      <Route path={"/equipments"} component={Equipments} />
      <Route path={"/work-orders"} component={WorkOrders} />
      <Route path={"/inventory"} component={Inventory} />
      <Route path={"/financial"} component={Financial} />
      <Route path={"/reports"} component={Reports} />
      <Route path={"/work-orders/:id"} component={WorkOrderEdit} />
      <Route path={"/quotes/:id"} component={QuoteEdit} />
      <Route path={"/schedule"} component={ScheduleCalendar} />
      <Route path={"/notifications"} component={Notifications} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
