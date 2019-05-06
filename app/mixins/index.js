export default {
  data() {
    return {
      defaultImg: `${this.$path.staticPath}favicon.jpg`,
    };
  },
  methods: {
    routerReplace(type, url, query) {
      if (query) {
        url += "?"
        const params = []
        Object.keys(query).forEach((key) => {
          params.push([key, encodeURIComponent(query[key])].join('='))
        })
        url += params.join('&')
      }
      console.log(url)
      type && url && uni[type]({ url });
    },
    imgErr(e) {
      e.srcElement.src = `${this.$path.staticPath}favicon.jpg`
    },
    goAnchor(selector, offset = 0, id = "#anchor") {
      //页面内跳转
      let anchor = this.$el.querySelector(selector)
      let body = this.$el.querySelector(id) || document.body;
      let total = anchor.offsetTop - offset;
      let distance = body.scrollTop;
      // 平滑滚动，时长500ms，每10ms一跳，共50跳
      let step = total / 30
      if (total > distance) {
        smoothDown()
      } else {
        let newTotal = distance - total
        step = newTotal / 30
        smoothUp()
      }

      function smoothDown() {
        if (distance < total) {
          distance += step
          body.scrollTop = distance
          setTimeout(smoothDown, 20)
        } else {
          body.scrollTop = total
        }
      }

      function smoothUp() {
        if (distance > total) {
          distance -= step
          body.scrollTop = distance
          setTimeout(smoothUp, 20)
        } else {
          body.scrollTop = total
        }
      }
    }
  }
}
