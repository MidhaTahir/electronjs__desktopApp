const electron = require("electron");
const url = require("url");
const path = require("path");

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow;
let addWindow;

// listen for app to be ready
app.on("ready", function () {
  // create new window
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  //old syntax
  // load html into window
  //   mainWindow.loadURL(
  //     // file://dirname/mainWindow.html
  //     url.format({
  //       pathname: path.join(__dirname, "mainWindow.html"),
  //       protocol: "file:",
  //       slashes: true,
  //     })
  //   );

  //quit inside screens when outside screen is closed
  mainWindow.on("closed", function () {
    app.quit();
  });

  //new syntax
  mainWindow.loadFile("mainWindow.html");
  //Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);
});

// handle create add window
function createAddWindow() {
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: "Add Shopping List Item",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  //old syntax
  //   addWindow.loadURL(
  //     url.format({
  //       pathname: path.join(__dirname, "addWindow.html"),
  //       protocol: "file:",
  //       slashes: true,
  //     })
  //   );

  //new one
  addWindow.loadFile("addWindow.html");

  // Garbage collection handle
  addWindow.on("closed", function () {
    addWindow = null;
  });
}

// Catch item:add
ipcMain.on("item:add", function (e, item) {
  mainWindow.webContents.send("item:add", item);
  addWindow.close();
});

// Create menu template
const mainMenuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "Add Item",
        click() {
          createAddWindow();
        },
      },
      {
        label: "Clear Items",
        click() {
          mainWindow.webContents.send("item:clear");
        },
      },
      {
        label: "Quit",
        // process.platform -> 'linux', 'darwin' = (MAC)
        // accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q",

        // new syntax is below
        accelerator: "CmdOrCtrl+Q",
        click() {
          app.quit();
        },
      },
    ],
  },
];

//in Mac first label is electron so we are pushing an empty object first in MAC only
// IF Mac, add empty object to menu

if (process.platform == "darwin") {
  mainMenuTemplate.unshift({}); // add {} to beginning of an array
}

// Add dev tools item if not in production
if (process.env.NODE_ENV !== "production") {
  mainMenuTemplate.push({
    label: "Developer Tools",
    submenu: [
      {
        label: "Toggle Dev Tools",
        click(item, focusedWindow) {
          //to show up in main window and every other windows
          focusedWindow.toggleDevTools();
        },
        accelerator: "CmdOrCtrl+I",
      },
      //to get reload option
      { role: "reload" },
    ],
  });
}
