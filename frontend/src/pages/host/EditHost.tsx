import React, {useEffect, useState} from 'react';
import Title from '@/components/Title.tsx';
import {HostDmonContext, useHostDmon} from '@/context/HostDmonContext.tsx';
import Host from '@/types/Host.ts';
import {useParams} from 'react-router-dom';
import HostConfigForm, {HostConfigFormFields} from '@/components/host/HostConfigForm.tsx';

const EditHost: React.FC = () => {
	const {id: hostId} = useParams();
	const {hosts} = useHostDmon() as HostDmonContext;

	const hostToEdit = hosts.find((host: Host) => host.id === parseInt('' + hostId));

	const [defaultFormValues, setDefaultFormValues] = useState<HostConfigFormFields | null>(null);

	useEffect(() => {
		if (hostToEdit == null) return;

		setDefaultFormValues({
			name: hostToEdit.name ?? '',
			sia: hostToEdit.rhpAddress != null && hostToEdit.rhpAddress !== '' && hostToEdit.rhpPubkey != null && hostToEdit.rhpPubkey !== '',
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


	function handleSubmit(formData: HostConfigFormFields) {
		// TODO: add action and API call
		console.log(formData);
	}

	return <>
		<Title>Edit host</Title>

		{
			defaultFormValues != null &&
          <HostConfigForm
              handleSubmit={handleSubmit}
              defaultFormValues={defaultFormValues}
          />
		}
	</>;
};

export default EditHost;
