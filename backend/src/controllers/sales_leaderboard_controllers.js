// const { agent, agent } = require('supertest');
//const { agent } = require('supertest');
const  pool = require('../config/db')

const { validationResult } = require('express-validator')

const { monthMap, monthNames } = require('./helper_scripts/global_variables_and_functions')

let leaderboardMasterQuery = 

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
              COALESCE(nd.total_deposit_count, 0) AS deposit_score,
              COALESCE(ab.total_absences_count, 0) AS absences,
              COALESCE(td.total_tardiness_count, 0) AS tardiness,
              COALESCE(mm.total_memo_count, 0) AS memo,
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

            LEFT JOIN  deduction AS ded ON ded.agent_id = sa.id
              AND ded.month =?
              AND ded.year =?
`


let leaderboardNewDepositOnlyQuery = 

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
              COALESCE(nd.month, ?) AS month,
              COALESCE(nd.year, ?) AS year,
              COALESCE(nd.total_deposit_count, 0) AS new_deposit_count

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
          LEFT JOIN (
                SELECT agent_id, year, month, COUNT(*) AS total_deposit_count
                FROM new_deposit
                GROUP BY agent_id, year, month
            ) nd ON nd.agent_id = sa.id 
             AND nd.month =?
             AND nd.year = ?

`



exports.getAgentsMetrics = async ( agent_id, givenMonth,givenYear, withTrucks, leaderboardOption,path, leaderboardMasterQuery ) => {
    //CHECK FIRST IF THERE ARE AVAILABLE MONTH AND YEAR ON target_shipok if not return empty array Imediately


  // Ensure month is always 2-digit (e.g., "03")

  
 // Convert "March" -> "03"
    const monthNumber = monthMap[givenMonth];
    if (!monthNumber) {
      return res.status(400).json({ error: "Invalid givenMonth format" });
    }


  const snapshot = `${givenYear}-${monthNumber.toString().padStart(2, '0')}`;


  let sales_agents

  if(leaderboardOption == 'new deposit'){
     const [sales_agents_new_deposit_result] = await pool.execute(leaderboardNewDepositOnlyQuery,[givenMonth, givenYear, snapshot, snapshot, snapshot , snapshot, snapshot, snapshot,
      givenMonth, givenYear
     ])

     

     sales_agents =  sales_agents_new_deposit_result.filter(agent => agent.new_deposit_count > 0).sort((a, b) => b.new_deposit_count - a.new_deposit_count)
                     // Step 1: Get the top final_ratings
     const topRating = Math.max(...sales_agents.map(agent => parseFloat(agent.new_deposit_count)))


    // Step 2: Check how many agents have the same top rating
     const topCount = sales_agents.filter(agent => parseFloat(agent.new_deposit_count) === topRating).length; 

                  // Step 2: Add the tag conditionally based on final_ratings and agent_type
    const sales_agents_with_tags = sales_agents.map(agent => ({
                    ...agent,
                    tag: topCount === 1 && parseFloat(agent.new_deposit_count) === topRating ? 'TOP IN NEW DEPOSITS' : '',
                      
                  }))
                

     return sales_agents_with_tags
  }


  if (agent_id != ""){
    
    const [sales_agents_result] = await pool.execute(
      `${leaderboardMasterQuery} WHERE sa.id=?`,  [   givenMonth, givenYear, snapshot, snapshot, snapshot , snapshot, snapshot, snapshot, 
      givenMonth, givenYear, givenMonth, givenYear, givenMonth, givenYear,
      givenMonth, givenYear, givenMonth, givenYear, givenMonth, givenYear, givenMonth, givenYear, agent_id]  
    )

    leaderboardOption = "single"

    // Return empty array if already resign at specific month and year
    if(sales_agents_result.length ==0){
      return []
    }

    if(sales_agents_result[0].agent_type == 1 ||  sales_agents_result[0].agent_type == 2){
        
        
        const [allAgents] = await pool.execute(

              leaderboardMasterQuery,  [   givenMonth, givenYear, snapshot, snapshot, snapshot , snapshot, snapshot, snapshot, 
              givenMonth, givenYear, givenMonth, givenYear, givenMonth, givenYear,
              givenMonth, givenYear, givenMonth, givenYear, givenMonth, givenYear,givenMonth, givenYear]
        )
        if(sales_agents_result[0].agent_type == 2){
            const resultUm =  sales_agents_result.map(manager =>{

            const totaTarget = allAgents.reduce((sum, a) => sum + (a.target || 0), manager.target || 0)
            const totalShipOk = allAgents.reduce((sum, a) => sum + (a.shipok || 0), manager.shipok || 0)

            return {
              ...manager,
              target: totaTarget,
              shipok: totalShipOk
            }
            })

            sales_agents = resultUm
        }else if(sales_agents_result[0].agent_type == 1){


              const resultLms =  sales_agents_result.map(manager => {
                  const agents = allAgents.filter(agent => agent.manager_id === manager.id)
                  const totaTarget = agents.reduce((sum, a) => sum + (a.target || 0), manager.target || 0)
                  const totalShipOk = agents.reduce((sum, a) => sum + (a.shipok || 0), manager.shipok || 0)

                  return {
                  ...manager, 
                  target: totaTarget, 
                  shipok: totalShipOk
                }
              })


          sales_agents = resultLms

        }

      }else if(sales_agents_result[0].agent_type == 0){
        
        sales_agents = sales_agents_result   
      
      }
    
    
  }else{

      if (withTrucks === "true" || withTrucks === true){
        const [sales_agents_result] = await pool.execute(
          leaderboardMasterQuery,[
          givenMonth, givenYear, snapshot, snapshot, snapshot , snapshot, snapshot, snapshot, 
          givenMonth, givenYear, givenMonth, givenYear, givenMonth, givenYear,
          givenMonth, givenYear, givenMonth, givenYear, givenMonth, givenYear, givenMonth, givenYear
          ]  
        )
        sales_agents = sales_agents_result
      }  
      else{
          const [sales_agents_result] = await pool.execute(
            `${leaderboardMasterQuery} AND m.name=?`, [   givenMonth, givenYear, snapshot, snapshot, snapshot , snapshot, snapshot, snapshot, 
          givenMonth, givenYear, givenMonth, givenYear, givenMonth, givenYear,
          givenMonth, givenYear, givenMonth, givenYear, givenMonth, givenYear,  givenMonth, givenYear,'trucks']  
        )
          sales_agents = sales_agents_result
      }  

      sales_agents = sales_agents.filter(agent => agent.target != 0 || agent.agent_type == 2 || agent.agent_type == 1) // include only agent target is not zero , lm and senior manager
 
      const lms = sales_agents.filter(agent => agent.agent_type == 1)
      const agents = sales_agents.filter(agent => agent.agent_type == 0)
      const um =  sales_agents.filter(agent => agent.agent_type == 2)

      if (leaderboardOption == 'overall' || leaderboardOption == 'all' || leaderboardOption == 'shipok percentage'){

            const resultLms= lms.map(manager => {
                const agent = agents.filter(agent => agent.manager_id === manager.id)
                const totaTarget = agent.reduce((sum, a) => sum + (a.target || 0), manager.target || 0)
                const totalShipOk = agent.reduce((sum, a) => sum + (a.shipok || 0), manager.shipok || 0)

                return {
                  ...manager, 
                  target: totaTarget, 
                  shipok: totalShipOk
                }
            })

            const resultUm =  um.map(manager =>{

                const totaTarget = sales_agents.reduce((sum, a) => sum + (a.target || 0), manager.target || 0)
                const totalShipOk = sales_agents.reduce((sum, a) => sum + (a.shipok || 0), manager.shipok || 0)

                return {
                  ...manager,
                  target: totaTarget,
                  shipok: totalShipOk
                }
            })

      
            sales_agents = [...agents, ...resultLms, ...resultUm]
            sales_agents = sales_agents.filter(agent => agent.target != 0 ) // include only agent target is not zero and  senior manager


      }else if(leaderboardOption == 'lm'){
            const resultLms= lms.map(manager => {
                const agent = agents.filter(agent => agent.manager_id === manager.id)
                const totaTarget = agent.reduce((sum, a) => sum + (a.target || 0), manager.target || 0)
                const totalShipOk = agent.reduce((sum, a) => sum + (a.shipok || 0), manager.shipok || 0)

                return {
                  ...manager, 
                  target: totaTarget, 
                  shipok: totalShipOk
                }
            })
            sales_agents = resultLms

      }else if(leaderboardOption == 'team'){
            const resultLms= lms.map(manager => {
                const agent = agents.filter(agent => agent.manager_id === manager.id )
                const totaTarget = agent.reduce((sum, a) => sum + (a.target || 0), manager.target || 0)
                const totalShipOk = agent.reduce((sum, a) => sum + (a.shipok || 0), manager.shipok || 0)

                return {
                  ...manager, 
                  target: totaTarget, 
                  shipok: totalShipOk
                }
            })
          sales_agents = [...resultLms, ...agents]
      }else if(leaderboardOption == 'agent'){
        sales_agents = agents
      }

  }

  

   //fetch  evaluation_criteria value and save it to evalulation_criteria 
   const [evaluation_criteria_array] = await pool.execute(
      'SELECT * FROM `evaluation_criteria`'
   )
   
   const evaluation_criteria = evaluation_criteria_array[0]

   for (const agent of sales_agents){
      
     //add given month and year
     agent['month'] = givenMonth
     agent['year'] = givenYear

    
      if(agent['target'] > 0 && agent['target'] != null && agent['shipok'] > 0  && agent['shipok'] != null) {

       const target = Number(agent['target'])
       const shipok = Number(agent['shipok'])
       const percentShipOk = Math.round(Number(shipok)/Number(target) * 100)
       
       //get the agent score performance
       const [scoreShipOk] = await pool.execute(
         'SELECT score FROM `performance_score`WHERE ? BETWEEN `min_value` AND `max_value`', [percentShipOk]
       ) 

      //  agent['target'] = target
      //  agent['ship_ok'] = shipok
       agent['shipok_percent'] = percentShipOk
       agent['shipok_score'] = scoreShipOk[0].score
     }else{
      //  agent['target'] = 0
      //  agent['shipok'] = 0
       agent['shipok_percent'] = 0
       agent['shipok_score'] = 0
     }

     //if leaderboardoption is shipok_percentage  continue or proceed to other agent

     if(leaderboardOption == 'shipok percentage'){
       continue
     }

    
     if(agent.submitted == 0){
            agent['absences'] = 0
            agent['absence_score'] = 0
            agent['tardiness'] = 0 
            agent['tardiness_score'] = 0
            agent['memo'] = 0
            agent['memo_score'] = 0
            agent['feedback_score'] = 0
            agent['deduction'] = 0
     }else{
 
              let agentAbsenceScore;

              if(agent['absences'] === 0){
                agentAbsenceScore = 5
              }else{
                const [absenceScore] = await pool.execute(
                  'SELECT score FROM absences_score WHERE absence_count=?', [agent['absences']]
                )
                if (absenceScore.length == 0){
                    agentAbsenceScore = 0
                }else{
                  agentAbsenceScore = absenceScore[0].score
                }
              }
         
              agent['absence_score'] = agentAbsenceScore
          
      
              
          let agentTardinessScore
          if (agent['tardiness'] === 0){
              agentTardinessScore = 5
          }else {
            
            const [tardinessScore] = await pool.execute(
              'SELECT score FROM tardiness_score WHERE tardiness_count=?', [agent['tardiness']]
            )
            if (tardinessScore.length == 0){
                agentTardinessScore = 0
            }else{
              agentTardinessScore = tardinessScore[0].score
            }

          }
  
          agent['tardiness_score'] = agentTardinessScore
          
              
         let agentMemoScore
         if (agent['memo'] === 0){
            agentMemoScore = 5
         }else {
          
          const [memoScore] = await pool.execute(
            'SELECT score FROM memorandum_score WHERE memo_count=?', [agent['memo']]
          )
          if (memoScore.length == 0){
              agentMemoScore= 0
          }else{
            agentMemoScore = memoScore[0].score
          }

          
        }

        agent['memo_score'] = agentMemoScore

        const [feedback] = await pool.execute(
          'SELECT feedback FROM feedback WHERE agent_id=? AND month=? AND year=?', [agent.id, givenMonth, givenYear]
        )
        let overallAverageFeedback
        if (feedback.length == 0) {
              let averageAgentFeedbackByLm = null
              let averageLmFeedbackByAgent = null
              let averageLmFeedbackByUm = null
              let averageUmFeedbackByLm = null
              let averageFeedbackByQa = null

              const getAverageFeedback = (feedback_result) => {
                if (!Array.isArray(feedback_result) || feedback_result.length === 0) return null;
                const total = feedback_result.reduce((sum, item) => sum + parseFloat(item.feedback_score || 0), 0);
                return (total / feedback_result.length).toFixed(4);
              }
              // for saleas agent
              if (agent.agent_type == 0){
      
                  const [agents_feedback_result] = await pool.execute(
                  'SELECT * FROM  `feedback_agents_by_lm` WHERE agent_id=?  AND month=? AND year=?',[agent.id,givenMonth,givenYear]  
                )
                averageAgentFeedbackByLm  = getAverageFeedback(agents_feedback_result)
              }
            // for local manager
            if(agent.agent_type == 1){
                const [lm_feedback_by_agent_result] = await pool.execute(
                  'SELECT * FROM  `feedback_lm_by_agents` WHERE lm_id=? AND month=? AND year=?',[agent.id,givenMonth,givenYear]  
                ) 
              
                const [lm_feedback_by_um_result] = await pool.execute(
                  'SELECT * FROM  `feedback_lm_by_um` WHERE lm_id=?  AND month=? AND year=?',[agent.id,givenMonth,givenYear]  
              )
              averageLmFeedbackByAgent = getAverageFeedback(lm_feedback_by_agent_result)
              averageLmFeedbackByUm = getAverageFeedback(lm_feedback_by_um_result)
            }
            // for senior manager.
            if (agent.agent_type == 2){
              
               
                const [managers_feedback_result] = await pool.execute(
                  'SELECT * FROM  `feedback_um_by_lm` WHERE um_id=?  AND month=? AND year=?',[ agent.id,givenMonth,givenYear]  
                )
                averageUmFeedbackByLm = getAverageFeedback(managers_feedback_result)
            }

            const [feedback_by_qa_result] = await pool.execute(
              'SELECT * FROM  `feedback_by_qa` WHERE agent_id=? AND month=? AND year=?',[agent.id,givenMonth,givenYear]  
            )

        
            averageFeedbackByQa = getAverageFeedback(feedback_by_qa_result)
          
              // Compute the overall average, excluding empty feedback categories
            const getOverallAverageFeedback = () => {
                const scores = [];

                if (averageAgentFeedbackByLm !== null) scores.push(parseFloat(averageAgentFeedbackByLm));
                if (averageLmFeedbackByAgent !== null) scores.push(parseFloat(averageLmFeedbackByAgent));
                if (averageLmFeedbackByUm !== null) scores.push(parseFloat(averageLmFeedbackByUm));
                if (averageUmFeedbackByLm !== null) scores.push(parseFloat(averageUmFeedbackByLm));
                if (averageFeedbackByQa !== null) scores.push(parseFloat(averageFeedbackByQa));
              
                if (scores.length === 0) return null; // Return null if there's no valid data

                return (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(4);
            };


          overallAverageFeedback = getOverallAverageFeedback()

            
        }else{
          overallAverageFeedback = feedback[0].feedback
        }
        

            
          agent['feedback_score'] =   Number(overallAverageFeedback).toFixed(4)

        }



      agent['performance_rating'] = parseFloat(( agent['shipok_score'] * evaluation_criteria.performance).toFixed(4))
      agent['absence_rating'] = parseFloat((agent['absence_score'] * evaluation_criteria.absence).toFixed(4))
      agent['tardiness_rating'] = parseFloat((agent['tardiness_score'] * evaluation_criteria.tardiness).toFixed(4))
      agent['memo_rating'] =   parseFloat((agent['memo_score']  * evaluation_criteria.memorandum_recieved).toFixed(4)) 
      agent['feedback_rating'] =  parseFloat((agent['feedback_score'] * evaluation_criteria.feedback).toFixed(4)) 
      agent['additional_points'] = parseFloat((agent['deposit_score'] * evaluation_criteria.additional_points).toFixed(4))

  
    
    

      agent['final_ratings'] = (
      agent['performance_rating'] +
      agent['absence_rating'] +
      agent['tardiness_rating'] +
      agent['memo_rating'] +
      agent['feedback_rating'] +
      agent['additional_points'] - 
      agent['deduction']   // deduction points if needed to be subtracted
    ).toFixed(4);


      // Get the result name base on the final_ratings
      if(agent['submitted'] == 0) {
        agent['ratings_name'] = "INCOMPLETE RATING"

      }else{
        const [ratings] = await pool.execute(
        'SELECT ratings_name FROM result_ratings WHERE ? BETWEEN min_value AND max_value',[agent['final_ratings']]
        )
       agent['ratings_name'] = ratings[0].ratings_name 

      }
 
  
  
 }

  //  connection.release()
  
   sales_agents.sort((a, b) => b.final_ratings - a.final_ratings)

  return sales_agents

   
  /*fetch target and shipok of each agent for the given month, and get the perentage
   with  performance_percent = shipok/target * 100
  
   - roundoff it to the nearest  whole number, get the equivalent score in  performance_score table and store it in
   agent_performance_score variables
   
   - get the 80%  of the performance_score and save it to performance_total 
     performance_total = performance_score * evalualtion_criteria.performance 

   - get total tardiness and absence of the agent for the given month and get the score equivalent to tardiness_score and absences_score 
     and save it to agent_tardiness_score and agent_absences_score variable
     get the sum of these two and multiply it with 10% or .10 and store the variable to  attentance_total_score 
     
   - get the feedback of each agent for the given month and save it to agent_feedback variable
     get the agent feedback_score (agent_feedback * evaulation_criteria.feedback)
     get the  memo fo the agent for the given month and get the equivalent score in memorandum_socre
     agent_memorandum_score = agent_memo_score * evaluation_criteria.memorandum_recieved 
   - get the  total new_deposit of each agent for the given month and get the new_deposit_score
     additional_points= new_deposit_total * evaluatin_criteria.additional_points
    
   -get the total_result of each agent for the given month 
    agent_total_result = agent_perfomance_result + agent_attendance_result + agent_memo_feedback_result + agent_additional_result

   - get the result_name name of each agent base on the agent_total_result in the result_ratings table.

  */
}


exports.groupedByTeam = async (agentMetircs, leaderboardOption) => {

           //remove agent target is equal to zero

          //  agentMetircs = agentMetircs.filter(agent => agent.target != 0)
          
           const groupType = {
              'team': { agent_type: 1},
              'overall' : { agent_type: 2, team_name: 'Overall', team_id: 99, team_image: '/images/sbtlogo.png', team_leader_name: 'Rustan'}
            }
      
           const groupedByTeam = {}

            if(leaderboardOption == 'team'){
               agentMetircs = agentMetircs.filter(agent => agent.agent_type !=2 ) // the senior manager first
            
             }

            
           
            agentMetircs.forEach(agent => {
               const team_name = groupType[leaderboardOption].team_name || agent.team_name 
               const team_id  = groupType[leaderboardOption].team_id || agent.team_id
  
              if(!groupedByTeam[team_name]){
              
                  groupedByTeam[team_name] = {
                    team_name: team_name,
                    team_id:  team_id,
                    team_leader_name: '',
                    deposit_score: 0,
                    target: 0,
                    shipok: 0,
                    total_rating: 0,
                    rating_count: 0,
                    month: agent.month ,
                    year: agent.year,
                    teams: [],
                    submitted_array: [],
                    isCompleted: false

                  }
               } 

                if(agent.agent_type == groupType[leaderboardOption].agent_type){
                  team_image = groupType[leaderboardOption].team_image || agent.image_link
                  team_leader_name = groupType[leaderboardOption].team_leader_name ||  agent.db_name
                  
                  groupedByTeam[team_name].team_image = team_image
                  groupedByTeam[team_name].team_leader_name = team_leader_name 
                  groupedByTeam[team_name].target += parseFloat(agent.target) 
                  groupedByTeam[team_name].shipok += parseFloat(agent.shipok) 
                  // groupedByTeam[team_name].target  += parseFloat(agent.target)
                  // groupedByTeam[team_name].shipok  += parseFloat(agent.shipok)  
                  // groupedByTeam[team_name].shipok_percent = +agent.shipok_percent
                  // groupedByTeam[team_name].submitted_array.push(agent.submitted)
                }

                groupedByTeam[team_name].deposit_score  += parseFloat(agent.deposit_score) 
                // groupedByTeam[team_name].target += parseFloat(agent.target) 
                // groupedByTeam[team_name].shipok += parseFloat(agent.shipok) 
               
                groupedByTeam[team_name].total_rating += parseFloat(agent.final_ratings)
                groupedByTeam[team_name].rating_count += 1 
                groupedByTeam[team_name].submitted_array.push(agent.submitted)
                groupedByTeam[team_name].teams.push(agent)

                // console.log(agent)

            })

            //compute the average and clean up

            for (const team in groupedByTeam){
              groupedByTeam[team].final_ratings = parseFloat((groupedByTeam[team].total_rating / groupedByTeam[team].rating_count)).toFixed(4)
              // groupedByTeam[team].shipok_percent = Math.round(Number(groupedByTeam[team].shipok)/Number(groupedByTeam[team].target) * 100)
              delete groupedByTeam[team].total_rating
              delete groupedByTeam[team].rating_count

              groupedByTeam[team].isCompleted = groupedByTeam[team].submitted_array.every(item => item === 1)   // return false if there's atleast 0 in the array true if all values are 1

                if(groupedByTeam[team].target > 0 && groupedByTeam[team].target  != null && groupedByTeam[team].shipok > 0  && groupedByTeam[team].shipok != null) {

                    const percentShipOk = Math.round(Number(groupedByTeam[team].shipok)/Number(groupedByTeam[team].target) * 100)
                    
                    //get the agent score performance
                    const [scoreShipOk] = await pool.execute(
                      'SELECT score FROM `performance_score`WHERE ? BETWEEN `min_value` AND `max_value`', [percentShipOk]
                    ) 
                    groupedByTeam[team].shipok_percent = percentShipOk
                    groupedByTeam[team].shipok_score  = scoreShipOk[0].score

              }else{
                    groupedByTeam[team].shipok_percent = 0
                    groupedByTeam[team].shipok_score  = 0
              }


              if(!groupedByTeam[team].isCompleted){
                    groupedByTeam[team].ratings_name  = "INCOMPLETE RATING"
              }else{
                  const [ratings] = await pool.execute(
                            'SELECT ratings_name FROM result_ratings WHERE ? BETWEEN min_value AND max_value',[groupedByTeam[team].final_ratings]
                            )
                  groupedByTeam[team].ratings_name  = ratings[0].ratings_name
              }
          }

            //final transform 

            const groupedByTeamArray = []

            for (const team in groupedByTeam){
               groupedByTeamArray.push(groupedByTeam[team])
            }

            // console.log(groupedByTeamArray)

              // Step 1: Get the top final_ratings
              const topRating = Math.max(...groupedByTeamArray.map(team => parseFloat(team.final_ratings)))
              
              // Step 2: Add the tag conditionally based on final_ratings and agent_type
              const groupedByTeamArrayWithRating = groupedByTeamArray.map(team => ({
                ...team,
                tag: team.isCompleted ? 
                  parseFloat(team.final_ratings) === topRating ? 'BEST TEAM' : '' 
                  : ''   
              })) 

            groupedByTeamArrayWithRating.sort((a, b) => parseFloat(b.final_ratings) - parseFloat(a.final_ratings))

            for (const team of groupedByTeamArrayWithRating){
               team.teams.sort((a,b) => b.agent_type - a.agent_type)
            
            }

           

            // res.status(200).json(groupedByTeamArrayWithRating)

            return groupedByTeamArrayWithRating





}



exports.fetchAgentLeaderBoard = async (req, res, next) => {
    //check if there is a month and year in the query string
    // if there is no query string set month to the latest month

  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    

    let givenMonth
    let givenYear 
    let withTrucks
    let fullyear = req.query.fullyear
    let yearSummary = req.query.year_summary
    let exportToExcel = req.export_to_excel
    let leaderboardOption 
    let loginUser = req.user 

   
    
    if( fullyear == 'true'){
      fullyear = true
    }else {
      fullyear = false
    }
    if (yearSummary == 'true'){
      yearSummary = true
    }else {
      yearSummary = false
    }
    let agentId 

    if(!req.query.agent_id){
      agentId = ""
    }else {
      agentId = req.query.agent_id
    }
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

    if(!req.query.withTrucks || req.query.withTrucks === ""){
      withTrucks = true      
    }else{
      withTrucks = req.query.withTrucks
    }


  

    leaderboardOption = req.params.leaderboardOption || req.query.leaderboardOption || 'agent'

   
    const path = req.path

    
    try {
    //fetch all agent available and save it to sales_agent array
    // const connection =  await pool.getConnection()

    const calculateAverages = (dataArray) => {
        const keysToAverage = [
            "absence_score", 
            "feedback_score",
            "tardiness_score",
            "memo_score",
            "shipok_score",
            "absence_rating",
            "memo_rating", 
            "tardiness_rating", 
            "feedback_rating",
            "performance_rating",
            "final_ratings",
            "shipok_percent",
            "additional_points",
         
            
        ];

        //
    
        const keysToSum = ["target", "shipok", "memo", "absences", "tardiness", "deposit_score"];
    
        if (dataArray.length === 0) return {}; // Return empty if no data
    
        const sum = dataArray.reduce((acc, obj) => {
            keysToAverage.forEach(key => {
                acc[key] = (acc[key] || 0) + parseFloat(obj[key] || 0);
            });
            keysToSum.forEach(key => {
                acc[key] = (acc[key] || 0) + parseFloat(obj[key] || 0);
            });
            return acc;
        }, {});
    
        const count = dataArray.length;
    
        const result = {};
    
        // Calculate averages for the specified keys
        keysToAverage.forEach(key => {
            result[key] =  Math.round((sum[key] / count) * 100) / 100; // Round to 2 decimal places
            if(key == 'shipok_percent'){
              result[key] = Math.round((sum[key]/count))
            }else{
               result[key] = (sum[key]/count).toFixed(4)
            }

        });
    
        // Store sums for "target" and "shipok"
        keysToSum.forEach(key => {
            result[key] = sum[key]; // Keep as total sum
        });
    
        return result;
  }

 let agentMetircs
 if (fullyear) {

        const currentYear = new Date().getFullYear()
        const currentMonth = new Date().getMonth()
        let monthsToProcess = []

        if(Number(givenYear) < currentYear){
          monthsToProcess = monthNames
        }else if(Number(givenYear) === currentYear){
          monthsToProcess = monthNames.slice(0, currentMonth + 1) // up to current month only
        }else{

           if(exportToExcel){
              req.performance  = {
             'agentMetricsFullYear': [], // all months
             'yearAverage': {}                         // one yearly summary
        };
           }else {
            return res.json(200).json({'agentMetricsFullyer': [], 'yearAverage': {}})
           }
        }


        const monthQueries = monthsToProcess.map(month =>
          this.getAgentsMetrics(agentId, month, givenYear, withTrucks, "", path, leaderboardMasterQuery)
        );
        const monthResults = await Promise.all(monthQueries);

        // Flatten results (all months for this agent)
        let fullYearAgentPerformances = monthResults.flat().filter(agent => agent.target != 0); // Remove any undefined/null records

        if(loginUser.agent_type == 1){
          fullYearAgentPerformances = fullYearAgentPerformances.filter(agent => agent.team_id == loginUser.team_id)
        }

        
        //remove not submitted month
        fullYearAgentPerformances = fullYearAgentPerformances.filter(agent => agent.submitted == 1)

        // Yearly averages
        const yearAverage = calculateAverages(fullYearAgentPerformances);

        Object.assign(yearAverage, {
          id: fullYearAgentPerformances[0]?.id,
          db_name: fullYearAgentPerformances[0]?.db_name,
          image_link: fullYearAgentPerformances[0]?.image_link,
          year: givenYear
        });

        // Submitted check
        const hasIncomplete = fullYearAgentPerformances.some(r => r.submitted == 0);
        if (hasIncomplete) {
          yearAverage.ratings_name = "INCOMPLETE RATING";
          // yearAverage.final_ratings = 0;
        } else if (yearAverage.final_ratings) {
           const [year_ratings] = await pool.execute(
              'SELECT ratings_name FROM result_ratings WHERE ? BETWEEN min_value AND max_value',
              [yearAverage.final_ratings]
            );

          yearAverage.ratings_name = year_ratings[0].ratings_name;
        } else {
          yearAverage.ratings_name = "No Ratings";
          // yearAverage.final_ratings = 0;
        }
        yearAverage.hasIncomplete = hasIncomplete

        const data = {
          agentMetricsFullYear: fullYearAgentPerformances, // all months
          yearAverage: yearAverage                         // one yearly summary
        };

        if (exportToExcel) {
          req.performance = data;
          next();
        } else {
          console.log(data)
          res.status(200).json(data);
        }
  }

  
  else{
    
    
      // get only the given month and year (for leaderboard )
      if(!yearSummary){  
        agentMetircs = await this.getAgentsMetrics( agentId, givenMonth, givenYear, withTrucks, leaderboardOption,path, leaderboardMasterQuery)
       
        if(exportToExcel){
          req.performance = agentMetircs 
          req.leaderboardOption = leaderboardOption
          req.params.agent_id = agentId //manually place agentId in the
          next()
          //return the  agentMetrics immedaitely
         } else if(agentId != "" || leaderboardOption == 'new deposit'){
           console.log(agentMetircs)
          res.status(200).json(agentMetircs)
        }  
        else{
          
          if(leaderboardOption == 'team' || leaderboardOption == 'overall'){
           
           const teams = await this.groupedByTeam(agentMetircs, leaderboardOption)

           //calculate again for team
           if(leaderboardOption == 'overall') {
              teams[0].teams = await this.groupedByTeam(teams[0].teams, 'team')
              teams[0].teams.forEach(team =>{
                delete team.teams
              })
           }
           console.log(teams)
           return res.status(200).json(teams)


          }else{
              if(leaderboardOption == 'agent' || leaderboardOption== 'lm'){
                  // Step 1: Get the top final_ratings
                  const topRating = Math.max(...agentMetircs.map(agent => parseFloat(agent.final_ratings)))

                  // Step 2: Add the tag conditionally based on final_ratings and agent_type
                  const agentMetircsWithRating = agentMetircs.map(agent => ({
                    ...agent,
                    tag: agent.submitted == 1 
                    ? parseFloat(agent.final_ratings) === topRating
                        ? agent.agent_type === 0
                          ? 'TOP AGENT'
                          : agent.agent_type === 1
                          ? 'TOP LM'
                          : ''
                        : ''
                      : ''  
                  }))
                console.log('this top rating is for agent and lm')
                 return res.status(200).json(agentMetircsWithRating)               
            }else if(leaderboardOption == 'all'){
                const lmTopRating = Math.max(...agentMetircs.filter(agent => agent.agent_type == 1).map(agent => parseFloat(agent.final_ratings)))
                const  agentTopRating = Math.max(...agentMetircs.filter(agent => agent.agent_type == 0).map(agent => parseFloat(agent.final_ratings)))

                // Add tag for both types
                const agentMetircsWithRating  = agentMetircs.map(agent => ({
                  ...agent,
                  tag: agent.submitted == 1 
                    ? agent.agent_type === 0 && parseFloat(agent.final_ratings) === agentTopRating
                      ? 'TOP AGENT'
                      : agent.agent_type === 1 && parseFloat(agent.final_ratings) === lmTopRating
                      ? 'TOP LM'
                      : ''
                    : ''
                }))
              // get only his/her team
              if(loginUser.agent_type == 1){
                 const agentMetircsWithRatingLoginUserTeam = agentMetircsWithRating.filter(agent => agent.team_id == loginUser.team_id)
                   return res.status(200).json(agentMetircsWithRatingLoginUserTeam) 
              }
              console.log(agentMetircsWithRating)
               return res.status(200).json(agentMetircsWithRating) 
            }else if(leaderboardOption == 'shipok percentage'){
                        
              agentMetircs =  agentMetircs.filter(agent => agent.shipok_percent > 0).sort((a, b) => b.shipok_percent - a.shipok_percent)
                              // Step 1: Get the top final_ratings
              const topRating = Math.max(...agentMetircs.map(agent => parseFloat(agent.shipok_percent)))


              // Step 2: Check how many agents have the same top rating
              const topCount = agentMetircs.filter(agent => parseFloat(agent.shipok_percent) === topRating).length; 

                            // Step 2: Add the tag conditionally based on final_ratings and agent_type
              const agentMetircsWithTag  = agentMetircs .map(agent => ({
                              ...agent,
                              tag: topCount === 1 && parseFloat(agent.shipok_percent) === topRating ? 'TOP IN SHIPOK PERCENTAGE' : '',
                                
                            }))
             console.log(agentMetircsWithTag)
             return res.status(200).json(agentMetircsWithTag)

            }
          }

        }
      // For Yearly Performance 
      }else {
    
          let fullYearAgentPerformances = [];
          const currentYear = new Date().getFullYear()
          const currentMonth = new Date().getMonth()  // 0=Jan , 9 October ,

          let monthsToProcess = []

          if(Number(givenYear) < currentYear){
             monthsToProcess = monthNames  
          }else if(Number(givenYear) === currentYear) {
            monthsToProcess = monthNames.slice(0, currentMonth + 1) // pu to current month
          }else {

            // future year should be no data

              if(exportToExcel){
                req.performance = []
                next()
              }else{
                return res.status(200).json([])
              }
          }

          // 1. Fetch all months in parallel
          const monthQueries = monthsToProcess.map(month =>
            this.getAgentsMetrics("", month, givenYear, withTrucks, leaderboardOption, path, leaderboardMasterQuery)
          );
          const monthResults = await Promise.all(monthQueries);

          // Flatten results
           monthResults.forEach(result => fullYearAgentPerformances.push(...result))


          //remove month that not yet submitted 
          fullYearAgentPerformances = fullYearAgentPerformances.filter(agent => agent.submitted == 1)
          

          if (loginUser.agent_type == 1){
            fullYearAgentPerformances = fullYearAgentPerformances.filter(agent => agent.team_id == loginUser.team_id)
          }
       
          // fullYearAgentPerformances = fullYearAgentPerformances.filter(agent => agent.agent_type !=2)

          if(leaderboardOption == 'team'  || leaderboardOption == 'overall'){
           
            const teams_year = await this.groupedByTeam(fullYearAgentPerformances, leaderboardOption)


      
            teams_year.map(team => {

              team.teams.sort((a,b ) => b.agent_type !== a.agent_type).sort((a, b)=> monthNames.indexOf(a.eval_month) - monthNames.indexOf(b.eval_month))
           
            })

            //calculate again for team
           if(leaderboardOption == 'overall') {
              teams_year[0].teams = await this.groupedByTeam(teams_year[0].teams, 'team')
              teams_year[0].teams.forEach(team =>{
                delete team.teams
              })
           }

            return res.status(200).json(teams_year)
          }

            // 2. Group by agent using Map
            const agentsMap = new Map();

            for (const agent of fullYearAgentPerformances) {
              // Skip agents with target = 0
              if (agent.target === 0) continue;

              if (!agentsMap.has(agent.id)) {
                agentsMap.set(agent.id, []);
              }
              agentsMap.get(agent.id).push(agent);
            }


          // 3. Helper: get rating names (optimize by caching)
          const getRatingName = async (rating) => {
            if (ratingCache.has(rating)) return ratingCache.get(rating);

             const [year_ratings] = await pool.execute(
              'SELECT ratings_name FROM result_ratings WHERE ? BETWEEN min_value AND max_value',
              [rating]
             );

            const name = year_ratings?.[0]?.ratings_name || "No Ratings";
            ratingCache.set(rating, name);
            return name;
          };
          const ratingCache = new Map();

          // 4. Build yearly metrics
          const agentYearlyMetrics = [];

          for (const [agentId, records] of agentsMap) {

            const yearAverage = calculateAverages(records);

            Object.assign(yearAverage, {
              id: records[0].id,
              agent_type: records[0].agent_type,
              db_name: records[0].db_name,
              image_link: records[0].image_link,
              year: givenYear,
              team_id: records[0].team_id,
              market_id: records[0].market_id,
              employee_status:  records[0].employee_status //records[records.length-1].employee_status
            });

            if (yearAverage.final_ratings) {
              yearAverage.ratings_name = await getRatingName(yearAverage.final_ratings);
            } else {
              yearAverage.ratings_name = "No Ratings";
              yearAverage.final_ratings = 0;
            }
            
            // 🔑 Check submitted
             const hasIncomplete = records.some(r => r.submitted == 0);
            if (hasIncomplete) {
              yearAverage.ratings_name = "INCOMPLETE RATING";
            }
            
            yearAverage.hasIncomplete = hasIncomplete
            agentYearlyMetrics.push(yearAverage);
             
          }


          if(leaderboardOption == 'agent' || leaderboardOption== 'lm'){
                  // Step 1: Get the top final_ratings
                  const topRating = Math.max(...agentYearlyMetrics.map(agent => parseFloat(agent.final_ratings)))

                  // Step 2: Add the tag conditionally based on final_ratings and agent_type
                  const agentYearlyMetricsWithRating = agentYearlyMetrics.map(agent => ({
                    ...agent,
                    tag: agent.hasIncomplete === false
                    ? parseFloat(agent.final_ratings) === topRating
                        ? agent.agent_type === 0
                          ? 'TOP AGENT'
                          : agent.agent_type === 1
                          ? 'TOP LM'
                          : ''
                        : ''
                      : ''  
                  }))
                
                 return res.status(200).json(agentYearlyMetricsWithRating)               
            }else if(leaderboardOption == 'all'){
                const lmTopRating = Math.max(...agentYearlyMetrics.filter(agent => agent.agent_type == 1).map(agent => parseFloat(agent.final_ratings)))
                const  agentTopRating = Math.max(...agentYearlyMetrics.filter(agent => agent.agent_type == 0).map(agent => parseFloat(agent.final_ratings)))

                // Add tag for both types
                const agentYearlyMetricsWithRating  = agentYearlyMetrics.map(agent => ({
                  ...agent,
                  tag: agent.hasIncomplete === false
                    ? agent.agent_type === 0 && parseFloat(agent.final_ratings) === agentTopRating
                      ? 'TOP AGENT'
                      : agent.agent_type === 1 && parseFloat(agent.final_ratings) === lmTopRating
                      ? 'TOP LM'
                      : ''
                    : ''
                }))
              
              if(exportToExcel){
               
                req.performanceYearly = agentYearlyMetricsWithRating.sort((a,b) => b.final_ratings - a.final_ratings) 
                req.leaderboardOption = leaderboardOption
                next()
              }else{
                 return res.status(200).json(agentYearlyMetricsWithRating.sort((a, b,)=> b.final_ratings - a.final_ratings)) 
              }

              // if(loginUser.agent_type == 1){
              //    const agentYearlyMetricsWithRatingForLoginUserTeam = agentYearlyMetricsWithRating.filter(agent => agent.team_id == loginUser.team_id)
              //      return res.status(200).json(agentYearlyMetricsWithRatingForLoginUserTeam ) 
              // }
              // console.log(agentYearlyMetricsWithRating[7])
              
            }        

         
        // if(exportToExcel){
        //   req.performance= agentYearlyMetricsWithRating
        //   next()
        // }else{
        //   res.status(200).json(agentYearlyMetricsWithRating)
        // }
       
        
      }
    
    }
      
    // connection.release()
    
    
    }
    catch(error){
        console.error('Error, Cannot Fetch Agent sales_leaderboard', error)
        res.status(500).json({error: 'Error, Cannot Fetch Agent sales_leaderboard'})

   }
  //  finally {
  //    connection.release()
  //  }

}



