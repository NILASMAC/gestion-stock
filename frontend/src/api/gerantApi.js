import api from './axiosConfig'

export const getMesProduits = () => api.get('/gerant/mes-produits')
export const vendre = (data) => api.post('/gerant/vendre', data)
export const getMesVentes = () => api.get('/gerant/mes-ventes')
export const getMonProfil = () => api.get('/gerant/mon-profil')
export const getMesNotifications = () => api.get('/gerant/mes-notifications')
export const marquerNotificationLue = (id) => api.put(`/gerant/notifications/${id}/read`)
export const marquerToutesNotificationsLues = () => api.put('/gerant/notifications/read-all')
export const getNonLuesCount = () => api.get('/gerant/notifications/non-lues/count')
export const exportExcel = () => api.get('/gerant/export-excel', { responseType: 'blob' })