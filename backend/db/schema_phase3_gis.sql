-- JanSeva AI — Phase 3 Database Migration
-- Adds an index to speed up GIS queries (hotspot clustering, nearby search,
-- heatmap points) against complaints.latitude / complaints.longitude.
-- Run this AFTER schema.sql and schema_phase2.sql. Safe to run on an
-- existing database — it only adds an index, nothing else.

CREATE INDEX IF NOT EXISTS idx_complaints_lat_lng ON complaints(latitude, longitude)
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
