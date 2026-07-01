<template>
    <div class="p4 mt-20" >
       
        <ManageEmployeeComponent 
            :employees="employees" 
            :teams="teams" 
            :managers="managers" 
            :positions="positions"
            :roles="roles"
            :employee_status="employee_status"
            :highest_level= 10
            department_code="csd"
            @passAddEmployee="addEmployee"
            @passUpdateEmployee="updateEmployee"
        />
    </div>
</template>

<script setup>
   definePageMeta({
    layout: 'csd', // This tells Nuxt to use the 'csd' layout for this page
    middleware: ['auth'] // This applies the 'auth' middleware to this page
    })

    import ManageEmployeeComponent from '~/components/shared/ManageEmployeeComponent.vue';

   

    const router = useRouter()
    const route = useRoute()
    const employee_status = ref('Hired') // default status

    //computured propery here 
    const employees = computed(() => employeesStore.state.employees)
    const teams = computed(() => teamsAgentStore.state.teams)
    const managers = computed(() => managerStore.state.managers)
    // const positions = computed(() => positionsRolesStore.state.positions)

    const positions = computed(() => {
        const allPositions = positionsRolesStore.state.positions;
    
        // Guard clause: if data isn't loaded yet, return an empty array
        if (!allPositions) return [];

        return allPositions.filter(item => 
            item.position_name && 
            (item.position_name.toLowerCase().includes('csd') || item.position_name.toLowerCase().includes('customer service'))
        );
    });

    const roles = computed(() => positionsRolesStore.state.roles)
   
    //  pinia store state management
    const managerStore = useManagerStore2()
    const teamsAgentStore =   useTeamStore2()
    const employeesStore = useManageEmployeesStore()
    const positionsRolesStore = usePositionsRolesStore()


 

    //method here 
    const fethEmployees =  () => {
       employeesStore.fetchEmployees(route.query, 'csd')
    }


    const fetchTeams = () => {
        teamsAgentStore.fetchTeams(null, 'csd', {team_status: 1} )
        
    };

    const fetchMangers = () => {
        managerStore.fetchManagers('csd')
    }

    const fetchPositionsRoles = (type) => {
        positionsRolesStore.fetchPositionsRoles(null, type,{type:type})
    }


    const addEmployee = async(employeeData) => {
         try {
            employeeData.department_code = 'csd'
            console.log('data from the child component', employeeData)
            

            await employeesStore.addEmployee(employeeData, 'csd', route.query);

            fethEmployees()
            fetchMangers()
            fetchTeams()
            fetchPositionsRoles('positions')
             fetchPositionsRoles('roles')

        }catch(error){
            console.error('Error in adding new sales agent', error)
        }
        
      
    };


    const updateEmployee = async(employeeData) => {
        try {
            employeeData.department_code = 'csd'
            console.log('data from the child component for update', employeeData)
        
            await employeesStore.updateEmployee(employeeData, 'csd', route.query);

             fethEmployees()
             fetchMangers()
             fetchTeams()
             fetchPositionsRoles('positions')
             fetchPositionsRoles('roles')

        }catch(error){
            console.error('Error in updating  employee', error)
        }
        
      
    };



    onMounted(() => {
      fethEmployees()
      fetchTeams()
      fetchMangers()
      fetchPositionsRoles('positions')
      fetchPositionsRoles('roles')
     })


    //      watch(
    //   () => currentAgent.value.start_date,
    //   (newDate) => {

      
    //     if (
    //       currentAgent.value.employee_status === "Rehired" &&
    //       newDate &&
    //       originalAssignment.value.end_date &&
    //       new Date(newDate) < new Date(originalAssignment.value.end_date)
    //     ) {
    //       alert("Rehired date cannot be earlier than the  prevous resigned date of an agent.");
    //       currentAgent.value.start_date = today; // reset to today
    //     }
    //   }

    // );


    //watch for the route change


    watch(route, (newRoute) => {
        console.log('The route is change. we should react to the change..')
        
        
        fethEmployees()
        fetchTeams()
        fetchMangers()
        
        employee_status.value = newRoute.query.employee_status

        fethEmployees(newRoute.query)
        fetchTeams()
        fetchMangers()
        
     

        
        },  { immediate: true, deep: true }

    )




</script>