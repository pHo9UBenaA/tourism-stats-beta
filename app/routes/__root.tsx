/**
 * @file Root route configuration for the tourism dashboard application shell.
 */
import { createRootRoute, Outlet } from "@tanstack/solid-router";
import { TanStackRouterDevtools } from "@tanstack/solid-router-devtools";
import { NotFound } from "~/components/NotFound";
import appCss from "~/styles/app.css?url";
import { seo } from "~/utils/seo";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			...seo({
				title:
					"TanStack Start | Type-Safe, Client-First, Full-Stack React Framework",
				description: `TanStack Start is a type-safe, client-first, full-stack React framework. `,
			}),
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{
				rel: "apple-touch-icon",
				sizes: "180x180",
				href: "/apple-touch-icon.png",
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "32x32",
				href: "/favicon-32x32.png",
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "16x16",
				href: "/favicon-16x16.png",
			},
			{ rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
			{ rel: "icon", href: "/favicon.ico" },
		],
	}),
	errorComponent: (props) => <p>{props.error.stack}</p>,
	notFoundComponent: () => <NotFound />,
	component: RootComponent,
});

/**
 * Render the shared layout shell and optional router devtools.
 */
function RootComponent() {
	const shouldRenderDevtools =
		typeof window !== "undefined" && import.meta.env.DEV;
	const layoutClass =
		"min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-50";

	return (
		<>
			<div class={layoutClass}>
				<Outlet />
			</div>
			{shouldRenderDevtools ? (
				<TanStackRouterDevtools position="bottom-right" />
			) : null}
		</>
	);
}
