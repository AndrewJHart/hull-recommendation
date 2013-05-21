// ## Purpose
// The purpose of this code is to allow users to recommend (aka 'like or 'upvote')
// portions of a Markdown document, and show as a popover how many users did so, as well as
// alongside their (Twitter-based) name and avatar.
//
// Generally speaking, it demonstrates how developers can create arbitrary social entities
// in their app using [hull.io](http://hull.io) to leverage their interactive (ie. social)
// feature set.
//
// ## How is it done ?
//
// The [hull.io](http://hull.io) APIs grant developers with the ability to turn
// any (uniquely defined) object into a featureful social object called `entity`.
//
// To do so, the only thing to do is a call to `Hull.data.api('~%SIGNATURE%')` where `%SIGNATURE%`
// is a base64-encoded version of any data (tipycally, an ID).
//
// Entities in [hull.io](http://hull.io) are created lazily, which means you don't have to
// explicitly create them. If an API call is performed on an entity that does no exist
// (like we do in this demo), [hull.io](http://hull.io) will assume it is a new entity
// and will create it before it performs the action defined by the API call.
//
// In this demo, we create entities from paragraphs and headings in a Markdown document.
// The signatures are plain base64 encodings of the `jQuery.fn.html()` evaluation
// for the selected element.

/*global $:true, Hull:true */
//
$(function () {
  "use strict";
  var container = $('.container'),
      // The set of HTML elements we want to be able to select and review
      _selectablesSelector = 'p,h1,h2,h3,h4,h5,h6,li';

  //We delegate click events on the selectables items to the container
  container.on('click', _selectablesSelector, toggleOnClick);

  // Fetch the markdown file, compile it to HTML and append it to the DOM
  $.ajax('./README.md').then(function (res) {
    var _doc = marked(res);
    container.append(_doc);
  });

  function showLoadingOnSelectable($elt) {
    $elt
      .popover('destroy')
      .popover({placement:'bottom', 'title':'', trigger:'manual', content:'Loading'})
      .popover('show');
  }

  // Here we just make sure that there can not be 2 active elements at the same time.
  function toggleOnClick() {
    $(this).toggleClass('well');
    var isActive = $(this).hasClass('well');
    resetAllExcept(isActive ? $(this) : undefined);
    if (isActive) {
      showMeLuv($(this));
    }
  }

  //Destroys all the popovers,
  //sets all the elements matching `_selectableSelector` to the default state.
  //
  //The first parameter can be anything accepted by the `.not()` function in jQuery,
  //and is for excluding some elements from the reset.
  function resetAllExcept(except) {
    container.find(_selectablesSelector).not(except).popover('destroy');
    container.find(_selectablesSelector).not(except).removeClass('well');
  }

  //Registers `click` handlers. `%SIGNATURE%` is a base64-encoded data.
  //
  // * `.login` => `Hull.login('twitter')
  // * `.logout` => `Hull.logout()` _(Actually calls `Hull.logout('twitter')` but the `'twitter'` parameter is not used)_
  // * `.like` => `Hull.data.api('~%SIGNATURE%/likes', 'post')`
  // * `.unlike` => `Hull.data.api('~%SIGNATURE%/likes', 'delete')`
  //
  // The `.like` (resp. `.unlike`) call could also have been written
  // `Hull.data.api.post('~%SIGNATURE%/likes')`
  // (resp. `Hull.data.api.delete('~%SIGNATURE%/likes')`)
  //
  $.each(['login', 'logout'], function (index, action) {
    container.on('click', '.' + action, function () {
      Hull[action]('twitter');
    });
  });

  function addEventListeners(elt, sig, origin) {
    $.each(['like', 'unlike'], function (index, action) {
      var method = action === 'like' ? 'post' : 'delete';

      elt.on('click', '.' + action, function () {
        var uri = '~' + sig + '/likes';
        Hull.data.api(uri, method)
          .then(resetAllExcept.bind(undefined, origin))
          .then(showMeLuv.bind(undefined, origin));
      });
    });
  }



  // This is how you can detect whether the current user is logged in regards to [hull.io](http://hull.io)
  function isHullUserLoggedIn () {
    return Hull.me && !!Hull.me.get('identities');
  }

  // We recreate popovers every time they have to be displayed
  // because their values may have changed (new users may have liked/unliked the targeted entity)
  function createPopOver(elt, sig, contents) {
    resetAllExcept(elt);
    addEventListeners(contents, sig, elt);
    elt.popover('destroy');
    elt.popover({placement:'bottom', 'title':'What do you think?', trigger:'manual', html:true, content:contents});
    elt.popover('show');
  }

  // Values are applied to the templates
  function applyTemplating(contents, isLiked, count, ppl) {
    contents.find(isLiked ? '.like' : '.unlike').hide();
    contents.find('.countLikes').text(count ? count + ' recommendations' : 'No recommendation');
    $.each(ppl, function (idx, data) {
      var user = data.user;
      var $media = $('#user_template').children().clone();
      $media.find('img').attr('src', user.picture)
                        .attr('title', user.name);
      contents.find('.recommendations').append($media);
    });
    return contents;
  }


  // Retrieve an entity. If the entity does not exist in [hull.io](http://hull.io),
  // it is automatically created. Whether it has to be created or not, an entity is returned by the API call.
  //
  // The function returns a pomise.
  function findEntity(_sig) {
    return Hull.data.api('~' + _sig);
  }

  // We want to know who liked our entity.
  //
  // Getting to know how many people liked a particular entity is provided as a property
  // of the entity itself (`my_entity.stats.likes`) and therefore is available
  // when you retrieve the entity, which means you do not have to manually retrieve
  // all the users who liked an entity to count them.
  function whoLikedEntity(obj) {
    return Hull.data.api(obj.id + '/likes');
  }

  //Whether the current user (if any) liked the current entity
  function checkUserHasLiked(obj) {
    return Hull.data.api('me/liked/' + obj.id);
  }

  // Retrieve al the data that is required to display the popover correctly
  var req = 0;
  function fetchHullData(_sig) {
    var entityPromise = findEntity(_sig),
        countLikesPromise = entityPromise.then(function (ent) { return ent.stats.likes || 0; }),
        hasLikedPromise = entityPromise.then(checkUserHasLiked),
        whoLikedPromise = entityPromise.then(whoLikedEntity);
    return $.when(++req, hasLikedPromise, countLikesPromise, whoLikedPromise);
  }

  //If the user has clicked on another selectable element while a previous
  //request is processed, we should stop the first one befre it renders
  //to avoid 2 consecutive or overlapping popovers
  function checkNewerRequest(reqCount, a, b, c) {
    var dfd = $.Deferred();
    if (reqCount !== req) {
      dfd.reject();
    } else {
      dfd.resolve(a, b, c);
    }
    return dfd.promise();
  }

  //Shows the popover related to the clicked entity
  function showMeLuv(_elt) {
    var $elt = $(_elt),
        loggedIn = isHullUserLoggedIn(),
        //This how we calculate the signature that will define our entity
        _sig = btoa($elt.html()),
        contents;

    if (loggedIn) {
      showLoadingOnSelectable($elt);
      contents = $('#popover_template').children().clone();
      fetchHullData(_sig)
        .then(checkNewerRequest)
        .then(applyTemplating.bind(undefined, contents))
        .then(createPopOver.bind(undefined, $elt, _sig))
        .then(function(){
          $('[data-toggle="tooltip"]').tooltip();
        });
    } else {
      contents = $('#login_template').children().clone();
      createPopOver($elt, _sig, contents);
    }
    contents.attr('id', null); // This is a clone of an element with an ID
  }

  // This event handler is triggered when the user logs in /out.
  Hull.on('model.hull.me.change', function () {
    $(_selectablesSelector, container).filter('.well').each(function () {
      showMeLuv(this);
    });
  });
});
