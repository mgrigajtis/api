CREATE TABLE users (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(255),
  password VARCHAR(255),
  password_salt VARCHAR(255),
  email VARCHAR(255),
  address1 VARCHAR(255),
  address2 VARCHAR(255),
  city VARCHAR(255),
  state VARCHAR(25),
  zip VARCHAR(25)
)
