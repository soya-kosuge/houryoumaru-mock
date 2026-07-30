
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".header-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => nav.classList.toggle("is-open"));
  }

  document.querySelectorAll("[data-search-input]").forEach((input) => {
    const target = document.querySelector(input.dataset.searchInput);
    if (!target) return;
    input.addEventListener("input", () => {
      const keyword = input.value.trim().toLowerCase();
      target.querySelectorAll("[data-search-row]").forEach((row) => {
        row.hidden = keyword && !row.textContent.toLowerCase().includes(keyword);
      });
    });
  });

  document.querySelectorAll("[data-confirm]").forEach((element) => {
    element.addEventListener("click", (event) => {
      if (!window.confirm(element.dataset.confirm)) event.preventDefault();
    });
  });

  document.querySelectorAll("[data-demo-submit]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = form.dataset.demoSubmit || "保存しました";
      window.alert(message);
      const redirect = form.dataset.redirect;
      if (redirect) window.location.href = redirect;
    });
  });

  document.querySelectorAll("[data-edit-row]").forEach((button) => {
    button.addEventListener("click", () => {
      const row = button.closest("tr");
      if (!row) return;
      const editing = button.dataset.editing === "true";
      row.querySelectorAll("td[data-editable]").forEach((cell) => {
        if (!editing) {
          const value = cell.textContent.trim();
          cell.dataset.original = value;
          cell.innerHTML = `<input class="input" value="${value.replace(/&/g,'&amp;').replace(/"/g,'&quot;')}">`;
        } else {
          const input = cell.querySelector("input");
          if (input) cell.textContent = input.value;
        }
      });
      button.dataset.editing = String(!editing);
      button.textContent = editing ? "修正" : "保存";
      if (editing) window.alert("保存しました");
    });
  });
});
