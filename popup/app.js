const EXTENSION_NAME = 'BrickLink Price Finder'
const DC_WIKIPEDIA_URL = 'https://en.wikipedia.org/wiki/DC_Omnibus'

// Add event listener on page load
document.addEventListener("DOMContentLoaded", listenForClicks);

function listenForClicks () {
  console.log(`${EXTENSION_NAME} loaded..`)
  
  const dcWikipediaCta = document.getElementById('dc-wikipedia')
  dcWikipediaCta.addEventListener('click', handleDcWikiClick)

  const formCta = document.getElementById("google-dc-list-cta")
  formCta.addEventListener("click", handleDcGoogleSearch)
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

    // Convert the book data to a JSON string
    const jsonString = JSON.stringify(result, null, 2)

    // Create a Blob from the JSON string
    const blob = new Blob([jsonString], { type: "application/json" })

    // Generate an object URL for the Blob
    const url = URL.createObjectURL(blob)

    // Trigger download as a JSON file
    chrome.downloads.download({
      url: url,
      filename: "dc-omnibus-wikipedia-list.json",
      // saveAs: true
    }, function(downloadId) {
      if (chrome.runtime.lastError) {
        console.error("Error downloading file:", chrome.runtime.lastError.message)
      } else {
        console.log("Download started with ID:", downloadId)
      }
    })
  } catch (e) {
    console.log(e)
  }
}

async function handleDcGoogleSearch () {
  const fileInput = document.getElementById("google-dc-list-field")
  const file = fileInput.files[0] // Get the selected file

  if (!file) {
    console.log("Please select a file.")
    return
  }

  const result = await readFromJson(file)
  console.log("resultresult", result)
}

async function readFromJson (file) {
  return new Promise ((resolve, reject) => {
    // Create a FileReader to read the file
    const reader = new FileReader()

    reader.onload = function (event) {
      try {
        // Parse the JSON content
        const jsonData = JSON.parse(event.target.result)

        // TODO: Add your logic to work with the data (e.g., send to Google search)
        resolve(jsonData)
      } catch (error) {
        reject("Error parsing JSON:", error.message)
      }
    };

    // Read the file as text
    reader.readAsText(file)
  })
}