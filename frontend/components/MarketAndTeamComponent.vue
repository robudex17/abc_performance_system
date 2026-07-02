<template>
  <div >
 
    <!-- Add Agent Button -->
    <button  :disabled="['user', 'manager'].includes(currentUser.role)"
      class="mb-2 px-2 py-1 bg-blue-500 text-white font-bold rounded hover:bg-blue-600  disabled:bg-gray-400 disabled:cursor-not-allowed"
      @click="openAddEntityModal"
    >
      Add {{ entityType === 'market' ? 'Market' : 'Team' }}
    </button>

    <!-- Add/Edit Agent Modal -->
    <div 
     v-if="isModalOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 class="text-xl font-bold text-gray-700 mb-4">
          {{ editMode ? 'Edit ' + entityType : 'Add New ' + entityType }}
        </h2>
        <form @submit.prevent="editMode ? updateEntity() : addEntity()">
          <div class="grid grid-cols-1 gap-4 overflow-y-auto max-h-80">
            <!-- Form fields go here -->

          <label for= " entity id" class="font-semibold text-gray-600" v-if="editMode">{{ entityType }} Id</label>
            <input v-if="editMode"
              id="entity_id"
              type="text"
              v-model="currentEntity.id"
              placeholder="Id"
              class="p-2 border rounded"
              required
              disabled
            />

        <!-- Market Name -->
        <label for="entity name" class="font-semibold text-gray-600">{{ entityType }} Name</label>
        <input
          id="entity_name"
          type="text"
          v-model="currentEntity.name"
          placeholder="Name" 
          class="p-2 border rounded"
          required
        />

        <!-- Market Status Dropdown -->
        <label v-if="editMode" for="market_status" class="font-semibold text-gray-600">{{ entityType }} Status</label>
        <select
          v-if="editMode"
          id="market_status"
          v-model="currentEntity.status"
          class="p-2 border rounded"
          required
        >
    
          <option  value="0">Deactivate</option>
          <!-- If current status is 0 (Inactive), show option to activate -->
          <option  value="1">Activate</option>
        </select>


          </div>
          <div class="flex justify-end space-x-4 mt-4">
            <button
              type="button"
              class="px-4 py-2 bg-gray-400 text-white font-bold rounded hover:bg-gray-500"
              @click="closeModal"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600"
            >
              {{ editMode ? 'Update ' + entityType : 'Add ' + entityType }}
            </button>
          </div>
        </form>
      </div>
    </div>


   
    <!-- Market Table -->
    
    <div class="overflow-x-auto shadow-xl rounded-lg">
      <table class="w-full table-auto border-collapse bg-white">
        <thead>
          <tr class="bg-gradient-to-r from-blue-200 to-blue-300 text-gray-800">
            
            <th class="py-2 px-3 border text-center text-xs font-bold uppercase" v-if="entityType =='market'">Market ID</th>
            <th class="py-2 px-3 border text-center text-xs font-bold uppercase" v-if="entityType == 'market'">Market Name</th>
            <th class="py-2 px-3 border text-center text-xs font-bold uppercase"  v-if="entityType =='market'">Market Status</th>
           <th class="py-2 px-3 border text-center text-xs font-bold uppercase" v-if="entityType =='team'">Team ID</th>
            <th class="py-2 px-3 border text-center text-xs font-bold uppercase" v-if="entityType == 'team'">Team Name</th>
            <th class="py-2 px-3 border text-center text-xs font-bold uppercase"  v-if="entityType =='team'">Team Status</th>
            <th class="py-2 px-3 border text-center text-xs font-bold uppercase">Date Created </th>
            <th class="py-2 px-3 border text-center text-xs font-bold uppercase">Date Dismantled </th>
            <th class="py-2 px-3 border text-center text-xs font-bold uppercase">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="entity in  paginatedEntities"
            :key="entity.id"
            class="even:bg-blue-50 odd:bg-white"
          >
            <td class="py-2 px-3 border text-center text-xs font-bold text-gray-700">
              {{ entity.id }}
            </td>

           <td class="py-2 px-3 border text-center text-xs font-bold text-gray-700">
              {{ entity.name }}
            </td>
            <td class="py-2 px-3 border text-center text-xs font-bold"
                :class="{
                'text-green-700': entity.status === 1,
                'text-red-700': entity.status === 0,
                }"
            >
               {{ entity.status === 1 ? 'Active' : 'Dismantled' }}  
            </td>
            <td class="py-2 px-3 border text-center text-xs font-bold text-green-700">
               {{ formatDate(entity.created_at) }}
            </td>

            <td class="py-2 px-3 border text-center text-xs font-bold text-red-700">
             {{ entity.status === 0 ? formatDate(entity.updated_at) : '' }}
            </td>


            <td class="py-2 px-3 border text-center">
            <div class="flex justify-center space-x-2">
                <button 
                :disabled="currentUser.role !== 'admin' || entity.status === 0"
                class="px-4 py-0.5 bg-green-500 text-white font-bold rounded hover:bg-green-600  
                        disabled:bg-gray-400 disabled:cursor-not-allowed"
                @click="openEditEntityModal(entity)"
                >
                <i class="fas fa-edit"></i>
                Edit
                </button>
            </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- <div v-else>

      <p>No {{ entityType }} Yet</p>
    </div> -->

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-4 flex justify-center space-x-4">
      <button
        v-for="page in totalPages"
        :key="page"
        class="px-4 py-2 border rounded"
        :class="{
          'bg-blue-500 text-white': currentPage === page,
          'bg-white text-gray-700': currentPage !== page,
        }"
        @click="currentPage = page"
      >
        {{ page }}
      </button>
    </div>

  </div>
</template>

<script setup>




import { ref, computed, defineEmits,defineProps } from 'vue';
import { onMounted } from 'vue';


 const emit = defineEmits(['passAddEntity', 'passUpdateEntity', 'passDeleteEntity'])
 
const props = defineProps({
  entity: {
    type: Array,
    required: true,
  },
  entityType: {
    type: String,
    required: true,
  },

});



const itemsPerPage = 5;
const currentPage = ref(1);

const totalPages = computed(() =>
  Math.ceil(props.entity.length / itemsPerPage)
)

const paginatedEntities = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return props.entity.slice(start, end);
});


//get the current user
const authStore = useAuthStore()
authStore.fetchTokenFromLocalStore()

const currentUser = authStore.state.user 


const formatDate = (dateString) =>{
      if (!dateString) return "";
      return new Date(dateString).toLocaleDateString("en-PH", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "long", // Full month name (e.g., September)
        day: "numeric" // Day without leading zero
      });
    }

 
const isModalOpen = ref(false);
const editMode = ref(false); // Toggle between Add and Edit mode


const currentEntity = ref({
  id: '',
  name: '',
  status: '',
  created_at: '',
  updated_at: ''
});



const openAddEntityModal = () => {
  editMode.value = false;
  resetCurrentEntity()
  isModalOpen.value = true;
};

const openEditEntityModal = (entity) => {
 
  editMode.value = true;
  Object.assign(currentEntity.value, entity);
  isModalOpen.value = true;
};



const closeModal = () => {
  isModalOpen.value = false;
};


const resetCurrentEntity = () => {
  currentEntity.value = {
    id: '',
    name: '',
    status: '',
    created_at: '',
    updated_at: '',
  };

};


const addEntity =() => {
 try{
  
   emit('passAddEntity',props.entityType, currentEntity.value, 'POST', `${currentEntity.value.id} ${props.entityType} added successfully`);
   closeModal();
 }catch(error){
   console.error(`Error in adding ${props.entityType}`, error)
 }
  
  
};


const updateEntity =  () => {

 try{
   emit('passUpdateEntity', props.entityType,currentEntity.value, 'PUT', `${currentEntity.value.id} ${props.entityType} updated successfully`);
   closeModal();
 }catch(error){
   console.error(`Error in updating ${props.entityType}`, error)
 }
   
};


const deleteEntity = () => {
  try {
    emit('passDeleteEntity', props.entityType, currentEntity.value, 'DELETE', `${currentEntity.value.id} ${props.entityType} deleted successfully`);
   closeModal();
  }catch(error){
    console.error(`Error in deleting ${props.entityType} with id: ${currentEntity.value.id}`, error)
  }
 
};



</script>
