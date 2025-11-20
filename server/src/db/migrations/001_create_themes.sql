CREATE TABLE IF NOT EXISTS themes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    music TEXT,
    ending TEXT,
    image TEXT,
    animation_id INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);