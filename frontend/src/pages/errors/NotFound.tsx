import React from 'react';
import {Typography, Button, Container} from '@mui/material';
import RouterLink from '@/components/routing/RouterLink.tsx';

const NotFound: React.FC = () => {
	return (
		<Container maxWidth="md" style={{
			textAlign: 'center',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',  // Center vertically
			alignItems: 'center',      // Center horizontally
			height: '100vh',
		}}>
			<Typography variant="h1" gutterBottom>
				404 - Not Found
			</Typography>
			<Typography variant="h5" paragraph>
				The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
			</Typography>
			<RouterLink to="/">
				<Button variant="contained" color="primary">
					Go to Home
				</Button>
			</RouterLink>
		</Container>
	);
};

export default NotFound;
