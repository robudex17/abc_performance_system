const pool = require('../config/db')
const { validationResult } = require('express-validator')

const { monthMap, monthNames } = require('./helper_scripts/global_variables_and_functions')

exports.recordNewTardiness = async (req,res, next) => {
    // const errors = validationResult(req)

    // if (!errors.isEmpty()) {
    //     return res.status(400).json({ errors: errors.array() });
    // }
  
    
    const agentId = req.params.agent_id
    const tardinessDate = req.body.date 
    const tardinessDescription = req.body.description
    const tardinessMonth = req.body.month
    const tardinessYear = req.body.year

    const evaluation  = req.body.evaluation 
    const totalRecords = Number(req.body.total_records)
 
    
    try {
       const query = "INSERT INTO tardiness ( agent_id, month, year, date, description) VALUES (?,?,?,?,?)"
        const description = `New Agent Tardiness` 
        
        // if the input is came from the sales evaluation 
        if(evaluation && totalRecords > 0){
            for (let i = 0; i < totalRecords; i++) {
                await pool.execute(query, [
                    agentId,
                    tardinessMonth,
                    tardinessYear,
                    tardinessDate,
                    description,
            
                ]);
            } 
             return   res.status(201).json({
             message: `${totalRecords} tardiness created for agent_id: ${agentId}`
            });
         
        }        
        // const query = "INSERT INTO tardiness ( agent_id, month, year, date, description) VALUES (?,?,?,?,?)"
        const [result]  = await pool.execute(query, [agentId,tardinessMonth,tardinessYear, tardinessDate,tardinessDescription ])

        res.status(201).json({
            message: `New Tardiness for agent_id: ${agentId} are created or recorded`
        })
        
    }catch(error){
        console.error('Error inserting Tardiness records', error)
        res.status(500).json({error: 'Database Error, Cannot Create Tardiness Records'})
    }  


}

exports.fetchAgentTardiness = async (req, res, next) => {

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

    if(req.params.agent_id){
        agentId = req.params.agent_id
    }else{
        agentId = req.query.agent_id
    }

    // const connection =  await pool.getConnection()
    if(fullyear == 'true' || fullyear == true){
        const [result] = await pool.execute(
            'SELECT * FROM  `tardiness` WHERE agent_id=?  AND year=?',[agentId,givenYear]  
        )
        // connection.release()
        result.sort((a,b) => {
            return monthNames.indexOf(a.month.charAt(0).toUpperCase() + a.month.slice(1).toLowerCase()) - 
            monthNames.indexOf(b.month.charAt(0).toUpperCase() + b.month.slice(1).toLowerCase());
        })
        if(export_to_excel){
            req.agent_tardiness = result
            next()
        }else{
            res.json(result)
        }
        
    }else{
        const [result] = await pool.execute(
            'SELECT * FROM  `tardiness` WHERE agent_id=? AND month=? AND year=?',[agentId,givenMonth,givenYear]  
        )
        if(export_to_excel){
            req.agent_tardiness = result
            next()
        }else{
            res.json(result)
        }
       
    }
   
}

exports.updateAgentTardiness = async (req,res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
   
   
    const agentId = req.params.agent_id
    

    const  agentTardinessDate = req.body.date 
    const agentTardinessDescription = req.body.description
    const tardinessMonth = req.body.month 
    const tardinessYear = req.body.year 
    const tardinessId = req.body.id


    try {
        const query = "UPDATE tardiness SET  description=?, date=? , month=? , year=? WHERE id=? AND agent_id=?"
        
        const [result]  = await pool.execute(query, [agentTardinessDescription, agentTardinessDate, tardinessMonth, tardinessYear, tardinessId,agentId])
        
        if (result.affectedRows === 0){
            return res.status(400).json({message: 'Tardiness ID Not Found'})
        }


        res.status(201).json({
            message: `Sales Agent Tardiness is updated`
        })
        
    }catch(error){
        console.error('Error Updating Agent Tardiness records', error)
        res.status(500).json({error: 'Database Error, Cannot Update Agent Tardiness '})
    }  
}

exports.deleteAgentTardiness = async (req, res, next) => {
    const  agentId = req.params.agent_id 
    const  tardinessId = req.body.id


    const evaluation = req.body.evaluation  
    const totalRecords = Number(req.body.total_records)
    const month = req.body.month
    const year = req.body.year

    try {

       if(evaluation && totalRecords > 0){
            for (let i = 0; i < totalRecords; i++) {
            await pool.execute(
                `DELETE FROM tardiness WHERE agent_id=? AND month=? AND year=? LIMIT 1`,
                [agentId, month, year]
            );
            }
            return res.status(200).json({
            message: `${totalRecords} tardiness deleted for agent_id: ${agentId}`
        });

       }          
        const query = "DELETE FROM tardiness WHERE id=? AND agent_id=?"
        const [result] = await pool.execute(query, [tardinessId, agentId])

        if (result.affectedRows === 0){
            return res.status(400).json({message: 'Agent Tardiness ID Not found'})
        }

        res.status(200).send({ message: 'Agent Tardiness deleted successfully' });
    }
    catch(error) {
        console.error('Error deleting agent tardiness:', error)
        res.status(500).json({error: 'Database Error, Cannot Delete Agent Tardiness'})
    }
}
