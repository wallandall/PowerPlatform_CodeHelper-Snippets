const dropdown = document.getElementById("resources");
const inputField = document.getElementById("inputField");
const actionBtn = document.getElementById("actionBtn");
const body = document.body;
const autocompleteList = document.getElementById("autocompleteList");
const table = document.getElementById("functionTable");
const toggleBtn = document.getElementById("toggleTableBtn");
const toggleSign = toggleBtn.querySelector(".toggle-sign");
const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");
const output = document.getElementById("output");

let functionMap = {};

window.addEventListener("DOMContentLoaded", () => {
  resetUI();
  output.innerHTML = `
  <div>
    <p><strong>Power Platform CodeHelper Snippets</strong> is a Chrome extension designed to help developers quickly find and understand functions used in Power Apps and Power Automate.</p>
    <p><strong>Instructions:</strong> Select an option from the dropdown above to search for specific functions, or use the Function Table to view a full list.</p>
    <p><strong>Version:</strong> 1.0.0</p>
  </div>
  `;
});

function resetUI() {
  inputField.disabled = true;
  inputField.style.display = "none";
  actionBtn.style.display = "none";
  inputField.value = "";
  output.innerHTML = "";
  autocompleteList.innerHTML = "";
  inputField.placeholder = "Select a platform to get started";
  inputField.title = "Select a platform from the dropdown above";

  tabButtons.forEach(btn => {
    btn.disabled = true;
    btn.style.display = "none";
    btn.classList.remove("active");
  });

  tabContents.forEach(tab => {
    tab.style.display = "none";
    tab.classList.remove("active");
  });

  table.style.display = "none";
  toggleBtn.style.display = "none";
  toggleSign.textContent = "+";
  toggleBtn.lastChild.textContent = " Show Function List";
  body.classList.remove("powerapps-theme", "powerautomate-theme");
}

// Dropdown change
dropdown.addEventListener("change", () => {
  resetUI();
  const selected = dropdown.value;
  const isValid = selected.includes("powerapps") || selected.includes("powerautomate");

  if (!isValid) {
    output.innerHTML = `
    <div>
      <p><strong>Power Platform CodeHelper Snippets</strong> is a Chrome extension designed to help developers quickly find and understand functions used in Power Apps and Power Automate.</p>
      <p><strong>Instructions:</strong> Select an option from the dropdown above to search for specific functions, or use the Function Table to view a full list.</p>
      <p><strong>Version:</strong> 1.0.0</p>
    </div>
    `;
    return;
  }

  if (selected.includes("powerapps")) {
    body.classList.add("powerapps-theme");
  } else if (selected.includes("powerautomate")) {
    body.classList.add("powerautomate-theme");
  }

  inputField.disabled = false;
  inputField.style.display = "inline-block";
  inputField.placeholder = "Type a function name...";
  inputField.title = "";

  tabButtons.forEach(btn => {
    btn.disabled = false;
    btn.style.display = "block";
    btn.title = "";
  });

  const searchTabButton = document.querySelector('[data-tab="search-tab"]');
  const searchTabContent = document.getElementById("search-tab");
  searchTabButton.classList.add("active");
  searchTabContent.classList.add("active");
  searchTabContent.style.display = "block";
});

// Tab switching
tabButtons.forEach(button => {
  button.addEventListener("click", () => {
    if (button.disabled) return;

    tabButtons.forEach(btn => btn.classList.remove("active"));
    tabContents.forEach(tab => tab.classList.remove("active"));
    button.classList.add("active");
    const tabId = button.dataset.tab;
    const tabContent = document.getElementById(tabId);
    tabContent.classList.add("active");
    tabContent.style.display = "block";

    inputField.value = "";
    autocompleteList.innerHTML = "";
    output.innerHTML = "";

    const isListTab = tabId === "list-tab";
    inputField.style.display = isListTab ? "none" : "inline-block";
    toggleBtn.style.display = isListTab ? "inline-block" : "none";
    table.style.display = isListTab ? "table" : "none";
    toggleSign.textContent = isListTab ? "−" : "+";
    toggleBtn.lastChild.textContent = isListTab ? " Hide Function List" : " Show Function List";

    if (isListTab) {
      populateFunctionTable();
    }
  });
});

inputField.addEventListener("input", () => {
  const val = inputField.value.trim();
  output.innerHTML = "";
  autocompleteList.innerHTML = "";

  const platformKey = getPlatformKey();
  if (val.length < 2 || !functionMap[platformKey]) return;

  Object.keys(functionMap[platformKey]).forEach(key => {
    if (key.includes(val.toLowerCase())) {
      const li = document.createElement("li");
      li.textContent = functionMap[platformKey][key].title;
      li.dataset.key = key;
      autocompleteList.appendChild(li);
    }
  });
});

autocompleteList.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    const key = e.target.dataset.key;
    const platformKey = getPlatformKey();
    const content = functionMap[platformKey]?.[key];
    displayFunction(content);
    inputField.value = "";
    autocompleteList.innerHTML = "";
  }
});

toggleBtn.addEventListener("click", () => {
  const isVisible = table.style.display !== "none";
  if (isVisible) {
    table.style.display = "none";
    output.innerHTML = "";
    toggleSign.textContent = "+";
    toggleBtn.lastChild.textContent = " Show Function List";
  } else {
    table.style.display = "table";
    toggleSign.textContent = "−";
    toggleBtn.lastChild.textContent = " Hide Function List";
  }
});

document.querySelector("#functionTable tbody").addEventListener("click", (e) => {
  const row = e.target.closest("tr");
  if (!row) return;
  const platformKey = getPlatformKey();
  const key = row.dataset.key;
  const content = functionMap[platformKey]?.[key];
  displayFunction(content);
  table.style.display = "none";
  toggleSign.textContent = "+";
  toggleBtn.lastChild.textContent = " Show Function List";
});

function populateFunctionTable() {
  const tableBody = document.querySelector("#functionTable tbody");
  tableBody.innerHTML = "";
  const platformKey = getPlatformKey();
  const functions = functionMap[platformKey];
  if (!functions) return;

  Object.keys(functions).sort().forEach(key => {
    const func = functions[key];
    const row = document.createElement("tr");
    row.dataset.key = key;
    row.innerHTML = `<td>${func.title}</td><td>${func.description}</td>`;
    tableBody.appendChild(row);
  });
}

function displayFunction(content) {
  if (!output || !content) return;
  let examplesHTML = "";

  if (Array.isArray(content.examples)) {
    examplesHTML = content.examples.map((ex, index) => `
      <div class="example-block">
        <div class="example-desc">${ex.description}</div>
        <code class="example-code">${ex.code}</code>
        ${index < content.examples.length - 1 ? '<hr class="example-separator"/>' : ''}
      </div>
    `).join("");
  }

  output.innerHTML = `
    <strong>Function: </strong> ${content.title}<br><br>
    <strong>Syntax:</strong> <br><code class="example-code">${content.syntax}</code><br>
    <strong>Description:</strong> <br>${content.description}<br><br>
    <strong>Examples:</strong><br>
    ${examplesHTML}
    <br><strong>Official documentation:</strong> <a href="${content.link}" target="_blank">Click here</a>
  `;
}

function getPlatformKey() {
  return dropdown.value.includes("powerapps")
    ? "powerapps"
    : dropdown.value.includes("powerautomate")
    ? "powerautomate"
    : "";
}

fetch("assets/data/functions.json")
  .then(res => res.json())
  .then(data => {
    functionMap = data;
    populateFunctionTable();
  });
