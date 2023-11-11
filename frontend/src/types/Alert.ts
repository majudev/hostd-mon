import Host from '@/types/Host';

type Alert = {
	Host: Pick<Host, 'id' | 'name'>,
	id: number,
	message: string,
	read: false,
	sentTo: Array<string>,
	timestamp: string
};

export default Alert;
