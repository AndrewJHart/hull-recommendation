# Going barebones with Hull.data.api

This tutorial is aimed at demonstrating that `hull.io` provides a dead-simple yet powerful [API](http://hull.io/docs/api) client.

## What will we do ?

We will build a minimalistic review tool for documentation, taking this very `README` file
as a source.
The purpose of the tool is to allow readers to indicate within a document which are the parts
they like the most.

More precisely, with hull.io's API, we will on the fly create _entities_ within our platform
(those entities being the paragraphs and headings of the document) so the readers,
once logged in with Twitter, can review these entities.

### Source code, please!

The magic is contained in the file located at `app/scripts/popover.js`, which you can see the
[complete annotated source code here](./app/docs/popover.html);

The complete source code of the project is available [here on github](http://github.com/hull/review_demo).
Please note that the project has been generated with our [grunt-init template](https://github.com/hull/grunt-init-hull),
which we encourage you to use to get started.

## I want to play with it

The demo is located on [github pages](http://hull.github.io/review_demo).

Head on to the demo page and click on any paragraph or heading, a popover will show either:

* a Login button if you're not logged in yet
* A (un)Recommend button with the associated number of recommendations for the selected entity


## Fork and Install

To install your own, you must have a [hull.io](http://hull.io) account, and have created an application.
Then copy your application's id and organization's URL (found in the admin) in the file `app/script/hull-init.js`.

Then run the following commands:

```
npm install
grunt prepare
grunt server

`grunt server` will start a server listening on port `9000` which you can use for development purpose.

## Want moar ?

Check out our other demos on [our github page](http://hull.github.io) and visit [our website](http://hull.io).

If you want to get in touch with us, feel free to email us at [contact@hull.io](mailto:contact@hull.io).

## LICENCE

MIT


