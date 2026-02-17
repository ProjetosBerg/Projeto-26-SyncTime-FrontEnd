import { useState, useEffect, useRef } from 'react';
import DashboardCategory from './dashboard/dashboardCategory';
import ServiceDashboard from '../services/ServiceDashboard';
import ServiceCategory from '../../sectionConfigSystem/Sections/Report/Category/services/ServiceCategory';
import TableHeaderWithFilterDashboard from '../../../components/header/TableHeaderWithFilter/TableHeaderWithFilterDashboard';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import styles from '../category/dashboard/dashboardCategory.module.css';



const DashboardCategoryManager = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [chartsReady, setChartsReady] = useState(false);

  const chartRefs = useRef([]);
  const dashboardRef = useRef(null);
  
  const handleChartsRendered = () => {
    setChartsReady(true);
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await ServiceCategory.getByAllCategory();
        setCategories(response.data.data || []);
      } catch (err) {
        console.error('Erro ao carregar categorias', err);
      }
    };
    loadCategories();
  }, []);

  const loadDashboard = async (appliedFilters = {}) => {
    setLoading(true);
    setChartsReady(false); 
    chartRefs.current = []; 
    
    try {
      const params = {
        startDate: appliedFilters.startDate || '',
        endDate: appliedFilters.endDate || '',
        groupBy: appliedFilters.groupBy || 'month',
        categoryId: appliedFilters.categoryId || ''
      };
      Object.assign(params, appliedFilters);

      const response = await ServiceDashboard.getDashboardCategory(
        1, '', '', params.categoryId, params.groupBy,
        params.startDate, params.endDate
      );

      if (response.data.status === 'OK') {
        setDashboardData(response.data.data);
      }
    } catch (err) {
      console.error('Erro ao carregar dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleFiltersChange = async (appliedFilters) => {
    
    const newFilters = {};  
    
    appliedFilters.forEach(f => {
      newFilters[f.column] = f.value || '';
    });
    
    setFilters(newFilters || {});
    await loadDashboard(newFilters || {});
  };

 const handleExport = async () => {
  if (!chartsReady) {
    alert('Aguarde os gráficos carregarem completamente antes de exportar. Isso pode demorar alguns segundos.');
    return;
  }

  if (!dashboardRef.current) {
    alert('Erro de referência. Tente novamente ou recarregue o dashboard.');
    return;
  }

  const chartNodes = dashboardRef.current.querySelectorAll('.chart-card');

  if (chartNodes.length === 0) {
    alert('Erro de referência. Tente novamente ou recarregue o dashboard.');
    return;
  }

  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    background: 'rgba(0,0,0,0.95)', color: 'white', zIndex: 99999,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    fontSize: '2rem', fontWeight: 'bold', gap: '20px',
  });
  overlay.innerHTML = `
    <div style="animation: pulse 1.5s infinite;">Gerando PDF...</div>
    <div style="font-size:1.2rem; opacity:0.9;">Isso pode levar alguns segundos</div>
  `;
  document.body.appendChild(overlay);

  try {
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPos = 10;

    window.dispatchEvent(new Event('resize'));
    await new Promise(r => setTimeout(r, 800)); 

    for (let i = 0; i < chartNodes.length; i++) {
      const node = chartNodes[i];
      if (!node || !document.body.contains(node)) continue;

      // ✅ ESCONDER BOTÕES DE REMOVER ANTES DE CAPTURAR
      const removeButtons = node.querySelectorAll(`.${styles.removeButton}`);
      removeButtons.forEach(btn => {
        btn.style.display = 'none';
      });

      node.style.background = '#ffffff';
      node.style.padding = '20px';
      node.style.borderRadius = '12px';
      node.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      node.style.color = '#000000';

      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await new Promise(r => setTimeout(r, 600)); 

      const dataUrl = await toPng(node, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: '#ffffff',
        cacheBust: true,
        skipFonts: false,
        style: {
          background: '#ffffff',
          transform: 'scale(1)'
        },
        filter: (element) => {
          return !element.classList?.contains('recharts-tooltip') &&
                 !element.classList?.contains(styles.removeButton);
        }
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const imgWidth = 260;
      const imgHeight = (img.height * imgWidth) / img.width;

      if (yPos + imgHeight + 10 > pageHeight && i > 0) {
        pdf.addPage();
        yPos = 10;
      }

      pdf.addImage(dataUrl, 'PNG', 20, yPos, imgWidth, imgHeight);
      yPos += imgHeight + 12;

      removeButtons.forEach(btn => {
        btn.style.display = '';
      });

      node.style.background = '';
      node.style.padding = '';
      node.style.borderRadius = '';
      node.style.boxShadow = '';
    }

    pdf.save(`dashboard-categorias-${new Date().toISOString().slice(0, 10)}.pdf`);
    alert('PDF gerado com sucesso!');
  } catch (err) {
    console.error('Erro fatal no PDF:', err);
    alert('Erro ao gerar PDF. Tente novamente ou diminua o zoom da página (Ctrl + -).');
  } finally {
    document.body.removeChild(overlay);
    document.body.style.overflow = '';
    window.scrollTo(0, 0);
  }
};

  const filterColumns = [
    { id: 'categoryId', label: 'Categoria', type: 'selectSimple',
      options: [{ value: '', label: 'Todas' }, ...categories.map(c => ({ value: c.id, label: c.name }))] },
    { id: 'startDate', label: 'Data Inicial', type: 'date' },
    { id: 'endDate', label: 'Data Final', type: 'date' },
    { id: 'groupBy', label: 'Agrupar por', type: 'selectSimple',
      options: [
        { value: 'day', label: 'Dia' },
        { value: 'week', label: 'Semana' },
        { value: 'month', label: 'Mês' },
        { value: 'year', label: 'Ano' }
      ]
    }
  ];

  return (
    <div>
      <TableHeaderWithFilterDashboard
        title="Dashboard de Categorias"
        columns={filterColumns}
        onFiltersChange={handleFiltersChange}
        isExportacao={true}
        onExport={handleExport}
        desabilitarExportacao={!chartsReady}
      />

      <DashboardCategory
        ref={dashboardRef}
        data={dashboardData}
        loading={loading}
        filters={filters}
        chartRefs={chartRefs}
        onChartsRendered={handleChartsRendered}
        setChartsReady={setChartsReady}
        categories={categories}
      />
    </div>
  );
};

export default DashboardCategoryManager;