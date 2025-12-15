<template>
  <v-app-bar
    flat
    :elevation="isScrolled ? 8 : 0"
    height="80"
    color="#ffe4cc"
    class="px-8"
  >
    <!-- Left spacer (keeps the center block centered) -->
    <v-spacer v-if="rightLinksFlag" class="d-none d-md-flex"></v-spacer>
    <v-spacer v-if="rightLinksFlag"></v-spacer>

    <!-- CENTER GROUP: left links + logo + right links -->
    <div class="d-flex align-center">
      <!-- Center-Left links -->
      <div class="d-none d-md-flex align-center">
        <v-btn
          v-for="(link, i) in leftLinks"
          :key="'left-' + i"
          :to="link.to"
          :variant="link.variant || 'text'"
          :color="link.color || 'black'"
          class="mx-2 nav-btn"
        >
          {{ link.label }}
        </v-btn>
      </div>

      <!-- Logo -->
       <v-btn
          to="/"
          variant="plain"
          class="mx-6 p-0 nav-btn"
          style="min-width: unset; height: auto; opacity: 1 !important;"
        >
          <v-img
            :src="logo"
            alt="Logo"
            width="140"
            contain
          />
        </v-btn>
      <!-- Center-Right links -->
      <div class="d-none d-md-flex align-center">
        <v-btn
          v-for="(link, i) in rightLinks"
          :key="'right-' + i"
          :to="link.to"
          :variant="link.variant || 'text'"
          :color="link.color || 'black'"
          class="mx-2 nav-btn"
        >
          {{ link.label }}
        </v-btn>
      </div>
    </div>

    <!-- Right spacer -->
    <v-spacer></v-spacer>

    <!-- 🌟 Mobile Hamburger Icon -->
    <v-app-bar-nav-icon class="d-md-none" @click="drawer = !drawer" />

    <!-- Utility / user links -->
    <div class="d-none d-md-flex align-center">
      <v-btn
        v-for="(link, i) in utilityLinks"
        :key="'util-' + i"
        @click="handleClick(link)"
        :variant="link.outlined ? 'outlined' : link.variant || 'text'"
        :color="link.color || 'black'"
        class="mx-2 nav-btn"
      >
        {{ link.label }}
      </v-btn>

    </div>
  </v-app-bar>
          <v-navigation-drawer v-model="drawer" app temporary location="right" color="#ffe4cc">
            <v-list class="d-flex flex-column ga-2" >
            <v-list-item v-for="(link, i) in leftLinks" :key="'left-drawer-' + i" class="nav-btn">
              <v-btn
                :key="'left-' + i"
                :to="link.to"
                :variant="link.variant || 'text'"
                :color="link.color || 'black'"
                class="mx-2"
              >
                {{ link.label }}
              </v-btn>
            </v-list-item>
            
            <v-list-item  v-for="(link, i) in rightLinks" :key="'right-drawer-' + i" class="nav-btn">
              <v-btn
                :key="'right-' + i"
                :to="link.to"
                :variant="link.variant || 'text'"
                :color="link.color || 'black'"
                class="mx-2"
              >
                {{ link.label }}
              </v-btn>
            </v-list-item>
            
            <v-list-item  v-for="(link, i) in utilityLinks" :key="'util-drawer-' + i" class="nav-btn">
             <v-btn
              :key="'util-' + i"
              @click="handleClick(link)"
              :variant="link.outlined ? 'outlined' : link.variant || 'text'"
              :color="link.color || 'black'"
              class="mx-2"
            >
              {{ link.label }}
            </v-btn>
            </v-list-item>
            
            </v-list>
        </v-navigation-drawer>

    <SuccessSnackbar
      v-model="showLogoutSuccess"
      message="Logout Successful!"
    />
</template>

<script setup>
  import logo from '@/assets/images/logo-tlg.png'
  import { ref, computed } from 'vue'
  import { useNavStore } from '@/stores/navStore'
  import { storeToRefs } from 'pinia'
  import { useRouter } from "vue-router";
  import SuccessSnackbar from '@/components/SuccessSnackbar.vue'


  // Props from parent (still keep for scroll)
  defineProps({
    isScrolled: Boolean,
  })


  const drawer = ref(false)

  const router = useRouter();

  // 🏪 Grab links from Pinia store
  const navStore = useNavStore()
  const { leftLinks, rightLinks, utilityLinks } = storeToRefs(navStore)

  const showLogoutSuccess = ref(false);

  // ✅ Flag to check if rightLinks exist
  const rightLinksFlag = computed(
    () => Array.isArray(rightLinks.value) && rightLinks.value.length > 0
  )



function handleClick(link) {
  if (link.action === "go-profile") {
    const id = navStore.userId;
    console.log("Going to profile...", id);
    if (!id) return;

    router.push(`/guide/${id}`);
    return;
  }

  if (link.label === "Logout") {
    navStore.logout();
    showLogoutSuccess.value = true;

      router.push("/");

    return;
  }

  if (link.to) router.push(link.to);
}

</script>
<style scoped>

  .v-btn {
    text-transform: none !important;
  }

  .nav-btn {
    transition: transform 0.25s ease, opacity 0.25s ease;
    font-size: 1.1rem !important;
  }

  .nav-btn:hover {
    transform: translateY(-3px);
    opacity: 0.85;
  }


</style>
