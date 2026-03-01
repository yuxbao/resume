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

- Local PDF generation uses Puppeteer's Chrome for Testing.
- Vercel builds use `puppeteer-core` with `@sparticuz/chromium`, which avoids the missing shared-library errors that often happen when launching standard Chrome for Testing in serverless Linux environments.
- `build.js` switches launch strategy automatically: Vercel uses serverless Chromium, local builds resolve Chrome from environment variables, Puppeteer's bundled browser, then common system paths.
- Puppeteer's cache is pinned to `./.cache/puppeteer` via `.puppeteerrc.cjs`, which avoids the default `~/.cache/puppeteer` path that can be fragile in CI/build images.
- `pnpm run install:chrome` remains available for local setup if you want to pre-install Puppeteer's bundled browser.
- Do not set `PUPPETEER_SKIP_DOWNLOAD=true` in Vercel unless you also provide a valid Chrome executable path.

> Note: I did a lot quick hacks to make it suitable for my design, which may not be good to be general used as a theme. While I may not have time to improve it, PRs are great welcome!

## License

The script is licensed with MIT.
