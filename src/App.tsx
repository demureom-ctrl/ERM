import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppLayout } from './layouts/AppLayout';
import { HomePage } from './pages/HomePage';
import { POSPage } from './pages/POSPage';
import { InventoryPage } from './pages/InventoryPage';
import { OrdersPage } from './pages/OrdersPage';
import { AddProductPage } from './pages/AddProductPage';
import { EditItemPage } from './pages/EditItemPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { DiscountsPage } from './pages/DiscountsPage';
import { UsersPage } from './pages/UsersPage';

import { AuthProvider } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';

import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '12px',
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/" element={<ProtectedRoute allowedRoles={['admin']}><HomePage /></ProtectedRoute>} />
            <Route path="/pos" element={<ProtectedRoute allowedRoles={['admin', 'sales']}><POSPage /></ProtectedRoute>} />

            <Route path="/inventory" element={<ProtectedRoute allowedRoles={['admin']}><InventoryPage /></ProtectedRoute>} />
            <Route path="/inventory/add" element={<ProtectedRoute allowedRoles={['admin']}><AddProductPage /></ProtectedRoute>} />
            <Route path="/inventory/edit/:id" element={<ProtectedRoute allowedRoles={['admin']}><EditItemPage /></ProtectedRoute>} />
            <Route path="/inventory/categories" element={<ProtectedRoute allowedRoles={['admin']}><CategoriesPage /></ProtectedRoute>} />
            <Route path="/discounts" element={<ProtectedRoute><DiscountsPage /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><UsersPage /></ProtectedRoute>} />

            <Route path="/orders" element={<ProtectedRoute allowedRoles={['admin']}><OrdersPage /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
