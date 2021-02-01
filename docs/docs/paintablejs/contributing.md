---
id: contributing
title: Contributing
sidebar_label: Contributing
---

## Get involved

There are many ways to contribute to Paintablejs, and many of them do not involve writing any code. Here's a few ideas to get started:

- Start using Paintablejs! Go through the Getting Started guide. Does everything work as expected? If not, I'm always looking for improvements. Let me know by opening an issue.
- If you find an issue you would like to fix, open a pull request. Issues tagged as Good first issue are a good place to get started.
- Help making the docs better. File an issue if you find anything that is confusing or can be improved.
- Take a look at the features requested by others in the community and consider opening a pull request if you see something you want to work on.

Contributions are very welcome.

## Working on Paintable code

### Installation

- Ensure you have Yarn installed
- After cloning the repository, run `yarn install` in the root of the repository
- To start a local development server, run `yarn dev:all`
- To check your changes run one of the examples

```bash
yarn example:core
yarn example:react
yarn example:vue
yarn example:angular
```

- to make a production build, run `yarn build:all`

## Project structure

```bash
.
├── .github
│   └── workflows
│       ├── build.yml # The flow to check if the build runs without errors
│       ├── deploy.yml # The flow to deploy to npm
│       ├── deploy_demo.yml # The flow to build the demo app and deploy it to netlify
│       └── deploy_docs.yml # The flow to build the docs and deploy it to netlif
├── docs # The docs(docusaurus) folder, which ist not part of the monorepo due to dependency conflicts
├── package.json
├── packages
│   ├── bindings # New Framework bindings belong here
│   │   ├── angular # The Angular bindings to the core module
│   │   ├── react # The React bindings to the core module
│   │   └── vue # The Vue bindings to the core module
│   ├── core # This is the Core module
│   │   ├── README.md
│   │   ├── package.json
│   │   ├── rollup.config.js # the core build flow
│   │   ├── src # The core source files
│   │   └── tsconfig.json
│   ├── dist # This is the build app. For development purposes you can import it as `paintablejs` because of the monorepo structure. This folder gets deployed to NPM
│   │   ├── README.md # The npm readme
│   │   ├── angular
│   │   ├── core
│   │   ├── package.json
│   │   ├── react
│   │   └── vue
│   └── examples # Examples belong here
│       ├── angular # Angular example
│       ├── core # Core example
│       ├── react # React example
│       └── vue # Vue example
├── scripts
│   ├── bumpDistVersion.js # Postversion Script, which bumps all versions of paintablejs in the monorepo
│   └── clearDist.js # Script to clean the dist folder
└── yarn.lock
```

## Semantic commit messages

See how a minor change to your commit message style can make you a better programmer.

Format: `<type>(<scope>): <subject>`

`<scope>` is optional

**Example**

```
feat: allow overriding of webpack config
^--^ ^------------^
| |
| +-> Summary in present tense.
|
+-------> Type: chore, docs, feat, fix, refactor, style, or test.
```

The various types of commits:

- `feat`: (new feature for the user, not a new feature for build script)
- `fix`: (bug fix for the user, not a fix to a build script)
- `docs`: (changes to the documentation)
- `style`: (formatting, missing semi colons, etc; no production code change)
- `refactor`: (refactoring production code, eg. renaming a variable)
- `test`: (adding missing tests, refactoring tests; no production code change)
- `chore`: (updating grunt tasks etc; no production code change)

Use lower case not title case!
