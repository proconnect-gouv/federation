import ClipboardJS from 'clipboard';
import $ from 'jquery';

const COPY_BUTTON = '.copy-button';
export function copyText () {
	eventCleanerListenerForTooltip(COPY_BUTTON);
	const clipboard = new ClipboardJS(COPY_BUTTON);

	clipboard.on('success', e => {
		e.clearSelection();
		const { action, text, trigger } = e;
		console.info({ action, text, trigger });
		showTooltip(trigger,'Copié !');
	});

	clipboard.on('error',({ action, trigger}) => {
		console.error({ action, trigger });
	});
}

function eventCleanerListenerForTooltip (elm) {
	$(elm).tooltip('disable');
	const btns = document.querySelectorAll(elm);
	Array.from(btns).map(btn => {
		btn.addEventListener('mouseleave', clearTooltip);
		btn.addEventListener('blur', clearTooltip);
	});
}

function clearTooltip() {
	$(COPY_BUTTON).tooltip('hide').tooltip('disable');
}

function showTooltip(elm) {
	$(elm).tooltip('enable').tooltip('show');
}
