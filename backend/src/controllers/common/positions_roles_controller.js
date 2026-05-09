const pool =  require('../../config/db')
const { validationResult } = require('express-validator')

 const tables = {
        'positions': 'positions',
        'roles': 'roles'
    }


exports.fetchPositionsRoles = async (req, res, next) => {

    
    // const connection =  await pool.getConnection()

    const id = req.params.id
    const type = req.query.type   

    if(id){
         const [result] = await pool.execute(
        `SELECT * FROM ${tables[type]} WHERE id = ?`, [id]
    )
    // connection.release()
      return res.json(result)


    }


    switch (type) {
        case 'roles':
            if(req.user.role == 'admin'  || req.user.role == 'poweruser' ){
                const [result] = await pool.execute(
                    `SELECT * FROM ${tables[type]}`
                )
                return res.json(result)
            }else {
                const [result] = await pool.execute(
                    `SELECT * FROM ${tables[type]} WHERE name NOT IN ('admin', 'poweruser')`
                )
                return res.json(result)
            }
            break;
        default:
            const [result] = await pool.execute(
                `SELECT * FROM ${tables[type]}`
            )
            return res.json(result)    

    }
    
}


exports.addUpdateDeletePositionRoles = async (req, res, next) => {
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
            const { name, id, level, type } = req.body;
            

            // Check if market with same name (case-insensitive) and active already exists
            const [existing] = await pool.execute(
                `SELECT * FROM ${tables[type]} WHERE LOWER(name) = LOWER(?) `,
                [name]
            );

            if (existing.length > 0) {
                return res.status(400).json({ error: `This ${name} already exists. in this ${tables[type]} table` });
            }

            if (type === 'positions') {
                query = `INSERT INTO positions (name, level) VALUES (?, ?)`;
                valuesOfQuestionMark = [name, level];
                successMessage = `New Position: ${name} is created or recorded`;
                errorMessage = `Error inserting new Position`;
            }else if (type === 'roles') {
                query = `INSERT INTO roles (id,name) VALUES (?, ?)`;
                valuesOfQuestionMark = [id, name];
                successMessage = `New Role: ${name} is created or recorded`;
                errorMessage = `Error inserting new Role`;
            }
 
          

        } else if (httpMethd === 'PUT') {
            const {  id, name, level, type } = req.body;

            // Check if this if exists
            const [rows] = await pool.execute(`SELECT * FROM ${tables[type]} WHERE id = ?`, [id]);

            if (rows.length === 0) {
                return res.status(404).json({ error: `The ${tables[type]} with ID ${id} not found.` });
            }

  
            if (type === 'positions') {
                query = `UPDATE positions SET name = ?, level = ? WHERE id = ?`;
                valuesOfQuestionMark = [name, level, id];
                successMessage = `Position Name is set to ${name} and level is set to ${level}`;
                errorMessage = `Error in updating Position Record`;
            }else if (type === 'roles') {
                query = `UPDATE roles SET name = ? WHERE id = ?`;
                valuesOfQuestionMark = [name, id];
                successMessage = `Role Name is set to ${name}`;
                errorMessage = `Error in updating Role Record`;
            }
  

        } else if (httpMethd === 'DELETE') {
            const { id } = req.body;
            query = `DELETE FROM ${tables[type]} WHERE id = ? `;
            valuesOfQuestionMark = [id];
            successMessage = `The ${tables[type]} with ID ${id} is deleted`;
            errorMessage = `Error deleting ${tables[type]}`;
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