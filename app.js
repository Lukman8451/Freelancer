import express from "express";
import cors from "cors";
import { env } from "./src/config/config.js";
import { sequelize } from "./src/model/index.js";
import mainRouter from "./src/routes/index.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", mainRouter);

app.get("/", (req, res) => res.json({ ok: true, message: "Freelancer API" }));

(async () => {
    try {
        await sequelize.authenticate();
        console.log("DB connected");
        // dev: sync. For production use migrations.
        await sequelize.sync({ alter: true });
        app.listen(env.PORT, () => console.log(`Server running at http://localhost:${env.PORT}`));
    } catch (err) {
        console.error("Startup failed", err);
        process.exit(1);
    }
})();
