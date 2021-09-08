// REACT_APP_MOCK_TRACES et REACT_APP_MOCK_USER_INFOS
// sont utilisées uniquement pour des besoins de développement local
// afin d'économiser les ressources d'une machine si besoin
const { REACT_APP_MOCK_TRACES, REACT_APP_MOCK_USER_INFOS } = process.env;

// LUXON DATE FORMATS
export const LUXON_FORMAT_HOUR_MINS = 'T';
export const LUXON_FORMAT_TIMEZONE = 'z';
export const LUXON_FORMAT_DAY = 'DDD';
export const LUXON_FORMAT_MONTH_YEAR = 'LLLL yyyy';

// API URLs
const API_BASE_URL = `https://ud.docker.dev-franceconnect.fr/api`;
export const API_ROUTE_TRACES =
  REACT_APP_MOCK_TRACES || `${API_BASE_URL}/traces`;
export const API_ROUTE_USER_INFOS =
  REACT_APP_MOCK_USER_INFOS || `${API_BASE_URL}/me`;
