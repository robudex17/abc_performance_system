const  pool = require('../config/db')

const { validationResult } = require('express-validator')

const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

exports.fetchAnalytics = async (req,res, next) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const currentDate = new Date()

    const scope = req.params.scope

    let givenYear 

    if(!req.query.year || req.query.year ===""){
        givenYear = currentDate.getFullYear()
    }else {
        givenYear = req.query.year
    }

    let connection 


    try {
        connection = await pool.getConnection()
       let query 

     if(scope == 'market'){
        query = `SELECT 
                    sa.market_id AS market_id,
                    m.market_name AS market_name,
                    ts.year AS year,
                    ts.month AS month,
                    GROUP_CONCAT(DISTINCT sa.db_name ORDER BY sa.db_name) AS db_names,  -- Concatenate db_names into a list
                    SUM(ts.target) AS total_target,
                    SUM(ts.ship_ok) AS total_shipok,
                    COALESCE(SUM(nd.new_deposit), 0) AS total_new_deposit,
                    COALESCE(SUM(ab.absences), 0) AS total_absences,
                    COALESCE(SUM(mo.memo_count), 0) AS total_memo_count,
                    COALESCE(SUM(td.tardiness_count), 0) AS total_tardiness_count
                FROM sales_agents sa 
                LEFT JOIN market m
                    ON sa.market_id = m.id
                LEFT JOIN target_shipok ts
                    ON sa.id = ts.agent_id
                LEFT JOIN (
                    SELECT 
                        agent_id, 
                        COUNT(*) AS new_deposit,
                        year,
                        month
                    FROM new_deposit
                    WHERE 
                        year = ?
                    GROUP BY agent_id, year, month
                ) nd
                    ON sa.id = nd.agent_id AND ts.year = nd.year AND ts.month = nd.month
                LEFT JOIN (
                    SELECT 
                        agent_id, 
                        COUNT(*) AS absences,
                        year,
                        month
                    FROM absences
                    WHERE 
                        year = ?
                    GROUP BY agent_id, year, month
                ) ab
                    ON sa.id = ab.agent_id AND ts.year = ab.year AND ts.month = ab.month
                LEFT JOIN (
                    SELECT 
                        agent_id, 
                        COUNT(*) AS memo_count,
                        year,
                        month
                    FROM memo
                    WHERE 
                        year = ?
                    GROUP BY agent_id, year, month
                ) mo
                    ON sa.id = mo.agent_id AND ts.year = mo.year AND ts.month = mo.month
                LEFT JOIN (
                    SELECT 
                        agent_id, 
                        COUNT(*) AS tardiness_count,
                        year,
                        month
                    FROM tardiness
                    WHERE 
                        year = ?
                    GROUP BY agent_id, year, month
                ) td
                    ON sa.id = td.agent_id AND ts.year = td.year AND ts.month = td.month
                WHERE 
                    ts.year = ?
                GROUP BY 
                    sa.market_id, m.market_name, ts.year, ts.month
                ORDER BY 
                    ts.year, ts.month, sa.market_id
            `
     }else if (scope == 'agents'){
        query = ` SELECT 
                    sa.id AS agent_id,
                    sa.db_name AS db_name,
                    sa.market_id AS market_id,
                    m.market_name AS market_name,
                    ts.year AS year,
                    ts.month AS month,
                    SUM(ts.target) AS total_target,
                    SUM(ts.ship_ok) AS total_shipok,
                    COALESCE(SUM(nd.new_deposit), 0) AS total_new_deposit,
                    COALESCE(SUM(ab.absences), 0) AS total_absences,
                    COALESCE(SUM(mo.memo_count), 0) AS total_memo_count,
                            COALESCE(SUM(td.tardiness_count), 0) AS total_tardiness_count
                FROM sales_agents sa 
                LEFT JOIN market m
                    ON sa.market_id = m.id
                LEFT JOIN target_shipok ts
                    ON sa.id = ts.agent_id
                LEFT JOIN (
                    SELECT 
                        agent_id, 
                        COUNT(*) AS new_deposit,
                        year,
                        month
                    FROM new_deposit
                    WHERE 
                        year =? 
                    GROUP BY agent_id, year, month
                ) nd
                    ON sa.id = nd.agent_id AND ts.year = nd.year AND ts.month = nd.month
                LEFT JOIN (
                    SELECT 
                        agent_id, 
                        COUNT(*) AS absences,
                        year,
                        month
                    FROM absences
                    WHERE 
                        year=? 
                    GROUP BY agent_id, year, month
                ) ab
                    ON sa.id = ab.agent_id AND ts.year = ab.year AND ts.month = ab.month
                LEFT JOIN (
                    SELECT 
                        agent_id, 
                        COUNT(*) AS memo_count,
                        year,
                        month
                    FROM memo
                    WHERE 
                        year=? 
                    GROUP BY agent_id, year, month
                ) mo
                    ON sa.id = mo.agent_id AND ts.year = mo.year AND ts.month = mo.month
                LEFT JOIN (
                    SELECT 
                        agent_id, 
                        COUNT(*) AS tardiness_count,
                        year,
                        month
                    FROM tardiness
                    WHERE 
                        year =?
                    GROUP BY agent_id, year, month
                ) td
                    ON sa.id = td.agent_id AND ts.year = td.year AND ts.month = td.month
                WHERE 
                    ts.year=?
                GROUP BY 
                    sa.id, sa.db_name, sa.market_id, m.market_name, ts.year, ts.month
                ORDER BY 
                    ts.year, ts.month, sa.id

              `
     }else if (scope == 'overall'){
        query = `   SELECT 
                        ts.month AS month,
                        ts.year AS year,
                        SUM(ts.target) AS total_target,
                        SUM(ts.ship_ok) AS total_shipok,
                        COALESCE(SUM(nd.new_deposit), 0) AS total_new_deposit,
                        COALESCE(SUM(ab.absences), 0) AS total_absences,
                        COALESCE(SUM(mo.memo_count), 0) AS total_memo_count,
                        COALESCE(SUM(td.tardiness_count), 0) AS total_tardiness_count
                    FROM target_shipok ts
                    LEFT JOIN sales_agents sa
                        ON sa.id = ts.agent_id
                    LEFT JOIN market m
                        ON sa.market_id = m.id
                    LEFT JOIN (
                        SELECT 
                            agent_id, 
                            COUNT(*) AS new_deposit,
                            year,
                            month
                        FROM new_deposit
                        WHERE 
                            year = ?
                        GROUP BY agent_id, year, month
                    ) nd
                        ON sa.id = nd.agent_id AND ts.year = nd.year AND ts.month = nd.month
                    LEFT JOIN (
                        SELECT 
                            agent_id, 
                            COUNT(*) AS absences,
                            year,
                            month
                        FROM absences
                        WHERE 
                            year = ?
                        GROUP BY agent_id, year, month
                    ) ab
                        ON sa.id = ab.agent_id AND ts.year = ab.year AND ts.month = ab.month
                    LEFT JOIN (
                        SELECT 
                            agent_id, 
                            COUNT(*) AS memo_count,
                            year,
                            month
                        FROM memo
                        WHERE 
                            year = ?
                        GROUP BY agent_id, year, month
                    ) mo
                        ON sa.id = mo.agent_id AND ts.year = mo.year AND ts.month = mo.month
                    LEFT JOIN (
                        SELECT 
                            agent_id, 
                            COUNT(*) AS tardiness_count,
                            year,
                            month
                        FROM tardiness
                        WHERE 
                            year = ?
                        GROUP BY agent_id, year, month
                    ) td
                        ON sa.id = td.agent_id AND ts.year = td.year AND ts.month = td.month
                    WHERE 
                        ts.year = ?
                    GROUP BY 
                        ts.month
                    ORDER BY 
                        ts.month
 
              `
     }
  
          //fetch current month target and ship ok 
      const [analyticsResult] = await connection.execute(
        query, [givenYear, givenYear, givenYear, givenYear, givenYear]
      )


      connection.release()

      //transform the  return data depend on the specific needs..

      const transformData = []
      if(scope == 'agents'){
        //return the response immediately
        if (analyticsResult.length == 0){
            return res.status(200).json(transformData)
        }
        analyticsResult.map(agentdata => {
            const findAgent = transformData.find(agent => agent.agent_id == agentdata.agent_id)
            if (!findAgent){
                const insertNewAgent = {
                agent_id: agentdata.agent_id,
                db_name: agentdata.db_name,
                ship_ok: [0,0,0,0,0,0,0,0,0,0,0,0],
                target: [0,0,0,0,0,0,0,0,0,0,0,0],
                new_deposit: [0,0,0,0,0,0,0,0,0,0,0,0],
                absences: [0,0,0,0,0,0,0,0,0,0,0,0],
                tardiness: [0,0,0,0,0,0,0,0,0,0,0,0],
                memos: [0,0,0,0,0,0,0,0,0,0,0,0],
                market_id: agentdata.market_id,
                market_name: agentdata.market_name,
                month: agentdata.month,
                year: agentdata.year
        
                }
                transformData.push(insertNewAgent)
            
            }    
            const AgentIndex = transformData.findIndex(agent => agent.agent_id == agentdata.agent_id)
        
            const monthIndex =  months.indexOf(agentdata.month)
            
        
            transformData[AgentIndex]['target'][monthIndex] += Number(agentdata.total_target)
            transformData[AgentIndex]['ship_ok'][monthIndex] += Number(agentdata.total_shipok)
            transformData[AgentIndex]['new_deposit'][monthIndex] += Number(agentdata.total_new_deposit)
            transformData[AgentIndex]['absences'][monthIndex] += Number(agentdata.total_absences)
            transformData[AgentIndex]['tardiness'][monthIndex] += Number(agentdata.total_tardiness_count)
            transformData[AgentIndex]['memos'][monthIndex] += Number(agentdata.total_memo_count)
        
        })
    }else if (scope == 'market'){
        if (analyticsResult.length == 0){
            return res.status(200).json(transformData)
        }
        analyticsResult.map(marketData => {
            const findMarket = transformData.find(market => market.market_id == marketData.market_id)

            if (!findMarket){
                const insertNewMarket = {
                    agent_members: marketData.db_names,
                    ship_ok: [0,0,0,0,0,0,0,0,0,0,0,0],
                    target: [0,0,0,0,0,0,0,0,0,0,0,0],
                    new_deposit: [0,0,0,0,0,0,0,0,0,0,0,0],
                    absences: [0,0,0,0,0,0,0,0,0,0,0,0],
                    tardiness: [0,0,0,0,0,0,0,0,0,0,0,0],
                    memos: [0,0,0,0,0,0,0,0,0,0,0,0],
                    market_id: marketData.market_id,
                    market_name: marketData.market_name,
                    year: marketData.year
                    
                }
                transformData.push(insertNewMarket)
                
            }

            const marketIndex = transformData.findIndex(market => market.market_id == marketData.market_id)
        
            const monthIndex =  months.indexOf(marketData.month)
            
        
            transformData[marketIndex]['target'][monthIndex] += Number(marketData.total_target)
            transformData[marketIndex]['ship_ok'][monthIndex] += Number(marketData.total_shipok)
            transformData[marketIndex]['new_deposit'][monthIndex] += Number(marketData.total_new_deposit)
            transformData[marketIndex]['absences'][monthIndex] += Number(marketData.total_absences)
            transformData[marketIndex]['tardiness'][monthIndex] += Number(marketData.total_tardiness_count)
            transformData[marketIndex]['memos'][monthIndex] += Number(marketData.total_memo_count)
        })
    }else if (scope == 'overall'){
          //return the response immediately
          if (analyticsResult.length == 0){
            return res.status(200).json(transformData)
        }
        const overallData = {
            ship_ok: [0,0,0,0,0,0,0,0,0,0,0,0],
            target: [0,0,0,0,0,0,0,0,0,0,0,0],
            new_deposit: [0,0,0,0,0,0,0,0,0,0,0,0],
            absences: [0,0,0,0,0,0,0,0,0,0,0,0],
            tardiness: [0,0,0,0,0,0,0,0,0,0,0,0],
            memos: [0,0,0,0,0,0,0,0,0,0,0,0],
        }

        transformData.push(overallData)

       
        analyticsResult.map(data => {

            const monthIndex =  months.indexOf(data.month)

            transformData[0]['target'][monthIndex] += Number(data.total_target)
            transformData[0]['ship_ok'][monthIndex] += Number(data.total_shipok)
            transformData[0]['new_deposit'][monthIndex] += Number(data.total_new_deposit)
            transformData[0]['absences'][monthIndex] += Number(data.total_absences)
            transformData[0]['tardiness'][monthIndex] += Number(data.total_tardiness_count)
            transformData[0]['memos'][monthIndex] += Number(data.total_memo_count)
        })

    }
       
      res.status(200).json(transformData)

    }catch(error){
        console.error('Error in fetching sales analytics', error)
        res.status(500).json({error: 'Error, Cannot Fetch sales analytics..'})

    }

    // finally {
    //    connection.release()
    // }
}




