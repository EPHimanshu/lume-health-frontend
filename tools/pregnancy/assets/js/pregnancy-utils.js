(function () {
  function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function parseDateInput(value) {
    if (!value) return null;
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : startOfDay(date);
  }

  function isValidDate(date) {
    return date instanceof Date && !Number.isNaN(date.getTime());
  }

  function isValidNumber(value) {
    return typeof value === "number" && !Number.isNaN(value);
  }

  function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return startOfDay(d);
  }

  function daysBetween(dateA, dateB) {
    const a = startOfDay(dateA).getTime();
    const b = startOfDay(dateB).getTime();
    return Math.floor((b - a) / (1000 * 60 * 60 * 24));
  }

  function clamp(number, min, max) {
    return Math.min(Math.max(number, min), max);
  }

  function formatDate(date) {
    if (!isValidDate(date)) return "—";
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  }

  function formatDateRange(startDate, endDate) {
    return `${formatDate(startDate)} – ${formatDate(endDate)}`;
  }

  function scrollToElement(element) {
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function serializeQuery(params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, String(value));
      }
    });
    return searchParams.toString();
  }

  window.LumePregnancyUtils = {
    startOfDay,
    parseDateInput,
    isValidDate,
    isValidNumber,
    addDays,
    daysBetween,
    clamp,
    formatDate,
    formatDateRange,
    scrollToElement,
    serializeQuery,
  };
})();