import api from '@/api';

export const login = async ({email, password}: {
	email: string,
	password: string
}) => {
	try {
		const {data} = await api.post('/auth/login', {email});

		return {
			success: data?.status === 'success' ?? 'Logged in successfully',
			userObject: data?.userObject,
			error: null
		};
	} catch (error) {
		return {
			success: null,
			userObject: null,
			error: (error as any)?.response?.data.message || 'Server connection error'
		};
	}
}
