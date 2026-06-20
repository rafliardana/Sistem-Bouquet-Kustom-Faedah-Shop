-- =====================================================
-- Faedah Shop — PostgreSQL Schema
-- =====================================================
-- Jalankan manual: psql -U postgres -f init.sql
-- Atau biarkan server auto-create via db.js
-- =====================================================

-- Buat database (jalankan terpisah jika perlu)
-- CREATE DATABASE faedah_shop;

-- Users (menggantikan Supabase Auth + kv user:*)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'customer'
    CHECK (role IN ('owner', 'admin', 'customer')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products (menggantikan kv product:*)
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  base_price INTEGER NOT NULL DEFAULT 0,
  image TEXT DEFAULT '',
  category VARCHAR(100) DEFAULT 'Campur',
  sizes JSONB DEFAULT '[]'::jsonb,
  addons JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders (menggantikan kv order:*)
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(100) PRIMARY KEY,
  order_number VARCHAR(20) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  customer_email VARCHAR(255),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  customer_address TEXT,
  product JSONB NOT NULL,
  customization JSONB NOT NULL,
  total_price INTEGER NOT NULL,
  status VARCHAR(30) DEFAULT 'menunggu_konfirmasi'
    CHECK (status IN ('menunggu_konfirmasi', 'dalam_proses', 'pesanan_siap', 'selesai')),
  payment_method VARCHAR(50),
  payment_method_label VARCHAR(100),
  payment_proof_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Methods (menggantikan kv settings:payment_methods)
CREATE TABLE IF NOT EXISTS payment_methods (
  id VARCHAR(50) PRIMARY KEY,
  label VARCHAR(100) NOT NULL,
  detail TEXT DEFAULT '',
  needs_proof BOOLEAN DEFAULT false
);

-- Index untuk query yang sering dipakai
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
