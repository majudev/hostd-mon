import React from 'react';
import Typography, {TypographyProps} from '@mui/material/Typography';

type TitleProps = {
	children?: React.ReactNode;
} & TypographyProps;

const Title: React.FC<TitleProps> = ({children, ...rest}) => {
	return (
		<Typography component="h2" variant="h6" color="primary" gutterBottom {...rest}>
			{children}
		</Typography>
	);
};

export default Title;
