import Notification from "../models/Notification.js";
import log from "../../../logging-middleware/logger.js";

const formatDoc = (n) => ({
  id: n._id,
  type: n.notification_type,
  message: n.message,
  timestamp: n.timestamp,
});

export const getNotifications = async (req, res) => {
  await log("getNotifications", "info", "notification-app-be", "getNotifications called");
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const { notification_type, search } = req.query;

    const filter = {};
    if (notification_type) {
      filter.notification_type = notification_type;
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .select("notification_type message timestamp")
        .sort(search ? { score: { $meta: "textScore" }, timestamp: -1 } : { timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      notifications: notifications.map(formatDoc),
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications", details: error.message });
  }
};

export const getPriorityNotifications = async (req, res) => {
  await log("getPriorityNotifications", "info", "notification-app-be", "getPriorityNotifications called");
  try {
    const limit = Math.min(parseInt(req.query.limit) || 5, 20);
    const priorityOrder = ["Placement", "Result", "Event"];

    const results = await Promise.all(
      priorityOrder.map((type) =>
        Notification.find({ notification_type: type })
          .select("notification_type message timestamp")
          .sort({ timestamp: -1 })
          .limit(limit)
          .lean()
      )
    );

    const notifications = results.flat().map(formatDoc);
    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch priority notifications", details: error.message });
  }
};
