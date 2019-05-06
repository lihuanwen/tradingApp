<template>
  <div class="table">
    <Table ref="table" v-bind="innerTableProps" :columns="columns" :data="data" :loading="loading"></Table>
    <div v-if="innerPagination.show" class="page ui-flex">
      <div class="ui-flex-1"></div>
      <Page :current="innerPagination.pageIndex" :total="innerPagination.total" :page-size="innerPagination.pageSize" :page-size-opts="innerPagination.pageSizes" @on-change="indexChange" @on-page-size-change="sizeChange" show-sizer show-elevator show-total />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    columns: {
      type: Array,
      default() {
        return [];
      }
    },
    data: {
      type: Array,
      default() {
        return [];
      }
    },
    loading: {
      type: Boolean,
      default: false
    },
    pagination: {
      type: Object,
      default() {
        return {};
      }
    },
    tableProps: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  mounted() {
    // 表格回调代理
    this.$refs.table.$emit = (...args) => {
      this.$emit.apply(this, args);
    };
  },
  computed: {
    // 分页
    innerPagination() {
      return Object.assign(
        {
          pageIndex: 1,
          total: 0,
          pageSize: 20,
          pageSizes: [5, 10, 20, 50, 100],
          show: true
        },
        this.pagination
      );
    },
    // 表格设置
    innerTableProps() {
      return Object.assign(
        {
          border: true, // 纵向边框
          highlightCurrentRow: true // 高亮当前行
        },
        this.tableProps
      );
    }
  },
  methods: {
    // 页码变更
    indexChange(pageIndex) {
      this.$emit('page-change', pageIndex, this.innerPagination.pageSize);
    },
    // 每页条数变更
    sizeChange(size) {
      this.$emit('page-change', this.innerPagination.pageIndex, size);
    }
  },
  watch: {}
};
</script>

<style lang='scss'>
.table {
  .page {
    margin-top: 10px;
  }
}
</style>
