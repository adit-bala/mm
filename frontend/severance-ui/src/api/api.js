import axios from 'axios';

// Create axios instance with relative URL
const api = axios.create({
  baseURL: '/api',  // Use a relative path that works regardless of domain
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const login = async (username, password) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);

  const response = await api.post('/login', formData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/me');
  return response.data;
};

// Personas API
export const getPersonas = async () => {
  const response = await api.get('/personas');
  return response.data;
};

// Clues API
export const getClues = async () => {
  const response = await api.get('/clues');
  return response.data;
};

export const getMurderClues = async () => {
  const response = await api.get('/clues/murder');
  return response.data;
};

// Rooms API
export const createRoom = async (playerA, playerB) => {
  const response = await api.post('/rooms', { playerA, playerB });
  return response.data;
};

export const getRoom = async (code4) => {
  const response = await api.get(`/rooms/${code4}`);
  return response.data;
};

export const getRoomMessages = async (code4) => {
  const response = await api.get(`/rooms/${code4}/messages`);
  return response.data;
};

export const sendMessage = async (code4, content) => {
  const response = await api.post(`/rooms/${code4}/msg`, { content });
  return response.data;
};

export const streamMessages = async (code4, afterMessageId) => {
  const response = await api.get(`/rooms/${code4}/stream`, {
    params: { after: afterMessageId },
    timeout: 6000, // 6 seconds timeout - slightly longer than polling interval
  });
  return response.data;
};
