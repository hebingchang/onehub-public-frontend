<template>
  <a-layout id="container">
    <a-layout class="layout">
      <a-layout-header :style="headerStyle">
        <div>
          <span class="title">{{$config.title}}</span>
          <!--<a-button shape="circle" icon="search" class="search-btn" />-->
        </div>
      </a-layout-header>
      <a-layout-content :style="{ margin: '74px 16px 0', background: '#fff' }">
        <div class="layout-container">
          <router-view />
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script>
export default {
  data() {
    return {
      config: {},
      headerStyle: {
        position: "fixed",
        background: "#f6f6f6",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        padding: "0 20px",
        height: "50px",
        lineHeight: "50px",
        width: "100vw",
        zIndex: 100
      }
    };
  },
  methods: {}
};
</script>

<style>
#container,
.layout {
  background: #fff !important;
}

#container .logo {
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px;
}

.search-btn {
  background-color: #f6f6f6 !important;
}

#container .title {
  font-size: 1.3em;
  font-weight: 300;
  margin-right: 10px;
}

.layout-container {
  padding: 24px;
  background: #fff;
  min-height: 360px;
}

@media only screen and (max-width: 850px) {
  .layout-container {
    padding: 12px;
  }
}

*::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE and Edge */
* {
  -ms-overflow-style: none;
}
</style>