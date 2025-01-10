import { Checkbox } from 'app/components/ui/checkbox';
import { Label } from 'app/components/ui/label';
import type { FC } from 'react';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '../components/ui/dialog';

interface ModalComponentProps {
	isOpen: boolean;
	onClose: () => void;
	searchTerm: string;
	setSearchTerm: (term: string) => void;
	filteredRegions: string[];
	selectedRegions: string[];
	handleRegionChange: (region: string, checked: boolean) => void;
	handleRegionClear: () => void;
}

const SelectRegionModal: FC<ModalComponentProps> = ({
	isOpen,
	onClose,
	searchTerm,
	setSearchTerm,
	filteredRegions,
	selectedRegions,
	handleRegionChange,
	handleRegionClear,
}) => {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>地域を選択</DialogTitle>
					<DialogDescription>表示する地域を選択</DialogDescription>
					<DialogClose />
				</DialogHeader>

				<div className='grid grid-cols-4 gap-2 place-items-center max-h-96 overflow-auto'>
					{filteredRegions.map((region) => (
						<div
							key={region}
							className='flex justify-center items-center h-10 w-40'
						>
							<Checkbox
								key={`checkbox-${region}`}
								checked={selectedRegions.includes(region)}
								onCheckedChange={(checked) => {
									handleRegionChange(region, !!checked);
								}}
							/>
							<Label key={`input-${region}`} className='pl-1'>
								{region}
							</Label>
						</div>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default SelectRegionModal;
