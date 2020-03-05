const lwc = require('./packages/@lwc/engine/dist/engine-node.cjs');



  function tmpl($api, $cmp, $slotset, $ctx) {
    const {
      s: api_slot,
      d: api_dynamic,
      h: api_element
    } = $api;
    return [api_element("div", {
      classMap: {
        "slds-m-horizontal_xx-small": true,
        "slds-m-bottom_x-small": true
      },
      key: 2
    }, [api_slot("icon", {
      attrs: {
        "name": "icon"
      },
      key: 0
    }, [], $slotset), api_element("span", {
      classMap: {
        "slds-p-left_small": true
      },
      key: 1
    }, [api_dynamic($cmp.label)])])];
  }

  var _tmpl = lwc.registerTemplate(tmpl);
  tmpl.slots = ["icon"];
  tmpl.stylesheets = [];
  tmpl.stylesheetTokens = {
    hostAttribute: "c-child_child-host",
    shadowAttribute: "c-child_child"
  };

  /**
   * Show an item
   */

  class Child extends lwc.LightningElement {
    constructor(...args) {
      super(...args);
      this.label = '';
    }

  }

  lwc.registerDecorators(Child, {
    publicProps: {
      label: {
        config: 0
      }
    }
  });

  var _cChild = lwc.registerComponent(Child, {
    tmpl: _tmpl
  });

  function tmpl$1($api, $cmp, $slotset, $ctx) {
    const {
      t: api_text,
      h: api_element,
      k: api_key,
      c: api_custom_element,
      i: api_iterator,
      f: api_flatten
    } = $api;
    return [api_element("div", {
      classMap: {
        "app": true,
        "slds-p-around_x-large": true
      },
      key: 3
    }, api_flatten([api_text("Parent"), $cmp.showFeatures ? api_flatten([api_element("h2", {
      classMap: {
        "slds-text-heading_medium": true
      },
      key: 0
    }, [api_text("Features")]), api_iterator($cmp.features, function (feature) {
      return api_custom_element("c-child", _cChild, {
        props: {
          "label": feature.label
        },
        key: api_key(2, feature.label)
      }, [api_element("div", {
        attrs: {
          "icon-name": feature.icon,
          "size": "x-small",
          "slot": "icon"
        },
        key: 1
      }, [])]);
    })]) : []]))];
  }

  var _tmpl$1 = lwc.registerTemplate(tmpl$1);
  tmpl$1.stylesheets = [];


  tmpl$1.stylesheetTokens = {
    hostAttribute: "c-app_app-host",
    shadowAttribute: "c-app_app"
  };

  class App extends lwc.LightningElement {
    constructor(...args) {
      super(...args);
      this.title = 'Welcome to Lightning Web Components Playground!';
      this.showFeatures = true;
    }

    /**
     * Getter for the features property
     */
    get features() {
      return [{
        label: 'Edit the name and description of your component.',
        icon: 'utility:edit'
      }, {
        label: 'Create permanent, shareable URLs that anyone can view within your org.',
        icon: 'utility:save'
      }, {
        label: 'View changes to code instantly with Live Compilation.',
        icon: 'utility:refresh'
      }, {
        label: 'Style your components with SLDS.',
        icon: 'utility:brush'
      }, {
        label: 'Download and upload components as zip files.',
        icon: 'utility:download'
      }];
    }

  }

  lwc.registerDecorators(App, {
    track: {
      title: 1,
      showFeatures: 1
    }
  });

  var main = lwc.registerComponent(App, {
    tmpl: _tmpl$1
  });

const element = lwc.createElement('c-app', { is: main });
console.log(lwc.renderToString(element));
