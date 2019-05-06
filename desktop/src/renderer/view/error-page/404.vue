<template>
  <error-content code="404" desc="Oh~~您的页面好像飞走了~" :src="`${$path.staticPath}/error-page/error-404.svg`" />
</template>

<script>
import errorContent from './error-content.vue';
export default {
  name: 'error_404',
  components: {
    errorContent
  }
};
</script>
