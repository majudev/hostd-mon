import React, {useEffect} from 'react';
import User from '@/types/User';
import {useForm} from '@/hooks/useForm';
import {Button, FormControlLabel, FormGroup, Switch, TextField} from '@mui/material';

export type AccountUnmanagableSettings = Pick<User, 'id' | 'name' | 'email'>;
export type AccountSettingsFormFields = Omit<User, 'id' | 'name' | 'email'>;

type HostConfigFormProps = React.ComponentProps<'form'> & {
	handleSubmit?: (formData: AccountSettingsFormFields) => any,
	unmanagableSettings: AccountUnmanagableSettings,
	defaultFormValues?: AccountSettingsFormFields,
	disableAdminSwitch?: boolean,
	disableForm?: boolean,
	errorFields?: Array<string>
};

const AccountSettingsForm: React.FC<HostConfigFormProps> = ({
	                                                            handleSubmit,
	                                                            unmanagableSettings,
	                                                            defaultFormValues,
	                                                            disableAdminSwitch,
	                                                            disableForm,
	                                                            errorFields
                                                            }) => {

	const {
		formData,
		handleInputChange,
		setNewFormValues
	} = useForm<AccountSettingsFormFields>(defaultFormValues ?? {
		admin: false,
		alertEmail: '',
		alertPhoneNumber: '',
		globallyDisableEmailAlerts: true,
		globallyDisablePhoneAlerts: true
	});

	useEffect(() => {
		if (defaultFormValues == null) return;

		setNewFormValues(defaultFormValues);
	}, [defaultFormValues]);

	const onCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setNewFormValues({
			...formData,
			globallyDisableEmailAlerts: e.target.name === 'globallyDisableEmailAlerts' ? !e.target.checked : formData.globallyDisableEmailAlerts,
			globallyDisablePhoneAlerts: e.target.name === 'globallyDisablePhoneAlerts' ? !e.target.checked : formData.globallyDisablePhoneAlerts,
			admin: e.target.name === 'admin' ? e.target.checked : formData.admin
		});
	};

	const _handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		handleSubmit && handleSubmit(formData);
	}

	return <form onSubmit={_handleSubmit}>
		<FormGroup>
			<TextField
				type="text"
				variant='outlined'
				label="Name"
				name="Name"
				onChange={handleInputChange}
				value={unmanagableSettings.name ?? ''}
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
				value={unmanagableSettings.email ?? ''}
				disabled={true}
				fullWidth
				sx={{mb: 2}}
			/>

			<FormControlLabel disabled={disableAdminSwitch || disableForm} title={disableAdminSwitch ? 'You can not change your admin status' : undefined} control={
				<Switch name="admin" onChange={e => {
					handleInputChange(e);
					onCheckboxChange && onCheckboxChange(e);
				}} checked={formData.admin}/>
			} label="Admin" sx={{mb: 1}}/>

			<FormControlLabel disabled={disableForm} control={
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
				disabled={formData.globallyDisableEmailAlerts || disableForm}
				required={!formData.globallyDisableEmailAlerts}
				error={errorFields?.includes('alertEmail')}
				fullWidth
				sx={{mb: 2}}
			/>

			<FormControlLabel disabled={disableForm} control={
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
				disabled={formData.globallyDisablePhoneAlerts || disableForm}
				required={!formData.globallyDisablePhoneAlerts}
				error={errorFields?.includes('alertPhoneNumber')}
				fullWidth
				sx={{mb: 2}}
			/>

		</FormGroup>

		<Button variant="outlined" type="submit" disabled={disableForm} fullWidth>Save</Button>
	</form>;
};

export default AccountSettingsForm;
