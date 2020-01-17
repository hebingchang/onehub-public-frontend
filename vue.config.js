module.exports = {
  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          'primary-color': '#222',
          'link-color': '#222',
          'border-radius-base': '1px',
        },
        javascriptEnabled: true
      }
    }
  },
  publicPath: process.env.NODE_ENV === 'production' ? '/drive' : '/'
}