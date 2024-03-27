# Contributing to Fingerprint Pro Akamai Proxy Integration

## Working with code

We prefer using [pnpm](https://pnpm.io/) for installing dependencies and running scripts.


For proposing changes, use the standard [pull request approach](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request). It's recommended to discuss fixes or new functionality in the Issues, first.

* The `main` branch is locked for the push action.
* Releases are created from the `main` branch. If you have Akamai Integration set up, it is running property rules from the `main` branch.


### How to build
* After cloning the repository, run `pnpm install` to install dependencies.

* To build property rules please see the `How to build property rules` section in [README.md](https://github.com/fingerprintjs/fingerprint-pro-akamai-proxy-integration#how-to-build-property-rules)

### Commit style

You are required to follow [conventional commits](https://www.conventionalcommits.org) rules.

### How to test

End-to-end tests are written in [playwright](https://github.com/microsoft/playwright) and located in the `e2e` folder.
These tests are run automatically by the `e2e.yml` workflow on every PR automatically, you don't need to run them locally.

### Changing API URLs

You can use the `--ingress-url` and `--cdn-url` build flags to change URLs that the integration will use for making requests. 
This should be only used for local development and not in production.

### How to release a new version

The workflow `release.yml` is responsible for releasing a new version.
