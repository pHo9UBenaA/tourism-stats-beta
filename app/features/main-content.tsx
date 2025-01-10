import type { ReactNode } from 'react';

const SiteMain = ({ children }: { children: ReactNode }) => {
	return (
		<div className='flex-grow flex justify-center p-5'>
			<main className='w-full max-w-2xl'>{children}</main>
		</div>
	);
};

export { SiteMain };
