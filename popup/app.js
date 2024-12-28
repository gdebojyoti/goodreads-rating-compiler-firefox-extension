const extensionName = 'BrickLink Price Finder'

// Add event listener on page load
document.addEventListener("DOMContentLoaded", listenForClicks);

function listenForClicks () {
  console.log(`${extensionName} loaded..`)
  // const form = document.getElementById("details-form")
  // form.addEventListener("submit", onSubmit)
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

    msgContainerElm.innerHTML += `<div class="msg msg--success">Thank you for using ${extensionName} extension! The price details are listed below..</div>`
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
