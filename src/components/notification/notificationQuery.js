import ServiceNotification from './services/ServiceNotification';

export const NOTIFICATIONS_QUERY_KEY = ['notifications', 'latest'];

const formatRelativeTime = (dateStr) => {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();

  if (!Number.isFinite(diff) || diff < 60000) return 'Agora';

  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} min atrás`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hora${hours > 1 ? 's' : ''} atrás`;

  const days = Math.floor(hours / 24);
  return `${days} dia${days > 1 ? 's' : ''} atrás`;
};

const mapNotification = (notification) => ({
  id: notification.id,
  text: notification.title,
  time: formatRelativeTime(
    notification.created_at || notification.createdAt
  ),
  read: notification.isRead ?? false,
  entity: notification.entity,
  idEntity: notification.idEntity,
  link: notification.path,
  typeOfAction: notification.typeOfAction
});

export const fetchLatestNotifications = async () => {
  const response = await ServiceNotification.getByAllNotification();

  if (response.data.status !== 'OK') return [];
  return response.data.data.map(mapNotification);
};

export const latestNotificationsQueryOptions = {
  queryKey: NOTIFICATIONS_QUERY_KEY,
  queryFn: fetchLatestNotifications,
  staleTime: 30 * 1000,
  gcTime: 5 * 60 * 1000
};

export const mapSocketNotification = (notification) =>
  mapNotification({
    ...notification,
    title: notification.title,
    isRead: false
  });
