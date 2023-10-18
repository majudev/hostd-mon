import React, {useState} from 'react';
import HostConfigForm, {HostConfigFormFields} from '@/components/host/HostConfigForm';
import {HostDmonContext, useHostDmon} from '@/context/HostDmonContext';
import {createHost} from '@/api/host';
import {useNavigate} from 'react-router-dom';
import {getErrorMessageIfHostParamsNotValid} from '@/utils/hostsParams/getErrorMessageIfHostParamsNotValid';

type AddHostProps = {
	userId?: number /* if userId is not undefined it means admin is adding host for this specific user */
};

const AddHost: React.FC<AddHostProps> = ({userId}) => {
	const {setHosts, currentUser} = useHostDmon() as HostDmonContext;
	const [loading, setLoading] = useState<boolean>(false);
	const [errorFields, setErrorFields] = useState<Array<string>>([]);
	const navigate = useNavigate();

	if (currentUser == null) return <></>;

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

		createHost(newHost, currentUser.admin ? userId : undefined).then((res) => {
			setErrorFields([]);

			const createdHost = res.data;

			userId == null && setHosts(prev => {
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

	return <HostConfigForm
		handleSubmit={handleSubmit}
		disableForm={loading}
		errorFields={errorFields}
	/>;
};

export default AddHost;
