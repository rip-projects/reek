var Promise = require('promise'),
    semver = require('semver'),
    query = require('../query'),
    task = require('../task');

var InstallTask = function() {
    'use strict';

    this.description = 'Install package to use';
};

InstallTask.prototype.exec = function() {
    'use strict';

    if (this.args.length > 0) {
        return this.install(this.args[0]);
    } else {
        return query()
            .then(function(q) {
                var dependencies = q.get().dependencies || {};
                return this.bulkInstall(dependencies);
            }.bind(this));
    }
};

InstallTask.prototype.bulkInstall = function(dependencies) {
    'use strict';

    dependencies = dependencies || {};

    var promise = Promise.resolve();
    // var installs = [];
    Object.keys(dependencies).forEach(function(i) {
        var dependency = dependencies[i];
        if (dependency.indexOf(':') === -1) {
            dependency = i + '#' + dependency;
        }

        // if (promise) {
        promise = promise
            .then(function() {
                return this.install(dependency);
            }.bind(this));
        // } else {
        //     promise = this.install(dependency);
        // }
        // installs.push(this.install(dependency));
    }.bind(this));

    return promise;
    // return Promise.all(installs);
};

InstallTask.prototype.install = function(packageUrl) {
    'use strict';

    var p;

    // this.report('message', 'Installing %s ...', packageUrl);
    return query(packageUrl)
        .then(function(q) {
            p = q.get();
        })
        .then(function() {
            return task({ _: ['pull', p] });
        })
        .then(function() {
            return task({ _: ['link', p] });
        })
        .then(function() {
            return this.bulkInstall(p.dependencies);
        // }.bind(this))
        // .then(function() {
        //     this.report('message', '[%s] %s installed', p.name, p.url);
        }.bind(this));
};

module.exports = new InstallTask();