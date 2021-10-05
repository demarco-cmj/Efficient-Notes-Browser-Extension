// Declare window ID for this window and content box element
var myWindowId;
const contentBox = document.getElementById("content");

// Save content to browser storage
function saveContent() {
  browser.tabs.query({ windowId: myWindowId, active: true }).then((tabs) => {
    let contentToStore = {};
    contentToStore[tabs[0].url] = contentBox.innerHTML;
    browser.storage.local.set(contentToStore);
  });
}

// Make content box editable on mouse hover
window.addEventListener("mouseover", () => {
  contentBox.setAttribute("contenteditable", true);
});

// Strip editable attribute and save contents on mouse out
window.addEventListener("mouseout", () => {
  contentBox.setAttribute("contenteditable", false);
  saveContent();
});

// Retrieve content from storage for this URL, then update sidebar if content is defined
function updateContent() {
  var tabId;
  browser.tabs.query({ windowId: myWindowId, active: true })
    .then((tabs) => {
      // Save the tab ID so we can send it to the background script
      tabId = tabs[0].id;
      return browser.storage.local.get(tabs[0].url);
    })
    .then((storedInfo) => {
      var data = storedInfo[Object.keys(storedInfo)[0]];

      // Ignore invalid data
      if (data != "" && data != undefined) {
        // Update the innerHTML
        contentBox.innerHTML = data;

        // Send the message to the background script
        browser.runtime.sendMessage({ nodeInfo: tabId + "{}" + data });
      }
      else {
        // Prevent extra things from cluttering up the content box
        contentBox.innerText = "";
      }
    });
}

// Update content if tab is activated or updated
browser.tabs.onActivated.addListener(updateContent);
browser.tabs.onUpdated.addListener(updateContent);

// Appends the given message to the content box
function appendText(request) {
  // Check for garbage data
  if (request.message != "undefined" && request.message != "") {
    // Create a div element so that we can make the text hidden with HTML
    var test = document.createElement("div");
    test.innerHTML = request.message;

    // Hide the request message
    var shown = "<span style=\"background-color:" + request.message.split("[]")[4] + "\">" + request.message.split("[]")[5] + "</span>";
    if (request.message.split("[]")[4] == "#0000FF") {
      shown = "<span style=\"color:white;\">" + shown + "</span>";
    }
    contentBox.innerHTML += "<div style=\"display:none;\">" + request.message + "</div>" + shown;
  }
  saveContent();
}

// Append message to content box when received
browser.runtime.onMessage.addListener(appendText);

// Perform initial content update
browser.windows.getCurrent({ populate: true }).then((windowInfo) => {
  myWindowId = windowInfo.id;
  updateContent();
});
