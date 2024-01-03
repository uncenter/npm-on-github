export function error(message: string) {
	console.error(`%c[npm-on-github] ${message}`, 'color: red');
}

export function warn(message: string) {
	console.log(`%c[npm-on-github] ${message}`, 'color: orange');
}

export function success(message: string) {
	console.log(`%c[npm-on-github] ${message}`, 'color: green');
}

export function log(message: string) {
	console.log(`[npm-on-github] ${message}`);
}
