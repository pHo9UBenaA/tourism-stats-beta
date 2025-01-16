// import { LineChart } from 'app/components/line-chart';
import { ToastAction } from 'app/components/ui/toast';
import { UNIQUE_REGIONS } from 'app/constants/digital-tourism-stats';
import { useSelectedRegions } from 'app/hooks/use-digital-tourism';
import { useToast } from 'app/hooks/use-toast';
import type {
	DigitalRegionData,
	TabType,
} from 'app/types/digital-tourism-stats';
import { lazy, useMemo } from 'react';
import { SelectRegionDialog } from './select-region-dialog';

const LineChart = lazy(() => import('app/components/line-chart'));

type Props = {
	chartData: DigitalRegionData[];
	groupBy: TabType;
};

type ExtractData = { date: string; [key: string]: string | number }[];

const extractData = (
	chartData: DigitalRegionData[],
	groupBy: TabType,
	selectedRegions: string[],
) => {
	const groupedDataArray: ExtractData = [];

	for (const item of chartData.filter((item) => {
		const regionName =
			groupBy === 'prefecture'
				? item.prefectureName
				: `${item.prefectureName}${item.regionName}`;
		return selectedRegions.includes(regionName);
	})) {
		const itemMonth = String(item.month).padStart(2, '0');
		const date = `${item.year}-${itemMonth}`;

		const regionName =
			groupBy === 'prefecture'
				? item.prefectureName
				: `${item.prefectureName}${item.regionName}`;

		const index = groupedDataArray.findIndex((entry) => entry.date === date);

		if (index !== -1) {
			groupedDataArray[index] = {
				...groupedDataArray[index],
				[regionName]: item.population,
			};
		} else {
			groupedDataArray.push({
				date,
				[regionName]: item.population,
			});
		}
	}

	return groupedDataArray;
};

const DigitalTourismStats = ({ chartData, groupBy }: Props) => {
	const { toast } = useToast();

	const showToast = (errorLength: number) => {
		toast({
			title: `Error: 地域は${errorLength}個以上選択できません`,
			action: <ToastAction altText='Goto schedule to undo'>Undo</ToastAction>,
		});
	};

	const [selectedRegions, setSelectedRegions] = useSelectedRegions(groupBy);

	const currentChartData = useMemo<ExtractData>(() => {
		return extractData(chartData, groupBy, selectedRegions);
	}, [chartData, groupBy, selectedRegions]);

	const handleRegionChange = (
		region: (typeof selectedRegions)[number],
		checked: boolean,
	) => {
		const errorLength = 50;

		if (checked && selectedRegions.length >= errorLength) {
			showToast(errorLength);
			return;
		}

		const newSelectedRegions = checked
			? [...selectedRegions, region]
			: selectedRegions.filter((r) => r !== region);

		setSelectedRegions(newSelectedRegions);
		// setCurrentChartData(extractData(chartData, groupBy, newSelectedRegions));
	};

	return (
		<div>
			{/* <Profiler id='MyApp' onRender={() => {}}> */}
			<SelectRegionDialog
				key={`${groupBy}-select-region-dialog`}
				uniqueRegions={UNIQUE_REGIONS[groupBy]}
				selectedRegions={selectedRegions}
				handleRegionChange={handleRegionChange}
			/>

			<LineChart
				key={`${groupBy}-line-chart`}
				currentChartData={currentChartData}
				selectedRegions={selectedRegions}
				groupBy={groupBy}
			/>
			{/* </Profiler> */}
		</div>
	);
};

export default DigitalTourismStats;
// export { DigitalTourismStats };
