import api from '@/api';

export const getSatellites = async () => {
	const {data} = await api.get('/satellites');
	return data;
}
