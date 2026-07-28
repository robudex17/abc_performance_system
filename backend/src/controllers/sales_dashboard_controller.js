const  pool = require('../config/db')

const { validationResult } = require('express-validator')

 const { getAgentsMetrics } = require('./sales_leaderboard_controllers')
//const { agent } = require('supertest')

const sqlQueries = require('../sql/sql')

const { monthMap, monthNames } = require('./helper_scripts/global_variables_and_functions')

exports.fetchAgentDashboard = async (req,res,next) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return res.status(400).json({ errors: errors.array() });
    // }
   
    const currentDate = new Date()

    const loginUser = req.user


    const givenMonth = req.query.month || monthNames[currentDate.getMonth()]  // getMonth() returns 0-based index
    // const givenMonth = "June"
    const givenYear =   req.query.year ||  currentDate.getFullYear()

    

    
    const  withTrucks = true
    //const  dashboarOption = req.query.dashboardoption 

    let dashboarOption ;

    console.log(req.query.dashboardoption)
    if((!req.query.dashboardoption || req.query.dashboardoption == '') ){
        if(loginUser.agent_type == 2){
            dashboarOption = 'team'
        }else{
            dashboarOption = 'individual'
        }
    }else{
        dashboarOption = req.query.dashboardoption
    }



 // Convert "March" -> "03"
    const monthNumber = monthMap[givenMonth];
    if (!monthNumber) {
      return res.status(400).json({ error: "Invalid givenMonth format" });
    }

  const snapshot = `${givenYear}-${monthNumber.toString().padStart(2, '0')}`;  



   let dashboarddMasterQuery = sqlQueries.dashboarddMasterQuery


    try {
      // connection = await pool.getConnection()
     
      const dashboard = {}
      dashboard.data = []
      
      //fetch current month target and ship ok  per individual, team , and overall 

      const  dashboardQueryForInvidualAgents = (filterBy,  operator, value, orderBy) => {
          
          const query = `
                 WITH deposit_count AS (
                    SELECT 
                        agent_id, 
                        month, 
                        year, 
                        COUNT(*) AS total_deposit
                    FROM new_deposit
                    WHERE month = ? AND year = ?
                    GROUP BY agent_id, month, year
                )
                SELECT 
                    sales_agents.id AS agent_id,
                    market.team_id,
                    sales_agents.db_name,
                    market.market_name,
                    target_shipok.month, 
                    target_shipok.year,
                    COALESCE(SUM(target_shipok.target), 0) AS total_target,
                    COALESCE(SUM(target_shipok.ship_ok), 0) AS total_ship_ok,
                    COALESCE(deposit_count.total_deposit, 0) AS total_deposit
                FROM 
                    sales_agents
                LEFT JOIN 
                    market ON sales_agents.market_id = market.id
                LEFT JOIN 
                    target_shipok 
                    ON sales_agents.id = target_shipok.agent_id
                    AND target_shipok.month = ?
                    AND target_shipok.year = ?
                LEFT JOIN 
                    deposit_count 
                    ON sales_agents.id = deposit_count.agent_id
                WHERE 
                    
                    ${filterBy} ${operator} ${value} AND sales_agents.status = 'active'  AND market.team_id !=0
                GROUP BY 
                    sales_agents.id, sales_agents.db_name, market.market_name, 
                    target_shipok.month, target_shipok.year, deposit_count.total_deposit
                ORDER BY 
                    ${orderBy}
          `

          return query

      }

      const dashboardQueryForMarkets = (filterBy, operator, value, orderBy) => {
        // const query = `
        //           WITH deposit_count AS (
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
        //       market.team_id,
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
        //       ${filterBy} ${operator} ${value}  AND market.team_id !=0
        //   GROUP BY 
        //       market.id, market.market_name, deposit_count.total_deposit
        //   ORDER BY 
        //       ${orderBy};
        //   `

        const query = `
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
                    market.team_id,
                    market.market_name,
                    target_shipok.month AS month,
                    target_shipok.year AS year,
                    COALESCE(SUM(target_shipok.target), 0) AS total_target,
                    COALESCE(SUM(target_shipok.ship_ok), 0) AS total_ship_ok,
                    COALESCE(deposit_count.total_deposit, 0) AS total_deposit
                FROM market
                LEFT JOIN sales_agents ON market.id = sales_agents.market_id
                LEFT JOIN target_shipok 
                    ON sales_agents.id = target_shipok.agent_id
                    AND target_shipok.month = ?
                    AND target_shipok.year = ?
                LEFT JOIN deposit_count 
                    ON market.id = deposit_count.market_id
                    AND deposit_count.month = target_shipok.month
                    AND deposit_count.year = target_shipok.year
                WHERE  ${filterBy} ${operator} ${value}  AND market.team_id !=0
                GROUP BY 
                    market.id, 
                    market.team_id,
                    market.market_name,
                    target_shipok.month,
                    target_shipok.year
                ORDER BY market.id;
                        
        `
          return query
      }


        const dashboardQueryForTeams = () => {
        const query = `
                    WITH deposit_count AS (
                    SELECT 
                        m.team_id,
                        d.month,
                        d.year,
                        COUNT(*) AS total_deposit
                    FROM new_deposit d
                    JOIN market m ON d.market_id = m.id
                    WHERE d.month = ? AND d.year = ?
                    GROUP BY m.team_id, d.month, d.year
                )
                SELECT 
                    market.team_id,
                    GROUP_CONCAT(DISTINCT market.market_name ORDER BY market.market_name SEPARATOR '/') AS team_name,
                    COALESCE(MAX(target_shipok.month), ?) AS month,
                    COALESCE(MAX(target_shipok.year), ?) AS year,
                    COALESCE(SUM(target_shipok.target), 0) AS total_target,
                    COALESCE(SUM(target_shipok.ship_ok), 0) AS total_ship_ok,
                    COALESCE(MAX(deposit_count.total_deposit), 0) AS total_deposit
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
                    ON market.team_id = deposit_count.team_id
                WHERE 
                    market.team_id = ?
                    AND sales_agents.status = 'active' 
                    AND market.team_id != 0 
                GROUP BY 
                    market.team_id
                ORDER BY 
                    market.team_id;


          `
          return query
      }


   
   const fetchTeamTargetShipok = (result,month, year) => {
             
        let team_targets = result.reduce((acc, agent) => {

        const teamId = agent.team_id 
            
                
                //this section I use market_name as team_name if  more than one market in a team I 
                //will combine it with this format  'market1/market2'
                if(!acc[teamId]){
                    acc[teamId] = {
                        team_name: agent.team_name,
                        team_id: teamId,
                        martket_id: agent.market_id,
                        market_name: agent.market_name,
                        month: month,
                        year: year,
                        total_shipok: 0,
                        total_target: 0,
                       
                        teammembers:[]

                    }
                }

                if(acc[teamId.team_name != agent.market_name]){
                    acc[teamId].team_name = `${acc[teamId].team_name}/${agent.market_name}`
                }

                acc[teamId].total_target  +=  Number(agent.target || 0 )
                acc[teamId].total_shipok  +=  Number(agent.shipok || 0)
            

                acc[teamId].teammembers.push(agent)

                return acc

           }, {}) 
            //get the values only
            team_targets = Object.values(team_targets)

            const arrangedTeamTargets = [
                ...team_targets.filter(a => a.market_name.toLowerCase() !== 'trucks'),
                ...team_targets.filter(a => a.market_name.toLowerCase() === 'trucks')
            ]

            return arrangedTeamTargets
    }

   const fetchIndividualTargetShipok = async(agent_id,query, month, year) => {
        const monthNumber = monthMap[month];
        const snapshot = `${year}-${monthNumber.toString().padStart(2, '0')}`;  
        let individualTargets
        if(agent_id != ""){
            const [result] = await pool.execute(
                query,
                 [ month, year,snapshot, snapshot, snapshot, snapshot, snapshot, snapshot, month, year, agent_id]
              )   
                individualTargets  = result              
        }else{
            const [result] = await pool.execute(
                    query,
                    [ month, year,snapshot, snapshot, snapshot, snapshot, snapshot, snapshot, month, year]
                )

                const arranged = [
                ...result.filter(a => a.market_name.toLowerCase() !== 'trucks'),
                ...result.filter(a => a.market_name.toLowerCase() === 'trucks')
                ]

              individualTargets  = arranged
        }

        return individualTargets


   }

   const  fetchIndividualTargetShipokYear = async(agent_id, query, year) => {
                 // get the year summary of the individual target
                const currentYear = new Date().getFullYear()
                const currentMonth = new Date().getMonth()  // 0=Jan , 9 October ,
                let fullYearTargetShipok = []

                let monthsToProcess = []

                if(Number(year) < currentYear){
                    monthsToProcess = monthNames  
                }else if(Number(givenYear) === currentYear) {
                    monthsToProcess = monthNames.slice(0, currentMonth + 1) // put to current month
                }else {

                    // future year should be no data
                     return res.status(200).json([])
                     
                }

                
                // 1. Fetch all months in parallel
                const monthQueries = monthsToProcess.map(month =>
                    fetchIndividualTargetShipok(agent_id, query, month, year)
                );
                const monthResults = await Promise.all(monthQueries);

                // Flatten results
                monthResults.forEach(result => fullYearTargetShipok .push(...result))    

                // remove target = 0 , except for the agent_type 0
                //   Group by agent using Map
                    const agentsMap = new Map();

                    for (const agent of fullYearTargetShipok) {
                    // Skip agents with target = 0 and agent != 2
                    if (agent.target === 0 ) continue;

                    if (!agentsMap.has(agent.id)) {
                        agentsMap.set(agent.id, []);
                    }
                    agentsMap.get(agent.id).push(agent);
                    } 

                 return agentsMap          
    
    }


  const getTotalTargetShipok = (agent_id,individualTargetsYearMap) => {
           const agentTotalTargetForYear = [];
           for (const [agentId, records] of individualTargetsYearMap ) {
            
                 
                    const yearTarget = records.reduce((acc, obj) => {
                        return acc + parseFloat(obj.target)
                    }, 0)

                    const yearShipok = records.reduce((acc,obj) => {
                        return acc + parseFloat(obj.shipok)
                    },0)

                    const remainUnits = yearTarget - yearShipok

                    const yearPercentage = getWholeNumberPercentage(yearTarget, yearShipok)
                    const agentYear = {
                        id: records[0].id,
                        agent_type: records[0].agent_type,
                        db_name: records[0].db_name,
                        image_link: records[0].image_link,
                        year: givenYear,
                        employee_status:  records[0].employee_status,//records[records.length-1].employee_status
                        target: yearTarget,
                        shipok: yearShipok,
                        remain: remainUnits,
                        percentage: yearPercentage
               
                    }
              // if agent_id is not empty push the records as well 
              agentTotalTargetForYear.push(agentYear)    
              if(agent_id != "" &&  Number(agent_id) === agentYear.id){
                return {
                       'total_target_shipok_year' :  agentTotalTargetForYear,
                        'records': records,
                }
                
              }
                
           }   
           return agentTotalTargetForYear   
         
  }

   const getWholeNumberPercentage = (target,shipok) => {
                //  {{ target_shipok.total_target > 0 ? Math.round(((Number(target_shipok.total_ship_ok) / Number(target_shipok.total_target)) * 100 )) + '%' : '0%' }} 
                if (Number(target) !=0 && Number(shipok) != 0){
                    const percentage =((shipok / target) * 100).toFixed(2)
                    const roundOff = Math.round(percentage)
                    return roundOff + '%'
                }
                return '0%'
   }

    let individualTargets
    let individualTargetsYearMap
    let year_summary =  req.query.year_summary == 'true'   ? true: false
    let fullyear =  req.query.fullyear == 'true'  ? true : false
    let agent_id = req.query.agent_id ? req.req.agent_id : ""
    


    if (dashboarOption == 'individual'){
   
         if((loginUser.role =='admin' && loginUser.login_type == 'standarduser') || (loginUser.role =='poweruser' && loginUser.login_type == 'standarduser') || (loginUser.role == 'manager' && loginUser.agent_type == 2 ) ){

             if(!year_summary){
                individualTargets  =  await  fetchIndividualTargetShipok("", `${dashboarddMasterQuery}  ORDER BY team_id ASC;`, givenMonth, givenYear)
                individualTargets = individualTargets.filter(agent => agent.target != 0)

             }else{
      
                       
                
                if(fullyear && agent_id != ""){
                   
                    individualTargetsYearMap = await fetchIndividualTargetShipokYear(agent_id, `${dashboarddMasterQuery} AND sa.id=?`, givenYear)

                    const  agentData =  getTotalTargetShipok(agent_id,individualTargetsYearMap) //expect for object
                    dashboard.data = {
                        'total_target_shipok_year' : agentData['total_target_shipok_year'], 
                        'records': agentData['records']
                    }
                   
                     if(req.export_to_excel){
                        req.dashboard = dashboard
                        req.year_summary = false
                        req.fullyear = fullyear
                        req.agentId = agent_id
                        next()
                     }else{
                         return res.status(200).json(dashboard)
                     }
                  

                }else{
                   
                     individualTargetsYearMap = await fetchIndividualTargetShipokYear("", `${dashboarddMasterQuery}  ORDER BY team_id ASC;`, givenYear)
                      dashboard.data  = getTotalTargetShipok("",individualTargetsYearMap).sort((a, b) => b.agent_type - a.agent_type)

                     if(req.export_to_excel){
                        req.dashboard = dashboard
                        req.year_summary = year_summary
                        req.fullyear = fullyear
                         req.agentId = agent_id
                        next()
                     }else{
                         return res.status(200).json(dashboard)
                     }
                    
                }
            
             }

     
         }else{
            
                individualTargets  =  await  fetchIndividualTargetShipok(loginUser.login_id, `${dashboarddMasterQuery} AND sa.id=?`, givenMonth, givenYear)
         }
  
         // transform total_target and total_ship_ok value of null to 0
         dashboard.data = individualTargets.map(item => ({
            ...item,
            total_target: item.target == null ? 0: item.target,
            total_shipok: item.shipok == null ? 0 : item.shipok,
            month: item.month == null ? givenMonth : item.month,
            year: item.year == null ? givenYear : item.year,
         }))

      
      }else if (dashboarOption == 'team'){
        let teamTargets = []
      
        if((loginUser.role =='admin' && loginUser.login_type == 'standarduser') || (loginUser.role =='poweruser' && loginUser.login_type == 'standarduser') || (loginUser.role == 'manager' && loginUser.agent_type == 2 ) ){


          const [result] = await pool.execute(
                dashboarddMasterQuery,
              [ givenMonth, givenYear,snapshot, snapshot, snapshot, snapshot, snapshot, snapshot, givenMonth, givenYear]
            )
        
          teamTargets = fetchTeamTargetShipok(result, givenMonth, givenYear)
          
        
         dashboard.data = teamTargets
        
        //get the specific market plus get the agents that belong to the market
        }else {
         

            const [result] = await pool.execute(
                `${dashboarddMasterQuery} AND t.id=?`,
              [ givenMonth, givenYear, snapshot, snapshot, snapshot, snapshot, snapshot, snapshot, givenMonth, givenYear, loginUser.team_id]
            )

         teamTargets = fetchTeamTargetShipok(result, givenMonth, givenYear)
         dashboard.data = teamTargets
  
        }

      }else if ( dashboarOption == 'overall'){
           let overAllTargets = []
           let targetWithTrucks = []
           let targetWithoutTrucks = []
           const [result] = await pool.execute(
                dashboarddMasterQuery,
              [ givenMonth, givenYear,snapshot, snapshot, snapshot, snapshot, snapshot, snapshot, givenMonth, givenYear]
            )
        
        let teamTargets = fetchTeamTargetShipok(result, givenMonth, givenYear)

       

        targetWithTrucks = teamTargets.map(({ teammembers, ...rest}) => rest).reduce((acc, team) => {
            let overTeam = 'overall'
            
            if(!acc[overTeam]){
                acc[overTeam] = {
                    month: givenMonth, 
                    year: givenYear,
                    total_target: 0, //Number(team.total_target || 0),
                    total_shipok: 0, //Number(team.total_shipok || 0),
                    team_name: 'overll market',
                    team: [],
                }
              
            }
            acc[overTeam].total_target += Number(team.total_target || 0)
            acc[overTeam].total_shipok += Number(team.total_shipok || 0) 
            acc[overTeam].team.push(team)

            return acc
        },{})

       
        //get the truck market
        let  getTheTrucks = teamTargets.filter(team => team.team_id !== 5)

    
        targetWithoutTrucks = getTheTrucks.map(({teammembers, ...rest})=> rest).reduce((acc, team) => {
            let overTeam = 'overall'
            if(!acc[overTeam]){
                acc[overTeam] = {
                    month: givenMonth, 
                    year: givenYear,
                    total_target: 0, //Number(team.total_target || 0),
                    total_shipok: 0, //Number(team.total_shipok || 0),
                    team_name: 'overll market',
                    
                }
              
            }
            acc[overTeam].total_target += Number(team.total_target || 0)
            acc[overTeam].total_shipok += Number(team.total_shipok || 0) 
            // acc[overTeam].team.push(team)

            return acc

        }, {})


      
        targetWithTrucks = Object.values(targetWithTrucks)
        targetWithoutTrucks = Object.values(targetWithoutTrucks)



        overAllTargets.push(targetWithTrucks[0])
        overAllTargets.push(targetWithoutTrucks[0])
    
        dashboard.data = overAllTargets


      }

      console.log(dashboard)
      if(req.export_to_excel){
        req.dashboard = dashboard
        req.year_summary =  year_summary 
        req.fullyear = fullyear
         req.agentId = agent_id
        next()
      }else{
        return res.status(200).json(dashboard)
 
      }
      
    }
    catch(error){
        
        console.error('Error in fetching sales dashboard', error)
        res.status(500).json({error: 'Error, Cannot Fetch sales dashboard..'})

   }

}


//note for dashboard
/* if dashboardoption is 'individual'  
     if admin -> get all individual target/shipok 
     if manager type 1 -> get all individual that belong to the markert or team
     if user -> get single target/shipok
*/

/*
  if dashboardoption is 'team' 
  if admin -> get all market/team target/shipok + get all individual  target/shipok that belong to the market or team
  if user and manager type -> get market or team target/shipok + get all individual that belong to the markert or team
*/


/*
  if dashboardoption is 'overall'
  get overall target/shipok  + get all market/team 
*/

