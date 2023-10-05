import axios from 'axios';
import config from '@/config';

const api = axios.create({
	baseURL: config.API_URL,
	withCredentials: true
});

api.interceptors.response.use(res => res, async error => {
	if (error.response.status === 401) {
		alert('Please log in');
		window.location.href = '/login';
	}

	return Promise.reject(error);
});

export default api;
