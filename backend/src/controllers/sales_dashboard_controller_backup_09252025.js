const  pool = require('../config/db')

const { validationResult } = require('express-validator')

 const { getAgentsMetrics } = require('./sales_leaderboard_controllers')

exports.fetchAgentDashboard = async (req,res,next) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return res.status(400).json({ errors: errors.array() });
    // }
   
  
    const currentDate = new Date()

    const loginUser = req.user

           // Get the month name
    const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

    const givenMonth = monthNames[currentDate.getMonth()]  // getMonth() returns 0-based index
    // const givenMonth = "June"
    const givenYear =    currentDate.getFullYear()
    const  withTrucks = true
    //const  dashboarOption = req.query.dashboardoption 

    let dashboarOption ;
    if((!req.query.dashboardoption || req.query.dashboardoption == '') ){
        if(loginUser.agent_type == 2){
            dashboarOption = 'team'
        }else{
            dashboarOption = 'individual'
        }
    }else{
        dashboarOption = req.query.dashboardoption
    }


  


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


      

       let queryIndividual;
      if (dashboarOption == 'individual'){
         if((loginUser.role =='admin' && loginUser.login_type == 'standarduser') || (loginUser.role == 'manager' && loginUser.agent_type == 2 ) ){
             queryIndividual =  dashboardQueryForInvidualAgents("sales_agents.id", "!=", 0, "market.market_name")
        
         }else{
            queryIndividual = dashboardQueryForInvidualAgents("sales_agents.id ", "=", loginUser.login_id, "sales_agents.id")
         }
        //  }else if(loginUser.role == 'manager' && loginUser.agent_type == 1){
        //     queryIndividual = dashboardQueryForInvidualAgents("market.id", "=", loginUser.market_id, "sales_agents.id")
  

        //  }else if(loginUser.role == 'user' && loginUser.agent_type == 0) {
        //      queryIndividual = dashboardQueryForInvidualAgents("sales_agents.id ", "=", loginUser.login_id, "sales_agents.id")

        //  }

         const [marketTargetShipok] = await pool.execute(
           queryIndividual,
          [givenMonth, givenYear,givenMonth, givenYear]
        )

        // transform total_target and total_ship_ok value of null to 0
        dashboard.data = marketTargetShipok.map(item => ({
          ...item,
          total_target: item.total_target == null ? 0: item.total_target,
          total_ship_ok: item.total_ship_ok == null ? 0 : item.total_ship_ok,
          month: item.month == null ? givenMonth : item.month,
          year: item.year == null ? givenYear : item.year,
        }))


      
      }else if (dashboarOption == 'team'){
        if((loginUser.role =='admin' && loginUser.login_type == 'standarduser') || (loginUser.role == 'manager' && loginUser.agent_type == 2 ) ){
            
            //fetch the list of market
            const [teams] = await pool.execute(
            'SELECT  * FROM team'
            );

            for (const team of teams) {
            if (team.id == 0 || team.id == 6) { // team is 6 is For the Develeper for testing only
                continue;
            }

            // 1. Query and transform data for the market
            const queryTeam = dashboardQueryForTeams( );

        
           
            const [marketTargetShipok] = await pool.execute(
                queryTeam,
                [givenMonth, givenYear, givenMonth, givenYear, givenMonth, givenYear, team.id]
            );

            console.log(marketTargetShipok)
            

            const marketTransformed = marketTargetShipok.map(item => ({
                ...item,
                total_target: item.total_target == null ? 0 : item.total_target,
                total_ship_ok: item.total_ship_ok == null ? 0 : item.total_ship_ok,
                total_deposit: item.total_deposit == null ? 0 : item.total_deposit,
                month: item.month == null ? givenMonth : item.month,
                year: item.year == null ? givenYear : item.year,
            }));

            console.log('after transformed',marketTransformed)
            

            // 2. Query and transform data for the individual agents (teammembers)
            const queryTeammembers = dashboardQueryForInvidualAgents("market.team_id", "=", team.id, "sales_agents.id");
            const [teammembersRaw] = await pool.execute(
                queryTeammembers,
                [givenMonth, givenYear, givenMonth, givenYear]
            );

            const teammembersTransformed = teammembersRaw.map(agent => ({
                ...agent,
                total_target: agent.total_target == null ? 0 : agent.total_target,
                total_ship_ok: agent.total_ship_ok == null ? 0 : agent.total_ship_ok,
                total_deposit: agent.total_deposit == null ? 0 : agent.total_deposit,
                month: agent.month == null ? givenMonth : agent.month,
                year: agent.year == null ? givenYear : agent.year,
            }));

          
            // 3. Attach to dashboard
            dashboard.data.push({
                ...marketTransformed[0], // assuming only one row per market
                teammembers: teammembersTransformed
            });
        }
        //get the specific market plus get the agents that belong to the market
        }else {
         
            // 1. Query and transform data for the specific market
            const queryMarket = dashboardQueryForMarkets("market.id", "=", loginUser.market_id, "market.id");
            const [marketTargetShipok] = await pool.execute(
            queryMarket,
            [givenMonth, givenYear, givenMonth, givenYear]
            );

            const marketTransformed = marketTargetShipok.map(item => ({
            ...item,
            total_target: item.total_target == null ? 0 : item.total_target,
            total_ship_ok: item.total_ship_ok == null ? 0 : item.total_ship_ok,
            total_deposit: item.total_deposit == null ? 0 : item.total_deposit,
            month: item.month == null ? givenMonth : item.month,
            year: item.year == null ? givenYear : item.year,
            }));

            // 2. Query and transform team members under this market
            const queryTeammembers = dashboardQueryForInvidualAgents("market.id", "=", loginUser.market_id, "sales_agents.id");
            const [teammembersRaw] = await pool.execute(
            queryTeammembers,
            [givenMonth, givenYear, givenMonth, givenYear]
            );

            const teammembersTransformed = teammembersRaw.map(agent => ({
            ...agent,
            total_target: agent.total_target == null ? 0 : agent.total_target,
            total_ship_ok: agent.total_ship_ok == null ? 0 : agent.total_ship_ok,
            total_deposit: agent.total_deposit == null ? 0 : agent.total_deposit,
            month: agent.month == null ? givenMonth : agent.month,
            year: agent.year == null ? givenYear : agent.year,
            }));

            

            // 3. Build dashboard object for single market
            dashboard.data.push({
            ...marketTransformed[0], // assume one row per market
            teammembers: teammembersTransformed})

        }

      }else if ( dashboarOption == 'overall'){
        queryTargetShipok = "SELECT month, year, SUM(target) AS monthly_target, SUM(ship_ok) AS total_shipok FROM `target_shipok` WHERE month=? AND year=? GROUP BY month,year"
        const [overallResult] = await pool.execute(
        queryTargetShipok,
        [givenMonth, givenYear]
        )
            
        const [overallData] = overallResult

        if ( overallData == null || overallData == ""){
          overallData = {month:givenMonth,year: givenYear,monthly_target:"0",total_shipok:"0"}
        }

         // 1. Query and transform data for the market
        const queryTeam = dashboardQueryForMarkets("market.id", "!=", 0 , "market.id");
        const [marketTargetShipok] = await pool.execute(
                queryTeam,
                [givenMonth, givenYear, givenMonth, givenYear]
         );
        
         const marketTransformed = marketTargetShipok.map(item => ({
                ...item,
                total_target: item.total_target == null ? 0 : item.total_target,
                total_ship_ok: item.total_ship_ok == null ? 0 : item.total_ship_ok,
                total_deposit: item.total_deposit == null ? 0 : item.total_deposit,
                month: item.month == null ? givenMonth : item.month,
                year: item.year == null ? givenYear : item.year,
            }));
        // console.log(marketTransformed)
        overallData.team = marketTransformed 
        dashboard.data.push(overallData)

        //ALL TARGET/SHIPOK BUT TRUCKS MARKET EXCLUDED 

        let queryTargetShipokWithoutTrucks = "SELECT month, year, SUM(target) AS monthly_target, SUM(ship_ok) AS total_shipok FROM `target_shipok` WHERE market_id !=10  AND month=? AND year=? GROUP BY month,year"
        const [overallResultWithoutTrucks] = await pool.execute(
        queryTargetShipokWithoutTrucks,
        [givenMonth, givenYear]
        )
            
        const [overallDataWithoutTrucks] = overallResultWithoutTrucks

        if ( overallResultWithoutTrucks == null || overallDataWithoutTrucks == ""){
          overallDataWithoutTrucks = {month:givenMonth,year: givenYear,monthly_target:"0",total_shipok:"0"}
        }
      
     
      dashboard.data.push(overallDataWithoutTrucks)  
    

      }


      console.log(dashboard)
      res.status(200).json(dashboard)


   
      
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

