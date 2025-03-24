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

let functionMap = {};

// Hide tabs and inputs by default
window.addEventListener("DOMContentLoaded", () => {
  inputField.disabled = true;
  actionBtn.disabled = true;
  inputField.placeholder = "Select a platform to get started";
  inputField.title = "Select a platform from the dropdown above";

  tabButtons.forEach(btn => {
    btn.disabled = true;
    btn.style.display = "none";
    btn.title = "Please select a platform";
  });

  tabContents.forEach(tab => {
    tab.style.display = "none";
  });

  table.style.display = "none";
});

// Tab switching
tabButtons.forEach(button => {
  button.addEventListener("click", () => {
    if (button.disabled) return;

    tabButtons.forEach(btn => btn.classList.remove("active"));
    tabContents.forEach(tab => tab.classList.remove("active"));
    button.classList.add("active");
    document.getElementById(button.dataset.tab).classList.add("active");

    inputField.value = "";
    autocompleteList.innerHTML = "";
    document.getElementById("output").innerHTML = "";

    // ✅ Show table only in list-tab
    if (button.dataset.tab === "list-tab") {
      table.style.display = "table";
      toggleSign.textContent = "−";
      toggleBtn.lastChild.textContent = " Hide Function List";
    } else {
      table.style.display = "none";
    }
  });
});

// Load JSON
fetch("assets/data/functions.json")
  .then(res => res.json())
  .then(data => {
    functionMap = data;
    populateFunctionTable();
  });

// Handle dropdown change
dropdown.addEventListener("change", () => {
  body.classList.remove("powerapps-theme", "powerautomate-theme");

  const selected = dropdown.value;
  const isValid = selected.includes("powerapps") || selected.includes("powerautomate");

  inputField.disabled = !isValid;
  actionBtn.disabled = !isValid;
  inputField.placeholder = isValid ? "Type a function name..." : "Select a platform to get started";
  inputField.title = isValid ? "" : "Select a platform from the dropdown above";

  tabButtons.forEach(btn => {
    btn.disabled = !isValid;
    btn.style.display = isValid ? "block" : "none";
    btn.title = isValid ? "" : "Please select a platform";
  });

  tabContents.forEach(tab => {
    tab.style.display = isValid ? "block" : "none";
  });

  if (isValid && selected.includes("powerapps")) {
    body.classList.add("powerapps-theme");
  } else if (isValid && selected.includes("powerautomate")) {
    body.classList.add("powerautomate-theme");
  }

  inputField.value = "";
  autocompleteList.innerHTML = "";
  document.getElementById("output").innerHTML = "";
  table.style.display = "none";

  populateFunctionTable();
});

// Search
actionBtn.addEventListener("click", () => {
  const platformKey = getPlatformKey();
  const inputKey = inputField.value.trim().toLowerCase();
  const content = functionMap[platformKey]?.[inputKey];
  displayFunction(content);
  inputField.value = "";
  autocompleteList.innerHTML = "";
});

// Autocomplete
inputField.addEventListener("input", () => {
  const platformKey = getPlatformKey();
  const val = inputField.value.trim().toLowerCase();
  autocompleteList.innerHTML = "";

  if (!val || val.length < 3 || !functionMap[platformKey]) return;

  Object.keys(functionMap[platformKey]).forEach(key => {
    if (key.includes(val)) {
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

// Toggle collapse
toggleBtn.addEventListener("click", () => {
  const isVisible = table.style.display !== "none";
  table.style.display = isVisible ? "none" : "table";
  toggleSign.textContent = isVisible ? "+" : "−";
  toggleBtn.lastChild.textContent = isVisible ? " Show Function List" : " Hide Function List";
});

// Click on row
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

// Populate function list
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

// Show selected function
function displayFunction(content) {
  const result = document.getElementById("output");
  if (!result || !content) return;

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

  result.innerHTML = `
    <strong>Function:</strong> ${content.title}<br>
    <strong>Description:</strong> ${content.description}<br><br>
    <strong>Examples:</strong><br>
    ${examplesHTML}
    <br><strong>Official documentation:</strong> <a href="${content.link}" target="_blank">Click here</a>
  `;
}

// Determine platform
function getPlatformKey() {
  return dropdown.value.includes("powerapps")
    ? "powerapps"
    : dropdown.value.includes("powerautomate")
    ? "powerautomate"
    : "";
}
