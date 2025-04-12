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
    <v-card-item class="nav-bar">
      <div class="nav-content">
        <!-- Заголовок -->
        <v-card-title>
          <router-link to="/menu" class="nav-link">LKC</router-link>
        </v-card-title>

<!--        &lt;!&ndash; Посилання на сторінки &ndash;&gt;-->
<!--        <div class="nav-links">-->
<!--          <router-link to="/menu" class="nav-link">Main</router-link>-->
<!--          <router-link to="/signup" class="nav-link">SignUp</router-link>-->
<!--          <router-link to="/register" class="nav-link">Register</router-link>-->
<!--          <router-link to="/help" class="nav-link">Help</router-link>-->
        <div v-if="currentUser" class="nav-links">
        <router-link to="/files" class="nav-link">My Projects</router-link>
        </div>


        <!-- Інформація про користувача -->
        <div v-if="currentUser" class="user-info">
<!--          <p>{{ currentUser.name }}</p>-->

          <v-btn
              variant="plain"
              class="help-btn"
              @click="goToHelp"
              icon="mdi-help-circle"
              small
          ></v-btn>

          <v-menu open-on-click>
            <template v-slot:activator="{ props }">
              <v-btn icon v-bind="props" size="small">
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
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>

        <!-- Авторизація та реєстрація -->
        <div v-if="!currentUser" class="auth-buttons">
          <v-btn
              class="custom-button"
              color="medium-emphasis"
              min-width="92"
              variant="outlined"
              rounded
              @click="goToSignUp"
          >
            Sign Up
          </v-btn>

          <v-btn
              class="custom-button"
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
.nav-bar {
  background-color: #9FA8DA;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.nav-links {
  display: flex;
  gap: 12px;
  color: black;
  text-decoration: none;
  pointer-events: auto;
  margin-left: auto; /* сместит только этот блок вправо */
}

.nav-link {
  color: black;
  text-decoration: none;
  cursor: default;
}

.nav-link:hover {
  text-decoration: none;
  color: black;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.auth-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}
.help-btn {
  background-color: transparent;
  box-shadow: none;
}

</style>