import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('API Request Debug:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
            fullURL: `${config.baseURL}${config.url}`,
            hasToken: !!token,
            headers: config.headers
        });
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for handling errors
api.interceptors.response.use(
    (response) => {
        console.log('API Response Debug:', {
            status: response.status,
            url: response.config.url,
            data: response.data
        });
        return response;
    },
    (error) => {
        console.error('API Error Debug:', {
            status: error.response?.status,
            url: error.config?.url,
            error: error.response?.data,
            message: error.message
        });
        if (error.response?.status === 401) {
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error.response?.data?.error || 'Bir hata oluştu');
    }
);

// Auth service
export const authService = {
    login: async (email, password, userType) => {
        try {
            const response = await api.post('/auth/login', {
                email,
                password,
                userType
            });
            
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userId', response.data.user.id);
                localStorage.setItem('userRole', response.data.user.role);
            }
            
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    logout: () => {
        localStorage.clear();
        window.location.href = '/login';
    }
};

// Admin Profile Services
export const adminService = {
    getProfile: async () => {
        try {
            const response = await api.get('/admin/profile');
            // Format dates
            if (response.data.last_login) {
                response.data.lastLogin = new Date(response.data.last_login).toLocaleString('tr-TR');
            }
            if (response.data.created_at) {
                response.data.createdAt = new Date(response.data.created_at).toLocaleString('tr-TR');
            }
            return response.data;
        } catch (error) {
            throw error?.response?.data?.error || 'Profil bilgileri alınamadı';
        }
    },

    updateProfile: async (profileData) => {
        try {
            const response = await api.put('/admin/profile', profileData);
            return response.data;
        } catch (error) {
            throw error?.response?.data?.error || 'Profil güncellenirken bir hata oluştu';
        }
    }
};

// User Services
export const userService = {
    getUsers: async (page = 1, pageSize = 10) => {
        try {
            const response = await api.get('/users', {
                params: { page, page_size: pageSize }
            });
            return response.data;
        } catch (error) {
            throw error?.response?.data?.error || 'Kullanıcılar alınamadı';
        }
    },

    getUserById: async (id) => {
        try {
            const response = await api.get(`/users/${id}`);
            return response.data.user;
        } catch (error) {
            throw error?.response?.data?.error || 'Kullanıcı bulunamadı';
        }
    },

    createUser: async (userData) => {
        try {
            const response = await api.post('/users', userData);
            return response.data;
        } catch (error) {
            throw error?.response?.data?.error || 'Kullanıcı oluşturulamadı';
        }
    },

    updateUser: async (id, userData) => {
        try {
            const response = await api.put(`/users/${id}`, userData);
            return response.data;
        } catch (error) {
            throw error?.response?.data?.error || 'Kullanıcı güncellenemedi';
        }
    },

    updateOperator: async (id, operatorData) => {
        try {
            const response = await api.put(`/operators/${id}`, operatorData);
            return response.data;
        } catch (error) {
            throw error?.response?.data?.error || 'Operatör bilgileri güncellenemedi';
        }
    },

    deleteUser: async (id) => {
        try {
            const response = await api.delete(`/users/${id}`);
            return response.data;
        } catch (error) {
            throw error?.response?.data?.error || 'Kullanıcı silinemedi';
        }
    },

    changePassword: async (id, passwordData) => {
        try {
            const response = await api.post(`/users/${id}/change-password`, passwordData);
            return response.data;
        } catch (error) {
            throw error?.response?.data?.error || 'Şifre değiştirilemedi';
        }
    },

    getUnits: async () => {
        try {
            const response = await api.get('/units');
            return response.data;
        } catch (error) {
            throw error?.response?.data?.error || 'Birimler alınamadı';
        }
    },

    getStations: async () => {
        try {
            const response = await api.get('/stations');
            return response.data;
        } catch (error) {
            throw error?.response?.data?.error || 'İstasyonlar alınamadı';
        }
    },

    // Profile methods for current user
    getProfile: async () => {
        try {
            const response = await api.get('/profile');
            return response.data;
        } catch (error) {
            throw error?.response?.data?.error || 'Profil bilgileri alınamadı';
        }
    },

    updateProfile: async (profileData) => {
        try {
            const response = await api.put('/profile', profileData);
            return response.data;
        } catch (error) {
            throw error?.response?.data?.error || 'Profil güncellenirken bir hata oluştu';
        }
    }
};

// Flight Services (Readonly for Admin)
export const flightService = {
    getFlights: async (page = 1, pageSize = 10, status = null, priority = null) => {
        try {
            const params = { page, page_size: pageSize };
            if (status) params.status = status;
            if (priority) params.priority = priority;
            
            const response = await api.get('/flights', { params });
            return response.data;
        } catch (error) {
            throw error?.response?.data?.error || 'Uçuşlar alınamadı';
        }
    },

    getFlightById: async (id) => {
        try {
            const response = await api.get(`/flights/${id}`);
            return response.data.flight;
        } catch (error) {
            if (error.response?.status === 404) {
                throw error.response.data.error || 'Uçuş bulunamadı';
            }
            throw error?.response?.data?.error || 'Uçuş alınamadı';
        }
    },

    getActiveFlights: async () => {
        try {
            const response = await api.get('/flights/active');
            return response.data;
        } catch (error) {
            throw error?.response?.data?.error || 'Aktif uçuşlar alınamadı';
        }
    },

    getFlightStats: async () => {
        try {
            const response = await api.get('/flights/stats');
            return response.data;
        } catch (error) {
            throw error?.response?.data?.error || 'Uçuş istatistikleri alınamadı';
        }
    },

    // Helper functions for UI
    getFlightStatuses: () => ({
        'PLANNED': 'Planlandı',
        'SCHEDULED': 'Zamanlandı',
        'BOARDING': 'Binme',
        'READY': 'Hazır',
        'TAXIING': 'Taksi',
        'TAKEOFF': 'Kalkış',
        'IN_FLIGHT': 'Uçuşta',
        'LANDING': 'İniş',
        'LANDED': 'İndi',
        'COMPLETED': 'Tamamlandı',
        'CANCELLED': 'İptal',
        'DELAYED': 'Gecikti',
        'DIVERTED': 'Yönlendirildi',
        'EMERGENCY': 'Acil Durum',
        'ABORTED': 'Durduruldu',
        'APPROVED': 'Onaylandı',
        'ACTIVE': 'Aktif'
    }),

    getPriorityLevels: () => ({
        1: 'Düşük',
        2: 'Orta',
        3: 'Yüksek',
        4: 'Kritik'
    })
};

// Flight Plan Services
export const flightPlanService = {
    getFlightPlans: async (page = 1, pageSize = 10, status = null) => {
        try {
            const params = { page, page_size: pageSize };
            if (status) params.status = status;
            
            const response = await api.get('/flight-plans', { params });
            return response.data;
        } catch (error) {
            throw error?.response?.data?.error || 'Uçuş planları alınamadı';
        }
    },

    getFlightPlanById: async (id) => {
        try {
            const response = await api.get(`/flight-plans/${id}`);
            return response.data;
        } catch (error) {
            throw error?.response?.data?.error || 'Uçuş planı bulunamadı';
        }
    },

    createFlightPlan: async (flightPlanData) => {
        try {
            const response = await api.post('/flight-plans', flightPlanData);
            return response.data;
        } catch (error) {
            throw error?.response?.data?.error || 'Uçuş planı oluşturulamadı';
        }
    },

    updateFlightPlan: async (id, flightPlanData) => {
        try {
            const response = await api.put(`/flight-plans/${id}`, flightPlanData);
            return response.data;
        } catch (error) {
            throw error?.response?.data?.error || 'Uçuş planı güncellenemedi';
        }
    },

    approveFlightPlan: async (id) => {
        try {
            const response = await api.put(`/flight-plans/${id}/approve`);
            return response.data;
        } catch (error) {
            throw error?.response?.data?.error || 'Uçuş planı onaylanamadı';
        }
    },

    cancelFlightPlan: async (id) => {
        try {
            const response = await api.put(`/flight-plans/${id}/cancel`);
            return response.data;
        } catch (error) {
            throw error?.response?.data?.error || 'Uçuş planı iptal edilemedi';
        }
    },

    deleteFlightPlan: async (id) => {
        try {
            const response = await api.delete(`/flight-plans/${id}`);
            return response.data;
        } catch (error) {
            throw error?.response?.data?.error || 'Uçuş planı silinemedi';
        }
    }
};

// Aircraft Services (Readonly for Admin)
export const aircraftService = {
    getAircraft: async (page = 1, pageSize = 10, status = null) => {
        try {
            const params = { page, page_size: pageSize };
            if (status) params.status = status;
            
            const response = await api.get('/aircrafts', { params });
            return response.data;
        } catch (error) {
            throw error?.response?.data?.error || 'Uçaklar alınamadı';
        }
    },

    getAircraftById: async (id) => {
        try {
            const response = await api.get(`/aircrafts/${id}`);
            return response.data.aircraft;
        } catch (error) {
            throw error?.response?.data?.error || 'Uçak bulunamadı';
        }
    },

    getAircraftByCode: async (code) => {
        try {
            const response = await api.get(`/aircrafts/code/${code}`);
            return response.data.aircraft;
        } catch (error) {
            throw error?.response?.data?.error || 'Uçak bulunamadı';
        }
    },

    getAircraftState: async (id) => {
        try {
            const response = await api.get(`/aircrafts/${id}/state`);
            return response.data;
        } catch (error) {
            throw error?.response?.data?.error || 'Uçak durumu alınamadı';
        }
    }
};

// Airport Services
export const airportService = {
    getAirports: async (page = 1, pageSize = 10) => {
        try {
            const response = await api.get('/airports', {
                params: { page, page_size: pageSize }
            });
            return response.data;
        } catch (error) {
            throw error?.response?.data?.error || 'Havaalanları alınamadı';
        }
    }
};

// Mission Type Services
export const missionTypeService = {
    getMissionTypes: async () => {
        try {
            const response = await api.get('/mission-types');
            return response.data;
        } catch (error) {
            throw error?.response?.data?.error || 'Misyon tipleri alınamadı';
        }
    },

    getMissionTypeById: async (id) => {
        try {
            const response = await api.get(`/mission-types/${id}`);
            return response.data.mission_type;
        } catch (error) {
            throw error?.response?.data?.error || 'Misyon tipi bulunamadı';
        }
    }
};

// Weather Services
export const weatherService = {
    getWeatherConditions: async (page = 1, pageSize = 10) => {
        try {
            const response = await api.get('/weather', {
                params: { page, page_size: pageSize }
            });
            return response.data;
        } catch (error) {
            throw error?.response?.data?.error || 'Hava durumu verileri alınamadı';
        }
    },

    getWeatherConditionById: async (id) => {
        try {
            const response = await api.get(`/weather/${id}`);
            return response.data;
        } catch (error) {
            throw error?.response?.data?.error || 'Hava durumu verisi bulunamadı';
        }
    }
};

export default api;