## Varys 

## Description

### Status
0.0.1, see [CHANGELOG.md](./CHANGELOG.md)

### Prerequisites
In order to run this project, you should have installed:
- Node installed (we used node v12.2.0)
- yarn  (we used version v1.19.0)

### Config

This tool needs a configuration file with the organization setup:

Example: `organizations.json`
```
{
  "organizations": [
    { 
      "name": "philips-software", 
      "id": 12321 
    },
    { "name": "philips-labs", 
      "id": 12323 
    }
  ]
}
```
## Usage
```
yarn varys [commands] [options]
```

### Supported commands:

| Command              | Alias | Functionality
| ---------------------|:-----:| -------------------------------------
| show-repositories    | sr    | Shows info about repositories 

### Supported options:

| Flag                 | Alias | Functionality
| ---------------------|:-----:| -------------------------------------
| --verbose            |       | Verbose output of commands and errors
| --help               | -h    | Displays usage information
| --version            | -v    | Displays version number

### Sample usage
```
yarn varys -
```
## Technology stack
- Javascript
- This software is intended to be used standalone, as a command-line tool

## How to build
Get the sources locally; in a command line, go to the root folder of this project and execute:
```
yarn install
```
## How to test
```
yarn test
```
or 
```
yarn coverage
```

## How to do static analysis of code
Automatically enabled: standard
```
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
