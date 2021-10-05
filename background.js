// Declare color options
var color1 = "#FFFF00";
var color2 = "#FF0000";
var color3 = "#00FF00";
var color4 = "#0000FF";
var currentColor = color1;

// Create menu items
browser.menus.create({
  id: "get-text",
  title: "Copy Text",
  contexts: ["page"]
});

browser.menus.create({
  id: "highlight-selection",
  title: "Highlight Selection",
  contexts: ["selection"]
});

browser.menus.create({
  id: "separator-1",
  type: "separator",
  contexts: ["all"]
});

browser.menus.create({
  id: "highlight-color-1",
  type: "radio",
  title: "Yellow",
  contexts: ["all"],
  checked: true
});

browser.menus.create({
  id: "highlight-color-2",
  type: "radio",
  title: "Red",
  contexts: ["all"],
  checked: false
});

browser.menus.create({
  id: "highlight-color-3",
  type: "radio",
  title: "Green",
  contexts: ["all"],
  checked: false
});

browser.menus.create({
  id: "highlight-color-4",
  type: "radio",
  title: "Blue",
  contexts: ["all"],
  checked: false
});

browser.menus.create({
  id: "separator-2",
  type: "separator",
  contexts: ["all"]
});

browser.menus.create({
  id: "toggle-sidebar",
  title: "Toggle Sidebar",
  contexts: ["all"],
  command: "_execute_sidebar_action"
});

// Add listener for new menu items
browser.menus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case "get-text":
      browser.tabs.sendMessage(tab.id, { command: "copy" });
      break;
    case "highlight-selection":
      browser.tabs.sendMessage(tab.id, { command: "highlight", data: currentColor });
      break;
    case "highlight-color-1":
      currentColor = color1;
      break;
    case "highlight-color-2":
      currentColor = color2;
      break;
    case "highlight-color-3":
      currentColor = color3;
      break;
    case "highlight-color-4":
      currentColor = color4;
      break;
    case "toggle-sidebar":
      console.log("Toggling sidebar");
      break;
  }
});

// Recieves data from the sidebar and forwards it to the content script
function handleMessage(request, _sender, _sendResponse) {
  // First split the incoming string into the tab id and the rest of the information
  var splitted = request.nodeInfo.split("{}");

  // The rest of the string is just the innerHTML of the content box, so we need to split this up line by line to highlight the correct parts
  // Ideally this should be based off of something besides \n as that is a relatively common character
  var split2 = splitted[1].split("\n");
  for (var i = 0; i < split2.length - 1; i++) {
    // Sometimes there are strings of length 0 due to extra newline characters so just ignore these
    if (split2[i].length != 0) {
      // Once more split this string up to just the hidden part, which contains information about the nodes that the selection was done in
      var newStr = split2[i].split("</div>")[0].substring(27);
      // Some garbage might get printed out in the case of undefined data, so ignore it
      if (newStr != "" && newStr != "undefined") {
        // Send the message to the content script
        browser.tabs.sendMessage(parseInt(splitted[0]), { command: "highlightRefresh", data: newStr });
      }
    }
  }
}
browser.runtime.onMessage.addListener(handleMessage);
