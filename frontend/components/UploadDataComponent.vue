<template>
    <div class="flex justify-center items-center min-h-screen bg-gray-100">
      <div class="upload-container flex flex-col items-center p-6 bg-gradient-to-r from-blue-500 to-teal-500 shadow-xl rounded-lg w-96 text-white">
        <h2 class="text-3xl font-bold text-center mb-6">{{ uploadTitle }}</h2>
  
        <!-- File input -->
        <input
          type="file"
          @change="uploadFile"
          class="mb-4 px-4 py-3 border-2 border-transparent rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-200 ease-in-out transform hover:scale-105 cursor-pointer"
          :class="{
            'bg-gray-200': !selectedFile,
            'bg-green-400 text-white font-bold': selectedFile
          }"
          accept=".xls,.xlsx"
        />
  
        <!-- Duplicate action selection -->
        <!-- <div class="mb-4 text-white">
          <label for="duplicateAction" class="block text-lg font-semibold mb-2">Handle Duplicates</label>
          <select
            id="duplicateAction"
            v-model="duplicateAction"
            class="px-4 py-2 rounded-lg bg-white text-gray-700"
          >
            <option value="skip">Skip Duplicates (default)</option>
            <option value="update">Update Duplicates</option>
            <option value="replace">Replace Duplicates</option>
          </select>
        </div> -->
  
        <!-- Upload button -->
        <button
          @click="submitFile"
          :disabled="uploading"
          class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all ease-in-out duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Upload
        </button>
  
        <!-- Progress and stats display -->
        <div v-if="uploading" class="mt-6 text-center space-y-4">
          <p class="text-xl font-semibold">
            Uploading:
            <span class="font-extrabold text-yellow-400">{{ progress }}%</span>
          </p>
  
          <progress :value="progress" max="100" class="w-full h-2 bg-gray-300 rounded-full"></progress>
          <!-- <div>
            <p class="text-lg font-medium">
            Inserted: <span class="font-bold text-green-400">{{ insertedCount }}</span>
          </p>
          <p class="text-lg font-medium">
            Duplicates: <span class="font-bold text-yellow-400">{{ duplicateSkippedCount }}</span>
          </p>
          <p class="text-lg font-medium">
            Replaced: <span class="font-bold text-blue-400">{{ replacedCount }}</span>
          </p>
          <p class="text-lg font-medium">
            Updated: <span class="font-bold text-purple-600-400">{{ updatedCount }}</span>
          </p>  
          <p class="text-lg font-medium">
            Not Register: <span class="font-bold text-red-400">{{ notRegisteredAgentCount }}</span>
          </p>  
          <p class="text-lg font-medium">
            Empty Values: <span class="font-bold text-orange-400">{{ emptyValuesCount }}</span>
          </p>     
          </div> -->
               
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  // import { io } from 'socket.io-client'
  
  definePageMeta({
    middleware: ['auth', 'adminmanager']
  })

  const props = defineProps({

    uploadTitle: {
        type: String,
        required: true,
    },
    uploadDataUrl: {
        type: String,
        required: true
    }

  })

  const authStore = useAuthStore()
  authStore.fetchTokenFromLocalStore()
  const currentUser = authStore.state.user   
  const token = authStore.state.token

  
  const config = useRuntimeConfig()
  const socketUrl = config.public.socketUrl
  const apiUrl = config.public.apiUrl
  
  const selectedFile = ref(null)
  const uploading = ref(false)
  const progress = ref(0)
  const insertedCount = ref(0)
  const duplicateSkippedCount = ref(0)
  const updatedCount  = ref(0)
  const replacedCount = ref(0)
  const notRegisteredAgentCount = ref(0)
  const emptyValuesCount = ref(0)
  const duplicateAction = ref('skip') // Default action for duplicates
  
  const uploadFile = (event) => {
    if(currentUser.role !== 'admin'){
      alert('Access Denied')
      return
    }
    const file = event.target.files[0]
    if (file && (file.name.endsWith('.xls') || file.name.endsWith('.xlsx'))) {
      selectedFile.value = file
    } else {
      alert('Please select a valid Excel file (.xls or .xlsx).')
      selectedFile.value = null
    }
  }
  
  const submitFile = async () => {

    if(currentUser.role !== 'admin'){
      alert('Access Denied')
    }
    if (!selectedFile.value) {
      alert('Please select a file')
      return
    }
  
    uploading.value = true
    progress.value = 0
    insertedCount.value = 0
    duplicateSkippedCount.value = 0
    updatedCount.value = 0
    replacedCount.value = 0 
    notRegisteredAgentCount.value = 0 
    emptyValuesCount.value = 0
  
    const formData = new FormData()
    formData.append('file', selectedFile.value)
  
    // Append the duplicateAction value to the URL as a query parameter
    const url = `${props.uploadDataUrl}?duplicateAction=${duplicateAction.value}`
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
                  // 'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
        body: formData
      })
      const result = await response.json()
      console.log('the result is', result)
      // alert(`Upload Complete! Inserted: ${result.targetShipokStats.insertedCount}, Duplicates Skipped: ${result.targetShipokStats.duplicateSkippedCount} , Updated: ${result.targetShipokStats.updatedCount}, replaced: ${result.targetShipokStats.replacedCount}, Not Register: ${result.targetShipokStats.notRegisteredAgentCount}, Empty Values: ${result.targetShipokStats.emptyValuesCount} `)
      if(progress.value >= 100){
        alert('Upload Complete')
      }else{
        alert(result.error)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      
    } finally {
      uploading.value = false
    }
  }

   const { $socket } = useNuxtApp()
  
  onMounted(() => {
    // const socket = io(socketUrl)
    // ✅ access global socket from Nuxt app
   


    $socket.on('uploadProgress', (data) => {
    
      progress.value = data.progress
      // insertedCount.value = data.targetShipokStats.insertedCount
      // updatedCount.value = data.targetShipokStats.updatedCount
      // replacedCount.value = data.targetShipokStats.replacedCount
      // duplicateSkippedCount.value = data.targetShipokStats.duplicateSkippedCount
      // notRegisteredAgentCount.value = data.targetShipokStats.notRegisteredAgentCount
      // emptyValuesCount.value = data.targetShipokStats.emptyValuesCount
    })


  })

  onUnmounted(() => {
    $socket.off('uploadProgres')
  })
  </script>
  <style scoped>
  .upload-container {
    max-width: 400px;
  }
  progress {
    width: 100%;
    height: 10px;
  }
  </style>
  