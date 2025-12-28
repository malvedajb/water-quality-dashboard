window.selectedId = null;

window.renderList = function renderList(filterText = "") {
  const list = document.getElementById("stationList");
  list.innerHTML = "";

  const q = filterText.trim().toLowerCase();
  const filtered = window.STATIONS.filter((s) => {
    if (!q) return true;
    return (s.name + " " + (s.municipality || "") + " " + (s.code || ""))
      .toLowerCase()
      .includes(q);
  });

  filtered.forEach((st) => {
    const item = document.createElement("div");
    item.className = "station-item" + (st.id === window.selectedId ? " active" : "");
    item.onclick = () => window.selectStation(st.id, true);

    const left = document.createElement("div");

    const name = document.createElement("div");
    name.className = "station-name";
    name.textContent = st.name;

    const meta = document.createElement("div");
    meta.className = "station-meta";
    meta.textContent = `${st.municipality || "Laguna de Bay"} • ${st.code || st.id}`;

    left.appendChild(name);
    left.appendChild(meta);

    const badge = document.createElement("div");
    badge.className = "badge";
    badge.textContent = "Click";

    item.appendChild(left);
    item.appendChild(badge);
    list.appendChild(item);
  });
};

window.renderParamCards = function renderParamCards(st) {
  const cards = document.getElementById("paramCards");
  cards.innerHTML = "";

  const specs = [
    { key: "do_mgL", label: "Dissolved Oxygen", unit: "mg/L" },
    { key: "ph", label: "pH Level", unit: "" },
    { key: "bod_mgL", label: "BOD", unit: "mg/L" },
    { key: "cod_mgL", label: "COD", unit: "mg/L" },
    { key: "turb_ntu", label: "Turbidity", unit: "NTU" },
    { key: "temp_c", label: "Temperature", unit: "°C" }
  ];

  specs.forEach((s) => {
    const v = st.parameters[s.key];
    const stt = window.statusForParam(s.key, v);

    const card = document.createElement("div");
    card.className = "card";

    const lab = document.createElement("div");
    lab.className = "label";
    lab.textContent = s.label;

    const val = document.createElement("div");
    val.className = "value";
    val.innerHTML = `${v ?? "—"} <span class="unit">${s.unit}</span>`;

    const status = document.createElement("div");
    status.className = "status";
    status.innerHTML = `<span class="dot" style="background:${stt.color}; box-shadow:0 0 0 3px rgba(255,255,255,.08)"></span> ${stt.label}`;

    card.appendChild(lab);
    card.appendChild(val);
    card.appendChild(status);
    cards.appendChild(card);
  });
};
