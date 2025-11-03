/**
 * @file Chart panel for the domestic tourism dashboard.
 */
import type { EChartsOption } from "echarts";
import type { EChartsAutoSizeProps } from "echarts-solid";
import { Show, type Accessor, type JSX } from "solid-js";

import type { ChartState } from "../state/types";

type ChartSectionProps = {
	chartState: Accessor<ChartState>;
	chartOption: Accessor<EChartsOption | null>;
	chartComponent: Accessor<
		((props: EChartsAutoSizeProps) => JSX.Element) | null
	>;
};

const LOADING_MESSAGE = "Loading chart data…";
const EMPTY_MESSAGE = "Select at least one region to display the chart.";

/**
 * Provide loading, error, and success render paths for the chart.
 */
export function ChartSection(props: ChartSectionProps) {
	const chartState = () => props.chartState();
	const isLoading = () => chartState().kind === "loading";
	const errorMessage = () =>
		chartState().kind === "error" ? chartState().message : null;
	const isIdle = () => chartState().kind === "idle";
	const hasRenderableChart = () =>
		chartState().kind === "ready" &&
		props.chartOption() !== null &&
		props.chartComponent() !== null;

	return (
		<>
			<Show when={isLoading()}>
				<div class="h-80 rounded-md border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
					{LOADING_MESSAGE}
				</div>
			</Show>

			<Show when={isIdle()}>
				<div class="h-80 rounded-md border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
					{EMPTY_MESSAGE}
				</div>
			</Show>

			<Show when={!isLoading() && errorMessage()}>
				<div class="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-400 dark:bg-red-950 dark:text-red-100">
					{errorMessage()}
				</div>
			</Show>

			<Show when={hasRenderableChart()}>
				<div class="h-80 w-full">
					{(() => {
						const Component = props.chartComponent();
						if (!Component) {
							return null;
						}
						return <Component option={props.chartOption()!} />;
					})()}
				</div>
			</Show>
		</>
	);
}
