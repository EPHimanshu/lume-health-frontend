(function () {
  async function loadPartial(targetId, partialPath) {
    const target = document.getElementById(targetId);
    if (!target) return;

    try {
      const response = await fetch(partialPath);
      if (!response.ok) {
        throw new Error(`Failed to load ${partialPath}: ${response.status}`);
      }
      target.innerHTML = await response.text();
    } catch (error) {
      console.error(error);
    }
  }

  function initDrawer() {
    const menuToggle = document.getElementById("menuToggle");
    const mobileDrawer = document.getElementById("mobileDrawer");
    const drawerClose = document.getElementById("drawerClose");
    const drawerBackdrop = document.getElementById("drawerBackdrop");

    function openDrawer() {
      if (!mobileDrawer || !menuToggle) return;
      mobileDrawer.classList.add("open");
      mobileDrawer.setAttribute("aria-hidden", "false");
      menuToggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("drawer-open");
    }

    function closeDrawer() {
      if (!mobileDrawer || !menuToggle) return;
      mobileDrawer.classList.remove("open");
      mobileDrawer.setAttribute("aria-hidden", "true");
      menuToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("drawer-open");
    }

    if (menuToggle) menuToggle.addEventListener("click", openDrawer);
    if (drawerClose) drawerClose.addEventListener("click", closeDrawer);
    if (drawerBackdrop) drawerBackdrop.addEventListener("click", closeDrawer);
  }

  async function initLayout() {
    await loadPartial("site-header", "/partials/header.html");
    await loadPartial("site-footer", "/partials/footer.html");
    initDrawer();
  }

  document.addEventListener("DOMContentLoaded", initLayout);
})();