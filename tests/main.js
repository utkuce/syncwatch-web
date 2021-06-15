const puppeteer = require('puppeteer');

(async () => {
 
  const browser1 = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: null, 
    executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    args: ["--window-size=960,1080", "--window-position=0,0"]   
  });

  const page1 = await browser1.newPage();

  const browser2 = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: null, 
    executablePath: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    args: ["--window-size=960,1080", "--window-position=960,0"]   
  });
  const page2 = await browser2.newPage();

  await page1.exposeFunction('onHashChange', url => page1.emit('hashchange', url));
  await page1.evaluateOnNewDocument(() => {
    addEventListener('hashchange', e => onHashChange(location.href));
  });

  // Listen for hashchange events in node Puppeteer code.
  page1.on('hashchange', async url => {

    var roomNumber = new URL(url).hash.split("#r=")[1];
    await page2.goto('http://localhost:8080#r=' + roomNumber);
  });

  page2.on('console', async message => {
    if (message.text() === "Player ready")
    {
      await page2.evaluate(() => {
        document.getElementsByClassName("vjs-big-play-button")[0].click();
      });

      page1.on('console', async message => {

        if (message.text() === "playing video")
        {
          await page1.evaluate(() => {
            if (document.getElementById("my-player").dataset.isPlaying === "true")
            {
              console.log("Started video successfully from remote command");
            }
          });
          
          // await browser1.close();
          // await browser2.close();
        }
      });
    }
  });

  await page1.goto('http://localhost:8080');

})();

