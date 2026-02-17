import { Zap, X } from 'lucide-react';
import { GiPodium } from "react-icons/gi";
import styles from './Streak.module.css';
import { useTheme } from '../../hooks/useTheme'; 
import { useState } from 'react';
import Ranking from '../rank/Ranking';

const Streak = ({
  streakDays,
  weekDays,
  weekProgress,
  completedDaysThisWeek,
  onClose,
  getFlameColor,
}) => {
  const { theme } = useTheme();
  const [showRanking, setShowRanking] = useState(false);

  const currentDayIndex = new Date().getDay();

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        className={`${styles.modalContent} ${styles[theme]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className={styles.closeButton}>
          <X className={styles.closeIcon} />
        </button>

        <div className={styles.modalBody}>
          <div className={styles.titleContainer}>
            <Zap className={styles.titleFlame} color={getFlameColor()} fill={getFlameColor()} />
            <h2 className={styles.title}>{streakDays} dias de ofensiva</h2>
            <button 
              onClick={() => setShowRanking(true)} 
              className={styles.rankButton}
              aria-label="Ver ranking"
            >
              <GiPodium className={styles.podiumIcon} />
            </button>
          </div>

          <p className={styles.subtitle}>
            Você aumentou a sua ofensiva antes do meio-dia{' '}
            {completedDaysThisWeek} vezes essa semana!
          </p>

          <div className={styles.calendar}>
            <div className={styles.weekDays}>
              {weekDays.map((day, index) => (
                <div key={index} className={styles.dayColumn}>
                  <span
                    className={index === currentDayIndex ? styles.dayActive : styles.day} 
                  >
                    {day}
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${(completedDaysThisWeek / 7) * 100}%` }}
              ></div>

              <div className={styles.dayIndicators}>
                {weekProgress.map((completed, index) => (
                  <div
                    key={index}
                    className={
                      completed
                        ? styles.dayCompleted
                        : index === completedDaysThisWeek && !completed
                        ? styles.dayCurrent 
                        : styles.dayIncomplete
                    }
                  >
                    {completed && <Zap className={styles.dayFlame} fill="#fff" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showRanking && <Ranking onClose={() => setShowRanking(false)} />}
    </div>
  );
};

export default Streak;