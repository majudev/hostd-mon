import api from '@/api';
import Host from '@/types/Host';

export const getUptimeByHostId = async ({hostId, from, to}: {
	hostId: number,
	from: Date,
	to: Date | 'now'
}) => {
	const url = `/host/${hostId}/uptime/period/${from.getTime()}/${to instanceof Date ? to.getTime() : to}`;
	const {data} = await api.get(url);
	return data;
}

export const getHostById = async (hostId: number) => {
	const {data} = await api.get(`/host/${hostId}`);
	return data;
};

export const getHostAlerts = async (hostId: number) => {
	const {data} = await api.get(`/host/${hostId}/alerts`);
	return data;
};

export const getHostsByIds = async (hostsIds: Array<number>) => {
	try {
		const requestPromises = hostsIds.map(hostId => api.get(`/host/${hostId}`).catch(error => error));
		const results = await Promise.all(requestPromises);

		const validResults = results.filter(result => (!(result instanceof Error)));

		const hosts = validResults.map(res => res.data.data) as Array<Host>;

		hosts.sort((a, b) => a.id > b.id ? 1 : -1);

		return hosts;
	} catch (error) {
		return Promise.reject(error);
	}
};

export const updateHost = async (host: Host) => {
	const {data} = await api.patch(`/host/${host.id}`, host);
	return data;
}

export const createHost = async (host: Omit<Host, 'id'>, userId?: number) => {
	const {data} = await api.post('/host/new', {
		...host,
		userId
	});
	return data;
}

export const deleteHost = async (hostId: number) => {
	const {data} = await api.delete(`/host/${hostId}`);
	return data;
}
