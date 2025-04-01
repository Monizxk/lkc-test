<script setup>

import { ref, onMounted } from 'vue'
import { VParallax } from 'vuetify/components'
import { useRouter } from 'vue-router'
import {Auth, User} from "@/api/index.js";
import {GoogleLogin} from "vue3-google-login";

const router = useRouter()
const agreement = ref(false)
const login = ref(null)
const dialog = ref(false)
const email = ref()
const isValid = ref(false)
const isLoading = ref(false)
const password = ref()
const googleUser = ref(null)


const handleCredentialResponse = (response) => {
  console.log("Google JWT Token: ", response.credential)
  // Decode and use the credential, e.g., send it to your backend
  googleUser.value = response.credential
}

onMounted(() => {
  window.google.accounts.id.initialize({
    client_id: "YOUR_GOOGLE_CLIENT_ID",
    callback: handleCredentialResponse
  })
  window.google.accounts.id.renderButton(
      document.getElementById("google-signin-btn"),
      { theme: "outline", size: "large" } //style
  )
})


const rules = {
  login: v => !!v || 'Username is required',
  email: v => !!(v || '').match(/@/) || 'Please enter a valid email',
  length: len => v => (v || '').length >= len || `Minimum ${len} characters required`,
  password: v => !!(v || '').match(/^[A-Za-z0-9]+$/) ||
      'Password can only contain letters and numbers',
  required: v => !!v || 'This field is required',
}

const goToRegister = () => router.push('/register')

const submitForm = () => {
  Auth.login({
    email: email.value,
    password: password.value
  })

  router.push('/files');
  window.location.reload();
}

const callback = async (response) => {
  await Auth.google({ credential: response.credential });

  await router.push('/files');
  window.location.reload();
}

</script>

<template>
  <v-parallax
      height="100vh"
      src="https://images.pexels.com/photos/3587347/pexels-photo-3587347.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  >
    <v-card
        v-if="false"
        class="mx-auto"
    >
      <v-card-item style="background-color: #3949AB;">
        <div class="d-flex align-center justify-space-between">
          <v-card-title>
            LKC
          </v-card-title>
        </div>
      </v-card-item>
    </v-card> <!-- DELETE IT -->

    <v-container
        class="d-flex fill-height justify-center align-center"
    >
      <v-card class="pa-6 max-w-[500px] w-[400px] rounded-xl elevation-10 !bg-[#ffffffff] backdrop-blur-[10px]">
        <v-toolbar class="rounded-lg" color="indigo-lighten-1" dark flat style="background-color: #5C6BC0;">
          <v-card-title class="text-h6 font-weight-regular">
            Sign up
          </v-card-title>
        </v-toolbar>

        <v-form ref="form" v-model="isValid" class="pa-4 pb-0">
          <v-text-field
              v-model="email"
              :rules="[rules.email]"
              color="deep-purple"
              label="Email address"
              type="email"
              variant="filled"
          />
          <v-text-field
              v-model="password"
              :rules="[rules.password, rules.length(6)]"
              color="deep-purple"
              counter="6"
              label="Password"
              type="password"
              variant="filled"
          />
        </v-form>

        <v-divider>or</v-divider>

        <div class="flex justify-center w-full py-2">
          <GoogleLogin :callback="callback"/>
        </div>

        <v-card-actions>
          <v-btn variant="text" @click="goToRegister">Register</v-btn>
          <v-spacer></v-spacer>
          <v-btn
              :loading="isLoading"
              color="deep-purple-accent-4"
              @click="submitForm"
          >
            Submit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
  </v-parallax>
</template>


<style scoped>

</style>