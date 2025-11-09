import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import QuotesPage from "./pages/QuotesPage";
import WorkOrdersPage from "./pages/WorkOrdersPage";
import TechniciansPage from "./pages/TechniciansPage";
import ProductsPage from "./pages/ProductsPage";
import FinancialPage from "./pages/FinancialPage";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/quotes"} component={QuotesPage} />
      <Route path={"/work-orders"} component={WorkOrdersPage} />
      <Route path={"/technicians"} component={TechniciansPage} />
      <Route path={"/products"} component={ProductsPage} />
      <Route path={"/financial"} component={FinancialPage} />
      <Route path={"/404"} component={NotFound} />
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
