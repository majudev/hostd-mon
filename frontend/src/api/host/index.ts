import api from '@/api';
import Host from '@/types/Host.ts';

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
