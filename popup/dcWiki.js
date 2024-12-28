(async function () {
  const commonModuleUrl = chrome.runtime.getURL('../modules/utils.js')
  const { waitForElementToLoad, isDate } = await import(commonModuleUrl)

  const selector = '#mw-content-text table.wikitable'
  // const tables = document.querySelector('#mw-content-text .wikitable')

  await waitForElementToLoad(selector)

  const tables = document.querySelectorAll(selector)
  if (!tables || !tables.length) {
    return 'No table element found'
  }

  const result = []

  tables.forEach((tableElm, index) => {
    // ignore the first table
    if (!index) {
      return
    }

    const rows = tableElm.querySelectorAll('tr')
    rows.forEach(elm => {
      console.log(elm.children.length)
      // // check if elm is valid - i.e., if children is more than 3
      // if (elm.children.length < 4) {
      //   return
      // }
  
      const titleElm = elm.querySelector('td')
      console.log(titleElm)
  
      // ignore if no element is found
      if (!titleElm) {
        return
      }

      const text = titleElm.innerText.replace(' ‡', '')

      // check for volumes
      if (text.length <= 2) {
        // get previous entry
        const previousEntry = result[result.length - 1]

        // set its vol to 1 if it doesn't exist
        if (typeof previousEntry.volume === "undefined") {
          previousEntry.volume = 1
        }

        // add new entry
        result.push({
          title: previousEntry.title,
          volume: parseInt(text)
        })

        // exit current interation of loop
        return
      }

      // ignore date values
      if (isDate(text)) {
        return
      }
      
      result.push({
        title: text
      })
    })
  })

  return result

  // const splittedAndTrimmedText = firstRow.textContent.replace(/\\n|\\t|\\r/g, '').split(' ')

  // return {
  //   name,
  //   currency: splittedAndTrimmedText[0].trim(),
  //   amount: parseInt(splittedAndTrimmedText[1].match(/[\d,\.]+/)[0].trim())
  // }
})()
