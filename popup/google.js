// (async function () {
//   const commonModuleUrl = chrome.runtime.getURL('../modules/utils.js')
//   const { waitForElementToLoad } = await import(commonModuleUrl)

//   const selector = 'div[data-rpos="0"] a'
//   // const tables = document.querySelector('#mw-content-text .wikitable')

//   await waitForElementToLoad(selector)

//   const link = document.querySelector(selector)
//   if (!link) {
//     return 'No link element found'
//   }

//   const linkTextElm = link.querySelector('h3')

//   return {
//     url: link.href,
//     title: linkTextElm?.innerText
//   }
// })()