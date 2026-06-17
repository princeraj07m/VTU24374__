import axios from "axios";
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env") });

const log = async (stack, level, pkg, message) => {
  try {
    await axios.post(
      "http://4.224.186.213/evaluation-service/logs",
      { stack, level, package: pkg, message },
      {
        headers: {
          Authorization: `Bearer ${process.env.LOGGING_SERVICE_TOKEN}`,
        },
      }
    );
  } catch (err) {
    return;
  }
};

export default log;
