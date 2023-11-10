export interface UptimeResponse {
	status: string;
	data:   UptimeResponseDataObject;
}

export interface UptimeResponseDataObject {
	id:                    number;
	RHPUptimeEntries:      any[];
	ExtramonUptimeEntries: ExtramonUptimeEntry[];
}

export interface ExtramonUptimeEntry {
	timestamp:  Date;
	satellites: Satellites;
}

export interface Satellites {
	[key: string]:   State;
}

export interface State {
	state: string;
	ping: boolean;
	rhpv2: boolean | undefined; //Only for RHP
	rhpv3: boolean | undefined; //Only for RHP
}