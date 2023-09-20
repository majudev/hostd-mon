import api from '@/api';

export const login = async ({email, password}: {
	email: string,
	password: string
}) => {
	const {data} = await api.post('/auth/login', {email});
	return data;
}
