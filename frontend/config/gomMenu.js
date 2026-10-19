// The side menu of the GOM (position level 15): his own place. He evaluates the managers (Leadership Individual Performance) and picks a
// department to view (CSD, Collection, Purchasing: read only, like the poweruser). The managers are his direct reports: the CSD & Collection
// Manager, the Purchasing Manager, the HR Manager ... (the list of the page is built from the head of each employee).
export const gomMenu = [

            {
              name: 'Leadership Performance',
              route: null,
              icon: ['fas', 'poll'],
              allowedLevels: [15],
              subMenu: [
                { name: 'EVALUATE MANAGERS', route: '/leadership/leadership_evaluation', icon: ['fas', 'user-tie'], allowedLevels: [15] },
              ]
            },

            // the GOM employee (position level 15) is added here by the admin: the position is the one with GOM in its name
            {
              name: 'Admin Panel',
              route: null,
              icon: ['fas', 'cog'],
              allowedRoles: ['admin'],
              subMenu: [
                { name: 'Teams', route: '/gom/manage_teams', icon: ['fas', 'user-tie'] },
                { name: 'GOM Employees Management', route: '/gom/gom_employees_management', icon: ['fas', 'user-tie'] },
              ]
            },

            {
              name: 'Switch Department',
              route: '/select_department',
              icon: ['fas', 'layer-group'],
              allowedRoles: ['admin'],
              allowedLevels: [15]
            },

]
