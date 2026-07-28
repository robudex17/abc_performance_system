const pool =  require('../config/db')
const { validationResult } = require('express-validator')

exports.createAgentDeduction = async (req, res, next) => {

    // const errors = validationResult(req)

    // if (!errors.isEmpty()) {
    //     return res.status(400).json({ errors: errors.array() });
    // }


    const agentId = req.params.agent_id
   
    const month = req.body.month || req.body.eval_month
    const year = req.body.year || req.body.eval_year

    const evaluation  = req.body.evaluation
    const deduction = req.body.deduction
    const agentDbname = req.body.agent_dbname

    try {
       const query = "INSERT INTO deduction ( agent_id, agent_dbname, month, year, deduction) VALUES (?,?,?,?,?)"
 
        
        
        // const query = "INSERT INTO memo ( agent_id, month, year, description,date) VALUES (?,?,?,?,?)"
        const [result]  = await pool.execute(query, [agentId, agentDbname,month,year, deduction])

        res.status(201).json({
            message: `New Deduction for agent_id: ${agentId} are created`
        })
        
    }catch(error){
        console.error('Error inserting deduction records', error)
        res.status(500).json({error: 'Database Error, Cannot create deduction'})
    }
    
}


exports.updateAgentDeduction = async (req,res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const agentId = req.params.agent_id
    const month = req.body.month
    const year = req.body.year
    const deduction = req.body.deduction
    const agentDbname = req.body.agent_dbname
    const evaluation  = req.body.evaluation

  
    try {
        const query = "UPDATE deduction SET  deduction=?  WHERE month=? AND year=?  AND agent_id=?"
        
        const [result]  = await pool.execute(query, [deduction, month, year, agentId])
        
        if (result.affectedRows === 0){
            return res.status(400).json({message: 'Deduction Record Not Found'})
        }


        res.status(201).json({
            message: `Sales Agent Deduction is updated`
        })
        
    }catch(error){
        console.error('Error Updating Agent Deduction records', error)
        res.status(500).json({error: 'Database Error, Cannot Update Deduction  '})
    }  
}

exports.deleteAgentDeduction = async (req, res, next) => {
   
    const agentId = req.params.agent_id
  
    const evaluation = req.body.evaluation  
    const month = req.body.month || req.body.eval_month
    const year = req.body.year || req.body.eval_year

    try {
       
        const query = "DELETE FROM deduction WHERE  agent_id=? AND month=? AND year=?"
        const [result] = await pool.execute(query, [agentId, month, year]);
  

        if (result.affectedRows === 0){
            return res.status(400).json({message: 'Agent Deduction ID Not found'})
        }

        res.status(200).send({ message: 'Agent Deduction deleted successfully' });
    }
    catch(error) {
        console.error('Error deleting agent deduction:', error)
        res.status(500).json({error: 'Database Error, Cannot Delete Agent Deduction'})
    }
}



