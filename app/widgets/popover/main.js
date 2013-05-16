Hull.widget('popover', {
  templates: ['main'],
  initialize: function () {
    var that = this;
    this.sandbox.on('widget.social.popover', function (elt) {
      that.render('main', {elt: elt});
    });
  }
});
