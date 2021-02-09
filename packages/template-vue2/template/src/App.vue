<template>
  <div id="app">
    <router-view/>
  </div>
</template>
<script>
    export default {
        name: 'App',
        mounted() {
        },
    }
</script>
<style lang="stylus">
  html.body,#app{
    position:relative;
    height: 100vh; /*overflow-y: scroll;*/
  }
</style>
