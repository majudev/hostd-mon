import React, {useEffect, useState} from 'react';
import {useHostDmon} from '@/context/HostDmonContext';
import User from '@/types/User';
import {getUserById, updateUserById} from '@/api/user';
import {Navigate, useNavigate, useParams} from 'react-router-dom';
import AccountSettingsForm, {
	AccountSettingsFormFields,
	AccountUnmanagableSettings
} from '@/components/account/AccountSettingsForm';
import Title from '@/components/Title';
import Panel from '@/components/Panel';
import {Divider, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from '@mui/material';
import AddHost from '@/pages/host/AddHost';
import Host from '@/types/Host';
import {getHostsByIds} from '@/api/host';
import {v4 as uuidv4} from 'uuid';

const AccountOverview: React.FC = () => {
	const {currentUser, setCurrentUser} = useHostDmon();
	const {id: userToEditId} = useParams();

	const navigate = useNavigate();

	const [userToEdit, setUserToEdit] = useState<User | null>(null);
	const [errorFields, setErrorFields] = useState<Array<string>>([]);
	const [hosts, setHosts] = useState<Array<Host> | null>(null);
	const [loading, setLoading] = useState<boolean>(false);

	if (currentUser == null) return <></>;
	if (userToEditId == null) return <></>;

	const editingMyself = parseInt(userToEditId) === currentUser.id;

	if (!editingMyself && !currentUser.admin) return <Navigate to={`/user/${currentUser.id}`}/>;

	useEffect(() => {
		if (editingMyself || !currentUser.admin) return;
		if (userToEdit != null) return;

		getUserById(parseInt(userToEditId))
			.then(res => {
				setUserToEdit(res.data);
			})
			.catch(error => {
				console.error(error);

				const {data} = error?.response;
				alert(data?.message ?? error ?? 'Server error');
			});
	}, [editingMyself, currentUser]);

	useEffect(() => {
		if (editingMyself || !currentUser.admin) return;
		if (userToEdit == null) return;
		if (hosts != null) return;

		const hostsIds = userToEdit.Hosts?.map(host => host.id);

		if (hostsIds == null) return;

		getHostsByIds(hostsIds).then(setHosts).catch(console.error);
	}, [editingMyself, currentUser, userToEdit]);

	if (!editingMyself && currentUser.admin && userToEdit == null) return <></>;

	const {
		id,
		name,
		email,
		Hosts,
		...changeableUserSettings
	} = (editingMyself ? currentUser : userToEdit) as User;

	if (!editingMyself && userToEdit == null) return <></>;

	const handleSubmit = (formData: AccountSettingsFormFields) => {
		updateUserById(editingMyself ? currentUser.id : parseInt(userToEditId), {
			...formData,
			alertEmail: (formData.alertEmail === '' || formData.alertEmail == null) ? null : formData.alertEmail,
			alertPhoneNumber: (formData.alertPhoneNumber === '' || formData.alertPhoneNumber == null) ? null : formData.alertPhoneNumber,
		}).then(res => {
			setErrorFields([]);

			const updatedUser = res?.data;

			if (editingMyself) setCurrentUser(updatedUser);
			else setUserToEdit(updatedUser);

			setLoading(false);
		}).catch(error => {
			console.error(error);
			setLoading(false);

			const {data} = error?.response;

			if (data == null) return;

			setErrorFields(data?.missing ?? []);
			alert(data?.message ?? error ?? 'Server error');
		});
	}

	return <Grid container spacing={3}>
		<Panel item xs={6} md={6} lg={6}>
			<Title mb={2}>{editingMyself ? 'Settings' : `Edit account of ${userToEdit?.name}`}</Title>

			<AccountSettingsForm
				handleSubmit={handleSubmit}
				unmanagableSettings={(editingMyself ? currentUser : userToEdit) as AccountUnmanagableSettings}
				defaultFormValues={changeableUserSettings}
				disableAdminSwitch={editingMyself}
				disableForm={loading}
				errorFields={errorFields}
			/>
		</Panel>

		{
			currentUser.admin && !editingMyself && <>
              <Panel item xs={6} md={6} lg={6}>
                  <Title>Hosts of {userToEdit?.name}</Title>

					  {
						  hosts != null && <TableContainer>
                         <Table stickyHeader>
                             <TableHead>
                                 <TableRow>
                                     <TableCell>ID</TableCell>
                                     <TableCell>Name</TableCell>
												{/*<TableCell>sia</TableCell>*/}
												{/*<TableCell>rhpAddress</TableCell>*/}
												{/*<TableCell>rhpPubkey</TableCell>*/}
												{/*<TableCell>rhpDeadtime</TableCell>*/}
												{/*<TableCell>extramon</TableCell>*/}
												{/*<TableCell>extramonPubkey</TableCell>*/}
												{/*<TableCell>extramonDeadtime</TableCell>*/}
                                 </TableRow>
                             </TableHead>
                             <TableBody>
										  {hosts.map((host) => (
											  <TableRow
												  key={uuidv4()}
												  onClick={() => navigate(`/host/${host.id}`)}
												  title={`Click to edit ${host.name}`}
												  sx={{cursor: 'pointer'}}
											  >
												  <TableCell>{host.id ?? '-'}</TableCell>
												  <TableCell>{host.name ?? '-'}</TableCell>
												  {/*<TableCell>{host.rhpAddress != null && host.rhpAddress !== '' && host.rhpPubkey != null && host.rhpPubkey !== '' ? 'Y' : 'N'}</TableCell>*/}
												  {/*<TableCell>{host.rhpAddress != null && host.rhpAddress !== '' ? host.rhpAddress : '-'}</TableCell>*/}
												  {/*<TableCell>{host.rhpPubkey != null && host.rhpPubkey !== '' ? host.rhpPubkey : '-'}</TableCell>*/}
												  {/*<TableCell>{host.rhpDeadtime ?? '-'}</TableCell>*/}
												  {/*<TableCell>{host.extramonPubkey != null && host.extramonPubkey !== '' ? 'Y' : 'N'}</TableCell>*/}
												  {/*<TableCell>{host.extramonPubkey != null && host.extramonPubkey !== '' ? host.extramonPubkey : '-'}</TableCell>*/}
												  {/*<TableCell>{host.extramonDeadtime ?? '-'}</TableCell>*/}
											  </TableRow>
										  ))}
                             </TableBody>
                         </Table>
                     </TableContainer>

					  }

                  <Divider/>

                  <Title mt={1}>Add new host for {userToEdit?.name}</Title>

                  <AddHost userId={parseInt(userToEditId as string)}/>
              </Panel>
          </>
		}
	</Grid>;
};

export default AccountOverview;
