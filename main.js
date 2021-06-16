const electron = require('electron');
const { app, BrowserWindow, ipcMain } = electron;
let mainWindow = null;
let sideWindows = [];

app.once('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.once('ready', () => {
    mainWindow = new BrowserWindow({
        fullscreen: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        }
    });
    mainWindow.loadURL('file://' + __dirname + '/index.html');
    mainWindow.setMenu(null);
    // mainWindow.webContents.openDevTools();
    mainWindow.on('closed', () => mainWindow = null);

    const externalDisplays = electron.screen.getAllDisplays()
        .filter((display) => display.bounds.x !== 0 || display.bounds.y !== 0);

    externalDisplays.forEach((externalDisplay) => {
        const win = new BrowserWindow({
            x: externalDisplay.bounds.x,
            y: externalDisplay.bounds.y,
            width: externalDisplay.bounds.width,
            height: externalDisplay.bounds.height,
            fullscreen: true
        });
        const index = sideWindows.push(win) - 1;
        win.loadURL('file://' + __dirname + '/black.html');
        win.setMenu(null);
        win.on('closed', () => {
            sideWindows[index] = null;
        });
    });


});

ipcMain.on('terminate', () => app.quit());