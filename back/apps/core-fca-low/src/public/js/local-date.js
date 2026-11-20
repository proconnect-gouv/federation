// Displays the <time data-local-date> elements in the browser's time zone
document.addEventListener(
  "DOMContentLoaded",
  function () {
    document.querySelectorAll("time[data-local-date]").forEach((element) => {
      const date = new Date(element.getAttribute("datetime"));
      const day = date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const time = date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      element.textContent = `${day} à ${time}`;
    });
  },
  false,
);
