<template>
  <div class="p-4 mt-20">
    <h1 class="text-3xl font-extrabold text-gray-800 mb-6 text-center  ">Markets and Teams Information</h1>


    <market-and-team-component :entity="markets" entityType="market" 

    @passAddEntity="addEntity"
    @passUpdateEntity="updateEntity"
    @passDeleteEntity="deleteEntity"
    ></market-and-team-component>

    <market-and-team-component :entity="teams" entityType="team"
    class="pt-10 pb-10"
    @passAddEntity="addEntity"
    @passUpdateEntity="updateEntity"
    @passDeleteEntity="deleteEntity"
    ></market-and-team-component>
  </div>
</template>

<script setup>

definePageMeta({
    middleware: ['auth' ,'admin'] 
})


import { ref, computed } from 'vue';
import { onMounted } from 'vue';

const config = useRuntimeConfig()



//get the current user
const authStore = useAuthStore()
authStore.fetchTokenFromLocalStore()

const currentUser = authStore.state.user 

const marketAgentStore =  useMarketStore()
const teamsAgentStore =   useTeamStore()


const fetchMarkets = () => {
  marketAgentStore.fetchMarkets(null)
  
};

const fetchTeams = () => {
  teamsAgentStore.fetchTeams(null )
  
};


const formatDate = (dateString) =>{
      if (!dateString) return "";
      return new Date(dateString).toLocaleDateString("en-PH", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "long", // Full month name (e.g., September)
        day: "numeric" // Day without leading zero
      });
    }

 onMounted( () => {
   fetchMarkets()
   fetchTeams()
});


 const markets = computed(() =>  marketAgentStore.state.markets);
 const teams = computed(() =>  teamsAgentStore.state.teams);


const openAddMarketModal = () => {
  editMode.value = false;
  resetCurrentMarket()
  isModalOpen.value = true;
};

const openEditMarketModal = (market) => {
  console.log('the current market is', market)
  editMode.value = true;
  Object.assign(currentMarket.value, market);
  isModalOpen.value = true;
};



const closeModal = () => {
  isModalOpen.value = false;
};


const resetCurrentMarket = () => {
  currentMarket.value = {
    id: '',
    name: '',
    status: '',
    created_at: '',
    updated_at: '',
  };

};


const addEntity = async(entityType, data, httpMethod, message) => {
if(entityType === 'market'){
 try{
   await marketAgentStore.addUpdateDeleteMarket(data, 'POST', `${data.id} Market added successfully`);
 
 }catch(error){
   console.error('Error in adding market', error)
 }

}else if(entityType === 'team'){
  try{
   await teamsAgentStore.addUpdateDeleteTeam(data, 'POST', `${data.id} Team added successfully`);

  }catch(error){
   console.error('Error in adding team', error)
  }
}
}

const updateEntity = async ( entityType, data, httpMethod, message) => {
if(entityType === 'market'){
  try{
   await marketAgentStore.addUpdateDeleteMarket(data, 'PUT', `${data.id} Market updated successfully`);
  }catch(error){
   console.error('Error in updating market', error)
  }
}else if(entityType === 'team'){
  try{
   await teamsAgentStore.addUpdateDeleteTeam(data, 'PUT', `${data.id} Team updated successfully`);

  }catch(error){
   console.error('Error in updating team', error)
 }
   
}
}


const deleteEntity = async ( entityType, data,httpMethod, message) => {
  if(entityType === 'market'){
  try {
     await marketAgentStore.addUpdateDeleteMarket(data, 'DELETE', `${data.id} Market deleted successfully`);

  }catch(error){
    console.error(`Error in deleting market with id: ${data.id}`, error)
  }
}else if(entityType === 'team'){
  try {
     await teamsAgentStore.addUpdateDeleteTeam(data, 'DELETE', `${data.id} Team deleted successfully`);

  }catch(error){
    console.error(`Error in deleting team with id: ${data.id}`, error)
  }
}
}
</script>