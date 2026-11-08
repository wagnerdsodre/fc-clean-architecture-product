import { app, databaseReady } from "./express";
import dotenv from "dotenv";

dotenv.config();
const port: number = Number(process.env.PORT) || 3000;

databaseReady
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database", error);
    process.exit(1);
  });
