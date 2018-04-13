'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventemitter = require('eventemitter3');

var _eventemitter2 = _interopRequireDefault(_eventemitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var defaults = require('./defaults');
var utils = require('./utils');

/**
 * Sortable Class
 * @class
 */

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
     * @fires order-pending
     * @fires add-pending
     * @fires remove-pending
     * @fires update-pending
     * @fires delete-pending
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
                dragging.__sortable.current = sortable;
                sortable.emit('update-pending', dragging, sortable);
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
            var distance = Infinity,
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
                    if (utils.inside(x, y, child)) {
                        closest = child;
                        isBefore = indicator;
                        break;
                    } else {
                        var measure = utils.distanceToClosestCorner(x, y, child);
                        if (measure < distance) {
                            closest = child;
                            distance = measure;
                            isBefore = indicator;
                        }
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

            if (closest === dragging) {
                return true;
            }
            if (isBefore) {
                element.insertBefore(dragging, closest.nextSibling);
            } else {
                element.insertBefore(dragging, closest);
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
                }
                element.appendChild(dragging);
            } else {
                if (this._placeByDistance(sortable, dragging, x, y)) {
                    return;
                }
            }
            if (dragging.__sortable.current !== sortable) {
                sortable.emit('add-pending', dragging, sortable);
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
            var _iteratorNormalCompletion10 = true;
            var _didIteratorError10 = false;
            var _iteratorError10 = undefined;

            try {
                for (var _iterator10 = elements[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                    var element = _step10.value;

                    results.push(new Sortable(element, options));
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

            return results;
        }
    }, {
        key: 'defaults',
        get: function get() {
            return defaults;
        }
    }]);

    return Sortable;
}(_eventemitter2.default);

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

module.exports = Sortable;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3J0YWJsZS5qcyJdLCJuYW1lcyI6WyJkZWZhdWx0cyIsInJlcXVpcmUiLCJ1dGlscyIsIlNvcnRhYmxlIiwiZWxlbWVudCIsIm9wdGlvbnMiLCJfYWRkVG9HbG9iYWxUcmFja2VyIiwiZWxlbWVudHMiLCJfZ2V0Q2hpbGRyZW4iLCJjaGlsZCIsImRyYWdDbGFzcyIsImNvbnRhaW5zQ2xhc3NOYW1lIiwiYXR0YWNoRWxlbWVudCIsImV2ZW50cyIsImRyYWdPdmVyIiwiZSIsIl9kcmFnT3ZlciIsImRyb3AiLCJfZHJvcCIsIm1vdXNlT3ZlciIsIl9tb3VzZUVudGVyIiwiYWRkRXZlbnRMaXN0ZW5lciIsImN1cnNvckhvdmVyIiwic3R5bGUiLCJjdXJzb3JEb3duIiwiX21vdXNlRG93biIsImN1cnJlbnRUYXJnZXQiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwicmVtb3ZlRWxlbWVudCIsImluZGV4Iiwic29ydCIsImNoaWxkcmVuIiwibGVuZ3RoIiwiYXBwZW5kQ2hpbGQiLCJpbnNlcnRCZWZvcmUiLCJpZCIsIm9yZGVySWQiLCJkcmFnT3JkZXIiLCJnZXRBdHRyaWJ1dGUiLCJvcmRlcklkSXNOdW1iZXIiLCJwYXJzZUZsb2F0IiwiZm91bmQiLCJyZXZlcnNlT3JkZXIiLCJpIiwiY2hpbGREcmFnT3JkZXIiLCJvcmRlcklzTnVtYmVyIiwicGFyZW50Tm9kZSIsIl9fc29ydGFibGUiLCJvcmlnaW5hbCIsInNvcnRhYmxlIiwiZHJhZ1N0YXJ0IiwiX2RyYWdTdGFydCIsIm5hbWUiLCJ0cmFja2VyIiwiY291bnRlciIsImNvcHkiLCJzZXRBdHRyaWJ1dGUiLCJkcmFnTW92ZSIsImRyYWdJbWFnZSIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImJvZHkiLCJfYm9keURyYWdPdmVyIiwiX2JvZHlEcm9wIiwibGlzdCIsInB1c2giLCJkYXRhVHJhbnNmZXIiLCJ0eXBlcyIsImdldEVsZW1lbnRCeUlkIiwiX2ZpbmRDbG9zZXN0IiwiX3BsYWNlSW5MaXN0IiwicGFnZVgiLCJwYWdlWSIsImRyb3BFZmZlY3QiLCJfdXBkYXRlRHJhZ2dpbmciLCJfbm9Ecm9wIiwicHJldmVudERlZmF1bHQiLCJjYW5jZWwiLCJfc2V0SWNvbiIsIm9mZkxpc3QiLCJkaXNwbGF5IiwiZW1pdCIsIl9yZXBsYWNlSW5MaXN0IiwiX3JlbW92ZURyYWdnaW5nIiwicmVtb3ZlIiwiZHJhZ2dpbmciLCJjbG9uZU5vZGUiLCJkcmFnU3R5bGUiLCJwb3MiLCJ0b0dsb2JhbCIsImxlZnQiLCJ4IiwidG9wIiwieSIsIm9mZnNldCIsInVzZUljb25zIiwiaW1hZ2UiLCJJbWFnZSIsInNyYyIsImljb25zIiwicmVvcmRlciIsInBvc2l0aW9uIiwidHJhbnNmb3JtIiwib2Zmc2V0TGVmdCIsIm9mZnNldFdpZHRoIiwib2Zmc2V0VG9wIiwib2Zmc2V0SGVpZ2h0IiwiaWNvbiIsInRhcmdldCIsImlzQ29weSIsImNsZWFyRGF0YSIsInNldERhdGEiLCJzZXREcmFnSW1hZ2UiLCJjdXJyZW50IiwiX2dldEluZGV4Iiwic3RvcFByb3BhZ2F0aW9uIiwibWluIiwiSW5maW5pdHkiLCJyZWxhdGVkIiwiaW5zaWRlIiwiY2FsY3VsYXRlIiwiZGlzdGFuY2VUb0Nsb3Nlc3RDb3JuZXIiLCJfcGxhY2VJblNvcnRhYmxlTGlzdCIsIl9wbGFjZUluT3JkZXJlZExpc3QiLCJiYXNlIiwic2VhcmNoIiwicmVzdWx0cyIsImluZGV4T2YiLCJjbGFzc05hbWUiLCJfdHJhdmVyc2VDaGlsZHJlbiIsIm9yZGVyIiwiZGVlcFNlYXJjaCIsIm9yZGVyQ2xhc3MiLCJkaXN0YW5jZSIsImNsb3Nlc3QiLCJpc0JlZm9yZSIsImluZGljYXRvciIsIm1lYXN1cmUiLCJuZXh0U2libGluZyIsIl9wbGFjZUJ5RGlzdGFuY2UiLCJkZWxldGUiLCJtb3ZlIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBOzs7Ozs7Ozs7Ozs7QUFFQSxJQUFNQSxXQUFXQyxRQUFRLFlBQVIsQ0FBakI7QUFDQSxJQUFN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QUFDSDtBQUNKO0FBQ0o7QUFDSjs7Ozs7QUF6dEJEOzs7OzsrQkFLY3RJLFEsRUFBVUYsTyxFQUN4QjtBQUNJLGdCQUFNeUgsVUFBVSxFQUFoQjtBQURKO0FBQUE7QUFBQTs7QUFBQTtBQUVJLHVDQUFvQnZILFFBQXBCLHdJQUNBO0FBQUEsd0JBRFNILE9BQ1Q7O0FBQ0kwSCw0QkFBUTdELElBQVIsQ0FBYSxJQUFJOUQsUUFBSixDQUFhQyxPQUFiLEVBQXNCQyxPQUF0QixDQUFiO0FBQ0g7QUFMTDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQU1JLG1CQUFPeUgsT0FBUDtBQUNIOzs7NEJBakJEO0FBQ0ksbUJBQU85SCxRQUFQO0FBQ0g7Ozs7OztBQTh0Qkw7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9DOEksT0FBT0MsT0FBUCxHQUFpQjVJLFFBQWpCIiwiZmlsZSI6InNvcnRhYmxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEV2ZW50cyBmcm9tICdldmVudGVtaXR0ZXIzJ1xyXG5cclxuY29uc3QgZGVmYXVsdHMgPSByZXF1aXJlKCcuL2RlZmF1bHRzJylcclxuY29uc3QgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcclxuXHJcbi8qKlxyXG4gKiBTb3J0YWJsZSBDbGFzc1xyXG4gKiBAY2xhc3NcclxuICovXHJcbmNsYXNzIFNvcnRhYmxlIGV4dGVuZHMgRXZlbnRzXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIHNvcnRhYmxlIGxpc3RcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5uYW1lPXNvcnRhYmxlXSBkcmFnZ2luZyBpcyBhbGxvd2VkIGJldHdlZW4gU29ydGFibGVzIHdpdGggdGhlIHNhbWUgbmFtZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmRyYWdDbGFzc10gaWYgc2V0IHRoZW4gZHJhZyBvbmx5IGl0ZW1zIHdpdGggdGhpcyBjbGFzc05hbWUgdW5kZXIgZWxlbWVudDsgb3RoZXJ3aXNlIGRyYWcgYWxsIGNoaWxkcmVuXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMub3JkZXJDbGFzc10gdXNlIHRoaXMgY2xhc3MgdG8gaW5jbHVkZSBlbGVtZW50cyBpbiBvcmRlcmluZyBidXQgbm90IGRyYWdnaW5nOyBvdGhlcndpc2UgYWxsIGNoaWxkcmVuIGVsZW1lbnRzIGFyZSBpbmNsdWRlZCBpbiB3aGVuIHNvcnRpbmcgYW5kIG9yZGVyaW5nXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmRlZXBTZWFyY2hdIGlmIGRyYWdDbGFzcyBhbmQgZGVlcFNlYXJjaCB0aGVuIHNlYXJjaCBhbGwgZGVzY2VuZGVudHMgb2YgZWxlbWVudCBmb3IgZHJhZ0NsYXNzXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnNvcnQ9dHJ1ZV0gYWxsb3cgc29ydGluZyB3aXRoaW4gbGlzdFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5kcm9wPXRydWVdIGFsbG93IGRyb3AgZnJvbSByZWxhdGVkIHNvcnRhYmxlcyAoZG9lc24ndCBpbXBhY3QgcmVvcmRlcmluZyB0aGlzIHNvcnRhYmxlJ3MgY2hpbGRyZW4gdW50aWwgdGhlIGNoaWxkcmVuIGFyZSBtb3ZlZCB0byBhIGRpZmZlcmVuIHNvcnRhYmxlKVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5jb3B5PWZhbHNlXSBjcmVhdGUgY29weSB3aGVuIGRyYWdnaW5nIGFuIGl0ZW0gKHRoaXMgZGlzYWJsZXMgc29ydD10cnVlIGZvciB0aGlzIHNvcnRhYmxlKVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLm9yZGVySWQ9ZGF0YS1vcmRlcl0gZm9yIG9yZGVyZWQgbGlzdHMsIHVzZSB0aGlzIGRhdGEgaWQgdG8gZmlndXJlIG91dCBzb3J0IG9yZGVyXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLm9yZGVySWRJc051bWJlcj10cnVlXSB1c2UgcGFyc2VJbnQgb24gb3B0aW9ucy5zb3J0SWQgdG8gcHJvcGVybHkgc29ydCBudW1iZXJzXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMucmV2ZXJzZU9yZGVyXSByZXZlcnNlIHNvcnQgdGhlIG9yZGVySWRcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5vZmZMaXN0PWNsb3Nlc3RdIGhvdyB0byBoYW5kbGUgd2hlbiBhbiBlbGVtZW50IGlzIGRyb3BwZWQgb3V0c2lkZSBhIHNvcnRhYmxlOiBjbG9zZXN0PWRyb3AgaW4gY2xvc2VzdCBzb3J0YWJsZTsgY2FuY2VsPXJldHVybiB0byBzdGFydGluZyBzb3J0YWJsZTsgZGVsZXRlPXJlbW92ZSBmcm9tIGFsbCBzb3J0YWJsZXNcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5jdXJzb3JIb3Zlcj1ncmFiIC13ZWJraXQtZ3JhYiBwb2ludGVyXSB1c2UgdGhpcyBjdXJzb3IgbGlzdCB0byBzZXQgY3Vyc29yIHdoZW4gaG92ZXJpbmcgb3ZlciBhIHNvcnRhYmxlIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5jdXJzb3JEb3duPWdyYWJiaW5nIC13ZWJraXQtZ3JhYmJpbmcgcG9pbnRlcl0gdXNlIHRoaXMgY3Vyc29yIGxpc3QgdG8gc2V0IGN1cnNvciB3aGVuIG1vdXNlZG93bi90b3VjaGRvd24gb3ZlciBhIHNvcnRhYmxlIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMudXNlSWNvbnM9dHJ1ZV0gc2hvdyBpY29ucyB3aGVuIGRyYWdnaW5nXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnMuaWNvbnNdIGRlZmF1bHQgc2V0IG9mIGljb25zXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuaWNvbnMucmVvcmRlcl1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5pY29ucy5tb3ZlXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmljb25zLmNvcHldXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuaWNvbnMuZGVsZXRlXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmN1c3RvbUljb25dIHNvdXJjZSBvZiBjdXN0b20gaW1hZ2Ugd2hlbiBvdmVyIHRoaXMgc29ydGFibGVcclxuICAgICAqIEBmaXJlcyBwaWNrdXBcclxuICAgICAqIEBmaXJlcyBvcmRlclxyXG4gICAgICogQGZpcmVzIGFkZFxyXG4gICAgICogQGZpcmVzIHJlbW92ZVxyXG4gICAgICogQGZpcmVzIHVwZGF0ZVxyXG4gICAgICogQGZpcmVzIGRlbGV0ZVxyXG4gICAgICogQGZpcmVzIG9yZGVyLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyBhZGQtcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIHJlbW92ZS1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgdXBkYXRlLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyBkZWxldGUtcGVuZGluZ1xyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyKClcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSB1dGlscy5vcHRpb25zKG9wdGlvbnMsIGRlZmF1bHRzKVxyXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnRcclxuICAgICAgICB0aGlzLl9hZGRUb0dsb2JhbFRyYWNrZXIoKVxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnRzID0gdGhpcy5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGVsZW1lbnRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzIHx8IHV0aWxzLmNvbnRhaW5zQ2xhc3NOYW1lKGNoaWxkLCB0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hdHRhY2hFbGVtZW50KGNoaWxkKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZXZlbnRzID0ge1xyXG4gICAgICAgICAgICBkcmFnT3ZlcjogKGUpID0+IHRoaXMuX2RyYWdPdmVyKGUpLFxyXG4gICAgICAgICAgICBkcm9wOiAoZSkgPT4gdGhpcy5fZHJvcChlKSxcclxuICAgICAgICAgICAgbW91c2VPdmVyOiAoZSkgPT4gdGhpcy5fbW91c2VFbnRlcihlKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgdGhpcy5ldmVudHMuZHJhZ092ZXIpXHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywgdGhpcy5ldmVudHMuZHJvcClcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmN1cnNvckhvdmVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5fZ2V0Q2hpbGRyZW4oKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdXRpbHMuc3R5bGUoY2hpbGQsICdjdXJzb3InLCB0aGlzLm9wdGlvbnMuY3Vyc29ySG92ZXIpXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmN1cnNvckRvd24pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKGUpID0+IHRoaXMuX21vdXNlRG93bihlKSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfbW91c2VEb3duKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHV0aWxzLnN0eWxlKGUuY3VycmVudFRhcmdldCwgJ2N1cnNvcicsIHRoaXMub3B0aW9ucy5jdXJzb3JEb3duKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlbW92ZXMgYWxsIGV2ZW50IGhhbmRsZXJzIGZyb20gdGhpcy5lbGVtZW50IGFuZCBjaGlsZHJlblxyXG4gICAgICovXHJcbiAgICBkZXN0cm95KClcclxuICAgIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCB0aGlzLmV2ZW50cy5kcmFnT3ZlcilcclxuICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJvcCcsIHRoaXMuZXZlbnRzLmRyb3ApXHJcbiAgICAgICAgY29uc3QgZWxlbWVudHMgPSB0aGlzLl9nZXRDaGlsZHJlbigpXHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgZWxlbWVudHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUVsZW1lbnQoY2hpbGQpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHRvZG86IHJlbW92ZSBTb3J0YWJsZS50cmFja2VyIGFuZCByZWxhdGVkIGV2ZW50IGhhbmRsZXJzIGlmIG5vIG1vcmUgc29ydGFibGVzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB0aGUgZ2xvYmFsIGRlZmF1bHRzIGZvciBuZXcgU29ydGFibGUgb2JqZWN0c1xyXG4gICAgICogQHR5cGUge0RlZmF1bHRPcHRpb25zfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0IGRlZmF1bHRzKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gZGVmYXVsdHNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNyZWF0ZSBtdWx0aXBsZSBzb3J0YWJsZSBlbGVtZW50c1xyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudHNbXX0gZWxlbWVudHNcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIC0gc2VlIGNvbnN0cnVjdG9yIGZvciBvcHRpb25zXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBjcmVhdGUoZWxlbWVudHMsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdXHJcbiAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiBlbGVtZW50cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaChuZXcgU29ydGFibGUoZWxlbWVudCwgb3B0aW9ucykpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHRzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhZGQgYW4gZWxlbWVudCBhcyBhIGNoaWxkIG9mIHRoZSBzb3J0YWJsZSBlbGVtZW50OyBjYW4gYWxzbyBiZSB1c2VkIHRvIHN3YXAgYmV0d2VlbiBzb3J0YWJsZXNcclxuICAgICAqIE5PVEU6IHRoaXMgd2lsbCBub3Qgd29yayB3aXRoIGRlZXAtdHlwZSBlbGVtZW50czsgdXNlIGF0dGFjaEVsZW1lbnQgaW5zdGVhZFxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4XHJcbiAgICAgKi9cclxuICAgIGFkZChlbGVtZW50LCBpbmRleClcclxuICAgIHtcclxuICAgICAgICB0aGlzLmF0dGFjaEVsZW1lbnQoZWxlbWVudClcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNvcnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGluZGV4ID09PSAndW5kZWZpbmVkJyB8fCBpbmRleCA+PSB0aGlzLmVsZW1lbnQuY2hpbGRyZW4ubGVuZ3RoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZWxlbWVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5pbnNlcnRCZWZvcmUoZWxlbWVudCwgdGhpcy5lbGVtZW50LmNoaWxkcmVuW2luZGV4ICsgMV0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSB0aGlzLm9wdGlvbnMub3JkZXJJZFxyXG4gICAgICAgICAgICBsZXQgZHJhZ09yZGVyID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgICAgIGRyYWdPcmRlciA9IHRoaXMub3B0aW9ucy5vcmRlcklkSXNOdW1iZXIgPyBwYXJzZUZsb2F0KGRyYWdPcmRlcikgOiBkcmFnT3JkZXJcclxuICAgICAgICAgICAgbGV0IGZvdW5kXHJcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5fZ2V0Q2hpbGRyZW4odHJ1ZSlcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yZXZlcnNlT3JkZXIpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSBjaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZCA9IGNoaWxkcmVuW2ldXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkRHJhZ09yZGVyID0gY2hpbGQuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkRHJhZ09yZGVyID0gdGhpcy5vcHRpb25zLm9yZGVySXNOdW1iZXIgPyBwYXJzZUZsb2F0KGNoaWxkRHJhZ09yZGVyKSA6IGNoaWxkRHJhZ09yZGVyXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdPcmRlciA+IGNoaWxkRHJhZ09yZGVyKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZWxlbWVudCwgY2hpbGQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGNoaWxkcmVuKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZERyYWdPcmRlciA9IGNoaWxkLmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZERyYWdPcmRlciA9IHRoaXMub3B0aW9ucy5vcmRlcklzTnVtYmVyID8gcGFyc2VGbG9hdChjaGlsZERyYWdPcmRlcikgOiBjaGlsZERyYWdPcmRlclxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnT3JkZXIgPCBjaGlsZERyYWdPcmRlcilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGVsZW1lbnQsIGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFmb3VuZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhdHRhY2hlcyBhbiBIVE1MIGVsZW1lbnQgdG8gdGhlIHNvcnRhYmxlOyBjYW4gYWxzbyBiZSB1c2VkIHRvIHN3YXAgYmV0d2VlbiBzb3J0YWJsZXNcclxuICAgICAqIE5PVEU6IHlvdSBuZWVkIHRvIG1hbnVhbGx5IGluc2VydCB0aGUgZWxlbWVudCBpbnRvIHRoaXMuZWxlbWVudCAodGhpcyBpcyB1c2VmdWwgd2hlbiB5b3UgaGF2ZSBhIGRlZXAgc3RydWN0dXJlKVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICovXHJcbiAgICBhdHRhY2hFbGVtZW50KGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9IHRoaXNcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlID0ge1xyXG4gICAgICAgICAgICAgICAgc29ydGFibGU6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBvcmlnaW5hbDogdGhpcyxcclxuICAgICAgICAgICAgICAgIGRyYWdTdGFydDogKGUpID0+IHRoaXMuX2RyYWdTdGFydChlKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBlbnN1cmUgZXZlcnkgZWxlbWVudCBoYXMgYW4gaWRcclxuICAgICAgICAgICAgaWYgKCFlbGVtZW50LmlkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmlkID0gJ19fc29ydGFibGUtJyArIHRoaXMub3B0aW9ucy5uYW1lICsgJy0nICsgU29ydGFibGUudHJhY2tlclt0aGlzLm9wdGlvbnMubmFtZV0uY291bnRlclxyXG4gICAgICAgICAgICAgICAgU29ydGFibGUudHJhY2tlclt0aGlzLm9wdGlvbnMubmFtZV0uY291bnRlcisrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jb3B5KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuY29weSA9IDBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdzdGFydCcsIGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnU3RhcnQpXHJcbiAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdkcmFnZ2FibGUnLCB0cnVlKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlbW92ZXMgYWxsIGV2ZW50cyBmcm9tIGFuIEhUTUwgZWxlbWVudFxyXG4gICAgICogTk9URTogZG9lcyBub3QgcmVtb3ZlIHRoZSBlbGVtZW50IGZyb20gaXRzIHBhcmVudFxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICovXHJcbiAgICByZW1vdmVFbGVtZW50KGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBlbGVtZW50LmRyYWdNb3ZlKVxyXG4gICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGVsZW1lbnQuZHJhZ01vdmUpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhZGQgc29ydGFibGUgdG8gZ2xvYmFsIGxpc3QgdGhhdCB0cmFja3MgYWxsIHNvcnRhYmxlc1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2FkZFRvR2xvYmFsVHJhY2tlcigpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKCFTb3J0YWJsZS50cmFja2VyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgU29ydGFibGUuZHJhZ0ltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgICAgICAgICAgU29ydGFibGUuZHJhZ0ltYWdlLmlkID0gJ3NvcnRhYmxlLWRyYWdJbWFnZSdcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChTb3J0YWJsZS5kcmFnSW1hZ2UpXHJcbiAgICAgICAgICAgIFNvcnRhYmxlLnRyYWNrZXIgPSB7fVxyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgKGUpID0+IHRoaXMuX2JvZHlEcmFnT3ZlcihlKSlcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywgKGUpID0+IHRoaXMuX2JvZHlEcm9wKGUpKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoU29ydGFibGUudHJhY2tlclt0aGlzLm9wdGlvbnMubmFtZV0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBTb3J0YWJsZS50cmFja2VyW3RoaXMub3B0aW9ucy5uYW1lXS5saXN0LnB1c2godGhpcylcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgU29ydGFibGUudHJhY2tlclt0aGlzLm9wdGlvbnMubmFtZV0gPSB7IGxpc3Q6IFt0aGlzXSwgY291bnRlcjogMCB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZGVmYXVsdCBkcmFnIG92ZXIgZm9yIHRoZSBib2R5XHJcbiAgICAgKiBAcGFyYW0ge0RyYWdFdmVudH0gZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2JvZHlEcmFnT3ZlcihlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IG5hbWUgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1swXVxyXG4gICAgICAgIGlmIChuYW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1sxXVxyXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXHJcbiAgICAgICAgICAgIGNvbnN0IHNvcnRhYmxlID0gdGhpcy5fZmluZENsb3Nlc3QoZSwgU29ydGFibGUudHJhY2tlcltuYW1lXS5saXN0LCBlbGVtZW50KVxyXG4gICAgICAgICAgICBpZiAoc29ydGFibGUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3BsYWNlSW5MaXN0KHNvcnRhYmxlLCBlLnBhZ2VYLCBlLnBhZ2VZLCBlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgZS5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9ICdtb3ZlJ1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlRHJhZ2dpbmcoZSwgZWxlbWVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX25vRHJvcChlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSBubyBkcm9wXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NhbmNlbF0gZm9yY2UgY2FuY2VsIChmb3Igb3B0aW9ucy5jb3B5KVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX25vRHJvcChlLCBjYW5jZWwpXHJcbiAgICB7XHJcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9ICdtb3ZlJ1xyXG4gICAgICAgIGNvbnN0IGlkID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMV1cclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXHJcbiAgICAgICAgaWYgKGVsZW1lbnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLl91cGRhdGVEcmFnZ2luZyhlLCBlbGVtZW50KVxyXG4gICAgICAgICAgICB0aGlzLl9zZXRJY29uKGVsZW1lbnQsIG51bGwsIGNhbmNlbClcclxuICAgICAgICAgICAgaWYgKCFjYW5jZWwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwub3B0aW9ucy5vZmZMaXN0ID09PSAnZGVsZXRlJylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkgPSBlbGVtZW50LnN0eWxlLmRpc3BsYXkgfHwgJ3Vuc2V0J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsLmVtaXQoJ2RlbGV0ZS1wZW5kaW5nJywgZWxlbWVudCwgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZXBsYWNlSW5MaXN0KGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCwgZWxlbWVudClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGRlZmF1bHQgZHJvcCBmb3IgdGhlIGJvZHlcclxuICAgICAqIEBwYXJhbSB7RHJhZ0V2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfYm9keURyb3AoZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBuYW1lID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMF1cclxuICAgICAgICBpZiAobmFtZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMV1cclxuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxyXG4gICAgICAgICAgICBjb25zdCBzb3J0YWJsZSA9IHRoaXMuX2ZpbmRDbG9zZXN0KGUsIFNvcnRhYmxlLnRyYWNrZXJbbmFtZV0ubGlzdCwgZWxlbWVudClcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlbW92ZURyYWdnaW5nKGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmUoKVxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkgPSBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsLmVtaXQoJ2RlbGV0ZScsIGVsZW1lbnQsIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbClcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgPSBudWxsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzdGFydCBkcmFnXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kcmFnU3RhcnQoZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBzb3J0YWJsZSA9IGUuY3VycmVudFRhcmdldC5fX3NvcnRhYmxlLm9yaWdpbmFsXHJcbiAgICAgICAgY29uc3QgZHJhZ2dpbmcgPSBlLmN1cnJlbnRUYXJnZXQuY2xvbmVOb2RlKHRydWUpXHJcbiAgICAgICAgZm9yIChsZXQgc3R5bGUgaW4gc29ydGFibGUub3B0aW9ucy5kcmFnU3R5bGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5zdHlsZVtzdHlsZV0gPSBzb3J0YWJsZS5vcHRpb25zLmRyYWdTdHlsZVtzdHlsZV1cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcG9zID0gdXRpbHMudG9HbG9iYWwoZS5jdXJyZW50VGFyZ2V0KVxyXG4gICAgICAgIGRyYWdnaW5nLnN0eWxlLmxlZnQgPSBwb3MueCArICdweCdcclxuICAgICAgICBkcmFnZ2luZy5zdHlsZS50b3AgPSBwb3MueSArICdweCdcclxuICAgICAgICBjb25zdCBvZmZzZXQgPSB7IHg6IHBvcy54IC0gZS5wYWdlWCwgeTogcG9zLnkgLSBlLnBhZ2VZIH1cclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRyYWdnaW5nKVxyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLnVzZUljb25zKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKVxyXG4gICAgICAgICAgICBpbWFnZS5zcmMgPSBzb3J0YWJsZS5vcHRpb25zLmljb25zLnJlb3JkZXJcclxuICAgICAgICAgICAgaW1hZ2Uuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoLTUwJSwgLTUwJSknXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLmxlZnQgPSBkcmFnZ2luZy5vZmZzZXRMZWZ0ICsgZHJhZ2dpbmcub2Zmc2V0V2lkdGggKyAncHgnXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLnRvcCA9IGRyYWdnaW5nLm9mZnNldFRvcCArIGRyYWdnaW5nLm9mZnNldEhlaWdodCArICdweCdcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpbWFnZSlcclxuICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbiA9IGltYWdlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLmN1cnNvckhvdmVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdXRpbHMuc3R5bGUoZS5jdXJyZW50VGFyZ2V0LCAnY3Vyc29yJywgc29ydGFibGUub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHRhcmdldCA9IGUuY3VycmVudFRhcmdldFxyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLmNvcHkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0YXJnZXQgPSBlLmN1cnJlbnRUYXJnZXQuY2xvbmVOb2RlKHRydWUpXHJcbiAgICAgICAgICAgIHRhcmdldC5pZCA9IGUuY3VycmVudFRhcmdldC5pZCArICctY29weS0nICsgZS5jdXJyZW50VGFyZ2V0Ll9fc29ydGFibGUuY29weVxyXG4gICAgICAgICAgICBlLmN1cnJlbnRUYXJnZXQuX19zb3J0YWJsZS5jb3B5KytcclxuICAgICAgICAgICAgc29ydGFibGUuYXR0YWNoRWxlbWVudCh0YXJnZXQpXHJcbiAgICAgICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLmlzQ29weSA9IHRydWVcclxuICAgICAgICAgICAgdGFyZ2V0Ll9fc29ydGFibGUub3JpZ2luYWwgPSB0aGlzXHJcbiAgICAgICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLmRpc3BsYXkgPSB0YXJnZXQuc3R5bGUuZGlzcGxheSB8fCAndW5zZXQnXHJcbiAgICAgICAgICAgIHRhcmdldC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGFyZ2V0KVxyXG4gICAgICAgIH1cclxuICAgICAgICBlLmRhdGFUcmFuc2Zlci5jbGVhckRhdGEoKVxyXG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLnNldERhdGEoc29ydGFibGUub3B0aW9ucy5uYW1lLCBzb3J0YWJsZS5vcHRpb25zLm5hbWUpXHJcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuc2V0RGF0YSh0YXJnZXQuaWQsIHRhcmdldC5pZClcclxuICAgICAgICBlLmRhdGFUcmFuc2Zlci5zZXREcmFnSW1hZ2UoU29ydGFibGUuZHJhZ0ltYWdlLCAwLCAwKVxyXG4gICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLmN1cnJlbnQgPSB0aGlzXHJcbiAgICAgICAgdGFyZ2V0Ll9fc29ydGFibGUuaW5kZXggPSBzb3J0YWJsZS5vcHRpb25zLmNvcHkgPyAtMSA6IHNvcnRhYmxlLl9nZXRJbmRleCh0YXJnZXQpXHJcbiAgICAgICAgdGFyZ2V0Ll9fc29ydGFibGUuZHJhZ2dpbmcgPSBkcmFnZ2luZ1xyXG4gICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLm9mZnNldCA9IG9mZnNldFxyXG4gICAgfVxyXG5cclxuICAgIF9kcmFnT3ZlcihlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHNvcnRhYmxlID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMF1cclxuICAgICAgICBpZiAoc29ydGFibGUgJiYgc29ydGFibGUgPT09IHRoaXMub3B0aW9ucy5uYW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1sxXVxyXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUuaXNDb3B5ICYmIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9PT0gdGhpcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbm9Ecm9wKGUsIHRydWUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5vcHRpb25zLmRyb3AgfHwgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsID09PSB0aGlzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wbGFjZUluTGlzdCh0aGlzLCBlLnBhZ2VYLCBlLnBhZ2VZLCBlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgZS5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9IGVsZW1lbnQuX19zb3J0YWJsZS5pc0NvcHkgPyAnY29weScgOiAnbW92ZSdcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZURyYWdnaW5nKGUsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9ub0Ryb3AoZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfdXBkYXRlRHJhZ2dpbmcoZSwgZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBkcmFnZ2luZyA9IGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnZ2luZ1xyXG4gICAgICAgIGNvbnN0IG9mZnNldCA9IGVsZW1lbnQuX19zb3J0YWJsZS5vZmZzZXRcclxuICAgICAgICBpZiAoZHJhZ2dpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5zdHlsZS5sZWZ0ID0gZS5wYWdlWCArIG9mZnNldC54ICsgJ3B4J1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5zdHlsZS50b3AgPSBlLnBhZ2VZICsgb2Zmc2V0LnkgKyAncHgnXHJcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZy5pY29uKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnN0eWxlLmxlZnQgPSBkcmFnZ2luZy5vZmZzZXRMZWZ0ICsgZHJhZ2dpbmcub2Zmc2V0V2lkdGggKyAncHgnXHJcbiAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnN0eWxlLnRvcCA9IGRyYWdnaW5nLm9mZnNldFRvcCArIGRyYWdnaW5nLm9mZnNldEhlaWdodCArICdweCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfcmVtb3ZlRHJhZ2dpbmcoZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBkcmFnZ2luZyA9IGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnZ2luZ1xyXG4gICAgICAgIGRyYWdnaW5nLnJlbW92ZSgpXHJcbiAgICAgICAgaWYgKGRyYWdnaW5nLmljb24pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5pY29uLnJlbW92ZSgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnZ2luZyA9IG51bGxcclxuICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuaXNDb3B5ID0gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBfZHJvcChlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IG5hbWUgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1swXVxyXG4gICAgICAgIGlmIChuYW1lICYmIG5hbWUgPT09IHRoaXMub3B0aW9ucy5uYW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1sxXVxyXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgIT09IHRoaXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbC5lbWl0KCdyZW1vdmUnLCBlbGVtZW50LCBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2FkZCcsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgPSB0aGlzXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNvcnQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdvcmRlcicsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ3VwZGF0ZScsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLmluZGV4ICE9PSB0aGlzLl9nZXRJbmRleChlLmN1cnJlbnRUYXJnZXQpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgnb3JkZXInLCBlbGVtZW50LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgndXBkYXRlJywgZWxlbWVudCwgdGhpcylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVEcmFnZ2luZyhlbGVtZW50KVxyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGZpbmQgY2xvc2VzdCBTb3J0YWJsZSB0byBzY3JlZW4gbG9jYXRpb25cclxuICAgICAqIEBwYXJhbSB7VUlFdmVudH0gZVxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZVtdfSBsaXN0IG9mIHJlbGF0ZWQgU29ydGFibGVzXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZmluZENsb3Nlc3QoZSwgbGlzdCwgZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBsZXQgbWluID0gSW5maW5pdHksIGZvdW5kXHJcbiAgICAgICAgZm9yIChsZXQgcmVsYXRlZCBvZiBsaXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCghcmVsYXRlZC5vcHRpb25zLmRyb3AgJiYgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsICE9PSByZWxhdGVkKSB8fFxyXG4gICAgICAgICAgICAgICAgKGVsZW1lbnQuX19zb3J0YWJsZS5pc0NvcHkgJiYgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsID09PSByZWxhdGVkKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29udGludWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodXRpbHMuaW5zaWRlKGUucGFnZVgsIGUucGFnZVksIHJlbGF0ZWQuZWxlbWVudCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZWxhdGVkXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAocmVsYXRlZC5vcHRpb25zLm9mZkxpc3QgPT09ICdjbG9zZXN0JylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2FsY3VsYXRlID0gdXRpbHMuZGlzdGFuY2VUb0Nsb3Nlc3RDb3JuZXIoZS5wYWdlWCwgZS5wYWdlWSwgcmVsYXRlZC5lbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgaWYgKGNhbGN1bGF0ZSA8IG1pbilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtaW4gPSBjYWxjdWxhdGVcclxuICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHJlbGF0ZWRcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZm91bmRcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBsYWNlIGluZGljYXRvciBpbiB0aGUgc29ydGFibGUgbGlzdCBhY2NvcmRpbmcgdG8gb3B0aW9ucy5zb3J0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGxhY2VJbkxpc3Qoc29ydGFibGUsIHgsIHksIGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkgPT09ICd1bnNldCcgPyAnJyA6IGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5XHJcbiAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5ID0gbnVsbFxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNvcnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLl9wbGFjZUluU29ydGFibGVMaXN0KHNvcnRhYmxlLCB4LCB5LCBlbGVtZW50KVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLl9wbGFjZUluT3JkZXJlZExpc3Qoc29ydGFibGUsIGVsZW1lbnQpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3NldEljb24oZWxlbWVudCwgc29ydGFibGUpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZXBsYWNlIGl0ZW0gaW4gbGlzdCBhdCBvcmlnaW5hbCBpbmRleCBwb3NpdGlvblxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3JlcGxhY2VJbkxpc3Qoc29ydGFibGUsIGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IGVsZW1lbnQuX19zb3J0YWJsZS5pbmRleFxyXG4gICAgICAgICAgICBpZiAoaW5kZXggPCBjaGlsZHJlbi5sZW5ndGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkcmVuW2luZGV4XS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShlbGVtZW50LCBjaGlsZHJlbltpbmRleF0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlblswXS5hcHBlbmRDaGlsZChlbGVtZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZWxlbWVudClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgX2dldEluZGV4KGNoaWxkKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoY2hpbGRyZW5baV0gPT09IGNoaWxkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIF90cmF2ZXJzZUNoaWxkcmVuKGJhc2UsIHNlYXJjaCwgcmVzdWx0cylcclxuICAgIHtcclxuICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBiYXNlLmNoaWxkcmVuKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHNlYXJjaC5sZW5ndGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzZWFyY2guaW5kZXhPZihjaGlsZC5jbGFzc05hbWUpICE9PSAtMSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goY2hpbGQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goY2hpbGQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fdHJhdmVyc2VDaGlsZHJlbihjaGlsZCwgc2VhcmNoLCByZXN1bHRzKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGZpbmQgY2hpbGRyZW4gaW4gZGl2XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3JkZXJdIHNlYXJjaCBmb3IgZHJhZ09yZGVyIGFzIHdlbGxcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9nZXRDaGlsZHJlbihvcmRlcilcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBTZWFyY2gpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgc2VhcmNoID0gW11cclxuICAgICAgICAgICAgaWYgKG9yZGVyICYmIHRoaXMub3B0aW9ucy5vcmRlckNsYXNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2gucHVzaCh0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKG9yZGVyICYmIHRoaXMub3B0aW9ucy5vcmRlckNsYXNzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaC5wdXNoKHRoaXMub3B0aW9ucy5vcmRlckNsYXNzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKCFvcmRlciAmJiB0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzZWFyY2gucHVzaCh0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXVxyXG4gICAgICAgICAgICB0aGlzLl90cmF2ZXJzZUNoaWxkcmVuKHRoaXMuZWxlbWVudCwgc2VhcmNoLCByZXN1bHRzKVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0c1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGV0IGxpc3QgPSBbXVxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5lbGVtZW50LmNoaWxkcmVuKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh1dGlscy5jb250YWluc0NsYXNzTmFtZShjaGlsZCwgdGhpcy5vcHRpb25zLmRyYWdDbGFzcykgfHwgKG9yZGVyICYmICF0aGlzLm9wdGlvbnMub3JkZXJDbGFzcyB8fCAob3JkZXIgJiYgdGhpcy5vcHRpb25zLm9yZGVyQ2xhc3MgJiYgdXRpbHMuY29udGFpbnNDbGFzc05hbWUoY2hpbGQsIHRoaXMub3B0aW9ucy5vcmRlckNsYXNzKSkpKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGlzdC5wdXNoKGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBsaXN0XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50LmNoaWxkcmVuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwbGFjZSBpbmRpY2F0b3IgaW4gYW4gb3JkZXJlZCBsaXN0XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmdcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9wbGFjZUluT3JkZXJlZExpc3Qoc29ydGFibGUsIGRyYWdnaW5nKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgIT09IHNvcnRhYmxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSBzb3J0YWJsZS5vcHRpb25zLm9yZGVySWRcclxuICAgICAgICAgICAgbGV0IGRyYWdPcmRlciA9IGRyYWdnaW5nLmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICAgICAgZHJhZ09yZGVyID0gc29ydGFibGUub3B0aW9ucy5vcmRlcklkSXNOdW1iZXIgPyBwYXJzZUZsb2F0KGRyYWdPcmRlcikgOiBkcmFnT3JkZXJcclxuICAgICAgICAgICAgbGV0IGZvdW5kXHJcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gc29ydGFibGUuX2dldENoaWxkcmVuKHRydWUpXHJcbiAgICAgICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLnJldmVyc2VPcmRlcilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IGNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gY2hpbGRyZW5baV1cclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGREcmFnT3JkZXIgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGREcmFnT3JkZXIgPSBzb3J0YWJsZS5vcHRpb25zLm9yZGVySXNOdW1iZXIgPyBwYXJzZUZsb2F0KGNoaWxkRHJhZ09yZGVyKSA6IGNoaWxkRHJhZ09yZGVyXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdPcmRlciA+IGNoaWxkRHJhZ09yZGVyKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZHJhZ2dpbmcsIGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBjaGlsZHJlbilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGREcmFnT3JkZXIgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGREcmFnT3JkZXIgPSBzb3J0YWJsZS5vcHRpb25zLm9yZGVySXNOdW1iZXIgPyBwYXJzZUZsb2F0KGNoaWxkRHJhZ09yZGVyKSA6IGNoaWxkRHJhZ09yZGVyXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdPcmRlciA8IGNoaWxkRHJhZ09yZGVyKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZHJhZ2dpbmcsIGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFmb3VuZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc29ydGFibGUuZWxlbWVudC5hcHBlbmRDaGlsZChkcmFnZ2luZylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQuZW1pdCgncmVtb3ZlLXBlbmRpbmcnLCBkcmFnZ2luZywgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdhZGQtcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50ID0gc29ydGFibGVcclxuICAgICAgICAgICAgc29ydGFibGUuZW1pdCgndXBkYXRlLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2VhcmNoIGZvciB3aGVyZSB0byBwbGFjZSB1c2luZyBkaXN0YW5jZVxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IGZhbHNlPW5vdGhpbmcgdG8gZG9cclxuICAgICAqL1xyXG4gICAgX3BsYWNlQnlEaXN0YW5jZShzb3J0YWJsZSwgZHJhZ2dpbmcsIHgsIHkpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IGRpc3RhbmNlID0gSW5maW5pdHksIGNsb3Nlc3QsIGlzQmVmb3JlLCBpbmRpY2F0b3JcclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gc29ydGFibGUuZWxlbWVudFxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnRzID0gc29ydGFibGUuX2dldENoaWxkcmVuKHRydWUpXHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgZWxlbWVudHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoY2hpbGQgPT09IGRyYWdnaW5nKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbmRpY2F0b3IgPSB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHV0aWxzLmluc2lkZSh4LCB5LCBjaGlsZCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNsb3Nlc3QgPSBjaGlsZFxyXG4gICAgICAgICAgICAgICAgaXNCZWZvcmUgPSBpbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBtZWFzdXJlID0gdXRpbHMuZGlzdGFuY2VUb0Nsb3Nlc3RDb3JuZXIoeCwgeSwgY2hpbGQpXHJcbiAgICAgICAgICAgICAgICBpZiAobWVhc3VyZSA8IGRpc3RhbmNlKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsb3Nlc3QgPSBjaGlsZFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc3RhbmNlID0gbWVhc3VyZVxyXG4gICAgICAgICAgICAgICAgICAgIGlzQmVmb3JlID0gaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNsb3Nlc3QgPT09IGRyYWdnaW5nKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzQmVmb3JlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZWxlbWVudC5pbnNlcnRCZWZvcmUoZHJhZ2dpbmcsIGNsb3Nlc3QubmV4dFNpYmxpbmcpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKGRyYWdnaW5nLCBjbG9zZXN0KVxyXG4gICAgICAgIH1cclxuICAgICAgICBzb3J0YWJsZS5lbWl0KCdvcmRlci1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGxhY2UgaW5kaWNhdG9yIGluIGFuIHNvcnRhYmxlIGxpc3RcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmdcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9wbGFjZUluU29ydGFibGVMaXN0KHNvcnRhYmxlLCB4LCB5LCBkcmFnZ2luZylcclxuICAgIHtcclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gc29ydGFibGUuZWxlbWVudFxyXG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gc29ydGFibGUuX2dldENoaWxkcmVuKClcclxuICAgICAgICBpZiAoIWNoaWxkcmVuLmxlbmd0aClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgIT09IHNvcnRhYmxlKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQuZW1pdCgncmVtb3ZlLXBlbmRpbmcnLCBkcmFnZ2luZywgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICAgICAgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50ID0gc29ydGFibGVcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ2FkZC1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoZHJhZ2dpbmcpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9wbGFjZUJ5RGlzdGFuY2Uoc29ydGFibGUsIGRyYWdnaW5nLCB4LCB5KSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudCAhPT0gc29ydGFibGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdhZGQtcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50LmVtaXQoJ3JlbW92ZS1wZW5kaW5nJywgZHJhZ2dpbmcsIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50ID0gc29ydGFibGVcclxuICAgICAgICB9XHJcbiAgICAgICAgc29ydGFibGUuZW1pdCgndXBkYXRlLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzZXQgaWNvbiBpZiBhdmFpbGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2FuY2VsXSBmb3JjZSBjYW5jZWwgKGZvciBvcHRpb25zLmNvcHkpXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfc2V0SWNvbihlbGVtZW50LCBzb3J0YWJsZSwgY2FuY2VsKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGRyYWdnaW5nID0gZWxlbWVudC5fX3NvcnRhYmxlLmRyYWdnaW5nXHJcbiAgICAgICAgaWYgKGRyYWdnaW5nICYmIGRyYWdnaW5nLmljb24pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoIXNvcnRhYmxlKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZSA9IGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbFxyXG4gICAgICAgICAgICAgICAgaWYgKGNhbmNlbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnNyYyA9IHNvcnRhYmxlLm9wdGlvbnMuaWNvbnMuY2FuY2VsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zcmMgPSBzb3J0YWJsZS5vcHRpb25zLm9mZkxpc3QgPT09ICdkZWxldGUnID8gc29ydGFibGUub3B0aW9ucy5pY29ucy5kZWxldGUgOiBzb3J0YWJsZS5vcHRpb25zLmljb25zLmNhbmNlbFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5pc0NvcHkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zcmMgPSBzb3J0YWJsZS5vcHRpb25zLmljb25zLmNvcHlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnNyYyA9IGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9PT0gc29ydGFibGUgPyBzb3J0YWJsZS5vcHRpb25zLmljb25zLnJlb3JkZXIgOiBzb3J0YWJsZS5vcHRpb25zLmljb25zLm1vdmVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyBwaWNrZWQgdXAgYmVjYXVzZSBpdCB3YXMgbW92ZWQgYmV5b25kIHRoZSBvcHRpb25zLnRocmVzaG9sZFxyXG4gKiBAZXZlbnQgU29ydGFibGUjcGlja3VwXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgYmVpbmcgZHJhZ2dlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBjdXJyZW50IHNvcnRhYmxlIHdpdGggZWxlbWVudCBwbGFjZWhvbGRlclxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgc29ydGFibGUgaXMgcmVvcmRlcmVkXHJcbiAqIEBldmVudCBTb3J0YWJsZSNvcmRlclxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHRoYXQgd2FzIHJlb3JkZXJlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyBwbGFjZWRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIGFkZGVkIHRvIHRoaXMgc29ydGFibGVcclxuICogQGV2ZW50IFNvcnRhYmxlI2FkZFxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGFkZGVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIGFkZGVkXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyByZW1vdmVkIGZyb20gdGhpcyBzb3J0YWJsZVxyXG4gKiBAZXZlbnQgU29ydGFibGUjcmVtb3ZlXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgcmVtb3ZlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyByZW1vdmVkXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyByZW1vdmVkIGZyb20gYWxsIHNvcnRhYmxlc1xyXG4gKiBAZXZlbnQgU29ydGFibGUjZGVsZXRlXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgcmVtb3ZlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyBkcmFnZ2VkIGZyb21cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiB0aGUgc29ydGFibGUgaXMgdXBkYXRlZCB3aXRoIGFuIGFkZCwgcmVtb3ZlLCBvciBvcmRlciBjaGFuZ2VcclxuICogQGV2ZW50IFNvcnRhYmxlI3VwZGF0ZVxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGNoYW5nZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2l0aCBlbGVtZW50XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gb3JkZXIgd2FzIGNoYW5nZWQgYnV0IGVsZW1lbnQgd2FzIG5vdCBkcm9wcGVkIHlldFxyXG4gKiBAZXZlbnQgU29ydGFibGUjb3JkZXItcGVuZGluZ1xyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBlbGVtZW50IGlzIGFkZGVkIGJ1dCBub3QgZHJvcHBlZCB5ZXRcclxuICogQGV2ZW50IFNvcnRhYmxlI2FkZC1wZW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgYmVpbmcgZHJhZ2dlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBjdXJyZW50IHNvcnRhYmxlIHdpdGggZWxlbWVudCBwbGFjZWhvbGRlclxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGVsZW1lbnQgaXMgcmVtb3ZlZCBidXQgbm90IGRyb3BwZWQgeWV0XHJcbiAqIEBldmVudCBTb3J0YWJsZSNyZW1vdmUtcGVuZGluZ1xyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIGFib3V0IHRvIGJlIHJlbW92ZWQgZnJvbSBhbGwgc29ydGFibGVzXHJcbiAqIEBldmVudCBTb3J0YWJsZSNkZWxldGUtcGVuZGluZ1xyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHJlbW92ZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgZHJhZ2dlZCBmcm9tXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyBhZGRlZCwgcmVtb3ZlZCwgb3IgcmVvcmRlciBidXQgZWxlbWVudCBoYXMgbm90IGRyb3BwZWQgeWV0XHJcbiAqIEBldmVudCBTb3J0YWJsZSN1cGRhdGUtcGVuZGluZ1xyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovXHJcblxyXG4gbW9kdWxlLmV4cG9ydHMgPSBTb3J0YWJsZSJdfQ==