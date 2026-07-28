const pool =  require('../config/db')
const { validationResult } = require('express-validator')


// Will remove this later
exports.fetchAgentMarket = async (req, res, next) => {


    // const connection =  await pool.getConnection()

    const [result] = await pool.execute(
        'SELECT id,market_name FROM `market`'  
    )
    // connection.release()
    res.json(result)
}


exports.fetchMarkets = async (req, res, next) => {

    
    // const connection =  await pool.getConnection()

    const marketId = req.params.market_id 
    const marketStatus = req.query.market_status
   
    if(marketId){
         const [result] = await pool.execute(
        `SELECT *  FROM markets WHERE id=?,`[marketId]  
    )
    // connection.release()
      return res.json(result)
    }
     
    if(marketStatus && marketStatus== 1 ){
        const [result] = await pool.execute(
       `SELECT *  FROM markets WHERE status=?`,[marketStatus]  
   )
       return res.json(result)
   }


    const [result] = await pool.execute(
        'SELECT *  FROM `markets`'  
    )
    // connection.release()
    
   return res.json(result)
}


exports.addUpdateDeleteMarket = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let query;
    let valuesOfQuestionMark;
    let errorMessage;
    let successMessage;
    const httpMethd = req.method;

    try {
        if (httpMethd === 'POST') {
            const { name } = req.body;

            // Check if market with same name (case-insensitive) and active already exists
            const [existing] = await pool.execute(
                `SELECT * FROM markets WHERE LOWER(name) = LOWER(?) AND status = 1`,
                [name]
            );

            if (existing.length > 0) {
                return res.status(400).json({ error: `Market "${name}" already exists and is active.` });
            }

            query = `INSERT INTO markets (name) VALUES (?)`;
            valuesOfQuestionMark = [name];
            successMessage = `New Market: ${name} is created or recorded`;
            errorMessage = `Error inserting new Market`;

        } else if (httpMethd === 'PUT') {
            const { id, name, status } = req.body;

            // Check if this market is dismantled already
            const [rows] = await pool.execute(`SELECT status FROM markets WHERE id = ?`, [id]);

            if (rows.length === 0) {
                return res.status(404).json({ error: `Market with ID ${id} not found.` });
            }

            if (rows[0].status === 0) {
                return res.status(400).json({ error: `Market with ID ${id} is already dismantled and cannot be updated.` });
            }

            query = `UPDATE markets SET name = ?, status = ? WHERE id = ?`;
            valuesOfQuestionMark = [name, status, id];
            successMessage = `Market Name is set to ${name} and status is set to ${status}`;
            errorMessage = `Error in updating Market Record`;

        } else if (httpMethd === 'DELETE') {
            const { marketId } = req.body;
            query = `DELETE FROM markets WHERE id = ?`;
            valuesOfQuestionMark = [marketId];
            successMessage = `Market: ${marketId} is deleted`;
            errorMessage = `Error deleting Market`;
        }

        const [result] = await pool.execute(query, valuesOfQuestionMark);

        res.status(201).json({
            message: successMessage
        });

    } catch (error) {
        console.error(errorMessage, error);
        res.status(500).json({ error: `Database Error, ${errorMessage}` });
    }
};


exports.fetchAgentMarketTargetShipok = async (req, res, next)  => {
   
   const export_to_excel = req.export_to_excel

   const errors = validationResult(req)
   
     if (!errors.isEmpty()) {
           return res.status(400).json({ errors: errors.array() });
    }
    let givenMonth
    let givenYear 
    const currentDate = new Date()
 
    if (!req.query.month ||  req.query.month ==="") {
        
            // Get the month name
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        givenMonth = monthNames[currentDate.getMonth()]; // getMonth() returns 0-based index
    }else {
        givenMonth = req.query.month
    }
    
    if(!req.query.year || req.query.year ===""){
        givenYear = currentDate.getFullYear()
    }else {
        givenYear = req.query.year
    }

    if(!req.query.withTrucks || req.query.withTrucks === ""){
        withTrucks = true      
      }else{
        withTrucks = req.query.withTrucks
      }


    
     let query 
     if (withTrucks === "true" || withTrucks === true){
        query = `
            SELECT 
                    market.id AS market_id,
                    market.market_name, 
                    COALESCE(ts.year, ?) AS year, 
                    COALESCE(ts.month, ?) AS month, 
                    COALESCE(SUM(ts.target), 0) AS total_target, 
                    COALESCE(SUM(ts.ship_ok), 0) AS total_ship_ok,
                    COALESCE(SUM(ts.target), 0) - COALESCE(SUM(ts.ship_ok), 0) AS shortage,
                    COALESCE(ROUND((SUM(ts.ship_ok) / NULLIF(SUM(ts.target), 0)) * 100, 0), 0) AS achievement
                FROM market
                LEFT JOIN target_shipok ts ON market.id = ts.market_id 
                    AND ts.year = ?
                    AND ts.month = ?
                WHERE market.market_name <> 'all_market' 
                GROUP BY market.id, market.market_name, ts.year, ts.month;        
        `
     }else {
        query = `
            SELECT 
                    market.id AS market_id,
                    market.market_name, 
                    COALESCE(ts.year, ?) AS year, 
                    COALESCE(ts.month, ?) AS month, 
                    COALESCE(SUM(ts.target), 0) AS total_target, 
                    COALESCE(SUM(ts.ship_ok), 0) AS total_ship_ok,
                    COALESCE(SUM(ts.target), 0) - COALESCE(SUM(ts.ship_ok), 0) AS shortage,
                    COALESCE(ROUND((SUM(ts.ship_ok) / NULLIF(SUM(ts.target), 0)) * 100, 0), 0) AS achievement
                FROM market
                LEFT JOIN target_shipok ts ON market.id = ts.market_id 
                    AND ts.year = ?
                    AND ts.month = ?
                WHERE market.market_name <> 'all_market' AND  market.market_name <> 'trucks'
                GROUP BY market.id, market.market_name, ts.year, ts.month;        
        `        
        
     }


     try {
        
        const [result]  = await pool.execute(query, [givenYear, givenMonth, givenYear, givenMonth])
        if(export_to_excel){
            req.month_market_target_shipok = result
            next()
        }else{
            res.json(result)
        }
        
        
    }catch(error){
        console.error(`Cannot fetch target shipok per market`, error)
        res.status(500).json({message: 'Cannot fetch target shipok per market'})
    }  

     
}


exports.fetchAgentMarketTargetShipokYear = async (req, res, next)  => {
   
    const export_to_excel = req.export_to_excel
    const errors = validationResult(req)
    
      if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
     }
     
     let givenYear 
     const currentDate = new Date()
  
 
     if(!req.query.year || req.query.year ===""){
         givenYear = currentDate.getFullYear()
     }else {
         givenYear = req.query.year
     }
 
     if(!req.query.withTrucks || req.query.withTrucks === ""){
         withTrucks = true      
       }else{
         withTrucks = req.query.withTrucks
       }
 
      let query 
      if (withTrucks === "true" || withTrucks === true){
         query = `
             SELECT 
                     market.id AS market_id,
                     market.market_name, 
                     COALESCE(ts.year, ?) AS year, 
                     COALESCE(SUM(ts.target), 0) AS total_target, 
                     COALESCE(SUM(ts.ship_ok), 0) AS total_ship_ok,
                     COALESCE(SUM(ts.target), 0) - COALESCE(SUM(ts.ship_ok), 0) AS shortage,
                     COALESCE(ROUND((SUM(ts.ship_ok) / NULLIF(SUM(ts.target), 0)) * 100, 0), 0) AS achievement
                 FROM market
                 LEFT JOIN target_shipok ts ON market.id = ts.market_id 
                     AND ts.year = ?
                   
                 WHERE market.market_name <> 'all_market' 
                 GROUP BY market.id, market.market_name, ts.year;       
         `
      }else {
         query = `
             SELECT 
                     market.id AS market_id,
                     market.market_name, 
                     COALESCE(ts.year, ?) AS year, 
                     COALESCE(SUM(ts.target), 0) AS total_target, 
                     COALESCE(SUM(ts.ship_ok), 0) AS total_ship_ok,
                     COALESCE(SUM(ts.target), 0) - COALESCE(SUM(ts.ship_ok), 0) AS shortage,
                     COALESCE(ROUND((SUM(ts.ship_ok) / NULLIF(SUM(ts.target), 0)) * 100, 0), 0) AS achievement
                 FROM market
                 LEFT JOIN target_shipok ts ON market.id = ts.market_id 
                     AND ts.year = ?
                 WHERE market.market_name <> 'all_market' AND  market.market_name <> 'trucks'
                 GROUP BY market.id, market.market_name, ts.year;       
         `        
         
      }
 
 
      try {
         
         const [result]  = await pool.execute(query, [givenYear, givenYear])
         if(export_to_excel){
            req.year_market_target_shipok = result
            next()
         }else{
            res.json(result)
         }  
         
         
     }catch(error){
         console.error(`Cannot fetch target shipok per market`, error)
         res.status(500).json({message: 'Cannot fetch target shipok per market'})
     }  
 
      
 }

exports.fetchAgentMarketNewDeposit = async (req, res, next)  => {
    const errors = validationResult(req)
    const export_to_excel = req.export_to_excel
    if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
   }
   
    let givenMonth
    let givenYear 
    const currentDate = new Date()
 
    if (!req.query.month ||  req.query.month ==="") {
        
            // Get the month name
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        givenMonth = monthNames[currentDate.getMonth()]; // getMonth() returns 0-based index
    }else {
        givenMonth = req.query.month
    }
    
    if(!req.query.year || req.query.year ===""){
        givenYear = currentDate.getFullYear()
    }else {
        givenYear = req.query.year
    }
    
    let query 
    if (withTrucks === "true" || withTrucks === true){
        query  = `
        SELECT 
            market.id as market_id,  
            market.market_name, 
            IFNULL(nd.year, ?) AS year, 
            IFNULL(nd.month, ?) AS month, 
            IFNULL(nd.new_deposit, 0) AS new_deposit
        FROM market 
        LEFT JOIN (
            SELECT market_id, year, month, COUNT(*) AS new_deposit 
            FROM new_deposit 
            WHERE month = ? AND year = ?  -- Filtering inside subquery
            GROUP BY market_id, year, month
        ) nd ON market.id = nd.market_id
        WHERE market.market_name <> 'all_market';        
        `
    }else {
        query  = `
        SELECT 
            market.id as market_id,  
            market.market_name, 
            IFNULL(nd.year, ?) AS year, 
            IFNULL(nd.month, ?) AS month, 
            IFNULL(nd.new_deposit, 0) AS new_deposit
        FROM market 
        LEFT JOIN (
            SELECT market_id, year, month, COUNT(*) AS new_deposit 
            FROM new_deposit 
            WHERE month = ? AND year = ?  -- Filtering inside subquery
            GROUP BY market_id, year, month
        ) nd ON market.id = nd.market_id
        WHERE market.market_name <> 'all_market' AND market.market_name <> 'trucks'     
        `        
    }

     try {
        
        const [result]  = await pool.execute(query, [ givenYear, givenMonth,givenMonth, givenYear])
        if(export_to_excel){
            req.month_market_new_deposit = result
            next()
        }else{
            res.json(result)
        }
        
        
    }catch(error){
        console.error(`Cannot fetch new deposit per market`, error)
        res.status(500).json({message: 'Cannot fetch new deposit per market'})
    }  

     
}


exports.fetchAgentMarketNewDepositYear = async (req, res, next)  => {
    const errors = validationResult(req)
    const export_to_excel = req.export_to_excel
    if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
   }
   
 
    let givenYear 
    const currentDate = new Date()
 

    
    if(!req.query.year || req.query.year ===""){
        givenYear = currentDate.getFullYear()
    }else {
        givenYear = req.query.year
    }
    
    let query 
    if (withTrucks === "true" || withTrucks === true){
        query  = `
        SELECT 
            market.id as market_id,  
            market.market_name, 
            IFNULL(nd.year, ?) AS year, 
            IFNULL(nd.new_deposit, 0) AS new_deposit
        FROM market 
        LEFT JOIN (
            SELECT market_id, year, month, COUNT(*) AS new_deposit 
            FROM new_deposit 
            WHERE  year = ?  -- Filtering inside subquery
            GROUP BY market_id, year
        ) nd ON market.id = nd.market_id
        WHERE market.market_name <> 'all_market';        
        `
    }else {
        query  = `
        SELECT 
            market.id as market_id,  
            market.market_name, 
            IFNULL(nd.year, ?) AS year, 
            IFNULL(nd.new_deposit, 0) AS new_deposit
        FROM market 
        LEFT JOIN (
            SELECT market_id, year, month, COUNT(*) AS new_deposit 
            FROM new_deposit 
            WHERE  year = ?  -- Filtering inside subquery
            GROUP BY market_id, year
        ) nd ON market.id = nd.market_id
        WHERE market.market_name <> 'all_market' AND market.market_name <> 'trucks'     
        `        
    }

     try {
        
        const [result]  = await pool.execute(query, [ givenYear, givenYear])
        if(export_to_excel){
            req.year_market_new_deposit = result 
            next()
        }else {
            res.json(result)
        }
       
        
    }catch(error){
        console.error(`Cannot fetch new deposit per market`, error)
        res.status(500).json({message: 'Cannot fetch new deposit per market'})
    }  

     
}








