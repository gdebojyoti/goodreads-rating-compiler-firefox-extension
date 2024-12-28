const EXTENSION_NAME = 'BrickLink Price Finder'
const DC_WIKIPEDIA_URL = 'https://en.wikipedia.org/wiki/DC_Omnibus'

// Add event listener on page load
document.addEventListener("DOMContentLoaded", listenForClicks);

function listenForClicks () {
  console.log(`${EXTENSION_NAME} loaded..`)
  
  const dcWikipediaCta = document.getElementById('dc-wikipedia')
  dcWikipediaCta.addEventListener('click', handleDcWikiClick)

  const formCta = document.getElementById("goodreads-dc-list-cta")
  formCta.addEventListener("click", handleDcWebSearch)
}

async function handleDcWikiClick () {
  try {
    // const savedData = []

    // open DC wikipedia page in a new tab
    const tab = await browser.tabs.create({ url: DC_WIKIPEDIA_URL, active: false })

    // Wait for the tab to load and execute a script to fetch the title
    const [result] = await browser.tabs.executeScript(tab.id, {
      file: './dcWiki.js'
    })

    // Close the tab
    await browser.tabs.remove(tab.id)

    console.log('result', result)

    downloadAsJson(result, 'dc-omnibus-wikipedia-list.json')
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
  for (let i = 0; i < 2; i++) {
    const { title } = books[i]

    // open DC wikipedia page in a new tab
    const tab = await browser.tabs.create({ url: `https://www.goodreads.com/search?q=${title}`, active: false })

    // Wait for the tab to load and execute a script to fetch the title
    const [result] = await browser.tabs.executeScript(tab.id, {
      file: './goodreads.js'
    })

    // Close the tab
    await browser.tabs.remove(tab.id)

    console.log(result)
    allData.push(result)
  }

  return allData
}

// async function googleBooks (books) {
//   // run only on the first book
//   for (let i = 0; i < 1; i++) {
//     const { title } = books[i]

//     // open DC wikipedia page in a new tab
//     const tab = await browser.tabs.create({ url: `https://www.google.com/search?q=${title} site:goodreads.com`, active: false })

//     // Wait for the tab to load and execute a script to fetch the title
//     const [result] = await browser.tabs.executeScript(tab.id, {
//       file: './google.js'
//     })

//     console.log(result)
//   }
// }