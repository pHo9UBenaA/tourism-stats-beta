import type { MetaFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';

export const meta: MetaFunction = () => {
	return [
		{ title: 'New Remix App' },
		{ name: 'description', content: 'Welcome to Remix!' },
	];
};

export default function Index() {
	return (
		<div>
			<h1 className='text-3xl font-bold tracking-tight  pb-4'>Home</h1>

			<nav className='flex-grow flex flex-col gap-2'>
				<Link to='/chart-dashboard' className='underline'>test</Link>
			</nav>
		</div>
	);
}
