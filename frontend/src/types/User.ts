type User = {
	id: number,
	name: string,
	email: string,
	admin: boolean,
	alertEmail: string | null,
	alertPhoneNumber: string | null,
	globallyDisableEmailAlerts: boolean,
	globallyDisablePhoneAlerts: boolean,
	Hosts?: Array<{id: number}>
};

export default User;
