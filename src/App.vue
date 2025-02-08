<template>
  <div>
    <search></search>
    <q-btn @click="isNewUserDialogOpened=true">
      new user
    </q-btn>
    <q-dialog v-model="this.isNewUserDialogOpened">
      <q-card>
        <div>
          <q-input v-model="this.newUserName"/>
          <q-btn @click="createNewUser">create</q-btn>
        </div>
      </q-card>
    </q-dialog>
    <more-actions></more-actions>
  </div>
  <div class="users">
    <div
        v-for="user in this.store.users"
        :key="user.id"
    >
      <UserView :user="user" :servers="this.store.servers"/>
    </div>
  </div>
</template>


<script lang="ts">
import UserView from "./components/UserView.vue";
import {useStore} from "./store";
import axios from "axios";

export default {

  name: 'App',

  components: {
    UserView
  },

  data: () => ({
    isNewUserDialogOpened: false,
    newUserName: "",
  }),

  methods: {
    createNewUser() {
      let user = {name: this.newUserName}
      axios.post("/api/v1/add-new-user", user)
    }
  },

  setup() {
    const store = useStore()
    store.fetchData()
    return {store}
  }

}
</script>


<style scoped>
.users {
  justify-content: center;
  display: flex;
  align-content: normal;
  flex-direction: column;
  max-width: 800px;
}
</style>