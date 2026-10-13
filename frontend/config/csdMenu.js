// export const csdMenu = [
//   {
//     name: 'Dashboard',
//     route: '/csd/dashboard',
//     icon: ['fas', 'tachometer-alt']
//   },

//   {
//     name: 'Tickets',
//     icon: ['fas', 'ticket-alt'],
//     subMenu: [
//       {
//         name: 'All Tickets',
//         route: '/csd/tickets',
//         allowedRoles: ['admin', 'manager', 'user']
//       },
//       {
//         name: 'My Tickets',
//         route: '/csd/my-tickets',
//         allowedPositions: ['agent']
//       }
//     ]
//   },

//   {
//     name: 'Team Management',
//     icon: ['fas', 'users'],
//     subMenu: [
//       {
//         name: 'Team Overview',
//         route: '/csd/team',
//         allowedPositions: ['team_leader', 'assistant_manager', 'manager']
//       }
//     ]
//   },

//   {
//     name: 'Admin Panel',
//     icon: ['fas', 'cog'],
//     subMenu: [
//       {
//         name: 'Manage Agents',
//         route: '/csd/admin/agents',
//         allowedRoles: ['admin'],
//         allowedPositions: ['manager', 'assistant_manager']
//       }
//     ]
//   },

//   {
//     name: 'Switch Department',
//     route: '/select_department',
//     icon: ['fas', 'layer-group']
//   }
// ]

export const csdMenu = [

            // { name: "Dashboard", route: '/csd/dashboard', icon: ['fas', 'tachometer-alt']},
            { name: 'Leaderboard', route: '/csd', icon: ['fas', 'list'] },


           { 
              name: 'Agent Performance', 
              route: null, 
              icon: ['fas', 'cog'],
              subMenu: [
                { name: 'Agent_Monthly', route: '/csd/agent_performance/monthly', icon: ['fas', 'user'] },
                { name: 'Agent_Yearly', route: '/csd/agent_performance/yearly', icon: ['fas', 'user'] },
              
              ]
            },
            { 
              name: 'Team Performance', 
              route: null, 
              icon: ['fas', 'cog'],
              subMenu: [
              { name: 'Team_Monthly', route: '/csd/team_performance/monthly', icon: ['fas', 'users'] },
              { name: 'Team_Yearly', route: '/csd/team_performance/yearly', icon: ['fas', 'users'] },
              ]
            },

            { 
              name: 'Reports', 
              route: null, 
              icon: ['fas', 'cog'],
              subMenu: [
              { name: 'Monthly_Target', route: '/csd/target/monthly', icon: ['fas', 'users'] },
             
               { name: 'custom_search', route: '/csd/target/custom_search/target', icon: ['fas', 'fa-search'] },
              
              ]
            },


            // { name: 'Reports', route: '/reports', icon: ['fas', 'file-alt'] },

            { 
              name: 'Feedback', 
              route: null, icon: ['fas', 'poll'],
              subMenu:[
                // admin only
                { name: 'FEEDBACK ADMIN', route: '/csd/feedback_by_admin', icon: ['fas', 'users'], allowedRoles: ['admin'] },
                { name: 'FEEDBACK QA', route: '/feedback/feedback_by_qa', icon: ['fas', 'users'], allowedRoles: ['admin'] },

                // none-admin, by position level (admin never sees these two)
                // head rates the members: level 10, 9, 8
                { name: 'FEEDBACK MEMBERS', route: '/feedback/feedback_by_nonesales?feedback_type=by_head', icon: ['fas', 'users'], allowedLevels: [10, 9, 8], excludedRoles: ['admin'] },
                // members rate the head: level 9, 8, 3, 1
                { name: 'FEEDBACK HEAD', route: '/feedback/feedback_by_nonesales?feedback_type=by_member', icon: ['fas', 'user-tie'], allowedLevels: [9, 8, 3, 1], excludedRoles: ['admin'] },

              ]

            },

            {
              name: 'Admin Panel',
              route: null,
              icon: ['fas', 'cog'],
              allowedRoles: ['admin'],
              subMenu: [
              
           
                { name: 'CSD Performance Metrics', route: '/csd/csd_performance_metrics', icon: ['fas', 'user-tie'] },
                { name: 'CSD Evaluation', route: '/csd/csd_evaluation', icon: ['fas', 'user-tie'] },
                { name: 'Upload CSD Metrics Data', route: '/csd/upload_sales_evaluation_data', icon: ['fas', 'fa-upload'] },
                { name: 'Teams', route: '/csd/manage_teams', icon: ['fas', 'user-tie'] },
                // { name: 'export', route: '/admin/export_to_excel', icon: ['fas', 'fa-file-excel'] },


               { name: 'CSD Employees Management', route: '/csd/csd_employees_management', icon: ['fas', 'user-tie'] },

              ]
            },

            {
              name: 'Switch Department',
              route: '/select_department',
              icon: ['fas', 'layer-group']
            },

]