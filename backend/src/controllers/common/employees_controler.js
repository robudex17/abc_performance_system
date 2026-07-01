const e = require('express')
const pool = require('../../config/db')
const { validationResult} = require('express-validator')
const fs = require('fs')
const path = require('path')

exports.fetchEmployees = async (req,res, next ) => {
    

    if(req.user.role=='admin' || req.user.role== 'poweruser' || (req.user.role == 'manager' )) {
        try{
            const employeeStatus = req.query.employee_status || 'Hired'
            const departmentCode = req.params.department_code
  
           console.log('the employee status is ', employeeStatus)

            const [result] = await pool.execute(
                // 'SELECT * FROM  `sales_agents` WHERE status=?',['active']  
                `
                    WITH latest_assignments AS (
                        SELECT *,
                            ROW_NUMBER() OVER (
                                PARTITION BY employee_id 
                                ORDER BY id DESC
                            ) AS rn
                        FROM employee_assignments
                    ),
                    latest_employments AS (
                        SELECT *,
                            ROW_NUMBER() OVER (
                                PARTITION BY employee_id 
                                ORDER BY id DESC
                            ) AS rn
                        FROM employee_employments
                    )

                    SELECT 
                        e.id,
                        e.firstname,
                        e.lastname,
                        e.db_name,
                        e.email,
                        e.image_link,
                        e.extension,

                        p.position_name AS position_name,

                        p.id AS position_id,
                       
                        ea.manager_id,
                        
                        mgr.db_name AS manager_dbname,
                        mp.position_name AS manager_position,

                        m.id AS market_id,
                        m.name AS market_name,

                        t.id AS team_id,
                        t.name AS team_name,

                        d.code AS department_code,
                        d.id AS department_id,

                        el.username,
                        el.status AS login_status,

                        DATE_FORMAT(ea.effective_from, '%Y-%m-%d') AS effective_from,
                        DATE_FORMAT(ea.effective_to, '%Y-%m-%d') AS effective_to,

                        DATE_FORMAT(ee.start_date, '%Y-%m-%d') AS start_date,
                        DATE_FORMAT(ee.end_date, '%Y-%m-%d') AS end_date,

                        CASE  
                            WHEN ee.status = 'Hired' 
                                AND EXISTS (
                                    SELECT 1
                                    FROM employee_employments ee2
                                    WHERE ee2.employee_id = e.id
                                    AND ee2.status = 'Resigned'
                                    AND ee2.id < ee.id
                                )
                            THEN 'Rehired'
                            ELSE ee.status
                        END AS employee_status

                    FROM employees e

                    JOIN latest_assignments ea 
                        ON e.id = ea.employee_id AND ea.rn = 1

                    JOIN latest_employments ee 
                        ON e.id = ee.employee_id AND ee.rn = 1

                    LEFT JOIN positions p ON ea.position_id = p.id

                    LEFT JOIN employees mgr ON ea.manager_id = mgr.id

                    LEFT JOIN latest_assignments mea 
                        ON mgr.id = mea.employee_id AND mea.rn = 1

                    LEFT JOIN positions mp ON mea.position_id = mp.id

                    LEFT JOIN markets m ON ea.market_id = m.id
                    LEFT JOIN teams2 t ON ea.team_id = t.id
                    LEFT JOIN departments d ON ea.department_id = d.id

                    LEFT JOIN employees_login el ON e.id = el.login_id

                    WHERE ee.status = '${employeeStatus}' AND (d.code = '${departmentCode}' OR  LOWER(p.position_name) LIKE CONCAT('%', LOWER('${departmentCode}'), '%'))

                    ORDER BY ee.start_date;

                `

                //    WHERE ae.status = 'Hired' || ae.status = 'Resigned';
            )
            // connection.release()

          const employees = result.map(employee => ({
            ...employee,
            active_employee: employee.employee_status === 'Hired' || employee.employee_status === 'Rehired'
            }));

           if(req.export_to_excel){
           
            req.employees = employees 
            next()
           }else{
              return res.json(employees)
           }


        }catch(error){
            console.error('Error In Fetching Active Employees', error)
            res.status(500).json({error: 'Database Error, Error In Fetching Active Employees'})
        }  
    }else {
        res.json([])
    }
   
}



exports.addNewEmployee = async( req, res, next) => {
    const connection  = await pool.getConnection()
    
    
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }else{
        console.log('All input is valid..')
    }

   const { id,firstname, lastname, db_name, email, manager_id, extension, level, position_id,  department_code,  team_id, start_date } = req.body

   let market_id = req.body.market_id
    
    let imageLink = ""
    if (!req.file) {
        imageLink = "/images/sbtlogo.png"  // put a default image link or null if no image is uploaded
    }else {
         // Construct the URL for the uploaded image
    //    imageLink = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
          imageLink = `/images/${req.file.filename}`;
    }

    // Check if there is atleast 1 senior manager in the system if there is none then the first agent to be created must be a senior manager 


    try {
        
        await connection.beginTransaction()

        //get the department id from the department code
        const [departmentResult] = await connection.execute(
            `SELECT id FROM departments WHERE code = ?`, [department_code]
        )

        if(departmentResult.length === 0){
            await connection.rollback()
            return res.status(400).json({ error: `Department with code ${department_code} not found.` });
        }

        const department_id = departmentResult[0].id

        //get market_id market_id is empty string or null then assign it to default market id which is  nonsales  market name 

         if (!market_id || market_id.trim() === '') {
            const [defaultMarketResult] = await connection.execute(
                `SELECT id FROM markets WHERE name = 'nonsales'`    
            );  
         
            if (defaultMarketResult.length === 0) {
                await connection.rollback()
                return res.status(400).json({ error: 'Default market "nonsales" not found. Please create it before adding employees without a market.' });
            }
            market_id = defaultMarketResult[0].id
         }

          // Check if there is atleast 1 senior manager in the system if there is none then the first agent to be created must be a senior manager 
            const [seniorManagerCountResult] = await connection.execute(
            `SELECT COUNT(*) AS active_manager_count
            FROM employee_assignments ea
            JOIN employee_employments ee 
                ON ea.employee_id = ee.employee_id
            JOIN positions p
                ON ea.position_id = p.id
            WHERE p.level = ?
                AND ee.status IN ('Hired', 'Rehired')
                AND ee.end_date IS NULL`,
            [10]
            );
            const activeManagerCount = seniorManagerCountResult[0].active_manager_count;

        if (activeManagerCount === 0 && level != 10) {
            await connection.rollback();
            return res.status(400).json({ error: `The first entry to get added to ${department_code} Department must be a Senior Manager since there are no active Senior Managers in this department.` });
        }


        const [agentResult]  = await pool.execute(

            `INSERT INTO employees ( id, firstname, lastname, db_name, email, extension, image_link) VALUES (?,?,?,?,?,?,?)`,
            [id,firstname, lastname, db_name, email, extension, imageLink]
        )

        // const agentId = agentResult.insertId

        const [employmentResult] = await connection.execute(
            `INSERT INTO employee_employments (employee_id, status, start_date, end_date) VALUES (?, ?, ?, ?)`,
            [id, 'Hired', start_date, null]
        );


        const [assignmentResult] = await connection.execute(
            `INSERT INTO employee_assignments (employee_id, manager_id, position_id, market_id, department_id, team_id, effective_from, effective_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, manager_id, position_id, market_id, department_id, team_id, start_date, null]
        );


          // Commit transaction
        await connection.commit()

        res.status(201).json({ message: "Employee and related details added successfully." });

    }catch(error){
     await connection.rollback();
    console.error('Error inserting New Employees records', error);

    if (error.code === 'ER_DUP_ENTRY') {
        console.log('I will return this error duplicate key message')
        return res.status(400).json({ error: 'Employee ID already exists. Please use a unique ID.' });
    }

    res.status(500).json({ error: 'Failed to add new employee. Please try again later.' });
    } finally {
        connection.release()
    } 
}
exports.updateEmployee = async (req, res, next) => {
    const connection = await pool.getConnection();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
  
    // console.log(req.body)
    // return
    const { 
        id, firstname, lastname, db_name, email, extension, image_link,
        position_id, manager_id, market_id, team_id, department_id,  department_code, end_date, start_date, 
        employee_status, changed_assignment, active_employee,  effective_to,  effective_from, changed_info, changed_date_hire,
    } = req.body;





    let imageLink = req.file ? `/images/${req.file.filename}` : image_link;

    //there is file change info into true

    const messageArray = []
  
    // console.log(req.body)
    // return

  try {
        await connection.beginTransaction();

        //make sure dont accidentally edit the resigned employee with active_employee = 'false'

        if(employee_status == 'Resigned' && active_employee == 'false'){
            return res.status(400).json({ message: "Cannot Edit update the employee with Resigned status and active_employee = 'false" });
        }




        //check if id is valid and exist in the database
        const [employeeResult] = await connection.execute(
            `SELECT * FROM employees WHERE id = ?`, [id]
        )   
        if(employeeResult.length === 0){
            await connection.rollback()
            return res.status(400).json({ error: `Employee with ID ${id} not found.` });
        }

        // Update employees
        if(changed_info == 'true'){
        
         await connection.execute(
            `UPDATE employees
            SET firstname=?, lastname=?, db_name=?, email=?, extension=?, image_link=? 
            WHERE id=?`,
            [firstname, lastname, db_name, email, extension, imageLink, id]

           
        );
         messageArray.push('Employee Information is updated')
        }
           

        if(changed_date_hire == 'true'){
      
          await connection.execute(
            `UPDATE employee_employments 
            SET start_date=?
            WHERE employee_id=? AND status=?  AND end_date IS NULL`,
            [ start_date, id, employee_status]
         );
           messageArray.push('Employee Date Hired is updated')
        }
   
   
       
        // Case 1: Resignation
        if (employee_status === 'Resigned' && end_date && effective_to && active_employee == 'true' ) {
            
   
        // Close current employment
        await connection.execute(
            `UPDATE employee_employments 
            SET status=?, end_date=? 
            WHERE employee_id=? AND end_date IS NULL`,
            [employee_status, effective_to, id]
        );

        // Close current assignment
        await connection.execute(
            `UPDATE employee_assignments 
            SET effective_to=? 
            WHERE employee_id=? AND effective_to IS NULL`,
            [ effective_to,id]
        );

        
        await connection.commit();
        messageArray.push("Employee status is now resigned")
        return res.status(201).json(messageArray);
        }



        // Case 2: Transfer
        if (changed_assignment== 'true' && (employee_status == 'Hired' || employee_status == 'Rehired') && active_employee == 'true'    ) {
            // Close old assignment
            await connection.execute(
                `UPDATE employee_assignments 
                SET effective_to=? 
                WHERE employee_id=? AND effective_to IS NULL`,
                [effective_to, id]
            );

            // Insert new assignment
            await connection.execute(
                `INSERT INTO employee_assignments 
                (employee_id, position_id, market_id, team_id, manager_id, department_id, effective_from, effective_to) 
                VALUES (?, ?, ?, ?, ?, ?,?, NULL)`,
                [id, position_id, market_id, team_id, manager_id, department_id, effective_from]
            );



            await connection.commit();
            messageArray.push("Employee has new Assignments")
            return  res.status(201).json(messageArray);
        }

        

        //Case 3 Rehired

        if(employee_status == 'Rehired' && active_employee == 'false' && start_date){
         const [employmentResult] = await connection.execute(
            `INSERT INTO employee_employments (employee_id, status, start_date, end_date) VALUES (?, ?, ?, ?)`,
            [id, 'Hired', start_date, null]
        );


        const [assignmentResult] = await connection.execute(
            `INSERT INTO employee_assignments (employee_id, manager_id, position_id, market_id, team_id, department_id, effective_from, effective_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, manager_id, position_id, market_id, team_id, department_id, start_date, null]
        );

           await connection.commit();
           messageArray.push('Employee is Rehired')
            return  res.status(201).json(messageArray);
           
        }

    await connection.commit();
     res.status(201).json(messageArray); 

    } catch (error) {
            await connection.rollback();
            console.error("Transaction failed:", error);
            res.status(500).json({ error: "Failed to update employee and details." });
    } finally {
            connection.release();
    }
};


exports.deleteEmployee = async (req, res, next) => {

    const { employee_id } = req.params 



    try {
        const [fetchEmployeeImageLink] = await pool.execute("SELECT image_link FROM employees WHERE id=?",[employee_id])
        const [employeeImageLink] = fetchEmployeeImageLink
        
        const image_link = employeeImageLink.image_link
        if(image_link != null || image_link != ""){
            // const filePath = new URL(image_link).pathname.substring(1)
            
            // Remove leading slash to avoid path issues
             const filePath = image_link.startsWith('/') ? image_link.substring(1) : image_link;
            //Construct absolute path
            const absolutePath = path.join(__dirname, '../', filePath)

            //Delete the agent Image file

            fs.unlink(absolutePath, (error) => {
                console.log(`File ${filePath} deleted successfully`)
            })
        }
        
        const query = "DELETE FROM employees WHERE id=?"
        const [result] = await pool.execute(query, [employee_id])

        if (result.affectedRows === 0){
            return res.status(400).json({message: 'Employee not found'})
        }

        res.status(204).send({ message: 'Employee deleted successfully' })
    }
    catch(error) {
        console.error('Error deleting employee:', error)
        res.status(500).json({error: 'Database Error, Cannot Delete Employee'})
    }
}

