// The employees of a month as they were in that month, in ANY department: the latest assignment and the latest employment
// valid in the month (the same snapshot rule as the CSD evaluation query, csd_metrics_queries.js).
// Needed where CSD work reaches the other departments, because the CSD & Collection Manager (position level 10) and the
// CSD & Collections Quality Analyst / Trainer belong to CSD but also serve Collection.
//
// FROM_SNAPSHOT has 4 placeholders: year_month x 4. It exposes: e (employees), ea (assignment), ee (employment).
exports.FROM_SNAPSHOT = `
    FROM employees e
    JOIN (
        SELECT ea1.*
        FROM employee_assignments ea1
        JOIN (
            SELECT employee_id, MAX(id) AS latest_id
            FROM employee_assignments
            WHERE DATE_FORMAT(effective_from, '%Y-%m') <= ?
              AND (effective_to IS NULL OR DATE_FORMAT(effective_to, '%Y-%m') >= ?)
            GROUP BY employee_id
        ) ea2 ON ea1.employee_id = ea2.employee_id AND ea1.id = ea2.latest_id
    ) ea ON e.id = ea.employee_id
    JOIN (
        SELECT ee1.*
        FROM employee_employments ee1
        JOIN (
            SELECT employee_id, MAX(id) AS latest_id
            FROM employee_employments
            WHERE DATE_FORMAT(start_date, '%Y-%m') <= ?
              AND (end_date IS NULL OR DATE_FORMAT(end_date, '%Y-%m') >= ?)
            GROUP BY employee_id
        ) ee2 ON ee1.employee_id = ee2.employee_id AND ee1.id = ee2.latest_id
    ) ee ON e.id = ee.employee_id
    LEFT JOIN positions p ON ea.position_id = p.id
    LEFT JOIN departments d ON ea.department_id = d.id
`

exports.snapshotParams = (yearMonth) => [yearMonth, yearMonth, yearMonth, yearMonth]
