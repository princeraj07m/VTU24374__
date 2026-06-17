import { Box, Card, CardContent, Stack, Typography } from "@mui/material";

export default function NotificationCard({ item, viewed }) {
  return (
    <Card
      variant="outlined"
      sx={{ mb: 1.5, opacity: viewed ? 0.8 : 1, borderColor: "#d4d4d8", borderRadius: 1.5 }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                px: 1,
                py: 0.3,
                borderRadius: 1,
                bgcolor: "#eef2ff",
                color: "#3730a3",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {item.type}
            </Box>
            <Box sx={{ color: viewed ? "#6b7280" : "#b45309", fontSize: 12, fontWeight: 600 }}>
              {viewed ? "Viewed" : "New"}
            </Box>
          </Stack>
          <Typography variant="caption" sx={{ color: "#4b5563" }}>
            {new Date(item.timestamp).toLocaleString()}
          </Typography>
        </Stack>
        <Typography sx={{ color: "#111827" }}>{item.message}</Typography>
      </CardContent>
    </Card>
  );
}
