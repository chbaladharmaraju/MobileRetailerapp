import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';
import AuthLayout from './components/layout/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Dashboard / Landing
import Dashboard from './pages/dashboard/Dashboard';
import Landing from './pages/landing/Landing';

// Sales
import SalesList from './pages/sales/SalesList';
import NewSale from './pages/sales/NewSale';
import SaleDetails from './pages/sales/SaleDetails';

// Second-Hand
import SecondHandList from './pages/secondhand/SecondHandList';
import IntakeForm from './pages/secondhand/IntakeForm';
import ResaleForm from './pages/secondhand/ResaleForm';

// Repairs
import RepairsList from './pages/repairs/RepairsList';
import RepairIntake from './pages/repairs/RepairIntake';
import RepairDetails from './pages/repairs/RepairDetails';

// Inventory
import ProductInventory from './pages/inventory/ProductInventory';

// Invoices
import InvoicesList from './pages/invoices/InvoicesList';
import InvoiceDetails from './pages/invoices/InvoiceDetails';

// Customers
import CustomersList from './pages/customers/CustomersList';
import CustomerLedger from './pages/customers/CustomerLedger';

// Suppliers & Intake
import DistributorsList from './pages/suppliers/DistributorsList';
import DistributorLedger from './pages/suppliers/DistributorLedger';
import ReceiveStock from './pages/inventory/ReceiveStock';
import AllTransactions from './pages/transactions/AllTransactions';

import SecondHandDetails from './pages/secondhand/SecondHandDetails';
import DistributorPayments from './pages/suppliers/DistributorPayments';

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-ag-neon/30 border-t-ag-neon rounded-full animate-spin" />
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
};

// Public Route (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/app" replace /> : children;
};

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(15, 15, 35, 0.95)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#e2e8f0',
              backdropFilter: 'blur(12px)',
              borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#34d399', secondary: '#0a0a1a' } },
            error: { iconTheme: { primary: '#f87171', secondary: '#0a0a1a' } },
          }}
        />
        <Routes>
          {/* Public Landing + Auth */}
          <Route path="/" element={<PublicRoute><Navigate to="/login" replace /></PublicRoute>} />
          <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          {/* Protected App Routes */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/app" element={<Dashboard />} />
            <Route path="/app/analytics" element={<Dashboard />} />
            <Route path="/sales" element={<SalesList />} />
            <Route path="/sales/new" element={<NewSale />} />
            <Route path="/sales/:id" element={<SaleDetails />} />
            <Route path="/secondhand" element={<SecondHandList />} />
            <Route path="/secondhand/intake" element={<IntakeForm />} />
            <Route path="/secondhand/details/:id" element={<SecondHandDetails />} />
            <Route path="/repairs" element={<RepairsList />} />
            <Route path="/repairs/new" element={<RepairIntake />} />
            <Route path="/repairs/:id" element={<RepairDetails />} />
            <Route path="/inventory" element={<ProductInventory />} />
            <Route path="/inventory/receive" element={<ReceiveStock />} />
            <Route path="/invoices" element={<InvoicesList />} />
            <Route path="/invoices/:id" element={<InvoiceDetails />} />
            <Route path="/customers" element={<CustomersList />} />
            <Route path="/customers/:id/ledger" element={<CustomerLedger />} />
            <Route path="/suppliers" element={<DistributorsList />} />
            <Route path="/suppliers/:id/ledger" element={<DistributorLedger />} />
            <Route path="/payments/daily" element={<DistributorPayments />} />
            <Route path="/app/transactions" element={<AllTransactions />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
