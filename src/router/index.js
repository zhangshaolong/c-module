import { loaderModule } from '../module/loader'

const getQueryString = (queryStr) => {
  const querys = {}
  queryStr.replace(/(?:\?|&)([^=]+)=([^&$]*)/g, (all, key, val) => {
    querys[key] = decodeURIComponent(val)
  })
  return querys
}

const dealRedirect = (pathMap, path) => {
  let modulePath = pathMap[path]
  if (modulePath) {
    if (pathMap[modulePath]) {
      return pathMap[modulePath]
    }
  }
  return modulePath
}

const watches = []

const Router = {
  querys: {},
  start: (pathMap, rootModule) => {
    window.addEventListener('hashchange', (e) => {
      let hash = window.location.hash
      if (!hash) {
        hash = '#/' // reset to root path
      }
      let pair = hash.slice(1).split('?')
      let querys = getQueryString('?' + pair[1])
      let path = pair[0]
      let modulePath = dealRedirect(pathMap, path)
      if (!modulePath) {
        modulePath = pathMap['404']
      }
      if (modulePath) {
        Router.querys = querys
        let oldPath = rootModule.getAttribute('path')
        rootModule.setAttribute('path', modulePath)
        if (oldPath !== modulePath) {
          rootModule.module && rootModule.module.dispose()
          loaderModule(modulePath, rootModule)
        } else {
          rootModule.module.update({
            querys
          })
        }
        watches.forEach((watcher) => {
          watcher(modulePath, oldPath)
        })
      } else {
        // 404
        console.log('404')
      }
    }, false)
    const evt = document.createEvent('HTMLEvents')
    evt.initEvent('hashchange', true, true)
    window.dispatchEvent(evt)
  },
  watch: (watcher) => {
    watches.push(watcher)
  }
}

export {
  Router
}