import React, {ReactNode, useState} from 'react';
import {styled, createTheme, ThemeProvider} from '@mui/material/styles';
import {
	Container,
	Badge,
	IconButton,
	Divider,
	Typography,
	Toolbar,
	CssBaseline,
	Box,
	Drawer as MuiDrawer,
	AppBar as MuiAppBar,
	AppBarProps as MuiAppBarProps,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SidebarNavigation from '@/components/sidebar/SidebarNavigation';
import {useSidebar} from '@/context/SidebarContext.tsx';

const drawerWidth: number = 240;

interface AppBarProps extends MuiAppBarProps {
	open?: boolean;
}

const AppBar = styled(MuiAppBar, {
	shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({theme, open}) => ({
	zIndex: theme.zIndex.drawer + 1,
	transition: theme.transitions.create(['width', 'margin'], {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	...(open && {
		marginLeft: drawerWidth,
		width: `calc(100% - ${drawerWidth}px)`,
		transition: theme.transitions.create(['width', 'margin'], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.enteringScreen,
		}),
	}),
}));

const Drawer = styled(MuiDrawer, {shouldForwardProp: (prop) => prop !== 'open'})(
	({theme, open}) => ({
		'& .MuiDrawer-paper': {
			position: 'relative',
			whiteSpace: 'nowrap',
			width: drawerWidth,
			transition: theme.transitions.create('width', {
				easing: theme.transitions.easing.sharp,
				duration: theme.transitions.duration.enteringScreen,
			}),
			boxSizing: 'border-box',
			...(!open && {
				overflowX: 'hidden',
				transition: theme.transitions.create('width', {
					easing: theme.transitions.easing.sharp,
					duration: theme.transitions.duration.leavingScreen,
				}),
				width: theme.spacing(7),
				[theme.breakpoints.up('sm')]: {
					width: theme.spacing(9),
				},
			}),
		},
	}),
);

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

type DraweViewProps = {
	children?: ReactNode,
	pageTitle?: string
};

const DrawerView: React.FC<DraweViewProps> = ({children, pageTitle}) => {
	const {isSidebarOpen, setIsSidebarOpen} = useSidebar();
	const toggleDrawer = () => {
		setIsSidebarOpen(prev => !prev);
	};

	return (
		<ThemeProvider theme={defaultTheme}>
			<Box sx={{display: 'flex'}}>
				<CssBaseline/>
				<AppBar position="absolute" open={isSidebarOpen}>
					<Toolbar
						sx={{
							pr: '24px', // keep right padding when drawer closed
						}}
					>
						<IconButton
							edge="start"
							color="inherit"
							aria-label="open drawer"
							onClick={toggleDrawer}
							sx={{
								marginRight: '36px',
								...(isSidebarOpen && {display: 'none'}),
							}}
						>
							<MenuIcon/>
						</IconButton>
						<Typography
							component="h1"
							variant="h6"
							color="inherit"
							noWrap
							sx={{flexGrow: 1}}
						>
							{pageTitle ?? 'Dashboard'}
						</Typography>
						<IconButton color="inherit">
							<Badge badgeContent={4} color="secondary">
								<NotificationsIcon/>
							</Badge>
						</IconButton>
					</Toolbar>
				</AppBar>
				<Drawer

					variant="permanent"
					anchor="left"
					open={isSidebarOpen}
				>
					<Toolbar
						sx={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'flex-end',
							px: [1],
						}}
					>
						<IconButton onClick={toggleDrawer}>
							<ChevronLeftIcon/>
						</IconButton>
					</Toolbar>

					<Divider/>

					<SidebarNavigation/>
				</Drawer>
				<Box
					component="main"
					sx={{
						backgroundColor: (theme) =>
							theme.palette.mode === 'light'
								? theme.palette.grey[100]
								: theme.palette.grey[900],
						flexGrow: 1,
						height: '100vh',
						overflow: 'auto',
					}}
				>
					<Toolbar/>
					<Container maxWidth="lg" sx={{mt: 4, mb: 4}}>
						{children}
					</Container>
				</Box>
			</Box>
		</ThemeProvider>
	);
};

export default DrawerView;
