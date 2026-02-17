import styles from './StatusBadge.module.css';

const StatusBadge = ({ status, config, onClick, isSelected, disabled }) => {
  const badgeConfig = config[status];

  if (!badgeConfig) return null;

  const dynamicStyle = {
    '--text-color': badgeConfig.color,
    '--bg-color': badgeConfig.bgColor,
    '--border-color': badgeConfig.color,
    '--shadow-color': badgeConfig.shadowColor
  };

  return (
    <div
      role="radio"
      aria-checked={isSelected}
      onClick={!disabled ? onClick : undefined}
      className={`
        ${styles.statusBadge} 
        ${isSelected ? styles.selected : ''} 
        ${disabled ? styles.disabled : ''}
      `}
      style={dynamicStyle}
    >
      <span className={styles.indicator} />
      <span className={styles.statusIcon}>{badgeConfig.icon}</span>
      <span>{badgeConfig.label}</span>
    </div>
  );
};

export default StatusBadge;