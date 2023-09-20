type Host = {
	id: number,
	name: string,
	rhpAddress: string | null | undefined,
	rhpPubkey: string | null | undefined,
	rhpDeadtime: number | undefined,
	extramonPubkey: string | null | undefined,
	extramonDeadtime: number | undefined
};

export default Host;
