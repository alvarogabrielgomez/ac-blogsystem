const path = require('path');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
var isDevelopment = process.env.NODE_ENV == 'production' ? false : true;
const TerserPlugin = require("terser-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    app: path.resolve(__dirname, './index.ts'),
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].bundle.css'
    }),
    // new CopyWebpackPlugin({
    //   patterns: [{
    //     from: path.resolve(__dirname, imagesPath),
    //     to: "img" 
    //   }],
    // }),
    new CleanWebpackPlugin(),
  ].concat(HWPConfigPages),
  module: {
    rules: [
      { 
        test: /\.ejs$/, 
        loader: 'ejs-loader',
        options: {
          esModule: false
        } 
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        loader: 'file-loader',
        options: {
          publicPath: 'img',
          outputPath: 'img',
          name: '[name].[ext]',
        },
      },
      // {
      //   test: /\.html$/i,
      //   use: [
      //     {
      //       loader: 'file-loader',
      //       options: {
      //         name: '[name].[ext]',
      //       }
      //     }
      //   ],
      //   exclude: path.resolve(__dirname, './src/index.html')
      // },
      // {
      //   test: /\.(js)$/,
      //   exclude: /node_modules/,
      //   use: ['babel-loader']
      // },
      {
        test: /\.(css|sass|scss)$/,
        use: [
            MiniCssExtractPlugin.loader,
            {
                loader: 'css-loader',
                options: {
                    importLoaders: 2,
                    sourceMap: !isDevelopment ? true : false,
                    url: false
                }
            },
            {
                loader: 'postcss-loader',
                options: {
                    // plugins: () => [
                    //     // require('autoprefixer')
                    // ],
                    sourceMap: !isDevelopment ? true : false
                }
            },
            // Resolve URLs
            // "resolve-url-loader",
            // Compiles Sass to CSS
            {
                loader: 'sass-loader',
                options: {
                    sourceMap: !isDevelopment ? true : false,
                }
            }
        ],
      }
    ]
  },
  resolve: {
    extensions: ['*','.js', '.scss']
  },
  optimization: {
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
        },
      },
      chunks: 'async',
      minChunks: 1,
      minSize: 30000,
      name: true
    },
    minimize: !isDevelopment ? false : true,
    minimizer: [new TerserPlugin()],
},
devtool:'source-map',
}