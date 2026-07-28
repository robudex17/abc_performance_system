
// src/config/db.js
const mysql = require('mysql2/promise');

// Create a connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || '210.1.86.211',
    user: process.env.DB_USER || 'python',
    password: process.env.DB_PASSWORD || 'sbtph@2018',
    database: process.env.DB_NAME || 'sbtph_leaderboard',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000
});


const xlsx = require('xlsx');
const fs = require('fs');

async function addAgentId() {
    const [agentsResults] = await pool.execute("SELECT id,db_name FROM sales_agents WHERE status='active'")

   
    // Read the Excel file
    const workbook = xlsx.readFile('new_deposit.xls');
    const sheetName = workbook.SheetNames[0]; // Assuming the data is in the first sheet
    const sheet = workbook.Sheets[sheetName];
    
    // Convert the sheet data to JSON
    const data = xlsx.utils.sheet_to_json(sheet);
    
    // Iterate over the data and match EMPLOYEE NAME to db_name (case-insensitive)
    data.forEach(row => {
      const employeeName = row['EMPLOYEE NAME'];
    
      const agent = agentsResults.find(agent => agent.db_name.toLowerCase().trim() === (employeeName || '').toLowerCase().trim());
      if (agent) {
        row['AGENT_ID'] = agent.id; // Update AGENT_ID field
      }
    });
    
    // Convert the updated data back to a worksheet
    const updatedSheet = xlsx.utils.json_to_sheet(data);
    
    // Replace the old sheet with the updated one
    workbook.Sheets[sheetName] = updatedSheet;
    
    // Write the updated Excel file
    xlsx.writeFile(workbook, 'new_deposit_updated.xls');
    
    console.log('AGENT_IDs updated successfully!');
}


addAgentId()








