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

async function processCommand(evt) {
  switch (evt.data.command) {
    case "start":
      romData = dataURItoBuffer(evt.data.data);
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
    case "keyPress":
      keyPress(evt.data.data);
      break;
  }
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
  canvas,
  totalDependencies: 0,
  monitorRunDependencies: function (left) {
    this.totalDependencies = Math.max(this.totalDependencies, left);
  },
};

function keyPress(k) {
  canvas.focus();
  document.dispatchEvent(new KeyboardEvent("keydown", { code: k }))
  setTimeout(function () {
    document.dispatchEvent(new KeyboardEvent("keyup", { code: k }))
  }, 50);
  canvas.blur();
}
