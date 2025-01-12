import { LineChart } from 'app/components/line-chart';
import { ToastAction } from 'app/components/ui/toast';
import { useSelectedRegions } from 'app/hooks/use-digital-tourism';
import { useToast } from 'app/hooks/use-toast';
import { useEffect, useMemo, useState } from 'react';
import { SelectRegionDialog } from './select-region-dialog';

export type DigitalRegionData = {
	year: number;
	month: number;
	prefectureName: string;
	regionName?: string;
	population: number;
};

type Props = {
	chartData: DigitalRegionData[];
	groupBy: 'prefecture' | 'municipality';
};

export type ExtractData = { date: string; [key: string]: string | number }[];

const JUUDENKEN_REGIONS = [
	{ pref: '北海道', muni: '函館市' },
	{ pref: '青森県', muni: '弘前市' },
	{ pref: '青森県', muni: '黒石市' },
	{ pref: '岩手県', muni: '金ケ崎町' },
	{ pref: '宮城県', muni: '村田町' },
	{ pref: '秋田県', muni: '横手市' },
	{ pref: '秋田県', muni: '仙北市' },
	{ pref: '福島県', muni: '喜多方市' },
	{ pref: '福島県', muni: '下郷町' },
	{ pref: '福島県', muni: '南会津町' },
	{ pref: '茨城県', muni: '桜川市' },
	{ pref: '栃木県', muni: '栃木市' },
	{ pref: '群馬県', muni: '桐生市' },
	{ pref: '群馬県', muni: '中之条町' },
	{ pref: '埼玉県', muni: '川越市' },
	{ pref: '千葉県', muni: '香取市' },
	{ pref: '新潟県', muni: '佐渡市' },
	{ pref: '富山県', muni: '高岡市' },
	{ pref: '富山県', muni: '南砺市' },
	{ pref: '石川県', muni: '金沢市' },
	{ pref: '石川県', muni: '輪島市' },
	{ pref: '石川県', muni: '加賀市' },
	{ pref: '石川県', muni: '白山市' },
	{ pref: '福井県', muni: '小浜市' },
	{ pref: '福井県', muni: '南越前町' },
	{ pref: '福井県', muni: '若狭町' },
	{ pref: '山梨県', muni: '甲州市' },
	{ pref: '山梨県', muni: '早川町' },
	{ pref: '長野県', muni: '長野市' },
	{ pref: '長野県', muni: '須坂市' },
	{ pref: '長野県', muni: '塩尻市' },
	{ pref: '長野県', muni: '千曲市' },
	{ pref: '長野県', muni: '東御市' },
	{ pref: '長野県', muni: '南木曽町' },
	{ pref: '長野県', muni: '白馬村' },
	{ pref: '岐阜県', muni: '高山市' },
	{ pref: '岐阜県', muni: '美濃市' },
	{ pref: '岐阜県', muni: '恵那市' },
	{ pref: '岐阜県', muni: '郡上市' },
	{ pref: '岐阜県', muni: '白川村' },
	{ pref: '静岡県', muni: '焼津市' },
	{ pref: '愛知県', muni: '名古屋市' },
	{ pref: '愛知県', muni: '豊田市' },
	{ pref: '三重県', muni: '亀山市' },
	{ pref: '滋賀県', muni: '大津市' },
	{ pref: '滋賀県', muni: '彦根市' },
	{ pref: '滋賀県', muni: '近江八幡市' },
	{ pref: '滋賀県', muni: '東近江市' },
	{ pref: '京都府', muni: '京都市' },
	{ pref: '京都府', muni: '南丹市' },
	{ pref: '京都府', muni: '伊根町' },
	{ pref: '京都府', muni: '与謝野町' },
	{ pref: '大阪府', muni: '富田林市' },
	{ pref: '兵庫県', muni: '神戸市' },
	{ pref: '兵庫県', muni: '豊岡市' },
	{ pref: '兵庫県', muni: '丹波篠山市' },
	{ pref: '兵庫県', muni: '養父市' },
	{ pref: '兵庫県', muni: 'たつの市' },
	{ pref: '奈良県', muni: '橿原市' },
	{ pref: '奈良県', muni: '五條市' },
	{ pref: '奈良県', muni: '宇陀市' },
	{ pref: '和歌山県', muni: '湯浅町' },
	{ pref: '鳥取県', muni: '倉吉市' },
	{ pref: '鳥取県', muni: '若桜町' },
	{ pref: '鳥取県', muni: '大山町' },
	{ pref: '島根県', muni: '大田市' },
	{ pref: '島根県', muni: '津和野町' },
	{ pref: '岡山県', muni: '倉敷市' },
	{ pref: '岡山県', muni: '津山市' },
	{ pref: '岡山県', muni: '高梁市' },
	{ pref: '岡山県', muni: '矢掛町' },
	{ pref: '広島県', muni: '呉市' },
	{ pref: '広島県', muni: '竹原市' },
	{ pref: '広島県', muni: '福山市' },
	{ pref: '広島県', muni: '廿日市市' },
	{ pref: '山口県', muni: '萩市' },
	{ pref: '山口県', muni: '柳井市' },
	{ pref: '徳島県', muni: '美馬市' },
	{ pref: '徳島県', muni: '三好市' },
	{ pref: '徳島県', muni: '牟岐町' },
	{ pref: '香川県', muni: '丸亀市' },
	{ pref: '愛媛県', muni: '宇和島市' },
	{ pref: '愛媛県', muni: '西予市' },
	{ pref: '愛媛県', muni: '内子町' },
	{ pref: '高知県', muni: '室戸市' },
	{ pref: '高知県', muni: '安芸市' },
	{ pref: '福岡県', muni: '八女市' },
	{ pref: '福岡県', muni: 'うきは市' },
	{ pref: '福岡県', muni: '朝倉市' },
	{ pref: '佐賀県', muni: '鹿島市' },
	{ pref: '佐賀県', muni: '嬉野市' },
	{ pref: '佐賀県', muni: '有田町' },
	{ pref: '長崎県', muni: '長崎市' },
	{ pref: '長崎県', muni: '平戸市' },
	{ pref: '長崎県', muni: '雲仙市' },
	{ pref: '大分県', muni: '日田市' },
	{ pref: '大分県', muni: '杵築市' },
	{ pref: '宮崎県', muni: '日南市' },
	{ pref: '宮崎県', muni: '日向市' },
	{ pref: '宮崎県', muni: '椎葉村' },
	{ pref: '鹿児島県', muni: '出水市' },
	{ pref: '鹿児島県', muni: '薩摩川内市' },
	{ pref: '鹿児島県', muni: '南九州市' },
	{ pref: '鹿児島県', muni: '南さつま市' },
	{ pref: '沖縄県', muni: '渡名喜村' },
	{ pref: '沖縄県', muni: '竹富町' },
];

const DEFAULT_REGIONS = {
	prefecture: [...new Set(JUUDENKEN_REGIONS.map((region) => region.pref))],
	municipality: [
		...new Set(
			JUUDENKEN_REGIONS.map((region) => `${region.pref}${region.muni}`),
		),
	],
};

const extractData = (
	chartData: DigitalRegionData[],
	groupBy: 'prefecture' | 'municipality',
	selectedRegions: string[],
) => {
	const groupedDataArray: ExtractData = [];

	for (const item of chartData) {
		const itemMonth = String(item.month).padStart(2, '0');
		const date = `${item.year}-${itemMonth}`;

		const regionName =
			groupBy === 'prefecture'
				? item.prefectureName
				: `${item.prefectureName}${item.regionName}`;

		if (!selectedRegions.includes(regionName)) {
			continue;
		}

		if (selectedRegions.includes(regionName)) {
			const index = groupedDataArray.findIndex((entry) => entry.date === date);

			if (index !== -1) {
				groupedDataArray[index] = {
					...groupedDataArray[index],
					[regionName]: item.population,
				};
				continue;
			}

			groupedDataArray.push({
				date,
				[regionName]: item.population,
			});
		}
	}

	return groupedDataArray;
};

export const DigitalTourismStats = ({ chartData, groupBy }: Props) => {
	const { toast } = useToast();

	const showToast = (errorLength: number) => {
		toast({
			title: `Error: 地域は${errorLength}個以上選択できません`,
			action: <ToastAction altText='Goto schedule to undo'>Undo</ToastAction>,
		});
	};

	const uniqueRegions = useMemo(() => {
		if (groupBy === 'prefecture') {
			return Array.from(new Set(chartData.map((item) => item.prefectureName)));
		}
		return Array.from(
			new Set(
				chartData.map((item) => `${item.prefectureName}${item.regionName}`),
			),
		);
	}, [chartData, groupBy]);

	const { selectedRegions, setSelectedRegions } = useSelectedRegions(groupBy);
	const [currentChartData, setCurrentChartData] = useState<ExtractData>(
		selectedRegions.length === 0
			? extractData(chartData, groupBy, DEFAULT_REGIONS[groupBy])
			: extractData(chartData, groupBy, selectedRegions),
	);

	useEffect(() => {
		if (selectedRegions.length === 0) {
			setSelectedRegions(DEFAULT_REGIONS[groupBy]);
		}
	}, [groupBy, selectedRegions, setSelectedRegions]);

	const handleRegionChange = (region: string, checked: boolean) => {
		const errorLength = 50;
		if (checked && selectedRegions.length >= errorLength) {
			showToast(errorLength);
			return;
		}

		const newSelectedRegions = checked
			? [...selectedRegions, region]
			: selectedRegions.filter((r) => r !== region);

		setSelectedRegions(newSelectedRegions);
		setCurrentChartData(extractData(chartData, groupBy, newSelectedRegions));
	};

	return (
		<div>
			<SelectRegionDialog
				uniqueRegions={uniqueRegions}
				selectedRegions={selectedRegions}
				handleRegionChange={handleRegionChange}
				handleRegionClear={() => {
					setSelectedRegions([]);
					setCurrentChartData([]);
				}}
			/>

			<LineChart
				currentChartData={currentChartData}
				selectedRegions={selectedRegions}
			/>
		</div>
	);
};
