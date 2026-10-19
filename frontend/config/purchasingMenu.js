// The side menu of the Purchasing department. It works like the CSD and Collection menus (config/csdMenu.js, config/collectionMenu.js):
// the same pages (pages/csd, opened under /purchasing with an alias), the same rules per role / position level, and the same rules
// guard the pages (middleware/department-menu-access.global.js).
//   level 1, 2, 3          -> 'Performance Evaluation': only their own performance, no team performance
//   level 7, 8, 9          -> 'Agent Performance' and 'Team Performance' (a team leader: the team)
//   admin / poweruser      -> everything (poweruser: no feedback, no admin panel)
// No Quality Analyst feedback in Purchasing (the Quality Analyst is the QA of CSD and Collection).
// The Purchasing Manager (position level 10, based in Japan) is the head of the department: he is NOT in the evaluation, the leaderboard, the
// Agent and Team Performance (backend: csd_department.js), he evaluates the leadership of the Purchasing team leaders and he sees the
// Purchasing views (position level 10 sees everybody of his department, like the admin).

export const purchasingMenu = [

            { name: 'Leaderboard', route: '/purchasing', icon: ['fas', 'list'] },

            {
              name: 'Performance Evaluation',
              route: null,
              icon: ['fas', 'cog'],
              allowedLevels: [1, 2, 3],
              excludedRoles: ['admin', 'poweruser'],
              // their own performance (the details pages), the list pages are for the managers
              subMenu: [
                { name: 'Agent_Monthly', route: '/purchasing/agent_performance/month', icon: ['fas', 'user'] },
                { name: 'Agent_Yearly', route: '/purchasing/agent_performance/year', icon: ['fas', 'user'] },
              ]
            },
            {
              name: 'Agent Performance',
              route: null,
              icon: ['fas', 'cog'],
              allowedRoles: ['admin', 'poweruser'],
              allowedLevels: [10, 9, 8, 7],
              subMenu: [
                { name: 'Agent_Monthly', route: '/purchasing/agent_performance/monthly', icon: ['fas', 'user'] },
                { name: 'Agent_Yearly', route: '/purchasing/agent_performance/yearly', icon: ['fas', 'user'] },
                // hidden: not in the menu, the details pages opened from the list (the page guard uses them)
                { name: 'Agent_Monthly_Details', route: '/purchasing/agent_performance/month', hidden: true },
                { name: 'Agent_Yearly_Details', route: '/purchasing/agent_performance/year', hidden: true },
              ]
            },
            {
              name: 'Team Performance',
              route: null,
              icon: ['fas', 'cog'],
              allowedRoles: ['admin', 'poweruser'],
              allowedLevels: [10, 9, 8, 7],
              subMenu: [
                { name: 'Team_Monthly', route: '/purchasing/team_performance/monthly', icon: ['fas', 'users'] },
                { name: 'Team_Yearly', route: '/purchasing/team_performance/yearly', icon: ['fas', 'users'] },
                // hidden: the details pages opened from the list
                { name: 'Team_Monthly_Details', route: '/purchasing/team_performance/month', hidden: true },
                { name: 'Team_Yearly_Details', route: '/purchasing/team_performance/year', hidden: true },
              ]
            },

            {
              name: 'Feedback',
              route: null, icon: ['fas', 'poll'],
              subMenu: [
                // admin only
                { name: 'FEEDBACK ADMIN', route: '/purchasing/feedback_by_admin', icon: ['fas', 'users'], allowedRoles: ['admin'] },

                // staff items, by position level (admin and poweruser never see them: they only view a feedback through its link)
                // head rates the members (questionnaire)
                // (the Purchasing Manager of Japan does not give it: his only function is the Leadership Performance)
                { name: 'FEEDBACK MEMBERS', route: '/feedback/feedback_by_nonesales?feedback_type=by_head', icon: ['fas', 'users'], allowedLevels: [9, 8], excludedRoles: ['admin', 'poweruser'] },
                // members rate the head
                { name: 'FEEDBACK HEAD', route: '/feedback/feedback_by_nonesales?feedback_type=by_member', icon: ['fas', 'user-tie'], allowedLevels: [9, 8, 3, 2, 1], excludedRoles: ['admin', 'poweruser'] },
              ]
            },

            // Leadership Individual Performance: the Purchasing Manager (level 10) evaluates the Purchasing Team Leaders and the
            // Purchasing Team Leader (level 8) evaluates the Assistant Purchasing Team Leader (level 7). The page is shared (/leadership/leadership_evaluation).
            {
              name: 'Leadership Performance',
              route: null,
              icon: ['fas', 'poll'],
              allowedLevels: [10, 9, 8],
              subMenu: [
                { name: 'EVALUATE TEAM LEADERS', route: '/leadership/leadership_evaluation', icon: ['fas', 'users'], allowedLevels: [10, 9, 8] },
              ]
            },

            {
              name: 'Admin Panel',
              route: null,
              icon: ['fas', 'cog'],
              allowedRoles: ['admin'],
              subMenu: [
                { name: 'Purchasing Evaluation', route: '/purchasing/purchasing_evaluation', icon: ['fas', 'user-tie'] },
                { name: 'Teams', route: '/purchasing/manage_teams', icon: ['fas', 'user-tie'] },
                { name: 'Purchasing Employees Management', route: '/purchasing/purchasing_employees_management', icon: ['fas', 'user-tie'] },
              ]
            },

            {
              name: 'Switch Department',
              route: '/select_department',
              icon: ['fas', 'layer-group'],
              // the Purchasing Manager works in Purchasing only; the GOM picks any department
              allowedRoles: ['admin'],
              allowedLevels: [15]
            },

]
