const pool =  require('../../config/db')
const { validationResult } = require('express-validator')

// NOTE: `year_month` is a reserved word in MySQL, so it must always be wrapped in backticks.

// GET /none_sales_performance/:employee_id                 -> all months of the employee
// GET /none_sales_performance/:employee_id?year_month=YYYY-MM -> one month only
exports.fetchNoneSalesPerformance = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const employeeId = req.params.employee_id
    const yearMonth = req.query.year_month

    try {
        if (yearMonth) {
            const [result] = await pool.execute(
                `SELECT * FROM none_sales_performance WHERE employee_id = ? AND \`year_month\` = ?`,
                [employeeId, yearMonth]
            )
            return res.json(result)
        }

        const [result] = await pool.execute(
            `SELECT * FROM none_sales_performance WHERE employee_id = ? ORDER BY \`year_month\` DESC`,
            [employeeId]
        )
        return res.json(result)

    } catch (error) {
        console.error('Error fetching none sales performance', error);
        res.status(500).json({ error: 'Database Error, Error fetching none sales performance' });
    }
}


// POST   /none_sales_performance/:employee_id?year_month=YYYY-MM   body: { performance }
// PUT    /none_sales_performance/:employee_id?year_month=YYYY-MM   body: { performance }
// DELETE /none_sales_performance/:employee_id?year_month=YYYY-MM   (no body)
exports.addUpdateDeleteNoneSalesPerformance = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let query;
    let valuesOfQuestionMark;
    let errorMessage;
    let successMessage;
    let successStatus = 200;
    const httpMethd = req.method;

    const employeeId = req.params.employee_id
    const yearMonth = req.query.year_month

    try {
        if (httpMethd === 'POST') {
            const { performance } = req.body;

            // One record per employee per month
            const [existing] = await pool.execute(
                `SELECT id FROM none_sales_performance WHERE employee_id = ? AND \`year_month\` = ?`,
                [employeeId, yearMonth]
            );

            if (existing.length > 0) {
                return res.status(400).json({ error: `Performance for employee ${employeeId} in ${yearMonth} already exists.` });
            }

            query = `INSERT INTO none_sales_performance (employee_id, performance, \`year_month\`) VALUES (?, ?, ?)`;
            valuesOfQuestionMark = [employeeId, performance, yearMonth];
            successMessage = `Performance ${performance} for employee ${employeeId} in ${yearMonth} is recorded`;
            errorMessage = `Error inserting none sales performance`;
            successStatus = 201;

        } else if (httpMethd === 'PUT') {
            const { performance } = req.body;

            const [rows] = await pool.execute(
                `SELECT id FROM none_sales_performance WHERE employee_id = ? AND \`year_month\` = ?`,
                [employeeId, yearMonth]
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: `No performance record for employee ${employeeId} in ${yearMonth}.` });
            }

            query = `UPDATE none_sales_performance SET performance = ? WHERE employee_id = ? AND \`year_month\` = ?`;
            valuesOfQuestionMark = [performance, employeeId, yearMonth];
            successMessage = `Performance for employee ${employeeId} in ${yearMonth} is set to ${performance}`;
            errorMessage = `Error in updating none sales performance`;

        } else if (httpMethd === 'DELETE') {
            const [rows] = await pool.execute(
                `SELECT id FROM none_sales_performance WHERE employee_id = ? AND \`year_month\` = ?`,
                [employeeId, yearMonth]
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: `No performance record for employee ${employeeId} in ${yearMonth}.` });
            }

            query = `DELETE FROM none_sales_performance WHERE employee_id = ? AND \`year_month\` = ?`;
            valuesOfQuestionMark = [employeeId, yearMonth];
            successMessage = `Performance for employee ${employeeId} in ${yearMonth} is deleted`;
            errorMessage = `Error deleting none sales performance`;
        }

        await pool.execute(query, valuesOfQuestionMark);

        res.status(successStatus).json({
            message: successMessage
        });

    } catch (error) {
        // employee_id is a foreign key: inserting for an employee that does not exist
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(404).json({ error: `Employee ${employeeId} not found.` });
        }

        console.error(errorMessage, error);
        res.status(500).json({ error: `Database Error, ${errorMessage}` });
    }
};
