//const { agent } = require('supertest');
const  pool = require('../config/db')

const { validationResult } = require('express-validator')

const { monthMap, monthNames } = require('./helper_scripts/global_variables_and_functions')

exports.getEvaluationSalesData = async ( givenMonth,givenYear) => {


 // Convert "March" -> "03"
    const monthNumber = monthMap[givenMonth];
    if (!monthNumber) {
      return res.status(400).json({ error: "Invalid givenMonth format" });
    }


   const snapshot = `${givenYear}-${monthNumber.toString().padStart(2, '0')}`;


   let salesEvalulationMasterQuery = 

  `
      SELECT 
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
                COALESCE(ts.target, 0) AS target,
                COALESCE(ts.ship_ok, 0) AS shipok,
                COALESCE(nd.total_deposit_count, 0) AS total_new_deposit,
                COALESCE(ab.total_absences_count, 0) AS total_absences,
                COALESCE(td.total_tardiness_count, 0) AS total_tardiness,
                COALESCE(mm.total_memo_count, 0) AS total_memo,
                COALESCE(fba.feedback, 0) AS feedback_admin,
                COALESCE(fbq.feedback_score, 0) AS feedback_qa,
                COALESCE(ded.deduction, 0) AS deduction
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

            LEFT JOIN target_shipok ts 
                ON ts.agent_id = sa.id 
                AND ts.month = ?
                AND ts.year = ?
              LEFT JOIN (
                  SELECT agent_id, year, month, COUNT(*) AS total_deposit_count
                  FROM new_deposit
                  GROUP BY agent_id, year, month
              ) nd ON nd.agent_id = sa.id 
              AND nd.month =?
              AND nd.year = ?
              LEFT JOIN (
                  SELECT agent_id, year, month, COUNT(*) AS total_absences_count
                  FROM absences
                  GROUP BY agent_id, year, month
              ) ab ON ab.agent_id = sa.id 
                AND ab.month =?
                AND ab.year = ?
              LEFT JOIN (
                  SELECT agent_id, year, month, COUNT(*) AS total_tardiness_count
                  FROM tardiness
                  GROUP BY agent_id, year, month
              ) td ON td.agent_id = sa.id 
                AND td.month =?
                AND td.year =?
              LEFT JOIN (
                  SELECT agent_id, year, month, COUNT(*) AS total_memo_count
                  FROM memo
                  GROUP BY agent_id, year, month
              ) mm ON mm.agent_id = sa.id 
                AND mm.month =?
                AND mm.year =? 
              LEFT JOIN feedback fba
                ON sa.id = fba.agent_id
                AND fba.month = ?
                AND fba.year = ?
            LEFT JOIN feedback_by_qa fbq
                  ON sa.id = fbq.agent_id
                  AND fbq.month = ?
                  AND fbq.year = ?  
            LEFT JOIN deduction ded 
                  ON sa.id = ded.agent_id
                  AND ded.month = ?
                  AND ded.year = ?                  

  `


    const [sales_agents_result] = await pool.execute(salesEvalulationMasterQuery, [ 
      givenMonth, givenYear, snapshot, snapshot, snapshot, snapshot, snapshot, snapshot,
      givenMonth, givenYear,givenMonth, givenYear,
      givenMonth, givenYear,givenMonth, givenYear,
      givenMonth, givenYear,givenMonth, givenYear,
      givenMonth, givenYear,givenMonth, givenYear,
      givenMonth, givenYear,
   ])

  sales_agents = sales_agents_result

  sales_agents.sort((a, b) => b.agent_type - a.agent_type)

      // Step 1: calculate totals for non-type-2 agents
  const totalTarget = sales_agents
        .filter(agent => agent.agent_type !== 2)
        .reduce((sum, agent) => sum + (Number(agent.target) || 0), 0)

  const totalShipOk = sales_agents
        .filter(agent => agent.agent_type !== 2)
        .reduce((sum, agent) => sum + (Number(agent.shipok) || 0), 0)

    // const totalNewDeposit= sales_agents
    //     .filter(agent => agent.agent_type !== 2)
    //     .reduce((sum, agent) => sum + (Number(agent.total_new_deposit) || 0), 0)

      // Step 2: update type-2 agents
  sales_agents.forEach(agent => {
        if (agent.agent_type === 2) {
          agent.target = totalTarget
          agent.shipok = totalShipOk
          agent.total_new_deposit = 0
        }
      })

  //return sales_agents 

  //attempting to add the feedback of each agents 

    // helper to run query safely
    async function runQuery(query, params, errorMsg) {
      try {
        const [result] = await pool.execute(query, params);
        return result;
      } catch (error) {
        console.error(errorMsg, error);
        return [];
      }
    }

    for (const agent of sales_agents) {
      const managerId = agent.manager_id; // ✅ avoid extra query

      if (agent.agent_type === 0) {
        agent.feedback_by_um = null;
        agent.feedback_by_agents = null;

        agent.ave_feedback_by_um = null;
        agent.ave_feedback_by_agents = null;




        const query = `
      
            SELECT 
                sa.id AS who_give_feedback_id,
                sa.firstname,
                sa.lastname,
                sa.db_name AS who_give_feedback_name,
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
                COALESCE(fbalm.feedback_score, 0) AS feedback_score,
                COALESCE(fbalm.responses, "{}") AS responses,
                COALESCE( fbalm.month, ?) AS month,
                COALESCE(fbalm.year, ?) AS  year,
                fbalm.agent_id AS who_receive_feedback_id,
                fbalm.agent_dbname,
                fbalm.can_update  
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
                ) aa2 ON aa1.agent_id = aa2.agent_id 
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
                ) ae2 ON ae1.agent_id = ae2.agent_id 
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
            LEFT JOIN feedback_agents_by_lm fbalm
              ON sa.id = fbalm.lm_id
            AND fbalm.month = ?
            AND fbalm.year = ?
            AND fbalm.agent_id = ?
            WHERE sa.id = ? 
            ORDER BY fbalm.year DESC, fbalm.month DESC


          
        `;

        agent.feedback_by_lm = await runQuery(
          query,
          [givenMonth, givenYear,snapshot, snapshot, snapshot, snapshot, snapshot, snapshot,
            
            givenMonth, givenYear, agent.id, managerId],
          "Error, Cannot Fetch Feedback by LM"
        );




      } else if (agent.agent_type === 1) {
        agent.feedback_by_lm = null;

        const query_by_agents = `

          SELECT 
              sa.id AS who_give_feedback_id,
              sa.firstname,
              sa.lastname,
              sa.db_name AS who_give_feedback_name,
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
              ae.status AS employee_status,   -- ✅ always latest status
              COALESCE(fba.feedback_score, 0) AS feedback_score,
              COALESCE(fba.responses, "{}") AS responses,
              COALESCE(fba.month, ?)  AS month,  -- ✅ fallback to param if NULL
              COALESCE(fba.year,  ?)  AS year,   -- ✅ fallback to param if NULL
              fba.percentage,
              fba.total_score,
              fba.lm_id AS who_receive_feedback_id,
              fba.can_update 
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
              ) aa2 ON aa1.agent_id = aa2.agent_id 
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
              ) ae2 ON ae1.agent_id = ae2.agent_id 
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
          LEFT JOIN feedback_lm_by_agents fba 
            ON sa.id = fba.agent_id
          AND aa.manager_id = fba.lm_id
          AND fba.month = ?
          AND fba.year = ?
          WHERE aa.manager_id = ?
          ORDER BY fba.year ASC, LPAD(fba.month, 2, '0') ASC;

        `
        const query_by_um = `


          SELECT 
              sa.id AS who_give_feedback_id,
              sa.firstname,
              sa.lastname,
              sa.db_name AS who_give_feedback_name,
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
              COALESCE(fblmum.feedback_score, 0) AS feedback_score,
              COALESCE(fblmum.responses, "{}") AS responses,
              COALESCE(fblmum.month, ?)  AS month,
              COALESCE(fblmum.year, ?)  AS year,
              fblmum.total_score,
              fblmum.percentage,
              fblmum.lm_id AS who_receive_feedback_id,
              fblmum.lm_dbname,
              fblmum.can_update
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
              ) aa2 ON aa1.agent_id = aa2.agent_id 
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
              ) ae2 ON ae1.agent_id = ae2.agent_id 
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
          LEFT JOIN feedback_lm_by_um fblmum
            ON sa.id = fblmum.manager_id
          AND fblmum.month = ?
          AND fblmum.year = ?
          AND fblmum.lm_id = ?
          WHERE sa.id = ? 
          ORDER BY fblmum.year, fblmum.month
        

        `;

        // ✅ run both queries in parallel
        const [result_by_agents, result_by_um] = await Promise.all([
          runQuery(query_by_agents, [givenMonth, givenYear, snapshot, snapshot, snapshot,snapshot, snapshot,snapshot,  givenMonth, givenYear, agent.id], "Error feedback by agents"),
          runQuery(query_by_um, [givenMonth, givenYear,  snapshot, snapshot, snapshot, snapshot, snapshot, snapshot, givenMonth, givenYear, agent.id, managerId], "Error feedback by um")
        ]);

        agent.feedback_by_agents = result_by_agents;
        agent.feedback_by_um = result_by_um;



      } else if (agent.agent_type === 2) {
        agent.feedback_by_agents = null;
        agent.feedback_by_um = null;

        const query_by_lm = `

              SELECT 
              sa.id AS who_give_feedback_id,
              sa.firstname,
              sa.lastname,
              sa.db_name AS who_give_feedback_name,
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
              COALESCE(fbumlm.feedback_score, 0) AS feedback_score,
              COALESCE(fbumlm.responses, '{}') AS responses,
              COALESCE(fbumlm.month, ?)  AS month,
              COALESCE(fbumlm.year, ?)  AS year,
              fbumlm.total_score,
              fbumlm.percentage,
              fbumlm.um_id AS who_receive_feedback_id,
              fbumlm.can_update
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
              ) aa2 ON aa1.agent_id = aa2.agent_id 
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
              ) ae2 ON ae1.agent_id = ae2.agent_id 
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

          LEFT JOIN feedback_um_by_lm fbumlm
            ON sa.id = fbumlm.lm_id
          AND aa.manager_id = fbumlm.um_id
          AND fbumlm.month = ?
          AND fbumlm.year = ?
          WHERE aa.manager_id = ? 
            AND sa.id != 2394 
          ORDER BY fbumlm.year, fbumlm.month


        `;

        agent.feedback_by_lm = await runQuery(
          query_by_lm,
          [givenMonth, givenYear, snapshot, snapshot, snapshot, snapshot, snapshot, snapshot,givenMonth, givenYear, agent.id],
          "Error, Cannot Fetch Feedback by LM"
        );
      }

            // --- compute averages with 4 decimals ---
      const computeAverage = (feedbackList) => {
        if (!feedbackList || feedbackList.length === 0) return null
      
        let feedbackListwithFeedbackScore = feedbackList.filter(agent => agent.feedback_score != 0)
        
        const total = feedbackList.reduce((sum, fb) => sum + (Number(fb.feedback_score) || 0), 0)
      
        const avg = total/feedbackListwithFeedbackScore.length || 0
        return avg.toFixed(4)   // number with 4 decimal places
      }

      agent.ave_feedback_by_agents = computeAverage(agent.feedback_by_agents) 
      agent.ave_feedback_by_um = computeAverage(agent.feedback_by_um) 
      agent.ave_feedback_by_lm = computeAverage(agent.feedback_by_lm) 


        let feedbackArrays = []

        if (agent.agent_type === 0) {
          feedbackArrays = [agent.feedback_by_lm]
        } else if (agent.agent_type === 1) {
          feedbackArrays = [agent.feedback_by_agents, agent.feedback_by_um]
        } else if (agent.agent_type === 2) {
          feedbackArrays = [agent.feedback_by_lm]
        }

        // Filter only valid arrays with objects having feedback_score
        const validFeedbacks = feedbackArrays.filter(
          fb => Array.isArray(fb) && fb.some(item => item && 'feedback_score' in item)
        )

        let isReady = false

        if (validFeedbacks.length > 0) {
          const combined = validFeedbacks.flat()

          // Check if all feedback_score > 0
          isReady = combined.some(
            fb => fb && 'feedback_score' in fb && Number(fb.feedback_score) > 0
          )
        }

      // ready to submit  if atleast there is a quality assurance feedback
        if (Number(agent.feedback_qa) > 0) {
          isReady = true
        }

        // Final override: if feedback_admin > 0 → ready_to_submit = true
        if (Number(agent.feedback_admin) > 0) {
          isReady = true
        } 



        agent.ready_to_submit = isReady
    }

      return sales_agents
 
}
exports.fetchSalesEvaluationData= async (req, res, next) => {
    //check if there is a month and year in the query string
    // if there is no query string set month to the latest month
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    

    let givenMonth
    let givenYear 
   
    const currentDate = new Date()
    if (!req.query.month ||  req.query.month ==="") {
        
        givenMonth =  monthNames[currentDate.getMonth()]; // getMonth() returns 0-based index
    }else {
        givenMonth = req.query.month
    }
    
    if(!req.query.year || req.query.year ===""){
        givenYear =  currentDate.getFullYear()
    }else {
        givenYear = req.query.year
    }

    

    try {

      const result =   await this.getEvaluationSalesData(givenMonth, givenYear)

      // console.log(result)
      res.status(200).json(result)
      
  
    }
    catch(error){
        console.error('Error, Cannot Fetch Sales Evaluation', error)
        res.status(500).json({error: 'Error, Cannot Fetch Agent sales_leaderboard'})

   }
  //  finally {
  //    connection.release()
  //  }

}
//This is for submitting the sales evaluation  
exports.addSalesEvaluationData= async (req, res, next) => {

  const agent_id  = req.params.agent_id 

  if (agent_id === 'all') {
     // delete all records first base on month and year
     // then insert new records
      const payload = req.body; // array of agents

    
      
      if (!Array.isArray(payload) || payload.length === 0) {
        return res.status(400).json({ error: "Invalid payload" });
      }

        // Get month and year from the first item
       const { month, year } = payload[0];
      try {
          // 1. Delete existing rows for that month & year
          await pool.query(
            `DELETE FROM sales_evaluation_status WHERE month = ? AND year = ?`,
            [month, year]
          );

          // 2. Prepare new values for bulk insert
          const values = payload.map(agent => [
            agent.agent_id,
            agent.agent_dbname,
            agent.month,
            agent.year,
            agent.date,
            agent.submitted
          ]);

          // 3. Insert all in one query
          const [result] = await pool.query(
            `INSERT INTO sales_evaluation_status 
              (agent_id, agent_dbname, month, year, date, submitted) 
            VALUES ?`,
            [values]
          );

          res.json({
            success: true,
            deletedOld: true,
            inserted: result.affectedRows
          });
        } catch (error) {
          console.error("Error in submit-all:", error);
          res.status(500).json({ error: "Database operation failed" });
        }

  }else{
    // insert new record base on month and year
    const {agent_dbname, month, year, date, submitted } = req.body

 

    try {
      const [result] = await pool.execute(
        `INSERT INTO sales_evaluation_status (agent_id, agent_dbname, month, year, date, submitted)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE submitted = VALUES(submitted)`,
        [agent_id, agent_dbname, month, year, date, submitted]
      );
              res.status(201).json({
            message: `Evaluation for agent_id: ${agent_id} are created or recorded`
        });
    } catch (error) {
      console.error('Error inserting sales evaluation data:', error);
      res.status(500).json({ error: 'Error inserting sales evaluation data' });
    }
  }
}

//This is for reviewing the sales evaluation 
exports.deleteSalesEvaluationData = async (req, res, next) => {

 
    
   const agent_id  = req.params.agent_id 
   const { month, year } = req.body
   
   let successMessage
   if(agent_id == 'all'){
    successMessage = `Sales Evaluation Data for all agents are marked for review`
   }else{
    successMessage = `Sales Evaluation Data for ${agent_id} is marked for review`
   }
  

    try {
        if(agent_id == 'all'){
            const query = "DELETE FROM sales_evaluation_status WHERE  month=? AND year=?"
            const [result] = await pool.execute(query, [ month, year])
            return res.status(200).send({ message: successMessage });
    
        }
        const query = "DELETE FROM sales_evaluation_status WHERE agent_id=? AND month=? AND year=? "
        const [result] = await pool.execute(query, [agent_id, month, year])

        if (result.affectedRows === 0){
            return res.status(400).json({message: 'Agent Target Not found'})
        }

        res.status(200).send({ message:  successMessage });
    }
    catch(error) {
        console.error('Error marked for review:', error)
        res.status(500).json({error: 'Database Error, Cannot marked for review'})
    }
}







