<template>
  <section class="ui-flex-1 ui-content">
    <div class="ui-flex">
      <Form ref="search" :model="table.search" inline class="ui-flex-1 inlineForm">
        <FormItem label="状态：">
          <Select v-model="table.search.state" multiple style="width:200px">
            <Option v-for="item in state" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem label="关键字：">
          <Input style="width:200px" v-model="table.search.keyWord" placeholder autofocus/>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="getList()">查 询</Button>
        </FormItem>
      </Form>
      <div>
        <Button icon="md-add" size="large" @click="form = {}">添 加</Button>
      </div>
    </div>
    <data-table
      :data="table.data"
      :columns="table.columns"
      :tableProps="table.tableProps"
      :loading="table.loading"
      :pagination="table.pagination"
      @page-change="pageChange"
    />
    <edit :value="form" @over="getList"></edit>
    <Modal v-model="del.show" width="360">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="ios-information-circle"></Icon>
        <span>删除确认</span>
      </p>
      <div style="text-align:center">
        <p>此任务删除后，将停止引用此配置的主机。</p>
        <p>是否继续删除？</p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long :loading="del.loading" @click="doDel()">删 除</Button>
      </div>
    </Modal>
  </section>
</template>
<script>
import { debounce, cloneDeep } from 'lodash';
import edit from './edit';

export default {
  components: {
    edit
  },
  data() {
    return {
      state: [
        {
          value: 1,
          label: '启用'
        },
        {
          value: 0,
          label: '禁用'
        }
      ],
      table: {
        search: {
          keyWord: '',
          state: [1]
        },
        columns: [
          {
            title: 'ID',
            key: 'ID',
            width: 50,
            align: 'center'
          },
          {
            title: '交易所',
            key: 'market',
            align: 'center'
          },
          {
            title: '备注',
            key: 'note'
          },
          {
            title: '创建时间',
            key: 'createTime',
            align: 'right'
          },
          {
            title: '状态',
            key: 'state',
            width: 120,
            align: 'center',
            render: (h, params) => {
              return h(
                'Tag',
                {
                  props: {
                    type: 'dot',
                    color: params.row.state === 1 ? 'success' : 'error'
                  }
                },
                params.row.state === 1 ? '启用' : '禁用'
              );
            }
          },
          {
            title: '操作',
            width: 250,
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h(
                  'Button',
                  {
                    props: {
                      type: 'primary'
                    },
                    on: {
                      click: () => {
                        this.form = cloneDeep(params.row);
                      }
                    }
                  },
                  '编 辑'
                ),
                h(
                  'Button',
                  {
                    props: {
                      type: 'error'
                    },
                    on: {
                      click: () => {
                        this.doDel(params.row.ID);
                      }
                    }
                  },
                  '删 除'
                )
              ]);
            }
          }
        ],
        tableProps: {},
        data: [],
        loading: true,
        pagination: {
          pageIndex: 1,
          pageSize: 20,
          total: 0
        }
      },
      form: null,
      del: {
        IDs: null,
        show: false,
        loading: false
      }
    };
  },
  mounted() {
    this._search = debounce(() => {
      this.getList();
    }, 300);
  },
  methods: {
    // 数据管理
    getList() {
      let table = this.table;
      table.loading = true;
      this.$ajax
        .post(this.$path.setting.marketConfig.list, {
          state: table.search.state,
          keyWord: table.search.keyWord,
          pageIndex: table.pagination.pageIndex,
          pageSize: table.pagination.pageSize
        })
        .then(data => {
          table.pagination.total = data.total;
          table.data = data.rows;
          table.loading = false;
        });
    },
    doDel(ID) {
      const reset = () => {
        this.getList();
        this.del.IDs = null;
        this.del.show = false;
        this.del.loading = false;
      };
      if (ID) {
        this.del.IDs = [ID];
        this.del.show = true;
      } else {
        this.del.loading = true;
        this.$ajax
          .post(this.$path.setting.marketConfig.del, {
            IDs: this.del.IDs
          })
          .then(data => {
            reset();
          })
          .catch(() => {
            reset();
          });
      }
    },

    pageChange(pageIndex, pageSize) {
      this.table.pagination.pageIndex = pageIndex;
      this.table.pagination.pageSize = pageSize;
      this.getList();
    }
  },
  watch: {
    'table.search': {
      deep: true,
      handler() {
        this._search();
      }
    }
  }
};
</script>

<style lang="less" scoped>
</style>
