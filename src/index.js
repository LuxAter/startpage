const _ = require("lodash");
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

const debug = true;
const apiUrl = "https://api.openweathermap.org/dat/2.5/weather";
const appId = "e5b292ae2f9dae5f29e11499c2d82ece";
const searchEngines = {
  Google: "https://www.google.com/search?q=",
  DuckDuckGo: "https://duckduckgo.com/?q=",
  Bing: "https://www.bing.com/search?q=",
  Yahoo: "https://search.yahoo.com/search?p=",
  Ecosia: "https://www.ecosia.org/search?q=",
};

let greeterEl = null;
let clockEl = null;
let weatherEl = null;

function detectBrowser() {
  if (typeof InstallTrigger != "undefined")
    return [browser.storage.sync.get, browser.storage.sync.set];
  else if (
    !!window.chrome &&
    (!!window.chrome.webstore || !!window.chrome.runtime) &&
    !!window.chrome.storage
  )
    return [chrome.storage.sync.get, chrome.storage.sync.set];
  else if (typeof BROWSER != "undefined" && typeof BROWSER.storage != "undefined")
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
  setter(settings);
}

function setStyle(element, style) {
  var styleString = ""
  _.forEach(style, (value, key) => {styleString += `${key}:${value};`;});
  element.style = styleString.slice(0, -1);
}

function stylePage(theme) {
  setStyle(document.body, {"background": theme["bg"], "color": theme["fg"]});
}

function configureElements(jsonData) {
  const greeterLine = ("greeter" in jsonData && jsonData["greeter"]["enabled"]) ? jsonData["greeter"]["line"] : 0;
  const clockLine = ("clock" in jsonData && jsonData["clock"]["enabled"]) ? jsonData["clock"]["line"] : 0;
  const weatherLine = ("weather" in jsonData && jsonData["weather"]["enabled"]) ? jsonData["weather"]["line"] : 0;

  if (greeterLine === 1 || clockLine === 1 || weatherLine == 1) {
    document.getElementById('line1').style.display = 'block';
  } else {
    document.getElementById('line1').style.display = 'none';
  }
  if (greeterLine === 2 || clockLine === 2 || weatherLine == 2) {
    document.getElementById('line2').style.display = 'block';
  } else {
    document.getElementById('line2').style.display = 'none';
  }
  if (greeterLine === 3 || clockLine === 3 || weatherLine == 3) {
    document.getElementById('line3').style.display = 'block';
  } else {
    document.getElementById('line3').style.display = 'none';
  }

  if (greeterLine === clockLine && greeterLine !== 0) {
    document.getElementById(`greeterClockSep${greeterLine}`).style.display = 'inline-block';
  } else {
    document.getElementById(`greeterClockSep${greeterLine}`).style.display = 'none';
  }
  if (clockLine === weatherLine && clockLine !== 0) {
    document.getElementById(`clockWeatherSep${clockLine}`).style.display = 'inline-block';
  } else {
    document.getElementById(`clockWeatherSep${clockLine}`).style.display = 'none';

  }
  if (greeterLine === weatherLine && greeterLine !== 0 && clockLine !== greeterLine) {
    document.getElementById(`greeterWeatherSep${greeterLine}`).style.display = 'inline-block';
  } else {
    document.getElementById(`greeterWeatherSep${greeterLine}`).style.display = 'none';
  }

  if (greeterLine !== 0) {
    greeterEl = document.getElementById(`greeter${greeterLine}`);
    greeterEl.style.display = 'inline-block';
  } else if(greeterEl !== null) {
    greeterEl.style.display = 'none';
    greeterEl = null;
  }
  if (clockLine !== 0) {
    clockEl = document.getElementById(`clock${clockLine}`);
    clockEl.style.display = 'inline-block';
  } else if(clockEl !== null) {
    clockEl.style.display = 'none';
    clockEl = null;
  }
  if (weatherLine !== 0) {
    weatherEl = document.getElementById(`weather${weatherLine}`);
    weatherEl.style.display = 'inline-block';
  } else if(weatherEl !== null) {
    weatherEl.style.display = 'none';
    weatherEl = null;
  }
}

function parseAndCreate(jsonData) {
  if ("theme" in jsonData)
    stylePage(jsonData["theme"]);
  configureElements(jsonData);

}

let openEditor = null;
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
  parseAndCreate(updatedJson);
  // location.reload();
}

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
