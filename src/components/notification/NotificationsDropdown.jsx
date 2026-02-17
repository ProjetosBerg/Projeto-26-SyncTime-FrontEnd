// ⚙️ React e bibliotecas externas
import { useState, useEffect } from 'react';
import { Filter, Trash2, ExternalLink, X, Check, Bell } from 'lucide-react';
import { useHistory } from 'react-router-dom';

// 💅 Estilos
import styles from './NotificationsDropdown.module.css';

// 🧠 Hooks customizados
import { useTheme } from '../../hooks/useTheme';
import { useEmphasisColor } from '../../hooks/useEmphasisColor';
import { useSocket } from '../../hooks/useSocket'; 

// 📡 Services
import ServiceNotification from './services/ServiceNotification';
import useFlashMessage from '../../hooks/userFlashMessage';
import ServiceRoutines from '../../views/notes/Calendar/services/ServiceRoutines';
import ServiceNotes from '../../views/notes/Calendar/services/ServiceNotes';
import { POSSIBLE_FILTERS_ENTITIES, useMemorizeFilters } from '../../hooks/useMemorizeInputsFilters';

const NotificationsDropdown = ({ onClose }) => {
  const { theme } = useTheme();
  const { emphasisColor } = useEmphasisColor();
  const [filter, setFilter] = useState('todas');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [typeFilter, setTypeFilter] = useState('todos');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const { setFlashMessage } = useFlashMessage();
  const {
      getMemorizedFilters: getMemorizedFiltersUsers,
    } = useMemorizeFilters(POSSIBLE_FILTERS_ENTITIES.USERS);

  const userId = getMemorizedFiltersUsers().id;

  const { on: socketOn, off: socketOff } = useSocket(userId);

  const formatRelativeTime = (dateStr) => {
    console.log('dateStr', dateStr)
    const utcDate = new Date(dateStr);

    const brDate = new Date(utcDate.getTime() - 3 * 60 * 60 * 1000);

    const nowUtc = new Date();
    const nowBr = new Date(nowUtc.getTime());

    const diff = nowBr - brDate;

    if (diff < 0) return "Agora";

    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Agora";
    if (minutes < 60) return `${minutes} min atrás`;

    const hours = Math.floor(minutes / 60);

    if (hours < 24) return `${hours} hora${hours > 1 ? "s" : ""} atrás`;

    const days = Math.floor(hours / 24);

    const result = `${days} dia${days > 1 ? "s" : ""} atrás`;

    return result;
  };

  const addNewNotification = (newNotifData) => {
    const mappedNewNotif = {
      id: newNotifData.id,
      text: newNotifData.title,
      time: formatRelativeTime(newNotifData.createdAt), 
      read: false, 
      entity: newNotifData.entity,
      idEntity: newNotifData.idEntity,
      link: newNotifData.path,
      typeOfAction: newNotifData.typeOfAction,
    };

    setNotifications((prev) => [mappedNewNotif, ...prev]);

    setFlashMessage('Nova notificação recebida!', 'info');
  };

  const getTypeColor = (entity) => {
    const colors = {
      'Registro Mensal': styles.typeRelatorio,
      'Anotação': styles.typeAnotacao,
      'Usuario': styles.typeUsuario,
      'Transação': styles.typeTransacao
    };
    return colors[entity] || styles.typeDefault;
  };

  const getActionColor = (action) => {
    const colors = {
      'Criação': styles.actionCriacao,
      'Atualização': styles.actionAtualizacao,
      'Exclusão': styles.actionExclusao,
      'Exportação': styles.actionExportacao
    };
    return colors[action] || styles.actionDefault;
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await ServiceNotification.getByAllNotification();
      if (response.data.status === 'OK') {
        const mappedNotifications = response.data.data.map((n) => ({
          id: n.id,
          text: n.title,
          time: formatRelativeTime(n.created_at),
          read: n.isRead,
          entity: n.entity,
          idEntity: n.idEntity,
          link: n.path,
          typeOfAction: n.typeOfAction,
        }));
        setNotifications(mappedNotifications);
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpdateNewNotifications = async () => {
    try {
      await ServiceNotification.updateAllNotificationNew();
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    fetchUpdateNewNotifications();
  }, [notifications]);

  useEffect(() => {
    if (!userId) return; 

    const handleNewNotification = (data) => {
      console.log('Nova notificação via Socket.IO:', data);
      addNewNotification(data);
    };

    socketOn('newNotification', handleNewNotification);

    return () => {
      socketOff('newNotification', handleNewNotification);
    };
  }, [userId, socketOn, socketOff]); 

  const uniqueEntities = [...new Set(notifications.map(n => n.entity))];
  const typeOptions = [
    { value: 'todos', label: 'Todos os tipos' },
    ...uniqueEntities.map(entity => ({ value: entity, label: entity }))
  ].sort((a, b) => a.label.localeCompare(b.label));

  const baseNotifications = notifications.filter((n) =>
    typeFilter === 'todos' || n.entity === typeFilter
  );

  const unreadCount = baseNotifications.filter((n) => !n.read).length;
  const readCount = baseNotifications.filter((n) => n.read).length;
  const totalCount = baseNotifications.length;

  const markAsRead = async (id) => {
    try {
      await ServiceNotification.markReadNotification({ ids: [id] });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await ServiceNotification.deleteNotification({ ids: [id] });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setFlashMessage('Notificação deletada', 'success');
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
      setFlashMessage('Erro ao deletar notificação', 'error');
    }
  };

  const handleNavigateToNote = async (notification) => {
    if (notification.entity !== 'Anotação' || !notification.idEntity) {
      history.push(notification.link);
      return;
    }

    try {
      const noteResponse = await ServiceNotes.getByIdNotes(notification.idEntity);
      if (noteResponse.data.status !== 'OK') {
        setFlashMessage('Erro ao carregar anotação', 'error');
        history.push('/anotacoes');
        return;
      }

      const noteData = noteResponse.data.data;
      const routineId = noteData.routine_id;

      if (!routineId) {
        setFlashMessage('Anotação sem rotina associada', 'error');
        history.push('/anotacoes');
        return;
      }

      const routineResponse = await ServiceRoutines.getByIdRoutines(routineId);
      if (routineResponse.data.status !== 'OK') {
        setFlashMessage('Erro ao carregar rotina da anotação', 'error');
        history.push('/anotacoes');
        return;
      }

      const routineData = routineResponse.data.data;
      console.log('routineData', routineData);
      const routineDate = routineData.created_at.split('T')[0];
      console.log('routineDate', routineDate);

      const queryParams = new URLSearchParams({
        date: routineDate,
        routineId: routineId,
        noteId: notification.idEntity,
        openNoteList: 'true'
      }).toString();

      history.push(`/anotacoes`, { search: queryParams });
    } catch (error) {
      console.error('Erro ao processar navegação para anotação:', error);
      setFlashMessage('Erro ao abrir anotação', 'error');
      history.push('/anotacoes');
    }
  };

  const clearReadNotifications = async () => {
    const readNotifications = baseNotifications.filter((n) => n.read);
    if (readNotifications.length === 0) return;

    const readIds = readNotifications.map((n) => n.id);
    try {
      await ServiceNotification.deleteNotification({ ids: readIds });
      setNotifications((prev) => {
        const deletedIds = new Set(readIds);
        return prev.filter((n) => !deletedIds.has(n.id));
      });
      setFlashMessage('Notificações lidas limpas com sucesso', 'success');
    } catch (error) {
      console.error('Erro ao limpar notificações lidas:', error);
    }
  };

  const filteredNotifications = baseNotifications.filter((n) => {
    if (filter === 'lidas' && !n.read) return false;
    if (filter === 'naoLidas' && n.read) return false;
    return true;
  });

  if (loading) {
    return (
      <div className={`${styles.dropdown} ${styles[theme]}`}>
        <div className={styles.dropdownHeader} style={{ background: emphasisColor || 'rgb(20, 18, 129)' }}>
          <div className={styles.dropdownHeaderInner}>
            <div className={styles.dropdownHeaderLeft}>
              <Bell className={styles.dropdownBellIcon} />
              <h2 className={styles.dropdownTitle}>Notificações</h2>
            </div>
            <button onClick={onClose} className={styles.closeButton}>
              <X className={styles.closeIcon} />
            </button>
          </div>
        </div>
        <div className={styles.notificationsList}>
          <div className={styles.emptyState}>
            <p>Carregando notificações...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={styles.backdrop}
        onClick={() => {
          onClose();
          setShowFilterMenu(false);
        }}
      />

      {/* Dropdown Panel */}
      <div className={`${styles.dropdown} ${styles[theme]}`}>
        {/* Header */}
        <div
          className={styles.dropdownHeader}
          style={{ background: emphasisColor || 'rgb(20, 18, 129)' }}
        >
          <div className={styles.dropdownHeaderInner}>
            <div className={styles.dropdownHeaderLeft}>
              <Bell className={styles.dropdownBellIcon} />
              <h2 className={styles.dropdownTitle}>Notificações</h2>
            </div>
            <button onClick={onClose} className={styles.closeButton}>
              <X className={styles.closeIcon} />
            </button>
          </div>
          <p className={styles.dropdownSubtitle}>
            {unreadCount} não {unreadCount === 1 ? 'lida' : 'lidas'}
          </p>
        </div>

        {/* Filters */}
        <div className={styles.filtersContainer}>
          <div className={styles.filtersInner}>
            {/* Status Filter */}
            <div className={styles.statusFilter}>
              <button
                onClick={() => setFilter('todas')}
                className={`${styles.filterButton} ${filter === 'todas' ? styles.filterButtonActive : ''}`}
                style={filter === 'todas' ? {
                  backgroundColor: emphasisColor || 'rgb(20, 18, 129)'
                } : {}}
              >
                Todas
                <span className={`${styles.filterBadge} ${filter === 'todas' ? styles.filterBadgeActive : ''}`}>
                  {totalCount}
                </span>
              </button>
              <button
                onClick={() => setFilter('naoLidas')}
                className={`${styles.filterButton} ${filter === 'naoLidas' ? styles.filterButtonActive : ''}`}
                style={filter === 'naoLidas' ? {
                  backgroundColor: emphasisColor || 'rgb(20, 18, 129)'
                } : {}}
              >
                Não Lidas
                <span className={`${styles.filterBadge} ${filter === 'naoLidas' ? styles.filterBadgeUnread : ''}`}>
                  {unreadCount}
                </span>
              </button>
              <button
                onClick={() => setFilter('lidas')}
                className={`${styles.filterButton} ${filter === 'lidas' ? styles.filterButtonActive : ''}`}
                style={filter === 'lidas' ? {
                  backgroundColor: emphasisColor || 'rgb(20, 18, 129)'
                } : {}}
              >
                Lidas
                <span className={`${styles.filterBadge} ${filter === 'lidas' ? styles.filterBadgeActive : ''}`}>
                  {readCount}
                </span>
              </button>
            </div>

            {/* Type Filter */}
            <div className={styles.typeFilterWrapper}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFilterMenu(!showFilterMenu);
                }}
                className={styles.typeFilterButton}
              >
                <Filter className={styles.filterIcon} />
                Tipo
              </button>

              {showFilterMenu && (
                <div className={styles.typeFilterDropdown}>
                  {typeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        setTypeFilter(option.value);
                        setShowFilterMenu(false);
                      }}
                      className={`${styles.typeFilterOption} ${
                        typeFilter === option.value ? styles.typeFilterOptionActive : ''
                      }`}
                    >
                      {option.label}
                      {typeFilter === option.value && (
                        <Check className={styles.checkIcon} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Clear Read Button */}
            {readCount > 0 && (
              <button
                onClick={clearReadNotifications}
                className={styles.clearButton}
              >
                <Trash2 className={styles.trashIcon} />
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className={styles.notificationsList}>
          {filteredNotifications.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <Bell className={styles.emptyBellIcon} />
              </div>
              <p className={styles.emptyTitle}>Nenhuma notificação</p>
              <p className={styles.emptySubtitle}>Ajuste os filtros</p>
            </div>
          ) : (
            <div className={styles.notificationsItems}>
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`${styles.notificationItem} ${
                    !notification.read ? styles.notificationItemUnread : ''
                  }`}
                >
                  <div className={styles.notificationItemInner}>
                    {/* Unread Indicator */}
                    <div className={styles.indicatorWrapper}>
                      <div
                        className={`${styles.indicator} ${
                          !notification.read ? styles.indicatorUnread : styles.indicatorRead
                        }`}
                        style={!notification.read ? {
                          backgroundColor: emphasisColor || '#6366f1'
                        } : {}}
                      />
                    </div>

                    {/* Content */}
                    <div
                      className={styles.notificationContent}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <p className={`${styles.notificationText} ${
                        !notification.read ? styles.notificationTextUnread : ''
                      }`}>
                        {notification.text}
                      </p>

                      <div className={styles.notificationMeta}>
                        <span className={`${styles.typeBadge} ${getTypeColor(notification.entity)}`}>
                          {notification.entity}
                        </span>
                        <span className={`${styles.actionBadge} ${getActionColor(notification.typeOfAction)}`}>
                          {notification.typeOfAction}
                        </span>
                        <span className={styles.notificationTime}>{notification.time}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className={styles.actionButtons}>
                      {notification.link && (
                        <button
                          type="button"
                          className={styles.actionButton}
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!notification.read) {
                              await markAsRead(notification.id);
                            }
                            await handleNavigateToNote(notification);
                            onClose();
                          }}
                        >
                          <ExternalLink className={styles.externalIcon} />
                        </button>
                      )}
                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={async (e) => {
                          e.stopPropagation();
                          await deleteNotification(notification.id);
                        }}
                      >
                        <Trash2 className={styles.trashIconSmall} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.footerStats}>
            <div className={styles.footerStat}>
              <p className={styles.footerStatLabel}>Total</p>
              <p className={styles.footerStatValue}>{totalCount}</p>
            </div>
            <div className={styles.footerStat}>
              <p className={styles.footerStatLabel}>Não Lidas</p>
              <p
                className={styles.footerStatValueUnread}
                style={{ color: emphasisColor || '#6366f1' }}
              >
                {unreadCount}
              </p>
            </div>
            <div className={styles.footerStat}>
              <p className={styles.footerStatLabel}>Lidas</p>
              <p className={styles.footerStatValueRead}>{readCount}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationsDropdown;