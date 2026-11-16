import express from "express";
import path from "path";
import api from "./api/index.js";

const app = express();
const distPath = path.join(import.meta.dirname, "..", "front", "dist");

app.use("/api", api);
app.use(express.static(distPath));
app.use((req, res) => res.sendFile(path.join(distPath, "index.html")));

app.listen(3000, () => console.log("http://localhost:3000"));
