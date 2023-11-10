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
	[key: string]:   string;
}
