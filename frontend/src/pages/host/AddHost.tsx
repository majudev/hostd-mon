import React, {useState} from 'react';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import HostConfigForm, {HostConfigFormFields} from '@/components/host/HostConfigForm.tsx';
import {HostDmonContext, useHostDmon} from '@/context/HostDmonContext.tsx';
import {createHost} from '@/api/host';
import {useNavigate} from 'react-router-dom';
import {getErrorMessageIfHostParamsNotValid} from '@/utils/hostsParams/getErrorMessageIfHostParamsNotValid.ts';

const AddHost: React.FC = () => {
	const {setHosts} = useHostDmon() as HostDmonContext;
	const [loading, setLoading] = useState<boolean>(false);
	const [errorFields, setErrorFields] = useState<Array<string>>([]);
	const navigate = useNavigate();

	const handleSubmit = (formData: HostConfigFormFields) => {
		const errorMessage = getErrorMessageIfHostParamsNotValid(formData);

		if (errorMessage != null) {
			return alert(errorMessage);
		}

		setLoading(true);

		const {name, sia, rhpAddress, rhpPubkey, rhpDeadtime, extramon, extramonPubkey, extramonDeadtime} = formData;

		const newHost = {
			name,
			rhpAddress: sia ? rhpAddress : null,
			rhpPubkey: sia ? rhpPubkey : null,
			rhpDeadtime: sia ? rhpDeadtime : undefined,
			extramonPubkey: extramon ? extramonPubkey : null,
			extramonDeadtime: extramon ? extramonDeadtime : undefined,
		};

		createHost(newHost).then((res) => {
			setErrorFields([]);

			const createdHost = res.data;

			setHosts(prev => {
				if (prev == null) return null;

				return [...prev, createdHost];
			});

			setLoading(false);

			navigate(`/host/${createdHost.id}`);
		}).catch(error => {
			console.error(error);
			setLoading(false);

			const {data} = error?.response;

			if (data == null) return;

			setErrorFields([data?.duplicate]);
			alert(data?.message ?? error ?? 'Server error');
		});
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
					disableForm={loading}
					errorFields={errorFields}
				/>
			</Paper>
		</Grid>
	</>;
};

export default AddHost;
