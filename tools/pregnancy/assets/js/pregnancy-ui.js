(function () {
  const utils = window.LumePregnancyUtils;
  const calculator = window.LumePregnancyCalculator;

  if (!utils || !calculator) return;

  // Local: use FastAPI on localhost
  // Live: use same-domain endpoints like /click and /tool-usage
  const API_BASE_URL =
    window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
      ? "http://127.0.0.1:8000"
      : "";

  const form = document.getElementById("pregnancy-form");
  const methodInput = document.getElementById("method");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".form-panel");
  const formError = document.getElementById("form-error");
  const resultsSection = document.getElementById("results-section");
  const relatedTestLinks = document.querySelectorAll("[data-related-test-link]");

  function setActiveMethod(method) {
    if (!methodInput) return;

    methodInput.value = method;

    tabButtons.forEach((button) => {
      const isActive = button.dataset.method === method;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    });

    panels.forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.panel === method);
    });

    if (formError) {
      formError.textContent = "";
    }
  }

  function getToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  function getNumberValue(id, fallback = null) {
    const input = document.getElementById(id);
    if (!input) return fallback;

    const raw = input.value;
    if (raw === "" || raw === null || raw === undefined) return fallback;

    const value = Number(raw);
    return Number.isNaN(value) ? fallback : value;
  }

  function getDateValue(id) {
    const input = document.getElementById(id);
    if (!input) return null;
    return utils.parseDateInput(input.value);
  }

  function validateAndCalculate() {
    if (!methodInput) {
      throw new Error("Calculation method field is missing.");
    }

    const method = methodInput.value;
    const today = getToday();

    if (method === "lmp") {
      const lmpDate = getDateValue("lmpDate");
      const cycleLength = getNumberValue("cycleLength", 28);

      if (!lmpDate) {
        throw new Error("Please select the first day of your last period.");
      }

      return calculator.calculateFromLmp(lmpDate, cycleLength, today);
    }

    if (method === "dueDate") {
      const dueDate = getDateValue("dueDate");

      if (!dueDate) {
        throw new Error("Please select your due date.");
      }

      return calculator.calculateFromDueDate(dueDate, today);
    }

    if (method === "conception") {
      const conceptionDate = getDateValue("conceptionDate");

      if (!conceptionDate) {
        throw new Error("Please select your conception date.");
      }

      return calculator.calculateFromConception(conceptionDate, today);
    }

    if (method === "ivf") {
      const ivfTransferDate = getDateValue("ivfTransferDate");
      const embryoAgeDays = getNumberValue("embryoAgeDays", 5);

      if (!ivfTransferDate) {
        throw new Error("Please select your IVF transfer date.");
      }

      return calculator.calculateFromIvf(ivfTransferDate, embryoAgeDays, today);
    }

    if (method === "ultrasound") {
      const ultrasoundDate = getDateValue("ultrasoundDate");
      const pregnancyWeeks = getNumberValue("pregnancyWeeks");
      const pregnancyDays = getNumberValue("pregnancyDays");

      if (!ultrasoundDate) {
        throw new Error("Please select your ultrasound date.");
      }

      if (pregnancyWeeks === null || pregnancyDays === null) {
        throw new Error("Please enter pregnancy weeks and days for the ultrasound method.");
      }

      return calculator.calculateFromUltrasound(
        ultrasoundDate,
        pregnancyWeeks,
        pregnancyDays,
        today
      );
    }

    throw new Error("Please select a valid calculation method.");
  }

  function renderList(containerId, rows) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = rows
      .map(
        (row) => `
          <li>
            <strong>${row.label}</strong>
            <span>${row.value}</span>
          </li>
        `
      )
      .join("");
  }

  function renderResults(result) {
    const dueDateEl = document.getElementById("result-due-date");
    const currentWeekEl = document.getElementById("result-current-week");
    const trimesterEl = document.getElementById("result-trimester");
    const conceptionEl = document.getElementById("result-conception-window");

    if (dueDateEl) {
      dueDateEl.textContent = utils.formatDate(result.estimatedDueDate);
    }

    if (currentWeekEl) {
      currentWeekEl.textContent = `${result.gestationalWeeks} weeks ${result.gestationalDaysRemainder} days`;
    }

    if (trimesterEl) {
      trimesterEl.textContent = result.trimester || "Not available";
    }

    if (conceptionEl) {
      conceptionEl.textContent = utils.formatDate(result.estimatedConceptionDate);
    }

    renderList("important-dates-list", [
      {
        label: "First trimester ends",
        value: utils.formatDate(result.importantDates.firstTrimesterEnd),
      },
      {
        label: "Second trimester ends",
        value: utils.formatDate(result.importantDates.secondTrimesterEnd),
      },
      {
        label: "Full-term window starts",
        value: utils.formatDate(result.importantDates.fullTermStart),
      },
      {
        label: "Estimated due date",
        value: utils.formatDate(result.importantDates.estimatedDueDate),
      },
    ]);

    renderList(
      "milestones-list",
      result.milestoneWindows.map((item) => ({
        label: item.label,
        value: utils.formatDateRange(item.start, item.end),
      }))
    );

    if (resultsSection) {
      resultsSection.classList.remove("hidden");
      utils.scrollToElement(resultsSection);
    }
  }

  async function postJson(path, payload) {
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.warn(`Request failed: ${path}`, response.status);
      }
    } catch (error) {
      console.warn(`Request error: ${path}`, error);
    }
  }

  function logToolUsage(method) {
    return postJson("/tool-usage", {
      tool_name: "pregnancy_calculator",
      method_used: method,
      source_page: "pregnancy-calculator",
    });
  }

  function logRelatedTestClick({ ctaName, targetUrl, testName }) {
    return postJson("/click", {
      event_type: "related_test_click",
      source_page: "pregnancy-calculator",
      cta_name: ctaName,
      target_url: targetUrl,
      test_name: testName,
    });
  }

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveMethod(button.dataset.method);
    });
  });

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (formError) {
        formError.textContent = "";
      }

      try {
        const result = validateAndCalculate();
        renderResults(result);
        logToolUsage(methodInput ? methodInput.value : "unknown");
      } catch (error) {
        if (formError) {
          formError.textContent =
            error && error.message
              ? error.message
              : "Something went wrong. Please check your inputs.";
        }
      }
    });
  }

  relatedTestLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const ctaName = link.dataset.ctaName || link.textContent.trim();
      const testName = link.dataset.testName || "";
      const targetUrl = link.getAttribute("href") || "";

      logRelatedTestClick({
        ctaName,
        targetUrl,
        testName,
      });
    });
  });

  setActiveMethod("lmp");
})();