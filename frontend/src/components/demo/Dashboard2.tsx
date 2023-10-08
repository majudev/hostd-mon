import React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Deposits from '@/components/demo/Deposits.tsx';
import Orders from '@/components/demo/Orders.tsx';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

function Copyright(props: any) {
	return (
		<Typography variant="body2" color="text.secondary" align="center" {...props}>
			{'Copyright © '}
			<Link color="inherit" href="https://sia.watch/">
				sia.watch
			</Link>{' '}
			{new Date().getFullYear()}
		</Typography>
	);
}

const Dashboard2: React.FC = () => {
	return <>
		<Grid container spacing={3}>
			{/* Recent Deposits */}
			<Grid item xs={12} md={4} lg={3}>
				<Paper
					sx={{
						p: 2,
						display: 'flex',
						flexDirection: 'column',
						height: 240,
					}}
				>
					<Deposits/>
				</Paper>
			</Grid>
			{/* Recent Orders */}
			<Grid item xs={12}>
				<Paper sx={{p: 2, display: 'flex', flexDirection: 'column'}}>
					<Orders/>
				</Paper>
			</Grid>
		</Grid>
		<Copyright sx={{pt: 4}}/>
	</>;
};

export default Dashboard2;
