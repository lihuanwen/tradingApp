<template>
  <div class="mainError ui-flex-1 ui-flex">
    <div class="ui-flex-1">
      <!-- <img class="icon" :src="$path.staticPath+'err.svg'"> -->
      <!-- <Icon type="ios-bug" size=30 /> -->
      <p>加载失败，点击重试。</p>
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss">
.mainError {
  align-items: center;
  text-align: center;
  i {
    font-size: 44px;
  }
}
</style>
