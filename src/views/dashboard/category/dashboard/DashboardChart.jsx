import { memo, useMemo } from 'react';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip
} from 'chart.js';
import { Bar, Bubble, Doughnut, Line, Radar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip
);

const DEFAULT_COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#06b6d4'
];

const formatValue = (value, format) => {
  const numericValue = Number(value) || 0;

  if (format === 'currency') {
    return numericValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  if (format === 'percent') {
    return `${numericValue.toLocaleString('pt-BR', {
      maximumFractionDigits: 1
    })}%`;
  }

  return numericValue.toLocaleString('pt-BR');
};

const transparentColor = (hex, opacity) => {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return hex;
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');
  return `#${normalized}${alpha}`;
};

const DashboardChart = ({
  type = 'bar',
  rows = [],
  labelKey = 'name',
  metrics = [],
  theme = 'light',
  height = 360,
  horizontal = false,
  stacked = false,
  axisFormats = {},
  bubbleKeys
}) => {
  const textColor = theme === 'dark' ? '#cbd5e1' : '#475569';
  const gridColor =
    theme === 'dark'
      ? 'rgba(148, 163, 184, 0.14)'
      : 'rgba(100, 116, 139, 0.14)';

  const chartData = useMemo(() => {
    if (type === 'bubble') {
      const xValues = rows.map((row) => Number(row[bubbleKeys.x]) || 0);
      const yValues = rows.map((row) => Number(row[bubbleKeys.y]) || 0);
      const radiusValues = rows.map(
        (row) => Math.abs(Number(row[bubbleKeys.radius])) || 0
      );
      const maxRadiusValue = Math.max(...radiusValues, 1);

      return {
        datasets: [
          {
            label: metrics[0]?.label || 'Dados',
            data: rows.map((row, index) => ({
              x: xValues[index],
              y: yValues[index],
              r: 7 + (radiusValues[index] / maxRadiusValue) * 17,
              sourceLabel: row[labelKey]
            })),
            backgroundColor: rows.map((_, index) =>
              transparentColor(
                DEFAULT_COLORS[index % DEFAULT_COLORS.length],
                0.72
              )
            ),
            borderColor: rows.map(
              (_, index) => DEFAULT_COLORS[index % DEFAULT_COLORS.length]
            ),
            borderWidth: 2
          }
        ]
      };
    }

    const labels = rows.map((row) => row[labelKey] ?? 'Sem identificação');

    if (type === 'doughnut') {
      const metric = metrics[0] || {};
      return {
        labels,
        datasets: [
          {
            label: metric.label || 'Total',
            data: rows.map((row) => Number(row[metric.key]) || 0),
            backgroundColor: rows.map(
              (_, index) => DEFAULT_COLORS[index % DEFAULT_COLORS.length]
            ),
            borderColor: theme === 'dark' ? '#152033' : '#ffffff',
            borderWidth: 3,
            hoverOffset: 8,
            spacing: 3
          }
        ]
      };
    }

    return {
      labels,
      datasets: metrics.map((metric, index) => {
        const color =
          metric.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
        const baseDataset = {
          label: metric.label || metric.key,
          data: rows.map((row) => Number(row[metric.key]) || 0),
          borderColor: color,
          backgroundColor: metric.fill
            ? transparentColor(color, 0.2)
            : transparentColor(color, type === 'bar' ? 0.82 : 0.32),
          borderWidth: type === 'bar' ? 0 : 3,
          pointBackgroundColor: color,
          pointBorderColor: theme === 'dark' ? '#152033' : '#ffffff',
          pointBorderWidth: 2,
          pointRadius: type === 'line' ? 4 : 3,
          pointHoverRadius: 7,
          tension: 0.36,
          fill: Boolean(metric.fill),
          yAxisID: metric.axisId || 'y'
        };

        if (type === 'bar') {
          return {
            ...baseDataset,
            borderRadius: 8,
            borderSkipped: false,
            maxBarThickness: 54,
            stack: metric.stack
          };
        }

        return baseDataset;
      })
    };
  }, [bubbleKeys, labelKey, metrics, rows, theme, type]);

  const options = useMemo(() => {
    const hasSecondaryAxis = metrics.some((metric) => metric.axisId === 'y1');
    const metricFormats = new Map(
      metrics.map((metric) => [metric.label || metric.key, metric.format])
    );
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      resizeDelay: 120,
      animation: { duration: 450 },
      interaction: { mode: 'nearest', intersect: false },
      indexAxis: horizontal ? 'y' : 'x',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
            padding: 18,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
          titleColor: theme === 'dark' ? '#f8fafc' : '#0f172a',
          bodyColor: textColor,
          borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: (context) => {
              if (type === 'bubble') {
                const point = context.raw;
                return `${point.sourceLabel || context.dataset.label}: ${formatValue(point.x, axisFormats.x)} × ${formatValue(point.y, axisFormats.y)}`;
              }

              const value =
                type === 'doughnut'
                  ? context.parsed
                  : horizontal
                    ? context.parsed.x
                    : context.parsed.y;
              const format = metricFormats.get(context.dataset.label);
              return `${context.dataset.label}: ${formatValue(value, format)}`;
            }
          }
        }
      }
    };

    if (type === 'doughnut') {
      return {
        ...baseOptions,
        cutout: '62%',
        radius: '88%'
      };
    }

    if (type === 'radar') {
      return {
        ...baseOptions,
        scales: {
          r: {
            beginAtZero: true,
            angleLines: { color: gridColor },
            grid: { color: gridColor },
            pointLabels: { color: textColor },
            ticks: { color: textColor, backdropColor: 'transparent' }
          }
        }
      };
    }

    return {
      ...baseOptions,
      scales: {
        x: {
          beginAtZero: horizontal,
          stacked,
          grid: { color: horizontal ? gridColor : 'transparent' },
          border: { display: false },
          ticks: {
            color: textColor,
            maxRotation: horizontal ? 0 : 25,
            minRotation: 0,
            callback: axisFormats.x
              ? (value) => formatValue(value, axisFormats.x)
              : undefined
          }
        },
        y: {
          beginAtZero: true,
          stacked,
          grid: { color: gridColor },
          border: { display: false },
          ticks: {
            color: textColor,
            callback: axisFormats.y
              ? (value) => formatValue(value, axisFormats.y)
              : undefined
          }
        },
        ...(hasSecondaryAxis && {
          y1: {
            beginAtZero: true,
            position: 'right',
            grid: { drawOnChartArea: false },
            border: { display: false },
            ticks: { color: textColor }
          }
        })
      }
    };
  }, [
    axisFormats,
    gridColor,
    horizontal,
    metrics,
    stacked,
    textColor,
    theme,
    type
  ]);

  if (!rows.length || !metrics.length) {
    return (
      <div
        style={{
          height,
          display: 'grid',
          placeItems: 'center',
          color: textColor
        }}
      >
        Sem dados para exibir
      </div>
    );
  }

  const chartProps = { data: chartData, options };
  const chartStyle = { position: 'relative', height, width: '100%' };

  return (
    <div style={chartStyle}>
      {type === 'doughnut' && <Doughnut {...chartProps} />}
      {type === 'bar' && <Bar {...chartProps} />}
      {type === 'line' && <Line {...chartProps} />}
      {type === 'radar' && <Radar {...chartProps} />}
      {type === 'bubble' && <Bubble {...chartProps} />}
    </div>
  );
};

const areChartPropsEqual = (previous, next) =>
  previous.type === next.type &&
  (previous.rows === next.rows ||
    JSON.stringify(previous.rows) === JSON.stringify(next.rows)) &&
  previous.labelKey === next.labelKey &&
  previous.theme === next.theme &&
  previous.height === next.height &&
  previous.horizontal === next.horizontal &&
  previous.stacked === next.stacked &&
  JSON.stringify(previous.metrics) === JSON.stringify(next.metrics) &&
  JSON.stringify(previous.axisFormats) === JSON.stringify(next.axisFormats) &&
  JSON.stringify(previous.bubbleKeys) === JSON.stringify(next.bubbleKeys);

export default memo(DashboardChart, areChartPropsEqual);
