import api from '@/api';

export const getHostsByUserId = async (userId: number) => {
	const {data} = await api.get(`/user/${userId}/hosts`);
	return data;
}
