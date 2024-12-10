console.clear()
console.log("popup/app.js has loaded..")

// Add event listener on page load
document.addEventListener("DOMContentLoaded", listenForClicks);

function listenForClicks () {
  const ctaElm = document.getElementById("cta")
  ctaElm.addEventListener("click", start)
}

async function start () {
  const urlData = []
  const total = 3

  for (let i = 1; i <= total; i++) {
    const minifigId = i < 10 ? `elf00${i}` : `elf0${i}`
    const baseUrl = `https://www.bricklink.com/v2/catalog/catalogitem.page?M=${minifigId}#T=S&O={"ss":"IN","cond":"N","iconly":0}`

    urlData.push({
      id: minifigId,
      url: baseUrl
    })
  }

  const savedData = [];

  const tableElm = document.getElementById("result")
  tableElm.innerHTML = "Checking.."

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
  } catch (error) {
    tableElm.innerHTML = `An error occurred: "${error}". Please try again..`
    console.error("An error occurred:", error);
  }
}

function rendertoTable (data, tableElm) {
  if (!data || !data.length) {
    tableElm.innerHTML = 'No data found. Please try again..'
  }

  let tableHead = '<thead><tr>'
  Object.keys(data[0]).forEach(key => { tableHead += `<td>${key}</td>` })
  tableHead += '</tr></thead>'
  
  let tableBody = '<tbody>'
  data.forEach(row => {
    tableBody += '<tr>'
    Object.values(row).forEach(value => { tableBody += `<td>${value}</td>` })
    tableBody += '</tr>'
  })
  tableBody += '</tbody>'

  return tableElm.innerHTML = tableHead + tableBody
}