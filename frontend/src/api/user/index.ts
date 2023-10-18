import api from '@/api';
import Host from '@/types/Host.ts';
import {AccountSettingsFormFields} from '@/pages/account/AccountSettingsForm.tsx';

export const getHostsByUserId = async (userId: number) => {

	try {
		const {data: res} = await api.get(`/user/${userId}/hosts`);

		const requests = res.data.map((host: Host) => api.get(`/host/${host.id}`));
		const responses = await Promise.all(requests);

		const hosts = responses.map(res => res.data.data) as Array<Host>;

		hosts.sort((a, b) => a.id > b.id ? 1 : -1);

		return hosts;
	} catch (error) {
		return Promise.reject(error);
	}
}

export const getUserById = async (userId: number) => {
	const {data} = await api.get(`/user/${userId}`);
	return data;
}

export const getUser = async () => {
	const {data} = await api.get('/user/me');
	return data;
}

export const updateUserById = async (userId: number, fieldsToUpdate: AccountSettingsFormFields) => {
	const {data} = await api.patch(`/user/${userId}`, fieldsToUpdate);
	return data;
};
