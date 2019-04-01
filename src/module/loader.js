import Scope from './scope'
import { moduleTag } from '../config'

let moduleLoader = null

const pluginConfig = {}

const modulesMap = {}

const tagName = moduleTag.toUpperCase()

const getParentModule = (node) => {
  let parentNode = node.parentNode
  while (parentNode) {
    if (parentNode.tagName === tagName) {
      return modulesMap[parentNode.getAttribute('path')]
    }
    parentNode = parentNode.parentNode
  }
}

const setLoader = (loader, config) => {
  moduleLoader = loader
  if (config) {
    for (let idx in config) {
      pluginConfig[idx] = config[idx]
    }
  }
}

const loadModule = (path, container) => {
  if (!moduleLoader) {
    return
  }
  let files = moduleLoader(path)
  let plugins = []
  let syncs = files.slice(0, 2)
  if (files.length > 2) {
    for (let i = 2; i < files.length; i++) {
      let file = files[i]
      let type = 'sync'
      if (file.constructor === Promise) {
        syncs.push(file)
        type = 'async'
      }
      plugins.push({
        type,
        file
      })
    }
  }
  return Promise.all(syncs).then((values) => {
    let props = container.getAttribute('c-props')
    if (props) {
      props = JSON.parse(props)
    }
    const Module = values[0].default
    const module = modulesMap[path] = new Module()
    const parentModule = getParentModule(container)
    let data
    if (parentModule) {
      data = parentModule.data.child()
      if (module.data) {
        for (let key in module.data) {
          data[key] = module.data[key]
        }
      }
    } else {
      data = new Scope(module.data)
    }
    module.data = data
    module.props = props
    module.container = container
    module.tpl = values[1].default
    container.module = module
    let offset = 0
    plugins.forEach((pluginObj, i) => {
      if (pluginConfig[i + 2]) {
        let plugin = pluginObj.file
        if (pluginObj.type === 'async') {
          plugin = values[i + 2 - offset].default
        } else {
          offset++
        }
        module[pluginConfig[i + 2]] = plugin
      }
    })
    return module.init()
  })
}

export {
  loadModule,
  setLoader
}