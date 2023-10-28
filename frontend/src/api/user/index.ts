import api from '@/api';
import Host from '@/types/Host';
import {AccountSettingsFormFields} from '@/components/account/AccountSettingsForm';
import User from '@/types/User';

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

export const getAllUsers = async () => {
	type IncomingUser = Pick<User, 'id' | 'name' | 'email' | 'admin'>;

	try {
		const {data: res} = await api.get('/user/all');

		const requestPromises = res.data.map((user: IncomingUser) => api.get(`/user/${user.id}`).catch(error => error));
		const results = await Promise.all(requestPromises);

		const validResults = results.filter(result => !(result instanceof Error));

		const users = validResults.map(res => res.data.data) as Array<User>;

		users.sort((a, b) => a.id > b.id ? 1 : -1);

		return users;
	} catch (error) {
		return Promise.reject(error);
	}
}
