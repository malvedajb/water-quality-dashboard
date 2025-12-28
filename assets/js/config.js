// js/config.js
// -----------------------------
// Configuration (thresholds)
// -----------------------------
window.thresholds = {
  do_mgL: { okMin: 5, warnMin: 3 }, // Dissolved Oxygen
  ph: { okMin: 6.5, okMax: 8.5, warnMin: 6.0, warnMax: 9.0 },
  bod_mgL: { okMax: 3, warnMax: 6 }, // lower is better
  cod_mgL: { okMax: 20, warnMax: 40 }, // lower is better
  turb_ntu: { okMax: 10, warnMax: 25 }, // lower is better
  temp_c: { okMax: 32, warnMax: 35 } // demo only
};
