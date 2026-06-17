import { Box, Button, Stack, Typography } from "@mui/material";

export default function NotificationPager({ page, hasNext, onPrev, onNext }) {
  return (
    <Box sx={{ mt: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Button variant="outlined" onClick={onPrev} disabled={page === 1}>
          Previous
        </Button>
        <Typography variant="body2">Page {page}</Typography>
        <Button variant="outlined" onClick={onNext} disabled={!hasNext}>
          Next
        </Button>
      </Stack>
    </Box>
  );
}
