-- Neutral names for the tables of the evaluation, and a performance mapping that can be different for each department.
-- Run it on EVERY database (the laptop, the test server, later production) BEFORE the new backend is started.
-- The old backend keeps working after it (the views have the old names). Drop the views when no old backend runs any more.

-- 1. the submitted flags of the evaluation (one row per employee and month, every none-sales department)
RENAME TABLE csd_evaluation_status TO evaluation_status;
CREATE VIEW csd_evaluation_status AS SELECT * FROM evaluation_status;

-- 2. the mapping of the Performance (%) to a score (1 - 5)
--    department_code NULL = the default rows (CSD, Collection, and every department that has no mapping of its own yet, e.g. Purchasing, HR & Admin)
--    a department with its own rows (department_code = 'purchasing') uses only its own rows
RENAME TABLE csd_performance_score TO evaluation_performance_score;
ALTER TABLE evaluation_performance_score ADD COLUMN department_code VARCHAR(30) NULL DEFAULT NULL AFTER id;
CREATE VIEW csd_performance_score AS
    SELECT id, min_value, max_value, score, description, created_at, updated_at
    FROM evaluation_performance_score
    WHERE department_code IS NULL;

-- 3. when Purchasing sends its own mapping, add its rows (example, the values are not real):
-- INSERT INTO evaluation_performance_score (department_code, min_value, max_value, score, description) VALUES
--   ('purchasing',  0.00,  59.99, 1, 'POOR'),
--   ('purchasing', 60.00,  74.99, 2, 'UNSATISFACTORY'),
--   ('purchasing', 75.00,  84.99, 3, 'SATISFACTORY'),
--   ('purchasing', 85.00,  94.99, 4, 'VERY SATISFACTORY'),
--   ('purchasing', 95.00, 100.00, 5, 'EXCEPTIONAL');

-- To go back:
--   DROP VIEW csd_evaluation_status;  RENAME TABLE evaluation_status TO csd_evaluation_status;
--   DROP VIEW csd_performance_score;  ALTER TABLE evaluation_performance_score DROP COLUMN department_code;
--   RENAME TABLE evaluation_performance_score TO csd_performance_score;
