import { LineChart } from 'app/components/line-chart';
import { Button } from 'app/components/ui/button';
import { ToastAction } from 'app/components/ui/toast';
import { useToast } from 'app/hooks/use-toast';
import { Fragment, useMemo, useState } from 'react';
import SelectRegionModal from './select-region-modal';

const JUUDENKEN_REGIONS = [
	{ pref: '北海道', city: '函館市' },
	{ pref: '青森県', city: '弘前市' },
	{ pref: '青森県', city: '黒石市' },
	{ pref: '岩手県', city: '金ケ崎町' },
	{ pref: '宮城県', city: '村田町' },
	{ pref: '秋田県', city: '横手市' },
	{ pref: '秋田県', city: '仙北市' },
	{ pref: '福島県', city: '喜多方市' },
	{ pref: '福島県', city: '下郷町' },
	{ pref: '福島県', city: '南会津町' },
	{ pref: '茨城県', city: '桜川市' },
	{ pref: '栃木県', city: '栃木市' },
	{ pref: '群馬県', city: '桐生市' },
	{ pref: '群馬県', city: '中之条町' },
	{ pref: '埼玉県', city: '川越市' },
	{ pref: '千葉県', city: '香取市' },
	{ pref: '新潟県', city: '佐渡市' },
	{ pref: '富山県', city: '高岡市' },
	{ pref: '富山県', city: '南砺市' },
	{ pref: '石川県', city: '金沢市' },
	{ pref: '石川県', city: '輪島市' },
	{ pref: '石川県', city: '加賀市' },
	{ pref: '石川県', city: '白山市' },
	{ pref: '福井県', city: '小浜市' },
	{ pref: '福井県', city: '南越前町' },
	{ pref: '福井県', city: '若狭町' },
	{ pref: '山梨県', city: '甲州市' },
	{ pref: '山梨県', city: '早川町' },
	{ pref: '長野県', city: '長野市' },
	{ pref: '長野県', city: '須坂市' },
	{ pref: '長野県', city: '塩尻市' },
	{ pref: '長野県', city: '千曲市' },
	{ pref: '長野県', city: '東御市' },
	{ pref: '長野県', city: '南木曽町' },
	{ pref: '長野県', city: '白馬村' },
	{ pref: '岐阜県', city: '高山市' },
	{ pref: '岐阜県', city: '美濃市' },
	{ pref: '岐阜県', city: '恵那市' },
	{ pref: '岐阜県', city: '郡上市' },
	{ pref: '岐阜県', city: '白川村' },
	{ pref: '静岡県', city: '焼津市' },
	{ pref: '愛知県', city: '名古屋市' },
	{ pref: '愛知県', city: '豊田市' },
	{ pref: '三重県', city: '亀山市' },
	{ pref: '滋賀県', city: '大津市' },
	{ pref: '滋賀県', city: '彦根市' },
	{ pref: '滋賀県', city: '近江八幡市' },
	{ pref: '滋賀県', city: '東近江市' },
	{ pref: '京都府', city: '京都市' },
	{ pref: '京都府', city: '南丹市' },
	{ pref: '京都府', city: '伊根町' },
	{ pref: '京都府', city: '与謝野町' },
	{ pref: '大阪府', city: '富田林市' },
	{ pref: '兵庫県', city: '神戸市' },
	{ pref: '兵庫県', city: '豊岡市' },
	{ pref: '兵庫県', city: '丹波篠山市' },
	{ pref: '兵庫県', city: '養父市' },
	{ pref: '兵庫県', city: 'たつの市' },
	{ pref: '奈良県', city: '橿原市' },
	{ pref: '奈良県', city: '五條市' },
	{ pref: '奈良県', city: '宇陀市' },
	{ pref: '和歌山県', city: '湯浅町' },
	{ pref: '鳥取県', city: '倉吉市' },
	{ pref: '鳥取県', city: '若桜町' },
	{ pref: '鳥取県', city: '大山町' },
	{ pref: '島根県', city: '大田市' },
	{ pref: '島根県', city: '津和野町' },
	{ pref: '岡山県', city: '倉敷市' },
	{ pref: '岡山県', city: '津山市' },
	{ pref: '岡山県', city: '高梁市' },
	{ pref: '岡山県', city: '矢掛町' },
	{ pref: '広島県', city: '呉市' },
	{ pref: '広島県', city: '竹原市' },
	{ pref: '広島県', city: '福山市' },
	{ pref: '広島県', city: '廿日市市' },
	{ pref: '山口県', city: '萩市' },
	{ pref: '山口県', city: '柳井市' },
	{ pref: '徳島県', city: '美馬市' },
	{ pref: '徳島県', city: '三好市' },
	{ pref: '徳島県', city: '牟岐町' },
	{ pref: '香川県', city: '丸亀市' },
	{ pref: '愛媛県', city: '宇和島市' },
	{ pref: '愛媛県', city: '西予市' },
	{ pref: '愛媛県', city: '内子町' },
	{ pref: '高知県', city: '室戸市' },
	{ pref: '高知県', city: '安芸市' },
	{ pref: '福岡県', city: '八女市' },
	{ pref: '福岡県', city: 'うきは市' },
	{ pref: '福岡県', city: '朝倉市' },
	{ pref: '佐賀県', city: '鹿島市' },
	{ pref: '佐賀県', city: '嬉野市' },
	{ pref: '佐賀県', city: '有田町' },
	{ pref: '長崎県', city: '長崎市' },
	{ pref: '長崎県', city: '平戸市' },
	{ pref: '長崎県', city: '雲仙市' },
	{ pref: '大分県', city: '日田市' },
	{ pref: '大分県', city: '杵築市' },
	{ pref: '宮崎県', city: '日南市' },
	{ pref: '宮崎県', city: '日向市' },
	{ pref: '宮崎県', city: '椎葉村' },
	{ pref: '鹿児島県', city: '出水市' },
	{ pref: '鹿児島県', city: '薩摩川内市' },
	{ pref: '鹿児島県', city: '南九州市' },
	{ pref: '鹿児島県', city: '南さつま市' },
	{ pref: '沖縄県', city: '渡名喜村' },
	{ pref: '沖縄県', city: '竹富町' },
];

export type DigitalRegionData = {
	year: number; // 年
	month: number; // 月
	// regionType: string; // 地域タイプ (例: "市区町村") 一旦いらない
	// dataType: string; // データタイプ (例: "観光来訪者数") 一旦いらない
	// prefectureCode: number; // 都道府県コード 一旦いらない
	prefectureName: string; // 都道府県名
	// regionCode: number; // 地域コード 一旦いらない
	regionName?: string; // 地域名
	population: number; // 人口
};

type Props = { rawData: DigitalRegionData[] };

const formatData = (
	data: DigitalRegionData[],
	groupBy: 'prefecture' | 'city',
	selectedRegions: string[],
) => {
	const groupedData = data.reduce(
		(acc, item) => {
			const date = `${item.year}-${String(item.month).padStart(2, '0')}`;
			const region =
				groupBy === 'prefecture'
					? item.prefectureName
					: `${item.prefectureName}${item.regionName}`;

			if (!selectedRegions.includes(region)) {
				return acc;
			}

			if (!acc[date]) {
				acc[date] = { date } as { date: string } & { [region: string]: number };
			}

			acc[date][region] = (acc[date][region] || 0) + item.population;

			return acc;
		},
		{} as Record<string, { date: string } & { [region: string]: number }>,
	);

	return Object.values(groupedData);
};

const DigitalTourismStats = ({ rawData }: Props) => {
	const { toast } = useToast();

	const [groupBy, setGroupBy] = useState<'prefecture' | 'city'>('prefecture');

	const prefDefaultRegions = useMemo(() => {
		const uniquePrefs = [
			...new Set(JUUDENKEN_REGIONS.map((region) => region.pref)),
		];
		return uniquePrefs;
	}, []);

	const uniqueRegions = useMemo(() => {
		if (groupBy === 'prefecture') {
			const uniquePrefs = Array.from(
				new Set(rawData.map((item) => item.prefectureName)),
			);
			return uniquePrefs;
		}
		const uniqueRegions = Array.from(
			new Set(
				rawData.map((item) => `${item.prefectureName}${item.regionName}`),
			),
		);
		return uniqueRegions;
	}, [rawData, groupBy]);

	const [selectedRegions, setSelectedRegions] =
		useState<string[]>(prefDefaultRegions);
	const [currentChartData, setCurrentChartData] = useState<
		({ date: string } & { [region: string]: number })[]
	>(() => formatData(rawData, groupBy, prefDefaultRegions));

	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

	const toggleModal = () => {
		setIsModalOpen(!isModalOpen);
	};

	// TODO
	const showToast = (errorLength: number) => {
		toast({
			title: `Error: 地域は${errorLength}個以上選択できません`,
			action: <ToastAction altText='Goto schedule to undo'>Undo</ToastAction>,
		});
	};

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
		setCurrentChartData(formatData(rawData, groupBy, newSelectedRegions));
	};

	const [searchTerm, setSearchTerm] = useState<string>('');

	const filteredRegions = searchTerm
		? uniqueRegions.filter((region) =>
				region.toLowerCase().includes(searchTerm.toLowerCase()),
			)
		: uniqueRegions;

	if (!currentChartData) {
		return <Fragment />;
	}

	return (
		<div>
			<div className='mb-4'>
				<Button onClick={toggleModal} variant={'secondary'}>
					表示する地域を選択
				</Button>
			</div>

			<LineChart
				currentChartData={currentChartData}
				selectedRegions={selectedRegions}
			/>

			<SelectRegionModal
				isOpen={isModalOpen}
				onClose={toggleModal}
				searchTerm={searchTerm}
				setSearchTerm={setSearchTerm}
				filteredRegions={filteredRegions}
				selectedRegions={selectedRegions}
				handleRegionChange={handleRegionChange}
				handleRegionClear={() => {
					setSelectedRegions([]);
					setCurrentChartData([]);
				}}
			/>
		</div>
	);
};

export { DigitalTourismStats };
