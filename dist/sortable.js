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
            dragLeave: function dragLeave(e) {
                return _this._dragLeave(e);
            },
            mouseOver: function mouseOver(e) {
                return _this._mouseEnter(e);
            }
        };
        element.addEventListener('dragover', _this.events.dragOver);
        element.addEventListener('drop', _this.events.drop);
        element.addEventListener('dragleave', _this.events.dragLeave);
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

    /**
     * removes all event handlers from this.element and children
     */


    _createClass(Sortable, [{
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
         * NOTE: this may not work with deepSearch non-ordered elements; use attachElement instead
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
                if (element) {
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
                    this._clearMaximumPending(element.__sortable.current);
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

        /**
         * handle drag leave events for sortable element
         * @param {DragEvent} e
         * @private
         */

    }, {
        key: '_dragLeave',
        value: function _dragLeave(e) {
            var sortable = e.dataTransfer.types[0];
            if (sortable && sortable === this.options.name) {
                this._clearMaximumPending(sortable);
            }
        }

        /**
         * handle drag over events for sortable element
         * @param {DragEvent} e
         * @private
         */

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
                    sortable.removePending = null;
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
                sortable.removePending = null;
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
                if (children.length > sortable.options.maximum) {
                    var savePending = sortable.removePending ? sortable.removePending.slice(0) : [];
                    this._clearMaximumPending(sortable);
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
    }, {
        key: '_mouseDown',
        value: function _mouseDown(e) {
            if (this.options.cursorHover) {
                utils.style(e.currentTarget, 'cursor', this.options.cursorDown);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3J0YWJsZS5qcyJdLCJuYW1lcyI6WyJFdmVudHMiLCJyZXF1aXJlIiwiZGVmYXVsdHMiLCJ1dGlscyIsIlNvcnRhYmxlIiwiZWxlbWVudCIsIm9wdGlvbnMiLCJfYWRkVG9HbG9iYWxUcmFja2VyIiwiZWxlbWVudHMiLCJfZ2V0Q2hpbGRyZW4iLCJjaGlsZCIsImRyYWdDbGFzcyIsImNvbnRhaW5zQ2xhc3NOYW1lIiwiYXR0YWNoRWxlbWVudCIsImV2ZW50cyIsImRyYWdPdmVyIiwiZSIsIl9kcmFnT3ZlciIsImRyb3AiLCJfZHJvcCIsImRyYWdMZWF2ZSIsIl9kcmFnTGVhdmUiLCJtb3VzZU92ZXIiLCJfbW91c2VFbnRlciIsImFkZEV2ZW50TGlzdGVuZXIiLCJjdXJzb3JIb3ZlciIsInN0eWxlIiwiY3Vyc29yRG93biIsIl9tb3VzZURvd24iLCJyZW1vdmVFdmVudExpc3RlbmVyIiwicmVtb3ZlRWxlbWVudCIsImluZGV4Iiwic29ydCIsImNoaWxkcmVuIiwibGVuZ3RoIiwiYXBwZW5kQ2hpbGQiLCJpbnNlcnRCZWZvcmUiLCJpZCIsIm9yZGVySWQiLCJkcmFnT3JkZXIiLCJnZXRBdHRyaWJ1dGUiLCJvcmRlcklkSXNOdW1iZXIiLCJwYXJzZUZsb2F0IiwiZm91bmQiLCJyZXZlcnNlT3JkZXIiLCJpIiwiY2hpbGREcmFnT3JkZXIiLCJvcmRlcklzTnVtYmVyIiwicGFyZW50Tm9kZSIsIl9fc29ydGFibGUiLCJvcmlnaW5hbCIsInNvcnRhYmxlIiwiZHJhZ1N0YXJ0IiwiX2RyYWdTdGFydCIsIl9tYXhpbXVtQ291bnRlciIsIm5hbWUiLCJ0cmFja2VyIiwiY291bnRlciIsImNvcHkiLCJzZXRBdHRyaWJ1dGUiLCJkcmFnTW92ZSIsImRyYWdJbWFnZSIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImJvZHkiLCJfYm9keURyYWdPdmVyIiwiX2JvZHlEcm9wIiwibGlzdCIsInB1c2giLCJkYXRhVHJhbnNmZXIiLCJ0eXBlcyIsImdldEVsZW1lbnRCeUlkIiwiX2ZpbmRDbG9zZXN0IiwibGFzdCIsIk1hdGgiLCJhYnMiLCJ4IiwicGFnZVgiLCJ0aHJlc2hvbGQiLCJ5IiwicGFnZVkiLCJfdXBkYXRlRHJhZ2dpbmciLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsIl9wbGFjZUluTGlzdCIsImRyb3BFZmZlY3QiLCJfbm9Ecm9wIiwiY2FuY2VsIiwiX3NldEljb24iLCJvZmZMaXN0IiwiZGlzcGxheSIsImVtaXQiLCJfcmVwbGFjZUluTGlzdCIsImN1cnJlbnQiLCJfY2xlYXJNYXhpbXVtUGVuZGluZyIsIl9yZW1vdmVEcmFnZ2luZyIsInJlbW92ZSIsImN1cnJlbnRUYXJnZXQiLCJkcmFnZ2luZyIsImNsb25lTm9kZSIsImRyYWdTdHlsZSIsInBvcyIsInRvR2xvYmFsIiwibGVmdCIsInRvcCIsIm9mZnNldCIsInVzZUljb25zIiwiaW1hZ2UiLCJJbWFnZSIsInNyYyIsImljb25zIiwicmVvcmRlciIsInBvc2l0aW9uIiwidHJhbnNmb3JtIiwib2Zmc2V0TGVmdCIsIm9mZnNldFdpZHRoIiwib2Zmc2V0VG9wIiwib2Zmc2V0SGVpZ2h0IiwiaWNvbiIsInRhcmdldCIsImlzQ29weSIsImNsZWFyRGF0YSIsInNldERhdGEiLCJzZXREcmFnSW1hZ2UiLCJfZ2V0SW5kZXgiLCJfbWF4aW11bSIsIm1pbiIsIkluZmluaXR5IiwicmVsYXRlZCIsImluc2lkZSIsImNhbGN1bGF0ZSIsImRpc3RhbmNlVG9DbG9zZXN0Q29ybmVyIiwiX3BsYWNlSW5Tb3J0YWJsZUxpc3QiLCJfcGxhY2VJbk9yZGVyZWRMaXN0IiwiYmFzZSIsInNlYXJjaCIsInJlc3VsdHMiLCJpbmRleE9mIiwiY2xhc3NOYW1lIiwiX3RyYXZlcnNlQ2hpbGRyZW4iLCJvcmRlciIsImRlZXBTZWFyY2giLCJvcmRlckNsYXNzIiwiX21heGltdW1QZW5kaW5nIiwiY3Vyc29yIiwieGExIiwieWExIiwieGEyIiwieWEyIiwibGFyZ2VzdCIsImNsb3Nlc3QiLCJpc0JlZm9yZSIsImluZGljYXRvciIsInhiMSIsInliMSIsInhiMiIsInliMiIsInBlcmNlbnRhZ2UiLCJuZXh0U2libGluZyIsImRpc3RhbmNlIiwibWVhc3VyZSIsIl9wbGFjZUJ5RGlzdGFuY2UiLCJkZWxldGUiLCJtb3ZlIiwiY291bnQiLCJtYXhpbXVtIiwicmVtb3ZlUGVuZGluZyIsInBvcCIsInNhdmVQZW5kaW5nIiwic2xpY2UiLCJtYXhpbXVtRklGTyIsImEiLCJiIiwiaGlkZSIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxTQUFTQyxRQUFRLGVBQVIsQ0FBZjs7QUFFQSxJQUFNQyxXQUFXRCxRQUFRLFlBQVIsQ0FBakI7QUFDQSxJQUFNRSxRQUFRRixRQUFRLFNBQVIsQ0FBZDs7SUFFTUcsUTs7O0FBRUY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUEyQ0Esc0JBQVlDLE9BQVosRUFBcUJDLE9BQXJCLEVBQ0E7QUFBQTs7QUFBQTs7QUFFSSxjQUFLQSxPQUFMLEdBQWVILE1BQU1HLE9BQU4sQ0FBY0EsT0FBZCxFQUF1QkosUUFBdkIsQ0FBZjtBQUNBLGNBQUtHLE9BQUwsR0FBZUEsT0FBZjtBQUNBLGNBQUtFLG1CQUFMO0FBQ0EsWUFBTUMsV0FBVyxNQUFLQyxZQUFMLEVBQWpCO0FBTEo7QUFBQTtBQUFBOztBQUFBO0FBTUksaUNBQWtCRCxRQUFsQiw4SEFDQTtBQUFBLG9CQURTRSxLQUNUOztBQUNJLG9CQUFJLENBQUMsTUFBS0osT0FBTCxDQUFhSyxTQUFkLElBQTJCUixNQUFNUyxpQkFBTixDQUF3QkYsS0FBeEIsRUFBK0IsTUFBS0osT0FBTCxDQUFhSyxTQUE1QyxDQUEvQixFQUNBO0FBQ0ksMEJBQUtFLGFBQUwsQ0FBbUJILEtBQW5CO0FBQ0g7QUFDSjtBQVpMO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBYUksY0FBS0ksTUFBTCxH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OzsrQkFLY25CLFEsRUFBVUYsTyxFQUN4QjtBQUNJLGdCQUFNa0ksVUFBVSxFQUFoQjtBQURKO0FBQUE7QUFBQTs7QUFBQTtBQUVJLHVDQUFvQmhJLFFBQXBCLHdJQUNBO0FBQUEsd0JBRFNILE9BQ1Q7O0FBQ0ltSSw0QkFBUXBFLElBQVIsQ0FBYSxJQUFJaEUsUUFBSixDQUFhQyxPQUFiLEVBQXNCQyxPQUF0QixDQUFiO0FBQ0g7QUFMTDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQU1JLG1CQUFPa0ksT0FBUDtBQUNIOzs7NEJBakJEO0FBQ0ksbUJBQU90SSxRQUFQO0FBQ0g7Ozs7RUF2R2tCRixNOztBQWlrQ3ZCOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E4SyxPQUFPQyxPQUFQLEdBQWlCM0ssUUFBakIiLCJmaWxlIjoic29ydGFibGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBFdmVudHMgPSByZXF1aXJlKCdldmVudGVtaXR0ZXIzJylcclxuXHJcbmNvbnN0IGRlZmF1bHRzID0gcmVxdWlyZSgnLi9kZWZhdWx0cycpXHJcbmNvbnN0IHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXHJcblxyXG5jbGFzcyBTb3J0YWJsZSBleHRlbmRzIEV2ZW50c1xyXG57XHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBzb3J0YWJsZSBsaXN0XHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMubmFtZT1zb3J0YWJsZV0gZHJhZ2dpbmcgaXMgYWxsb3dlZCBiZXR3ZWVuIFNvcnRhYmxlcyB3aXRoIHRoZSBzYW1lIG5hbWVcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5kcmFnQ2xhc3NdIGlmIHNldCB0aGVuIGRyYWcgb25seSBpdGVtcyB3aXRoIHRoaXMgY2xhc3NOYW1lIHVuZGVyIGVsZW1lbnQ7IG90aGVyd2lzZSBkcmFnIGFsbCBjaGlsZHJlblxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLm9yZGVyQ2xhc3NdIHVzZSB0aGlzIGNsYXNzIHRvIGluY2x1ZGUgZWxlbWVudHMgaW4gb3JkZXJpbmcgYnV0IG5vdCBkcmFnZ2luZzsgb3RoZXJ3aXNlIGFsbCBjaGlsZHJlbiBlbGVtZW50cyBhcmUgaW5jbHVkZWQgaW4gd2hlbiBzb3J0aW5nIGFuZCBvcmRlcmluZ1xyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5kZWVwU2VhcmNoXSBpZiBkcmFnQ2xhc3MgYW5kIGRlZXBTZWFyY2ggdGhlbiBzZWFyY2ggYWxsIGRlc2NlbmRlbnRzIG9mIGVsZW1lbnQgZm9yIGRyYWdDbGFzc1xyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5zb3J0PXRydWVdIGFsbG93IHNvcnRpbmcgd2l0aGluIGxpc3RcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuZHJvcD10cnVlXSBhbGxvdyBkcm9wIGZyb20gcmVsYXRlZCBzb3J0YWJsZXMgKGRvZXNuJ3QgaW1wYWN0IHJlb3JkZXJpbmcgdGhpcyBzb3J0YWJsZSdzIGNoaWxkcmVuIHVudGlsIHRoZSBjaGlsZHJlbiBhcmUgbW92ZWQgdG8gYSBkaWZmZXJlbiBzb3J0YWJsZSlcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuY29weT1mYWxzZV0gY3JlYXRlIGNvcHkgd2hlbiBkcmFnZ2luZyBhbiBpdGVtICh0aGlzIGRpc2FibGVzIHNvcnQ9dHJ1ZSBmb3IgdGhpcyBzb3J0YWJsZSlcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5vcmRlcklkPWRhdGEtb3JkZXJdIGZvciBvcmRlcmVkIGxpc3RzLCB1c2UgdGhpcyBkYXRhIGlkIHRvIGZpZ3VyZSBvdXQgc29ydCBvcmRlclxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5vcmRlcklkSXNOdW1iZXI9dHJ1ZV0gdXNlIHBhcnNlSW50IG9uIG9wdGlvbnMuc29ydElkIHRvIHByb3Blcmx5IHNvcnQgbnVtYmVyc1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnJldmVyc2VPcmRlcl0gcmV2ZXJzZSBzb3J0IHRoZSBvcmRlcklkXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMub2ZmTGlzdD1jbG9zZXN0XSBob3cgdG8gaGFuZGxlIHdoZW4gYW4gZWxlbWVudCBpcyBkcm9wcGVkIG91dHNpZGUgYSBzb3J0YWJsZTogY2xvc2VzdD1kcm9wIGluIGNsb3Nlc3Qgc29ydGFibGU7IGNhbmNlbD1yZXR1cm4gdG8gc3RhcnRpbmcgc29ydGFibGU7IGRlbGV0ZT1yZW1vdmUgZnJvbSBhbGwgc29ydGFibGVzXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWF4aW11bV0gbWF4aW11bSBudW1iZXIgb2YgZWxlbWVudHMgYWxsb3dlZCBpbiBhIHNvcnRhYmxlIGxpc3RcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubWF4aW11bUZJRk9dIGRpcmVjdGlvbiBvZiBzZWFyY2ggdG8gY2hvb3NlIHdoaWNoIGl0ZW0gdG8gcmVtb3ZlIHdoZW4gbWF4aW11bSBpcyByZWFjaGVkXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuY3Vyc29ySG92ZXI9Z3JhYiAtd2Via2l0LWdyYWIgcG9pbnRlcl0gdXNlIHRoaXMgY3Vyc29yIGxpc3QgdG8gc2V0IGN1cnNvciB3aGVuIGhvdmVyaW5nIG92ZXIgYSBzb3J0YWJsZSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuY3Vyc29yRG93bj1ncmFiYmluZyAtd2Via2l0LWdyYWJiaW5nIHBvaW50ZXJdIHVzZSB0aGlzIGN1cnNvciBsaXN0IHRvIHNldCBjdXJzb3Igd2hlbiBtb3VzZWRvd24vdG91Y2hkb3duIG92ZXIgYSBzb3J0YWJsZSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnVzZUljb25zPXRydWVdIHNob3cgaWNvbnMgd2hlbiBkcmFnZ2luZ1xyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zLmljb25zXSBkZWZhdWx0IHNldCBvZiBpY29uc1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmljb25zLnJlb3JkZXJdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuaWNvbnMubW92ZV1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5pY29ucy5jb3B5XVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmljb25zLmRlbGV0ZV1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5jdXN0b21JY29uXSBzb3VyY2Ugb2YgY3VzdG9tIGltYWdlIHdoZW4gb3ZlciB0aGlzIHNvcnRhYmxlXHJcbiAgICAgKiBAZmlyZXMgcGlja3VwXHJcbiAgICAgKiBAZmlyZXMgb3JkZXJcclxuICAgICAqIEBmaXJlcyBhZGRcclxuICAgICAqIEBmaXJlcyByZW1vdmVcclxuICAgICAqIEBmaXJlcyB1cGRhdGVcclxuICAgICAqIEBmaXJlcyBkZWxldGVcclxuICAgICAqIEBmaXJlcyBjb3B5XHJcbiAgICAgKiBAZmlyZXMgbWF4aW11bS1yZW1vdmVcclxuICAgICAqIEBmaXJlcyBvcmRlci1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgYWRkLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyByZW1vdmUtcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIGFkZC1yZW1vdmUtcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIHVwZGF0ZS1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgZGVsZXRlLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyBjb3B5LXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyBtYXhpbXVtLXJlbW92ZS1wZW5kaW5nXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgc3VwZXIoKVxyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IHV0aWxzLm9wdGlvbnMob3B0aW9ucywgZGVmYXVsdHMpXHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudFxyXG4gICAgICAgIHRoaXMuX2FkZFRvR2xvYmFsVHJhY2tlcigpXHJcbiAgICAgICAgY29uc3QgZWxlbWVudHMgPSB0aGlzLl9nZXRDaGlsZHJlbigpXHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgZWxlbWVudHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5kcmFnQ2xhc3MgfHwgdXRpbHMuY29udGFpbnNDbGFzc05hbWUoY2hpbGQsIHRoaXMub3B0aW9ucy5kcmFnQ2xhc3MpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmF0dGFjaEVsZW1lbnQoY2hpbGQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5ldmVudHMgPSB7XHJcbiAgICAgICAgICAgIGRyYWdPdmVyOiAoZSkgPT4gdGhpcy5fZHJhZ092ZXIoZSksXHJcbiAgICAgICAgICAgIGRyb3A6IChlKSA9PiB0aGlzLl9kcm9wKGUpLFxyXG4gICAgICAgICAgICBkcmFnTGVhdmU6IChlKSA9PiB0aGlzLl9kcmFnTGVhdmUoZSksXHJcbiAgICAgICAgICAgIG1vdXNlT3ZlcjogKGUpID0+IHRoaXMuX21vdXNlRW50ZXIoZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIHRoaXMuZXZlbnRzLmRyYWdPdmVyKVxyXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIHRoaXMuZXZlbnRzLmRyb3ApXHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdkcmFnbGVhdmUnLCB0aGlzLmV2ZW50cy5kcmFnTGVhdmUpXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIHRoaXMuX2dldENoaWxkcmVuKCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHV0aWxzLnN0eWxlKGNoaWxkLCAnY3Vyc29yJywgdGhpcy5vcHRpb25zLmN1cnNvckhvdmVyKVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jdXJzb3JEb3duKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChlKSA9PiB0aGlzLl9tb3VzZURvd24oZSkpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZW1vdmVzIGFsbCBldmVudCBoYW5kbGVycyBmcm9tIHRoaXMuZWxlbWVudCBhbmQgY2hpbGRyZW5cclxuICAgICAqL1xyXG4gICAgZGVzdHJveSgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgdGhpcy5ldmVudHMuZHJhZ092ZXIpXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLmV2ZW50cy5kcm9wKVxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnRzID0gdGhpcy5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGVsZW1lbnRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVFbGVtZW50KGNoaWxkKVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB0b2RvOiByZW1vdmUgU29ydGFibGUudHJhY2tlciBhbmQgcmVsYXRlZCBldmVudCBoYW5kbGVycyBpZiBubyBtb3JlIHNvcnRhYmxlc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdGhlIGdsb2JhbCBkZWZhdWx0cyBmb3IgbmV3IFNvcnRhYmxlIG9iamVjdHNcclxuICAgICAqIEB0eXBlIHtEZWZhdWx0T3B0aW9uc31cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldCBkZWZhdWx0cygpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjcmVhdGUgbXVsdGlwbGUgc29ydGFibGUgZWxlbWVudHNcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnRzW119IGVsZW1lbnRzXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyAtIHNlZSBjb25zdHJ1Y3RvciBmb3Igb3B0aW9uc1xyXG4gICAgICovXHJcbiAgICBzdGF0aWMgY3JlYXRlKGVsZW1lbnRzLCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXVxyXG4gICAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgZWxlbWVudHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXN1bHRzLnB1c2gobmV3IFNvcnRhYmxlKGVsZW1lbnQsIG9wdGlvbnMpKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0c1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYWRkIGFuIGVsZW1lbnQgYXMgYSBjaGlsZCBvZiB0aGUgc29ydGFibGUgZWxlbWVudDsgY2FuIGFsc28gYmUgdXNlZCB0byBzd2FwIGJldHdlZW4gc29ydGFibGVzXHJcbiAgICAgKiBOT1RFOiB0aGlzIG1heSBub3Qgd29yayB3aXRoIGRlZXBTZWFyY2ggbm9uLW9yZGVyZWQgZWxlbWVudHM7IHVzZSBhdHRhY2hFbGVtZW50IGluc3RlYWRcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleFxyXG4gICAgICovXHJcbiAgICBhZGQoZWxlbWVudCwgaW5kZXgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5hdHRhY2hFbGVtZW50KGVsZW1lbnQpXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zb3J0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBpbmRleCA9PT0gJ3VuZGVmaW5lZCcgfHwgaW5kZXggPj0gdGhpcy5lbGVtZW50LmNoaWxkcmVuLmxlbmd0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuaW5zZXJ0QmVmb3JlKGVsZW1lbnQsIHRoaXMuZWxlbWVudC5jaGlsZHJlbltpbmRleCArIDFdKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gdGhpcy5vcHRpb25zLm9yZGVySWRcclxuICAgICAgICAgICAgbGV0IGRyYWdPcmRlciA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICBkcmFnT3JkZXIgPSB0aGlzLm9wdGlvbnMub3JkZXJJZElzTnVtYmVyID8gcGFyc2VGbG9hdChkcmFnT3JkZXIpIDogZHJhZ09yZGVyXHJcbiAgICAgICAgICAgIGxldCBmb3VuZFxyXG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuX2dldENoaWxkcmVuKHRydWUpXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmV2ZXJzZU9yZGVyKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBjaGlsZHJlbltpXVxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZERyYWdPcmRlciA9IGNoaWxkLmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZERyYWdPcmRlciA9IHRoaXMub3B0aW9ucy5vcmRlcklzTnVtYmVyID8gcGFyc2VGbG9hdChjaGlsZERyYWdPcmRlcikgOiBjaGlsZERyYWdPcmRlclxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnT3JkZXIgPiBjaGlsZERyYWdPcmRlcilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGVsZW1lbnQsIGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBjaGlsZHJlbilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGREcmFnT3JkZXIgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGREcmFnT3JkZXIgPSB0aGlzLm9wdGlvbnMub3JkZXJJc051bWJlciA/IHBhcnNlRmxvYXQoY2hpbGREcmFnT3JkZXIpIDogY2hpbGREcmFnT3JkZXJcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ09yZGVyIDwgY2hpbGREcmFnT3JkZXIpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShlbGVtZW50LCBjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghZm91bmQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChlbGVtZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYXR0YWNoZXMgYW4gSFRNTCBlbGVtZW50IHRvIHRoZSBzb3J0YWJsZTsgY2FuIGFsc28gYmUgdXNlZCB0byBzd2FwIGJldHdlZW4gc29ydGFibGVzXHJcbiAgICAgKiBOT1RFOiB5b3UgbmVlZCB0byBtYW51YWxseSBpbnNlcnQgdGhlIGVsZW1lbnQgaW50byB0aGlzLmVsZW1lbnQgKHRoaXMgaXMgdXNlZnVsIHdoZW4geW91IGhhdmUgYSBkZWVwIHN0cnVjdHVyZSlcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqL1xyXG4gICAgYXR0YWNoRWxlbWVudChlbGVtZW50KVxyXG4gICAge1xyXG4gICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgPSB0aGlzXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZSA9IHtcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlOiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgb3JpZ2luYWw6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBkcmFnU3RhcnQ6IChlKSA9PiB0aGlzLl9kcmFnU3RhcnQoZSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gYWRkIGEgY291bnRlciBmb3IgbWF4aW11bVxyXG4gICAgICAgICAgICB0aGlzLl9tYXhpbXVtQ291bnRlcihlbGVtZW50LCB0aGlzKVxyXG5cclxuICAgICAgICAgICAgLy8gZW5zdXJlIGV2ZXJ5IGVsZW1lbnQgaGFzIGFuIGlkXHJcbiAgICAgICAgICAgIGlmICghZWxlbWVudC5pZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5pZCA9ICdfX3NvcnRhYmxlLScgKyB0aGlzLm9wdGlvbnMubmFtZSArICctJyArIFNvcnRhYmxlLnRyYWNrZXJbdGhpcy5vcHRpb25zLm5hbWVdLmNvdW50ZXJcclxuICAgICAgICAgICAgICAgIFNvcnRhYmxlLnRyYWNrZXJbdGhpcy5vcHRpb25zLm5hbWVdLmNvdW50ZXIrK1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY29weSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmNvcHkgPSAwXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdkcmFnc3RhcnQnLCBlbGVtZW50Ll9fc29ydGFibGUuZHJhZ1N0YXJ0KVxyXG4gICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnZHJhZ2dhYmxlJywgdHJ1ZSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZW1vdmVzIGFsbCBldmVudHMgZnJvbSBhbiBIVE1MIGVsZW1lbnRcclxuICAgICAqIE5PVEU6IGRvZXMgbm90IHJlbW92ZSB0aGUgZWxlbWVudCBmcm9tIGl0cyBwYXJlbnRcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqL1xyXG4gICAgcmVtb3ZlRWxlbWVudChlbGVtZW50KVxyXG4gICAge1xyXG4gICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZWxlbWVudC5kcmFnTW92ZSlcclxuICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBlbGVtZW50LmRyYWdNb3ZlKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYWRkIHNvcnRhYmxlIHRvIGdsb2JhbCBsaXN0IHRoYXQgdHJhY2tzIGFsbCBzb3J0YWJsZXNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9hZGRUb0dsb2JhbFRyYWNrZXIoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICghU29ydGFibGUudHJhY2tlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFNvcnRhYmxlLmRyYWdJbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgICAgICAgIFNvcnRhYmxlLmRyYWdJbWFnZS5pZCA9ICdzb3J0YWJsZS1kcmFnSW1hZ2UnXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoU29ydGFibGUuZHJhZ0ltYWdlKVxyXG4gICAgICAgICAgICBTb3J0YWJsZS50cmFja2VyID0ge31cclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIChlKSA9PiB0aGlzLl9ib2R5RHJhZ092ZXIoZSkpXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIChlKSA9PiB0aGlzLl9ib2R5RHJvcChlKSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKFNvcnRhYmxlLnRyYWNrZXJbdGhpcy5vcHRpb25zLm5hbWVdKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgU29ydGFibGUudHJhY2tlclt0aGlzLm9wdGlvbnMubmFtZV0ubGlzdC5wdXNoKHRoaXMpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFNvcnRhYmxlLnRyYWNrZXJbdGhpcy5vcHRpb25zLm5hbWVdID0geyBsaXN0OiBbdGhpc10sIGNvdW50ZXI6IDAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGRlZmF1bHQgZHJhZyBvdmVyIGZvciB0aGUgYm9keVxyXG4gICAgICogQHBhcmFtIHtEcmFnRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9ib2R5RHJhZ092ZXIoZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBuYW1lID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMF1cclxuICAgICAgICBpZiAobmFtZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMV1cclxuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxyXG4gICAgICAgICAgICBjb25zdCBzb3J0YWJsZSA9IHRoaXMuX2ZpbmRDbG9zZXN0KGUsIFNvcnRhYmxlLnRyYWNrZXJbbmFtZV0ubGlzdCwgZWxlbWVudClcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc29ydGFibGUubGFzdCAmJiBNYXRoLmFicyhzb3J0YWJsZS5sYXN0LnggLSBlLnBhZ2VYKSA8IHNvcnRhYmxlLm9wdGlvbnMudGhyZXNob2xkICYmIE1hdGguYWJzKHNvcnRhYmxlLmxhc3QueSAtIGUucGFnZVkpIDwgc29ydGFibGUub3B0aW9ucy50aHJlc2hvbGQpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZS5fdXBkYXRlRHJhZ2dpbmcoZSwgZWxlbWVudClcclxuICAgICAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlLmxhc3QgPSB7IHg6IGUucGFnZVgsIHk6IGUucGFnZVkgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3BsYWNlSW5MaXN0KHNvcnRhYmxlLCBlLnBhZ2VYLCBlLnBhZ2VZLCBlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgICAgIGUuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSAnbW92ZSdcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVEcmFnZ2luZyhlLCBlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX25vRHJvcChlKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgbm8gZHJvcFxyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBlXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjYW5jZWxdIGZvcmNlIGNhbmNlbCAoZm9yIG9wdGlvbnMuY29weSlcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9ub0Ryb3AoZSwgY2FuY2VsKVxyXG4gICAge1xyXG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSAnbW92ZSdcclxuICAgICAgICBjb25zdCBpZCA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzFdXHJcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxyXG4gICAgICAgIGlmIChlbGVtZW50KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlRHJhZ2dpbmcoZSwgZWxlbWVudClcclxuICAgICAgICAgICAgdGhpcy5fc2V0SWNvbihlbGVtZW50LCBudWxsLCBjYW5jZWwpXHJcbiAgICAgICAgICAgIGlmICghY2FuY2VsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsLm9wdGlvbnMub2ZmTGlzdCA9PT0gJ2RlbGV0ZScpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5ID0gZWxlbWVudC5zdHlsZS5kaXNwbGF5IHx8ICd1bnNldCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbC5lbWl0KCdkZWxldGUtcGVuZGluZycsIGVsZW1lbnQsIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbClcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmICghZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsLm9wdGlvbnMuY29weSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZXBsYWNlSW5MaXN0KGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCwgZWxlbWVudClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2NsZWFyTWF4aW11bVBlbmRpbmcoZWxlbWVudC5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuY3VycmVudC5lbWl0KCdhZGQtcmVtb3ZlLXBlbmRpbmcnLCBlbGVtZW50LCBlbGVtZW50Ll9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5jdXJyZW50LmVtaXQoJ3VwZGF0ZS1wZW5kaW5nJywgZWxlbWVudCwgZWxlbWVudC5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuY3VycmVudCA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGRlZmF1bHQgZHJvcCBmb3IgdGhlIGJvZHlcclxuICAgICAqIEBwYXJhbSB7RHJhZ0V2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfYm9keURyb3AoZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBuYW1lID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMF1cclxuICAgICAgICBpZiAobmFtZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMV1cclxuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxyXG4gICAgICAgICAgICBjb25zdCBzb3J0YWJsZSA9IHRoaXMuX2ZpbmRDbG9zZXN0KGUsIFNvcnRhYmxlLnRyYWNrZXJbbmFtZV0ubGlzdCwgZWxlbWVudClcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlbW92ZURyYWdnaW5nKGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmUoKVxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkgPSBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsLmVtaXQoJ2RlbGV0ZScsIGVsZW1lbnQsIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbClcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgPSBudWxsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzdGFydCBkcmFnXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kcmFnU3RhcnQoZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBzb3J0YWJsZSA9IGUuY3VycmVudFRhcmdldC5fX3NvcnRhYmxlLm9yaWdpbmFsXHJcbiAgICAgICAgY29uc3QgZHJhZ2dpbmcgPSBlLmN1cnJlbnRUYXJnZXQuY2xvbmVOb2RlKHRydWUpXHJcbiAgICAgICAgZm9yIChsZXQgc3R5bGUgaW4gc29ydGFibGUub3B0aW9ucy5kcmFnU3R5bGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5zdHlsZVtzdHlsZV0gPSBzb3J0YWJsZS5vcHRpb25zLmRyYWdTdHlsZVtzdHlsZV1cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcG9zID0gdXRpbHMudG9HbG9iYWwoZS5jdXJyZW50VGFyZ2V0KVxyXG4gICAgICAgIGRyYWdnaW5nLnN0eWxlLmxlZnQgPSBwb3MueCArICdweCdcclxuICAgICAgICBkcmFnZ2luZy5zdHlsZS50b3AgPSBwb3MueSArICdweCdcclxuICAgICAgICBjb25zdCBvZmZzZXQgPSB7IHg6IHBvcy54IC0gZS5wYWdlWCwgeTogcG9zLnkgLSBlLnBhZ2VZIH1cclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRyYWdnaW5nKVxyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLnVzZUljb25zKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKVxyXG4gICAgICAgICAgICBpbWFnZS5zcmMgPSBzb3J0YWJsZS5vcHRpb25zLmljb25zLnJlb3JkZXJcclxuICAgICAgICAgICAgaW1hZ2Uuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoLTUwJSwgLTUwJSknXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLmxlZnQgPSBkcmFnZ2luZy5vZmZzZXRMZWZ0ICsgZHJhZ2dpbmcub2Zmc2V0V2lkdGggKyAncHgnXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLnRvcCA9IGRyYWdnaW5nLm9mZnNldFRvcCArIGRyYWdnaW5nLm9mZnNldEhlaWdodCArICdweCdcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpbWFnZSlcclxuICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbiA9IGltYWdlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLmN1cnNvckhvdmVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdXRpbHMuc3R5bGUoZS5jdXJyZW50VGFyZ2V0LCAnY3Vyc29yJywgc29ydGFibGUub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHRhcmdldCA9IGUuY3VycmVudFRhcmdldFxyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLmNvcHkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0YXJnZXQgPSBlLmN1cnJlbnRUYXJnZXQuY2xvbmVOb2RlKHRydWUpXHJcbiAgICAgICAgICAgIHRhcmdldC5pZCA9IGUuY3VycmVudFRhcmdldC5pZCArICctY29weS0nICsgZS5jdXJyZW50VGFyZ2V0Ll9fc29ydGFibGUuY29weVxyXG4gICAgICAgICAgICBlLmN1cnJlbnRUYXJnZXQuX19zb3J0YWJsZS5jb3B5KytcclxuICAgICAgICAgICAgc29ydGFibGUuYXR0YWNoRWxlbWVudCh0YXJnZXQpXHJcbiAgICAgICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLmlzQ29weSA9IHRydWVcclxuICAgICAgICAgICAgdGFyZ2V0Ll9fc29ydGFibGUub3JpZ2luYWwgPSB0aGlzXHJcbiAgICAgICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLmRpc3BsYXkgPSB0YXJnZXQuc3R5bGUuZGlzcGxheSB8fCAndW5zZXQnXHJcbiAgICAgICAgICAgIHRhcmdldC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGFyZ2V0KVxyXG4gICAgICAgIH1cclxuICAgICAgICBlLmRhdGFUcmFuc2Zlci5jbGVhckRhdGEoKVxyXG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLnNldERhdGEoc29ydGFibGUub3B0aW9ucy5uYW1lLCBzb3J0YWJsZS5vcHRpb25zLm5hbWUpXHJcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuc2V0RGF0YSh0YXJnZXQuaWQsIHRhcmdldC5pZClcclxuICAgICAgICBlLmRhdGFUcmFuc2Zlci5zZXREcmFnSW1hZ2UoU29ydGFibGUuZHJhZ0ltYWdlLCAwLCAwKVxyXG4gICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLmN1cnJlbnQgPSB0aGlzXHJcbiAgICAgICAgdGFyZ2V0Ll9fc29ydGFibGUuaW5kZXggPSBzb3J0YWJsZS5vcHRpb25zLmNvcHkgPyAtMSA6IHNvcnRhYmxlLl9nZXRJbmRleCh0YXJnZXQpXHJcbiAgICAgICAgdGFyZ2V0Ll9fc29ydGFibGUuZHJhZ2dpbmcgPSBkcmFnZ2luZ1xyXG4gICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLm9mZnNldCA9IG9mZnNldFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIGRyYWcgbGVhdmUgZXZlbnRzIGZvciBzb3J0YWJsZSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge0RyYWdFdmVudH0gZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2RyYWdMZWF2ZShlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHNvcnRhYmxlID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMF1cclxuICAgICAgICBpZiAoc29ydGFibGUgJiYgc29ydGFibGUgPT09IHRoaXMub3B0aW9ucy5uYW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fY2xlYXJNYXhpbXVtUGVuZGluZyhzb3J0YWJsZSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgZHJhZyBvdmVyIGV2ZW50cyBmb3Igc29ydGFibGUgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtEcmFnRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kcmFnT3ZlcihlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHNvcnRhYmxlID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMF1cclxuICAgICAgICBpZiAoc29ydGFibGUgJiYgc29ydGFibGUgPT09IHRoaXMub3B0aW9ucy5uYW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1sxXVxyXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmxhc3QgJiYgTWF0aC5hYnModGhpcy5sYXN0LnggLSBlLnBhZ2VYKSA8IHRoaXMub3B0aW9ucy50aHJlc2hvbGQgJiYgTWF0aC5hYnModGhpcy5sYXN0LnkgLSBlLnBhZ2VZKSA8IHRoaXMub3B0aW9ucy50aHJlc2hvbGQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZURyYWdnaW5nKGUsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMubGFzdCA9IHsgeDogZS5wYWdlWCwgeTogZS5wYWdlWSB9XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUuaXNDb3B5ICYmIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9PT0gdGhpcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbm9Ecm9wKGUsIHRydWUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5vcHRpb25zLmRyb3AgfHwgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsID09PSB0aGlzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wbGFjZUluTGlzdCh0aGlzLCBlLnBhZ2VYLCBlLnBhZ2VZLCBlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgZS5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9IGVsZW1lbnQuX19zb3J0YWJsZS5pc0NvcHkgPyAnY29weScgOiAnbW92ZSdcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZURyYWdnaW5nKGUsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9ub0Ryb3AoZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfdXBkYXRlRHJhZ2dpbmcoZSwgZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBkcmFnZ2luZyA9IGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnZ2luZ1xyXG4gICAgICAgIGNvbnN0IG9mZnNldCA9IGVsZW1lbnQuX19zb3J0YWJsZS5vZmZzZXRcclxuICAgICAgICBpZiAoZHJhZ2dpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5zdHlsZS5sZWZ0ID0gZS5wYWdlWCArIG9mZnNldC54ICsgJ3B4J1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5zdHlsZS50b3AgPSBlLnBhZ2VZICsgb2Zmc2V0LnkgKyAncHgnXHJcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZy5pY29uKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnN0eWxlLmxlZnQgPSBkcmFnZ2luZy5vZmZzZXRMZWZ0ICsgZHJhZ2dpbmcub2Zmc2V0V2lkdGggKyAncHgnXHJcbiAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnN0eWxlLnRvcCA9IGRyYWdnaW5nLm9mZnNldFRvcCArIGRyYWdnaW5nLm9mZnNldEhlaWdodCArICdweCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfcmVtb3ZlRHJhZ2dpbmcoZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBkcmFnZ2luZyA9IGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnZ2luZ1xyXG4gICAgICAgIGRyYWdnaW5nLnJlbW92ZSgpXHJcbiAgICAgICAgaWYgKGRyYWdnaW5nLmljb24pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5pY29uLnJlbW92ZSgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnZ2luZyA9IG51bGxcclxuICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuaXNDb3B5ID0gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBfZHJvcChlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IG5hbWUgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1swXVxyXG4gICAgICAgIGlmIChuYW1lICYmIG5hbWUgPT09IHRoaXMub3B0aW9ucy5uYW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1sxXVxyXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgIT09IHRoaXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbC5lbWl0KCdyZW1vdmUnLCBlbGVtZW50LCBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2FkZCcsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgPSB0aGlzXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNvcnQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdvcmRlcicsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLmlzQ29weSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2NvcHknLCBlbGVtZW50LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fbWF4aW11bShlbGVtZW50LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KCd1cGRhdGUnLCBlbGVtZW50LCB0aGlzKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5pbmRleCAhPT0gdGhpcy5fZ2V0SW5kZXgoZS5jdXJyZW50VGFyZ2V0KSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ29yZGVyJywgZWxlbWVudCwgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ3VwZGF0ZScsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlRHJhZ2dpbmcoZWxlbWVudClcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmaW5kIGNsb3Nlc3QgU29ydGFibGUgdG8gc2NyZWVuIGxvY2F0aW9uXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGVbXX0gbGlzdCBvZiByZWxhdGVkIFNvcnRhYmxlc1xyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2ZpbmRDbG9zZXN0KGUsIGxpc3QsIGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IG1pbiA9IEluZmluaXR5LCBmb3VuZFxyXG4gICAgICAgIGZvciAobGV0IHJlbGF0ZWQgb2YgbGlzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICgoIXJlbGF0ZWQub3B0aW9ucy5kcm9wICYmIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCAhPT0gcmVsYXRlZCkgfHxcclxuICAgICAgICAgICAgICAgIChlbGVtZW50Ll9fc29ydGFibGUuaXNDb3B5ICYmIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9PT0gcmVsYXRlZCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHV0aWxzLmluc2lkZShlLnBhZ2VYLCBlLnBhZ2VZLCByZWxhdGVkLmVsZW1lbnQpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVsYXRlZFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHJlbGF0ZWQub3B0aW9ucy5vZmZMaXN0ID09PSAnY2xvc2VzdCcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNhbGN1bGF0ZSA9IHV0aWxzLmRpc3RhbmNlVG9DbG9zZXN0Q29ybmVyKGUucGFnZVgsIGUucGFnZVksIHJlbGF0ZWQuZWxlbWVudClcclxuICAgICAgICAgICAgICAgIGlmIChjYWxjdWxhdGUgPCBtaW4pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWluID0gY2FsY3VsYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgZm91bmQgPSByZWxhdGVkXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZvdW5kXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwbGFjZSBpbmRpY2F0b3IgaW4gdGhlIHNvcnRhYmxlIGxpc3QgYWNjb3JkaW5nIHRvIG9wdGlvbnMuc29ydFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BsYWNlSW5MaXN0KHNvcnRhYmxlLCB4LCB5LCBlbGVtZW50KVxyXG4gICAge1xyXG4gICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5ID09PSAndW5zZXQnID8gJycgOiBlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheVxyXG4gICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheSA9IG51bGxcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zb3J0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fcGxhY2VJblNvcnRhYmxlTGlzdChzb3J0YWJsZSwgeCwgeSwgZWxlbWVudClcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fcGxhY2VJbk9yZGVyZWRMaXN0KHNvcnRhYmxlLCBlbGVtZW50KVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9zZXRJY29uKGVsZW1lbnQsIHNvcnRhYmxlKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVwbGFjZSBpdGVtIGluIGxpc3QgYXQgb3JpZ2luYWwgaW5kZXggcG9zaXRpb25cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9yZXBsYWNlSW5MaXN0KHNvcnRhYmxlLCBlbGVtZW50KVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gc29ydGFibGUuX2dldENoaWxkcmVuKClcclxuICAgICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaW5kZXggPSBlbGVtZW50Ll9fc29ydGFibGUuaW5kZXhcclxuICAgICAgICAgICAgaWYgKGluZGV4IDwgY2hpbGRyZW4ubGVuZ3RoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlbltpbmRleF0ucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZWxlbWVudCwgY2hpbGRyZW5baW5kZXhdKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2hpbGRyZW5bMF0uYXBwZW5kQ2hpbGQoZWxlbWVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbGVtZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIF9nZXRJbmRleChjaGlsZClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuX2dldENoaWxkcmVuKClcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGNoaWxkcmVuW2ldID09PSBjaGlsZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfdHJhdmVyc2VDaGlsZHJlbihiYXNlLCBzZWFyY2gsIHJlc3VsdHMpXHJcbiAgICB7XHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgYmFzZS5jaGlsZHJlbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChzZWFyY2gubGVuZ3RoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2VhcmNoLmluZGV4T2YoY2hpbGQuY2xhc3NOYW1lKSAhPT0gLTEpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGNoaWxkKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3RyYXZlcnNlQ2hpbGRyZW4oY2hpbGQsIHNlYXJjaCwgcmVzdWx0cylcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmaW5kIGNoaWxkcmVuIGluIGRpdlxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29yZGVyXSBzZWFyY2ggZm9yIGRyYWdPcmRlciBhcyB3ZWxsXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZ2V0Q2hpbGRyZW4ob3JkZXIpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kZWVwU2VhcmNoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IHNlYXJjaCA9IFtdXHJcbiAgICAgICAgICAgIGlmIChvcmRlciAmJiB0aGlzLm9wdGlvbnMub3JkZXJDbGFzcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoLnB1c2godGhpcy5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChvcmRlciAmJiB0aGlzLm9wdGlvbnMub3JkZXJDbGFzcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2gucHVzaCh0aGlzLm9wdGlvbnMub3JkZXJDbGFzcylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICghb3JkZXIgJiYgdGhpcy5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc2VhcmNoLnB1c2godGhpcy5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCByZXN1bHRzID0gW11cclxuICAgICAgICAgICAgdGhpcy5fdHJhdmVyc2VDaGlsZHJlbih0aGlzLmVsZW1lbnQsIHNlYXJjaCwgcmVzdWx0cylcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHNcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxldCBsaXN0ID0gW11cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIHRoaXMuZWxlbWVudC5jaGlsZHJlbilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodXRpbHMuY29udGFpbnNDbGFzc05hbWUoY2hpbGQsIHRoaXMub3B0aW9ucy5kcmFnQ2xhc3MpIHx8IChvcmRlciAmJiAhdGhpcy5vcHRpb25zLm9yZGVyQ2xhc3MgfHwgKG9yZGVyICYmIHRoaXMub3B0aW9ucy5vcmRlckNsYXNzICYmIHV0aWxzLmNvbnRhaW5zQ2xhc3NOYW1lKGNoaWxkLCB0aGlzLm9wdGlvbnMub3JkZXJDbGFzcykpKSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpc3QucHVzaChjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbGlzdFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbGlzdCA9IFtdXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiB0aGlzLmVsZW1lbnQuY2hpbGRyZW4pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGlzdC5wdXNoKGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGxpc3RcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBsYWNlIGluZGljYXRvciBpbiBhbiBvcmRlcmVkIGxpc3RcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BsYWNlSW5PcmRlcmVkTGlzdChzb3J0YWJsZSwgZHJhZ2dpbmcpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudCAhPT0gc29ydGFibGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IHNvcnRhYmxlLm9wdGlvbnMub3JkZXJJZFxyXG4gICAgICAgICAgICBsZXQgZHJhZ09yZGVyID0gZHJhZ2dpbmcuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICBkcmFnT3JkZXIgPSBzb3J0YWJsZS5vcHRpb25zLm9yZGVySWRJc051bWJlciA/IHBhcnNlRmxvYXQoZHJhZ09yZGVyKSA6IGRyYWdPcmRlclxyXG4gICAgICAgICAgICBsZXQgZm91bmRcclxuICAgICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4odHJ1ZSlcclxuICAgICAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMucmV2ZXJzZU9yZGVyKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBjaGlsZHJlbltpXVxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZERyYWdPcmRlciA9IGNoaWxkLmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZERyYWdPcmRlciA9IHNvcnRhYmxlLm9wdGlvbnMub3JkZXJJc051bWJlciA/IHBhcnNlRmxvYXQoY2hpbGREcmFnT3JkZXIpIDogY2hpbGREcmFnT3JkZXJcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ09yZGVyID4gY2hpbGREcmFnT3JkZXIpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShkcmFnZ2luZywgY2hpbGQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGNoaWxkcmVuKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZERyYWdPcmRlciA9IGNoaWxkLmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZERyYWdPcmRlciA9IHNvcnRhYmxlLm9wdGlvbnMub3JkZXJJc051bWJlciA/IHBhcnNlRmxvYXQoY2hpbGREcmFnT3JkZXIpIDogY2hpbGREcmFnT3JkZXJcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ09yZGVyIDwgY2hpbGREcmFnT3JkZXIpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShkcmFnZ2luZywgY2hpbGQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWZvdW5kKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbGVtZW50LmFwcGVuZENoaWxkKGRyYWdnaW5nKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgIT09IGRyYWdnaW5nLl9fc29ydGFibGUub3JpZ2luYWwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50LmVtaXQoJ2FkZC1yZW1vdmUtcGVuZGluZycsIGRyYWdnaW5nLCBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50LmVtaXQoJ3JlbW92ZS1wZW5kaW5nJywgZHJhZ2dpbmcsIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdhZGQtcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuaXNDb3B5KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdjb3B5LXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50ID0gc29ydGFibGVcclxuICAgICAgICAgICAgdGhpcy5fbWF4aW11bVBlbmRpbmcoZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCd1cGRhdGUtcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzZWFyY2ggZm9yIHdoZXJlIHRvIHBsYWNlIHVzaW5nIHBlcmNlbnRhZ2VcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHJldHVybnMge251bWJlcn0gMCA9IG5vdCBmb3VuZDsgMSA9IG5vdGhpbmcgdG8gZG87IDIgPSBtb3ZlZFxyXG4gICAgICovXHJcbiAgICBfcGxhY2VCeVBlcmNlbnRhZ2Uoc29ydGFibGUsIGRyYWdnaW5nKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGN1cnNvciA9IGRyYWdnaW5nLl9fc29ydGFibGUuZHJhZ2dpbmdcclxuICAgICAgICBjb25zdCB4YTEgPSBjdXJzb3Iub2Zmc2V0TGVmdFxyXG4gICAgICAgIGNvbnN0IHlhMSA9IGN1cnNvci5vZmZzZXRUb3BcclxuICAgICAgICBjb25zdCB4YTIgPSBjdXJzb3Iub2Zmc2V0TGVmdCArIGN1cnNvci5vZmZzZXRXaWR0aFxyXG4gICAgICAgIGNvbnN0IHlhMiA9IGN1cnNvci5vZmZzZXRUb3AgKyBjdXJzb3Iub2Zmc2V0SGVpZ2h0XHJcbiAgICAgICAgbGV0IGxhcmdlc3QgPSAwLCBjbG9zZXN0LCBpc0JlZm9yZSwgaW5kaWNhdG9yXHJcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHNvcnRhYmxlLmVsZW1lbnRcclxuICAgICAgICBjb25zdCBlbGVtZW50cyA9IHNvcnRhYmxlLl9nZXRDaGlsZHJlbih0cnVlKVxyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGVsZW1lbnRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGNoaWxkID09PSBkcmFnZ2luZylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW5kaWNhdG9yID0gdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHBvcyA9IHV0aWxzLnRvR2xvYmFsKGNoaWxkKVxyXG4gICAgICAgICAgICBjb25zdCB4YjEgPSBwb3MueFxyXG4gICAgICAgICAgICBjb25zdCB5YjEgPSBwb3MueVxyXG4gICAgICAgICAgICBjb25zdCB4YjIgPSBwb3MueCArIGNoaWxkLm9mZnNldFdpZHRoXHJcbiAgICAgICAgICAgIGNvbnN0IHliMiA9IHBvcy55ICsgY2hpbGQub2Zmc2V0SGVpZ2h0XHJcbiAgICAgICAgICAgIGNvbnN0IHBlcmNlbnRhZ2UgPSB1dGlscy5wZXJjZW50YWdlKHhhMSwgeWExLCB4YTIsIHlhMiwgeGIxLCB5YjEsIHhiMiwgeWIyKVxyXG4gICAgICAgICAgICBpZiAocGVyY2VudGFnZSA+IGxhcmdlc3QpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxhcmdlc3QgPSBwZXJjZW50YWdlXHJcbiAgICAgICAgICAgICAgICBjbG9zZXN0ID0gY2hpbGRcclxuICAgICAgICAgICAgICAgIGlzQmVmb3JlID0gaW5kaWNhdG9yXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNsb3Nlc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoY2xvc2VzdCA9PT0gZHJhZ2dpbmcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAxXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGlzQmVmb3JlICYmIGNsb3Nlc3QubmV4dFNpYmxpbmcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKGRyYWdnaW5nLCBjbG9zZXN0Lm5leHRTaWJsaW5nKVxyXG4gICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnb3JkZXItcGVuZGluZycsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5pbnNlcnRCZWZvcmUoZHJhZ2dpbmcsIGNsb3Nlc3QpXHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdvcmRlci1wZW5kaW5nJywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIDJcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIDBcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzZWFyY2ggZm9yIHdoZXJlIHRvIHBsYWNlIHVzaW5nIGRpc3RhbmNlXHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmdcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gZmFsc2U9bm90aGluZyB0byBkb1xyXG4gICAgICovXHJcbiAgICBfcGxhY2VCeURpc3RhbmNlKHNvcnRhYmxlLCBkcmFnZ2luZywgeCwgeSlcclxuICAgIHtcclxuICAgICAgICBpZiAodXRpbHMuaW5zaWRlKHgsIHksIGRyYWdnaW5nKSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBpbmRleCA9IC0xXHJcbiAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudCA9PT0gc29ydGFibGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpbmRleCA9IHNvcnRhYmxlLl9nZXRJbmRleChkcmFnZ2luZylcclxuICAgICAgICAgICAgc29ydGFibGUuZWxlbWVudC5hcHBlbmRDaGlsZChkcmFnZ2luZylcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGRpc3RhbmNlID0gSW5maW5pdHksIGNsb3Nlc3RcclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gc29ydGFibGUuZWxlbWVudFxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnRzID0gc29ydGFibGUuX2dldENoaWxkcmVuKHRydWUpXHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgZWxlbWVudHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodXRpbHMuaW5zaWRlKHgsIHksIGNoaWxkKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2xvc2VzdCA9IGNoaWxkXHJcbiAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbWVhc3VyZSA9IHV0aWxzLmRpc3RhbmNlVG9DbG9zZXN0Q29ybmVyKHgsIHksIGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgaWYgKG1lYXN1cmUgPCBkaXN0YW5jZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjbG9zZXN0ID0gY2hpbGRcclxuICAgICAgICAgICAgICAgICAgICBkaXN0YW5jZSA9IG1lYXN1cmVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbGVtZW50Lmluc2VydEJlZm9yZShkcmFnZ2luZywgY2xvc2VzdClcclxuICAgICAgICBpZiAoaW5kZXggPT09IHNvcnRhYmxlLl9nZXRJbmRleChkcmFnZ2luZykpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9tYXhpbXVtUGVuZGluZyhkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgc29ydGFibGUuZW1pdCgnb3JkZXItcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBsYWNlIGluZGljYXRvciBpbiBhbiBzb3J0YWJsZSBsaXN0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGxhY2VJblNvcnRhYmxlTGlzdChzb3J0YWJsZSwgeCwgeSwgZHJhZ2dpbmcpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHNvcnRhYmxlLmVsZW1lbnRcclxuICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHNvcnRhYmxlLl9nZXRDaGlsZHJlbigpXHJcbiAgICAgICAgaWYgKCFjaGlsZHJlbi5sZW5ndGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKGRyYWdnaW5nKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBjb25zdCBwZXJjZW50YWdlID0gdGhpcy5fcGxhY2VCeVBlcmNlbnRhZ2Uoc29ydGFibGUsIGRyYWdnaW5nKVxyXG4gICAgICAgICAgICBpZiAodGhpcy5fcGxhY2VCeURpc3RhbmNlKHNvcnRhYmxlLCBkcmFnZ2luZywgeCwgeSkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgIT09IHNvcnRhYmxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnYWRkLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmlzQ29weSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnY29weS1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgIT09IGRyYWdnaW5nLl9fc29ydGFibGUub3JpZ2luYWwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50LmVtaXQoJ2FkZC1yZW1vdmUtcGVuZGluZycsIGRyYWdnaW5nLCBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50LmVtaXQoJ3JlbW92ZS1wZW5kaW5nJywgZHJhZ2dpbmcsIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgPSBzb3J0YWJsZVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9tYXhpbXVtUGVuZGluZyhkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgc29ydGFibGUuZW1pdCgndXBkYXRlLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzZXQgaWNvbiBpZiBhdmFpbGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2FuY2VsXSBmb3JjZSBjYW5jZWwgKGZvciBvcHRpb25zLmNvcHkpXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfc2V0SWNvbihlbGVtZW50LCBzb3J0YWJsZSwgY2FuY2VsKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGRyYWdnaW5nID0gZWxlbWVudC5fX3NvcnRhYmxlLmRyYWdnaW5nXHJcbiAgICAgICAgaWYgKGRyYWdnaW5nICYmIGRyYWdnaW5nLmljb24pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoIXNvcnRhYmxlKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZSA9IGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbFxyXG4gICAgICAgICAgICAgICAgaWYgKGNhbmNlbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnNyYyA9IHNvcnRhYmxlLm9wdGlvbnMuaWNvbnMuY2FuY2VsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zcmMgPSBzb3J0YWJsZS5vcHRpb25zLm9mZkxpc3QgPT09ICdkZWxldGUnID8gc29ydGFibGUub3B0aW9ucy5pY29ucy5kZWxldGUgOiBzb3J0YWJsZS5vcHRpb25zLmljb25zLmNhbmNlbFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5pc0NvcHkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zcmMgPSBzb3J0YWJsZS5vcHRpb25zLmljb25zLmNvcHlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnNyYyA9IGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9PT0gc29ydGFibGUgPyBzb3J0YWJsZS5vcHRpb25zLmljb25zLnJlb3JkZXIgOiBzb3J0YWJsZS5vcHRpb25zLmljb25zLm1vdmVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFkZCBhIG1heGltdW0gY291bnRlciB0byB0aGUgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqL1xyXG4gICAgX21heGltdW1Db3VudGVyKGVsZW1lbnQsIHNvcnRhYmxlKVxyXG4gICAge1xyXG4gICAgICAgIGxldCBjb3VudCA9IC0xXHJcbiAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMubWF4aW11bSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gc29ydGFibGUuX2dldENoaWxkcmVuKClcclxuICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgY2hpbGRyZW4pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChjaGlsZCAhPT0gZWxlbWVudCAmJiBjaGlsZC5fX3NvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvdW50ID0gY2hpbGQuX19zb3J0YWJsZS5tYXhpbXVtID4gY291bnQgPyBjaGlsZC5fX3NvcnRhYmxlLm1heGltdW0gOiBjb3VudFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5tYXhpbXVtID0gY291bnQgKyAxXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgbWF4aW11bVxyXG4gICAgICovXHJcbiAgICBfbWF4aW11bShlbGVtZW50LCBzb3J0YWJsZSlcclxuICAgIHtcclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5tYXhpbXVtKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoID4gc29ydGFibGUub3B0aW9ucy5tYXhpbXVtKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoc29ydGFibGUucmVtb3ZlUGVuZGluZy5sZW5ndGgpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBzb3J0YWJsZS5yZW1vdmVQZW5kaW5nLnBvcCgpXHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQuc3R5bGUuZGlzcGxheSA9IGNoaWxkLl9fc29ydGFibGUuZGlzcGxheSA9PT0gJ3Vuc2V0JyA/ICcnIDogY2hpbGQuX19zb3J0YWJsZS5kaXNwbGF5XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQuX19zb3J0YWJsZS5kaXNwbGF5ID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkLnJlbW92ZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnbWF4aW11bS1yZW1vdmUnLCBjaGlsZCwgc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZS5yZW1vdmVQZW5kaW5nID0gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX21heGltdW1Db3VudGVyKGVsZW1lbnQsIHNvcnRhYmxlKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNsZWFyIHBlbmRpbmcgbGlzdFxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqL1xyXG4gICAgX2NsZWFyTWF4aW11bVBlbmRpbmcoc29ydGFibGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHNvcnRhYmxlLnJlbW92ZVBlbmRpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB3aGlsZSAoc29ydGFibGUucmVtb3ZlUGVuZGluZy5sZW5ndGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gc29ydGFibGUucmVtb3ZlUGVuZGluZy5wb3AoKVxyXG4gICAgICAgICAgICAgICAgY2hpbGQuc3R5bGUuZGlzcGxheSA9IGNoaWxkLl9fc29ydGFibGUuZGlzcGxheSA9PT0gJ3Vuc2V0JyA/ICcnIDogY2hpbGQuX19zb3J0YWJsZS5kaXNwbGF5XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5fX3NvcnRhYmxlLmRpc3BsYXkgPSBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc29ydGFibGUucmVtb3ZlUGVuZGluZyA9IG51bGxcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgcGVuZGluZyBtYXhpbXVtXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX21heGltdW1QZW5kaW5nKGVsZW1lbnQsIHNvcnRhYmxlKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLm1heGltdW0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHNvcnRhYmxlLl9nZXRDaGlsZHJlbigpXHJcbiAgICAgICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPiBzb3J0YWJsZS5vcHRpb25zLm1heGltdW0pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNhdmVQZW5kaW5nID0gc29ydGFibGUucmVtb3ZlUGVuZGluZyA/IHNvcnRhYmxlLnJlbW92ZVBlbmRpbmcuc2xpY2UoMCkgOiBbXVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fY2xlYXJNYXhpbXVtUGVuZGluZyhzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlLnJlbW92ZVBlbmRpbmcgPSBbXVxyXG4gICAgICAgICAgICAgICAgbGV0IHNvcnRcclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLm1heGltdW1GSUZPKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNvcnQgPSBjaGlsZHJlbi5zb3J0KChhLCBiKSA9PiB7IHJldHVybiBhID09PSBlbGVtZW50ID8gMSA6IGEuX19zb3J0YWJsZS5tYXhpbXVtIC0gYi5fX3NvcnRhYmxlLm1heGltdW0gfSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzb3J0ID0gY2hpbGRyZW4uc29ydCgoYSwgYikgPT4geyByZXR1cm4gYSA9PT0gZWxlbWVudCA/IDEgOiBiLl9fc29ydGFibGUubWF4aW11bSAtIGEuX19zb3J0YWJsZS5tYXhpbXVtIH0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aCAtIHNvcnRhYmxlLm9wdGlvbnMubWF4aW11bTsgaSsrKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhpZGUgPSBzb3J0W2ldXHJcbiAgICAgICAgICAgICAgICAgICAgaGlkZS5fX3NvcnRhYmxlLmRpc3BsYXkgPSBoaWRlLnN0eWxlLmRpc3BsYXkgfHwgJ3Vuc2V0J1xyXG4gICAgICAgICAgICAgICAgICAgIGhpZGUuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlLnJlbW92ZVBlbmRpbmcucHVzaChoaWRlKVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzYXZlUGVuZGluZy5pbmRleE9mKGhpZGUpID09PSAtMSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ21heGltdW0tcmVtb3ZlLXBlbmRpbmcnLCBoaWRlLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgX21vdXNlRG93bihlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY3Vyc29ySG92ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB1dGlscy5zdHlsZShlLmN1cnJlbnRUYXJnZXQsICdjdXJzb3InLCB0aGlzLm9wdGlvbnMuY3Vyc29yRG93bilcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgcGlja2VkIHVwIGJlY2F1c2UgaXQgd2FzIG1vdmVkIGJleW9uZCB0aGUgb3B0aW9ucy50aHJlc2hvbGRcclxuICogQGV2ZW50IFNvcnRhYmxlI3BpY2t1cFxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHNvcnRhYmxlIGlzIHJlb3JkZXJlZFxyXG4gKiBAZXZlbnQgU29ydGFibGUjb3JkZXJcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCB0aGF0IHdhcyByZW9yZGVyZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgcGxhY2VkXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyBhZGRlZCB0byB0aGlzIHNvcnRhYmxlXHJcbiAqIEBldmVudCBTb3J0YWJsZSNhZGRcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBhZGRlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyBhZGRlZFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgcmVtb3ZlZCBmcm9tIHRoaXMgc29ydGFibGVcclxuICogQGV2ZW50IFNvcnRhYmxlI3JlbW92ZVxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHJlbW92ZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgcmVtb3ZlZFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgcmVtb3ZlZCBmcm9tIGFsbCBzb3J0YWJsZXNcclxuICogQGV2ZW50IFNvcnRhYmxlI2RlbGV0ZVxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHJlbW92ZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgZHJhZ2dlZCBmcm9tXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBjb3B5IG9mIGFuIGVsZW1lbnQgaXMgZHJvcHBlZFxyXG4gKiBAZXZlbnQgU29ydGFibGUjY29weVxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHJlbW92ZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgZHJhZ2dlZCBmcm9tXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gdGhlIHNvcnRhYmxlIGlzIHVwZGF0ZWQgd2l0aCBhbiBhZGQsIHJlbW92ZSwgb3Igb3JkZXIgY2hhbmdlXHJcbiAqIEBldmVudCBTb3J0YWJsZSN1cGRhdGVcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBjaGFuZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdpdGggZWxlbWVudFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgcmVtb3ZlZCBiZWNhdXNlIG1heGltdW0gd2FzIHJlYWNoZWQgZm9yIHRoZSBzb3J0YWJsZVxyXG4gKiBAZXZlbnQgU29ydGFibGUjbWF4aW11bS1yZW1vdmVcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCByZW1vdmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIGRyYWdnZWQgZnJvbVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIG9yZGVyIHdhcyBjaGFuZ2VkIGJ1dCBlbGVtZW50IHdhcyBub3QgZHJvcHBlZCB5ZXRcclxuICogQGV2ZW50IFNvcnRhYmxlI29yZGVyLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gZWxlbWVudCBpcyBhZGRlZCBidXQgbm90IGRyb3BwZWQgeWV0XHJcbiAqIEBldmVudCBTb3J0YWJsZSNhZGQtcGVuZGluZ1xyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBlbGVtZW50IGlzIHJlbW92ZWQgYnV0IG5vdCBkcm9wcGVkIHlldFxyXG4gKiBAZXZlbnQgU29ydGFibGUjcmVtb3ZlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gZWxlbWVudCBpcyByZW1vdmVkIGFmdGVyIGJlaW5nIHRlbXBvcmFyaWx5IGFkZGVkXHJcbiAqIEBldmVudCBTb3J0YWJsZSNhZGQtcmVtb3ZlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyBhYm91dCB0byBiZSByZW1vdmVkIGZyb20gYWxsIHNvcnRhYmxlc1xyXG4gKiBAZXZlbnQgU29ydGFibGUjZGVsZXRlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCByZW1vdmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIGRyYWdnZWQgZnJvbVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgYWRkZWQsIHJlbW92ZWQsIG9yIHJlb3JkZXIgYnV0IGVsZW1lbnQgaGFzIG5vdCBkcm9wcGVkIHlldFxyXG4gKiBAZXZlbnQgU29ydGFibGUjdXBkYXRlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBjb3B5IG9mIGFuIGVsZW1lbnQgaXMgYWJvdXQgdG8gZHJvcFxyXG4gKiBAZXZlbnQgU29ydGFibGUjY29weS1wZW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgcmVtb3ZlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyBkcmFnZ2VkIGZyb21cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIGFib3V0IHRvIGJlIHJlbW92ZWQgYmVjYXVzZSBtYXhpbXVtIHdhcyByZWFjaGVkIGZvciB0aGUgc29ydGFibGVcclxuICogQGV2ZW50IFNvcnRhYmxlI21heGltdW0tcmVtb3ZlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCByZW1vdmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIGRyYWdnZWQgZnJvbVxyXG4gKi9cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU29ydGFibGUiXX0=