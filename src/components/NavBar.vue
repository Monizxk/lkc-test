<script setup>
import {useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import {Auth, User} from "@/api/index.js";

const router = useRouter()
const currentUser = ref(null);

const logoutCallback = async () => {
  await Auth.logout();
  await router.push("/menu")
  window.location.reload();
}

const menuItems = [
  {title: "Logout", icon: "mdi-logout", callback: logoutCallback},
]

const fetchUser = async() => {
  currentUser.value = await User.me()
}

onMounted(() => {
  fetchUser().then()
})

const goToHelp = () => router.push('/help')
const goToSignUp = () => router.push('/signup')
const goToRegister = () => router.push('/register')
</script>

<template>
  <v-card>
    <v-card-item class="bg-[#9FA8DA]">
      <div class="d-flex align-center justify-space-between">
        <!-- Заголовок -->
        <v-card-title>
          <router-link to="/menu">LKC</router-link>
        </v-card-title>

        <!-- Посилання на сторінки -->
        <div class="flex gap-3">
          <router-link to="/menu">Main</router-link>
          <router-link to="/signup">SignUp</router-link>
          <router-link to="/register">Register</router-link>
          <router-link to="/files">File</router-link>
          <!--    <router-link to="/canva">Konva</router-link>-->
          <router-link to="/help">Help</router-link>
        </div>

        <!-- Інформація про користувача -->
        <div v-if="currentUser" class="flex items-center gap-1">
          <p>{{currentUser.name}}</p>

          <!-- Кнопка довідки -->
          <v-btn
            class="hover-visible bg-transparent elevation-0"
            @click="goToHelp"
            icon="mdi-help-circle"
            size=""
          ></v-btn>

          <!-- Avatar button with dropdown menu -->
          <v-menu open-on-click>
            <template v-slot:activator="{ props }">
              <v-btn
                icon
                v-bind="props"
                size="small"
              >
                <v-avatar :image="currentUser.avatar_url" />
              </v-btn>
            </template>

            <v-list>
              <v-list-item
                v-for="(item, index) in menuItems"
                :key="index"
                :append-icon="item.icon"
                @click="item.callback"
              >
                <v-list-item-title>{{item.title}}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>

        <!-- Авторизація та реєстрація -->
        <div v-if="!currentUser" class="flex items-center gap-1">
          <v-btn
            id="button"
            class="text-none custom-button"
            color="medium-emphasis"
            min-width="92"
            variant="outlined"
            rounded
            @click="goToSignUp"
          >
            Sign Up
          </v-btn>

          <v-btn
            id="button"
            class="text-none custom-button"
            color="medium-emphasis"
            min-width="92"
            variant="outlined"
            rounded
            @click="goToRegister"
          >
            Register
          </v-btn>
        </div>
      </div>
    </v-card-item>
  </v-card>
</template>

<style scoped>

</style>