const getSecondsUntil = (endDateInSeconds) =>
  Math.round(endDateInSeconds - Date.now() / 1000);

const updateCountdown = (
  endDateInSeconds,
  countdownContainer,
  countdownText,
  element,
  intervalId,
) => {
  const secondsToEndDate = getSecondsUntil(endDateInSeconds);

  if (secondsToEndDate > 0) {
    const minutes = Math.floor(secondsToEndDate / 60);
    const seconds = String(secondsToEndDate % 60).padStart(2, "0");
    countdownText.textContent = `Disponible dans ${minutes}:${seconds}min`;
    return;
  }

  countdownContainer.classList.add("fr-hidden");
  element.disabled = false;
  if (intervalId) clearInterval(intervalId);
};

document.addEventListener(
  "DOMContentLoaded",
  function () {
    const elements = document.querySelectorAll(".disabled-with-countdown");
    elements.forEach((element) => {
      const rawEndDate = element.getAttribute("data-countdown-end-date");
      const countdownContainer = document.querySelector(".countdown-container");
      const countdownText = document.querySelector(".countdown-time");
      if (!countdownContainer || !countdownText) return;

      try {
        const endDateInSeconds = new Date(rawEndDate).getTime() / 1000;

        const secondsToEndDate = getSecondsUntil(endDateInSeconds);

        if (secondsToEndDate < 1) {
          element.disabled = false;
          return;
        }

        countdownContainer.classList.remove("fr-hidden");
        element.disabled = true;
        let intervalId;
        updateCountdown(
          endDateInSeconds,
          countdownContainer,
          countdownText,
          element,
          intervalId,
        );

        intervalId = setInterval(() => {
          updateCountdown(
            endDateInSeconds,
            countdownContainer,
            countdownText,
            element,
            intervalId,
          );
        }, 1000);
      } catch (error) {
        console.error(error);
        // silently fails
      }
    });
  },
  false,
);
