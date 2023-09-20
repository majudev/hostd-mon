import React, {useEffect} from 'react';
import Host from '@/types/Host.ts';
import {useForm} from '@/hooks/useForm.ts';
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

export type HostConfigFormFields = Omit<Host, 'id'> & { sia: boolean, extramon: boolean, deadTime: number };

type HostConfigFormProps = React.ComponentProps<'form'> & {
	handleSubmit?: (formData: HostConfigFormFields) => any,
	defaultFormValues?: HostConfigFormFields,
	disableSubmitButton?: boolean
};

const HostConfigForm: React.FC<HostConfigFormProps> = ({
	                                                       handleSubmit,
	                                                       defaultFormValues,
	                                                       disableSubmitButton
                                                       }) => {
	const {formData, handleInputChange, setNewFormValues} = useForm<HostConfigFormFields>(defaultFormValues ?? {
		name: '',
		sia: true,
		rhpAddress: '',
		rhpPubkey: '',
		extramon: false,
		extramonPubkey: '',
		deadTime: 300
	});

	useEffect(() => {
		if (defaultFormValues == null) return;

		setNewFormValues(defaultFormValues);
	}, [defaultFormValues]);

	const onCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.checked) return;

		setNewFormValues({
			...formData,
			sia: e.target.name === 'extramon' && formData.extramon,
			extramon: e.target.name === 'sia' && formData.sia
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
				onChange={handleInputChange}
				value={formData.name}
				fullWidth
				sx={{mb: 2}}
			/>

			<Divider/>

			<FormControlLabel control={
				<Switch name="sia" onChange={e => {
					handleInputChange(e);
					onCheckboxChange && onCheckboxChange(e);
				}} checked={formData.sia}/>
			} label="sia" sx={{mb: 2, mt: 1}}/>

			<TextField
				type="text"
				variant='outlined'
				label="rhpAddress"
				name="rhpAddress"
				onChange={handleInputChange}
				value={formData.rhpAddress}
				disabled={!formData.sia}
				required={formData.sia}
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
				disabled={!formData.sia}
				required={formData.sia}
				fullWidth
				sx={{mb: 2}}
			/>

			<Divider/>

			<FormControlLabel control={
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
				disabled={!formData.extramon}
				required={formData.extramon}
				fullWidth
				sx={{mb: 2}}
			/>

			<Divider/>

			<FormControl required fullWidth sx={{my: 2}}>
				<InputLabel id="deadTime">Dead time</InputLabel>
				<Select
					labelId="demo-simple-select-label"
					id="deadTime"
					value={formData.deadTime}
					label="Dead time"
					onChange={(event: SelectChangeEvent<number>) => {
						setNewFormValues({
							...formData,
							deadTime: event.target.value as number
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

		<Button variant="outlined" type="submit" disabled={disableSubmitButton ?? false} fullWidth>Submit</Button>
	</form>;
};

export default HostConfigForm;
