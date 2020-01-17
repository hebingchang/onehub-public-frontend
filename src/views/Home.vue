<template>
  <div class="home">
    <div class="tree-container" v-if="has_config">
      <a-directory-tree
        :treeData="tree"
        :replaceFields="replaceFields"
        @select="onTreeSelect"
        :defaultSelectedKeys="[$router.currentRoute.path]"
        defaultExpandAll
        :autoExpandParent="true"
        :selectedKeys="selectedKeys"
      >
        <template slot="title" slot-scope="{title}">
          <span>{{title}}</span>
        </template>
      </a-directory-tree>
    </div>
    <div class="explorer-container" v-if="has_config">
      <div class="bread-container">
        <a-breadcrumb style="margin-bottom: 1em;">
          <a-breadcrumb-item v-if="$router.currentRoute.path === '/'">
            <a-icon type="home" />
            <span>存储</span>
          </a-breadcrumb-item>
          <a-breadcrumb-item
            v-for="(item, index) in $router.currentRoute.path.split('/')"
            :key="item"
            v-else
          >
            <router-link
              :to="getPath(index)"
              v-if="index !== $router.currentRoute.path.split('/').length - 1"
            >
              <a-icon type="home" v-if="item === ''" />
              {{item === '' ? ' 存储' : item}}
            </router-link>
            <span v-else>{{item === '' ? ' 存储' : item}}</span>
          </a-breadcrumb-item>
        </a-breadcrumb>
        <div>共 {{stat[0]}} 文件，{{stat[1]}} 目录</div>
      </div>

      <div class="explorer-header">
        <div class="explorer-col-name col-title" @click="sort('name')">
          文件名
          <font-awesome-icon
            icon="arrow-down"
            v-if="sortCol.col === 'name'"
            :style="{fontSize: '0.9em', transform: sortCol.asc ? 'rotate(180deg)' : '', transition: 'all 0.2s'}"
          />
        </div>
        <div class="explorer-col-date col-title" @click="sort('update_time')">
          修改日期
          <font-awesome-icon
            icon="arrow-down"
            v-if="sortCol.col === 'update_time'"
            :style="{fontSize: '0.9em', transform: sortCol.asc ? 'rotate(180deg)' : '', transition: 'all 0.2s'}"
          />
        </div>
        <div class="explorer-col-size col-title" @click="sort('size')">
          文件大小
          <font-awesome-icon
            icon="arrow-down"
            v-if="sortCol.col === 'size'"
            :style="{fontSize: '0.9em', transform: sortCol.asc ? 'rotate(180deg)' : '', transition: 'all 0.2s'}"
          />
        </div>
      </div>
      <transition name="explorer" mode="out-in">
        <div :key="$router.currentRoute.path" class="explorer-wrapper">
          <div
            class="explorer-item"
            v-for="file in files_list"
            :key="file.id"
            @click="onFileClick(file.id, file.path, file.size ? true : false)"
          >
            <div class="explorer-col-name">
              <font-awesome-icon
                :icon="getIcon(file.name, file.size ? true : false, file.id === 'back')"
                :style="{width: '1.8em'}"
              />
              <span :style="{fontWeight: file.id === 'back' ? 600 : 400}">{{file.name}}</span>
            </div>
            <div
              class="explorer-col-date"
              v-if="file.id !== 'back'"
            >{{moment(file.update_time).format('YYYY-MM-DD H:mm:ss')}}</div>
            <div
              class="explorer-col-size"
              v-if="file.id !== 'back'"
            >{{file.size ? prettyBytes(file.size) : ""}}</div>
          </div>
        </div>
      </transition>
    </div>

    <div v-if="!has_config" style="width: 100vw;">
      <a-empty>
        <div slot="description">
          OneHub 尚未进行初始化。<a href="/admin/#/init">前往初始化</a>
        </div>
      </a-empty>
    </div>

    <a-modal
      :title="modal.title"
      v-model="modal.visible"
      :footer="null"
      :closable="!modal.loading"
      :maskClosable="!modal.loading"
    >
      <div v-if="!modal.loading">
        <p v-for="item in modal.list" :key="item.name">
          <span style="font-weight: 600;">{{item.name}}：</span>
          {{item.value}}
        </p>
        <a-button @click="modal.button.click" :icon="modal.button.icon">{{modal.button.text}}</a-button>
      </div>
      <div v-else>
        <a-spin>
          <a-icon slot="indicator" type="loading" style="font-size: 24px" spin />
        </a-spin>
      </div>
    </a-modal>
  </div>
</template>

<script>
import consts from "@/consts.js";
import getClassNameForExtension from "font-awesome-filetypes";
const prettyBytes = require("pretty-bytes");
const moment = require("moment");

export default {
  name: "home",
  data() {
    return {
      tree: [],
      replaceFields: {
        children: "folders",
        title: "name",
        key: "id"
      },
      files: {},
      files_list: [],
      selectedKeys: [],
      stat: [],
      modal: {
        visible: false,
        title: "",
        list: [],
        button: {
          icon: "download",
          text: "下载文件",
          click: () => {}
        }
      },
      sortCol: {
        col: "",
        asc: true
      },
      has_config: true
    };
  },
  created() {
    this.$http.get(consts.API_BASE + "/api/v1/public/has-config").then(res => {
      if (res.data.data) {
        this.has_config = true;
        this.selectedKeys = [this.$router.currentRoute.path];
        document.title =
          this.$config.title + " - " + this.$router.currentRoute.path;
        this.$http.get(consts.API_BASE + "/api/v1/public/tree").then(res => {
          this.tree = [res.data.data];
        });
        this.$http
          .post(consts.API_BASE + "/api/v1/public/files", {
            path: this.$router.currentRoute.path
          })
          .then(res => {
            this.files = res.data.data;
            this.files.files = this.files.files ? this.files.files : [];
            this.files.folders = this.files.folders ? this.files.folders : [];
            this.stat = [this.files.files.length, this.files.folders.length];
            if (this.getBackObject()) {
              this.files_list = [
                this.getBackObject(),
                ...this.files.folders,
                ...this.files.files
              ];
            } else {
              this.files_list = [...this.files.folders, ...this.files.files];
            }
          });
      } else {
        this.has_config = false;
      }
    });
  },
  watch: {
    $route(to) {
      document.title = this.$config.title + " - " + to.path;
      this.selectedKeys = [to.path];
      this.sortCol = {
        col: "",
        asc: true
      };

      this.$http
        .post(consts.API_BASE + "/api/v1/public/files", {
          path: to.path
        })
        .then(res => {
          this.files = res.data.data;
          this.files.files = this.files.files ? this.files.files : [];
          this.files.folders = this.files.folders ? this.files.folders : [];
          this.stat = [this.files.files.length, this.files.folders.length];

          if (this.getBackObject()) {
            this.files_list = [
              this.getBackObject(),
              ...this.files.folders,
              ...this.files.files
            ];
          } else {
            this.files_list = [...this.files.folders, ...this.files.files];
          }
        });
    }
  },
  methods: {
    onTreeSelect(e) {
      this.$router.push({
        path: e[0]
      });
    },
    prettyBytes(size) {
      return prettyBytes(size);
    },
    moment(e) {
      return moment(e);
    },
    getIcon(file_name, is_file, is_back) {
      if (is_back) {
        return "arrow-left";
      }
      if (is_file) {
        let icon = getClassNameForExtension(
          file_name.split(".")[file_name.split(".").length - 1]
        );
        icon = icon.replace("fa-", "");
        return icon;
      } else {
        return "folder";
      }
    },
    onFileClick(id, path, is_file) {
      if (is_file) {
        // window.open(consts.API_BASE + "/api/v1/public/download/" + id);
        this.modal = {
          visible: true,
          loading: true
        };
        this.$http
          .get(consts.API_BASE + "/api/v1/public/item/" + id)
          .then(res => {
            let file = res.data.data;
            this.modal = {
              visible: true,
              loading: false,
              title: file.name,
              list: [
                {
                  name: "文件大小",
                  value: this.prettyBytes(file.size)
                },
                {
                  name: "修改时间",
                  value: this.moment(file.lastModifiedDateTime).format(
                    "YYYY-MM-DD H:mm:ss"
                  )
                },
                {
                  name: "文件类型",
                  value: file.file.mimeType
                },
                {
                  name: "文件散列",
                  value: file.file.hashes.quickXorHash
                }
              ],
              button: {
                icon: "download",
                text: "下载文件",
                click: () => {
                  window.open(file["@microsoft.graph.downloadUrl"]);
                }
              }
            };
          });
      } else {
        this.$router.push({ path: path });
      }
    },
    getPath(index) {
      let paths = this.$router.currentRoute.path.split("/");
      let ret = paths.slice(0, index + 1).join("/");
      return ret === "" ? "/" : ret;
    },
    getBackObject() {
      if (this.$router.currentRoute.path === "/") return false;
      let paths = this.$router.currentRoute.path.split("/");
      let parent = paths[paths.length - 2];
      return {
        name: parent === "" ? "根目录" : parent,
        id: "back",
        path: this.getPath(paths.length - 2)
      };
    },
    sort(col) {
      if (this.sortCol.col === col) {
        this.sortCol.asc = !this.sortCol.asc;
      } else {
        this.sortCol = {
          col: col,
          asc: true
        };
      }
      this.doSort();
    },
    doSort() {
      let col = this.sortCol.col;
      this.files_list.sort((a, b) => {
        if (a.id === "back") return -1;
        if (b.id === "back") return 1;
        if (a === undefined) a = 0;
        if (b === undefined) b = 0;
        if (a[col] < b[col]) {
          return this.sortCol.asc ? 1 : -1;
        }
        if (a[col] > b[col]) {
          return this.sortCol.asc ? -1 : 1;
        }
        return 0;
      });
    }
  }
};
</script>

<style lang="less" scoped>
.home {
  display: flex;
  flex-direction: row;
}

.tree-container {
  min-width: 300px;
  padding-right: 20px;
}

.explorer-container {
  flex: 1;
}
.explorer-header {
  background: #f6f6f6;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 2em;
  padding: 0 0.8em;
  font-weight: 500;
}

.explorer-item {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 2em;
  padding: 0 0.8em;
  cursor: pointer;
  transition: 0.3s;
}

.explorer-item:hover {
  background: #f8f8f8;
}

.explorer-item:active {
  background: #efefef;
}

.explorer-col-name {
  flex-grow: 1;
}

.explorer-col-date {
  min-width: 12em;
  width: 12em;
  max-width: 12em;
  flex-grow: 0;
  font-family: "Ubuntu", "Roboto", "Helvetica", "Arial", "sans-serif" !important;
}

@media only screen and (max-width: 850px) {
  .tree-container {
    display: none;
    padding-right: 0 !important;
  }
  .explorer-col-date {
    display: none;
  }
  .explorer-item {
    padding: 0;
  }
}

.explorer-col-size {
  min-width: 6em;
  width: 6em;
  max-width: 6em;
  flex-grow: 0;
  font-family: "Ubuntu", "Roboto", "Helvetica", "Arial", "sans-serif" !important;
}

.bread-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.col-title {
  cursor: pointer;
}

.explorer-wrapper {
  transition: all 0.2s;
}

.explorer-enter, .explorer-leave-to
/* .list-complete-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateX(10px);
}
</style>

<style lang="less">
.ant-modal-mask {
  backdrop-filter: blur(4px);
}
</style>