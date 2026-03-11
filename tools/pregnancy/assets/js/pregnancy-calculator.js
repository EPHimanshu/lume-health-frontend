(function () {
  const utils = window.LumePregnancyUtils;
  if (!utils) return;

  function getTrimester(totalDaysElapsed) {
    if (totalDaysElapsed < 0) return "";
    if (totalDaysElapsed < 14 * 7) return "First trimester";
    if (totalDaysElapsed < 28 * 7) return "Second trimester";
    return "Third trimester";
  }

  function getWeekAndDay(totalDaysElapsed) {
    const safeDays = Math.max(totalDaysElapsed, 0);
    const weeks = Math.floor(safeDays / 7);
    const days = safeDays % 7;
    return { weeks, days };
  }

  function buildMilestoneWindows(estimatedLmpDate) {
    const definitions = [
      { label: "First visit window", startDay: 42, endDay: 56 },
      { label: "NT scan window", startDay: 77, endDay: 98 },
      { label: "Anomaly scan window", startDay: 126, endDay: 154 },
      { label: "Glucose screening window", startDay: 168, endDay: 196 },
    ];

    return definitions.map((item) => ({
      label: item.label,
      start: utils.addDays(estimatedLmpDate, item.startDay),
      end: utils.addDays(estimatedLmpDate, item.endDay),
    }));
  }

  function buildImportantDates(estimatedLmpDate, estimatedDueDate) {
    return {
      firstTrimesterEnd: utils.addDays(estimatedLmpDate, 13 * 7 + 6),
      secondTrimesterEnd: utils.addDays(estimatedLmpDate, 27 * 7 + 6),
      fullTermStart: utils.addDays(estimatedLmpDate, 37 * 7),
      fullTermEnd: utils.addDays(estimatedLmpDate, 40 * 7),
      estimatedDueDate,
    };
  }

  function buildPregnancyResult(estimatedLmpDate, estimatedDueDate, today) {
    const totalDaysElapsed = utils.daysBetween(estimatedLmpDate, today);
    const weekData = getWeekAndDay(totalDaysElapsed);
    const estimatedConceptionDate = utils.addDays(estimatedLmpDate, 14);

    return {
      estimatedLmpDate,
      estimatedDueDate,
      estimatedConceptionDate,
      gestationalWeeks: weekData.weeks,
      gestationalDaysRemainder: weekData.days,
      totalPregnancyDaysElapsed: totalDaysElapsed,
      trimester: getTrimester(totalDaysElapsed),
      importantDates: buildImportantDates(estimatedLmpDate, estimatedDueDate),
      milestoneWindows: buildMilestoneWindows(estimatedLmpDate),
    };
  }

  function validateCycleLength(cycleLength) {
    if (!utils.isValidNumber(cycleLength) || cycleLength < 21 || cycleLength > 45) {
      throw new Error("Please enter a valid cycle length between 21 and 45 days.");
    }
  }

  function validateEmbryoAge(embryoAgeDays) {
    if (![3, 5].includes(embryoAgeDays)) {
      throw new Error("Please select a valid embryo age.");
    }
  }

  function validateUltrasoundInputs(weeks, days) {
    if (!utils.isValidNumber(weeks) || weeks < 0 || weeks > 45) {
      throw new Error("Please enter valid pregnancy weeks for the ultrasound method.");
    }
    if (!utils.isValidNumber(days) || days < 0 || days > 6) {
      throw new Error("Please enter valid pregnancy days between 0 and 6.");
    }
  }

  function calculateFromLmp(lmpDate, cycleLength = 28, today = new Date()) {
    validateCycleLength(cycleLength);
    const cycleAdjustment = cycleLength - 28;
    const estimatedDueDate = utils.addDays(lmpDate, 280 + cycleAdjustment);
    return buildPregnancyResult(lmpDate, estimatedDueDate, today);
  }

  function calculateFromDueDate(dueDate, today = new Date()) {
    const estimatedLmpDate = utils.addDays(dueDate, -280);
    return buildPregnancyResult(estimatedLmpDate, dueDate, today);
  }

  function calculateFromConception(conceptionDate, today = new Date()) {
    const estimatedDueDate = utils.addDays(conceptionDate, 266);
    const estimatedLmpDate = utils.addDays(conceptionDate, -14);
    return buildPregnancyResult(estimatedLmpDate, estimatedDueDate, today);
  }

  function calculateFromIvf(transferDate, embryoAgeDays = 5, today = new Date()) {
    validateEmbryoAge(embryoAgeDays);
    const lmpOffset = 14 - embryoAgeDays;
    const estimatedLmpDate = utils.addDays(transferDate, -lmpOffset);
    const estimatedDueDate = utils.addDays(estimatedLmpDate, 280);
    return buildPregnancyResult(estimatedLmpDate, estimatedDueDate, today);
  }

  function calculateFromUltrasound(ultrasoundDate, pregnancyWeeks, pregnancyDays, today = new Date()) {
    validateUltrasoundInputs(pregnancyWeeks, pregnancyDays);
    const elapsedDaysAtScan = pregnancyWeeks * 7 + pregnancyDays;
    const estimatedLmpDate = utils.addDays(ultrasoundDate, -elapsedDaysAtScan);
    const estimatedDueDate = utils.addDays(estimatedLmpDate, 280);
    return buildPregnancyResult(estimatedLmpDate, estimatedDueDate, today);
  }

  window.LumePregnancyCalculator = {
    calculateFromLmp,
    calculateFromDueDate,
    calculateFromConception,
    calculateFromIvf,
    calculateFromUltrasound,
  };
})();