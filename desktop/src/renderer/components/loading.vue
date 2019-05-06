<template>
  <div class="mainLoading ui-flex-1">
    <Spin fix>
      <Icon type="ios-loading" size=30 class="spin-icon-load"></Icon>
      <div class="text">Loading</div>
    </Spin>
  </div>
</template>

<style lang="scss">
.mainLoading {
  position: relative;
  .text {
    font-size: 18px;
  }
  .spin-icon-load {
    animation: ani-spin 1s linear infinite;
  }
  @keyframes ani-spin {
    from {
      transform: rotate(0deg);
    }
    50% {
      transform: rotate(180deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
}
</style>
