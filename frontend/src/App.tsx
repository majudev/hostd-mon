import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import DrawerView from '@/pages/DrawerView.tsx';
import PrivateRoute from '@/components/PrivateRoute';
import {HostDmonProvider} from '@/context/HostDmonContext.tsx';
import Login from '@/pages/Login.tsx';
import AddHost from '@/pages/host/AddHost.tsx';
import Dashboard2 from '@/components/demo/Dashboard2.tsx';
import HostOverview from '@/pages/host/HostOverview.tsx';

const App = () => {
	return <Router>
		<HostDmonProvider>
			<Routes>
				<Route path="/" element={<PrivateRoute/>}>
					<Route path="" element={<DrawerView/>}/>
					<Route path="host/add/" element={
						<DrawerView pageTitle="Add new host">
							<AddHost/>
						</DrawerView>
					}/>

					<Route path="host/:id" element={
						<DrawerView pageTitle="Host overview">
							<HostOverview/>
						</DrawerView>
					}/>
					<Route path="test" element={<DrawerView><Dashboard2/></DrawerView>}/>
				</Route>
				<Route path="/login" element={<Login/>}/>
				<Route path="*" element={<div>404 Not Found</div>}/>
			</Routes>
		</HostDmonProvider>
	</Router>;
}

export default App;
