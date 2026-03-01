import { Suspense, lazy, useEffect } from 'react';
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
import ModuleGuard from './components/ModuleGuard';
import { useRealtimeSync } from './hooks/useRealtimeSync';

// Eager load core pages
import Home from './pages/Home';
import Empresa from './pages/Empresa';
import AreasAtuacao from './pages/AreasAtuacao';
import Servicos from './pages/Servicos';
import Portfolio from './pages/Portfolio';
import Parceiros from './pages/Parceiros';
import Contato from './pages/Contato';

// Lazy load less critical public pages and details
const ServicosDetalhes = lazy(() => import('./pages/Servicos/Detalhes'));
const PortfolioDetalhes = lazy(() => import('./pages/Portfolio/Detalhes'));
const AreasAtuacaoDetalhes = lazy(() => import('./pages/AreasAtuacao/Detalhes'));
const NotFound = lazy(() => import('./pages/NotFound'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfUse = lazy(() => import('./pages/TermsOfUse'));

// Lazy Load Admin Pages (Code Splitting)
const Login = lazy(() => import('./pages/Admin/Login'));
const Dashboard = lazy(() => import('./pages/Admin/Dashboard'));
const PortfolioList = lazy(() => import('./pages/Admin/Portfolio/List'));
const PortfolioForm = lazy(() => import('./pages/Admin/Portfolio/Form'));
const ServicesList = lazy(() => import('./pages/Admin/Services/List'));
const ServicesForm = lazy(() => import('./pages/Admin/Services/Form'));
const ContactsList = lazy(() => import('./pages/Admin/Contacts/List'));
const MediaManager = lazy(() => import('./pages/Admin/Media/Manager'));
const PagesList = lazy(() => import('./pages/Admin/Pages/List'));
const PageForm = lazy(() => import('./pages/Admin/Pages/Form'));
const Settings = lazy(() => import('./pages/Admin/Settings'));
const UsersList = lazy(() => import('./pages/Admin/Users/List'));
const UserForm = lazy(() => import('./pages/Admin/Users/Form'));
const SystemHealth = lazy(() => import('./pages/Admin/SystemHealth'));
const HomeSettings = lazy(() => import('./pages/Admin/Home'));
const PracticeAreasList = lazy(() => import('./pages/Admin/PracticeAreas/List'));
const PracticeAreasForm = lazy(() => import('./pages/Admin/PracticeAreas/Form'));
const PartnersList = lazy(() => import('./pages/Admin/Partners/List'));
const PartnersForm = lazy(() => import('./pages/Admin/Partners/Form'));

// Lazy load less critical or one-off pages
const InstallWizard = lazy(() => import('./pages/Install/InstallWizard'));

// Helper to wrap components with Suspense
const withSuspense = (Component: React.LazyExoticComponent<any>) => (props: any) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component {...props} />
  </Suspense>
);

// Wrapped Components
const NotFoundLazy = withSuspense(NotFound);
const PrivacyPolicyLazy = withSuspense(PrivacyPolicy);
const TermsOfUseLazy = withSuspense(TermsOfUse);
const ServicosDetalhesLazy = withSuspense(ServicosDetalhes);
const PortfolioDetalhesLazy = withSuspense(PortfolioDetalhes);
const AreasAtuacaoDetalhesLazy = withSuspense(AreasAtuacaoDetalhes);
const InstallWizardLazy = withSuspense(InstallWizard);

// Wrapped Admin Components
const LoginLazy = withSuspense(Login);
const DashboardLazy = withSuspense(Dashboard);
const PortfolioListLazy = withSuspense(PortfolioList);
const PortfolioFormLazy = withSuspense(PortfolioForm);
const ServicesListLazy = withSuspense(ServicesList);
const ServicesFormLazy = withSuspense(ServicesForm);
const ContactsListLazy = withSuspense(ContactsList);
const MediaManagerLazy = withSuspense(MediaManager);
const PagesListLazy = withSuspense(PagesList);
const PageFormLazy = withSuspense(PageForm);
const SettingsLazy = withSuspense(Settings);
const UsersListLazy = withSuspense(UsersList);
const UserFormLazy = withSuspense(UserForm);
const SystemHealthLazy = withSuspense(SystemHealth);
const HomeSettingsLazy = withSuspense(HomeSettings);
const PracticeAreasListLazy = withSuspense(PracticeAreasList);
const PracticeAreasFormLazy = withSuspense(PracticeAreasForm);
const PartnersListLazy = withSuspense(PartnersList);
const PartnersFormLazy = withSuspense(PartnersForm);

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<ScrollToTop />}>
        <Route element={<AnalyticsProvider><Outlet /></AnalyticsProvider>}>
        {/* Installation Wizard */}
        <Route path="/install" element={<InstallWizardLazy />} />

        {/* Public Routes with Layout */}
        <Route path="/" element={<Layout><Home /></Layout>} errorElement={<ErrorBoundary />} />
        
        <Route path="/empresa" element={
          <Layout>
            <ModuleGuard moduleKey="paginas">
              <Empresa />
            </ModuleGuard>
          </Layout>
        } errorElement={<ErrorBoundary />} />
        
        <Route path="/areas-de-atuacao" element={
          <Layout>
            <ModuleGuard moduleKey="areas_atuacao">
              <AreasAtuacao />
            </ModuleGuard>
          </Layout>
        } errorElement={<ErrorBoundary />} />
        
        <Route path="/areas-de-atuacao/:slug" element={
          <Layout>
            <ModuleGuard moduleKey="areas_atuacao">
              <AreasAtuacaoDetalhesLazy />
            </ModuleGuard>
          </Layout>
        } errorElement={<ErrorBoundary />} />
        
        <Route path="/servicos" element={
          <Layout>
            <ModuleGuard moduleKey="servicos">
              <Servicos />
            </ModuleGuard>
          </Layout>
        } errorElement={<ErrorBoundary />} />
        
        <Route path="/servicos/:slug" element={
          <Layout>
            <ModuleGuard moduleKey="servicos">
              <ServicosDetalhesLazy />
            </ModuleGuard>
          </Layout>
        } errorElement={<ErrorBoundary />} />
        
        <Route path="/portfolio" element={
          <Layout>
            <ModuleGuard moduleKey="portfolio">
              <Portfolio />
            </ModuleGuard>
          </Layout>
        } errorElement={<ErrorBoundary />} />
        
        <Route path="/portfolio/:slug" element={
          <Layout>
            <ModuleGuard moduleKey="portfolio">
              <PortfolioDetalhesLazy />
            </ModuleGuard>
          </Layout>
        } errorElement={<ErrorBoundary />} />
        
        <Route path="/parceiros" element={
          <Layout>
            <ModuleGuard moduleKey="parceiros">
              <Parceiros />
            </ModuleGuard>
          </Layout>
        } errorElement={<ErrorBoundary />} />
        
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
          <Route path="/admin/dashboard" element={<AdminLayout><DashboardLazy /></AdminLayout>} />
          
          {/* Portfolio Management */}
          <Route path="/admin/portfolio" element={<AdminLayout><PortfolioListLazy /></AdminLayout>} />
          <Route path="/admin/portfolio/novo" element={<AdminLayout><PortfolioFormLazy /></AdminLayout>} />
          <Route path="/admin/portfolio/:id" element={<AdminLayout><PortfolioFormLazy /></AdminLayout>} />
          
          {/* Services Management */}
          <Route path="/admin/services" element={<AdminLayout><ServicesListLazy /></AdminLayout>} />
          <Route path="/admin/services/novo" element={<AdminLayout><ServicesFormLazy /></AdminLayout>} />
          <Route path="/admin/services/:id" element={<AdminLayout><ServicesFormLazy /></AdminLayout>} />
          
          {/* Contacts Management */}
          <Route path="/admin/contatos" element={<AdminLayout><ContactsListLazy /></AdminLayout>} />

          <Route path="/admin/midia" element={<AdminLayout><MediaManagerLazy /></AdminLayout>} />

          {/* Pages Management */}
          <Route path="/admin/paginas" element={<AdminLayout><PagesListLazy /></AdminLayout>} />
          <Route path="/admin/paginas/nova" element={<AdminLayout><PageFormLazy /></AdminLayout>} />
          <Route path="/admin/paginas/editar/:id" element={<AdminLayout><PageFormLazy /></AdminLayout>} />

          <Route path="/admin/usuarios" element={<AdminLayout><UsersListLazy /></AdminLayout>} />
          <Route path="/admin/usuarios/novo" element={<AdminLayout><UserFormLazy /></AdminLayout>} />
          
          {/* Home Settings */}
          <Route path="/admin/home" element={<AdminLayout><HomeSettingsLazy /></AdminLayout>} />

          {/* Practice Areas Management */}
          <Route path="/admin/areas-atuacao" element={<AdminLayout><PracticeAreasListLazy /></AdminLayout>} />
          <Route path="/admin/areas-atuacao/novo" element={<AdminLayout><PracticeAreasFormLazy /></AdminLayout>} />
          <Route path="/admin/areas-atuacao/:id" element={<AdminLayout><PracticeAreasFormLazy /></AdminLayout>} />

          {/* Partners Management */}
          <Route path="/admin/parceiros" element={<AdminLayout><PartnersListLazy /></AdminLayout>} />
          <Route path="/admin/parceiros/novo" element={<AdminLayout><PartnersFormLazy /></AdminLayout>} />
          <Route path="/admin/parceiros/:id" element={<AdminLayout><PartnersFormLazy /></AdminLayout>} />

          {/* Settings */}
          <Route path="/admin/configuracoes" element={<AdminLayout><SettingsLazy /></AdminLayout>} />
          
          {/* System Health */}
          <Route path="/admin/system-health" element={<AdminLayout><SystemHealthLazy /></AdminLayout>} />
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
    // We don't need to manually set hydrated here as useRealtimeSync handles it via AppLoader/store
  }, []);

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
