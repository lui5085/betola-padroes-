-- Verificar se o usuário existe
SELECT id, email, username, "isAdmin" FROM "User" WHERE email = 'teste2@gmail.com';

-- Tornar o usuário admin
UPDATE "User" SET "isAdmin" = true WHERE email = 'teste2@gmail.com';

-- Verificar se funcionou
SELECT id, email, username, "isAdmin" FROM "User" WHERE email = 'teste2@gmail.com';