# inix
> initilize your project with someone boilerplate(X). X means anyone boilerplate, becuase x normally means a varibale in mathematics.

  - [About](#About)
  - [installation](#installation)
  - [Getting Started](#Getting-Started)
  - [Commands](#Commands)
    - [inix config](#inix-config)
    - [inix create](#inix-create)
    - [inix add](#inix-add)
    - [inix del](#inix-del)
    - [inix ls](#inix-ls)
  - [Boilerplate Definition](#Boilerplate-Definition)

## About
Everytime when you start a new project, firstly you will intilize the project by scaffold tool or some boilerplate. Now you just need to create your own boilerplate repo, then ``inix`` will help you finish  the rest things.
## Installation

```bash
$ npm i -g inix
```

## Getting Started

createilize your project with someone local template or remote git repo

```bash
$ inix create ~/demo/template
```


## Commands

### inix create

You can create your project from local template
```bash
$ inix create <target>
```

example 

```bash
$ inix create ~/demo/template
```


By default, it will show all existing boilerplates you can use when you.

```bash
$ inix create 
```

### inix config
Config the template records which can be used by ``inix create``

use local path to setup template records

```bash
$ inix config ~/demo/template.json
```

or use a remote url

```bash
$ inix config http://xxx.xxx.com/path/template.json
```

### inix add
Add new boilerplate into your template list, then you can use it when you run ``inix create``

```bash
$ inix add
```

It will let you input some properties about the new boilerplate, like name, description and boilerplate location(local path or git repo). If it is a git repo, maybe you should input the branch name as well.


### inix del
Delete some boilerplate from the existing selections. After you run the command, it will show all existing selections which you can delete.

```bash
$ inix del
```

### inix ls
Display all boilerplates you already have.


## Boilerplate Definition
directory structure of boilerplate. See [example](https://github.com/daizch/inix-boilerplate-example).

```
- template
- mata.js (optional)
```

In meta.js, you can setup questions wrote by [inquirer](https://github.com/SBoudrias/Inquirer.js/). Then you can use these answers in your template files rendered by [handlebars](https://github.com/wycats/handlebars.js/). As well, if you want to do something after project initilization, you can use ``endCallback`` in your meta.js to do whatever you want.


Here is example about meta.js
```javascript
//meta.js
module.exports = {
  questions: [{
    {
      type: 'input',
      name: 'description'
    },
    {
      type: 'input',
      name: 'serviceName',
      message: 'need service name',
      validate: function (val) {
        if (!val) {
          return "service name required"
        } else {
          return true;
        }
      }
    },
  }], 
  endCallback: function(metaData, {chalk, logger, files}) {
    //you can visit all answers from metaData.answers
    //files are that all in your boilerplate
    //do sth
  }
}
```



