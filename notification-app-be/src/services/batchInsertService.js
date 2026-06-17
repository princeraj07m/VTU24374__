import Notification from "../models/Notification.js";

const TYPES = ["Placement", "Result", "Event"];

const buildBatch = (startIndex, batchSize) => {
  const docs = [];
  for (let i = 0; i < batchSize; i++) {
    const index = startIndex + i;
    docs.push({
      student_id: `STU${String(index % 10000).padStart(5, "0")}`,
      notification_type: TYPES[index % 3],
      message: `Campus notification ${index + 1}`,
      timestamp: new Date(Date.now() - index * 60000),
      is_read: index % 4 === 0,
    });
  }
  return docs;
};

export const batchInsertNotifications = async (totalCount, batchSize = 5000) => {
  let inserted = 0;

  for (let start = 0; start < totalCount; start += batchSize) {
    const size = Math.min(batchSize, totalCount - start);
    const batch = buildBatch(start, size);
    await Notification.insertMany(batch, { ordered: false });
    inserted += size;
    console.log(`Inserted ${inserted}/${totalCount}`);
  }

  await Notification.createIndexes();
  return inserted;
};
