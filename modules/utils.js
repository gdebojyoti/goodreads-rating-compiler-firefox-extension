export function waitForElementToLoad (selector, { timeout, gap } = { timeout: 10000, gap: 200 }) {
  return new Promise((resolve, reject) => {
    let timer = setTimeout(() => {
      reject('Element failed to load within ' + timeout / 1000 + ' seconds')
    }, timeout)

    // check if element has been generated every 
    let interval = setInterval(() => {
      const elm = document.querySelector(selector)
      if (elm) {
        clearInterval(interval)
        interval = null

        clearTimeout(timer)
        timer = null

        resolve()
      }
    }, gap)
  })
}