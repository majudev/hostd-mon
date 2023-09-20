type Host = {
	id: number,
	name: string,
	rhpAddress: string | null,
	rhpPubkey: string | null,
	rhpDeadtime: number,
	extramonPubkey: string | null,
	extramonDeadtime: number
};

export default Host;
