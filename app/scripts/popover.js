/*global $:true, Hull:true */
$(function () {
  "use strict";
  var container = $('<div>'),
      _selectablesSelector = 'p,h1,h2,h3,h4,h5,h6';

  $.ajax('/README.md').then(function (res) {
    var _doc = marked(res);
    container.append(_doc);
    $('body').append(container);
    container.on('click', _selectablesSelector, toggleOnClick);
  });


  function toggleOnClick() {
    $(this).toggleClass('well');
    var isActive = $(this).hasClass('well');
    resetAllExcept(isActive ? $(this) : undefined);
    if (isActive) {
      showMeLuv($(this));
    }
  }

  function resetAllExcept(except) {
    container.find(_selectablesSelector).not(except).popover('destroy');
    container.find(_selectablesSelector).not(except).removeClass('well');
  }

  $.each(['login', 'logout'], function (index, action) {
    container.on('click', '.' + action, function () {
      Hull[action]('twitter');
    });
  });

  /**
   * Handles Recommendation handlers
   */
  function addEventListeners(elt, sig) {
    $.each(['like', 'unlike'], function (index, action) {
      var method = action === 'like' ? 'post' : 'delete';

      elt.on('click', '.' + action, function () {
        var uri = '~' + sig + '/likes';
        Hull.data.api(uri, method).then(resetAllExcept.bind(undefined, undefined));
      });
    });
  }



  function isHullUserLoggedIn () {
    return !!Hull.me.get('identities');
  }

  function createPopOver(elt, sig, contents) {
    addEventListeners(contents, sig);
    elt.popover('destroy');
    elt.popover({placement:'bottom', 'title':'What do you think?', trigger:'manual', html:true, content:contents});
    elt.popover('show');
  }

  function applyTemplating(contents, isLiked, count, ppl) {
    contents.find(isLiked ? '.like' : '.unlike').hide();
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


  function findEntity(_sig) {
    return Hull.data.api('~' + _sig);
  }

  function whoLikedEntity(obj) {
    return Hull.data.api(obj.id + '/likes');
  }

  function checkUserHasLiked(obj) {
    return Hull.data.api('me/liked/' + obj.id);
  }

  function fetchHullData(_sig) {
    var entityPromise = findEntity(_sig),
        countLikesPromise = entityPromise.then(function (ent) { return ent.stats.likes || 0; }),
        hasLikedPromise = entityPromise.then(checkUserHasLiked),
        whoLikedPromise = entityPromise.then(whoLikedEntity);
    return $.when(hasLikedPromise, countLikesPromise, whoLikedPromise);
  }

  function showMeLuv(_elt) {
    var $elt = $(_elt),
        loggedIn = isHullUserLoggedIn(),
        _sig = btoa($elt.html()),
        contents;

    if (loggedIn) {
      contents = $('#popover_template').clone();
      fetchHullData(_sig)
        .then(applyTemplating.bind(undefined, contents))
        .then(createPopOver.bind(undefined, $elt, _sig, contents));
    } else {
      contents = $('#login_template').clone();
      createPopOver($elt, _sig, contents);
    }
    contents.attr('id', null); // This is a clone of an element with an ID
  }

  Hull.on('model.hull.me.change', resetAllExcept.bind(undefined, undefined));
});
