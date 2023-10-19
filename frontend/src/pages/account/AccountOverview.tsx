import React from 'react';
import {useHostDmon} from '@/context/HostDmonContext';
import {Grid} from '@mui/material';
import AccountSettingsForm from '@/pages/account/AccountSettingsForm';
import {useParams} from 'react-router-dom';
import Title from '@/components/Title';
import AddHost from '@/pages/host/AddHost';
import Panel from '@/components/Panel';

const AccountOverview: React.FC = () => {
	const {currentUser} = useHostDmon();

	if (currentUser == null) return <></>;

	const {id: userToEditId} = useParams();

	const editingMyAccount = parseInt(userToEditId as string) === currentUser.id;

	return <Grid container spacing={3}>
		<Panel>
			{JSON.stringify(currentUser ?? {}, null, 3)}
		</Panel>

		<Panel item xs={6} md={6} lg={6}>
			<Title>{editingMyAccount ? 'Settings' : `Edit user #${userToEditId}`}</Title>

			<AccountSettingsForm/>
		</Panel>

		{
			currentUser.admin && !editingMyAccount && <Grid item xs={6} md={6} lg={6}>
              <Panel>
                  <Title>Add new host for this user</Title>

                  <AddHost userId={parseInt(userToEditId as string)}/>
              </Panel>
          </Grid>
		}
	</Grid>;
};

export default AccountOverview;
