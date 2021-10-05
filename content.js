// Highlights the current selection with the given color
function highlightSelection(string) {
  // Wrap text content with span element
  const sel = document.getSelection();
  const range = sel.getRangeAt(0);
  var offset1 = range.startOffset;
  var offset2 = range.endOffset;
  var curr = sel.anchorNode;
  var str1 = "";

  while (curr != null) {
    var iter = 0;
    var sibling = curr.previousSibling;
    while (sibling != null) {
      sibling = sibling.previousSibling;
      iter++;
    }
    str1 = " " + iter.toString() + str1;
    curr = curr.parentNode;
  }

  var curr = sel.focusNode;
  var str2 = "";

  while (curr != null) {
    var iter = 0;
    var sibling = curr.previousSibling;
    while (sibling != null) {
      sibling = sibling.previousSibling;
      iter++;
    }
    str2 = " " + iter.toString() + str2;
    curr = curr.parentNode;
  }

  const wrapper = document.createElement("span");
  range.surroundContents(wrapper);

  // Style span element
  wrapper.style.backgroundColor = string;
  if (string == "#0000FF") {
    wrapper.style.color = "#ffffff";
  } else {
    wrapper.style.color = "#111111";
  }
  wrapper.classList.add("notes-highlight");

  // Extract and save text/node content
  var message = str1 + "[]" + str2 + "[]" + offset1 + "[]" + offset2 + "[]" + string + "[]" + wrapper.textContent.trim() + "\n";

  // Send text/node content to sidebar
  browser.runtime.sendMessage({ message: message });
}

function highlightRefresh(string) {
  var splitString = string.split("[]");

  // Save split string pieces
  if (splitString.length != 5) {
    // Read in variables
    var str1 = splitString[0];
    var str2 = splitString[1];
    var offset1 = splitString[2];
    var offset2 = splitString[3];
    var colorString = splitString[4];

    // Get root node of document to work our way to the anchor node
    var root = document.getRootNode();

    // Split up the definition of the first node
    var result = str1.split(" ");
    var currNode1 = root;

    for (var i = 2; i < result.length; i++) {
      // Iterate until we're at the right child node
      var currInt = parseInt(result[i]);
      var tempNode = currNode1.firstChild;
      var iter = 0;
      while (iter < currInt) {

        tempNode = tempNode.nextSibling;
        iter++;
      }
      // Set ourselves as that child node & repeat
      currNode1 = tempNode;
    }

    // Do the same for the focus/second node
    var result = str2.split(" ");
    var currNode2 = root;
    for (var i = 2; i < result.length; i++) {

      var currInt = parseInt(result[i]);
      var tempNode = currNode2.firstChild;
      var iter = 0;
      while (iter < currInt) {

        tempNode = tempNode.nextSibling;
        iter++;
      }
      currNode2 = tempNode;
    }

    // Now that we have anchor/focus node & offset, create the range to highlight
    const range1 = document.createRange();

    range1.setStart(currNode1, offset1);

    range1.setEnd(currNode2, offset2);
    const wrapper1 = document.createElement("span");
    range1.surroundContents(wrapper1);
    wrapper1.style.backgroundColor = colorString;
    wrapper1.style.color = "#111111";

    if (colorString == "#0000FF") {
      wrapper1.style.color = "#ffffff";
    }

    // Restore highlight class for copying functionality
    wrapper1.classList.add("notes-highlight");
  }
}

// Copies all highlighted text to the clipboard in HTML format
function copyAll() {
  const spans = document.querySelectorAll(".notes-highlight");
  var s = "<h2>" + window.location.toString() + "</h2>";
  s += "\n<ul>"
  for (var i = 0; i < spans.length; i++) {
    // Check which color the highlighted text is, and apply a hardcoded formatting
    s += "\n\t";
    if (spans[i].style.backgroundColor == "rgb(255, 0, 0)") {
      s += "<ul>"
    }
    if (spans[i].style.backgroundColor == "rgb(0, 255, 0)") {
      s += "<ul><ul>"
    }
    if (spans[i].style.backgroundColor == "rgb(0, 0, 255)") {
      s += "<ul><ul><ul>"
    }
    s += "<li>";
    s += spans[i].textContent.trim();
    s += "</li>";
    if (spans[i].style.backgroundColor == "rgb(255, 0, 0)") {
      s += "</ul>"
    }
    if (spans[i].style.backgroundColor == "rgb(0, 255, 0)") {
      s += "</ul></ul>"
    }
    if (spans[i].style.backgroundColor == "rgb(0, 0, 255)") {
      s += "</ul></ul></ul>"
    }
  }
  s += "\n</ul>"

  // Add the s string to the clipboard as rtf
  function listener(e) {
    e.clipboardData.setData("text/html", s);
    e.clipboardData.setData("text/plain", s);
    e.preventDefault();
  }

  document.addEventListener("copy", listener);
  document.execCommand("copy");
  document.removeEventListener("copy", listener);
}

// Recieves messages from background, and calls the appropriate function
function handle(message) {
  switch (message.command) {
    case "highlight":
      highlightSelection(message.data);
      break;
    case "copy":
      copyAll();
      break;
    case "highlightRefresh":
      highlightRefresh(message.data);
      break;
    default:
      console.log("Got unknown message in content: " + message);
      break;
  }
}

// Call message handler when message is received
browser.runtime.onMessage.addListener(handle);
