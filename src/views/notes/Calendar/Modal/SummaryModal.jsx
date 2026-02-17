import { X, FileText, Sparkles, Clock, Target,  Award, CheckCircle2, AlertCircle, Zap, Copy, Check } from 'lucide-react';
import { useTheme } from '../../../../hooks/useTheme';
import { useEmphasisColor } from '../../../../hooks/useEmphasisColor';
import ReactMarkdown from 'react-markdown';
import styles from './SummaryModal.module.css';
import { useEffect, useState } from 'react';

const SummaryModal = ({ isOpen, onClose, content }) => {
  const { theme } = useTheme();
  const { emphasisColor } = useEmphasisColor();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const extractMetrics = (content) => {
    if (!content) return null;

    const metricsMatch = content.match(/\| 📝 \*\*Total de Atividades\*\* \| (\d+) \|/);
    const completedMatch = content.match(/\| ✅ \*\*Concluídas\*\* \| (\d+) \((\d+)%\) \|/);
    const inProgressMatch = content.match(/\| ⏳ \*\*Em Andamento\*\* \| (\d+) \|/);
    const notStartedMatch = content.match(/\| ❌ \*\*Não Realizadas\*\* \| (\d+) \|/);
    const highPriorityMatch = content.match(/\| 🔴 \*\*Alta Prioridade\*\* \| (\d+) \|/);
    const collaboratorsMatch = content.match(/\| 👥 \*\*Com Colaboradores\*\* \| (\d+) \|/);
    const timeMatch = content.match(/\| ⏱️ \*\*Tempo Total\*\* \| (\d+)h (\d+)min \|/);

    if (!metricsMatch) return null;

    return {
      total: parseInt(metricsMatch[1]),
      completed: parseInt(completedMatch?.[1] || '0'),
      completionRate: parseInt(completedMatch?.[2] || '0'),
      inProgress: parseInt(inProgressMatch?.[1] || '0'),
      notStarted: parseInt(notStartedMatch?.[1] || '0'),
      highPriority: parseInt(highPriorityMatch?.[1] || '0'),
      withCollaborators: parseInt(collaboratorsMatch?.[1] || '0'),
      hours: parseInt(timeMatch?.[1] || '0'),
      minutes: parseInt(timeMatch?.[2] || '0'),
    };
  };

  const metrics = extractMetrics(content);

  const getBadgeEmoji = (percentage) => {
    if (percentage >= 80) return '🔥';
    if (percentage >= 60) return '💪';
    if (percentage >= 40) return '⚡';
    return '📊';
  };

  const getBadgeText = (percentage) => {
    if (percentage >= 80) return 'Excelente';
    if (percentage >= 60) return 'Bom';
    if (percentage >= 40) return 'Moderado';
    return 'Pode Melhorar';
  };

  const getBadgeLevel = (percentage) => {
    if (percentage >= 80) return 'excellent';
    if (percentage >= 60) return 'good';
    if (percentage >= 40) return 'moderate';
    return 'low';
  };

  const handleCopyContent = async () => {
    if (!content) return;
    
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const renderModernOverview = () => {
    if (!metrics) return null;

    const level = getBadgeLevel(metrics.completionRate);

    return (
      <>
        {/* Título da Seção Visão Geral */}
        <h1 className={`${styles.markdownH1} ${styles[theme]}`}>
          📊 Visão Geral
        </h1>

        {/* Cards de Métricas  */}
        <div className={styles.overviewGrid}>
          <div className={`${styles.overviewCard} ${styles[theme]}`}>
            <div className={styles.overviewCardHeader}>
              <div className={styles.overviewCardIcon} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <FileText size={20} color="white" />
              </div>
              <h4 className={styles.overviewCardTitle}>Total</h4>
            </div>
            <div className={styles.overviewCardValue}>{metrics.total}</div>
            <p className={styles.overviewCardLabel}>atividades registradas</p>
          </div>

          <div className={`${styles.overviewCard} ${styles[theme]}`}>
            <div className={styles.overviewCardHeader}>
              <div className={styles.overviewCardIcon} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <CheckCircle2 size={20} color="white" />
              </div>
              <h4 className={styles.overviewCardTitle}>Concluídas</h4>
            </div>
            <div className={styles.overviewCardValue}>{metrics.completed}</div>
            <p className={styles.overviewCardLabel}>{metrics.completionRate}% de conclusão</p>
          </div>

          <div className={`${styles.overviewCard} ${styles[theme]}`}>
            <div className={styles.overviewCardHeader}>
              <div className={styles.overviewCardIcon} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                <Clock size={20} color="white" />
              </div>
              <h4 className={styles.overviewCardTitle}>Em Andamento</h4>
            </div>
            <div className={styles.overviewCardValue}>{metrics.inProgress}</div>
            <p className={styles.overviewCardLabel}>atividades ativas</p>
          </div>

          <div className={`${styles.overviewCard} ${styles[theme]}`}>
            <div className={styles.overviewCardHeader}>
              <div className={styles.overviewCardIcon} style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
                <AlertCircle size={20} color="white" />
              </div>
              <h4 className={styles.overviewCardTitle}>Pendentes</h4>
            </div>
            <div className={styles.overviewCardValue}>{metrics.notStarted}</div>
            <p className={styles.overviewCardLabel}>não realizadas</p>
          </div>
        </div>

        {/* Cards de Informações Adicionais */}
        <div className={styles.additionalMetricsGrid}>
          <div className={`${styles.additionalMetricCard} ${styles[theme]}`}>
            <div className={styles.additionalMetricIcon}>
              <Zap size={18} />
            </div>
            <div className={styles.additionalMetricContent}>
              <div className={styles.additionalMetricValue}>{metrics.highPriority}</div>
              <div className={styles.additionalMetricLabel}>Alta Prioridade</div>
            </div>
          </div>

          <div className={`${styles.additionalMetricCard} ${styles[theme]}`}>
            <div className={styles.additionalMetricIcon}>
              <Target size={18} />
            </div>
            <div className={styles.additionalMetricContent}>
              <div className={styles.additionalMetricValue}>{metrics.withCollaborators}</div>
              <div className={styles.additionalMetricLabel}>Com Colaboradores</div>
            </div>
          </div>

          <div className={`${styles.additionalMetricCard} ${styles[theme]}`}>
            <div className={styles.additionalMetricIcon}>
              <Clock size={18} />
            </div>
            <div className={styles.additionalMetricContent}>
              <div className={styles.additionalMetricValue}>{metrics.hours}h {metrics.minutes}m</div>
              <div className={styles.additionalMetricLabel}>Tempo Total</div>
            </div>
          </div>
        </div>

        {/* Indicador de Produtividade */}
        <div className={`${styles.productivitySection} ${styles[theme]}`}>
          <div className={styles.productivityHeader}>
            <h3 className={styles.productivityTitle}>
              <Sparkles size={24} />
              Indicador de Produtividade
            </h3>
            <div className={`${styles.productivityBadge} ${styles[level]}`}>
              <span>{getBadgeEmoji(metrics.completionRate)}</span>
              <span>{getBadgeText(metrics.completionRate)}</span>
            </div>
          </div>

          <div className={styles.productivityMeterWrapper}>
            <div className={styles.productivityMeterLabel}>
              <span>Progresso do Dia</span>
              <span className={styles.productivityPercentage}>
                {metrics.completionRate}%
              </span>
            </div>
            <div className={`${styles.productivityMeter} ${styles[theme]}`}>
              <div 
                className={styles.productivityMeterFill}
                style={{ width: `${metrics.completionRate}%` }}
              />
            </div>
          </div>

          <div className={styles.productivityStats}>
            <div className={`${styles.productivityStat} ${styles[theme]}`}>
              <div className={styles.productivityStatIcon} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <CheckCircle2 size={20} color="white" />
              </div>
              <div className={styles.productivityStatValue}>
                {metrics.completed}
              </div>
              <div className={styles.productivityStatLabel}>Concluídas</div>
            </div>

            <div className={`${styles.productivityStat} ${styles[theme]}`}>
              <div className={styles.productivityStatIcon} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                <Clock size={20} color="white" />
              </div>
              <div className={styles.productivityStatValue}>
                {metrics.inProgress}
              </div>
              <div className={styles.productivityStatLabel}>Andamento</div>
            </div>

            <div className={`${styles.productivityStat} ${styles[theme]}`}>
              <div className={styles.productivityStatIcon} style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
                <AlertCircle size={20} color="white" />
              </div>
              <div className={styles.productivityStatValue}>
                {metrics.notStarted}
              </div>
              <div className={styles.productivityStatLabel}>Pendentes</div>
            </div>

            <div className={`${styles.productivityStat} ${styles[theme]}`}>
              <div className={styles.productivityStatIcon} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Award size={20} color="white" />
              </div>
              <div className={styles.productivityStatValue}>
                {metrics.total}
              </div>
              <div className={styles.productivityStatLabel}>Total</div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderCustomComponents = (content) => {
    if (!content) return null;

    if (metrics) {
      let contentWithoutOverview = content;
      
      contentWithoutOverview = contentWithoutOverview.replace(
        /## 📊 Visão Geral[\s\S]*?\n---\n/m, 
        ''
      );
      
      return (
        <>
          {renderModernOverview()}
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className={`${styles.markdownH1} ${styles[theme]}`}>
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className={`${styles.markdownH2} ${styles[theme]}`}>
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className={`${styles.markdownH3} ${styles[theme]}`}>
                  {children}
                </h3>
              ),
              strong: ({ children }) => (
                <strong className={`${styles.markdownStrong} ${styles[theme]}`}>
                  {children}
                </strong>
              ),
              p: ({ children }) => (
                <p className={`${styles.markdownP} ${styles[theme]}`}>
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className={`${styles.markdownUl} ${styles[theme]}`}>
                  {children}
                </ul>
              ),
              li: ({ children }) => (
                <li className={`${styles.markdownLi} ${styles[theme]}`}>
                  {children}
                </li>
              ),
              em: ({ children }) => (
                <em className={`${styles.markdownEm} ${styles[theme]}`}>
                  {children}
                </em>
              ),
              blockquote: ({ children }) => (
                <blockquote className={`${styles.markdownBlockquote} ${styles[theme]}`}>
                  {children}
                </blockquote>
              ),
              code: ({ children, inline }) => (
                inline ? (
                  <code className={`${styles.markdownCode} ${styles[theme]}`}>{children}</code>
                ) : (
                  <pre className={styles[theme]}>
                    <code className={`${styles.markdownCode} ${styles[theme]}`}>{children}</code>
                  </pre>
                )
              ),
              table: ({ children }) => (
                <div className={styles.tableWrapper}>
                  <table className={`${styles.markdownTable} ${styles[theme]}`}>{children}</table>
                </div>
              ),
              thead: ({ children }) => <thead>{children}</thead>,
              tbody: ({ children }) => <tbody>{children}</tbody>,
              tr: ({ children }) => <tr>{children}</tr>,
              th: ({ children }) => <th>{children}</th>,
              td: ({ children }) => <td>{children}</td>,
              hr: () => <hr className={styles[theme]} />,
            }}
          >
            {contentWithoutOverview}
          </ReactMarkdown>
        </>
      );
    }

    return (
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className={`${styles.markdownH1} ${styles[theme]}`}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className={`${styles.markdownH2} ${styles[theme]}`}>
              {children}
            </h2>
          ),
          h3: ({ children }) => {
            const text = typeof children === 'string' ? children : children?.toString() || '';
            let statusClass = '';
            
            if (text.includes('✅ Concluídas')) {
              statusClass = styles.statusCompleted;
            } else if (text.includes('⏳ Em Andamento')) {
              statusClass = styles.statusInProgress;
            } else if (text.includes('❌ Não Realizadas')) {
              statusClass = styles.statusNotStarted;
            } else if (text.includes('📝 Outras')) {
              statusClass = styles.statusOther;
            }
            
            return (
              <h3 className={`${styles.markdownH3} ${styles[theme]} ${statusClass}`}>
                {children}
              </h3>
            );
          },
          strong: ({ children }) => (
            <strong className={`${styles.markdownStrong} ${styles[theme]}`}>
              {children}
            </strong>
          ),
          p: ({ children }) => (
            <p className={`${styles.markdownP} ${styles[theme]}`}>
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className={`${styles.markdownUl} ${styles[theme]}`}>
              {children}
            </ul>
          ),
          li: ({ children }) => (
            <li className={`${styles.markdownLi} ${styles[theme]}`}>
              {children}
            </li>
          ),
          em: ({ children }) => (
            <em className={`${styles.markdownEm} ${styles[theme]}`}>
              {children}
            </em>
          ),
          blockquote: ({ children }) => (
            <blockquote className={`${styles.markdownBlockquote} ${styles[theme]}`}>
              {children}
            </blockquote>
          ),
          code: ({ children, inline }) => (
            inline ? (
              <code className={`${styles.markdownCode} ${styles[theme]}`}>{children}</code>
            ) : (
              <pre className={styles[theme]}>
                <code className={`${styles.markdownCode} ${styles[theme]}`}>{children}</code>
              </pre>
            )
          ),
          table: ({ children }) => (
            <div className={styles.tableWrapper}>
              <table className={`${styles.markdownTable} ${styles[theme]}`}>{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead>{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children }) => <th>{children}</th>,
          td: ({ children }) => <td>{children}</td>,
          hr: () => <hr className={styles[theme]} />,
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  return (
    <div
      className={`${styles.modalOverlay} ${styles[theme]}`}
      onClick={handleOverlayClick}
    >
      <div className={`${styles.modal} ${styles[theme]}`}>
        <div className={`${styles.modalHeader} ${styles[theme]}`}>
          <div className={styles.headerContent}>
            <div className={styles.iconWrapper}>
              <Sparkles size={24} className={styles.sparkleIcon} />
            </div>
            <div>
              <h2 className={`${styles.modalTitle} ${styles[theme]}`}>
                Relatório Diário
              </h2>
              <p className={`${styles.modalSubtitle} ${styles[theme]}`}>
                Análise completa da sua produtividade
              </p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button
              onClick={handleCopyContent}
              className={`${styles.copyButton} ${styles[theme]}`}
              aria-label="Copiar conteúdo"
              title={copied ? "Copiado!" : "Copiar conteúdo"}
              disabled={!content}
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </button>
            <button
              onClick={onClose}
              className={`${styles.closeButton} ${styles[theme]}`}
              aria-label="Fechar modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className={`${styles.modalContent} ${styles[theme]}`}>
          <div className={`${styles.summaryText} ${styles[theme]}`}>
            {content ? (
              renderCustomComponents(content)
            ) : (
              <div className={`${styles.emptyState} ${styles[theme]}`}>
                <div className={styles.emptyStateIcon}>
                  <FileText size={48} />
                </div>
                <h3 className={styles.emptyStateTitle}>Nenhum conteúdo gerado ainda</h3>
                <p className={styles.emptyStateText}>
                  Adicione atividades ao seu dia para gerar um resumo personalizado
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={`${styles.modalFooter} ${styles[theme]}`}>
          <button
            onClick={onClose}
            className={`${styles.closeButtonFooter} ${styles[theme]}`}
            style={{
              background: emphasisColor
                ? `linear-gradient(135deg, ${emphasisColor} 0%, ${emphasisColor}dd 100%)`
                : undefined
            }}
          >
            <span>Fechar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryModal;