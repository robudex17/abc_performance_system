const pool =  require('../../config/db')
const { validationResult } = require('express-validator')


exports.fetchDepartments = async (req, res, next) => {

    
    // const connection =  await pool.getConnection()

    const departmentId = req.params.department_id

    const departmentStatus = req.query.department_status

    if(departmentId){
         const [result] = await pool.execute(
        `SELECT *  FROM departments WHERE id=?`, [teamId]
    )
    // connection.release()
      return res.json(result)
    }
    
    if(departmentStatus  && departmentStatus== 1 ){
        const [result] = await pool.execute(
       `SELECT *  FROM departments WHERE status=?`,[departmentStatus]  
   )
       return res.json(result)
   }
   
    const [result] = await pool.execute(
        'SELECT *  FROM `departments`'  
    )
    // connection.release()
    
   return res.json(result)
}


exports.addUpdateDeleteDepartment = async (req, res, next) => {
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
            const { name } = req.body;

            // Check if market with same name (case-insensitive) and active already exists
            const [existing] = await pool.execute(
                `SELECT * FROM departments WHERE LOWER(name) = LOWER(?) AND status = 1`,
                [name]
            );

            if (existing.length > 0) {
                return res.status(400).json({ error: `Department "${name}" already exists and is active.` });
            }

            query = `INSERT INTO departments (name) VALUES (?)`;
            valuesOfQuestionMark = [name];
            successMessage = `New Department: ${name} is created or recorded`;
            errorMessage = `Error inserting new Department`;

        } else if (httpMethd === 'PUT') {
            const { id, name, status } = req.body;

            // Check if this market is dismantled already
            const [rows] = await pool.execute(`SELECT status FROM departments WHERE id = ?`, [id]);

            if (rows.length === 0) {
                return res.status(404).json({ error: `Department with ID ${id} not found.` });
            }

            if (rows[0].status === 0) {
                return res.status(400).json({ error: `Department with ID ${id} is already dismantled and cannot be updated.` });
            }

            query = `UPDATE departments SET name = ?, status = ? WHERE id = ?`;
            valuesOfQuestionMark = [name, status, id];
            successMessage = `Department Name is set to ${name} and status is set to ${status}`;
            errorMessage = `Error in updating Department Record`;

        } else if (httpMethd === 'DELETE') {
            const { department_id } = req.body;
            query = `DELETE FROM departments WHERE id = ?`;
            valuesOfQuestionMark = [department_id];
            successMessage = `Department: ${department_id} is deleted`;
            errorMessage = `Error deleting Department`;
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