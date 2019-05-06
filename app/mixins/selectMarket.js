export default {
  data() {
    return {
      search: {
        show: false,
        loadingErrMsg: "",
        marketConfig: {
          loading: 1,
          list: [],
          show: true,
          keyword: "",
          select: null
        },
        marketSymbol: {
          loading: 0,
          list: [],
          show: false,
          keyword: "",
          select: null
        },
        orderType: {
          list: [
            { value: "all", label: "全部" },
            { value: "open", label: "未成交" },
            { value: "closed", label: "已成交" }
          ],
          select: { value: "open", label: "未成交" }
        }
      },
    };
  },
  computed: {
    query() {
      const { search } = this;
      return {
        ID: search.marketConfig.select ? search.marketConfig.select.ID : null,
        symbol: search.marketSymbol.select,
        orderType: search.orderType.select.value
      };
    },
    marketConfigList() {
      let temp = [];
      this.search.marketConfig.list.forEach(item => {
        if (
          item.market.indexOf(this.search.marketConfig.keyword) > -1 ||
          item.note.indexOf(this.search.marketConfig.keyword) > -1
        ) {
          temp.push({ ...item, text: item.market + " " + item.note });
        }
      });
      return temp;
    },
    marketSymbolList() {
      let temp = [];
      this.search.marketSymbol.list.forEach(item => {
        if (item.indexOf(this.search.marketSymbol.keyword.toUpperCase()) > -1) {
          temp.push({ text: item });
        }
      });
      return temp;
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.$store.dispatch("getCache", "marketConfig").then(
        data => {
          this.search.marketConfig.list = data.rows;
          this.search.marketConfig.loading = 0;
          if (data.rows.length === 1) {
            this.marketConfigSelect();
          }
        },
        err => {
          this.search.loadingErrMsg = err.msg;
          this.search.marketConfig.loading = -1;
        }
      );
    },
    getSymbols(ID) {
      this.search.marketSymbol.loading = 1;
      this.$ajax.post(this.$path.capital.symbols, { ID }).then(
        data => {
          this.search.marketSymbol.list = data;
          this.search.marketSymbol.loading = 0;
        },
        err => {
          this.search.loadingErrMsg = err.msg;
          this.search.marketSymbol.loading = -1;
        }
      );
    },
    marketConfigSelect(e) {
      const index = e ? e.index : 0;
      const item = this.marketConfigList[index];
      let marketConfig = this.search.marketConfig;

      if (item) {
        marketConfig.select = item;
        marketConfig.keyword = item.market + " " + item.note;
        this.search.marketSymbol.show = true;
        this.search.marketSymbol.select = null;
      }
      marketConfig.show = false;
      uni.hideKeyboard();
    },
    marketSymbolSelect(e) {
      const index = e ? e.index : 0;
      const item = this.marketSymbolList[index];
      let marketSymbol = this.search.marketSymbol;

      if (item) {
        marketSymbol.select = item.text;
        marketSymbol.keyword = item.text;
      }
      marketSymbol.show = false;
      uni.hideKeyboard();
    },
    radioChange(e) {
      this.search.orderType.select = this.search.orderType.list.filter(item => {
        return item.value === e.detail.value;
      })[0];
    },
  },
  watch: {
    "search.marketConfig.select"(val) {
      this.getSymbols(val.ID);
    }
  }
}
