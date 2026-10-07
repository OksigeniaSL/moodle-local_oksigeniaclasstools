# Contributing to local_oksigeniaclasstools

Thanks for taking the time. This plugin is FOSS and we want it to stay simple and useful in a real classroom.
Below are the few things to keep in mind before opening a PR.

## Code style

- PHP follows the Moodle Coding Style: <https://moodledev.io/general/development/policies/codingstyle>.
- License header: GPL v3 or later, copyright `Oksigenia <dev@oksigenia.cc>`.
- New code, comments and commit messages in **English**. Lang files carry the localised strings. (Part of the
  board screen in `app/` is still in Spanish; it is being moved to English and to the language packs.)
- New board tools live in their own file in `app/` and use `window.ClasstoolsCore`; games register with
  `window.ClasstoolsGames.add(...)`.

## Translations

Translations go through **AMOS**, Moodle's translation tool, at <https://lang.moodle.org> once the plugin is on
the Moodle plugins directory. GitHub PRs are for the English strings and for fixes.

## Tests

Until the GitHub Actions workflow lands, test on a Moodle 4.5+ site: install from `./build.sh`, open the tools
from a course as a teacher, and check the browser console. Keep in mind the browser cache after an upgrade (scripts
carry the plugin version in their address).

## Pull requests

- One topic per PR. Mixed feature + refactor PRs get split before review.
- Reference an issue when one exists.
- Keep diffs small. If the PR stores anything new about users, update the privacy provider in the same PR.
- Bump `version.php` and add a `CHANGELOG.md` entry when the change reaches users.

## Reporting bugs

Open an issue with: plugin version, Moodle version, PHP version, theme, browser, and a minimal reproduction. A
screenshot of the board and the browser console help.

## License

By contributing you agree your changes are licensed under GPL v3 or later, the same license as the plugin.
