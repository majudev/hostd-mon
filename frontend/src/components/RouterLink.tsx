import React from 'react';

import {Link, LinkProps} from "react-router-dom";

type RouterLinkProps = {
	children?: React.ReactNode
} & LinkProps;

const RouterLink: React.FC<RouterLinkProps> = ({to, children, ...rest}) => {
	return <Link
		to={to}
		style={{textDecoration: 'none', color: 'inherit'}}
		{...rest}
	>
		{children}
	</Link>;
};

export default RouterLink;
