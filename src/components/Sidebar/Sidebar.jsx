// ⚙️ React e bibliotecas externas
import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaChartBar,
  FaFileAlt,
  FaStickyNote,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaChevronRight
} from 'react-icons/fa';

// 💅 Estilos
import styles from './Sidebar.module.css';

// 🧠 Hooks customizados
import { useTheme } from '../../hooks/useTheme';
import { useEmphasisColor } from '../../hooks/useEmphasisColor';

// 📡 Services
import ServiceCategory from '../../views/sectionConfigSystem/Sections/Report/Category/services/ServiceCategory';
import useAuth from '../../hooks/userAuth';

// 🔗 Ícones Lucide
import { iconMap } from '../../utils/iconsConfig';
import Mascote from '../../assets/mascote-synctime.png'


function Sidebar({ onToggle }) {
  const location = useLocation();
  const { theme } = useTheme();
  const { emphasisColor } = useEmphasisColor();
  const { logout } = useAuth();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isRelatoriosOpen, setIsRelatoriosOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState({});
  const [relatoriosSubMenu, setRelatoriosSubMenu] = useState([]);
  const [isLoadingRelatorios, setIsLoadingRelatorios] = useState(true);
  const [errorRelatorios, setErrorRelatorios] = useState(null);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [dashboardSubMenu, setDashboardSubMenu] = useState([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);

  const showExpanded = !isMinimized || isHovered || (isMobile && isMobileOpen);

  const fetchDashboardMenu = useCallback(async () => {
    try {
      setIsLoadingDashboard(true);
      const mockData = [
        { id: 1, name: 'Categoria', path: '/dashboard/categoria' },
      ];
      setDashboardSubMenu(mockData);
  
    } catch (err) {
      console.error('Erro ao carregar menu do Dashboard:', err);
    } finally {
      setIsLoadingDashboard(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoadingRelatorios(true);
      setErrorRelatorios(null);

      const response = await ServiceCategory.getByAllSideBarCategory(true);

      if (response.data.status === 'OK' && response.data.data) {
        const groupedData = response.data.data.reduce((acc, category) => {
          const recordTypeId = category.record_type_id;

          if (!acc[recordTypeId]) {
            acc[recordTypeId] = {
              id: recordTypeId,
              name: category.record_type_name,
              icon: category.record_type_icone,
              categorias: []
            };
          }

          acc[recordTypeId].categorias.push({
            id: category.id,
            name: category.name,
            description: category.description,
            type: category.type,
            path: `/relatorios/categoria/relatorio-mesal/${category.id}`
          });

          return acc;
        }, {});

        const menuData = Object.values(groupedData);
        setRelatoriosSubMenu(menuData);
      }
    } catch (err) {
      console.error('Erro ao buscar categorias:', err);
      setErrorRelatorios('Erro ao carregar categorias');
    } finally {
      setIsLoadingRelatorios(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchDashboardMenu();
  }, [fetchCategories, fetchDashboardMenu]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setIsMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    window.addEventListener('refreshSidebar', fetchCategories);
    return () => window.removeEventListener('refreshSidebar', fetchCategories);
  }, [fetchCategories]);

  useEffect(() => {
    if (location.pathname.startsWith('/relatorios')) {
      setIsRelatoriosOpen(true);
    }
    if (location.pathname.startsWith('/dashboard')) {
      setIsDashboardOpen(true);
    }

    relatoriosSubMenu.forEach((recordType) => {
      recordType.categorias?.forEach((cat) => {
        if (location.pathname === cat.path) {
          setOpenCategories(prev => ({ ...prev, [recordType.id]: true }));
        }
      });
    });
  }, [location.pathname, relatoriosSubMenu]);

  useEffect(() => {
    if (onToggle) {
      const effectiveMinimized = isMinimized && !isHovered;
      onToggle(effectiveMinimized, isMobile);
    }
  }, [isMinimized, isHovered, isMobile, onToggle]);

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (path) => location.pathname === path ? styles.active : '';

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    setIsHovered(false);
  };

  const toggleMobileMenu = () => setIsMobileOpen(!isMobileOpen);
  const closeMobileMenu = () => { if (isMobile) setIsMobileOpen(false); };

  const handleMouseEnter = () => { if (isMinimized && !isMobile) setIsHovered(true); };
  const handleMouseLeave = (e) => {
    if (isMinimized && !isMobile) {
      const sidebar = e.currentTarget;
      const rect = sidebar.getBoundingClientRect();
      if (e.clientX <= rect.left || e.clientX >= rect.right + 10) {
        setIsHovered(false);
      }
    }
  };

  const toggleCategory = (categoryId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  return (
    <>
      {isMobile && (
        <button className={styles.mobileToggle} onClick={toggleMobileMenu} aria-label="Toggle menu">
          <FaBars />
        </button>
      )}

      {isMobile && isMobileOpen && <div className={styles.overlay} onClick={closeMobileMenu}></div>}

      <aside
        className={`${styles.sidebar} ${styles[theme]} 
          ${isMinimized && !isMobile ? styles.minimized : ''} 
          ${isHovered ? styles.hovered : ''} 
          ${isMobile && isMobileOpen ? styles.mobileOpen : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={styles.sidebarHeader} style={{ backgroundColor: emphasisColor || 'rgb(20, 18, 129)' }}>
          {showExpanded && (
            <div className={styles.logoContainer}>
              <img src={Mascote} alt="Logo" className={styles.logo}  />
            </div>
          )}

          {!isMobile && (
            <button className={styles.toggleButton} onClick={toggleMinimize} aria-label={isMinimized ? 'Expandir' : 'Minimizar'}>
              {isMinimized ? <FaBars /> : <FaTimes />}
            </button>
          )}

          {isMobile && (
            <button className={styles.closeButton} onClick={closeMobileMenu} aria-label="Fechar">
              <FaTimes />
            </button>
          )}
        </div>

        <nav className={styles.mainMenu}>
          {showExpanded && <h3 className={styles.menuTitle}>Principal</h3>}
          <ul className={styles.menuList}>
            <li>
              <Link to="/inicio" className={`${styles.menuItem} ${isActive('/inicio')}`} onClick={closeMobileMenu}>
                <FaHome className={styles.icon} />
                {showExpanded && <span>Início</span>}
              </Link>
            </li>

            <li>
              <div className={styles.menuItemWrapper}>
                <button
                  className={`${styles.menuItem} ${styles.menuItemDropdown} ${
                    location.pathname.startsWith('/dashboard') ? styles.active : ''
                  }`}
                  onClick={() => setIsDashboardOpen(!isDashboardOpen)}
                >
                  <FaChartBar className={styles.icon} />
                  {showExpanded && (
                    <>
                      <span>Dashboard</span>
                      <span className={styles.dropdownIcon}>
                        {isDashboardOpen ? <FaChevronDown /> : <FaChevronRight />}
                      </span>
                    </>
                  )}
                </button>

                {showExpanded && isDashboardOpen && (
                  <ul className={styles.submenu}>
                    {isLoadingDashboard ? (
                      <li className={styles.loadingItem}>Carregando...</li>
                    ) : dashboardSubMenu.length === 0 ? (
                      <li className={styles.emptyItem}>Nenhum item disponível</li>
                    ) : (
                      dashboardSubMenu.map(item => (
                        <li key={item.id}>
                          <Link
                            to={item.path}
                            className={`${styles.submenuItem} ${isActive(item.path)}`}
                            onClick={closeMobileMenu}
                            style={
                              location.pathname === item.path
                                ? { borderLeftColor: emphasisColor || '#3b82f6', color: emphasisColor || '#3b82f6' }
                                : {}
                            }
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
            </li>

            <li>
              <div className={styles.menuItemWrapper}>
                <button
                  className={`${styles.menuItem} ${styles.menuItemDropdown} ${
                    location.pathname.startsWith('/relatorios') ? styles.active : ''
                  }`}
                  onClick={() => setIsRelatoriosOpen(!isRelatoriosOpen)}
                >
                  <FaFileAlt className={styles.icon} />
                  {showExpanded && (
                    <>
                      <span>Relatórios</span>
                      <span className={styles.dropdownIcon}>
                        {isRelatoriosOpen ? <FaChevronDown /> : <FaChevronRight />}
                      </span>
                    </>
                  )}
                </button>

                {showExpanded && isRelatoriosOpen && (
                  <ul className={styles.submenu}>
                    {isLoadingRelatorios ? (
                      <li className={styles.loadingItem}>Carregando...</li>
                    ) : errorRelatorios ? (
                      <li className={styles.errorItem}>{errorRelatorios}</li>
                    ) : relatoriosSubMenu.length === 0 ? (
                      <li className={styles.emptyItem}>Nenhuma categoria encontrada</li>
                    ) : (
                      relatoriosSubMenu.map(recordType => {
                        const Icon = iconMap[recordType.icon];
                        return (
                          <li key={recordType.id}>
                            <button
                              className={`${styles.submenuItem} ${styles.submenuItemDropdown}`}
                              onClick={(e) => toggleCategory(recordType.id, e)}
                            >
                              {Icon && <Icon className={styles.icon} />}
                              <span>{recordType.name}</span>
                              <span className={styles.submenuArrow}>
                                {openCategories[recordType.id] ? <FaChevronDown /> : <FaChevronRight />}
                              </span>
                            </button>

                            {openCategories[recordType.id] && recordType.categorias && (
                              <ul className={styles.subSubmenu}>
                                {recordType.categorias.map(categoria => (
                                  <li key={categoria.id}>
                                    <Link
                                      to={categoria.path}
                                      className={`${styles.subSubmenuItem} ${isActive(categoria.path)}`}
                                      onClick={closeMobileMenu}
                                      style={
                                        location.pathname === categoria.path
                                          ? { borderLeftColor: emphasisColor || '#3b82f6', color: emphasisColor || '#3b82f6' }
                                          : {}
                                      }
                                    >
                                      {categoria.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        );
                      })
                    )}
                  </ul>
                )}
              </div>
            </li>

            <li>
              <Link to="/anotacoes" className={`${styles.menuItem} ${isActive('/anotacoes')}`} onClick={closeMobileMenu}>
                <FaStickyNote className={styles.icon} />
                {showExpanded && <span>Anotações</span>}
              </Link>
            </li>
          </ul>
        </nav>

        <nav className={styles.settingsMenu}>
          {showExpanded && <h3 className={styles.menuTitle}>Configurações</h3>}
          <ul className={styles.menuList}>
            <li>
              <Link to="/configuracoes" className={`${styles.menuItem} ${isActive('/configuracoes')}`} onClick={closeMobileMenu}>
                <FaCog className={styles.icon} />
                {showExpanded && <span>Configuração do Sistema</span>}
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} className={styles.menuItem}>
                <FaSignOutAlt className={styles.icon} />
                {showExpanded && <span>Logout</span>}
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;