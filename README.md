<div align="center">
<img src="images/logo.png" width="50">
<h1>NPM on Github</h1>
</div>

NPM on Github displays NPM package statistics for packages hosted on Github, on Github!

![Demo](/images/cropped-full.png)

## Installation

```bash
git clone https://github.com/uncenter/npm-on-github.git
cd npm-on-github
npm install
npm run build
```

Then, follow the instructions below for Chrome/Chromium browsers (only browser supported at the moment).

1. Open the Extensions page by navigating to `chrome://extensions`.
2. Enable Developer Mode by clicking the toggle switch next to **Developer mode**.
3. Click the **Load unpacked** button and select the `dist` directory from the cloned repository.
4. Enjoy!

## Roadmap

-   [ ] Add tests
-   [ ] Refactor rendering and insertion of stats
-   [ ] Properly verify that the npm package is hosted on the current repository
-   [ ] Add [permissions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/permissions) to `manifest.json`
-   [ ] Port to other browsers
    -   [ ] Firefox
    -   [ ] Safari
    -   [ ] Edge
-   [ ] Add [options_ui](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/options_ui)
    -   [ ] Change expiry time
        -   [ ] Globally
        -   [ ] Per repository
    -   [ ] Display number: last day, last week, last month

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## Acknowledgment

This project was originally created by [Ahmet Katrancı](https://github.com/katranci), called [github-npm-stats](https://github.com/katranci/github-npm-stats) (check it out!). I loved the idea and wanted to contribute to it, but it appears that the project is no longer maintained, and it was due for a rewrite (I wasn't the greatest fan of the codebase). The original project was licensed under the [MIT](https://choosealicense.com/licenses/mit/) license (as is this project).

## License

[MIT](LICENSE)
