import React, {ReactNode, useState} from 'react';
import {styled, createTheme, ThemeProvider} from '@mui/material/styles';
import {
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Container,
	Badge,
	IconButton,
	Divider,
	Typography,
	List,
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
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import HostsList from '@/components/host/HostsList.tsx';
import RouterLink from '@/components/RouterLink.tsx';
import {HostDmonContext, useHostDmon} from '@/context/HostDmonContext.tsx';

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
	const [open, setOpen] = useState(true);
	const toggleDrawer = () => {
		setOpen(!open);
	};

	const {currentUser} = useHostDmon() as HostDmonContext;

	if (currentUser == null) return <></>;

	return (
		<ThemeProvider theme={defaultTheme}>
			<Box sx={{display: 'flex'}}>
				<CssBaseline/>
				<AppBar position="absolute" open={open}>
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
								...(open && {display: 'none'}),
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
					open={open}
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
					<List component="nav">
						<HostsList/>

						<Divider sx={{my: 1}}/>

						<RouterLink to={`/user/${currentUser.id}`}>
							<ListItemButton>
								<ListItemIcon>
									<AccountCircleOutlinedIcon/>
								</ListItemIcon>
								<ListItemText>
									Account
								</ListItemText>
							</ListItemButton>
						</RouterLink>

						<RouterLink to={`/user/2`}> {/* TODO: remove in production */}
							<ListItemButton>
								<ListItemIcon>
									<AccountCircleOutlinedIcon/>
								</ListItemIcon>
								<ListItemText>
									Account of user 2.
								</ListItemText>
							</ListItemButton>
						</RouterLink>

					</List>
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
