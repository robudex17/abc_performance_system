const pool  =  require('../config/db')
const { validationResult } = require('express-validator')

const { monthMap, monthNames } = require('./helper_scripts/global_variables_and_functions')

exports.addNewDeposit = async (req, res, next ) => {
   
    // const errors = validationResult(req)

    // if (!errors.isEmpty()) {
    //     return res.status(400).json({ errors: errors.array() });
    // }
   


    const agentId = req.params.agent_id
    const newDeposit =  req.body.new_deposit
    const depositDate = req.body.date
    const depositMonth = req.body.month || req.body.eval_month
    const depositYear = req.body.year  || req.body.eval_year
    const depositDescription = req.body.description
  

    const evaluation  = req.body.evaluation 
    const totalRecords = Number(req.body.total_records)
  
    
    
   
    try {
        const query = "INSERT INTO new_deposit ( agent_id, month, year,new_deposit,description,date) VALUES (?,?,?,?,?,?)"
        const description = "New Deposit for New Customer"
        
        // if the input is came from the sales evaluation 
        if(evaluation && totalRecords > 0){
            for (let i = 0; i < totalRecords; i++) {
                await pool.execute(query, [
                    agentId,
                    depositMonth,
                    depositYear,
                    newDeposit,
                    description,
                    depositDate
                
                ]);
            } 
             return   res.status(201).json({
             message: `${totalRecords} deposits created for agent_id: ${agentId}`
            });
         
        }

        const [result]  = await pool.execute(query, [agentId, depositMonth,depositYear, newDeposit, depositDescription,depositDate ])
        console.log('the result is:', result)
        res.status(201).json({
            message: `New Deposit for agent_id: ${agentId} are created or recorded`
        })
        
    }catch(error){
        console.error('Error inserting new_deposit records', error)
        res.status(500).json({error: 'Database Error, Cannot memo'})
    }  

  

}

exports.fetchAgentNewDeposit = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
   
    let givenMonth
    let givenYear 
    let fullyear = req.query.fullyear
    const export_to_excel = req.export_to_excel
    
    const currentDate = new Date()

    if (!req.query.month ||  req.query.month ==="") {
        

        givenMonth = monthNames[currentDate.getMonth()]; // getMonth() returns 0-based index
    }else {
        givenMonth = req.query.month
    }
    
    if(!req.query.year || req.query.year ===""){
        givenYear = currentDate.getFullYear()
    }else {
        givenYear = req.query.year
    }

    //const agentId = req.params.agent_id

    let agentId 
    if(req.params.agent_id){
        agentId = req.params.agent_id
    }else{
        agentId = req.query.agent_id
    }


   // Convert "March" -> "03"
    const monthNumber = monthMap[givenMonth];
    if (!monthNumber) {
      return res.status(400).json({ error: "Invalid givenMonth format" });
    }


   const snapshot = `${givenYear}-${monthNumber.toString().padStart(2, '0')}`;   

   const connection =  await pool.getConnection()

   if (fullyear === 'true' || fullyear == true){
    const [result] = await connection.execute(
        'SELECT * FROM  `new_deposit` WHERE agent_id=?  AND year=?',[agentId, givenYear]  
    )
      result.sort((a,b) => {
        return monthNames.indexOf(a.month.charAt(0).toUpperCase() + a.month.slice(1).toLowerCase()) - 
        monthNames.indexOf(b.month.charAt(0).toUpperCase() + b.month.slice(1).toLowerCase());
      })
      if(export_to_excel){
        req.agent_new_deposit = result 
        next()
      }else{
        res.json(result)
      }
      
   }else {
    const [result] = await connection.execute(
        // 'SELECT * FROM  `new_deposit` WHERE agent_id=? AND month=? AND year=?',[agentId,givenMonth, givenYear]  

        `    SELECT 
                    sa.id AS id,
                    sa.firstname,
                    sa.lastname,
                    sa.db_name,
                    sa.email,
                    sa.image_link,
                    aa.agent_type,
                    r.role_name AS agent_role,
                    aa.manager_id,
                    mgr.db_name AS manager_dbname,
                    mr.role_name AS manager_role,
                    m.id AS market_id,
                    m.name AS market_name,
                    t.id AS team_id,
                    t.name AS team_name,
                    ae.status AS employee_status,
                    COALESCE(ses.month, ?) AS eval_month,
                    COALESCE(ses.year, ?) AS eval_year,
                    COALESCE(ses.submitted, 0) AS submitted,
                    COALESCE(nd.new_deposit, 0) AS new_deposit,
                    nd.id AS deposit_id,
                    COALESCE(nd.description, '') AS description
                FROM sales_agents2 sa
                JOIN (
                    SELECT aa1.*
                    FROM agent_assignments aa1
                    JOIN (
                        SELECT agent_id, MAX(id) AS latest_id
                        FROM agent_assignments
                        WHERE DATE_FORMAT(effective_from, '%Y-%m') <= ?
                            AND (effective_to IS NULL OR DATE_FORMAT(effective_to, '%Y-%m') >= ?)
                        GROUP BY agent_id
                    ) aa2 
                        ON aa1.agent_id = aa2.agent_id 
                    AND aa1.id = aa2.latest_id
                ) aa ON sa.id = aa.agent_id
                JOIN (
                    SELECT ae1.*
                    FROM agent_employments ae1
                    JOIN (
                        SELECT agent_id, MAX(id) AS latest_id
                        FROM agent_employments
                        WHERE DATE_FORMAT(start_date, '%Y-%m') <= ?
                            AND (end_date IS NULL OR DATE_FORMAT(end_date, '%Y-%m') >= ?)
                        GROUP BY agent_id
                    ) ae2 
                        ON ae1.agent_id = ae2.agent_id 
                    AND ae1.id = ae2.latest_id
                ) ae ON sa.id = ae.agent_id
                LEFT JOIN sales_agent_roles r ON aa.agent_type = r.id
                LEFT JOIN sales_agents2 mgr ON aa.manager_id = mgr.id
                LEFT JOIN agent_assignments maa ON mgr.id = maa.agent_id 
                    AND maa.id = (
                        SELECT MAX(id) 
                        FROM agent_assignments 
                        WHERE agent_id = mgr.id
                        AND DATE_FORMAT(effective_from, '%Y-%m') <= ?
                        AND (effective_to IS NULL OR DATE_FORMAT(effective_to, '%Y-%m') >= ?)
                    )
                LEFT JOIN sales_agent_roles mr ON maa.agent_type = mr.id
                LEFT JOIN markets m ON aa.market_id = m.id
                LEFT JOIN teams t ON aa.team_id = t.id
                LEFT JOIN sales_evaluation_status ses 
                        ON ses.agent_id = sa.id
                        AND ses.month = ?
                        AND ses.year  = ?

                LEFT JOIN new_deposit nd
                    ON nd.agent_id = sa.id 
                    AND nd.month = ?
                    AND nd.year = ?
                WHERE sa.id =? 
           
           `,[givenMonth, givenYear, snapshot, snapshot, snapshot, snapshot, snapshot, snapshot,givenMonth, givenYear, givenMonth, givenYear, agentId]
    )
    if(export_to_excel){
        req.agent_new_deposit = result 

        next()
      }else{
       console.log(result)
        res.json(result)
      }
    
   }
 
    connection.release()
}


exports.updateAgentNewDeposit = async (req, res, next) => {

    // const errors = validationResult(req)

    // if (!errors.isEmpty()) {
    //     return res.status(400).json({ errors: errors.array() });
    // }

    const agentId  = req.params.agent_id

    const depositId = req.body.deposit_id

    const  newDeposit = req.body.new_deposit 
    // const depositDate = req.body.date || 
    const  depositMonth = req.body.month  || req.body.eval_month
    const depositYear = req.body.year || req.body.eval_year
    const depositDescription = req.body.description


 
  

    try {
        const query = "UPDATE new_deposit SET  new_deposit=?,  month=?, year=?, description=? WHERE id=? AND agent_id=? "
        
        const [result]  = await pool.execute(query, [newDeposit,  depositMonth, depositYear, depositDescription, depositId ,agentId, ])
        
        if (result.affectedRows === 0){
            return res.status(400).json({message: 'New Deposit ID Not Found'})
        }


        res.status(201).json({
            message: `Sales Agent New Deposit is updated`
        })
        
    }catch(error){
        console.error('Error Updating Agent New Deposit records', error)
        res.status(500).json({error: 'Database Error, Cannot Update Agent Deposit '})
    }  


}

exports.deleteAgentNewDeposit = async (req, res, next) => {
    
    const agentId = req.params.agent_id 
    const  depositId = req.body.deposit_id

   const evaluation = req.body.evaluation  
   const totalRecords = Number(req.body.total_records)
   const month = req.body.month 
   const year = req.body.year
  
  
    try {
      // if the  came from sales evaluation
      if(evaluation && totalRecords > 0){
            for (let i = 0; i < totalRecords; i++) {
            await pool.execute(
                `DELETE FROM new_deposit WHERE agent_id=? AND month=? AND year=? LIMIT 1`,
                [agentId, month, year]
            );
            }
        return res.status(200).json({
        message: `${totalRecords} deposits deleted for agent_id: ${agentId}`
        });

      }
      
      const query = "DELETE FROM new_deposit WHERE id=? AND agent_id=? "
        const [result] = await pool.execute(query, [depositId, agentId])

        if (result.affectedRows === 0){
            return res.status(400).json({message: 'Agent New Deposit ID Not found'})
        }

        res.status(200).send({ message: 'Agent New Deposit deleted successfully' });
    }
    catch(error) {
        console.error('Error deleting agent new deposit:', error)
        res.status(500).json({error: 'Database Error, Cannot Delete Agent New Deposit'})
    }
}
