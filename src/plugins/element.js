import Vue from 'vue'
import { Button, Form, FormItem,
  Input, Message, Container, Header, Aside, Main,
  Menu, Submenu, MenuItem, Breadcrumb, BreadcrumbItem, Card,
  Row, Col, Table, TableColumn, Switch, Tooltip, Pagination, Dialog,
  MessageBox, Tag, Tree, Select, Option, Cascader, Alert,
  Tabs, TabPane, Steps, Step, CheckboxGroup, Checkbox, Upload } from 'element-ui'
import lang from 'element-ui/lib/locale/lang/zh-TW'
import locale from 'element-ui/lib/locale'

locale.use(lang)
// 全局掛載,在html中使用
Vue.use(Button, Form, FormItem)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItem)
// Vue.use(MenuItemGroup)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Row)
Vue.use(Col)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)
Vue.use(Tag)
Vue.use(Tree)
Vue.use(Select)
Vue.use(Option)
Vue.use(Cascader)
Vue.use(Alert)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Steps)
Vue.use(Step)
Vue.use(CheckboxGroup)
Vue.use(Checkbox)
Vue.use(Upload)
Vue.prototype.$message = Message// 全局掛載,在javascrip中使用
Vue.prototype.$confirm = MessageBox.confirm// 全局掛載,在javascrip中使用
