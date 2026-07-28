const pool =  require('../../config/db')


// exports.fetchManager = async (req, res, next) => {

//     const departmentCode = req.params.department_code
    
//     const connection =  await pool.getConnection()


//     const [result] = await connection.execute(
//     `
//         SELECT 
//         e.id AS manager_id,
//         e.db_name AS manager_name,
//         p.position_name,
//         p.level,
//         d.name AS department_name,
//         d.code AS department_code

//         FROM employees e

//         JOIN employee_employments ee 
//             ON ee.employee_id = e.id 
//         AND ee.status IN ('Hired', 'Rehired')
//         AND ee.end_date IS NULL

//         JOIN employee_assignments ea 
//             ON ea.employee_id = e.id
//         AND ea.id = (
//                 SELECT MAX(id)
//                 FROM employee_assignments
//                 WHERE employee_id = e.id
//         )

//         JOIN positions p 
//             ON ea.position_id = p.id

//         JOIN departments d 
//             ON ea.department_id = d.id

//         WHERE 
//            ( d.code = ?
//             AND LOWER(p.position_name) REGEXP 'manager|leader|trainer') OR ( LOWER(p.position_name) REGEXP ? AND LOWER(p.position_name) REGEXP 'manager|leader|trainer');
//     `,[departmentCode, departmentCode]
//   );
    
//     connection.release()
//     res.json(result)
// }

//Fecth managers based on department code and position name containing the department code
exports.fetchManager = async (req, res, next) => {
    const departmentCode = req.params.department_code;
    const connection = await pool.getConnection();

    try {
        const [result] = await connection.execute(
            `
            SELECT 
                e.id AS manager_id,
                e.db_name AS manager_name,
                p.position_name,
                p.level,
                d.name AS department_name,
                d.code AS department_code
            FROM employees e
            JOIN employee_employments ee 
                ON ee.employee_id = e.id 
                AND ee.status IN ('Hired', 'Rehired')
                AND ee.end_date IS NULL
            JOIN employee_assignments ea 
                ON ea.employee_id = e.id
                AND ea.id = (
                    SELECT MAX(id)
                    FROM employee_assignments
                    WHERE employee_id = e.id
                )
            JOIN positions p ON ea.position_id = p.id
            JOIN departments d ON ea.department_id = d.id
            WHERE 
                LOWER(p.position_name) REGEXP 'manager|leader|trainer'
                AND (
                    d.code = ? 
                    OR LOWER(p.position_name) LIKE CONCAT('%', LOWER(?), '%')
                );
            `, 
            [departmentCode, departmentCode]
        );

        res.json(result);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        // This runs no matter what, ensuring your database stays healthy
        connection.release();
    }
};

