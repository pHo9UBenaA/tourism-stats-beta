// import { LanguageToggle } from '../components/language-toggle';
import { ThemeToggle } from '../components/theme-toggle';
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	navigationMenuTriggerStyle,
} from '../components/ui/navigation-menu';

export function SiteHeader() {
	return (
		<header className='sticky shadow h-16 p-4 top-0 z-50'>
			<div className='flex items-center justify-between'>
				<NavigationMenu>
					<NavigationMenuList>
						<NavigationMenuItem>
							<NavigationMenuLink
								href='/'
								className={navigationMenuTriggerStyle()}
							>
								Home
							</NavigationMenuLink>
						</NavigationMenuItem>
					</NavigationMenuList>
				</NavigationMenu>

				<ThemeToggle />
			</div>
		</header>
	);
}
