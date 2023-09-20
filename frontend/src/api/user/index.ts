import api from '@/api';
import Host from '@/types/Host.ts';

export const getHostsByUserId = async (userId: number) => {

	try {
		const {data: res} = await api.get(`/user/${userId}/hosts`);

		const requests = res.data.map((host: Host) => api.get(`/host/${host.id}`));
		const responses = await Promise.all(requests);

		return responses.map(res => res.data.data) as Array<Host>;
	} catch (error) {
		return Promise.reject(error);
	}
}

export const getUserById = async (userId: number) => {
	const {data} = await api.get(`/user/${userId}`);
	return data;
}
