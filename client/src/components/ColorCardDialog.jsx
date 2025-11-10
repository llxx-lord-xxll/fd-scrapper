import { useMemo, useState, useEffect } from "react";
import {
	Box,
	Dialog,
	DialogTitle,
	DialogContent,
	IconButton,
	Button,
	Typography
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

export default function ColorCardDialog({ open, onClose, colorCard }) {
	const images = useMemo(() => {
		if (!colorCard) return [];
		const arr = [];
		if (colorCard.img) arr.push(colorCard.img);
		if (Array.isArray(colorCard.example)) {
			colorCard.example.forEach((u) => u && arr.push(u));
		}
		return arr;
	}, [colorCard]);

	const [index, setIndex] = useState(0);
	useEffect(() => {
		setIndex(0);
	}, [open, colorCard]);

	function prev() {
		setIndex((i) => (i - 1 + images.length) % images.length);
	}
	function next() {
		setIndex((i) => (i + 1) % images.length);
	}

	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
			<DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
				<Typography variant="h6">Color card details</Typography>
				<IconButton onClick={onClose}>
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<DialogContent>
				<Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", md: "row" } }}>
					<Box sx={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
						{images.length > 0 ? (
							<Box sx={{ position: "relative", width: "100%", aspectRatio: "4 / 3", bgcolor: "#f5f5f5", borderRadius: 1 }}>
								<img
									src={images[index]}
									style={{ objectFit: "contain", width: "100%", height: "100%", borderRadius: 4 }}
								/>
								{images.length > 1 ? (
									<>
										<IconButton
											onClick={prev}
											sx={{ position: "absolute", top: "50%", left: 8, transform: "translateY(-50%)", bgcolor: "white" }}
										>
											<ArrowBackIosNewIcon />
										</IconButton>
										<IconButton
											onClick={next}
											sx={{ position: "absolute", top: "50%", right: 8, transform: "translateY(-50%)", bgcolor: "white" }}
										>
											<ArrowForwardIosIcon />
										</IconButton>
										<Box
											sx={{
												position: "absolute",
												bottom: 8,
												left: "50%",
												transform: "translateX(-50%)",
												display: "flex",
												gap: 0.5
											}}
										>
											{images.map((_, i) => (
												<Box
													key={i}
													onClick={() => setIndex(i)}
													sx={{
														width: 8,
														height: 8,
														borderRadius: "50%",
														bgcolor: i === index ? "primary.main" : "grey.400",
														cursor: "pointer"
													}}
												/>
											))}
										</Box>
									</>
								) : null}
							</Box>
						) : (
							<Box sx={{ p: 4, color: "text.secondary" }}>No images</Box>
						)}
					</Box>
					<Box sx={{ flex: 1, minWidth: 280 }}>
						<Typography variant="subtitle1" sx={{ mb: 1 }}>
							Attributes
						</Typography>
						<Box sx={{ display: "grid", gridTemplateColumns: "120px 1fr", rowGap: 1, columnGap: 2 }}>
							<Typography variant="body2" sx={{ fontWeight: 600 }}>
								Name
							</Typography>
							<Typography variant="body2">{colorCard?.Name || colorCard?.name || "-"}</Typography>
							<Typography variant="body2" sx={{ fontWeight: 600 }}>
								Color
							</Typography>
							<Typography variant="body2">{colorCard?.Color || "-"}</Typography>
							<Typography variant="body2" sx={{ fontWeight: 600 }}>
								Pantone
							</Typography>
							<Typography variant="body2">{colorCard?.["Pantone Color"] || "-"}</Typography>
						</Box>
						{Array.isArray(colorCard?.example) && colorCard.example.length > 0 ? (
							<Box sx={{ mt: 2 }}>
								<Typography variant="subtitle1" sx={{ mb: 1 }}>
									Examples
								</Typography>
								<Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
									{colorCard.example.map((u, i) =>
										u ? (
											<Button key={i} size="small" href={u} target="_blank" rel="noreferrer">
												Open example {i + 1}
											</Button>
										) : null
									)}
								</Box>
							</Box>
						) : null}
					</Box>
				</Box>
			</DialogContent>
		</Dialog>
	);
}


