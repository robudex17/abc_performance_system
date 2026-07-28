const pool =  require('../config/db')
const { validationResult } = require('express-validator')


exports.fetchTeams = async (req, res, next) => {

    
    // const connection =  await pool.getConnection()

    const teamId = req.params.team_id

    const teamStatus = req.query.team_status

    if(teamId){
         const [result] = await pool.execute(
        `SELECT *  FROM teams WHERE id=?`, [teamId]
    )
    // connection.release()
      return res.json(result)
    }
    
    if(teamStatus && teamStatus== 1 ){
        const [result] = await pool.execute(
       `SELECT *  FROM teams WHERE status=?`,[teamStatus]  
   )
       return res.json(result)
   }
   
    const [result] = await pool.execute(
        'SELECT *  FROM `teams`'  
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
            const { name } = req.body;

            // Check if market with same name (case-insensitive) and active already exists
            const [existing] = await pool.execute(
                `SELECT * FROM teams WHERE LOWER(name) = LOWER(?) AND status = 1`,
                [name]
            );

            if (existing.length > 0) {
                return res.status(400).json({ error: `Team "${name}" already exists and is active.` });
            }

            query = `INSERT INTO teams (name) VALUES (?)`;
            valuesOfQuestionMark = [name];
            successMessage = `New Team: ${name} is created or recorded`;
            errorMessage = `Error inserting new Team`;

        } else if (httpMethd === 'PUT') {
            const { id, name, status } = req.body;

            // Check if this market is dismantled already
            const [rows] = await pool.execute(`SELECT status FROM teams WHERE id = ?`, [id]);

            if (rows.length === 0) {
                return res.status(404).json({ error: `Team with ID ${id} not found.` });
            }

            if (rows[0].status === 0) {
                return res.status(400).json({ error: `Team with ID ${id} is already dismantled and cannot be updated.` });
            }

            query = `UPDATE teams SET name = ?, status = ? WHERE id = ?`;
            valuesOfQuestionMark = [name, status, id];
            successMessage = `Team Name is set to ${name} and status is set to ${status}`;
            errorMessage = `Error in updating Team Record`;

        } else if (httpMethd === 'DELETE') {
            const { teamId } = req.body;
            query = `DELETE FROM teams WHERE id = ?`;
            valuesOfQuestionMark = [teamId];
            successMessage = `Team: ${teamId} is deleted`;
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