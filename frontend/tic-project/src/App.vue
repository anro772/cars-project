<template>
  <div id="app">
    <app-navbar v-if="shouldDisplayNavbar"></app-navbar>
    <div :class="{ 'content-with-navbar': shouldDisplayNavbar }">
      <router-view v-slot="{ Component }">
        <component :is="Component"></component>
      </router-view>
    </div>
  </div>
</template>


<script>
import AppNavbar from './components/NavBar.vue';

export default {
  name: 'App',
  components: {
    AppNavbar
  },
  computed: {
    shouldDisplayNavbar() {
      return !['/login', '/signup'].includes(this.$route.path);
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.content-with-navbar {
  padding-top: 60px;
  /* Adjust based on your navbar's height */
}
</style>

