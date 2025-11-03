import { render } from "solid-js/web";

import { DomesticTourismDashboard } from "../../app/components/DomesticTourismDashboard";
import "../../app/styles/app.css";

render(
	() => (
		<main class="mx-auto flex max-w-5xl flex-col gap-8 p-4 md:p-8">
			<DomesticTourismDashboard />
		</main>
	),
	document.getElementById("root") as HTMLElement,
);
