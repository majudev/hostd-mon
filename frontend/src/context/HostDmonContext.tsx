import React, {useContext, useState, createContext, ReactNode, useEffect} from 'react';
import {getHostsByUserId} from '@/api/user';
import User from '@/types/User';
import Host from '@/types/Host';

export type HostDmonContext = {
	currentUser: User | null,
	setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>

	hosts: Array<Host> | null,
	setHosts: React.Dispatch<React.SetStateAction<Array<Host> | null>>
};

const HostDmonContext = createContext<HostDmonContext | null>(null);

export const useHostDmon = (): HostDmonContext => {
	return useContext(HostDmonContext) as HostDmonContext;
}

export const HostDmonProvider = ({children}: { children: ReactNode }) => {
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [hosts, setHosts] = useState<Array<Host> | null>(null);

	useEffect(() => {
		if (currentUser == null) return;
		if (hosts != null) return;

		getHostsByUserId(currentUser.id).then(setHosts).catch(console.error);
	}, [currentUser]);

	return <HostDmonContext.Provider value={{
		currentUser,
		setCurrentUser,

		hosts,
		setHosts
	}}>
		{children}
	</HostDmonContext.Provider>;
};
