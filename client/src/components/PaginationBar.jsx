import { Pagination, Stack, Typography } from "@mui/material";

export default function PaginationBar({ page, totalPages, total, onChange }) {
	return (
		<Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
			<Typography variant="body2">Total: {total}</Typography>
			<Pagination
				count={Math.max(1, totalPages || 1)}
				page={page || 1}
				color="primary"
				onChange={(_e, v) => onChange?.(v)}
			/>
		</Stack>
	);
}


