-- SQL скрипт для создания товаров напрямую в базе данных
-- Выполните через Render Shell: sqlite3 /var/www/html/storage/database.sqlite < CREATE_PRODUCTS_SQL.sql

-- Вставляем товары
INSERT OR REPLACE INTO products (name, category, description, price, is_active, flavors, volumes, purchase_price, created_at, updated_at) VALUES
('Chaser for pods', 'Chaser for pods', 'Премиум жидкость для парения', 325.00, 1, 
 '["{\"name\":\"Виноград\",\"image_path\":null,\"is_active\":true}","{\"name\":\"Вишня\",\"image_path\":null,\"is_active\":true}","{\"name\":\"Вишня Ментол\",\"image_path\":null,\"is_active\":true}","{\"name\":\"Персик\",\"image_path\":null,\"is_active\":true}","{\"name\":\"Смородина ментоол\",\"image_path\":null,\"is_active\":true}"]',
 '{"30ml":{"flavors":[{"name":"Виноград","image_path":null,"is_active":true},{"name":"Вишня","image_path":null,"is_active":true},{"name":"Вишня Ментол","image_path":null,"is_active":true},{"name":"Персик","image_path":null,"is_active":true},{"name":"Смородина ментоол","image_path":null,"is_active":true}],"price":325.00},"10ml":{"flavors":[{"name":"Полуниця","image_path":null,"is_active":true},{"name":"Ягоди","image_path":null,"is_active":true},{"name":"М\'ята","image_path":null,"is_active":true},{"name":"Персик","image_path":null,"is_active":true}],"price":150.00}}',
 165.0, datetime('now'), datetime('now')),

('Sticks for IQOS', 'Sticks for IQOS', 'Премиум стіки для IQOS', 120.00, 1,
 '["{\"name\":\"Амброзия\",\"image_path\":null,\"is_active\":true}","{\"name\":\"Бронзове сонце\",\"image_path\":null,\"is_active\":true}","{\"name\":\"Світанок\",\"image_path\":null,\"is_active\":true}","{\"name\":\"Зелений тютюн\",\"image_path\":null,\"is_active\":true}","{\"name\":\"Жовтий тютюн\",\"image_path\":null,\"is_active\":true}","{\"name\":\"Сірий тютюн\",\"image_path\":null,\"is_active\":true}","{\"name\":\"Свіжість\",\"image_path\":null,\"is_active\":true}","{\"name\":\"М\'ята\",\"image_path\":null,\"is_active\":true}","{\"name\":\"Смарагд\",\"image_path\":null,\"is_active\":true}","{\"name\":\"Класичний\",\"image_path\":null,\"is_active\":true}"]',
 '{}',
 50.0, datetime('now'), datetime('now')),

('Chaser My Mint', 'Chaser My Mint', 'Премиум жидкость линейки My Mint 30ml', 325.00, 1,
 '["{\"name\":\"Bubble Mint\",\"image_path\":null,\"is_active\":true}","{\"name\":\"Cranberry Mint\",\"image_path\":null,\"is_active\":true}","{\"name\":\"Bilberry Mint\",\"image_path\":null,\"is_active\":true}"]',
 '{}',
 165.0, datetime('now'), datetime('now')),

('Vaporesso XROS 0.6Ω', 'Cartridges', 'Картридж для Vaporesso XROS Series 0.6Ω', 135.00, 1,
 '[]',
 '{}',
 78.0, datetime('now'), datetime('now')),

('Chaser Mix', 'Chaser Mix', 'Премиум жидкость линейки Mix 30ml', 350.00, 1,
 '["{\"name\":\"Ожиновий джем\",\"image_path\":null,\"is_active\":true}"]',
 '{}',
 165.0, datetime('now'), datetime('now'));

