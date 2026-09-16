export function initSearchForm(form) {
  const searchInput = form.querySelector("[name='q']");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const searchTerm = searchInput.value.trim();

    if (!searchTerm) {
      searchInput.setCustomValidity(
        "Enter a product name, brand, or type to search.",
      );
      searchInput.reportValidity();
      return;
    }

    searchInput.setCustomValidity("");
    const searchUrl = new URL(form.action, window.location.origin);
    searchUrl.searchParams.set("q", searchTerm);
    window.location.assign(searchUrl);
  });

  searchInput.addEventListener("input", () =>
    searchInput.setCustomValidity(""),
  );
}
