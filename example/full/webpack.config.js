var webpack = require('webpack');
var fs = require('fs');
var path = require('path');
var { execSync } = require('child_process');

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var GitRevisionPlugin = require('git-revision-webpack-plugin');
// var CopyWebpackPlugin = require('copy-webpack-plugin');

class BeforeWatchPlugin {
    constructor(arr) {
        if (!Array.isArray(arr)) {
            throw Error('BeforeWatchPlugin: The argument should be an array!')
        }
        this.arr = arr;
    }

    apply(compiler) {
        compiler.hooks.watchRun.tapPromise('BeforeWatchPlugin', compiler => new Promise(resolve => {
            this.arr.forEach(str => execSync(str, { stdio: 'inherit' }));
            resolve();
        }))
    }
}

module.exports = function(env) {
    var gitRevisionPlugin = new GitRevisionPlugin();

    var packages = env && env.packages && env.packages.split(',');
    var isProd = env && env.prod;
    var isApp = env && env.app;
    var isMaps = (env && env.maps) ? 'source-map' : false;

    var arr = [];

    if (((packages && packages.indexOf('client') >= 0) || !packages)) arr.push(
        {
            mode: isProd ? 'production' : 'development',
            entry: {
                js: ['babel-polyfill', 'reflect-metadata', path.resolve(__dirname, 'src', 'Entry', 'Client.ts')]
            },
            output: {
                devtoolModuleFilenameTemplate: function(info) {                    
                    if (info.shortIdentifier.charAt(0) === '/') {
                        return 'file://' + info.shortIdentifier;
                    } else {
                        return 'file:///' + info.shortIdentifier;
                    }
                },
                devtoolFallbackModuleFilenameTemplate: function(info) {
                    if (info.shortIdentifier.charAt(0) === '/') {
                        return 'file://' + info.shortIdentifier + '?' + info.hash;
                    } else {
                        return 'file:///' + info.shortIdentifier + '?' + info.hash;
                    }
                },
                sourceMapFilename: 'index.js.map',
                path: isProd ? path.resolve(__dirname, isApp ? 'build/raw' : 'dist', 'public') : path.resolve(__dirname, 'dev', 'public'),
                filename: 'index.js'
            },
            resolve: {
                extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js', '.json', '.less', '.css', '.svg'],
                alias: {
                    '~': path.resolve(__dirname, 'src'),
                    'reiso': path.resolve(__dirname, '../../build'),
                    node_modules: path.resolve(__dirname, 'node_modules')
                },
                modules: [
                    path.resolve(__dirname, '../../node_modules'),
                    path.resolve(__dirname, 'node_modules')
                ],
                mainFields: ['browser', 'main', 'module'],
            },
            target: 'web',
            module: {
                rules: [
                    {
                        test: /\.(tsx|ts)$/,
                        loaders: [
                            'babel-loader',
                            'ts-loader'
                        ]
                    },
                    {
                        test: /\.gql$/,
                        loaders: 'graphql-tag/loader'
                    },
                    {
                        test: /\.json$/,
                        loaders: 'json-loader'
                    },
                    {
                        test: /\.svg$/,
                        loaders: 'raw-loader'
                    }
                ]
            },
            devtool: isProd ? isMaps : 'inline-source-map',
            plugins: [
                new webpack.NoEmitOnErrorsPlugin(),
                new webpack.ProvidePlugin({
                    $: 'jquery',
                    jQuery: 'jquery',
                    'window.jQuery': 'jquery'
                }),
                new webpack.EnvironmentPlugin({
                    'MODE': 'client',
                    // 'NODE_ENV': isProd ? 'production' : 'development'
                }),
                // new BeforeWatchPlugin(["node ../../composer.js outDir ./src/Composer dir ./src/Modules incDir '~/Modules' type ts Client"])
            ].concat(isProd ? (isMaps ? [
                // To Prod
                new webpack.BannerPlugin({
                    banner: 'require("source-map-support").install();',
                    raw: true,
                    entryOnly: false
                }),
            ] : []) : [
                // To Dev
                new webpack.WatchIgnorePlugin([
                    /Composer\/.*$/,
                ])
            ])
        }
    );

    if (((packages && packages.indexOf('style') >= 0) || !packages)) arr.push(
        {
            mode: isProd ? 'production' : 'development',
            entry: {
                index: path.resolve(__dirname, 'src', 'Styles', 'index.pcss'),
                light: path.resolve(__dirname, 'src', 'Styles', 'Themes', 'Light', 'index.pcss'),
                dark: path.resolve(__dirname, 'src', 'Styles', 'Themes', 'Dark', 'index.pcss'),
            },
            output: {
                path: isProd ? path.resolve(__dirname, isApp ? 'build/raw' : 'dist', 'public') : path.resolve(__dirname, 'dev', 'public'),
                filename: '[name].css'
            },
            resolve: {
                extensions: ['.css', '.less', '.scss', '.sass', '.pcss'],
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
            target: 'web',
            module: {
                rules: [
                    {
                        test: /\.(gif|png|jpg|jpeg|svg|ico)($|\?)/,
                        loaders: ['file-loader?&name=images/[name].[ext]']
                    },
                    {
                        test: /\.(woff|woff2|eot|ttf)($|\?)/,
                        loaders: ['file-loader?&name=fonts/[name].[ext]']
                    },
                    // {
                    //     test : /\.less$/,
                    //     use: ExtractTextPlugin.extract({
                    //         fallback: 'style-loader',
                    //         use: [{
                    //             loader: 'css-loader',
                    //             options: {
                    //                 sourceMap: false,
                    //                 discardDuplicates: true,
                    //                 discardComments: {
                    //                     removeAll: true
                    //                 }
                    //             }
                    //         }, {
                    //             loader: 'less-loader',
                    //             options: {
                    //                 sourceMap: false,
                    //             }
                    //         }]
                    //     })
                    // },
                    {
                        test : /\.pcss$/,
                        exclude: /node_modules/,
                        use: ExtractTextPlugin.extract({
                            fallback: 'style-loader',
                            use: [{
                                loader: 'css-loader',
                                options: {
                                    // sourceMap: false,
                                    // discardDuplicates: true,
                                    // discardComments: {
                                    //     removeAll: true
                                    // },
                                    // modules: true,
                                    importLoaders: 1
                                    // localIdentName:'[name]__[local]___[hash:base64:5]'
                                }
                            }, {
                                loader: 'postcss-loader',
                                options: {
                                    // sourceMap: true,
                                    ident: 'postcss',
                                    plugins: loader => [
                                        require('postcss-import'),
                                        // require('postcss-variables'),
                                        // require('postcss-nested-vars'),
                                        require('postcss-custom-properties')({
                                            strict: false,
                                            preserve: true,
                                            appendVariables: true,
                                            warnings: false
                                        }),
                                        // require('postcss-css-variables'),
                                        require('postcss-advanced-variables')({
                                            unresolved: 'ignore' // ignore unresolved variables
                                        }),
                                        require('postcss-apply'),
                                        // require('postcss-cssnext')({
                                        //     features: {
                                        //         customProperties: {
                                        //             warnings: false
                                        //         },
                                        //     }
                                        // }),
                                        require('postcss-nested'),
                                        require('postcss-calc')({
                                            // warnWhenCannotResolve: true
                                        }),
                                        require('postcss-pseudoelements'),
                                        require('pixrem'),
                                        require('autoprefixer'),
                                        require('postcss-url'),
                                        // require('cssnano'),
                                    ]
                                    // plugins: {
                                    //     'postcss-import': {},
                                    //     'postcss-cssnext': {
                                    //         browsers: ['last 2 versions', '> 5%'],
                                    //     },
                                    //     'autoprefixer': {},
                                    // },
                                }
                            }]
                        })
                    }
                ]
            },
            plugins: [
                new webpack.NoEmitOnErrorsPlugin(),
                new ExtractTextPlugin({
                    filename: '[name].css',
                    allChunks: true
                }),
                // new BeforeWatchPlugin(["node ../../composer.js outDir ./src/Composer dir ./src incDir '..' type pcss Components Modules"])
            ].concat(isProd ? [] : [
                // To Dev
                new webpack.WatchIgnorePlugin([
                    /Composer\/.*$/,
                ])
            ])
        }
    );

    return arr;
}