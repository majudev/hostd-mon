import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import PrivateRoute from '@/components/PrivateRoute';
import {HostDmonProvider} from '@/context/HostDmonContext';
import Login from '@/pages/Login';
import AddHost from '@/pages/host/AddHost';
import DrawerView from '@/pages/DrawerView';
import HostOverview from '@/pages/host/HostOverview';
import AccountOverview from '@/pages/account/AccountOverview';
import Panel from '@/components/Panel';

const App = () => {
	return <Router>
		<HostDmonProvider>
			<Routes>
				<Route path="/" element={<PrivateRoute/>}>
					<Route path="" element={<DrawerView/>}/>
					<Route path="host/add/" element={
						<DrawerView pageTitle="Add new host">
							<Panel><AddHost/></Panel>
						</DrawerView>
					}/>

					<Route path="host/:id" element={
						<DrawerView pageTitle="Host overview">
							<HostOverview/>
						</DrawerView>
					}/>

					<Route path="user/:id" element={
						<DrawerView pageTitle="Account">
							<AccountOverview />
						</DrawerView>
					}/>
				</Route>
				<Route path="/login" element={<Login/>}/>
				<Route path="*" element={<div>404 Not Found</div>}/>
			</Routes>
		</HostDmonProvider>
	</Router>;
}

export default App;
