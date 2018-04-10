# yy-sortable
Vanilla drag-and-drop sortable list(s)

Features include:

* dragging and dropping between sortable and ordered lists (options.sort)
* optional removing when dragging off lists (options.alwaysInList)
* better movement algorithm (I compare the percentage of div covered to determine when to swap)
* search descendents for a className when determining where to sort or how to order (options.deepSearch)
* custom icons to show what is happening during drag
* robust event system based on eventemitter3

## Rationale
I tried many of the existing drag-and-drop libraries but could not find all the features I wanted in one neat package.

The goal of this package is to enable (fake) drag-and-drop between ordered and sortable lists. The library does not use the built-in drag and drop API but instead use mouse and touch events to simulate the drag and drop. This means if you're looking to drag and drop between your document and other apps then you should use a different library. (I based this design decision on my needs and a set of old code that did not use the drag and drop API.) 

## Super Simple Example
```js
    new Sortable(document.getElementById('sortme'))
```

## Live Example
[davidfig.github.io/sortable/](https://davidfig.github.io/sortable/)

## API Documentation
[davidfig.github.io/sortable/jsdoc/](https://davidfig.github.io/sortable/jsdoc/)

## Installation

    npm i yy-sortable

## Influences
I was greatly influenced by the design of [sortablejs](https://github.com/RubaXa/Sortable), which was *almost* perfect.

## license  
MIT License  
(c) 2018 [YOPEY YOPEY LLC](https://yopeyopey.com/) by [David Figatner](https://twitter.com/yopey_yopey/)
