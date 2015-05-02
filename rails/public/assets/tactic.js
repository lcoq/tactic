define('tactic/adapters/application', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].ActiveModelAdapter.extend({
    namespace: "api"
  });

});
define('tactic/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'tactic/config/environment'], function (exports, Ember, Resolver, loadInitializers, config) {

  'use strict';

  Ember['default'].MODEL_FACTORY_INJECTIONS = true;

  var App = Ember['default'].Application.extend({
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix,
    Resolver: Resolver['default']
  });

  loadInitializers['default'](App, config['default'].modulePrefix);

  exports['default'] = App;

});
define('tactic/components/select-on-focus-input', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].TextField.extend({
    selectOnFocus: (function () {
      this.$().select();
    }).on("focusIn")
  });

});
define('tactic/controllers/application', ['exports', 'ember', 'moment'], function (exports, Ember, moment) {

  'use strict';

  function isFilled(entry) {
    return entry.get("startedAt") && entry.get("finishedAt");
  }

  function isInCurrentWeek(entry, startOfWeek) {
    var startedAt = entry.get("startedAt");
    var date = new Date(startedAt.getFullYear(), startedAt.getMonth(), startedAt.getDate());
    return date.getTime() - startOfWeek.getTime() >= 0;
  }

  function belongsTo(entry, user) {
    return entry.get("user.id") === user.id;
  }

  function projectsDuration(entries) {
    var projects = entries.mapProperty("project").uniq(),
        projectEntries,
        duration;
    return projects.map(function (project) {
      projectEntries = entries.filterProperty("project.id", project ? project.get("id") : null);
      duration = projectEntries.reduce(function (s, entry) {
        return s + entry.get("duration");
      }, 0);
      return Ember['default'].Object.create({ project: project, duration: duration });
    }).sortBy("duration").reverse();
  }

  function totalProjectsDuration(durations) {
    return durations.reduce(function (s, projectDuration) {
      return s + projectDuration.get("duration");
    }, 0);
  }

  exports['default'] = Ember['default'].Controller.extend({
    needs: "index",

    currentUser: null,

    entriesInCurrentWeek: (function () {
      var startOfCurrentWeek = moment['default']().startOf("isoWeek").toDate();
      return this.store.filter("entry", function (entry) {
        return isFilled(entry) && isInCurrentWeek(entry, startOfCurrentWeek);
      });
    }).property(),

    projectsDurationInCurrentWeek: (function () {
      return projectsDuration(this.get("entriesInCurrentWeek"));
    }).property("entriesInCurrentWeek.@each.duration", "entriesInCurrentWeek.@each.project"),

    totalDurationInCurrentWeek: (function () {
      return totalProjectsDuration(this.get("projectsDurationInCurrentWeek"));
    }).property("projectsDurationInCurrentWeek.@each.duration"),

    myEntriesInCurrentWeek: (function () {
      var startOfCurrentWeek = moment['default']().startOf("isoWeek").toDate(),
          user = this.get("currentUser");
      return this.store.filter("entry", function (entry) {
        return isFilled(entry) && belongsTo(entry, user) && isInCurrentWeek(entry, startOfCurrentWeek);
      });
    }).property("currentUser"),

    myProjectsDurationInCurrentWeek: (function () {
      return projectsDuration(this.get("myEntriesInCurrentWeek"));
    }).property("myEntriesInCurrentWeek.@each.duration", "myEntriesInCurrentWeek.@each.project"),

    myTotalDurationInCurrentWeek: (function () {
      return totalProjectsDuration(this.get("myProjectsDurationInCurrentWeek"));
    }).property("myProjectsDurationInCurrentWeek.@each.duration")
  });

});
define('tactic/controllers/entry', ['exports', 'ember', 'tactic/models/entry-form'], function (exports, Ember, EntryForm) {

  'use strict';

  exports['default'] = Ember['default'].ObjectController.extend({
    needs: "index",

    isEditing: null,

    differedStartedAtDay: (function () {
      return this.get("startedAtDay");
    }).property(),
    differedStartedAtTime: (function () {
      return this.get("startedAtTime");
    }).property(),
    differedFinishedAtTime: (function () {
      return this.get("finishedAtTime");
    }).property(),

    // Used to restore an entry as ember-data does not restore
    // belongs_to relationship
    initialProject: null,
    setInitialProject: (function () {
      this.set("initialProject", this.get("project"));
    }).on("init"),

    startedAtTime: (function () {
      return this.get("startedAt").getTime();
    }).property("startedAt"),

    finishedAtTime: (function () {
      return this.get("finishedAt").getTime();
    }).property("finishedAt"),

    projectNameChanged: (function () {
      if (this.get("editForm.projectNameHasChanged")) {
        this.send("searchProjects");
      }
    }).observes("editForm.projectNameHasChanged"),

    projectTimer: null,

    deleteEntryTimer: null,
    isDeleting: Ember['default'].computed.bool("deleteEntryTimer"),
    editFocus: null,

    saveEntryTimer: null,
    saveScheduled: Ember['default'].computed.bool("saveEntryTimer"),

    _findProjects: function () {
      var editForm = this.get("editForm");
      this.store.find("project", { name: editForm.get("projectName") }).then(function (projects) {
        editForm.set("projectChoices", projects.toArray());
      });
    },

    actions: {
      editEntry: function (editFocus) {
        if (this.get("controllers.index.hasEdit")) {
          return;
        }
        var saveTimer = this.get("saveEntryTimer");
        if (saveTimer) {
          Ember['default'].run.cancel(saveTimer);
          this.set("saveEntryTimer", null);
        }
        var deleteTimer = this.get("deleteEntryTimer");
        if (deleteTimer) {
          this.send("cancelDeleteEntry");
        }
        this.setProperties({
          editFocus: editFocus,
          editForm: EntryForm['default'].create({ entry: this.get("content") }),
          isEditing: true
        });
      },
      scheduleSaveEntry: function () {
        var editForm = this.get("editForm");
        if (editForm.get("isValid")) {
          editForm.update();
          var saveTimer = Ember['default'].run.later(this, function () {
            this.send("saveEntry");
          }, 3000);
          this.setProperties({
            isEditing: false,
            saveEntryTimer: saveTimer
          });
        }
      },
      cancelSaveEntry: function () {
        var saveTimer = this.get("saveEntryTimer");
        if (saveTimer) {
          Ember['default'].run.cancel(saveTimer);
          this.set("saveEntryTimer", null);
          this.send("restoreEntry");
        }
      },
      saveEntry: function () {
        this.get("content").save();
        this.setInitialProject();
        this.notifyPropertyChange("differedStartedAtDay");
        this.notifyPropertyChange("differedStartedAtTime");
        this.notifyPropertyChange("differedFinishedAtTime");
        this.setProperties({
          editForm: null,
          isEditing: false,
          saveEntryTimer: null
        });
      },
      restoreEntry: function () {
        this.set("project", this.get("initialProject"));
        this.get("content").rollback();
        this.set("isEditing", false);
      },
      deleteEntry: function () {
        function deleteEntry() {
          this.set("deleteEntryTimer", null);
          this.get("content").destroyRecord();
        }
        var deleteEntryTimer = Ember['default'].run.later(this, deleteEntry, 5000);
        this.set("deleteEntryTimer", deleteEntryTimer);
      },
      cancelDeleteEntry: function () {
        var deleteTimer = this.get("deleteEntryTimer");
        if (deleteTimer) {
          Ember['default'].run.cancel(deleteTimer);
          this.set("deleteEntryTimer", null);
        }
      },
      searchProjects: function () {
        var previousTimer = this.get("projectTimer");
        if (previousTimer) {
          Ember['default'].run.cancel(previousTimer);
          this.set("projectTimer", null);
        }
        if (this.get("editForm.projectNameIsEmpty")) {
          this.send("selectProject", null);
        } else {
          var timer = Ember['default'].run.later(this, this._findProjects, 700);
          this.set("projectTimer", timer);
        }
      },
      selectProject: function (project) {
        this.get("editForm").selectProject(project);
      }
    }
  });

});
define('tactic/controllers/index', ['exports', 'ember', 'tactic/utils/format-duration', 'tactic/utils/group-by', 'tactic/models/entry-list'], function (exports, Ember, formatDuration, groupBy, EntryList) {

  'use strict';

  exports['default'] = Ember['default'].ArrayController.extend({
    needs: "application",

    itemController: "entry",

    entriesByDay: groupBy['default']("@this.@each.differedStartedAtDay", "differedStartedAtDay", EntryList['default']),

    timerStarted: Ember['default'].computed.notEmpty("newEntry.startedAt"),
    newEntry: null,
    newEntryDuration: "0:00:00",

    hasEdit: (function () {
      return this.someProperty("isEditing");
    }).property("@each.isEditing"),

    // A change on `Entry#projectName` is unexpectedly sent by Ember while its value remains
    // the same. The hack below prevents firing observers when the project name does not really
    // change

    latestEntryProjectName: null,
    newEntryProjectNameChanged: (function () {
      var newProjectName = this.get("newEntry.projectName");
      if (newProjectName !== this.get("latestEntryProjectName")) {
        this.set("latestEntryProjectName", newProjectName);
      }
    }).observes("newEntry.projectName").on("init"),

    newEntryProjectNameBinding: Ember['default'].Binding.oneWay("latestEntryProjectName"),
    runSearchProjects: (function () {
      if (this.get("newEntryProjectName") !== this.get("latestEntryProjectName")) {
        this.send("searchProjectsAndStartTimer");
      }
    }).observes("newEntryProjectName"),

    projectTimer: null,
    projectChoices: null,

    buildNewEntry: function () {
      var user = this.get("controllers.application.currentUser");
      var newEntry = this.store.createRecord("entry", { user: user });
      this.set("newEntry", newEntry);
    },

    _findProjects: function () {
      var projectName = this.get("newEntryProjectName");
      var self = this;
      this.store.find("project", { name: projectName }).then(function (projects) {
        self.set("projectChoices", projects.toArray());
      });
    },

    actions: {
      startTimer: function () {
        if (this.get("newEntry.startedAt")) {
          return;
        }

        var startedAt = new Date();
        this.get("newEntry").set("startedAt", startedAt);

        function updateDuration() {
          if (startedAt === this.get("newEntry.startedAt")) {
            var newDuration = formatDuration['default'](new Date().getTime() - startedAt.getTime());
            this.set("newEntryDuration", newDuration);
            Ember['default'].run.later(this, updateDuration, 500);
          } else {
            this.set("newEntryDuration", "0:00:00");
          }
        }
        updateDuration.call(this);
      },
      stopTimer: function () {
        var newEntry = this.get("newEntry"),
            self = this;
        newEntry.set("finishedAt", new Date());
        newEntry.save().then(function () {
          self.buildNewEntry();
        });
      },
      searchProjectsAndStartTimer: function () {
        var previousTimer = this.get("projectTimer");
        if (previousTimer) {
          Ember['default'].run.cancel(previousTimer);
          this.set("projectTimer", null);
        }
        if (!Ember['default'].isEmpty(this.get("newEntryProjectName"))) {
          var timer = Ember['default'].run.later(this, this._findProjects, 700);
          this.set("projectTimer", timer);
        } else {
          this.send("selectProject", null);
        }
        this.send("startTimer");
      },
      selectProject: function (project) {
        this.set("projectChoices", null);
        this.get("newEntry").set("project", project);
        this.notifyPropertyChange("latestEntryProjectName");
      }
    }
  });

});
define('tactic/helpers/format-duration', ['exports', 'ember', 'tactic/utils/format-duration'], function (exports, Ember, formatDuration) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(function (value) {
    return new Ember['default'].Handlebars.SafeString(formatDuration['default'](value));
  });

});
define('tactic/initializers/app-version', ['exports', 'tactic/config/environment', 'ember'], function (exports, config, Ember) {

  'use strict';

  var classify = Ember['default'].String.classify;

  exports['default'] = {
    name: "App Version",
    initialize: function (container, application) {
      var appName = classify(application.toString());
      Ember['default'].libraries.register(appName, config['default'].APP.version);
    }
  };

});
define('tactic/initializers/ember-moment', ['exports', 'ember-moment/helpers/moment', 'ember-moment/helpers/ago', 'ember'], function (exports, moment, ago, Ember) {

  'use strict';

  var initialize = function () {
    Ember['default'].Handlebars.helper("moment", moment.moment);
    Ember['default'].Handlebars.helper("ago", ago.ago);
  };

  exports['default'] = {
    name: "ember-moment",

    initialize: initialize
  };
  /* container, app */

  exports.initialize = initialize;

});
define('tactic/initializers/export-application-global', ['exports', 'ember', 'tactic/config/environment'], function (exports, Ember, config) {

  'use strict';

  exports.initialize = initialize;

  function initialize(container, application) {
    var classifiedName = Ember['default'].String.classify(config['default'].modulePrefix);

    if (config['default'].exportApplicationGlobal && !window[classifiedName]) {
      window[classifiedName] = application;
    }
  };

  exports['default'] = {
    name: "export-application-global",

    initialize: initialize
  };

});
define('tactic/models/entry-form', ['exports', 'moment', 'ember'], function (exports, moment, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Object.extend({
    entry: null,

    // A change on `Entry#projectName` is unexpectedly sent by Ember while its value remains
    // the same. The hack below prevents firing observers when the project name does not really
    // change
    entryProjectName: (function () {
      return this.get("entry.project.name");
    }).property(),
    entryProjectNameChanged: (function () {
      var entryProjectName = this.get("entry.project.name");
      if (entryProjectName !== this.get("entryProjectName")) {
        this.set("entryProjectName", entryProjectName);
      }
    }).observes("entry.project.name"),

    projectNameBinding: Ember['default'].Binding.oneWay("entryProjectName"),
    projectNameHasChanged: (function () {
      return this.get("projectName") !== this.get("project.name");
    }).property("projectName"),
    projectNameIsEmpty: Ember['default'].computed.empty("projectName"),
    projectBinding: Ember['default'].Binding.oneWay("entry.project"),

    titleBinding: Ember['default'].Binding.oneWay("entry.title"),
    startedAtDayBinding: Ember['default'].Binding.oneWay("entry.startedAtDay"),
    startedAtHourBinding: Ember['default'].Binding.oneWay("entry.startedAtHour"),
    finishedAtHourBinding: Ember['default'].Binding.oneWay("entry.finishedAtHour"),

    startedAt: (function () {
      var day = this.get("startedAtDay"),
          hour = this.get("startedAtHour");
      return moment['default'](day + " " + hour, "YYYY-MM-DD HH:mm").toDate();
    }).property("startedAtDay", "startedAtHour"),

    finishedAt: (function () {
      var day = this.get("startedAtDay"),
          hour = this.get("finishedAtHour");
      return moment['default'](day + " " + hour, "YYYY-MM-DD HH:mm").toDate();
    }).property("startedAtDay", "finishedAtHour"),

    dayIsValid: (function () {
      return moment['default'](this.get("startedAtDay"), "YYYY-MM-DD").isValid();
    }).property("startedAtDay"),

    startedAtIsValid: (function () {
      return moment['default'](this.get("startedAtHour"), "HH:mm").isValid();
    }).property("startedAtHour"),

    finishedAtHourIsValid: (function () {
      return moment['default'](this.get("finishedAtHour"), "HH:mm").isValid();
    }).property("finishedAtHour"),

    startedAtIsBeforeFinishedAt: (function () {
      return this.get("startedAt").getTime() <= this.get("finishedAt").getTime();
    }).property("startedAt", "finishedAt"),

    finishedAtIsValid: Ember['default'].computed.and("finishedAtHourIsValid", "startedAtIsBeforeFinishedAt"),
    isValid: Ember['default'].computed.and("dayIsValid", "startedAtIsValid", "finishedAtIsValid"),

    projectChoices: null,

    selectProject: function (project) {
      this.setProperties({
        projectChoices: null,
        project: project
      });
      if (project) {
        this.set("projectName", project.get("name"));
      }
    },

    update: function () {
      var updatedProperties = this.getProperties("title", "startedAt", "finishedAt", "project");
      this.get("entry").setProperties(updatedProperties);
    }
  });

});
define('tactic/models/entry-list', ['exports', 'ember', 'moment'], function (exports, Ember, moment) {

  'use strict';

  exports['default'] = Ember['default'].ArrayProxy.extend(Ember['default'].SortableMixin, {
    content: null,
    key: null,
    sortProperties: ["differedStartedAtTime"],
    sortAscending: false,

    date: (function () {
      var split = this.get("key").split("-");
      return new Date(split[0], parseInt(split[1]) - 1, split[2]);
    }).property("key"),

    isBefore: function (otherEntryList) {
      var date = this.get("date"),
          otherDate = otherEntryList.get("date");
      return date < otherDate;
    },

    time: (function () {
      return this.get("content.lastObject.startedAt");
    }).property("content.lastObject.startedAt"),

    duration: (function () {
      var startedAt, finishedAt;

      return this.get("content").reduce(function (duration, entry) {
        finishedAt = entry.get("differedFinishedAtTime");
        startedAt = entry.get("differedStartedAtTime");
        if (finishedAt && startedAt) {
          return duration + finishedAt - startedAt;
        } else {
          return duration;
        }
      }, 0);
    }).property("content.@each.differedStartedAtTime", "content.@each.differedFinishedAtTime"),

    isToday: (function () {
      return moment['default'](this.get("date")).format("YYYY-MM-DD") === moment['default']().format("YYYY-MM-DD");
    }).property("date"),

    inCurrentWeek: (function () {
      var date = this.get("date"),
          now = new Date();
      return now.getTime() - date.getTime() < 1000 * 3600 * 24 * 7;
    }).property("date")
  });

});
define('tactic/models/entry', ['exports', 'ember-data', 'moment'], function (exports, DS, moment) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    title: DS['default'].attr("string"),
    startedAt: DS['default'].attr("date"),
    finishedAt: DS['default'].attr("date"),
    user: DS['default'].belongsTo("User"),
    project: DS['default'].belongsTo("Project"),

    duration: (function () {
      var startedAt = this.get("startedAt"),
          finishedAt = this.get("finishedAt");
      if (startedAt && finishedAt) {
        return finishedAt.getTime() - startedAt.getTime();
      }
    }).property("startedAt", "finishedAt"),

    projectName: (function () {
      return this.get("project.name");
    }).property("project.name"),

    startedAtDay: (function () {
      return moment['default'](this.get("startedAt")).format("YYYY-MM-DD");
    }).property("startedAt"),

    startedAtHour: (function () {
      return moment['default'](this.get("startedAt")).format("H:mm");
    }).property("startedAt"),

    finishedAtHour: (function () {
      return moment['default'](this.get("finishedAt")).format("H:mm");
    }).property("finishedAt")
  });

});
define('tactic/models/project', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    name: DS['default'].attr("string")
  });

});
define('tactic/models/user', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    name: DS['default'].attr("string")
  });

});
define('tactic/router', ['exports', 'ember', 'tactic/config/environment'], function (exports, Ember, config) {

  'use strict';

  var Router = Ember['default'].Router.extend({
    location: config['default'].locationType
  });

  Router.map(function () {
    this.route("login");
  });

  exports['default'] = Router;

});
define('tactic/routes/index', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    beforeModel: function () {
      if (!this.controllerFor("application").get("currentUser")) {
        this.transitionTo("login");
        return;
      }
      this.store.find("entry");
    },

    model: function () {
      var userId = this.controllerFor("application").get("currentUser.id");
      return this.store.filter("entry", function (entry) {
        return entry.get("startedAt") && entry.get("finishedAt") && entry.get("user.id") === userId;
      });
    },

    setupController: function (controller) {
      this._super.apply(this, arguments);
      controller.buildNewEntry();
    }
  });

});
define('tactic/routes/login', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    model: function () {
      return this.store.find("user");
    },

    actions: {
      chooseUser: function (user) {
        this.controllerFor("application").set("currentUser", user);
        this.transitionTo("index");
      }
    }
  });

});
define('tactic/serializers/application', ['exports', 'ember-data'], function (exports, DS) {

	'use strict';

	exports['default'] = DS['default'].ActiveModelSerializer.extend();

});
define('tactic/templates/application', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Ember['default'].Handlebars.helpers); data = data || {};
    var buffer = '', stack1, self=this, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\n      <span class=\"user\">\n        @ ");
    stack1 = helpers._triageMustache.call(depth0, "currentUser.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n      </span>\n    ");
    return buffer;
    }

  function program3(depth0,data) {
    
    var buffer = '', stack1, helper, options;
    data.buffer.push("\n    <div class=\"content\">\n      <section class=\"current-week\">\n        <span class=\"current-week-btn\">\n          This week\n        </span>\n        <div class=\"current-week-hover\">\n          <h3>Me</h3>\n          <ul>\n            ");
    stack1 = helpers.each.call(depth0, "myProjectsDurationInCurrentWeek", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n            <li>\n              <span class=\"label total\">Total</span>\n              <span class=\"duration\">");
    data.buffer.push(escapeExpression((helper = helpers['format-duration'] || (depth0 && depth0['format-duration']),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "myTotalDurationInCurrentWeek", options) : helperMissing.call(depth0, "format-duration", "myTotalDurationInCurrentWeek", options))));
    data.buffer.push("</span>\n            </li>\n          </ul>\n          <h3>Everyone</h3>\n          <ul>\n            ");
    stack1 = helpers.each.call(depth0, "projectsDurationInCurrentWeek", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n            <li>\n              <span class=\"label total\">Total</span>\n              <span class=\"duration\">");
    data.buffer.push(escapeExpression((helper = helpers['format-duration'] || (depth0 && depth0['format-duration']),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "totalDurationInCurrentWeek", options) : helperMissing.call(depth0, "format-duration", "totalDurationInCurrentWeek", options))));
    data.buffer.push("</span>\n            </li>\n          </ul>\n        </div>\n      </section>\n    </div>\n  ");
    return buffer;
    }
  function program4(depth0,data) {
    
    var buffer = '', stack1, helper, options;
    data.buffer.push("\n              <li>\n                <span class=\"label\">\n                  ");
    stack1 = helpers['if'].call(depth0, "project", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(7, program7, data),fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n                </span>\n                <span class=\"duration\">\n                  ");
    data.buffer.push(escapeExpression((helper = helpers['format-duration'] || (depth0 && depth0['format-duration']),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "duration", options) : helperMissing.call(depth0, "format-duration", "duration", options))));
    data.buffer.push("\n                </span>\n              </li>\n            ");
    return buffer;
    }
  function program5(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\n                    ");
    stack1 = helpers._triageMustache.call(depth0, "project.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n                  ");
    return buffer;
    }

  function program7(depth0,data) {
    
    
    data.buffer.push("\n                    <i>No project</i>\n                  ");
    }

    data.buffer.push("<div class=\"header\">\n  <h1>\n    <span class=\"brand\">\n      Tactic\n    </span>\n    ");
    stack1 = helpers['if'].call(depth0, "currentUser", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n  </h1>\n\n  ");
    stack1 = helpers['if'].call(depth0, "currentUser", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n</div>\n\n<div class=\"content\">\n  ");
    stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n</div>\n");
    return buffer;
    
  });

});
define('tactic/templates/entry-edit', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Ember['default'].Handlebars.helpers); data = data || {};
    var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

  function program1(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\n      <div class=\"project-choices\">\n        <ul>\n          ");
    stack1 = helpers.each.call(depth0, "project", "in", "projectChoices", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n        </ul>\n      </div>\n    ");
    return buffer;
    }
  function program2(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\n            <li ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectProject", "project", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
    data.buffer.push(">");
    stack1 = helpers._triageMustache.call(depth0, "project.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("</li>\n          ");
    return buffer;
    }

    data.buffer.push("<div>\n  ");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
      'value': ("title"),
      'classNames': ("title focus-title")
    },hashTypes:{'value': "ID",'classNames': "STRING"},hashContexts:{'value': depth0,'classNames': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("\n  <div class=\"project\">\n    ");
    data.buffer.push(escapeExpression((helper = helpers['select-on-focus-input'] || (depth0 && depth0['select-on-focus-input']),options={hash:{
      'value': ("projectName"),
      'classNames': ("focus-project")
    },hashTypes:{'value': "ID",'classNames': "STRING"},hashContexts:{'value': depth0,'classNames': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "select-on-focus-input", options))));
    data.buffer.push("\n    ");
    stack1 = helpers['if'].call(depth0, "projectChoices", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n  </div>\n  <span class=\"date\">\n    ");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
      'value': ("startedAtDay"),
      'classBinding': ("dayIsValid::error")
    },hashTypes:{'value': "ID",'classBinding': "STRING"},hashContexts:{'value': depth0,'classBinding': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("\n  </span>\n  <span class=\"time\">\n    ");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
      'value': ("startedAtHour"),
      'classBinding': (":focus-time startedAtIsValid::error")
    },hashTypes:{'value': "ID",'classBinding': "STRING"},hashContexts:{'value': depth0,'classBinding': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("\n  </span>\n  to\n  <span class=\"time\">\n    ");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
      'value': ("finishedAtHour"),
      'classBinding': ("finishedAtIsValid::error")
    },hashTypes:{'value': "ID",'classBinding': "STRING"},hashContexts:{'value': depth0,'classBinding': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("\n  </span>\n</div>\n<div class=\"actions\">\n  <a href=\"\" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "restoreEntry", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
    data.buffer.push(">Cancel</a>\n</div>\n");
    return buffer;
    
  });

});
define('tactic/templates/index', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Ember['default'].Handlebars.helpers); data = data || {};
    var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

  function program1(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\n      <div class=\"project-choices\">\n        <ul>\n          ");
    stack1 = helpers.each.call(depth0, "project", "in", "projectChoices", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n        </ul>\n      </div>\n    ");
    return buffer;
    }
  function program2(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\n            <li ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "selectProject", "project", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
    data.buffer.push(">");
    stack1 = helpers._triageMustache.call(depth0, "project.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("</li>\n          ");
    return buffer;
    }

  function program4(depth0,data) {
    
    var buffer = '';
    data.buffer.push("\n    <button class=\"stop-button\" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "stopTimer", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
    data.buffer.push(">Stop</button>\n  ");
    return buffer;
    }

  function program6(depth0,data) {
    
    var buffer = '';
    data.buffer.push("\n    <button class=\"start-button\" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "startTimer", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
    data.buffer.push(">Start</button>\n  ");
    return buffer;
    }

  function program8(depth0,data) {
    
    var buffer = '', stack1, helper, options;
    data.buffer.push("\n    <h2 ");
    data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
      'title': ("entryList.key")
    },hashTypes:{'title': "ID"},hashContexts:{'title': depth0},contexts:[],types:[],data:data})));
    data.buffer.push(">\n      ");
    stack1 = helpers['if'].call(depth0, "entryList.isToday", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(11, program11, data),fn:self.program(9, program9, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n      <span class=\"duration\">\n        ");
    data.buffer.push(escapeExpression((helper = helpers['format-duration'] || (depth0 && depth0['format-duration']),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "entryList.duration", options) : helperMissing.call(depth0, "format-duration", "entryList.duration", options))));
    data.buffer.push("\n      </span>\n    </h2>\n    <ul>\n      ");
    stack1 = helpers.each.call(depth0, "entry", "in", "entryList", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(16, program16, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n    </ul>\n  ");
    return buffer;
    }
  function program9(depth0,data) {
    
    
    data.buffer.push("\n        Today\n      ");
    }

  function program11(depth0,data) {
    
    var stack1;
    stack1 = helpers['if'].call(depth0, "entryList.inCurrentWeek", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(14, program14, data),fn:self.program(12, program12, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    else { data.buffer.push(''); }
    }
  function program12(depth0,data) {
    
    var buffer = '', helper, options;
    data.buffer.push("\n        ");
    data.buffer.push(escapeExpression((helper = helpers.ago || (depth0 && depth0.ago),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "entryList.time", options) : helperMissing.call(depth0, "ago", "entryList.time", options))));
    data.buffer.push("\n      ");
    return buffer;
    }

  function program14(depth0,data) {
    
    var buffer = '', helper, options;
    data.buffer.push("\n        ");
    data.buffer.push(escapeExpression((helper = helpers.moment || (depth0 && depth0.moment),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["ID","STRING"],data:data},helper ? helper.call(depth0, "entryList.time", "ll", options) : helperMissing.call(depth0, "moment", "entryList.time", "ll", options))));
    data.buffer.push("\n      ");
    return buffer;
    }

  function program16(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\n        ");
    stack1 = helpers['if'].call(depth0, "entry.isEditing", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(19, program19, data),fn:self.program(17, program17, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n      ");
    return buffer;
    }
  function program17(depth0,data) {
    
    var buffer = '';
    data.buffer.push("\n          ");
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "entry-edit", {hash:{
      'context': ("entry.editForm"),
      'focusOn': ("entry.editFocus")
    },hashTypes:{'context': "ID",'focusOn': "ID"},hashContexts:{'context': depth0,'focusOn': depth0},contexts:[depth0],types:["STRING"],data:data})));
    data.buffer.push("\n        ");
    return buffer;
    }

  function program19(depth0,data) {
    
    var buffer = '', stack1, helper, options;
    data.buffer.push("\n          <li ");
    data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
      'class': (":entry entry.isDeleting:deleting")
    },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
    data.buffer.push(">\n            <div>\n              <span class=\"title\" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "editEntry", "title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
    data.buffer.push(">\n                ");
    stack1 = helpers['if'].call(depth0, "entry.title", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(22, program22, data),fn:self.program(20, program20, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n              </span>\n              <span class=\"project\" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "editEntry", "project", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
    data.buffer.push(">\n                ");
    stack1 = helpers['if'].call(depth0, "entry.project.name", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(26, program26, data),fn:self.program(24, program24, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n              </span>\n              <span class=\"duration\" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "editEntry", "time", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
    data.buffer.push(">");
    data.buffer.push(escapeExpression((helper = helpers['format-duration'] || (depth0 && depth0['format-duration']),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "entry.duration", options) : helperMissing.call(depth0, "format-duration", "entry.duration", options))));
    data.buffer.push("</span>\n              <span class=\"time-range\"  ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "editEntry", "time", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
    data.buffer.push(">\n                ");
    stack1 = helpers._triageMustache.call(depth0, "entry.startedAtHour", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n                -\n                ");
    stack1 = helpers._triageMustache.call(depth0, "entry.finishedAtHour", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n              </span>\n            </div>\n            <div class=\"actions\">\n              ");
    stack1 = helpers['if'].call(depth0, "entry.saveScheduled", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(30, program30, data),fn:self.program(28, program28, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n            </div>\n          </li>\n        ");
    return buffer;
    }
  function program20(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\n                  ");
    stack1 = helpers._triageMustache.call(depth0, "entry.title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n                ");
    return buffer;
    }

  function program22(depth0,data) {
    
    
    data.buffer.push("\n                  <i>No title</i>\n                ");
    }

  function program24(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\n                  ");
    stack1 = helpers._triageMustache.call(depth0, "entry.project.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n                ");
    return buffer;
    }

  function program26(depth0,data) {
    
    
    data.buffer.push("\n                  <i>No project</i>\n                ");
    }

  function program28(depth0,data) {
    
    var buffer = '';
    data.buffer.push("\n                <a href=\"\" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "cancelSaveEntry", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
    data.buffer.push(">\n                  Restore changes\n                </a>\n              ");
    return buffer;
    }

  function program30(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push(" ");
    stack1 = helpers['if'].call(depth0, "entry.isDeleting", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(33, program33, data),fn:self.program(31, program31, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    return buffer;
    }
  function program31(depth0,data) {
    
    var buffer = '';
    data.buffer.push("\n                <a href=\"\" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "cancelDeleteEntry", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
    data.buffer.push(">\n                  Cancel deletion\n                </a>\n              ");
    return buffer;
    }

  function program33(depth0,data) {
    
    var buffer = '';
    data.buffer.push("\n                <a href=\"\" ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "deleteEntry", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
    data.buffer.push(">Delete</a>\n              ");
    return buffer;
    }

    data.buffer.push("<section class=\"new-entry\">\n  ");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
      'classNames': ("title"),
      'placeholder': ("What are you working on ?"),
      'value': ("newEntry.title"),
      'action': ("startTimer"),
      'key-press': ("startTimer")
    },hashTypes:{'classNames': "STRING",'placeholder': "STRING",'value': "ID",'action': "STRING",'key-press': "STRING"},hashContexts:{'classNames': depth0,'placeholder': depth0,'value': depth0,'action': depth0,'key-press': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("\n  <div class=\"project\">\n    ");
    data.buffer.push(escapeExpression((helper = helpers['select-on-focus-input'] || (depth0 && depth0['select-on-focus-input']),options={hash:{
      'classNames': ("project-input"),
      'placeholder': ("Project"),
      'value': ("newEntryProjectName")
    },hashTypes:{'classNames': "STRING",'placeholder': "STRING",'value': "ID"},hashContexts:{'classNames': depth0,'placeholder': depth0,'value': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "select-on-focus-input", options))));
    data.buffer.push("\n    ");
    stack1 = helpers['if'].call(depth0, "projectChoices", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n  </div>\n  ");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
      'classNames': ("duration"),
      'disabled': ("disabled"),
      'value': ("newEntryDuration")
    },hashTypes:{'classNames': "STRING",'disabled': "STRING",'value': "ID"},hashContexts:{'classNames': depth0,'disabled': depth0,'value': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("\n  ");
    stack1 = helpers['if'].call(depth0, "timerStarted", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(6, program6, data),fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n</section>\n\n<section class=\"entry-list\">\n  ");
    stack1 = helpers.each.call(depth0, "entryList", "in", "entriesByDay", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(8, program8, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n</section>\n");
    return buffer;
    
  });

});
define('tactic/templates/login', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Ember['default'].Handlebars.helpers); data = data || {};
    var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

  function program1(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\n      <li ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "chooseUser", "user", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
    data.buffer.push(">@");
    stack1 = helpers._triageMustache.call(depth0, "user.name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("</li>\n    ");
    return buffer;
    }

    data.buffer.push("<section class=\"login\">\n  <h1>Sign in</h1>\n  <ul>\n    ");
    stack1 = helpers.each.call(depth0, "user", "in", "", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n  </ul>\n</section>\n");
    return buffer;
    
  });

});
define('tactic/tests/adapters/application.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/application.js should pass jshint', function() { 
    ok(true, 'adapters/application.js should pass jshint.'); 
  });

});
define('tactic/tests/app.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('app.js should pass jshint', function() { 
    ok(true, 'app.js should pass jshint.'); 
  });

});
define('tactic/tests/components/select-on-focus-input.jshint', function () {

  'use strict';

  module('JSHint - components');
  test('components/select-on-focus-input.js should pass jshint', function() { 
    ok(true, 'components/select-on-focus-input.js should pass jshint.'); 
  });

});
define('tactic/tests/controllers/application.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/application.js should pass jshint', function() { 
    ok(true, 'controllers/application.js should pass jshint.'); 
  });

});
define('tactic/tests/controllers/entry.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/entry.js should pass jshint', function() { 
    ok(true, 'controllers/entry.js should pass jshint.'); 
  });

});
define('tactic/tests/controllers/index.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/index.js should pass jshint', function() { 
    ok(true, 'controllers/index.js should pass jshint.'); 
  });

});
define('tactic/tests/helpers/format-duration.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/format-duration.js should pass jshint', function() { 
    ok(true, 'helpers/format-duration.js should pass jshint.'); 
  });

});
define('tactic/tests/helpers/resolver', ['exports', 'ember/resolver', 'tactic/config/environment'], function (exports, Resolver, config) {

  'use strict';

  var resolver = Resolver['default'].create();

  resolver.namespace = {
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix
  };

  exports['default'] = resolver;

});
define('tactic/tests/helpers/resolver.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/resolver.js should pass jshint', function() { 
    ok(true, 'helpers/resolver.js should pass jshint.'); 
  });

});
define('tactic/tests/helpers/start-app', ['exports', 'ember', 'tactic/app', 'tactic/router', 'tactic/config/environment'], function (exports, Ember, Application, Router, config) {

  'use strict';



  exports['default'] = startApp;
  function startApp(attrs) {
    var application;

    var attributes = Ember['default'].merge({}, config['default'].APP);
    attributes = Ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    Ember['default'].run(function () {
      application = Application['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }

});
define('tactic/tests/helpers/start-app.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/start-app.js should pass jshint', function() { 
    ok(true, 'helpers/start-app.js should pass jshint.'); 
  });

});
define('tactic/tests/models/entry-form.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/entry-form.js should pass jshint', function() { 
    ok(true, 'models/entry-form.js should pass jshint.'); 
  });

});
define('tactic/tests/models/entry-list.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/entry-list.js should pass jshint', function() { 
    ok(true, 'models/entry-list.js should pass jshint.'); 
  });

});
define('tactic/tests/models/entry.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/entry.js should pass jshint', function() { 
    ok(true, 'models/entry.js should pass jshint.'); 
  });

});
define('tactic/tests/models/project.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/project.js should pass jshint', function() { 
    ok(true, 'models/project.js should pass jshint.'); 
  });

});
define('tactic/tests/models/user.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/user.js should pass jshint', function() { 
    ok(true, 'models/user.js should pass jshint.'); 
  });

});
define('tactic/tests/router.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('router.js should pass jshint', function() { 
    ok(true, 'router.js should pass jshint.'); 
  });

});
define('tactic/tests/routes/index.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/index.js should pass jshint', function() { 
    ok(true, 'routes/index.js should pass jshint.'); 
  });

});
define('tactic/tests/routes/login.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/login.js should pass jshint', function() { 
    ok(true, 'routes/login.js should pass jshint.'); 
  });

});
define('tactic/tests/serializers/application.jshint', function () {

  'use strict';

  module('JSHint - serializers');
  test('serializers/application.js should pass jshint', function() { 
    ok(true, 'serializers/application.js should pass jshint.'); 
  });

});
define('tactic/tests/test-helper', ['tactic/tests/helpers/resolver', 'ember-qunit'], function (resolver, ember_qunit) {

	'use strict';

	ember_qunit.setResolver(resolver['default']);

});
define('tactic/tests/test-helper.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('test-helper.js should pass jshint', function() { 
    ok(true, 'test-helper.js should pass jshint.'); 
  });

});
define('tactic/tests/unit/controllers/entry-test', ['ember-qunit', 'ember'], function (ember_qunit, Ember) {

  'use strict';

  ember_qunit.moduleFor("controller:entry", "EntryController", {
    // Specify the other units that are required for this test.
    needs: ["controller:index"]
  });

  // Replace this with your real tests.
  ember_qunit.test("it exists", function () {
    var entry = Ember['default'].Object.create({ startedAt: new Date(), finishedAt: new Date() });
    var controller = this.subject({ content: entry });
    ok(controller);
  });

});
define('tactic/tests/unit/controllers/entry-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/entry-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/entry-test.js should pass jshint.'); 
  });

});
define('tactic/tests/unit/controllers/index-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:index", "IndexController", {
    // Specify the other units that are required for this test.
    needs: ["controller:application"]
  });

  // Replace this with your real tests.
  ember_qunit.test("it exists", function () {
    var controller = this.subject();
    ok(controller);
  });

});
define('tactic/tests/unit/controllers/index-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/index-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/index-test.js should pass jshint.'); 
  });

});
define('tactic/tests/unit/models/entry-list-test', ['ember-qunit', 'ember', 'tactic/models/entry-list'], function (ember_qunit, Ember, EntryList) {

  'use strict';

  function subject() {
    return EntryList['default'].create({
      content: [Ember['default'].Object.create({
        startedAt: new Date("2015-02-11T09:22:33Z"),
        finishedAt: new Date("2015-02-11T12:37:29Z")
      }), Ember['default'].Object.create({
        startedAt: new Date("2015-02-11T08:00:00Z"),
        finishedAt: new Date("2015-02-11T12:00:00Z")
      })],
      key: "2015-02-11"
    });
  }

  module("EntryList");

  ember_qunit.test("it exists", function () {
    var model = subject();
    ok(!!model);
  });

  ember_qunit.test("is is today", function () {
    var model = subject(),
        now = new Date();
    Ember['default'].run(function () {
      model.set("key", [now.getFullYear(), now.getMonth() + 1, now.getDate()].join("-"));
    });
    ok(model.get("isToday"));
  });

  ember_qunit.test("it is not today", function () {
    var model = subject();
    ok(!model.get("isToday"));
  });

  ember_qunit.test("is in current week", function () {
    var model = subject(),
        now = new Date();
    Ember['default'].run(function () {
      model.set("key", [now.getFullYear(), now.getMonth() + 1, now.getDate()].join("-"));
    });
    ok(model.get("inCurrentWeek"));
  });

  ember_qunit.test("it is not in current week", function () {
    var model = subject();
    ok(!model.get("inCurrentWeek"));
  });

});
define('tactic/tests/unit/models/entry-list-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/entry-list-test.js should pass jshint', function() { 
    ok(true, 'unit/models/entry-list-test.js should pass jshint.'); 
  });

});
define('tactic/tests/unit/models/entry-test', ['ember-qunit', 'ember'], function (ember_qunit, Ember) {

  'use strict';

  ember_qunit.moduleForModel("entry", "Entry", {
    // Specify the other units that are required for this test.
    needs: ["model:Project", "model:User"]
  });

  ember_qunit.test("it exists", function () {
    var model = this.subject();
    // var store = this.store();
    ok(!!model);
  });

  ember_qunit.test("duration exists", function () {
    var model = this.subject(),
        startedAt = new Date("2015-01-01T11:00:00Z"),
        finishedAt = new Date("2015-01-01T13:24:37Z");
    Ember['default'].run(function () {
      model.setProperties({
        startedAt: startedAt,
        finishedAt: finishedAt
      });
    });
    equal(model.get("duration"), finishedAt.getTime() - startedAt.getTime(), "The duration is properly computed");
  });

});
define('tactic/tests/unit/models/entry-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/entry-test.js should pass jshint', function() { 
    ok(true, 'unit/models/entry-test.js should pass jshint.'); 
  });

});
define('tactic/tests/unit/models/project-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("project", "Project", {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test("it exists", function () {
    var model = this.subject();
    // var store = this.store();
    ok(!!model);
  });

});
define('tactic/tests/unit/models/project-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/project-test.js should pass jshint', function() { 
    ok(true, 'unit/models/project-test.js should pass jshint.'); 
  });

});
define('tactic/tests/unit/routes/index-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:index", "IndexRoute", {});

  ember_qunit.test("it exists", function () {
    var route = this.subject();
    ok(route);
  });
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('tactic/tests/unit/routes/index-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/index-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/index-test.js should pass jshint.'); 
  });

});
define('tactic/tests/utils/format-duration.jshint', function () {

  'use strict';

  module('JSHint - utils');
  test('utils/format-duration.js should pass jshint', function() { 
    ok(true, 'utils/format-duration.js should pass jshint.'); 
  });

});
define('tactic/tests/utils/group-by.jshint', function () {

  'use strict';

  module('JSHint - utils');
  test('utils/group-by.js should pass jshint', function() { 
    ok(true, 'utils/group-by.js should pass jshint.'); 
  });

});
define('tactic/tests/views/entry-edit.jshint', function () {

  'use strict';

  module('JSHint - views');
  test('views/entry-edit.js should pass jshint', function() { 
    ok(true, 'views/entry-edit.js should pass jshint.'); 
  });

});
define('tactic/utils/format-duration', ['exports'], function (exports) {

  'use strict';



  exports['default'] = formatDuration;
  function integerToStringWithTwoNumbers(integer) {
    var string = "" + integer;
    if (string.length === 1) {
      string = "0" + string;
    }
    return string;
  }function formatDuration(durationInMs) {
    var durationInS = parseInt(durationInMs / 1000);
    var hours = parseInt(durationInS / 3600),
        minutes = integerToStringWithTwoNumbers(parseInt(durationInS / 60) % 60),
        seconds = integerToStringWithTwoNumbers(parseInt(durationInS) % 60);
    return "" + hours + ":" + minutes + ":" + seconds;
  }

});
define('tactic/utils/group-by', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var get = Ember['default'].get,
      arrayComputed = Ember['default'].arrayComputed;

  exports['default'] = function (dependentKey, property, groupClass) {
    var options = {
      initialValue: [],

      addedItem: function (array, item) {
        var key = get(item, property),
            group = array.findBy("key", key);
        if (!group) {
          group = groupClass.create({
            content: [],
            key: key
          });
          var index = array.indexOf(array.find(function (otherGroup) {
            return otherGroup.isBefore(group);
          }));
          if (index === -1) {
            array.pushObject(group);
          } else {
            array.insertAt(index, group);
          }
        }

        group.pushObject(item);

        return array;
      },

      removedItem: function (array, item) {
        var group = array.find(function (g) {
          return g.contains(item);
        });
        if (!group) {
          return;
        }

        group.removeObject(item);

        if (get(group, "length") === 0) {
          array.removeObject(group);
        }
        return array;
      }

    };
    return arrayComputed(dependentKey, options);
  };

});
define('tactic/views/entry-edit', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].View.extend({
    templateName: "entry-edit",
    tagName: "li",
    classNames: "entry entry-edit",
    focusOn: null,

    becomeFocused: (function () {
      var focusOn = this.get("focusOn");
      if (focusOn) {
        this.$(".focus-" + focusOn).focus();
      }
    }).on("didInsertElement"),

    mouseUpEventName: (function () {
      return "mouseup." + this.get("elementId");
    }).property("elementId"),

    setScheduleSaveOnMouseUp: (function () {
      var self = this,
          eventName = this.get("mouseUpEventName");
      Ember['default'].$(document).on(eventName, function (event) {
        if (self.$().has(event.target).length === 0) {
          self.get("controller").send("scheduleSaveEntry");
        }
      });
    }).on("didInsertElement"),

    removeScheduleSaveOnMouseUp: (function () {
      var eventName = this.get("mouseUpEventName");
      Ember['default'].$(document).off(eventName);
    }).on("willClearRender")
  });

});
/* jshint ignore:start */

define('tactic/config/environment', ['ember'], function(Ember) {
  var prefix = 'tactic';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

if (runningTests) {
  require("tactic/tests/test-helper");
} else {
  require("tactic/app")["default"].create({"name":"tactic","version":"0.0.0.e39fcc91"});
}

/* jshint ignore:end */
//# sourceMappingURL=tactic.map