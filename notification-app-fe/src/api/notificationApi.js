import axios from "axios";

const TOKEN = import.meta.env.VITE_NOTIFICATION_API_TOKEN;

const client = axios.create({
  baseURL: "/evaluation-service/notifications",
  timeout: 15000,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
  },
});

const mapItem = (item) => ({
  id: item.ID,
  type: item.Type,
  message: item.Message,
  timestamp: item.Timestamp,
});

export const fetchNotifications = async ({ page, limit, notificationType }) => {
  const params = { page, limit };
  if (notificationType && notificationType !== "All") {
    params.notification_type = notificationType;
  }
  const response = await client.get("", { params });
  const notifications = (response.data?.notifications || []).map(mapItem);
  return {
    notifications,
    hasNext: notifications.length === limit,
  };
};
