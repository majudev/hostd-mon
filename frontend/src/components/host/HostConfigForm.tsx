import React, {useEffect} from 'react';
import Host from '@/types/Host';
import {useForm} from '@/hooks/useForm';
import {
	Button,
	FormControl,
	FormControlLabel,
	FormGroup,
	InputLabel,
	MenuItem,
	Select, SelectChangeEvent,
	Switch,
	TextField
} from '@mui/material';
import Divider from '@mui/material/Divider';

export type HostConfigFormFields = Omit<Host, 'id'> & { rhp: boolean, extramon: boolean };

type HostConfigFormProps = React.ComponentProps<'form'> & {
	handleSubmit?: (formData: HostConfigFormFields) => any,
	defaultFormValues?: HostConfigFormFields,
	disableForm?: boolean,
	errorFields?: Array<string>
};

const HostConfigForm: React.FC<HostConfigFormProps> = ({
	                                                       handleSubmit,
	                                                       defaultFormValues,
	                                                       disableForm,
	                                                       errorFields
                                                       }) => {
	const {formData, handleInputChange, setNewFormValues} = useForm<HostConfigFormFields>(defaultFormValues ?? {
		name: '',
		rhp: true,
		rhpAddress: '',
		rhpPubkey: '',
		extramon: false,
		extramonPubkey: '',
		rhpDeadtime: 300,
		extramonDeadtime: 300
	});

	useEffect(() => {
		if (defaultFormValues == null) return;

		setNewFormValues(defaultFormValues);
	}, [defaultFormValues]);

	const onCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.checked) return;

		setNewFormValues({
			...formData,
			rhp: e.target.name === 'extramon' && formData.extramon,
			extramon: e.target.name === 'rhp' && formData.rhp
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
				required
				label="Host name"
				name="name"
				error={errorFields?.includes('name')}
				onChange={handleInputChange}
				disabled={disableForm}
				value={formData.name}
				fullWidth
				sx={{mb: 2, mt: 1}}
			/>

			<Divider/>

			<FormControlLabel disabled={disableForm} control={
				<Switch name="rhp" onChange={e => {
					handleInputChange(e);
					onCheckboxChange && onCheckboxChange(e);
				}} checked={formData.rhp}/>
			} label="rhp" sx={{mb: 2, mt: 1}}/>

			<TextField
				type="text"
				variant='outlined'
				label="rhpAddress"
				name="rhpAddress"
				onChange={handleInputChange}
				value={formData.rhpAddress}
				disabled={!formData.rhp || disableForm}
				required={formData.rhp}
				error={errorFields?.includes('rhpAddress')}
				fullWidth
				sx={{mb: 4}}
			/>

			<TextField
				type="text"
				variant='outlined'
				label="rhpPubkey"
				name="rhpPubkey"
				onChange={handleInputChange}
				value={formData.rhpPubkey}
				disabled={!formData.rhp || disableForm}
				required={formData.rhp}
				error={errorFields?.includes('rhpPubkey')}
				fullWidth
				sx={{mb: 2}}
			/>

			<FormControl error={errorFields?.includes('rhpDeadtime')} disabled={!formData.rhp || disableForm} required={formData.rhp} fullWidth sx={{my: 2}}>
				<InputLabel id="rhpDeadtime">rhp dead time</InputLabel>
				<Select
					labelId="demo-simple-select-label"
					id="rhpDeadtime"
					value={formData.rhpDeadtime}
					label="rhp dead time"
					onChange={(event: SelectChangeEvent<number>) => {
						setNewFormValues({
							...formData,
							rhpDeadtime: event.target.value as number
						});
					}}
				>
					<MenuItem value={300}>5 min</MenuItem>
					<MenuItem value={900}>10 min</MenuItem>
					<MenuItem value={1800}>15 min</MenuItem>
					<MenuItem value={3600}>1 hr</MenuItem>
					<MenuItem value={7200}>2 hrs</MenuItem>
					<MenuItem value={10800}>3 hrs</MenuItem>
				</Select>
			</FormControl>

			<Divider/>

			<FormControlLabel disabled={disableForm} control={
				<Switch name="extramon" onChange={e => {
					handleInputChange(e);
					onCheckboxChange && onCheckboxChange(e);
				}} checked={formData.extramon}/>
			} label="extramon" sx={{mb: 2, mt: 1}}/>

			<TextField
				type="text"
				variant='outlined'
				label="extramonPubkey"
				name="extramonPubkey"
				onChange={handleInputChange}
				value={formData.extramonPubkey}
				disabled={!formData.extramon || disableForm}
				required={formData.extramon}
				error={errorFields?.includes('extramonPubkey')}
				fullWidth
				sx={{mb: 2}}
			/>

			<Divider/>

			<FormControl error={errorFields?.includes('extramonDeadtime')} disabled={!formData.extramon || disableForm} required={formData.extramon} fullWidth sx={{my: 2}}>
				<InputLabel id="extramonDeadtime">extramon dead time</InputLabel>
				<Select
					labelId="demo-simple-select-label"
					id="extramonDeadtime"
					value={formData.extramonDeadtime}
					label="Extramon dead time"
					onChange={(event: SelectChangeEvent<number>) => {
						setNewFormValues({
							...formData,
							extramonDeadtime: event.target.value as number
						});
					}}
				>
					<MenuItem value={300}>5 min</MenuItem>
					<MenuItem value={900}>10 min</MenuItem>
					<MenuItem value={1800}>15 min</MenuItem>
					<MenuItem value={3600}>1 hr</MenuItem>
					<MenuItem value={7200}>2 hrs</MenuItem>
					<MenuItem value={10800}>3 hrs</MenuItem>
				</Select>
			</FormControl>

		</FormGroup>

		<Button variant="outlined" type="submit" disabled={disableForm ?? false} fullWidth>Submit</Button>
	</form>;
};

export default HostConfigForm;
