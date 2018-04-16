var webpack = require('webpack');
var fs = require('fs');
var path = require('path');

module.exports = (config) => {
    var nodeModules = {};
    var includeModules = ['.bin'];

    fs
    .readdirSync(path.resolve(__dirname, 'node_modules'))
    .filter(x => includeModules.indexOf(x) === -1)
    .forEach(mod => nodeModules[mod] = `commonjs ${mod}`);

    config.set({
        basePath: '',
        frameworks: ['jasmine'],

        plugins: [
          require('karma-jasmine'),
          require('karma-webpack'),
        //   require('karma-jasmine-html-reporter')
        //   require('karma-chrome-launcher'),
          require('karma-phantomjs-launcher')
        ],

        // customLaunchers: {
        //   // From the CLI. Not used here but interesting
        //   // chrome setup for travis CI using chromium
        //   Chrome_travis_ci: {
        //     base: 'Chrome',
        //     flags: ['--no-sandbox']
        //   }
        // },

        files: [
            {
                pattern: 'src/Test/**/*Test.ts',
                watched: false
            }
        ],

        exclude: [
            "node_modules"
        ],
    
        preprocessors: {
            'src/Test/**/*Test.ts': [ 'webpack' ]
        },
    
        webpack: {
            // externals: nodeModules,
            mode: 'development',
            // devtool: 'inline-source-map',
            resolve: {
                extensions: ['.ts', '.tsx', '.js', '.json', '.gql'],
                alias: {
                    '~': path.resolve(__dirname, 'src'),
                    'reiso': path.resolve(__dirname, '../../build'),
                    node_modules: path.resolve(__dirname, 'node_modules')
                },
                modules: [
                    path.resolve(__dirname, '../../node_modules'),
                    path.resolve(__dirname, 'node_modules')
                ]
            },
            target: 'node',
            node: {
                console: false,
                process: false,
                child_process: false,
                global: false,
                buffer: false,
                crypto: false,
                __filename: false,
                __dirname: false
            },
            module: {
                rules: [
                    {
                        test: /\.json$/,
                        loaders: [
                            'json-loader'
                        ]
                    },
                    {
                        test: /\.gql$/,
                        loader: 'graphql-tag/loader'
                    },
                    {
                        test: /\.(tsx|ts)$/,
                        loader: 'ts-loader',
                    },
                    {
                        test: /\.svg$/,
                        loaders: 'raw-loader'
                    }
                ]
            },
            plugins: [
                new webpack.EnvironmentPlugin({
                    'MODE': 'server'
                }),
                new webpack.SourceMapDevToolPlugin({
                    filename: null, // if no value is provided the sourcemap is inlined
                    test: /\.(ts|js)($|\?)/i, // process .js and .ts files only
                    exclude: [ /node_modules/ ]
                })
            ]
        },
    
        webpackMiddleware: {
            // stats: 'errors-only'
        },

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['PhantomJS'],
        port: 9876,

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],
        // colors: true,

        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        // logLevel: config.LOG_INFO,

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneous
        // concurrency: Infinity
    })
}