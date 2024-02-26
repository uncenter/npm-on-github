import type { Options } from '@/types';

import { options } from '@/options';

import './styles.css';

async function init() {
	for (const element of document.querySelectorAll('input, select') as unknown as Array<
		HTMLInputElement | HTMLSelectElement
	>) {
		const { id, type } = element;
		const option = options[id as keyof Options];

		element.addEventListener('change', async ({ target }) => {
			if (type === 'checkbox') {
				await option.setValue((target as HTMLInputElement).checked as never);
			} else if (type === 'number') {
				await option.setValue(
					Number((target as HTMLInputElement).value) as never,
				);
			} else {
				await option.setValue((target as HTMLSelectElement).value as never);
			}
		});

		const existing = await option.getValue();
		if (type === 'checkbox') {
			(<HTMLInputElement>element).checked = existing as boolean;
		} else if (type === 'number') {
			element.value = (existing as number).toString();
		} else {
			element.value = existing as string;
		}
	}
}

init();
