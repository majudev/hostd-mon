import React, {useEffect, useState} from 'react';
import Title from '@/components/Title';
import {useHostDmon} from '@/context/HostDmonContext';
import Host from '@/types/Host';
import {useParams} from 'react-router-dom';
import HostConfigForm, {HostConfigFormFields} from '@/components/host/HostConfigForm';
import {getHostById, updateHost} from '@/api/host';
import Grid from '@mui/material/Grid';
import DeleteHostButton from '@/components/host/DeleteHostButton';
import {getErrorMessageIfHostParamsNotValid} from '@/utils/hostsParams/getErrorMessageIfHostParamsNotValid';

const EditHost: React.FC = () => {
	const {id: hostId} = useParams();
	const {hosts, setHosts} = useHostDmon();

	if (hosts == null) return <></>;

	const foundHost = hosts.find((host: Host) => host.id === parseInt('' + hostId));
	const editingMyHost = foundHost != null;
	const [hostToEdit, setHostToEdit] = useState<Host | null>(foundHost ?? null);

	useEffect(() => {
		if (hostId == null) return;
		if (hostToEdit != null) return;

		getHostById(parseInt(hostId)).then(res => {
			setHostToEdit(res.data);
		}).catch(error => {
			console.error(error);

			const {data} = error?.response;
			alert(data?.message ?? error ?? 'Server error');
		});

	}, [hostId, hostToEdit]);

	const [defaultFormValues, setDefaultFormValues] = useState<HostConfigFormFields | null>(null);

	useEffect(() => {
		if (hostToEdit == null) return;

		setDefaultFormValues({
			name: hostToEdit.name ?? '',
			rhp: hostToEdit.rhpAddress != null && hostToEdit.rhpAddress !== '' && hostToEdit.rhpPubkey != null && hostToEdit.rhpPubkey !== '',
			rhpAddress: hostToEdit.rhpAddress ?? '',
			rhpPubkey: hostToEdit.rhpPubkey ?? '',
			extramon: hostToEdit.extramonPubkey != null && hostToEdit.extramonPubkey !== '',
			extramonPubkey: hostToEdit.extramonPubkey ?? '',
			rhpDeadtime: hostToEdit.rhpDeadtime ?? 300,
			extramonDeadtime: hostToEdit.extramonDeadtime ?? 300
		});

		return () => {
			setDefaultFormValues(null);
		}
	}, [hostToEdit]);

	const [loading, setLoading] = useState<boolean>(false);
	const [errorFields, setErrorFields] = useState<Array<string>>([]);

	const handleSubmit = (formData: HostConfigFormFields) => {
		if (hostId == null) return;

		const errorMessage = getErrorMessageIfHostParamsNotValid(formData);

		if (errorMessage != null) {
			return alert(errorMessage);
		}

		setLoading(true);

		const {name, rhp, rhpAddress, rhpPubkey, rhpDeadtime, extramon, extramonPubkey, extramonDeadtime} = formData;

		const hostToUpdate = {
			id: parseInt(hostId),
			name,
			rhpAddress: rhp ? rhpAddress : null,
			rhpPubkey: rhp ? rhpPubkey : null,
			rhpDeadtime: rhp ? rhpDeadtime : undefined,
			extramonPubkey: extramon ? extramonPubkey : null,
			extramonDeadtime: extramon ? extramonDeadtime : undefined,
		};

		updateHost(hostToUpdate)
			.then(res => {
				setErrorFields([]);

				const updatedHost = res?.data;

				editingMyHost && setHosts(prev => {
					if (prev == null) return null;

					return prev.map(host => host.id === parseInt(hostId) ? updatedHost : host);
				});
			})
			.catch(error => {
				console.error(error);

				const {data} = error?.response;

				if (data == null) return;

				setErrorFields([data?.duplicate]);
				alert(data?.message ?? error ?? 'Server error');
			})
			.finally(() => setLoading(false));
	}

	return <>
		<Grid container mb={1}>
			<Grid item xs={12} md={6}>
				<Title>Edit {hostToEdit?.name ?? `host #${hostId}`}</Title>
			</Grid>
			<Grid item xs={12} md={6} style={{display: 'flex', justifyContent: 'flex-end'}}>
				<DeleteHostButton/>
			</Grid>
		</Grid>

		{
			defaultFormValues != null &&
          <HostConfigForm
              handleSubmit={handleSubmit}
              defaultFormValues={defaultFormValues}
              disableForm={loading}
              errorFields={errorFields}
          />
		}
	</>;
};

export default EditHost;
