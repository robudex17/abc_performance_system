const pool =  require('../config/db')


exports.fetchManager = async (req, res, next) => {


    const connection =  await pool.getConnection()

    const [result] = await connection.execute(
    `SELECT 
        sa.id AS manager_id,
        sa.db_name AS manager_name,
        aa.agent_type
     FROM sales_agents2 sa
     JOIN agent_employments ae 
        ON ae.agent_id = sa.id 
       AND ae.status = 'Hired'
     JOIN agent_assignments aa 
        ON aa.agent_id = sa.id
       AND aa.id = (
          SELECT MAX(id) 
          FROM agent_assignments 
          WHERE agent_id = sa.id
       )
     WHERE aa.agent_type IN (1, 2)`
  );
    
    connection.release()
    res.json(result)
}


