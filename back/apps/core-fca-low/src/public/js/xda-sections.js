// A section is shown when it matches the status of the request and, if it has
// one, the current step of the page
export const showSections = (container, { status, step }) => {
  container.querySelectorAll("[data-xda-status-section]").forEach((section) => {
    const sectionStatuses = section
      .getAttribute("data-xda-status-section")
      .split(" ");
    const sectionStep = section.getAttribute("data-xda-step");
    const isVisible =
      sectionStatuses.includes(status) &&
      (!sectionStep || sectionStep === step);
    section.classList.toggle("fr-hidden", !isVisible);
  });
};

// Moves the focus to the visible title, as the element that had it may now be
// hidden
export const focusVisibleTitle = (container) => {
  const visibleTitle = [...container.querySelectorAll("h1")].find(
    (title) => title.offsetParent !== null,
  );
  visibleTitle?.focus();
};

// Reads the message to screen reader users, through a role="status" element
export const announce = (container, message) => {
  container.querySelector("[data-xda-status-message]").textContent = message;
};
