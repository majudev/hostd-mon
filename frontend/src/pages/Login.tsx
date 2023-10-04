import React, {useEffect} from 'react';
import {HostDmonContext, useHostDmon} from '@/context/HostDmonContext.tsx';
import {useNavigate, useParams, useSearchParams} from 'react-router-dom';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import {Box, Button, Typography} from '@mui/material';
import config from '@/config';
import api from '@/api';

const Login: React.FC = () => {
	const navigate = useNavigate();
	const {currentUser, setCurrentUser} = useHostDmon() as HostDmonContext;

	const [searchParams, setSearchParams] = useSearchParams();
	const status = searchParams.get('status');

	if (status === 'success') {
		api.get('/user/me').then(({data}) => console.log(data))
	}

	useEffect(() => {
		if (currentUser) {
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
				<Button onClick={handleGoogleLogin}>
					with Google
				</Button>
			</Box>
		</Box>
	</Container>;
};

export default Login;
