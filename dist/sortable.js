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
                    } else {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3J0YWJsZS5qcyJdLCJuYW1lcyI6WyJFdmVudHMiLCJyZXF1aXJlIiwiZGVmYXVsdHMiLCJ1dGlscyIsIlNvcnRhYmxlIiwiZWxlbWVudCIsIm9wdGlvbnMiLCJfYWRkVG9HbG9iYWxUcmFja2VyIiwiZWxlbWVudHMiLCJfZ2V0Q2hpbGRyZW4iLCJjaGlsZCIsImRyYWdDbGFzcyIsImNvbnRhaW5zQ2xhc3NOYW1lIiwiYXR0YWNoRWxlbWVudCIsImV2ZW50cyIsImRyYWdPdmVyIiwiZSIsIl9kcmFnT3ZlciIsImRyb3AiLCJfZHJvcCIsIm1vdXNlT3ZlciIsIl9tb3VzZUVudGVyIiwiYWRkRXZlbnRMaXN0ZW5lciIsImN1cnNvckhvdmVyIiwic3R5bGUiLCJjdXJzb3JEb3duIiwiX21vdXNlRG93biIsImN1cnJlbnRUYXJnZXQiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwicmVtb3ZlRWxlbWVudCIsImluZGV4Iiwic29ydCIsImNoaWxkcmVuIiwibGVuZ3RoIiwiYXBwZW5kQ2hpbGQiLCJpbnNlcnRCZWZvcmUiLCJpZCIsIm9yZGVySWQiLCJkcmFnT3JkZXIiLCJnZXRBdHRyaWJ1dGUiLCJvcmRlcklkSXNOdW1iZXIiLCJwYXJzZUZsb2F0IiwiZm91bmQiLCJyZXZlcnNlT3JkZXIiLCJpIiwiY2hpbGREcmFnT3JkZXIiLCJvcmRlcklzTnVtYmVyIiwicGFyZW50Tm9kZSIsIl9fc29ydGFibGUiLCJvcmlnaW5hbCIsInNvcnRhYmxlIiwiZHJhZ1N0YXJ0IiwiX2RyYWdTdGFydCIsIm5hbWUiLCJ0cmFja2VyIiwiY291bnRlciIsImNvcHkiLCJzZXRBdHRyaWJ1dGUiLCJkcmFnTW92ZSIsImRyYWdJbWFnZSIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImJvZHkiLCJfYm9keURyYWdPdmVyIiwiX2JvZHlEcm9wIiwibGlzdCIsInB1c2giLCJkYXRhVHJhbnNmZXIiLCJ0eXBlcyIsImdldEVsZW1lbnRCeUlkIiwiX2ZpbmRDbG9zZXN0IiwibGFzdCIsIk1hdGgiLCJhYnMiLCJ4IiwicGFnZVgiLCJ0aHJlc2hvbGQiLCJ5IiwicGFnZVkiLCJfdXBkYXRlRHJhZ2dpbmciLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsIl9wbGFjZUluTGlzdCIsImRyb3BFZmZlY3QiLCJfbm9Ecm9wIiwiY2FuY2VsIiwiX3NldEljb24iLCJvZmZMaXN0IiwiZGlzcGxheSIsImVtaXQiLCJfcmVwbGFjZUluTGlzdCIsIl9yZW1vdmVEcmFnZ2luZyIsInJlbW92ZSIsImRyYWdnaW5nIiwiY2xvbmVOb2RlIiwiZHJhZ1N0eWxlIiwicG9zIiwidG9HbG9iYWwiLCJsZWZ0IiwidG9wIiwib2Zmc2V0IiwidXNlSWNvbnMiLCJpbWFnZSIsIkltYWdlIiwic3JjIiwiaWNvbnMiLCJyZW9yZGVyIiwicG9zaXRpb24iLCJ0cmFuc2Zvcm0iLCJvZmZzZXRMZWZ0Iiwib2Zmc2V0V2lkdGgiLCJvZmZzZXRUb3AiLCJvZmZzZXRIZWlnaHQiLCJpY29uIiwidGFyZ2V0IiwiaXNDb3B5IiwiY2xlYXJEYXRhIiwic2V0RGF0YSIsInNldERyYWdJbWFnZSIsImN1cnJlbnQiLCJfZ2V0SW5kZXgiLCJtaW4iLCJJbmZpbml0eSIsInJlbGF0ZWQiLCJpbnNpZGUiLCJjYWxjdWxhdGUiLCJkaXN0YW5jZVRvQ2xvc2VzdENvcm5lciIsIl9wbGFjZUluU29ydGFibGVMaXN0IiwiX3BsYWNlSW5PcmRlcmVkTGlzdCIsImJhc2UiLCJzZWFyY2giLCJyZXN1bHRzIiwiaW5kZXhPZiIsImNsYXNzTmFtZSIsIl90cmF2ZXJzZUNoaWxkcmVuIiwib3JkZXIiLCJkZWVwU2VhcmNoIiwib3JkZXJDbGFzcyIsImN1cnNvciIsInhhMSIsInlhMSIsInhhMiIsInlhMiIsImxhcmdlc3QiLCJjbG9zZXN0IiwiaXNCZWZvcmUiLCJpbmRpY2F0b3IiLCJ4YjEiLCJ5YjEiLCJ4YjIiLCJ5YjIiLCJwZXJjZW50YWdlIiwibmV4dFNpYmxpbmciLCJkaXN0YW5jZSIsIm1lYXN1cmUiLCJfcGxhY2VC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LEtBQWpCLENBQXVCakQsSUFBM0M7QUFDSCxxQkFIRCxNQUtBO0FBQ0lxQyxpQ0FBU29CLElBQVQsQ0FBY1QsR0FBZCxHQUFvQm5HLFFBQVEyQyxVQUFSLENBQW1CQyxRQUFuQixLQUFnQ0MsUUFBaEMsR0FBMkNBLFNBQVM1QyxPQUFULENBQWlCbUcsS0FBakIsQ0FBdUJDLE9BQWxFLEdBQTRFeEQsU0FBUzVDLE9BQVQsQ0FBaUJtRyxLQUFqQixDQUF1Qm9ELElBQXZIO0FBQ0g7QUFDSjtBQUNKO0FBQ0o7Ozs7O0FBbHpCRDs7Ozs7K0JBS2NySixRLEVBQVVGLE8sRUFDeEI7QUFDSSxnQkFBTTZILFVBQVUsRUFBaEI7QUFESjtBQUFBO0FBQUE7O0FBQUE7QUFFSSx1Q0FBb0IzSCxRQUFwQix3SUFDQTtBQUFBLHdCQURTSCxPQUNUOztBQUNJOEgsNEJBQVFqRSxJQUFSLENBQWEsSUFBSTlELFFBQUosQ0FBYUMsT0FBYixFQUFzQkMsT0FBdEIsQ0FBYjtBQUNIO0FBTEw7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFNSSxtQkFBTzZILE9BQVA7QUFDSDs7OzRCQWpCRDtBQUNJLG1CQUFPakksUUFBUDtBQUNIOzs7O0VBeEdrQkYsTTs7QUErNUJ2Qjs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOEosT0FBT0MsT0FBUCxHQUFpQjNKLFFBQWpCIiwiZmlsZSI6InNvcnRhYmxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgRXZlbnRzID0gcmVxdWlyZSgnZXZlbnRlbWl0dGVyMycpXHJcblxyXG5jb25zdCBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vZGVmYXVsdHMnKVxyXG5jb25zdCB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxyXG5cclxuY2xhc3MgU29ydGFibGUgZXh0ZW5kcyBFdmVudHNcclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgc29ydGFibGUgbGlzdFxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLm5hbWU9c29ydGFibGVdIGRyYWdnaW5nIGlzIGFsbG93ZWQgYmV0d2VlbiBTb3J0YWJsZXMgd2l0aCB0aGUgc2FtZSBuYW1lXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuZHJhZ0NsYXNzXSBpZiBzZXQgdGhlbiBkcmFnIG9ubHkgaXRlbXMgd2l0aCB0aGlzIGNsYXNzTmFtZSB1bmRlciBlbGVtZW50OyBvdGhlcndpc2UgZHJhZyBhbGwgY2hpbGRyZW5cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5vcmRlckNsYXNzXSB1c2UgdGhpcyBjbGFzcyB0byBpbmNsdWRlIGVsZW1lbnRzIGluIG9yZGVyaW5nIGJ1dCBub3QgZHJhZ2dpbmc7IG90aGVyd2lzZSBhbGwgY2hpbGRyZW4gZWxlbWVudHMgYXJlIGluY2x1ZGVkIGluIHdoZW4gc29ydGluZyBhbmQgb3JkZXJpbmdcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuZGVlcFNlYXJjaF0gaWYgZHJhZ0NsYXNzIGFuZCBkZWVwU2VhcmNoIHRoZW4gc2VhcmNoIGFsbCBkZXNjZW5kZW50cyBvZiBlbGVtZW50IGZvciBkcmFnQ2xhc3NcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuc29ydD10cnVlXSBhbGxvdyBzb3J0aW5nIHdpdGhpbiBsaXN0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmRyb3A9dHJ1ZV0gYWxsb3cgZHJvcCBmcm9tIHJlbGF0ZWQgc29ydGFibGVzIChkb2Vzbid0IGltcGFjdCByZW9yZGVyaW5nIHRoaXMgc29ydGFibGUncyBjaGlsZHJlbiB1bnRpbCB0aGUgY2hpbGRyZW4gYXJlIG1vdmVkIHRvIGEgZGlmZmVyZW4gc29ydGFibGUpXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmNvcHk9ZmFsc2VdIGNyZWF0ZSBjb3B5IHdoZW4gZHJhZ2dpbmcgYW4gaXRlbSAodGhpcyBkaXNhYmxlcyBzb3J0PXRydWUgZm9yIHRoaXMgc29ydGFibGUpXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMub3JkZXJJZD1kYXRhLW9yZGVyXSBmb3Igb3JkZXJlZCBsaXN0cywgdXNlIHRoaXMgZGF0YSBpZCB0byBmaWd1cmUgb3V0IHNvcnQgb3JkZXJcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMub3JkZXJJZElzTnVtYmVyPXRydWVdIHVzZSBwYXJzZUludCBvbiBvcHRpb25zLnNvcnRJZCB0byBwcm9wZXJseSBzb3J0IG51bWJlcnNcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5yZXZlcnNlT3JkZXJdIHJldmVyc2Ugc29ydCB0aGUgb3JkZXJJZFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLm9mZkxpc3Q9Y2xvc2VzdF0gaG93IHRvIGhhbmRsZSB3aGVuIGFuIGVsZW1lbnQgaXMgZHJvcHBlZCBvdXRzaWRlIGEgc29ydGFibGU6IGNsb3Nlc3Q9ZHJvcCBpbiBjbG9zZXN0IHNvcnRhYmxlOyBjYW5jZWw9cmV0dXJuIHRvIHN0YXJ0aW5nIHNvcnRhYmxlOyBkZWxldGU9cmVtb3ZlIGZyb20gYWxsIHNvcnRhYmxlc1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmN1cnNvckhvdmVyPWdyYWIgLXdlYmtpdC1ncmFiIHBvaW50ZXJdIHVzZSB0aGlzIGN1cnNvciBsaXN0IHRvIHNldCBjdXJzb3Igd2hlbiBob3ZlcmluZyBvdmVyIGEgc29ydGFibGUgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmN1cnNvckRvd249Z3JhYmJpbmcgLXdlYmtpdC1ncmFiYmluZyBwb2ludGVyXSB1c2UgdGhpcyBjdXJzb3IgbGlzdCB0byBzZXQgY3Vyc29yIHdoZW4gbW91c2Vkb3duL3RvdWNoZG93biBvdmVyIGEgc29ydGFibGUgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy51c2VJY29ucz10cnVlXSBzaG93IGljb25zIHdoZW4gZHJhZ2dpbmdcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9ucy5pY29uc10gZGVmYXVsdCBzZXQgb2YgaWNvbnNcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5pY29ucy5yZW9yZGVyXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmljb25zLm1vdmVdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuaWNvbnMuY29weV1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5pY29ucy5kZWxldGVdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuY3VzdG9tSWNvbl0gc291cmNlIG9mIGN1c3RvbSBpbWFnZSB3aGVuIG92ZXIgdGhpcyBzb3J0YWJsZVxyXG4gICAgICogQGZpcmVzIHBpY2t1cFxyXG4gICAgICogQGZpcmVzIG9yZGVyXHJcbiAgICAgKiBAZmlyZXMgYWRkXHJcbiAgICAgKiBAZmlyZXMgcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgdXBkYXRlXHJcbiAgICAgKiBAZmlyZXMgZGVsZXRlXHJcbiAgICAgKiBAZmlyZXMgY29weVxyXG4gICAgICogQGZpcmVzIG9yZGVyLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyBhZGQtcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIHJlbW92ZS1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgdXBkYXRlLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyBkZWxldGUtcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIGNvcHktcGVuZGluZ1xyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyKClcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSB1dGlscy5vcHRpb25zKG9wdGlvbnMsIGRlZmF1bHRzKVxyXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnRcclxuICAgICAgICB0aGlzLl9hZGRUb0dsb2JhbFRyYWNrZXIoKVxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnRzID0gdGhpcy5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGVsZW1lbnRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzIHx8IHV0aWxzLmNvbnRhaW5zQ2xhc3NOYW1lKGNoaWxkLCB0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hdHRhY2hFbGVtZW50KGNoaWxkKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZXZlbnRzID0ge1xyXG4gICAgICAgICAgICBkcmFnT3ZlcjogKGUpID0+IHRoaXMuX2RyYWdPdmVyKGUpLFxyXG4gICAgICAgICAgICBkcm9wOiAoZSkgPT4gdGhpcy5fZHJvcChlKSxcclxuICAgICAgICAgICAgbW91c2VPdmVyOiAoZSkgPT4gdGhpcy5fbW91c2VFbnRlcihlKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgdGhpcy5ldmVudHMuZHJhZ092ZXIpXHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywgdGhpcy5ldmVudHMuZHJvcClcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmN1cnNvckhvdmVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5fZ2V0Q2hpbGRyZW4oKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdXRpbHMuc3R5bGUoY2hpbGQsICdjdXJzb3InLCB0aGlzLm9wdGlvbnMuY3Vyc29ySG92ZXIpXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmN1cnNvckRvd24pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKGUpID0+IHRoaXMuX21vdXNlRG93bihlKSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfbW91c2VEb3duKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHV0aWxzLnN0eWxlKGUuY3VycmVudFRhcmdldCwgJ2N1cnNvcicsIHRoaXMub3B0aW9ucy5jdXJzb3JEb3duKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlbW92ZXMgYWxsIGV2ZW50IGhhbmRsZXJzIGZyb20gdGhpcy5lbGVtZW50IGFuZCBjaGlsZHJlblxyXG4gICAgICovXHJcbiAgICBkZXN0cm95KClcclxuICAgIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCB0aGlzLmV2ZW50cy5kcmFnT3ZlcilcclxuICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJvcCcsIHRoaXMuZXZlbnRzLmRyb3ApXHJcbiAgICAgICAgY29uc3QgZWxlbWVudHMgPSB0aGlzLl9nZXRDaGlsZHJlbigpXHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgZWxlbWVudHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUVsZW1lbnQoY2hpbGQpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHRvZG86IHJlbW92ZSBTb3J0YWJsZS50cmFja2VyIGFuZCByZWxhdGVkIGV2ZW50IGhhbmRsZXJzIGlmIG5vIG1vcmUgc29ydGFibGVzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB0aGUgZ2xvYmFsIGRlZmF1bHRzIGZvciBuZXcgU29ydGFibGUgb2JqZWN0c1xyXG4gICAgICogQHR5cGUge0RlZmF1bHRPcHRpb25zfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0IGRlZmF1bHRzKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gZGVmYXVsdHNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNyZWF0ZSBtdWx0aXBsZSBzb3J0YWJsZSBlbGVtZW50c1xyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudHNbXX0gZWxlbWVudHNcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIC0gc2VlIGNvbnN0cnVjdG9yIGZvciBvcHRpb25zXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBjcmVhdGUoZWxlbWVudHMsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdXHJcbiAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiBlbGVtZW50cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaChuZXcgU29ydGFibGUoZWxlbWVudCwgb3B0aW9ucykpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHRzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhZGQgYW4gZWxlbWVudCBhcyBhIGNoaWxkIG9mIHRoZSBzb3J0YWJsZSBlbGVtZW50OyBjYW4gYWxzbyBiZSB1c2VkIHRvIHN3YXAgYmV0d2VlbiBzb3J0YWJsZXNcclxuICAgICAqIE5PVEU6IHRoaXMgd2lsbCBub3Qgd29yayB3aXRoIGRlZXAtdHlwZSBlbGVtZW50czsgdXNlIGF0dGFjaEVsZW1lbnQgaW5zdGVhZFxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4XHJcbiAgICAgKi9cclxuICAgIGFkZChlbGVtZW50LCBpbmRleClcclxuICAgIHtcclxuICAgICAgICB0aGlzLmF0dGFjaEVsZW1lbnQoZWxlbWVudClcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNvcnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGluZGV4ID09PSAndW5kZWZpbmVkJyB8fCBpbmRleCA+PSB0aGlzLmVsZW1lbnQuY2hpbGRyZW4ubGVuZ3RoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZWxlbWVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5pbnNlcnRCZWZvcmUoZWxlbWVudCwgdGhpcy5lbGVtZW50LmNoaWxkcmVuW2luZGV4ICsgMV0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSB0aGlzLm9wdGlvbnMub3JkZXJJZFxyXG4gICAgICAgICAgICBsZXQgZHJhZ09yZGVyID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgICAgIGRyYWdPcmRlciA9IHRoaXMub3B0aW9ucy5vcmRlcklkSXNOdW1iZXIgPyBwYXJzZUZsb2F0KGRyYWdPcmRlcikgOiBkcmFnT3JkZXJcclxuICAgICAgICAgICAgbGV0IGZvdW5kXHJcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5fZ2V0Q2hpbGRyZW4odHJ1ZSlcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yZXZlcnNlT3JkZXIpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSBjaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZCA9IGNoaWxkcmVuW2ldXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkRHJhZ09yZGVyID0gY2hpbGQuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkRHJhZ09yZGVyID0gdGhpcy5vcHRpb25zLm9yZGVySXNOdW1iZXIgPyBwYXJzZUZsb2F0KGNoaWxkRHJhZ09yZGVyKSA6IGNoaWxkRHJhZ09yZGVyXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdPcmRlciA+IGNoaWxkRHJhZ09yZGVyKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZWxlbWVudCwgY2hpbGQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGNoaWxkcmVuKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZERyYWdPcmRlciA9IGNoaWxkLmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZERyYWdPcmRlciA9IHRoaXMub3B0aW9ucy5vcmRlcklzTnVtYmVyID8gcGFyc2VGbG9hdChjaGlsZERyYWdPcmRlcikgOiBjaGlsZERyYWdPcmRlclxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnT3JkZXIgPCBjaGlsZERyYWdPcmRlcilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGVsZW1lbnQsIGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFmb3VuZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhdHRhY2hlcyBhbiBIVE1MIGVsZW1lbnQgdG8gdGhlIHNvcnRhYmxlOyBjYW4gYWxzbyBiZSB1c2VkIHRvIHN3YXAgYmV0d2VlbiBzb3J0YWJsZXNcclxuICAgICAqIE5PVEU6IHlvdSBuZWVkIHRvIG1hbnVhbGx5IGluc2VydCB0aGUgZWxlbWVudCBpbnRvIHRoaXMuZWxlbWVudCAodGhpcyBpcyB1c2VmdWwgd2hlbiB5b3UgaGF2ZSBhIGRlZXAgc3RydWN0dXJlKVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICovXHJcbiAgICBhdHRhY2hFbGVtZW50KGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9IHRoaXNcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlID0ge1xyXG4gICAgICAgICAgICAgICAgc29ydGFibGU6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBvcmlnaW5hbDogdGhpcyxcclxuICAgICAgICAgICAgICAgIGRyYWdTdGFydDogKGUpID0+IHRoaXMuX2RyYWdTdGFydChlKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBlbnN1cmUgZXZlcnkgZWxlbWVudCBoYXMgYW4gaWRcclxuICAgICAgICAgICAgaWYgKCFlbGVtZW50LmlkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmlkID0gJ19fc29ydGFibGUtJyArIHRoaXMub3B0aW9ucy5uYW1lICsgJy0nICsgU29ydGFibGUudHJhY2tlclt0aGlzLm9wdGlvbnMubmFtZV0uY291bnRlclxyXG4gICAgICAgICAgICAgICAgU29ydGFibGUudHJhY2tlclt0aGlzLm9wdGlvbnMubmFtZV0uY291bnRlcisrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jb3B5KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuY29weSA9IDBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdzdGFydCcsIGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnU3RhcnQpXHJcbiAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdkcmFnZ2FibGUnLCB0cnVlKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlbW92ZXMgYWxsIGV2ZW50cyBmcm9tIGFuIEhUTUwgZWxlbWVudFxyXG4gICAgICogTk9URTogZG9lcyBub3QgcmVtb3ZlIHRoZSBlbGVtZW50IGZyb20gaXRzIHBhcmVudFxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICovXHJcbiAgICByZW1vdmVFbGVtZW50KGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBlbGVtZW50LmRyYWdNb3ZlKVxyXG4gICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGVsZW1lbnQuZHJhZ01vdmUpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhZGQgc29ydGFibGUgdG8gZ2xvYmFsIGxpc3QgdGhhdCB0cmFja3MgYWxsIHNvcnRhYmxlc1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2FkZFRvR2xvYmFsVHJhY2tlcigpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKCFTb3J0YWJsZS50cmFja2VyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgU29ydGFibGUuZHJhZ0ltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgICAgICAgICAgU29ydGFibGUuZHJhZ0ltYWdlLmlkID0gJ3NvcnRhYmxlLWRyYWdJbWFnZSdcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChTb3J0YWJsZS5kcmFnSW1hZ2UpXHJcbiAgICAgICAgICAgIFNvcnRhYmxlLnRyYWNrZXIgPSB7fVxyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgKGUpID0+IHRoaXMuX2JvZHlEcmFnT3ZlcihlKSlcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywgKGUpID0+IHRoaXMuX2JvZHlEcm9wKGUpKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoU29ydGFibGUudHJhY2tlclt0aGlzLm9wdGlvbnMubmFtZV0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBTb3J0YWJsZS50cmFja2VyW3RoaXMub3B0aW9ucy5uYW1lXS5saXN0LnB1c2godGhpcylcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgU29ydGFibGUudHJhY2tlclt0aGlzLm9wdGlvbnMubmFtZV0gPSB7IGxpc3Q6IFt0aGlzXSwgY291bnRlcjogMCB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZGVmYXVsdCBkcmFnIG92ZXIgZm9yIHRoZSBib2R5XHJcbiAgICAgKiBAcGFyYW0ge0RyYWdFdmVudH0gZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2JvZHlEcmFnT3ZlcihlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IG5hbWUgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1swXVxyXG4gICAgICAgIGlmIChuYW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1sxXVxyXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXHJcbiAgICAgICAgICAgIGNvbnN0IHNvcnRhYmxlID0gdGhpcy5fZmluZENsb3Nlc3QoZSwgU29ydGFibGUudHJhY2tlcltuYW1lXS5saXN0LCBlbGVtZW50KVxyXG4gICAgICAgICAgICBpZiAoc29ydGFibGUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZS5sYXN0ICYmIE1hdGguYWJzKHNvcnRhYmxlLmxhc3QueCAtIGUucGFnZVgpIDwgc29ydGFibGUub3B0aW9ucy50aHJlc2hvbGQgJiYgTWF0aC5hYnMoc29ydGFibGUubGFzdC55IC0gZS5wYWdlWSkgPCBzb3J0YWJsZS5vcHRpb25zLnRocmVzaG9sZClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZS5fdXBkYXRlRHJhZ2dpbmcoZSwgZWxlbWVudClcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZS5sYXN0ID0geyB4OiBlLnBhZ2VYLCB5OiBlLnBhZ2VZIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuX3BsYWNlSW5MaXN0KHNvcnRhYmxlLCBlLnBhZ2VYLCBlLnBhZ2VZLCBlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgZS5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9ICdtb3ZlJ1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlRHJhZ2dpbmcoZSwgZWxlbWVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX25vRHJvcChlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSBubyBkcm9wXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NhbmNlbF0gZm9yY2UgY2FuY2VsIChmb3Igb3B0aW9ucy5jb3B5KVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX25vRHJvcChlLCBjYW5jZWwpXHJcbiAgICB7XHJcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9ICdtb3ZlJ1xyXG4gICAgICAgIGNvbnN0IGlkID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMV1cclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXHJcbiAgICAgICAgaWYgKGVsZW1lbnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLl91cGRhdGVEcmFnZ2luZyhlLCBlbGVtZW50KVxyXG4gICAgICAgICAgICB0aGlzLl9zZXRJY29uKGVsZW1lbnQsIG51bGwsIGNhbmNlbClcclxuICAgICAgICAgICAgaWYgKCFjYW5jZWwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwub3B0aW9ucy5vZmZMaXN0ID09PSAnZGVsZXRlJylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkgPSBlbGVtZW50LnN0eWxlLmRpc3BsYXkgfHwgJ3Vuc2V0J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsLmVtaXQoJ2RlbGV0ZS1wZW5kaW5nJywgZWxlbWVudCwgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZXBsYWNlSW5MaXN0KGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCwgZWxlbWVudClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGRlZmF1bHQgZHJvcCBmb3IgdGhlIGJvZHlcclxuICAgICAqIEBwYXJhbSB7RHJhZ0V2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfYm9keURyb3AoZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBuYW1lID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMF1cclxuICAgICAgICBpZiAobmFtZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMV1cclxuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxyXG4gICAgICAgICAgICBjb25zdCBzb3J0YWJsZSA9IHRoaXMuX2ZpbmRDbG9zZXN0KGUsIFNvcnRhYmxlLnRyYWNrZXJbbmFtZV0ubGlzdCwgZWxlbWVudClcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlbW92ZURyYWdnaW5nKGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmUoKVxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkgPSBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsLmVtaXQoJ2RlbGV0ZScsIGVsZW1lbnQsIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbClcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgPSBudWxsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzdGFydCBkcmFnXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kcmFnU3RhcnQoZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBzb3J0YWJsZSA9IGUuY3VycmVudFRhcmdldC5fX3NvcnRhYmxlLm9yaWdpbmFsXHJcbiAgICAgICAgY29uc3QgZHJhZ2dpbmcgPSBlLmN1cnJlbnRUYXJnZXQuY2xvbmVOb2RlKHRydWUpXHJcbiAgICAgICAgZm9yIChsZXQgc3R5bGUgaW4gc29ydGFibGUub3B0aW9ucy5kcmFnU3R5bGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5zdHlsZVtzdHlsZV0gPSBzb3J0YWJsZS5vcHRpb25zLmRyYWdTdHlsZVtzdHlsZV1cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcG9zID0gdXRpbHMudG9HbG9iYWwoZS5jdXJyZW50VGFyZ2V0KVxyXG4gICAgICAgIGRyYWdnaW5nLnN0eWxlLmxlZnQgPSBwb3MueCArICdweCdcclxuICAgICAgICBkcmFnZ2luZy5zdHlsZS50b3AgPSBwb3MueSArICdweCdcclxuICAgICAgICBjb25zdCBvZmZzZXQgPSB7IHg6IHBvcy54IC0gZS5wYWdlWCwgeTogcG9zLnkgLSBlLnBhZ2VZIH1cclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRyYWdnaW5nKVxyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLnVzZUljb25zKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKVxyXG4gICAgICAgICAgICBpbWFnZS5zcmMgPSBzb3J0YWJsZS5vcHRpb25zLmljb25zLnJlb3JkZXJcclxuICAgICAgICAgICAgaW1hZ2Uuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoLTUwJSwgLTUwJSknXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLmxlZnQgPSBkcmFnZ2luZy5vZmZzZXRMZWZ0ICsgZHJhZ2dpbmcub2Zmc2V0V2lkdGggKyAncHgnXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLnRvcCA9IGRyYWdnaW5nLm9mZnNldFRvcCArIGRyYWdnaW5nLm9mZnNldEhlaWdodCArICdweCdcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpbWFnZSlcclxuICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbiA9IGltYWdlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLmN1cnNvckhvdmVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdXRpbHMuc3R5bGUoZS5jdXJyZW50VGFyZ2V0LCAnY3Vyc29yJywgc29ydGFibGUub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHRhcmdldCA9IGUuY3VycmVudFRhcmdldFxyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLmNvcHkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0YXJnZXQgPSBlLmN1cnJlbnRUYXJnZXQuY2xvbmVOb2RlKHRydWUpXHJcbiAgICAgICAgICAgIHRhcmdldC5pZCA9IGUuY3VycmVudFRhcmdldC5pZCArICctY29weS0nICsgZS5jdXJyZW50VGFyZ2V0Ll9fc29ydGFibGUuY29weVxyXG4gICAgICAgICAgICBlLmN1cnJlbnRUYXJnZXQuX19zb3J0YWJsZS5jb3B5KytcclxuICAgICAgICAgICAgc29ydGFibGUuYXR0YWNoRWxlbWVudCh0YXJnZXQpXHJcbiAgICAgICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLmlzQ29weSA9IHRydWVcclxuICAgICAgICAgICAgdGFyZ2V0Ll9fc29ydGFibGUub3JpZ2luYWwgPSB0aGlzXHJcbiAgICAgICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLmRpc3BsYXkgPSB0YXJnZXQuc3R5bGUuZGlzcGxheSB8fCAndW5zZXQnXHJcbiAgICAgICAgICAgIHRhcmdldC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGFyZ2V0KVxyXG4gICAgICAgIH1cclxuICAgICAgICBlLmRhdGFUcmFuc2Zlci5jbGVhckRhdGEoKVxyXG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLnNldERhdGEoc29ydGFibGUub3B0aW9ucy5uYW1lLCBzb3J0YWJsZS5vcHRpb25zLm5hbWUpXHJcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuc2V0RGF0YSh0YXJnZXQuaWQsIHRhcmdldC5pZClcclxuICAgICAgICBlLmRhdGFUcmFuc2Zlci5zZXREcmFnSW1hZ2UoU29ydGFibGUuZHJhZ0ltYWdlLCAwLCAwKVxyXG4gICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLmN1cnJlbnQgPSB0aGlzXHJcbiAgICAgICAgdGFyZ2V0Ll9fc29ydGFibGUuaW5kZXggPSBzb3J0YWJsZS5vcHRpb25zLmNvcHkgPyAtMSA6IHNvcnRhYmxlLl9nZXRJbmRleCh0YXJnZXQpXHJcbiAgICAgICAgdGFyZ2V0Ll9fc29ydGFibGUuZHJhZ2dpbmcgPSBkcmFnZ2luZ1xyXG4gICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLm9mZnNldCA9IG9mZnNldFxyXG4gICAgfVxyXG5cclxuICAgIF9kcmFnT3ZlcihlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHNvcnRhYmxlID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMF1cclxuICAgICAgICBpZiAoc29ydGFibGUgJiYgc29ydGFibGUgPT09IHRoaXMub3B0aW9ucy5uYW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1sxXVxyXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmxhc3QgJiYgTWF0aC5hYnModGhpcy5sYXN0LnggLSBlLnBhZ2VYKSA8IHRoaXMub3B0aW9ucy50aHJlc2hvbGQgJiYgTWF0aC5hYnModGhpcy5sYXN0LnkgLSBlLnBhZ2VZKSA8IHRoaXMub3B0aW9ucy50aHJlc2hvbGQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZURyYWdnaW5nKGUsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMubGFzdCA9IHsgeDogZS5wYWdlWCwgeTogZS5wYWdlWSB9XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUuaXNDb3B5ICYmIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9PT0gdGhpcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbm9Ecm9wKGUsIHRydWUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5vcHRpb25zLmRyb3AgfHwgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsID09PSB0aGlzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wbGFjZUluTGlzdCh0aGlzLCBlLnBhZ2VYLCBlLnBhZ2VZLCBlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgZS5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9IGVsZW1lbnQuX19zb3J0YWJsZS5pc0NvcHkgPyAnY29weScgOiAnbW92ZSdcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZURyYWdnaW5nKGUsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9ub0Ryb3AoZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfdXBkYXRlRHJhZ2dpbmcoZSwgZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBkcmFnZ2luZyA9IGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnZ2luZ1xyXG4gICAgICAgIGNvbnN0IG9mZnNldCA9IGVsZW1lbnQuX19zb3J0YWJsZS5vZmZzZXRcclxuICAgICAgICBpZiAoZHJhZ2dpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5zdHlsZS5sZWZ0ID0gZS5wYWdlWCArIG9mZnNldC54ICsgJ3B4J1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5zdHlsZS50b3AgPSBlLnBhZ2VZICsgb2Zmc2V0LnkgKyAncHgnXHJcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZy5pY29uKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnN0eWxlLmxlZnQgPSBkcmFnZ2luZy5vZmZzZXRMZWZ0ICsgZHJhZ2dpbmcub2Zmc2V0V2lkdGggKyAncHgnXHJcbiAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnN0eWxlLnRvcCA9IGRyYWdnaW5nLm9mZnNldFRvcCArIGRyYWdnaW5nLm9mZnNldEhlaWdodCArICdweCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfcmVtb3ZlRHJhZ2dpbmcoZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBkcmFnZ2luZyA9IGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnZ2luZ1xyXG4gICAgICAgIGRyYWdnaW5nLnJlbW92ZSgpXHJcbiAgICAgICAgaWYgKGRyYWdnaW5nLmljb24pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5pY29uLnJlbW92ZSgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnZ2luZyA9IG51bGxcclxuICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuaXNDb3B5ID0gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBfZHJvcChlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IG5hbWUgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1swXVxyXG4gICAgICAgIGlmIChuYW1lICYmIG5hbWUgPT09IHRoaXMub3B0aW9ucy5uYW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1sxXVxyXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgIT09IHRoaXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbC5lbWl0KCdyZW1vdmUnLCBlbGVtZW50LCBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2FkZCcsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgPSB0aGlzXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNvcnQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdvcmRlcicsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLmlzQ29weSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2NvcHknLCBlbGVtZW50LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KCd1cGRhdGUnLCBlbGVtZW50LCB0aGlzKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5pbmRleCAhPT0gdGhpcy5fZ2V0SW5kZXgoZS5jdXJyZW50VGFyZ2V0KSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ29yZGVyJywgZWxlbWVudCwgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ3VwZGF0ZScsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlRHJhZ2dpbmcoZWxlbWVudClcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmaW5kIGNsb3Nlc3QgU29ydGFibGUgdG8gc2NyZWVuIGxvY2F0aW9uXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGVbXX0gbGlzdCBvZiByZWxhdGVkIFNvcnRhYmxlc1xyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2ZpbmRDbG9zZXN0KGUsIGxpc3QsIGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IG1pbiA9IEluZmluaXR5LCBmb3VuZFxyXG4gICAgICAgIGZvciAobGV0IHJlbGF0ZWQgb2YgbGlzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICgoIXJlbGF0ZWQub3B0aW9ucy5kcm9wICYmIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCAhPT0gcmVsYXRlZCkgfHxcclxuICAgICAgICAgICAgICAgIChlbGVtZW50Ll9fc29ydGFibGUuaXNDb3B5ICYmIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9PT0gcmVsYXRlZCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHV0aWxzLmluc2lkZShlLnBhZ2VYLCBlLnBhZ2VZLCByZWxhdGVkLmVsZW1lbnQpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVsYXRlZFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHJlbGF0ZWQub3B0aW9ucy5vZmZMaXN0ID09PSAnY2xvc2VzdCcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNhbGN1bGF0ZSA9IHV0aWxzLmRpc3RhbmNlVG9DbG9zZXN0Q29ybmVyKGUucGFnZVgsIGUucGFnZVksIHJlbGF0ZWQuZWxlbWVudClcclxuICAgICAgICAgICAgICAgIGlmIChjYWxjdWxhdGUgPCBtaW4pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWluID0gY2FsY3VsYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgZm91bmQgPSByZWxhdGVkXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZvdW5kXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwbGFjZSBpbmRpY2F0b3IgaW4gdGhlIHNvcnRhYmxlIGxpc3QgYWNjb3JkaW5nIHRvIG9wdGlvbnMuc29ydFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BsYWNlSW5MaXN0KHNvcnRhYmxlLCB4LCB5LCBlbGVtZW50KVxyXG4gICAge1xyXG4gICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5ID09PSAndW5zZXQnID8gJycgOiBlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheVxyXG4gICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheSA9IG51bGxcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zb3J0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fcGxhY2VJblNvcnRhYmxlTGlzdChzb3J0YWJsZSwgeCwgeSwgZWxlbWVudClcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fcGxhY2VJbk9yZGVyZWRMaXN0KHNvcnRhYmxlLCBlbGVtZW50KVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9zZXRJY29uKGVsZW1lbnQsIHNvcnRhYmxlKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVwbGFjZSBpdGVtIGluIGxpc3QgYXQgb3JpZ2luYWwgaW5kZXggcG9zaXRpb25cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9yZXBsYWNlSW5MaXN0KHNvcnRhYmxlLCBlbGVtZW50KVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gc29ydGFibGUuX2dldENoaWxkcmVuKClcclxuICAgICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaW5kZXggPSBlbGVtZW50Ll9fc29ydGFibGUuaW5kZXhcclxuICAgICAgICAgICAgaWYgKGluZGV4IDwgY2hpbGRyZW4ubGVuZ3RoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlbltpbmRleF0ucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZWxlbWVudCwgY2hpbGRyZW5baW5kZXhdKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2hpbGRyZW5bMF0uYXBwZW5kQ2hpbGQoZWxlbWVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbGVtZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIF9nZXRJbmRleChjaGlsZClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuX2dldENoaWxkcmVuKClcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGNoaWxkcmVuW2ldID09PSBjaGlsZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfdHJhdmVyc2VDaGlsZHJlbihiYXNlLCBzZWFyY2gsIHJlc3VsdHMpXHJcbiAgICB7XHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgYmFzZS5jaGlsZHJlbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChzZWFyY2gubGVuZ3RoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2VhcmNoLmluZGV4T2YoY2hpbGQuY2xhc3NOYW1lKSAhPT0gLTEpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGNoaWxkKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3RyYXZlcnNlQ2hpbGRyZW4oY2hpbGQsIHNlYXJjaCwgcmVzdWx0cylcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmaW5kIGNoaWxkcmVuIGluIGRpdlxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29yZGVyXSBzZWFyY2ggZm9yIGRyYWdPcmRlciBhcyB3ZWxsXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZ2V0Q2hpbGRyZW4ob3JkZXIpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kZWVwU2VhcmNoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IHNlYXJjaCA9IFtdXHJcbiAgICAgICAgICAgIGlmIChvcmRlciAmJiB0aGlzLm9wdGlvbnMub3JkZXJDbGFzcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoLnB1c2godGhpcy5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChvcmRlciAmJiB0aGlzLm9wdGlvbnMub3JkZXJDbGFzcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2gucHVzaCh0aGlzLm9wdGlvbnMub3JkZXJDbGFzcylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICghb3JkZXIgJiYgdGhpcy5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc2VhcmNoLnB1c2godGhpcy5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCByZXN1bHRzID0gW11cclxuICAgICAgICAgICAgdGhpcy5fdHJhdmVyc2VDaGlsZHJlbih0aGlzLmVsZW1lbnQsIHNlYXJjaCwgcmVzdWx0cylcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHNcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxldCBsaXN0ID0gW11cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIHRoaXMuZWxlbWVudC5jaGlsZHJlbilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodXRpbHMuY29udGFpbnNDbGFzc05hbWUoY2hpbGQsIHRoaXMub3B0aW9ucy5kcmFnQ2xhc3MpIHx8IChvcmRlciAmJiAhdGhpcy5vcHRpb25zLm9yZGVyQ2xhc3MgfHwgKG9yZGVyICYmIHRoaXMub3B0aW9ucy5vcmRlckNsYXNzICYmIHV0aWxzLmNvbnRhaW5zQ2xhc3NOYW1lKGNoaWxkLCB0aGlzLm9wdGlvbnMub3JkZXJDbGFzcykpKSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpc3QucHVzaChjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbGlzdFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5jaGlsZHJlblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGxhY2UgaW5kaWNhdG9yIGluIGFuIG9yZGVyZWQgbGlzdFxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGxhY2VJbk9yZGVyZWRMaXN0KHNvcnRhYmxlLCBkcmFnZ2luZylcclxuICAgIHtcclxuICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50ICE9PSBzb3J0YWJsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gc29ydGFibGUub3B0aW9ucy5vcmRlcklkXHJcbiAgICAgICAgICAgIGxldCBkcmFnT3JkZXIgPSBkcmFnZ2luZy5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgICAgIGRyYWdPcmRlciA9IHNvcnRhYmxlLm9wdGlvbnMub3JkZXJJZElzTnVtYmVyID8gcGFyc2VGbG9hdChkcmFnT3JkZXIpIDogZHJhZ09yZGVyXHJcbiAgICAgICAgICAgIGxldCBmb3VuZFxyXG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHNvcnRhYmxlLl9nZXRDaGlsZHJlbih0cnVlKVxyXG4gICAgICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5yZXZlcnNlT3JkZXIpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSBjaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZCA9IGNoaWxkcmVuW2ldXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkRHJhZ09yZGVyID0gY2hpbGQuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkRHJhZ09yZGVyID0gc29ydGFibGUub3B0aW9ucy5vcmRlcklzTnVtYmVyID8gcGFyc2VGbG9hdChjaGlsZERyYWdPcmRlcikgOiBjaGlsZERyYWdPcmRlclxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnT3JkZXIgPiBjaGlsZERyYWdPcmRlcilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGRyYWdnaW5nLCBjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgY2hpbGRyZW4pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkRHJhZ09yZGVyID0gY2hpbGQuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkRHJhZ09yZGVyID0gc29ydGFibGUub3B0aW9ucy5vcmRlcklzTnVtYmVyID8gcGFyc2VGbG9hdChjaGlsZERyYWdPcmRlcikgOiBjaGlsZERyYWdPcmRlclxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnT3JkZXIgPCBjaGlsZERyYWdPcmRlcilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGRyYWdnaW5nLCBjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghZm91bmQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZHJhZ2dpbmcpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50LmVtaXQoJ3JlbW92ZS1wZW5kaW5nJywgZHJhZ2dpbmcsIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnYWRkLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmlzQ29weSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnY29weS1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudCA9IHNvcnRhYmxlXHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ3VwZGF0ZS1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNlYXJjaCBmb3Igd2hlcmUgdG8gcGxhY2UgdXNpbmcgcGVyY2VudGFnZVxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSAwID0gbm90IGZvdW5kOyAxID0gbm90aGluZyB0byBkbzsgMiA9IG1vdmVkXHJcbiAgICAgKi9cclxuICAgIF9wbGFjZUJ5UGVyY2VudGFnZShzb3J0YWJsZSwgZHJhZ2dpbmcpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgY3Vyc29yID0gZHJhZ2dpbmcuX19zb3J0YWJsZS5kcmFnZ2luZ1xyXG4gICAgICAgIGNvbnN0IHhhMSA9IGN1cnNvci5vZmZzZXRMZWZ0XHJcbiAgICAgICAgY29uc3QgeWExID0gY3Vyc29yLm9mZnNldFRvcFxyXG4gICAgICAgIGNvbnN0IHhhMiA9IGN1cnNvci5vZmZzZXRMZWZ0ICsgY3Vyc29yLm9mZnNldFdpZHRoXHJcbiAgICAgICAgY29uc3QgeWEyID0gY3Vyc29yLm9mZnNldFRvcCArIGN1cnNvci5vZmZzZXRIZWlnaHRcclxuICAgICAgICBsZXQgbGFyZ2VzdCA9IDAsIGNsb3Nlc3QsIGlzQmVmb3JlLCBpbmRpY2F0b3JcclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gc29ydGFibGUuZWxlbWVudFxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnRzID0gc29ydGFibGUuX2dldENoaWxkcmVuKHRydWUpXHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgZWxlbWVudHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoY2hpbGQgPT09IGRyYWdnaW5nKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbmRpY2F0b3IgPSB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgcG9zID0gdXRpbHMudG9HbG9iYWwoY2hpbGQpXHJcbiAgICAgICAgICAgIGNvbnN0IHhiMSA9IHBvcy54XHJcbiAgICAgICAgICAgIGNvbnN0IHliMSA9IHBvcy55XHJcbiAgICAgICAgICAgIGNvbnN0IHhiMiA9IHBvcy54ICsgY2hpbGQub2Zmc2V0V2lkdGhcclxuICAgICAgICAgICAgY29uc3QgeWIyID0gcG9zLnkgKyBjaGlsZC5vZmZzZXRIZWlnaHRcclxuICAgICAgICAgICAgY29uc3QgcGVyY2VudGFnZSA9IHV0aWxzLnBlcmNlbnRhZ2UoeGExLCB5YTEsIHhhMiwgeWEyLCB4YjEsIHliMSwgeGIyLCB5YjIpXHJcbiAgICAgICAgICAgIGlmIChwZXJjZW50YWdlID4gbGFyZ2VzdClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGFyZ2VzdCA9IHBlcmNlbnRhZ2VcclxuICAgICAgICAgICAgICAgIGNsb3Nlc3QgPSBjaGlsZFxyXG4gICAgICAgICAgICAgICAgaXNCZWZvcmUgPSBpbmRpY2F0b3JcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY2xvc2VzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChjbG9zZXN0ID09PSBkcmFnZ2luZylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaXNCZWZvcmUgJiYgY2xvc2VzdC5uZXh0U2libGluZylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5pbnNlcnRCZWZvcmUoZHJhZ2dpbmcsIGNsb3Nlc3QubmV4dFNpYmxpbmcpXHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdvcmRlci1wZW5kaW5nJywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Lmluc2VydEJlZm9yZShkcmFnZ2luZywgY2xvc2VzdClcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ29yZGVyLXBlbmRpbmcnLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gMlxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gMFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNlYXJjaCBmb3Igd2hlcmUgdG8gcGxhY2UgdXNpbmcgZGlzdGFuY2VcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSBmYWxzZT1ub3RoaW5nIHRvIGRvXHJcbiAgICAgKi9cclxuICAgIF9wbGFjZUJ5RGlzdGFuY2Uoc29ydGFibGUsIGRyYWdnaW5nLCB4LCB5KVxyXG4gICAge1xyXG4gICAgICAgIGlmICh1dGlscy5pbnNpZGUoeCwgeSwgZHJhZ2dpbmcpKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGluZGV4ID0gLTFcclxuICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50ID09PSBzb3J0YWJsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGluZGV4ID0gc29ydGFibGUuX2dldEluZGV4KGRyYWdnaW5nKVxyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbGVtZW50LmFwcGVuZENoaWxkKGRyYWdnaW5nKVxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgZGlzdGFuY2UgPSBJbmZpbml0eSwgY2xvc2VzdFxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBzb3J0YWJsZS5lbGVtZW50XHJcbiAgICAgICAgY29uc3QgZWxlbWVudHMgPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4odHJ1ZSlcclxuICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBlbGVtZW50cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh1dGlscy5pbnNpZGUoeCwgeSwgY2hpbGQpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjbG9zZXN0ID0gY2hpbGRcclxuICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBtZWFzdXJlID0gdXRpbHMuZGlzdGFuY2VUb0Nsb3Nlc3RDb3JuZXIoeCwgeSwgY2hpbGQpXHJcbiAgICAgICAgICAgICAgICBpZiAobWVhc3VyZSA8IGRpc3RhbmNlKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsb3Nlc3QgPSBjaGlsZFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc3RhbmNlID0gbWVhc3VyZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKGRyYWdnaW5nLCBjbG9zZXN0KVxyXG4gICAgICAgIGlmIChpbmRleCA9PT0gc29ydGFibGUuX2dldEluZGV4KGRyYWdnaW5nKSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNvcnRhYmxlLmVtaXQoJ29yZGVyLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwbGFjZSBpbmRpY2F0b3IgaW4gYW4gc29ydGFibGUgbGlzdFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BsYWNlSW5Tb3J0YWJsZUxpc3Qoc29ydGFibGUsIHgsIHksIGRyYWdnaW5nKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBzb3J0YWJsZS5lbGVtZW50XHJcbiAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgIGlmICghY2hpbGRyZW4ubGVuZ3RoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudCAhPT0gc29ydGFibGUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudC5lbWl0KCdyZW1vdmUtcGVuZGluZycsIGRyYWdnaW5nLCBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgICAgICBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgPSBzb3J0YWJsZVxyXG4gICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnYWRkLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5pc0NvcHkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnY29weS1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoZHJhZ2dpbmcpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIGNvbnN0IHBlcmNlbnRhZ2UgPSB0aGlzLl9wbGFjZUJ5UGVyY2VudGFnZShzb3J0YWJsZSwgZHJhZ2dpbmcpXHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9wbGFjZUJ5RGlzdGFuY2Uoc29ydGFibGUsIGRyYWdnaW5nLCB4LCB5KSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudCAhPT0gc29ydGFibGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdhZGQtcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuaXNDb3B5KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdjb3B5LXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50LmVtaXQoJ3JlbW92ZS1wZW5kaW5nJywgZHJhZ2dpbmcsIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50ID0gc29ydGFibGVcclxuICAgICAgICB9XHJcbiAgICAgICAgc29ydGFibGUuZW1pdCgndXBkYXRlLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzZXQgaWNvbiBpZiBhdmFpbGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2FuY2VsXSBmb3JjZSBjYW5jZWwgKGZvciBvcHRpb25zLmNvcHkpXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfc2V0SWNvbihlbGVtZW50LCBzb3J0YWJsZSwgY2FuY2VsKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGRyYWdnaW5nID0gZWxlbWVudC5fX3NvcnRhYmxlLmRyYWdnaW5nXHJcbiAgICAgICAgaWYgKGRyYWdnaW5nICYmIGRyYWdnaW5nLmljb24pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoIXNvcnRhYmxlKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZSA9IGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbFxyXG4gICAgICAgICAgICAgICAgaWYgKGNhbmNlbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnNyYyA9IHNvcnRhYmxlLm9wdGlvbnMuaWNvbnMuY2FuY2VsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zcmMgPSBzb3J0YWJsZS5vcHRpb25zLm9mZkxpc3QgPT09ICdkZWxldGUnID8gc29ydGFibGUub3B0aW9ucy5pY29ucy5kZWxldGUgOiBzb3J0YWJsZS5vcHRpb25zLmljb25zLmNhbmNlbFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5pc0NvcHkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zcmMgPSBzb3J0YWJsZS5vcHRpb25zLmljb25zLmNvcHlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnNyYyA9IGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9PT0gc29ydGFibGUgPyBzb3J0YWJsZS5vcHRpb25zLmljb25zLnJlb3JkZXIgOiBzb3J0YWJsZS5vcHRpb25zLmljb25zLm1vdmVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyBwaWNrZWQgdXAgYmVjYXVzZSBpdCB3YXMgbW92ZWQgYmV5b25kIHRoZSBvcHRpb25zLnRocmVzaG9sZFxyXG4gKiBAZXZlbnQgU29ydGFibGUjcGlja3VwXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgYmVpbmcgZHJhZ2dlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBjdXJyZW50IHNvcnRhYmxlIHdpdGggZWxlbWVudCBwbGFjZWhvbGRlclxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgc29ydGFibGUgaXMgcmVvcmRlcmVkXHJcbiAqIEBldmVudCBTb3J0YWJsZSNvcmRlclxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHRoYXQgd2FzIHJlb3JkZXJlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyBwbGFjZWRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIGFkZGVkIHRvIHRoaXMgc29ydGFibGVcclxuICogQGV2ZW50IFNvcnRhYmxlI2FkZFxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGFkZGVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIGFkZGVkXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyByZW1vdmVkIGZyb20gdGhpcyBzb3J0YWJsZVxyXG4gKiBAZXZlbnQgU29ydGFibGUjcmVtb3ZlXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgcmVtb3ZlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyByZW1vdmVkXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyByZW1vdmVkIGZyb20gYWxsIHNvcnRhYmxlc1xyXG4gKiBAZXZlbnQgU29ydGFibGUjZGVsZXRlXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgcmVtb3ZlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyBkcmFnZ2VkIGZyb21cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIGNvcHkgb2YgYW4gZWxlbWVudCBpcyBkcm9wcGVkXHJcbiAqIEBldmVudCBTb3J0YWJsZSNjb3B5XHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgcmVtb3ZlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyBkcmFnZ2VkIGZyb21cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiB0aGUgc29ydGFibGUgaXMgdXBkYXRlZCB3aXRoIGFuIGFkZCwgcmVtb3ZlLCBvciBvcmRlciBjaGFuZ2VcclxuICogQGV2ZW50IFNvcnRhYmxlI3VwZGF0ZVxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGNoYW5nZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2l0aCBlbGVtZW50XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gb3JkZXIgd2FzIGNoYW5nZWQgYnV0IGVsZW1lbnQgd2FzIG5vdCBkcm9wcGVkIHlldFxyXG4gKiBAZXZlbnQgU29ydGFibGUjb3JkZXItcGVuZGluZ1xyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBlbGVtZW50IGlzIGFkZGVkIGJ1dCBub3QgZHJvcHBlZCB5ZXRcclxuICogQGV2ZW50IFNvcnRhYmxlI2FkZC1wZW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgYmVpbmcgZHJhZ2dlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBjdXJyZW50IHNvcnRhYmxlIHdpdGggZWxlbWVudCBwbGFjZWhvbGRlclxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGVsZW1lbnQgaXMgcmVtb3ZlZCBidXQgbm90IGRyb3BwZWQgeWV0XHJcbiAqIEBldmVudCBTb3J0YWJsZSNyZW1vdmUtcGVuZGluZ1xyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIGFib3V0IHRvIGJlIHJlbW92ZWQgZnJvbSBhbGwgc29ydGFibGVzXHJcbiAqIEBldmVudCBTb3J0YWJsZSNkZWxldGUtcGVuZGluZ1xyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHJlbW92ZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgZHJhZ2dlZCBmcm9tXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyBhZGRlZCwgcmVtb3ZlZCwgb3IgcmVvcmRlciBidXQgZWxlbWVudCBoYXMgbm90IGRyb3BwZWQgeWV0XHJcbiAqIEBldmVudCBTb3J0YWJsZSN1cGRhdGUtcGVuZGluZ1xyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIGNvcHkgb2YgYW4gZWxlbWVudCBpcyBhYm91dCB0byBkcm9wXHJcbiAqIEBldmVudCBTb3J0YWJsZSNjb3B5LXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCByZW1vdmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIGRyYWdnZWQgZnJvbVxyXG4gKi9cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU29ydGFibGUiXX0=