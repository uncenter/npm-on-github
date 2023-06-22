function saveSelection(event) {
	const { value } = event.target;
	chrome.storage.sync.set({ [event.target.id]: value });
}

function init() {
	['display-period', 'cache-duration', 'use-npm-logo'].forEach((id) => {
		const element = document.getElementById(id);
		if (!element) return;

		element.addEventListener('change', saveSelection);
		chrome.storage.sync.get(id, ({ [id]: value }) => {
			element.value = value;
		});
	});
}

init();
