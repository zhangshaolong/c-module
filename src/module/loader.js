import Scope from './scope'
import { moduleTag } from '../config'

let moduleLoader = null

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

const setLoader = (loader) => {
  moduleLoader = loader
}

const loadModule = (path, container) => {
  if (!moduleLoader) {
    return
  }
  return Promise.all(moduleLoader(path)).then((values) => {
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
    return module.init()
  })
}

export {
  loadModule,
  setLoader
}
