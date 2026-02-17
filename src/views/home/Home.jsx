import { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, CloudSnow, Wind, Droplets, Calendar, Filter, BarChart3, CheckCircle2 } from 'lucide-react';
import { useHistory } from 'react-router-dom';
import styles from './Home.module.css';
import { useTheme } from '../../hooks/useTheme'; 
import { useEmphasisColor } from '../../hooks/useEmphasisColor';
import ServiceUsers from '../../services/ServiceUsers';
import ServiceRoutines from '../../views/notes/Calendar/services/ServiceRoutines';
import { POSSIBLE_FILTERS_ENTITIES, useMemorizeFilters } from '../../hooks/useMemorizeInputsFilters';

const Home = () => {
  const { theme } = useTheme();
  const { emphasisColor } = useEmphasisColor();
  const history = useHistory(); 
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [presenceLoading, setPresenceLoading] = useState(true);
  const [presenceError, setPresenceError] = useState(null);
  const [filter, setFilter] = useState('todos');
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [notifications, setNotifications] = useState([]); 
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); 
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString()); 
  const [presenceData, setPresenceData] = useState([]);
  const [presenceStats, setPresenceStats] = useState({ presentDays: 0, totalSessions: 0, rate: 0 });
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [dataVisible, setDataVisible] = useState(false); 
  const { getMemorizedFilters, memorizeFilters } = useMemorizeFilters(
      POSSIBLE_FILTERS_ENTITIES.USERS
    );
  
    const userName = getMemorizedFilters()?.name;

  const months = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ];

  const years = [2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035];

  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date(); 
    const seconds = Math.floor((now - date) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return `${interval} anos atrás`;

    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return `${interval} meses atrás`;

    interval = Math.floor(seconds / 86400);
    if (interval > 1) return `${interval} dias atrás`;
    if (interval === 1) return `1 dia atrás`;

    interval = Math.floor(seconds / 3600);
    if (interval > 1) return `${interval} horas atrás`;
    if (interval === 1) return `1 hora atrás`;

    interval = Math.floor(seconds / 60);
    if (interval > 1) return `${interval} minutos atrás`;
    if (interval === 1) return `1 minuto atrás`;

    return 'agora';
  };

  const getBadgeClass = (category) => {
    if (category === 'Anotação') return 'note';
    if (category === 'Rotina') return 'routine';
    if (category === 'Relatório') return 'update';
    if (category === 'Categoria') return 'issue';
    if (category === 'Custom') return 'custom';
    return 'note'; 
  };

  const handleNavigate = async (notif) => {
    if (notif.category !== 'Anotação' || !notif.entityRef?.routineId) {
      history.push(notif.path);
      return;
    }

    try {
      const routineResponse = await ServiceRoutines.getByIdRoutines(notif.entityRef.routineId);
      if (routineResponse.data.status !== 'OK') {
        console.error('Erro ao carregar rotina da anotação');
        history.push('/anotacoes');
        return;
      }

      const routineData = routineResponse.data.data;
      const routineDate = routineData.created_at.split('T')[0];

      const queryParams = new URLSearchParams({
        date: routineDate,
        routineId: notif.entityRef.routineId,
        noteId: notif.id,
        openNoteList: 'true'
      }).toString();
      history.push(`/anotacoes`, { search: queryParams });
    } catch (error) {
      console.error('Erro ao processar navegação para anotação:', error);
      history.push('/anotacoes');
    }
  };

  const fetchInbox = async () => {
    try {
      const response = await ServiceUsers.getInbox();
      if (response.status !== 200) {
        throw new Error('Erro ao buscar inbox');
      }
      const mappedNotifications = response.data.data.map(item => ({
        id: item.id,
        title: item.title,
        category: item.entityName, 
        time: timeAgo(item.updated_at), 
        type: item.type.toLowerCase(),
        path: item.path,
        entityRef: item.entityRef 
      }));
      setNotifications(mappedNotifications);
      const categories = [...new Set(mappedNotifications.map(n => n.category))].sort();
      setUniqueCategories(categories);
    } catch (error) {
      console.error('Erro ao buscar inbox:', error);
      setNotifications([]); 
      setUniqueCategories([]);
    }
  };

  const fetchPresenceData = async (month, year) => {
    const startTime = Date.now();
    const minLoadingTime = 500; 

    try {
      setPresenceLoading(true);
      setPresenceError(null);
      setDataVisible(false); 
      const response = await ServiceUsers.getPresence(month, year);

      if (response.status !== 200) {
        throw new Error('Erro ao buscar dados de presença');
      }

      const responseData = response.data;
      setPresenceData(responseData.data.presenceData);
      setPresenceStats(responseData.data.stats);
    } catch (error) {
      console.error('Erro ao buscar presença:', error);
      setPresenceError(error.message);
      setPresenceData([]); 
      setPresenceStats({ presentDays: 0, totalSessions: 0, rate: 0 });
    } finally {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = minLoadingTime - elapsedTime;

      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      setPresenceLoading(false);
    }
  };

  useEffect(() => {
    if (!presenceLoading && presenceData.length > 0) {
      const timer = setTimeout(() => {
        setDataVisible(true);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setDataVisible(false);
    }
  }, [presenceLoading, presenceData]);

  useEffect(() => {
    fetchPresenceData(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchInbox();
  }, []);

  useEffect(() => {
    if (navigator?.geolocation) {
      navigator?.geolocation?.getCurrentPosition(
        (position) => {
          const { latitude, longitude, altitude, accuracy } = position.coords;
          setLocation({ latitude, longitude, altitude, accuracy });
          fetchWeatherByCoords(latitude, longitude);
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          setLocationError(error.message);
          setLocation({ latitude: -3.7319, longitude: -38.5267, altitude: null, accuracy: null });
          fetchWeatherByCoords(-3.7319, -38.5267);
        }
      );
    } else {
      setLocationError('Geolocalização não suportada');
      setLocation({ latitude: -3.7319, longitude: -38.5267, altitude: null, accuracy: null });
      fetchWeatherByCoords(-3.7319, -38.5267);
    }
  }, []);

  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      const apiKey = import.meta.env.VITE_KEY_API_OPENWEATHER || '';
      
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error('Erro ao buscar dados do clima');
      }

      const data = await response.json();
      setWeather({
        temp: Math.round(data.main.temp),
        condition: data.weather[0].description,
        icon: getWeatherIcon(data.weather[0].main),
        humidity: data.main.humidity,
        wind: Math.round(data.wind.speed * 3.6),
        city: data.name,
        country: data.sys.country
      });
    } catch (error) {
      console.error('Erro ao buscar clima:', error);
      setWeather({
        temp: 28,
        condition: 'Ensolarado',
        icon: 'sun',
        humidity: 75,
        wind: 18,
        city: 'Localização desconhecida',
        country: 'BR'
      });
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition) => {
    const icons = {
      'Clear': 'sun',
      'Clouds': 'cloud',
      'Rain': 'rain',
      'Snow': 'snow',
      'Wind': 'wind'
    };
    return icons[condition] || 'cloud';
  };

  const WeatherIcon = ({ icon }) => {
    const icons = {
      sun: Sun,
      cloud: Cloud,
      rain: CloudRain,
      snow: CloudSnow,
      wind: Wind
    };
    const Icon = icons[icon] || Cloud;
    return <Icon className="w-16 h-16 text-yellow-400" />;
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'todos') return true;
    return notif.category === filter;
  });

  const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
};


  return (
    <div className={`${styles.container} ${styles[theme]}`}>
      <div className={styles.wrapper}>
        <h1 className={styles.title}> {getGreeting()}, {userName}</h1>
        
        <div className={styles.grid}>
          {/* Clima e Tempo */}
          <div className={styles.weatherCard}>
            <h2 className={styles.cardTitle}>
              <Cloud className={styles.icon} />
              Clima e Tempo
            </h2>
            
            {loading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
              </div>
            ) : (
              <div className={styles.weatherContent}>
                <div className={styles.weatherMain}>
                  <div>
                    <p className={styles.cityName}>{weather.city}</p>
                    <p className={styles.temperature}>{weather.temp}°C</p>
                    <p className={styles.condition}>{weather.condition}</p>
                  </div>
                  <WeatherIcon icon={weather.icon} />
                </div>
                
                <div className={styles.weatherDetails}>
                  <div className={styles.detailItem}>
                    <Droplets className={styles.detailIcon} />
                    <div>
                      <p className={styles.detailLabel}>Umidade</p>
                      <p className={styles.detailValue}>{weather.humidity}%</p>
                    </div>
                  </div>
                  <div className={styles.detailItem}>
                    <Wind className={styles.detailIcon} />
                    <div>
                      <p className={styles.detailLabel}>Vento</p>
                      <p className={styles.detailValue}>{weather.wind} km/h</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Caixa de Entrada */}
          <div className={styles.inboxCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <Calendar className={styles.iconPurple} />
                Caixa de Entrada
              </h2>
              <div className={styles.filterContainer}>
                <Filter className={styles.filterIcon} />
                <select 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className={styles.filterSelect}
                  style={{ '--focus-color': emphasisColor || '#9333ea' }}
                >
                  <option value="todos">Todos</option>
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className={styles.notificationsList}>
              {filteredNotifications.length === 0 ? (
                <p className={styles.emptyMessage}>Nenhuma notificação disponível</p>
              ) : (
                filteredNotifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={styles.notificationItem}
                    onClick={async () => await handleNavigate(notif)} 
                  >
                    <div className={styles.notificationContent}>
                      <div className={styles.notificationMain}>
                        <h3 className={styles.notificationTitle}>{notif.title}</h3>
                        <div className={styles.notificationMeta}>
                          <span className={`${styles.badge} ${styles[getBadgeClass(notif.category)]}`}>
                            {notif.category}
                          </span>
                          <span className={styles.time}>{notif.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Gráfico de Presença */}
          <div className={styles.presenceCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <BarChart3 className={styles.iconGreen} />
                Gráfico de Presença
              </h2>
              <div className={styles.filterContainer}>
                <Filter className={styles.filterIcon} />
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className={styles.filterSelect}
                  style={{ '--focus-color': emphasisColor || '#9333ea' }}
                >
                  {months.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className={styles.filterSelect}
                  style={{ '--focus-color': emphasisColor || '#9333ea' }}
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className={styles.presenceContent}>
              {presenceLoading ? (
                <div className={styles.loadingContainer}>
                  <div className={styles.spinner}></div>
                  <p>Carregando dados de presença...</p>
                </div>
              ) : presenceError ? (
                <div className={styles.errorMessage}>
                  <p>Erro ao carregar dados: {presenceError}</p>
                </div>
              ) : (
                <div className={`${styles.dataContainer} ${dataVisible ? styles.visible : ''}`}>
                  <div className={styles.statsGrid}>
                    <div 
                      className={styles.statBox}
                      style={{ backgroundColor: `${emphasisColor || '#16a34a'}20` }} 
                    >
                      <p className={styles.statLabel}>Dias Presentes</p>
                      <p className={styles.statValueBlue} style={{ color: emphasisColor || '#16a34a' }}>
                        {presenceStats.presentDays}
                      </p>
                    </div>
                    <div 
                      className={styles.statBoxBlue}
                      style={{ backgroundColor: `${emphasisColor || '#3b82f6'}20` }}
                    >
                      <p className={styles.statLabel}>Total Sessões</p>
                      <p className={styles.statValueBlue} style={{ color: emphasisColor || '#3b82f6' }}>
                        {presenceStats.totalSessions}
                      </p>
                    </div>
                  </div>
                  
                  <div className={styles.presenceList}>
                    {presenceData.map((day, index) => (
                      <div 
                        key={index} 
                        className={`${styles.presenceRow} ${dataVisible ? styles.rowAnimate : ''}`}
                        style={{ 
                          transitionDelay: dataVisible ? `${Math.min(index * 0.05, 0.5)}s` : '0s' 
                        }}
                      >
                        <span className={styles.dayLabel}>{day.day}</span>
                        <div className={styles.progressBar}>
                          {day.present && (
                            <div 
                              className={styles.progressFill}
                              style={{ 
                                background: `linear-gradient(to right, ${emphasisColor || '#4ade80'}, ${emphasisColor || '#22c55e'})`,
                                width: `${Math.min((day.sessions / 7) * 100, 100)}%`
                              }}
                            >
                              <span className={styles.sessionCount}>{day.sessions}</span>
                            </div>
                          )}
                        </div>
                        {day.present ? (
                          <CheckCircle2 
                            className={styles.checkIcon} 
                            style={{ color: emphasisColor || '#22c55e' }} 
                          />
                        ) : (
                          <div className={styles.emptyCheck}></div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className={styles.presenceFooter}>
                    <p className={styles.presenceRate}>
                      Taxa de presença: <span className={styles.rateValue} style={{ color: emphasisColor || '#16a34a' }}>
                        {presenceStats.rate}%
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
    </div>
  );
};

export default Home;