import { useMemo } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { CssBaseline, AppBar, Toolbar, Typography, Button, Container, Box } from "@mui/material";
import Yarns from "./pages/Yarns.jsx";
import Companies from "./pages/Companies.jsx";

export default function App() {
	const location = useLocation();
	const title = useMemo(() => {
		if (location.pathname.startsWith("/companies")) return "Companies";
		return "Yarns";
	}, [location.pathname]);

	return (
		<>
			<CssBaseline />
			<AppBar position="sticky">
				<Toolbar>
					<Typography variant="h6" sx={{ flexGrow: 1 }}>
						ZGFZYX Data Browser — {title}
					</Typography>
					<Button color="inherit" component={Link} to="/">
						Yarns
					</Button>
					<Button color="inherit" component={Link} to="/companies">
						Companies
					</Button>
				</Toolbar>
			</AppBar>
			<Container maxWidth="xl" sx={{ py: 3 }}>
				<Box>
					<Routes>
						<Route path="/" element={<Yarns />} />
						<Route path="/companies" element={<Companies />} />
					</Routes>
				</Box>
			</Container>
		</>
	);
}


