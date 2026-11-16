import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  const id = Number(req.query.id);
  if (!Number.isInteger(id))
    return res.status(400).json({ error: "Invalid id" });

  try {
    const [[data]] = await pool.query(
      `
        SELECT
        games.*,
        JSON_OBJECT(
          'id', genres.id,
          'name', genres.genre
        ) AS genre,
        JSON_OBJECT(
          'id', developers.id,
          'dev_id', developers.developer_id,
          'website', developers.developer_website,
          'name', developers.developer
        ) AS developer,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', tags.id,
              'name', tags.tag
            )
          )
          FROM games_tags
          LEFT JOIN tags ON games_tags.tag_id = tags.id
          WHERE games_tags.game_id = games.id
        ) AS tags
        FROM games
        LEFT JOIN genres ON games.genre_id = genres.id
        LEFT JOIN developers ON games.developer_id = developers.id
        WHERE games.id = ?
      `
        .replace(/\s+/g, " ")
        .trim(),
      id,
    );
    res.json(data ? data : "There is no page for the requested game");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
