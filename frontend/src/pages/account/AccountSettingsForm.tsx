import React, {useState} from 'react';
import {useHostDmon} from '@/context/HostDmonContext';
import User from '@/types/User';
import {useForm} from '@/hooks/useForm';
import {Button, FormControlLabel, FormGroup, Switch, TextField, Typography} from '@mui/material';
import {getUserById, updateUserById} from '@/api/user';
import {Navigate, useParams} from 'react-router-dom';

export type AccountSettingsFormFields = Omit<User, 'id' | 'name' | 'email' | 'admin'>;

const AccountSettingsForm: React.FC = () => {
	const {currentUser, setCurrentUser} = useHostDmon();
	const {id: userToEditId} = useParams();

	if (currentUser == null) return <></>;
	if (userToEditId == null) return <></>;

	const editingMyself = parseInt(userToEditId) === currentUser.id;

	if (!editingMyself && !currentUser.admin) return <Navigate to={`/user/${currentUser.id}`}/>;

	const [userToEdit, setUserToEdit] = useState<User | null>(null);

	if (!editingMyself && currentUser.admin) {
		if (userToEdit == null) {
			getUserById(parseInt(userToEditId))
				.then(res => {
					userToEdit == null && setUserToEdit(res.data);
				})
				.catch(error => {
					console.error(error);

					const {data} = error?.response;
					alert(data?.message ?? error ?? 'Server error');
				});
		}
	}

	if (!editingMyself && userToEdit == null) return <></>;

	const {
		id,
		name,
		email,
		admin,
		Hosts,
		...changeableUserSetting
	} = (editingMyself ? currentUser : userToEdit) as User & { Hosts?: Array<{ id: number }> };

	const {formData, handleInputChange, setNewFormValues} = useForm<AccountSettingsFormFields>(changeableUserSetting);
	const [errorFields, setErrorFields] = useState<Array<string>>([]);

	const [loading, setLoading] = useState<boolean>(false);

	const onCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setNewFormValues({
			...formData,
			globallyDisableEmailAlerts: e.target.name === 'globallyDisableEmailAlerts' ? !e.target.checked : formData.globallyDisableEmailAlerts,
			globallyDisablePhoneAlerts: e.target.name === 'globallyDisablePhoneAlerts' ? !e.target.checked : formData.globallyDisablePhoneAlerts
		});
	};

	const _handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		updateUserById(editingMyself ? currentUser.id : parseInt(userToEditId), {
			...formData,
			alertEmail: (formData.alertEmail === '' || formData.alertEmail == null) ? null : formData.alertEmail,
			alertPhoneNumber: (formData.alertPhoneNumber === '' || formData.alertPhoneNumber == null) ? null : formData.alertPhoneNumber,
		}).then(res => {
			setErrorFields([]);

			const updatedUser = res?.data;

			editingMyself && setCurrentUser(updatedUser);

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

	return <form onSubmit={_handleSubmit}>
		<FormGroup>
			<TextField
				type="text"
				variant='outlined'
				label="Name"
				name="Name"
				onChange={handleInputChange}
				value={(editingMyself ? currentUser.name : userToEdit?.name) ?? ''}
				disabled={true}
				fullWidth
				sx={{mb: 4}}
			/>

			<TextField
				type="text"
				variant='outlined'
				label="Email"
				name="Email"
				onChange={handleInputChange}
				value={(editingMyself ? currentUser.email : userToEdit?.email) ?? ''}
				disabled={true}
				fullWidth
				sx={{mb: 4}}
			/>

			<Typography mb={3}>Admin: {currentUser.admin ? 'YES' : 'NO'}</Typography>

			<FormControlLabel disabled={loading} control={
				<Switch name="globallyDisableEmailAlerts" onChange={e => {
					handleInputChange(e);
					onCheckboxChange && onCheckboxChange(e);
				}} checked={!formData.globallyDisableEmailAlerts}/>
			} label="Email alerts" sx={{mb: 2, mt: 1}}/>

			<TextField
				type="email"
				variant='outlined'
				label="Alert email"
				name="alertEmail"
				onChange={handleInputChange}
				value={formData.alertEmail ?? ''}
				disabled={formData.globallyDisableEmailAlerts || loading}
				required={!formData.globallyDisableEmailAlerts}
				error={errorFields?.includes('alertEmail')}
				fullWidth
				sx={{mb: 2}}
			/>

			<FormControlLabel disabled={loading} control={
				<Switch name="globallyDisablePhoneAlerts" onChange={e => {
					handleInputChange(e);
					onCheckboxChange && onCheckboxChange(e);
				}} checked={!formData.globallyDisablePhoneAlerts}/>
			} label="Phone alerts" sx={{mb: 2, mt: 1}}/>

			<TextField
				type="text"
				variant='outlined'
				label="Alert phone number"
				name="alertPhoneNumber"
				InputProps={{inputProps: {maxLength: 20}}}
				onChange={handleInputChange}
				value={formData.alertPhoneNumber ?? ''}
				disabled={formData.globallyDisablePhoneAlerts || loading}
				required={!formData.globallyDisablePhoneAlerts}
				error={errorFields?.includes('alertPhoneNumber')}
				fullWidth
				sx={{mb: 2}}
			/>

		</FormGroup>

		<Button variant="outlined" type="submit" disabled={loading} fullWidth>Save</Button>
	</form>;
};

export default AccountSettingsForm;
