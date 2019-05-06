<template>
  <div class="mainNoData ui-flex-1 ui-flex">
    <div class="ui-flex-1">
      <!-- <img class="icon" :src="$path.staticPath+'err.svg'"> -->
      <!-- <Icon type="ios-bug" size=30 /> -->
      <p>暂无数据。</p>
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss">
.mainNoData {
  align-items: center;
  text-align: center;
  i {
    font-size: 44px;
  }
}
</style>
