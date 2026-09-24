import { initSearchForm } from "./search-form.mjs";
import { loadHeaderFooter } from "./utils.mjs";

async function initApp() {
  await loadHeaderFooter();
  initSearchForm(document.querySelector(".search-form"));
}

initApp();
