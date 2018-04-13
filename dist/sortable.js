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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3J0YWJsZS5qcyJdLCJuYW1lcyI6WyJ1dGlscyIsIlNvcnRhYmxlIiwiZWxlbWVudCIsIm9wdGlvbnMiLCJfYWRkVG9HbG9iYWxUcmFja2VyIiwiZWxlbWVudHMiLCJfZ2V0Q2hpbGRyZW4iLCJjaGlsZCIsImRyYWdDbGFzcyIsImNvbnRhaW5zQ2xhc3NOYW1lIiwiYXR0YWNoRWxlbWVudCIsImV2ZW50cyIsImRyYWdPdmVyIiwiZSIsIl9kcmFnT3ZlciIsImRyb3AiLCJfZHJvcCIsIm1vdXNlT3ZlciIsIl9tb3VzZUVudGVyIiwiYWRkRXZlbnRMaXN0ZW5lciIsImN1cnNvckhvdmVyIiwic3R5bGUiLCJjdXJzb3JEb3duIiwiX21vdXNlRG93biIsImN1cnJlbnRUYXJnZXQiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwicmVtb3ZlRWxlbWVudCIsImluZGV4Iiwic29ydCIsImNoaWxkcmVuIiwibGVuZ3RoIiwiYXBwZW5kQ2hpbGQiLCJpbnNlcnRCZWZvcmUiLCJpZCIsIm9yZGVySWQiLCJkcmFnT3JkZXIiLCJnZXRBdHRyaWJ1dGUiLCJvcmRlcklkSXNOdW1iZXIiLCJwYXJzZUZsb2F0IiwiZm91bmQiLCJyZXZlcnNlT3JkZXIiLCJpIiwiY2hpbGREcmFnT3JkZXIiLCJvcmRlcklzTnVtYmVyIiwicGFyZW50Tm9kZSIsIl9fc29ydGFibGUiLCJvcmlnaW5hbCIsInNvcnRhYmxlIiwiZHJhZ1N0YXJ0IiwiX2RyYWdTdGFydCIsIm5hbWUiLCJ0cmFja2VyIiwiY291bnRlciIsImNvcHkiLCJzZXRBdHRyaWJ1dGUiLCJkcmFnSW1hZ2UiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJib2R5IiwiX2JvZHlEcmFnT3ZlciIsIl9ib2R5RHJvcCIsImxpc3QiLCJwdXNoIiwiZGF0YVRyYW5zZmVyIiwidHlwZXMiLCJnZXRFbGVtZW50QnlJZCIsIl9maW5kQ2xvc2VzdCIsIl9wbGFjZUluTGlzdCIsInBhZ2VYIiwicGFnZVkiLCJkcm9wRWZmZWN0IiwiX3VwZGF0ZURyYWdnaW5nIiwiX25vRHJvcCIsInByZXZlbnREZWZhdWx0IiwiY2FuY2VsIiwiX3NldEljb24iLCJvZmZMaXN0IiwiZGlzcGxheSIsImVtaXQiLCJfcmVwbGFjZUluTGlzdCIsIl9yZW1vdmVEcmFnZ2luZyIsInJlbW92ZSIsImRyYWdnaW5nIiwiY2xvbmVOb2RlIiwiZHJhZ1N0eWxlIiwicG9zIiwidG9HbG9iYWwiLCJsZWZ0IiwieCIsInRvcCIsInkiLCJvZmZzZXQiLCJ1c2VJY29ucyIsImltYWdlIiwiSW1hZ2UiLCJzcmMiLCJpY29ucyIsInJlb3JkZXIiLCJwb3NpdGlvbiIsInRyYW5zZm9ybSIsIm9mZnNldExlZnQiLCJvZmZzZXRXaWR0aCIsIm9mZnNldFRvcCIsIm9mZnNldEhlaWdodCIsImljb24iLCJ0YXJnZXQiLCJpc0NvcHkiLCJjbGVhckRhdGEiLCJzZXREYXRhIiwic2V0RHJhZ0ltYWdlIiwiY3VycmVudCIsIl9nZXRJbmRleCIsInN0b3BQcm9wYWdhdGlvbiIsIm1pbiIsIkluZmluaXR5IiwicmVsYXRlZCIsImluc2lkZSIsImNhbGN1bGF0ZSIsImRpc3RhbmNlVG9DbG9zZXN0Q29ybmVyIiwiX3BsYWNlSW5Tb3J0YWJsZUxpc3QiLCJfcGxhY2VJbk9yZGVyZWRMaXN0IiwiYmFzZSIsInNlYXJjaCIsInJlc3VsdHMiLCJpbmRleE9mIiwiY2xhc3NOYW1lIiwiX3RyYXZlcnNlQ2hpbGRyZW4iLCJvcmRlciIsImRlZXBTZWFyY2giLCJvcmRlckNsYXNzIiwiZGlzdGFuY2UiLCJjbG9zZXN0IiwiaXNCZWZvcmUiLCJpbmRpY2F0b3IiLCJtZWFzdXJlIiwibmV4dFNpYmxpbmciLCJkZWxldGUiLCJtb3ZlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOzs7O0FBRUE7Ozs7QUFDQTs7SUFBWUEsSzs7Ozs7Ozs7Ozs7O0lBRVNDLFE7OztBQUVqQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0NBLHNCQUFZQyxPQUFaLEVBQXFCQyxPQUFyQixF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QTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQU1JLG1CQUFPd0gsT0FBUDtBQUNIOzs7NEJBakJEO0FBQ0k7QUFDSDs7Ozs7O0FBb3RCTDs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7OztrQkEvM0JxQjFILFEiLCJmaWxlIjoic29ydGFibGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRXZlbnRzIGZyb20gJ2V2ZW50ZW1pdHRlcjMnXHJcblxyXG5pbXBvcnQgZGVmYXVsdHMgZnJvbSAnLi9kZWZhdWx0cydcclxuaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnLi91dGlscydcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNvcnRhYmxlIGV4dGVuZHMgRXZlbnRzXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIHNvcnRhYmxlIGxpc3RcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5uYW1lPXNvcnRhYmxlXSBkcmFnZ2luZyBpcyBhbGxvd2VkIGJldHdlZW4gU29ydGFibGVzIHdpdGggdGhlIHNhbWUgbmFtZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmRyYWdDbGFzc10gaWYgc2V0IHRoZW4gZHJhZyBvbmx5IGl0ZW1zIHdpdGggdGhpcyBjbGFzc05hbWUgdW5kZXIgZWxlbWVudDsgb3RoZXJ3aXNlIGRyYWcgYWxsIGNoaWxkcmVuXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMub3JkZXJDbGFzc10gdXNlIHRoaXMgY2xhc3MgdG8gaW5jbHVkZSBlbGVtZW50cyBpbiBvcmRlcmluZyBidXQgbm90IGRyYWdnaW5nOyBvdGhlcndpc2UgYWxsIGNoaWxkcmVuIGVsZW1lbnRzIGFyZSBpbmNsdWRlZCBpbiB3aGVuIHNvcnRpbmcgYW5kIG9yZGVyaW5nXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmRlZXBTZWFyY2hdIGlmIGRyYWdDbGFzcyBhbmQgZGVlcFNlYXJjaCB0aGVuIHNlYXJjaCBhbGwgZGVzY2VuZGVudHMgb2YgZWxlbWVudCBmb3IgZHJhZ0NsYXNzXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnNvcnQ9dHJ1ZV0gYWxsb3cgc29ydGluZyB3aXRoaW4gbGlzdFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5kcm9wPXRydWVdIGFsbG93IGRyb3AgZnJvbSByZWxhdGVkIHNvcnRhYmxlcyAoZG9lc24ndCBpbXBhY3QgcmVvcmRlcmluZyB0aGlzIHNvcnRhYmxlJ3MgY2hpbGRyZW4gdW50aWwgdGhlIGNoaWxkcmVuIGFyZSBtb3ZlZCB0byBhIGRpZmZlcmVuIHNvcnRhYmxlKVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5jb3B5PWZhbHNlXSBjcmVhdGUgY29weSB3aGVuIGRyYWdnaW5nIGFuIGl0ZW0gKHRoaXMgZGlzYWJsZXMgc29ydD10cnVlIGZvciB0aGlzIHNvcnRhYmxlKVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLm9yZGVySWQ9ZGF0YS1vcmRlcl0gZm9yIG9yZGVyZWQgbGlzdHMsIHVzZSB0aGlzIGRhdGEgaWQgdG8gZmlndXJlIG91dCBzb3J0IG9yZGVyXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLm9yZGVySWRJc051bWJlcj10cnVlXSB1c2UgcGFyc2VJbnQgb24gb3B0aW9ucy5zb3J0SWQgdG8gcHJvcGVybHkgc29ydCBudW1iZXJzXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMucmV2ZXJzZU9yZGVyXSByZXZlcnNlIHNvcnQgdGhlIG9yZGVySWRcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5vZmZMaXN0PWNsb3Nlc3RdIGhvdyB0byBoYW5kbGUgd2hlbiBhbiBlbGVtZW50IGlzIGRyb3BwZWQgb3V0c2lkZSBhIHNvcnRhYmxlOiBjbG9zZXN0PWRyb3AgaW4gY2xvc2VzdCBzb3J0YWJsZTsgY2FuY2VsPXJldHVybiB0byBzdGFydGluZyBzb3J0YWJsZTsgZGVsZXRlPXJlbW92ZSBmcm9tIGFsbCBzb3J0YWJsZXNcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5jdXJzb3JIb3Zlcj1ncmFiIC13ZWJraXQtZ3JhYiBwb2ludGVyXSB1c2UgdGhpcyBjdXJzb3IgbGlzdCB0byBzZXQgY3Vyc29yIHdoZW4gaG92ZXJpbmcgb3ZlciBhIHNvcnRhYmxlIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5jdXJzb3JEb3duPWdyYWJiaW5nIC13ZWJraXQtZ3JhYmJpbmcgcG9pbnRlcl0gdXNlIHRoaXMgY3Vyc29yIGxpc3QgdG8gc2V0IGN1cnNvciB3aGVuIG1vdXNlZG93bi90b3VjaGRvd24gb3ZlciBhIHNvcnRhYmxlIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMudXNlSWNvbnM9dHJ1ZV0gc2hvdyBpY29ucyB3aGVuIGRyYWdnaW5nXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnMuaWNvbnNdIGRlZmF1bHQgc2V0IG9mIGljb25zXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuaWNvbnMucmVvcmRlcl1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5pY29ucy5tb3ZlXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmljb25zLmNvcHldXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuaWNvbnMuZGVsZXRlXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmN1c3RvbUljb25dIHNvdXJjZSBvZiBjdXN0b20gaW1hZ2Ugd2hlbiBvdmVyIHRoaXMgc29ydGFibGVcclxuICAgICAqIEBmaXJlcyBwaWNrdXBcclxuICAgICAqIEBmaXJlcyBvcmRlclxyXG4gICAgICogQGZpcmVzIGFkZFxyXG4gICAgICogQGZpcmVzIHJlbW92ZVxyXG4gICAgICogQGZpcmVzIHVwZGF0ZVxyXG4gICAgICogQGZpcmVzIGRlbGV0ZVxyXG4gICAgICogQGZpcmVzIG9yZGVyLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyBhZGQtcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIHJlbW92ZS1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgdXBkYXRlLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyBkZWxldGUtcGVuZGluZ1xyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyKClcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSB1dGlscy5vcHRpb25zKG9wdGlvbnMsIGRlZmF1bHRzKVxyXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnRcclxuICAgICAgICB0aGlzLl9hZGRUb0dsb2JhbFRyYWNrZXIoKVxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnRzID0gdGhpcy5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGVsZW1lbnRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzIHx8IHV0aWxzLmNvbnRhaW5zQ2xhc3NOYW1lKGNoaWxkLCB0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hdHRhY2hFbGVtZW50KGNoaWxkKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZXZlbnRzID0ge1xyXG4gICAgICAgICAgICBkcmFnT3ZlcjogKGUpID0+IHRoaXMuX2RyYWdPdmVyKGUpLFxyXG4gICAgICAgICAgICBkcm9wOiAoZSkgPT4gdGhpcy5fZHJvcChlKSxcclxuICAgICAgICAgICAgbW91c2VPdmVyOiAoZSkgPT4gdGhpcy5fbW91c2VFbnRlcihlKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgdGhpcy5ldmVudHMuZHJhZ092ZXIpXHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywgdGhpcy5ldmVudHMuZHJvcClcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmN1cnNvckhvdmVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5fZ2V0Q2hpbGRyZW4oKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdXRpbHMuc3R5bGUoY2hpbGQsICdjdXJzb3InLCB0aGlzLm9wdGlvbnMuY3Vyc29ySG92ZXIpXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmN1cnNvckRvd24pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKGUpID0+IHRoaXMuX21vdXNlRG93bihlKSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfbW91c2VEb3duKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHV0aWxzLnN0eWxlKGUuY3VycmVudFRhcmdldCwgJ2N1cnNvcicsIHRoaXMub3B0aW9ucy5jdXJzb3JEb3duKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlbW92ZXMgYWxsIGV2ZW50IGhhbmRsZXJzIGZyb20gdGhpcy5lbGVtZW50IGFuZCBjaGlsZHJlblxyXG4gICAgICovXHJcbiAgICBkZXN0cm95KClcclxuICAgIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCB0aGlzLmV2ZW50cy5kcmFnT3ZlcilcclxuICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJvcCcsIHRoaXMuZXZlbnRzLmRyb3ApXHJcbiAgICAgICAgY29uc3QgZWxlbWVudHMgPSB0aGlzLl9nZXRDaGlsZHJlbigpXHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgZWxlbWVudHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUVsZW1lbnQoY2hpbGQpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdGhlIGdsb2JhbCBkZWZhdWx0cyBmb3IgbmV3IFNvcnRhYmxlIG9iamVjdHNcclxuICAgICAqIEB0eXBlIHtEZWZhdWx0T3B0aW9uc31cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldCBkZWZhdWx0cygpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjcmVhdGUgbXVsdGlwbGUgc29ydGFibGUgZWxlbWVudHNcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnRzW119IGVsZW1lbnRzXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyAtIHNlZSBjb25zdHJ1Y3RvciBmb3Igb3B0aW9uc1xyXG4gICAgICovXHJcbiAgICBzdGF0aWMgY3JlYXRlKGVsZW1lbnRzLCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXVxyXG4gICAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgZWxlbWVudHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXN1bHRzLnB1c2gobmV3IFNvcnRhYmxlKGVsZW1lbnQsIG9wdGlvbnMpKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0c1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYWRkIGFuIGVsZW1lbnQgYXMgYSBjaGlsZCBvZiB0aGUgc29ydGFibGUgZWxlbWVudDsgY2FuIGFsc28gYmUgdXNlZCB0byBzd2FwIGJldHdlZW4gc29ydGFibGVzXHJcbiAgICAgKiBOT1RFOiB0aGlzIHdpbGwgbm90IHdvcmsgd2l0aCBkZWVwLXR5cGUgZWxlbWVudHM7IHVzZSBhdHRhY2hFbGVtZW50IGluc3RlYWRcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleFxyXG4gICAgICovXHJcbiAgICBhZGQoZWxlbWVudCwgaW5kZXgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5hdHRhY2hFbGVtZW50KGVsZW1lbnQpXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zb3J0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBpbmRleCA9PT0gJ3VuZGVmaW5lZCcgfHwgaW5kZXggPj0gdGhpcy5lbGVtZW50LmNoaWxkcmVuLmxlbmd0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuaW5zZXJ0QmVmb3JlKGVsZW1lbnQsIHRoaXMuZWxlbWVudC5jaGlsZHJlbltpbmRleCArIDFdKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gdGhpcy5vcHRpb25zLm9yZGVySWRcclxuICAgICAgICAgICAgbGV0IGRyYWdPcmRlciA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICBkcmFnT3JkZXIgPSB0aGlzLm9wdGlvbnMub3JkZXJJZElzTnVtYmVyID8gcGFyc2VGbG9hdChkcmFnT3JkZXIpIDogZHJhZ09yZGVyXHJcbiAgICAgICAgICAgIGxldCBmb3VuZFxyXG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuX2dldENoaWxkcmVuKHRydWUpXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmV2ZXJzZU9yZGVyKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBjaGlsZHJlbltpXVxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZERyYWdPcmRlciA9IGNoaWxkLmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZERyYWdPcmRlciA9IHRoaXMub3B0aW9ucy5vcmRlcklzTnVtYmVyID8gcGFyc2VGbG9hdChjaGlsZERyYWdPcmRlcikgOiBjaGlsZERyYWdPcmRlclxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnT3JkZXIgPiBjaGlsZERyYWdPcmRlcilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGVsZW1lbnQsIGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBjaGlsZHJlbilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGREcmFnT3JkZXIgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGREcmFnT3JkZXIgPSB0aGlzLm9wdGlvbnMub3JkZXJJc051bWJlciA/IHBhcnNlRmxvYXQoY2hpbGREcmFnT3JkZXIpIDogY2hpbGREcmFnT3JkZXJcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ09yZGVyIDwgY2hpbGREcmFnT3JkZXIpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShlbGVtZW50LCBjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghZm91bmQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChlbGVtZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYXR0YWNoZXMgYW4gSFRNTCBlbGVtZW50IHRvIHRoZSBzb3J0YWJsZTsgY2FuIGFsc28gYmUgdXNlZCB0byBzd2FwIGJldHdlZW4gc29ydGFibGVzXHJcbiAgICAgKiBOT1RFOiB5b3UgbmVlZCB0byBtYW51YWxseSBpbnNlcnQgdGhlIGVsZW1lbnQgaW50byB0aGlzLmVsZW1lbnQgKHRoaXMgaXMgdXNlZnVsIHdoZW4geW91IGhhdmUgYSBkZWVwIHN0cnVjdHVyZSlcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqL1xyXG4gICAgYXR0YWNoRWxlbWVudChlbGVtZW50KVxyXG4gICAge1xyXG4gICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgPSB0aGlzXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZSA9IHtcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlOiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgb3JpZ2luYWw6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBkcmFnU3RhcnQ6IChlKSA9PiB0aGlzLl9kcmFnU3RhcnQoZSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gZW5zdXJlIGV2ZXJ5IGVsZW1lbnQgaGFzIGFuIGlkXHJcbiAgICAgICAgICAgIGlmICghZWxlbWVudC5pZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5pZCA9ICdfX3NvcnRhYmxlLScgKyB0aGlzLm9wdGlvbnMubmFtZSArICctJyArIFNvcnRhYmxlLnRyYWNrZXJbdGhpcy5vcHRpb25zLm5hbWVdLmNvdW50ZXJcclxuICAgICAgICAgICAgICAgIFNvcnRhYmxlLnRyYWNrZXJbdGhpcy5vcHRpb25zLm5hbWVdLmNvdW50ZXIrK1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY29weSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmNvcHkgPSAwXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdkcmFnc3RhcnQnLCBlbGVtZW50Ll9fc29ydGFibGUuZHJhZ1N0YXJ0KVxyXG4gICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnZHJhZ2dhYmxlJywgdHJ1ZSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZW1vdmVzIGFsbCBldmVudHMgZnJvbSBhbiBIVE1MIGVsZW1lbnRcclxuICAgICAqIE5PVEU6IGRvZXMgbm90IHJlbW92ZSB0aGUgZWxlbWVudCBmcm9tIGl0cyBwYXJlbnRcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqL1xyXG4gICAgcmVtb3ZlRWxlbWVudChlbGVtZW50KVxyXG4gICAge1xyXG4gICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZWxlbWVudC5kcmFnU3RhcnQpXHJcbiAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgZWxlbWVudC5kcmFnU3RhcnQpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhZGQgc29ydGFibGUgdG8gZ2xvYmFsIGxpc3QgdGhhdCB0cmFja3MgYWxsIHNvcnRhYmxlc1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2FkZFRvR2xvYmFsVHJhY2tlcigpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKCFTb3J0YWJsZS50cmFja2VyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgU29ydGFibGUuZHJhZ0ltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgICAgICAgICAgU29ydGFibGUuZHJhZ0ltYWdlLmlkID0gJ3NvcnRhYmxlLWRyYWdJbWFnZSdcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChTb3J0YWJsZS5kcmFnSW1hZ2UpXHJcbiAgICAgICAgICAgIFNvcnRhYmxlLnRyYWNrZXIgPSB7fVxyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgKGUpID0+IHRoaXMuX2JvZHlEcmFnT3ZlcihlKSlcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywgKGUpID0+IHRoaXMuX2JvZHlEcm9wKGUpKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoU29ydGFibGUudHJhY2tlclt0aGlzLm9wdGlvbnMubmFtZV0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBTb3J0YWJsZS50cmFja2VyW3RoaXMub3B0aW9ucy5uYW1lXS5saXN0LnB1c2godGhpcylcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgU29ydGFibGUudHJhY2tlclt0aGlzLm9wdGlvbnMubmFtZV0gPSB7IGxpc3Q6IFt0aGlzXSwgY291bnRlcjogMCB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZGVmYXVsdCBkcmFnIG92ZXIgZm9yIHRoZSBib2R5XHJcbiAgICAgKiBAcGFyYW0ge0RyYWdFdmVudH0gZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2JvZHlEcmFnT3ZlcihlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IG5hbWUgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1swXVxyXG4gICAgICAgIGlmIChuYW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1sxXVxyXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXHJcbiAgICAgICAgICAgIGNvbnN0IHNvcnRhYmxlID0gdGhpcy5fZmluZENsb3Nlc3QoZSwgU29ydGFibGUudHJhY2tlcltuYW1lXS5saXN0LCBlbGVtZW50KVxyXG4gICAgICAgICAgICBpZiAoc29ydGFibGUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3BsYWNlSW5MaXN0KHNvcnRhYmxlLCBlLnBhZ2VYLCBlLnBhZ2VZLCBlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgZS5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9ICdtb3ZlJ1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlRHJhZ2dpbmcoZSwgZWxlbWVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX25vRHJvcChlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSBubyBkcm9wXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NhbmNlbF0gZm9yY2UgY2FuY2VsIChmb3Igb3B0aW9ucy5jb3B5KVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX25vRHJvcChlLCBjYW5jZWwpXHJcbiAgICB7XHJcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9ICdtb3ZlJ1xyXG4gICAgICAgIGNvbnN0IGlkID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMV1cclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXHJcbiAgICAgICAgaWYgKGVsZW1lbnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLl91cGRhdGVEcmFnZ2luZyhlLCBlbGVtZW50KVxyXG4gICAgICAgICAgICB0aGlzLl9zZXRJY29uKGVsZW1lbnQsIG51bGwsIGNhbmNlbClcclxuICAgICAgICAgICAgaWYgKCFjYW5jZWwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwub3B0aW9ucy5vZmZMaXN0ID09PSAnZGVsZXRlJylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkgPSBlbGVtZW50LnN0eWxlLmRpc3BsYXkgfHwgJ3Vuc2V0J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsLmVtaXQoJ2RlbGV0ZS1wZW5kaW5nJywgZWxlbWVudCwgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZXBsYWNlSW5MaXN0KGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCwgZWxlbWVudClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGRlZmF1bHQgZHJvcCBmb3IgdGhlIGJvZHlcclxuICAgICAqIEBwYXJhbSB7RHJhZ0V2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfYm9keURyb3AoZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBuYW1lID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMF1cclxuICAgICAgICBpZiAobmFtZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMV1cclxuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxyXG4gICAgICAgICAgICBjb25zdCBzb3J0YWJsZSA9IHRoaXMuX2ZpbmRDbG9zZXN0KGUsIFNvcnRhYmxlLnRyYWNrZXJbbmFtZV0ubGlzdCwgZWxlbWVudClcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlbW92ZURyYWdnaW5nKGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmUoKVxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkgPSBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsLmVtaXQoJ2RlbGV0ZScsIGVsZW1lbnQsIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbClcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgPSBudWxsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzdGFydCBkcmFnXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kcmFnU3RhcnQoZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBzb3J0YWJsZSA9IGUuY3VycmVudFRhcmdldC5fX3NvcnRhYmxlLm9yaWdpbmFsXHJcbiAgICAgICAgY29uc3QgZHJhZ2dpbmcgPSBlLmN1cnJlbnRUYXJnZXQuY2xvbmVOb2RlKHRydWUpXHJcbiAgICAgICAgZm9yIChsZXQgc3R5bGUgaW4gc29ydGFibGUub3B0aW9ucy5kcmFnU3R5bGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5zdHlsZVtzdHlsZV0gPSBzb3J0YWJsZS5vcHRpb25zLmRyYWdTdHlsZVtzdHlsZV1cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcG9zID0gdXRpbHMudG9HbG9iYWwoZS5jdXJyZW50VGFyZ2V0KVxyXG4gICAgICAgIGRyYWdnaW5nLnN0eWxlLmxlZnQgPSBwb3MueCArICdweCdcclxuICAgICAgICBkcmFnZ2luZy5zdHlsZS50b3AgPSBwb3MueSArICdweCdcclxuICAgICAgICBjb25zdCBvZmZzZXQgPSB7IHg6IHBvcy54IC0gZS5wYWdlWCwgeTogcG9zLnkgLSBlLnBhZ2VZIH1cclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRyYWdnaW5nKVxyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLnVzZUljb25zKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKVxyXG4gICAgICAgICAgICBpbWFnZS5zcmMgPSBzb3J0YWJsZS5vcHRpb25zLmljb25zLnJlb3JkZXJcclxuICAgICAgICAgICAgaW1hZ2Uuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoLTUwJSwgLTUwJSknXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLmxlZnQgPSBkcmFnZ2luZy5vZmZzZXRMZWZ0ICsgZHJhZ2dpbmcub2Zmc2V0V2lkdGggKyAncHgnXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLnRvcCA9IGRyYWdnaW5nLm9mZnNldFRvcCArIGRyYWdnaW5nLm9mZnNldEhlaWdodCArICdweCdcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpbWFnZSlcclxuICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbiA9IGltYWdlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLmN1cnNvckhvdmVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdXRpbHMuc3R5bGUoZS5jdXJyZW50VGFyZ2V0LCAnY3Vyc29yJywgc29ydGFibGUub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHRhcmdldCA9IGUuY3VycmVudFRhcmdldFxyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLmNvcHkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0YXJnZXQgPSBlLmN1cnJlbnRUYXJnZXQuY2xvbmVOb2RlKHRydWUpXHJcbiAgICAgICAgICAgIHRhcmdldC5pZCA9IGUuY3VycmVudFRhcmdldC5pZCArICctY29weS0nICsgZS5jdXJyZW50VGFyZ2V0Ll9fc29ydGFibGUuY29weVxyXG4gICAgICAgICAgICBlLmN1cnJlbnRUYXJnZXQuX19zb3J0YWJsZS5jb3B5KytcclxuICAgICAgICAgICAgc29ydGFibGUuYXR0YWNoRWxlbWVudCh0YXJnZXQpXHJcbiAgICAgICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLmlzQ29weSA9IHRydWVcclxuICAgICAgICAgICAgdGFyZ2V0Ll9fc29ydGFibGUub3JpZ2luYWwgPSB0aGlzXHJcbiAgICAgICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLmRpc3BsYXkgPSB0YXJnZXQuc3R5bGUuZGlzcGxheSB8fCAndW5zZXQnXHJcbiAgICAgICAgICAgIHRhcmdldC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGFyZ2V0KVxyXG4gICAgICAgIH1cclxuICAgICAgICBlLmRhdGFUcmFuc2Zlci5jbGVhckRhdGEoKVxyXG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLnNldERhdGEoc29ydGFibGUub3B0aW9ucy5uYW1lLCBzb3J0YWJsZS5vcHRpb25zLm5hbWUpXHJcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuc2V0RGF0YSh0YXJnZXQuaWQsIHRhcmdldC5pZClcclxuICAgICAgICBlLmRhdGFUcmFuc2Zlci5zZXREcmFnSW1hZ2UoU29ydGFibGUuZHJhZ0ltYWdlLCAwLCAwKVxyXG4gICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLmN1cnJlbnQgPSB0aGlzXHJcbiAgICAgICAgdGFyZ2V0Ll9fc29ydGFibGUuaW5kZXggPSBzb3J0YWJsZS5vcHRpb25zLmNvcHkgPyAtMSA6IHNvcnRhYmxlLl9nZXRJbmRleCh0YXJnZXQpXHJcbiAgICAgICAgdGFyZ2V0Ll9fc29ydGFibGUuZHJhZ2dpbmcgPSBkcmFnZ2luZ1xyXG4gICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLm9mZnNldCA9IG9mZnNldFxyXG4gICAgfVxyXG5cclxuICAgIF9kcmFnT3ZlcihlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHNvcnRhYmxlID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMF1cclxuICAgICAgICBpZiAoc29ydGFibGUgJiYgc29ydGFibGUgPT09IHRoaXMub3B0aW9ucy5uYW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1sxXVxyXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUuaXNDb3B5ICYmIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9PT0gdGhpcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbm9Ecm9wKGUsIHRydWUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5vcHRpb25zLmRyb3AgfHwgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsID09PSB0aGlzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wbGFjZUluTGlzdCh0aGlzLCBlLnBhZ2VYLCBlLnBhZ2VZLCBlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgZS5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9IGVsZW1lbnQuX19zb3J0YWJsZS5pc0NvcHkgPyAnY29weScgOiAnbW92ZSdcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZURyYWdnaW5nKGUsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9ub0Ryb3AoZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfdXBkYXRlRHJhZ2dpbmcoZSwgZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBkcmFnZ2luZyA9IGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnZ2luZ1xyXG4gICAgICAgIGNvbnN0IG9mZnNldCA9IGVsZW1lbnQuX19zb3J0YWJsZS5vZmZzZXRcclxuICAgICAgICBpZiAoZHJhZ2dpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5zdHlsZS5sZWZ0ID0gZS5wYWdlWCArIG9mZnNldC54ICsgJ3B4J1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5zdHlsZS50b3AgPSBlLnBhZ2VZICsgb2Zmc2V0LnkgKyAncHgnXHJcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZy5pY29uKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnN0eWxlLmxlZnQgPSBkcmFnZ2luZy5vZmZzZXRMZWZ0ICsgZHJhZ2dpbmcub2Zmc2V0V2lkdGggKyAncHgnXHJcbiAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnN0eWxlLnRvcCA9IGRyYWdnaW5nLm9mZnNldFRvcCArIGRyYWdnaW5nLm9mZnNldEhlaWdodCArICdweCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfcmVtb3ZlRHJhZ2dpbmcoZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBkcmFnZ2luZyA9IGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnZ2luZ1xyXG4gICAgICAgIGRyYWdnaW5nLnJlbW92ZSgpXHJcbiAgICAgICAgaWYgKGRyYWdnaW5nLmljb24pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5pY29uLnJlbW92ZSgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnZ2luZyA9IG51bGxcclxuICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuaXNDb3B5ID0gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBfZHJvcChlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IG5hbWUgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1swXVxyXG4gICAgICAgIGlmIChuYW1lICYmIG5hbWUgPT09IHRoaXMub3B0aW9ucy5uYW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1sxXVxyXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgIT09IHRoaXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbC5lbWl0KCdyZW1vdmUnLCBlbGVtZW50LCBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2FkZCcsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgPSB0aGlzXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNvcnQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdvcmRlcicsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ3VwZGF0ZScsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLmluZGV4ICE9PSB0aGlzLl9nZXRJbmRleChlLmN1cnJlbnRUYXJnZXQpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgnb3JkZXInLCBlbGVtZW50LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgndXBkYXRlJywgZWxlbWVudCwgdGhpcylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVEcmFnZ2luZyhlbGVtZW50KVxyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGZpbmQgY2xvc2VzdCBTb3J0YWJsZSB0byBzY3JlZW4gbG9jYXRpb25cclxuICAgICAqIEBwYXJhbSB7VUlFdmVudH0gZVxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZVtdfSBsaXN0IG9mIHJlbGF0ZWQgU29ydGFibGVzXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZmluZENsb3Nlc3QoZSwgbGlzdCwgZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBsZXQgbWluID0gSW5maW5pdHksIGZvdW5kXHJcbiAgICAgICAgZm9yIChsZXQgcmVsYXRlZCBvZiBsaXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCghcmVsYXRlZC5vcHRpb25zLmRyb3AgJiYgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsICE9PSByZWxhdGVkKSB8fFxyXG4gICAgICAgICAgICAgICAgKGVsZW1lbnQuX19zb3J0YWJsZS5pc0NvcHkgJiYgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsID09PSByZWxhdGVkKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29udGludWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodXRpbHMuaW5zaWRlKGUucGFnZVgsIGUucGFnZVksIHJlbGF0ZWQuZWxlbWVudCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZWxhdGVkXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAocmVsYXRlZC5vcHRpb25zLm9mZkxpc3QgPT09ICdjbG9zZXN0JylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2FsY3VsYXRlID0gdXRpbHMuZGlzdGFuY2VUb0Nsb3Nlc3RDb3JuZXIoZS5wYWdlWCwgZS5wYWdlWSwgcmVsYXRlZC5lbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgaWYgKGNhbGN1bGF0ZSA8IG1pbilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtaW4gPSBjYWxjdWxhdGVcclxuICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHJlbGF0ZWRcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZm91bmRcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBsYWNlIGluZGljYXRvciBpbiB0aGUgc29ydGFibGUgbGlzdCBhY2NvcmRpbmcgdG8gb3B0aW9ucy5zb3J0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGxhY2VJbkxpc3Qoc29ydGFibGUsIHgsIHksIGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkgPT09ICd1bnNldCcgPyAnJyA6IGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5XHJcbiAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5ID0gbnVsbFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zb3J0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fcGxhY2VJblNvcnRhYmxlTGlzdChzb3J0YWJsZSwgeCwgeSwgZWxlbWVudClcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fcGxhY2VJbk9yZGVyZWRMaXN0KHNvcnRhYmxlLCBlbGVtZW50KVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9zZXRJY29uKGVsZW1lbnQsIHNvcnRhYmxlKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVwbGFjZSBpdGVtIGluIGxpc3QgYXQgb3JpZ2luYWwgaW5kZXggcG9zaXRpb25cclxuICAgICAqL1xyXG4gICAgX3JlcGxhY2VJbkxpc3Qoc29ydGFibGUsIGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IGVsZW1lbnQuX19zb3J0YWJsZS5pbmRleFxyXG4gICAgICAgICAgICBpZiAoaW5kZXggPCBjaGlsZHJlbi5sZW5ndGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkcmVuW2luZGV4XS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShlbGVtZW50LCBjaGlsZHJlbltpbmRleF0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlblswXS5hcHBlbmRDaGlsZChlbGVtZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZWxlbWVudClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgX2dldEluZGV4KGNoaWxkKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoY2hpbGRyZW5baV0gPT09IGNoaWxkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIF90cmF2ZXJzZUNoaWxkcmVuKGJhc2UsIHNlYXJjaCwgcmVzdWx0cylcclxuICAgIHtcclxuICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBiYXNlLmNoaWxkcmVuKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHNlYXJjaC5sZW5ndGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzZWFyY2guaW5kZXhPZihjaGlsZC5jbGFzc05hbWUpICE9PSAtMSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goY2hpbGQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goY2hpbGQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fdHJhdmVyc2VDaGlsZHJlbihjaGlsZCwgc2VhcmNoLCByZXN1bHRzKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGZpbmQgY2hpbGRyZW4gaW4gZGl2XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3JkZXJdIHNlYXJjaCBmb3IgZHJhZ09yZGVyIGFzIHdlbGxcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9nZXRDaGlsZHJlbihvcmRlcilcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBTZWFyY2gpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgc2VhcmNoID0gW11cclxuICAgICAgICAgICAgaWYgKG9yZGVyICYmIHRoaXMub3B0aW9ucy5vcmRlckNsYXNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2gucHVzaCh0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKG9yZGVyICYmIHRoaXMub3B0aW9ucy5vcmRlckNsYXNzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaC5wdXNoKHRoaXMub3B0aW9ucy5vcmRlckNsYXNzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKCFvcmRlciAmJiB0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzZWFyY2gucHVzaCh0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXVxyXG4gICAgICAgICAgICB0aGlzLl90cmF2ZXJzZUNoaWxkcmVuKHRoaXMuZWxlbWVudCwgc2VhcmNoLCByZXN1bHRzKVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0c1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGV0IGxpc3QgPSBbXVxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5lbGVtZW50LmNoaWxkcmVuKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh1dGlscy5jb250YWluc0NsYXNzTmFtZShjaGlsZCwgdGhpcy5vcHRpb25zLmRyYWdDbGFzcykgfHwgKG9yZGVyICYmICF0aGlzLm9wdGlvbnMub3JkZXJDbGFzcyB8fCAob3JkZXIgJiYgdGhpcy5vcHRpb25zLm9yZGVyQ2xhc3MgJiYgdXRpbHMuY29udGFpbnNDbGFzc05hbWUoY2hpbGQsIHRoaXMub3B0aW9ucy5vcmRlckNsYXNzKSkpKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGlzdC5wdXNoKGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBsaXN0XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50LmNoaWxkcmVuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwbGFjZSBpbmRpY2F0b3IgaW4gYW4gb3JkZXJlZCBsaXN0XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmdcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9wbGFjZUluT3JkZXJlZExpc3Qoc29ydGFibGUsIGRyYWdnaW5nKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgIT09IHNvcnRhYmxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSBzb3J0YWJsZS5vcHRpb25zLm9yZGVySWRcclxuICAgICAgICAgICAgbGV0IGRyYWdPcmRlciA9IGRyYWdnaW5nLmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICAgICAgZHJhZ09yZGVyID0gc29ydGFibGUub3B0aW9ucy5vcmRlcklkSXNOdW1iZXIgPyBwYXJzZUZsb2F0KGRyYWdPcmRlcikgOiBkcmFnT3JkZXJcclxuICAgICAgICAgICAgbGV0IGZvdW5kXHJcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gc29ydGFibGUuX2dldENoaWxkcmVuKHRydWUpXHJcbiAgICAgICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLnJldmVyc2VPcmRlcilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IGNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gY2hpbGRyZW5baV1cclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGREcmFnT3JkZXIgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGREcmFnT3JkZXIgPSBzb3J0YWJsZS5vcHRpb25zLm9yZGVySXNOdW1iZXIgPyBwYXJzZUZsb2F0KGNoaWxkRHJhZ09yZGVyKSA6IGNoaWxkRHJhZ09yZGVyXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdPcmRlciA+IGNoaWxkRHJhZ09yZGVyKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZHJhZ2dpbmcsIGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBjaGlsZHJlbilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGREcmFnT3JkZXIgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGREcmFnT3JkZXIgPSBzb3J0YWJsZS5vcHRpb25zLm9yZGVySXNOdW1iZXIgPyBwYXJzZUZsb2F0KGNoaWxkRHJhZ09yZGVyKSA6IGNoaWxkRHJhZ09yZGVyXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdPcmRlciA8IGNoaWxkRHJhZ09yZGVyKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZHJhZ2dpbmcsIGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFmb3VuZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc29ydGFibGUuZWxlbWVudC5hcHBlbmRDaGlsZChkcmFnZ2luZylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQuZW1pdCgncmVtb3ZlLXBlbmRpbmcnLCBkcmFnZ2luZywgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdhZGQtcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50ID0gc29ydGFibGVcclxuICAgICAgICAgICAgc29ydGFibGUuZW1pdCgndXBkYXRlLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGxhY2UgaW5kaWNhdG9yIGluIGFuIHNvcnRhYmxlIGxpc3RcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmdcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9wbGFjZUluU29ydGFibGVMaXN0KHNvcnRhYmxlLCB4LCB5LCBkcmFnZ2luZylcclxuICAgIHtcclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gc29ydGFibGUuZWxlbWVudFxyXG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gc29ydGFibGUuX2dldENoaWxkcmVuKClcclxuICAgICAgICBpZiAoIWNoaWxkcmVuLmxlbmd0aClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgIT09IHNvcnRhYmxlKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQuZW1pdCgncmVtb3ZlLXBlbmRpbmcnLCBkcmFnZ2luZywgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICAgICAgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50ID0gc29ydGFibGVcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ2FkZC1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoZHJhZ2dpbmcpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBkaXN0YW5jZSA9IEluZmluaXR5LCBjbG9zZXN0LCBpc0JlZm9yZSwgaW5kaWNhdG9yXHJcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnRzID0gc29ydGFibGUuX2dldENoaWxkcmVuKHRydWUpXHJcbiAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGVsZW1lbnRzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGQgPT09IGRyYWdnaW5nKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGluZGljYXRvciA9IHRydWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh1dGlscy5pbnNpZGUoeCwgeSwgY2hpbGQpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZCA9PT0gZHJhZ2dpbmcpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY2xvc2VzdCA9IGNoaWxkXHJcbiAgICAgICAgICAgICAgICAgICAgaXNCZWZvcmUgPSBpbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1lYXN1cmUgPSB1dGlscy5kaXN0YW5jZVRvQ2xvc2VzdENvcm5lcih4LCB5LCBjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICBpZiAobWVhc3VyZSA8IGRpc3RhbmNlKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VzdCA9IGNoaWxkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3RhbmNlID0gbWVhc3VyZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpc0JlZm9yZSA9IGluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY2xvc2VzdClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNsb3Nlc3QgPT09IGRyYWdnaW5nKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGlzQmVmb3JlKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKGRyYWdnaW5nLCBjbG9zZXN0Lm5leHRTaWJsaW5nKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKGRyYWdnaW5nLCBjbG9zZXN0KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnb3JkZXItcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50ICE9PSBzb3J0YWJsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ2FkZC1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQuZW1pdCgncmVtb3ZlLXBlbmRpbmcnLCBkcmFnZ2luZywgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgPSBzb3J0YWJsZVxyXG4gICAgICAgIH1cclxuICAgICAgICBzb3J0YWJsZS5lbWl0KCd1cGRhdGUtcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNldCBpY29uIGlmIGF2YWlsYWJsZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmdcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjYW5jZWxdIGZvcmNlIGNhbmNlbCAoZm9yIG9wdGlvbnMuY29weSlcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9zZXRJY29uKGVsZW1lbnQsIHNvcnRhYmxlLCBjYW5jZWwpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgZHJhZ2dpbmcgPSBlbGVtZW50Ll9fc29ydGFibGUuZHJhZ2dpbmdcclxuICAgICAgICBpZiAoZHJhZ2dpbmcgJiYgZHJhZ2dpbmcuaWNvbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICghc29ydGFibGUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlID0gZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsXHJcbiAgICAgICAgICAgICAgICBpZiAoY2FuY2VsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnaW5nLmljb24uc3JjID0gc29ydGFibGUub3B0aW9ucy5pY29ucy5jYW5jZWxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnNyYyA9IHNvcnRhYmxlLm9wdGlvbnMub2ZmTGlzdCA9PT0gJ2RlbGV0ZScgPyBzb3J0YWJsZS5vcHRpb25zLmljb25zLmRlbGV0ZSA6IHNvcnRhYmxlLm9wdGlvbnMuaWNvbnMuY2FuY2VsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLmlzQ29weSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnNyYyA9IHNvcnRhYmxlLm9wdGlvbnMuaWNvbnMuY29weVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnaW5nLmljb24uc3JjID0gZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsID09PSBzb3J0YWJsZSA/IHNvcnRhYmxlLm9wdGlvbnMuaWNvbnMucmVvcmRlciA6IHNvcnRhYmxlLm9wdGlvbnMuaWNvbnMubW92ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIHBpY2tlZCB1cCBiZWNhdXNlIGl0IHdhcyBtb3ZlZCBiZXlvbmQgdGhlIG9wdGlvbnMudGhyZXNob2xkXHJcbiAqIEBldmVudCBTb3J0YWJsZSNwaWNrdXBcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBzb3J0YWJsZSBpcyByZW9yZGVyZWRcclxuICogQGV2ZW50IFNvcnRhYmxlI29yZGVyXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgdGhhdCB3YXMgcmVvcmRlcmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIHBsYWNlZFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgYWRkZWQgdG8gdGhpcyBzb3J0YWJsZVxyXG4gKiBAZXZlbnQgU29ydGFibGUjYWRkXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgYWRkZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgYWRkZWRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIHJlbW92ZWQgZnJvbSB0aGlzIHNvcnRhYmxlXHJcbiAqIEBldmVudCBTb3J0YWJsZSNyZW1vdmVcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCByZW1vdmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIHJlbW92ZWRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIHJlbW92ZWQgZnJvbSBhbGwgc29ydGFibGVzXHJcbiAqIEBldmVudCBTb3J0YWJsZSNkZWxldGVcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCByZW1vdmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIGRyYWdnZWQgZnJvbVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIHRoZSBzb3J0YWJsZSBpcyB1cGRhdGVkIHdpdGggYW4gYWRkLCByZW1vdmUsIG9yIG9yZGVyIGNoYW5nZVxyXG4gKiBAZXZlbnQgU29ydGFibGUjdXBkYXRlXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgY2hhbmdlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aXRoIGVsZW1lbnRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBvcmRlciB3YXMgY2hhbmdlZCBidXQgZWxlbWVudCB3YXMgbm90IGRyb3BwZWQgeWV0XHJcbiAqIEBldmVudCBTb3J0YWJsZSNvcmRlci1wZW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgYmVpbmcgZHJhZ2dlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBjdXJyZW50IHNvcnRhYmxlIHdpdGggZWxlbWVudCBwbGFjZWhvbGRlclxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGVsZW1lbnQgaXMgYWRkZWQgYnV0IG5vdCBkcm9wcGVkIHlldFxyXG4gKiBAZXZlbnQgU29ydGFibGUjYWRkLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gZWxlbWVudCBpcyByZW1vdmVkIGJ1dCBub3QgZHJvcHBlZCB5ZXRcclxuICogQGV2ZW50IFNvcnRhYmxlI3JlbW92ZS1wZW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgYmVpbmcgZHJhZ2dlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBjdXJyZW50IHNvcnRhYmxlIHdpdGggZWxlbWVudCBwbGFjZWhvbGRlclxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgYWJvdXQgdG8gYmUgcmVtb3ZlZCBmcm9tIGFsbCBzb3J0YWJsZXNcclxuICogQGV2ZW50IFNvcnRhYmxlI2RlbGV0ZS1wZW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgcmVtb3ZlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyBkcmFnZ2VkIGZyb21cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIGFkZGVkLCByZW1vdmVkLCBvciByZW9yZGVyIGJ1dCBlbGVtZW50IGhhcyBub3QgZHJvcHBlZCB5ZXRcclxuICogQGV2ZW50IFNvcnRhYmxlI3VwZGF0ZS1wZW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgYmVpbmcgZHJhZ2dlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBjdXJyZW50IHNvcnRhYmxlIHdpdGggZWxlbWVudCBwbGFjZWhvbGRlclxyXG4gKi8iXX0=