(async function () {
  const commonModuleUrl = chrome.runtime.getURL('../modules/utils.js')
  const { waitForElementToLoad } = await import(commonModuleUrl)

  const selector = '#mw-content-text table.wikitable'

  await waitForElementToLoad(selector)

  const tables = document.querySelectorAll(selector)
  if (!tables || !tables.length) {
    return 'No table element found'
  }

  const result = []

  tables.forEach((tableElm, index) => {
    const rows = tableElm.querySelectorAll('tr')
    rows.forEach(elm => {
      // check if elm is valid - i.e., if children is exactly 7
      if (elm.children.length !== 7) {
        return
      }
  
      const titleElm = elm.querySelector('td:nth-child(2)')
  
      // ignore if no element is found
      if (!titleElm) {
        return
      }

      const text = titleElm.innerText.replace(/[\t\r\n]/g, '');
      console.log(text)

      result.push({
        title: text
      })
    })
  })

  return result
})()
