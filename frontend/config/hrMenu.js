// The side menu of the HR & Admin department (department code hradmin; its pages are under /hr). It works like the Purchasing menu
// (config/purchasingMenu.js): the same pages (pages/csd, opened under /hr with an alias), the same rules per role / position level, and the
// same rules guard the pages (middleware/department-menu-access.global.js).
//   level 1, 2, 3          -> 'Performance Evaluation': only their own performance, no team performance
//   level 7, 8, 9, 10      -> 'Agent Performance' and 'Team Performance' (the manager sees everybody of the department, a team leader the team)
//   admin / poweruser      -> everything (poweruser: no feedback, no admin panel)
// The HR Manager (position level 10) is the head of the department and IS in the evaluation (her leadership is evaluated by the GOM);
// she gives the leadership evaluation and the feedback to her staff. No Quality Analyst feedback in HR & Admin.
// NOTE: this is the department 'hradmin' (HR & Admin staff), it has nothing to do with the 'admin' users of the system.

export const hrMenu = [

            { name: 'Leaderboard', route: '/hr', icon: ['fas', 'list'] },

            {
              name: 'Performance Evaluation',
              route: null,
              icon: ['fas', 'cog'],
              allowedLevels: [1, 2, 3],
              excludedRoles: ['admin', 'poweruser'],
              // their own performance (the details pages), the list pages are for the managers
              subMenu: [
                { name: 'Agent_Monthly', route: '/hr/agent_performance/month', icon: ['fas', 'user'] },
                { name: 'Agent_Yearly', route: '/hr/agent_performance/year', icon: ['fas', 'user'] },
              ]
            },
            {
              name: 'Agent Performance',
              route: null,
              icon: ['fas', 'cog'],
              allowedRoles: ['admin', 'poweruser'],
              allowedLevels: [10, 9, 8, 7],
              subMenu: [
                { name: 'Agent_Monthly', route: '/hr/agent_performance/monthly', icon: ['fas', 'user'] },
                { name: 'Agent_Yearly', route: '/hr/agent_performance/yearly', icon: ['fas', 'user'] },
                // the average of the submitted months between two months chosen by the user (admin, poweruser, GOM)
                { name: 'Agent_CustomRange', route: '/hr/agent_performance/custom_range', icon: ['fas', 'user'], allowedRoles: ['admin', 'poweruser'] },
                // hidden: not in the menu, the details pages opened from the list (the page guard uses them)
                { name: 'Agent_Monthly_Details', route: '/hr/agent_performance/month', hidden: true },
                { name: 'Agent_Yearly_Details', route: '/hr/agent_performance/year', hidden: true },
                { name: 'Agent_CustomRange_Details', route: '/hr/agent_performance/custom_range_details', hidden: true, allowedRoles: ['admin', 'poweruser'] },
              ]
            },
            {
              name: 'Team Performance',
              route: null,
              icon: ['fas', 'cog'],
              allowedRoles: ['admin', 'poweruser'],
              allowedLevels: [10, 9, 8, 7],
              subMenu: [
                { name: 'Team_Monthly', route: '/hr/team_performance/monthly', icon: ['fas', 'users'] },
                { name: 'Team_Yearly', route: '/hr/team_performance/yearly', icon: ['fas', 'users'] },
                // hidden: the details pages opened from the list
                { name: 'Team_Monthly_Details', route: '/hr/team_performance/month', hidden: true },
                { name: 'Team_Yearly_Details', route: '/hr/team_performance/year', hidden: true },
              ]
            },

            {
              name: 'Feedback',
              route: null, icon: ['fas', 'poll'],
              subMenu: [
                // admin only
                { name: 'FEEDBACK ADMIN', route: '/hr/feedback_by_admin', icon: ['fas', 'users'], allowedRoles: ['admin'] },

                // staff items, by position level (admin and poweruser never see them: they only view a feedback through its link)
                // head rates the members (questionnaire)
                { name: 'FEEDBACK MEMBERS', route: '/feedback/feedback_by_nonesales?feedback_type=by_head', icon: ['fas', 'users'], allowedLevels: [10, 9, 8, 7], excludedRoles: ['admin', 'poweruser'] },
                // members rate the head
                { name: 'FEEDBACK HEAD', route: '/feedback/feedback_by_nonesales?feedback_type=by_member', icon: ['fas', 'user-tie'], allowedLevels: [9, 8, 7, 3, 2, 1], excludedRoles: ['admin', 'poweruser'], requiresReceivingHead: true },
              ]
            },

            // Leadership Individual Performance: the HR Manager (level 10) evaluates her leaders (position level 7 - 9 that report to her); the team
            // leaders evaluate their assistant team leaders. The page is shared (/leadership/leadership_evaluation).
            {
              name: 'Leadership Performance',
              route: null,
              icon: ['fas', 'poll'],
              allowedLevels: [10, 9, 8],
              subMenu: [
                { name: 'EVALUATE LEADERS', route: '/leadership/leadership_evaluation', icon: ['fas', 'users'], allowedLevels: [10, 9, 8] },
              ]
            },

            {
              name: 'Admin Panel',
              route: null,
              icon: ['fas', 'cog'],
              allowedRoles: ['admin'],
              subMenu: [
                { name: 'HR & Admin Evaluation', route: '/hr/hr_evaluation', icon: ['fas', 'user-tie'] },
                { name: 'Teams', route: '/hr/manage_teams', icon: ['fas', 'user-tie'] },
                // the standard users (admin, poweruser, GOM ... the system users): allowed admins only (backend: allowedAdmins)
                { name: 'Manage Standard Users', route: '/hr/manage_standard_users', icon: ['fas', 'user'] },
                { name: 'HR & Admin Employees Management', route: '/hr/hradmin_employees_management', icon: ['fas', 'user-tie'] },
              ]
            },

            {
              name: 'Switch Department',
              route: '/select_department',
              icon: ['fas', 'layer-group'],
              // the HR Manager works in HR & Admin only; the GOM picks any department
              allowedRoles: ['admin'],
              allowedLevels: [15]
            },

]
