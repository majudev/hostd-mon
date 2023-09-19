import React, {useState} from 'react';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import {Button, TextField} from '@mui/material';
import Host from '@/types/Host.ts';
import {useForm} from '@/hooks/useForm.ts';

const AddHost: React.FC = () => {
	const {formData, handleInputChange} = useForm<Omit<Host, 'id'>>({
		rhpAddress: '',
		rhpPubkey: '',
		extramonPubkey: ''
	});

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		// TODO: add action and API call
		console.log(formData);
	}

	return <>
		<Grid item xs={12} md={8} lg={9}>
			<Paper
				sx={{
					p: 2,
					display: 'flex',
					flexDirection: 'column',
					// height: 240,
				}}
			>
				<form onSubmit={handleSubmit}>
					{/*<Stack spacing={2} direction="row" sx={{marginBottom: 4}}>*/}
					{/*</Stack>*/}
					<TextField
						type="text"
						variant='outlined'
						label="rhpAddress"
						name="rhpAddress"
						onChange={handleInputChange}
						value={formData.rhpAddress}
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
						fullWidth
						sx={{mb: 4}}
					/>
					<TextField
						type="text"
						variant='outlined'
						label="extramonPubkey"
						name="extramonPubkey"
						onChange={handleInputChange}
						value={formData.extramonPubkey}
						fullWidth
						sx={{mb: 4}}
					/>
					<Button variant="outlined" type="submit" fullWidth>Submit</Button>
				</form>
			</Paper>
		</Grid>
	</>;
};

export default AddHost;
