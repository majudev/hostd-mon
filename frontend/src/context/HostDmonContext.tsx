import React, {useContext, useState, createContext, useRef, ReactNode, useEffect} from 'react';
import User from '@/types/User.ts';
import {getHostsByUserId} from '@/api/user';
import Host from '@/types/Host.ts';

export type HostDmonContext = {
	currentUser: User | null,
	hosts: Host[],
	setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>
};

const HostDmonContext = createContext<HostDmonContext | null>(null);

export const useHostDmon = (): HostDmonContext | null => {
	return useContext(HostDmonContext);
}

export const HostDmonProvider = ({children}: { children: ReactNode }) => {
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [hosts, setHosts] = useState<any>(null);

	useEffect(() => {
		if (currentUser == null) return;
		if (hosts != null) return;

		getHostsByUserId(currentUser.id)
			.then(data => {
				if (data instanceof Array) setHosts(data);
			})
			.catch(console.error);
	}, [currentUser]);




	return <HostDmonContext.Provider value={{
		currentUser,
		setCurrentUser,
		hosts,
	}}>
		{children}
	</HostDmonContext.Provider>;
}
