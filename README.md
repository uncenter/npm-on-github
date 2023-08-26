<h1>NPM on GitHub</h1>

View NPM package downloads right on GitHub.

![A screenshot of the injected NPM package download button and chart.](/images/chart.png)

## Installation

```bash
git clone https://github.com/uncenter/npm-on-github.git && cd npm-on-github
pnpm install
pnpm build
```

Then, follow the instructions below for Chrome/Chromium browsers (only browser supported at the moment).

1. Open the Extensions page by navigating to `chrome://extensions`.
2. Enable Developer Mode by flipping the toggle switch labeled **Developer mode**.
3. Click the **Load unpacked** button and select the `dist` directory from the cloned repository.
4. Enjoy!

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## Acknowledgment

This project was originally created by [Ahmet Katrancı](https://github.com/katranci), called [github-npm-stats](https://github.com/katranci/github-npm-stats) (check it out!). I loved the idea and wanted to contribute to it, but it appears that the project is no longer maintained, and it was due for a rewrite with modern build tools and TypeScript. The original project was licensed under the [MIT](https://choosealicense.com/licenses/mit/) license - as is this project.

## License

[MIT](LICENSE)
