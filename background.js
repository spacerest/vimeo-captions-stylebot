console.log("hello from BACKGROUND");
chrome.commands.onCommand.addListener(function(command) {
  if (command === "Ctrl+L") { 
    console.log("Ctrl-L successful.");
  }
  else if (command === "Ctrl+M") { 
    console.log("Ctrl+M successful.");
  }
}); 

