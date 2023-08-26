import React from 'react';
import Button from '@components/Button.tsx';

type HomeProps = {};

const Home: React.FC<HomeProps> = ({}) => {
	return <div>
		<p>Home Page</p>
		<Button onClick={() => alert('Hello world')}>click me</Button>
	</div>;
};

export default Home;
