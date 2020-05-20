# Varys

## Description

## Configuration

Create a file `organizations.json` with information about your organization.
Example configuration: [organizations.json.example](./organizations.json.example)

### Configuration

| key             | description                          |
| --------------- | ------------------------------------ |
| `githubToken`   | GitHub token                         |
| `enterprise`    | Enterprise organization, for SSO     |
| `organizations` | Array with organizations             |
| `slackToken`    | Slack Token                          |
| `slackChannel`  | Slack Channel                        |

## Usage

```bash
bin/varys
```

### Supported options

| Flag                 | Alias | Functionality
| ---------------------|:-----:| -------------------------------------
| --verbose            |       | Verbose output of commands and errors
| --help               | -h    | Displays usage information
| --version            | -v    | Displays version number

### Sample usage

```bash
$ bin/varys
Usage: varys [options] [command]

Lord Varys whispers all your Github secrets.

Options:
  -V, --version  output the version number
  -h, --help     output usage information

Commands:
  users          whispers secrets about your users.
  repos          whispers secrets about your repositories.
  topics         whispers secrets about your topics.
  help [cmd]     display help for [cmd]

$ bin/varys users show
v show users
v organization:  philips-labs
v organization:  philips-software
v organization:  philips-test-org
v organization:  philips-internal
ORGANISATION     TOTAL ASSIGNEDUSERS PENDINGUSERS
philips-labs     15    15            0
philips-software 79    79            0
philips-test-org 7     7             0
philips-internal 117   109           8
```

## Technology stack

- Javascript
- This software is intended to be used standalone, as a command-line tool

## How to build

Get the sources locally; in a command line, go to the root folder of this project and execute:

```bash
yarn install
```

## How to test

```bash
yarn test
```

or

```bash
yarn coverage
```

## How to do static analysis of code

Automatically enabled: standard

```bash
yarn lint
```
