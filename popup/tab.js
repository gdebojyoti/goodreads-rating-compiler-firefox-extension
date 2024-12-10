function waitForElementToLoad (selector, { timeout, gap } = { timeout: 10000, gap: 200 }) {
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

(async function () {
  const name = document.getElementById("item-name-title").innerText

  const priceElmSelector = ".pciItemRowEven td:nth-of-type(5)"
  
  await waitForElementToLoad(priceElmSelector)

  const firstRow = document.querySelector(priceElmSelector)
  if (!firstRow) {
    return 'Element not found'
  }

  const splittedAndTrimmedText = firstRow.textContent.replace(/\\n|\\t|\\r/g, '').split(' ')

  // Ensure that the second part contains the numeric value
  const amount = splittedAndTrimmedText[0] + ' ' + (splittedAndTrimmedText[1] ? JSON.stringify(splittedAndTrimmedText[1]).match(/[\d,\.]+/)[0] : '')

  console.log("splittedAndTrimmedText", splittedAndTrimmedText[1].match(/[\d\.]+/)[0], amount)
  console.log(JSON.stringify(splittedAndTrimmedText[1]))

  return {
    name,
    amount: amount.trim()
  }
})()