const e = require('express');
const pool = require('../../config/db')
const { validationResult } = require('express-validator')


exports.addAgentEmailResponsesCount = async (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
  
   const { avg_response_minutes } = req.body
   const employee_id = req.params.employee_id
   let year_month 

  if(!req.query.year_month){
        const currentDate = new Date()
        const currentYear = currentDate.getFullYear()
        const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0')
        year_month = `${currentYear}-${currentMonth}`
    }else{
        year_month = req.query.year_month
    }

        // ✅ Validate input
    if (!/^\d{4}-\d{2}$/.test(year_month)) {
    return res.status(400).json({
        message: 'Invalid year_month format. Expected YYYY-MM'
    });
    }


    
    try {
       
        const [result]  = await pool.execute("INSERT INTO average_email_response_time(`avg_response_minutes`,`year_month`,`employee_id`) VALUES (?,?,?)", [avg_response_minutes, year_month, employee_id])

        res.status(201).json({
            message: `New Average Email Response Time for employee_id: ${employee_id} are created or recorded`
        })
        console.log(result)
        return
        
    }catch(error){
        console.error('Error inserting new Average Email Response Time records', error)
        res.status(500).json({error: 'Database Error, Cannot Set New Average Email Response Time'})
    }  


 }




exports.fetchAgentEmailResponsesCount = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  

    const export_to_excel = req.export_to_excel
    const employee_id = req.params.employee_id

    let year_month  

    if(!req.query.year_month){
        const currentDate = new Date()
        const currentYear = currentDate.getFullYear()
        const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0')
        year_month = `${currentYear}-${currentMonth}`
    }else{
        year_month = req.query.year_month
    }

        // ✅ Validate input
    if (!/^\d{4}-\d{2}$/.test(year_month)) {
    return res.status(400).json({
        message: 'Invalid year_month format. Expected YYYY-MM'
    });
    }

 
   
   
    try {
       
        const [agentEmailResponseTimeResults] = await pool.execute(
        `
            SELECT 
                e.id,
                e.firstname,
                e.lastname,
                e.db_name,
                e.email,
                e.image_link,

                -- ✅ Position
                p.position_name,
                p.id AS position_id,
                p.level AS position_level,

                -- ✅ Manager
                ea.manager_id,
                mgr.db_name AS manager_dbname,

                -- ✅ Org
                m.id AS market_id,
                m.name AS market_name,
                t.id AS team_id,
                t.name AS team_name,

                -- ✅ Employment
                ee.status AS employee_status,

                -- ✅ Evaluation
                COALESCE(csd.submitted, 0) AS submitted,

                -- ✅ Metric
                aert.avg_response_minutes AS avg_response_minutes

            FROM employees e

            -- ✅ Latest Assignment Snapshot
            JOIN (
                SELECT ea1.*
                FROM employee_assignments ea1
                JOIN (
                    SELECT employee_id, MAX(id) AS latest_id
                    FROM employee_assignments
                    WHERE DATE_FORMAT(effective_from, '%Y-%m') <= ?
                    AND (effective_to IS NULL OR DATE_FORMAT(effective_to, '%Y-%m') >= ?)
                    GROUP BY employee_id
                ) ea2
                ON ea1.employee_id = ea2.employee_id
                AND ea1.id = ea2.latest_id
            ) ea ON e.id = ea.employee_id

            -- ✅ Latest Employment Snapshot
            JOIN (
                SELECT ee1.*
                FROM employee_employments ee1
                JOIN (
                    SELECT employee_id, MAX(id) AS latest_id
                    FROM employee_employments
                    WHERE DATE_FORMAT(start_date, '%Y-%m') <= ?
                    AND (end_date IS NULL OR DATE_FORMAT(end_date, '%Y-%m') >= ?)
                    GROUP BY employee_id
                ) ee2
                ON ee1.employee_id = ee2.employee_id
                AND ee1.id = ee2.latest_id
            ) ee ON e.id = ee.employee_id

            -- ✅ Position
            LEFT JOIN positions p ON ea.position_id = p.id

            -- ✅ Manager
            LEFT JOIN employees mgr ON ea.manager_id = mgr.id

            -- ✅ Org Structure
            LEFT JOIN markets m ON ea.market_id = m.id
            LEFT JOIN teams2 t ON ea.team_id = t.id

            -- ✅ Evaluation Status
            LEFT JOIN (
                SELECT employee_id, submitted
                FROM csd_evaluation_status
                WHERE year_month = ?
            ) csd ON csd.employee_id = e.id

            -- ✅ Metric (Email Response Time)
            LEFT JOIN (
                SELECT employee_id, avg_response_minutes
                FROM average_email_response_time
                WHERE year_month = ?
            ) aert ON aert.employee_id = e.id

            WHERE e.id = ?
        `,
        [
        year_month, year_month,   // assignment snapshot
        year_month, year_month,   // employment snapshot
        year_month,             // csd
        year_month,             // metric
        employee_id
        ]
        );


      //GET THE EQUIVALENT POINTS AND THE PERCENTAGE (15/15) AGENT/TL OR TIME 1.5 

        const  [avgEmailResponseTimeScore] =  await pool.execute(
            'SELECT min_value, max_value, score FROM  average_email_response_time_score'
        )
        
        for ( const agentEmailResponseTimeResult of agentEmailResponseTimeResults){
            if(!agentEmailResponseTimeResult['average_email_response_time']){
                agentEmailResponseTimeResult['equivalent_points'] = null
                agentEmailResponseTimeResult['equivalent_points'] = null
                agentEmailResponseTimeResult['equivalent_points_percentage'] = null
            }else{
                agentEmailResponseTimeResult['equivalent_points'] = avgEmailResponseTimeScore.find(score => {
                    agentEmailResponseTimeResult['average_email_response_time'] >= score.min_value &&
                    agentEmailResponseTimeResult['average_email_response_time'] <= score.max_value
                })

                agentEmailResponseTimeResult['equivalent_points_percentage'] = agentEmailResponseTimeResult['equivalent_points'] * 1.5
            }


        }

        res.status(200).json(agentEmailResponseTimeResults)
        
     

    }catch(error){
        console.error('Error fetching Agent Email Response Time records', error)
        res.status(500).json({error: 'Database Error, Cannot Fetch Agent Email Response Time'})
    }      
          


}

exports.updateAgentEmailResponsesCount = async (req,res, io) => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }


    const employee_id = req.params.employee_id
    const {avg_response_minutes} = req.body

        let year_month  

        if(!req.query.year_month){
            const currentDate = new Date()
            const currentYear = currentDate.getFullYear()
            const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0')
            year_month = `${currentYear}-${currentMonth}`
        }else{
            year_month = req.query.year_month
        }

            // ✅ Validate input
        if (!/^\d{4}-\d{2}$/.test(year_month)) {
        return res.status(400).json({
            message: 'Invalid year_month format. Expected YYYY-MM'
        });
        }

    

    try {
      
        
        const [result]  = await pool.execute("UPDATE average_email_response_time SET avg_response_minutes = ? WHERE employee_id = ? AND \`year_month\` = ?", [avg_response_minutes, employee_id, year_month])
        
        if (result.affectedRows === 0){
            return res.status(400).json({message: 'Agent Email Response Time Not Found'})
        }

        
 

        res.status(201).json({
            message: ` Agent Email Response Time is updated`
        })
        
    }catch(error){
        console.error('Error Updating Agent Email Response Time records', error)
        res.status(500).json({error: 'Database Error, Cannot Update Agent Email Response Time '})
    }  
}

exports.deleteAgentEmailResponsesCount = async (req, res, next) => {
    
    const employee_id = req.params.employee_id
    const { year_month } = req.query

  

    try {
        const query = "DELETE FROM average_email_response_time WHERE employee_id=? AND year_month=?"
        const [result] = await pool.execute(query, [employee_id, year_month])

        if (result.affectedRows === 0){
            return res.status(400).json({message: 'Agent Email Response Time Not found'})
        }

        res.status(200).send({ message: 'Agent Email Response Time deleted successfully' });
    }
    catch(error) {
        console.error('Error deleting agent email response time:', error)
        res.status(500).json({error: 'Database Error, Cannot Delete Agent Email Response Time'})
    }
}