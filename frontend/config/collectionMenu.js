export const collectionMenu = [

            { name: "Dashboard", route: '/collection/dashboard', icon: ['fas', 'tachometer-alt']},
            { name: 'Leaderboard', route: '/collection', icon: ['fas', 'list'] },


           { 
              name: 'Agent Performance', 
              route: null, 
              icon: ['fas', 'cog'],
              subMenu: [
                { name: 'Agent_Monthly', route: '/collection/agent_performance/monthly', icon: ['fas', 'user'] },
                { name: 'Agent_Yearly', route: '/collection/agent_performance/yearly', icon: ['fas', 'user'] },
              
              ]
            },
            { 
              name: 'Team Performance', 
              route: null, 
              icon: ['fas', 'cog'],
              subMenu: [
              { name: 'Team_Monthly', route: '/collection/team_performance/monthly', icon: ['fas', 'users'] },
              { name: 'Team_Yearly', route: '/collection/team_performance/yearly', icon: ['fas', 'users'] },
              ]
            },

            { 
              name: 'Reports', 
              route: null, 
              icon: ['fas', 'cog'],
              subMenu: [
              { name: 'Monthly_Target', route: '/collection/target/monthly', icon: ['fas', 'users'] },
             
               { name: 'custom_search', route: '/collection/target/custom_search/target', icon: ['fas', 'fa-search'] },
              
              ]
            },


            // { name: 'Reports', route: '/reports', icon: ['fas', 'file-alt'] },

            { 
              name: 'Feedback', 
              route: null, icon: ['fas', 'poll'],
              subMenu:[
                { name: 'BY QA', route: '/collection/feedback/feedback_by_qa', icon: ['fas', 'users']  },
                // { name: 'BY Admin', route: '/collection/feedback/feedback_by_admin', icon: ['fas', 'users']  },
               
              ] 
            
            },            

            { 
              name: 'Admin Panel',
              route: null,
              icon: ['fas', 'cog'],
              subMenu: [
              
           
                { name: 'collection Evaluation', route: '/collection/sales_evaluation', icon: ['fas', 'user-tie'] },
                { name: 'Upload collection Metrics Data', route: '/collection/upload_sales_evaluation_data', icon: ['fas', 'fa-upload'] },
                { name: 'Teams', route: '/collection/manage_teams', icon: ['fas', 'user-tie'] },
                // { name: 'export', route: '/admin/export_to_excel', icon: ['fas', 'fa-file-excel'] },


               { name: 'Collection Employees Management', route: '/collection/collection_employees_management', icon: ['fas', 'user-tie'] },

              ]
            },

            {
              name: 'Switch Department',
              route: '/select_department',
              icon: ['fas', 'layer-group']
            },

]