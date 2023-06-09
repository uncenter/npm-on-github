<h1>NPM on GitHub</h1>

View NPM package downloads right on GitHub.

![A screenshot of the injected NPM package download button and chart.](/images/demo.png)

> **You can check out other demo images in the [images](/images) directory.**

## Installation

```bash
git clone https://github.com/uncenter/npm-on-github.git && cd npm-on-github
pnpm install
pnpm run build
```

Then, follow the instructions below for Chrome/Chromium browsers (only browser supported at the moment).

1. Open the Extensions page by navigating to `chrome://extensions`.
2. Enable Developer Mode by flipping the toggle switch labeled **Developer mode**.
3. Click the **Load unpacked** button and select the `dist` directory from the cloned repository.
4. Enjoy!

## Roadmap

- [ ] Support other browsers
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge
- [ ] Publish to Chrome Web Store
- [ ] Enable/disable extension from the popup
- [ ] Reduce `vendor.js` bundle size by only importing the necessary parts of `chart.js`
- [ ] Fix MutationObserver not processing page after switching repositories

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## Acknowledgment

This project was originally created by [Ahmet Katrancı](https://github.com/katranci), called [github-npm-stats](https://github.com/katranci/github-npm-stats) (check it out!). I loved the idea and wanted to contribute to it, but it appears that the project is no longer maintained, and it was due for a rewrite with modern build tools and Typescript. The original project was licensed under the [MIT](https://choosealicense.com/licenses/mit/) license - as is this project.

## License

[MIT](LICENSE)
