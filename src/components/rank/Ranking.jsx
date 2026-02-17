import { X, Trophy, Medal, Crown, Star } from 'lucide-react';
import styles from './Ranking.module.css';
import { useTheme } from '../../hooks/useTheme';
import { useState, useEffect } from 'react';
import { useEmphasisColor } from '../../hooks/useEmphasisColor';
import ServiceUsers from '../../services/ServiceUsers';

const Ranking = ({ onClose }) => {
  const { theme } = useTheme();
  const { emphasisColor } = useEmphasisColor();
  const [top10, setTop10] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [myUserId, setMyUserId] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await ServiceUsers.getRanking();
        const data = res.data.data;
        setTop10(data.top10 || []);
        setMyRank(data.myRank || null);

        let myId;
        if (data.myRank) {
          myId = data.myRank.userId;
        }
        setMyUserId(myId);
      } catch (e) {
        console.error('Erro ao buscar ranking:', e);
      }
    }
    fetchData();
  }, []);

  const showMyRankBelow = myRank && myRank.rank > 10;

  const getMedalIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className={styles.medalIcon} />;
      case 2:
        return <Medal className={styles.medalIcon} />;
      case 3:
        return <Medal className={styles.medalIcon} />;
      default:
        return null;
    }
  };

  const getRankClass = (rank) => {
    if (rank === 1) return styles.firstPlace;
    if (rank === 2) return styles.secondPlace;
    if (rank === 3) return styles.thirdPlace;
    return '';
  };

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
          {/* Header com gradiente */}
          <div 
            className={styles.header}
            style={{
              background: `linear-gradient(135deg, ${emphasisColor || '#fbbf24'} 0%, ${emphasisColor || '#f59e0b'} 50%, ${emphasisColor || '#d97706'} 100%)`
            }}
          >
            <div className={styles.headerGlow}></div>
            <Trophy className={styles.headerIcon} />
            <h2 className={styles.title}>Ranking do Mês</h2>
            <p className={styles.subtitle}>Top 10 Jogadores</p>
          </div>

          {/* Lista de Top 10 */}
          <div className={styles.rankList}>
            {top10.length > 0 ? (
              top10.map((user, index) => {
                const isMe = user.userId === myUserId;
                const isPodium = user.rank <= 3;
                return (
                  <div
                    key={user.userId}
                    className={`${styles.rankItem} ${getRankClass(user.rank)} ${isMe ? styles.myRank : ''}`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className={styles.rankLeft}>
                      {isPodium ? (
                        <div className={styles.medalContainer}>
                          {getMedalIcon(user.rank)}
                        </div>
                      ) : (
                        <span className={styles.rankNumber}>#{user.rank}</span>
                      )}
                      <div className={styles.userInfo}>
                        <span className={styles.userName}>{user.name}</span>
                        {isMe && <span className={styles.youBadge}>Você</span>}
                      </div>
                    </div>
                    <div className={styles.entriesContainer}>
                      <span className={styles.entriesNumber}>{user.totalEntries}</span>
                      <span className={styles.entriesLabel}>entradas</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p className={styles.loadingText}>Carregando ranking...</p>
              </div>
            )}
          </div>

          {/* Sua posição se não estiver no top 10 */}
          {showMyRankBelow && (
            <div className={styles.myRankSection}>
              <div className={styles.sectionHeader}>
                <Star className={styles.sectionIcon} style={{ color: emphasisColor || '#fbbf24' }} />
                <p className={styles.sectionTitle}>Sua Posição</p>
              </div>
              <div className={`${styles.rankItem} ${styles.myRankHighlight}`}>
                <div className={styles.rankLeft}>
                  <span className={styles.rankNumber}>#{myRank.rank}</span>
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{myRank.name}</span>
                  </div>
                </div>
                <div className={styles.entriesContainer}>
                  <span className={styles.entriesNumber}>{myRank.totalEntries}</span>
                  <span className={styles.entriesLabel}>entradas</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ranking;