CREATE TABLE parent_comments (
    id INTEGER PRIMARY KEY,
    ip_address TEXT,
    title TEXT,
    date TEXT,
    body TEXT
);
CREATE TABLE child_comments (
    id INTEGER PRIMARY KEY,
    parent_comment_id INTEGER,
    ip_address TEXT,
    date TEXT,
    body TEXT,
    FOREIGN KEY (parent_comment_id) REFERENCES parent_comments(id)
);
