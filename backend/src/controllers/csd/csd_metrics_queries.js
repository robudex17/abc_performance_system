exports.fetch_queries = {

    all : `
    
          SELECT 
            -- =====================================================
            -- ✅ EMPLOYEE CORE INFORMATION
            -- =====================================================
            e.id,
            e.firstname,
            e.lastname,
            e.db_name,
            e.email,
            e.image_link,

            -- =====================================================
            -- ✅ POSITION INFORMATION
            -- =====================================================
            p.id AS position_id,
            p.position_name,
            p.level AS position_level,

            -- =====================================================
            -- ✅ MANAGER INFORMATION
            -- =====================================================
            ea.manager_id,
            mgr.db_name AS manager_dbname,

            -- =====================================================
            -- ✅ ORGANIZATIONAL STRUCTURE
            -- =====================================================
            m.id AS market_id,
            m.name AS market_name,

            t.id AS team_id,
            t.name AS team_name,

            d.id AS department_id,
            d.code AS department_code,
            d.name AS department_fullname,

            -- =====================================================
            -- ✅ EMPLOYMENT INFORMATION
            -- =====================================================
            ee.status AS employee_status,

            -- =====================================================
            -- ✅ EVALUATION STATUS
            -- =====================================================
            COALESCE(csd.submitted, 0) AS submitted,

            -- =====================================================
            -- ✅ EMAIL RESPONSE TIME METRICS
            -- =====================================================
            aert.id AS avg_response_id,
            aert.avg_response_minutes,
        

            -- =====================================================
            -- ✅ EMAIL RESPONSE COUNT METRICS
            -- =====================================================
            erc.id AS email_response_count_id,
            erc.response_count,
            erc.resolved_tickets,
       

            -- =====================================================
            -- ✅ CALL METRICS
            -- =====================================================
            c.id AS calls_id,
            c.inbound_calls,
            c.outbound_calls,
            c.missed_calls,
            c.total_calls,
          

            -- =====================================================
            -- ✅ ERROR REPORT METRICS
            -- =====================================================
            err.id AS error_report_id,
            COALESCE(err.initial_result, 100) AS initial_result,
            COALESCE(err.error_count, 0) AS  error_count,
            
           
      
            -- =====================================================
            -- ✅ CALIBRATION RESULT METRICS
            -- =====================================================
            cr.id AS calibration_result_id,
            cr.not_good AS calibration_not_good,
            cr.just_ok AS calibration_just_ok,
            cr.awesome AS calibration_awesome,
        
            -- =====================================================
            -- ✅ CUSTOMER SATISFACTION METRICS
            -- =====================================================
            csr.id AS customer_satisfaction_id,
            csr.not_good AS customer_not_good,
            csr.just_ok AS customer_just_ok,
            csr.awsome AS customer_awesome,
          

            -- =====================================================
            -- ✅ ATTRITION RATE METRICS (TEAM LEVEL)
            -- =====================================================
            ar.id AS attrition_id,
            ar.opening_hc,
            ar.closing_hc,
            ar.no_of_resignation
          

        FROM employees e

        -- =====================================================
        -- ✅ LATEST EMPLOYEE ASSIGNMENT SNAPSHOT
        -- =====================================================
        JOIN (
            SELECT ea1.*
            FROM employee_assignments ea1
            JOIN (
                SELECT employee_id, MAX(id) AS latest_id
                FROM employee_assignments
                WHERE DATE_FORMAT(effective_from, '%Y-%m') <= ?
                AND (
                        effective_to IS NULL
                        OR DATE_FORMAT(effective_to, '%Y-%m') >= ?
                )
                GROUP BY employee_id
            ) ea2
                ON ea1.employee_id = ea2.employee_id
            AND ea1.id = ea2.latest_id
        ) ea 
            ON e.id = ea.employee_id

        -- =====================================================
        -- ✅ LATEST EMPLOYMENT SNAPSHOT
        -- =====================================================
        JOIN (
            SELECT ee1.*
            FROM employee_employments ee1
            JOIN (
                SELECT employee_id, MAX(id) AS latest_id
                FROM employee_employments
                WHERE DATE_FORMAT(start_date, '%Y-%m') <= ?
                AND (
                        end_date IS NULL
                        OR DATE_FORMAT(end_date, '%Y-%m') >= ?
                )
                GROUP BY employee_id
            ) ee2
                ON ee1.employee_id = ee2.employee_id
            AND ee1.id = ee2.latest_id
        ) ee 
            ON e.id = ee.employee_id

        -- =====================================================
        -- ✅ POSITION INFORMATION
        -- =====================================================
        LEFT JOIN positions p
            ON ea.position_id = p.id

        -- =====================================================
        -- ✅ MANAGER INFORMATION
        -- =====================================================
        LEFT JOIN employees mgr
            ON ea.manager_id = mgr.id

        -- =====================================================
        -- ✅ ORGANIZATIONAL STRUCTURE
        -- =====================================================
        LEFT JOIN markets m
            ON ea.market_id = m.id

        LEFT JOIN teams2 t
            ON ea.team_id = t.id

        LEFT JOIN departments d
            ON ea.department_id = d.id

        -- =====================================================
        -- ✅ EVALUATION STATUS
        -- =====================================================
        LEFT JOIN csd_evaluation_status csd
            ON csd.employee_id = e.id
        AND csd.year_month = ?

        -- =====================================================
        -- ✅ EMAIL RESPONSE TIME METRICS
        -- =====================================================
        LEFT JOIN average_email_response_time aert
            ON aert.employee_id = e.id
        AND aert.year_month = ?

        -- =====================================================
        -- ✅ EMAIL RESPONSE COUNT METRICS
        -- =====================================================
        LEFT JOIN email_responses_count erc
            ON erc.employee_id = e.id
        AND erc.year_month = ?

        -- =====================================================
        -- ✅ CALL METRICS
        -- =====================================================
        LEFT JOIN calls c
            ON c.employee_id = e.id
        AND c.year_month = ?

        -- =====================================================
        -- ✅ ERROR REPORT METRICS
        -- =====================================================
        LEFT JOIN error_report err
            ON err.employee_id = e.id
        AND err.year_month = ?

        -- =====================================================
        -- ✅ CALIBRATION RESULT METRICS
        -- =====================================================
        LEFT JOIN calibration_result cr
            ON cr.employee_id = e.id
        AND cr.year_month = ?

        -- =====================================================
        -- ✅ CUSTOMER SATISFACTION METRICS
        -- =====================================================
        LEFT JOIN customer_satisfaction_report csr
            ON csr.employee_id = e.id
        AND csr.year_month = ?

        -- =====================================================
        -- ✅ ATTRITION RATE METRICS (TEAM LEVEL)
        -- =====================================================
        LEFT JOIN attrition_rate ar
            ON ar.team_id = ea.team_id
        AND ar.year_month = ?
    `
}

exports.add_queries = {
    email_response_time: "INSERT INTO average_email_response_time(`avg_response_minutes`,`year_month`,`employee_id`) VALUES (?,?,?)",
    email_response_count: "INSERT INTO email_responses_count(`response_count`, `resolved_tickets`,`year_month`,`employee_id`) VALUES (?,?,?,?)",
    error_report: "INSERT INTO error_report(`initial_result`, `error_count`, `year_month`,`employee_id`) VALUES (?,?,?,?)",
}


exports.update_queries = {
    email_response_time: "UPDATE average_email_response_time SET avg_response_minutes = ? WHERE employee_id = ? AND \`year_month\` = ?",
    email_response_count: "UPDATE email_responses_count SET response_count = ?, resolved_tickets = ?  WHERE employee_id = ? AND \`year_month\` = ?",
    error_report: "UPDATE error_report SET error_count = ?  WHERE employee_id = ? AND \`year_month\` = ?"
}


