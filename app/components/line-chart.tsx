import { TabTitle } from 'app/constants/digital-tourism-stats';
import type { TabType } from 'app/types/digital-tourism-stats';
import { memo } from 'react';
import {
	CartesianGrid,
	Label,
	Line,
	LineChart as OriginalLineChart,
	XAxis,
	YAxis,
} from 'recharts';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
// import { TODOUHUKEN_COLOR_MAP } from '../consts/const';

type Props = {
	currentChartData: { date: string; [key: string]: string | number }[];
	selectedRegions: string[];
	groupBy: TabType;
};

const LineChart = memo(function Chart({
	currentChartData,
	selectedRegions,
	groupBy,
}: Props) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{TabTitle[groupBy]}</CardTitle>
				<CardDescription>January - June 2024</CardDescription>
			</CardHeader>
			{!!currentChartData.length && (
				<CardContent>
					{/* <ChartContainer config={chartConfig}> */}
					<ChartContainer config={{}}>
						<OriginalLineChart
							// className="h-screen"
							data={currentChartData}
							margin={{
								top: 5,
								right: 30,
								left: 20,
								bottom: 5,
							}}
							accessibilityLayer
						>
							<CartesianGrid strokeDasharray='3 3' />
							{/* see: https://github.com/recharts/recharts/issues/843 */}
							<XAxis
								dataKey='date'
								tickLine={false}
								height={20}
								fontSize={'0.75rem'}
							/>
							<YAxis width={5} tickLine={false} fontSize={'0rem'}>
								<Label
									style={{
										textAnchor: 'start',
										fontSize: '130%',
										fill: 'gray',
									}}
									angle={270}
									dy={-25}
									dx={-10}
									value={'Number of visitor'}
								/>
							</YAxis>
							{/* see: https://github.com/recharts/recharts/issues/787 */}
							<ChartTooltip
								cursor={false}
								content={<ChartTooltipContent />}
								// wrapperStyleで高さなどを変えたいため、overflow: autoをつけている
								wrapperStyle={{
									pointerEvents: 'auto',
									maxHeight: '100%',
									overflow: 'auto',
								}}
								offset={1}
							/>
							{selectedRegions.map((region) => (
								<Line
									key={region}
									type='monotone'
									dataKey={region}
									stroke='hsl(var(--primary))'
									dot={{ r: 0 }}
									activeDot={{ r: 3 }}
								/>
							))}
						</OriginalLineChart>
					</ChartContainer>
				</CardContent>
			)}
		</Card>
	);
});

export default LineChart;

// export { LineChart };
