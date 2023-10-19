import {Navigate, Outlet} from 'react-router-dom';
import {useHostDmon} from '@/context/HostDmonContext';

const PrivateRoute = () => {
	const {currentUser} = useHostDmon();

	return currentUser ? <Outlet/> : <Navigate to="/login"/>;
}

export default PrivateRoute;
