var path = require('path');
var webpack = require('webpack');

const host = process.argv[process.argv.length - 4];
const port = process.argv[process.argv.length - 3];
const portWS = process.argv[process.argv.length - 2];
const pattern = process.argv[process.argv.length - 1];

module.exports = (config) => {
    config.set({
        basePath: '',
        singleRun: true,
        // frameworks: ['jasmine', 'karma-typescript'],
        // reporters: ['progress', 'karma-typescript'],
        frameworks: ['jasmine'],
        // reporters: ['coverage-istanbul', 'progress'],
        reporters: ['progress'],
        // coverageIstanbulReporter: {
        //   reports: [ 'text-summary' ],
        //   fixWebpackSourcePaths: true
        // },

        plugins: [
            require('karma-jasmine'),
            // require('karma-typescript'),
            require('karma-chrome-launcher'),
            require('karma-webpack'),
            // require('karma-phantomjs-launcher'),
            // require('karma-sourcemap-loader'),
            // require('karma-coverage-istanbul-reporter')
        ],
        
        preprocessors: {
            // '**/*.+(ts|tsx)': ['karma-typescript']
            './src/Test/Client/**/*.+(ts|tsx)': ['webpack']
        },

        client: {
            port,
            host,
            portWS
        },

        files: [
            // './node_modules/babel-polyfill/dist/polyfill.js',
            // './node_modules/reflect-metadata/Reflect.js',
            `./src/Test/Client/${pattern}.+(ts|tsx)`
        ],

        // exclude: [
        //     '**/node_modules/**/*',
        // ],

        logLevel: config.LOG_ERROR,

        webpack: {
            // mode: 'development',
            devtool: 'inline-source-map',
            resolve: {
                extensions: ['.ts', '.tsx', '.js'],
                mainFields: ['browser', 'main', 'module']
            },
            module: {
                rules: [
                    {
                        test: /\.(tsx|ts)$/,
                        exclude: /\/node_modules\//,
                        loaders: [
                            // 'istanbul-instrumenter-loader',
                            'babel-loader',
                            'ts-loader'
                        ]
                    },
                    {
                        test: /\.js$/,
                        loader: 'babel-loader',
                        exclude: /\/node_modules\//
                    },
                ]
            },
            plugins: [
                // new webpack.ProvidePlugin({
                //     $: 'jquery',
                //     jQuery: 'jquery',
                //     'window.jQuery': 'jquery'
                // }),
                // new webpack.EnvironmentPlugin({
                //     'MODE': 'client'
                // }),
                // new webpack.SourceMapDevToolPlugin({
                //     filename: null,
                //     test: /\.(ts|tsx|js)($|\?)/i,
                //     exclude: [/node_modules/]
                // })
            ]
        },

        webpackMiddleware: {
            stats: 'errors-only',
            noInfo: true
        },

        // karmaTypescriptConfig: {
        //     tsconfig: "./tsconfig.karma.json",
        //     reports: {
        //         "cobertura": null,
        //         "html": null,
        //         "text-summary": null
        //     },
        //     // include: [
        //     //     'src/**/*.ts',
        //     //     'src/**/*.tsx',
        //     // ],
        //     bundlerOptions: {
        //     //     entrypoints: /\.test\.(ts|tsx)$/i,
        //         resolve: {
        //             extensions: [".ts", ".tsx"],
        //             directories: ["node_modules"]
        //         },
        //     //     // sourceMap: true,
        //     //     transforms: [
        //     //         require("karma-typescript-es6-transform")({
        //     //             presets: [
        //     //                 ["env", {
        //     //                     targets: {
        //     //                         chrome: "60"
        //     //                     }
        //     //                 }]
        //     //             ]
        //     //         })
        //     //     ]
        //     }
        // },
        
        // browsers: ['PhantomJS'],
        browsers: ['ChromeHeadless'],
        port: 9876,

        customLaunchers: {
            ChromeHeadless: {
                base: 'Chrome',
                flags: [
                    '--headless',
                    '--disable-gpu',
                    '--no-sandbox',
                    '--remote-debugging-port=9222',
                    '--disable-web-security'
                ],
                debug: true
            }
        }
    })
}