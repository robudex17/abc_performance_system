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

import { QA_POSITION_NAME } from './departments'

export const csdMenu = [

            // { name: "Dashboard", route: '/csd/dashboard', icon: ['fas', 'tachometer-alt']},
            { name: 'Leaderboard', route: '/csd', icon: ['fas', 'list'] },


            // Who sees what (the same rules guard the pages: middleware/csd-menu-access.global.js).
            // The agent and team pages answer with different data for each role / position level:
            //   level 1, 2, 3          -> 'Performance Evaluation': only their own performance, no team performance
            //   level 7, 8, 9          -> 'Agent Performance' and 'Team Performance'
            //   level 10 and admin     -> the same, level 10 can also switch department
            { 
              name: 'Performance Evaluation', 
              route: null, 
              icon: ['fas', 'cog'],
              allowedLevels: [1, 2, 3],
              excludedRoles: ['admin', 'poweruser'],
              // their own performance (the details pages), the list pages are for the managers
              subMenu: [
                { name: 'Agent_Monthly', route: '/csd/agent_performance/month', icon: ['fas', 'user'] },
                { name: 'Agent_Yearly', route: '/csd/agent_performance/year', icon: ['fas', 'user'] },
              ]
            },
            { 
              name: 'Agent Performance', 
              route: null, 
              icon: ['fas', 'cog'],
              allowedRoles: ['admin', 'poweruser'],
              allowedLevels: [10, 9, 8, 7],
              subMenu: [
                { name: 'Agent_Monthly', route: '/csd/agent_performance/monthly', icon: ['fas', 'user'] },
                { name: 'Agent_Yearly', route: '/csd/agent_performance/yearly', icon: ['fas', 'user'] },
                // the average of the submitted months between two months chosen by the user (admin, poweruser, GOM)
                { name: 'Agent_CustomRange', route: '/csd/agent_performance/custom_range', icon: ['fas', 'user'], allowedRoles: ['admin', 'poweruser'] },
                // hidden: not in the menu, the details pages opened from the list (the page guard uses them)
                { name: 'Agent_Monthly_Details', route: '/csd/agent_performance/month', hidden: true },
                { name: 'Agent_Yearly_Details', route: '/csd/agent_performance/year', hidden: true },
                { name: 'Agent_CustomRange_Details', route: '/csd/agent_performance/custom_range_details', hidden: true, allowedRoles: ['admin', 'poweruser'] },
              ]
            },
            { 
              name: 'Team Performance', 
              route: null, 
              icon: ['fas', 'cog'],
              allowedRoles: ['admin', 'poweruser'],
              allowedLevels: [10, 9, 8, 7],
              subMenu: [
              { name: 'Team_Monthly', route: '/csd/team_performance/monthly', icon: ['fas', 'users'] },
              { name: 'Team_Yearly', route: '/csd/team_performance/yearly', icon: ['fas', 'users'] },
              // hidden: not in the menu, the details pages opened from the list (the page guard uses them)
              { name: 'Team_Monthly_Details', route: '/csd/team_performance/month', hidden: true },
              { name: 'Team_Yearly_Details', route: '/csd/team_performance/year', hidden: true },
              ]
            },

            // not in the menu of the staff: admin and poweruser only
            { 
              name: 'Reports', 
              route: null, 
              icon: ['fas', 'cog'],
              allowedRoles: ['admin', 'poweruser'],
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

                // staff items, by position level (admin and poweruser never see them: they only view a feedback through its link)
                // head rates the members (questionnaire): level 10, 9, 8 - but not the Quality Analyst (level 9 too)
                { name: 'FEEDBACK MEMBERS', route: '/feedback/feedback_by_nonesales?feedback_type=by_head', icon: ['fas', 'users'], allowedLevels: [10, 9, 8, 7], excludedRoles: ['admin', 'poweruser'], excludedPositionNames: [QA_POSITION_NAME] },
                // the Quality Analyst gives a score to all the CSD staff of level 8 and below (no questionnaire, like the feedback by admin)
                { name: 'FEEDBACK MEMBERS', route: '/csd/feedback_by_qa', icon: ['fas', 'users'], allowedPositionNames: [QA_POSITION_NAME], excludedRoles: ['admin', 'poweruser'] },
                // members rate the head: level 9, 8, 3, 2, 1
                { name: 'FEEDBACK HEAD', route: '/feedback/feedback_by_nonesales?feedback_type=by_member', icon: ['fas', 'user-tie'], allowedLevels: [9, 8, 7, 3, 2, 1], excludedRoles: ['admin', 'poweruser'] },

              ]

            },

            // Leadership Individual Performance: the head evaluates the leaders (position level 7 - 10) with a form of tasks, scores and
            // comments. The GOM (position level 15) evaluates the CSD & Collection Manager, the manager the assistant managers (and the
            // Quality Analyst), an assistant manager his/her team leaders. The three items open the same page, it shows the leaders of
            // the logged in head. The Quality Analyst has nobody to evaluate.
            {
              name: 'Leadership Performance',
              route: null,
              icon: ['fas', 'poll'],
              allowedLevels: [10, 9],
              excludedPositionNames: [QA_POSITION_NAME],
              subMenu: [
                { name: 'EVALUATE ASSISTANT MANAGERS', route: '/leadership/leadership_evaluation', icon: ['fas', 'users'], allowedLevels: [10] },
                { name: 'EVALUATE TEAM LEADERS', route: '/leadership/leadership_evaluation', icon: ['fas', 'users'], allowedLevels: [9] },
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
              icon: ['fas', 'layer-group'],
              allowedRoles: ['admin'],
              allowedLevels: [15, 10]
            },

]