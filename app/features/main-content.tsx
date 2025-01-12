import type { ReactNode } from 'react';

const SiteMain = ({ children }: { children: ReactNode }) => {
	return (
		<main className='flex-grow flex justify-center p-5'>
			<div className='w-full max-w-2xl'>{children}</div>
		</main>
	);
};

export { SiteMain };
