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
     * @fires order-pending
     * @fires add-pending
     * @fires remove-pending
     * @fires update-pending
     * @fires delete-pending
     * @fires copy-pending
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

                    // ensure every element has an id
                };if (!element.id) {
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
                    return this.element.children;
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
                    var _iteratorNormalCompletion8 = true;
                    var _didIteratorError8 = false;
                    var _iteratorError8 = undefined;

                    try {
                        for (var _iterator8 = children[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                            var _child3 = _step8.value;

                            var _childDragOrder2 = _child3.getAttribute(id);
                            _childDragOrder2 = sortable.options.orderIsNumber ? parseFloat(_childDragOrder2) : _childDragOrder2;
                            if (dragOrder < _childDragOrder2) {
                                _child3.parentNode.insertBefore(dragging, _child3);
                                found = true;
                                break;
                            }
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
                }
                if (!found) {
                    sortable.element.appendChild(dragging);
                }
                dragging.__sortable.current.emit('remove-pending', dragging, dragging.__sortable.current);
                sortable.emit('add-pending', dragging, sortable);
                if (dragging.__sortable.isCopy) {
                    sortable.emit('copy-pending', dragging, sortable);
                }
                dragging.__sortable.current = sortable;
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
            var _iteratorNormalCompletion9 = true;
            var _didIteratorError9 = false;
            var _iteratorError9 = undefined;

            try {
                for (var _iterator9 = elements[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                    var child = _step9.value;

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
            var _iteratorNormalCompletion10 = true;
            var _didIteratorError10 = false;
            var _iteratorError10 = undefined;

            try {
                for (var _iterator10 = elements[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                    var child = _step10.value;

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

            element.insertBefore(dragging, closest);
            if (index === sortable._getIndex(dragging)) {
                return true;
            }
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
                    dragging.__sortable.current.emit('remove-pending', dragging, dragging.__sortable.current);
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
                dragging.__sortable.current.emit('remove-pending', dragging, dragging.__sortable.current);
                dragging.__sortable.current = sortable;
            }
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
    }], [{
        key: 'create',


        /**
         * create multiple sortable elements
         * @param {HTMLElements[]} elements
         * @param {object} options - see constructor for options
         */
        value: function create(elements, options) {
            var results = [];
            var _iteratorNormalCompletion11 = true;
            var _didIteratorError11 = false;
            var _iteratorError11 = undefined;

            try {
                for (var _iterator11 = elements[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                    var element = _step11.value;

                    results.push(new Sortable(element, options));
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

module.exports = Sortable;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3J0YWJsZS5qcyJdLCJuYW1lcyI6WyJFdmVudHMiLCJyZXF1aXJlIiwiZGVmYXVsdHMiLCJ1dGlscyIsIlNvcnRhYmxlIiwiZWxlbWVudCIsIm9wdGlvbnMiLCJfYWRkVG9HbG9iYWxUcmFja2VyIiwiZWxlbWVudHMiLCJfZ2V0Q2hpbGRyZW4iLCJjaGlsZCIsImRyYWdDbGFzcyIsImNvbnRhaW5zQ2xhc3NOYW1lIiwiYXR0YWNoRWxlbWVudCIsImV2ZW50cyIsImRyYWdPdmVyIiwiZSIsIl9kcmFnT3ZlciIsImRyb3AiLCJfZHJvcCIsIm1vdXNlT3ZlciIsIl9tb3VzZUVudGVyIiwiYWRkRXZlbnRMaXN0ZW5lciIsImN1cnNvckhvdmVyIiwic3R5bGUiLCJjdXJzb3JEb3duIiwiX21vdXNlRG93biIsImN1cnJlbnRUYXJnZXQiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwicmVtb3ZlRWxlbWVudCIsImluZGV4Iiwic29ydCIsImNoaWxkcmVuIiwibGVuZ3RoIiwiYXBwZW5kQ2hpbGQiLCJpbnNlcnRCZWZvcmUiLCJpZCIsIm9yZGVySWQiLCJkcmFnT3JkZXIiLCJnZXRBdHRyaWJ1dGUiLCJvcmRlcklkSXNOdW1iZXIiLCJwYXJzZUZsb2F0IiwiZm91bmQiLCJyZXZlcnNlT3JkZXIiLCJpIiwiY2hpbGREcmFnT3JkZXIiLCJvcmRlcklzTnVtYmVyIiwicGFyZW50Tm9kZSIsIl9fc29ydGFibGUiLCJvcmlnaW5hbCIsInNvcnRhYmxlIiwiZHJhZ1N0YXJ0IiwiX2RyYWdTdGFydCIsIm5hbWUiLCJ0cmFja2VyIiwiY291bnRlciIsImNvcHkiLCJzZXRBdHRyaWJ1dGUiLCJkcmFnTW92ZSIsImRyYWdJbWFnZSIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImJvZHkiLCJfYm9keURyYWdPdmVyIiwiX2JvZHlEcm9wIiwibGlzdCIsInB1c2giLCJkYXRhVHJhbnNmZXIiLCJ0eXBlcyIsImdldEVsZW1lbnRCeUlkIiwiX2ZpbmRDbG9zZXN0IiwibGFzdCIsIk1hdGgiLCJhYnMiLCJ4IiwicGFnZVgiLCJ0aHJlc2hvbGQiLCJ5IiwicGFnZVkiLCJfdXBkYXRlRHJhZ2dpbmciLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsIl9wbGFjZUluTGlzdCIsImRyb3BFZmZlY3QiLCJfbm9Ecm9wIiwiY2FuY2VsIiwiX3NldEljb24iLCJvZmZMaXN0IiwiZGlzcGxheSIsImVtaXQiLCJfcmVwbGFjZUluTGlzdCIsIl9yZW1vdmVEcmFnZ2luZyIsInJlbW92ZSIsImRyYWdnaW5nIiwiY2xvbmVOb2RlIiwiZHJhZ1N0eWxlIiwicG9zIiwidG9HbG9iYWwiLCJsZWZ0IiwidG9wIiwib2Zmc2V0IiwidXNlSWNvbnMiLCJpbWFnZSIsIkltYWdlIiwic3JjIiwiaWNvbnMiLCJyZW9yZGVyIiwicG9zaXRpb24iLCJ0cmFuc2Zvcm0iLCJvZmZzZXRMZWZ0Iiwib2Zmc2V0V2lkdGgiLCJvZmZzZXRUb3AiLCJvZmZzZXRIZWlnaHQiLCJpY29uIiwidGFyZ2V0IiwiaXNDb3B5IiwiY2xlYXJEYXRhIiwic2V0RGF0YSIsInNldERyYWdJbWFnZSIsImN1cnJlbnQiLCJfZ2V0SW5kZXgiLCJtaW4iLCJJbmZpbml0eSIsInJlbGF0ZWQiLCJpbnNpZGUiLCJjYWxjdWxhdGUiLCJkaXN0YW5jZVRvQ2xvc2VzdENvcm5lciIsIl9wbGFjZUluU29ydGFibGVMaXN0IiwiX3BsYWNlSW5PcmRlcmVkTGlzdCIsImJhc2UiLCJzZWFyY2giLCJyZXN1bHRzIiwiaW5kZXhPZiIsImNsYXNzTmFtZSIsIl90cmF2ZXJzZUNoaWxkcmVuIiwib3JkZXIiLCJkZWVwU2VhcmNoIiwib3JkZXJDbGFzcyIsImN1cnNvciIsInhhMSIsInlhMSIsInhhMiIsInlhMiIsImxhcmdlc3QiLCJjbG9zZXN0IiwiaXNCZWZvcmUiLCJpbmRpY2F0b3IiLCJ4YjEiLCJ5YjEiLCJ4YjIiLCJ5YjIiLCJwZXJjZW50YWdlIiwibmV4dFNpYmxpbmciLCJkaXN0YW5jZSIsIm1lYXN1cmUiLCJfcGxhY2VC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LE1BQXZCLEVBQ0E7QUFDSXRCLGlDQUFTb0IsSUFBVCxDQUFjVCxHQUFkLEdBQW9CdEQsU0FBUzVDLE9BQVQsQ0FBaUJtRyxLQUFqQixDQUF1QmpELElBQTNDO0FBQ0gscUJBSEQsTUFLQTtBQUNJcUMsaUNBQVNvQixJQUFULENBQWNULEdBQWQsR0FBb0JuRyxRQUFRMkMsVUFBUixDQUFtQkMsUUFBbkIsS0FBZ0NDLFFBQWhDLEdBQTJDQSxTQUFTNUMsT0FBVCxDQUFpQm1HLEtBQWpCLENBQXVCQyxPQUFsRSxHQUE0RXhELFNBQVM1QyxPQUFULENBQWlCbUcsS0FBakIsQ0FBdUJvRCxJQUF2SDtBQUNIO0FBQ0o7QUFDSjtBQUNKOzs7OztBQWx6QkQ7Ozs7OytCQUtjckosUSxFQUFVRixPLEVBQ3hCO0FBQ0ksZ0JBQU02SCxVQUFVLEVBQWhCO0FBREo7QUFBQTtBQUFBOztBQUFBO0FBRUksdUNBQW9CM0gsUUFBcEIsd0lBQ0E7QUFBQSx3QkFEU0gsT0FDVDs7QUFDSThILDRCQUFRakUsSUFBUixDQUFhLElBQUk5RCxRQUFKLENBQWFDLE9BQWIsRUFBc0JDLE9BQXRCLENBQWI7QUFDSDtBQUxMO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBTUksbUJBQU82SCxPQUFQO0FBQ0g7Ozs0QkFqQkQ7QUFDSSxtQkFBT2pJLFFBQVA7QUFDSDs7OztFQXhHa0JGLE07O0FBKzVCdkI7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQThKLE9BQU9DLE9BQVAsR0FBaUIzSixRQUFqQiIsImZpbGUiOiJzb3J0YWJsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IEV2ZW50cyA9IHJlcXVpcmUoJ2V2ZW50ZW1pdHRlcjMnKVxyXG5cclxuY29uc3QgZGVmYXVsdHMgPSByZXF1aXJlKCcuL2RlZmF1bHRzJylcclxuY29uc3QgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcclxuXHJcbmNsYXNzIFNvcnRhYmxlIGV4dGVuZHMgRXZlbnRzXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIHNvcnRhYmxlIGxpc3RcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5uYW1lPXNvcnRhYmxlXSBkcmFnZ2luZyBpcyBhbGxvd2VkIGJldHdlZW4gU29ydGFibGVzIHdpdGggdGhlIHNhbWUgbmFtZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmRyYWdDbGFzc10gaWYgc2V0IHRoZW4gZHJhZyBvbmx5IGl0ZW1zIHdpdGggdGhpcyBjbGFzc05hbWUgdW5kZXIgZWxlbWVudDsgb3RoZXJ3aXNlIGRyYWcgYWxsIGNoaWxkcmVuXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMub3JkZXJDbGFzc10gdXNlIHRoaXMgY2xhc3MgdG8gaW5jbHVkZSBlbGVtZW50cyBpbiBvcmRlcmluZyBidXQgbm90IGRyYWdnaW5nOyBvdGhlcndpc2UgYWxsIGNoaWxkcmVuIGVsZW1lbnRzIGFyZSBpbmNsdWRlZCBpbiB3aGVuIHNvcnRpbmcgYW5kIG9yZGVyaW5nXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmRlZXBTZWFyY2hdIGlmIGRyYWdDbGFzcyBhbmQgZGVlcFNlYXJjaCB0aGVuIHNlYXJjaCBhbGwgZGVzY2VuZGVudHMgb2YgZWxlbWVudCBmb3IgZHJhZ0NsYXNzXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnNvcnQ9dHJ1ZV0gYWxsb3cgc29ydGluZyB3aXRoaW4gbGlzdFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5kcm9wPXRydWVdIGFsbG93IGRyb3AgZnJvbSByZWxhdGVkIHNvcnRhYmxlcyAoZG9lc24ndCBpbXBhY3QgcmVvcmRlcmluZyB0aGlzIHNvcnRhYmxlJ3MgY2hpbGRyZW4gdW50aWwgdGhlIGNoaWxkcmVuIGFyZSBtb3ZlZCB0byBhIGRpZmZlcmVuIHNvcnRhYmxlKVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5jb3B5PWZhbHNlXSBjcmVhdGUgY29weSB3aGVuIGRyYWdnaW5nIGFuIGl0ZW0gKHRoaXMgZGlzYWJsZXMgc29ydD10cnVlIGZvciB0aGlzIHNvcnRhYmxlKVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLm9yZGVySWQ9ZGF0YS1vcmRlcl0gZm9yIG9yZGVyZWQgbGlzdHMsIHVzZSB0aGlzIGRhdGEgaWQgdG8gZmlndXJlIG91dCBzb3J0IG9yZGVyXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLm9yZGVySWRJc051bWJlcj10cnVlXSB1c2UgcGFyc2VJbnQgb24gb3B0aW9ucy5zb3J0SWQgdG8gcHJvcGVybHkgc29ydCBudW1iZXJzXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMucmV2ZXJzZU9yZGVyXSByZXZlcnNlIHNvcnQgdGhlIG9yZGVySWRcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5vZmZMaXN0PWNsb3Nlc3RdIGhvdyB0byBoYW5kbGUgd2hlbiBhbiBlbGVtZW50IGlzIGRyb3BwZWQgb3V0c2lkZSBhIHNvcnRhYmxlOiBjbG9zZXN0PWRyb3AgaW4gY2xvc2VzdCBzb3J0YWJsZTsgY2FuY2VsPXJldHVybiB0byBzdGFydGluZyBzb3J0YWJsZTsgZGVsZXRlPXJlbW92ZSBmcm9tIGFsbCBzb3J0YWJsZXNcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5jdXJzb3JIb3Zlcj1ncmFiIC13ZWJraXQtZ3JhYiBwb2ludGVyXSB1c2UgdGhpcyBjdXJzb3IgbGlzdCB0byBzZXQgY3Vyc29yIHdoZW4gaG92ZXJpbmcgb3ZlciBhIHNvcnRhYmxlIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5jdXJzb3JEb3duPWdyYWJiaW5nIC13ZWJraXQtZ3JhYmJpbmcgcG9pbnRlcl0gdXNlIHRoaXMgY3Vyc29yIGxpc3QgdG8gc2V0IGN1cnNvciB3aGVuIG1vdXNlZG93bi90b3VjaGRvd24gb3ZlciBhIHNvcnRhYmxlIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMudXNlSWNvbnM9dHJ1ZV0gc2hvdyBpY29ucyB3aGVuIGRyYWdnaW5nXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnMuaWNvbnNdIGRlZmF1bHQgc2V0IG9mIGljb25zXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuaWNvbnMucmVvcmRlcl1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5pY29ucy5tb3ZlXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmljb25zLmNvcHldXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuaWNvbnMuZGVsZXRlXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmN1c3RvbUljb25dIHNvdXJjZSBvZiBjdXN0b20gaW1hZ2Ugd2hlbiBvdmVyIHRoaXMgc29ydGFibGVcclxuICAgICAqIEBmaXJlcyBwaWNrdXBcclxuICAgICAqIEBmaXJlcyBvcmRlclxyXG4gICAgICogQGZpcmVzIGFkZFxyXG4gICAgICogQGZpcmVzIHJlbW92ZVxyXG4gICAgICogQGZpcmVzIHVwZGF0ZVxyXG4gICAgICogQGZpcmVzIGRlbGV0ZVxyXG4gICAgICogQGZpcmVzIGNvcHlcclxuICAgICAqIEBmaXJlcyBvcmRlci1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgYWRkLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyByZW1vdmUtcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIHVwZGF0ZS1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgZGVsZXRlLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyBjb3B5LXBlbmRpbmdcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBzdXBlcigpXHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gdXRpbHMub3B0aW9ucyhvcHRpb25zLCBkZWZhdWx0cylcclxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50XHJcbiAgICAgICAgdGhpcy5fYWRkVG9HbG9iYWxUcmFja2VyKClcclxuICAgICAgICBjb25zdCBlbGVtZW50cyA9IHRoaXMuX2dldENoaWxkcmVuKClcclxuICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBlbGVtZW50cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5vcHRpb25zLmRyYWdDbGFzcyB8fCB1dGlscy5jb250YWluc0NsYXNzTmFtZShjaGlsZCwgdGhpcy5vcHRpb25zLmRyYWdDbGFzcykpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYXR0YWNoRWxlbWVudChjaGlsZClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmV2ZW50cyA9IHtcclxuICAgICAgICAgICAgZHJhZ092ZXI6IChlKSA9PiB0aGlzLl9kcmFnT3ZlcihlKSxcclxuICAgICAgICAgICAgZHJvcDogKGUpID0+IHRoaXMuX2Ryb3AoZSksXHJcbiAgICAgICAgICAgIG1vdXNlT3ZlcjogKGUpID0+IHRoaXMuX21vdXNlRW50ZXIoZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIHRoaXMuZXZlbnRzLmRyYWdPdmVyKVxyXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIHRoaXMuZXZlbnRzLmRyb3ApXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIHRoaXMuX2dldENoaWxkcmVuKCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHV0aWxzLnN0eWxlKGNoaWxkLCAnY3Vyc29yJywgdGhpcy5vcHRpb25zLmN1cnNvckhvdmVyKVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jdXJzb3JEb3duKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChlKSA9PiB0aGlzLl9tb3VzZURvd24oZSkpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgX21vdXNlRG93bihlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY3Vyc29ySG92ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB1dGlscy5zdHlsZShlLmN1cnJlbnRUYXJnZXQsICdjdXJzb3InLCB0aGlzLm9wdGlvbnMuY3Vyc29yRG93bilcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZW1vdmVzIGFsbCBldmVudCBoYW5kbGVycyBmcm9tIHRoaXMuZWxlbWVudCBhbmQgY2hpbGRyZW5cclxuICAgICAqL1xyXG4gICAgZGVzdHJveSgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgdGhpcy5ldmVudHMuZHJhZ092ZXIpXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLmV2ZW50cy5kcm9wKVxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnRzID0gdGhpcy5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGVsZW1lbnRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVFbGVtZW50KGNoaWxkKVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB0b2RvOiByZW1vdmUgU29ydGFibGUudHJhY2tlciBhbmQgcmVsYXRlZCBldmVudCBoYW5kbGVycyBpZiBubyBtb3JlIHNvcnRhYmxlc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdGhlIGdsb2JhbCBkZWZhdWx0cyBmb3IgbmV3IFNvcnRhYmxlIG9iamVjdHNcclxuICAgICAqIEB0eXBlIHtEZWZhdWx0T3B0aW9uc31cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldCBkZWZhdWx0cygpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjcmVhdGUgbXVsdGlwbGUgc29ydGFibGUgZWxlbWVudHNcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnRzW119IGVsZW1lbnRzXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyAtIHNlZSBjb25zdHJ1Y3RvciBmb3Igb3B0aW9uc1xyXG4gICAgICovXHJcbiAgICBzdGF0aWMgY3JlYXRlKGVsZW1lbnRzLCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXVxyXG4gICAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgZWxlbWVudHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXN1bHRzLnB1c2gobmV3IFNvcnRhYmxlKGVsZW1lbnQsIG9wdGlvbnMpKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0c1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYWRkIGFuIGVsZW1lbnQgYXMgYSBjaGlsZCBvZiB0aGUgc29ydGFibGUgZWxlbWVudDsgY2FuIGFsc28gYmUgdXNlZCB0byBzd2FwIGJldHdlZW4gc29ydGFibGVzXHJcbiAgICAgKiBOT1RFOiB0aGlzIHdpbGwgbm90IHdvcmsgd2l0aCBkZWVwLXR5cGUgZWxlbWVudHM7IHVzZSBhdHRhY2hFbGVtZW50IGluc3RlYWRcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleFxyXG4gICAgICovXHJcbiAgICBhZGQoZWxlbWVudCwgaW5kZXgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5hdHRhY2hFbGVtZW50KGVsZW1lbnQpXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zb3J0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBpbmRleCA9PT0gJ3VuZGVmaW5lZCcgfHwgaW5kZXggPj0gdGhpcy5lbGVtZW50LmNoaWxkcmVuLmxlbmd0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuaW5zZXJ0QmVmb3JlKGVsZW1lbnQsIHRoaXMuZWxlbWVudC5jaGlsZHJlbltpbmRleCArIDFdKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gdGhpcy5vcHRpb25zLm9yZGVySWRcclxuICAgICAgICAgICAgbGV0IGRyYWdPcmRlciA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICBkcmFnT3JkZXIgPSB0aGlzLm9wdGlvbnMub3JkZXJJZElzTnVtYmVyID8gcGFyc2VGbG9hdChkcmFnT3JkZXIpIDogZHJhZ09yZGVyXHJcbiAgICAgICAgICAgIGxldCBmb3VuZFxyXG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuX2dldENoaWxkcmVuKHRydWUpXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmV2ZXJzZU9yZGVyKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBjaGlsZHJlbltpXVxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZERyYWdPcmRlciA9IGNoaWxkLmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZERyYWdPcmRlciA9IHRoaXMub3B0aW9ucy5vcmRlcklzTnVtYmVyID8gcGFyc2VGbG9hdChjaGlsZERyYWdPcmRlcikgOiBjaGlsZERyYWdPcmRlclxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnT3JkZXIgPiBjaGlsZERyYWdPcmRlcilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGVsZW1lbnQsIGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBjaGlsZHJlbilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGREcmFnT3JkZXIgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGREcmFnT3JkZXIgPSB0aGlzLm9wdGlvbnMub3JkZXJJc051bWJlciA/IHBhcnNlRmxvYXQoY2hpbGREcmFnT3JkZXIpIDogY2hpbGREcmFnT3JkZXJcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ09yZGVyIDwgY2hpbGREcmFnT3JkZXIpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShlbGVtZW50LCBjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghZm91bmQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChlbGVtZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYXR0YWNoZXMgYW4gSFRNTCBlbGVtZW50IHRvIHRoZSBzb3J0YWJsZTsgY2FuIGFsc28gYmUgdXNlZCB0byBzd2FwIGJldHdlZW4gc29ydGFibGVzXHJcbiAgICAgKiBOT1RFOiB5b3UgbmVlZCB0byBtYW51YWxseSBpbnNlcnQgdGhlIGVsZW1lbnQgaW50byB0aGlzLmVsZW1lbnQgKHRoaXMgaXMgdXNlZnVsIHdoZW4geW91IGhhdmUgYSBkZWVwIHN0cnVjdHVyZSlcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqL1xyXG4gICAgYXR0YWNoRWxlbWVudChlbGVtZW50KVxyXG4gICAge1xyXG4gICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgPSB0aGlzXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZSA9IHtcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlOiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgb3JpZ2luYWw6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBkcmFnU3RhcnQ6IChlKSA9PiB0aGlzLl9kcmFnU3RhcnQoZSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gZW5zdXJlIGV2ZXJ5IGVsZW1lbnQgaGFzIGFuIGlkXHJcbiAgICAgICAgICAgIGlmICghZWxlbWVudC5pZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5pZCA9ICdfX3NvcnRhYmxlLScgKyB0aGlzLm9wdGlvbnMubmFtZSArICctJyArIFNvcnRhYmxlLnRyYWNrZXJbdGhpcy5vcHRpb25zLm5hbWVdLmNvdW50ZXJcclxuICAgICAgICAgICAgICAgIFNvcnRhYmxlLnRyYWNrZXJbdGhpcy5vcHRpb25zLm5hbWVdLmNvdW50ZXIrK1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY29weSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmNvcHkgPSAwXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdkcmFnc3RhcnQnLCBlbGVtZW50Ll9fc29ydGFibGUuZHJhZ1N0YXJ0KVxyXG4gICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnZHJhZ2dhYmxlJywgdHJ1ZSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZW1vdmVzIGFsbCBldmVudHMgZnJvbSBhbiBIVE1MIGVsZW1lbnRcclxuICAgICAqIE5PVEU6IGRvZXMgbm90IHJlbW92ZSB0aGUgZWxlbWVudCBmcm9tIGl0cyBwYXJlbnRcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqL1xyXG4gICAgcmVtb3ZlRWxlbWVudChlbGVtZW50KVxyXG4gICAge1xyXG4gICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZWxlbWVudC5kcmFnTW92ZSlcclxuICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBlbGVtZW50LmRyYWdNb3ZlKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYWRkIHNvcnRhYmxlIHRvIGdsb2JhbCBsaXN0IHRoYXQgdHJhY2tzIGFsbCBzb3J0YWJsZXNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9hZGRUb0dsb2JhbFRyYWNrZXIoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICghU29ydGFibGUudHJhY2tlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFNvcnRhYmxlLmRyYWdJbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgICAgICAgIFNvcnRhYmxlLmRyYWdJbWFnZS5pZCA9ICdzb3J0YWJsZS1kcmFnSW1hZ2UnXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoU29ydGFibGUuZHJhZ0ltYWdlKVxyXG4gICAgICAgICAgICBTb3J0YWJsZS50cmFja2VyID0ge31cclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIChlKSA9PiB0aGlzLl9ib2R5RHJhZ092ZXIoZSkpXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIChlKSA9PiB0aGlzLl9ib2R5RHJvcChlKSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKFNvcnRhYmxlLnRyYWNrZXJbdGhpcy5vcHRpb25zLm5hbWVdKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgU29ydGFibGUudHJhY2tlclt0aGlzLm9wdGlvbnMubmFtZV0ubGlzdC5wdXNoKHRoaXMpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFNvcnRhYmxlLnRyYWNrZXJbdGhpcy5vcHRpb25zLm5hbWVdID0geyBsaXN0OiBbdGhpc10sIGNvdW50ZXI6IDAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGRlZmF1bHQgZHJhZyBvdmVyIGZvciB0aGUgYm9keVxyXG4gICAgICogQHBhcmFtIHtEcmFnRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9ib2R5RHJhZ092ZXIoZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBuYW1lID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMF1cclxuICAgICAgICBpZiAobmFtZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMV1cclxuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxyXG4gICAgICAgICAgICBjb25zdCBzb3J0YWJsZSA9IHRoaXMuX2ZpbmRDbG9zZXN0KGUsIFNvcnRhYmxlLnRyYWNrZXJbbmFtZV0ubGlzdCwgZWxlbWVudClcclxuICAgICAgICAgICAgaWYgKHNvcnRhYmxlKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc29ydGFibGUubGFzdCAmJiBNYXRoLmFicyhzb3J0YWJsZS5sYXN0LnggLSBlLnBhZ2VYKSA8IHNvcnRhYmxlLm9wdGlvbnMudGhyZXNob2xkICYmIE1hdGguYWJzKHNvcnRhYmxlLmxhc3QueSAtIGUucGFnZVkpIDwgc29ydGFibGUub3B0aW9ucy50aHJlc2hvbGQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc29ydGFibGUuX3VwZGF0ZURyYWdnaW5nKGUsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgc29ydGFibGUubGFzdCA9IHsgeDogZS5wYWdlWCwgeTogZS5wYWdlWSB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wbGFjZUluTGlzdChzb3J0YWJsZSwgZS5wYWdlWCwgZS5wYWdlWSwgZWxlbWVudClcclxuICAgICAgICAgICAgICAgIGUuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSAnbW92ZSdcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZURyYWdnaW5nKGUsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9ub0Ryb3AoZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgbm8gZHJvcFxyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBlXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjYW5jZWxdIGZvcmNlIGNhbmNlbCAoZm9yIG9wdGlvbnMuY29weSlcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9ub0Ryb3AoZSwgY2FuY2VsKVxyXG4gICAge1xyXG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSAnbW92ZSdcclxuICAgICAgICBjb25zdCBpZCA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzFdXHJcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxyXG4gICAgICAgIGlmIChlbGVtZW50KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlRHJhZ2dpbmcoZSwgZWxlbWVudClcclxuICAgICAgICAgICAgdGhpcy5fc2V0SWNvbihlbGVtZW50LCBudWxsLCBjYW5jZWwpXHJcbiAgICAgICAgICAgIGlmICghY2FuY2VsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsLm9wdGlvbnMub2ZmTGlzdCA9PT0gJ2RlbGV0ZScpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5ID0gZWxlbWVudC5zdHlsZS5kaXNwbGF5IHx8ICd1bnNldCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbC5lbWl0KCdkZWxldGUtcGVuZGluZycsIGVsZW1lbnQsIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbClcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmICghZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsLm9wdGlvbnMuY29weSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZXBsYWNlSW5MaXN0KGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCwgZWxlbWVudClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGRlZmF1bHQgZHJvcCBmb3IgdGhlIGJvZHlcclxuICAgICAqIEBwYXJhbSB7RHJhZ0V2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfYm9keURyb3AoZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBuYW1lID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMF1cclxuICAgICAgICBpZiAobmFtZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMV1cclxuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxyXG4gICAgICAgICAgICBjb25zdCBzb3J0YWJsZSA9IHRoaXMuX2ZpbmRDbG9zZXN0KGUsIFNvcnRhYmxlLnRyYWNrZXJbbmFtZV0ubGlzdCwgZWxlbWVudClcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlbW92ZURyYWdnaW5nKGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmUoKVxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkgPSBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsLmVtaXQoJ2RlbGV0ZScsIGVsZW1lbnQsIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbClcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgPSBudWxsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzdGFydCBkcmFnXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kcmFnU3RhcnQoZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBzb3J0YWJsZSA9IGUuY3VycmVudFRhcmdldC5fX3NvcnRhYmxlLm9yaWdpbmFsXHJcbiAgICAgICAgY29uc3QgZHJhZ2dpbmcgPSBlLmN1cnJlbnRUYXJnZXQuY2xvbmVOb2RlKHRydWUpXHJcbiAgICAgICAgZm9yIChsZXQgc3R5bGUgaW4gc29ydGFibGUub3B0aW9ucy5kcmFnU3R5bGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5zdHlsZVtzdHlsZV0gPSBzb3J0YWJsZS5vcHRpb25zLmRyYWdTdHlsZVtzdHlsZV1cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcG9zID0gdXRpbHMudG9HbG9iYWwoZS5jdXJyZW50VGFyZ2V0KVxyXG4gICAgICAgIGRyYWdnaW5nLnN0eWxlLmxlZnQgPSBwb3MueCArICdweCdcclxuICAgICAgICBkcmFnZ2luZy5zdHlsZS50b3AgPSBwb3MueSArICdweCdcclxuICAgICAgICBjb25zdCBvZmZzZXQgPSB7IHg6IHBvcy54IC0gZS5wYWdlWCwgeTogcG9zLnkgLSBlLnBhZ2VZIH1cclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRyYWdnaW5nKVxyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLnVzZUljb25zKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKVxyXG4gICAgICAgICAgICBpbWFnZS5zcmMgPSBzb3J0YWJsZS5vcHRpb25zLmljb25zLnJlb3JkZXJcclxuICAgICAgICAgICAgaW1hZ2Uuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoLTUwJSwgLTUwJSknXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLmxlZnQgPSBkcmFnZ2luZy5vZmZzZXRMZWZ0ICsgZHJhZ2dpbmcub2Zmc2V0V2lkdGggKyAncHgnXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLnRvcCA9IGRyYWdnaW5nLm9mZnNldFRvcCArIGRyYWdnaW5nLm9mZnNldEhlaWdodCArICdweCdcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpbWFnZSlcclxuICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbiA9IGltYWdlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLmN1cnNvckhvdmVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdXRpbHMuc3R5bGUoZS5jdXJyZW50VGFyZ2V0LCAnY3Vyc29yJywgc29ydGFibGUub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHRhcmdldCA9IGUuY3VycmVudFRhcmdldFxyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLmNvcHkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0YXJnZXQgPSBlLmN1cnJlbnRUYXJnZXQuY2xvbmVOb2RlKHRydWUpXHJcbiAgICAgICAgICAgIHRhcmdldC5pZCA9IGUuY3VycmVudFRhcmdldC5pZCArICctY29weS0nICsgZS5jdXJyZW50VGFyZ2V0Ll9fc29ydGFibGUuY29weVxyXG4gICAgICAgICAgICBlLmN1cnJlbnRUYXJnZXQuX19zb3J0YWJsZS5jb3B5KytcclxuICAgICAgICAgICAgc29ydGFibGUuYXR0YWNoRWxlbWVudCh0YXJnZXQpXHJcbiAgICAgICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLmlzQ29weSA9IHRydWVcclxuICAgICAgICAgICAgdGFyZ2V0Ll9fc29ydGFibGUub3JpZ2luYWwgPSB0aGlzXHJcbiAgICAgICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLmRpc3BsYXkgPSB0YXJnZXQuc3R5bGUuZGlzcGxheSB8fCAndW5zZXQnXHJcbiAgICAgICAgICAgIHRhcmdldC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGFyZ2V0KVxyXG4gICAgICAgIH1cclxuICAgICAgICBlLmRhdGFUcmFuc2Zlci5jbGVhckRhdGEoKVxyXG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLnNldERhdGEoc29ydGFibGUub3B0aW9ucy5uYW1lLCBzb3J0YWJsZS5vcHRpb25zLm5hbWUpXHJcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuc2V0RGF0YSh0YXJnZXQuaWQsIHRhcmdldC5pZClcclxuICAgICAgICBlLmRhdGFUcmFuc2Zlci5zZXREcmFnSW1hZ2UoU29ydGFibGUuZHJhZ0ltYWdlLCAwLCAwKVxyXG4gICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLmN1cnJlbnQgPSB0aGlzXHJcbiAgICAgICAgdGFyZ2V0Ll9fc29ydGFibGUuaW5kZXggPSBzb3J0YWJsZS5vcHRpb25zLmNvcHkgPyAtMSA6IHNvcnRhYmxlLl9nZXRJbmRleCh0YXJnZXQpXHJcbiAgICAgICAgdGFyZ2V0Ll9fc29ydGFibGUuZHJhZ2dpbmcgPSBkcmFnZ2luZ1xyXG4gICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLm9mZnNldCA9IG9mZnNldFxyXG4gICAgfVxyXG5cclxuICAgIF9kcmFnT3ZlcihlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHNvcnRhYmxlID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMF1cclxuICAgICAgICBpZiAoc29ydGFibGUgJiYgc29ydGFibGUgPT09IHRoaXMub3B0aW9ucy5uYW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1sxXVxyXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmxhc3QgJiYgTWF0aC5hYnModGhpcy5sYXN0LnggLSBlLnBhZ2VYKSA8IHRoaXMub3B0aW9ucy50aHJlc2hvbGQgJiYgTWF0aC5hYnModGhpcy5sYXN0LnkgLSBlLnBhZ2VZKSA8IHRoaXMub3B0aW9ucy50aHJlc2hvbGQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZURyYWdnaW5nKGUsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMubGFzdCA9IHsgeDogZS5wYWdlWCwgeTogZS5wYWdlWSB9XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUuaXNDb3B5ICYmIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9PT0gdGhpcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbm9Ecm9wKGUsIHRydWUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5vcHRpb25zLmRyb3AgfHwgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsID09PSB0aGlzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wbGFjZUluTGlzdCh0aGlzLCBlLnBhZ2VYLCBlLnBhZ2VZLCBlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgZS5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9IGVsZW1lbnQuX19zb3J0YWJsZS5pc0NvcHkgPyAnY29weScgOiAnbW92ZSdcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZURyYWdnaW5nKGUsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9ub0Ryb3AoZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfdXBkYXRlRHJhZ2dpbmcoZSwgZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBkcmFnZ2luZyA9IGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnZ2luZ1xyXG4gICAgICAgIGNvbnN0IG9mZnNldCA9IGVsZW1lbnQuX19zb3J0YWJsZS5vZmZzZXRcclxuICAgICAgICBpZiAoZHJhZ2dpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5zdHlsZS5sZWZ0ID0gZS5wYWdlWCArIG9mZnNldC54ICsgJ3B4J1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5zdHlsZS50b3AgPSBlLnBhZ2VZICsgb2Zmc2V0LnkgKyAncHgnXHJcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZy5pY29uKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnN0eWxlLmxlZnQgPSBkcmFnZ2luZy5vZmZzZXRMZWZ0ICsgZHJhZ2dpbmcub2Zmc2V0V2lkdGggKyAncHgnXHJcbiAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnN0eWxlLnRvcCA9IGRyYWdnaW5nLm9mZnNldFRvcCArIGRyYWdnaW5nLm9mZnNldEhlaWdodCArICdweCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfcmVtb3ZlRHJhZ2dpbmcoZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBkcmFnZ2luZyA9IGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnZ2luZ1xyXG4gICAgICAgIGRyYWdnaW5nLnJlbW92ZSgpXHJcbiAgICAgICAgaWYgKGRyYWdnaW5nLmljb24pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5pY29uLnJlbW92ZSgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnZ2luZyA9IG51bGxcclxuICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuaXNDb3B5ID0gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBfZHJvcChlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IG5hbWUgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1swXVxyXG4gICAgICAgIGlmIChuYW1lICYmIG5hbWUgPT09IHRoaXMub3B0aW9ucy5uYW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1sxXVxyXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgIT09IHRoaXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbC5lbWl0KCdyZW1vdmUnLCBlbGVtZW50LCBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2FkZCcsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgPSB0aGlzXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNvcnQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdvcmRlcicsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLmlzQ29weSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2NvcHknLCBlbGVtZW50LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KCd1cGRhdGUnLCBlbGVtZW50LCB0aGlzKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5pbmRleCAhPT0gdGhpcy5fZ2V0SW5kZXgoZS5jdXJyZW50VGFyZ2V0KSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ29yZGVyJywgZWxlbWVudCwgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ3VwZGF0ZScsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlRHJhZ2dpbmcoZWxlbWVudClcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmaW5kIGNsb3Nlc3QgU29ydGFibGUgdG8gc2NyZWVuIGxvY2F0aW9uXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGVbXX0gbGlzdCBvZiByZWxhdGVkIFNvcnRhYmxlc1xyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2ZpbmRDbG9zZXN0KGUsIGxpc3QsIGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IG1pbiA9IEluZmluaXR5LCBmb3VuZFxyXG4gICAgICAgIGZvciAobGV0IHJlbGF0ZWQgb2YgbGlzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICgoIXJlbGF0ZWQub3B0aW9ucy5kcm9wICYmIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCAhPT0gcmVsYXRlZCkgfHxcclxuICAgICAgICAgICAgICAgIChlbGVtZW50Ll9fc29ydGFibGUuaXNDb3B5ICYmIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9PT0gcmVsYXRlZCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHV0aWxzLmluc2lkZShlLnBhZ2VYLCBlLnBhZ2VZLCByZWxhdGVkLmVsZW1lbnQpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVsYXRlZFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHJlbGF0ZWQub3B0aW9ucy5vZmZMaXN0ID09PSAnY2xvc2VzdCcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNhbGN1bGF0ZSA9IHV0aWxzLmRpc3RhbmNlVG9DbG9zZXN0Q29ybmVyKGUucGFnZVgsIGUucGFnZVksIHJlbGF0ZWQuZWxlbWVudClcclxuICAgICAgICAgICAgICAgIGlmIChjYWxjdWxhdGUgPCBtaW4pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWluID0gY2FsY3VsYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgZm91bmQgPSByZWxhdGVkXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZvdW5kXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwbGFjZSBpbmRpY2F0b3IgaW4gdGhlIHNvcnRhYmxlIGxpc3QgYWNjb3JkaW5nIHRvIG9wdGlvbnMuc29ydFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BsYWNlSW5MaXN0KHNvcnRhYmxlLCB4LCB5LCBlbGVtZW50KVxyXG4gICAge1xyXG4gICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5ID09PSAndW5zZXQnID8gJycgOiBlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheVxyXG4gICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheSA9IG51bGxcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zb3J0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fcGxhY2VJblNvcnRhYmxlTGlzdChzb3J0YWJsZSwgeCwgeSwgZWxlbWVudClcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fcGxhY2VJbk9yZGVyZWRMaXN0KHNvcnRhYmxlLCBlbGVtZW50KVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9zZXRJY29uKGVsZW1lbnQsIHNvcnRhYmxlKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVwbGFjZSBpdGVtIGluIGxpc3QgYXQgb3JpZ2luYWwgaW5kZXggcG9zaXRpb25cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9yZXBsYWNlSW5MaXN0KHNvcnRhYmxlLCBlbGVtZW50KVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gc29ydGFibGUuX2dldENoaWxkcmVuKClcclxuICAgICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaW5kZXggPSBlbGVtZW50Ll9fc29ydGFibGUuaW5kZXhcclxuICAgICAgICAgICAgaWYgKGluZGV4IDwgY2hpbGRyZW4ubGVuZ3RoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlbltpbmRleF0ucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZWxlbWVudCwgY2hpbGRyZW5baW5kZXhdKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2hpbGRyZW5bMF0uYXBwZW5kQ2hpbGQoZWxlbWVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbGVtZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIF9nZXRJbmRleChjaGlsZClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuX2dldENoaWxkcmVuKClcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGNoaWxkcmVuW2ldID09PSBjaGlsZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfdHJhdmVyc2VDaGlsZHJlbihiYXNlLCBzZWFyY2gsIHJlc3VsdHMpXHJcbiAgICB7XHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgYmFzZS5jaGlsZHJlbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChzZWFyY2gubGVuZ3RoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2VhcmNoLmluZGV4T2YoY2hpbGQuY2xhc3NOYW1lKSAhPT0gLTEpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGNoaWxkKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3RyYXZlcnNlQ2hpbGRyZW4oY2hpbGQsIHNlYXJjaCwgcmVzdWx0cylcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmaW5kIGNoaWxkcmVuIGluIGRpdlxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29yZGVyXSBzZWFyY2ggZm9yIGRyYWdPcmRlciBhcyB3ZWxsXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZ2V0Q2hpbGRyZW4ob3JkZXIpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kZWVwU2VhcmNoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IHNlYXJjaCA9IFtdXHJcbiAgICAgICAgICAgIGlmIChvcmRlciAmJiB0aGlzLm9wdGlvbnMub3JkZXJDbGFzcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoLnB1c2godGhpcy5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChvcmRlciAmJiB0aGlzLm9wdGlvbnMub3JkZXJDbGFzcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2gucHVzaCh0aGlzLm9wdGlvbnMub3JkZXJDbGFzcylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICghb3JkZXIgJiYgdGhpcy5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc2VhcmNoLnB1c2godGhpcy5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCByZXN1bHRzID0gW11cclxuICAgICAgICAgICAgdGhpcy5fdHJhdmVyc2VDaGlsZHJlbih0aGlzLmVsZW1lbnQsIHNlYXJjaCwgcmVzdWx0cylcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHNcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxldCBsaXN0ID0gW11cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIHRoaXMuZWxlbWVudC5jaGlsZHJlbilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodXRpbHMuY29udGFpbnNDbGFzc05hbWUoY2hpbGQsIHRoaXMub3B0aW9ucy5kcmFnQ2xhc3MpIHx8IChvcmRlciAmJiAhdGhpcy5vcHRpb25zLm9yZGVyQ2xhc3MgfHwgKG9yZGVyICYmIHRoaXMub3B0aW9ucy5vcmRlckNsYXNzICYmIHV0aWxzLmNvbnRhaW5zQ2xhc3NOYW1lKGNoaWxkLCB0aGlzLm9wdGlvbnMub3JkZXJDbGFzcykpKSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpc3QucHVzaChjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbGlzdFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5jaGlsZHJlblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGxhY2UgaW5kaWNhdG9yIGluIGFuIG9yZGVyZWQgbGlzdFxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGxhY2VJbk9yZGVyZWRMaXN0KHNvcnRhYmxlLCBkcmFnZ2luZylcclxuICAgIHtcclxuICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50ICE9PSBzb3J0YWJsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gc29ydGFibGUub3B0aW9ucy5vcmRlcklkXHJcbiAgICAgICAgICAgIGxldCBkcmFnT3JkZXIgPSBkcmFnZ2luZy5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgICAgIGRyYWdPcmRlciA9IHNvcnRhYmxlLm9wdGlvbnMub3JkZXJJZElzTnVtYmVyID8gcGFyc2VGbG9hdChkcmFnT3JkZXIpIDogZHJhZ09yZGVyXHJcbiAgICAgICAgICAgIGxldCBmb3VuZFxyXG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHNvcnRhYmxlLl9nZXRDaGlsZHJlbih0cnVlKVxyXG4gICAgICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5yZXZlcnNlT3JkZXIpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSBjaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZCA9IGNoaWxkcmVuW2ldXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkRHJhZ09yZGVyID0gY2hpbGQuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkRHJhZ09yZGVyID0gc29ydGFibGUub3B0aW9ucy5vcmRlcklzTnVtYmVyID8gcGFyc2VGbG9hdChjaGlsZERyYWdPcmRlcikgOiBjaGlsZERyYWdPcmRlclxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnT3JkZXIgPiBjaGlsZERyYWdPcmRlcilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGRyYWdnaW5nLCBjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgY2hpbGRyZW4pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkRHJhZ09yZGVyID0gY2hpbGQuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkRHJhZ09yZGVyID0gc29ydGFibGUub3B0aW9ucy5vcmRlcklzTnVtYmVyID8gcGFyc2VGbG9hdChjaGlsZERyYWdPcmRlcikgOiBjaGlsZERyYWdPcmRlclxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnT3JkZXIgPCBjaGlsZERyYWdPcmRlcilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGRyYWdnaW5nLCBjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghZm91bmQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZHJhZ2dpbmcpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50LmVtaXQoJ3JlbW92ZS1wZW5kaW5nJywgZHJhZ2dpbmcsIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnYWRkLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmlzQ29weSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnY29weS1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudCA9IHNvcnRhYmxlXHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ3VwZGF0ZS1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNlYXJjaCBmb3Igd2hlcmUgdG8gcGxhY2UgdXNpbmcgcGVyY2VudGFnZVxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSAwID0gbm90IGZvdW5kOyAxID0gbm90aGluZyB0byBkbzsgMiA9IG1vdmVkXHJcbiAgICAgKi9cclxuICAgIF9wbGFjZUJ5UGVyY2VudGFnZShzb3J0YWJsZSwgZHJhZ2dpbmcpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgY3Vyc29yID0gZHJhZ2dpbmcuX19zb3J0YWJsZS5kcmFnZ2luZ1xyXG4gICAgICAgIGNvbnN0IHhhMSA9IGN1cnNvci5vZmZzZXRMZWZ0XHJcbiAgICAgICAgY29uc3QgeWExID0gY3Vyc29yLm9mZnNldFRvcFxyXG4gICAgICAgIGNvbnN0IHhhMiA9IGN1cnNvci5vZmZzZXRMZWZ0ICsgY3Vyc29yLm9mZnNldFdpZHRoXHJcbiAgICAgICAgY29uc3QgeWEyID0gY3Vyc29yLm9mZnNldFRvcCArIGN1cnNvci5vZmZzZXRIZWlnaHRcclxuICAgICAgICBsZXQgbGFyZ2VzdCA9IDAsIGNsb3Nlc3QsIGlzQmVmb3JlLCBpbmRpY2F0b3JcclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gc29ydGFibGUuZWxlbWVudFxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnRzID0gc29ydGFibGUuX2dldENoaWxkcmVuKHRydWUpXHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgZWxlbWVudHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoY2hpbGQgPT09IGRyYWdnaW5nKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbmRpY2F0b3IgPSB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgcG9zID0gdXRpbHMudG9HbG9iYWwoY2hpbGQpXHJcbiAgICAgICAgICAgIGNvbnN0IHhiMSA9IHBvcy54XHJcbiAgICAgICAgICAgIGNvbnN0IHliMSA9IHBvcy55XHJcbiAgICAgICAgICAgIGNvbnN0IHhiMiA9IHBvcy54ICsgY2hpbGQub2Zmc2V0V2lkdGhcclxuICAgICAgICAgICAgY29uc3QgeWIyID0gcG9zLnkgKyBjaGlsZC5vZmZzZXRIZWlnaHRcclxuICAgICAgICAgICAgY29uc3QgcGVyY2VudGFnZSA9IHV0aWxzLnBlcmNlbnRhZ2UoeGExLCB5YTEsIHhhMiwgeWEyLCB4YjEsIHliMSwgeGIyLCB5YjIpXHJcbiAgICAgICAgICAgIGlmIChwZXJjZW50YWdlID4gbGFyZ2VzdClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGFyZ2VzdCA9IHBlcmNlbnRhZ2VcclxuICAgICAgICAgICAgICAgIGNsb3Nlc3QgPSBjaGlsZFxyXG4gICAgICAgICAgICAgICAgaXNCZWZvcmUgPSBpbmRpY2F0b3JcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY2xvc2VzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChjbG9zZXN0ID09PSBkcmFnZ2luZylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaXNCZWZvcmUgJiYgY2xvc2VzdC5uZXh0U2libGluZylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5pbnNlcnRCZWZvcmUoZHJhZ2dpbmcsIGNsb3Nlc3QubmV4dFNpYmxpbmcpXHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdvcmRlci1wZW5kaW5nJywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Lmluc2VydEJlZm9yZShkcmFnZ2luZywgY2xvc2VzdClcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ29yZGVyLXBlbmRpbmcnLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gMlxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gMFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNlYXJjaCBmb3Igd2hlcmUgdG8gcGxhY2UgdXNpbmcgZGlzdGFuY2VcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSBmYWxzZT1ub3RoaW5nIHRvIGRvXHJcbiAgICAgKi9cclxuICAgIF9wbGFjZUJ5RGlzdGFuY2Uoc29ydGFibGUsIGRyYWdnaW5nLCB4LCB5KVxyXG4gICAge1xyXG4gICAgICAgIGlmICh1dGlscy5pbnNpZGUoeCwgeSwgZHJhZ2dpbmcpKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGluZGV4ID0gLTFcclxuICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50ID09PSBzb3J0YWJsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGluZGV4ID0gc29ydGFibGUuX2dldEluZGV4KGRyYWdnaW5nKVxyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbGVtZW50LmFwcGVuZENoaWxkKGRyYWdnaW5nKVxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgZGlzdGFuY2UgPSBJbmZpbml0eSwgY2xvc2VzdFxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBzb3J0YWJsZS5lbGVtZW50XHJcbiAgICAgICAgY29uc3QgZWxlbWVudHMgPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4odHJ1ZSlcclxuICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBlbGVtZW50cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh1dGlscy5pbnNpZGUoeCwgeSwgY2hpbGQpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjbG9zZXN0ID0gY2hpbGRcclxuICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBtZWFzdXJlID0gdXRpbHMuZGlzdGFuY2VUb0Nsb3Nlc3RDb3JuZXIoeCwgeSwgY2hpbGQpXHJcbiAgICAgICAgICAgICAgICBpZiAobWVhc3VyZSA8IGRpc3RhbmNlKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsb3Nlc3QgPSBjaGlsZFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc3RhbmNlID0gbWVhc3VyZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKGRyYWdnaW5nLCBjbG9zZXN0KVxyXG4gICAgICAgIGlmIChpbmRleCA9PT0gc29ydGFibGUuX2dldEluZGV4KGRyYWdnaW5nKSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNvcnRhYmxlLmVtaXQoJ29yZGVyLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwbGFjZSBpbmRpY2F0b3IgaW4gYW4gc29ydGFibGUgbGlzdFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BsYWNlSW5Tb3J0YWJsZUxpc3Qoc29ydGFibGUsIHgsIHksIGRyYWdnaW5nKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBzb3J0YWJsZS5lbGVtZW50XHJcbiAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgIGlmICghY2hpbGRyZW4ubGVuZ3RoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudCAhPT0gc29ydGFibGUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudC5lbWl0KCdyZW1vdmUtcGVuZGluZycsIGRyYWdnaW5nLCBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgICAgICBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgPSBzb3J0YWJsZVxyXG4gICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnYWRkLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5pc0NvcHkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnY29weS1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoZHJhZ2dpbmcpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIGNvbnN0IHBlcmNlbnRhZ2UgPSB0aGlzLl9wbGFjZUJ5UGVyY2VudGFnZShzb3J0YWJsZSwgZHJhZ2dpbmcpXHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9wbGFjZUJ5RGlzdGFuY2Uoc29ydGFibGUsIGRyYWdnaW5nLCB4LCB5KSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudCAhPT0gc29ydGFibGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdhZGQtcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuaXNDb3B5KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdjb3B5LXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50LmVtaXQoJ3JlbW92ZS1wZW5kaW5nJywgZHJhZ2dpbmcsIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50ID0gc29ydGFibGVcclxuICAgICAgICB9XHJcbiAgICAgICAgc29ydGFibGUuZW1pdCgndXBkYXRlLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzZXQgaWNvbiBpZiBhdmFpbGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2FuY2VsXSBmb3JjZSBjYW5jZWwgKGZvciBvcHRpb25zLmNvcHkpXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfc2V0SWNvbihlbGVtZW50LCBzb3J0YWJsZSwgY2FuY2VsKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGRyYWdnaW5nID0gZWxlbWVudC5fX3NvcnRhYmxlLmRyYWdnaW5nXHJcbiAgICAgICAgaWYgKGRyYWdnaW5nICYmIGRyYWdnaW5nLmljb24pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoIXNvcnRhYmxlKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZSA9IGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbFxyXG4gICAgICAgICAgICAgICAgaWYgKGNhbmNlbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnNyYyA9IHNvcnRhYmxlLm9wdGlvbnMuaWNvbnMuY2FuY2VsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zcmMgPSBzb3J0YWJsZS5vcHRpb25zLm9mZkxpc3QgPT09ICdkZWxldGUnID8gc29ydGFibGUub3B0aW9ucy5pY29ucy5kZWxldGUgOiBzb3J0YWJsZS5vcHRpb25zLmljb25zLmNhbmNlbFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5pc0NvcHkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zcmMgPSBzb3J0YWJsZS5vcHRpb25zLmljb25zLmNvcHlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnNyYyA9IGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9PT0gc29ydGFibGUgPyBzb3J0YWJsZS5vcHRpb25zLmljb25zLnJlb3JkZXIgOiBzb3J0YWJsZS5vcHRpb25zLmljb25zLm1vdmVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyBwaWNrZWQgdXAgYmVjYXVzZSBpdCB3YXMgbW92ZWQgYmV5b25kIHRoZSBvcHRpb25zLnRocmVzaG9sZFxyXG4gKiBAZXZlbnQgU29ydGFibGUjcGlja3VwXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgYmVpbmcgZHJhZ2dlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBjdXJyZW50IHNvcnRhYmxlIHdpdGggZWxlbWVudCBwbGFjZWhvbGRlclxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgc29ydGFibGUgaXMgcmVvcmRlcmVkXHJcbiAqIEBldmVudCBTb3J0YWJsZSNvcmRlclxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHRoYXQgd2FzIHJlb3JkZXJlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyBwbGFjZWRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIGFkZGVkIHRvIHRoaXMgc29ydGFibGVcclxuICogQGV2ZW50IFNvcnRhYmxlI2FkZFxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGFkZGVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIGFkZGVkXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyByZW1vdmVkIGZyb20gdGhpcyBzb3J0YWJsZVxyXG4gKiBAZXZlbnQgU29ydGFibGUjcmVtb3ZlXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgcmVtb3ZlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyByZW1vdmVkXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyByZW1vdmVkIGZyb20gYWxsIHNvcnRhYmxlc1xyXG4gKiBAZXZlbnQgU29ydGFibGUjZGVsZXRlXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgcmVtb3ZlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyBkcmFnZ2VkIGZyb21cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIGNvcHkgb2YgYW4gZWxlbWVudCBpcyBkcm9wcGVkXHJcbiAqIEBldmVudCBTb3J0YWJsZSNjb3B5XHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgcmVtb3ZlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyBkcmFnZ2VkIGZyb21cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiB0aGUgc29ydGFibGUgaXMgdXBkYXRlZCB3aXRoIGFuIGFkZCwgcmVtb3ZlLCBvciBvcmRlciBjaGFuZ2VcclxuICogQGV2ZW50IFNvcnRhYmxlI3VwZGF0ZVxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGNoYW5nZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2l0aCBlbGVtZW50XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gb3JkZXIgd2FzIGNoYW5nZWQgYnV0IGVsZW1lbnQgd2FzIG5vdCBkcm9wcGVkIHlldFxyXG4gKiBAZXZlbnQgU29ydGFibGUjb3JkZXItcGVuZGluZ1xyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBlbGVtZW50IGlzIGFkZGVkIGJ1dCBub3QgZHJvcHBlZCB5ZXRcclxuICogQGV2ZW50IFNvcnRhYmxlI2FkZC1wZW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgYmVpbmcgZHJhZ2dlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBjdXJyZW50IHNvcnRhYmxlIHdpdGggZWxlbWVudCBwbGFjZWhvbGRlclxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGVsZW1lbnQgaXMgcmVtb3ZlZCBidXQgbm90IGRyb3BwZWQgeWV0XHJcbiAqIEBldmVudCBTb3J0YWJsZSNyZW1vdmUtcGVuZGluZ1xyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIGFib3V0IHRvIGJlIHJlbW92ZWQgZnJvbSBhbGwgc29ydGFibGVzXHJcbiAqIEBldmVudCBTb3J0YWJsZSNkZWxldGUtcGVuZGluZ1xyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHJlbW92ZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgZHJhZ2dlZCBmcm9tXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyBhZGRlZCwgcmVtb3ZlZCwgb3IgcmVvcmRlciBidXQgZWxlbWVudCBoYXMgbm90IGRyb3BwZWQgeWV0XHJcbiAqIEBldmVudCBTb3J0YWJsZSN1cGRhdGUtcGVuZGluZ1xyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIGNvcHkgb2YgYW4gZWxlbWVudCBpcyBhYm91dCB0byBkcm9wXHJcbiAqIEBldmVudCBTb3J0YWJsZSNjb3B5LXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCByZW1vdmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIGRyYWdnZWQgZnJvbVxyXG4gKi9cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU29ydGFibGUiXX0=