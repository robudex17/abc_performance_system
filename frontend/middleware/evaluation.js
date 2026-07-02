exports.importSalesEvaluationData = async (req, res, io) => {
 const duplicateAction = req.query.duplicateAction || 'skip'; // 'skip' | 'update' | 'replace'

  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];

    if (!/^evaluation$/i.test(sheetName)) {
      return res.status(400).json({
        error: `Invalid sheet name: "${sheetName}". Sheet name must be 'evaluation' (case-insensitive).`,
        sheetName
      });
    }

    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    if (data.length === 0) {
      return res.status(400).json({ error: "Sheet is empty", sheetName });
    }

    const requiredFields = ['YEAR', 'MONTH', 'TARGET', 'SHIPOK', 'NEW DEPOSIT', 'ABSENCES', 'TARDINESS', 'MEMO', 'FEEDBACK',  'AGENT_ID'];

    let targetShipokStats = initStats(data.length);
    let newDepositStats = initStats(data.length);

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      // Check for missing fields
      const missingFields = requiredFields.filter(f => !Object.keys(row).includes(f));
      if (missingFields.length > 0) {
        targetShipokStats.emptyValuesCount++;
        newDepositStats.emptyValuesCount++;
        continue;
      }

      // Check if agent exists
      const [agentResult] = await pool.execute(
        "SELECT market_id FROM sales_agents WHERE id = ?",
        [row.AGENT_ID]
      );
      if (agentResult.length === 0) {
        targetShipokStats.notRegisteredAgentCount++;
        newDepositStats.notRegisteredAgentCount++;
        continue;
      }

      const marketId = agentResult[0].market_id;
      const currentDate = getCurrentDate();

      // ===============================
      // Process TargetShipok part
      // ===============================
      const [targetCheck] = await pool.execute(
        "SELECT COUNT(*) AS count FROM target_shipok WHERE agent_id = ? AND month = ? AND year = ?",
        [row.AGENT_ID, row.MONTH, row.YEAR]
      );
      
      const isDuplicateTargetShipok = targetCheck[0].count > 0
      if (isDuplicateTargetShipok) {
        if (duplicateAction === 'update') {
            await pool.execute(
            `UPDATE target_shipok SET date=?, target=?, ship_ok=?, market_id=? 
            WHERE agent_id=? AND month=? AND year=?`,
            [currentDate, row.TARGET, row.SHIPOK, marketId, row.AGENT_ID, row.MONTH, row.YEAR]
            );
            targetShipokStats.updatedCount++;
        } else if (duplicateAction === 'replace') {
            await pool.execute(
            `DELETE FROM target_shipok WHERE agent_id = ? AND month = ? AND year = ?`,
            [row.AGENT_ID, row.MONTH, row.YEAR]
            );
            await pool.execute(
            `INSERT INTO target_shipok (agent_id, month, year, date, target, ship_ok, market_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [row.AGENT_ID, row.MONTH, row.YEAR, currentDate, row.TARGET, row.SHIPOK, marketId]
            );
            targetShipokStats.replacedCount++;
        } else {
            targetShipokStats.duplicateSkippedCount++;
        }
     }
     else{
            await pool.execute(
            `INSERT INTO target_shipok (agent_id, month, year, date, target, ship_ok, market_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [row.AGENT_ID, row.MONTH, row.YEAR, currentDate, row.TARGET, row.SHIPOK, marketId]
            );
            targetShipokStats.insertedCount++;
        }


      // ===============================
      // Process NewDeposit part
      // ===============================
      const [depositCheck] = await pool.execute(
        "SELECT COUNT(*) AS count FROM new_deposit WHERE agent_id = ? AND month = ? AND year = ?",
        [row.AGENT_ID, row.MONTH, row.YEAR]
      );

      const isDuplicateNewDeposit = depositCheck[0].count == parseFloat(row['NEW DEPOSIT'])

     if (isDuplicateNewDeposit) {
        if (duplicateAction === 'update') {
            const [result] = await pool.execute(
            `UPDATE new_deposit SET date=?, market_id=?, description=?
            WHERE agent_id = ? AND month = ? AND year = ?`,
            [currentDate, marketId, `New Deposit For New Customer(updated)- ${currentDate}`, row.AGENT_ID, row.MONTH, row.YEAR]
            );
            newDepositStats.updatedCount += result.affectedRows;
        } else if (duplicateAction === 'replace') {
            await pool.execute(
            `DELETE FROM new_deposit WHERE agent_id = ? AND month = ? AND year = ?`,
            [row.AGENT_ID, row.MONTH, row.YEAR]
            );
            for (let k = 0; k < row['NEW DEPOSIT']; k++) {
            await pool.execute(
                `INSERT INTO new_deposit (agent_id, month, year, date, market_id, new_deposit, description)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [row.AGENT_ID, row.MONTH, row.YEAR, currentDate, marketId, 100000, `New Deposit For New Customer (replaced) ${currentDate}`]
            );
            newDepositStats.replacedCount++;
            }
                } else {
                    newDepositStats.duplicateSkippedCount++;
                }
     }else{
                let toInsert = 0
                if(row['NEW DEPOSIT'] > depositCheck[0].count){
                toInsert = row['NEW DEPOSIT'] - parseInt(depositCheck[0].count)
                
                }else{
                toInsert = row['NEW DEPOSIT'] 
                }
                if(depositCheck[0].count > row['NEW DEPOSIT']){
                
                continue
                }
                for (let i = 0 ; i<toInsert ; i++){
                await pool.execute(
                    `INSERT INTO new_deposit (agent_id, month, year, date,  market_id , new_deposit, description)
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [row.AGENT_ID, row.MONTH, row.YEAR, currentDate,  marketId, 100000, `New Deposit For New Customer - ${currentDate}`]
                );
                newDepositStats.insertedCount++;
                }
        }

  
      // Emit progress for frontend
      emitProgress(io, i, data.length, { targetShipokStats, newDepositStats });
    }

    res.json({
      message: "Upload completed",
      targetShipokStats,
      newDepositStats
    });

  } catch (err) {
    console.error("Error processing file:", err);
    res.status(500).send("Error processing file: " + err.message);
  }
};

// ================= Utility Functions =================
function initStats(total) {
  return {
    totalRecords: total,
    insertedCount: 0,
    updatedCount: 0,
    replacedCount: 0,
    duplicateSkippedCount: 0,
    notRegisteredAgentCount: 0,
    emptyValuesCount: 0
  };
}

function emitProgress(io, index, total, stats) {
  const progress = Math.round(((index + 1) / total) * 100);
  io.emit("uploadProgress", { progress, ...stats });
}

function getCurrentDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
