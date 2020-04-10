# Varys

## Description

### Status

0.0.1, see [CHANGELOG.md](./CHANGELOG.md)

### Prerequisites

In order to run this project, you should have installed:

- Node installed (we used node v12.2.0)
- yarn (we used version v1.19.0)

### Config

This tool needs a configuration file with the organization setup:

Example: `organizations.json`

```json
{
  "githubToken": "github token hoes here",
  "organizations": [
    {
      "name": "philips-software"
    },
    { "name": "philips-labs" }
  ]
}
```

## Usage

```bash
yarn varys [commands] [options]
```

### Supported commands

| Command     | Functionality                      |
| ----------- | ---------------------------------- |
| users add   | Adds user to organization and team |
| users show  | Shows info about users             |
| repos show  | Shows info about repositories      |
| topics list | Lists topics per organization      |

### Sample usage

```shell
varys users show
```

## Technology stack

- Javascript
- This software is intended to be used standalone, as a command-line tool

## How to build

Get the sources locally; in a command line, go to the root folder of this project and execute:

```shell
yarn install
```

## How to test

```shell
yarn test
```

or

```shell
yarn coverage
```

## How to do static analysis of code

Automatically enabled: standard

```shell
yarn lint
```

## Owners

See [CODEOWNERS](./CODEOWNERS)

## Maintainers

See [MAINTAINERS.md](./MAINTAINERS.md)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

See [LICENSE.md](./LICENSE.md)

## Author

Jeroen Knoops

## Keywords

- GitHub
- Support Tools
