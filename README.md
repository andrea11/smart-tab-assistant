# Smart Tab Assistant

## Pre-requisites

- The latest version of Chrome.
- The AI API enabled, follow [this guide](src/options/error.html) to enable it.
- Node.js and npm installed.

## Installation

Run `npm install` to install all the dependencies.

## Usage

Run `npm run build` to build the extension. Then, go to `chrome://extensions/` and load the extension from the `dist` folder.

## Development

Rune `npm run dev` to start the development server (unfortunately it is not yet supported). So, you have to manually load the extension in your Chrome.

### Chrome profile

#### Even using Chrome profile, the AI API won't work in the development mode

To make the extension work, we need to have a Chrome profile to setup correctly all the experimental ai features. To avoid messing up with your personal profile, you have to run the following command to inform git to ignore all changes to the `chrome` folder.

```bash
git update-index --skip-worktree chrome-profile/
```

### Testing

Currently, there are no tests implemented.

## License

This project is licensed under the GNU General Public License - see the [LICENSE.md](LICENSE.md) file for details.