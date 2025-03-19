<script setup>

import {ref, onMounted} from 'vue'
import {VParallax} from 'vuetify/components'
import {useRouter} from 'vue-router'
import {Auth, User} from "@/api/index.js";
import axios from "axios";
import {GoogleLogin} from "vue3-google-login";

const router = useRouter()
const agreement = ref(false)
const name = ref()
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
      {theme: "outline", size: "large"} //style
  )
})


const rules = {
  name: v => !!v || 'Username is required',
  email: v => !!(v || '').match(/@/) || 'Please enter a valid email',
  length: len => v => (v || '').length >= len || `Minimum ${len} characters required`,
  password: v => !!(v || '').match(/^[A-Za-z0-9]+$/) ||
      'Password can only contain letters and numbers',
  required: v => !!v || 'This field is required',
}

const goToSignUp = () => router.push('/signup')

const submitForm = () => {
  Auth.register({
    name: name.value,
    email: email.value,
    password: password.value
  })

  User.me().then(user => {
    console.log(user);
  });
}

const callback = async (response) => {
  await Auth.google({ credential: response.credential });
  const user = await User.me();

  console.log(user);
}

</script>

<template>
  <v-parallax
      height="100vh"
      src="https://images.pexels.com/photos/3587347/pexels-photo-3587347.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  >
    <v-container class="d-flex fill-height justify-center align-center rounded-xs">
      <v-card class="pa-6" max-width="500" elevation="10" style="background: rgba(255, 255, 255, 0.9);
width: 400px; height: 600px; border-radius: 20px; overflow: hidden;">
        <v-toolbar color="indigo-lighten-1" dark flat style="background-color: #5C6BC0;">
          <v-card-title class="text-h6 font-weight-regular">
            Register
          </v-card-title>
        </v-toolbar>


        <v-form ref="form" v-model="isValid" class="pa-4">
          <v-text-field
              v-model="name"
              :rules="[rules.name, rules.length(6)]"
              color="deep-purple"
              counter="6"
              label="Name"
              type="text"
              variant="filled"
          ></v-text-field>
          <v-text-field
              v-model="password"
              :rules="[rules.password, rules.length(6)]"
              color="deep-purple"
              counter="6"
              label="Password"
              type="password"
              variant="filled"
          ></v-text-field>
                    <v-text-field
                        v-model="email"
                        :rules="[rules.email]"
                        color="deep-purple"
                        label="Email address"
                        type="email"
                        variant="filled"
                    ></v-text-field>
          <v-checkbox
              v-model="agreement"
              :rules="[rules.required]"
              color="deep-purple"
          >
            <template v-slot:label>
              <div class="checkbox-label">
              I agree to the
              <a href="#" @click.stop.prevent="dialog = true">Terms of Service</a> and
              <a href="#" @click.stop.prevent="dialog = true">Privacy Policy</a>*
              </div>
            </template>
          </v-checkbox>
        </v-form>

        <v-divider></v-divider>
<!--        <div id="google-signin-btn" class="d-flex justify-center my-4"></div>-->

        <GoogleLogin :callback="callback" />

        <v-card-actions>
          <v-btn variant="text" @click="goToSignUp">Sign Up</v-btn>
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
.checkbox-label {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
</style>