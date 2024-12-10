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
  console.log("performing my actual duties..")

  const urlData = []

  for (let i = 1; i <= 2; i++) {
    const minifigId = i < 10 ? `elf00${i}` : `elf0${i}`
    const baseUrl = `https://www.bricklink.com/v2/catalog/catalogitem.page?M=${minifigId}#T=S&O={%22cond%22:%22N%22,%22iconly%22:0}`

    console.log(minifigId)

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
        // code: "document.title;" // Fetch the title directly
      });

      console.log("retrived title:", result)

      // Save the URL and title
      savedData.push({
        id,
        // tabId: tab.id,
        ...result
      });

      // Close the tab
      await browser.tabs.remove(tab.id);
    }

    await browser.storage.local.set({ savedData });
    console.log("Saved data:", savedData);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

function retrieve () {
  // Fetch saved data from storage
  browser.storage.local.get("savedData").then((data) => {
    console.log("Retrieved data:", data.savedData);
  });
}
