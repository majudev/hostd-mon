import React, {useEffect, useState} from 'react';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import {Button, TextField} from '@mui/material';
import {useParams} from 'react-router-dom';
import {HostDmonContext, useHostDmon} from '@/context/HostDmonContext.tsx';
import Host from '@/types/Host.ts';
import {useForm} from '@/hooks/useForm.ts';
import Title from '@/components/Title.tsx';

const HostOverview: React.FC = () => {
	const {id: hostId} = useParams();

	const {hosts} = useHostDmon() as HostDmonContext;

	const hostToEdit = hosts.find((host: Host) => host.id === parseInt('' + hostId));

	const {formData, handleInputChange, setNewFormValues} = useForm<Omit<Host, 'id'>>({
		rhpAddress: '',
		rhpPubkey: '',
		extramonPubkey: ''
	});

	useEffect(() => {
		if (hostToEdit == null) return;

		setNewFormValues({
			rhpAddress: hostToEdit.rhpAddress ?? '',
			rhpPubkey: hostToEdit.rhpPubkey ?? '',
			extramonPubkey: hostToEdit.extramonPubkey ?? ''
		});
	}, [hostToEdit]);


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
				<>
					<Title>Edit host</Title>

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
						<Button variant="outlined" type="submit" fullWidth>Save changes</Button>
					</form>
				</>
			</Paper>
		</Grid>
	</>;
};

export default HostOverview;
