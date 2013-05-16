$(function () {
  $('#render').on('click', '.login', function () {
    Hull.login('twitter');
  });
  $('#render').on('click', '.logout', function () {
    Hull.logout();
  });


  function assignPopOver (elt, sig, contents) {
    contents = $(contents).attr('data-related-sig', sig);
    elt.popover('destroy');
    elt.popover({placement:'bottom', 'title':'title', trigger:'manual', html:true, content:contents[0].outerHTML});
    elt.popover('show');
  }

  function findEntity (_sig) {
    return Hull.data.api('~' + _sig);
  }

  function hasLiked (obj) {
    return Hull.data.api('me/liked/' + obj.id);
  }

  function manageEntity (_sig, _elt, contents) {
    findEntity(_sig)
      .then(hasLiked)
      .then(function (res) {
        contents.find(res ? '.like' : '.unlike').hide();
        assignPopOver(_elt, _sig, contents);
    });
  }

  Hull.on('widget.social.popover', function (_elt, loggedIn) {
    var contents, _elt = $(_elt);
    var _sig = btoa(_elt.html());
    if (loggedIn) {
      contents = $('#popover_template').clone();
      manageEntity(_sig, _elt, contents);
    } else {
      contents = $('#login_template').clone();
      assignPopOver(_elt, _sig, contents);
    }
    contents.attr('id', null);
  });

  $('#render').on('click', '.unlike', function () {
    var sig = $(this).parents('[data-related-sig]').attr('data-related-sig');
    Hull.data.api.delete('~' + sig + '/likes').then(function (obj) {
      Hull.emit('hull.widget.social.refresh');
    });
  });

  $('#render').on('click', '.like', function () {
    var sig = $(this).parents('[data-related-sig]').attr('data-related-sig');
    Hull.data.api.post('~' + sig + '/likes').then(function (obj) {
      Hull.emit('hull.widget.social.refresh');
    });
  });
});
