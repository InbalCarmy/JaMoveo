// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:10000' 
  : '';

export { API_BASE_URL };