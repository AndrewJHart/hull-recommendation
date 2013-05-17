/*global $:true, Hull:true */
$(function () {
  "use strict";
  $('#render').on('click', '.login', function () {
    Hull.login('twitter');
  });
  $('#render').on('click', '.logout', function () {
    Hull.logout();
  });


  function applyPopOver (elt, sig, contents) {
    contents = $(contents).attr('data-related-sig', sig);
    elt.popover('destroy');
    elt.popover({placement:'bottom', 'title':'What do you think?', trigger:'manual', html:true, content:contents});
    elt.popover('show');
  }

  function applyTemplating(contents, res, count, ppl) {
    contents.find(res ? '.like' : '.unlike').hide();
    contents.find('.countLikes').text(count ? count + ' recommendations' : 'No recommendation');
    $.each(ppl, function (idx, data) {
      var user = data.user;
      var $media = $('#user_template').clone();
      $media.find('img').attr('src', user.picture);
      $media.find('.media-heading').text(user.name);
      contents.find('.recommendations').append($media);
    });
    return contents;
  }


  function findEntity (_sig) {
    return Hull.data.api('~' + _sig);
  }

  function countLikes (obj) {
    return Hull.data.api(obj.id + '/liked');
  }

  function whoLikedEntity (obj) {
    return Hull.data.api(obj.id + '/likes');
  }

  function checkUserHasLiked (obj) {
    return Hull.data.api('me/liked/' + obj.id);
  }

  function fetchHullData (_sig, _elt, contents) {
    var entityPromise = findEntity(_sig);
    var countLikesPromise = entityPromise.then(function (ent) { return ent.stats.likes || 0; });
    var hasLikedPromise = entityPromise.then(checkUserHasLiked);
    var whoLikedPromise = entityPromise.then(whoLikedEntity);
    $.when(contents, hasLikedPromise, countLikesPromise, whoLikedPromise)
      .then(applyTemplating)
      .then(function (contents) {
        applyPopOver(_elt, _sig, contents);
      }
    );
  }

  Hull.on('widget.social.popover', function (_elt, loggedIn) {
    _elt = $(_elt);
    var contents, _sig = btoa(_elt.html());
    if (loggedIn) {
      contents = $('#popover_template').clone();
      fetchHullData(_sig, _elt, contents);
    } else {
      contents = $('#login_template').clone();
      applyPopOver(_elt, _sig, contents);
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
