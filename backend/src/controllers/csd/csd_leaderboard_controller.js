const csdMetricsController   = require('./csd_performance_metrics_controller')


exports.fetchCsdLeaderboard = async(req, res, next) => {
   
    //     const errors = validationResult(req);
    //    if (!errors.isEmpty()) {
    //      return res.status(400).json({ errors: errors.array() });
    //    }
       
   
       const export_to_excel = req.export_to_excel
       let scope
       const employee_id = req.params.employee_id
       const current_user = req.user
       

       if(req.params.scope){
        scope = req.params.scope
       }else{
        scope = 'agent'
       }
      
       // later I will use this as dynamic maybe I will put in params or on the query
       let department_code = 'csd'
       
   
       let year_month 
       
       if(!req.query.year_month){
           const currentDate = new Date()
           const currentYear = currentDate.getFullYear()
           const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0')
           year_month = `${currentYear}-${currentMonth}`
       }else{
           year_month = req.query.year_month
       }
   
           // ✅ Validate input
       if (!/^\d{4}-\d{2}$/.test(year_month)) {
       return res.status(400).json({
           message: 'Invalid year_month format. Expected YYYY-MM'
       });
       }
       
      
       try {
           
           let  metricsData  = await csdMetricsController.generateCsdPerformanceMetrics(year_month, scope, department_code, 'all', employee_id, current_user)

       

            const getMax = (list, filterFn) => {
                    const scores = list
                        .filter(filterFn)
                        .map(a => parseFloat(a.total_performance_score_percentage))
                        .filter(score => !isNaN(score) && score > 0) // 👈 important fix

                    return scores.length ? Math.max(...scores) : null
            }

            if (['team_leader', 'agent'].includes(scope)) {

 
                const getMax = (list, filterFn) => {
                        const scores = list
                            .filter(filterFn)
                            .map(a => parseFloat(a.total_performance_score_percentage))
                            .filter(score => !isNaN(score) && score > 0) // 👈 important fix

                        return scores.length ? Math.max(...scores) : null
                }               

                const tLTopRating = getMax(
                    metricsData,
                    a => a.position_level == 8
                )

                const agentTopRating = getMax(
                    metricsData,
                    a => [1, 2, 3].includes(a.position_level)
                )

                metricsData = metricsData.map(agent => {

                    const score = parseFloat(agent.total_performance_score_percentage)
                    const validScore = !isNaN(score)

                    // INCOMPLETE
                    if (agent.submitted == 0) {
                        return {
                            ...agent,
                            total_performance_score_percentage: 0,
                            total_performance_score_description: 'INCOMPLETE',
                            tag: ''
                        }
                    }

                    return {
                        ...agent,
                        tag:
                            validScore && tLTopRating !== null &&
                            agent.position_level === 8 &&
                            score === tLTopRating
                                ? 'Top Team Leader'
                                : validScore && agentTopRating !== null &&
                                [1, 2, 3].includes(agent.position_level) &&
                                score === agentTopRating
                                ? 'Top Agent'
                                : ''
                    }
                })
            }

           if(scope == 'all'){
             metricsData = metricsData.map(agent => {
                if(!agent.is_completed){
                    return {
                        ...agent,total_performance_score_percentage: 0, total_performance_score_description: 'INCOMPLETE'
                    }
                }
                
                return agent
             })
           }


   
           res.status(200).json(metricsData)
   
       }catch(error){
           console.error('Error fetching CSD performance metrics', error)
           res.status(500).json({error: 'Database Error, Cannot Fetch CSD performance metrics'})
       }
           
}