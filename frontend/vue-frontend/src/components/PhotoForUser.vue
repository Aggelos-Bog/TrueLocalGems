<template>
  <div class="d-flex flex-column align-center mb-6">
    <v-hover v-slot="{ isHovering, props }">
      <v-avatar
        v-bind="props"
        size="100"
        class="cursor-pointer elevation-4"
        :class="{ 'on-hover': isHovering }"
        style="border: 4px solid white; position: relative; overflow: hidden;"
        color="grey-lighten-3"
        @click="triggerInput"
      >
        <v-img
          v-if="previewUrl"
          :src="previewUrl"
          cover
          class="fill-height"
        >
          <template v-slot:placeholder>
             <div class="d-flex align-center justify-center fill-height">
               <v-progress-circular indeterminate color="grey-lighten-4"></v-progress-circular>
             </div>
          </template>
        </v-img>

        <div v-else class="d-flex flex-column align-center justify-center fill-height text-medium-emphasis">
          <v-icon icon="mdi-camera" size="40" class="mb-1"></v-icon>
          <span class="text-caption font-weight-bold text-uppercase">Photo</span>
        </div>

        <!-- Overlay on Hover -->
        <v-overlay
          :model-value="isHovering"
          contained
          class="align-center justify-center"
          scrim="black"
          style="opacity: 0.3"
        >
          <v-icon icon="mdi-pencil" color="white" size="32"></v-icon>
        </v-overlay>
      </v-avatar>
    </v-hover>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="d-none"
      @change="handleFileChange"
    />

    <v-btn
      v-if="previewUrl"
      variant="text"
      color="error"
      density="compact"
      class="mt-2 text-caption"
      prepend-icon="mdi-delete"
      @click.stop="removeImage"
    >
      Αφαίρεση
    </v-btn>
    <span v-else class="text-caption text-medium-emphasis mt-2">Πατήστε για φωτογραφία</span>
  </div>
</template>

<script setup>
    import { ref, watch } from 'vue'

    const props = defineProps({
        modelValue: String,
        initialImage: {
            type: String,
            default: ""
        },
        uploadUrl: {
            type: String,
            default: ""
        }
    })  

    const previewUrl = ref(props.initialImage || props.modelValue)

    // Keep synced if parent updates
    watch(() => props.initialImage, (v) => {
        if (v) previewUrl.value = v
    })
    watch(() => props.modelValue, (v) => {
        previewUrl.value = v
    })

    const emit = defineEmits(['update:modelValue'])

    const fileInput = ref(null)

    const triggerInput = () => fileInput.value.click()

    const handleFileChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        // 1. Immediate Preview
        previewUrl.value = URL.createObjectURL(file)

        // 2. Upload if URL provided
        if (props.uploadUrl) {
            try {
                const formData = new FormData()
                formData.append('photo', file)

                const res = await fetch(props.uploadUrl, {
                    method: 'POST',
                    body: formData
                })

                if (!res.ok) throw new Error('Upload failed')

                const data = await res.json()
                emit('update:modelValue', data.img_url)
            } catch (err) {
                console.error('Upload error:', err)
                // Revert preview if needed or show error
            }
        } else {
            // Fallback to base64 if no upload URL (legacy support)
            const reader = new FileReader()
            reader.onloadend = () => {
                emit('update:modelValue', reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        previewUrl.value = ''
        fileInput.value.value = ''
        emit('update:modelValue', '')
    }
</script>