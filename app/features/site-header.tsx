// import { LanguageToggle } from '~/components/language-toggle';
import { ThemeToggle } from '~/components/theme-toggle';
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	navigationMenuTriggerStyle,
} from '~/components/ui/navigation-menu';

export function SiteHeader() {
	return (
		<header className='sticky shadow h-16 p-4 top-0 z-50'>
			<div className='flex items-center justify-between'>
				{/* 左端の「ホーム」ボタン */}
				<NavigationMenu>
					<NavigationMenuList>
						<NavigationMenuItem>
							{/* <Link href='/' legacyBehavior passHref> */}
							<NavigationMenuLink
								href='/'
								className={navigationMenuTriggerStyle()}
							>
								Home
							</NavigationMenuLink>
							{/* </Link> */}
						</NavigationMenuItem>
					</NavigationMenuList>
				</NavigationMenu>

				{/* 右端の ThemeToggle */}
				<ThemeToggle />
			</div>
		</header>
	);
}
