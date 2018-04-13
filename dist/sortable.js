'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventemitter = require('eventemitter3');

var _eventemitter2 = _interopRequireDefault(_eventemitter);

var _defaults = require('./defaults');

var _defaults2 = _interopRequireDefault(_defaults);

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

        _this.options = utils.options(options, _defaults2.default);
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
                utils.style(e.target, 'cursor', this.options.cursorDown);
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
            element.removeEventListener('mousedown', element.dragStart);
            element.removeEventListener('touchstart', element.dragStart);
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
            var sortable = e.target.__sortable.original;
            var dragging = e.target.cloneNode(true);
            for (var style in sortable.options.dragStyle) {
                dragging.style[style] = sortable.options.dragStyle[style];
            }
            var pos = utils.toGlobal(e.target);
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
                utils.style(e.target, 'cursor', sortable.options.cursorHover);
            }
            var target = e.target;
            if (sortable.options.copy) {
                target = e.target.cloneNode(true);
                target.id = e.target.id + '-copy-' + e.target.__sortable.copy;
                e.target.__sortable.copy++;
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
            e.dataTransfer.setDragImage(document.createElement('div'), 0, 0);
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
                    if (element.__sortable.index !== this._getIndex(e.target)) {
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
                var distance = Infinity,
                    closest = void 0,
                    isBefore = void 0,
                    indicator = void 0;
                var _elements = sortable._getChildren(true);
                var _iteratorNormalCompletion9 = true;
                var _didIteratorError9 = false;
                var _iteratorError9 = undefined;

                try {
                    for (var _iterator9 = _elements[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                        var child = _step9.value;

                        if (child === dragging) {
                            indicator = true;
                        }
                        if (utils.inside(x, y, child)) {
                            if (child === dragging) {
                                return;
                            }
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

                if (closest) {
                    if (closest === dragging) {
                        return;
                    }
                    if (isBefore) {
                        element.insertBefore(dragging, closest.nextSibling);
                    } else {
                        element.insertBefore(dragging, closest);
                    }
                    sortable.emit('order-pending', dragging, sortable);
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
            return _defaults2.default;
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


exports.default = Sortable;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3J0YWJsZS5qcyJdLCJuYW1lcyI6WyJ1dGlscyIsIlNvcnRhYmxlIiwiZWxlbWVudCIsIm9wdGlvbnMiLCJfYWRkVG9HbG9iYWxUcmFja2VyIiwiZWxlbWVudHMiLCJfZ2V0Q2hpbGRyZW4iLCJjaGlsZCIsImRyYWdDbGFzcyIsImNvbnRhaW5zQ2xhc3NOYW1lIiwiYXR0YWNoRWxlbWVudCIsImV2ZW50cyIsImRyYWdPdmVyIiwiZSIsIl9kcmFnT3ZlciIsImRyb3AiLCJfZHJvcCIsIm1vdXNlT3ZlciIsIl9tb3VzZUVudGVyIiwiYWRkRXZlbnRMaXN0ZW5lciIsImN1cnNvckhvdmVyIiwic3R5bGUiLCJjdXJzb3JEb3duIiwiX21vdXNlRG93biIsInRhcmdldCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJyZW1vdmVFbGVtZW50IiwiaW5kZXgiLCJzb3J0IiwiY2hpbGRyZW4iLCJsZW5ndGgiLCJhcHBlbmRDaGlsZCIsImluc2VydEJlZm9yZSIsImlkIiwib3JkZXJJZCIsImRyYWdPcmRlciIsImdldEF0dHJpYnV0ZSIsIm9yZGVySWRJc051bWJlciIsInBhcnNlRmxvYXQiLCJmb3VuZCIsInJldmVyc2VPcmRlciIsImkiLCJjaGlsZERyYWdPcmRlciIsIm9yZGVySXNOdW1iZXIiLCJwYXJlbnROb2RlIiwiX19zb3J0YWJsZSIsIm9yaWdpbmFsIiwic29ydGFibGUiLCJkcmFnU3RhcnQiLCJfZHJhZ1N0YXJ0IiwibmFtZSIsInRyYWNrZXIiLCJjb3VudGVyIiwiY29weSIsInNldEF0dHJpYnV0ZSIsImRvY3VtZW50IiwiYm9keSIsIl9ib2R5RHJhZ092ZXIiLCJfYm9keURyb3AiLCJsaXN0IiwicHVzaCIsImRhdGFUcmFuc2ZlciIsInR5cGVzIiwiZ2V0RWxlbWVudEJ5SWQiLCJfZmluZENsb3Nlc3QiLCJfcGxhY2VJbkxpc3QiLCJwYWdlWCIsInBhZ2VZIiwiZHJvcEVmZmVjdCIsIl91cGRhdGVEcmFnZ2luZyIsIl9ub0Ryb3AiLCJwcmV2ZW50RGVmYXVsdCIsImNhbmNlbCIsIl9zZXRJY29uIiwib2ZmTGlzdCIsImRpc3BsYXkiLCJlbWl0IiwiX3JlcGxhY2VJbkxpc3QiLCJfcmVtb3ZlRHJhZ2dpbmciLCJyZW1vdmUiLCJkcmFnZ2luZyIsImNsb25lTm9kZSIsImRyYWdTdHlsZSIsInBvcyIsInRvR2xvYmFsIiwibGVmdCIsIngiLCJ0b3AiLCJ5Iiwib2Zmc2V0IiwidXNlSWNvbnMiLCJpbWFnZSIsIkltYWdlIiwic3JjIiwiaWNvbnMiLCJyZW9yZGVyIiwicG9zaXRpb24iLCJ0cmFuc2Zvcm0iLCJvZmZzZXRMZWZ0Iiwib2Zmc2V0V2lkdGgiLCJvZmZzZXRUb3AiLCJvZmZzZXRIZWlnaHQiLCJpY29uIiwiaXNDb3B5IiwiY2xlYXJEYXRhIiwic2V0RGF0YSIsInNldERyYWdJbWFnZSIsImNyZWF0ZUVsZW1lbnQiLCJjdXJyZW50IiwiX2dldEluZGV4Iiwic3RvcFByb3BhZ2F0aW9uIiwibWluIiwiSW5maW5pdHkiLCJyZWxhdGVkIiwiaW5zaWRlIiwiY2FsY3VsYXRlIiwiZGlzdGFuY2VUb0Nsb3Nlc3RDb3JuZXIiLCJfcGxhY2VJblNvcnRhYmxlTGlzdCIsIl9wbGFjZUluT3JkZXJlZExpc3QiLCJiYXNlIiwic2VhcmNoIiwicmVzdWx0cyIsImluZGV4T2YiLCJjbGFzc05hbWUiLCJfdHJhdmVyc2VDaGlsZHJlbiIsIm9yZGVyIiwiZGVlcFNlYXJjaCIsIm9yZGVyQ2xhc3MiLCJkaXN0YW5jZSIsImNsb3Nlc3QiLCJpc0JlZm9yZSIsImluZGljYXRvciIsIm1lYXN1cmUiLCJuZXh0U2libGluZyIsImRlbGV0ZSIsIm1vdmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7Ozs7QUFFQTs7OztBQUNBOztJQUFZQSxLOzs7Ozs7Ozs7Ozs7SUFFU0MsUTs7O0FBRWpCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQ0Esc0JBQVlDLE9BQVosRUFBcUJDLE9BQXJCLEVBQ0E7QUFBQTs7QUFBQTs7QUFFSSxjQUFLQSxPQUFMLEdBQWVILE1BQU1HLE9BQU4sQ0FBY0EsT0FBZCxxQkFBZjtBQUNBLGNBQUtELE9BQUwsR0FBZUEsT0FBZjtBQUNBLGNBQUtFLG1CQUFMO0FBQ0EsWUFBTUMsV0FBVyxNQUFLQyxZQUFMLEVBQWpCO0FBTEo7QUFBQTtBQUFBOztBQUFBO0FBTUksaUNBQWtCRCxRQUFsQiw4SEFDQTtBQUFBLG9CQURTRSxLQUNUOztBQUNJLG9CQUFJLENBQUMsTUFBS0osT0FBTCxDQUFhSyxTQUFkLElBQTJCUixNQUFNUyxpQkFBTixDQUF3QkYsS0FBeEIsRUFBK0IsTUFBS0osT0FBTCxDQUFhSyxTQUE1QyxDQUEvQixFQUNBO0FBQ0ksMEJBQUtFLGFBQUwsQ0FBbUJILEtBQW5CO0FBQ0g7QUFDSjtBQVpMO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBYUksY0FBS0ksTUFBTCxHQUFjO0FBQ1ZDLHNCQUFVLGtCQUFDQyxDQUFEO0FBQUEsdUJBQU8sTUFBS0MsU0FBTCxDQUFlRCxDQUFmLENBQVA7QUFBQSxhQURBO0FBRVZFLGtCQUFNLGNBQUNGLENBQUQ7QUFBQSx1QkFBTyxNQUFLRyxLQUFMLENBQVdILENBQVgsQ0FBUDtBQUFBLGFBRkk7QUFHVkksdUJBQVcsbUJBQUNKLENBQUQ7QUFBQSx1QkFBTyxNQUFLSyxXQUFMLENBQWlCTCxDQUFqQixDQUFQO0FBQUE7QUFIRCxTQUFkO0FBS0FYLGdCQUFRaUIsZ0JBQVIsQ0FBeUIsVUFBekIsRUFBcUMsTUFBS1IsTUFBTCxDQUFZQyxRQUFqRDtBQUNBVixnQkFBUWlCLGdCQUFSLENBQXlCLE1BQXpCLEVBQWlDLE1BQUtSLE1BQUwsQ0FBWUksSUFBN0M7QUFDQSxZQUFJLE1BQUtaLE9BQUwsQ0FBYWlCLFdBQWpCLEVBQ0E7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFDSSxzQ0FBa0IsTUFBS2QsWUFBTCxFQUFsQixtSUFDQTtBQUFBLHdCQURTQyxNQUNUOztBQUNJUCwwQkFBTXFCLEtBQU4sQ0FBWWQsTUFBWixFQUFtQixRQUFuQixFQUE2QixNQUFLSixPQUFMLENBQWFpQixXQUExQztBQUNBLHdCQUFJLE1BQUtqQixPQUFMLENBQWFtQixVQUFqQixFQUNBO0FBQ0lmLCtCQUFNWSxnQkFBTixDQUF1QixXQUF2QixFQUFvQyxVQUFDTixDQUFEO0FBQUEsbUNBQU8sTUFBS1UsVUFBTCxDQUFnQlYsQ0FBaEIsQ0FBUDtBQUFBLHlCQUFwQztBQUNIO0FBQ0o7QUFSTDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBU0M7QUE5Qkw7QUErQkM7Ozs7bUNBRVVBLEMsRUFDWDtBQUNJLGdCQUFJLEtBQUtWLE9BQUwsQ0FBYWlCLFdBQWpCLEVBQ0E7QUFDSXBCLHNCQUFNcUIsS0FBTixDQUFZUixFQUFFVyxNQUFkLEVBQXNCLFFBQXRCLEVBQWdDLEtBQUtyQixPQUFMLENBQWFtQixVQUE3QztBQUNIO0FBQ0o7O0FBRUQ7Ozs7OztrQ0FJQTtBQUNJLGlCQUFLcEIsT0FBTCxDQUFhdUIsbUJBQWIsQ0FBaUMsVUFBakMsRUFBNkMsS0FBS2QsTUFBTCxDQUFZQyxRQUF6RDtBQUNBLGlCQUFLVixPQUFMLENBQWF1QixtQkFBYixDQUFpQyxNQUFqQyxFQUF5QyxLQUFLZCxNQUFMLENBQVlJLElBQXJEO0FBQ0EsZ0JBQU1WLFdBQVcsS0FBS0MsWUFBTCxFQUFqQjtBQUhKO0FBQUE7QUFBQTs7QUFBQTtBQUlJLHNDQUFrQkQsUUFBbEIsbUlBQ0E7QUFBQSx3QkFEU0UsS0FDVDs7QUFDSSx5QkFBS21CLGFBQUwsQ0FBbUJuQixLQUFuQjtBQUNIO0FBUEw7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQVFDOztBQUVEOzs7Ozs7Ozs7QUF3QkE7Ozs7Ozs0QkFNSUwsTyxFQUFTeUIsSyxFQUNiO0FBQ0ksaUJBQUtqQixhQUFMLENBQW1CUixPQUFuQjtBQUNBLGdCQUFJLEtBQUtDLE9BQUwsQ0FBYXlCLElBQWpCLEVBQ0E7QUFDSSxvQkFBSSxPQUFPRCxLQUFQLEtBQWlCLFdBQWpCLElBQWdDQSxTQUFTLEtBQUt6QixPQUFMLENBQWEyQixRQUFiLENBQXNCQyxNQUFuRSxFQUNBO0FBQ0kseUJBQUs1QixPQUFMLENBQWE2QixXQUFiLENBQXlCN0IsT0FBekI7QUFDSCxpQkFIRCxNQUtBO0FBQ0kseUJBQUtBLE9BQUwsQ0FBYThCLFlBQWIsQ0FBMEI5QixPQUExQixFQUFtQyxLQUFLQSxPQUFMLENBQWEyQixRQUFiLENBQXNCRixRQUFRLENBQTlCLENBQW5DO0FBQ0g7QUFDSixhQVZELE1BWUE7QUFDSSxvQkFBTU0sS0FBSyxLQUFLOUIsT0FBTCxDQUFhK0IsT0FBeEI7QUFDQSxvQkFBSUMsWUFBWWpDLFFBQVFrQyxZQUFSLENBQXFCSCxFQUFyQixDQUFoQjtBQUNBRSw0QkFBWSxLQUFLaEMsT0FBTCxDQUFha0MsZUFBYixHQUErQkMsV0FBV0gsU0FBWCxDQUEvQixHQUF1REEsU0FBbkU7QUFDQSxvQkFBSUksY0FBSjtBQUNBLG9CQUFNVixXQUFXLEtBQUt2QixZQUFMLENBQWtCLElBQWxCLENBQWpCO0FBQ0Esb0JBQUksS0FBS0gsT0FBTCxDQUFhcUMsWUFBakIsRUFDQTtBQUNJLHlCQUFLLElBQUlDLElBQUlaLFNBQVNDLE1BQVQsR0FBa0IsQ0FBL0IsRUFBa0NXLEtBQUssQ0FBdkMsRUFBMENBLEdBQTFDLEVBQ0E7QUFDSSw0QkFBTWxDLFFBQVFzQixTQUFTWSxDQUFULENBQWQ7QUFDQSw0QkFBSUMsaUJBQWlCbkMsTUFBTTZCLFlBQU4sQ0FBbUJILEVBQW5CLENBQXJCO0FBQ0FTLHlDQUFpQixLQUFLdkMsT0FBTCxDQUFhd0MsYUFBYixHQUE2QkwsV0FBV0ksY0FBWCxDQUE3QixHQUEwREEsY0FBM0U7QUFDQSw0QkFBSVAsWUFBWU8sY0FBaEIsRUFDQTtBQUNJbkMsa0NBQU1xQyxVQUFOLENBQWlCWixZQUFqQixDQUE4QjlCLE9BQTlCLEVBQXVDSyxLQUF2QztBQUNBZ0Msb0NBQVEsSUFBUjtBQUNBO0FBQ0g7QUFDSjtBQUNKLGlCQWRELE1BZ0JBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQ0ksOENBQWtCVixRQUFsQixtSUFDQTtBQUFBLGdDQURTdEIsT0FDVDs7QUFDSSxnQ0FBSW1DLGtCQUFpQm5DLFFBQU02QixZQUFOLENBQW1CSCxFQUFuQixDQUFyQjtBQUNBUyw4Q0FBaUIsS0FBS3ZDLE9BQUwsQ0FBYXdDLGFBQWIsR0FBNkJMLFdBQVdJLGVBQVgsQ0FBN0IsR0FBMERBLGVBQTNFO0FBQ0EsZ0NBQUlQLFlBQVlPLGVBQWhCLEVBQ0E7QUFDSW5DLHdDQUFNcUMsVUFBTixDQUFpQlosWUFBakIsQ0FBOEI5QixPQUE5QixFQUF1Q0ssT0FBdkM7QUFDQWdDLHdDQUFRLElBQVI7QUFDQTtBQUNIO0FBQ0o7QUFYTDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBWUM7QUFDRCxvQkFBSSxDQUFDQSxLQUFMLEVBQ0E7QUFDSSx5QkFBS3JDLE9BQUwsQ0FBYTZCLFdBQWIsQ0FBeUI3QixPQUF6QjtBQUNIO0FBQ0o7QUFDSjs7QUFFRDs7Ozs7Ozs7c0NBS2NBLE8sRUFDZDtBQUFBOztBQUNJLGdCQUFJQSxRQUFRMkMsVUFBWixFQUNBO0FBQ0kzQyx3QkFBUTJDLFVBQVIsQ0FBbUJDLFFBQW5CLEdBQThCLElBQTlCO0FBQ0gsYUFIRCxNQUtBO0FBQ0k1Qyx3QkFBUTJDLFVBQVIsR0FBcUI7QUFDakJFLDhCQUFVLElBRE87QUFFakJELDhCQUFVLElBRk87QUFHakJFLCtCQUFXLG1CQUFDbkMsQ0FBRDtBQUFBLCtCQUFPLE9BQUtvQyxVQUFMLENBQWdCcEMsQ0FBaEIsQ0FBUDtBQUFBOztBQUdmO0FBTnFCLGlCQUFyQixDQU9BLElBQUksQ0FBQ1gsUUFBUStCLEVBQWIsRUFDQTtBQUNJL0IsNEJBQVErQixFQUFSLEdBQWEsZ0JBQWdCLEtBQUs5QixPQUFMLENBQWErQyxJQUE3QixHQUFvQyxHQUFwQyxHQUEwQ2pELFNBQVNrRCxPQUFULENBQWlCLEtBQUtoRCxPQUFMLENBQWErQyxJQUE5QixFQUFvQ0UsT0FBM0Y7QUFDQW5ELDZCQUFTa0QsT0FBVCxDQUFpQixLQUFLaEQsT0FBTCxDQUFhK0MsSUFBOUIsRUFBb0NFLE9BQXBDO0FBQ0g7QUFDRCxvQkFBSSxLQUFLakQsT0FBTCxDQUFha0QsSUFBakIsRUFDQTtBQUNJbkQsNEJBQVEyQyxVQUFSLENBQW1CUSxJQUFuQixHQUEwQixDQUExQjtBQUNIO0FBQ0RuRCx3QkFBUWlCLGdCQUFSLENBQXlCLFdBQXpCLEVBQXNDakIsUUFBUTJDLFVBQVIsQ0FBbUJHLFNBQXpEO0FBQ0E5Qyx3QkFBUW9ELFlBQVIsQ0FBcUIsV0FBckIsRUFBa0MsSUFBbEM7QUFDSDtBQUNKOztBQUVEOzs7Ozs7OztzQ0FLY3BELE8sRUFDZDtBQUNJQSxvQkFBUXVCLG1CQUFSLENBQTRCLFdBQTVCLEVBQXlDdkIsUUFBUThDLFNBQWpEO0FBQ0E5QyxvQkFBUXVCLG1CQUFSLENBQTRCLFlBQTVCLEVBQTBDdkIsUUFBUThDLFNBQWxEO0FBQ0g7O0FBRUQ7Ozs7Ozs7OENBS0E7QUFBQTs7QUFDSSxnQkFBSSxDQUFDL0MsU0FBU2tELE9BQWQsRUFDQTtBQUNJbEQseUJBQVNrRCxPQUFULEdBQW1CLEVBQW5CO0FBQ0FJLHlCQUFTQyxJQUFULENBQWNyQyxnQkFBZCxDQUErQixVQUEvQixFQUEyQyxVQUFDTixDQUFEO0FBQUEsMkJBQU8sT0FBSzRDLGFBQUwsQ0FBbUI1QyxDQUFuQixDQUFQO0FBQUEsaUJBQTNDO0FBQ0EwQyx5QkFBU0MsSUFBVCxDQUFjckMsZ0JBQWQsQ0FBK0IsTUFBL0IsRUFBdUMsVUFBQ04sQ0FBRDtBQUFBLDJCQUFPLE9BQUs2QyxTQUFMLENBQWU3QyxDQUFmLENBQVA7QUFBQSxpQkFBdkM7QUFDSDtBQUNELGdCQUFJWixTQUFTa0QsT0FBVCxDQUFpQixLQUFLaEQsT0FBTCxDQUFhK0MsSUFBOUIsQ0FBSixFQUNBO0FBQ0lqRCx5QkFBU2tELE9BQVQsQ0FBaUIsS0FBS2hELE9BQUwsQ0FBYStDLElBQTlCLEVBQW9DUyxJQUFwQyxDQUF5Q0MsSUFBekMsQ0FBOEMsSUFBOUM7QUFDSCxhQUhELE1BS0E7QUFDSTNELHlCQUFTa0QsT0FBVCxDQUFpQixLQUFLaEQsT0FBTCxDQUFhK0MsSUFBOUIsSUFBc0MsRUFBRVMsTUFBTSxDQUFDLElBQUQsQ0FBUixFQUFnQlAsU0FBUyxDQUF6QixFQUF0QztBQUNIO0FBQ0o7O0FBRUQ7Ozs7Ozs7O3NDQUtjdkMsQyxFQUNkO0FBQ0ksZ0JBQU1xQyxPQUFPckMsRUFBRWdELFlBQUYsQ0FBZUMsS0FBZixDQUFxQixDQUFyQixDQUFiO0FBQ0EsZ0JBQUlaLElBQUosRUFDQTtBQUNJLG9CQUFNakIsS0FBS3BCLEVBQUVnRCxZQUFGLENBQWVDLEtBQWYsQ0FBcUIsQ0FBckIsQ0FBWDtBQUNBLG9CQUFNNUQsVUFBVXFELFNBQVNRLGNBQVQsQ0FBd0I5QixFQUF4QixDQUFoQjtBQUNBLG9CQUFNYyxXQUFXLEtBQUtpQixZQUFMLENBQWtCbkQsQ0FBbEIsRUFBcUJaLFNBQVNrRCxPQUFULENBQWlCRCxJQUFqQixFQUF1QlMsSUFBNUMsRUFBa0R6RCxPQUFsRCxDQUFqQjtBQUNBLG9CQUFJNkMsUUFBSixFQUNBO0FBQ0kseUJBQUtrQixZQUFMLENBQWtCbEIsUUFBbEIsRUFBNEJsQyxFQUFFcUQsS0FBOUIsRUFBcUNyRCxFQUFFc0QsS0FBdkMsRUFBOENqRSxPQUE5QztBQUNBVyxzQkFBRWdELFlBQUYsQ0FBZU8sVUFBZixHQUE0QixNQUE1QjtBQUNBLHlCQUFLQyxlQUFMLENBQXFCeEQsQ0FBckIsRUFBd0JYLE9BQXhCO0FBQ0gsaUJBTEQsTUFPQTtBQUNJLHlCQUFLb0UsT0FBTCxDQUFhekQsQ0FBYjtBQUNIO0FBQ0RBLGtCQUFFMEQsY0FBRjtBQUNIO0FBQ0o7O0FBRUQ7Ozs7Ozs7OztnQ0FNUTFELEMsRUFBRzJELE0sRUFDWDtBQUNJM0QsY0FBRWdELFlBQUYsQ0FBZU8sVUFBZixHQUE0QixNQUE1QjtBQUNBLGdCQUFNbkMsS0FBS3BCLEVBQUVnRCxZQUFGLENBQWVDLEtBQWYsQ0FBcUIsQ0FBckIsQ0FBWDtBQUNBLGdCQUFNNUQsVUFBVXFELFNBQVNRLGNBQVQsQ0FBd0I5QixFQUF4QixDQUFoQjtBQUNBLGdCQUFJL0IsT0FBSixFQUNBO0FBQ0kscUJBQUttRSxlQUFMLENBQXFCeEQsQ0FBckIsRUFBd0JYLE9BQXhCO0FBQ0EscUJBQUt1RSxRQUFMLENBQWN2RSxPQUFkLEVBQXVCLElBQXZCLEVBQTZCc0UsTUFBN0I7QUFDQSxvQkFBSSxDQUFDQSxNQUFMLEVBQ0E7QUFDSSx3QkFBSXRFLFFBQVEyQyxVQUFSLENBQW1CQyxRQUFuQixDQUE0QjNDLE9BQTVCLENBQW9DdUUsT0FBcEMsS0FBZ0QsUUFBcEQsRUFDQTtBQUNJLDRCQUFJLENBQUN4RSxRQUFRMkMsVUFBUixDQUFtQjhCLE9BQXhCLEVBQ0E7QUFDSXpFLG9DQUFRMkMsVUFBUixDQUFtQjhCLE9BQW5CLEdBQTZCekUsUUFBUW1CLEtBQVIsQ0FBY3NELE9BQWQsSUFBeUIsT0FBdEQ7QUFDQXpFLG9DQUFRbUIsS0FBUixDQUFjc0QsT0FBZCxHQUF3QixNQUF4QjtBQUNBekUsb0NBQVEyQyxVQUFSLENBQW1CQyxRQUFuQixDQUE0QjhCLElBQTVCLENBQWlDLGdCQUFqQyxFQUFtRDFFLE9BQW5ELEVBQTREQSxRQUFRMkMsVUFBUixDQUFtQkMsUUFBL0U7QUFDSDtBQUNKLHFCQVJELE1BVUE7QUFDSSw2QkFBSytCLGNBQUwsQ0FBb0IzRSxRQUFRMkMsVUFBUixDQUFtQkMsUUFBdkMsRUFBaUQ1QyxPQUFqRDtBQUNIO0FBQ0o7QUFDSjtBQUNKOztBQUVEOzs7Ozs7OztrQ0FLVVcsQyxFQUNWO0FBQ0ksZ0JBQU1xQyxPQUFPckMsRUFBRWdELFlBQUYsQ0FBZUMsS0FBZixDQUFxQixDQUFyQixDQUFiO0FBQ0EsZ0JBQUlaLElBQUosRUFDQTtBQUNJLG9CQUFNakIsS0FBS3BCLEVBQUVnRCxZQUFGLENBQWVDLEtBQWYsQ0FBcUIsQ0FBckIsQ0FBWDtBQUNBLG9CQUFNNUQsVUFBVXFELFNBQVNRLGNBQVQsQ0FBd0I5QixFQUF4QixDQUFoQjtBQUNBLG9CQUFNYyxXQUFXLEtBQUtpQixZQUFMLENBQWtCbkQsQ0FBbEIsRUFBcUJaLFNBQVNrRCxPQUFULENBQWlCRCxJQUFqQixFQUF1QlMsSUFBNUMsRUFBa0R6RCxPQUFsRCxDQUFqQjtBQUNBLG9CQUFJQSxPQUFKLEVBQ0E7QUFDSSx3QkFBSTZDLFFBQUosRUFDQTtBQUNJbEMsMEJBQUUwRCxjQUFGO0FBQ0g7QUFDRCx5QkFBS08sZUFBTCxDQUFxQjVFLE9BQXJCO0FBQ0Esd0JBQUlBLFFBQVEyQyxVQUFSLENBQW1COEIsT0FBdkIsRUFDQTtBQUNJekUsZ0NBQVE2RSxNQUFSO0FBQ0E3RSxnQ0FBUW1CLEtBQVIsQ0FBY3NELE9BQWQsR0FBd0J6RSxRQUFRMkMsVUFBUixDQUFtQjhCLE9BQTNDO0FBQ0F6RSxnQ0FBUTJDLFVBQVIsQ0FBbUI4QixPQUFuQixHQUE2QixJQUE3QjtBQUNBekUsZ0NBQVEyQyxVQUFSLENBQW1CQyxRQUFuQixDQUE0QjhCLElBQTVCLENBQWlDLFFBQWpDLEVBQTJDMUUsT0FBM0MsRUFBb0RBLFFBQVEyQyxVQUFSLENBQW1CQyxRQUF2RTtBQUNBNUMsZ0NBQVEyQyxVQUFSLENBQW1CQyxRQUFuQixHQUE4QixJQUE5QjtBQUNIO0FBQ0o7QUFDSjtBQUNKOztBQUVEOzs7Ozs7OzttQ0FLV2pDLEMsRUFDWDtBQUNJLGdCQUFNa0MsV0FBV2xDLEVBQUVXLE1BQUYsQ0FBU3FCLFVBQVQsQ0FBb0JDLFFBQXJDO0FBQ0EsZ0JBQU1rQyxXQUFXbkUsRUFBRVcsTUFBRixDQUFTeUQsU0FBVCxDQUFtQixJQUFuQixDQUFqQjtBQUNBLGlCQUFLLElBQUk1RCxLQUFULElBQWtCMEIsU0FBUzVDLE9BQVQsQ0FBaUIrRSxTQUFuQyxFQUNBO0FBQ0lGLHlCQUFTM0QsS0FBVCxDQUFlQSxLQUFmLElBQXdCMEIsU0FBUzVDLE9BQVQsQ0FBaUIrRSxTQUFqQixDQUEyQjdELEtBQTNCLENBQXhCO0FBQ0g7QUFDRCxnQkFBTThELE1BQU1uRixNQUFNb0YsUUFBTixDQUFldkUsRUFBRVcsTUFBakIsQ0FBWjtBQUNBd0QscUJBQVMzRCxLQUFULENBQWVnRSxJQUFmLEdBQXNCRixJQUFJRyxDQUFKLEdBQVEsSUFBOUI7QUFDQU4scUJBQVMzRCxLQUFULENBQWVrRSxHQUFmLEdBQXFCSixJQUFJSyxDQUFKLEdBQVEsSUFBN0I7QUFDQSxnQkFBTUMsU0FBUyxFQUFFSCxHQUFHSCxJQUFJRyxDQUFKLEdBQVF6RSxFQUFFcUQsS0FBZixFQUFzQnNCLEdBQUdMLElBQUlLLENBQUosR0FBUTNFLEVBQUVzRCxLQUFuQyxFQUFmO0FBQ0FaLHFCQUFTQyxJQUFULENBQWN6QixXQUFkLENBQTBCaUQsUUFBMUI7QUFDQSxnQkFBSWpDLFNBQVM1QyxPQUFULENBQWlCdUYsUUFBckIsRUFDQTtBQUNJLG9CQUFNQyxRQUFRLElBQUlDLEtBQUosRUFBZDtBQUNBRCxzQkFBTUUsR0FBTixHQUFZOUMsU0FBUzVDLE9BQVQsQ0FBaUIyRixLQUFqQixDQUF1QkMsT0FBbkM7QUFDQUosc0JBQU10RSxLQUFOLENBQVkyRSxRQUFaLEdBQXVCLFVBQXZCO0FBQ0FMLHNCQUFNdEUsS0FBTixDQUFZNEUsU0FBWixHQUF3Qix1QkFBeEI7QUFDQU4sc0JBQU10RSxLQUFOLENBQVlnRSxJQUFaLEdBQW1CTCxTQUFTa0IsVUFBVCxHQUFzQmxCLFNBQVNtQixXQUEvQixHQUE2QyxJQUFoRTtBQUNBUixzQkFBTXRFLEtBQU4sQ0FBWWtFLEdBQVosR0FBa0JQLFNBQVNvQixTQUFULEdBQXFCcEIsU0FBU3FCLFlBQTlCLEdBQTZDLElBQS9EO0FBQ0E5Qyx5QkFBU0MsSUFBVCxDQUFjekIsV0FBZCxDQUEwQjRELEtBQTFCO0FBQ0FYLHlCQUFTc0IsSUFBVCxHQUFnQlgsS0FBaEI7QUFDSDtBQUNELGdCQUFJNUMsU0FBUzVDLE9BQVQsQ0FBaUJpQixXQUFyQixFQUNBO0FBQ0lwQixzQkFBTXFCLEtBQU4sQ0FBWVIsRUFBRVcsTUFBZCxFQUFzQixRQUF0QixFQUFnQ3VCLFNBQVM1QyxPQUFULENBQWlCaUIsV0FBakQ7QUFDSDtBQUNELGdCQUFJSSxTQUFTWCxFQUFFVyxNQUFmO0FBQ0EsZ0JBQUl1QixTQUFTNUMsT0FBVCxDQUFpQmtELElBQXJCLEVBQ0E7QUFDSTdCLHlCQUFTWCxFQUFFVyxNQUFGLENBQVN5RCxTQUFULENBQW1CLElBQW5CLENBQVQ7QUFDQXpELHVCQUFPUyxFQUFQLEdBQVlwQixFQUFFVyxNQUFGLENBQVNTLEVBQVQsR0FBYyxRQUFkLEdBQXlCcEIsRUFBRVcsTUFBRixDQUFTcUIsVUFBVCxDQUFvQlEsSUFBekQ7QUFDQXhDLGtCQUFFVyxNQUFGLENBQVNxQixVQUFULENBQW9CUSxJQUFwQjtBQUNBTix5QkFBU3JDLGFBQVQsQ0FBdUJjLE1BQXZCO0FBQ0FBLHVCQUFPcUIsVUFBUCxDQUFrQjBELE1BQWxCLEdBQTJCLElBQTNCO0FBQ0EvRSx1QkFBT3FCLFVBQVAsQ0FBa0JDLFFBQWxCLEdBQTZCLElBQTdCO0FBQ0F0Qix1QkFBT3FCLFVBQVAsQ0FBa0I4QixPQUFsQixHQUE0Qm5ELE9BQU9ILEtBQVAsQ0FBYXNELE9BQWIsSUFBd0IsT0FBcEQ7QUFDQW5ELHVCQUFPSCxLQUFQLENBQWFzRCxPQUFiLEdBQXVCLE1BQXZCO0FBQ0FwQix5QkFBU0MsSUFBVCxDQUFjekIsV0FBZCxDQUEwQlAsTUFBMUI7QUFDSDtBQUNEWCxjQUFFZ0QsWUFBRixDQUFlMkMsU0FBZjtBQUNBM0YsY0FBRWdELFlBQUYsQ0FBZTRDLE9BQWYsQ0FBdUIxRCxTQUFTNUMsT0FBVCxDQUFpQitDLElBQXhDLEVBQThDSCxTQUFTNUMsT0FBVCxDQUFpQitDLElBQS9EO0FBQ0FyQyxjQUFFZ0QsWUFBRixDQUFlNEMsT0FBZixDQUF1QmpGLE9BQU9TLEVBQTlCLEVBQWtDVCxPQUFPUyxFQUF6QztBQUNBcEIsY0FBRWdELFlBQUYsQ0FBZTZDLFlBQWYsQ0FBNEJuRCxTQUFTb0QsYUFBVCxDQUF1QixLQUF2QixDQUE1QixFQUEyRCxDQUEzRCxFQUE4RCxDQUE5RDtBQUNBbkYsbUJBQU9xQixVQUFQLENBQWtCK0QsT0FBbEIsR0FBNEIsSUFBNUI7QUFDQXBGLG1CQUFPcUIsVUFBUCxDQUFrQmxCLEtBQWxCLEdBQTBCb0IsU0FBUzVDLE9BQVQsQ0FBaUJrRCxJQUFqQixHQUF3QixDQUFDLENBQXpCLEdBQTZCTixTQUFTOEQsU0FBVCxDQUFtQnJGLE1BQW5CLENBQXZEO0FBQ0FBLG1CQUFPcUIsVUFBUCxDQUFrQm1DLFFBQWxCLEdBQTZCQSxRQUE3QjtBQUNBeEQsbUJBQU9xQixVQUFQLENBQWtCNEMsTUFBbEIsR0FBMkJBLE1BQTNCO0FBQ0g7OztrQ0FFUzVFLEMsRUFDVjtBQUNJLGdCQUFNa0MsV0FBV2xDLEVBQUVnRCxZQUFGLENBQWVDLEtBQWYsQ0FBcUIsQ0FBckIsQ0FBakI7QUFDQSxnQkFBSWYsWUFBWUEsYUFBYSxLQUFLNUMsT0FBTCxDQUFhK0MsSUFBMUMsRUFDQTtBQUNJLG9CQUFNakIsS0FBS3BCLEVBQUVnRCxZQUFGLENBQWVDLEtBQWYsQ0FBcUIsQ0FBckIsQ0FBWDtBQUNBLG9CQUFNNUQsVUFBVXFELFNBQVNRLGNBQVQsQ0FBd0I5QixFQUF4QixDQUFoQjtBQUNBLG9CQUFJL0IsUUFBUTJDLFVBQVIsQ0FBbUIwRCxNQUFuQixJQUE2QnJHLFFBQVEyQyxVQUFSLENBQW1CQyxRQUFuQixLQUFnQyxJQUFqRSxFQUNBO0FBQ0kseUJBQUt3QixPQUFMLENBQWF6RCxDQUFiLEVBQWdCLElBQWhCO0FBQ0gsaUJBSEQsTUFJSyxJQUFJLEtBQUtWLE9BQUwsQ0FBYVksSUFBYixJQUFxQmIsUUFBUTJDLFVBQVIsQ0FBbUJDLFFBQW5CLEtBQWdDLElBQXpELEVBQ0w7QUFDSSx5QkFBS21CLFlBQUwsQ0FBa0IsSUFBbEIsRUFBd0JwRCxFQUFFcUQsS0FBMUIsRUFBaUNyRCxFQUFFc0QsS0FBbkMsRUFBMENqRSxPQUExQztBQUNBVyxzQkFBRWdELFlBQUYsQ0FBZU8sVUFBZixHQUE0QmxFLFFBQVEyQyxVQUFSLENBQW1CMEQsTUFBbkIsR0FBNEIsTUFBNUIsR0FBcUMsTUFBakU7QUFDQSx5QkFBS2xDLGVBQUwsQ0FBcUJ4RCxDQUFyQixFQUF3QlgsT0FBeEI7QUFDSCxpQkFMSSxNQU9MO0FBQ0kseUJBQUtvRSxPQUFMLENBQWF6RCxDQUFiO0FBQ0g7QUFDREEsa0JBQUUwRCxjQUFGO0FBQ0ExRCxrQkFBRWlHLGVBQUY7QUFDSDtBQUNKOzs7d0NBRWVqRyxDLEVBQUdYLE8sRUFDbkI7QUFDSSxnQkFBTThFLFdBQVc5RSxRQUFRMkMsVUFBUixDQUFtQm1DLFFBQXBDO0FBQ0EsZ0JBQU1TLFNBQVN2RixRQUFRMkMsVUFBUixDQUFtQjRDLE1BQWxDO0FBQ0EsZ0JBQUlULFFBQUosRUFDQTtBQUNJQSx5QkFBUzNELEtBQVQsQ0FBZWdFLElBQWYsR0FBc0J4RSxFQUFFcUQsS0FBRixHQUFVdUIsT0FBT0gsQ0FBakIsR0FBcUIsSUFBM0M7QUFDQU4seUJBQVMzRCxLQUFULENBQWVrRSxHQUFmLEdBQXFCMUUsRUFBRXNELEtBQUYsR0FBVXNCLE9BQU9ELENBQWpCLEdBQXFCLElBQTFDO0FBQ0Esb0JBQUlSLFNBQVNzQixJQUFiLEVBQ0E7QUFDSXRCLDZCQUFTc0IsSUFBVCxDQUFjakYsS0FBZCxDQUFvQmdFLElBQXBCLEdBQTJCTCxTQUFTa0IsVUFBVCxHQUFzQmxCLFNBQVNtQixXQUEvQixHQUE2QyxJQUF4RTtBQUNBbkIsNkJBQVNzQixJQUFULENBQWNqRixLQUFkLENBQW9Ca0UsR0FBcEIsR0FBMEJQLFNBQVNvQixTQUFULEdBQXFCcEIsU0FBU3FCLFlBQTlCLEdBQTZDLElBQXZFO0FBQ0g7QUFDSjtBQUNKOzs7d0NBRWVuRyxPLEVBQ2hCO0FBQ0ksZ0JBQU04RSxXQUFXOUUsUUFBUTJDLFVBQVIsQ0FBbUJtQyxRQUFwQztBQUNBQSxxQkFBU0QsTUFBVDtBQUNBLGdCQUFJQyxTQUFTc0IsSUFBYixFQUNBO0FBQ0l0Qix5QkFBU3NCLElBQVQsQ0FBY3ZCLE1BQWQ7QUFDSDtBQUNEN0Usb0JBQVEyQyxVQUFSLENBQW1CbUMsUUFBbkIsR0FBOEIsSUFBOUI7QUFDQTlFLG9CQUFRMkMsVUFBUixDQUFtQjBELE1BQW5CLEdBQTRCLEtBQTVCO0FBQ0g7Ozs4QkFFSzFGLEMsRUFDTjtBQUNJLGdCQUFNcUMsT0FBT3JDLEVBQUVnRCxZQUFGLENBQWVDLEtBQWYsQ0FBcUIsQ0FBckIsQ0FBYjtBQUNBLGdCQUFJWixRQUFRQSxTQUFTLEtBQUsvQyxPQUFMLENBQWErQyxJQUFsQyxFQUNBO0FBQ0ksb0JBQU1qQixLQUFLcEIsRUFBRWdELFlBQUYsQ0FBZUMsS0FBZixDQUFxQixDQUFyQixDQUFYO0FBQ0Esb0JBQU01RCxVQUFVcUQsU0FBU1EsY0FBVCxDQUF3QjlCLEVBQXhCLENBQWhCO0FBQ0Esb0JBQUkvQixRQUFRMkMsVUFBUixDQUFtQkMsUUFBbkIsS0FBZ0MsSUFBcEMsRUFDQTtBQUNJNUMsNEJBQVEyQyxVQUFSLENBQW1CQyxRQUFuQixDQUE0QjhCLElBQTVCLENBQWlDLFFBQWpDLEVBQTJDMUUsT0FBM0MsRUFBb0RBLFFBQVEyQyxVQUFSLENBQW1CQyxRQUF2RTtBQUNBLHlCQUFLOEIsSUFBTCxDQUFVLEtBQVYsRUFBaUIxRSxPQUFqQixFQUEwQixJQUExQjtBQUNBQSw0QkFBUTJDLFVBQVIsQ0FBbUJDLFFBQW5CLEdBQThCLElBQTlCO0FBQ0Esd0JBQUksS0FBSzNDLE9BQUwsQ0FBYXlCLElBQWpCLEVBQ0E7QUFDSSw2QkFBS2dELElBQUwsQ0FBVSxPQUFWLEVBQW1CMUUsT0FBbkIsRUFBNEIsSUFBNUI7QUFDSDtBQUNELHlCQUFLMEUsSUFBTCxDQUFVLFFBQVYsRUFBb0IxRSxPQUFwQixFQUE2QixJQUE3QjtBQUNILGlCQVZELE1BWUE7QUFDSSx3QkFBSUEsUUFBUTJDLFVBQVIsQ0FBbUJsQixLQUFuQixLQUE2QixLQUFLa0YsU0FBTCxDQUFlaEcsRUFBRVcsTUFBakIsQ0FBakMsRUFDQTtBQUNJLDZCQUFLb0QsSUFBTCxDQUFVLE9BQVYsRUFBbUIxRSxPQUFuQixFQUE0QixJQUE1QjtBQUNBLDZCQUFLMEUsSUFBTCxDQUFVLFFBQVYsRUFBb0IxRSxPQUFwQixFQUE2QixJQUE3QjtBQUNIO0FBQ0o7QUFDRCxxQkFBSzRFLGVBQUwsQ0FBcUI1RSxPQUFyQjtBQUNBVyxrQkFBRTBELGNBQUY7QUFDQTFELGtCQUFFaUcsZUFBRjtBQUNIO0FBQ0o7O0FBRUQ7Ozs7Ozs7Ozs7cUNBT2FqRyxDLEVBQUc4QyxJLEVBQU16RCxPLEVBQ3RCO0FBQ0ksZ0JBQUk2RyxNQUFNQyxRQUFWO0FBQUEsZ0JBQW9CekUsY0FBcEI7QUFESjtBQUFBO0FBQUE7O0FBQUE7QUFFSSxzQ0FBb0JvQixJQUFwQixtSUFDQTtBQUFBLHdCQURTc0QsT0FDVDs7QUFDSSx3QkFBSyxDQUFDQSxRQUFROUcsT0FBUixDQUFnQlksSUFBakIsSUFBeUJiLFFBQVEyQyxVQUFSLENBQW1CQyxRQUFuQixLQUFnQ21FLE9BQTFELElBQ0MvRyxRQUFRMkMsVUFBUixDQUFtQjBELE1BQW5CLElBQTZCckcsUUFBUTJDLFVBQVIsQ0FBbUJDLFFBQW5CLEtBQWdDbUUsT0FEbEUsRUFFQTtBQUNJO0FBQ0g7QUFDRCx3QkFBSWpILE1BQU1rSCxNQUFOLENBQWFyRyxFQUFFcUQsS0FBZixFQUFzQnJELEVBQUVzRCxLQUF4QixFQUErQjhDLFFBQVEvRyxPQUF2QyxDQUFKLEVBQ0E7QUFDSSwrQkFBTytHLE9BQVA7QUFDSCxxQkFIRCxNQUlLLElBQUlBLFFBQVE5RyxPQUFSLENBQWdCdUUsT0FBaEIsS0FBNEIsU0FBaEMsRUFDTDtBQUNJLDRCQUFNeUMsWUFBWW5ILE1BQU1vSCx1QkFBTixDQUE4QnZHLEVBQUVxRCxLQUFoQyxFQUF1Q3JELEVBQUVzRCxLQUF6QyxFQUFnRDhDLFFBQVEvRyxPQUF4RCxDQUFsQjtBQUNBLDRCQUFJaUgsWUFBWUosR0FBaEIsRUFDQTtBQUNJQSxrQ0FBTUksU0FBTjtBQUNBNUUsb0NBQVEwRSxPQUFSO0FBQ0g7QUFDSjtBQUNKO0FBdEJMO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBdUJJLG1CQUFPMUUsS0FBUDtBQUNIOztBQUVEOzs7Ozs7Ozs7OztxQ0FRYVEsUSxFQUFVdUMsQyxFQUFHRSxDLEVBQUd0RixPLEVBQzdCO0FBQ0ksZ0JBQUlBLFFBQVEyQyxVQUFSLENBQW1COEIsT0FBdkIsRUFDQTtBQUNJekUsd0JBQVFtQixLQUFSLENBQWNzRCxPQUFkLEdBQXdCekUsUUFBUTJDLFVBQVIsQ0FBbUI4QixPQUFuQixLQUErQixPQUEvQixHQUF5QyxFQUF6QyxHQUE4Q3pFLFFBQVEyQyxVQUFSLENBQW1COEIsT0FBekY7QUFDQXpFLHdCQUFRMkMsVUFBUixDQUFtQjhCLE9BQW5CLEdBQTZCLElBQTdCO0FBQ0g7O0FBRUQsZ0JBQUksS0FBS3hFLE9BQUwsQ0FBYXlCLElBQWpCLEVBQ0E7QUFDSSxxQkFBS3lGLG9CQUFMLENBQTBCdEUsUUFBMUIsRUFBb0N1QyxDQUFwQyxFQUF1Q0UsQ0FBdkMsRUFBMEN0RixPQUExQztBQUNILGFBSEQsTUFLQTtBQUNJLHFCQUFLb0gsbUJBQUwsQ0FBeUJ2RSxRQUF6QixFQUFtQzdDLE9BQW5DO0FBQ0g7QUFDRCxpQkFBS3VFLFFBQUwsQ0FBY3ZFLE9BQWQsRUFBdUI2QyxRQUF2QjtBQUNIOztBQUVEOzs7Ozs7dUNBR2VBLFEsRUFBVTdDLE8sRUFDekI7QUFDSSxnQkFBTTJCLFdBQVdrQixTQUFTekMsWUFBVCxFQUFqQjtBQUNBLGdCQUFJdUIsU0FBU0MsTUFBYixFQUNBO0FBQ0ksb0JBQU1ILFFBQVF6QixRQUFRMkMsVUFBUixDQUFtQmxCLEtBQWpDO0FBQ0Esb0JBQUlBLFFBQVFFLFNBQVNDLE1BQXJCLEVBQ0E7QUFDSUQsNkJBQVNGLEtBQVQsRUFBZ0JpQixVQUFoQixDQUEyQlosWUFBM0IsQ0FBd0M5QixPQUF4QyxFQUFpRDJCLFNBQVNGLEtBQVQsQ0FBakQ7QUFDSCxpQkFIRCxNQUtBO0FBQ0lFLDZCQUFTLENBQVQsRUFBWUUsV0FBWixDQUF3QjdCLE9BQXhCO0FBQ0g7QUFDSixhQVhELE1BYUE7QUFDSTZDLHlCQUFTN0MsT0FBVCxDQUFpQjZCLFdBQWpCLENBQTZCN0IsT0FBN0I7QUFDSDtBQUNKOzs7a0NBRVNLLEssRUFDVjtBQUNJLGdCQUFNc0IsV0FBVyxLQUFLdkIsWUFBTCxFQUFqQjtBQUNBLGlCQUFLLElBQUltQyxJQUFJLENBQWIsRUFBZ0JBLElBQUlaLFNBQVNDLE1BQTdCLEVBQXFDVyxHQUFyQyxFQUNBO0FBQ0ksb0JBQUlaLFNBQVNZLENBQVQsTUFBZ0JsQyxLQUFwQixFQUNBO0FBQ0ksMkJBQU9rQyxDQUFQO0FBQ0g7QUFDSjtBQUNKOzs7MENBRWlCOEUsSSxFQUFNQyxNLEVBQVFDLE8sRUFDaEM7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFDSSxzQ0FBa0JGLEtBQUsxRixRQUF2QixtSUFDQTtBQUFBLHdCQURTdEIsS0FDVDs7QUFDSSx3QkFBSWlILE9BQU8xRixNQUFYLEVBQ0E7QUFDSSw0QkFBSTBGLE9BQU9FLE9BQVAsQ0FBZW5ILE1BQU1vSCxTQUFyQixNQUFvQyxDQUFDLENBQXpDLEVBQ0E7QUFDSUYsb0NBQVE3RCxJQUFSLENBQWFyRCxLQUFiO0FBQ0g7QUFDSixxQkFORCxNQVFBO0FBQ0lrSCxnQ0FBUTdELElBQVIsQ0FBYXJELEtBQWI7QUFDSDtBQUNELHlCQUFLcUgsaUJBQUwsQ0FBdUJySCxLQUF2QixFQUE4QmlILE1BQTlCLEVBQXNDQyxPQUF0QztBQUNIO0FBZkw7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQWdCQzs7QUFFRDs7Ozs7Ozs7O3FDQU1hSSxLLEVBQ2I7QUFDSSxnQkFBSSxLQUFLMUgsT0FBTCxDQUFhMkgsVUFBakIsRUFDQTtBQUNJLG9CQUFJTixTQUFTLEVBQWI7QUFDQSxvQkFBSUssU0FBUyxLQUFLMUgsT0FBTCxDQUFhNEgsVUFBMUIsRUFDQTtBQUNJLHdCQUFJLEtBQUs1SCxPQUFMLENBQWFLLFNBQWpCLEVBQ0E7QUFDSWdILCtCQUFPNUQsSUFBUCxDQUFZLEtBQUt6RCxPQUFMLENBQWFLLFNBQXpCO0FBQ0g7QUFDRCx3QkFBSXFILFNBQVMsS0FBSzFILE9BQUwsQ0FBYTRILFVBQTFCLEVBQ0E7QUFDSVAsK0JBQU81RCxJQUFQLENBQVksS0FBS3pELE9BQUwsQ0FBYTRILFVBQXpCO0FBQ0g7QUFDSixpQkFWRCxNQVdLLElBQUksQ0FBQ0YsS0FBRCxJQUFVLEtBQUsxSCxPQUFMLENBQWFLLFNBQTNCLEVBQ0w7QUFDSWdILDJCQUFPNUQsSUFBUCxDQUFZLEtBQUt6RCxPQUFMLENBQWFLLFNBQXpCO0FBQ0g7QUFDRCxvQkFBTWlILFVBQVUsRUFBaEI7QUFDQSxxQkFBS0csaUJBQUwsQ0FBdUIsS0FBSzFILE9BQTVCLEVBQXFDc0gsTUFBckMsRUFBNkNDLE9BQTdDO0FBQ0EsdUJBQU9BLE9BQVA7QUFDSCxhQXJCRCxNQXVCQTtBQUNJLG9CQUFJLEtBQUt0SCxPQUFMLENBQWFLLFNBQWpCLEVBQ0E7QUFDSSx3QkFBSW1ELE9BQU8sRUFBWDtBQURKO0FBQUE7QUFBQTs7QUFBQTtBQUVJLDhDQUFrQixLQUFLekQsT0FBTCxDQUFhMkIsUUFBL0IsbUlBQ0E7QUFBQSxnQ0FEU3RCLEtBQ1Q7O0FBQ0ksZ0NBQUlQLE1BQU1TLGlCQUFOLENBQXdCRixLQUF4QixFQUErQixLQUFLSixPQUFMLENBQWFLLFNBQTVDLEtBQTJEcUgsU0FBUyxDQUFDLEtBQUsxSCxPQUFMLENBQWE0SCxVQUF2QixJQUFzQ0YsU0FBUyxLQUFLMUgsT0FBTCxDQUFhNEgsVUFBdEIsSUFBb0MvSCxNQUFNUyxpQkFBTixDQUF3QkYsS0FBeEIsRUFBK0IsS0FBS0osT0FBTCxDQUFhNEgsVUFBNUMsQ0FBekksRUFDQTtBQUNJcEUscUNBQUtDLElBQUwsQ0FBVXJELEtBQVY7QUFDSDtBQUNKO0FBUkw7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFTSSwyQkFBT29ELElBQVA7QUFDSCxpQkFYRCxNQWFBO0FBQ0ksMkJBQU8sS0FBS3pELE9BQUwsQ0FBYTJCLFFBQXBCO0FBQ0g7QUFDSjtBQUNKOztBQUVEOzs7Ozs7Ozs7NENBTW9Ca0IsUSxFQUFVaUMsUSxFQUM5QjtBQUNJLGdCQUFJQSxTQUFTbkMsVUFBVCxDQUFvQitELE9BQXBCLEtBQWdDN0QsUUFBcEMsRUFDQTtBQUNJLG9CQUFNZCxLQUFLYyxTQUFTNUMsT0FBVCxDQUFpQitCLE9BQTVCO0FBQ0Esb0JBQUlDLFlBQVk2QyxTQUFTNUMsWUFBVCxDQUFzQkgsRUFBdEIsQ0FBaEI7QUFDQUUsNEJBQVlZLFNBQVM1QyxPQUFULENBQWlCa0MsZUFBakIsR0FBbUNDLFdBQVdILFNBQVgsQ0FBbkMsR0FBMkRBLFNBQXZFO0FBQ0Esb0JBQUlJLGNBQUo7QUFDQSxvQkFBTVYsV0FBV2tCLFNBQVN6QyxZQUFULENBQXNCLElBQXRCLENBQWpCO0FBQ0Esb0JBQUl5QyxTQUFTNUMsT0FBVCxDQUFpQnFDLFlBQXJCLEVBQ0E7QUFDSSx5QkFBSyxJQUFJQyxJQUFJWixTQUFTQyxNQUFULEdBQWtCLENBQS9CLEVBQWtDVyxLQUFLLENBQXZDLEVBQTBDQSxHQUExQyxFQUNBO0FBQ0ksNEJBQU1sQyxRQUFRc0IsU0FBU1ksQ0FBVCxDQUFkO0FBQ0EsNEJBQUlDLGlCQUFpQm5DLE1BQU02QixZQUFOLENBQW1CSCxFQUFuQixDQUFyQjtBQUNBUyx5Q0FBaUJLLFNBQVM1QyxPQUFULENBQWlCd0MsYUFBakIsR0FBaUNMLFdBQVdJLGNBQVgsQ0FBakMsR0FBOERBLGNBQS9FO0FBQ0EsNEJBQUlQLFlBQVlPLGNBQWhCLEVBQ0E7QUFDSW5DLGtDQUFNcUMsVUFBTixDQUFpQlosWUFBakIsQ0FBOEJnRCxRQUE5QixFQUF3Q3pFLEtBQXhDO0FBQ0FnQyxvQ0FBUSxJQUFSO0FBQ0E7QUFDSDtBQUNKO0FBQ0osaUJBZEQsTUFnQkE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFDSSw4Q0FBa0JWLFFBQWxCLG1JQUNBO0FBQUEsZ0NBRFN0QixPQUNUOztBQUNJLGdDQUFJbUMsbUJBQWlCbkMsUUFBTTZCLFlBQU4sQ0FBbUJILEVBQW5CLENBQXJCO0FBQ0FTLCtDQUFpQkssU0FBUzVDLE9BQVQsQ0FBaUJ3QyxhQUFqQixHQUFpQ0wsV0FBV0ksZ0JBQVgsQ0FBakMsR0FBOERBLGdCQUEvRTtBQUNBLGdDQUFJUCxZQUFZTyxnQkFBaEIsRUFDQTtBQUNJbkMsd0NBQU1xQyxVQUFOLENBQWlCWixZQUFqQixDQUE4QmdELFFBQTlCLEVBQXdDekUsT0FBeEM7QUFDQWdDLHdDQUFRLElBQVI7QUFDQTtBQUNIO0FBQ0o7QUFYTDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBWUM7QUFDRCxvQkFBSSxDQUFDQSxLQUFMLEVBQ0E7QUFDSVEsNkJBQVM3QyxPQUFULENBQWlCNkIsV0FBakIsQ0FBNkJpRCxRQUE3QjtBQUNIO0FBQ0RBLHlCQUFTbkMsVUFBVCxDQUFvQitELE9BQXBCLENBQTRCaEMsSUFBNUIsQ0FBaUMsZ0JBQWpDLEVBQW1ESSxRQUFuRCxFQUE2REEsU0FBU25DLFVBQVQsQ0FBb0IrRCxPQUFqRjtBQUNBN0QseUJBQVM2QixJQUFULENBQWMsYUFBZCxFQUE2QkksUUFBN0IsRUFBdUNqQyxRQUF2QztBQUNBaUMseUJBQVNuQyxVQUFULENBQW9CK0QsT0FBcEIsR0FBOEI3RCxRQUE5QjtBQUNBQSx5QkFBUzZCLElBQVQsQ0FBYyxnQkFBZCxFQUFnQ0ksUUFBaEMsRUFBMENqQyxRQUExQztBQUNIO0FBQ0o7O0FBRUQ7Ozs7Ozs7Ozs7NkNBT3FCQSxRLEVBQVV1QyxDLEVBQUdFLEMsRUFBR1IsUSxFQUNyQztBQUNJLGdCQUFNOUUsVUFBVTZDLFNBQVM3QyxPQUF6QjtBQUNBLGdCQUFNMkIsV0FBV2tCLFNBQVN6QyxZQUFULEVBQWpCO0FBQ0EsZ0JBQUksQ0FBQ3VCLFNBQVNDLE1BQWQsRUFDQTtBQUNJLG9CQUFJa0QsU0FBU25DLFVBQVQsQ0FBb0IrRCxPQUFwQixLQUFnQzdELFFBQXBDLEVBQ0E7QUFDSWlDLDZCQUFTbkMsVUFBVCxDQUFvQitELE9BQXBCLENBQTRCaEMsSUFBNUIsQ0FBaUMsZ0JBQWpDLEVBQW1ESSxRQUFuRCxFQUE2REEsU0FBU25DLFVBQVQsQ0FBb0IrRCxPQUFqRjtBQUNBNUIsNkJBQVNuQyxVQUFULENBQW9CK0QsT0FBcEIsR0FBOEI3RCxRQUE5QjtBQUNBQSw2QkFBUzZCLElBQVQsQ0FBYyxhQUFkLEVBQTZCSSxRQUE3QixFQUF1Q2pDLFFBQXZDO0FBQ0g7QUFDRDdDLHdCQUFRNkIsV0FBUixDQUFvQmlELFFBQXBCO0FBQ0gsYUFURCxNQVdBO0FBQ0ksb0JBQUlnRCxXQUFXaEIsUUFBZjtBQUFBLG9CQUF5QmlCLGdCQUF6QjtBQUFBLG9CQUFrQ0MsaUJBQWxDO0FBQUEsb0JBQTRDQyxrQkFBNUM7QUFDQSxvQkFBTTlILFlBQVcwQyxTQUFTekMsWUFBVCxDQUFzQixJQUF0QixDQUFqQjtBQUZKO0FBQUE7QUFBQTs7QUFBQTtBQUdJLDBDQUFrQkQsU0FBbEIsbUlBQ0E7QUFBQSw0QkFEU0UsS0FDVDs7QUFDSSw0QkFBSUEsVUFBVXlFLFFBQWQsRUFDQTtBQUNJbUQsd0NBQVksSUFBWjtBQUNIO0FBQ0QsNEJBQUluSSxNQUFNa0gsTUFBTixDQUFhNUIsQ0FBYixFQUFnQkUsQ0FBaEIsRUFBbUJqRixLQUFuQixDQUFKLEVBQ0E7QUFDSSxnQ0FBSUEsVUFBVXlFLFFBQWQsRUFDQTtBQUNJO0FBQ0g7QUFDRGlELHNDQUFVMUgsS0FBVjtBQUNBMkgsdUNBQVdDLFNBQVg7QUFDQTtBQUNILHlCQVRELE1BV0E7QUFDSSxnQ0FBTUMsVUFBVXBJLE1BQU1vSCx1QkFBTixDQUE4QjlCLENBQTlCLEVBQWlDRSxDQUFqQyxFQUFvQ2pGLEtBQXBDLENBQWhCO0FBQ0EsZ0NBQUk2SCxVQUFVSixRQUFkLEVBQ0E7QUFDSUMsMENBQVUxSCxLQUFWO0FBQ0F5SCwyQ0FBV0ksT0FBWDtBQUNBRiwyQ0FBV0MsU0FBWDtBQUNIO0FBQ0o7QUFDSjtBQTdCTDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQThCSSxvQkFBSUYsT0FBSixFQUNBO0FBQ0ksd0JBQUlBLFlBQVlqRCxRQUFoQixFQUNBO0FBQ0k7QUFDSDtBQUNELHdCQUFJa0QsUUFBSixFQUNBO0FBQ0loSSxnQ0FBUThCLFlBQVIsQ0FBcUJnRCxRQUFyQixFQUErQmlELFFBQVFJLFdBQXZDO0FBQ0gscUJBSEQsTUFLQTtBQUNJbkksZ0NBQVE4QixZQUFSLENBQXFCZ0QsUUFBckIsRUFBK0JpRCxPQUEvQjtBQUNIO0FBQ0RsRiw2QkFBUzZCLElBQVQsQ0FBYyxlQUFkLEVBQStCSSxRQUEvQixFQUF5Q2pDLFFBQXpDO0FBQ0g7QUFDSjtBQUNELGdCQUFJaUMsU0FBU25DLFVBQVQsQ0FBb0IrRCxPQUFwQixLQUFnQzdELFFBQXBDLEVBQ0E7QUFDSUEseUJBQVM2QixJQUFULENBQWMsYUFBZCxFQUE2QkksUUFBN0IsRUFBdUNqQyxRQUF2QztBQUNBaUMseUJBQVNuQyxVQUFULENBQW9CK0QsT0FBcEIsQ0FBNEJoQyxJQUE1QixDQUFpQyxnQkFBakMsRUFBbURJLFFBQW5ELEVBQTZEQSxTQUFTbkMsVUFBVCxDQUFvQitELE9BQWpGO0FBQ0E1Qix5QkFBU25DLFVBQVQsQ0FBb0IrRCxPQUFwQixHQUE4QjdELFFBQTlCO0FBQ0g7QUFDREEscUJBQVM2QixJQUFULENBQWMsZ0JBQWQsRUFBZ0NJLFFBQWhDLEVBQTBDakMsUUFBMUM7QUFDSDs7QUFFRDs7Ozs7Ozs7OztpQ0FPUzdDLE8sRUFBUzZDLFEsRUFBVXlCLE0sRUFDNUI7QUFDSSxnQkFBTVEsV0FBVzlFLFFBQVEyQyxVQUFSLENBQW1CbUMsUUFBcEM7QUFDQSxnQkFBSUEsWUFBWUEsU0FBU3NCLElBQXpCLEVBQ0E7QUFDSSxvQkFBSSxDQUFDdkQsUUFBTCxFQUNBO0FBQ0lBLCtCQUFXN0MsUUFBUTJDLFVBQVIsQ0FBbUJDLFFBQTlCO0FBQ0Esd0JBQUkwQixNQUFKLEVBQ0E7QUFDSVEsaUNBQVNzQixJQUFULENBQWNULEdBQWQsR0FBb0I5QyxTQUFTNUMsT0FBVCxDQUFpQjJGLEtBQWpCLENBQXVCdEIsTUFBM0M7QUFDSCxxQkFIRCxNQUtBO0FBQ0lRLGlDQUFTc0IsSUFBVCxDQUFjVCxHQUFkLEdBQW9COUMsU0FBUzVDLE9BQVQsQ0FBaUJ1RSxPQUFqQixLQUE2QixRQUE3QixHQUF3QzNCLFNBQVM1QyxPQUFULENBQWlCMkYsS0FBakIsQ0FBdUJ3QyxNQUEvRCxHQUF3RXZGLFNBQVM1QyxPQUFULENBQWlCMkYsS0FBakIsQ0FBdUJ0QixNQUFuSDtBQUNIO0FBQ0osaUJBWEQsTUFhQTtBQUNJLHdCQUFJdEUsUUFBUTJDLFVBQVIsQ0FBbUIwRCxNQUF2QixFQUNBO0FBQ0l2QixpQ0FBU3NCLElBQVQsQ0FBY1QsR0FBZCxHQUFvQjlDLFNBQVM1QyxPQUFULENBQWlCMkYsS0FBakIsQ0FBdUJ6QyxJQUEzQztBQUNILHFCQUhELE1BS0E7QUFDSTJCLGlDQUFTc0IsSUFBVCxDQUFjVCxHQUFkLEdBQW9CM0YsUUFBUTJDLFVBQVIsQ0FBbUJDLFFBQW5CLEtBQWdDQyxRQUFoQyxHQUEyQ0EsU0FBUzVDLE9BQVQsQ0FBaUIyRixLQUFqQixDQUF1QkMsT0FBbEUsR0FBNEVoRCxTQUFTNUMsT0FBVCxDQUFpQjJGLEtBQWpCLENBQXVCeUMsSUFBdkg7QUFDSDtBQUNKO0FBQ0o7QUFDSjs7Ozs7QUE1c0JEOzs7OzsrQkFLY2xJLFEsRUFBVUYsTyxFQUN4QjtBQUNJLGdCQUFNc0gsVUFBVSxFQUFoQjtBQURKO0FBQUE7QUFBQTs7QUFBQTtBQUVJLHVDQUFvQnBILFFBQXBCLHdJQUNBO0FBQUEsd0JBRFNILE9BQ1Q7O0FBQ0l1SCw0QkFBUTdELElBQVIsQ0FBYSxJQUFJM0QsUUFBSixDQUFhQyxPQUFiLEVBQXNCQyxPQUF0QixDQUFiO0FBQ0g7QUFMTDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQU1JLG1CQUFPc0gsT0FBUDtBQUNIOzs7NEJBakJEO0FBQ0k7QUFDSDs7Ozs7O0FBaXRCTDs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7OztrQkE1M0JxQnhILFEiLCJmaWxlIjoic29ydGFibGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRXZlbnRzIGZyb20gJ2V2ZW50ZW1pdHRlcjMnXHJcblxyXG5pbXBvcnQgZGVmYXVsdHMgZnJvbSAnLi9kZWZhdWx0cydcclxuaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnLi91dGlscydcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNvcnRhYmxlIGV4dGVuZHMgRXZlbnRzXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIHNvcnRhYmxlIGxpc3RcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5uYW1lPXNvcnRhYmxlXSBkcmFnZ2luZyBpcyBhbGxvd2VkIGJldHdlZW4gU29ydGFibGVzIHdpdGggdGhlIHNhbWUgbmFtZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmRyYWdDbGFzc10gaWYgc2V0IHRoZW4gZHJhZyBvbmx5IGl0ZW1zIHdpdGggdGhpcyBjbGFzc05hbWUgdW5kZXIgZWxlbWVudDsgb3RoZXJ3aXNlIGRyYWcgYWxsIGNoaWxkcmVuXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMub3JkZXJDbGFzc10gdXNlIHRoaXMgY2xhc3MgdG8gaW5jbHVkZSBlbGVtZW50cyBpbiBvcmRlcmluZyBidXQgbm90IGRyYWdnaW5nOyBvdGhlcndpc2UgYWxsIGNoaWxkcmVuIGVsZW1lbnRzIGFyZSBpbmNsdWRlZCBpbiB3aGVuIHNvcnRpbmcgYW5kIG9yZGVyaW5nXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmRlZXBTZWFyY2hdIGlmIGRyYWdDbGFzcyBhbmQgZGVlcFNlYXJjaCB0aGVuIHNlYXJjaCBhbGwgZGVzY2VuZGVudHMgb2YgZWxlbWVudCBmb3IgZHJhZ0NsYXNzXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnNvcnQ9dHJ1ZV0gYWxsb3cgc29ydGluZyB3aXRoaW4gbGlzdFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5kcm9wPXRydWVdIGFsbG93IGRyb3AgZnJvbSByZWxhdGVkIHNvcnRhYmxlcyAoZG9lc24ndCBpbXBhY3QgcmVvcmRlcmluZyB0aGlzIHNvcnRhYmxlJ3MgY2hpbGRyZW4gdW50aWwgdGhlIGNoaWxkcmVuIGFyZSBtb3ZlZCB0byBhIGRpZmZlcmVuIHNvcnRhYmxlKVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5jb3B5PWZhbHNlXSBjcmVhdGUgY29weSB3aGVuIGRyYWdnaW5nIGFuIGl0ZW0gKHRoaXMgZGlzYWJsZXMgc29ydD10cnVlIGZvciB0aGlzIHNvcnRhYmxlKVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLm9yZGVySWQ9ZGF0YS1vcmRlcl0gZm9yIG9yZGVyZWQgbGlzdHMsIHVzZSB0aGlzIGRhdGEgaWQgdG8gZmlndXJlIG91dCBzb3J0IG9yZGVyXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLm9yZGVySWRJc051bWJlcj10cnVlXSB1c2UgcGFyc2VJbnQgb24gb3B0aW9ucy5zb3J0SWQgdG8gcHJvcGVybHkgc29ydCBudW1iZXJzXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMucmV2ZXJzZU9yZGVyXSByZXZlcnNlIHNvcnQgdGhlIG9yZGVySWRcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5vZmZMaXN0PWNsb3Nlc3RdIGhvdyB0byBoYW5kbGUgd2hlbiBhbiBlbGVtZW50IGlzIGRyb3BwZWQgb3V0c2lkZSBhIHNvcnRhYmxlOiBjbG9zZXN0PWRyb3AgaW4gY2xvc2VzdCBzb3J0YWJsZTsgY2FuY2VsPXJldHVybiB0byBzdGFydGluZyBzb3J0YWJsZTsgZGVsZXRlPXJlbW92ZSBmcm9tIGFsbCBzb3J0YWJsZXNcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5jdXJzb3JIb3Zlcj1ncmFiIC13ZWJraXQtZ3JhYiBwb2ludGVyXSB1c2UgdGhpcyBjdXJzb3IgbGlzdCB0byBzZXQgY3Vyc29yIHdoZW4gaG92ZXJpbmcgb3ZlciBhIHNvcnRhYmxlIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5jdXJzb3JEb3duPWdyYWJiaW5nIC13ZWJraXQtZ3JhYmJpbmcgcG9pbnRlcl0gdXNlIHRoaXMgY3Vyc29yIGxpc3QgdG8gc2V0IGN1cnNvciB3aGVuIG1vdXNlZG93bi90b3VjaGRvd24gb3ZlciBhIHNvcnRhYmxlIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMudXNlSWNvbnM9dHJ1ZV0gc2hvdyBpY29ucyB3aGVuIGRyYWdnaW5nXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnMuaWNvbnNdIGRlZmF1bHQgc2V0IG9mIGljb25zXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuaWNvbnMucmVvcmRlcl1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5pY29ucy5tb3ZlXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmljb25zLmNvcHldXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuaWNvbnMuZGVsZXRlXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmN1c3RvbUljb25dIHNvdXJjZSBvZiBjdXN0b20gaW1hZ2Ugd2hlbiBvdmVyIHRoaXMgc29ydGFibGVcclxuICAgICAqIEBmaXJlcyBwaWNrdXBcclxuICAgICAqIEBmaXJlcyBvcmRlclxyXG4gICAgICogQGZpcmVzIGFkZFxyXG4gICAgICogQGZpcmVzIHJlbW92ZVxyXG4gICAgICogQGZpcmVzIHVwZGF0ZVxyXG4gICAgICogQGZpcmVzIGRlbGV0ZVxyXG4gICAgICogQGZpcmVzIG9yZGVyLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyBhZGQtcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIHJlbW92ZS1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgdXBkYXRlLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyBkZWxldGUtcGVuZGluZ1xyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyKClcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSB1dGlscy5vcHRpb25zKG9wdGlvbnMsIGRlZmF1bHRzKVxyXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnRcclxuICAgICAgICB0aGlzLl9hZGRUb0dsb2JhbFRyYWNrZXIoKVxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnRzID0gdGhpcy5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGVsZW1lbnRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzIHx8IHV0aWxzLmNvbnRhaW5zQ2xhc3NOYW1lKGNoaWxkLCB0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hdHRhY2hFbGVtZW50KGNoaWxkKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZXZlbnRzID0ge1xyXG4gICAgICAgICAgICBkcmFnT3ZlcjogKGUpID0+IHRoaXMuX2RyYWdPdmVyKGUpLFxyXG4gICAgICAgICAgICBkcm9wOiAoZSkgPT4gdGhpcy5fZHJvcChlKSxcclxuICAgICAgICAgICAgbW91c2VPdmVyOiAoZSkgPT4gdGhpcy5fbW91c2VFbnRlcihlKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgdGhpcy5ldmVudHMuZHJhZ092ZXIpXHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywgdGhpcy5ldmVudHMuZHJvcClcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmN1cnNvckhvdmVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5fZ2V0Q2hpbGRyZW4oKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdXRpbHMuc3R5bGUoY2hpbGQsICdjdXJzb3InLCB0aGlzLm9wdGlvbnMuY3Vyc29ySG92ZXIpXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmN1cnNvckRvd24pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKGUpID0+IHRoaXMuX21vdXNlRG93bihlKSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfbW91c2VEb3duKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHV0aWxzLnN0eWxlKGUudGFyZ2V0LCAnY3Vyc29yJywgdGhpcy5vcHRpb25zLmN1cnNvckRvd24pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVtb3ZlcyBhbGwgZXZlbnQgaGFuZGxlcnMgZnJvbSB0aGlzLmVsZW1lbnQgYW5kIGNoaWxkcmVuXHJcbiAgICAgKi9cclxuICAgIGRlc3Ryb3koKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIHRoaXMuZXZlbnRzLmRyYWdPdmVyKVxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdkcm9wJywgdGhpcy5ldmVudHMuZHJvcClcclxuICAgICAgICBjb25zdCBlbGVtZW50cyA9IHRoaXMuX2dldENoaWxkcmVuKClcclxuICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBlbGVtZW50cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRWxlbWVudChjaGlsZClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB0aGUgZ2xvYmFsIGRlZmF1bHRzIGZvciBuZXcgU29ydGFibGUgb2JqZWN0c1xyXG4gICAgICogQHR5cGUge0RlZmF1bHRPcHRpb25zfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0IGRlZmF1bHRzKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gZGVmYXVsdHNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNyZWF0ZSBtdWx0aXBsZSBzb3J0YWJsZSBlbGVtZW50c1xyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudHNbXX0gZWxlbWVudHNcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIC0gc2VlIGNvbnN0cnVjdG9yIGZvciBvcHRpb25zXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBjcmVhdGUoZWxlbWVudHMsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdXHJcbiAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiBlbGVtZW50cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaChuZXcgU29ydGFibGUoZWxlbWVudCwgb3B0aW9ucykpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHRzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhZGQgYW4gZWxlbWVudCBhcyBhIGNoaWxkIG9mIHRoZSBzb3J0YWJsZSBlbGVtZW50OyBjYW4gYWxzbyBiZSB1c2VkIHRvIHN3YXAgYmV0d2VlbiBzb3J0YWJsZXNcclxuICAgICAqIE5PVEU6IHRoaXMgd2lsbCBub3Qgd29yayB3aXRoIGRlZXAtdHlwZSBlbGVtZW50czsgdXNlIGF0dGFjaEVsZW1lbnQgaW5zdGVhZFxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4XHJcbiAgICAgKi9cclxuICAgIGFkZChlbGVtZW50LCBpbmRleClcclxuICAgIHtcclxuICAgICAgICB0aGlzLmF0dGFjaEVsZW1lbnQoZWxlbWVudClcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNvcnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGluZGV4ID09PSAndW5kZWZpbmVkJyB8fCBpbmRleCA+PSB0aGlzLmVsZW1lbnQuY2hpbGRyZW4ubGVuZ3RoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZWxlbWVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5pbnNlcnRCZWZvcmUoZWxlbWVudCwgdGhpcy5lbGVtZW50LmNoaWxkcmVuW2luZGV4ICsgMV0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSB0aGlzLm9wdGlvbnMub3JkZXJJZFxyXG4gICAgICAgICAgICBsZXQgZHJhZ09yZGVyID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgICAgIGRyYWdPcmRlciA9IHRoaXMub3B0aW9ucy5vcmRlcklkSXNOdW1iZXIgPyBwYXJzZUZsb2F0KGRyYWdPcmRlcikgOiBkcmFnT3JkZXJcclxuICAgICAgICAgICAgbGV0IGZvdW5kXHJcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5fZ2V0Q2hpbGRyZW4odHJ1ZSlcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yZXZlcnNlT3JkZXIpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSBjaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZCA9IGNoaWxkcmVuW2ldXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkRHJhZ09yZGVyID0gY2hpbGQuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkRHJhZ09yZGVyID0gdGhpcy5vcHRpb25zLm9yZGVySXNOdW1iZXIgPyBwYXJzZUZsb2F0KGNoaWxkRHJhZ09yZGVyKSA6IGNoaWxkRHJhZ09yZGVyXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdPcmRlciA+IGNoaWxkRHJhZ09yZGVyKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZWxlbWVudCwgY2hpbGQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGNoaWxkcmVuKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZERyYWdPcmRlciA9IGNoaWxkLmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZERyYWdPcmRlciA9IHRoaXMub3B0aW9ucy5vcmRlcklzTnVtYmVyID8gcGFyc2VGbG9hdChjaGlsZERyYWdPcmRlcikgOiBjaGlsZERyYWdPcmRlclxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnT3JkZXIgPCBjaGlsZERyYWdPcmRlcilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGVsZW1lbnQsIGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFmb3VuZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhdHRhY2hlcyBhbiBIVE1MIGVsZW1lbnQgdG8gdGhlIHNvcnRhYmxlOyBjYW4gYWxzbyBiZSB1c2VkIHRvIHN3YXAgYmV0d2VlbiBzb3J0YWJsZXNcclxuICAgICAqIE5PVEU6IHlvdSBuZWVkIHRvIG1hbnVhbGx5IGluc2VydCB0aGUgZWxlbWVudCBpbnRvIHRoaXMuZWxlbWVudCAodGhpcyBpcyB1c2VmdWwgd2hlbiB5b3UgaGF2ZSBhIGRlZXAgc3RydWN0dXJlKVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICovXHJcbiAgICBhdHRhY2hFbGVtZW50KGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9IHRoaXNcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlID0ge1xyXG4gICAgICAgICAgICAgICAgc29ydGFibGU6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBvcmlnaW5hbDogdGhpcyxcclxuICAgICAgICAgICAgICAgIGRyYWdTdGFydDogKGUpID0+IHRoaXMuX2RyYWdTdGFydChlKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBlbnN1cmUgZXZlcnkgZWxlbWVudCBoYXMgYW4gaWRcclxuICAgICAgICAgICAgaWYgKCFlbGVtZW50LmlkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmlkID0gJ19fc29ydGFibGUtJyArIHRoaXMub3B0aW9ucy5uYW1lICsgJy0nICsgU29ydGFibGUudHJhY2tlclt0aGlzLm9wdGlvbnMubmFtZV0uY291bnRlclxyXG4gICAgICAgICAgICAgICAgU29ydGFibGUudHJhY2tlclt0aGlzLm9wdGlvbnMubmFtZV0uY291bnRlcisrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jb3B5KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuY29weSA9IDBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdzdGFydCcsIGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnU3RhcnQpXHJcbiAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdkcmFnZ2FibGUnLCB0cnVlKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlbW92ZXMgYWxsIGV2ZW50cyBmcm9tIGFuIEhUTUwgZWxlbWVudFxyXG4gICAgICogTk9URTogZG9lcyBub3QgcmVtb3ZlIHRoZSBlbGVtZW50IGZyb20gaXRzIHBhcmVudFxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICovXHJcbiAgICByZW1vdmVFbGVtZW50KGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBlbGVtZW50LmRyYWdTdGFydClcclxuICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBlbGVtZW50LmRyYWdTdGFydClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFkZCBzb3J0YWJsZSB0byBnbG9iYWwgbGlzdCB0aGF0IHRyYWNrcyBhbGwgc29ydGFibGVzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfYWRkVG9HbG9iYWxUcmFja2VyKClcclxuICAgIHtcclxuICAgICAgICBpZiAoIVNvcnRhYmxlLnRyYWNrZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBTb3J0YWJsZS50cmFja2VyID0ge31cclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIChlKSA9PiB0aGlzLl9ib2R5RHJhZ092ZXIoZSkpXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIChlKSA9PiB0aGlzLl9ib2R5RHJvcChlKSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKFNvcnRhYmxlLnRyYWNrZXJbdGhpcy5vcHRpb25zLm5hbWVdKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgU29ydGFibGUudHJhY2tlclt0aGlzLm9wdGlvbnMubmFtZV0ubGlzdC5wdXNoKHRoaXMpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFNvcnRhYmxlLnRyYWNrZXJbdGhpcy5vcHRpb25zLm5hbWVdID0geyBsaXN0OiBbdGhpc10sIGNvdW50ZXI6IDAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGRlZmF1bHQgZHJhZyBvdmVyIGZvciB0aGUgYm9keVxyXG4gICAgICogQHBhcmFtIHtEcmFnRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9ib2R5RHJhZ092ZXIoZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBuYW1lID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMF1cclxuICAgICAgICBpZiAobmFtZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMV1cclxuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxyXG4gICAgICAgICAgICBjb25zdCBzb3J0YWJsZSA9IHRoaXMuX2ZpbmRDbG9zZXN0KGUsIFNvcnRhYmxlLnRyYWNrZXJbbmFtZV0ubGlzdCwgZWxlbWVudClcclxuICAgICAgICAgICAgaWYgKHNvcnRhYmxlKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wbGFjZUluTGlzdChzb3J0YWJsZSwgZS5wYWdlWCwgZS5wYWdlWSwgZWxlbWVudClcclxuICAgICAgICAgICAgICAgIGUuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSAnbW92ZSdcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZURyYWdnaW5nKGUsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9ub0Ryb3AoZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgbm8gZHJvcFxyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBlXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjYW5jZWxdIGZvcmNlIGNhbmNlbCAoZm9yIG9wdGlvbnMuY29weSlcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9ub0Ryb3AoZSwgY2FuY2VsKVxyXG4gICAge1xyXG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSAnbW92ZSdcclxuICAgICAgICBjb25zdCBpZCA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzFdXHJcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxyXG4gICAgICAgIGlmIChlbGVtZW50KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlRHJhZ2dpbmcoZSwgZWxlbWVudClcclxuICAgICAgICAgICAgdGhpcy5fc2V0SWNvbihlbGVtZW50LCBudWxsLCBjYW5jZWwpXHJcbiAgICAgICAgICAgIGlmICghY2FuY2VsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsLm9wdGlvbnMub2ZmTGlzdCA9PT0gJ2RlbGV0ZScpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5ID0gZWxlbWVudC5zdHlsZS5kaXNwbGF5IHx8ICd1bnNldCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbC5lbWl0KCdkZWxldGUtcGVuZGluZycsIGVsZW1lbnQsIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbClcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVwbGFjZUluTGlzdChlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBkZWZhdWx0IGRyb3AgZm9yIHRoZSBib2R5XHJcbiAgICAgKiBAcGFyYW0ge0RyYWdFdmVudH0gZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2JvZHlEcm9wKGUpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzBdXHJcbiAgICAgICAgaWYgKG5hbWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzFdXHJcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZClcclxuICAgICAgICAgICAgY29uc3Qgc29ydGFibGUgPSB0aGlzLl9maW5kQ2xvc2VzdChlLCBTb3J0YWJsZS50cmFja2VyW25hbWVdLmxpc3QsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZW1vdmVEcmFnZ2luZyhlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlKClcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheVxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5ID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbC5lbWl0KCdkZWxldGUnLCBlbGVtZW50LCBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwpXHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc3RhcnQgZHJhZ1xyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZHJhZ1N0YXJ0KGUpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3Qgc29ydGFibGUgPSBlLnRhcmdldC5fX3NvcnRhYmxlLm9yaWdpbmFsXHJcbiAgICAgICAgY29uc3QgZHJhZ2dpbmcgPSBlLnRhcmdldC5jbG9uZU5vZGUodHJ1ZSlcclxuICAgICAgICBmb3IgKGxldCBzdHlsZSBpbiBzb3J0YWJsZS5vcHRpb25zLmRyYWdTdHlsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGRyYWdnaW5nLnN0eWxlW3N0eWxlXSA9IHNvcnRhYmxlLm9wdGlvbnMuZHJhZ1N0eWxlW3N0eWxlXVxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBwb3MgPSB1dGlscy50b0dsb2JhbChlLnRhcmdldClcclxuICAgICAgICBkcmFnZ2luZy5zdHlsZS5sZWZ0ID0gcG9zLnggKyAncHgnXHJcbiAgICAgICAgZHJhZ2dpbmcuc3R5bGUudG9wID0gcG9zLnkgKyAncHgnXHJcbiAgICAgICAgY29uc3Qgb2Zmc2V0ID0geyB4OiBwb3MueCAtIGUucGFnZVgsIHk6IHBvcy55IC0gZS5wYWdlWSB9XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkcmFnZ2luZylcclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy51c2VJY29ucylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGltYWdlID0gbmV3IEltYWdlKClcclxuICAgICAgICAgICAgaW1hZ2Uuc3JjID0gc29ydGFibGUub3B0aW9ucy5pY29ucy5yZW9yZGVyXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xyXG4gICAgICAgICAgICBpbWFnZS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKC01MCUsIC01MCUpJ1xyXG4gICAgICAgICAgICBpbWFnZS5zdHlsZS5sZWZ0ID0gZHJhZ2dpbmcub2Zmc2V0TGVmdCArIGRyYWdnaW5nLm9mZnNldFdpZHRoICsgJ3B4J1xyXG4gICAgICAgICAgICBpbWFnZS5zdHlsZS50b3AgPSBkcmFnZ2luZy5vZmZzZXRUb3AgKyBkcmFnZ2luZy5vZmZzZXRIZWlnaHQgKyAncHgnXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaW1hZ2UpXHJcbiAgICAgICAgICAgIGRyYWdnaW5nLmljb24gPSBpbWFnZVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHV0aWxzLnN0eWxlKGUudGFyZ2V0LCAnY3Vyc29yJywgc29ydGFibGUub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHRhcmdldCA9IGUudGFyZ2V0XHJcbiAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMuY29weSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRhcmdldCA9IGUudGFyZ2V0LmNsb25lTm9kZSh0cnVlKVxyXG4gICAgICAgICAgICB0YXJnZXQuaWQgPSBlLnRhcmdldC5pZCArICctY29weS0nICsgZS50YXJnZXQuX19zb3J0YWJsZS5jb3B5XHJcbiAgICAgICAgICAgIGUudGFyZ2V0Ll9fc29ydGFibGUuY29weSsrXHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmF0dGFjaEVsZW1lbnQodGFyZ2V0KVxyXG4gICAgICAgICAgICB0YXJnZXQuX19zb3J0YWJsZS5pc0NvcHkgPSB0cnVlXHJcbiAgICAgICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLm9yaWdpbmFsID0gdGhpc1xyXG4gICAgICAgICAgICB0YXJnZXQuX19zb3J0YWJsZS5kaXNwbGF5ID0gdGFyZ2V0LnN0eWxlLmRpc3BsYXkgfHwgJ3Vuc2V0J1xyXG4gICAgICAgICAgICB0YXJnZXQuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRhcmdldClcclxuICAgICAgICB9XHJcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuY2xlYXJEYXRhKClcclxuICAgICAgICBlLmRhdGFUcmFuc2Zlci5zZXREYXRhKHNvcnRhYmxlLm9wdGlvbnMubmFtZSwgc29ydGFibGUub3B0aW9ucy5uYW1lKVxyXG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLnNldERhdGEodGFyZ2V0LmlkLCB0YXJnZXQuaWQpXHJcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuc2V0RHJhZ0ltYWdlKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLCAwLCAwKVxyXG4gICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLmN1cnJlbnQgPSB0aGlzXHJcbiAgICAgICAgdGFyZ2V0Ll9fc29ydGFibGUuaW5kZXggPSBzb3J0YWJsZS5vcHRpb25zLmNvcHkgPyAtMSA6IHNvcnRhYmxlLl9nZXRJbmRleCh0YXJnZXQpXHJcbiAgICAgICAgdGFyZ2V0Ll9fc29ydGFibGUuZHJhZ2dpbmcgPSBkcmFnZ2luZ1xyXG4gICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLm9mZnNldCA9IG9mZnNldFxyXG4gICAgfVxyXG5cclxuICAgIF9kcmFnT3ZlcihlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHNvcnRhYmxlID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMF1cclxuICAgICAgICBpZiAoc29ydGFibGUgJiYgc29ydGFibGUgPT09IHRoaXMub3B0aW9ucy5uYW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1sxXVxyXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUuaXNDb3B5ICYmIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9PT0gdGhpcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbm9Ecm9wKGUsIHRydWUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5vcHRpb25zLmRyb3AgfHwgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsID09PSB0aGlzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wbGFjZUluTGlzdCh0aGlzLCBlLnBhZ2VYLCBlLnBhZ2VZLCBlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgZS5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9IGVsZW1lbnQuX19zb3J0YWJsZS5pc0NvcHkgPyAnY29weScgOiAnbW92ZSdcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZURyYWdnaW5nKGUsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9ub0Ryb3AoZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfdXBkYXRlRHJhZ2dpbmcoZSwgZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBkcmFnZ2luZyA9IGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnZ2luZ1xyXG4gICAgICAgIGNvbnN0IG9mZnNldCA9IGVsZW1lbnQuX19zb3J0YWJsZS5vZmZzZXRcclxuICAgICAgICBpZiAoZHJhZ2dpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5zdHlsZS5sZWZ0ID0gZS5wYWdlWCArIG9mZnNldC54ICsgJ3B4J1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5zdHlsZS50b3AgPSBlLnBhZ2VZICsgb2Zmc2V0LnkgKyAncHgnXHJcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZy5pY29uKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnN0eWxlLmxlZnQgPSBkcmFnZ2luZy5vZmZzZXRMZWZ0ICsgZHJhZ2dpbmcub2Zmc2V0V2lkdGggKyAncHgnXHJcbiAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnN0eWxlLnRvcCA9IGRyYWdnaW5nLm9mZnNldFRvcCArIGRyYWdnaW5nLm9mZnNldEhlaWdodCArICdweCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfcmVtb3ZlRHJhZ2dpbmcoZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBkcmFnZ2luZyA9IGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnZ2luZ1xyXG4gICAgICAgIGRyYWdnaW5nLnJlbW92ZSgpXHJcbiAgICAgICAgaWYgKGRyYWdnaW5nLmljb24pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5pY29uLnJlbW92ZSgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnZ2luZyA9IG51bGxcclxuICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuaXNDb3B5ID0gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBfZHJvcChlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IG5hbWUgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1swXVxyXG4gICAgICAgIGlmIChuYW1lICYmIG5hbWUgPT09IHRoaXMub3B0aW9ucy5uYW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1sxXVxyXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgIT09IHRoaXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbC5lbWl0KCdyZW1vdmUnLCBlbGVtZW50LCBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2FkZCcsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgPSB0aGlzXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNvcnQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdvcmRlcicsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ3VwZGF0ZScsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLmluZGV4ICE9PSB0aGlzLl9nZXRJbmRleChlLnRhcmdldCkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdvcmRlcicsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCd1cGRhdGUnLCBlbGVtZW50LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3JlbW92ZURyYWdnaW5nKGVsZW1lbnQpXHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZmluZCBjbG9zZXN0IFNvcnRhYmxlIHRvIHNjcmVlbiBsb2NhdGlvblxyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBlXHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlW119IGxpc3Qgb2YgcmVsYXRlZCBTb3J0YWJsZXNcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9maW5kQ2xvc2VzdChlLCBsaXN0LCBlbGVtZW50KVxyXG4gICAge1xyXG4gICAgICAgIGxldCBtaW4gPSBJbmZpbml0eSwgZm91bmRcclxuICAgICAgICBmb3IgKGxldCByZWxhdGVkIG9mIGxpc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoKCFyZWxhdGVkLm9wdGlvbnMuZHJvcCAmJiBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgIT09IHJlbGF0ZWQpIHx8XHJcbiAgICAgICAgICAgICAgICAoZWxlbWVudC5fX3NvcnRhYmxlLmlzQ29weSAmJiBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgPT09IHJlbGF0ZWQpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh1dGlscy5pbnNpZGUoZS5wYWdlWCwgZS5wYWdlWSwgcmVsYXRlZC5lbGVtZW50KSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlbGF0ZWRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChyZWxhdGVkLm9wdGlvbnMub2ZmTGlzdCA9PT0gJ2Nsb3Nlc3QnKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjYWxjdWxhdGUgPSB1dGlscy5kaXN0YW5jZVRvQ2xvc2VzdENvcm5lcihlLnBhZ2VYLCBlLnBhZ2VZLCByZWxhdGVkLmVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICBpZiAoY2FsY3VsYXRlIDwgbWluKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG1pbiA9IGNhbGN1bGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gcmVsYXRlZFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmb3VuZFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGxhY2UgaW5kaWNhdG9yIGluIHRoZSBzb3J0YWJsZSBsaXN0IGFjY29yZGluZyB0byBvcHRpb25zLnNvcnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9wbGFjZUluTGlzdChzb3J0YWJsZSwgeCwgeSwgZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheSA9PT0gJ3Vuc2V0JyA/ICcnIDogZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXlcclxuICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkgPSBudWxsXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNvcnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLl9wbGFjZUluU29ydGFibGVMaXN0KHNvcnRhYmxlLCB4LCB5LCBlbGVtZW50KVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLl9wbGFjZUluT3JkZXJlZExpc3Qoc29ydGFibGUsIGVsZW1lbnQpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3NldEljb24oZWxlbWVudCwgc29ydGFibGUpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZXBsYWNlIGl0ZW0gaW4gbGlzdCBhdCBvcmlnaW5hbCBpbmRleCBwb3NpdGlvblxyXG4gICAgICovXHJcbiAgICBfcmVwbGFjZUluTGlzdChzb3J0YWJsZSwgZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHNvcnRhYmxlLl9nZXRDaGlsZHJlbigpXHJcbiAgICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gZWxlbWVudC5fX3NvcnRhYmxlLmluZGV4XHJcbiAgICAgICAgICAgIGlmIChpbmRleCA8IGNoaWxkcmVuLmxlbmd0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2hpbGRyZW5baW5kZXhdLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGVsZW1lbnQsIGNoaWxkcmVuW2luZGV4XSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkcmVuWzBdLmFwcGVuZENoaWxkKGVsZW1lbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc29ydGFibGUuZWxlbWVudC5hcHBlbmRDaGlsZChlbGVtZW50KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfZ2V0SW5kZXgoY2hpbGQpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLl9nZXRDaGlsZHJlbigpXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChjaGlsZHJlbltpXSA9PT0gY2hpbGQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgX3RyYXZlcnNlQ2hpbGRyZW4oYmFzZSwgc2VhcmNoLCByZXN1bHRzKVxyXG4gICAge1xyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGJhc2UuY2hpbGRyZW4pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoc2VhcmNoLmxlbmd0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHNlYXJjaC5pbmRleE9mKGNoaWxkLmNsYXNzTmFtZSkgIT09IC0xKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChjaGlsZClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChjaGlsZClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl90cmF2ZXJzZUNoaWxkcmVuKGNoaWxkLCBzZWFyY2gsIHJlc3VsdHMpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZmluZCBjaGlsZHJlbiBpbiBkaXZcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcmRlcl0gc2VhcmNoIGZvciBkcmFnT3JkZXIgYXMgd2VsbFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2dldENoaWxkcmVuKG9yZGVyKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZGVlcFNlYXJjaClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBzZWFyY2ggPSBbXVxyXG4gICAgICAgICAgICBpZiAob3JkZXIgJiYgdGhpcy5vcHRpb25zLm9yZGVyQ2xhc3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaC5wdXNoKHRoaXMub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAob3JkZXIgJiYgdGhpcy5vcHRpb25zLm9yZGVyQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoLnB1c2godGhpcy5vcHRpb25zLm9yZGVyQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoIW9yZGVyICYmIHRoaXMub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNlYXJjaC5wdXNoKHRoaXMub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdXHJcbiAgICAgICAgICAgIHRoaXMuX3RyYXZlcnNlQ2hpbGRyZW4odGhpcy5lbGVtZW50LCBzZWFyY2gsIHJlc3VsdHMpXHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbGlzdCA9IFtdXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiB0aGlzLmVsZW1lbnQuY2hpbGRyZW4pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHV0aWxzLmNvbnRhaW5zQ2xhc3NOYW1lKGNoaWxkLCB0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKSB8fCAob3JkZXIgJiYgIXRoaXMub3B0aW9ucy5vcmRlckNsYXNzIHx8IChvcmRlciAmJiB0aGlzLm9wdGlvbnMub3JkZXJDbGFzcyAmJiB1dGlscy5jb250YWluc0NsYXNzTmFtZShjaGlsZCwgdGhpcy5vcHRpb25zLm9yZGVyQ2xhc3MpKSkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaXN0LnB1c2goY2hpbGQpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGxpc3RcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQuY2hpbGRyZW5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBsYWNlIGluZGljYXRvciBpbiBhbiBvcmRlcmVkIGxpc3RcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BsYWNlSW5PcmRlcmVkTGlzdChzb3J0YWJsZSwgZHJhZ2dpbmcpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudCAhPT0gc29ydGFibGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IHNvcnRhYmxlLm9wdGlvbnMub3JkZXJJZFxyXG4gICAgICAgICAgICBsZXQgZHJhZ09yZGVyID0gZHJhZ2dpbmcuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICBkcmFnT3JkZXIgPSBzb3J0YWJsZS5vcHRpb25zLm9yZGVySWRJc051bWJlciA/IHBhcnNlRmxvYXQoZHJhZ09yZGVyKSA6IGRyYWdPcmRlclxyXG4gICAgICAgICAgICBsZXQgZm91bmRcclxuICAgICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4odHJ1ZSlcclxuICAgICAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMucmV2ZXJzZU9yZGVyKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBjaGlsZHJlbltpXVxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZERyYWdPcmRlciA9IGNoaWxkLmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZERyYWdPcmRlciA9IHNvcnRhYmxlLm9wdGlvbnMub3JkZXJJc051bWJlciA/IHBhcnNlRmxvYXQoY2hpbGREcmFnT3JkZXIpIDogY2hpbGREcmFnT3JkZXJcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ09yZGVyID4gY2hpbGREcmFnT3JkZXIpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShkcmFnZ2luZywgY2hpbGQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGNoaWxkcmVuKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZERyYWdPcmRlciA9IGNoaWxkLmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZERyYWdPcmRlciA9IHNvcnRhYmxlLm9wdGlvbnMub3JkZXJJc051bWJlciA/IHBhcnNlRmxvYXQoY2hpbGREcmFnT3JkZXIpIDogY2hpbGREcmFnT3JkZXJcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ09yZGVyIDwgY2hpbGREcmFnT3JkZXIpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShkcmFnZ2luZywgY2hpbGQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWZvdW5kKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbGVtZW50LmFwcGVuZENoaWxkKGRyYWdnaW5nKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudC5lbWl0KCdyZW1vdmUtcGVuZGluZycsIGRyYWdnaW5nLCBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ2FkZC1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgPSBzb3J0YWJsZVxyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCd1cGRhdGUtcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwbGFjZSBpbmRpY2F0b3IgaW4gYW4gc29ydGFibGUgbGlzdFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BsYWNlSW5Tb3J0YWJsZUxpc3Qoc29ydGFibGUsIHgsIHksIGRyYWdnaW5nKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBzb3J0YWJsZS5lbGVtZW50XHJcbiAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgIGlmICghY2hpbGRyZW4ubGVuZ3RoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudCAhPT0gc29ydGFibGUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudC5lbWl0KCdyZW1vdmUtcGVuZGluZycsIGRyYWdnaW5nLCBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgICAgICBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgPSBzb3J0YWJsZVxyXG4gICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnYWRkLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChkcmFnZ2luZylcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IGRpc3RhbmNlID0gSW5maW5pdHksIGNsb3Nlc3QsIGlzQmVmb3JlLCBpbmRpY2F0b3JcclxuICAgICAgICAgICAgY29uc3QgZWxlbWVudHMgPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4odHJ1ZSlcclxuICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgZWxlbWVudHMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChjaGlsZCA9PT0gZHJhZ2dpbmcpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5kaWNhdG9yID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHV0aWxzLmluc2lkZSh4LCB5LCBjaGlsZCkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkID09PSBkcmFnZ2luZylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjbG9zZXN0ID0gY2hpbGRcclxuICAgICAgICAgICAgICAgICAgICBpc0JlZm9yZSA9IGluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWVhc3VyZSA9IHV0aWxzLmRpc3RhbmNlVG9DbG9zZXN0Q29ybmVyKHgsIHksIGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChtZWFzdXJlIDwgZGlzdGFuY2UpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9zZXN0ID0gY2hpbGRcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2UgPSBtZWFzdXJlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzQmVmb3JlID0gaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjbG9zZXN0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2xvc2VzdCA9PT0gZHJhZ2dpbmcpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNCZWZvcmUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5pbnNlcnRCZWZvcmUoZHJhZ2dpbmcsIGNsb3Nlc3QubmV4dFNpYmxpbmcpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5pbnNlcnRCZWZvcmUoZHJhZ2dpbmcsIGNsb3Nlc3QpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdvcmRlci1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgIT09IHNvcnRhYmxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnYWRkLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudC5lbWl0KCdyZW1vdmUtcGVuZGluZycsIGRyYWdnaW5nLCBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudCA9IHNvcnRhYmxlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNvcnRhYmxlLmVtaXQoJ3VwZGF0ZS1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2V0IGljb24gaWYgYXZhaWxhYmxlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NhbmNlbF0gZm9yY2UgY2FuY2VsIChmb3Igb3B0aW9ucy5jb3B5KVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3NldEljb24oZWxlbWVudCwgc29ydGFibGUsIGNhbmNlbClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBkcmFnZ2luZyA9IGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnZ2luZ1xyXG4gICAgICAgIGlmIChkcmFnZ2luZyAmJiBkcmFnZ2luZy5pY29uKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCFzb3J0YWJsZSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc29ydGFibGUgPSBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWxcclxuICAgICAgICAgICAgICAgIGlmIChjYW5jZWwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zcmMgPSBzb3J0YWJsZS5vcHRpb25zLmljb25zLmNhbmNlbFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnaW5nLmljb24uc3JjID0gc29ydGFibGUub3B0aW9ucy5vZmZMaXN0ID09PSAnZGVsZXRlJyA/IHNvcnRhYmxlLm9wdGlvbnMuaWNvbnMuZGVsZXRlIDogc29ydGFibGUub3B0aW9ucy5pY29ucy5jYW5jZWxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUuaXNDb3B5KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnaW5nLmljb24uc3JjID0gc29ydGFibGUub3B0aW9ucy5pY29ucy5jb3B5XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zcmMgPSBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgPT09IHNvcnRhYmxlID8gc29ydGFibGUub3B0aW9ucy5pY29ucy5yZW9yZGVyIDogc29ydGFibGUub3B0aW9ucy5pY29ucy5tb3ZlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgcGlja2VkIHVwIGJlY2F1c2UgaXQgd2FzIG1vdmVkIGJleW9uZCB0aGUgb3B0aW9ucy50aHJlc2hvbGRcclxuICogQGV2ZW50IFNvcnRhYmxlI3BpY2t1cFxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHNvcnRhYmxlIGlzIHJlb3JkZXJlZFxyXG4gKiBAZXZlbnQgU29ydGFibGUjb3JkZXJcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCB0aGF0IHdhcyByZW9yZGVyZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgcGxhY2VkXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyBhZGRlZCB0byB0aGlzIHNvcnRhYmxlXHJcbiAqIEBldmVudCBTb3J0YWJsZSNhZGRcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBhZGRlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyBhZGRlZFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgcmVtb3ZlZCBmcm9tIHRoaXMgc29ydGFibGVcclxuICogQGV2ZW50IFNvcnRhYmxlI3JlbW92ZVxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHJlbW92ZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgcmVtb3ZlZFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgcmVtb3ZlZCBmcm9tIGFsbCBzb3J0YWJsZXNcclxuICogQGV2ZW50IFNvcnRhYmxlI2RlbGV0ZVxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHJlbW92ZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgZHJhZ2dlZCBmcm9tXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gdGhlIHNvcnRhYmxlIGlzIHVwZGF0ZWQgd2l0aCBhbiBhZGQsIHJlbW92ZSwgb3Igb3JkZXIgY2hhbmdlXHJcbiAqIEBldmVudCBTb3J0YWJsZSN1cGRhdGVcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBjaGFuZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdpdGggZWxlbWVudFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIG9yZGVyIHdhcyBjaGFuZ2VkIGJ1dCBlbGVtZW50IHdhcyBub3QgZHJvcHBlZCB5ZXRcclxuICogQGV2ZW50IFNvcnRhYmxlI29yZGVyLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gZWxlbWVudCBpcyBhZGRlZCBidXQgbm90IGRyb3BwZWQgeWV0XHJcbiAqIEBldmVudCBTb3J0YWJsZSNhZGQtcGVuZGluZ1xyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBlbGVtZW50IGlzIHJlbW92ZWQgYnV0IG5vdCBkcm9wcGVkIHlldFxyXG4gKiBAZXZlbnQgU29ydGFibGUjcmVtb3ZlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyBhYm91dCB0byBiZSByZW1vdmVkIGZyb20gYWxsIHNvcnRhYmxlc1xyXG4gKiBAZXZlbnQgU29ydGFibGUjZGVsZXRlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCByZW1vdmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIGRyYWdnZWQgZnJvbVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgYWRkZWQsIHJlbW92ZWQsIG9yIHJlb3JkZXIgYnV0IGVsZW1lbnQgaGFzIG5vdCBkcm9wcGVkIHlldFxyXG4gKiBAZXZlbnQgU29ydGFibGUjdXBkYXRlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqLyJdfQ==