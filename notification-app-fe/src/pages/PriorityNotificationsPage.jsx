import { Alert, Box, CircularProgress, Container, Paper, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import NotificationCard from "../components/NotificationCard.jsx";
import NotificationFilter from "../components/NotificationFilter.jsx";
import { fetchNotifications } from "../api/notificationApi.js";

const PRIORITY_ORDER = ["Placement", "Result", "Event"];

export default function PriorityNotificationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [limit, setLimit] = useState(5);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const types = filter === "All" ? PRIORITY_ORDER : [filter];
        const responses = await Promise.all(
          types.map((type) => fetchNotifications({ page: 1, limit, notificationType: type }))
        );
        const merged = responses.flatMap((r) => r.notifications);
        merged.sort((a, b) => PRIORITY_ORDER.indexOf(a.type) - PRIORITY_ORDER.indexOf(b.type));
        setItems(merged);
      } catch {
        setItems([]);
        setError("Failed to load priority notifications");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filter, limit]);

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack spacing={2}>
          <NotificationFilter value={filter} onChange={setFilter} />
          <TextField
            type="number"
            label="Top N"
            size="small"
            value={limit}
            onChange={(e) => setLimit(Math.max(1, Number(e.target.value) || 1))}
            inputProps={{ min: 1, max: 20 }}
          />
        </Stack>
      </Paper>
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      )}
      {!loading && error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && items.length === 0 && <Alert severity="info">No priority notifications</Alert>}
      {!loading && !error && items.map((item) => <NotificationCard key={item.id} item={item} viewed={false} />)}
    </Container>
  );
}
