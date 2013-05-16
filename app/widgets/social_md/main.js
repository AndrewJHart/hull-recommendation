/*global $:true, Hull:true, marked:true */
Hull.widget('social_md', {
  templates: ['main'],
  datasources: {
    doc: function () {
      "use strict";
      var _doc = $(this.options.srcSelector).text();
      var markup = marked(_doc);
      return markup;
    }
  },

  _selectablesSelector: 'p,h1,h2,h3,h4,h5,h6',

  initialize: function () {
    "use strict";
    var that = this;
    this.$el.on('click', this._selectablesSelector, function () {
      that.toggleAllBut($(this));
      $(this).toggleClass('well');
      $(this).popover('toggle');
    });
  },


  afterRender: function () {
    "use strict";
    this.$selectables = this.$el.find(this._selectablesSelector);
    this.$selectables.popover({placement: 'bottom', 'title': 'title', trigger:'manual', content: 'Ole'});
  },

  toggleAllBut: function (elt) {
    "use strict";
    this.$selectables.not(elt).popover('hide');
    this.$selectables.not(elt).removeClass('well');
  }
});
