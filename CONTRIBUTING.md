<!-- What this file does: explains how to contribute to Anino ng Ani through GitHub. -->
# Contributing to Anino ng Ani

You need a free GitHub account. This site has no sign-in of its own.
A maintainer reviews every change before it appears on the site.

## Easiest ways to help

- **Suggest a source:** use the "Suggest a source" button on any program page.
- **Report a problem:** use the "Report a problem" button on any program page.

## Edit a file (pull request)

1. Open the program's file in `content/programs/` and click the pencil icon.
2. Make your change and open a pull request.
3. Automatic checks run. Fix any error they show, then wait for review.

## Writing rules

- Label every source honestly: `official`, `independent`, `advocacy` or `supporter`.
- Keep opinions out of `happened`. Say what the record shows.
- Do not paste long quotes. Describe in your own words.
- Every link needs an `accessed` date (the day you opened it).
- Only the maintainer sets `status: confirmed` and `checkedOn`.

## Source example (copy and edit)

```yaml
sources:
  - title: Presidential Decree No. 27
    publisher: Official Gazette (text on Lawphil)
    voice: official
    url: "https://www.lawphil.net/statutes/presdecs/pd1972/pd_27_1972.html"
    accessed: "2026-11-15"
    backs: promise   # promise, happened or context
```

## Run the checks on your computer

```bash
pnpm install
pnpm content:check
```
