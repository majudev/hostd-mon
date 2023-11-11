export interface UptimeResponse {
	status: string;
	data: UptimeResponseDataObject;
}

export interface UptimeResponseDataObject {
	id: number;
	RHPUptimeEntries: UptimeEntry[];
	ExtramonUptimeEntries: UptimeEntry[];
}

export interface UptimeEntry {
	timestamp: Date;
	satellites: Satellites;
}

export interface Satellites {
	[key: string]: StateObject;
}

export type State = 'good' | 'warn' | 'fail';

export interface StateObject {
	state: State;
	ping: boolean;
	rhpv2?: boolean; //Only for RHP
	rhpv3?: boolean; //Only for RHP
}
