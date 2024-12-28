(async function () {
  const commonModuleUrl = chrome.runtime.getURL('../modules/utils.js')
  const { waitForElementToLoad } = await import(commonModuleUrl)

  const selector = 'table tbody tr'
  // const tables = document.querySelector('#mw-content-text .wikitable')

  await waitForElementToLoad(selector)

  const row = document.querySelector(selector)
  if (!row) {
    return 'No tr element found'
  }

  const linkTextElm = row.querySelector('.bookTitle')
  const ratingElm = row.querySelector('.minirating')

  return {
    url: linkTextElm.href,
    title: linkTextElm?.innerText,
    rating: ratingElm?.innerText
  }
})()