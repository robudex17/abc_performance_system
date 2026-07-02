<template>
    <div>
 
      <button
        @click="exportExcel"
        class="flex items-center justify-center gap-2 w-full py-1 px-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-200"
      >
        <!-- <FontAwesomeIcon :icon="['fas', 'file-excel']" class="text-xl" /> -->
        <font-awesome-icon :icon="['fas', 'download']" />
        Export to Excel
      </button>
    </div>
</template>
  
  <script setup>
  const props = defineProps({
  exportUrl: {
    type: String,
    required: true
  },
  exportFileName: {
    type: String, 
    required: true
  },
  query: {
    type: Object, 
    required: true
  },
  token: {
    type:String , 
    required: true
  },
  submitted: {
    required: true,
    type: Number
  },
  incomplete: {
    required: true,
    type: Boolean
  },
  submittedArray: {
    required: true,
    type: Boolean
  }
});



const exportExcel = async () => {

    if(props.submitted == 0){
      alert('Cannot Export Agent Data which has not been submitted')
      return
    }
    if(props.incomplete){
     alert('Data is not complete. Please check the months that have not been submitted yet and submit them.');

      return 
    }

    let url = new URL(props.exportUrl)
      
        if (props.query) {
            Object.keys(props.query).forEach((key) =>
                url.searchParams.append(key, props.query[key])
            )
        }
   
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${props.token}`,
                },
      });
  
      if (!response.ok) throw new Error('Failed to fetch the Excel file');
  
      const blob = await response.blob();
      const downloadLink = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = props.exportFileName;
      downloadLink.click();
    } catch (error) {
      console.error('Error exporting Excel file:', error);
      alert('There was an error exporting the file.');
    }
  };
  </script>
  