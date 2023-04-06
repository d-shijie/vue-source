const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
module.exports = {
  entry: './vue/index.js', // 打包对入口文件，期望打包对文件入口
  output: {
    filename: 'bundle.js', // 输出文件名称
    path: path.resolve(__dirname, 'dist'), //获取输出路径
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: false, // 此配置最重要，无此配置无法删除声明注释
          },
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ], // 替换js压缩默认配置
  },
  mode: 'development', // 整个mode 可以不要，模式是生产坏境就是压缩好对，这里配置开发坏境方便看生成对代码
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts'], // 解析对文件格式
  },
  devtool: false,
}
