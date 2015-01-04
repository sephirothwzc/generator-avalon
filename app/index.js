'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var fs = require('fs');
var path = require('path');
var os = require('os')

var fekitUtils = {
  generateForders: function() {
    var generator = this;
    ["src", "src/scripts", "src/styles", "src/scripts/filters", "src/scripts/layout", "src/scripts/pages", "src/scripts/ui", 
    "src/scripts/util", "src/scripts/vendor", "src/styles/components", "src/styles/layout", 
    "src/styles/pages", "src/styles/vendor"].forEach(function(path) {
        
      fs.exists(generator.destinationPath(path), function(exists) {
        if(exists) {
          generator.log(chalk.cyan("identical") + " " + path);
        } else {
          fs.mkdir(generator.destinationPath(path), function(err) {
            if(!err) {
              generator.log(chalk.green("   create") + " " + path);
            }
          });
        }
      })
    })
  }, config: function() {
    var widgetsMapping = {
      oniui: {
        name: "oniui",
        version: "0.2.*"
      },
      request: {
        name: "avalonRequest",
        version: "*"
      },
      promise: {
        name: "avalonPromise",
        version: "*"
      },
      router: {
        name: "avalonRouter",
        version: "*"
      },
      animate: {
        name: "avalonAnimate",
        version: "*"
      }
    };
    var config = this.fs.readJSON(this.templatePath('_' + this.packageConfig));
    this.widgets.forEach(function(name) {
      config.dependencies[widgetsMapping[name].name] = widgetsMapping[name].version;
    })
    config.name = this.appName;
    this.fs.write(this.destinationPath(this.packageConfig), JSON.stringify(config, undefined, 4));
  }
};

var bowerUtils = {
  config: function() {
    var widgetsMapping = {
      oniui: {
        name: "oniui",
        version: "*"
      },
      request: {
        name: "mmRequest",
        version: "RubyLouvre/mmRequest"
      },
      promise: {
        name: "mmDeferred",
        version: "RubyLouvre/mmDeferred"
      },
      router: {
        name: "mmRouter",
        version: "RubyLouvre/mmRouter"
      },
      animate: {
        name: "mmAnimate",
        version: "RubyLouvre/mmAnimate"
      }
    };
    var config = this.fs.readJSON(this.templatePath('_' + this.packageConfig));
    this.widgets.forEach(function(name) {
      config.dependencies[widgetsMapping[name].name] = widgetsMapping[name].version;
    });
    config.name = this.appName;
    this.fs.write(this.destinationPath(this.packageConfig), JSON.stringify(config, undefined, 4));
  }
};


module.exports = yeoman.generators.Base.extend({
  initializing: function () {
    this.pkg = require('../package.json');
  },

  prompting: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the transcendent' + chalk.red('Avalonjs') + ' generator!'
    ));

    var prompts = [
    {
      type: 'input',
      name: 'appName',
      message: 'What`s your app name?',
      default: this.destinationRoot().split(path.sep).pop()
    }, {
      type: 'list',
      name: 'packageManagement',
      message: 'Which package management you like to use?',
      default: "bower",
      choices: ["bower", "fekit"]
    }, {
      type: 'checkbox',
      name: 'widgets',
      message: 'Select widgets',
      default: ["oniui", "request", "promise", "router", "animate"],
      choices: ["oniui", "request", "promise", "router", "animate"]
    }];

    this.prompt(prompts, function (props) {
      this.packageManagement = props.packageManagement;
      this.appName = props.appName;
      this.widgets = props.widgets;

      if(this.packageManagement === "fekit") {
        this.packageConfig = "fekit.config"
      } else {
        this.packageConfig = this.packageManagement + ".json"
      }

      done();
    }.bind(this));
  },

  writing: {
    app: function () {
      
      //bower.json || fekit.config
      this.fs.copy(
        this.templatePath('_' + this.packageConfig),
        this.destinationPath(this.packageConfig)
      );

      //for fekti package management
      if(this.packageManagement === "fekit") {
        //目录结构
        fekitUtils.generateForders.call(this);

        //fekit.config
        fekitUtils.config.call(this);

        //README
        this.fs.write(this.destinationPath("README.md"), "# " + this.appName + os.EOL + os.EOL + this.fs.read(this.templatePath("_README-fekit.md")))

        //encironment.yaml
        this.fs.copy(
          this.templatePath('_environment.yaml'),
          this.destinationPath('environment.yaml')
        );

        //build.sh
        this.fs.copy(
          this.templatePath('_build.sh'),
          this.destinationPath('build.sh')
        );
      } else {
        //npm pacage.json
        this.fs.copy(
          this.templatePath('_package.json'),
          this.destinationPath('package.json')
        );

        //bower.json
        bowerUtils.config.call(this);
      }
    }
  },

  install: function () {
    if(this.packageManagement === "fekit") {

      //fekit install
      this.log( chalk.red("fekit install") );
      this.spawnCommand('fekit', ['install'])  
    } else {

      //npm install && bower install
      this.installDependencies();
    }
  }
});
