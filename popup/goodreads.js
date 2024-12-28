(async function () {
  const commonModuleUrl = chrome.runtime.getURL('../modules/utils.js')
  const { waitForElementToLoad } = await import(commonModuleUrl)

  const selector = 'table tbody tr'
  // const tables = document.querySelector('#mw-content-text .wikitable')

  await waitForElementToLoad(selector)

  const rowElm = document.querySelector(selector)
  if (!rowElm) {
    return 'No tr element found'
  }

  return getData(rowElm)
})()

function getData (row) {
  const anchorTarget = row.querySelector('.u-anchorTarget')
  const link = row.querySelector('.bookTitle')
  const span = link.querySelector('span');
  const thumbnailUrlElm = row.querySelector('.bookCover');
  const bookTitle = span.innerText || ''
  const ratingText = row.querySelector('.minirating').innerText.trim()

  // Regular expression to match the average rating and total ratings
  const regex = /(\d+\.\d+)\s+avg rating\s+—\s+(\d+)\s+ratings/;

  // Apply the regex to the string
  const matches = ratingText.match(regex);

  return {
    key: anchorTarget.id,
    url: link.href,
    title: bookTitle,
    thumbnailUrl: thumbnailUrlElm.src,
    rating: matches && parseFloat(matches[1]),  // First capturing group: average rating
    totalRatings: matches && parseInt(matches[2]),  // Second capturing group: total ratings
    publisher: 'DC'
  }
}