<template>
  <!-- <div class="p-6 bg-gradient-to-r from-blue-50 to-blue-100 min-h-screen"> -->
  <div class="p-4 mt-20">  
    <h1 class="text-3xl font-extrabold text-gray-800 mb-6 text-center">Standard Users Information</h1>

    <!-- Add Agent Button -->
    <button  :disabled="['user', 'manager'].includes(currentUser.role)"
      class="mb-6 px-2 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600  disabled:bg-gray-400 disabled:cursor-not-allowed"
      @click="openAddAgentModal"
    >
      Add Standard User
    </button>

    <!-- Add/Edit Agent Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 class="text-xl font-bold text-gray-700 mb-4">
          {{ editMode ? 'Edit Agent' : 'Add New Agent' }}
        </h2>
        <form @submit.prevent="editMode ? updateStandardUser() : addStandardUser()">
          <div class="grid grid-cols-1 gap-4 overflow-y-auto max-h-80">
            <!-- Form fields go here -->
            <label for="id" class="font-semibold text-gray-600">USER ID</label>
            <input
              id="id"
              type="text"
              v-model="currentStandardUser.id"
              placeholder="Agent ID"
              class="p-2 border rounded"
              :readonly="editMode"
              required
            />

            <label for="firstname" class="font-semibold text-gray-600">First Name</label>
            <input
              id="firstname"
              type="text"
              v-model="currentStandardUser.firstname"
              placeholder="First Name"
              class="p-2 border rounded"
              required
            />

            <label for="lastname" class="font-semibold text-gray-600">Last Name</label>
            <input
              id="lastname"
              type="text"
              v-model="currentStandardUser.lastname"
              placeholder="Last Name"
              class="p-2 border rounded"
              required
            />

            <label for="db_name" class="font-semibold text-gray-600">Database Name</label>
            <input
              id="db_name"
              type="text"
              v-model="currentStandardUser.db_name"
              placeholder="Database Name"
              class="p-2 border rounded"
              required
            />



            <label for="image" class="font-semibold text-gray-600">Image Photo</label>
            <input
              id="image"
              type="file"
              @change="handleFileUpload"
              class="p-2 border rounded"
            />
            <div v-if="imagePreview" class="mt-2">
              <img
                :src="updateImageLink(imagePreview)"
                alt="Agent Image"
                class="w-24 h-24 rounded-full border border-blue-200 mx-auto"
              />
            </div>
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
              {{ editMode ? 'Update Agent' : 'Add Agent' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  <!-- Add/Edit Login Modal -->
  <div
      v-if="isModalOpenForLogin"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 class="text-xl font-bold text-gray-700 mb-4">
          {{ editLoginMode ? 'Edit Agent Login' : 'Add New Agent Login' }}
        </h2>
        <form @submit.prevent="editLoginMode ? updateStandardUserLogin() : addStandardUserLogin()">
          <div class="grid grid-cols-1 gap-4 overflow-y-auto max-h-80">
            <!-- Form fields go here -->
            <label for="id" class="font-semibold text-gray-600">Login ID</label>
            <input
              id="id"
              type="text"
              v-model="currentStandardUserLogin.login_id"
              placeholder="Agent ID"
              class="p-2 border rounded"
              disabled
              required
            />

            <label for="firstname" class="font-semibold text-gray-600">Username</label>
            <input
              id="username"
              type="text"
              v-model="currentStandardUserLogin.username"
              placeholder="Username"
              class="p-2 border rounded"
              required
            />

            <!-- Enable Password Recovery Checkbox -->
           <div class="flex items-center space-x-2" v-if="editLoginMode">
          <input 
            type="checkbox" 
            id="enableRecovery" 
            v-model="enablePasswordRecovery" 
            class="h-4 w-4"
          />
          <label for="enableRecovery" class="font-semibold text-gray-600">Enable Password Recovery</label>
        </div>

            <label for="password" class="font-semibold text-gray-600">Password</label>
            <input
              id="lastname"
              type="password"
              v-model="currentStandardUserLogin.password"
              placeholder="Password"
              class="p-2 border rounded"
              :disabled="!enablePasswordRecovery"
              required
            />
            <p v-if="currentStandardUserLogin.password.length > 0 && currentStandardUserLogin.password.length < 6" class="text-red-500 text-sm">
                 Password must be at least 6 characters long.
           </p>

            <label for="re-enter-password" class="font-semibold text-gray-600">Password Again</label>
            <input
              id="password_again"
              type="password"
              v-model="currentStandardUserLogin.password_again"
              placeholder="Password Again"
              class="p-2 border rounded"
              :disabled="!enablePasswordRecovery"
              required
            />       
            
            <p v-if="currentStandardUserLogin.password_again.length > 0 && currentStandardUserLogin.password !== currentStandardUserLogin.password_again" class="text-red-500 text-sm">
              Passwords do not match.
           </p>

                     <!-- Login Status Dropdown -->
          <label for="login status" class="font-semibold text-gray-600">Status</label>
          <select
            id="login_status"
            v-model="currentStandardUserLogin.status"
            placeholder="Agent Login Status"
            class="p-2 border rounded"
            required
            
          >
          
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Supended</option>
          </select>


                             <!-- Login Role Dropdown -->
          <label for="role" class="font-semibold text-gray-600">Role</label>
          <select
            id="role"
            v-model="currentStandardUserLogin.role"
            placeholder="Agent Login Role"
            class="p-2 border rounded"
            required
            
          >
          
            <option value="admin">Admin</option>
            <!-- <option value="manager">Manager</option> -->
            <option value="poweruser">User</option>
          </select>
          <div class="flex justify-end space-x-4 mt-4">
            <button
              type="button"
              class="px-4 py-2 bg-gray-400 text-white font-bold rounded hover:bg-gray-500"
              @click="closeLoginModal"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600"
            >
              {{ editLoginMode ? 'Update Agent Login' : 'Add Agent Login' }}
            </button>
          </div>
          </div>
        </form>
      </div>
    </div>


    <!-- Agents Table -->
    <div class="overflow-x-auto shadow-xl rounded-lg">
      <table class="w-full table-auto border-collapse bg-white">
        <thead>
          <tr class="bg-gradient-to-r from-blue-200 to-blue-300 text-gray-800">
            <th class="py-2 px-3 border font-semibold uppercase">ID</th>
            <th class="py-2 px-3 border font-semibold uppercase">First Name</th>
            <th class="py-2 px-3 border font-semibold uppercase">Last Name</th>
            <th class="py-2 px-3 border font-semibold uppercase">Database Name</th>
            <th class="py-2 px-3 border font-semibold uppercase">Image</th>
            <th class="py-2 px-3 border font-semibold uppercase">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in paginatedStandardUsers"
            :key="user.id"
            class="even:bg-blue-50 odd:bg-white"
          >
            <td class="py-2 px-3 border text-center text-gray-700">
              {{ user.id }}
            </td>
       
           <td class="py-2 px-3 border text-center text-gray-700">
              {{ user.firstname }}
            </td>
            <td class="py-2 px-3 border text-center text-gray-700">
              {{ user.lastname }}
            </td>
            <td class="py-2 px-3 border text-center text-gray-700">
              {{ user.db_name }}
            </td>
      
            <td class="py-2 px-3 border text-center">
              <img
                :src="updateImageLink(user.image_link)"
                alt="Standar User Image"
                class="h-12 w-12 rounded-full mx-auto border border-blue-200"
              />
            </td>
            <td class="py-2 px-3 border text-center">
              <div class="flex justify-center space-x-2">
                <button :disabled="currentUser.role !=='admin'"
                  class="px-2 py-2 bg-green-500 text-white font-bold rounded hover:bg-green-600  disabled:bg-gray-400 disabled:cursor-not-allowed"
                  @click="openEditStandardUserModal(user)"
                >
                <i class="fas fa-edit"></i>
                  Edit
                </button>
                <button :disabled="currentUser.role !=='admin'"
                  class="px-2 py-2 bg-gray-500 text-white font-bold rounded hover:bg-gray-600  disabled:bg-gray-400 disabled:cursor-not-allowed"
                  @click="openEditStandUserLoginModal({login_id: user.id, role: user.role, status: user.login_status, username: user.username})"
                >
                  Login
                </button>
                <button :disabled="currentUser.role !=='admin'"
                  class="px-2 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-600  disabled:bg-gray-400 disabled:cursor-not-allowed"
                   @click="deleteStandardUser(user.id)"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

   

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

definePageMeta({
    middleware: ['auth' ,'admin'] 
})


import { ref, computed } from 'vue';
import { onMounted } from 'vue';

const config = useRuntimeConfig()

 const updateImageLink = (imageLink) => {
         if (!imageLink) return ''
  
        // ✅ If it's already a base64 Data URL, just return it directly
        if (imageLink.startsWith('data:image')) {
          return imageLink
        }

        // ✅ Otherwise, assume it's a server path
        return  imageLink 
  }
//get the current user
const authStore = useAuthStore()
authStore.fetchTokenFromLocalStore()

const currentUser = authStore.state.user 



const marketAgentStore =  useMarketStore()
const manageStandardUserStore = useManageStandardUsersStore()

const fetchStandardUsers = () => {
  manageStandardUserStore.fetchStandarUsers()
};

 


onMounted(() => {
  fetchStandardUsers()
});

const itemsPerPage = 10;
const currentPage = ref(1);
const isModalOpen = ref(false);
const isModalOpenForLogin = ref(false)
const  enablePasswordRecovery = ref(false)
const editMode = ref(false); // Toggle between Add and Edit mode
const editLoginMode = ref(false); // Toggle between Add and Edit mode for login
const imagePreview = ref(null);
const currentStandardUser = ref({
  id: '',
  firstname: '',
  lastname: '',
  db_name: '',
  image: '',
});


const currentStandardUserLogin = ref({
  login_id: '',
  username: '',
  password: '',
  password_again: '',
  status: 'inactive',
  role: 'poweruser',
 
});

const standardUsers = computed(() => manageStandardUserStore.state.standarUsers);

const totalPages = computed(() =>
  Math.ceil(standardUsers.value.length / itemsPerPage)
)

const paginatedStandardUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return standardUsers.value.slice(start, end);
});

const isFormLoginValid = computed(() => {
  return (
    currentStandardUserLogin.value.username.trim().length >= 3 && 
    currentStandardUserLogin.value.password.length >= 6 &&  
    currentStandardUserLogin.value.password === currentStandardUserLogin.value.password_again
  )
})

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
      currentStandardUser.value.image = file;
     
    };
    reader.readAsDataURL(file);
  }
};

const openAddAgentModal = () => {
  editMode.value = false;
  resetCurrentStandardUser()
  isModalOpen.value = true;
};

const openEditStandardUserModal = (user) => {
  editMode.value = true;
  Object.assign(currentStandardUser.value, user);
  imagePreview.value = user.image_link;
  isModalOpen.value = true;
};

const openEditStandUserLoginModal = (currentUserLogin) => {
  
  if ( currentUserLogin.username == null && currentUserLogin.role == null && currentUserLogin.status == null){
    const confirmation = window.confirm("This agent does not have login credentials. Would you like to set up a login?");
        if (!confirmation) {
            return; // Exit if the user cancels the deletion
        }
    isModalOpenForLogin.value = true;
    currentStandardUserLogin.value.login_id = currentUserLogin.login_id
    editLoginMode.value = false;
    enablePasswordRecovery.value = true 
  
    
  }else{
    isModalOpenForLogin.value = true;
    editLoginMode.value = true;
    Object.assign(currentStandardUserLogin.value,  currentUserLogin);
    console.log('update value for updating login', currentStandardUserLogin.value)
  }
  
 
};


const closeModal = () => {
  isModalOpen.value = false;
};

const closeLoginModal = () => {
  isModalOpenForLogin.value = false;
  enablePasswordRecovery.value = false;
  resetCurrentStandardUserLogin()
};

const resetCurrentStandardUser = () => {
  currentStandardUser.value = {
    id: '',
    firstname: '',
    lastname: '',
    db_name: '',
    image: '',
  };
  imagePreview.value = null;
};

const resetCurrentStandardUserLogin = () => {
  currentStandardUserLogin.value = {
    login_id: '',
    username: '',
    password: '',
    password_again: '',
    status: 'inactive',
    role: 'user',
    
  };
 
};

const addStandardUser = async() => {
  try {
    await manageStandardUserStore.addStandardUser(currentStandardUser.value);
    closeModal();
  }catch(error){
    
    console.error('Error in adding new sales agent', error)
  }
  
  
};



const updateStandardUser = () => {
  
  manageStandardUserStore.updateStandardUser(currentStandardUser.value);
  closeModal();
};

const deleteStandardUser = async(id) => {
  try {
    await  manageStandardUserStore.deleteStandardUser(id);
  }catch(error){
    console.error(`Error in deleting sales agent id: ${id}`, error)
  }
 
};

 const  addStandardUserLogin = async() => {

   if (!isFormLoginValid){
    alert('Please correct the errors before submitting...')
    return
   }
   try{
    await authStore.register(currentStandardUserLogin.value , 'standardusers')
    fetchStandardUsers()
    closeLoginModal()
   }catch (error ){
    console.log('Error in adding agent login', error)

   }
}

const updateStandardUserLogin = async() => {
  if (!isFormLoginValid){
    alert('Please correct the errors before submitting...')
    return
   }
   try{
    await authStore.updateLogin(currentStandardUserLogin.value , 'standardusers')
    fetchStandardUsers()
    closeLoginModal()
   }catch (error ){
    console.log('Error in  updating standard user login', error)

   }
}
</script>
