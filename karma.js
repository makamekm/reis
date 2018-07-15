var path = require('path');

const host = process.argv[process.argv.length - 4];
const port = process.argv[process.argv.length - 3];
const portWS = process.argv[process.argv.length - 2];
const pattern = process.argv[process.argv.length - 1];

module.exports = (config) => {
    config.set({
        // basePath: '',
        singleRun: true,
        frameworks: ['jasmine', 'karma-typescript'],
        reporters: ['progress', 'karma-typescript'],
        // frameworks: ['jasmine'],
        // reporters: ['progress'],

        plugins: [
            require('karma-jasmine'),
            require('karma-typescript'),
            require('karma-chrome-launcher'),
            // require('karma-webpack'),
            // require('karma-phantomjs-launcher'),
            // require('karma-sourcemap-loader')
        ],
        
        preprocessors: {
            '**/*.+(ts|tsx)': ['karma-typescript']
            // '**/*.+(ts|tsx)': ['webpack']
        },

        client: {
            port,
            host,
            portWS
        },

        files: [
            // './node_modules/babel-polyfill/dist/polyfill.js',
            // './node_modules/reflect-metadata/Reflect.js',
            {
                pattern: `./src/Test/Component/${pattern}.test.+(ts|tsx)`,
                watched: false
            }
        ],

        // exclude: [
        //     '**/node_modules/**/*',
        // ],

        logLevel: config.LOG_ERROR,

        // webpack: {
        //     mode: 'development',
        //     output: {
        //         devtoolModuleFilenameTemplate: info => {
        //             if (info.absoluteResourcePath.charAt(0) === '/') {
        //                 return 'file://' + info.absoluteResourcePath;
        //             } else {
        //                 return 'file:///' + info.absoluteResourcePath;
        //             }
        //         },
        //         devtoolFallbackModuleFilenameTemplate: info => {
        //             if (info.absoluteResourcePath.charAt(0) === '/') {
        //                 return 'file://' + info.absoluteResourcePath + '?' + info.hash;
        //             } else {
        //                 return 'file:///' + info.absoluteResourcePath + '?' + info.hash;
        //             }
        //         }
        //     },
        //     // devtool: 'inline-source-map',
        //     resolve: {
        //         extensions: ['.ts', '.tsx', '.js'],
        //         mainFields: ['browser', 'main', 'module'],
        //     },
        //     module: {
        //         rules: [
        //             {
        //                 test: /\.tsx?$/,
        //                 exclude: /\/node_modules\//,
        //                 loaders: [
        //                     'babel-loader',
        //                     'ts-loader'
        //                 ]
        //             },
        //             {
        //                 test: /\.js$/,
        //                 loader: 'babel-loader',
        //                 exclude: /\/node_modules\//
        //             },
        //         ]
        //     },
        //     plugins: [
        //         new webpack.ProvidePlugin({
        //             $: 'jquery',
        //             jQuery: 'jquery',
        //             'window.jQuery': 'jquery'
        //         }),
        //         new webpack.EnvironmentPlugin({
        //             'MODE': 'client'
        //         }),
        //         new webpack.SourceMapDevToolPlugin({
        //             filename: null,
        //             test: /\.(ts|tsx|js)($|\?)/i,
        //             exclude: [/node_modules/]
        //         })
        //     ]
        // },

        // webpackMiddleware: {
        //     stats: 'errors-only'
        // },

        karmaTypescriptConfig: {
            tsconfig: "./tsconfig.karma.json",
            reports: {
                "cobertura": null,
                "html": null,
                "text-summary": null
            },
            // include: [
            //     'src/**/*.ts',
            //     'src/**/*.tsx',
            // ],
            bundlerOptions: {
            //     entrypoints: /\.test\.(ts|tsx)$/i,
                resolve: {
                    extensions: [".ts", ".tsx"],
                    directories: ["node_modules"]
                },
            //     // sourceMap: true,
            //     transforms: [
            //         require("karma-typescript-es6-transform")({
            //             presets: [
            //                 ["env", {
            //                     targets: {
            //                         chrome: "60"
            //                     }
            //                 }]
            //             ]
            //         })
            //     ]
            }
        },
        
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