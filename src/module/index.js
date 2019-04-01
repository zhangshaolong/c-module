import { moduleTag } from '../config'
import { loadModule, setLoader } from './loader'

const checkCondition = {
  className: (node, value) => {
    return node.classList.contains(value)
  },
  id: (node, value) => {
    return node.getAttribute('id') === value
  },
  rule: (node, value, container) => {
    let items = container.querySelectorAll(value)
    for (let i = 0; i < items.length; i++) {
      if (items[i] === node) {
        return node
      }
    }
  },
  tag: (node, value) => {
    return node.tagName === value.toUpperCase()
  }
}

const loopCheck = (root, target, value, checkFun) => {
  if (target) {
    if (checkFun(target, value, root)) {
      return target
    } else {
      if (target !== root) {
        return loopCheck(root, target.parentNode, value, checkFun)
      }
    }
  }
}

class Module {

  constructor () {
    this.toBeDisposes = []
  }

  init () {
    let events = this.bindEvents()
    if (events) {
      this.delegate(events)
    }
    this.render()
    this.inited()
  }

  inited () {}

  bindEvents () {}

  update () {}

  delegate (events) {
    for (let action in events) {
      let list = events[action]
      if (!Array.isArray(list)) {
        list = [list]
      }
      const fun = (e) => {
        const ele = e.target
        for (let i = 0; i < list.length; i++) {
          const handlerItem = list[i]
          const checkFun = checkCondition[handlerItem.type]
          let target = loopCheck(this.container, ele, handlerItem.value, checkFun)
          if (target) {
            handlerItem.handler.call(this, target, e)
          }
        }
      }
      this.container.addEventListener(action, fun, true)

      this.toBeDisposes.push(() => {
        this.container.removeEventListener(action, fun, true)
      })
    }
  }

  render (data) {
    if (this.tpl) {
      this.container.innerHTML = this.tpl(data || this.data)
    }
  }

  dispose () {
    this.toBeDisposes.forEach((dispose) => {
      dispose()
    })
    this.toBeDisposes.length = 0
  }
}

class CModule extends HTMLElement {
  static get observedAttributes() {
    return ['c-props']
  }

  constructor () {
    super()
    this.attributeChangedTimer = null
  }

  connectedCallback () {
    let path = this.getAttribute('path')
    if (path != null) {
      loadModule(path, this)
    }
  }

  disconnectedCallback () {
    this.module && this.module.dispose()
  }

  attributeChangedCallback(name, oldValue, newValue) {
    clearTimeout(this.attributeChangedTimer)
    this.attributeChangedTimer = setTimeout(() => {
      if (name === 'c-props') {
        if (this.module) {
          let props = newValue
          if (props) {
            props = JSON.parse(newValue)
          }
          this.module.update({
            props
          })
        }
      }
    }, 0)
  }
}

customElements.define(moduleTag, CModule)

export {
  Module,
  setLoader,
  loadModule
}