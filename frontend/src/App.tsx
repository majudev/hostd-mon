import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import PrivateRoute from '@/components/routing/PrivateRoute';
import {HostDmonProvider} from '@/context/HostDmonContext';
import Login from '@/pages/Login';
import AddHost from '@/pages/host/AddHost';
import DrawerView from '@/pages/DrawerView';
import HostOverview from '@/pages/host/HostOverview';
import AccountOverview from '@/pages/account/AccountOverview';
import Panel from '@/components/Panel';
import ManageUsers from '@/pages/users/ManageUsers';
import NotFound from '@/pages/errors/NotFound';
import {SidebarProvider} from '@/context/SidebarContext';

const App = () => {
	return <Router>
		<HostDmonProvider>
			<SidebarProvider>
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
								<AccountOverview/>
							</DrawerView>
						}/>

						<Route path="users" element={
							<DrawerView pageTitle="Manage users">
								<ManageUsers/>
							</DrawerView>
						}/>
					</Route>
					<Route path="/login" element={<Login/>}/>
					<Route path="*" element={<NotFound/>}/>
				</Routes>
			</SidebarProvider>
		</HostDmonProvider>
	</Router>;
}

export default App;
