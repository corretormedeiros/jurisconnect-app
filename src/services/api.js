import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jurisconnect_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jurisconnect_token')
      localStorage.removeItem('jurisconnect_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  signin: (credentials) => api.post('/auth/signin', credentials),
  registerClient: (data) => api.post('/auth/register/client', data),
  registerCorrespondent: (data) => api.post('/auth/register/correspondent', data),
  verifyToken: (token) => api.post('/auth/verify', {}, {
    headers: { Authorization: `Bearer ${token}` }
  }),
}

// Dashboard API
export const dashboardAPI = {
  getData: () => api.get('/dashboard'),
  getMonthlyStats: () => api.get('/dashboard/monthly'),
}

// Clients API
export const clientsAPI = {
  getAll: (params) => api.get('/clientes', { params }),
  getById: (id) => api.get(`/clientes/${id}`),
  create: (data) => api.post('/clientes', data),
  update: (id, data) => api.put(`/clientes/${id}`, data),
  updateStatus: (id, data) => api.patch(`/clientes/${id}/status`, data),
}

// Correspondents API
export const correspondentsAPI = {
  getAll: (params) => api.get('/correspondentes', { params }),
  getById: (id) => api.get(`/correspondentes/${id}`),
  create: (data) => api.post('/correspondentes', data),
  update: (id, data) => api.put(`/correspondentes/${id}`, data),
  updateStatus: (id, data) => api.patch(`/correspondentes/${id}/status`, data),
  getPending: () => api.get('/correspondentes/pendentes'),
  approve: (id) => api.patch(`/correspondentes/${id}/aprovar`),
  reject: (id) => api.patch(`/correspondentes/${id}/reprovar`),
}

// Demands API
export const demandsAPI = {
  getMyDemands: (params) => api.get('/demandas/minhas', { params }),
  getById: (id) => api.get(`/demandas/${id}`),
  create: (data) => api.post('/demandas', data),
  update: (id, data) => api.put(`/demandas/${id}`, data),
  updateStatus: (id, data) => api.patch(`/demandas/status/${id}`, data),
  assign: (id, data) => api.patch(`/demandas/assign/${id}`, data),
}

// Financial API
export const financialAPI = {
  getAll: (params) => api.get('/financeiro', { params }),
  getById: (id) => api.get(`/financeiro/${id}`),
  create: (data) => api.post('/financeiro', data),
  update: (id, data) => api.put(`/financeiro/${id}`, data),
  delete: (id) => api.delete(`/financeiro/${id}`),
  getSummary: () => api.get('/financeiro/resumo'),
}

// Reports API
export const reportsAPI = {
  getDemandsByStatus: () => api.get('/relatorios/diligencias-por-status'),
  getMonthlyRevenue: () => api.get('/relatorios/faturamento-mensal'),
  getNewUsers: (params) => api.get('/relatorios/novos-usuarios', { params }),
  getCorrespondentPerformance: () => api.get('/relatorios/performance-correspondentes'),
  getClientActivity: () => api.get('/relatorios/atividade-clientes'),
}

// Attachments API
export const attachmentsAPI = {
  upload: (demandId, formData) => api.post(`/demandas/${demandId}/anexos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getByDemandId: (demandId) => api.get(`/demandas/${demandId}/anexos`),
  download: (attachmentId) => api.get(`/anexos/${attachmentId}/download`, {
    responseType: 'blob'
  }),
  delete: (attachmentId) => api.delete(`/anexos/${attachmentId}`),
}

export default api