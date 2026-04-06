import api from './axiosConfig'
export const getMesProduits = ()     => api.get('/gerant/mes-produits')
export const vendre         = (data) => api.post('/gerant/vendre', data)
export const getMesVentes   = ()     => api.get('/gerant/mes-ventes')
export const getMonProfil   = ()     => api.get('/gerant/mon-profil')
