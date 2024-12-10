console.clear()
console.log("popup/app.js has loaded..")

// Add event listener on page load
document.addEventListener("DOMContentLoaded", listenForClicks);

function listenForClicks () {
  const ctaElm = document.getElementById("set-cta")
  ctaElm.addEventListener("click", start)
  
  const getElm = document.getElementById("get-cta")
  getElm.addEventListener("click", retrieve)
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
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

function retrieve () {
  // Fetch saved data from storage
  browser.storage.local.get("savedData").then((data) => {
    console.table(data.savedData);
  });
}
