const EXTENSION_NAME = 'GoodReads Rating Compiler'
const DC_WIKIPEDIA_URL = 'https://en.wikipedia.org/wiki/DC_Omnibus'
const MARVEL_WIKIPEDIA_URL = 'https://en.wikipedia.org/wiki/Marvel_Omnibus'

// wait for DELAY_TIME_SECONDS time after every DELAY_AFTER_ITERATION hits
const DELAY_AFTER_ITERATION = 15
const DELAY_TIME_SECONDS = 20

// Add event listener on page load
document.addEventListener("DOMContentLoaded", listenForClicks);

function listenForClicks () {
  console.log(`${EXTENSION_NAME} loaded..`)
  
  const dcWikipediaCta = document.getElementById('dc-wikipedia')
  dcWikipediaCta.addEventListener('click', () => handleWikipediaParsing('dc'))
  
  const marvelWikipediaCta = document.getElementById('marvel-wikipedia')
  marvelWikipediaCta.addEventListener('click', () => handleWikipediaParsing('marvel'))

  const formCta = document.getElementById("goodreads-dc-list-cta")
  formCta.addEventListener("click", handleDcWebSearch)
}

async function handleWikipediaParsing (key) {
  try {
    let url = '', file = '', downloadFileName = ''

    switch (key) {
      case 'dc': {
        url = DC_WIKIPEDIA_URL
        file = './dcWiki.js'
        downloadFileName = 'dc-omnibus-wikipedia-list.json'
        break
      }
      case 'marvel': {
        url = MARVEL_WIKIPEDIA_URL
        file = './marvelWiki.js'
        downloadFileName = 'marvel-omnibus-wikipedia-list.json'
        break
      }
      default: return
    }

    // open DC wikipedia page in a new tab
    const tab = await browser.tabs.create({ url, active: false })

    // Wait for the tab to load and execute a script to fetch the title
    const [result] = await browser.tabs.executeScript(tab.id, {
      file
    })

    // Close the tab
    await browser.tabs.remove(tab.id)

    console.log('result', result)

    downloadAsJson(result, downloadFileName)
  } catch (e) {
    console.log(e)
  }
}

function downloadAsJson (data, filename) {
  // Convert the book data to a JSON string
  const jsonString = JSON.stringify(data, null, 2)

  // Create a Blob from the JSON string
  const blob = new Blob([jsonString], { type: "application/json" })

  // Generate an object URL for the Blob
  const url = URL.createObjectURL(blob)

  // Trigger download as a JSON file
  chrome.downloads.download({
    url: url,
    // saveAs: true,
    filename
  }, function(downloadId) {
    if (chrome.runtime.lastError) {
      console.error("Error downloading file:", chrome.runtime.lastError.message)
    } else {
      console.log("Download started with ID:", downloadId)
    }
  })
}

async function handleDcWebSearch () {
  const fileInput = document.getElementById("goodreads-dc-list-field")
  const file = fileInput.files[0] // Get the selected file

  if (!file) {
    console.log("Please select a file.")
    return
  }

  const result = await readFromJson(file)
  console.log("Data from JSON", result)

  const finalData = {
    lastUpdatedOn: Date.now(),
    list: await goodreadBooks(result)
  }
  downloadAsJson(finalData, 'dc-omni.json')
  console.log("Data from GoodReads", finalData)
}

async function readFromJson (file) {
  return new Promise ((resolve, reject) => {
    // Create a FileReader to read the file
    const reader = new FileReader()

    reader.onload = function (event) {
      try {
        // Parse the JSON content
        const jsonData = JSON.parse(event.target.result)

        resolve(jsonData)
      } catch (error) {
        reject("Error parsing JSON:", error.message)
      }
    };

    // Read the file as text
    reader.readAsText(file)
  })
}

async function goodreadBooks (books) {
  const allData = []
  
  // run only on the first 2 books
  for (let i = 0; i < books.length; i++) {
    const { title, volume, isKeywordInvalid, isNotPublished, shouldSkipVolume, shouldSkipKeywordVolume, shouldSkipKeywordOmnibus } = books[i]

    // wait for DELAY_TIME_SECONDS seconds after every DELAY_AFTER_ITERATION hits
    if (i % DELAY_AFTER_ITERATION === 0) {
      await delayBy(DELAY_TIME_SECONDS)
    }

    // exit iteration for certain flags
    if (isKeywordInvalid || isNotPublished) {
      continue
    }

    let searchString = title

    // add "omnibus" to the search string if the book title doesn't have it already
    if (!shouldSkipKeywordOmnibus && title.toLowerCase().indexOf('omnibus') === -1) {
      searchString += ' omnibus'
    }

    // add volume number if exists
    if (!shouldSkipVolume && volume) {
      searchString += shouldSkipKeywordVolume ? ` ${volume}` : ` vol ${volume}`
    }

    // open DC wikipedia page in a new tab
    const tab = await browser.tabs.create({ url: `https://www.goodreads.com/search?q=${searchString}`, active: false })

    try {
      // Wait for the tab to load and execute a script to fetch the title
      const [result] = await browser.tabs.executeScript(tab.id, {
        file: './goodreads.js'
      })

      // Close the tab | NOTE: this will keep the tab open for all failure cases
      await browser.tabs.remove(tab.id)

      console.log(`${i + 1} done..`)
      allData.push(result)
    } catch (e) {
      console.log(`Error occurred with ${searchString}`, e)
    }
  }

  return allData
}

function delayBy (timeInSeconds) {
  return new Promise ((res) => {
    setTimeout(() => {
      res()
    }, timeInSeconds * 1000)
  })
}
