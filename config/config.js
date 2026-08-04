import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings';
import proxy from './proxy';

const { REACT_APP_ENV } = process.env;
export default defineConfig({
    hash: true,
    history: {
        type: 'hash'
    },
    // initialState: {
    //   currentUser: null,
    // },
    antd: {},
    dva: {
        hmr: true,
    },
    locale: {
        // default zh-CN
        default: 'zh-CN',
        // default true, when it is true, will use `navigator.language` overwrite default
        antd: true,
        baseNavigator: true,
    },
    dynamicImport: {
        loading: '@/components/PageLoading/index',
    },
    targets: {
        ie: 11,
    },
    routes: [
        {
            path: '/user',
            // component: '../layouts/UserLayout',
            routes: [
                // {
                //   path: '/user',
                //   redirect: '/user/login',
                // },
                {
                    name: 'login',
                    path: '/user/login',
                    component: './user/login',
                },
                // {
                //   component: '404',
                // },
            ],
        },
        {
            path: '/',
            component: '../layouts/SecurityLayout',
            routes: [
                {
                    path: '/',
                    component: '../layouts/BasicLayout',
                    routes: [
                        {
                            path: '/',
                            redirect: '/controller/controller/scriptManagement',
                        },

                        {
                            path: 'controller',
                            name: '接口自动化测试',
                            routes: [
                                {
                                    path: 'interfaceManagement',
                                    name: '接口管理',
                                    component: './controller/interfaceManagement'
                                },
                                {
                                    path: 'scriptManagement',
                                    name: '脚本管理',
                                    component: './controller/scriptManagement'
                                },
                                {
                                    path: 'taskList',
                                    name: '任务列表',
                                    component: './controller/taskList'
                                },
                                // {
                                //   path: 'taskExeHistory',
                                //   name: '任务执行历史',
                                //   component: './controller/taskList/taskExeHistory'
                                // },
                                {
                                    path: 'envManagement',
                                    name: '环境管理',
                                    component: './controller/envManagement'
                                },
                                {
                                    path: 'tagManagement',
                                    name: '标签管理',
                                    hideInMenu: true,
                                    component: './controller/tagManagement'
                                },
                                {
                                    path: 'reportDetail',
                                    name: '报告详情',
                                    hideInMenu: true,
                                    component: './controller/scriptManagement/historyWatch'
                                },
                                {
                                    path: '/controller/scriptManagement/newScript',
                                    name: '新增脚本',
                                    hideInMenu: true,
                                    component: './controller/scriptManagement/newScript'
                                },

                                {
                                    path: '/controller/interfaceManagement/newInterface',
                                    name: '新增接口',
                                    hideInMenu: true,
                                    component: './controller/interfaceManagement/newInterface'
                                },
                            ]
                        },
                    ]
                },
            ]
        },
    ],
    theme: {
        // ...darkTheme,
        'primary-color': defaultSettings.primaryColor,
    },
    title: false,
    ignoreMomentLocale: true,
    proxy: proxy[REACT_APP_ENV || 'dev'],
    mock: false,
    manifest: {
        basePath: '/',
    },
    define: {
        'process.env.UMI_ENV': 'dev',
        'process.env.PRIVATE_INSTN_SIT2': 'CN0010011'
    }

});
