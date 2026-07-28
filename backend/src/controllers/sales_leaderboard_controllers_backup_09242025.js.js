const { agent } = require('supertest');
const  pool = require('../config/db')

const { validationResult } = require('express-validator')

exports.getAgentsMetrics = async ( agent_id, givenMonth,givenYear, withTrucks, leaderboardOption) => {
    //CHECK FIRST IF THERE ARE AVAILABLE MONTH AND YEAR ON target_shipok if not return empty array Imediately

  
     /*
      iF withTrucks is true , all agents
      if withTrucks is false , remove the market_id of 10 because it is trucks market
     */  
   let count ;
 
   if(agent_id != ""){
   
     
      const [row] = await pool.execute(
        'SELECT COUNT(*) AS count FROM `target_shipok` WHERE month=? AND year=? AND agent_id=?',[givenMonth,givenYear,agent_id]
    )
 
      count = row[0].count    
   }else {
    
      if (withTrucks == "true" ){
       
        const [row] = await pool.execute(
          'SELECT COUNT(*) AS count FROM `target_shipok` WHERE month=? AND year=?',[givenMonth,givenYear]
      )
        count = row[0].count
      }else{
       
        const [row] = await pool.execute(
          'SELECT COUNT(*) AS count FROM `target_shipok` WHERE month=? AND year=? AND market_id != 10',[givenMonth,givenYear]
      )
         count = row[0].count
         
      } 
   }
 
  
  if (count == 0){
  //  connection.release()
   return  []
  }

 /*
  iF withTrucks is true , all agents
  if withTrucks is false , remove the market_id of 10 because it is trucks market
 */
let queryAgentBy
let targetShipokQueryForAgent = `SELECT target, ship_ok FROM target_shipok WHERE agent_id=? AND month=? AND year=?`
let targetShipokQueryForLM =`SELECT 
           SUM(target_shipok.target) AS target,
           SUM(target_shipok.ship_ok) AS ship_ok
        FROM sales_agents 
        JOIN target_shipok ON sales_agents.id = target_shipok.agent_id
        WHERE sales_agents.team_id = ?
            AND target_shipok.month = ?
             AND target_shipok.year = ?
             AND sales_agents.status = 'active'` 

if (leaderboardOption == 'lm'){
  // queryAgentBy = `SELECT sales_agents.*, market.market_name, team.team_name
  //                 FROM  sales_agents
  //                 LEFT JOIN
  //                     market ON sales_agents.market_id = market.id
  //                 LEFT JOIN
  //                     team ON sales_agents.team_id = team.id
  //                 WHERE  sales_agents.agent_type=1 AND  sales_agents.status='active'`

  queryAgentBy = `
              SELECT 
                sa.*,
                m.market_name,
                t.team_name,
                COALESCE(ses.month, '${givenMonth}') AS month,
                COALESCE(ses.year, ${givenYear}) AS year,
                COALESCE(ses.submitted, 0) AS submitted
            FROM sales_agents sa
            LEFT JOIN market m 
                ON sa.market_id = m.id
            LEFT JOIN team t 
                ON sa.team_id = t.id
            LEFT JOIN sales_evaluation_status ses
                ON sa.id = ses.agent_id
              AND ses.month = '${givenMonth}'
              AND ses.year = ${givenYear}
            WHERE sa.agent_type = 1
              AND sa.status = 'active';
  `

}else if(leaderboardOption == 'agent'){
  // queryAgentBy = `SELECT sales_agents.*, market.market_name, team.team_name
  //                 FROM  sales_agents
  //                 LEFT JOIN
  //                     market ON sales_agents.market_id = market.id
  //                 LEFT JOIN
  //                     team ON sales_agents.team_id = team.id
  //                 WHERE sales_agents.agent_type=0 AND sales_agents.status='active'`

  queryAgentBy = `
  
            SELECT 
              sa.*,
              m.market_name,
              t.team_name,
              COALESCE(ses.month, '${givenMonth}') AS month,
              COALESCE(ses.year, ${givenYear}) AS year,
              COALESCE(ses.submitted, 0) AS submitted
          FROM sales_agents sa
          LEFT JOIN market m 
              ON sa.market_id = m.id
          LEFT JOIN team t 
              ON sa.team_id = t.id
          LEFT JOIN sales_evaluation_status ses
              ON sa.id = ses.agent_id
            AND ses.month = '${givenMonth}'
            AND ses.year = ${givenYear}
          WHERE sa.agent_type = 0
            AND sa.status = 'active';
  `
  
}else if(leaderboardOption == 'team'){
    // queryAgentBy = `SELECT sales_agents.*, market.market_name, team.team_name
    //               FROM  sales_agents
    //               LEFT JOIN
    //                   market ON sales_agents.market_id = market.id
    //               LEFT JOIN
    //                   team ON sales_agents.team_id = team.id
    //               WHERE  sales_agents.agent_type!=2 AND  sales_agents.status='active'`

    queryAgentBy = `
                SELECT 
          sa.*,
          m.market_name,
          t.team_name,
          COALESCE(ses.month, 'May') AS month,
          COALESCE(ses.year, 2025) AS year,
          COALESCE(ses.submitted, 0) AS submitted
      FROM sales_agents sa
      LEFT JOIN market m 
          ON sa.market_id = m.id
      LEFT JOIN team t 
          ON sa.team_id = t.id
      LEFT JOIN sales_evaluation_status ses
          ON sa.id = ses.agent_id
        AND ses.month = 'May'
        AND ses.year = 2025
      WHERE sa.agent_type != 2
        AND sa.status = 'active';

    
    `
  
}

let sales_agents
if (agent_id != ""){
  
  const [sales_agents_result] = await pool.execute(
    // `SELECT * FROM  sales_agents WHERE id=? AND agent_type!=2  AND status='active'`,[agent_id]  

    `
    SELECT 
        sa.*,
        COALESCE(ses.month, '${givenMonth}') AS month,
        COALESCE(ses.year, ${givenYear}) AS year,
        COALESCE(ses.submitted, 0) AS submitted
    FROM sales_agents sa
    LEFT JOIN sales_evaluation_status ses
        ON sa.id = ses.agent_id
      AND ses.month = '${givenMonth}'
      AND ses.year = ${givenYear}
    WHERE sa.id = ?
      AND sa.agent_type != 2
      AND sa.status = 'active'
      `, [agent_id]
  )
  // Set the leaderboardOption into into NONE if the agent_id has a value, for Performance Evaluation of specific agent or LM
  leaderboardOption = ""
  sales_agents = sales_agents_result
}else{

  if (withTrucks === "true" || withTrucks === true){
    const [sales_agents_result] = await pool.execute(
      queryAgentBy  
    )
    
    sales_agents = sales_agents_result
  }else {
    
    const [sales_agents_result] = await pool.execute(
      `${queryAgentBy} AND market_id !=?`, [10]  
  )
  sales_agents = sales_agents_result
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


      /*fetch target and shipok of each agent for the given month and year and get the percentage 
           with  performance_percent = shipok/target * 100
      */
      let targetShipok
    
      if (leaderboardOption == 'lm'){
         
          const [lmTargetShipOk] = await pool.execute( targetShipokQueryForLM, [agent.team_id, givenMonth, givenYear])
          targetShipok = lmTargetShipOk
          
          
      }else if(leaderboardOption == 'team') {
        if(agent.agent_type == 1){
           const [lmTargetShipOk] = await pool.execute( targetShipokQueryForLM, [agent.team_id, givenMonth, givenYear])
          targetShipok = lmTargetShipOk
         
        }else if(agent.agent_type == 0){
           const [agentTargetShipOk] = await pool.execute(
           targetShipokQueryForAgent,[agent.id, givenMonth, givenYear]

         )
         targetShipok = agentTargetShipOk
       
        }
      }
      else if(leaderboardOption == 'agent'){
        
          const [agentTargetShipOk] = await pool.execute(
           targetShipokQueryForAgent,[agent.id, givenMonth, givenYear]

         )
         targetShipok = agentTargetShipOk
        
         
      }else {
       
        if(agent.agent_type == 1){
          const [lmTargetShipOk] = await pool.execute( targetShipokQueryForLM, [agent.team_id, givenMonth, givenYear])
          targetShipok = lmTargetShipOk
        }else {
         
          const [agentTargetShipOk] = await pool.execute(
           targetShipokQueryForAgent,[agent.id, givenMonth, givenYear]

         )
         targetShipok = agentTargetShipOk
        }
      }
      
     

      if(targetShipok.length > 0 && targetShipok[0].target != null && targetShipok[0].ship_ok != null ) {

       const target = Number(targetShipok[0].target)
       const shipok = Number(targetShipok[0].ship_ok)
       const percentShipOk = Math.round(Number(shipok)/Number(target) * 100)
       
       //get the agent score performance
       const [scoreShipOk] = await pool.execute(
         'SELECT score FROM `performance_score`WHERE ? BETWEEN `min_value` AND `max_value`', [percentShipOk]
       ) 

       agent['target'] = target
       agent['shipok'] = shipok
       agent['shipok_percent'] = percentShipOk
       agent['shipok_score'] = scoreShipOk[0].score
     }else{
       agent['target'] = 0
       agent['shipok'] = 0
       agent['shipok_percent'] = 0
       agent['shipok_score'] = 0
     }

    
     if(agent.submitted == 0){
       agent['absences'] = 0
       agent['absence_score'] = 0
       agent['tardiness'] = 0 
       agent['tardiness_score'] = 0
       agent['memo'] = 0
       agent['memo_score'] = 0
      agent['feedback_score'] = 0
     }else{
                    //get agent total absences for the given month and year
              const [absences] = await pool.execute(
                'SELECT Count(*) as absences FROM absences WHERE agent_id=? and month=? and year=?', [agent.id, givenMonth, givenYear]
              )  
              let agentAbsenceScore;
              if (absences[0].absences === 0){
                  agentAbsenceScore = 5
              }else {
                
                const [absenceScore] = await pool.execute(
                  'SELECT score FROM absences_score WHERE absence_count=?', [absences[0].absences]
                )
                if (absenceScore.length == 0){
                    agentAbsenceScore = 0
                }else{
                  agentAbsenceScore = absenceScore[0].score
                }

              
              }
              agent['absences'] = absences[0].absences
              agent['absence_score'] = agentAbsenceScore
          
      

          //get total agent tardiness for the given month and year and corresding score
          
          const [tardiness] = await pool.execute(
            'SELECT Count(*) as tardiness FROM tardiness WHERE agent_id=? and month=? and year=?', [agent.id, givenMonth, givenYear]
          )

              
          let agentTardinessScore
          if (tardiness[0].tardiness === 0){
              agentTardinessScore = 5
          }else {
            
            const [tardinessScore] = await pool.execute(
              'SELECT score FROM tardiness_score WHERE tardiness_count=?', [tardiness[0].tardiness]
            )
            if (tardinessScore.length == 0){
                agentTardinessScore = 0
            }else{
              agentTardinessScore = tardinessScore[0].score
            }

            
          }
          agent['tardiness'] = tardiness[0].tardiness
          agent['tardiness_score'] = agentTardinessScore
          
          
        //get agent total memo for the given month and year and corressponding memo score

        const [memo] = await pool.execute(
          'SELECT Count(*) as memo FROM memo WHERE agent_id=? and month=? and year=?', [agent.id, givenMonth, givenYear]
        )

        
        let agentMemoScore
        if (memo[0].memo === 0){
            agentMemoScore = 5
        }else {
          
          const [memoScore] = await pool.execute(
            'SELECT score FROM memorandum_score WHERE memo_count=?', [memo[0].memo]
          )
          if (memoScore.length == 0){
              agentMemoScore= 0
          }else{
            agentMemoScore = memoScore[0].score
          }

          
        }

        agent['memo'] = memo[0].memo
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
                  'SELECT * FROM  `feedback_um_by_lm` WHERE manager_id=?  AND month=? AND year=?',[ agent.id,givenMonth,givenYear]  
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

   //get agent new deposit for the given and treat this as additional point
   
   const [newDeposit] = await pool.execute(
     'SELECT Count(*) AS deposit FROM new_deposit WHERE agent_id=? AND month=? AND year=?',[agent.id, givenMonth,givenYear]
   )
   let agentNewDepositScore
   if (newDeposit.length == 0){
     agentNewDepositScore = 0
   }else {
     agentNewDepositScore = newDeposit[0].deposit
   }
   
   agent['deposit_score'] = agentNewDepositScore

   //calculate score ratings

 
  //  agent['performance_rating'] = Math.round(( agent['shipok_score'] * evaluation_criteria.performance) * 100) /100
  //  agent['absence_rating'] = Math.round((agent['absence_score'] * evaluation_criteria.absence) * 100) / 100 
  //  agent['tardiness_rating'] = Math.round((agent['tardiness_score'] * evaluation_criteria.tardiness) * 100)/100 
  //  agent['memo_rating'] = Math.round((agent['memo_score']  * evaluation_criteria.memorandum_recieved) * 100 ) /100
  //  agent['feedback_rating'] = Math.round((agent['feedback_score'] * evaluation_criteria.feedback) * 100) /100 
  //  agent['additional_points'] = Math.round((agent['deposit_score'] * evaluation_criteria.additional_points) * 100 ) /100

  


  agent['performance_rating'] = parseFloat(( agent['shipok_score'] * evaluation_criteria.performance).toFixed(4))
   agent['absence_rating'] = parseFloat((agent['absence_score'] * evaluation_criteria.absence).toFixed(4))
  agent['tardiness_rating'] = parseFloat((agent['tardiness_score'] * evaluation_criteria.tardiness).toFixed(4))
  agent['memo_rating'] =   parseFloat((agent['memo_score']  * evaluation_criteria.memorandum_recieved).toFixed(4)) 
   agent['feedback_rating'] =  parseFloat((agent['feedback_score'] * evaluation_criteria.feedback).toFixed(4)) 
   agent['additional_points'] = parseFloat((agent['deposit_score'] * evaluation_criteria.additional_points).toFixed(4))

 


    //  agent['final_ratings'] = Math.round((agent['performance_rating'] + agent['absence_rating'] + agent['tardiness_rating'] +
    //                        agent['memo_rating'] + agent['feedback_rating'] + agent['additional_points']
    //                        ) * 1000) / 1000

   

    

  agent['final_ratings'] = (
  agent['performance_rating'] +
  agent['absence_rating'] +
  agent['tardiness_rating'] +
  agent['memo_rating'] +
  agent['feedback_rating'] +
  agent['additional_points']
).toFixed(4);



   // Get the result name base on the final_ratings

   const [ratings] = await pool.execute(
     'SELECT ratings_name FROM result_ratings WHERE ? BETWEEN min_value AND max_value',[agent['final_ratings']]
   )

  //  console.log( ratings[0].ratings_name || false)

   agent['ratings_name'] = ratings[0].ratings_name 

  
  
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



exports.fetchAgentLeaderBoard = async (req, res, next) => {
    //check if there is a month and year in the query string
    // if there is no query string set month to the latest month
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
            // Get the month name
    const monthNames = [
              "January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November", "December"
    ];

    let givenMonth
    let givenYear 
    let withTrucks
    let fullyear = req.query.fullyear
    let yearSummary = req.query.year_summary
    let exportToExcel = req.export_to_excel
    let leaderboardOption 
   
    
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


    
    if(!req.query.leaderboardOption  || req.query.leaderboardOption  == ''){
       leaderboardOption = 'agent'
    }else{
        leaderboardOption  = req.query.leaderboardOption
    }

 

    try {
    //fetch all agent available and save it to sales_agent array
    // const connection =  await pool.getConnection()

    function calculateAverages(dataArray) {
      const keysToAverage = [
          "absence_score", 
          "feedback_score",
          "memo_score",
          "tardiness_score", 
          "deposit_score",
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
  
      const keysToSum = ["target", "shipok"];
  
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
          // result[key] =  Math.round((sum[key] / count) * 100) / 100; // Round to 2 decimal places
          result[key] = (sum[key]/count).toFixed(4)
      });
  
      // Store sums for "target" and "shipok"
      keysToSum.forEach(key => {
          result[key] = sum[key]; // Keep as total sum
      });
   
      return result;
  }

    let agentMetircs
    if(fullyear){
    
      const queries = monthNames.map(month => 
        this.getAgentsMetrics(agentId, month, givenYear, withTrucks, leaderboardOption).then(data => {
            if (data) {
                return data[0]
            }
            return null; // Skip null values
        })
    );
    
    const results = await Promise.all(queries);
    const agentMetircsFullYear= results.filter(item => item !== undefined); // Remove null values


   const data = {
    'agentMetircsFullYear': agentMetircsFullYear,
    'yearAverage': calculateAverages(agentMetircsFullYear)
   }

   const [year_ratings] = await pool.execute(
    'SELECT ratings_name FROM result_ratings WHERE ? BETWEEN min_value AND max_value',[data['yearAverage']['final_ratings']]
  )

  data['yearAverage']['ratings_name'] = year_ratings[0].ratings_name
  data['yearAverage']['db_name'] =  agentMetircsFullYear[0].db_name
  data['yearAverage']['agent_id'] = agentMetircsFullYear[0].id
  data['yearAverage']['image_link'] = agentMetircsFullYear[0].image_link
  data['yearAverage']['year'] = agentMetircsFullYear[0].year

    if(exportToExcel) {
      req.performance = data
      next()
    }else{
      res.status(200).json(data)
    }
    
    
 
  }
  
  else{
      // get only the given month and year (for leaderboard )
      if(!yearSummary){  
        agentMetircs = await this.getAgentsMetrics( agentId, givenMonth, givenYear, withTrucks, leaderboardOption)
       
        if(exportToExcel){
          req.performance = agentMetircs 
          req.params.agent_id = agentId //manually place agentId in the
          next()
          //return the  agentMetrics immedaitely
         } else if(agentId != ""){
           console.log(agentMetircs)
          res.status(200).json(agentMetircs)
        }  
        else{
          
          if(leaderboardOption == 'team'){
            //   const groupedByTeam = agentMetircs.reduce((result, agent) => {
            //   const team_name = agent.team_name;

            //   if (!result[team_name]) {
            //     result[team_name] = [];
            //   }

            //   result[team_name].push(agent);
            //   return result;
            // }, {});
            // console.log(groupedByTeam)
           // Math.round(Number(shipok)/Number(target) * 100)
            const groupedByTeam = {}
           
            agentMetircs.forEach(agent => {
              const team_name = agent.team_name
              let team_image 

  
              if(!groupedByTeam[team_name]){
              
                  groupedByTeam[team_name] = {
                    team_name: team_name,
                    target: 0,
                    shipok: 0,
                    total_rating: 0,
                    rating_count: 0,
                    month: agent.month ,
                    year: agent.year,
                    teams: []

                  }
               } 

                if(agent.agent_type == 1){
                  team_image = agent.image_link
                  groupedByTeam[team_name].team_image = team_image
                  groupedByTeam[team_name].target  = agent.target
                  groupedByTeam[team_name].shipok  = agent.shipok 
                  groupedByTeam[team_name].shipok_percent = agent.shipok_percent
                }


                // groupedByTeam[team_name].target +=agent.target 
                // groupedByTeam[team_name].shipok +=agent.shipok 
                groupedByTeam[team_name].total_rating += parseFloat(agent.final_ratings)
                groupedByTeam[team_name].rating_count += 1 
                groupedByTeam[team_name].teams.push(agent)

            })

            //compute the average and clean up

            for (const team in groupedByTeam){
              groupedByTeam[team].final_ratings = parseFloat((groupedByTeam[team].total_rating / groupedByTeam[team].rating_count)).toFixed(4)
              // groupedByTeam[team].shipok_percent = Math.round(Number(groupedByTeam[team].shipok)/Number(groupedByTeam[team].target) * 100)
              delete groupedByTeam[team].total_rating
              delete groupedByTeam[team].rating_count
              
              const [ratings] = await pool.execute(
                'SELECT ratings_name FROM result_ratings WHERE ? BETWEEN min_value AND max_value',[groupedByTeam[team].final_ratings]
              )

             
              groupedByTeam[team].ratings_name  = ratings[0].ratings_name

            }

            //final transform 

            const groupedByTeamArray = []

            for (const team in groupedByTeam){
               groupedByTeamArray.push(groupedByTeam[team])
            }

            console.log(groupedByTeamArray)

              // Step 1: Get the top final_ratings
              const topRating = Math.max(...groupedByTeamArray.map(team => parseFloat(team.final_ratings)))
              
              // Step 2: Add the tag conditionally based on final_ratings and agent_type
              const groupedByTeamArrayWithRating = groupedByTeamArray.map(team => ({
                ...team,
                tag:
                  parseFloat(team.final_ratings) === topRating ? 'BEST TEAM' : ''    
              })) 

            groupedByTeamArrayWithRating.sort((a, b) => parseFloat(b.final_ratings) - parseFloat(a.final_ratings))

            for (const team of groupedByTeamArrayWithRating){
               team.teams.sort((a,b) => b.agent_type - a.agent_type)
            
            }

           

            res.status(200).json(groupedByTeamArrayWithRating)
          }else{
              // Step 1: Get the top final_ratings
              const topRating = Math.max(...agentMetircs.map(agent => parseFloat(agent.final_ratings)))

              // Step 2: Add the tag conditionally based on final_ratings and agent_type
              const agentMetircsWithRating = agentMetircs.map(agent => ({
                ...agent,
                tag:
                  parseFloat(agent.final_ratings) === topRating
                    ? agent.agent_type === 0
                      ? 'TOP AGENT'
                      : agent.agent_type === 1
                      ? 'TOP LM'
                      : ''
                    : ''
              }))
              console.log(agentMetircsWithRating)
              res.status(200).json(agentMetircsWithRating)
          }

        }
      
      }else {
     
      
        let sales_agents = []
        let agentYearlyMetrics = []
        if (withTrucks === "true" || withTrucks === true){
          const [sales_agents_result] = await pool.execute(
            'SELECT * FROM  `sales_agents`'  
          )
          
          sales_agents = sales_agents_result
        }else {
          
          const [sales_agents_result] = await pool.execute(
            'SELECT * FROM  `sales_agents` WHERE market_id !=?', [10]  
        )
        sales_agents = sales_agents_result
        }

        for (const sales_agent of sales_agents){
          const queries = monthNames.map(month => 
            this.getAgentsMetrics(sales_agent.id, month, givenYear, withTrucks, "").then(data => {
                if (data) {
                    return data[0]
                }
                return null; // Skip null values
            })
        );
        
        const results = await Promise.all(queries);
        const agentMetircsFullYear= results.filter(item => item !== undefined); // Remove null values
        const yearAverage = calculateAverages(agentMetircsFullYear)
        if(yearAverage.final_ratings){
            const [year_ratings] = await pool.execute(
          'SELECT ratings_name FROM result_ratings WHERE ? BETWEEN min_value AND max_value',[yearAverage.final_ratings]
        )
        yearAverage['ratings_name'] = year_ratings[0].ratings_name
        }else {
          yearAverage['ratings_name'] = "No Ratings"
            yearAverage['final_ratings'] = "No Ratings"
        }
    
        yearAverage['id'] =sales_agent.id
        yearAverage['agent_type'] = sales_agent.agent_type
        yearAverage['db_name'] =  sales_agent.db_name
        yearAverage['image_link'] = sales_agent.image_link
        yearAverage['year'] = givenYear
       
        agentYearlyMetrics.push(yearAverage)

        
        
        }

        if(exportToExcel){
          req.performance= agentYearlyMetrics 
          next()
        }else{
          res.status(200).json(agentYearlyMetrics)
        }
       
        
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



