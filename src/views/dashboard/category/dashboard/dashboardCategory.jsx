import styles from './dashboardCategory.module.css';
import { useTheme } from './../../../../hooks/useTheme';
import { useEmphasisColor } from './../../../../hooks/useEmphasisColor';
import {
  forwardRef,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import {
  Activity,
  BadgeDollarSign,
  ChartNoAxesCombined,
  Plus,
  ReceiptText,
  Sigma,
  Sparkles,
  Tags,
  X
} from 'lucide-react';
import DashboardChart from './DashboardChart';

const CustomChartModal = lazy(() => import('./modal/customChartModal'));
const CustomSummaryModal = lazy(() => import('./modal/customSummaryModal'));

const DashboardCategory = forwardRef(
  (
    {
      data,
      loading,
      filters,
      chartRefs,
      onChartsRendered,
      setChartsReady,
      categories
    },
    ref
  ) => {
    const { theme } = useTheme();
    const { emphasisColor } = useEmphasisColor();

    const registeredCharts = useRef(0);
    const totalExpectedCharts = useRef(0);
    const hasCalledReady = useRef(false);

    const [showModal, setShowModal] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [currentSection, setCurrentSection] = useState('');
    const [customCharts, setCustomCharts] = useState({});
    const [selectedCustomSummaries, setSelectedCustomSummaries] = useState([]);

    const isFinancialCategory = () => {
      if (!filters?.categoryId || !categories || categories.length === 0) {
        return true;
      }

      const selectedCategory = categories.find(
        (cat) => cat.id === filters.categoryId
      );
      return selectedCategory?.type === 'financeiro';
    };

    const showFinancialMetrics = isFinancialCategory();

    useEffect(() => {
      chartRefs.current = [];
      registeredCharts.current = 0;
      totalExpectedCharts.current = 0;
      hasCalledReady.current = false;
    }, [data, chartRefs]);

    useEffect(() => {
      if (data) {
        let count = 3;
        count += customCharts['categories']?.length || 0;
        count += data.customFieldValueCounts?.length || 0;
        count += customCharts['customFields']?.length || 0;
        count += 4;
        count += customCharts['transactions']?.length || 0;
        count += 2;
        count += customCharts['evolution']?.length || 0;

        if (showFinancialMetrics) {
          count += 1;
        }
        count += customCharts['progress']?.length || 0;

        totalExpectedCharts.current = count;

        const fallbackTimer = setTimeout(() => {
          if (!hasCalledReady.current && onChartsRendered) {
            console.warn('⚠️ FALLBACK: Forçando onChartsRendered após timeout');
            hasCalledReady.current = true;
            onChartsRendered();
          }
        }, 5000);

        return () => clearTimeout(fallbackTimer);
      }
    }, [data, customCharts, onChartsRendered, showFinancialMetrics]);

    const addChartRef = (el) => {
      if (!el || chartRefs.current.includes(el)) {
        if (el) {
          console.log('⚠️ Elemento já registrado, ignorando duplicata');
        }
        return;
      }

      chartRefs.current.push(el);
      registeredCharts.current += 1;

      if (
        totalExpectedCharts.current > 0 &&
        registeredCharts.current >= totalExpectedCharts.current &&
        !hasCalledReady.current &&
        onChartsRendered
      ) {
        hasCalledReady.current = true;
        setTimeout(() => {
          onChartsRendered();
        }, 1500);
      }
    };

    const handleOpenModal = (section) => {
      setCurrentSection(section);
      setShowModal(true);
    };

    const handleCloseModal = () => {
      setShowModal(false);
    };

    const handleSubmit = (config) => {
      if (
        !config.dataSource ||
        !config.xAxis ||
        !config.yAxis ||
        !config.title
      ) {
        alert('Preencha todos os campos obrigatórios.');
        return;
      }
      setChartsReady(false);
      setCustomCharts((prev) => ({
        ...prev,
        [currentSection]: [
          ...(prev[currentSection] || []),
          { ...config, id: Date.now() }
        ]
      }));
      setShowModal(false);
      setTimeout(() => {
        setChartsReady(true);
      }, 1500);
    };

    const handleRemoveChart = (id, section) => {
      setChartsReady(false);
      setCustomCharts((prev) => ({
        ...prev,
        [section]: prev[section].filter((c) => c.id !== id)
      }));
      setTimeout(() => {
        chartRefs.current = chartRefs.current.filter(
          (node) => node && document.body.contains(node)
        );
        setChartsReady(true);
      }, 500);
    };

    const handleOpenSummaryModal = () => {
      setShowSummaryModal(true);
    };

    const handleCloseSummaryModal = () => {
      setShowSummaryModal(false);
    };

    const handleSummarySubmit = (selected) => {
      setSelectedCustomSummaries(selected);
      setShowSummaryModal(false);
    };

    const getDataOptions = useCallback(
      (section) => {
        switch (section) {
          case 'categories':
            return [
              {
                value: 'distributionRecordType',
                label: 'Distribuição de Categorias por Record Type',
                fields: ['name', 'value']
              },
              {
                value: 'transactionCount',
                label: 'Distribuição de Contagem de Transações por Categoria',
                fields: ['name', 'count']
              },
              {
                value: 'categoryType',
                label: 'Contagem por Tipo de Categoria',
                fields: ['type', 'transactionCount', 'categoryCount']
              }
            ];
          case 'customFields':
            return (
              data.customChartsData?.customFields?.flatMap((field) => {
                const options = [
                  {
                    value: field.label,
                    label: `Contagem: ${field.label}`,
                    fields: ['name', 'count']
                  }
                ];
                if (field.sums?.length > 0) {
                  options.push({
                    value: `${field.label}_sum`,
                    label: `Soma: ${field.label}`,
                    fields: ['name', 'total']
                  });
                }
                return options;
              }) || []
            );
          case 'transactions':
            return [
              {
                value: 'transactionsByCategory',
                label: 'Transações por Categoria',
                fields: ['category', 'transactions']
              },
              {
                value: 'statusDistribution',
                label: 'Distribuição de Status',
                fields: ['name', 'count', 'percentage']
              },
              {
                value: 'dateHistogram',
                label: 'Histograma de Datas',
                fields: ['periodLabel', 'totalTransactions']
              },
              {
                value: 'valueHistogram',
                label: 'Histograma de Valores',
                fields: ['bin', 'count', 'totalAmount']
              }
            ];
          case 'evolution':
            return [
              {
                value: 'timeEvolution',
                label: 'Evolução Temporal',
                fields: ['periodLabel', 'totalAmount', 'totalTransactions']
              },
              {
                value: 'recordsVsAverage',
                label: 'Relação: Nº de Registros × Valor Médio',
                fields: ['recordsCount', 'averageAmount', 'totalAmount']
              }
            ];
          case 'progress':
            return [
              {
                value: 'progressByRecord',
                label: 'Progresso por Registro',
                fields: ['title', 'initialBalance', 'currentTotal']
              }
            ];
          default:
            return [];
        }
      },
      [data?.customChartsData]
    );

    const renderCustomChart = (section, chart) => {
      let chartData = [];
      let chartProps = {};

      const customData = data.customChartsData || {};

      if (section === 'categories') {
        if (chart.dataSource === 'distributionRecordType') {
          chartData = customData.categories.distributionRecordType || [];
          chartProps = {
            dataKey: 'value',
            nameKey: 'name',
            innerRadius: 85,
            outerRadius: 130,
            paddingAngle: 3,
            cornerRadius: 12
          };
        } else if (chart.dataSource === 'transactionCount') {
          chartData = customData.categories.transactionCount || [];
          chartProps = {
            dataKey: 'count',
            nameKey: 'name',
            innerRadius: 85,
            outerRadius: 130,
            paddingAngle: 3,
            cornerRadius: 12
          };
        } else if (chart.dataSource === 'categoryType') {
          chartData = customData.categories.categoryType || [];
          chartProps = {
            xDataKey: 'type',
            bars: [
              {
                dataKey: 'transactionCount',
                fill: '#10b981',
                name: 'Transações'
              },
              { dataKey: 'categoryCount', fill: '#3b82f6', name: 'Categorias' }
            ]
          };
        }
      } else if (section === 'customFields') {
        const isSum = chart.dataSource.endsWith('_sum');
        const label = isSum
          ? chart.dataSource.replace(/_sum$/, '')
          : chart.dataSource;
        const field = customData.customFields?.find((f) => f.label === label);
        if (field) {
          chartData = isSum
            ? (field.sums || []).filter((d) => d.total > 0)
            : (field.data || []).filter((d) => d.count > 0);
          chartProps = {
            xDataKey: 'name',
            bars: [
              {
                dataKey: isSum ? 'total' : 'count',
                fill: '#8b5cf6',
                name: isSum ? 'Soma' : 'Contagem'
              }
            ]
          };
        }
      } else if (section === 'transactions') {
        if (chart.dataSource === 'transactionsByCategory') {
          chartData = customData.transactions.transactionsByCategory || [];
          chartProps = {
            xDataKey: 'category',
            bars: [
              {
                dataKey: 'transactions',
                fill: '#10b981',
                name: 'Nº de Transações'
              }
            ]
          };
        } else if (chart.dataSource === 'statusDistribution') {
          chartData = customData.transactions.statusDistribution || [];
          chartProps = {
            dataKey: 'count',
            nameKey: 'name',
            innerRadius: 85,
            outerRadius: 130,
            paddingAngle: 3,
            cornerRadius: 12
          };
        } else if (chart.dataSource === 'dateHistogram') {
          chartData = customData.transactions.dateHistogram || [];
          chartProps = {
            xDataKey: 'periodLabel',
            bars: [
              {
                dataKey: 'totalTransactions',
                fill: '#ec4899',
                name: 'Transações'
              }
            ]
          };
        } else if (chart.dataSource === 'valueHistogram') {
          chartData = customData.transactions.valueHistogram || [];
          chartProps = {
            xDataKey: 'bin',
            bars: [
              { dataKey: 'count', fill: '#f59e0b', name: 'Contagem' },
              { dataKey: 'totalAmount', fill: '#ef4444', name: 'Valor Total' }
            ]
          };
        }
      } else if (section === 'evolution') {
        if (chart.dataSource === 'timeEvolution') {
          chartData = customData.evolution.timeEvolution || [];
          chartProps = {
            xDataKey: 'periodLabel',
            lines: [
              {
                dataKey: 'totalAmount',
                stroke: '#3b82f6',
                name: 'Valor Total',
                area: true
              },
              {
                dataKey: 'totalTransactions',
                stroke: '#10b981',
                name: 'Transações'
              }
            ]
          };
        } else if (chart.dataSource === 'recordsVsAverage') {
          chartData = customData.evolution.recordsVsAverage || [];
          chartProps = {
            xDataKey: 'recordsCount',
            yDataKey: 'averageAmount',
            zDataKey: 'totalAmount',
            scatterName: 'Categorias',
            fill: '#8b5cf6'
          };
        }
      } else if (section === 'progress') {
        if (chart.dataSource === 'progressByRecord') {
          chartData = customData.progress.progressByRecord || [];
          chartProps = {
            layout: 'vertical',
            xType: 'number',
            yDataKey: 'title',
            bars: [
              {
                dataKey: 'initialBalance',
                fill: '#06b6d4',
                name: 'Saldo Inicial',
                stackId: 'a'
              },
              {
                dataKey: 'currentTotal',
                fill: '#10b981',
                name: 'Total Atual',
                stackId: 'a'
              }
            ]
          };
        }
      }

      const chartTypeMap = {
        PieChart: 'doughnut',
        BarChart: 'bar',
        LineChart: 'line',
        AreaChart: 'line',
        ScatterChart: 'bubble',
        RadarChart: 'radar'
      };
      const chartType = chartTypeMap[chart.chartType];

      if (!chartType) return <div>Gráfico não suportado ainda.</div>;

      const metricKeys = [
        chart.yAxis,
        ...(chart.additionalMetrics || [])
      ].filter(Boolean);
      const metricConfig = [
        ...(chartProps.bars || []),
        ...(chartProps.lines || [])
      ];
      const resolveFormat = (key) =>
        /amount|balance|currentTotal|^total$/i.test(key)
          ? 'currency'
          : 'number';
      const metrics = metricKeys.map((key) => {
        const configuredMetric = metricConfig.find(
          (metric) => metric.dataKey === key
        );
        return {
          key,
          label: configuredMetric?.name || key,
          color: configuredMetric?.fill || configuredMetric?.stroke,
          fill:
            chart.chartType === 'AreaChart' || Boolean(configuredMetric?.area),
          stack: configuredMetric?.stackId,
          format: resolveFormat(key)
        };
      });
      const horizontal = chartProps.layout === 'vertical';
      const primaryFormat = metrics[0]?.format;

      return (
        <DashboardChart
          type={chartType}
          rows={chartData}
          labelKey={chart.xAxis || chartProps.nameKey || 'name'}
          metrics={metrics}
          theme={theme}
          height={chartType === 'doughnut' ? 400 : 360}
          horizontal={horizontal}
          stacked={metrics.some((metric) => metric.stack)}
          axisFormats={horizontal ? { x: primaryFormat } : { y: primaryFormat }}
          bubbleKeys={
            chartType === 'bubble'
              ? {
                  x: chart.xAxis,
                  y: chart.yAxis,
                  radius: chart.additionalMetrics?.[0] || chartProps.zDataKey
                }
              : undefined
          }
        />
      );
    };

    if (loading) {
      return (
        <div
          className={`${styles.container} ${styles[theme]}`}
          style={{ '--dashboard-accent': emphasisColor || '#3b82f6' }}
          aria-busy="true"
          aria-label="Carregando dashboard"
        >
          <div className={styles.skeletonSummary}>
            {Array.from({ length: 4 }, (_, index) => (
              <span key={index} className={styles.skeletonSummaryCard} />
            ))}
          </div>
          <div className={styles.skeletonSection}>
            <span className={styles.skeletonTitle} />
            <div className={styles.skeletonCharts}>
              {Array.from({ length: 2 }, (_, index) => (
                <span key={index} className={styles.skeletonChart} />
              ))}
            </div>
          </div>
        </div>
      );
    }
    if (!data) {
      return (
        <div className={`${styles.loading} ${styles[theme]}`}>
          Nenhum dado disponível
        </div>
      );
    }

    const {
      summary,
      barChartData,
      timeSeriesData,
      scatterData,
      transactionCountPieChart,
      statusDistribution,
      categoryTypeBarChart,
      customFieldValueCounts,
      transactionDateHistogram,
      transactionHistogram,
      goalProgressData
    } = data;

    const barDataFiltered = (barChartData || []).filter(
      (d) => d.amount > 0 || d.transactions > 0
    );

    const formatCurrency = (value) =>
      `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
    const formatNumber = (value) => Number(value).toLocaleString('pt-BR');
    const periodLabel =
      {
        day: 'Diário',
        week: 'Semanal',
        month: 'Mensal',
        year: 'Anual'
      }[filters.groupBy] || 'Mensal';

    return (
      <div
        ref={ref}
        className={`${styles.container} ${styles[theme]}`}
        style={{ '--dashboard-accent': emphasisColor || '#3b82f6' }}
      >
        <section className={styles.dashboardHero}>
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.heroContent}>
            <span className={styles.heroEyebrow}>
              <Sparkles size={15} /> Inteligência de produtividade
            </span>
            <h1>Visão clara do seu desempenho</h1>
            <p>
              Acompanhe categorias, transações e evolução em um painel criado
              para transformar dados em decisões.
            </p>
          </div>
          <div className={styles.heroStatus}>
            <span className={styles.heroStatusIcon}>
              <ChartNoAxesCombined size={26} />
            </span>
            <div>
              <span>Período analisado</span>
              <strong>{periodLabel}</strong>
            </div>
          </div>
        </section>

        <section className={styles.metricsSection}>
          <div className={styles.summaryHeader}>
            <div>
              <span className={styles.sectionEyebrow}>Resumo executivo</span>
              <h2>Indicadores principais</h2>
            </div>
            <button
              onClick={handleOpenSummaryModal}
              className={`${styles.addSummaryButton} ${styles[theme]}`}
            >
              <Plus size={18} />
              Adicionar indicador
            </button>
          </div>

          <div className={styles.summaryGrid}>
            <article
              className={`${styles.summaryCard} ${styles[theme]}`}
              style={{ '--metric-accent': '#3b82f6' }}
            >
              <div className={styles.summaryCardTop}>
                <span className={styles.summaryIcon}>
                  <ReceiptText size={22} />
                </span>
                <span className={styles.summaryBadge}>Volume</span>
              </div>
              <h3>Total de transações</h3>
              <p>{formatNumber(summary.totalTransactions)}</p>
              <small>Movimentações no período</small>
            </article>

            {showFinancialMetrics && (
              <>
                <article
                  className={`${styles.summaryCard} ${styles[theme]}`}
                  style={{ '--metric-accent': '#10b981' }}
                >
                  <div className={styles.summaryCardTop}>
                    <span className={styles.summaryIcon}>
                      <BadgeDollarSign size={22} />
                    </span>
                    <span className={styles.summaryBadge}>Financeiro</span>
                  </div>
                  <h3>Valor total</h3>
                  <p>{formatCurrency(summary.totalAmount)}</p>
                  <small>Somatório das transações</small>
                </article>
                <article
                  className={`${styles.summaryCard} ${styles[theme]}`}
                  style={{ '--metric-accent': '#8b5cf6' }}
                >
                  <div className={styles.summaryCardTop}>
                    <span className={styles.summaryIcon}>
                      <Activity size={22} />
                    </span>
                    <span className={styles.summaryBadge}>Média</span>
                  </div>
                  <h3>Média por transação</h3>
                  <p>{formatCurrency(summary.averageTransactionAmount)}</p>
                  <small>Valor médio por movimentação</small>
                </article>
              </>
            )}

            <article
              className={`${styles.summaryCard} ${styles[theme]}`}
              style={{ '--metric-accent': '#f59e0b' }}
            >
              <div className={styles.summaryCardTop}>
                <span className={styles.summaryIcon}>
                  <Tags size={22} />
                </span>
                <span className={styles.summaryBadge}>Estrutura</span>
              </div>
              <h3>Categorias ativas</h3>
              <p>{formatNumber(summary.totalCategories)}</p>
              <small>Categorias com registros</small>
            </article>

            {(data.customChartsData?.customFields || []).map(
              (field, index) =>
                selectedCustomSummaries.includes(field.label) &&
                field.totalSum > 0 && (
                  <article
                    key={field.label}
                    className={`${styles.summaryCard} ${styles[theme]}`}
                    style={{
                      '--metric-accent': ['#06b6d4', '#ec4899', '#6366f1'][
                        index % 3
                      ]
                    }}
                  >
                    <div className={styles.summaryCardTop}>
                      <span className={styles.summaryIcon}>
                        <Sigma size={22} />
                      </span>
                      <span className={styles.summaryBadge}>Customizado</span>
                    </div>
                    <h3>Total de {field.label}</h3>
                    <p>{formatNumber(field.totalSum)}</p>
                    <small>Indicador personalizado</small>
                  </article>
                )
            )}
          </div>
        </section>

        {/* === 1. Insights de Categorias === */}
        <div className={`${styles.section} ${styles[theme]}`}>
          <h2>
            Insights de Categorias
            <button
              onClick={() => handleOpenModal('categories')}
              className={`${styles.customButton} ${styles[theme]}`}
            >
              <Plus size={16} />
              Customizar Gráfico
            </button>
          </h2>
          <div className={styles.chartsGrid}>
            <div
              className={`chart-card ${styles.chartCard} ${styles[theme]}`}
              ref={addChartRef}
            >
              <h3>Distribuição de Categorias por Record Type</h3>
              <DashboardChart
                type="doughnut"
                rows={Object.entries(
                  (summary?.categoryBreakdown || []).reduce((acc, cat) => {
                    if (!cat) return acc;
                    if (!acc[cat.recordTypeName]) {
                      acc[cat.recordTypeName] = {
                        name: cat.recordTypeName,
                        value: 0
                      };
                    }
                    acc[cat.recordTypeName].value += 1;
                    return acc;
                  }, {})
                ).map(([name, item]) => ({ name, value: item.value }))}
                labelKey="name"
                metrics={[{ key: 'value', label: 'Categorias' }]}
                theme={theme}
                height={400}
              />
            </div>

            <div
              className={`chart-card ${styles.chartCard} ${styles[theme]}`}
              ref={addChartRef}
            >
              <h3>Distribuição de Contagem de Transações por Categoria</h3>
              <DashboardChart
                type="doughnut"
                rows={(transactionCountPieChart || []).filter(
                  (item) => item.count > 0
                )}
                labelKey="name"
                metrics={[{ key: 'count', label: 'Transações' }]}
                theme={theme}
                height={400}
              />
            </div>

            <div
              className={`chart-card ${styles.chartCard} ${styles[theme]}`}
              ref={addChartRef}
            >
              <h3>Contagem por Tipo de Categoria</h3>
              <DashboardChart
                rows={categoryTypeBarChart || []}
                labelKey="type"
                metrics={[
                  {
                    key: 'transactionCount',
                    label: 'Transações',
                    color: '#10b981'
                  },
                  {
                    key: 'categoryCount',
                    label: 'Categorias',
                    color: '#3b82f6'
                  }
                ]}
                theme={theme}
              />
            </div>
            {customCharts['categories']?.map((chart) => (
              <div
                key={chart.id}
                className={`chart-card ${styles.chartCard} ${styles[theme]}`}
                ref={addChartRef}
              >
                <div className={styles.customChartHeader}>
                  <h3>{chart.title}</h3>
                  <button
                    onClick={() => handleRemoveChart(chart.id, 'categories')}
                    className={styles.removeButton}
                  >
                    <X size={16} />
                  </button>
                </div>
                {renderCustomChart('categories', chart)}
              </div>
            ))}
          </div>
        </div>

        {/* === 2. Campos Customizados (N gráficos) === */}
        {customFieldValueCounts && customFieldValueCounts.length > 0 && (
          <div className={`${styles.section} ${styles[theme]}`}>
            <h2>
              Insights de Campos Customizados
              <button
                onClick={() => handleOpenModal('customFields')}
                className={`${styles.customButton} ${styles[theme]}`}
              >
                <Plus size={16} />
                Customizar Gráfico
              </button>
            </h2>
            <div className={styles.chartsGrid}>
              {(customFieldValueCounts || []).map((field, idx) => (
                <div
                  key={idx}
                  className={`chart-card ${styles.chartCard} ${styles[theme]}`}
                  ref={addChartRef}
                >
                  <h3>Contagem: {field.label}</h3>
                  <DashboardChart
                    rows={(field.data || []).filter((item) => item.count > 0)}
                    labelKey="name"
                    metrics={[
                      {
                        key: 'count',
                        label: 'Contagem',
                        color: '#8b5cf6'
                      }
                    ]}
                    theme={theme}
                  />
                </div>
              ))}
              {customCharts['customFields']?.map((chart) => (
                <div
                  key={chart.id}
                  className={`chart-card ${styles.chartCard} ${styles[theme]}`}
                  ref={addChartRef}
                >
                  <div className={styles.customChartHeader}>
                    <h3>{chart.title}</h3>
                    <button
                      onClick={() =>
                        handleRemoveChart(chart.id, 'customFields')
                      }
                      className={styles.removeButton}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  {renderCustomChart('customFields', chart)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === 3. Insights de Transações === */}
        <div className={`${styles.section} ${styles[theme]}`}>
          <h2>
            Insights de Transações
            <button
              onClick={() => handleOpenModal('transactions')}
              className={`${styles.customButton} ${styles[theme]}`}
            >
              <Plus size={16} />
              Customizar Gráfico
            </button>
          </h2>
          <div className={styles.chartsGrid}>
            <div
              className={`chart-card ${styles.chartCard} ${styles[theme]}`}
              ref={addChartRef}
            >
              <h3>Transações por Categoria</h3>
              <DashboardChart
                rows={barDataFiltered}
                labelKey="category"
                metrics={[
                  {
                    key: 'transactions',
                    label: 'Nº de Transações',
                    color: '#10b981'
                  }
                ]}
                theme={theme}
              />
            </div>

            <div
              className={`chart-card ${styles.chartCard} ${styles[theme]}`}
              ref={addChartRef}
            >
              <h3>Distribuição de Status</h3>
              <DashboardChart
                type="doughnut"
                rows={(statusDistribution || []).filter(
                  (item) => item.count > 0
                )}
                labelKey="name"
                metrics={[{ key: 'count', label: 'Status' }]}
                theme={theme}
                height={400}
              />
            </div>

            <div
              className={`chart-card ${styles.chartCard} ${styles[theme]}`}
              ref={addChartRef}
            >
              <h3>Histograma de Datas</h3>
              <DashboardChart
                rows={transactionDateHistogram || []}
                labelKey="periodLabel"
                metrics={[
                  {
                    key: 'totalTransactions',
                    label: 'Transações',
                    color: '#ec4899'
                  }
                ]}
                theme={theme}
              />
            </div>

            <div
              className={`chart-card ${styles.chartCard} ${styles[theme]}`}
              ref={addChartRef}
            >
              <h3>Histograma de Valores</h3>
              <DashboardChart
                rows={(transactionHistogram || []).filter(
                  (item) => item.count > 0
                )}
                labelKey="bin"
                metrics={[
                  {
                    key: 'count',
                    label: 'Contagem',
                    color: '#f59e0b'
                  },
                  {
                    key: 'totalAmount',
                    label: 'Valor Total',
                    color: '#ef4444',
                    format: 'currency'
                  }
                ]}
                theme={theme}
              />
            </div>
            {customCharts['transactions']?.map((chart) => (
              <div
                key={chart.id}
                className={`chart-card ${styles.chartCard} ${styles[theme]}`}
                ref={addChartRef}
              >
                <div className={styles.customChartHeader}>
                  <h3>{chart.title}</h3>
                  <button
                    onClick={() => handleRemoveChart(chart.id, 'transactions')}
                    className={styles.removeButton}
                  >
                    <X size={16} />
                  </button>
                </div>
                {renderCustomChart('transactions', chart)}
              </div>
            ))}
          </div>
        </div>

        {/* === 4. Evolução e Relações (2 gráficos) === */}
        <div className={`${styles.section} ${styles[theme]}`}>
          <h2>
            Evolução e Relações
            <button
              onClick={() => handleOpenModal('evolution')}
              className={`${styles.customButton} ${styles[theme]}`}
            >
              <Plus size={16} />
              Customizar Gráfico
            </button>
          </h2>
          <div className={styles.chartsGrid}>
            <div
              className={`chart-card ${styles.chartCard} ${styles[theme]}`}
              ref={addChartRef}
            >
              <h3>Evolução Temporal ({filters.groupBy || 'mês'})</h3>
              <DashboardChart
                type="line"
                rows={timeSeriesData || []}
                labelKey="periodLabel"
                metrics={[
                  {
                    key: 'totalAmount',
                    label: 'Valor Total',
                    color: '#3b82f6',
                    fill: true,
                    format: 'currency'
                  },
                  {
                    key: 'totalTransactions',
                    label: 'Transações',
                    color: '#10b981',
                    axisId: 'y1'
                  }
                ]}
                axisFormats={{ y: 'currency' }}
                theme={theme}
              />
            </div>

            <div
              className={`chart-card ${styles.chartCard} ${styles[theme]}`}
              ref={addChartRef}
            >
              <h3>Relação: Nº de Registros × Valor Médio</h3>
              <DashboardChart
                type="bubble"
                rows={(scatterData || []).filter(
                  (item) => item.totalAmount > 0
                )}
                labelKey="category"
                metrics={[{ key: 'averageAmount', label: 'Categorias' }]}
                bubbleKeys={{
                  x: 'recordsCount',
                  y: 'averageAmount',
                  radius: 'totalAmount'
                }}
                axisFormats={{ x: 'number', y: 'currency' }}
                theme={theme}
              />
            </div>
            {customCharts['evolution']?.map((chart) => (
              <div
                key={chart.id}
                className={`chart-card ${styles.chartCard} ${styles[theme]}`}
                ref={addChartRef}
              >
                <div className={styles.customChartHeader}>
                  <h3>{chart.title}</h3>
                  <button
                    onClick={() => handleRemoveChart(chart.id, 'evolution')}
                    className={styles.removeButton}
                  >
                    <X size={16} />
                  </button>
                </div>
                {renderCustomChart('evolution', chart)}
              </div>
            ))}
          </div>
        </div>

        {/* === 5. Progresso de Metas (CONDICIONAL) === */}
        {showFinancialMetrics && (
          <div className={`${styles.section} ${styles[theme]}`}>
            <h2>
              Progresso de Metas
              <button
                onClick={() => handleOpenModal('progress')}
                className={`${styles.customButton} ${styles[theme]}`}
              >
                <Plus size={16} />
                Customizar Gráfico
              </button>
            </h2>
            <div className={styles.chartsGrid}>
              <div
                className={`chart-card ${styles.chartCard} ${styles[theme]}`}
                ref={addChartRef}
              >
                <h3>Progresso por Registro</h3>
                <DashboardChart
                  rows={goalProgressData || []}
                  labelKey="title"
                  metrics={[
                    {
                      key: 'initialBalance',
                      label: 'Saldo Inicial',
                      color: '#06b6d4',
                      format: 'currency',
                      stack: 'progress'
                    },
                    {
                      key: 'currentTotal',
                      label: 'Total Atual',
                      color: '#10b981',
                      format: 'currency',
                      stack: 'progress'
                    }
                  ]}
                  horizontal
                  stacked
                  axisFormats={{ x: 'currency' }}
                  theme={theme}
                />
              </div>
              {customCharts['progress']?.map((chart) => (
                <div
                  key={chart.id}
                  className={`chart-card ${styles.chartCard} ${styles[theme]}`}
                  ref={addChartRef}
                >
                  <div className={styles.customChartHeader}>
                    <h3>{chart.title}</h3>
                    <button
                      onClick={() => handleRemoveChart(chart.id, 'progress')}
                      className={styles.removeButton}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  {renderCustomChart('progress', chart)}
                </div>
              ))}
            </div>
          </div>
        )}

        <Suspense fallback={null}>
          {showModal && (
            <CustomChartModal
              show
              onClose={handleCloseModal}
              onSubmit={handleSubmit}
              currentSection={currentSection}
              getDataOptions={getDataOptions}
            />
          )}
          {showSummaryModal && (
            <CustomSummaryModal
              show
              onClose={handleCloseSummaryModal}
              onSubmit={handleSummarySubmit}
              fields={
                data?.customChartsData?.customFields?.filter(
                  (field) => field.totalSum > 0
                ) || []
              }
              initialSelected={selectedCustomSummaries}
            />
          )}
        </Suspense>
      </div>
    );
  }
);

DashboardCategory.displayName = 'DashboardCategory';
export default DashboardCategory;
