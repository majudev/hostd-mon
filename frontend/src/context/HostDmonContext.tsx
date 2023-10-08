import React, {useContext, useState, createContext, ReactNode, useEffect} from 'react';
import User from '@/types/User.ts';
import {getHostsByUserId} from '@/api/user';
import Host from '@/types/Host.ts';
import {UptimeResponseDataObject} from '@/types/Uptime.tsx';
import Satellite from '@/types/Satellite.ts';
import {getSatellites} from '@/api/satellites';

export type HostDmonContext = {
	currentUser: User | null,
	setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>

	hosts: Array<Host> | null,
	setHosts: React.Dispatch<React.SetStateAction<Array<Host> | null>>,

	uptimeEntries: UptimeResponseDataObject | null,
	setUptimeEntries: React.Dispatch<React.SetStateAction<UptimeResponseDataObject | null>>,

	satellites: Array<Satellite> | null,
	setSatellites: React.Dispatch<React.SetStateAction<Array<Satellite> | null>>,
};

const HostDmonContext = createContext<HostDmonContext | null>(null);

export const useHostDmon = (): HostDmonContext | null => {
	return useContext(HostDmonContext);
}

export const HostDmonProvider = ({children}: { children: ReactNode }) => {
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [hosts, setHosts] = useState<Array<Host> | null>(null);
	const [satellites, setSatellites] = useState<Array<Satellite> | null>(null);
	const [uptimeEntries, setUptimeEntries] = useState<UptimeResponseDataObject | null>(null);

	useEffect(() => {
		if (currentUser == null) return;

		if (hosts == null) {
			getHostsByUserId(currentUser.id)
				.then((_hosts: Array<Host>) => {
					_hosts.sort((a, b) => a.id > b.id ? 1 : -1);
					setHosts(_hosts);
				})
				.catch(console.error);
		}

		if (satellites == null) {
			getSatellites()
				.then((_satellites: Array<Satellite>) => {
					setSatellites(_satellites);
				})
				.catch(console.error);
		}

	}, [currentUser]);

	return <HostDmonContext.Provider value={{
		currentUser,
		setCurrentUser,

		hosts,
		setHosts,

		uptimeEntries,
		setUptimeEntries,

		satellites,
		setSatellites
	}}>
		{children}
	</HostDmonContext.Provider>;
}
