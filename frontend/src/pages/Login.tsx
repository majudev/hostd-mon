import React, {useEffect, useState} from 'react';
import {HostDmonContext, useHostDmon} from '@/context/HostDmonContext.tsx';
import {useNavigate} from 'react-router-dom';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Button, TextField, Typography} from '@mui/material';
import {login} from '@/api/auth';
import User from '@/types/User.ts';
import {useForm} from '@/hooks/useForm.ts';
import {ApiResponse} from '@/api';

const Login: React.FC = () => {
	const navigate = useNavigate();
	const {currentUser, setCurrentUser} = useHostDmon() as HostDmonContext;

	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		if (currentUser) {
			return navigate('/');
		}
	}, [currentUser]);

	const {formData, handleInputChange} = useForm({
		email: 'nobody@all', // TODO: replace with empty string in production
		password: ''
	});

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsLoading(true);

		login(formData).then((res: ApiResponse<User>) => {
			setIsLoading(false);

			if (res.status === 'success') {
				return setCurrentUser(res.data);
			}
		}).catch(error => {
			console.error(error);
			alert(error?.response?.data?.message ?? 'Server error');
			setIsLoading(false);
		});
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
			<Box component="form" onSubmit={handleSubmit} noValidate sx={{mt: 1}}>
				<TextField
					margin="normal"
					required
					fullWidth
					label="Email Address"
					name="email"
					onChange={handleInputChange}
					value={formData.email}
					autoFocus
				/>
				<TextField
					margin="normal"
					// required // TODO: uncomment in production
					fullWidth
					label="Password"
					name="password"
					onChange={handleInputChange}
					value={formData.password}
					type="password"
				/>
				<Button
					type="submit"
					fullWidth
					variant="contained"
					disabled={isLoading}
					sx={{mt: 3, mb: 2}}
				>
					Log In
				</Button>
				{/*<Grid item>*/}
				{/*	<Link href="#" variant="body2">*/}
				{/*		{"Don't have an account? Sign Up"}*/}
				{/*	</Link>*/}
				{/*</Grid>*/}
			</Box>
		</Box>
	</Container>;
};

export default Login;
