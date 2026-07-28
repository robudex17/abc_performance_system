<template>
  <!-- <div class="p-6 bg-gradient-to-r from-blue-50 to-blue-100 min-h-screen"> -->
  <div class="p-6 mt-20 min-h-screen">
  
    <h1 class="text-3xl font-extrabold text-gray-800 mb-6 text-center">{{ department_code.toLocaleUpperCase() }} Employees Information</h1>

   
  
    <!-- Add Employee Button -->
    <button  :disabled="['user', 'manager'].includes(currentUser.role)" v-if="employee_status == 'Hired'"
      class="mb-1 py-2 px-2 border text-center text-xs  bg-blue-500 text-white font-bold rounded hover:bg-blue-600  disabled:bg-gray-400 disabled:cursor-not-allowed"
      @click="openAddAgentModal"
    >
      {{ department_code.toLocaleUpperCase() }}  Employee
    </button>



<!-- Add/Edit Employee Modal -->
<div
  v-if="isModalOpen"
  class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
>
  <div class="bg-white p-6 rounded-xl shadow-xl w-[28rem]">
    <h2 class="text-2xl font-bold text-gray-700 mb-6 text-center">
      {{ editMode ? `Edit ${department_code.toLocaleUpperCase()} Employee` : `Add New ${department_code.toLocaleUpperCase()} Employee` }}
    </h2>

    <form @submit.prevent="editMode ? updateEmployee() : addEmployee()">
      <div class="space-y-6 overflow-y-auto max-h-[32rem] pr-2">

      <!-- Employment Status (only in edit mode) -->
      <div v-if="editMode" class="p-4 border rounded-lg bg-gray-50 space-y-3">
        <h3 class="text-lg font-semibold text-gray-700">Employment Status</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Date Hired -->
            <div>
              <label for="date_hire" class="font-medium text-gray-600">Date Hired</label>
              <input
                id="date_hire"
                type="date"
                v-model="currentEmployee.start_date"
                @change="handleDateChange"
                class="w-full p-2 border rounded"
                :max="today"
                :disabled="currentEmployee.employee_status === 'Resigned'"
              />
            </div>

            <!-- Employment Status -->
            <div>
              <label for="employment_status" class="font-medium text-gray-600">Employment Status</label>

               <!-- If active agent and employee status is Rehired -->
              <select
                v-if="currentEmployee.active_employee && originalAssignment.employee_status == 'Rehired'"
                id="employment_status_active"
                v-model="currentEmployee.employee_status"
                @change="handleStatusChange"
                class="w-full p-2 border rounded"
              >
                <option value="Rehired">Rehired</option>
                <option value="Resigned">Resigned</option>
              </select>             
              
              <!-- If active agent -->
              <select
                v-else-if="currentEmployee.active_employee"
                id="employment_status_active"
                v-model="currentEmployee.employee_status"
                @change="handleStatusChange"
                class="w-full p-2 border rounded"
              >
                <option value="Hired">Hired</option>
                <option value="Resigned">Resigned</option>
              </select>

              <!-- If inactive agent -->
              <select
                v-else
                id="employment_status_inactive"
                v-model="currentEmployee.employee_status"
                @change="handleStatusChange"
                class="w-full p-2 border rounded"
              >
                <option value="Resigned">Resigned</option>
                <option value="Rehired">Rehired</option>
              </select>
            </div>

            <!-- Date Resigned -->
            <div>
              <label for="date_resigned" class="font-medium text-gray-600">Date Resigned</label>
              <input
                id="date_resigned"
                type="date"
                v-model="currentEmployee.end_date"
                class="w-full p-2 border rounded"
                :min="currentEmployee.start_date"
                :max="today"
                :disabled="currentEmployee.employee_status === 'Hired' || currentEmployee.employee_status === 'Rehired' || !currentEmployee.active_employee "
              />
            </div>
          </div>       

      </div>

        <!-- First Section: Employment Info -->
        <div class="border border-gray-200 rounded-xl p-5 shadow-sm bg-gray-50">
          <h3 class="text-lg font-semibold text-blue-700 mb-4">
             Employment Information
          </h3>



          <div class="space-y-3">
            <div v-if="!editMode">
              <label for="date_hire" class="block text-sm font-medium text-gray-600 mb-1">Date Hire</label>
              <input
                id="date_hire"
                type="date"
                v-model="currentEmployee.start_date"
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                :max="today"
                @change="handleDateChange"
                required
              />
            </div>

            <div>
              <label for="id" class="block text-sm font-medium text-gray-600 mb-1">Agent ID</label>
              <input
                id="id"
                type="text"
                v-model="currentEmployee.id"
                placeholder="Employee ID"
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                :readonly="editMode"
                required
                :disabled="currentEmployee.employee_status === 'Resigned'"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="firstname" class="block text-sm font-medium text-gray-600 mb-1">First Name</label>
                <input
                  id="firstname"
                  type="text"
                  v-model="currentEmployee.firstname"
                  placeholder="First Name"
                  class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                  required
                  :disabled="currentEmployee.employee_status === 'Resigned'"
                />
              </div>
              <div>
                <label for="lastname" class="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
                <input
                  id="lastname"
                  type="text"
                  v-model="currentEmployee.lastname"
                  placeholder="Last Name"
                  class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                  required
                  :disabled="currentEmployee.employee_status === 'Resigned'"
                />
              </div>
            </div>

            <div>
              <label for="db_name" class="block text-sm font-medium text-gray-600 mb-1">Database Name</label>
              <input
                id="db_name"
                type="text"
                v-model="currentEmployee.db_name"
                placeholder="Database Name"
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                required
                :disabled="currentEmployee.employee_status === 'Resigned'"
              />
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <input
                id="email"
                type="email"
                v-model="currentEmployee.email"
                placeholder="Email"
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                required
                :disabled="currentEmployee.employee_status === 'Resigned'"
              />
            </div>
            <div>
              <label for="extension" class="block text-sm font-medium text-gray-600 mb-1">Extension</label>
              <input
                id="extension"
                type="text"
                v-model="currentEmployee.extension"
                placeholder="Extension"
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                required
                :disabled="currentEmployee.employee_status === 'Resigned'"
              />
            </div>            


            <div>
              <label for="image" class="block text-sm font-medium text-gray-600 mb-1">Image Photo</label>
              <input
                             
                id="image"
                type="file"
                @change="handleFileUpload"
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                :disabled="currentEmployee.employee_status === 'Resigned'"
              />
              <div v-if="imagePreview" class="mt-3 flex justify-center">
                <img
                  :src="updateImageLink(imagePreview)"
                  alt="Agent Image"
                  class="w-24 h-24 rounded-full border border-blue-200 shadow-md"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Second Section: Assignments -->
        <div class="border border-gray-200 rounded-xl p-5 shadow-sm bg-gray-50" v-if="editMode">
          <h3 class="text-lg font-semibold text-green-700 mb-4">
            Employee Assignments
          </h3>
          <!-- Enable changes checkbox -->
          <div class="flex items-center space-x-2 py-3" v-if="editMode">
            <input :disabled="currentEmployee.employee_status == 'Resigned'"
              type="checkbox" 
              id="enableAssignmentChange" 
              v-model="currentEmployee.changed_assignment"
              @change="handleAssignmentToggle"
              class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label for="enableAssignmentChange" class="text-sm text-green-700 font-medium">
              Enable Assignment Changes
            </label>
          </div>
          <div class="space-y-4">
            <div v-if="editMode">
              <label class="block text-sm font-medium text-gray-700">Effective From</label>
              <input  :disabled="currentEmployee.employee_status === 'Resigned' || !currentEmployee.changed_assignment"
                type="date"
                v-model="currentEmployee.effective_from"
                @change="handleDateChange"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                :max="today"
              />
            </div>
            <div v-if="editMode && !currentEmployee.active_employee && currentEmployee.employee_status == 'Resigned'">
              <label class="block text-sm font-medium text-gray-700">Effective to</label>
              <input disabled
                type="date"
                v-model="currentEmployee.effective_to"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                
              />
            </div>
            <div>
              <label for="position" class="block text-sm font-medium text-gray-600 mb-1">Position</label>
              <select :disabled="currentEmployee.employee_status === 'Resigned' || !currentEmployee.changed_assignment"
                id="position"
                v-model="currentEmployee.position_id"
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-400"
                required
               
              >
                <option v-for="position in filterPositions" :key="position.id" :value="position.id"  >
                  {{ position.position_name }}
                </option>
              </select>
            </div>

            <div>
              <label for="manager" class="block text-sm font-medium text-gray-600 mb-1">Manager</label>
              <select :disabled="currentEmployee.employee_status === 'Resigned' || !currentEmployee.changed_assignment"
                id="manager"
                v-model="currentEmployee.manager_id"
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-400"
                required
              >
                <option v-for="manager in filteredManagers" :key="manager.manager_id" :value="manager.manager_id">
                  {{ manager.manager_name }}
                </option>
              </select>
            </div>

            <div v-if="department_code== 'sales'">
              <label for="market_name" class="block text-sm font-medium text-gray-600 mb-1">Market</label>
              <select :disabled="currentEmployee.employee_status === 'Resigned' || !currentEmployee.changed_assignment"
                id="market_name"
                v-model="currentEmployee.market_id"
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-400"
                required
              >
                <option v-for="market in markets" :key="market.id" :value="market.id">{{ market.name }}</option>
              </select>
            </div>

            <div>
              <label for="team_name" class="block text-sm font-medium text-gray-600 mb-1">Team</label>
              <select :disabled="currentEmployee.employee_status === 'Resigned' || !currentEmployee.changed_assignment"
                id="team_name"
                v-model="currentEmployee.team_id"
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-400"
                required
              >
                <option v-for="team in teams" :key="team.id" :value="team.id">{{ team.name }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="border border-gray-200 rounded-xl p-5 shadow-sm bg-gray-50" v-else>
          <h3 class="text-lg font-semibold text-green-700 mb-4">
            Employee Assignments
          </h3>

          <div class="space-y-4">
            <div >
              <label class="block text-sm font-medium text-gray-700">Effective From</label>
              <input  
                type="date"
                v-model="currentEmployee.effective_from"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                :max="today"
                @change="handleDateChange"
              />
            </div>

            <div>
              <label for="position" class="block text-sm font-medium text-gray-600 mb-1">Position</label>
              <select 
                id="position"
                v-model="currentEmployee.position_id"
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-400"
                required
             
              >
                <option v-for="position in filterPositions" :key="position.id" :value="position.id" >

                  {{ position.position_name }} 
                </option>
              </select>
            </div>

            <div>
              <label for="manager" class="block text-sm font-medium text-gray-600 mb-1">Manager</label>
              <select 
                id="manager"
                v-model="currentEmployee.manager_id"
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-400"
                required
              >
                <option v-for="manager in filteredManagers" :key="manager.manager_id" :value="manager.manager_id">
                  {{ manager.manager_name }}
                </option>
              </select>
            </div>

            <div v-if="department_code == 'sales'">
              <label for="market_name" class="block text-sm font-medium text-gray-600 mb-1">Market</label>
              <select 
                v-model="currentEmployee.market_id"
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-400"
                required
              >
                <option v-for="market in markets" :key="market.id" :value="market.id">{{ market.name }}</option>
              </select>
            </div>

            <div>
              <label for="team_name" class="block text-sm font-medium text-gray-600 mb-1">Team</label>
              <select 
                id="team_name"
                v-model="currentEmployee.team_id"
                class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-400"
                required
              >
                <option v-for="team in teams" :key="team.id" :value="team.id">{{ team.name }}</option>
              </select>
            </div>
          </div>
        </div>        
        
      </div>

      <!-- Footer -->
      <div class="flex justify-end space-x-4 mt-6">
        <button
          type="button"
          class="px-4 py-2 bg-gray-400 text-white font-bold rounded-lg hover:bg-gray-500"
          @click="closeModal"
        >
          Cancel
        </button>
        <button
          :disabled="!currentEmployee.active_employee && currentEmployee.employee_status === 'Resigned'"
          type="submit"
          :class="[
            'px-4 py-2 font-bold rounded-lg',
            (!currentEmployee.active_employee && currentEmployee.employee_status === 'Resigned')
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          ]"
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
        <form @submit.prevent="editLoginMode ? updateAgentLogin() : addAgentLogin()">
          <div class="grid grid-cols-1 gap-4 overflow-y-auto max-h-80">
            <!-- Form fields go here -->
            <label for="id" class="font-semibold text-gray-600">Login ID</label>
            <input
              id="id"
              type="text"
              v-model="currentEmployeeLogin.login_id"
              placeholder="Agent ID"
              class="p-2 border rounded"
              disabled
              required
            />

            <label for="firstname" class="font-semibold text-gray-600">Username</label>
            <input
              id="username"
              type="text"
              v-model="currentEmployeeLogin.username"
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
              v-model="currentEmployeeLogin.password"
              placeholder="Password"
              class="p-2 border rounded"
              :disabled="!enablePasswordRecovery"
              required
            />
            <p v-if="currentEmployeeLogin.password.length > 0 && currentEmployeeLogin.password.length < 6" class="text-red-500 text-sm">
                 Password must be at least 6 characters long.
           </p>

            <label for="re-enter-password" class="font-semibold text-gray-600">Password Again</label>
            <input
              id="password_again"
              type="password"
              v-model="currentEmployeeLogin.password_again"
              placeholder="Password Again"
              class="p-2 border rounded"
              :disabled="!enablePasswordRecovery"
              required
            />       
            
            <p v-if="currentEmployeeLogin.password_again.length > 0 && currentEmployeeLogin.password !== currentEmployeeLogin.password_again" class="text-red-500 text-sm">
              Passwords do not match.
           </p>

                     <!-- Login Status Dropdown -->
          <label for="login status" class="font-semibold text-gray-600">Status</label>
          <select
            id="login_status"
            v-model="currentEmployeeLogin.status"
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
            v-model="currentEmployeeLogin.role"
            placeholder="Agent Login Role"
            class="p-2 border rounded"
            required
            
          >
          
            <!-- <option value="admin">Admin</option> -->
            <option value="manager">Manager</option>
            <option value="user">User</option>
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
    <div class="overflow-x-auto shadow-xl rounded-lg" v-if="employees.length != 0">
      <table class="w-full table-auto border-collapse bg-white">
        <thead>
          <tr class="bg-gradient-to-r from-blue-200 to-blue-300 text-gray-800">
            <th class="py-2 px-2 border text-center text-xs font-bold uppercase">ID</th>
            <th class="py-2 px-2 border text-center text-xs font-bold uppercase">Date Hired</th>
            <th class="py-2 px-2 border text-center text-xs font-bold uppercase" v-if="employee_status == 'Resigned'">Date Resigned</th>
            <th class="py-2 px-2 border text-center text-xs font-bold uppercase">Employee Status</th>
            <th class="py-2 px-2 border text-center text-xs font-bold uppercase">First Name</th>
            <th class="py-2 px-2 border text-center text-xs font-bold uppercase">Last Name</th>
            <th class="py-2 px-2 border text-center text-xs font-bold uppercase">Position</th>
            <th class="py-2 px-2 border text-center text-xs font-bold uppercase">Database Name</th>
            <th class="py-2 px-2 border text-center text-xs font-bold uppercase">Extension</th>
            <th class="py-2 px-2 border text-center text-xs font-bold uppercase">Email</th>
            <th class="py-2 px-2 border text-center text-xs font-bold uppercase">Manager Name</th>
            <th v-if="department_code == 'sales'" class="py-2 px-2 border text-center text-xs font-bold uppercase">Market</th>
            <th class="py-2 px-2 border text-center text-xs font-bold uppercase">Team</th>
            <th class="py-2 px-2 border text-center text-xs font-bold uppercase">Photo</th>
                <div class="flex items-center justify-center gap-2">
                  <span>Actions</span>

                  <div class="flex-shrink-0">
                    <export-to-excel-component
                      v-if="isAdmin && employees.length > 0"
                      :exportUrl="exportUrl"
                      :exportFileName="exportFileName"
                      :query="route.query"
                      :token="token"
                      :incomplete="incomplete"
                      class=" !text-white !text-[10px] !px-2 !py-1 !rounded !hover:bg-green-600 !transition-all !duration-200"
                    >
                    </export-to-excel-component>
                  </div>
                </div>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="employee in paginatedAgents"
            :key="employee.id"
            class="even:bg-blue-50 odd:bg-white"
          >
            <td class="py-1 px-2 border text-center text-xs font-bold text-gray-700">
              {{ employee.id }}
            </td>
            <td class="py-1 px-1 border text-center text-xs font-bold text-gray-700">
              {{ employee.start_date }}
            </td>
             <td class="py-1 px-1 border text-left text-xs font-bold text-gray-700" v-if="employee_status == 'Resigned'">
              {{ employee.end_date }}
            </td>
            <td class="py-1 px-2 border text-center text-xs font-bold"
            :class="{
              'text-red-600': employee.employee_status === 'Resigned',
              'text-green-600': employee.employee_status === 'Hired' || employee.employee_status === 'Rehired'
            }" 
            >
              {{ employee.employee_status }}
            </td>
            <td class="py-1 px-2 border text-center text-xs font-bold text-gray-700">
              {{ employee.firstname }}
            </td>
            <td class="py-1 px-2 border text-center text-xs font-bold text-gray-700">
              {{ employee.lastname }}
            </td>

            <td class="py-1 px-2 border text-center text-xs font-bold text-gray-700">
              {{ employee.position_name }}
            </td>
        
            <td class="py-1 px-2 border text-center text-xs font-bold text-gray-700">
              {{ employee.db_name }}
            </td>
            <td class="py-1 px-2 border text-center text-xs font-bold text-gray-700">
              {{ employee.extension }}
            </td>            
            <td class="py-1 px-2 border text-center text-xs font-bold text-gray-700">
              {{ employee.email }}
            </td>
            <td class="py-1 px-2 border text-center text-xs font-bold text-gray-700">
              {{ employee.manager_dbname }}
            </td>
            <td v-if="department_code == 'sales'" class="py-1 px-2 border text-center text-xs font-bold text-gray-700">
              {{ employee.market_name }}
            </td>
            <td class="py-1 px-2 border text-center text-xs font-bold text-gray-700">
              {{ employee.team_name }}
            </td>

            <td class="py-1 px-1 border text-center">
              <img
                :src="updateImageLink(employee.image_link)"
                alt="Agent Image"
                class="h-11 w-11 rounded-full mx-auto border border-blue-200"
              />
            </td>
            <td class="py-0.5 px-3 border text-center">
              <div class="flex justify-center space-x-2">
                <button :disabled="currentUser.role !=='admin'"
                  class="px-2 py-1 bg-green-500 text-white text-center text-sm font-bold rounded hover:bg-green-600  disabled:bg-gray-400 disabled:cursor-not-allowed"
                  @click="openEditAgentModal(employee)"
                >
                <i class="fas fa-edit"></i>
                  Edit
                </button>
                <button
                  @click="handleViewDetails(employee)"
                  class="px-1 py-1 bg-blue-500 text-white text-center text-sm font-bold rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Details
                </button>
                <button :disabled="currentUser.role !=='admin'" v-if="employee_status == 'Hired'"
                  class="px-2 py-1 bg-gray-500 text-white text-center text-sm font-bold rounded hover:bg-gray-600  disabled:bg-gray-400 disabled:cursor-not-allowed"
                  @click="openEditAgentLoginModal({login_id: employee.id, role: employee.role, status: employee.login_status, username: employee.username, position_id: employee.position_id})"
                >
                  Login
                </button>
                <!-- <button :disabled="currentUser.role !=='admin'"
                  class="px-2 py-2 bg-red-500 text-white text-center text-sm font-bold rounded hover:bg-red-600  disabled:bg-gray-400 disabled:cursor-not-allowed"
                   @click="deleteAgent(agent.id)"
                >
                  Delete
                </button> -->
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="flex flex-col items-center justify-center py-8 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" 
          class="w-10 h-10 text-gray-400 mb-3" 
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M9 13h6m-3-3v6m9-6a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <p class="text-gray-600 text-lg">
        No available <span class="font-semibold"
  
        :class="{'text-red-600 font-bold': employee_status == 'Resigned',
         'text-green-600 font-bold' : employee_status == 'Hired' || employee_status == 'Rehired' }"
        >{{ employee_status }}</span> agents found.
      </p>
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


    import { ref, computed, defineProps, defineEmits } from 'vue';
    import { useManageSalesAgentStore } from '../../../stores/manage_sales_agents';
    import { onMounted } from 'vue';

    import API from '~/utils/api'

    import { months } from '@/utils/constants'

    const emit = defineEmits(['passAddEmployee', 'passUpdateEmployee', 'passAddEmployeeLogin', 'passUpdateEmployeeLogin']);

    const props = defineProps({
       department_code: {
        type: String,
        required: true
      }, 
      employee_status : {
        type: String,
        required: true
      },
      employees : {
        type: Array,
        required: true
      },

        managers : {
          type: Array,
          required: true
        },

        teams : {
          type: Array,
          required: true
        },
        roles: {
          type: Array,
          required: true
        },
        positions: {
          type: Array,
          required: true
        },
        markets: {
          type: Array,
          required: true
        },
          highest_level: {
            type: Number,
            required: true
          }


      });

    const itemsPerPage = 10;
    const currentPage = ref(1);
    const isModalOpen = ref(false);
    const isModalOpenForLogin = ref(false)
    const  enablePasswordRecovery = ref(false)
    const editMode = ref(false); // Toggle between Add and Edit mode
    const editLoginMode = ref(false); // Toggle between Add and Edit mode for login
    const imagePreview = ref(null);
  

    const isAdmin = ref(false)
    const month = ref("")
    const year = ref("")

     //get the current user
    const authStore = useAuthStore()
    authStore.fetchTokenFromLocalStore()
    const currentUser = authStore.state.user 
    const token = authStore.state.token

    const route = useRoute()
    //calling the global config
    const config = useRuntimeConfig()


  

    const today = new Date().toISOString().split('T')[0]  // format: YYYY-MM-DD

    const currentEmployee = ref({
      start_date: today,
      end_date: '',
      id: '',
      firstname: '',
      lastname: '',
      db_name: '',
      email: '',
      image_link: '',
      extension: '',
      position_id: '',
      level: '',
      manager_id: '',
      manager_dbname: '',
      manager_role: '',
      team_id: '',
      team_name: '',
      market_id: '',
      position_name: '',
      position_id: '',
      market_name: '',
      effective_from: today,
      effective_to: '',
      employee_status:'',
      active_agent: '',
      changed_assignment: false,
      department_code: '',
      department_id: ''
    });


    const currentEmployeeLogin = ref({
      login_id: '',
      username: '',
      password: '',
      password_again: '',
      status: 'inactive',
    
    });

    const originalAssignment = ref({})


    // // When backend data loads:
    const  loadEmployee = (employee) => {
      currentEmployee.value = { ...employee }

      originalAssignment.value = {
        start_date: employee.start_date,
        end_date: employee.end_date,
        id: employee.id,
        firstname: employee.firstname,
        lastname: employee.lastname,
        db_name: employee.db_name,
        email: employee.email,
        image_link: employee.image_link,
        extension: employee.extension,
        manager_id: employee.manager_id,
        manager_dbname: employee.manager_dbname,
        manager_role: employee.manager_role,
        team_id: employee.team_id,
        team_name: employee.team_name,
        department_code: employee.department_code,
        department_id: employee.department_id,
        market_id: employee.market_id || '',
        market_name: employee.market_name || '',
        position_id: employee.position_id,
        position_name: employee.position_name,
        level: employee.level,
        effective_from: employee.effective_from,
        effective_to: employee.effective_to,
        active_agent: employee.active_agent,
        employee_status: employee.employee_status,
        changed_assignment:  false

      }

    }


   
   //computed properties 

    const filteredManagers = computed(() => {
      // Case 1: no managers exist → first Senior Manager (self-manage)
      if (props.managers.length === 0 ) {
        return [
          {
            manager_id: currentEmployee.value.id,
            manager_name: currentEmployee.value.db_name,
            
          }
        ]
      }

    // currentuser is admin → show all managers; currentuser is manager → only show self and other managers with same or lower level (exclude other managers with higher level)
      if(currentUser.role == 'admin') {
          return props.managers
      }

      return props.managers.filter(m => m.level > currentUser.level ) //return managers with higher level number (lower position) than current user
      

    })


   const filterPositions = computed(() => {
      // if Manger is empty → only  the position  equal to  level 5 
    
      if(props.managers.length === 0){
     
        return props.positions.filter(p => p.level == props.highest_level) //return the position with level 5 which is the lowest position for senior manager
         
      }
      
      if(currentUser.role == 'admin') {
       
        return props.positions 
       }

       return props.positions.filter(p => p.level  <= currentUser.level) //return  positions with lover or equal level number than current user


   })

    const totalPages = computed(() =>
      Math.ceil(props.employees.length / itemsPerPage)
    )
    const paginatedAgents = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return props.employees.slice(start, end);
    });

    const isFormLoginValid = computed(() => {
      return (
        currentEmployeeLogin.value.username.trim().length >= 3 && 
        currentEmployeeLogin.value.password.length >= 6 &&  
        currentEmployeeLogin.value.password === currentEmployeeLogin.value.password_again
      )
    })      



  if (currentUser.login_type == 'standarduser' && currentUser.role == 'admin'){
      isAdmin.value = true
    
  }

  month.value =  months[new Date().getMonth()]
  year.value =  new Date().getFullYear() 


  const exportFileName = computed(()=> {
    return `sales-agents-active-list-${month.value}-${year.value}.xlsx`
  })

  const exportUrl = API.export.sales_agents_export





    //method or functions

 const handleViewDetails = (employee) => {

        let month = null
        let year = null
      
        if(employee.employee_status == 'Resigned'){
            const date = new Date(employee.end_date)
            month = date.toLocaleString('default', {month: 'long'})
            year = date.getFullYear()

        } 
        
            navigateTo({
              path: `/csd/${employee.id}/details`,
              query: { agent_id: employee.id , month, year, employee_status: employee.employee_status, start_date: employee.start_date, end_date: employee.end_date, agent_type: employee.agent_type, role: employee.agent_role },
            });
    
      };

 const updateImageLink = (imageLink) => {
         if (!imageLink) return ''
  
        // ✅ If it's already a base64 Data URL, just return it directly
        if (imageLink.startsWith('data:image')) {
          return imageLink
        }

        // ✅ Otherwise, assume it's a server path
        return `${config.public.imageBaseUrl}${imageLink}`
    }


    // // Reset fields when checkbox unchecked
 const  handleAssignmentToggle = () => {
      if (!currentEmployee.value.changed_assignment) {
        currentEmployee.value.manager_id = originalAssignment.value.manager_id
        currentEmployee.value.position_id = originalAssignment.value.position_id
        currentEmployee.value.team_id = originalAssignment.value.team_id
        currentEmployee.value.market_id = originalAssignment.value.market_id

        if(currentEmployee.value.employee_status == 'Resigned' && currentEmployee.active_agent){
          currentEmployee.value.effective_from = originalAssignment.value.effective_from
        }else{
          currentEmployee.value.effective_from =   currentEmployee.value.start_date  //originalAssignment.value.effective_from
        }
        
      }


    }

    const handleDateChange = () => {


      if(new Date(currentEmployee.value.effective_from) < new Date(currentEmployee.value.start_date) ){
        alert('Cannot Set Effective from earlier than the date hire or or the start date')
        currentEmployee.value.effective_from = originalAssignment.value.effective_from
        currentEmployee.value.start_date = originalAssignment.value.start_date
        return
      }
    }


    function handleStatusChange() {
      if (currentEmployee.value.employee_status === "Rehired") {
        currentEmployee.value.start_date = today   // auto set hire date to today
        currentEmployee.value.end_date = null      // clear resignation date
        currentEmployee.value.effective_from = today
      }else if(currentEmployee.value.employee_status === 'Resigned' ){
      
        currentEmployee.value.end_date = originalAssignment.value.end_date
        
        currentEmployee.value.changed_assignment = false
        currentEmployee.value.changed_date_hire = false
        currentEmployee.value.changed_info = false
        currentEmployee.value.effective_to = currentEmployee.value.end_date
        currentEmployee.value.start_date = originalAssignment.value.start_date
        currentEmployee.value.firstname = originalAssignment.value.firstname
        currentEmployee.value.lastname = originalAssignment.value.lastname
        currentEmployee.value.db_name = originalAssignment.value.db_name
        currentEmployee.value.email = originalAssignment.value.email
        currentEmployee.value.image_link = originalAssignment.value.image_link

        currentEmployee.value.manager_id = originalAssignment.value.manager_id
        currentEmployee.value.position_id = originalAssignment.value.position_id
        currentEmployee.value.team_id = originalAssignment.value.team_id
        currentEmployee.value.effective_from = originalAssignment.value.effective_from
        
        currentEmployee.value.market_id = originalAssignment.value.market_id

        

      }else if(currentEmployee.value.employee_status == 'Hired' && currentEmployee.value.active_agent){
        currentEmployee.value.end_date = null
      
      }

      // ✅ Validation: Rehired start_date must not be earlier than resigned date
      if (
        currentEmployee.value.employee_status === "Rehired" &&  currentEmployee.value.start_date &&
    
        new Date(currentEmployee.value.start_date) < new Date(originalAssignment.value.end_date)
      ) {
        alert("Rehired date cannot be earlier than the resigned date.");
        currentEmployee.value.start_date = today; // reset to today
      }
    }



    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          imagePreview.value = e.target.result;
          currentEmployee.value.image = file;
        
        };
        reader.readAsDataURL(file);
      }
    };

    const openAddAgentModal = () => {
      editMode.value = false;
      resetCurrentEmployee();
      isModalOpen.value = true;
    };

    const openEditAgentModal = (employee) => {
      editMode.value = true;
      Object.assign(currentEmployee.value, employee);
      imagePreview.value = employee.image_link;
      isModalOpen.value = true;
      employee.changed_assignment = false
      loadEmployee(employee)
    };

    const openEditAgentLoginModal = (agentLogin) => {
      
      if ( agentLogin.username == null && agentLogin.role == null && agentLogin.status == null){
        const confirmation = window.confirm("This agent does not have login credentials. Would you like to set up a login?");
            if (!confirmation) {
                return; // Exit if the user cancels the deletion
            }
        isModalOpenForLogin.value = true;
        currentEmployeeLogin.value.login_id = agentLogin.login_id
        currentEmployeeLogin.value.agent_type = agentLogin.agent_type
        editLoginMode.value = false;
        enablePasswordRecovery.value = true 
      
        
      }else{
        isModalOpenForLogin.value = true;
        editLoginMode.value = true;
        Object.assign(currentEmployeeLogin.value, agentLogin);
        console.log('update value for updating login', currentEmployeeLogin.value)
      }
      

    };

    const closeModal = () => {
      isModalOpen.value = false;
      resetCurrentEmployee()
    };

    const closeLoginModal = () => {
      isModalOpenForLogin.value = false;
      enablePasswordRecovery.value = false;
      resetCurrentEmployeeLogin()
    };

    const resetCurrentEmployee = () => {
      currentEmployee.value = {
        id: '',
        firstname: '',
        lastname: '',
        manager_id: '',
        manger_dbname: '',
        manager_role: '',
        extension: '',
        position_id: '',
        level: '',
        db_name: '',
        market_id: '',
        market_name: '',
        team_id: '',
        team_name: '',
        manager_dbname: '',
        image_link: '',
        start_date: today,
        effective_from: today,
        end_date: '',
        email: '',
        employee_status:'',
        active_agent: '',
        employee_status: '',
        changed_assignment: false,
        department_code: '',
        department_id: ''
      };
      imagePreview.value = null;
    };

    const resetCurrentEmployeeLogin = () => {
      currentEmployeeLogin.value = {
        login_id: '',
        username: '',
        password: '',
        password_again: '',
        status: 'inactive',
 
        
      };
    
    };

    const  deepEqual = (a, b) => {
      if (a === b) return true

      // handle null
      if (a === null || b === null) return a === b

      // handle Date
      if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime()
      }

      // handle arrays
      if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false
        return a.every((item, i) => deepEqual(item, b[i]))
      }

      // handle objects
      if (typeof a === 'object' && typeof b === 'object') {

        const keysA = Object.keys(a)
        const keysB = Object.keys(b)

        const testArra = []

        keysA.forEach(i => {
          testArra.push(i)
        })


        if (keysA.length !== keysB.length) return false
      
        // compare values by key regardless of order
        return keysA.every(key => deepEqual(a[key], b[key]))
      }

      // fallback for primitive mismatch
      return false
    }

    const setEffectiveToDate = (newDateAssignment) => {
      let newAssignment = new Date(newDateAssignment)

      // clone date
      let prevAssignment = new Date(newAssignment)

      //Subtract 1 Day
      prevAssignment.setDate(newAssignment.getDate() -1)

      // Format YYYY-MM-DD 

      let formatDate =  prevAssignment.toISOString().split('T')[0];
      return formatDate

    }

    const addEmployee= async() => {
  
      try{
        currentEmployee.value.level = filterPositions.value.find(p => p.id == currentEmployee.value.position_id).level
        emit('passAddEmployee',currentEmployee.value);
        closeModal();
      }catch(error){
        console.error(`Error in adding ${props.department_code} employee`, error)
      }
        
      
    };




    const updateEmployee= async() => {
      if(currentEmployee.value.employee_status !=  'Resigned'){
        if (deepEqual(currentEmployee.value, originalAssignment.value)) {
            alert('No changes detected.')
            return
          }
       // if(currentEmployee.value.changed_assignment == false) {
       //   alert('Please Choose Agent Assignments')
       //   return

          if(currentEmployee.value.changed_assignment){
                //CHECKING Further 
            
                // Extract YYYY-MM from both dates
                const newDate = new Date(currentEmployee.value.effective_from);
                const oldDate = new Date(originalAssignment.value.effective_from);

                const newYearMonth = `${newDate.getFullYear()}-${newDate.getMonth()}`;
                const oldYearMonth = `${oldDate.getFullYear()}-${oldDate.getMonth()}`;

                if (newYearMonth === oldYearMonth) {
                  alert('Cannot assign in the same month and year as the previous assignment. Please choose another date.');
                  currentEmployee.value.changed_assignment = false;
                  return;
                }
                    // && currentEmployee.value.agent_type == originalAssignment.value.agent_type  
                    // && currentEmployee.value.manager_id == originalAssignment.value.manager_id 
                    // && currentEmployee.value.market_id == originalAssignment.value.market_id 
                    // && currentEmployee.value.team_id == originalAssignment.value.team_id  ){

                if(new Date(currentEmployee.value.effective_from).getTime() < new Date(originalAssignment.value.effective_from).getTime()){
                  alert('Cannot assign date assignment earlier than the previous assigmrnt. Please choose another date.');
                  currentEmployee.value.changed_assignment = false;        
                  return
                }
                
                // IF CURRENTLY HIRED DONT ALLOW TO ASSIGN TO SAME SET OF ASSIGNMENT 
                // OR IF REHIRED AND ALREADY active_status is already true
                if(currentEmployee.value.employee_status == 'Hired' || (currentEmployee.value.employee_status == 'Rehired' && currentEmployee.active_agent)) {

                    if(currentEmployee.value.position_id == originalAssignment.value.position_id  &&  currentEmployee.value.manager_id == originalAssignment.value.manager_id 
                      && currentEmployee.value.market_id == originalAssignment.value.market_id  &&  currentEmployee.value.team_id == originalAssignment.value.team_id 

                    ){
                      alert('The same set of Assignment. Please create new set of assigments')
                        currentEmployee.value.changed_assignment = false 
                        return

                }


                }


                currentEmployee.value.effective_to = setEffectiveToDate(currentEmployee.value.effective_from)
                currentEmployee.value.changed_assignment = true
            
          }
          

          if(new Date(currentEmployee.value.start_date).getTime() == new Date(originalAssignment.value.start_date).getTime()){
                currentEmployee.value.changed_date_hire = false
              }else{
                currentEmployee.value.changed_date_hire = true
          }

        
        if(currentEmployee.value.firstname == originalAssignment.value.firstname && currentEmployee.value.lastname == originalAssignment.value.lastname && 
                currentEmployee.value.email == originalAssignment.value.email  &&  currentEmployee.value.image_link == originalAssignment.value.image_link && 
                currentEmployee.value.db_name == originalAssignment.value.db_name  && currentEmployee.value.extension == originalAssignment.value.extension && 
                !(currentEmployee.value.image instanceof File)

          ){
                currentEmployee.value.changed_info = false
            
          }else{
                currentEmployee.value.changed_info = true
              
         }



      }else{
        if(currentEmployee.value.end_date == null){
          alert('Please Choose Resigned Date')
          return
        }
        currentEmployee.value.effective_to =  currentEmployee.value.end_date
      }
     
        
      // await manageSalesAgentStore.updateSalesAgent(currentEmployee.value, route.query);
      //   // fetchSalesAgents()
      //   fetchMarkets();
      //   fetchTeams();
      //   fetchMangers()

       emit('passUpdateEmployee',currentEmployee.value);
        closeModal();
    };

    const deleteAgent = async(id) => {
      try {
        await  manageSalesAgentStore.deleteSalesAgent(id);
      }catch(error){

        console.error(`Error in deleting sales agent id: ${id}`, error)
      
      }
    
    };

    const  addAgentLogin = async() => {

      if (!isFormLoginValid){
        alert('Please correct the errors before submitting...')
        return
      }

      if ((currentEmployeeLogin.value.agent_type == 0 || currentEmployeeLogin.value.agent_type == "0") && currentEmployeeLogin.value.role == 'manager'){
        alert('Cannot Set manager if agent type is 0')
        return
      }

      try{
        await authStore.register(currentEmployeeLogin.value , 'salesagent')
        fetchSalesAgents();
        fetchMarkets();
        fetchTeams();
        fetchMangers()
        closeLoginModal()
      }catch (error ){
        console.log('Error in adding agent login', error)

      }
    }

    const updateAgentLogin = async() => {
      if (!isFormLoginValid){
        alert('Please correct the errors before submitting...')
        return
      }

      if ((currentEmployeeLogin.value.agent_type == 0 || currentEmployeeLogin.value.agent_type == "0") && currentEmployeeLogin.value.role == 'manager'){
        alert('Cannot Set manager if agent type is 0')
        return
      }
      try{
        await authStore.updateLogin(currentEmployeeLogin.value , 'salesagent')
        fetchSalesAgents();
        fetchMarkets();
        fetchTeams();
        fetchMangers()
        closeLoginModal()
      }catch (error ){
        console.log('Error in  updating agent login', error)

      }
    }




</script>
