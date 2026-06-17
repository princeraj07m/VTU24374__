import { AppBar, Box, Container, Tab, Tabs, Toolbar, Typography } from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";

export default function NotificationTabs({ tab, onChange }) {
  return (
    <AppBar position="sticky" elevation={0} color="inherit" sx={{ borderBottom: "1px solid #d6d6d6" }}>
      <Container maxWidth="md">
        <Toolbar disableGutters sx={{ flexDirection: "column", alignItems: "stretch", py: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <NotificationsNoneIcon sx={{ color: "#1f2937" }} />
            <Typography variant="h6" sx={{ color: "#111827" }}>
              Campus Notifications
            </Typography>
          </Box>
          <Tabs
            value={tab}
            onChange={(_, v) => onChange(v)}
            textColor="inherit"
            indicatorColor="primary"
            sx={{ "& .MuiTab-root": { textTransform: "none", fontWeight: 500, fontSize: 14 } }}
          >
            <Tab value="all" label="All notifications" />
            <Tab value="priority" label="Priority notifications" />
          </Tabs>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
