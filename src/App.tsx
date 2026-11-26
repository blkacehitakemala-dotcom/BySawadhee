import React, { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { StorefrontPage } from './pages/StorefrontPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import type { Order } from './types';

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}

function AppShell() {
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const triggerCatalogRefresh = () => {
    setRefreshSignal((prev) => prev + 1);
  };

  const handleOrderCreated = (order: Order) => {
    setCompletedOrder(order);
    triggerCatalogRefresh();
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F6] text-[#1F2937]">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route
            path="/"
            element={<StorefrontPage refreshSignal={refreshSignal} />}
          />
          <Route path="/track" element={<TrackOrderPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminDashboardPage onCatalogMutated={triggerCatalogRefresh} />
              </ProtectedAdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
      <CartDrawer onOrderCreated={handleOrderCreated} />
      <OrderSuccessModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
      />
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <AppShell />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
