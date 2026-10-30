// ⚙️ React e bibliotecas externas
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  Check,
  CheckCheck,
  ExternalLink,
  Filter,
  Trash,
  X
} from 'lucide-react';
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
import {
  POSSIBLE_FILTERS_ENTITIES,
  useMemorizeFilters
} from '../../hooks/useMemorizeInputsFilters';
import {
  latestNotificationsQueryOptions,
  mapSocketNotification,
  NOTIFICATIONS_QUERY_KEY
} from './notificationQuery';

const MAX_NOTIFICATIONS_PER_REQUEST = 100;

const NotificationsDropdown = ({ onClose, onNotificationChange }) => {
  const { theme } = useTheme();
  const { emphasisColor } = useEmphasisColor();
  const [filter, setFilter] = useState('todas');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [typeFilter, setTypeFilter] = useState('todos');
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState(
    () => queryClient.getQueryData(NOTIFICATIONS_QUERY_KEY) || []
  );
  const [markingAll, setMarkingAll] = useState(false);
  const [clearingRead, setClearingRead] = useState(false);
  const history = useHistory();
  const { setFlashMessage } = useFlashMessage();
  const { getMemorizedFilters: getMemorizedFiltersUsers } = useMemorizeFilters(
    POSSIBLE_FILTERS_ENTITIES.USERS
  );

  const userId = getMemorizedFiltersUsers()?.id;

  const { on: socketOn, off: socketOff } = useSocket(userId);

  const notificationsQuery = useQuery(latestNotificationsQueryOptions);
  const loading = notificationsQuery.isPending && notifications.length === 0;

  const updateNotifications = useCallback(
    (updater) => {
      setNotifications((currentNotifications) => {
        const nextNotifications =
          typeof updater === 'function'
            ? updater(currentNotifications)
            : updater;

        queryClient.setQueryData(
          NOTIFICATIONS_QUERY_KEY,
          nextNotifications
        );
        return nextNotifications;
      });
    },
    [queryClient]
  );

  useEffect(() => {
    if (notificationsQuery.data) {
      setNotifications(notificationsQuery.data);
    }
  }, [notificationsQuery.data]);

  const addNewNotification = useCallback(
    (newNotifData) => {
      const mappedNewNotif = mapSocketNotification(newNotifData);

      updateNotifications((prev) => [mappedNewNotif, ...prev].slice(0, 100));

      setFlashMessage('Nova notificação recebida!', 'info');
    },
    [setFlashMessage, updateNotifications]
  );

  const getTypeColor = (entity) => {
    const colors = {
      'Registro Mensal': styles.typeRelatorio,
      Anotação: styles.typeAnotacao,
      Usuario: styles.typeUsuario,
      Transação: styles.typeTransacao
    };
    return colors[entity] || styles.typeDefault;
  };

  const getActionColor = (action) => {
    const colors = {
      Criação: styles.actionCriacao,
      Atualização: styles.actionAtualizacao,
      Exclusão: styles.actionExclusao,
      Exportação: styles.actionExportacao,
      Lembrete: styles.actionLembrete
    };
    return colors[action] || styles.actionDefault;
  };

  useEffect(() => {
    ServiceNotification.updateAllNotificationNew().catch((error) => {
      console.error('Erro ao atualizar notificações novas:', error);
    });
  }, []);

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
  }, [addNewNotification, userId, socketOn, socketOff]);

  const typeOptions = useMemo(
    () =>
      [
        { value: 'todos', label: 'Todos os tipos' },
        ...[
          ...new Set(notifications.map((notification) => notification.entity))
        ]
          .filter(Boolean)
          .map((entity) => ({ value: entity, label: entity }))
      ].sort((a, b) => a.label.localeCompare(b.label)),
    [notifications]
  );

  const baseNotifications = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          typeFilter === 'todos' || notification.entity === typeFilter
      ),
    [notifications, typeFilter]
  );

  const unreadCount = baseNotifications.filter((n) => !n.read).length;
  const readCount = baseNotifications.filter((n) => n.read).length;
  const totalCount = baseNotifications.length;

  const markAsRead = async (id) => {
    const wasUnread = notifications.some(
      (notification) => notification.id === id && !notification.read
    );

    try {
      await ServiceNotification.markReadNotification({ ids: [id] });
      updateNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      if (wasUnread) onNotificationChange?.(-1);
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications
      .filter((notification) => !notification.read)
      .map((notification) => notification.id);
    if (unreadIds.length === 0) return;

    const markedIds = [];
    let failedRequest = null;

    try {
      setMarkingAll(true);

      for (
        let index = 0;
        index < unreadIds.length;
        index += MAX_NOTIFICATIONS_PER_REQUEST
      ) {
        const batch = unreadIds.slice(
          index,
          index + MAX_NOTIFICATIONS_PER_REQUEST
        );

        try {
          await ServiceNotification.markReadNotification({ ids: batch });
          markedIds.push(...batch);
        } catch (error) {
          failedRequest = error;
          break;
        }
      }

      if (markedIds.length > 0) {
        const markedSet = new Set(markedIds);
        updateNotifications((currentNotifications) =>
          currentNotifications.map((notification) =>
            markedSet.has(notification.id)
              ? { ...notification, read: true }
              : notification
          )
        );
        onNotificationChange?.(-markedIds.length);
      }

      if (failedRequest) {
        console.error('Erro ao marcar lote de notificações:', failedRequest);
        setFlashMessage(
          markedIds.length > 0
            ? `${markedIds.length} notificações foram marcadas. Tente novamente para concluir as restantes.`
            : 'Erro ao marcar notificações como lidas',
          'error'
        );
      } else {
        setFlashMessage(
          'Todas as notificações foram marcadas como lidas',
          'success'
        );
      }
    } finally {
      setMarkingAll(false);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await ServiceNotification.deleteNotification({ ids: [id] });
      updateNotifications((prev) => prev.filter((n) => n.id !== id));
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
      const noteResponse = await ServiceNotes.getByIdNotes(
        notification.idEntity
      );
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
      const routineDate = (noteData.dateOfNote || routineData.created_at).split(
        'T'
      )[0];
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
    const deletedIds = [];
    let failedRequest = null;

    try {
      setClearingRead(true);

      for (
        let index = 0;
        index < readIds.length;
        index += MAX_NOTIFICATIONS_PER_REQUEST
      ) {
        const batch = readIds.slice(
          index,
          index + MAX_NOTIFICATIONS_PER_REQUEST
        );

        try {
          await ServiceNotification.deleteNotification({ ids: batch });
          deletedIds.push(...batch);
        } catch (error) {
          failedRequest = error;
          break;
        }
      }

      if (deletedIds.length > 0) {
        const deletedSet = new Set(deletedIds);
        updateNotifications((prev) =>
          prev.filter((notification) => !deletedSet.has(notification.id))
        );
      }

      if (failedRequest) {
        console.error('Erro ao limpar notificações lidas:', failedRequest);
        setFlashMessage(
          deletedIds.length > 0
            ? `${deletedIds.length} notificações foram removidas. Tente novamente para concluir as restantes.`
            : 'Erro ao limpar notificações lidas',
          'error'
        );
      } else {
        setFlashMessage('Notificações lidas limpas com sucesso', 'success');
      }
    } finally {
      setClearingRead(false);
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
                style={
                  filter === 'todas'
                    ? {
                        backgroundColor: emphasisColor || 'rgb(20, 18, 129)'
                      }
                    : {}
                }
              >
                Todas
                <span
                  className={`${styles.filterBadge} ${filter === 'todas' ? styles.filterBadgeActive : ''}`}
                >
                  {totalCount}
                </span>
              </button>
              <button
                onClick={() => setFilter('naoLidas')}
                className={`${styles.filterButton} ${filter === 'naoLidas' ? styles.filterButtonActive : ''}`}
                style={
                  filter === 'naoLidas'
                    ? {
                        backgroundColor: emphasisColor || 'rgb(20, 18, 129)'
                      }
                    : {}
                }
              >
                Não Lidas
                <span
                  className={`${styles.filterBadge} ${filter === 'naoLidas' ? styles.filterBadgeUnread : ''}`}
                >
                  {unreadCount}
                </span>
              </button>
              <button
                onClick={() => setFilter('lidas')}
                className={`${styles.filterButton} ${filter === 'lidas' ? styles.filterButtonActive : ''}`}
                style={
                  filter === 'lidas'
                    ? {
                        backgroundColor: emphasisColor || 'rgb(20, 18, 129)'
                      }
                    : {}
                }
              >
                Lidas
                <span
                  className={`${styles.filterBadge} ${filter === 'lidas' ? styles.filterBadgeActive : ''}`}
                >
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
                        typeFilter === option.value
                          ? styles.typeFilterOptionActive
                          : ''
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
            {notifications.some((notification) => !notification.read) && (
              <button
                type="button"
                onClick={markAllAsRead}
                className={styles.markAllButton}
                disabled={markingAll}
              >
                <CheckCheck className={styles.markAllIcon} />
                {markingAll ? 'Marcando...' : 'Ler todas'}
              </button>
            )}

            {readCount > 0 && (
              <button
                onClick={clearReadNotifications}
                className={styles.clearButton}
                disabled={clearingRead}
              >
                <Trash className={styles.trashIcon} />
                {clearingRead ? 'Limpando...' : 'Limpar'}
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
                          !notification.read
                            ? styles.indicatorUnread
                            : styles.indicatorRead
                        }`}
                        style={
                          !notification.read
                            ? {
                                backgroundColor: emphasisColor || '#6366f1'
                              }
                            : {}
                        }
                      />
                    </div>

                    {/* Content */}
                    <div
                      className={styles.notificationContent}
                      onClick={() =>
                        !notification.read && markAsRead(notification.id)
                      }
                    >
                      <p
                        className={`${styles.notificationText} ${
                          !notification.read
                            ? styles.notificationTextUnread
                            : ''
                        }`}
                      >
                        {notification.text}
                      </p>

                      <div className={styles.notificationMeta}>
                        <span
                          className={`${styles.typeBadge} ${getTypeColor(notification.entity)}`}
                        >
                          {notification.entity}
                        </span>
                        <span
                          className={`${styles.actionBadge} ${getActionColor(notification.typeOfAction)}`}
                        >
                          {notification.typeOfAction}
                        </span>
                        <span className={styles.notificationTime}>
                          {notification.time}
                        </span>
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
                        <Trash className={styles.trashIconSmall} />
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
