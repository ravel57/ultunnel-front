<template>
  <div class="user">
    <span class="title">{{ user.name }}</span>
    <q-toggle v-model="user.isEnabled"/>
  </div>
  <div>
    <span>{{user.registrationDate}}</span>
    <span>{{user.nextPaymentDate}}</span>
    <span>{{user.secretKey}}</span>
  </div>
</template>

<script lang="ts">
export default {

  name: "UserView",

  props: {},

  data: () => ({user: User}),

}
</script>

<style scoped>
.title {
  font-weight: 700;
  line-height: 58px;
  letter-spacing: -0.02em;
  text-align: left;
  text-underline-position: from-font;
  text-decoration-skip-ink: none;

}
</style>