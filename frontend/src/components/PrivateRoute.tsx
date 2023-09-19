import { Navigate, Outlet } from "react-router-dom";
import {HostDmonContext, useHostDmon} from '@/context/HostDmonContext.tsx';

const PrivateRoute = () => {
	const {currentUser} = useHostDmon() as HostDmonContext;

	return currentUser ? <Outlet /> : <Navigate to="/login" />;
}

export default PrivateRoute;
