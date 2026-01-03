// -------------------------------
// This file is incharge of status in the panel. Change values when needen
// -------------------------------
window.statusForParam = function statusForParam(key, value) {
  if (value == null || Number.isNaN(value)) {
    return { label: "No data", color: "var(--accent)" };
  }

  const t = window.thresholds;

  if (key === "do_mgL") {
    if (value >= t.do_mgL.okMin) return { label: "Good", color: "var(--ok)" };
    if (value >= t.do_mgL.warnMin)
      return { label: "Moderate", color: "var(--warn)" };
    return { label: "Poor", color: "var(--bad)" };
  }

  if (key === "ph") {
    if (value >= t.ph.okMin && value <= t.ph.okMax)
      return { label: "Good", color: "var(--ok)" };
    if (value >= t.ph.warnMin && value <= t.ph.warnMax)
      return { label: "Moderate", color: "var(--warn)" };
    return { label: "Poor", color: "var(--bad)" };
  }

  if (key === "bod_mgL") {
    if (value <= t.bod_mgL.okMax) return { label: "Good", color: "var(--ok)" };
    if (value <= t.bod_mgL.warnMax)
      return { label: "Moderate", color: "var(--warn)" };
    return { label: "Poor", color: "var(--bad)" };
  }

  if (key === "nitrate_mgL") {
    if (value <= t.cod_mgL.okMax) return { label: "Good", color: "var(--ok)" };
    if (value <= t.cod_mgL.warnMax)
      return { label: "Moderate", color: "var(--warn)" };
    return { label: "Poor", color: "var(--bad)" };
  }

  if (key === "total_suspended_solids_mgL") {
    if (value <= t.turb_ntu.okMax) return { label: "Good", color: "var(--ok)" };
    if (value <= t.turb_ntu.warnMax)
      return { label: "Moderate", color: "var(--warn)" };
    return { label: "Poor", color: "var(--bad)" };
  }

  if (key === "phospate_mgL") {
    if (value <= t.temp_c.okMax)
      return { label: "Typical", color: "var(--ok)" };
    if (value <= t.temp_c.warnMax)
      return { label: "Warm", color: "var(--warn)" };
    return { label: "High", color: "var(--bad)" };
  }

  return { label: "—", color: "var(--accent)" };
};
