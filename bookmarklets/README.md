# bookmarklets

Each `*.js` in this folder is a single line starting with `javascript:`. Paste it as the URL of a Chrome bookmark, or as the URL of a Chrome search engine to run it by typing a keyword in the address bar.

If the bookmark opens as a `file:///` URL with `ERR_FILE_NOT_FOUND`, Chrome stripped the `javascript:` prefix on paste (anti self-XSS). Type it back at the start of the URL field.

## copy-pr-title

Copies `[app] PR title (+added -removed)` as rich text from a GitHub pull request page, including its Files and Commits tabs. The app name is bold, the title links to the PR, and the line counts are green and red. A plain-text version goes to the clipboard as well.

- **App name:** the single `scope/app:<name>` label on the PR when there is exactly one, otherwise the repository name.
- **Line counts:** read from the page text, with thousands separators and the unicode minus handled. They read `(0 0)` when the page shows none.
- **Copy:** tries `execCommand`, then the async clipboard API. If the page has no focus yet, which happens when the bookmarklet runs from a Chrome search shortcut, it waits up to 3 seconds for focus before alerting an error.

## Editing and building

A bookmark URL must be a single line, so the readable source in `src/` is turned into a one-liner by `build.mjs`. It needs Node and no dependencies.

### Change or add a bookmarklet

1. Edit `src/<name>.js`, or create a new file in `src/`.
2. Run `node bookmarklets/build.mjs` from the repo root. It prints one line per file, for example `built copy-pr-title.js (3965 chars)`.
3. Open the generated `bookmarklets/<name>.js`, copy its single line, and paste it as the bookmark URL.
4. Commit the source and the generated file together.

### What the build does

For each `src/*.js`, it trims every line, drops blank lines and full-line `//` comments, joins the rest with no separator, and adds the `javascript:` prefix. It then checks the result and writes it next to `src/`, under the same name.

- **Semicolons:** lines are joined with no separator, so every statement in the source must end with a semicolon.
- **Comments:** a comment must be on its own line. A trailing `// ...` would comment out the rest of the joined line.
- **Percent sign:** the build fails if the output contains `%`, because Chrome percent-decodes that character inside a `javascript:` URL.
- **Syntax:** the build fails if the output is not valid JavaScript.

### Check that the one-liner matches the source

Run the build and then `git status bookmarklets/`. If the committed one-liner matches its source, the build changes nothing and git shows no modified files.
