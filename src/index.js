const { default: JSONEditor } = require("jsoneditor");

const defaultConfig = require("./config.json");
const configSchema = require("./schema.json");

import "jsoneditor/dist/jsoneditor.css";
import "./styles.scss";

window.onload = () => {
  initBody();
  listenForSettings();
};

const [getter, setter] = detectBrowser();

const debug = false;
const apiUrl = "https://api.openweathermap.org/dat/2.5/weather";
const appId = "e5b292ae2f9dae5f29e11499c2d82ece";
const searchEngines = {
  Google: "https://www.google.com/search?q=",
  DuckDuckGo: "https://duckduckgo.com/?q=",
  Bing: "https://www.bing.com/search?q=",
  Yahoo: "https://search.yahoo.com/search?p=",
  Ecosia: "https://www.ecosia.org/search?q=",
};

function detectBrowser() {
  if (typeof InstallTrigger != "undefined")
    return [browser.storage.sync.get, browser.storage.sync.set];
  else if (
    !!window.chrome &&
    (!!window.chrome.webstore || !!window.chrome.runtime)
  )
    return [chrome.storage.sync.get, chrome.storage.sync.set];
  else if (typeof BROWSER != "undefined")
    return [BROWSER.storage.sync.get, BROWSER.storage.sync.set];
  return [
    (callback) => {
      const val = localStorage.getItem("startpageSettings");
      callback(val != undefined ? JSON.parse(val) : {});
    },
    (settings) => {
      localStorage.setItem("startpageSettings", JSON.stringify(settings));
    },
  ];
}

function initBody() {
  if (debug) {
    readJson("config.json");
    return;
  }
  getter((result) => {
    Object.keys(result).length == 0
      ? readJson("config.json")
      : parseAndCreate(result);
  });
}

function readJson(filename) {
  parseAndCreate(defaultConfig);
  saveSettings(defaultConfig);
}

function saveSettings(settings) {
  if (debug) return;
  setter(settings);
}

function parseAndCreate(jsonData) {
  console.log(jsonData);
}

const modalEl = document.getElementById("settings");
const closeBtn = document.getElementsByClassName("close")[0];
const jsonContainer = document.getElementById("jsoneditor");
function showSettings() {
  modalEl.style.display = "block";

  const options = {
    mode: "tree",
    modes: ["code", "tree", "view", "preview"],
    schema: configSchema
  };
  const editor = new JSONEditor(jsonContainer, options);

  getter((result) => {
    if (Object.keys(result).length == 0) result = defaultConfig;
    editor.set(result);
  });

  closeBtn.onclick = () => {
    hideSettings(editor);
  };
  return editor;
}

function hideSettings(editor) {
  modalEl.style.display = "none";
  const updatedJson = editor.get();
  setter(updatedJson);
  jsonContainer.innerHTML = "";
  location.reload();
}

let openEditor = null;
function toggleSettings() {
  if (openEditor === null) openEditor = showSettings();
  else {
    hideSettings(openEditor);
    openEditor = null;
  }
}

function listenForSettings() {
  document.onkeyup = (event) => {
    if (event.ctrlKey && event.which == 188) toggleSettings();
  };
}
