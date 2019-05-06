export default {
  data() {
    return {
      list: {
        data: [],
        loading: 1,
        loadingErrMsg: "",
        pagination: {
          pageIndex: 1,
          pageSize: 10,
          total: 0
        }
      }
    };
  },
  mounted() {
  },
  methods: {
    getList() {
      let list = this.list;
      let pagination = this.list.pagination;
      if (list.loading === -1 || pagination.pageIndex == 1) {
        list.loading = 1;
      }
      let fromData;
      if (this.query) {
        fromData = { ...this.query, ...pagination };
        // const fromData = Object.assign({}, list.query, pagination);
      } else {
        fromData = pagination;
      }

      this.$ajax
        .post(this.listPath, fromData)
        .then(
          res => {
            let { rows, total } = res

            if (rows && rows.length > 0) {
              //页面级数据格式化
              if (this.dataFormat) {
                rows = this.dataFormat(rows)
              }
              if (pagination.pageIndex === 1) {
                list.data = rows;
              } else {
                list.data = [...list.data, ...rows];
              }
            }
            pagination.total = total;
            list.loading = 0;
            uni.stopPullDownRefresh();
          },
          err => {
            list.loadingErrMsg = err.msg;
            list.loading = -1;
            uni.stopPullDownRefresh();
          }
        )
    },
  },
  onPullDownRefresh() {
    this.list.pagination.pageIndex = 1;
    this.getList();
  },
  onReachBottom() {
    let { pageIndex, pageSize, total } = this.list.pagination;
    if (pageIndex * pageSize < total) {
      this.list.pagination.pageIndex += 1;
      this.getList();
    }
  },
}
