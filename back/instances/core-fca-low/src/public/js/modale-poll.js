function initModal() {
  const modal = document.getElementById('modal-survey');
  const closeModalButton = document.getElementById('button-1299');

  const wantHideSurveyModalKey = 'wantHideSurveyModal';
  const isModalClosed = localStorage.getItem(wantHideSurveyModalKey) === 'true';

  if (!isModalClosed) {
    modal.classList.remove('ac-survey-default');
  }

  closeModalButton.addEventListener('click', () => {
    localStorage.setItem(wantHideSurveyModalKey, 'true');
    modal.classList.add('ac-survey-default');
  });
}

document.addEventListener('DOMContentLoaded', initModal);
