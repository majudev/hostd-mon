import React, {useContext, useState, createContext, ReactNode, useEffect} from 'react';
import User from '@/types/User.ts';
import {getHostsByUserId} from '@/api/user';
import Host from '@/types/Host.ts';

export type HostDmonContext = {
	currentUser: User | null,
	setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>
	hosts: Array<Host> | null,
	setHosts: React.Dispatch<React.SetStateAction<Array<Host> | null>>
};

const HostDmonContext = createContext<HostDmonContext | null>(null);

export const useHostDmon = (): HostDmonContext | null => {
	return useContext(HostDmonContext);
}

export const HostDmonProvider = ({children}: { children: ReactNode }) => {
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [hosts, setHosts] = useState<Array<Host> | null>(null);

	useEffect(() => {
		if (currentUser == null) return;
		if (hosts != null) return;

		getHostsByUserId(currentUser.id)
			.then((_hosts: Array<Host>) => {
				_hosts.sort((a, b) => a.id > b.id ? 1 : -1);
				setHosts(_hosts);
			})
			.catch(console.error);
	}, [currentUser]);

	return <HostDmonContext.Provider value={{
		currentUser,
		setCurrentUser,
		hosts,
		setHosts
	}}>
		{children}
	</HostDmonContext.Provider>;
}
