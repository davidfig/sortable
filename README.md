# yy-sortable
Vanilla drag-and-drop sortable list(s)

Features include sortable and ordered lists. Dragging within a sortable list or between lists.

## Rationale


## Simple Example
```js
var PIXI = require('pixi.js');
var Viewport = require('pixi-viewport');

// create viewport
var viewport = new Viewport({
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    worldWidth: 1000,
    worldHeight: 1000
});

// add the viewport to the stage
var app = new PIXI.Application();
document.body.appendChild(app.view);
app.stage.addChild(viewport);

// activate plugins
viewport
    .drag()
    .pinch()
    .decelerate();

// add a red box
var sprite = viewport.addChild(new PIXI.Sprite(PIXI.Texture.WHITE));
sprite.tint = 0xff0000;
sprite.width = sprite.height = 100
sprite.position.set(100, 100);
```

## Live Example
[https://davidfig.github.io/pixi-viewport/](https://davidfig.github.io/pixi-viewport/)

## API Documentation
[https://davidfig.github.io/pixi-viewport/jsdoc/](https://davidfig.github.io/pixi-viewport/jsdoc/)

## Installation

    npm i pixi-viewport

## license  
MIT License  
(c) 2018 [YOPEY YOPEY LLC](https://yopeyopey.com/) by [David Figatner](https://twitter.com/yopey_yopey/)
