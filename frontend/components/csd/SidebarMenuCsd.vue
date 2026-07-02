<template>
    <div class="flex">
      <!-- Sidebar -->
      <aside :class="sidebarClass" class="bg-gray-800 text-white transition-all fixed h-screen">
          <div class="flex justify-between items-center p-4 text-center text-2xl font-bold border-b border-gray-700">
            <div v-if="!isCollapsed" class="pr-2">CSD Performance System </div>
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
import { useRouter } from 'vue-router'
import { useMenuBuilder } from '~/composables/useMenuBuilder'
import { csdMenu } from '~/config/csdMenu'

     //get the current user
const authStore = useAuthStore()
authStore.fetchTokenFromLocalStore()
const currentUser = authStore.state.user 

const router = useRouter();
const route = useRoute(); // Access the current route

const activeMenu = ref('Dashboard'); // Holds the name of the currently active menu
const isCollapsed = ref(false);
const submenuStates = ref({});

const { buildMenu } = useMenuBuilder()

// 🔥 dynamic filtered menu
const menuItems = buildMenu(csdMenu, currentUser)


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