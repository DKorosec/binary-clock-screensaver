const { app, BrowserWindow, ipcMain } = require('electron');
let mainWindow = null;

// screen saver passes /s, when running fullscreen.
// we could implement other flags for preview, but we are just too lazy :)
const shouldStart = process.argv.map(v => v.trim()).includes('/s');

if (!shouldStart) {
    app.quit();
}

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
});

//ipcMain.on('terminate', () => app.quit());