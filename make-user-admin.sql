-- Script to make a user admin
-- Replace 'user@example.com' with the actual user email

UPDATE "User" SET "isAdmin" = true WHERE email = 'user@example.com';

-- Or to make user admin by username:
-- UPDATE "User" SET "isAdmin" = true WHERE username = 'username';

-- To check admin users:
-- SELECT id, email, username, "isAdmin" FROM "User" WHERE "isAdmin" = true;