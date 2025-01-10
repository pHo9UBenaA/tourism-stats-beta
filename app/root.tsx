import type { LinksFunction, LoaderFunction } from '@remix-run/node';
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useRouteLoaderData,
} from '@remix-run/react';
import type { ReactNode } from 'react';
import {
	PreventFlashOnWrongTheme,
	type Theme,
	ThemeProvider,
	useTheme,
} from 'remix-themes';
import { SiteMain } from './features/main-content';
import { SiteHeader } from './features/site-header';
import stylesheet from './tailwind.css?url';
import { themeSessionResolver } from './utils/theme.server';
import { Toaster } from './components/ui/toaster';

export const links: LinksFunction = () => {
	return [
		{
			rel: 'stylesheet',
			href: stylesheet,
		},
		{
			rel: 'icon',
			type: 'image/x-icon',
			href: '/favicon.ico',
		},
	];
};

type LoaderData = {
	theme: Theme | null;
};

export const loader: LoaderFunction = async ({ request }) => {
	const { getTheme } = await themeSessionResolver(request);
	return {
		theme: getTheme(),
	} satisfies LoaderData;
};

function useRootLoaderData() {
	return useRouteLoaderData<LoaderData>('root');
}

export function Layout({ children }: { children: ReactNode }) {
	const data = useRootLoaderData();

	return (
		<ThemeProvider
			specifiedTheme={data?.theme ?? null}
			themeAction='/api/theme-set'
		>
			<InnerLayout ssrTheme={Boolean(data?.theme)}>{children}</InnerLayout>
		</ThemeProvider>
	);
}

export default function App() {
	return <Outlet />;
}

function InnerLayout({
	ssrTheme,
	children,
}: { ssrTheme: boolean; children: ReactNode }) {
	const [theme] = useTheme();

	return (
		<html lang='en' data-theme={theme} className={theme ?? ''}>
			<head>
				<meta charSet='utf-8' />
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<Meta />
				<Links />
			</head>
			<body
				className='min-h-screen flex flex-col subpixel-antialiased'
				suppressHydrationWarning
			>
				<SiteHeader />
				<SiteMain>{children}</SiteMain>
				<Toaster />
				<ScrollRestoration />
				<PreventFlashOnWrongTheme ssrTheme={ssrTheme} />
				<Scripts />
			</body>
		</html>
	);
}
