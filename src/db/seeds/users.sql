--- 假数据，放心使用
DELETE FROM users;
DELETE FROM sqlite_sequence WHERE name='users';
INSERT INTO users (id, username, access_code_hash, role, avatar, gmt_create, gmt_modified, is_deleted) VALUES (1, 'zhanglangeba', 'c69f3b616eb451d7475299bde15e8384e56dc68c78cc23010d37d22111406763', 'admin', '🐽', 1768896563511, 1768896563511, 0);
INSERT INTO users (id, username, access_code_hash, role, avatar, gmt_create, gmt_modified, is_deleted) VALUES (2, 'tiejiaxiaobao', '3b7e1a26d6567c52510c254092b8261c0c13ba3a717aad435fd74f8793dca34a', 'user', '🐶', 1768896563511, 1768896563511, 0);