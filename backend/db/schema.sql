-- JanSeva AI — Phase 1 Database Schema
-- Core grievance-management loop: citizen submits, officer manages, status tracked.
-- Run this once against your PostgreSQL database to create all tables.

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid()

-- ============================================================
-- USERS  (both citizens and officers live here, split by role)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(150) NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    phone           VARCHAR(20),
    password_hash   TEXT NOT NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'officer', 'admin')),
    is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DEPARTMENTS  (e.g. Water Supply, Roads, Electricity)
-- ============================================================
CREATE TABLE IF NOT EXISTS departments (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name    VARCHAR(100) UNIQUE NOT NULL
);

-- ============================================================
-- CATEGORIES  (e.g. "Pothole" -> Roads dept, "No water" -> Water dept)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    department_id   UUID REFERENCES departments(id) ON DELETE SET NULL
);

-- ============================================================
-- OFFICERS  (thin table linking a user account to a department)
-- ============================================================
CREATE TABLE IF NOT EXISTS officers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department_id   UUID REFERENCES departments(id) ON DELETE SET NULL,
    designation     VARCHAR(100)
);

-- ============================================================
-- COMPLAINTS  (the center of the whole system)
-- ============================================================
CREATE TABLE IF NOT EXISTS complaints (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    citizen_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id         UUID REFERENCES categories(id) ON DELETE SET NULL,
    department_id       UUID REFERENCES departments(id) ON DELETE SET NULL,
    assigned_officer_id UUID REFERENCES officers(id) ON DELETE SET NULL,
    title               VARCHAR(200) NOT NULL,
    description         TEXT NOT NULL,
    status              VARCHAR(30) NOT NULL DEFAULT 'submitted'
                        CHECK (status IN ('submitted', 'in_progress', 'resolved', 'reopened', 'closed')),
    latitude            DOUBLE PRECISION,
    longitude           DOUBLE PRECISION,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- COMPLAINT_MEDIA  (photos/videos attached to a complaint)
-- ============================================================
CREATE TABLE IF NOT EXISTS complaint_media (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id    UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    file_url        TEXT NOT NULL,
    type            VARCHAR(20) NOT NULL CHECK (type IN ('image', 'video', 'audio')),
    uploaded_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Helpful indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_complaints_citizen ON complaints(citizen_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_department ON complaints(department_id);
CREATE INDEX IF NOT EXISTS idx_complaint_media_complaint ON complaint_media(complaint_id);

-- ============================================================
-- Seed data (a few departments + categories to start with)
-- ============================================================
INSERT INTO departments (name) VALUES
    ('Water Supply'), ('Roads'), ('Electricity'), ('Sanitation'), ('Public Health')
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (name, department_id)
SELECT 'No water supply', id FROM departments WHERE name = 'Water Supply'
ON CONFLICT DO NOTHING;

INSERT INTO categories (name, department_id)
SELECT 'Pothole', id FROM departments WHERE name = 'Roads'
ON CONFLICT DO NOTHING;

INSERT INTO categories (name, department_id)
SELECT 'Streetlight not working', id FROM departments WHERE name = 'Electricity'
ON CONFLICT DO NOTHING;

INSERT INTO categories (name, department_id)
SELECT 'Garbage not collected', id FROM departments WHERE name = 'Sanitation'
ON CONFLICT DO NOTHING;
