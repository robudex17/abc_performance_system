
exports.dashboarddMasterQuery = 
    `
       SELECT 
                sa.id AS id,
                sa.firstname,
                sa.lastname,
                sa.db_name,
                sa.email,
                sa.image_link,
                aa.agent_type,
                r.role_name AS agent_role,
                aa.manager_id,
                mgr.db_name AS manager_dbname,
                mr.role_name AS manager_role,
                m.id AS market_id,
                m.name AS market_name,
                t.id AS team_id,
                t.name AS team_name,
                ae.status AS employee_status,
                COALESCE(ts.target, 0) AS target,
                COALESCE(ts.ship_ok, 0) AS shipok,
                COALESCE(ts.month, ?) AS month,
                COALESCE(ts.year, ?) AS year
            FROM sales_agents2 sa
            JOIN (
                SELECT aa1.*
                FROM agent_assignments aa1
                JOIN (
                    SELECT agent_id, MAX(id) AS latest_id
                    FROM agent_assignments
                    WHERE DATE_FORMAT(effective_from, '%Y-%m') <= ?
                        AND (effective_to IS NULL OR DATE_FORMAT(effective_to, '%Y-%m') >= ?)
                    GROUP BY agent_id
                ) aa2 
                    ON aa1.agent_id = aa2.agent_id 
                AND aa1.id = aa2.latest_id
            ) aa ON sa.id = aa.agent_id
            JOIN (
                SELECT ae1.*
                FROM agent_employments ae1
                JOIN (
                    SELECT agent_id, MAX(id) AS latest_id
                    FROM agent_employments
                    WHERE DATE_FORMAT(start_date, '%Y-%m') <= ?
                        AND (end_date IS NULL OR DATE_FORMAT(end_date, '%Y-%m') >= ?)
                    GROUP BY agent_id
                ) ae2 
                    ON ae1.agent_id = ae2.agent_id 
                AND ae1.id = ae2.latest_id
            ) ae ON sa.id = ae.agent_id
            LEFT JOIN sales_agent_roles r ON aa.agent_type = r.id
            LEFT JOIN sales_agents2 mgr ON aa.manager_id = mgr.id
            LEFT JOIN agent_assignments maa ON mgr.id = maa.agent_id 
                AND maa.id = (
                    SELECT MAX(id) 
                    FROM agent_assignments 
                    WHERE agent_id = mgr.id
                    AND DATE_FORMAT(effective_from, '%Y-%m') <= ?
                    AND (effective_to IS NULL OR DATE_FORMAT(effective_to, '%Y-%m') >= ?)
                )
            LEFT JOIN sales_agent_roles mr ON maa.agent_type = mr.id
            LEFT JOIN markets m ON aa.market_id = m.id
            LEFT JOIN teams t ON aa.team_id = t.id
            LEFT JOIN target_shipok ts 
                ON ts.agent_id = sa.id 
                AND ts.month = ?
                AND ts.year = ?
            WHERE aa.agent_type  != 2
           
    `


