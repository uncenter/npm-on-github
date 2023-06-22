function saveSelection(event) {
	if (event.target.type === 'checkbox') {
		chrome.storage.sync.set({ [event.target.id]: event.target.checked });
		return;
	}
	let { value } = event.target;
	if (event.target.type === 'number') {
		value = +value;
	}
	chrome.storage.sync.set({ [event.target.id]: value });
}

function init() {
	const elements = document.querySelectorAll('input, select');
	elements.forEach((element) => {
		const id = element.id;
		element.addEventListener('change', saveSelection);
		chrome.storage.sync.get(id, ({ [id]: value }) => {
			if (value !== undefined) {
				if (element.type === 'checkbox') {
					element.checked = value;
				} else if (element.type === 'number') {
					element.value = value.toString();
				} else {
					element.value = value;
				}
			}
		});
	});
}

init();
