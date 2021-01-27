<template>
  <QiNiu ref="qiNiu" />
</template>

<script>
import QiNiu from './qiniu/index'
export default {
  name: 'Storage',
  components: { QiNiu },
  data() {
    return {
      activeName: 'first'
    }
  },
  methods: {
  }
}
</script>

<style scoped>
</style>
