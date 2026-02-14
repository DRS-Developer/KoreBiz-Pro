import React, { Suspense, lazy, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route, Outlet, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { supabase } from './lib/supabase';
import { useAuthStore } from './stores/useAuthStore';
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/Admin/AdminLayout';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import AnalyticsProvider from './components/AnalyticsProvider';
import AppLoader from './components/AppLoader';
import { useRealtimeSync } from './hooks/useRealtimeSync';

// Eager load core pages
import Home from './pages/Home';
import Empresa from './pages/Empresa';
import AreasAtuacao from './pages/AreasAtuacao';
import Servicos from './pages/Servicos';
import Portfolio from './pages/Portfolio';
import Parceiros from './pages/Parceiros';
import Contato from './pages/Contato';

// Lazy load detail pages and less critical public pages
const AreasAtuacaoDetalhes = lazy(() => import('./pages/AreasAtuacao/Detalhes'));
const ServicosDetalhes = lazy(() => import('./pages/Servicos/Detalhes'));
const PortfolioDetalhes = lazy(() => import('./pages/Portfolio/Detalhes'));
const NotFound = lazy(() => import('./pages/NotFound'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfUse = lazy(() => import('./pages/TermsOfUse'));

// Admin Pages (Eager load for instant navigation feeling since data is cached)
import Login from './pages/Admin/Login';
import Dashboard from './pages/Admin/Dashboard';
import PortfolioList from './pages/Admin/Portfolio/List';
import PortfolioForm from './pages/Admin/Portfolio/Form';
import ServicesList from './pages/Admin/Services/List';
import ServicesForm from './pages/Admin/Services/Form';
import ContactsList from './pages/Admin/Contacts/List';
import MediaManager from './pages/Admin/Media/Manager';
import PagesList from './pages/Admin/Pages/List';
import PageForm from './pages/Admin/Pages/Form';
import Settings from './pages/Admin/Settings';
import UsersList from './pages/Admin/Users/List';
import UserForm from './pages/Admin/Users/Form';
import SystemHealth from './pages/Admin/SystemHealth';

// Lazy load less critical or one-off pages
const InstallWizard = lazy(() => import('./pages/Install/InstallWizard'));

// Helper to wrap components with Suspense
const withSuspense = (Component: React.LazyExoticComponent<any>) => (props: any) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component {...props} />
  </Suspense>
);

// Wrapped Components (Only for lazy loaded components)
const AreasAtuacaoDetalhesLazy = withSuspense(AreasAtuacaoDetalhes);
const ServicosDetalhesLazy = withSuspense(ServicosDetalhes);
const PortfolioDetalhesLazy = withSuspense(PortfolioDetalhes);
const NotFoundLazy = withSuspense(NotFound);
const PrivacyPolicyLazy = withSuspense(PrivacyPolicy);
const TermsOfUseLazy = withSuspense(TermsOfUse);
const LoginLazy = withSuspense(Login);
// Admin components are now eager loaded, no need for withSuspense wrapper
// But we need to use them directly in routes
const InstallWizardLazy = withSuspense(InstallWizard);

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<ScrollToTop />}>
        <Route element={<AnalyticsProvider><Outlet /></AnalyticsProvider>}>
        {/* Installation Wizard */}
        <Route path="/install" element={<InstallWizardLazy />} />

        {/* Public Routes with Layout */}
        <Route path="/" element={<Layout><Home /></Layout>} errorElement={<ErrorBoundary />} />
        <Route path="/empresa" element={<Layout><Empresa /></Layout>} errorElement={<ErrorBoundary />} />
        <Route path="/areas-de-atuacao" element={<Layout><AreasAtuacao /></Layout>} errorElement={<ErrorBoundary />} />
        <Route path="/areas-de-atuacao/:slug" element={<Layout><AreasAtuacaoDetalhesLazy /></Layout>} errorElement={<ErrorBoundary />} />
        <Route path="/servicos" element={<Layout><Servicos /></Layout>} errorElement={<ErrorBoundary />} />
        <Route path="/servicos/:slug" element={<Layout><ServicosDetalhesLazy /></Layout>} errorElement={<ErrorBoundary />} />
        <Route path="/portfolio" element={<Layout><Portfolio /></Layout>} errorElement={<ErrorBoundary />} />
        <Route path="/portfolio/:slug" element={<Layout><PortfolioDetalhesLazy /></Layout>} errorElement={<ErrorBoundary />} />
        <Route path="/parceiros" element={<Layout><Parceiros /></Layout>} errorElement={<ErrorBoundary />} />
        <Route path="/contato" element={<Layout><Contato /></Layout>} errorElement={<ErrorBoundary />} />
        <Route path="/politica-privacidade" element={<Layout><PrivacyPolicyLazy /></Layout>} errorElement={<ErrorBoundary />} />
        <Route path="/termos-uso" element={<Layout><TermsOfUseLazy /></Layout>} errorElement={<ErrorBoundary />} />

        {/* Admin Routes Group - Handles redirect for root /admin */}
        <Route path="/admin">
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="login" element={<LoginLazy />} errorElement={<ErrorBoundary />} />
        </Route>
        
        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />} errorElement={<ErrorBoundary />}>
          <Route path="/admin/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />
          
          {/* Portfolio Management */}
          <Route path="/admin/portfolio" element={<AdminLayout><PortfolioList /></AdminLayout>} />
          <Route path="/admin/portfolio/novo" element={<AdminLayout><PortfolioForm /></AdminLayout>} />
          <Route path="/admin/portfolio/:id" element={<AdminLayout><PortfolioForm /></AdminLayout>} />
          
          {/* Services Management */}
          <Route path="/admin/services" element={<AdminLayout><ServicesList /></AdminLayout>} />
          <Route path="/admin/services/novo" element={<AdminLayout><ServicesForm /></AdminLayout>} />
          <Route path="/admin/services/:id" element={<AdminLayout><ServicesForm /></AdminLayout>} />
          
          {/* Contacts Management */}
          <Route path="/admin/contatos" element={<AdminLayout><ContactsList /></AdminLayout>} />

          <Route path="/admin/midia" element={<AdminLayout><MediaManager /></AdminLayout>} />

          {/* Pages Management */}
          <Route path="/admin/paginas" element={<AdminLayout><PagesList /></AdminLayout>} />
          <Route path="/admin/paginas/nova" element={<AdminLayout><PageForm /></AdminLayout>} />
          <Route path="/admin/paginas/editar/:id" element={<AdminLayout><PageForm /></AdminLayout>} />

          <Route path="/admin/usuarios" element={<AdminLayout><UsersList /></AdminLayout>} />
          <Route path="/admin/usuarios/novo" element={<AdminLayout><UserForm /></AdminLayout>} />
          
          {/* Settings */}
          <Route path="/admin/configuracoes" element={<AdminLayout><Settings /></AdminLayout>} />
          
          {/* System Health */}
          <Route path="/admin/system-health" element={<AdminLayout><SystemHealth /></AdminLayout>} />
        </Route>

        {/* 404 Catch-All */}
        <Route path="*" element={<Layout><NotFoundLazy /></Layout>} />
        </Route>
      </Route>
    </>
  )
);

function App() {
  const { setSession, setIsLoading } = useAuthStore();
  
  // Initialize Global Realtime Sync
  useRealtimeSync();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setSession, setIsLoading]);

  return (
    <>
      <Toaster position="top-right" richColors />
      <AppLoader>
        <RouterProvider router={router} />
      </AppLoader>
    </>
  );
}

export default App;
