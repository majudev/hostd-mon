import React, {useEffect, useState} from 'react';
import {Navigate, useNavigate} from 'react-router-dom';
import {useHostDmon} from '@/context/HostDmonContext';
import {Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from '@mui/material';
import {v4 as uuidv4} from 'uuid';
import User from '@/types/User';
import Panel from '@/components/Panel.tsx';
import {getAllUsers} from '@/api/user';

const ManageUsers: React.FC = () => {
	const {currentUser} = useHostDmon();
	const navigate = useNavigate();

	if (currentUser == null) return <></>;
	if (!currentUser.admin) return <Navigate to={`/user/${currentUser.id}`}/>;

	const [users, setUsers] = useState<Array<User> | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		if (users != null) return;
		if (isLoading) return;

		setIsLoading(true);

		getAllUsers()
			.then(setUsers)
			.finally(() => setIsLoading(false));
	}, []);

	return <Grid container spacing={3}>
		<Panel item xs={12} md={12} lg={12}>
			<TableContainer>
				<Table stickyHeader>
					<TableHead>
						<TableRow>
							<TableCell>ID</TableCell>
							<TableCell>Name</TableCell>
							<TableCell>Email</TableCell>
							<TableCell>Admin</TableCell>
							<TableCell>Email Alerts</TableCell>
							<TableCell>Alert Email</TableCell>
							<TableCell>Phone Alerts</TableCell>
							<TableCell>Alert Phone No.</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{users?.map((user) => (
							<TableRow
								key={uuidv4()}
								onClick={() => navigate(`/user/${user.id}`)}
								title={`Click to edit account of ${user.name}`}
								sx={{cursor: 'pointer'}}
							>
								<TableCell>{user.id ?? '-'}</TableCell>
								<TableCell>{user.name ?? '-'}</TableCell>
								<TableCell>{user.email ?? '-'}</TableCell>
								<TableCell>{user.admin ? 'Y' : 'N'}</TableCell>
								<TableCell>{!user.globallyDisableEmailAlerts ? 'Y' : 'N'}</TableCell>
								<TableCell>{user.alertEmail ?? '-'}</TableCell>
								<TableCell>{!user.globallyDisablePhoneAlerts ? 'Y' : 'N'}</TableCell>
								<TableCell>{user.alertPhoneNumber ?? '-'}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Panel>
	</Grid>;
	;
};

export default ManageUsers;
