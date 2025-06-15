import morgan from "morgan";
import logger from "../utils/logger";

const httpLogger = morgan("combined", {
  stream: {
    write: (message: any) => logger.http(message.trim()),
  },
});

export default httpLogger;
