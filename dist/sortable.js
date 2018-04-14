'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Events = require('eventemitter3');

var defaults = require('./defaults');
var utils = require('./utils');

var Sortable = function (_Events) {
    _inherits(Sortable, _Events);

    /**
     * Create sortable list
     * @param {HTMLElement} element
     * @param {object} [options]
     * @param {string} [options.name=sortable] dragging is allowed between Sortables with the same name
     * @param {string} [options.dragClass] if set then drag only items with this className under element; otherwise drag all children
     * @param {string} [options.orderClass] use this class to include elements in ordering but not dragging; otherwise all children elements are included in when sorting and ordering
     * @param {boolean} [options.deepSearch] if dragClass and deepSearch then search all descendents of element for dragClass
     * @param {boolean} [options.sort=true] allow sorting within list
     * @param {boolean} [options.drop=true] allow drop from related sortables (doesn't impact reordering this sortable's children until the children are moved to a differen sortable)
     * @param {boolean} [options.copy=false] create copy when dragging an item (this disables sort=true for this sortable)
     * @param {string} [options.orderId=data-order] for ordered lists, use this data id to figure out sort order
     * @param {boolean} [options.orderIdIsNumber=true] use parseInt on options.sortId to properly sort numbers
     * @param {string} [options.reverseOrder] reverse sort the orderId
     * @param {string} [options.offList=closest] how to handle when an element is dropped outside a sortable: closest=drop in closest sortable; cancel=return to starting sortable; delete=remove from all sortables
     * @param {number} [options.maximum] maximum number of elements allowed in a sortable list
     * @param {boolean} [options.maximumFIFO] direction of search to choose which item to remove when maximum is reached
     * @param {string} [options.cursorHover=grab -webkit-grab pointer] use this cursor list to set cursor when hovering over a sortable element
     * @param {string} [options.cursorDown=grabbing -webkit-grabbing pointer] use this cursor list to set cursor when mousedown/touchdown over a sortable element
     * @param {boolean} [options.useIcons=true] show icons when dragging
     * @param {object} [options.icons] default set of icons
     * @param {string} [options.icons.reorder]
     * @param {string} [options.icons.move]
     * @param {string} [options.icons.copy]
     * @param {string} [options.icons.delete]
     * @param {string} [options.customIcon] source of custom image when over this sortable
     * @fires pickup
     * @fires order
     * @fires add
     * @fires remove
     * @fires update
     * @fires delete
     * @fires copy
     * @fires maximum-remove
     * @fires order-pending
     * @fires add-pending
     * @fires remove-pending
     * @fires add-remove-pending
     * @fires update-pending
     * @fires delete-pending
     * @fires copy-pending
     * @fires maximum-remove-pending
     */
    function Sortable(element, options) {
        _classCallCheck(this, Sortable);

        var _this = _possibleConstructorReturn(this, (Sortable.__proto__ || Object.getPrototypeOf(Sortable)).call(this));

        _this.options = utils.options(options, defaults);
        _this.element = element;
        _this._addToGlobalTracker();
        var elements = _this._getChildren();
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = elements[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var child = _step.value;

                if (!_this.options.dragClass || utils.containsClassName(child, _this.options.dragClass)) {
                    _this.attachElement(child);
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        _this.events = {
            dragOver: function dragOver(e) {
                return _this._dragOver(e);
            },
            drop: function drop(e) {
                return _this._drop(e);
            },
            mouseOver: function mouseOver(e) {
                return _this._mouseEnter(e);
            }
        };
        element.addEventListener('dragover', _this.events.dragOver);
        element.addEventListener('drop', _this.events.drop);
        if (_this.options.cursorHover) {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = _this._getChildren()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var _child = _step2.value;

                    utils.style(_child, 'cursor', _this.options.cursorHover);
                    if (_this.options.cursorDown) {
                        _child.addEventListener('mousedown', function (e) {
                            return _this._mouseDown(e);
                        });
                    }
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }
        return _this;
    }

    _createClass(Sortable, [{
        key: '_mouseDown',
        value: function _mouseDown(e) {
            if (this.options.cursorHover) {
                utils.style(e.currentTarget, 'cursor', this.options.cursorDown);
            }
        }

        /**
         * removes all event handlers from this.element and children
         */

    }, {
        key: 'destroy',
        value: function destroy() {
            this.element.removeEventListener('dragover', this.events.dragOver);
            this.element.removeEventListener('drop', this.events.drop);
            var elements = this._getChildren();
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = elements[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var child = _step3.value;

                    this.removeElement(child);
                }
                // todo: remove Sortable.tracker and related event handlers if no more sortables
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }
        }

        /**
         * the global defaults for new Sortable objects
         * @type {DefaultOptions}
         */

    }, {
        key: 'add',


        /**
         * add an element as a child of the sortable element; can also be used to swap between sortables
         * NOTE: this will not work with deep-type elements; use attachElement instead
         * @param {HTMLElement} element
         * @param {number} index
         */
        value: function add(element, index) {
            this.attachElement(element);
            if (this.options.sort) {
                if (typeof index === 'undefined' || index >= this.element.children.length) {
                    this.element.appendChild(element);
                } else {
                    this.element.insertBefore(element, this.element.children[index + 1]);
                }
            } else {
                var id = this.options.orderId;
                var dragOrder = element.getAttribute(id);
                dragOrder = this.options.orderIdIsNumber ? parseFloat(dragOrder) : dragOrder;
                var found = void 0;
                var children = this._getChildren(true);
                if (this.options.reverseOrder) {
                    for (var i = children.length - 1; i >= 0; i--) {
                        var child = children[i];
                        var childDragOrder = child.getAttribute(id);
                        childDragOrder = this.options.orderIsNumber ? parseFloat(childDragOrder) : childDragOrder;
                        if (dragOrder > childDragOrder) {
                            child.parentNode.insertBefore(element, child);
                            found = true;
                            break;
                        }
                    }
                } else {
                    var _iteratorNormalCompletion4 = true;
                    var _didIteratorError4 = false;
                    var _iteratorError4 = undefined;

                    try {
                        for (var _iterator4 = children[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                            var _child2 = _step4.value;

                            var _childDragOrder = _child2.getAttribute(id);
                            _childDragOrder = this.options.orderIsNumber ? parseFloat(_childDragOrder) : _childDragOrder;
                            if (dragOrder < _childDragOrder) {
                                _child2.parentNode.insertBefore(element, _child2);
                                found = true;
                                break;
                            }
                        }
                    } catch (err) {
                        _didIteratorError4 = true;
                        _iteratorError4 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                _iterator4.return();
                            }
                        } finally {
                            if (_didIteratorError4) {
                                throw _iteratorError4;
                            }
                        }
                    }
                }
                if (!found) {
                    this.element.appendChild(element);
                }
            }
        }

        /**
         * attaches an HTML element to the sortable; can also be used to swap between sortables
         * NOTE: you need to manually insert the element into this.element (this is useful when you have a deep structure)
         * @param {HTMLElement} element
         */

    }, {
        key: 'attachElement',
        value: function attachElement(element) {
            var _this2 = this;

            if (element.__sortable) {
                element.__sortable.original = this;
            } else {
                element.__sortable = {
                    sortable: this,
                    original: this,
                    dragStart: function dragStart(e) {
                        return _this2._dragStart(e);
                    }

                    // add a counter for maximum
                };this._maximumCounter(element, this);

                // ensure every element has an id
                if (!element.id) {
                    element.id = '__sortable-' + this.options.name + '-' + Sortable.tracker[this.options.name].counter;
                    Sortable.tracker[this.options.name].counter++;
                }
                if (this.options.copy) {
                    element.__sortable.copy = 0;
                }
                element.addEventListener('dragstart', element.__sortable.dragStart);
                element.setAttribute('draggable', true);
            }
        }

        /**
         * removes all events from an HTML element
         * NOTE: does not remove the element from its parent
         * @param {HTMLElement} element
         */

    }, {
        key: 'removeElement',
        value: function removeElement(element) {
            element.removeEventListener('mousedown', element.dragMove);
            element.removeEventListener('touchstart', element.dragMove);
        }

        /**
         * add sortable to global list that tracks all sortables
         * @private
         */

    }, {
        key: '_addToGlobalTracker',
        value: function _addToGlobalTracker() {
            var _this3 = this;

            if (!Sortable.tracker) {
                Sortable.dragImage = document.createElement('div');
                Sortable.dragImage.id = 'sortable-dragImage';
                document.body.appendChild(Sortable.dragImage);
                Sortable.tracker = {};
                document.body.addEventListener('dragover', function (e) {
                    return _this3._bodyDragOver(e);
                });
                document.body.addEventListener('drop', function (e) {
                    return _this3._bodyDrop(e);
                });
            }
            if (Sortable.tracker[this.options.name]) {
                Sortable.tracker[this.options.name].list.push(this);
            } else {
                Sortable.tracker[this.options.name] = { list: [this], counter: 0 };
            }
        }

        /**
         * default drag over for the body
         * @param {DragEvent} e
         * @private
         */

    }, {
        key: '_bodyDragOver',
        value: function _bodyDragOver(e) {
            var name = e.dataTransfer.types[0];
            if (name) {
                var id = e.dataTransfer.types[1];
                var element = document.getElementById(id);
                var sortable = this._findClosest(e, Sortable.tracker[name].list, element);
                if (sortable) {
                    if (sortable.last && Math.abs(sortable.last.x - e.pageX) < sortable.options.threshold && Math.abs(sortable.last.y - e.pageY) < sortable.options.threshold) {
                        sortable._updateDragging(e, element);
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }
                    sortable.last = { x: e.pageX, y: e.pageY };
                    this._placeInList(sortable, e.pageX, e.pageY, element);
                    e.dataTransfer.dropEffect = 'move';
                    this._updateDragging(e, element);
                } else {
                    this._noDrop(e);
                }
                e.preventDefault();
            }
        }

        /**
         * handle no drop
         * @param {UIEvent} e
         * @param {boolean} [cancel] force cancel (for options.copy)
         * @private
         */

    }, {
        key: '_noDrop',
        value: function _noDrop(e, cancel) {
            e.dataTransfer.dropEffect = 'move';
            var id = e.dataTransfer.types[1];
            var element = document.getElementById(id);
            if (element) {
                this._updateDragging(e, element);
                this._setIcon(element, null, cancel);
                if (!cancel) {
                    if (element.__sortable.original.options.offList === 'delete') {
                        if (!element.__sortable.display) {
                            element.__sortable.display = element.style.display || 'unset';
                            element.style.display = 'none';
                            element.__sortable.original.emit('delete-pending', element, element.__sortable.original);
                        }
                    } else if (!element.__sortable.original.options.copy) {
                        this._replaceInList(element.__sortable.original, element);
                    }
                }
                if (element.__sortable.current) {
                    element.__sortable.current.emit('add-remove-pending', element, element.__sortable.current);
                    element.__sortable.current.emit('update-pending', element, element.__sortable.current);
                    element.__sortable.current = null;
                }
            }
        }

        /**
         * default drop for the body
         * @param {DragEvent} e
         * @private
         */

    }, {
        key: '_bodyDrop',
        value: function _bodyDrop(e) {
            var name = e.dataTransfer.types[0];
            if (name) {
                var id = e.dataTransfer.types[1];
                var element = document.getElementById(id);
                var sortable = this._findClosest(e, Sortable.tracker[name].list, element);
                if (element) {
                    if (sortable) {
                        e.preventDefault();
                    }
                    this._removeDragging(element);
                    if (element.__sortable.display) {
                        element.remove();
                        element.style.display = element.__sortable.display;
                        element.__sortable.display = null;
                        element.__sortable.original.emit('delete', element, element.__sortable.original);
                        element.__sortable.original = null;
                    }
                }
            }
        }

        /**
         * start drag
         * @param {UIEvent} e
         * @private
         */

    }, {
        key: '_dragStart',
        value: function _dragStart(e) {
            var sortable = e.currentTarget.__sortable.original;
            var dragging = e.currentTarget.cloneNode(true);
            for (var style in sortable.options.dragStyle) {
                dragging.style[style] = sortable.options.dragStyle[style];
            }
            var pos = utils.toGlobal(e.currentTarget);
            dragging.style.left = pos.x + 'px';
            dragging.style.top = pos.y + 'px';
            var offset = { x: pos.x - e.pageX, y: pos.y - e.pageY };
            document.body.appendChild(dragging);
            if (sortable.options.useIcons) {
                var image = new Image();
                image.src = sortable.options.icons.reorder;
                image.style.position = 'absolute';
                image.style.transform = 'translate(-50%, -50%)';
                image.style.left = dragging.offsetLeft + dragging.offsetWidth + 'px';
                image.style.top = dragging.offsetTop + dragging.offsetHeight + 'px';
                document.body.appendChild(image);
                dragging.icon = image;
            }
            if (sortable.options.cursorHover) {
                utils.style(e.currentTarget, 'cursor', sortable.options.cursorHover);
            }
            var target = e.currentTarget;
            if (sortable.options.copy) {
                target = e.currentTarget.cloneNode(true);
                target.id = e.currentTarget.id + '-copy-' + e.currentTarget.__sortable.copy;
                e.currentTarget.__sortable.copy++;
                sortable.attachElement(target);
                target.__sortable.isCopy = true;
                target.__sortable.original = this;
                target.__sortable.display = target.style.display || 'unset';
                target.style.display = 'none';
                document.body.appendChild(target);
            }
            e.dataTransfer.clearData();
            e.dataTransfer.setData(sortable.options.name, sortable.options.name);
            e.dataTransfer.setData(target.id, target.id);
            e.dataTransfer.setDragImage(Sortable.dragImage, 0, 0);
            target.__sortable.current = this;
            target.__sortable.index = sortable.options.copy ? -1 : sortable._getIndex(target);
            target.__sortable.dragging = dragging;
            target.__sortable.offset = offset;
        }
    }, {
        key: '_dragOver',
        value: function _dragOver(e) {
            var sortable = e.dataTransfer.types[0];
            if (sortable && sortable === this.options.name) {
                var id = e.dataTransfer.types[1];
                var element = document.getElementById(id);
                if (this.last && Math.abs(this.last.x - e.pageX) < this.options.threshold && Math.abs(this.last.y - e.pageY) < this.options.threshold) {
                    this._updateDragging(e, element);
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                this.last = { x: e.pageX, y: e.pageY };
                if (element.__sortable.isCopy && element.__sortable.original === this) {
                    this._noDrop(e, true);
                } else if (this.options.drop || element.__sortable.original === this) {
                    this._placeInList(this, e.pageX, e.pageY, element);
                    e.dataTransfer.dropEffect = element.__sortable.isCopy ? 'copy' : 'move';
                    this._updateDragging(e, element);
                } else {
                    this._noDrop(e);
                }
                e.preventDefault();
                e.stopPropagation();
            }
        }
    }, {
        key: '_updateDragging',
        value: function _updateDragging(e, element) {
            var dragging = element.__sortable.dragging;
            var offset = element.__sortable.offset;
            if (dragging) {
                dragging.style.left = e.pageX + offset.x + 'px';
                dragging.style.top = e.pageY + offset.y + 'px';
                if (dragging.icon) {
                    dragging.icon.style.left = dragging.offsetLeft + dragging.offsetWidth + 'px';
                    dragging.icon.style.top = dragging.offsetTop + dragging.offsetHeight + 'px';
                }
            }
        }
    }, {
        key: '_removeDragging',
        value: function _removeDragging(element) {
            var dragging = element.__sortable.dragging;
            dragging.remove();
            if (dragging.icon) {
                dragging.icon.remove();
            }
            element.__sortable.dragging = null;
            element.__sortable.isCopy = false;
        }
    }, {
        key: '_drop',
        value: function _drop(e) {
            var name = e.dataTransfer.types[0];
            if (name && name === this.options.name) {
                var id = e.dataTransfer.types[1];
                var element = document.getElementById(id);
                if (element.__sortable.original !== this) {
                    element.__sortable.original.emit('remove', element, element.__sortable.original);
                    this.emit('add', element, this);
                    element.__sortable.original = this;
                    if (this.options.sort) {
                        this.emit('order', element, this);
                    }
                    if (element.__sortable.isCopy) {
                        this.emit('copy', element, this);
                    }
                    this._maximum(element, this);
                    this.emit('update', element, this);
                } else {
                    if (element.__sortable.index !== this._getIndex(e.currentTarget)) {
                        this.emit('order', element, this);
                        this.emit('update', element, this);
                    }
                }
                this._removeDragging(element);
                e.preventDefault();
                e.stopPropagation();
            }
        }

        /**
         * find closest Sortable to screen location
         * @param {UIEvent} e
         * @param {Sortable[]} list of related Sortables
         * @param {HTMLElement} element
         * @private
         */

    }, {
        key: '_findClosest',
        value: function _findClosest(e, list, element) {
            var min = Infinity,
                found = void 0;
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = list[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var related = _step5.value;

                    if (!related.options.drop && element.__sortable.original !== related || element.__sortable.isCopy && element.__sortable.original === related) {
                        continue;
                    }
                    if (utils.inside(e.pageX, e.pageY, related.element)) {
                        return related;
                    } else if (related.options.offList === 'closest') {
                        var calculate = utils.distanceToClosestCorner(e.pageX, e.pageY, related.element);
                        if (calculate < min) {
                            min = calculate;
                            found = related;
                        }
                    }
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            return found;
        }

        /**
         * place indicator in the sortable list according to options.sort
         * @param {number} x
         * @param {number} y
         * @param {Sortable} sortable
         * @param {HTMLElement} element
         * @private
         */

    }, {
        key: '_placeInList',
        value: function _placeInList(sortable, x, y, element) {
            if (element.__sortable.display) {
                element.style.display = element.__sortable.display === 'unset' ? '' : element.__sortable.display;
                element.__sortable.display = null;
            }
            if (this.options.sort) {
                this._placeInSortableList(sortable, x, y, element);
            } else {
                this._placeInOrderedList(sortable, element);
            }
            this._setIcon(element, sortable);
        }

        /**
         * replace item in list at original index position
         * @private
         */

    }, {
        key: '_replaceInList',
        value: function _replaceInList(sortable, element) {
            var children = sortable._getChildren();
            if (children.length) {
                var index = element.__sortable.index;
                if (index < children.length) {
                    children[index].parentNode.insertBefore(element, children[index]);
                } else {
                    children[0].appendChild(element);
                }
            } else {
                sortable.element.appendChild(element);
            }
        }
    }, {
        key: '_getIndex',
        value: function _getIndex(child) {
            var children = this._getChildren();
            for (var i = 0; i < children.length; i++) {
                if (children[i] === child) {
                    return i;
                }
            }
        }
    }, {
        key: '_traverseChildren',
        value: function _traverseChildren(base, search, results) {
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = base.children[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var child = _step6.value;

                    if (search.length) {
                        if (search.indexOf(child.className) !== -1) {
                            results.push(child);
                        }
                    } else {
                        results.push(child);
                    }
                    this._traverseChildren(child, search, results);
                }
            } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion6 && _iterator6.return) {
                        _iterator6.return();
                    }
                } finally {
                    if (_didIteratorError6) {
                        throw _iteratorError6;
                    }
                }
            }
        }

        /**
         * find children in div
         * @param {Sortable} sortable
         * @param {boolean} [order] search for dragOrder as well
         * @private
         */

    }, {
        key: '_getChildren',
        value: function _getChildren(order) {
            if (this.options.deepSearch) {
                var search = [];
                if (order && this.options.orderClass) {
                    if (this.options.dragClass) {
                        search.push(this.options.dragClass);
                    }
                    if (order && this.options.orderClass) {
                        search.push(this.options.orderClass);
                    }
                } else if (!order && this.options.dragClass) {
                    search.push(this.options.dragClass);
                }
                var results = [];
                this._traverseChildren(this.element, search, results);
                return results;
            } else {
                if (this.options.dragClass) {
                    var list = [];
                    var _iteratorNormalCompletion7 = true;
                    var _didIteratorError7 = false;
                    var _iteratorError7 = undefined;

                    try {
                        for (var _iterator7 = this.element.children[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                            var child = _step7.value;

                            if (utils.containsClassName(child, this.options.dragClass) || order && !this.options.orderClass || order && this.options.orderClass && utils.containsClassName(child, this.options.orderClass)) {
                                list.push(child);
                            }
                        }
                    } catch (err) {
                        _didIteratorError7 = true;
                        _iteratorError7 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion7 && _iterator7.return) {
                                _iterator7.return();
                            }
                        } finally {
                            if (_didIteratorError7) {
                                throw _iteratorError7;
                            }
                        }
                    }

                    return list;
                } else {
                    var _list = [];
                    var _iteratorNormalCompletion8 = true;
                    var _didIteratorError8 = false;
                    var _iteratorError8 = undefined;

                    try {
                        for (var _iterator8 = this.element.children[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                            var _child3 = _step8.value;

                            _list.push(_child3);
                        }
                    } catch (err) {
                        _didIteratorError8 = true;
                        _iteratorError8 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion8 && _iterator8.return) {
                                _iterator8.return();
                            }
                        } finally {
                            if (_didIteratorError8) {
                                throw _iteratorError8;
                            }
                        }
                    }

                    return _list;
                }
            }
        }

        /**
         * place indicator in an ordered list
         * @param {Sortable} sortable
         * @param {HTMLElement} dragging
         * @private
         */

    }, {
        key: '_placeInOrderedList',
        value: function _placeInOrderedList(sortable, dragging) {
            if (dragging.__sortable.current !== sortable) {
                var id = sortable.options.orderId;
                var dragOrder = dragging.getAttribute(id);
                dragOrder = sortable.options.orderIdIsNumber ? parseFloat(dragOrder) : dragOrder;
                var found = void 0;
                var children = sortable._getChildren(true);
                if (sortable.options.reverseOrder) {
                    for (var i = children.length - 1; i >= 0; i--) {
                        var child = children[i];
                        var childDragOrder = child.getAttribute(id);
                        childDragOrder = sortable.options.orderIsNumber ? parseFloat(childDragOrder) : childDragOrder;
                        if (dragOrder > childDragOrder) {
                            child.parentNode.insertBefore(dragging, child);
                            found = true;
                            break;
                        }
                    }
                } else {
                    var _iteratorNormalCompletion9 = true;
                    var _didIteratorError9 = false;
                    var _iteratorError9 = undefined;

                    try {
                        for (var _iterator9 = children[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                            var _child4 = _step9.value;

                            var _childDragOrder2 = _child4.getAttribute(id);
                            _childDragOrder2 = sortable.options.orderIsNumber ? parseFloat(_childDragOrder2) : _childDragOrder2;
                            if (dragOrder < _childDragOrder2) {
                                _child4.parentNode.insertBefore(dragging, _child4);
                                found = true;
                                break;
                            }
                        }
                    } catch (err) {
                        _didIteratorError9 = true;
                        _iteratorError9 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion9 && _iterator9.return) {
                                _iterator9.return();
                            }
                        } finally {
                            if (_didIteratorError9) {
                                throw _iteratorError9;
                            }
                        }
                    }
                }
                if (!found) {
                    sortable.element.appendChild(dragging);
                }
                if (dragging.__sortable.current) {
                    if (dragging.__sortable.current !== dragging.__sortable.original) {
                        dragging.__sortable.current.emit('add-remove-pending', dragging, dragging.__sortable.current);
                    } else {
                        dragging.__sortable.current.emit('remove-pending', dragging, dragging.__sortable.current);
                    }
                }
                sortable.emit('add-pending', dragging, sortable);
                if (dragging.__sortable.isCopy) {
                    sortable.emit('copy-pending', dragging, sortable);
                }
                this._clearMaximumPending(dragging.__sortable.current);
                dragging.__sortable.current = sortable;
                this._maximumPending(dragging, sortable);
                sortable.emit('update-pending', dragging, sortable);
            }
        }

        /**
         * search for where to place using percentage
         * @param {Sortable} sortable
         * @param {HTMLElement} dragging
         * @returns {number} 0 = not found; 1 = nothing to do; 2 = moved
         */

    }, {
        key: '_placeByPercentage',
        value: function _placeByPercentage(sortable, dragging) {
            var cursor = dragging.__sortable.dragging;
            var xa1 = cursor.offsetLeft;
            var ya1 = cursor.offsetTop;
            var xa2 = cursor.offsetLeft + cursor.offsetWidth;
            var ya2 = cursor.offsetTop + cursor.offsetHeight;
            var largest = 0,
                closest = void 0,
                isBefore = void 0,
                indicator = void 0;
            var element = sortable.element;
            var elements = sortable._getChildren(true);
            var _iteratorNormalCompletion10 = true;
            var _didIteratorError10 = false;
            var _iteratorError10 = undefined;

            try {
                for (var _iterator10 = elements[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                    var child = _step10.value;

                    if (child === dragging) {
                        indicator = true;
                    }
                    var pos = utils.toGlobal(child);
                    var xb1 = pos.x;
                    var yb1 = pos.y;
                    var xb2 = pos.x + child.offsetWidth;
                    var yb2 = pos.y + child.offsetHeight;
                    var percentage = utils.percentage(xa1, ya1, xa2, ya2, xb1, yb1, xb2, yb2);
                    if (percentage > largest) {
                        largest = percentage;
                        closest = child;
                        isBefore = indicator;
                    }
                }
            } catch (err) {
                _didIteratorError10 = true;
                _iteratorError10 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion10 && _iterator10.return) {
                        _iterator10.return();
                    }
                } finally {
                    if (_didIteratorError10) {
                        throw _iteratorError10;
                    }
                }
            }

            if (closest) {
                if (closest === dragging) {
                    return 1;
                }
                if (isBefore && closest.nextSibling) {
                    element.insertBefore(dragging, closest.nextSibling);
                    sortable.emit('order-pending', sortable);
                } else {
                    element.insertBefore(dragging, closest);
                    sortable.emit('order-pending', sortable);
                }
                return 2;
            } else {
                return 0;
            }
        }

        /**
         * search for where to place using distance
         * @param {Sortable} sortable
         * @param {HTMLElement} dragging
         * @param {number} x
         * @param {number} y
         * @return {boolean} false=nothing to do
         */

    }, {
        key: '_placeByDistance',
        value: function _placeByDistance(sortable, dragging, x, y) {
            if (utils.inside(x, y, dragging)) {
                return true;
            }
            var index = -1;
            if (dragging.__sortable.current === sortable) {
                index = sortable._getIndex(dragging);
                sortable.element.appendChild(dragging);
            }
            var distance = Infinity,
                closest = void 0;
            var element = sortable.element;
            var elements = sortable._getChildren(true);
            var _iteratorNormalCompletion11 = true;
            var _didIteratorError11 = false;
            var _iteratorError11 = undefined;

            try {
                for (var _iterator11 = elements[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                    var child = _step11.value;

                    if (utils.inside(x, y, child)) {
                        closest = child;
                        break;
                    } else {
                        var measure = utils.distanceToClosestCorner(x, y, child);
                        if (measure < distance) {
                            closest = child;
                            distance = measure;
                        }
                    }
                }
            } catch (err) {
                _didIteratorError11 = true;
                _iteratorError11 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion11 && _iterator11.return) {
                        _iterator11.return();
                    }
                } finally {
                    if (_didIteratorError11) {
                        throw _iteratorError11;
                    }
                }
            }

            element.insertBefore(dragging, closest);
            if (index === sortable._getIndex(dragging)) {
                return true;
            }
            this._maximumPending(dragging, sortable);
            sortable.emit('order-pending', dragging, sortable);
        }

        /**
         * place indicator in an sortable list
         * @param {number} x
         * @param {number} y
         * @param {HTMLElement} dragging
         * @private
         */

    }, {
        key: '_placeInSortableList',
        value: function _placeInSortableList(sortable, x, y, dragging) {
            var element = sortable.element;
            var children = sortable._getChildren();
            if (!children.length) {
                if (dragging.__sortable.current !== sortable) {
                    if (dragging.__sortable.current) {
                        dragging.__sortable.current.emit('remove-pending', dragging, dragging.__sortable.current);
                    }
                    dragging.__sortable.current = sortable;
                    sortable.emit('add-pending', dragging, sortable);
                    if (dragging.__sortable.isCopy) {
                        sortable.emit('copy-pending', dragging, sortable);
                    }
                }
                element.appendChild(dragging);
            } else {
                // const percentage = this._placeByPercentage(sortable, dragging)
                if (this._placeByDistance(sortable, dragging, x, y)) {
                    return;
                }
            }
            if (dragging.__sortable.current !== sortable) {
                sortable.emit('add-pending', dragging, sortable);
                if (dragging.__sortable.isCopy) {
                    sortable.emit('copy-pending', dragging, sortable);
                }
                if (dragging.__sortable.current) {
                    this._clearMaximumPending(dragging.__sortable.current);
                    if (dragging.__sortable.current !== dragging.__sortable.original) {
                        dragging.__sortable.current.emit('add-remove-pending', dragging, dragging.__sortable.current);
                    } else {
                        dragging.__sortable.current.emit('remove-pending', dragging, dragging.__sortable.current);
                    }
                }
                dragging.__sortable.current = sortable;
            }
            this._maximumPending(dragging, sortable);
            sortable.emit('update-pending', dragging, sortable);
        }

        /**
         * set icon if available
         * @param {HTMLElement} dragging
         * @param {Sortable} sortable
         * @param {boolean} [cancel] force cancel (for options.copy)
         * @private
         */

    }, {
        key: '_setIcon',
        value: function _setIcon(element, sortable, cancel) {
            var dragging = element.__sortable.dragging;
            if (dragging && dragging.icon) {
                if (!sortable) {
                    sortable = element.__sortable.original;
                    if (cancel) {
                        dragging.icon.src = sortable.options.icons.cancel;
                    } else {
                        dragging.icon.src = sortable.options.offList === 'delete' ? sortable.options.icons.delete : sortable.options.icons.cancel;
                    }
                } else {
                    if (element.__sortable.isCopy) {
                        dragging.icon.src = sortable.options.icons.copy;
                    } else {
                        dragging.icon.src = element.__sortable.original === sortable ? sortable.options.icons.reorder : sortable.options.icons.move;
                    }
                }
            }
        }

        /**
         * add a maximum counter to the element
         * @param {HTMLElement} element
         * @param {Sortable} sortable
         */

    }, {
        key: '_maximumCounter',
        value: function _maximumCounter(element, sortable) {
            var count = -1;
            if (sortable.options.maximum) {
                var children = sortable._getChildren();
                var _iteratorNormalCompletion12 = true;
                var _didIteratorError12 = false;
                var _iteratorError12 = undefined;

                try {
                    for (var _iterator12 = children[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                        var child = _step12.value;

                        if (child !== element && child.__sortable) {
                            count = child.__sortable.maximum > count ? child.__sortable.maximum : count;
                        }
                    }
                } catch (err) {
                    _didIteratorError12 = true;
                    _iteratorError12 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion12 && _iterator12.return) {
                            _iterator12.return();
                        }
                    } finally {
                        if (_didIteratorError12) {
                            throw _iteratorError12;
                        }
                    }
                }
            }
            element.__sortable.maximum = count + 1;
        }

        /**
         * handle maximum
         */

    }, {
        key: '_maximum',
        value: function _maximum(element, sortable) {
            if (sortable.options.maximum) {
                var children = sortable._getChildren();
                if (children.length > sortable.options.maximum) {
                    while (sortable.removePending.length) {
                        var child = sortable.removePending.pop();
                        child.style.display = child.__sortable.display === 'unset' ? '' : child.__sortable.display;
                        child.__sortable.display = null;
                        child.remove();
                        sortable.emit('maximum-remove', child, sortable);
                    }
                }
                this._maximumCounter(element, sortable);
            }
        }

        /**
         * clear pending list
         * @param {Sortable} sortable
         */

    }, {
        key: '_clearMaximumPending',
        value: function _clearMaximumPending(sortable) {
            if (sortable.removePending) {
                while (sortable.removePending.length) {
                    var child = sortable.removePending.pop();
                    child.style.display = child.__sortable.display === 'unset' ? '' : child.__sortable.display;
                    child.__sortable.display = null;
                }
            }
        }

        /**
         * handle pending maximum
         * @param {HTMLElement} element
         * @param {Sortable} sortable
         * @private
         */

    }, {
        key: '_maximumPending',
        value: function _maximumPending(element, sortable) {
            if (sortable.options.maximum) {
                var children = sortable._getChildren();
                var savePending = sortable.removePending ? sortable.removePending.slice(0) : [];
                this._clearMaximumPending(sortable);
                if (children.length > sortable.options.maximum) {
                    sortable.removePending = [];
                    var sort = void 0;
                    if (sortable.options.maximumFIFO) {
                        sort = children.sort(function (a, b) {
                            return a === element ? 1 : a.__sortable.maximum - b.__sortable.maximum;
                        });
                    } else {
                        sort = children.sort(function (a, b) {
                            return a === element ? 1 : b.__sortable.maximum - a.__sortable.maximum;
                        });
                    }
                    for (var i = 0; i < children.length - sortable.options.maximum; i++) {
                        var hide = sort[i];
                        if (hide !== element) {
                            hide.__sortable.display = hide.style.display || 'unset';
                            hide.style.display = 'none';
                            sortable.removePending.push(hide);
                            if (savePending.indexOf(hide) === -1) {
                                sortable.emit('maximum-remove-pending', hide, sortable);
                            }
                        }
                    }
                }
            }
        }
    }], [{
        key: 'create',


        /**
         * create multiple sortable elements
         * @param {HTMLElements[]} elements
         * @param {object} options - see constructor for options
         */
        value: function create(elements, options) {
            var results = [];
            var _iteratorNormalCompletion13 = true;
            var _didIteratorError13 = false;
            var _iteratorError13 = undefined;

            try {
                for (var _iterator13 = elements[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                    var element = _step13.value;

                    results.push(new Sortable(element, options));
                }
            } catch (err) {
                _didIteratorError13 = true;
                _iteratorError13 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion13 && _iterator13.return) {
                        _iterator13.return();
                    }
                } finally {
                    if (_didIteratorError13) {
                        throw _iteratorError13;
                    }
                }
            }

            return results;
        }
    }, {
        key: 'defaults',
        get: function get() {
            return defaults;
        }
    }]);

    return Sortable;
}(Events);

/**
 * fires when an element is picked up because it was moved beyond the options.threshold
 * @event Sortable#pickup
 * @property {HTMLElement} element being dragged
 * @property {Sortable} current sortable with element placeholder
 */

/**
 * fires when a sortable is reordered
 * @event Sortable#order
 * @property {HTMLElement} element that was reordered
 * @property {Sortable} sortable where element was placed
 */

/**
 * fires when an element is added to this sortable
 * @event Sortable#add
 * @property {HTMLElement} element added
 * @property {Sortable} sortable where element was added
 */

/**
 * fires when an element is removed from this sortable
 * @event Sortable#remove
 * @property {HTMLElement} element removed
 * @property {Sortable} sortable where element was removed
 */

/**
 * fires when an element is removed from all sortables
 * @event Sortable#delete
 * @property {HTMLElement} element removed
 * @property {Sortable} sortable where element was dragged from
 */

/**
 * fires when a copy of an element is dropped
 * @event Sortable#copy
 * @property {HTMLElement} element removed
 * @property {Sortable} sortable where element was dragged from
 */

/**
 * fires when the sortable is updated with an add, remove, or order change
 * @event Sortable#update
 * @property {HTMLElement} element changed
 * @property {Sortable} sortable with element
 */

/**
 * fires when an element is removed because maximum was reached for the sortable
 * @event Sortable#maximum-remove
 * @property {HTMLElement} element removed
 * @property {Sortable} sortable where element was dragged from
 */

/**
 * fires when order was changed but element was not dropped yet
 * @event Sortable#order-pending
 * @property {HTMLElement} element being dragged
 * @property {Sortable} current sortable with element placeholder
 */

/**
 * fires when element is added but not dropped yet
 * @event Sortable#add-pending
 * @property {HTMLElement} element being dragged
 * @property {Sortable} current sortable with element placeholder
 */

/**
 * fires when element is removed but not dropped yet
 * @event Sortable#remove-pending
 * @property {HTMLElement} element being dragged
 * @property {Sortable} current sortable with element placeholder
 */

/**
 * fires when element is removed after being temporarily added
 * @event Sortable#add-remove-pending
 * @property {HTMLElement} element being dragged
 * @property {Sortable} current sortable with element placeholder
 */

/**
 * fires when an element is about to be removed from all sortables
 * @event Sortable#delete-pending
 * @property {HTMLElement} element removed
 * @property {Sortable} sortable where element was dragged from
 */

/**
 * fires when an element is added, removed, or reorder but element has not dropped yet
 * @event Sortable#update-pending
 * @property {HTMLElement} element being dragged
 * @property {Sortable} current sortable with element placeholder
 */

/**
 * fires when a copy of an element is about to drop
 * @event Sortable#copy-pending
 * @property {HTMLElement} element removed
 * @property {Sortable} sortable where element was dragged from
 */

/**
 * fires when an element is about to be removed because maximum was reached for the sortable
 * @event Sortable#maximum-remove-pending
 * @property {HTMLElement} element removed
 * @property {Sortable} sortable where element was dragged from
 */

module.exports = Sortable;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3J0YWJsZS5qcyJdLCJuYW1lcyI6WyJFdmVudHMiLCJyZXF1aXJlIiwiZGVmYXVsdHMiLCJ1dGlscyIsIlNvcnRhYmxlIiwiZWxlbWVudCIsIm9wdGlvbnMiLCJfYWRkVG9HbG9iYWxUcmFja2VyIiwiZWxlbWVudHMiLCJfZ2V0Q2hpbGRyZW4iLCJjaGlsZCIsImRyYWdDbGFzcyIsImNvbnRhaW5zQ2xhc3NOYW1lIiwiYXR0YWNoRWxlbWVudCIsImV2ZW50cyIsImRyYWdPdmVyIiwiZSIsIl9kcmFnT3ZlciIsImRyb3AiLCJfZHJvcCIsIm1vdXNlT3ZlciIsIl9tb3VzZUVudGVyIiwiYWRkRXZlbnRMaXN0ZW5lciIsImN1cnNvckhvdmVyIiwic3R5bGUiLCJjdXJzb3JEb3duIiwiX21vdXNlRG93biIsImN1cnJlbnRUYXJnZXQiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwicmVtb3ZlRWxlbWVudCIsImluZGV4Iiwic29ydCIsImNoaWxkcmVuIiwibGVuZ3RoIiwiYXBwZW5kQ2hpbGQiLCJpbnNlcnRCZWZvcmUiLCJpZCIsIm9yZGVySWQiLCJkcmFnT3JkZXIiLCJnZXRBdHRyaWJ1dGUiLCJvcmRlcklkSXNOdW1iZXIiLCJwYXJzZUZsb2F0IiwiZm91bmQiLCJyZXZlcnNlT3JkZXIiLCJpIiwiY2hpbGREcmFnT3JkZXIiLCJvcmRlcklzTnVtYmVyIiwicGFyZW50Tm9kZSIsIl9fc29ydGFibGUiLCJvcmlnaW5hbCIsInNvcnRhYmxlIiwiZHJhZ1N0YXJ0IiwiX2RyYWdTdGFydCIsIl9tYXhpbXVtQ291bnRlciIsIm5hbWUiLCJ0cmFja2VyIiwiY291bnRlciIsImNvcHkiLCJzZXRBdHRyaWJ1dGUiLCJkcmFnTW92ZSIsImRyYWdJbWFnZSIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImJvZHkiLCJfYm9keURyYWdPdmVyIiwiX2JvZHlEcm9wIiwibGlzdCIsInB1c2giLCJkYXRhVHJhbnNmZXIiLCJ0eXBlcyIsImdldEVsZW1lbnRCeUlkIiwiX2ZpbmRDbG9zZXN0IiwibGFzdCIsIk1hdGgiLCJhYnMiLCJ4IiwicGFnZVgiLCJ0aHJlc2hvbGQiLCJ5IiwicGFnZVkiLCJfdXBkYXRlRHJhZ2dpbmciLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsIl9wbGFjZUluTGlzdCIsImRyb3BFZmZlY3QiLCJfbm9Ecm9wIiwiY2FuY2VsIiwiX3NldEljb24iLCJvZmZMaXN0IiwiZGlzcGxheSIsImVtaXQiLCJfcmVwbGFjZUluTGlzdCIsImN1cnJlbnQiLCJfcmVtb3ZlRHJhZ2dpbmciLCJyZW1vdmUiLCJkcmFnZ2luZyIsImNsb25lTm9kZSIsImRyYWdTdHlsZSIsInBvcyIsInRvR2xvYmFsIiwibGVmdCIsInRvcCIsIm9mZnNldCIsInVzZUljb25zIiwiaW1hZ2UiLCJJbWFnZSIsInNyYyIsImljb25zIiwicmVvcmRlciIsInBvc2l0aW9uIiwidHJhbnNmb3JtIiwib2Zmc2V0TGVmdCIsIm9mZnNldFdpZHRoIiwib2Zmc2V0VG9wIiwib2Zmc2V0SGVpZ2h0IiwiaWNvbiIsInRhcmdldCIsImlzQ29weSIsImNsZWFyRGF0YSIsInNldERhdGEiLCJzZXREcmFnSW1hZ2UiLCJfZ2V0SW5kZXgiLCJfbWF4aW11bSIsIm1pbiIsIkluZmluaXR5IiwicmVsYXRlZCIsImluc2lkZSIsImNhbGN1bGF0ZSIsImRpc3RhbmNlVG9DbG9zZXN0Q29ybmVyIiwiX3BsYWNlSW5Tb3J0YWJsZUxpc3QiLCJfcGxhY2VJbk9yZGVyZWRMaXN0IiwiYmFzZSIsInNlYXJjaCIsInJlc3VsdHMiLCJpbmRleE9mIiwiY2xhc3NOYW1lIiwiX3RyYXZlcnNlQ2hpbGRyZW4iLCJvcmRlciIsImRlZXBTZWFyY2giLCJvcmRlckNsYXNzIiwiX2NsZWFyTWF4aW11bVBlbmRpbmciLCJfbWF4aW11bVBlbmRpbmciLCJjdXJzb3IiLCJ4YTEiLCJ5YTEiLCJ4YTIiLCJ5YTIiLCJsYXJnZXN0IiwiY2xvc2VzdCIsImlzQmVmb3JlIiwiaW5kaWNhdG9yIiwieGIxIiwieWIxIiwieGIyIiwieWIyIiwicGVyY2VudGFnZSIsIm5leHRTaWJsaW5nIiwiZGlzdGFuY2UiLCJtZWFzdXJlIiwiX3BsYWNlQnlEaXN0YW5jZSIsImRlbGV0ZSIsIm1vdmUiLCJjb3VudCIsIm1heGltdW0iLCJyZW1vdmVQZW5kaW5nIiwicG9wIiwic2F2ZVBlbmRpbmciLCJzbGljZSIsIm1heGltdW1GSUZPIiwiYSIsImIiLCJoaWRlIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLElBQU1BLFNBQVNDLFFBQVEsZUFBUixDQUFmOztBQUVBLElBQU1DLFdBQVdELFFBQVEsWUFBUixDQUFqQjtBQUNBLElBQU1FLFFBQVFGLFFBQVEsU0FBUixDQUFkOztJQUVNRyxROzs7QUFFRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTJDQSxzQkFBWUMsT0FBWixFQUFxQkMsT0FBckIsRUFDQTtBQUFBOztBQUFBOztBQUVJLGNBQUtBLE9BQUwsR0FBZUgsTUFBTUcsT0FBTixDQUFjQSxPQUFkLEVBQXVCSixRQUF2QixDQUFmO0FBQ0EsY0FBS0csT0FBTCxHQUFlQSxPQUFmO0FBQ0EsY0FBS0UsbUJBQUw7QUFDQSxZQUFNQyxXQUFXLE1BQUtDLFlBQUwsRUFBakI7QUFMSjtBQUFBO0FBQUE7O0FBQUE7QUFNSSxpQ0FBa0JELFFBQWxCLDhIQUNBO0FBQUEsb0JBRFNFLEtBQ1Q7O0FBQ0ksb0JBQUksQ0FBQyxNQUFLSixPQUFMLENBQWFLLFNBQWQsSUFBMkJSLE1BQU1TLGlCQUFOLENBQXdCRixLQUF4QixFQUErQixNQUFLSixPQUFMLENBQWFLLFNBQTVDLENBQS9CLEVBQ0E7QUFDSSwwQkFBS0UsYUFBTCxDQUFtQkgsS0FBbkI7QUFDSDtBQUNKO0FBWkw7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFhSSxjQUFLSSxNQUFMLEdBQWM7QUFDVkMsc0JBQVUsa0JBQUNDLENB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RUFBOEN6SCxRQUE5QztBQUNIO0FBQ0o7QUFDSjtBQUNKO0FBQ0o7QUFDSjs7Ozs7QUF0OEJEOzs7OzsrQkFLYzFDLFEsRUFBVUYsTyxFQUN4QjtBQUNJLGdCQUFNK0gsVUFBVSxFQUFoQjtBQURKO0FBQUE7QUFBQTs7QUFBQTtBQUVJLHVDQUFvQjdILFFBQXBCLHdJQUNBO0FBQUEsd0JBRFNILE9BQ1Q7O0FBQ0lnSSw0QkFBUWxFLElBQVIsQ0FBYSxJQUFJL0QsUUFBSixDQUFhQyxPQUFiLEVBQXNCQyxPQUF0QixDQUFiO0FBQ0g7QUFMTDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQU1JLG1CQUFPK0gsT0FBUDtBQUNIOzs7NEJBakJEO0FBQ0ksbUJBQU9uSSxRQUFQO0FBQ0g7Ozs7RUE3R2tCRixNOztBQXdqQ3ZCOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E0SyxPQUFPQyxPQUFQLEdBQWlCekssUUFBakIiLCJmaWxlIjoic29ydGFibGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBFdmVudHMgPSByZXF1aXJlKCdldmVudGVtaXR0ZXIzJylcclxuXHJcbmNvbnN0IGRlZmF1bHRzID0gcmVxdWlyZSgnLi9kZWZhdWx0cycpXHJcbmNvbnN0IHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXHJcblxyXG5jbGFzcyBTb3J0YWJsZSBleHRlbmRzIEV2ZW50c1xyXG57XHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBzb3J0YWJsZSBsaXN0XHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMubmFtZT1zb3J0YWJsZV0gZHJhZ2dpbmcgaXMgYWxsb3dlZCBiZXR3ZWVuIFNvcnRhYmxlcyB3aXRoIHRoZSBzYW1lIG5hbWVcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5kcmFnQ2xhc3NdIGlmIHNldCB0aGVuIGRyYWcgb25seSBpdGVtcyB3aXRoIHRoaXMgY2xhc3NOYW1lIHVuZGVyIGVsZW1lbnQ7IG90aGVyd2lzZSBkcmFnIGFsbCBjaGlsZHJlblxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLm9yZGVyQ2xhc3NdIHVzZSB0aGlzIGNsYXNzIHRvIGluY2x1ZGUgZWxlbWVudHMgaW4gb3JkZXJpbmcgYnV0IG5vdCBkcmFnZ2luZzsgb3RoZXJ3aXNlIGFsbCBjaGlsZHJlbiBlbGVtZW50cyBhcmUgaW5jbHVkZWQgaW4gd2hlbiBzb3J0aW5nIGFuZCBvcmRlcmluZ1xyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5kZWVwU2VhcmNoXSBpZiBkcmFnQ2xhc3MgYW5kIGRlZXBTZWFyY2ggdGhlbiBzZWFyY2ggYWxsIGRlc2NlbmRlbnRzIG9mIGVsZW1lbnQgZm9yIGRyYWdDbGFzc1xyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5zb3J0PXRydWVdIGFsbG93IHNvcnRpbmcgd2l0aGluIGxpc3RcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuZHJvcD10cnVlXSBhbGxvdyBkcm9wIGZyb20gcmVsYXRlZCBzb3J0YWJsZXMgKGRvZXNuJ3QgaW1wYWN0IHJlb3JkZXJpbmcgdGhpcyBzb3J0YWJsZSdzIGNoaWxkcmVuIHVudGlsIHRoZSBjaGlsZHJlbiBhcmUgbW92ZWQgdG8gYSBkaWZmZXJlbiBzb3J0YWJsZSlcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuY29weT1mYWxzZV0gY3JlYXRlIGNvcHkgd2hlbiBkcmFnZ2luZyBhbiBpdGVtICh0aGlzIGRpc2FibGVzIHNvcnQ9dHJ1ZSBmb3IgdGhpcyBzb3J0YWJsZSlcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5vcmRlcklkPWRhdGEtb3JkZXJdIGZvciBvcmRlcmVkIGxpc3RzLCB1c2UgdGhpcyBkYXRhIGlkIHRvIGZpZ3VyZSBvdXQgc29ydCBvcmRlclxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5vcmRlcklkSXNOdW1iZXI9dHJ1ZV0gdXNlIHBhcnNlSW50IG9uIG9wdGlvbnMuc29ydElkIHRvIHByb3Blcmx5IHNvcnQgbnVtYmVyc1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnJldmVyc2VPcmRlcl0gcmV2ZXJzZSBzb3J0IHRoZSBvcmRlcklkXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMub2ZmTGlzdD1jbG9zZXN0XSBob3cgdG8gaGFuZGxlIHdoZW4gYW4gZWxlbWVudCBpcyBkcm9wcGVkIG91dHNpZGUgYSBzb3J0YWJsZTogY2xvc2VzdD1kcm9wIGluIGNsb3Nlc3Qgc29ydGFibGU7IGNhbmNlbD1yZXR1cm4gdG8gc3RhcnRpbmcgc29ydGFibGU7IGRlbGV0ZT1yZW1vdmUgZnJvbSBhbGwgc29ydGFibGVzXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWF4aW11bV0gbWF4aW11bSBudW1iZXIgb2YgZWxlbWVudHMgYWxsb3dlZCBpbiBhIHNvcnRhYmxlIGxpc3RcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubWF4aW11bUZJRk9dIGRpcmVjdGlvbiBvZiBzZWFyY2ggdG8gY2hvb3NlIHdoaWNoIGl0ZW0gdG8gcmVtb3ZlIHdoZW4gbWF4aW11bSBpcyByZWFjaGVkXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuY3Vyc29ySG92ZXI9Z3JhYiAtd2Via2l0LWdyYWIgcG9pbnRlcl0gdXNlIHRoaXMgY3Vyc29yIGxpc3QgdG8gc2V0IGN1cnNvciB3aGVuIGhvdmVyaW5nIG92ZXIgYSBzb3J0YWJsZSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuY3Vyc29yRG93bj1ncmFiYmluZyAtd2Via2l0LWdyYWJiaW5nIHBvaW50ZXJdIHVzZSB0aGlzIGN1cnNvciBsaXN0IHRvIHNldCBjdXJzb3Igd2hlbiBtb3VzZWRvd24vdG91Y2hkb3duIG92ZXIgYSBzb3J0YWJsZSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnVzZUljb25zPXRydWVdIHNob3cgaWNvbnMgd2hlbiBkcmFnZ2luZ1xyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zLmljb25zXSBkZWZhdWx0IHNldCBvZiBpY29uc1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmljb25zLnJlb3JkZXJdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuaWNvbnMubW92ZV1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5pY29ucy5jb3B5XVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmljb25zLmRlbGV0ZV1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5jdXN0b21JY29uXSBzb3VyY2Ugb2YgY3VzdG9tIGltYWdlIHdoZW4gb3ZlciB0aGlzIHNvcnRhYmxlXHJcbiAgICAgKiBAZmlyZXMgcGlja3VwXHJcbiAgICAgKiBAZmlyZXMgb3JkZXJcclxuICAgICAqIEBmaXJlcyBhZGRcclxuICAgICAqIEBmaXJlcyByZW1vdmVcclxuICAgICAqIEBmaXJlcyB1cGRhdGVcclxuICAgICAqIEBmaXJlcyBkZWxldGVcclxuICAgICAqIEBmaXJlcyBjb3B5XHJcbiAgICAgKiBAZmlyZXMgbWF4aW11bS1yZW1vdmVcclxuICAgICAqIEBmaXJlcyBvcmRlci1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgYWRkLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyByZW1vdmUtcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIGFkZC1yZW1vdmUtcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIHVwZGF0ZS1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgZGVsZXRlLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyBjb3B5LXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyBtYXhpbXVtLXJlbW92ZS1wZW5kaW5nXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgc3VwZXIoKVxyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IHV0aWxzLm9wdGlvbnMob3B0aW9ucywgZGVmYXVsdHMpXHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudFxyXG4gICAgICAgIHRoaXMuX2FkZFRvR2xvYmFsVHJhY2tlcigpXHJcbiAgICAgICAgY29uc3QgZWxlbWVudHMgPSB0aGlzLl9nZXRDaGlsZHJlbigpXHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgZWxlbWVudHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5kcmFnQ2xhc3MgfHwgdXRpbHMuY29udGFpbnNDbGFzc05hbWUoY2hpbGQsIHRoaXMub3B0aW9ucy5kcmFnQ2xhc3MpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmF0dGFjaEVsZW1lbnQoY2hpbGQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5ldmVudHMgPSB7XHJcbiAgICAgICAgICAgIGRyYWdPdmVyOiAoZSkgPT4gdGhpcy5fZHJhZ092ZXIoZSksXHJcbiAgICAgICAgICAgIGRyb3A6IChlKSA9PiB0aGlzLl9kcm9wKGUpLFxyXG4gICAgICAgICAgICBtb3VzZU92ZXI6IChlKSA9PiB0aGlzLl9tb3VzZUVudGVyKGUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCB0aGlzLmV2ZW50cy5kcmFnT3ZlcilcclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLmV2ZW50cy5kcm9wKVxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY3Vyc29ySG92ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiB0aGlzLl9nZXRDaGlsZHJlbigpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB1dGlscy5zdHlsZShjaGlsZCwgJ2N1cnNvcicsIHRoaXMub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY3Vyc29yRG93bilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCAoZSkgPT4gdGhpcy5fbW91c2VEb3duKGUpKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIF9tb3VzZURvd24oZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmN1cnNvckhvdmVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdXRpbHMuc3R5bGUoZS5jdXJyZW50VGFyZ2V0LCAnY3Vyc29yJywgdGhpcy5vcHRpb25zLmN1cnNvckRvd24pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVtb3ZlcyBhbGwgZXZlbnQgaGFuZGxlcnMgZnJvbSB0aGlzLmVsZW1lbnQgYW5kIGNoaWxkcmVuXHJcbiAgICAgKi9cclxuICAgIGRlc3Ryb3koKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIHRoaXMuZXZlbnRzLmRyYWdPdmVyKVxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdkcm9wJywgdGhpcy5ldmVudHMuZHJvcClcclxuICAgICAgICBjb25zdCBlbGVtZW50cyA9IHRoaXMuX2dldENoaWxkcmVuKClcclxuICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBlbGVtZW50cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRWxlbWVudChjaGlsZClcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gdG9kbzogcmVtb3ZlIFNvcnRhYmxlLnRyYWNrZXIgYW5kIHJlbGF0ZWQgZXZlbnQgaGFuZGxlcnMgaWYgbm8gbW9yZSBzb3J0YWJsZXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHRoZSBnbG9iYWwgZGVmYXVsdHMgZm9yIG5ldyBTb3J0YWJsZSBvYmplY3RzXHJcbiAgICAgKiBAdHlwZSB7RGVmYXVsdE9wdGlvbnN9XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBnZXQgZGVmYXVsdHMoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBkZWZhdWx0c1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY3JlYXRlIG11bHRpcGxlIHNvcnRhYmxlIGVsZW1lbnRzXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50c1tdfSBlbGVtZW50c1xyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgLSBzZWUgY29uc3RydWN0b3IgZm9yIG9wdGlvbnNcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGNyZWF0ZShlbGVtZW50cywgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBjb25zdCByZXN1bHRzID0gW11cclxuICAgICAgICBmb3IgKGxldCBlbGVtZW50IG9mIGVsZW1lbnRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKG5ldyBTb3J0YWJsZShlbGVtZW50LCBvcHRpb25zKSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdHNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFkZCBhbiBlbGVtZW50IGFzIGEgY2hpbGQgb2YgdGhlIHNvcnRhYmxlIGVsZW1lbnQ7IGNhbiBhbHNvIGJlIHVzZWQgdG8gc3dhcCBiZXR3ZWVuIHNvcnRhYmxlc1xyXG4gICAgICogTk9URTogdGhpcyB3aWxsIG5vdCB3b3JrIHdpdGggZGVlcC10eXBlIGVsZW1lbnRzOyB1c2UgYXR0YWNoRWxlbWVudCBpbnN0ZWFkXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXhcclxuICAgICAqL1xyXG4gICAgYWRkKGVsZW1lbnQsIGluZGV4KVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuYXR0YWNoRWxlbWVudChlbGVtZW50KVxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc29ydClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaW5kZXggPT09ICd1bmRlZmluZWQnIHx8IGluZGV4ID49IHRoaXMuZWxlbWVudC5jaGlsZHJlbi5sZW5ndGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChlbGVtZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50Lmluc2VydEJlZm9yZShlbGVtZW50LCB0aGlzLmVsZW1lbnQuY2hpbGRyZW5baW5kZXggKyAxXSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IHRoaXMub3B0aW9ucy5vcmRlcklkXHJcbiAgICAgICAgICAgIGxldCBkcmFnT3JkZXIgPSBlbGVtZW50LmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICAgICAgZHJhZ09yZGVyID0gdGhpcy5vcHRpb25zLm9yZGVySWRJc051bWJlciA/IHBhcnNlRmxvYXQoZHJhZ09yZGVyKSA6IGRyYWdPcmRlclxyXG4gICAgICAgICAgICBsZXQgZm91bmRcclxuICAgICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLl9nZXRDaGlsZHJlbih0cnVlKVxyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJldmVyc2VPcmRlcilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IGNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gY2hpbGRyZW5baV1cclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGREcmFnT3JkZXIgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGREcmFnT3JkZXIgPSB0aGlzLm9wdGlvbnMub3JkZXJJc051bWJlciA/IHBhcnNlRmxvYXQoY2hpbGREcmFnT3JkZXIpIDogY2hpbGREcmFnT3JkZXJcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ09yZGVyID4gY2hpbGREcmFnT3JkZXIpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShlbGVtZW50LCBjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgY2hpbGRyZW4pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkRHJhZ09yZGVyID0gY2hpbGQuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkRHJhZ09yZGVyID0gdGhpcy5vcHRpb25zLm9yZGVySXNOdW1iZXIgPyBwYXJzZUZsb2F0KGNoaWxkRHJhZ09yZGVyKSA6IGNoaWxkRHJhZ09yZGVyXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdPcmRlciA8IGNoaWxkRHJhZ09yZGVyKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZWxlbWVudCwgY2hpbGQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWZvdW5kKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZWxlbWVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGF0dGFjaGVzIGFuIEhUTUwgZWxlbWVudCB0byB0aGUgc29ydGFibGU7IGNhbiBhbHNvIGJlIHVzZWQgdG8gc3dhcCBiZXR3ZWVuIHNvcnRhYmxlc1xyXG4gICAgICogTk9URTogeW91IG5lZWQgdG8gbWFudWFsbHkgaW5zZXJ0IHRoZSBlbGVtZW50IGludG8gdGhpcy5lbGVtZW50ICh0aGlzIGlzIHVzZWZ1bCB3aGVuIHlvdSBoYXZlIGEgZGVlcCBzdHJ1Y3R1cmUpXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKi9cclxuICAgIGF0dGFjaEVsZW1lbnQoZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsID0gdGhpc1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUgPSB7XHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZTogdGhpcyxcclxuICAgICAgICAgICAgICAgIG9yaWdpbmFsOiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgZHJhZ1N0YXJ0OiAoZSkgPT4gdGhpcy5fZHJhZ1N0YXJ0KGUpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGFkZCBhIGNvdW50ZXIgZm9yIG1heGltdW1cclxuICAgICAgICAgICAgdGhpcy5fbWF4aW11bUNvdW50ZXIoZWxlbWVudCwgdGhpcylcclxuXHJcbiAgICAgICAgICAgIC8vIGVuc3VyZSBldmVyeSBlbGVtZW50IGhhcyBhbiBpZFxyXG4gICAgICAgICAgICBpZiAoIWVsZW1lbnQuaWQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuaWQgPSAnX19zb3J0YWJsZS0nICsgdGhpcy5vcHRpb25zLm5hbWUgKyAnLScgKyBTb3J0YWJsZS50cmFja2VyW3RoaXMub3B0aW9ucy5uYW1lXS5jb3VudGVyXHJcbiAgICAgICAgICAgICAgICBTb3J0YWJsZS50cmFja2VyW3RoaXMub3B0aW9ucy5uYW1lXS5jb3VudGVyKytcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmNvcHkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5jb3B5ID0gMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ3N0YXJ0JywgZWxlbWVudC5fX3NvcnRhYmxlLmRyYWdTdGFydClcclxuICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RyYWdnYWJsZScsIHRydWUpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVtb3ZlcyBhbGwgZXZlbnRzIGZyb20gYW4gSFRNTCBlbGVtZW50XHJcbiAgICAgKiBOT1RFOiBkb2VzIG5vdCByZW1vdmUgdGhlIGVsZW1lbnQgZnJvbSBpdHMgcGFyZW50XHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKi9cclxuICAgIHJlbW92ZUVsZW1lbnQoZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGVsZW1lbnQuZHJhZ01vdmUpXHJcbiAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgZWxlbWVudC5kcmFnTW92ZSlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFkZCBzb3J0YWJsZSB0byBnbG9iYWwgbGlzdCB0aGF0IHRyYWNrcyBhbGwgc29ydGFibGVzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfYWRkVG9HbG9iYWxUcmFja2VyKClcclxuICAgIHtcclxuICAgICAgICBpZiAoIVNvcnRhYmxlLnRyYWNrZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBTb3J0YWJsZS5kcmFnSW1hZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICAgICAgICBTb3J0YWJsZS5kcmFnSW1hZ2UuaWQgPSAnc29ydGFibGUtZHJhZ0ltYWdlJ1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKFNvcnRhYmxlLmRyYWdJbWFnZSlcclxuICAgICAgICAgICAgU29ydGFibGUudHJhY2tlciA9IHt9XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCAoZSkgPT4gdGhpcy5fYm9keURyYWdPdmVyKGUpKVxyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCAoZSkgPT4gdGhpcy5fYm9keURyb3AoZSkpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChTb3J0YWJsZS50cmFja2VyW3RoaXMub3B0aW9ucy5uYW1lXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFNvcnRhYmxlLnRyYWNrZXJbdGhpcy5vcHRpb25zLm5hbWVdLmxpc3QucHVzaCh0aGlzKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBTb3J0YWJsZS50cmFja2VyW3RoaXMub3B0aW9ucy5uYW1lXSA9IHsgbGlzdDogW3RoaXNdLCBjb3VudGVyOiAwIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBkZWZhdWx0IGRyYWcgb3ZlciBmb3IgdGhlIGJvZHlcclxuICAgICAqIEBwYXJhbSB7RHJhZ0V2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfYm9keURyYWdPdmVyKGUpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzBdXHJcbiAgICAgICAgaWYgKG5hbWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzFdXHJcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZClcclxuICAgICAgICAgICAgY29uc3Qgc29ydGFibGUgPSB0aGlzLl9maW5kQ2xvc2VzdChlLCBTb3J0YWJsZS50cmFja2VyW25hbWVdLmxpc3QsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgIGlmIChzb3J0YWJsZSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHNvcnRhYmxlLmxhc3QgJiYgTWF0aC5hYnMoc29ydGFibGUubGFzdC54IC0gZS5wYWdlWCkgPCBzb3J0YWJsZS5vcHRpb25zLnRocmVzaG9sZCAmJiBNYXRoLmFicyhzb3J0YWJsZS5sYXN0LnkgLSBlLnBhZ2VZKSA8IHNvcnRhYmxlLm9wdGlvbnMudGhyZXNob2xkKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlLl91cGRhdGVEcmFnZ2luZyhlLCBlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlLmxhc3QgPSB7IHg6IGUucGFnZVgsIHk6IGUucGFnZVkgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fcGxhY2VJbkxpc3Qoc29ydGFibGUsIGUucGFnZVgsIGUucGFnZVksIGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICBlLmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ21vdmUnXHJcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVEcmFnZ2luZyhlLCBlbGVtZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbm9Ecm9wKGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIG5vIGRyb3BcclxuICAgICAqIEBwYXJhbSB7VUlFdmVudH0gZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2FuY2VsXSBmb3JjZSBjYW5jZWwgKGZvciBvcHRpb25zLmNvcHkpXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfbm9Ecm9wKGUsIGNhbmNlbClcclxuICAgIHtcclxuICAgICAgICBlLmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ21vdmUnXHJcbiAgICAgICAgY29uc3QgaWQgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1sxXVxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZClcclxuICAgICAgICBpZiAoZWxlbWVudClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZURyYWdnaW5nKGUsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgIHRoaXMuX3NldEljb24oZWxlbWVudCwgbnVsbCwgY2FuY2VsKVxyXG4gICAgICAgICAgICBpZiAoIWNhbmNlbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbC5vcHRpb25zLm9mZkxpc3QgPT09ICdkZWxldGUnKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheSA9IGVsZW1lbnQuc3R5bGUuZGlzcGxheSB8fCAndW5zZXQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwuZW1pdCgnZGVsZXRlLXBlbmRpbmcnLCBlbGVtZW50LCBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoIWVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbC5vcHRpb25zLmNvcHkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVwbGFjZUluTGlzdChlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuY3VycmVudC5lbWl0KCdhZGQtcmVtb3ZlLXBlbmRpbmcnLCBlbGVtZW50LCBlbGVtZW50Ll9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5jdXJyZW50LmVtaXQoJ3VwZGF0ZS1wZW5kaW5nJywgZWxlbWVudCwgZWxlbWVudC5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuY3VycmVudCA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGRlZmF1bHQgZHJvcCBmb3IgdGhlIGJvZHlcclxuICAgICAqIEBwYXJhbSB7RHJhZ0V2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfYm9keURyb3AoZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBuYW1lID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMF1cclxuICAgICAgICBpZiAobmFtZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMV1cclxuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxyXG4gICAgICAgICAgICBjb25zdCBzb3J0YWJsZSA9IHRoaXMuX2ZpbmRDbG9zZXN0KGUsIFNvcnRhYmxlLnRyYWNrZXJbbmFtZV0ubGlzdCwgZWxlbWVudClcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlbW92ZURyYWdnaW5nKGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmUoKVxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkgPSBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsLmVtaXQoJ2RlbGV0ZScsIGVsZW1lbnQsIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbClcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgPSBudWxsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzdGFydCBkcmFnXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kcmFnU3RhcnQoZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBzb3J0YWJsZSA9IGUuY3VycmVudFRhcmdldC5fX3NvcnRhYmxlLm9yaWdpbmFsXHJcbiAgICAgICAgY29uc3QgZHJhZ2dpbmcgPSBlLmN1cnJlbnRUYXJnZXQuY2xvbmVOb2RlKHRydWUpXHJcbiAgICAgICAgZm9yIChsZXQgc3R5bGUgaW4gc29ydGFibGUub3B0aW9ucy5kcmFnU3R5bGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5zdHlsZVtzdHlsZV0gPSBzb3J0YWJsZS5vcHRpb25zLmRyYWdTdHlsZVtzdHlsZV1cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcG9zID0gdXRpbHMudG9HbG9iYWwoZS5jdXJyZW50VGFyZ2V0KVxyXG4gICAgICAgIGRyYWdnaW5nLnN0eWxlLmxlZnQgPSBwb3MueCArICdweCdcclxuICAgICAgICBkcmFnZ2luZy5zdHlsZS50b3AgPSBwb3MueSArICdweCdcclxuICAgICAgICBjb25zdCBvZmZzZXQgPSB7IHg6IHBvcy54IC0gZS5wYWdlWCwgeTogcG9zLnkgLSBlLnBhZ2VZIH1cclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRyYWdnaW5nKVxyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLnVzZUljb25zKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKVxyXG4gICAgICAgICAgICBpbWFnZS5zcmMgPSBzb3J0YWJsZS5vcHRpb25zLmljb25zLnJlb3JkZXJcclxuICAgICAgICAgICAgaW1hZ2Uuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoLTUwJSwgLTUwJSknXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLmxlZnQgPSBkcmFnZ2luZy5vZmZzZXRMZWZ0ICsgZHJhZ2dpbmcub2Zmc2V0V2lkdGggKyAncHgnXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLnRvcCA9IGRyYWdnaW5nLm9mZnNldFRvcCArIGRyYWdnaW5nLm9mZnNldEhlaWdodCArICdweCdcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpbWFnZSlcclxuICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbiA9IGltYWdlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLmN1cnNvckhvdmVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdXRpbHMuc3R5bGUoZS5jdXJyZW50VGFyZ2V0LCAnY3Vyc29yJywgc29ydGFibGUub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHRhcmdldCA9IGUuY3VycmVudFRhcmdldFxyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLmNvcHkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0YXJnZXQgPSBlLmN1cnJlbnRUYXJnZXQuY2xvbmVOb2RlKHRydWUpXHJcbiAgICAgICAgICAgIHRhcmdldC5pZCA9IGUuY3VycmVudFRhcmdldC5pZCArICctY29weS0nICsgZS5jdXJyZW50VGFyZ2V0Ll9fc29ydGFibGUuY29weVxyXG4gICAgICAgICAgICBlLmN1cnJlbnRUYXJnZXQuX19zb3J0YWJsZS5jb3B5KytcclxuICAgICAgICAgICAgc29ydGFibGUuYXR0YWNoRWxlbWVudCh0YXJnZXQpXHJcbiAgICAgICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLmlzQ29weSA9IHRydWVcclxuICAgICAgICAgICAgdGFyZ2V0Ll9fc29ydGFibGUub3JpZ2luYWwgPSB0aGlzXHJcbiAgICAgICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLmRpc3BsYXkgPSB0YXJnZXQuc3R5bGUuZGlzcGxheSB8fCAndW5zZXQnXHJcbiAgICAgICAgICAgIHRhcmdldC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGFyZ2V0KVxyXG4gICAgICAgIH1cclxuICAgICAgICBlLmRhdGFUcmFuc2Zlci5jbGVhckRhdGEoKVxyXG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLnNldERhdGEoc29ydGFibGUub3B0aW9ucy5uYW1lLCBzb3J0YWJsZS5vcHRpb25zLm5hbWUpXHJcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuc2V0RGF0YSh0YXJnZXQuaWQsIHRhcmdldC5pZClcclxuICAgICAgICBlLmRhdGFUcmFuc2Zlci5zZXREcmFnSW1hZ2UoU29ydGFibGUuZHJhZ0ltYWdlLCAwLCAwKVxyXG4gICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLmN1cnJlbnQgPSB0aGlzXHJcbiAgICAgICAgdGFyZ2V0Ll9fc29ydGFibGUuaW5kZXggPSBzb3J0YWJsZS5vcHRpb25zLmNvcHkgPyAtMSA6IHNvcnRhYmxlLl9nZXRJbmRleCh0YXJnZXQpXHJcbiAgICAgICAgdGFyZ2V0Ll9fc29ydGFibGUuZHJhZ2dpbmcgPSBkcmFnZ2luZ1xyXG4gICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLm9mZnNldCA9IG9mZnNldFxyXG4gICAgfVxyXG5cclxuICAgIF9kcmFnT3ZlcihlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHNvcnRhYmxlID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMF1cclxuICAgICAgICBpZiAoc29ydGFibGUgJiYgc29ydGFibGUgPT09IHRoaXMub3B0aW9ucy5uYW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1sxXVxyXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmxhc3QgJiYgTWF0aC5hYnModGhpcy5sYXN0LnggLSBlLnBhZ2VYKSA8IHRoaXMub3B0aW9ucy50aHJlc2hvbGQgJiYgTWF0aC5hYnModGhpcy5sYXN0LnkgLSBlLnBhZ2VZKSA8IHRoaXMub3B0aW9ucy50aHJlc2hvbGQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZURyYWdnaW5nKGUsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMubGFzdCA9IHsgeDogZS5wYWdlWCwgeTogZS5wYWdlWSB9XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUuaXNDb3B5ICYmIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9PT0gdGhpcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbm9Ecm9wKGUsIHRydWUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5vcHRpb25zLmRyb3AgfHwgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsID09PSB0aGlzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wbGFjZUluTGlzdCh0aGlzLCBlLnBhZ2VYLCBlLnBhZ2VZLCBlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgZS5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9IGVsZW1lbnQuX19zb3J0YWJsZS5pc0NvcHkgPyAnY29weScgOiAnbW92ZSdcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZURyYWdnaW5nKGUsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9ub0Ryb3AoZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfdXBkYXRlRHJhZ2dpbmcoZSwgZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBkcmFnZ2luZyA9IGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnZ2luZ1xyXG4gICAgICAgIGNvbnN0IG9mZnNldCA9IGVsZW1lbnQuX19zb3J0YWJsZS5vZmZzZXRcclxuICAgICAgICBpZiAoZHJhZ2dpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5zdHlsZS5sZWZ0ID0gZS5wYWdlWCArIG9mZnNldC54ICsgJ3B4J1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5zdHlsZS50b3AgPSBlLnBhZ2VZICsgb2Zmc2V0LnkgKyAncHgnXHJcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZy5pY29uKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnN0eWxlLmxlZnQgPSBkcmFnZ2luZy5vZmZzZXRMZWZ0ICsgZHJhZ2dpbmcub2Zmc2V0V2lkdGggKyAncHgnXHJcbiAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnN0eWxlLnRvcCA9IGRyYWdnaW5nLm9mZnNldFRvcCArIGRyYWdnaW5nLm9mZnNldEhlaWdodCArICdweCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfcmVtb3ZlRHJhZ2dpbmcoZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBkcmFnZ2luZyA9IGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnZ2luZ1xyXG4gICAgICAgIGRyYWdnaW5nLnJlbW92ZSgpXHJcbiAgICAgICAgaWYgKGRyYWdnaW5nLmljb24pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5pY29uLnJlbW92ZSgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnZ2luZyA9IG51bGxcclxuICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuaXNDb3B5ID0gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBfZHJvcChlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IG5hbWUgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1swXVxyXG4gICAgICAgIGlmIChuYW1lICYmIG5hbWUgPT09IHRoaXMub3B0aW9ucy5uYW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1sxXVxyXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgIT09IHRoaXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbC5lbWl0KCdyZW1vdmUnLCBlbGVtZW50LCBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2FkZCcsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgPSB0aGlzXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNvcnQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdvcmRlcicsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLmlzQ29weSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2NvcHknLCBlbGVtZW50LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fbWF4aW11bShlbGVtZW50LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KCd1cGRhdGUnLCBlbGVtZW50LCB0aGlzKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5pbmRleCAhPT0gdGhpcy5fZ2V0SW5kZXgoZS5jdXJyZW50VGFyZ2V0KSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ29yZGVyJywgZWxlbWVudCwgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ3VwZGF0ZScsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlRHJhZ2dpbmcoZWxlbWVudClcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmaW5kIGNsb3Nlc3QgU29ydGFibGUgdG8gc2NyZWVuIGxvY2F0aW9uXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGVbXX0gbGlzdCBvZiByZWxhdGVkIFNvcnRhYmxlc1xyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2ZpbmRDbG9zZXN0KGUsIGxpc3QsIGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IG1pbiA9IEluZmluaXR5LCBmb3VuZFxyXG4gICAgICAgIGZvciAobGV0IHJlbGF0ZWQgb2YgbGlzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICgoIXJlbGF0ZWQub3B0aW9ucy5kcm9wICYmIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCAhPT0gcmVsYXRlZCkgfHxcclxuICAgICAgICAgICAgICAgIChlbGVtZW50Ll9fc29ydGFibGUuaXNDb3B5ICYmIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9PT0gcmVsYXRlZCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHV0aWxzLmluc2lkZShlLnBhZ2VYLCBlLnBhZ2VZLCByZWxhdGVkLmVsZW1lbnQpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVsYXRlZFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHJlbGF0ZWQub3B0aW9ucy5vZmZMaXN0ID09PSAnY2xvc2VzdCcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNhbGN1bGF0ZSA9IHV0aWxzLmRpc3RhbmNlVG9DbG9zZXN0Q29ybmVyKGUucGFnZVgsIGUucGFnZVksIHJlbGF0ZWQuZWxlbWVudClcclxuICAgICAgICAgICAgICAgIGlmIChjYWxjdWxhdGUgPCBtaW4pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWluID0gY2FsY3VsYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgZm91bmQgPSByZWxhdGVkXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZvdW5kXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwbGFjZSBpbmRpY2F0b3IgaW4gdGhlIHNvcnRhYmxlIGxpc3QgYWNjb3JkaW5nIHRvIG9wdGlvbnMuc29ydFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BsYWNlSW5MaXN0KHNvcnRhYmxlLCB4LCB5LCBlbGVtZW50KVxyXG4gICAge1xyXG4gICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5ID09PSAndW5zZXQnID8gJycgOiBlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheVxyXG4gICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheSA9IG51bGxcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zb3J0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fcGxhY2VJblNvcnRhYmxlTGlzdChzb3J0YWJsZSwgeCwgeSwgZWxlbWVudClcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fcGxhY2VJbk9yZGVyZWRMaXN0KHNvcnRhYmxlLCBlbGVtZW50KVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9zZXRJY29uKGVsZW1lbnQsIHNvcnRhYmxlKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVwbGFjZSBpdGVtIGluIGxpc3QgYXQgb3JpZ2luYWwgaW5kZXggcG9zaXRpb25cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9yZXBsYWNlSW5MaXN0KHNvcnRhYmxlLCBlbGVtZW50KVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gc29ydGFibGUuX2dldENoaWxkcmVuKClcclxuICAgICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaW5kZXggPSBlbGVtZW50Ll9fc29ydGFibGUuaW5kZXhcclxuICAgICAgICAgICAgaWYgKGluZGV4IDwgY2hpbGRyZW4ubGVuZ3RoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlbltpbmRleF0ucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZWxlbWVudCwgY2hpbGRyZW5baW5kZXhdKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2hpbGRyZW5bMF0uYXBwZW5kQ2hpbGQoZWxlbWVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbGVtZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIF9nZXRJbmRleChjaGlsZClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuX2dldENoaWxkcmVuKClcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGNoaWxkcmVuW2ldID09PSBjaGlsZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfdHJhdmVyc2VDaGlsZHJlbihiYXNlLCBzZWFyY2gsIHJlc3VsdHMpXHJcbiAgICB7XHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgYmFzZS5jaGlsZHJlbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChzZWFyY2gubGVuZ3RoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2VhcmNoLmluZGV4T2YoY2hpbGQuY2xhc3NOYW1lKSAhPT0gLTEpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGNoaWxkKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3RyYXZlcnNlQ2hpbGRyZW4oY2hpbGQsIHNlYXJjaCwgcmVzdWx0cylcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmaW5kIGNoaWxkcmVuIGluIGRpdlxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29yZGVyXSBzZWFyY2ggZm9yIGRyYWdPcmRlciBhcyB3ZWxsXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZ2V0Q2hpbGRyZW4ob3JkZXIpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kZWVwU2VhcmNoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IHNlYXJjaCA9IFtdXHJcbiAgICAgICAgICAgIGlmIChvcmRlciAmJiB0aGlzLm9wdGlvbnMub3JkZXJDbGFzcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoLnB1c2godGhpcy5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChvcmRlciAmJiB0aGlzLm9wdGlvbnMub3JkZXJDbGFzcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2gucHVzaCh0aGlzLm9wdGlvbnMub3JkZXJDbGFzcylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICghb3JkZXIgJiYgdGhpcy5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc2VhcmNoLnB1c2godGhpcy5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCByZXN1bHRzID0gW11cclxuICAgICAgICAgICAgdGhpcy5fdHJhdmVyc2VDaGlsZHJlbih0aGlzLmVsZW1lbnQsIHNlYXJjaCwgcmVzdWx0cylcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHNcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxldCBsaXN0ID0gW11cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIHRoaXMuZWxlbWVudC5jaGlsZHJlbilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodXRpbHMuY29udGFpbnNDbGFzc05hbWUoY2hpbGQsIHRoaXMub3B0aW9ucy5kcmFnQ2xhc3MpIHx8IChvcmRlciAmJiAhdGhpcy5vcHRpb25zLm9yZGVyQ2xhc3MgfHwgKG9yZGVyICYmIHRoaXMub3B0aW9ucy5vcmRlckNsYXNzICYmIHV0aWxzLmNvbnRhaW5zQ2xhc3NOYW1lKGNoaWxkLCB0aGlzLm9wdGlvbnMub3JkZXJDbGFzcykpKSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpc3QucHVzaChjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbGlzdFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbGlzdCA9IFtdXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiB0aGlzLmVsZW1lbnQuY2hpbGRyZW4pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGlzdC5wdXNoKGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGxpc3RcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBsYWNlIGluZGljYXRvciBpbiBhbiBvcmRlcmVkIGxpc3RcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BsYWNlSW5PcmRlcmVkTGlzdChzb3J0YWJsZSwgZHJhZ2dpbmcpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudCAhPT0gc29ydGFibGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IHNvcnRhYmxlLm9wdGlvbnMub3JkZXJJZFxyXG4gICAgICAgICAgICBsZXQgZHJhZ09yZGVyID0gZHJhZ2dpbmcuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICBkcmFnT3JkZXIgPSBzb3J0YWJsZS5vcHRpb25zLm9yZGVySWRJc051bWJlciA/IHBhcnNlRmxvYXQoZHJhZ09yZGVyKSA6IGRyYWdPcmRlclxyXG4gICAgICAgICAgICBsZXQgZm91bmRcclxuICAgICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4odHJ1ZSlcclxuICAgICAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMucmV2ZXJzZU9yZGVyKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBjaGlsZHJlbltpXVxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZERyYWdPcmRlciA9IGNoaWxkLmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZERyYWdPcmRlciA9IHNvcnRhYmxlLm9wdGlvbnMub3JkZXJJc051bWJlciA/IHBhcnNlRmxvYXQoY2hpbGREcmFnT3JkZXIpIDogY2hpbGREcmFnT3JkZXJcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ09yZGVyID4gY2hpbGREcmFnT3JkZXIpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShkcmFnZ2luZywgY2hpbGQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGNoaWxkcmVuKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZERyYWdPcmRlciA9IGNoaWxkLmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZERyYWdPcmRlciA9IHNvcnRhYmxlLm9wdGlvbnMub3JkZXJJc051bWJlciA/IHBhcnNlRmxvYXQoY2hpbGREcmFnT3JkZXIpIDogY2hpbGREcmFnT3JkZXJcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ09yZGVyIDwgY2hpbGREcmFnT3JkZXIpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShkcmFnZ2luZywgY2hpbGQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWZvdW5kKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbGVtZW50LmFwcGVuZENoaWxkKGRyYWdnaW5nKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgIT09IGRyYWdnaW5nLl9fc29ydGFibGUub3JpZ2luYWwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50LmVtaXQoJ2FkZC1yZW1vdmUtcGVuZGluZycsIGRyYWdnaW5nLCBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50LmVtaXQoJ3JlbW92ZS1wZW5kaW5nJywgZHJhZ2dpbmcsIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdhZGQtcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuaXNDb3B5KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdjb3B5LXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fY2xlYXJNYXhpbXVtUGVuZGluZyhkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudCA9IHNvcnRhYmxlXHJcbiAgICAgICAgICAgIHRoaXMuX21heGltdW1QZW5kaW5nKGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgc29ydGFibGUuZW1pdCgndXBkYXRlLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2VhcmNoIGZvciB3aGVyZSB0byBwbGFjZSB1c2luZyBwZXJjZW50YWdlXHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmdcclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IDAgPSBub3QgZm91bmQ7IDEgPSBub3RoaW5nIHRvIGRvOyAyID0gbW92ZWRcclxuICAgICAqL1xyXG4gICAgX3BsYWNlQnlQZXJjZW50YWdlKHNvcnRhYmxlLCBkcmFnZ2luZylcclxuICAgIHtcclxuICAgICAgICBjb25zdCBjdXJzb3IgPSBkcmFnZ2luZy5fX3NvcnRhYmxlLmRyYWdnaW5nXHJcbiAgICAgICAgY29uc3QgeGExID0gY3Vyc29yLm9mZnNldExlZnRcclxuICAgICAgICBjb25zdCB5YTEgPSBjdXJzb3Iub2Zmc2V0VG9wXHJcbiAgICAgICAgY29uc3QgeGEyID0gY3Vyc29yLm9mZnNldExlZnQgKyBjdXJzb3Iub2Zmc2V0V2lkdGhcclxuICAgICAgICBjb25zdCB5YTIgPSBjdXJzb3Iub2Zmc2V0VG9wICsgY3Vyc29yLm9mZnNldEhlaWdodFxyXG4gICAgICAgIGxldCBsYXJnZXN0ID0gMCwgY2xvc2VzdCwgaXNCZWZvcmUsIGluZGljYXRvclxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBzb3J0YWJsZS5lbGVtZW50XHJcbiAgICAgICAgY29uc3QgZWxlbWVudHMgPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4odHJ1ZSlcclxuICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBlbGVtZW50cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChjaGlsZCA9PT0gZHJhZ2dpbmcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGluZGljYXRvciA9IHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBwb3MgPSB1dGlscy50b0dsb2JhbChjaGlsZClcclxuICAgICAgICAgICAgY29uc3QgeGIxID0gcG9zLnhcclxuICAgICAgICAgICAgY29uc3QgeWIxID0gcG9zLnlcclxuICAgICAgICAgICAgY29uc3QgeGIyID0gcG9zLnggKyBjaGlsZC5vZmZzZXRXaWR0aFxyXG4gICAgICAgICAgICBjb25zdCB5YjIgPSBwb3MueSArIGNoaWxkLm9mZnNldEhlaWdodFxyXG4gICAgICAgICAgICBjb25zdCBwZXJjZW50YWdlID0gdXRpbHMucGVyY2VudGFnZSh4YTEsIHlhMSwgeGEyLCB5YTIsIHhiMSwgeWIxLCB4YjIsIHliMilcclxuICAgICAgICAgICAgaWYgKHBlcmNlbnRhZ2UgPiBsYXJnZXN0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsYXJnZXN0ID0gcGVyY2VudGFnZVxyXG4gICAgICAgICAgICAgICAgY2xvc2VzdCA9IGNoaWxkXHJcbiAgICAgICAgICAgICAgICBpc0JlZm9yZSA9IGluZGljYXRvclxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjbG9zZXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGNsb3Nlc3QgPT09IGRyYWdnaW5nKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpc0JlZm9yZSAmJiBjbG9zZXN0Lm5leHRTaWJsaW5nKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Lmluc2VydEJlZm9yZShkcmFnZ2luZywgY2xvc2VzdC5uZXh0U2libGluZylcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ29yZGVyLXBlbmRpbmcnLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKGRyYWdnaW5nLCBjbG9zZXN0KVxyXG4gICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnb3JkZXItcGVuZGluZycsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAyXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiAwXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2VhcmNoIGZvciB3aGVyZSB0byBwbGFjZSB1c2luZyBkaXN0YW5jZVxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IGZhbHNlPW5vdGhpbmcgdG8gZG9cclxuICAgICAqL1xyXG4gICAgX3BsYWNlQnlEaXN0YW5jZShzb3J0YWJsZSwgZHJhZ2dpbmcsIHgsIHkpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHV0aWxzLmluc2lkZSh4LCB5LCBkcmFnZ2luZykpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgaW5kZXggPSAtMVxyXG4gICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgPT09IHNvcnRhYmxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaW5kZXggPSBzb3J0YWJsZS5fZ2V0SW5kZXgoZHJhZ2dpbmcpXHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZHJhZ2dpbmcpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBkaXN0YW5jZSA9IEluZmluaXR5LCBjbG9zZXN0XHJcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHNvcnRhYmxlLmVsZW1lbnRcclxuICAgICAgICBjb25zdCBlbGVtZW50cyA9IHNvcnRhYmxlLl9nZXRDaGlsZHJlbih0cnVlKVxyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGVsZW1lbnRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHV0aWxzLmluc2lkZSh4LCB5LCBjaGlsZCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNsb3Nlc3QgPSBjaGlsZFxyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG1lYXN1cmUgPSB1dGlscy5kaXN0YW5jZVRvQ2xvc2VzdENvcm5lcih4LCB5LCBjaGlsZClcclxuICAgICAgICAgICAgICAgIGlmIChtZWFzdXJlIDwgZGlzdGFuY2UpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xvc2VzdCA9IGNoaWxkXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2UgPSBtZWFzdXJlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxlbWVudC5pbnNlcnRCZWZvcmUoZHJhZ2dpbmcsIGNsb3Nlc3QpXHJcbiAgICAgICAgaWYgKGluZGV4ID09PSBzb3J0YWJsZS5fZ2V0SW5kZXgoZHJhZ2dpbmcpKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbWF4aW11bVBlbmRpbmcoZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgIHNvcnRhYmxlLmVtaXQoJ29yZGVyLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwbGFjZSBpbmRpY2F0b3IgaW4gYW4gc29ydGFibGUgbGlzdFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BsYWNlSW5Tb3J0YWJsZUxpc3Qoc29ydGFibGUsIHgsIHksIGRyYWdnaW5nKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBzb3J0YWJsZS5lbGVtZW50XHJcbiAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgIGlmICghY2hpbGRyZW4ubGVuZ3RoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudCAhPT0gc29ydGFibGUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50LmVtaXQoJ3JlbW92ZS1wZW5kaW5nJywgZHJhZ2dpbmcsIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudCA9IHNvcnRhYmxlXHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdhZGQtcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmlzQ29weSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdjb3B5LXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChkcmFnZ2luZylcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gY29uc3QgcGVyY2VudGFnZSA9IHRoaXMuX3BsYWNlQnlQZXJjZW50YWdlKHNvcnRhYmxlLCBkcmFnZ2luZylcclxuICAgICAgICAgICAgaWYgKHRoaXMuX3BsYWNlQnlEaXN0YW5jZShzb3J0YWJsZSwgZHJhZ2dpbmcsIHgsIHkpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50ICE9PSBzb3J0YWJsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ2FkZC1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5pc0NvcHkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ2NvcHktcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jbGVhck1heGltdW1QZW5kaW5nKGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgIT09IGRyYWdnaW5nLl9fc29ydGFibGUub3JpZ2luYWwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50LmVtaXQoJ2FkZC1yZW1vdmUtcGVuZGluZycsIGRyYWdnaW5nLCBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50LmVtaXQoJ3JlbW92ZS1wZW5kaW5nJywgZHJhZ2dpbmcsIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgPSBzb3J0YWJsZVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9tYXhpbXVtUGVuZGluZyhkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgc29ydGFibGUuZW1pdCgndXBkYXRlLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzZXQgaWNvbiBpZiBhdmFpbGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2FuY2VsXSBmb3JjZSBjYW5jZWwgKGZvciBvcHRpb25zLmNvcHkpXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfc2V0SWNvbihlbGVtZW50LCBzb3J0YWJsZSwgY2FuY2VsKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGRyYWdnaW5nID0gZWxlbWVudC5fX3NvcnRhYmxlLmRyYWdnaW5nXHJcbiAgICAgICAgaWYgKGRyYWdnaW5nICYmIGRyYWdnaW5nLmljb24pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoIXNvcnRhYmxlKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZSA9IGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbFxyXG4gICAgICAgICAgICAgICAgaWYgKGNhbmNlbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnNyYyA9IHNvcnRhYmxlLm9wdGlvbnMuaWNvbnMuY2FuY2VsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zcmMgPSBzb3J0YWJsZS5vcHRpb25zLm9mZkxpc3QgPT09ICdkZWxldGUnID8gc29ydGFibGUub3B0aW9ucy5pY29ucy5kZWxldGUgOiBzb3J0YWJsZS5vcHRpb25zLmljb25zLmNhbmNlbFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5pc0NvcHkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zcmMgPSBzb3J0YWJsZS5vcHRpb25zLmljb25zLmNvcHlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnNyYyA9IGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9PT0gc29ydGFibGUgPyBzb3J0YWJsZS5vcHRpb25zLmljb25zLnJlb3JkZXIgOiBzb3J0YWJsZS5vcHRpb25zLmljb25zLm1vdmVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFkZCBhIG1heGltdW0gY291bnRlciB0byB0aGUgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqL1xyXG4gICAgX21heGltdW1Db3VudGVyKGVsZW1lbnQsIHNvcnRhYmxlKVxyXG4gICAge1xyXG4gICAgICAgIGxldCBjb3VudCA9IC0xXHJcbiAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMubWF4aW11bSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gc29ydGFibGUuX2dldENoaWxkcmVuKClcclxuICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgY2hpbGRyZW4pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChjaGlsZCAhPT0gZWxlbWVudCAmJiBjaGlsZC5fX3NvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvdW50ID0gY2hpbGQuX19zb3J0YWJsZS5tYXhpbXVtID4gY291bnQgPyBjaGlsZC5fX3NvcnRhYmxlLm1heGltdW0gOiBjb3VudFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5tYXhpbXVtID0gY291bnQgKyAxXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgbWF4aW11bVxyXG4gICAgICovXHJcbiAgICBfbWF4aW11bShlbGVtZW50LCBzb3J0YWJsZSlcclxuICAgIHtcclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5tYXhpbXVtKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoID4gc29ydGFibGUub3B0aW9ucy5tYXhpbXVtKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoc29ydGFibGUucmVtb3ZlUGVuZGluZy5sZW5ndGgpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBzb3J0YWJsZS5yZW1vdmVQZW5kaW5nLnBvcCgpXHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQuc3R5bGUuZGlzcGxheSA9IGNoaWxkLl9fc29ydGFibGUuZGlzcGxheSA9PT0gJ3Vuc2V0JyA/ICcnIDogY2hpbGQuX19zb3J0YWJsZS5kaXNwbGF5XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQuX19zb3J0YWJsZS5kaXNwbGF5ID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkLnJlbW92ZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnbWF4aW11bS1yZW1vdmUnLCBjaGlsZCwgc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fbWF4aW11bUNvdW50ZXIoZWxlbWVudCwgc29ydGFibGUpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2xlYXIgcGVuZGluZyBsaXN0XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICovXHJcbiAgICBfY2xlYXJNYXhpbXVtUGVuZGluZyhzb3J0YWJsZSlcclxuICAgIHtcclxuICAgICAgICBpZiAoc29ydGFibGUucmVtb3ZlUGVuZGluZylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHdoaWxlIChzb3J0YWJsZS5yZW1vdmVQZW5kaW5nLmxlbmd0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBzb3J0YWJsZS5yZW1vdmVQZW5kaW5nLnBvcCgpXHJcbiAgICAgICAgICAgICAgICBjaGlsZC5zdHlsZS5kaXNwbGF5ID0gY2hpbGQuX19zb3J0YWJsZS5kaXNwbGF5ID09PSAndW5zZXQnID8gJycgOiBjaGlsZC5fX3NvcnRhYmxlLmRpc3BsYXlcclxuICAgICAgICAgICAgICAgIGNoaWxkLl9fc29ydGFibGUuZGlzcGxheSA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSBwZW5kaW5nIG1heGltdW1cclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfbWF4aW11bVBlbmRpbmcoZWxlbWVudCwgc29ydGFibGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMubWF4aW11bSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gc29ydGFibGUuX2dldENoaWxkcmVuKClcclxuICAgICAgICAgICAgY29uc3Qgc2F2ZVBlbmRpbmcgPSBzb3J0YWJsZS5yZW1vdmVQZW5kaW5nID8gc29ydGFibGUucmVtb3ZlUGVuZGluZy5zbGljZSgwKSA6IFtdXHJcbiAgICAgICAgICAgIHRoaXMuX2NsZWFyTWF4aW11bVBlbmRpbmcoc29ydGFibGUpXHJcbiAgICAgICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPiBzb3J0YWJsZS5vcHRpb25zLm1heGltdW0pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlLnJlbW92ZVBlbmRpbmcgPSBbXVxyXG4gICAgICAgICAgICAgICAgbGV0IHNvcnRcclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLm1heGltdW1GSUZPKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNvcnQgPSBjaGlsZHJlbi5zb3J0KChhLCBiKSA9PiB7IHJldHVybiBhID09PSBlbGVtZW50ID8gMSA6IGEuX19zb3J0YWJsZS5tYXhpbXVtIC0gYi5fX3NvcnRhYmxlLm1heGltdW0gfSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzb3J0ID0gY2hpbGRyZW4uc29ydCgoYSwgYikgPT4geyByZXR1cm4gYSA9PT0gZWxlbWVudCA/IDEgOiBiLl9fc29ydGFibGUubWF4aW11bSAtIGEuX19zb3J0YWJsZS5tYXhpbXVtIH0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aCAtIHNvcnRhYmxlLm9wdGlvbnMubWF4aW11bTsgaSsrKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhpZGUgPSBzb3J0W2ldXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhpZGUgIT09IGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoaWRlLl9fc29ydGFibGUuZGlzcGxheSA9IGhpZGUuc3R5bGUuZGlzcGxheSB8fCAndW5zZXQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhpZGUuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZS5yZW1vdmVQZW5kaW5nLnB1c2goaGlkZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNhdmVQZW5kaW5nLmluZGV4T2YoaGlkZSkgPT09IC0xKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdtYXhpbXVtLXJlbW92ZS1wZW5kaW5nJywgaGlkZSwgc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgcGlja2VkIHVwIGJlY2F1c2UgaXQgd2FzIG1vdmVkIGJleW9uZCB0aGUgb3B0aW9ucy50aHJlc2hvbGRcclxuICogQGV2ZW50IFNvcnRhYmxlI3BpY2t1cFxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHNvcnRhYmxlIGlzIHJlb3JkZXJlZFxyXG4gKiBAZXZlbnQgU29ydGFibGUjb3JkZXJcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCB0aGF0IHdhcyByZW9yZGVyZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgcGxhY2VkXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyBhZGRlZCB0byB0aGlzIHNvcnRhYmxlXHJcbiAqIEBldmVudCBTb3J0YWJsZSNhZGRcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBhZGRlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyBhZGRlZFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgcmVtb3ZlZCBmcm9tIHRoaXMgc29ydGFibGVcclxuICogQGV2ZW50IFNvcnRhYmxlI3JlbW92ZVxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHJlbW92ZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgcmVtb3ZlZFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgcmVtb3ZlZCBmcm9tIGFsbCBzb3J0YWJsZXNcclxuICogQGV2ZW50IFNvcnRhYmxlI2RlbGV0ZVxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHJlbW92ZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgZHJhZ2dlZCBmcm9tXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBjb3B5IG9mIGFuIGVsZW1lbnQgaXMgZHJvcHBlZFxyXG4gKiBAZXZlbnQgU29ydGFibGUjY29weVxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHJlbW92ZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgZHJhZ2dlZCBmcm9tXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gdGhlIHNvcnRhYmxlIGlzIHVwZGF0ZWQgd2l0aCBhbiBhZGQsIHJlbW92ZSwgb3Igb3JkZXIgY2hhbmdlXHJcbiAqIEBldmVudCBTb3J0YWJsZSN1cGRhdGVcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBjaGFuZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdpdGggZWxlbWVudFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgcmVtb3ZlZCBiZWNhdXNlIG1heGltdW0gd2FzIHJlYWNoZWQgZm9yIHRoZSBzb3J0YWJsZVxyXG4gKiBAZXZlbnQgU29ydGFibGUjbWF4aW11bS1yZW1vdmVcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCByZW1vdmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIGRyYWdnZWQgZnJvbVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIG9yZGVyIHdhcyBjaGFuZ2VkIGJ1dCBlbGVtZW50IHdhcyBub3QgZHJvcHBlZCB5ZXRcclxuICogQGV2ZW50IFNvcnRhYmxlI29yZGVyLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gZWxlbWVudCBpcyBhZGRlZCBidXQgbm90IGRyb3BwZWQgeWV0XHJcbiAqIEBldmVudCBTb3J0YWJsZSNhZGQtcGVuZGluZ1xyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBlbGVtZW50IGlzIHJlbW92ZWQgYnV0IG5vdCBkcm9wcGVkIHlldFxyXG4gKiBAZXZlbnQgU29ydGFibGUjcmVtb3ZlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gZWxlbWVudCBpcyByZW1vdmVkIGFmdGVyIGJlaW5nIHRlbXBvcmFyaWx5IGFkZGVkXHJcbiAqIEBldmVudCBTb3J0YWJsZSNhZGQtcmVtb3ZlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyBhYm91dCB0byBiZSByZW1vdmVkIGZyb20gYWxsIHNvcnRhYmxlc1xyXG4gKiBAZXZlbnQgU29ydGFibGUjZGVsZXRlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCByZW1vdmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIGRyYWdnZWQgZnJvbVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgYWRkZWQsIHJlbW92ZWQsIG9yIHJlb3JkZXIgYnV0IGVsZW1lbnQgaGFzIG5vdCBkcm9wcGVkIHlldFxyXG4gKiBAZXZlbnQgU29ydGFibGUjdXBkYXRlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBjb3B5IG9mIGFuIGVsZW1lbnQgaXMgYWJvdXQgdG8gZHJvcFxyXG4gKiBAZXZlbnQgU29ydGFibGUjY29weS1wZW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgcmVtb3ZlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyBkcmFnZ2VkIGZyb21cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIGFib3V0IHRvIGJlIHJlbW92ZWQgYmVjYXVzZSBtYXhpbXVtIHdhcyByZWFjaGVkIGZvciB0aGUgc29ydGFibGVcclxuICogQGV2ZW50IFNvcnRhYmxlI21heGltdW0tcmVtb3ZlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCByZW1vdmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIGRyYWdnZWQgZnJvbVxyXG4gKi9cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU29ydGFibGUiXX0=