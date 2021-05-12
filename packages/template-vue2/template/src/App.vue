<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
      <ElButton>1</ElButton>
    </div>
    <router-view />
  </div>
</template>
<script>
export default {
  created() {
    this.$subscribe.on("xxx", () => {
      console.log(1);
    });
  },
};
</script>
<style lang="stylus">
#app
  font-family Avenir, Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  text-align center
  color #2c3e50
  margin-top 60px
</style>
