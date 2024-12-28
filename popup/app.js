const EXTENSION_NAME = 'BrickLink Price Finder v1'
const DC_WIKIPEDIA_URL = 'https://en.wikipedia.org/wiki/DC_Omnibus'

// Add event listener on page load
document.addEventListener("DOMContentLoaded", listenForClicks);

function listenForClicks () {
  console.log(`${EXTENSION_NAME} loaded..`)
  // const form = document.getElementById("details-form")
  // form.addEventListener("submit", onSubmit)

  const dcWikipediaCta = document.getElementById('dc-wikipedia')
  dcWikipediaCta.addEventListener('click', handleDcWikiClick)
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
      filename: "bookData.json",
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

async function onSubmit (e) {
  e.preventDefault()

  const urlData = []

  const msgContainerElm = document.getElementById("msg-container")
  msgContainerElm.innerHTML = ""
  
  msgContainerElm.innerHTML += `<div class="msg">Calculating..</div>`

  try {
    const minifigIdsText = (e.target.elements['minifig-ids'].value || '').trim()

    if (!minifigIdsText) {
      msgContainerElm.innerHTML += `<div class="msg msg--alert">Input cannot be empty</div>`
      return
    }
    
    const minifigIds = parseMinifigIds(minifigIdsText)
    msgContainerElm.innerHTML += `<div class="msg msg--warning">Generated list of minifigure IDs: ${minifigIds.join(', ')}</div>`

    minifigIds.forEach(minifigId => {
      const baseUrl = `https://www.bricklink.com/v2/catalog/catalogitem.page?M=${minifigId}#T=S&O={"ss":"IN","cond":"N","iconly":0}`

      urlData.push({
        id: minifigId,
        url: baseUrl
      })
    })
  } catch (e) {
    msgContainerElm.innerHTML += `<div class="msg msg--alert">
      ${e}
      <br>
      Please fix the input data and try again..
    </div>`
    return
  }

  msgContainerElm.innerHTML += `<div class="msg">Looking up prices..</div>`
  
  const savedData = []

  const tableElm = document.getElementById("result")

  try {
    for (const { id, url } of urlData) {
      const tab = await browser.tabs.create({ url, active: false });

      // Wait for the tab to load and execute a script to fetch the title
      const [result] = await browser.tabs.executeScript(tab.id, {
        file: './tab.js'
      });

      // Save the URL and title
      savedData.push({
        id,
        ...result
      });

      console.log(`${id} done`)

      // Close the tab
      await browser.tabs.remove(tab.id);
    }

    await browser.storage.local.set({ savedData });
    console.table(savedData);

    rendertoTable(savedData, tableElm)

    msgContainerElm.innerHTML += `<div class="msg msg--success">Thank you for using ${EXTENSION_NAME} extension! The price details are listed below..</div>`
  } catch (error) {
    msgContainerElm.innerHTML += `<div class="msg msg--alert">
      ${error}.
      <br>
      This is probably our fault, but there is also a chance that something is not right with the data you entered.
      <br><br>
      Here are somethings that you can try -
      <ul>
        <li>Check if the generated list of minifigure IDs is correct. If not, please correct the input data.</li>
        <li>Do all the items in the list exist?</li>
        <li>Try a smaller list.</li>
      </ul>
    </div>`
  }
}
