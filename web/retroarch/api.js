var BrowserFS = BrowserFS;
var afs;
var romData;
var coreOptions = "";
var retroarchConfig = "";
const canvas = document.getElementById("canvas");

let dataURItoBuffer = (dataURI) => {
  let byteString = atob(dataURI.split(",")[1]);

  let ab = new ArrayBuffer(byteString.length);
  let ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return ia;
};
function bufferToBase64(uint8array) {
  var output = [];

  for (var i = 0, length = uint8array.length; i < length; i++) {
    output.push(String.fromCharCode(uint8array[i]));
  }

  return btoa(output.join(''));
};

async function processCommand(evt) {
  switch (evt.data.command) {
    case "start":
      romData = dataURItoBuffer(evt.data.data.rom);
      idbfsInit(evt.data.data.namespace);
      break;
    case "setRetroArchConfig":
      retroarchConfig = evt.data.data;
      break;
    case "setCoreOptions":
      coreOptions = evt.data.data;
      break;
    case "keyPress":
      keyPress(evt.data.data);
      break;
    case "keydown":
      keyDown(evt.data.data);
      break;
    case "keyup":
      keyUp(evt.data.data);
      break;
    case "sendScreenshot":
      sendScreenshot();
      break;
    case "sendSram":
      sendSram();
      break;
    case "saveSram":
      saveSram();
      break;
    case "deleteSram":
      deleteSram();
      break;
  }
}
window.addEventListener("message", processCommand);

function idbfsInit(namespace) {
  var imfs = new BrowserFS.FileSystem.InMemory();
  if (BrowserFS.FileSystem.IndexedDB.isAvailable()) {
    afs = new BrowserFS.FileSystem.AsyncMirror(
      imfs,
      new BrowserFS.FileSystem.IndexedDB(function (e, fs) {
        if (e) {
          // fallback to imfs
          afs = new BrowserFS.FileSystem.InMemory();
          console.log(
            "WEBPLAYER: error: " + e + " falling back to in-memory filesystem"
          );
          setupFileSystem("browser");
          preLoadingComplete();
        } else {
          // initialize afs by copying files from async storage to sync storage.
          afs.initialize(function (e) {
            if (e) {
              afs = new BrowserFS.FileSystem.InMemory();
              console.log(
                "WEBPLAYER: error: " +
                e +
                " falling back to in-memory filesystem"
              );
              setupFileSystem("browser");
              preLoadingComplete();
            } else {
              idbfsSyncComplete();
            }
          });
        }
      }, "RetroArch " + namespace)
    );
  }
}

function idbfsSyncComplete() {
  console.log("WEBPLAYER: idbfs setup successful");

  setupFileSystem("browser");
  preLoadingComplete();
}

function preLoadingComplete() {
  startRetroArch();
}

function setupFileSystem(backend) {
  var mfs = new BrowserFS.FileSystem.MountableFileSystem();
  var xfs1 = new BrowserFS.FileSystem.XmlHttpRequest(
    ".index-xhr",
    "assets/frontend/bundle/"
  );

  console.log("WEBPLAYER: initializing filesystem: " + backend);
  mfs.mount("/home/web_user/retroarch/userdata", afs);
  mfs.mount("/home/web_user/retroarch/bundle", xfs1);
  BrowserFS.initialize(mfs);

  var BFS = new BrowserFS.EmscriptenFS();
  FS.mount(BFS, { root: "/home" }, "/home");

  console.log(
    "WEBPLAYER: " + backend + " filesystem initialization successful"
  );
}

async function startRetroArch() {
  await FS.writeFile(
    "/home/web_user/retroarch/userdata/output.vb",
    romData
  );

  await FS.writeFile(
    "/home/web_user/retroarch/userdata/retroarch.cfg",
    retroarchConfig
  );

  FS.createPath(
    "/",
    "home/web_user/retroarch/userdata/config/Beetle VB",
    true,
    true
  );
  await FS.writeFile(
    "/home/web_user/retroarch/userdata/config/Beetle VB/output.opt",
    coreOptions
  );

  Module.callMain([
    "-v",
    "/home/web_user/retroarch/userdata/output.vb"
  ]);

  Module.setCanvasSize(window.innerWidth, window.innerHeight);

  notifyLoaded();
}

window.onresize = () => {
  Module.setCanvasSize(window.innerWidth, window.innerHeight);
};

function sendScreenshot() {
  const d = new Date();
  const timestamp = ("" + d.getFullYear()).slice(-2) +
    ("0" + (d.getMonth() + 1)).slice(-2) +
    ("0" + d.getDate()).slice(-2) +
    "-" +
    ("0" + d.getHours()).slice(-2) +
    ("0" + d.getMinutes()).slice(-2) +
    ("0" + d.getSeconds()).slice(-2);
  const filename = "output-" + timestamp + ".png";

  setTimeout(() => {
    const binaryBuffer = FS.readFile("/home/web_user/retroarch/userdata/" + filename, {
      flags: 'r',
      encoding: 'binary'
    });
    const b64 = bufferToBase64(binaryBuffer);
    parent.postMessage({
      "type": "screenshot",
      "data": b64,
      "filename": filename,
    }, "*");
  }, 150);
}

function saveSram() {
  Module._cmd_savefiles();
}

function sendSram() {
  saveSram();
  setTimeout(() => {
    const binaryBuffer = FS.readFile("/home/web_user/retroarch/userdata/saves/output.srm", {
      flags: 'r',
      encoding: 'binary'
    });
    const b64 = bufferToBase64(binaryBuffer);
    parent.postMessage({
      "type": "sram",
      "data": b64,
    }, "*");
  }, 150);
}

async function deleteSram() {
  await FS.writeFile("/home/web_user/retroarch/userdata/saves/output.srm", "0");
  console.info("Deleted /home/web_user/retroarch/userdata/saves/output.srm");
}

function notifyLoaded() {
  parent.postMessage({
    "type": "loaded",
  }, "*");
}

var Module = {
  noInitialRun: true,
  preRun: [],
  postRun: [],
  print: function (text) {
    console.log(text);
  },
  printErr: function (text) {
    console.log(text);
  },
  canvas,
  totalDependencies: 0,
  monitorRunDependencies: function (left) {
    this.totalDependencies = Math.max(this.totalDependencies, left);
  },
};

function keyDown(keyCode) {
  canvas.focus();
  document.dispatchEvent(new KeyboardEvent("keydown", { code: keyCode }))
  canvas.blur();
}

function keyUp(keyCode) {
  canvas.focus();
  document.dispatchEvent(new KeyboardEvent("keyup", { code: keyCode }))
  canvas.blur();
}

function keyPress(keyCode) {
  keyDown(keyCode);
  setTimeout(function () { keyUp(keyCode); }, 50);
}