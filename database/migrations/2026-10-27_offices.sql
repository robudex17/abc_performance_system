-- Offices: where an employee works. An office can say that its people do NOT receive feedback from the employees of
-- another office (the Japan office: the Purchasing Manager, the Data Uploading Manager and the GOM do not get the
-- feedback of the Philippines employees).
-- The office is on the assignment (employee_assignments), so a move to another office keeps its history.
-- Everybody starts in the Philippines: nothing changes until you move people to Japan (see the UPDATE at the bottom).

CREATE TABLE IF NOT EXISTS offices (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(50) NOT NULL,
  receives_feedback_from_other_offices tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY unique_office_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO offices (id, name, receives_feedback_from_other_offices) VALUES
  (1, 'Philippines', 1),
  (2, 'Japan', 0);

-- check the type of employee_assignments.id / the other keys of your database if the foreign key is refused;
-- office_id is int like offices.id
ALTER TABLE employee_assignments
  ADD COLUMN office_id int NOT NULL DEFAULT 1,
  ADD KEY fk_assignment_office (office_id),
  ADD CONSTRAINT fk_assignment_office FOREIGN KEY (office_id) REFERENCES offices (id);

-- Move the Japan employees (the LATEST assignment of each one). Replace the ids, then run it:
-- UPDATE employee_assignments ea
--   JOIN (SELECT MAX(id) AS id FROM employee_assignments WHERE employee_id IN (/* ids of the Japan employees */) GROUP BY employee_id) latest
--     ON latest.id = ea.id
--    SET ea.office_id = (SELECT id FROM offices WHERE name = 'Japan');
