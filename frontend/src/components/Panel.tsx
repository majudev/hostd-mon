import React from 'react';
import {Paper, Grid, GridProps} from '@mui/material';

type PanelProps = GridProps & {
	children?: React.ReactNode
};

const Panel: React.FC<PanelProps> = ({children, ...rest}) => {
	return <Grid item xs={12} md={8} lg={9} {...rest}>
		<Paper
			sx={{
				p: 2,
				display: 'flex',
				flexDirection: 'column',
				// height: 240,
			}}
		>
			{children}
		</Paper>
	</Grid>;
};

export default Panel;
