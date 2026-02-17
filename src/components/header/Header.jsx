// ⚙️ React e bibliotecas externas
import { useState, useEffect } from 'react';
import { Bell, Zap, User } from 'lucide-react';

// 💅 Estilos
import styles from './Header.module.css';

// 🧩 Componentes
import Streak from '../streak/Streak';
import NotificationsDropdown from '../notification/NotificationsDropdown';
import ProfileDropdown from '../settings/ProfileDropdown';

// 🧠 Hooks customizados
import { useEmphasisColor } from '../../hooks/useEmphasisColor';
import {
  useMemorizeFilters,
  POSSIBLE_FILTERS_ENTITIES
} from '../../hooks/useMemorizeInputsFilters';
import { useSocket } from '../../hooks/useSocket'; 
import ServiceUsers from '../../services/ServiceUsers';
import ServiceNotification from '../notification/services/ServiceNotification';

const Header = () => {
  const { emphasisColor } = useEmphasisColor();
  const { getMemorizedFilters, memorizeFilters } = useMemorizeFilters(
    POSSIBLE_FILTERS_ENTITIES.USERS
  );

  const userId = getMemorizedFilters().id;
  const { on: socketOn, off: socketOff } = useSocket(userId); 
  const [notificationCount, setNotificationCount] = useState(0); 
  const [streakDays, setStreakDays] = useState(0);
  const [weekProgress, setWeekProgress] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
    false
  ]);
  const [completedDaysThisWeek, setCompletedDaysThisWeek] = useState(0);
  const [streakLoading, setStreakLoading] = useState(true);
  const [streakError, setStreakError] = useState(null);
  const [userAvatar, setUserAvatar] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const fetchNotificationCount = async () => {
    try {
      const response = await ServiceNotification.getCountNotification();
      if (response.data.status === 'OK') {
        setNotificationCount(response.data.data || 0); 
      }
    } catch (error) {
      console.error('Erro ao buscar count de notificações:', error);
      setNotificationCount(0);
    }
  };

  const fetchUserData = async () => {
    const currentUser = getMemorizedFilters();
    if (currentUser?.id) {
      try {
        const response = await ServiceUsers.getByUser(currentUser.id);
        if (response.data.status === 'OK') {
          const user = response.data.data.user;
          memorizeFilters({
            ...currentUser,
            name: user.name,
            imageUrl: user.imageUrl
          });
          setUserAvatar(user.imageUrl || null);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      }
    }
  };

  const fetchStreakData = async () => {
    try {
      setStreakLoading(true);
      setStreakError(null);
      const response = await ServiceUsers.getStreak();
      if (response.data.status === 'OK') {
        const {
          streakDays: days,
          weekProgress: progress,
          completedDaysThisWeek: completed
        } = response.data.data;
        setStreakDays(days);
        setWeekProgress(progress);
        setCompletedDaysThisWeek(completed);
      } else {
        throw new Error('Resposta inválida da API');
      }
    } catch (error) {
      console.error('Erro ao buscar streak:', error);
      setStreakError(error.message);
      setStreakDays(30);
      setWeekProgress([true, true, true, true, true, true, true]);
      setCompletedDaysThisWeek(7);
    } finally {
      setStreakLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchStreakData();
    if (userId) {
      fetchNotificationCount(); 
    }
  }, [userId]); 

  useEffect(() => {
    const handleProfileUpdate = () => {
      fetchUserData();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  useEffect(() => {
    if (!userId) return;

    const handleNewNotification = (data) => {
      setNotificationCount(data.countNewNotification || notificationCount + 1); 
    };

    socketOn('newNotification', handleNewNotification);

    return () => {
      socketOff('newNotification', handleNewNotification);
    };
  }, [userId, socketOn, socketOff, notificationCount]); 

  const getFlameColor = () => {
    if (streakDays >= 30) return '#ff0000';
    if (streakDays >= 14) return '#ff6b00';
    if (streakDays >= 7) return '#ffa500';
    if (streakDays >= 3) return '#ffd700';
    return '#fed7aa';
  };

  const handleAvatarClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleNotificationChange = (delta) => {
    setNotificationCount((prev) => Math.max(0, prev + delta)); 
  };

  const handleCloseNotifications = () => {
    setShowNotifications(false);
    fetchNotificationCount(); 
  };

  return (
    <>
      <header
        className={styles.header}
        style={{ background: emphasisColor || 'rgb(20, 18, 129)' }}
      >
        <div className={styles.container}>
          <div className={styles.content}>
            <span className={styles.brandName}></span>

            {/* Right Side Actions */}
            <div className={styles.actions}>
              {/* Streak Counter */}
              <div className={styles.streakContainer}>
                <button
                  onClick={() => setShowStreakModal(true)}
                  className={styles.streakButton}
                  aria-label="Ver progresso de sequência"
                  disabled={streakLoading}
                >
                  {streakLoading ? (
                    <div className={styles.loadingSpinner}></div>
                  ) : (
                    <>
                      <div
                        style={{
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Zap
                          className={styles.flameIcon}
                          style={{
                            color: getFlameColor(),
                            filter:
                              streakDays >= 7
                                ? 'drop-shadow(0 0 8px currentColor)'
                                : 'none'
                          }}
                          fill={streakDays >= 3 ? getFlameColor() : 'none'}
                        />
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: '0.125rem'
                        }}
                      >
                        <span
                          className={styles.streakNumber}
                          style={{
                            color: getFlameColor(),
                            textShadow:
                              streakDays >= 7
                                ? `0 0 10px ${getFlameColor()}40`
                                : 'none',
                            lineHeight: '1'
                          }}
                        >
                          {streakDays}
                        </span>
                        <span
                          style={{
                            fontSize: '0.625rem',
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            lineHeight: '1'
                          }}
                        >
                          dias
                        </span>
                      </div>
                    </>
                  )}
                </button>
                {streakError && (
                  <span className={styles.errorText}>
                    Erro ao carregar streak
                  </span>
                )}
              </div>

              {/* Notifications */}
              <div className={styles.notificationWrapper}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={styles.notificationButton}
                >
                  <Bell className={styles.bellIcon} />
                  {notificationCount > 0 && (
                    <span
                      className={styles.badge}
                      style={{ color: emphasisColor || 'rgb(20, 18, 129)' }}
                    >
                      {notificationCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <NotificationsDropdown
                    onClose={handleCloseNotifications} 
                    initialUnreadCount={notificationCount} 
                    onNotificationChange={handleNotificationChange} 
                  />
                )}
              </div>

              {/* User Profile */}
              <div className={styles.profileContainer}>
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt="User Avatar"
                    className={styles.avatar}
                    onClick={handleAvatarClick}
                  />
                ) : (
                  <div
                    className={styles.defaultAvatar}
                    onClick={handleAvatarClick}
                  >
                    <User className={styles.userIcon} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Render Streak Modal */}
      {showStreakModal && (
        <Streak
          streakDays={streakDays}
          weekDays={weekDays}
          weekProgress={weekProgress}
          completedDaysThisWeek={completedDaysThisWeek}
          onClose={() => setShowStreakModal(false)}
          getFlameColor={getFlameColor}
        />
      )}

      {/* Render Profile Dropdown */}
      {showProfileDropdown && (
        <ProfileDropdown onClose={() => setShowProfileDropdown(false)} />
      )}
    </>
  );
};

export default Header;