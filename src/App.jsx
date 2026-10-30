import {
  BrowserRouter as Router,
  matchPath,
  Switch,
  Route,
  Redirect,
  useLocation
} from 'react-router-dom';
import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
// 🧩 Componentes
import Message from './components/flashMessage/Message';
import Container from './components/layout/Container';
import LoadingSpinner from './components/loading/LoadingSpinner';
// 📄 Páginas

// 🌐 Contexto
import { UserProvider } from './context/UserContext';

const Header = lazy(() => import('./components/header/Header'));
const Footer = lazy(() => import('./components/footer/Footer'));
const Sidebar = lazy(() => import('./components/Sidebar/Sidebar'));
const Login = lazy(() => import('./views/auth/Login'));
const Register = lazy(() => import('./views/auth/Register'));
const ForgotPassword = lazy(() => import('./views/auth/ForgotPassword'));
const StartLogin = lazy(() => import('./views/auth/StartLogin'));
const Home = lazy(() => import('./views/home/Home'));
const CategoryList = lazy(
  () =>
    import('./views/sectionConfigSystem/Sections/Report/Category/CategoryList')
);
const CategoryForm = lazy(
  () =>
    import('./views/sectionConfigSystem/Sections/Report/Category/Form/CategoryForm')
);
const RecordTypeForm = lazy(
  () =>
    import('./views/sectionConfigSystem/Sections/General/RecordType/Form/RecordTypeForm')
);
const CustomFieldForm = lazy(
  () =>
    import('./views/sectionConfigSystem/Sections/General/CustomFields/Form/CustomFieldsForm')
);
const SectionConfigSystem = lazy(
  () => import('./views/sectionConfigSystem/SectionConfigSystem')
);
const RecordTypeList = lazy(
  () =>
    import('./views/sectionConfigSystem/Sections/General/RecordType/RecordTypeList')
);
const CustomFieldsList = lazy(
  () =>
    import('./views/sectionConfigSystem/Sections/General/CustomFields/CustomFieldsList')
);
const ReportMonthlyRecordList = lazy(
  () => import('./views/report/Sections/Category/ReportMonthlyRecordList')
);
const TransactionList = lazy(
  () => import('./views/report/Sections/Category/Transaction/TransactionList')
);
const ReportMonthlyRecordForm = lazy(
  () => import('./views/report/Sections/Category/Form/ReportMonthlyRecordForm')
);
const TransactionForm = lazy(
  () =>
    import('./views/report/Sections/Category/Transaction/Form/TransactionForm')
);
const Calendar = lazy(() => import('./views/notes/Calendar/Calendar'));
const DashboardCategoryManager = lazy(
  () => import('./views/dashboard/category/dashoardCategoryManager')
);
const MyDay = lazy(() => import('./views/myDay/MyDay'));
const Goals = lazy(() => import('./views/goals/Goals'));

const APP_NAME = 'SyncTime';

const pageTitles = [
  { path: '/', exact: true, title: 'Acesso' },
  { path: '/login', exact: true, title: 'Login' },
  { path: '/register', exact: true, title: 'Cadastro' },
  { path: '/esqueceu-senha', exact: true, title: 'Recuperar senha' },
  { path: '/inicio', exact: true, title: 'Inicio' },
  { path: '/meu-dia', exact: true, title: 'Meu Dia' },
  { path: '/metas', exact: true, title: 'Metas' },
  { path: '/dashboard/categoria', exact: true, title: 'Dashboard' },
  { path: '/anotacoes', exact: true, title: 'Anotacoes' },
  { path: '/configuracoes', exact: true, title: 'Configuracoes' },
  { path: '/categoria', exact: true, title: 'Categorias' },
  { path: '/categoria/form', exact: true, title: 'Nova categoria' },
  { path: '/categoria/form/:id', exact: true, title: 'Editar categoria' },
  { path: '/record-type', exact: true, title: 'Tipos de registro' },
  { path: '/record-type/form', exact: true, title: 'Novo tipo de registro' },
  {
    path: '/record-type/form/:id',
    exact: true,
    title: 'Editar tipo de registro'
  },
  { path: '/custom-fields', exact: true, title: 'Campos personalizados' },
  {
    path: '/custom-fields/form',
    exact: true,
    title: 'Novo campo personalizado'
  },
  {
    path: '/custom-fields/form/:id',
    exact: true,
    title: 'Editar campo personalizado'
  },
  {
    path: '/relatorios/categoria/relatorio-mesal/:id',
    exact: true,
    title: 'Relatorio mensal'
  },
  {
    path: '/relatorios/categoria/relatorio-mesal/form',
    exact: true,
    title: 'Novo relatorio mensal'
  },
  {
    path: '/relatorios/categoria/relatorio-mesal/form/:id',
    exact: true,
    title: 'Editar relatorio mensal'
  },
  {
    path: '/relatorios/categoria/transações',
    exact: true,
    title: 'Transacoes'
  },
  {
    path: '/relatorios/categoria/transações/form',
    exact: true,
    title: 'Nova transacao'
  },
  {
    path: '/relatorios/categoria/transações/form/:id',
    exact: true,
    title: 'Editar transacao'
  }
];

function PageTitle() {
  const location = useLocation();

  useEffect(() => {
    const currentPage = pageTitles.find(({ path, exact }) =>
      matchPath(location.pathname, { path, exact })
    );

    document.title = currentPage
      ? `${currentPage.title} • ${APP_NAME}`
      : APP_NAME;
  }, [location.pathname]);

  return null;
}

function ProtectedRoute({ children, ...rest }) {
  const token = localStorage.getItem('token');
  return (
    <Route
      {...rest}
      render={({ location }) =>
        token ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/',
              state: { from: location }
            }}
          />
        )
      }
    />
  );
}

function PublicRoute({ children, ...rest }) {
  const token = localStorage.getItem('token');
  return (
    <Route
      {...rest}
      render={() => (token ? <Redirect to="/inicio" /> : children)}
    />
  );
}

function Layout({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const [sidebarState, setSidebarState] = useState({
    isMinimized: false,
    isMobile: false
  });

  const protectedPages = [
    '/inicio',
    '/meu-dia',
    '/metas',
    '/dashboard',
    '/relatorios',
    '/anotacoes',
    '/configuracoes',
    '/conta',
    '/categoria',
    '/categoria/form',
    '/categoria/form/:id',
    '/record-type',
    '/record-type/form',
    '/record-type/form/:id',
    '/custom-fields',
    '/custom-fields/form',
    '/custom-fields/form/:id',
    '/relatorios/categoria',
    '/relatorios/categoria/relatorio-mesal',
    '/relatorios/categoria/relatorio-mesal/:id',
    '/relatorios/categoria/relatorio-mesal/form',
    '/relatorios/categoria/relatorio-mesal/form/:id',
    '/relatorios/categoria/relatorio-mesal/transactions',
    '/relatorios/categoria/relatorio-mesal/transaction/form',
    '/relatorios/categoria/relatorio-mesal/transaction/form/:id',
    '/relatorios/categoria/transações',
    '/relatorios/categoria/transações/form',
    '/relatorios/categoria/transações/form/:id'
  ];

  const showSidebar =
    token &&
    protectedPages.some((path) =>
      location.pathname.startsWith(path.replace('/:id', ''))
    );

  const handleSidebarToggle = useCallback((isMinimized, isMobile) => {
    setSidebarState({ isMinimized, isMobile });
  }, []);

  const getMarginLeft = () => {
    if (!showSidebar) return '0';
    if (sidebarState.isMobile) return '0';
    if (sidebarState.isMinimized) return '80px';
    return '260px';
  };

  const getWidth = () => {
    if (!showSidebar) return '100%';
    if (sidebarState.isMobile) return '100%';
    if (sidebarState.isMinimized) return 'calc(100% - 80px)';
    return 'calc(100% - 260px)';
  };

  return (
    <>
      {showSidebar && <Sidebar onToggle={handleSidebarToggle} />}
      <div
        style={{
          marginLeft: getMarginLeft(),
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          transition: 'margin-left 0.3s ease, width 0.3s ease',
          width: getWidth(),
          minWidth: 0,
          maxWidth: '100%',
          overflowX: 'clip'
        }}
      >
        {showSidebar && <Header />}
        <main
          style={{
            display: 'flex',
            flex: '1 0 auto',
            flexDirection: 'column',
            minWidth: 0,
            width: '100%',
            overflowX: 'clip'
          }}
        >
          {showSidebar ? <Container>{children}</Container> : children}
        </main>
        {showSidebar && <Footer />}
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <UserProvider>
        <PageTitle />
        <Message />
        <Suspense
          fallback={<LoadingSpinner message="Carregando página..." fullscreen />}
        >
          <Layout>
            <Switch>
              {/* Rotas AUTH */}
              <PublicRoute exact path="/">
                <StartLogin />
              </PublicRoute>
              <PublicRoute path="/login">
                <Login />
              </PublicRoute>
              <PublicRoute path="/register">
                <Register />
              </PublicRoute>
              <PublicRoute path="/esqueceu-senha">
                <ForgotPassword />
              </PublicRoute>
              {/* Rotas Inicio */}

              <ProtectedRoute path="/inicio">
                <Home />
              </ProtectedRoute>

              <ProtectedRoute exact path="/meu-dia">
                <MyDay />
              </ProtectedRoute>

              <ProtectedRoute exact path="/metas">
                <Goals />
              </ProtectedRoute>

              {/* Rotas Configuração do sistema */}

              <ProtectedRoute path="/configuracoes">
                <SectionConfigSystem />
              </ProtectedRoute>
              {/* Rotas de configuração da categoria */}

              <ProtectedRoute exact path="/categoria">
                <CategoryList />
              </ProtectedRoute>

              <ProtectedRoute exact path="/categoria/form">
                <CategoryForm />
              </ProtectedRoute>

              <ProtectedRoute path="/categoria/form/:id">
                <CategoryForm />
              </ProtectedRoute>
              {/* Rotas de configuração da record type */}

              <ProtectedRoute exact path="/record-type">
                <RecordTypeList />
              </ProtectedRoute>
              <ProtectedRoute exact path="/record-type/form">
                <RecordTypeForm />
              </ProtectedRoute>
              <ProtectedRoute path="/record-type/form/:id">
                <RecordTypeForm />
              </ProtectedRoute>
              {/* Rotas de configuração da custom fields */}

              <ProtectedRoute exact path="/custom-fields">
                <CustomFieldsList />
              </ProtectedRoute>
              <ProtectedRoute exact path="/custom-fields/form">
                <CustomFieldForm />
              </ProtectedRoute>
              <ProtectedRoute path="/custom-fields/form/:id">
                <CustomFieldForm />
              </ProtectedRoute>
              {/* Rotas de configuração da relatórios */}

              <ProtectedRoute
                exact
                path="/relatorios/categoria/relatorio-mesal/form"
              >
                <ReportMonthlyRecordForm />
              </ProtectedRoute>

              <ProtectedRoute
                exact
                path="/relatorios/categoria/relatorio-mesal/:id"
              >
                <ReportMonthlyRecordList />
              </ProtectedRoute>

              <ProtectedRoute path="/relatorios/categoria/relatorio-mesal/form/:id">
                <ReportMonthlyRecordForm />
              </ProtectedRoute>

              {/* Rotas de Transactions records categoria */}

              <ProtectedRoute exact path="/relatorios/categoria/transações">
                <TransactionList />
              </ProtectedRoute>

              <ProtectedRoute
                exact
                path="/relatorios/categoria/transações/form"
              >
                <TransactionForm />
              </ProtectedRoute>
              <ProtectedRoute
                exact
                path="/relatorios/categoria/transações/form/:id"
              >
                <TransactionForm />
              </ProtectedRoute>

              {/* Rotas para anotações */}

              <ProtectedRoute exact path="/anotacoes">
                <Calendar />
              </ProtectedRoute>

              {/* Rotas para Dashboard */}
              <ProtectedRoute exact path="/dashboard/categoria">
                <DashboardCategoryManager />
              </ProtectedRoute>
            </Switch>
          </Layout>
        </Suspense>
      </UserProvider>
    </Router>
  );
}

export default App;
