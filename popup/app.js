const extensionName = 'BrickLink Price Finder'

// Add event listener on page load
document.addEventListener("DOMContentLoaded", listenForClicks);

function listenForClicks () {
  const form = document.getElementById("details-form")
  form.addEventListener("submit", onSubmit)
}

function onSubmit (e) {
  e.preventDefault()

  
}

function parseMinifigIds (data) {
  const ids = []
  
  data.split(',').forEach(item => {
    if (!item.includes('...')) {
      ids.push(item)
      return
    }

    ids.push(...getIdsInRange(item))
  })

  return ids
}

function getIdsInRange (item) {
  const range = item.split('...')
  
  const regex = /^([a-zA-Z]+)(\d+)$/
  const matchLower = range[0].match(regex)

  const series = matchLower[1] // letters (eg: col, elf)
  const lowerLimit = parseInt(matchLower[2]) // numbers (eg: 3, 12, 991)

  const matchUpper = range[1].match(regex)

  const upperLimit = parseInt(matchUpper[2]) // numbers (eg: 3, 12, 991)

  if (lowerLimit > upperLimit) {
    throw new Error("Range seems incorrect. Correct range will look like \"elf001...elf003\"")
  }

  const arr = []
  for (let i = lowerLimit; i <= upperLimit; i++) {
    arr.push(`${series}${getStringWithZeroes(i)}`)
  }

  return arr
}

function getStringWithZeroes (number) {
  // assuming length to be 3
  
  if (number < 10) {
    return `00${number}`
  }
  
  if (number < 100) {
    return `0${number}`
  }
  
  return number
}

async function onSubmit (e) {
  e.preventDefault()

  const urlData = []

  const msgContainerElm = document.getElementById("msg-container")
  msgContainerElm.innerHTML = ""
  
  msgContainerElm.innerHTML += `<div class="msg">Calculating..</div>`

  try {
    const minifigIdsText = e.target.elements['minifig-ids'].value || ''
    const minifigIds = parseMinifigIds(minifigIdsText)
    console.log(minifigIds)
    msgContainerElm.innerHTML += `<div class="msg msg--warning">Generated list of minifigure IDs: ${minifigIds.join(', ')}</div>`

    minifigIds.forEach(minifigId => {
      const baseUrl = `https://www.bricklink.com/v2/catalog/catalogitem.page?M=${minifigId}#T=S&O={"ss":"IN","cond":"N","iconly":0}`

      urlData.push({
        id: minifigId,
        url: baseUrl
      })
    })
  } catch (e) {
    msgContainerElm.innerHTML += `<div class="msg msg--alert">${e}</div>`
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