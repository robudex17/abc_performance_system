const  pool = require('../config/db')

const { validationResult } = require('express-validator')

 const { getAgentsMetrics } = require('./sales_leaderboard_controllers')

exports.fetchAgentDashboard = async (req,res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
   
  
    const currentDate = new Date()

           // Get the month name
    const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
 
    // if (!req.query.month ||  req.query.month ==="") {
        
     
    //     givenMonth = monthNames[currentDate.getMonth()]; // getMonth() returns 0-based index
    // }else {
    //     givenMonth = req.query.month
    // }
    
    // if(!req.query.year || req.query.year ===""){
    //     givenYear = currentDate.getFullYear()
    // }else {
    //     givenYear = req.query.year
    // }

    // if(!req.query.withTrucks || req.query.withTrucks === ""){
    //   withTrucks = true      
    // }else{
    //   withTrucks = req.query.withTrucks
    // }

    // const connection =  await pool.getConnection()
    // let connection 

    const givenMonth = monthNames[currentDate.getMonth()]  // getMonth() returns 0-based index
    const givenYear =   "2024" // currentDate.getFullYear()
    const  withTrucks = true
    const  dashboarOption = req.query.dashboardoption 

    
    const loginUser = req.user


  
   console.log(loginUser)

    try {
      // connection = await pool.getConnection()
     
      const dashboard = {}
      
      //fetch current month target and ship ok  per individual, team , and overall 
       let queryTargetShipok;
      if (dashboarOption == 'individual'){
         console.log(dashboarOption)

      }else if (dashboarOption == 'team'){
        if((loginUser.role =='admin' && loginUser.login_type == 'standarduser') || (loginUser.role == 'manager' && loginUser.agent_type == 2 ) ){
          queryTargetShipok =    `
              WITH deposit_count AS (
            SELECT 
                market_id, 
                month, 
                year, 
                COUNT(*) AS total_deposit
            FROM new_deposit
            WHERE month = ? AND year = ?
            GROUP BY market_id, month, year
        )
        SELECT 
            market.id AS market_id,
            market.market_name,
            target_shipok.month AS month, 
            target_shipok.year AS year ,    
            COALESCE(SUM(target_shipok.target), 0) AS total_target,
            COALESCE(SUM(target_shipok.ship_ok), 0) AS total_ship_ok,
            COALESCE(deposit_count.total_deposit, 0) AS total_deposit
        FROM 
            market
        LEFT JOIN 
            sales_agents ON market.id = sales_agents.market_id
        LEFT JOIN 
            target_shipok 
            ON sales_agents.id = target_shipok.agent_id
            AND target_shipok.month = ?
            AND target_shipok.year = ?
        LEFT JOIN 
            deposit_count 
            ON market.id = deposit_count.market_id
        WHERE 
            market.id != 0            
        
        GROUP BY 
            market.id, market.market_name, deposit_count.total_deposit
        ORDER BY 
            market.id;


        `
        }else {
          queryTargetShipok  =    `
          WITH deposit_count AS (
              SELECT 
                  market_id, 
                  month, 
                  year, 
                  COUNT(*) AS total_deposit
              FROM new_deposit
              WHERE month = ? AND year = ?
              GROUP BY market_id, month, year
          )
          SELECT 
              market.id AS market_id,
              market.market_name,
              target_shipok.month AS month,
              target_shipok.year AS year,
              COALESCE(SUM(target_shipok.target), 0) AS total_target,
              COALESCE(SUM(target_shipok.ship_ok), 0) AS total_ship_ok,
              COALESCE(deposit_count.total_deposit, 0) AS total_deposit
          FROM 
              market
          LEFT JOIN 
              sales_agents ON market.id = sales_agents.market_id
          LEFT JOIN 
              target_shipok 
              ON sales_agents.id = target_shipok.agent_id
              AND target_shipok.month = ?
              AND target_shipok.year = ?
          LEFT JOIN 
              deposit_count 
              ON market.id = deposit_count.market_id
          WHERE 
              market.id = ${loginUser.market_id}
          GROUP BY 
              market.id, market.market_name, deposit_count.total_deposit
          ORDER BY 
              market.id;
          `
        }

        const [marketTargetShipok] = await pool.execute(
          queryTargetShipok,
          [givenMonth, givenYear,givenMonth, givenYear]
        )

        // transform total_target and total_ship_ok value of null to 0
        dashboard.monthly_target_shipok = marketTargetShipok.map(item => ({
          ...item,
          total_target: item.total_target == null ? 0: item.total_target,
          total_ship_ok: item.total_ship_ok == null ? 0 : item.total_ship_ok,
          month: item.month == null ? givenMonth : item.month,
          year: item.year == null ? givenYear : item.year,
        }))
        

      }else if ( dashboarOption == 'overall'){
        queryTargetShipok = "SELECT month, year, SUM(target) AS monthly_target, SUM(ship_ok) AS total_shipok FROM `target_shipok` WHERE month=? AND year=? GROUP BY month,year"
        const [currentMonthyTargetShipokResult] = await pool.execute(
        queryTargetShipok,
        [givenMonth, givenYear]
        )
            
        let [currentMonthyTargetShipok] = currentMonthyTargetShipokResult

        if ( currentMonthyTargetShipok == null || currentMonthyTargetShipok == ""){
          currentMonthyTargetShipok = {month:givenMonth,year: givenYear,monthly_target:"0",total_shipok:"0"}
        }
        dashboard.monthly_target_shipok = currentMonthyTargetShipok

      }

      // let queryTargetShipok;
      // if (withTrucks === "true" || withTrucks === true){
      //   queryTargetShipok = "SELECT month, year, SUM(target) AS monthly_target, SUM(ship_ok) AS total_shipok FROM `target_shipok` WHERE month=? AND year=? GROUP BY month,year"
      // }else {
      //     queryTargetShipok = "SELECT month, year, SUM(target) AS monthly_target, SUM(ship_ok) AS total_shipok FROM `target_shipok` WHERE month=? AND year=? AND market_id != 10 GROUP BY month,year"
      // }
      
      // const [currentMonthyTargetShipokResult] = await pool.execute(
      //   queryTargetShipok,
      //   [givenMonth, givenYear]
      // )
      
      
      // let [currentMonthyTargetShipok] = currentMonthyTargetShipokResult

      // if ( currentMonthyTargetShipok == null || currentMonthyTargetShipok == ""){
      //   currentMonthyTargetShipok = {month:givenMonth,year: givenYear,monthly_target:"0",total_shipok:"0"}
      // }
      // dashboard.monthly_target_shipok = currentMonthyTargetShipok

      //fetch current year target shipok
      // let queryTargetShipOkYear
       
      // if (withTrucks === "true" || withTrucks === true){
      //   queryTargetShipOkYear =  "SELECT year, SUM(target) AS year_target, SUM(ship_ok) AS total_shipok FROM `target_shipok` WHERE year=? GROUP BY year"
      // }else {
      //   queryTargetShipOkYear =  "SELECT year, SUM(target) AS year_target, SUM(ship_ok) AS total_shipok FROM `target_shipok` WHERE year=? AND market_id !=10 GROUP BY year"
      // }
      // const [currentYearTargetShipokResult] = await pool.execute(
      //  queryTargetShipOkYear,
      //   [ givenYear]
      // )
      
      // let [currentYearTargetShipok] = currentYearTargetShipokResult

      // if (currentYearTargetShipok == null || currentYearTargetShipok == ""){
      //   currentYearTargetShipok =  {year:givenYear,year_target:"0",total_shipok:"0"}
      // }
      // dashboard.year_target_shipok = currentYearTargetShipok

      // //current month new_deposit 
      // let queryNewDepositMonth 
      // if (withTrucks === "true" || withTrucks === true){
      //   queryNewDepositMonth  = "SELECT month, year, COUNT(*) AS new_deposit FROM `new_deposit` WHERE month=? AND year=? GROUP BY month,year"
      // }else {
      //   queryNewDepositMonth = "SELECT month, year, COUNT(*) AS new_deposit FROM `new_deposit` WHERE month=? AND year=? AND market_id != 10 GROUP BY month,year"
      // }
      // const [currentMOnthNewDepositResut] = await pool.execute(queryNewDepositMonth ,[givenMonth,givenYear])
      // let [currentMOnthNewDeposit] = currentMOnthNewDepositResut

      // if (currentMOnthNewDeposit == null || currentMOnthNewDeposit == ""){
      //   currentMOnthNewDeposit = {month:givenMonth,year:givenYear,new_deposit:0}
      // }
      // dashboard.current_month_newdeposit = currentMOnthNewDeposit

      // // current year new_deposit
      // let queryNewDepositYear 
      // if (withTrucks === "true" || withTrucks === true){
      //   queryNewDepositYear = "SELECT  year, COUNT(*) AS new_deposit FROM `new_deposit` WHERE  year=? GROUP BY year"
      // }else {
      //    queryNewDepositYear = "SELECT  year, COUNT(*) AS new_deposit FROM `new_deposit` WHERE  year=? AND market_id !=10 GROUP BY year"
      // }
      // const [currentYearNewDepositResult] =await pool.execute(queryNewDepositYear ,[givenYear])
     
      // let [currentYearNewDeposit]  = currentYearNewDepositResult

      // if (currentYearNewDeposit == null || currentYearNewDeposit == ""){
      //   currentYearNewDeposit = {year:givenYear,new_deposit:0}
      // }
      // dashboard.current_year_newdeposit = currentYearNewDeposit

      // //active agents 
     
      // let queryActiveAgents
      // if (withTrucks === "true" || withTrucks === true){
      //   queryActiveAgents = "SELECT COUNT(*) AS active_agents FROM `sales_agents` WHERE status='active'"
      // }else {
      //     queryActiveAgents = "SELECT COUNT(*) AS active_agents FROM `sales_agents` WHERE status='active' AND market_id !=10"
      // }
      // const [ activeAgentsResult ]  = await pool.execute(queryActiveAgents)

      // const [activeAgents ] = activeAgentsResult
      // dashboard.active_agents = activeAgents

      // //get ratings summarries
      // const agentsMetics =  await getAgentsMetrics( "", givenMonth, givenYear, withTrucks)  

      // const ratingsCount = {
      //   EXCEPTIONAL: 0,
      //   "VERY SATISFACTORY": 0,
      //   SATISFACTORY: 0,
      //   "NEEDS IMPROVEMENT": 0,
      //   POOR: 0
      // }

      // const calculateRatings = (agentsMetics,ratingsCount) => {

      //   agentsMetics.forEach(agentMetic => {
      //     if (ratingsCount[agentMetic.ratings_name] != undefined) {
      //       ratingsCount[agentMetic.ratings_name]++
      //     }
      //   })

      //   return ratingsCount
      // }

      // if (agentsMetics.length > 0){
      //    console.log(agentsMetics.length)
      //   dashboard.agent_ratings = calculateRatings(agentsMetics, ratingsCount)
      // }else{
      //   dashboard.agent_ratings = ratingsCount
      // }


   //get agent yearly ratings
   
//    function calculateAverages(dataArray) {
//     const keysToAverage = [
//         "absence_score", 
//         "feedback_score",
//         "memo_score",
//         "tardiness_score", 
//         "deposit_score",
//         "shipok_score",
//         "absence_rating",
//         "memo_rating", 
//         "tardiness_rating", 
//         "feedback_rating",
//         "performance_rating",
//         "final_ratings",
//         "shipok_percent",
//         "additional_points",
//     ];

//       const keysToSum = ["target", "shipok"];

//       if (dataArray.length === 0) return {}; // Return empty if no data

//       const sum = dataArray.reduce((acc, obj) => {
//           keysToAverage.forEach(key => {
//               acc[key] = (acc[key] || 0) + parseFloat(obj[key] || 0);
//           });
//           keysToSum.forEach(key => {
//               acc[key] = (acc[key] || 0) + parseFloat(obj[key] || 0);
//           });
//           return acc;
//       }, {});

//       const count = dataArray.length;

//       const result = {};

//       // Calculate averages for the specified keys
//       keysToAverage.forEach(key => {
//           result[key] = Math.round((sum[key] / count) * 100) / 100; // Round to 2 decimal places
//       });

//       // Store sums for "target" and "shipok"
//       keysToSum.forEach(key => {
//           result[key] = sum[key]; // Keep as total sum
//       });
  

  
      
//       return result;
// }

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
        getAgentsMetrics(sales_agent.id, month, givenYear, withTrucks).then(data => {
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
      yearAverage['ratings_name'] = "NO_RATING"
        yearAverage['final_ratings'] = "NO_RATING"
    }

    yearAverage['id'] =sales_agent.id
    yearAverage['db_name'] =  sales_agent.db_name
    yearAverage['image_link'] = sales_agent.image_link
    yearAverage['year'] = givenYear

    agentYearlyMetrics.push(yearAverage)

  
}

// const ratingsCountYear = {
//   EXCEPTIONAL: 0,
//   "VERY SATISFACTORY": 0,
//   SATISFACTORY: 0,
//   "NEEDS IMPROVEMENT": 0,
//   POOR: 0,
//   NO_RATING: 0
  
// }

// const calculateRatingsYear = ( agentYearlyMetrics,ratingsCountYear) => {

//   agentYearlyMetrics.forEach(agentMetic => {
//     if (ratingsCountYear[agentMetic.ratings_name] != undefined) {
//       ratingsCountYear[agentMetic.ratings_name]++
//     }
//   })

//   return ratingsCountYear
// }

// if (agentYearlyMetrics.length > 0){
//   dashboard.agent_ratings_year = calculateRatingsYear(agentYearlyMetrics,ratingsCountYear)
// }else{
//   dashboard.agent_ratings_year = ratingsCountYear
// }



   //end year ratings

      //get per  target shipok  new deposit per market per month 
      // let queryForDashboard
      // if (dashboarOption == 'team' && loginUser.role =='admin' && loginUser.login_type == 'standarduser'){
      //   queryForDashboard =    `
      //         WITH deposit_count AS (
      //       SELECT 
      //           market_id, 
      //           month, 
      //           year, 
      //           COUNT(*) AS total_deposit
      //       FROM new_deposit
      //       WHERE month = ? AND year = ?
      //       GROUP BY market_id, month, year
      //   )
      //   SELECT 
      //       market.id AS market_id,
      //       market.market_name,
      //       target_shipok.month AS month, 
      //       target_shipok.year AS year ,    
      //       COALESCE(SUM(target_shipok.target), 0) AS total_target,
      //       COALESCE(SUM(target_shipok.ship_ok), 0) AS total_ship_ok,
      //       COALESCE(deposit_count.total_deposit, 0) AS total_deposit
      //   FROM 
      //       market
      //   LEFT JOIN 
      //       sales_agents ON market.id = sales_agents.market_id
      //   LEFT JOIN 
      //       target_shipok 
      //       ON sales_agents.id = target_shipok.agent_id
      //       AND target_shipok.month = ?
      //       AND target_shipok.year = ?
      //   LEFT JOIN 
      //       deposit_count 
      //       ON market.id = deposit_count.market_id
      //   WHERE 
      //       market.id != 0            
        
      //   GROUP BY 
      //       market.id, market.market_name, deposit_count.total_deposit
      //   ORDER BY 
      //       market.id;


      //   `
      // }else {
      //  queryForDashboard =    `
      //   WITH deposit_count AS (
      //       SELECT 
      //           market_id, 
      //           month, 
      //           year, 
      //           COUNT(*) AS total_deposit
      //       FROM new_deposit
      //       WHERE month = ? AND year = ?
      //       GROUP BY market_id, month, year
      //   )
      //   SELECT 
      //       market.id AS market_id,
      //       market.market_name,
      //       target_shipok.month AS month,
      //       target_shipok.year AS year,
      //       COALESCE(SUM(target_shipok.target), 0) AS total_target,
      //       COALESCE(SUM(target_shipok.ship_ok), 0) AS total_ship_ok,
      //       COALESCE(deposit_count.total_deposit, 0) AS total_deposit
      //   FROM 
      //       market
      //   LEFT JOIN 
      //       sales_agents ON market.id = sales_agents.market_id
      //   LEFT JOIN 
      //       target_shipok 
      //       ON sales_agents.id = target_shipok.agent_id
      //       AND target_shipok.month = ?
      //       AND target_shipok.year = ?
      //   LEFT JOIN 
      //       deposit_count 
      //       ON market.id = deposit_count.market_id
      //   WHERE 
      //       market.id = ${loginUser.market_id}
      //   GROUP BY 
      //       market.id, market.market_name, deposit_count.total_deposit
      //   ORDER BY 
      //       market.id;
      //   `
      // }
      // const [marketTargetShipok] = await pool.execute(
      //   queryForDashboard,
      //   [givenMonth, givenYear,givenMonth, givenYear]
      // )



      // // transform total_target and total_ship_ok value of null to 0
      // dashboard.target_shipok_market = marketTargetShipok.map(item => ({
      //   ...item,
      //   total_target: item.total_target == null ? 0: item.total_target,
      //   total_ship_ok: item.total_ship_ok == null ? 0 : item.total_ship_ok,
      //   month: item.month == null ? givenMonth : item.month,
      //   year: item.year == null ? givenYear : item.year,
      // }))


       //get per  target shipok  new deposit per market per year
       
      // let queryPerMarketYear 
      // if (withTrucks === "true" || withTrucks === true){
      //   queryPerMarketYear  = `
      //       WITH deposit_count AS (
      //           SELECT 
      //               market_id, 
      //               year, 
      //               COUNT(*) AS total_deposit
      //           FROM new_deposit
      //           WHERE year = ?
      //           GROUP BY market_id, year
      //       )
      //       SELECT 
      //           market.id AS market_id,
      //           market.market_name,
      //           target_shipok.year AS year,            
      //           COALESCE(SUM(target_shipok.target), 0) AS total_target,
      //           COALESCE(SUM(target_shipok.ship_ok), 0) AS total_ship_ok,
      //           COALESCE(deposit_count.total_deposit, 0) AS total_deposit
      //       FROM 
      //           market
      //       LEFT JOIN 
      //           sales_agents ON market.id = sales_agents.market_id
      //       LEFT JOIN 
      //           target_shipok 
      //           ON sales_agents.id = target_shipok.agent_id
      //           AND target_shipok.year = ?
      //       LEFT JOIN 
      //           deposit_count 
      //           ON market.id = deposit_count.market_id
      //       WHERE 
      //           market.id != 0 
      //       GROUP BY 
      //           market.id, market.market_name, deposit_count.total_deposit
      //       ORDER BY 
      //           market.id;
       
      //   `
      // }else{
      //   queryPerMarketYear =  `
      //        WITH deposit_count AS (
      //           SELECT 
      //               market_id, 
      //               year, 
      //               COUNT(*) AS total_deposit
      //           FROM new_deposit
      //           WHERE year = ?
      //           GROUP BY market_id, year
      //       )
      //       SELECT 
      //           market.id AS market_id,
      //           market.market_name,
      //           target_shipok.year AS year,            
      //           COALESCE(SUM(target_shipok.target), 0) AS total_target,
      //           COALESCE(SUM(target_shipok.ship_ok), 0) AS total_ship_ok,
      //           COALESCE(deposit_count.total_deposit, 0) AS total_deposit
      //       FROM 
      //           market
      //       LEFT JOIN 
      //           sales_agents ON market.id = sales_agents.market_id
      //       LEFT JOIN 
      //           target_shipok 
      //           ON sales_agents.id = target_shipok.agent_id
      //           AND target_shipok.year = ?
      //       LEFT JOIN 
      //           deposit_count 
      //           ON market.id = deposit_count.market_id
      //       WHERE 
      //           market.id != 0 And market.id != 10
      //       GROUP BY 
      //           market.id, market.market_name, deposit_count.total_deposit
      //       ORDER BY 
      //           market.id;       
        
      //   `

      // }

      // const [marketTargetShipokNewdepositYear] = await pool.execute(
      //   queryPerMarketYear,
      //   [ givenYear, givenYear]
      // )

      // // transform total_target and total_ship_ok value of null to 0
      // dashboard.target_shipok_market_year = marketTargetShipokNewdepositYear.map(item => ({
      //   ...item,
      //   total_target: item.total_target == null ? 0: item.total_target,
      //   total_ship_ok: item.total_ship_ok == null ? 0 : item.total_ship_ok,
      //   year: item.year == null ? givenYear : item.year,
      // }))



      // const [tardinessResult] = await pool.execute(
      //   "SELECT COUNT(*) AS tardiness  FROM `tardiness` WHERE `month`=? AND `year`=? GROUP BY month,year", [givenMonth,givenYear]
      // )
      
      // const [memoResult]  = await pool.execute(
      //   "SELECT COUNT(*) AS memos  FROM `memo` WHERE `month`=? AND `year`=? GROUP BY month,year", [givenMonth,givenYear]
      // )

      // const [absenceResult]  = await pool.execute(
      //   "SELECT COUNT(*) AS absences  FROM `absences` WHERE `month`=? AND `year`=? GROUP BY month,year", [givenMonth,givenYear]
      // ) 

      // let [ tardines ] =  tardinessResult

      // if (tardines == null || tardines=="") {
      //   tardines = { tardines: 0}
      // }

      // let [ memos ] =  memoResult 

      // if (memos == null || memos == ""){
      //   memos = {
      //     memos: 0
      //   }
      // }
      
      // let [ absences ] = absenceResult

      // if (absences == null || absences == ""){
      //   absences = {
      //     absences: 0
      //   }
      // }
      

      // dashboard.attendance = { ...tardines, ...absences, ...memos}
      // connection.release()
      console.log(dashboard)
      res.status(200).json(dashboard)
      
    }
    catch(error){
        
        console.error('Error in fetching sales dashboard', error)
        res.status(500).json({error: 'Error, Cannot Fetch sales dashboard..'})

   }
  //  finally {
  //   if(connection){
  //     console.log('connection is closed...')
  //     connection.release()
  //   }

  //  }
}


//Performanace 



//Target and Shipok Market  Distribution 


// Employee Behavior/Attendance Section