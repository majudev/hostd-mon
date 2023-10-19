import React, {useContext, useState, createContext, ReactNode} from 'react';

export type SidebarContext = {
	isSidebarOpen: boolean,
	setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
};

const SidebarContext = createContext<SidebarContext | null>(null);

export const useSidebar = (): SidebarContext => {
	return useContext(SidebarContext) as SidebarContext;
}

export const SidebarProvider = ({children}: { children: ReactNode }) => {
	const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

	return <SidebarContext.Provider value={{
		isSidebarOpen,
		setIsSidebarOpen
	}}>
		{children}
	</SidebarContext.Provider>;
};
