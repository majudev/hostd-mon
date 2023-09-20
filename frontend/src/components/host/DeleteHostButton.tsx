import React from 'react';
import {Button} from '@mui/material';
import {deleteHost} from '@/api/host';
import {useNavigate, useParams} from 'react-router-dom';
import {HostDmonContext, useHostDmon} from '@/context/HostDmonContext.tsx';

const DeleteHostButton: React.FC = () => {
	const {id: hostId} = useParams();
	const {setHosts} = useHostDmon() as HostDmonContext;
	const navigate = useNavigate();
	const onDeleteBtnClick = () => {
		if (hostId == null) return;

		const confirmation = confirm('Are you sure to permanently delete this host?');

		if (!confirmation) return;

		deleteHost(parseInt(hostId)).then(res => {
			setHosts(prev => {
				if (prev == null) return null;
				return prev.filter(host => host.id !== parseInt(hostId));
			});

			navigate('/');
		}).catch(error => {
			const {data} = error?.response;

			if (data == null) return;

			alert(data?.message ?? error ?? 'Server error');
		});
	}

	return <Button color="error" variant="outlined" title="Permenently delete this host"
	               onClick={onDeleteBtnClick}>Delete</Button>;
};

export default DeleteHostButton;
