export default {
    dev: {
        '/api': {
            //  target: 'https://preview.pro.ant.design',
            target: 'http://10.240.37.120:9999',//.陈育爽
            // target: 'http://10.212.53.105:9818',//.韦宪哲
            // target: 'http://10.212.53.105:9818',//.陈育爽
            // target: 'http://10.251.166.133:8088/', //徐祥章环境
            // target: 'http://10.251.166.136:8080/', //王朋龙环境
            // target: 'http://10.240.131.212:8080/', //212环境
            //  target: 'http://10.251.44.141:9999',// 费云凯
            // target: 'http://10.208.152.130:9818',//.杨凯
            // target: 'http://10.212.53.172:9999',//.宪哲新ip

            changeOrigin: true,
            pathRewrite: {
                '^/api': '',
            },
        },
        '/uat': {
            target: 'http://10.240.37.120:9999',//.陈育爽git
            // target: 'http://10.212.53.105:9999',//.韦宪哲
            // target: 'http://10.212.53.105:9818',//.陈育爽
            // target: 'http://10.251.166.133:8088/', //徐祥章环境
            // target: 'http://10.251.166.136:8080/', //王朋龙环境
            // target: 'http://10.240.131.212:8080/', //212环境
            //  target: 'http://10.251.44.141:9999',// 费云凯
            // target: 'http://10.208.152.130:9818',//.杨凯
            // target: 'http://10.212.53.172:9999',//.宪哲新ip

            changeOrigin: true,
            pathRewrite: {
                '^/uat': '',
            },
        },
        '/testPoint': {
            target: 'http://10.208.24.12:9818',//.正式
            // target: 'http://10.208.146.24:9818',//.袁海军
            // target: 'http://10.208.24.14:9818',//.陈育爽
            // target: 'http://10.208.152.9:9818',//.杨凯
            // target: 'http://10.208.152.9:8518',//.杨凯
            // target: 'http://10.212.53.105:9818',//.正式
            // target: 'http://10.212.53.105:9818',//.正式
            // target: 'http://10.212.53.172:9818',//.宪哲
            // target: 'http://10.212.53.172:9818',//.宪哲新ip
            // target: 'http://10.208.153.30:9818',//.周圣杰
            // target: 'http://10.212.50.159:9818',//.路彬
            changeOrigin: true,
            pathRewrite: {
                '^/testPoint': '',
            },
        },
        '/graphRag': {
            target: 'http://10.240.65.186:8000',//.生产
            // target: 'http://10.212.53.172:8000',//.宪哲新ip

            changeOrigin: true,
            pathRewrite: {
                '^/graphRag': '',
            },
        },

        '/API': {
            target: 'http://10.208.24.14:8515',//.正式
            // target: 'http://10.208.159.45:8517',//.刘宣
            // target: 'http://10.212.50.174:8515',//.路彬
            // target: 'http://10.212.50.159:8515',//.路彬
            // target: 'http://10.251.166.142:8001',//.柴嘉欣
            // target: 'http://10.208.146.24:8515',//.袁海军
            // target: 'http://10.208.152.97:8515',//.钟镇涛
            // target: 'http://10.208.146.16:8515',//.田飞雄
            // target: 'http://10.208.152.97:8518',//.杨凯
            // target: 'http://10.212.54.56:8515',//.赵婷
            // target: 'http://10.208.150.210:8519',//.燕青云
            // target: 'http://10.208.158.145:8515',//.彭勇
            // target: 'http://10.212.59.9:8515',//.黄新云
            // target: 'http://10.208.150.104:8515',//.黄新云
            // target: 'http://10.212.53.172:9818',//.宪哲
            // target: 'http://10.208.158.117:8515',//.卢晓东
            // target: 'http://10.208.150.184:8518',//.卢晓东
            // target: 'http://10.208.150.143:8517',//.黄新云
            // target: 'http://10.212.50.93:8515',//.yby
            //      target: 'http://10.212.51.224:8515',//.wh

            changeOrigin: true,
            pathRewrite: {
                '^/API': '',
            },
        },
        '/ATPM': {
            target: 'http://10.240.192.142:8020',
            // target: 'http://10.212.53.105:9818',//.陈育爽

            changeOrigin: true,
            pathRewrite: {
                '^/ATPM': '',
            }
        },
        '/wannaPub': {
            target: 'http://10.208.24.12:8081',
            // target: 'http://10.212.8.59:8081',
            // target: 'http://10.212.53.105:9818',//.陈育爽

            changeOrigin: true,
            pathRewrite: {
                '^/wannaPub': '',
            }
        },
        '/wannaPri': {
            target: 'http://10.208.24.12:8082',
            // target: 'http://10.212.8.59:8081',
            // target: 'http://10.212.53.105:9818',//.陈育爽

            changeOrigin: true,
            pathRewrite: {
                '^/wannaPri': '',
            }
        },
        '/wannaATPM': {
            target: 'http://10.208.24.12:8099',
            // target: 'http://10.212.8.59:8081',
            // target: 'http://10.212.53.105:9818',//.陈育爽

            changeOrigin: true,
            pathRewrite: {
                '^/wannaATPM': '',
            }
        },
        '/wannaTestPoint': {
            target: 'http://10.208.152.118:8519',
            changeOrigin: true,
            pathRewrite: {
                '^/wannaTestPoint': '',
            }
        },

        '/database': {
            // target: 'http://10.208.24.12:8518',//.正式
            // target: 'http://10.208.24.12:8581',//.正式
            // target: 'http://10.208.159.45:8517',//.刘宣
            // target: 'http://10.212.50.159:8518',//.路彬
            // target: 'http://10.212.8.54:8518',//.路彬 win10
            // target: 'http://10.251.166.142:8001',//.柴嘉欣
            // target: 'http://10.208.146.91:8515',//.袁海军
            // target: 'http://10.208.152.97:8518',//.钟镇涛
            // target: 'http://10.208.150.184:8518',//.卢晓东
            // target: 'http://10.208.152.130:8518',//.杨凯
            //   target: 'http://10.208.152.118:8518',//.杨凯新
            // target: 'http://10.208.152.118:8519',//.杨凯 门禁本地
            target: 'http://172.20.10.2:8518',//.杨凯
            // target: 'http://10.208.150.184:8518',//.卢晓东
            // target: 'http://10.208.150.143:8518',//.黄新云
            changeOrigin: true,
            pathRewrite: {
                '^/database': '',
            },
        },


        '/AI': {
            target: 'http://10.208.24.12:8520',//.正式
            // target: 'http://10.208.159.45:8520',//.刘宣
            // target: 'http://10.212.50.174:8520',//.路彬
            // target: 'http://10.251.166.142:8520',//.柴嘉欣
            // target: 'http://10.208.146.91:8520',//.袁海军
            // target: 'http://10.208.152.42:8520',//.钟镇涛
            // target: 'http://10.208.146.16:8520',//.田飞雄
            // target: 'http://10.208.152.130:8520',//.杨凯
            // target: 'http://10.212.8.59:8520',//.杨凯 新
            // target: 'http://10.208.152.118:8518',//.杨凯新
            changeOrigin: true,
            timeout: 1000 * 60 * 10,
            pathRewrite: {
                '^/AI': '',
            },
        },

        '/fileServer': {
            target: 'http://10.240.105.87:9998',//.正式
            changeOrigin: true,
            pathRewrite: {
                '^/fileServer': '',
            },
        },

        '/crms': {
            target: 'http://10.208.24.14:8511',//.正式
            // target: 'http://10.212.59.156:8515/', //燕青云
            // target: 'http://10.208.152.130:8515',//.杨凯 8515
            // target: 'http://10.208.152.130:8511',//.杨凯
            // target: 'http://10.251.177.142:8511',//.黄新云
            // target: 'http://10.208.146.91:8511',//.袁海军
            // target: 'http://0.0.0.0:8515',//.袁海军
            // target: 'http://10.251.160.110:8511',//.张阳
            changeOrigin: true,
            pathRewrite: {
                '^/crms': '',
            },
        },
        // 10.208.152.42:8512
        '/cur': {
            target: 'http://10.208.24.14:8512',//.正式
            // target: 'http://10.208.152.42:8512',
            // target: 'http://10.245.193.23:30012',
            changeOrigin: true,
            pathRewrite: {
                '^/cur': '',
            },
        },
        '/conditions': {
            target: 'http://10.208.24.14:9577',//.正式
            // target: 'http://10.251.174.44:8001',//.路彬
            // target: 'http://10.208.146.91:9577',//.袁海军
            changeOrigin: true,
            pathRewrite: {
                '^/conditions': '',
            },
        },
        '/ist': {
            target: 'http://10.208.24.14:11201',//.正式
            // target: 'http://10.251.174.44:8001',//.路彬
            // target: 'http://10.212.50.174:8001',//.路彬
            changeOrigin: true,
            pathRewrite: {
                '^/ist': '',
            },
        },
        '/esb': {
            target: 'http://10.208.202.34:9090',//.正式
            // target: 'http://10.208.202.34:9090',//.路彬
            changeOrigin: true,
            pathRewrite: {
                '^/esb': '',
            },
        },
        '/capacity': {
            target: 'http://10.240.37.120:8866',//.正式
            changeOrigin: true,
            pathRewrite: {
                '^/capacity': '',
            },
        },
        '/server01': {
            target: 'http://10.251.160.135:19876',
            changeOrigin: true,
            pathRewrite: {
                '^/server01': '',
            }
        },
        '/server02': {
            target: 'http://10.208.151.142:19876',
            changeOrigin: true,
            pathRewrite: {
                '^/server02': '',
            }
        },
        '/server03': {
            target: 'http://10.251.176.77:19876',
            changeOrigin: true,
            pathRewrite: {
                '^/server03': '',
            }
        },
        '/server04': {
            target: 'http://10.251.176.76:19876',
            changeOrigin: true,
            pathRewrite: {
                '^/server04': '',
            }
        },
        '/server05': {
            target: 'http://10.251.161.46:19876',
            changeOrigin: true,
            pathRewrite: {
                '^/server05': '',
            }
        },
        '/server06': {
            target: 'http://10.212.6.59:19876',
            changeOrigin: true,
            pathRewrite: {
                '^/server06': '',
            }
        },
        '/server07': {
            target: 'http://10.212.6.23:19876',
            changeOrigin: true,
            pathRewrite: {
                '^/server06': '',
            }
        },
        '/server08': {
            target: 'http://10.212.6.26:19876',
            changeOrigin: true,
            pathRewrite: {
                '^/server06': '',
            }
        },

    },
    test: {
        '/api/': {
            target: 'https://preview.pro.ant.design',
            changeOrigin: true,
            pathRewrite: {
                '^': '',
            },
        },
    },
    pre: {
        '/api/': {
            target: 'your pre url',
            changeOrigin: true,
            pathRewrite: {
                '^': '',
            },
        },
    },
};
