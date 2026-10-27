// The side menu of the Collection department. It works like the CSD menu (config/csdMenu.js): the same pages (pages/csd, opened
// under /collection with an alias), the same rules per role / position level, and the same rules guard the pages
// (middleware/department-menu-access.global.js).
//   level 1, 2, 3          -> 'Performance Evaluation': only their own performance, no team performance
//   level 7, 8, 9          -> 'Agent Performance' and 'Team Performance' (the Collection assistant manager: everybody, a team leader: the team)
//   admin / poweruser      -> everything (poweruser: no feedback, no admin panel)
// The Quality Analyst belongs to CSD: she does not have the Collection menu.

export const collectionMenu = [

            { name: 'Leaderboard', route: '/collection', icon: ['fas', 'list'] },

            {
              name: 'Performance Evaluation',
              route: null,
              icon: ['fas', 'cog'],
              allowedLevels: [1, 2, 3],
              excludedRoles: ['admin', 'poweruser'],
              // their own performance (the details pages), the list pages are for the managers
              subMenu: [
                { name: 'Agent_Monthly', route: '/collection/agent_performance/month', icon: ['fas', 'user'] },
                { name: 'Agent_Yearly', route: '/collection/agent_performance/year', icon: ['fas', 'user'] },
              ]
            },
            {
              name: 'Agent Performance',
              route: null,
              icon: ['fas', 'cog'],
              allowedRoles: ['admin', 'poweruser'],
              allowedLevels: [10, 9, 8, 7],
              subMenu: [
                { name: 'Agent_Monthly', route: '/collection/agent_performance/monthly', icon: ['fas', 'user'] },
                { name: 'Agent_Yearly', route: '/collection/agent_performance/yearly', icon: ['fas', 'user'] },
                // the average of the submitted months between two months chosen by the user (admin, poweruser, GOM)
                { name: 'Agent_CustomRange', route: '/collection/agent_performance/custom_range', icon: ['fas', 'user'], allowedRoles: ['admin', 'poweruser'] },
                // hidden: not in the menu, the details pages opened from the list (the page guard uses them)
                { name: 'Agent_Monthly_Details', route: '/collection/agent_performance/month', hidden: true },
                { name: 'Agent_Yearly_Details', route: '/collection/agent_performance/year', hidden: true },
                { name: 'Agent_CustomRange_Details', route: '/collection/agent_performance/custom_range_details', hidden: true, allowedRoles: ['admin', 'poweruser'] },
              ]
            },
            {
              name: 'Team Performance',
              route: null,
              icon: ['fas', 'cog'],
              allowedRoles: ['admin', 'poweruser'],
              allowedLevels: [10, 9, 8, 7],
              subMenu: [
                { name: 'Team_Monthly', route: '/collection/team_performance/monthly', icon: ['fas', 'users'] },
                { name: 'Team_Yearly', route: '/collection/team_performance/yearly', icon: ['fas', 'users'] },
                // hidden: the details pages opened from the list
                { name: 'Team_Monthly_Details', route: '/collection/team_performance/month', hidden: true },
                { name: 'Team_Yearly_Details', route: '/collection/team_performance/year', hidden: true },
              ]
            },

            {
              name: 'Feedback',
              route: null, icon: ['fas', 'poll'],
              subMenu: [
                // admin only
                { name: 'FEEDBACK ADMIN', route: '/collection/feedback_by_admin', icon: ['fas', 'users'], allowedRoles: ['admin'] },

                // staff items, by position level (admin and poweruser never see them: they only view a feedback through its link)
                // head rates the members (questionnaire)
                { name: 'FEEDBACK MEMBERS', route: '/feedback/feedback_by_nonesales?feedback_type=by_head', icon: ['fas', 'users'], allowedLevels: [10, 9, 8, 7], excludedRoles: ['admin', 'poweruser'] },
                // members rate the head
                { name: 'FEEDBACK HEAD', route: '/feedback/feedback_by_nonesales?feedback_type=by_member', icon: ['fas', 'user-tie'], allowedLevels: [9, 8, 7, 3, 2, 1], excludedRoles: ['admin', 'poweruser'], requiresReceivingHead: true },
              ]
            },

            // Leadership Individual Performance: the Collection assistant manager (level 9) evaluates the Collection team leaders.
            // The page is shared with CSD (/leadership/leadership_evaluation).
            {
              name: 'Leadership Performance',
              route: null,
              icon: ['fas', 'poll'],
              allowedLevels: [9],
              subMenu: [
                { name: 'EVALUATE TEAM LEADERS', route: '/leadership/leadership_evaluation', icon: ['fas', 'users'], allowedLevels: [9] },
              ]
            },

            {
              name: 'Admin Panel',
              route: null,
              icon: ['fas', 'cog'],
              allowedRoles: ['admin'],
              subMenu: [
                { name: 'Collection Evaluation', route: '/collection/collection_evaluation', icon: ['fas', 'user-tie'] },
                { name: 'Teams', route: '/collection/manage_teams', icon: ['fas', 'user-tie'] },
                { name: 'Collection Employees Management', route: '/collection/collection_employees_management', icon: ['fas', 'user-tie'] },
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
