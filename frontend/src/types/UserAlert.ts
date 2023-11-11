import Host from '@/types/Host';

type UserAlert = {
	Host: Pick<Host, 'id' | 'name'>,
	id: number,
	message: string,
	read: false,
	sentTo: Array<string>,
	timestamp: string
};

export default UserAlert;
