import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { useMemo, useState } from "react";
import NotificationTabs from "./components/NotificationTabs.jsx";
import AllNotificationsPage from "./pages/AllNotificationsPage.jsx";
import PriorityNotificationsPage from "./pages/PriorityNotificationsPage.jsx";

const theme = createTheme({
  palette: {
    background: {
      default: "#f2f2f2",
    },
  },
  typography: {
    fontFamily: "Segoe UI, Tahoma, Arial, sans-serif",
    h6: {
      fontWeight: 600,
    },
    body1: {
      fontSize: "1rem",
    },
  },
});

export default function App() {
  const initialTab = window.location.hash === "#priority" ? "priority" : "all";
  const [tab, setTab] = useState(initialTab);

  const onTabChange = (value) => {
    setTab(value);
    window.location.hash = value === "priority" ? "priority" : "all";
  };

  const page = useMemo(
    () => (tab === "priority" ? <PriorityNotificationsPage /> : <AllNotificationsPage />),
    [tab]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationTabs tab={tab} onChange={onTabChange} />
      {page}
    </ThemeProvider>
  );
}
