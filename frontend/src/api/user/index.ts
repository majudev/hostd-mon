import api from '@/api';

export const getHostsByUserId = async (userId: number) => {

	try {
		const {data} = await api.get(`/user/${userId}/hosts`);

		if (!(data instanceof Array)) {
			return null;
		}

		const requests = data.map(host => api.get(`/host/${host.id}`));
		const responses = await Promise.all(requests);

		return responses.map(res => res.data);
	} catch (error) {
		return null;
	}
}

export const getUserByUserId = async (userId: number) => {

	try {
		const {data} = await api.get(`/user/${userId}`);

		return data;
	} catch (error) {
		return null;
	}
}
