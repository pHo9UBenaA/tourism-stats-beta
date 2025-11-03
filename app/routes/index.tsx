import { createFileRoute } from "@tanstack/solid-router";
import { DomesticTourismDashboard } from "~/features/domestic-tourism-dashboard/components/DomesticTourismDashboard";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	return (
		<main class="mx-auto flex max-w-5xl flex-col gap-8 p-4 md:p-8">
			<DomesticTourismDashboard />
		</main>
	);
}
