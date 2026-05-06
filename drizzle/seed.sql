INSERT OR IGNORE INTO users (id, email, password_hash, full_name, role)
VALUES (
  lower(hex(randomblob(16))),
  'admin@academy.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Admin User',
  'admin'
);
