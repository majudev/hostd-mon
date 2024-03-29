import React, {useEffect, useState} from 'react';
import {useHostDmon} from '@/context/HostDmonContext';
import {useNavigate, useSearchParams} from 'react-router-dom';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import {Box, Button, Typography} from '@mui/material';
import config from '@/config';
import {getUser} from '@/api/user';
import User from '@/types/User';
import {AxiosError} from 'axios';

const Login: React.FC = () => {
	const navigate = useNavigate();
	const {currentUser, setCurrentUser} = useHostDmon();
	const [loading, setLoading] = useState<boolean>(false);

	const [searchParams, setSearchParams] = useSearchParams();
	const status = searchParams.get('status');

	useEffect(() => {
		if (status == null) return;

		if (status !== 'success') {
			return alert(`Error: ${status}`);
		}

		if (currentUser != null) return;
		if (loading) return;

		setLoading(true);

		getUser().then(data => {
			const user = data?.data;

			if (user == null) return;

			setCurrentUser(user as User);
		}).catch(error => {
			navigate('/login');
			alert('Server error. Try again later.');

			if (error instanceof AxiosError && error.response != null) {
				console.error(error.response);
			} else {
				console.error(error);
			}
		});

		setLoading(false);
	}, [status, currentUser]);

	useEffect(() => {
		if (currentUser) { // is user logged in
			return navigate('/');
		}
	}, [currentUser]);

	const handleGoogleLogin = () => {
		window.location.href = `${config.API_URL}/auth/google`; // Redirects to the backend route for Google OAuth login
	};

	return <Container component="main" maxWidth="xs">
		<CssBaseline/>
		<Box
			sx={{
				marginTop: 8,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
			}}
		>
			<Typography component="h1" variant="h5">
				Log in
			</Typography>

			<Box sx={{mt: 1}}>
				<Button disabled={loading} onClick={handleGoogleLogin}>
					with Google
				</Button>
			</Box>
		</Box>
		<p>SiaWatch is shutting down on 15th Feb 2024.</p>
		<p>There is less than 5 active users of the service. If you feel up to the challenge and want to maintain the service anyway, contact me at support@sia.watch - but keep in mind you will have to pay the monthly bill for the infrastructure.</p>
	</Container>;
};

export default Login;
