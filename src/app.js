import { loadData, saveData, exportJson, importJson } from "./storage.js";

let items = loadData();
let currentId = null;

const body = document.getElementById("inventory-body");
const dialog = document.getElementById("item-dialog");

function render() {
  body.innerHTML = "";

  const search = document.getElementById("search").value.toLowerCase();
  const filter = document.getElementById("filter-flag").value;

  const filtered = items.filter(i => {
    if (search) {
      const hay = (i.name + i.note + i.location).toLowerCase();
      if (!hay.includes(search)) return false;
    }
    if (filter === "flagged" && !i.flagged) return false;
    if (filter === "low" && i.quantity > 1) return false;
    return true;
  });

  if (!filtered.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="7" style="text-align:center;">Keine Artikel</td>`;
    body.appendChild(tr);
    return;
  }

  for (const item of filtered) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.flagged ? "⭐" : ""}</td>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>${item.location || "-"}</td>
      <td>${item.date || "-"}</td>
      <td>${item.note || "-"}</td>
      <td>
        <button data-edit="${item.id}">Bearbeiten</button>
        <button data-del="${item.id}">Löschen</button>
      </td>
    `;
    body.appendChild(tr);
  }
}

document.getElementById("btn-add-item").onclick = () => openDialog(null);

body.onclick = e => {
  if (e.target.dataset.edit) openDialog(e.target.dataset.edit);
  if (e.target.dataset.del && confirm("Löschen?")) {
    items = items.filter(i => i.id !== e.target.dataset.del);
    saveData(items);
    render();
  }
};

function openDialog(id) {
  currentId = id;

  const item = id ? items.find(i => i.id === id) : {};

  document.getElementById("item-name").value = item.name || "";
  document.getElementById("item-quantity").value = item.quantity || 0;
  document.getElementById("item-location").value = item.location || "";
  document.getElementById("item-date").value = item.date || "";
  document.getElementById("item-note").value = item.note || "";
  document.getElementById("item-flagged").checked = item.flagged || false;

  dialog.showModal();
}

dialog.addEventListener("close", () => {
  if (dialog.returnValue !== "save") return;

  const item = {
    id: currentId ?? crypto.randomUUID(),
    name: document.getElementById("item-name").value.trim(),
    quantity: Number(document.getElementById("item-quantity").value),
    location: document.getElementById("item-location").value.trim(),
    date: document.getElementById("item-date").value,
    note: document.getElementById("item-note").value.trim(),
    flagged: document.getElementById("item-flagged").checked,
  };

  const index = items.findIndex(i => i.id === item.id);
  if (index === -1) items.push(item);
  else items[index] = item;

  saveData(items);
  render();
});

document.getElementById("search").oninput = render;
document.getElementById("filter-flag").onchange = render;

document.getElementById("btn-export").onclick = () => exportJson(items);

document.getElementById("input-import").onchange = async e => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    items = await importJson(file);
    saveData(items);
    render();
  } catch {
    alert("Ungültige JSON-Datei");
  }
};

render();
