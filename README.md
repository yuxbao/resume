# Résumé d'antfu

This is my Résumé generator. You can check out my Résumé [here](https://resume.antfu.me).

The theme is heavy modified from [jsonresume-theme-kwan](https://github.com/icoloma/jsonresume-theme-kwan).

## How it works

- The data is hosted by [Gist](https://gist.github.com/antfu/ceb04ede6daf195eaf51e32b6aef5d4e) with [JSON Resume](https://jsonresume.org/) standard.
- The website is hosted by [Netlify](http://netlify.com/) with CI/CD.
- HTML is generated with [Handlebars](https://handlebarsjs.com/) and PDF is printed with [puppeteer](https://github.com/puppeteer/puppeteer/).

## Local usage

- `pnpm build` generates `dist/index.html` and `dist/resume.pdf`.
- `pnpm preview` serves `resume.json` locally at `http://localhost:8888/`.
- `pnpm dev` runs the Less watcher and local preview server together.

## Vercel notes

- PDF generation uses Puppeteer's Chrome for Testing during the build step.
- `build.js` resolves Chrome from `PUPPETEER_EXECUTABLE_PATH`, `CHROME_BIN`, `GOOGLE_CHROME_BIN`, Puppeteer's bundled browser, then common system paths.
- `pnpm build` explicitly runs `node ./scripts/ensure-chrome.js` before generating the PDF, so Vercel does not depend on Puppeteer's install hook having already downloaded Chrome.
- Puppeteer's cache is pinned to `./.cache/puppeteer` via `.puppeteerrc.cjs`, which avoids the default `~/.cache/puppeteer` path that can be fragile in CI/build images.
- If Chrome is still missing, `build.js` also retries by running `puppeteer browsers install chrome`.
- Do not set `PUPPETEER_SKIP_DOWNLOAD=true` in Vercel unless you also provide a valid Chrome executable path.

> Note: I did a lot quick hacks to make it suitable for my design, which may not be good to be general used as a theme. While I may not have time to improve it, PRs are great welcome!

## License

The script is licensed with MIT.
