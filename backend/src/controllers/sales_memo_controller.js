const pool =  require('../config/db')
const { validationResult } = require('express-validator')

const { monthMap, monthNames } = require('./helper_scripts/global_variables_and_functions')

exports.createSalesAgentMemo = async (req, res, next) => {

    // const errors = validationResult(req)

    // if (!errors.isEmpty()) {
    //     return res.status(400).json({ errors: errors.array() });
    // }

    console.log(req.body)

    const agentId = req.params.agent_id
    const memoDate  = req.body.date
    const memoDescription = req.body.description 
    const memoMonth = req.body.month
    const memoYear = req.body.year
    
    const evaluation  = req.body.evaluation 
    const totalRecords = Number(req.body.total_records)

    try {
       const query = "INSERT INTO memo ( agent_id, month, year, date, description) VALUES (?,?,?,?,?)"
        const description = `New Agent Memo` 
        
        // if the input is came from the sales evaluation 
        if(evaluation && totalRecords > 0){
            for (let i = 0; i < totalRecords; i++) {
                await pool.execute(query, [
                    agentId,
                    memoMonth,
                    memoYear,
                    memoDate,
                    description,
            
                ]);
            } 
             return   res.status(201).json({
             message: `${totalRecords} memo created for agent_id: ${agentId}`
            });
         
        }        
        // const query = "INSERT INTO memo ( agent_id, month, year, description,date) VALUES (?,?,?,?,?)"
        const [result]  = await pool.execute(query, [agentId, memoMonth,memoYear, memoDescription,memoDate])

        res.status(201).json({
            message: `New memo for agent_id: ${agentId} are created`
        })
        
    }catch(error){
        console.error('Error inserting memo records', error)
        res.status(500).json({error: 'Database Error, Cannot memo'})
    }
    
}

exports.fetchAgentMemo = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
   
    let givenMonth
    let givenYear 
    let fullyear = req.query.fullyear
    const currentDate = new Date()

    const export_to_excel = req.export_to_excel 

 
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

    // const agentId = req.params.agent_id

    let agentId 
    if (req.params.agent_id){
        agentId = req.params.agent_id
    }else{
        agentId = req.query.agent_id
    }

    const connection =  await pool.getConnection()

    if (fullyear == 'true' || fullyear == true){
        const [result] = await connection.execute(
            'SELECT * FROM  `memo` WHERE agent_id=?  AND year=?',[agentId,givenYear]  
        )
        connection.release()
        result.sort((a,b) => {
            return monthNames.indexOf(a.month.charAt(0).toUpperCase() + a.month.slice(1).toLowerCase()) - 
            monthNames.indexOf(b.month.charAt(0).toUpperCase() + b.month.slice(1).toLowerCase());
        })

        if(export_to_excel){
            req.agent_memo = result
            next()
        }else{
            res.json(result)
        }
       
    }else {
        const [result] = await connection.execute(
            'SELECT * FROM  `memo` WHERE agent_id=? AND month=? AND year=?',[agentId,givenMonth,givenYear]  
        )
        connection.release()
        if(export_to_excel){
            req.agent_memo = result
            next()
        }else{
            res.json(result)  
        }
            
    }
    
}

exports.updateAgentMemo = async (req,res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const agentId = req.params.agent_id
    


    const  agentMemoDate = req.body.date 
    const agentMemoDescription = req.body.description
    const memoId = req.body.id 
    const memoMonth = req.body.month 
    const memoYear = req.body.year

  
    try {
        const query = "UPDATE memo SET  description=?, month=?, year=? , date=? WHERE id=? AND agent_id=?"
        
        const [result]  = await pool.execute(query, [agentMemoDescription, memoMonth, memoYear, agentMemoDate, memoId,agentId])
        
        if (result.affectedRows === 0){
            return res.status(400).json({message: 'Memo ID Not Found'})
        }


        res.status(201).json({
            message: `Sales Agent Memo is updated`
        })
        
    }catch(error){
        console.error('Error Updating Agent Memo records', error)
        res.status(500).json({error: 'Database Error, Cannot Update Memo Absence '})
    }  
}

exports.deleteAgentMemo = async (req, res, next) => {
    const { agent_id } = req.params 
    const  memoId = req.body.id
 

    const evaluation = req.body.evaluation  
    const totalRecords = Number(req.body.total_records)
    const month = req.body.month
    const year = req.body.year


    try {
       if(evaluation && totalRecords > 0){
            for (let i = 0; i < totalRecords; i++) {
            await pool.execute(
                `DELETE FROM memo WHERE agent_id=? AND month=? AND year=? LIMIT 1`,
                [agent_id, month, year]
            );
            }
            return res.status(200).json({
            message: `${totalRecords} memo deleted for agent_id: ${agent_id}`
        });

       }       
        const query = "DELETE FROM memo WHERE id=? AND agent_id=?"
        const [result] = await pool.execute(query, [memoId, agent_id])

        if (result.affectedRows === 0){
            return res.status(400).json({message: 'Agent Memo ID Not found'})
        }

        res.status(200).send({ message: 'Agent Memo deleted successfully' });
    }
    catch(error) {
        console.error('Error deleting agent memo:', error)
        res.status(500).json({error: 'Database Error, Cannot Delete Agent Memo'})
    }
}



