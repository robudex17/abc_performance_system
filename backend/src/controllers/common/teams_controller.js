const pool =  require('../../config/db')
const { validationResult } = require('express-validator')


exports.fetchTeams = async (req, res, next) => {

    
    // const connection =  await pool.getConnection()

    const teamId = req.params.team_id
    const departmentCode = req.params.department_code

    console.log(departmentCode)

    const teamStatus = req.query.team_status

    if(teamId){
         const [result] = await pool.execute(
        `SELECT 
                t.*, 
                d.name AS department_name, 
                d.code AS department_code
            FROM teams2 t
            INNER JOIN departments d ON t.department_id = d.id
            WHERE d.code = ? AND t.id = ?`, [departmentCode,teamId]
    )
    // connection.release()
      return res.json(result)
    }
    
    if(teamStatus && teamStatus== 1 ){
        const [result] = await pool.execute(
       `SELECT 
                t.*, 
                d.name AS department_name, 
                d.code AS department_code
            FROM teams2 t
            INNER JOIN departments d ON t.department_id = d.id
            WHERE d.code = ? AND t.status = ?`,[departmentCode, teamStatus]  
   )
       return res.json(result)
   }
   
    const [result] = await pool.execute(
       `SELECT 
                t.*, 
                d.name AS department_name, 
                d.code AS department_code
            FROM teams2 t
            INNER JOIN departments d ON t.department_id = d.id
            WHERE d.code = ? `, [departmentCode]
    )
    // connection.release()
    
   return res.json(result)
}


exports.addUpdateDeleteTeam = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let query;
    let valuesOfQuestionMark;
    let errorMessage;
    let successMessage;
    const httpMethd = req.method;

    try {
        if (httpMethd === 'POST') {
            const { name, department_code} = req.body;
            
            const [checkDepartmentId] = await pool.execute(
                `SELECT id FROM departments WHERE code = ?`,
                [department_code]
            );


            if (checkDepartmentId.length === 0) {
                return res.status(400).json({ error: `Department with code ${department_code} not found.` });
            }

            const department_id = checkDepartmentId[0].id;

            // Check if market with same name (case-insensitive) and active already exists
            const [existing] = await pool.execute(
                `SELECT * FROM teams2 WHERE LOWER(name) = LOWER(?) AND status = 1 AND department_id = ?`,
                [name, department_id]
            );

            if (existing.length > 0) {
                return res.status(400).json({ error: `Team "${name}" already exists and is active.` });
            }

            query = `INSERT INTO teams2 (name, department_id) VALUES (?, ?)`;
            valuesOfQuestionMark = [name, department_id];
            successMessage = `New Team: ${name} is created or recorded`;
            errorMessage = `Error inserting new Team`;

        } else if (httpMethd === 'PUT') {
            const {  id, name, status, department_code, department_id } = req.body;


            // Check if this market is dismantled already
            const [rows] = await pool.execute(`SELECT status FROM teams2 WHERE id = ? AND department_id = ?`, [id, department_id]);

            if (rows.length === 0) {
                return res.status(404).json({ error: `Team  ${name} not found.` });
            }

            if (rows[0].status === 0) {
                return res.status(400).json({ error: `Team with ID ${id} is already dismantled and cannot be updated.` });
            }

            query = `UPDATE teams2 SET name = ?, status = ? WHERE id = ? AND department_id = ?`;
            valuesOfQuestionMark = [name, status, id, department_id];
            successMessage = `Team Name is set to ${name} and status is set to ${status}`;
            errorMessage = `Error in updating Team Record`;

        } else if (httpMethd === 'DELETE') {
            const { id, department_id } = req.body;
            query = `DELETE FROM teams2 WHERE id = ? and department_id = ?`;
            valuesOfQuestionMark = [id, department_id];
            successMessage = `Team: ${id} is deleted`;
            errorMessage = `Error deleting Team`;
        }

        const [result] = await pool.execute(query, valuesOfQuestionMark);

        res.status(201).json({
            message: successMessage
        });

    } catch (error) {
        console.error(errorMessage, error);
        res.status(500).json({ error: `Database Error, ${errorMessage}` });
    }
};