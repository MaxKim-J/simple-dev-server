import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import { createRequire } from 'node:module';
import { Configuration } from 'webpack';

const swcLoaderEntry = createRequire(import.meta.url).resolve('swc-loader');

interface Params {
  entry: string;
}

export const getWebpackConfig = ({ entry }: Params): Configuration => ({
  mode: 'development',
  entry,
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  optimization: {
    minimize: false,
    runtimeChunk: {
      name: 'runtime',
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: swcLoaderEntry,
        exclude: /node_modules/,
        options: {
          jsc: {
            transform: {
              react: {
                runtime: 'automatic',
              },
            },
            target: 'es2017',
            parser: {
              syntax: 'typescript',
              jsx: true,
            },
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      hash: false,
    }),
    new CopyPlugin({
      patterns: [{ from: './public/favicon.ico', to: 'favicon.ico' }],
    }),
  ],
});
