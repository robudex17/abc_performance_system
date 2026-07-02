<template>
    <div>
      <upload-data-component uploadTitle="Upload Sales Evaluation Data" :uploadDataUrl="uploadDataUrl"></upload-data-component>
    </div>
</template>

<script setup>

  definePageMeta({
    middleware: ['auth', 'adminmanager']
  })
    const config = useRuntimeConfig()

    const apiUrl = config.public.apiUrl

    const uploadDataUrl =  `${apiUrl}/upload_sales_evaluation_data`

</script>

<style>

</style>