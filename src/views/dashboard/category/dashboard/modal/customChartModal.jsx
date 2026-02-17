import { X, BarChart as BarChartIcon, LineChart as LineChartIcon, AreaChart as AreaChartIcon, PieChart as PieChartIcon, ScatterChart as ScatterChartIcon, Radar as RadarIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import styles from './customChartModal.module.css';
import { useTheme } from './../../../../../hooks/useTheme';

const CustomChartModal = ({
  show,
  onClose,
  onSubmit,
  currentSection,
  getDataOptions,
}) => {
  const { theme } = useTheme(); 
  const [chartConfig, setChartConfig] = useState({
    title: '',
    chartType: 'BarChart',
    dataSource: '',
    xAxis: '',
    yAxis: '',
    additionalMetrics: [],
    customFieldLabel: null
  });

  useEffect(() => {
    const options = getDataOptions(currentSection);
    const initialDataSource = options[0]?.value || '';
    setChartConfig({
      title: '',
      chartType: 'BarChart',
      dataSource: initialDataSource,
      xAxis: '',
      yAxis: '',
      additionalMetrics: [],
      customFieldLabel: null
    });
  }, [currentSection]);

  if (!show) return null;

  const chartTypeOptions = [
    { value: 'BarChart', label: 'Barras', icon: BarChartIcon },
    { value: 'LineChart', label: 'Linhas', icon: LineChartIcon },
    { value: 'AreaChart', label: 'Área', icon: AreaChartIcon },
    { value: 'PieChart', label: 'Pizza', icon: PieChartIcon },
    { value: 'ScatterChart', label: 'Dispersão', icon: ScatterChartIcon },
    { value: 'RadarChart', label: 'Radar', icon: RadarIcon }
  ];

  const currentFields = () => {
    const options = getDataOptions(currentSection);
    const source = options.find((s) => s.value === chartConfig.dataSource);
    return source?.fields || [];
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!chartConfig.dataSource || !chartConfig.xAxis || !chartConfig.yAxis || !chartConfig.title) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }
    onSubmit(chartConfig);
  };

  const handleDataSourceChange = (e) => {
    setChartConfig({ 
      ...chartConfig, 
      dataSource: e.target.value, 
      xAxis: '', 
      yAxis: '', 
      additionalMetrics: [] 
    });
  };

  return (
    <div className={`${styles.modalOverlay} ${styles[theme]}`}>
      <div className={`${styles.modalContent} ${styles[theme]}`}>
        <div className={`${styles.modalInner} ${styles[theme]}`}>
          <div className={`${styles.modalHeader} ${styles[theme]}`}>
            <h3 className={`${styles.modalTitle} ${styles[theme]}`}>
              Criar Gráfico Customizado para {currentSection === 'categories' ? 'Insights de Categorias' : currentSection === 'customFields' ? 'Insights de Campos Customizados' : currentSection === 'transactions' ? 'Insights de Transações' : currentSection === 'evolution' ? 'Evolução e Relações' : 'Progresso de Metas'}
            </h3>
            <button onClick={onClose} className={`${styles.closeButton} ${styles[theme]}`}>
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleFormSubmit} className={`${styles.modalForm} ${styles[theme]}`}>
            <div className={styles.formGroup}>
              <label className={`${styles.formLabel} ${styles[theme]}`}>Título do Gráfico</label>
              <input
                type="text"
                value={chartConfig.title}
                onChange={(e) => setChartConfig({ ...chartConfig, title: e.target.value })}
                className={`${styles.input} ${styles[theme]}`}
                placeholder="Ex: Análise de Vendas Mensais"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={`${styles.formLabel} ${styles[theme]}`}>Tipo de Gráfico</label>
              <div className={styles.chartTypeGrid}>
                {chartTypeOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setChartConfig({ ...chartConfig, chartType: option.value })}
                    className={`${styles.chartTypeButton} ${styles[theme]} ${chartConfig.chartType === option.value ? styles.chartTypeSelected : ''}`}
                    type="button"
                  >
                    <option.icon size={24} />
                    <span className={`${styles.chartTypeLabel} ${styles[theme]}`}>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={`${styles.formLabel} ${styles[theme]}`}>Fonte de Dados</label>
              <select
                value={chartConfig.dataSource}
                onChange={handleDataSourceChange}
                className={`${styles.select} ${styles[theme]}`}
              >
                <option value="">Selecione...</option>
                {getDataOptions(currentSection).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.axisGrid}>
              <div className={styles.formGroup}>
                <label className={`${styles.formLabel} ${styles[theme]}`}>Eixo X</label>
                <select
                  value={chartConfig.xAxis}
                  onChange={(e) => setChartConfig({ ...chartConfig, xAxis: e.target.value })}
                  className={`${styles.select} ${styles[theme]}`}
                >
                  <option value="">Selecione...</option>
                  {currentFields().map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={`${styles.formLabel} ${styles[theme]}`}>Eixo Y Principal</label>
                <select
                  value={chartConfig.yAxis}
                  onChange={(e) => setChartConfig({ ...chartConfig, yAxis: e.target.value })}
                  className={`${styles.select} ${styles[theme]}`}
                >
                  <option value="">Selecione...</option>
                  {currentFields().map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className={`${styles.modalButtons} ${styles[theme]}`}>
              <button
                type="button"
                onClick={onClose}
                className={`${styles.cancelButton} ${styles[theme]}`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!chartConfig.title || !chartConfig.dataSource || !chartConfig.xAxis || !chartConfig.yAxis}
                className={`${styles.submitButton} ${styles[theme]}`}
              >
                Criar Gráfico
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomChartModal;