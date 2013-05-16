/*global $:true, Hull:true */
$(function () {
  "use strict";
  $('#render').on('click', '.login', function () {
    Hull.login('twitter');
  });
  $('#render').on('click', '.logout', function () {
    Hull.logout();
  });


  function assignPopOver (elt, sig, contents) {
    contents = $(contents).attr('data-related-sig', sig);
    elt.popover('destroy');
    elt.popover({placement:'bottom', 'title':'What do you think?', trigger:'manual', html:true, content:contents[0].outerHTML});
    elt.popover('show');
  }

  function findEntity (_sig) {
    return Hull.data.api('~' + _sig);
  }

  function countLikes (obj) {
    return Hull.data.api(obj.id + '/liked');
  }

  function checkUserHasLiked (obj) {
    return Hull.data.api('me/liked/' + obj.id);
  }

  function manageEntity (_sig, _elt, contents) {
    findEntity(_sig)
      .then(checkUserHasLiked)
      .then(function (res) {
        contents.find(res ? '.like' : '.unlike').hide();
        assignPopOver(_elt, _sig, contents);
      }
    );
  }

  Hull.on('widget.social.popover', function (_elt, loggedIn) {
    _elt = $(_elt);
    var contents, _sig = btoa(_elt.html());
    if (loggedIn) {
      contents = $('#popover_template').clone();
      manageEntity(_sig, _elt, contents);
    } else {
      contents = $('#login_template').clone();
      assignPopOver(_elt, _sig, contents);
    }
    contents.attr('id', null);
  });


  /**
   * Handles Likes/Unlikes
   */
  var toggles = ['like', 'unlike'], $rootElt = $('#render');
  toggles.forEach(function (action) {
    var className = '.' + action;
    var method = action === 'like' ? 'post' : 'delete';

    $rootElt.on('click', className, function () {
      var sig = $(this).parents('[data-related-sig]').attr('data-related-sig'),
        uri = '~' + sig + '/likes';
      Hull.data.api[method](uri).then(function () {
        Hull.emit('hull.widget.social.refresh');
      });
    });
  });
});
