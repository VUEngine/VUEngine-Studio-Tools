var BrowserFS = BrowserFS;
var afs;
var romData;
var coreOptions = "";
var retroarchConfig = "";

let dataURItoBuffer = (dataURI) => {
  let byteString = atob(dataURI.split(",")[1]);

  let ab = new ArrayBuffer(byteString.length);
  let ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return ia;
};

async function processCommand(evt) {
  switch (evt.data.command) {
    case "start":
      romData = dataURItoBuffer(evt.data.data);
      init();
      idbfsInit();
      break;
    case "setRetroArchConfig":
      retroarchConfig = evt.data.data;
      break;
    case "setCoreOptions":
      coreOptions = evt.data.data;
      break;
    case "clean":
      cleanupStorage();
      break;
    case "togglePause":
      keyPress("Space");
      break;
    case "reset":
      keyPress("F10");
      break;
    case "fullscreen":
      Module.requestFullscreen(true);
      break;
    case "mute":
      keyPress("F3");
      break;
    case "increaseSaveSlot":
      keyPress("F7");
      break;
    case "decreaseSaveSlot":
      keyPress("F6");
      break;
    case "loadState":
      Module._cmd_load_state();
      break;
    case "saveState":
      Module._cmd_save_state();
      break;
    case "rewind":
      keyPress("ArrowLeft");
      break;
    case "frameAdvance":
      keyPress("ArrowUp");
      break;
    case "fastForward":
      keyPress("ArrowRight");
      break;
  }

  document.getElementById("canvas").focus();
}
window.addEventListener("message", processCommand);

function cleanupStorage() {
  localStorage.clear();
  if (BrowserFS.FileSystem.IndexedDB.isAvailable()) {
    var req = indexedDB.deleteDatabase("RetroArch");
    req.onsuccess = function () {
      console.log("Deleted database successfully");
    };
    req.onerror = function () {
      console.log("Couldn't delete database");
    };
    req.onblocked = function () {
      console.log(
        "Couldn't delete database due to the operation being blocked"
      );
    };
  }
}

function idbfsInit() {
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
      }, "RetroArch")
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
  FS.createPath(
    "/",
    "home/web_user/retroarch/userdata/content/rom",
    true,
    true
  );
  await FS.writeFile(
    "/home/web_user/retroarch/userdata/content/rom/output.vb",
    romData
  );

  FS.createPath(
    "/",
    "home/web_user/retroarch/userdata/content/config",
    true,
    true
  );
  await FS.writeFile(
    "/home/web_user/retroarch/userdata/content/config/retroarch.cfg",
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
    //  "-v",
    "/home/web_user/retroarch/userdata/content/rom/output.vb",
    "--appendconfig",
    "/home/web_user/retroarch/userdata/content/config/retroarch.cfg",
  ]);

  Module.setCanvasSize(window.innerWidth, window.innerHeight);
  document.getElementById("canvas").focus();
}

window.onresize = () => {
  Module.setCanvasSize(window.innerWidth, window.innerHeight);
};

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
  canvas: document.getElementById("canvas"),
  totalDependencies: 0,
  monitorRunDependencies: function (left) {
    this.totalDependencies = Math.max(this.totalDependencies, left);
  },
};

function init() {
  var keys = {
    9: "tab",
    13: "enter",
    16: "shift",
    18: "alt",
    27: "esc",
    32: "space",
    33: "rePag",
    34: "avPag",
    35: "end",
    36: "home",
    37: "left",
    38: "up",
    39: "right",
    40: "down",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
  };
  window.addEventListener("keydown", function (e) {
    if (keys[e.which]) {
      e.preventDefault();
    }
  });
}

function keyPress(k) {
  kp(k, "keydown");
  setTimeout(function () {
    kp(k, "keyup");
  }, 50);
}

kp = function (k, event) {
  var oEvent = new KeyboardEvent(event, { code: k });

  document.dispatchEvent(oEvent);
  document.getElementById("canvas").focus();
};
