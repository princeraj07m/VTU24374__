import { Alert, Box, CircularProgress, Container, Paper } from "@mui/material";
import { useEffect, useState } from "react";
import NotificationCard from "../components/NotificationCard.jsx";
import NotificationFilter from "../components/NotificationFilter.jsx";
import NotificationPager from "../components/NotificationPager.jsx";
import { fetchNotifications } from "../api/notificationApi.js";

const LIMIT = 10;
const STORAGE_KEY = "viewed_notifications";

export default function AllNotificationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("All");
  const [hasNext, setHasNext] = useState(false);
  const [viewedIds, setViewedIds] = useState(() => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchNotifications({ page, limit: LIMIT, notificationType: filter });
        setItems(data.notifications);
        setHasNext(data.hasNext);
        const merged = [...new Set([...viewedIds, ...data.notifications.map((n) => n.id)])];
        setViewedIds(merged);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch (e) {
        setItems([]);
        setHasNext(false);
        setError(e.response?.status === 401 ? "Invalid/expired token" : "Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, filter]);

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <NotificationFilter
          value={filter}
          onChange={(v) => {
            setFilter(v);
            setPage(1);
          }}
        />
      </Paper>
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      )}
      {!loading && error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && items.length === 0 && <Alert severity="info">No notifications</Alert>}
      {!loading &&
        !error &&
        items.map((item) => <NotificationCard key={item.id} item={item} viewed={viewedIds.includes(item.id)} />)}
      {!loading && !error && items.length > 0 && (
        <NotificationPager
          page={page}
          hasNext={hasNext}
          onPrev={() => setPage((p) => p - 1)}
          onNext={() => setPage((p) => p + 1)}
        />
      )}
    </Container>
  );
}
