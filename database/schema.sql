CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE,
  password TEXT
);

CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  company TEXT,
  role TEXT,
  jd TEXT,
  status TEXT,
  applied_on DATE,
  ai_summary TEXT,
  skills TEXT[],
  suggestions TEXT
);