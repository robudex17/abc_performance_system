<template>
    <div class="flex">
      <!-- Sidebar -->
      <aside :class="sidebarClass" class="bg-gray-800 text-white transition-all fixed h-screen">
          <div class="flex justify-between items-center p-4 text-center text-2xl font-bold border-b border-gray-700">
            <div v-if="!isCollapsed">Sales Performance Dashboard</div>
            <button @click="toggleSidebar" class="text-white">
              <font-awesome-icon :icon="['fas', 'bars']" />
            </button>
          </div>
          <nav>
            <ul>
              <li
                v-for="item in menuItems"
                :key="item.name"
                class="p-4 hover:bg-gray-700 cursor-pointer"
                :class="{ 'bg-blue-600 rounded-xl': activeMenu === item.name }"
              >
                <div @click="item.subMenu ? toggleSubmenu(item.name) : activateMenu(item.name, item.route)">
                  <font-awesome-icon :icon="item.icon" class="pr-1" /> 
                  <span v-if="!isCollapsed">{{ item.name }}</span>
                  <font-awesome-icon 
                    v-if="item.subMenu" 
                    :icon="['fas', submenuStates[item.name] ? 'chevron-up' : 'chevron-down']" 
                    class="ml-auto" 
                  />
                </div>
                <!-- Dropdown for submenus -->
                <ul v-if="item.subMenu && submenuStates[item.name]" class="ml-4 mt-2 space-y-2 ">
                  <li
                    v-for="subItem in item.subMenu"
                    :key="subItem.name"
                    class="p-2 pl-6 hover:bg-gray-600 cursor-pointer"
                    :class="{ 'bg-blue-600 rounded-xl': activeMenu === subItem.name }"
                    @click="activateMenu(subItem.name, subItem.route)"               
                  >
                    <div >
                      <font-awesome-icon :icon="subItem.icon" /> {{ subItem.name }}
                    </div>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
            <!-- Logout button at the bottom -->
            <button class="logout-btn p-4 hover:bg-gray-700 cursor-pointer mt-auto " @click="logout">
              <font-awesome-icon :icon="['fas', 'sign-out-alt']" class="pr-2" />
              <span v-if="!isCollapsed">Logout</span>
            </button>
      </aside>
  
        <!-- Main Content -->
      <main :class="mainClass" class="p-6 bg-gray-100 flex flex-col">
          <slot />
      </main>
  </div>
</template>
 
 
 <script setup>
      import { ref, computed, onMounted } from 'vue';
      import { useRouter, useRoute } from 'vue-router';

      //get the current user
      const authStore = useAuthStore()
      authStore.fetchTokenFromLocalStore()
      const currentUser = authStore.state.user 

      const router = useRouter();
      const route = useRoute(); // Access the current route

      const activeMenu = ref('Leaderboard'); // Holds the name of the currently active menu
      const isCollapsed = ref(false);
      const submenuStates = ref({});
      let menuItems 

      if (currentUser.role === 'admin' || currentUser.role == 'poweruser'){
          menuItems = [
            // { name: 'Dashboard', route: null , icon: ['fas', 'tachometer-alt'],
            //   subMenu: [
            //     { name: 'month', route: '/dashboard/dashboard_month_view', icon: ['fas', 'tachometer-alt']  },
            //     { name: 'year', route: '/dashboard/dashboard_year_view', icon: ['fas', 'tachometer-alt']  },
            //     { name: 'chart-view', route: '/dashboard/dashboard_chart_view', icon: ['fas', 'tachometer-alt']},
            //   ]
            // },
            //?dashboardoption=individual
            //?leaderboardOption=agent
            { name: "Dashboard", route: '/dashboard', icon: ['fas', 'tachometer-alt']},
            { name: 'Leaderboard', route: '/', icon: ['fas', 'list'] },


           { 
              name: 'Agent Performance', 
              route: null, 
              icon: ['fas', 'cog'],
              subMenu: [
                { name: 'Agent_Monthly', route: '/admin/agent_performance/monthly', icon: ['fas', 'user'] },
                { name: 'Agent_Yearly', route: '/admin/agent_performance/yearly', icon: ['fas', 'user'] },
              
              ]
            },
            { 
              name: 'Team Performance', 
              route: null, 
              icon: ['fas', 'cog'],
              subMenu: [
              { name: 'Team_Monthly', route: '/admin/team_performance/monthly', icon: ['fas', 'users'] },
              { name: 'Team_Yearly', route: '/admin/team_performance/yearly', icon: ['fas', 'users'] },
              ]
            },

            { 
              name: 'Reports', 
              route: null, 
              icon: ['fas', 'cog'],
              subMenu: [
              { name: 'Monthly_Target', route: '/admin/target/monthly', icon: ['fas', 'users'] },
              // { name: 'Yearly_Target', route: '/admin/target/yearly', icon: ['fas', 'users'] },
               { name: 'custom_search', route: '/admin/target/custom_search/target', icon: ['fas', 'fa-search'] },
              
              ]
            },

            { 
              name: 'Analytics', 
              route: null, icon: ['fas', 'chart-bar'],
              subMenu:[
                { name: 'Overall', route: '/analytics/overall', icon: ['fas', 'users']  },
                { name: 'Market', route: '/analytics/market', icon: ['fas', 'users']  },
                { name: 'Agents', route: '/analytics/agents', icon: ['fas', 'user']}
              ] 
            
            },
            // { name: 'Reports', route: '/reports', icon: ['fas', 'file-alt'] },

            { 
              name: 'Feedback', 
              route: null, icon: ['fas', 'poll'],
              subMenu:[
                { name: 'BY QA', route: '/feedback/feedback_by_qa', icon: ['fas', 'users']  },
                { name: 'BY Admin', route: '/feedback/feedback_by_admin', icon: ['fas', 'users']  },
               
              ] 
            
            },            

            { 
              name: 'Admin Panel',
              route: null,
              icon: ['fas', 'cog'],
              subMenu: [
                { name: 'Manage Standard Users', route: '/admin/manage_standard_users', icon: ['fas', 'user'] },
                // { name: 'Manage Sales Agents', route: '/admin/agent/manage_sales_agents', icon: ['fas', 'user-tie'] },
                // { name: 'Upload Target/Shipok Sales Data', route: '/admin/upload_target_shipok_data', icon: ['fas', 'fa-upload'] },
                // { name: 'Upload New Deposit Sales Data', route: '/admin/upload_new_deposit_data', icon: ['fas', 'fa-upload'] },
                { name: 'Sales Evaluation', route: '/admin/sales_evaluation', icon: ['fas', 'user-tie'] },
                { name: 'Upload Sales Evaluation Data', route: '/admin/upload_sales_evaluation_data', icon: ['fas', 'fa-upload'] },
                  { name: 'Markets and Teams', route: '/admin/markets_and_teams', icon: ['fas', 'user-tie'] },
                // { name: 'export', route: '/admin/export_to_excel', icon: ['fas', 'fa-file-excel'] },


               { name: 'Manage Sales Agents', route: '/admin/agent2/manage_sales_agents', icon: ['fas', 'user-tie'] },

              ]
            },

            {
              name: 'Switch Department',
              route: '/select_department',
              icon: ['fas', 'layer-group']
            },
          ];
      }else if (currentUser.role === 'manager' && currentUser.login_type == 'salesagentuser'  && currentUser.agent_type == 2){
        menuItems = [
            // { name: 'Dashboard', route: null , icon: ['fas', 'tachometer-alt'],
            //   subMenu: [
            //     { name: 'month', route: '/dashboard/dashboard_month_view', icon: ['fas', 'tachometer-alt']  },
            //     { name: 'year', route: '/dashboard/dashboard_year_view', icon: ['fas', 'tachometer-alt']  },
            //     { name: 'chart-view', route: '/dashboard/dashboard_chart_view', icon: ['fas', 'tachometer-alt']},
            //   ]

            // },
            { name: "Dashboard", route: '/dashboard', icon: ['fas', 'tachometer-alt']},
            { name: 'Leaderboard', route: '/', icon: ['fas', 'list'] },

            // { name: 'Reports', route: '/reports', icon: ['fas', 'file-alt'] },
            { 
              name: 'Agent Performance', 
              route: null, 
              icon: ['fas', 'cog'],
              subMenu: [
                { name: 'Agent_Monthly', route: '/admin/agent_performance/monthly', icon: ['fas', 'user'] },
                { name: 'Agent_Yearly', route: '/admin/agent_performance/yearly', icon: ['fas', 'user'] },
                // { name: 'Analytics', route: '/agent_performance/analytics', icon: ['fas', 'user'] },
              ]
            },
            { 
              name: 'Team Performance', 
              route: null, 
              icon: ['fas', 'cog'],
              subMenu: [
                { name: 'Team_Monthly', route: '/admin/team_performance/monthly', icon: ['fas', 'users'] },
                { name: 'Team_Yearly', route: '/admin/team_performance/yearly', icon: ['fas', 'users'] },
                // { name: 'Analytics', route: '/team_performance/analytics', icon: ['fas', 'users'] },
              ]
            },

           { 
              name: 'Reports', 
              route: null, 
              icon: ['fas', 'cog'],
              subMenu: [
              { name: 'Monthly_Target', route: '/admin/target/monthly', icon: ['fas', 'users'] },
              // { name: 'Yearly_Target', route: '/admin/target/yearly', icon: ['fas', 'users'] },
               { name: 'custom_search', route: '/admin/target/custom_search/target', icon: ['fas', 'fa-search'] },
              
              ]
            },

            // { 
            //   name: 'Overall Performance', 
            //   route: null, 
            //   icon: ['fas', 'cog'],
            //   subMenu: [
            //   { name: 'Overall_Monthly', route: '/admin/overall_performance/monthly', icon: ['fas', 'users'] },
            //   { name: 'Overall_Yearly', route: '/admin/overall_performance/yearly', icon: ['fas', 'users'] },
            //   ]
            // },            


            { 
              name: 'Feedback', 
              route: null, icon: ['fas', 'poll'],
              subMenu:[
              
                // { name: 'LOCAL MANAGER', route: '/feedback/lm_feedback', icon: ['fas', 'users']},
                { name: 'LOCAL MANAGER', route: '/feedback/feedback_by_sales?feedback_type=lm_by_um', icon: ['fas', 'users']},
              
              ] 
            },

            // { 
            //   name: 'Analytics', 
            //   route: null, icon: ['fas', 'chart-bar'],
            //   subMenu:[
            //     { name: 'Overall', route: '/analytics/overall', icon: ['fas', 'users']  },
            //     { name: 'Market', route: '/analytics/market', icon: ['fas', 'users']  },
            //     { name: 'Agents', route: '/analytics/agents', icon: ['fas', 'user']}
            //   ] 
            
            // },           

            { 
              name: 'Admin Panel',
              route: null,
              icon: ['fas', 'cog'],
              subMenu: [
                // { name: 'Manage Standard Users', route: '/admin/manage_standard_users', icon: ['fas', 'user'] },
                { name: 'Manage Sales Agents', route: '/admin/agent2/manage_sales_agents', icon: ['fas', 'user-tie'] },
                 { name: 'Sales Evaluation', route: '/admin/sales_evaluation', icon: ['fas', 'user-tie'] },
 
              ]
            }
          ];
      }
      else if (currentUser.role === 'manager' && currentUser.login_type == 'salesagentuser'  && currentUser.agent_type == 1){
        menuItems = [
          // { name: 'Dashboard', route: null , icon: ['fas', 'tachometer-alt'],
          //     subMenu: [
          //       { name: 'month', route: '/dashboard/dashboard_month_view', icon: ['fas', 'tachometer-alt']  },
          //       { name: 'year', route: '/dashboard/dashboard_year_view', icon: ['fas', 'tachometer-alt']  },
          //       { name: 'chart-view', route: '/dashboard/dashboard_chart_view', icon: ['fas', 'tachometer-alt']},
          //     ]

          //   },
           { name: "Dashboard", route: '/dashboard', icon: ['fas', 'tachometer-alt']},
            { name: 'Leaderboard', route: '/', icon: ['fas', 'list'] },

            { 
              name: 'Performance Evaluation', 
              route: null, 
              icon: ['fas', 'cog'],
              subMenu: [
                { name: 'Agent_Monthly', route: '/admin/agent_performance/monthly', icon: ['fas', 'user'] },
                { name: 'Agent_Yearly', route: '/admin/agent_performance/yearly', icon: ['fas', 'user'] },
                // { name: 'Analytics', route: '/agent_performance/analytics', icon: ['fas', 'user'] },
              ]
            },
            { 
              name: 'Team Performance', 
              route: null, 
              icon: ['fas', 'cog'],
              subMenu: [
                { name: 'Team_Monthly', route: '/team_performance/month', icon: ['fas', 'users'] },
                { name: 'Team_Yearly', route: '/team_performance/year', icon: ['fas', 'users'] },
                // { name: 'Analytics', route: '/team_performance/analytics', icon: ['fas', 'users'] },
              ]
            },

            { 
              name: 'Reports', 
              route: null, 
              icon: ['fas', 'cog'],
              subMenu: [
              { name: 'Monthly_Target', route: '/admin/target/monthly', icon: ['fas', 'users'] },
              // { name: 'Yearly_Target', route: '/admin/target/yearly', icon: ['fas', 'users'] },
               { name: 'custom_search', route: '/admin/target/custom_search/target', icon: ['fas', 'fa-search'] },
              
              ]
            },

            { 
              name: 'Feedback', 
              route: null, icon: ['fas', 'poll'],
              subMenu:[
              
                // { name: 'MANAGER', route: '/feedback/managers_feedback', icon: ['fas', 'users']},
                // { name: 'AGENTS', route: '/feedback/agents_feedback?feedback_type=agent_by_lm', icon: ['fas', 'users']},

               { name: 'MANAGER', route: '/feedback/feedback_by_sales?feedback_type=um_by_lm', icon: ['fas', 'users']},
              { name: 'AGENTS', route: '/feedback/feedback_by_sales?feedback_type=agent_by_lm', icon: ['fas', 'users']},
              
              ] 
            
            },

            // { 
            //   name: 'Admin Panel',
            //   route: null,
            //   icon: ['fas', 'cog'],
            //   subMenu: [
            //     { name: 'Manage Standard Users', route: '/admin/manage_standard_users', icon: ['fas', 'user'] },
            //     { name: 'Manage Sales Agents', route: '/admin/agent/manage_sales_agents', icon: ['fas', 'user-tie'] },
            
            //   ]
            // }
          ];
      }
      else if( currentUser.role == 'user' && currentUser.login_type == 'salesagentuser'  && currentUser.agent_type == 0){
      activeMenu.value = "Agent Performance"
        menuItems = [
            { name: "Dashboard", route: '/dashboard', icon: ['fas', 'tachometer-alt']},
             { name: 'Leaderboard', route: '/', icon: ['fas', 'list'] },

            { 
              name: 'Performance Evaluation', 
              route: null, 
              icon: ['fas', 'cog'],
              subMenu: [
                { name: 'Agent_Monthly', route: '/agent_performance/month', icon: ['fas', 'user'] },
                { name: 'Agent_Yearly', route: '/agent_performance/year', icon: ['fas', 'user'] },
                // { name: 'Analytics', route: '/agent_performance/analytics', icon: ['fas', 'user'] },
              ]
            },

            { 
              name: 'Reports', 
              route: null, 
              icon: ['fas', 'cog'],
              subMenu: [
              { name: 'Monthly_Target', route: '/admin/target/monthly', icon: ['fas', 'users'] },
              // { name: 'Yearly_Target', route: '/admin/target/yearly', icon: ['fas', 'users'] },
               { name: 'custom_search', route: '/admin/target/custom_search/target', icon: ['fas', 'fa-search'] },
              
              ]
            },
            // { 
            //   name: 'Team Performance', 
            //   route: null, 
            //   icon: ['fas', 'cog'],
            //   subMenu: [
            //     { name: 'Team_Monthly', route: '/team_performance/month', icon: ['fas', 'users'] },
            //     { name: 'Team_Yearly', route: '/team_performance/year', icon: ['fas', 'users'] },
            //     // { name: 'Analytics', route: '/team_performance/analytics', icon: ['fas', 'users'] },
            //   ]
            // },

                        { 
              name: 'Feedback', 
              route: null, icon: ['fas', 'poll'],
              subMenu:[
              
                // { name: 'MANAGER', route: '/feedback/managers_feedback', icon: ['fas', 'users']},
                { name: 'MANAGER', route: '/feedback/feedback_by_sales?feedback_type=lm_by_agent', icon: ['fas', 'users']},

              ] 
            
            },

            
      ]
            
          
      }

      const isNotAnalytics = computed(() =>{
        if(!analyticsPath.value.includes(route.path)){
          return true
        }else{
          return false
        }
      })

      const logout = () => {
          const confirmation = window.confirm("Are you sure you want to logout?");
          if (!confirmation) {
                    return; // Exit if the user cancels the deletion
          }
          localStorage.removeItem('jwt')
          
          router.push('/login')
          location.reload()
        
      }
      const activateMenu = (menuName, route) => {
          activeMenu.value = menuName;
          if (route) {
            router.push(route); // Navigate to the specified route
          }
      };

      const toggleSidebar = () => {
        isCollapsed.value = !isCollapsed.value;
      };

      const sidebarClass = computed(() => {
        return isCollapsed.value ? 'w-16' : 'w-64';
      });

      const mainClass = computed(() => {
        return isCollapsed.value ? 'ml-16' : 'ml-64';
      });

      const toggleSubmenu = (menuName) => {
        submenuStates.value[menuName] = !submenuStates.value[menuName];
      };

      const setActiveMenuFromRoute = () => {
        console.log('the Route is ', route)
        const currentRoute = route.path;

           if (/^\/admin\/agent2/.test(currentRoute)) {
              
              submenuStates.value["Admin Panel"] = true; // Open the Admin Panel submenu
               activeMenu.value = "Manage Sales Agents";
              return;
        }

        if (/^\/admin\/agent2\/\d+\/details$/.test(currentRoute)) {
              submenuStates.value["Admin Panel"] = true; // Open the Admin Panel submenu
               activeMenu.value = "Manage Sales Agents";
              return;
        }

        if(currentRoute == "/agent_performance/month"){
            submenuStates.value["Agent Performance"] = true; // Open the Agent Performance submenu
            activeMenu.value = "Agent_Monthly";
            return;         
        }

        if(currentRoute == "/agent_performance/year"){
            submenuStates.value["Agent Performance"] = true; // Open the Agent Performance  submenu
            activeMenu.value = "Agent_Yearly";
            return;         
        }

         if(currentRoute == "/team_performance/month"){
            submenuStates.value["Team Performance"] = true; // Open the Team Performance  submenu
            activeMenu.value = "Team_Monthly";
            return;         
        }        

         if(currentRoute == "/team_performance/year"){
            submenuStates.value["Team Performance"] = true; // Open the Team Performance  submenu
            activeMenu.value = "Team_Yearly";
            return;         
        }

         if(currentRoute == "/overall_performance/month"){
            submenuStates.value["Overall Performance"] = true; // Open the Overall Performance  submenu
            activeMenu.value = "Overall_Monthly";
            return;         
        }        


         if(currentRoute == "/overall_performance/year"){
            submenuStates.value["Overall Performance"] = true; // Open the Overall Performance  submenu
            activeMenu.value = "Overall_Yearly";
            return;         
        }    
        
         if((currentRoute == "/feedback/feedback_by_sales/um_by_lm") ||(currentRoute == "/feedback/feedback_by_sales/lm_by_agent") 
            || (currentRoute =="/feedback/feedback_by_sales" && route.query.feedback_type == 'um_by_lm') ||
              (currentRoute =="/feedback/feedback_by_sales" && route.query.feedback_type == 'lm_by_agent')
           ){
            submenuStates.value["Feedback"] = true; 
            activeMenu.value = "MANAGER";
            return;         
        }
        
         if((currentRoute == "/feedback/feedback_by_sales/agent_by_lm")|| (currentRoute =="/feedback/feedback_by_sales" && route.query.feedback_type == 'agent_by_lm')){
            submenuStates.value["Feedback"] = true; 
            activeMenu.value = "AGENTS";
            return;         
        }

         if((currentRoute == "/feedback/feedback_by_sales/lm_by_um")|| (currentRoute =="/feedback/feedback_by_sales" && route.query.feedback_type == 'lm_by_um')){
            submenuStates.value["Feedback"] = true; 
            activeMenu.value = "LOCAL MANAGER";
            return;         
        }


        for (const item of menuItems) {
          if (item.route === currentRoute) {
            activeMenu.value = item.name;
            return;
          }
          if (item.subMenu) {
            const matchedSubItem = item.subMenu.find(subItem => subItem.route === currentRoute);
            if (matchedSubItem) {
              activeMenu.value = matchedSubItem.name;
              submenuStates.value[item.name] = true; // Open the submenu
              return;
            }
       

          }
        }
      };

      onMounted(() => {
        setActiveMenuFromRoute();
      });
</script>

 <style scoped>
    aside {
      transition: width 0.3s ease-in-out;
      overflow-y: auto; /* To allow scrolling within the sidebar if needed */
      z-index: 10;
    }
    main {
      transition: margin-left 0.3s ease-in-out;
    }
 </style>
 
 