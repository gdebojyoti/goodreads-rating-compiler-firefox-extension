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

  const urls = []

  for (let i = 1; i <= 2; i++) {
    const minifigId = i < 10 ? `elf00${i}` : `elf0${i}`
    const baseUrl = `https://www.bricklink.com/v2/catalog/catalogitem.page?M=${minifigId}#T=S&O={%22cond%22:%22N%22,%22iconly%22:0}`

    console.log(minifigId)

    urls.push(baseUrl)
  }

  const savedData = [];

  try {
    for (const url of urls) {
      const tab = await browser.tabs.create({ url, active: false });

      // Wait for the tab to load and execute a script to fetch the title
      const [result] = await browser.tabs.executeScript(tab.id, {
        // code: "document.title;" // Fetch the title directly
        code: `
          function waitForElementToLoad (selector, { timeout, gap } = { timeout: 10000, gap: 20 }) {
            return new Promise((resolve, reject) => {
              let timer = setTimeout(() => {
                reject('Element failed to load within ' + timeout / 1000 + ' seconds')
              }, timeout)

              // check if element has been generated every 
              let interval = setInterval(() => {
                const elm = document.querySelector(selector)
                if (selector) {
                  clearInterval(interval)
                  interval = null

                  clearTimeout(timer)
                  timer = null

                  resolve()
                }
              }, gap)
            })
          }

          (async function () {
            const selector = ".pciItemRowEven td:nth-of-type(5)"
            
            await waitForElementToLoad(selector)

            const firstRow = document.querySelector(selector);
            if (!firstRow) {
              return 'Element not found';
            }

            const splittedAndTrimmedText = firstRow.textContent.replace(/\\n|\\t|\\r/g, '').split(' ');

            // Ensure that the second part contains the numeric value
            const amount = splittedAndTrimmedText[0] + ' ' + (splittedAndTrimmedText[1] ? splittedAndTrimmedText[1].match(/[\\d,\\.]+/)[0] : '');

            return amount.trim();
          })()
        `
      });

      await browser.tabs.executeScript({
        code: `console.log('location:', window.location.href);`,
      });

      console.log("retrived title:", result)

      // Save the URL and title
      savedData.push({ url, tabId: tab.id, title: result });

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
