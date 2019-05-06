<template>
  <error-content code="500" desc="Oh~~鬼知道服务器经历了什么~" :src="`${$path.staticPath}/error-page/error-500.svg`" />
</template>

<script>
import errorContent from './error-content.vue'
export default {
  name: 'error_500',
  components: {
    errorContent
  }
}
</script>
