# Going barebones with Hull.data.api

This tutorial is aimed at demonstrating that `hull.io` provides a dead-simple yet powerful [API](http://hull.io/docs/api) client.

## What will we do ?

We will build a minimalistic review tool for documentation, taking this very `README` file as a source. The purpose of the tool is to allow
readers to indicate within a document which are the parts they like the most.

More precisely, with hull.io's API, we will on the fly register _entities_ within our platform (those entities being the paragraphs of the document)
so the readers, once logged in with Twitter, can review these entities.

### Source code, please!

The complete annotated source code is available [here on github](http://github.com/hull/review_demo).

### Demo

The demo is located on [github pages](http://hull.github.io/review_demo).

## I want to play with it

_TO BE CONTINUED..._


## Install

```
npm install
grunt prepare
grunt server
