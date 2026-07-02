<template>
    <div>
      <upload-data-component uploadTitle="Upload Target/Shipok Sales Data" :uploadDataUrl="uploadDataUrl"></upload-data-component>
    </div>
</template>

<script setup>

  definePageMeta({
    middleware: ['auth', 'adminmanager']
  })
    const config = useRuntimeConfig()

    const apiUrl = config.public.apiUrl

    const uploadDataUrl =  `${apiUrl}/upload_target_shipok_data`

</script>

<style>

</style>