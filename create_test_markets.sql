-- Insert test markets for match 535116
INSERT INTO markets (id, "matchId", type, name, options, "isActive", "createdAt", "updatedAt") VALUES
('550e8400-e29b-41d4-a716-446655440001', '535116', 'MATCH_WINNER', 'Resultado Final', 
 '[{"name":"CR Vasco da Gama","odds":2.1,"isSuspended":false},{"name":"Empate","odds":3.2,"isSuspended":false},{"name":"CA Mineiro","odds":3.5,"isSuspended":false}]', 
 true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', '535116', 'BOTH_TEAMS_SCORE', 'Ambos Marcam',
 '[{"name":"Sim","odds":1.8,"isSuspended":false},{"name":"Não","odds":1.95,"isSuspended":false}]',
 true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', '535116', 'OVER_UNDER_GOALS', 'Acima/Abaixo 2.5 Gols',
 '[{"name":"Acima 2.5","odds":1.85,"isSuspended":false},{"name":"Abaixo 2.5","odds":1.90,"isSuspended":false}]',
 true, NOW(), NOW());
EOF < /dev/null
