import Scope from './scope'

let moduleLoader = null

const modulesMap = {}

const getParentModule = (node, tagName) => {
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

export default (path, container) => {
  if (!moduleLoader) {
    return
  }
  Promise.all(moduleLoader(path)).then((values) => {
    let props = container.getAttribute('c-props')
    if (props) {
      props = JSON.parse(props)
    }
    const Module = values[0].default
    const module = new Module()
    const parentModule = getParentModule(container, container.tagName)
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
    container.module = module
    modulesMap[path] = module
    module.tpl = values[1].default
    module.init()
  })
}

export {
  setLoader
}
