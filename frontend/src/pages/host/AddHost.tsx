import React from 'react';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import HostConfigForm, {HostConfigFormFields} from '@/components/host/HostConfigForm.tsx';

const AddHost: React.FC = () => {

	function handleSubmit(formData: HostConfigFormFields) {
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
				<HostConfigForm
					handleSubmit={handleSubmit}
				/>
			</Paper>
		</Grid>
	</>;
};

export default AddHost;
