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

        /**
         * update the dragging element
         * @param {UIEvent} e
         * @param {HTMLElement} element
         * @private
         */

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

        /**
         * remove the dragging element
         * @param {HTMLElement} element
         * @private
         */

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

        /**
         * drop the element into a sortable
         * @param {HTMLElement} e
         * @private
         */

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

        /**
         * count the index of the child in the list of children
         * @param {HTMLElement} child
         * @return {number}
         * @private
         */

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

        /**
         * traverse and search descendents in DOM
         * @param {HTMLElement} base
         * @param {string} search
         * @param {HTMLElement[]} results to return
         * @private
         */

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
         * @private
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
         * @private
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
         * @private
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
         * @private
         */

    }, {
        key: '_maximum',
        value: function _maximum(element, sortable) {
            if (sortable.options.maximum) {
                var children = sortable._getChildren();
                if (children.length > sortable.options.maximum) {
                    if (sortable.removePending) {
                        while (sortable.removePending.length) {
                            var child = sortable.removePending.pop();
                            child.style.display = child.__sortable.display === 'unset' ? '' : child.__sortable.display;
                            child.__sortable.display = null;
                            child.remove();
                            sortable.emit('maximum-remove', child, sortable);
                        }
                        sortable.removePending = null;
                    }
                }
                this._maximumCounter(element, sortable);
            }
        }

        /**
         * clear pending list
         * @param {Sortable} sortable
         * @private
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

        /**
         * change cursor during mousedown
         * @param {MouseEvent} e
         * @private
         */

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3J0YWJsZS5qcyJdLCJuYW1lcyI6WyJFdmVudHMiLCJyZXF1aXJlIiwiZGVmYXVsdHMiLCJ1dGlscyIsIlNvcnRhYmxlIiwiZWxlbWVudCIsIm9wdGlvbnMiLCJfYWRkVG9HbG9iYWxUcmFja2VyIiwiZWxlbWVudHMiLCJfZ2V0Q2hpbGRyZW4iLCJjaGlsZCIsImRyYWdDbGFzcyIsImNvbnRhaW5zQ2xhc3NOYW1lIiwiYXR0YWNoRWxlbWVudCIsImV2ZW50cyIsImRyYWdPdmVyIiwiZSIsIl9kcmFnT3ZlciIsImRyb3AiLCJfZHJvcCIsImRyYWdMZWF2ZSIsIl9kcmFnTGVhdmUiLCJtb3VzZU92ZXIiLCJfbW91c2VFbnRlciIsImFkZEV2ZW50TGlzdGVuZXIiLCJjdXJzb3JIb3ZlciIsInN0eWxlIiwiY3Vyc29yRG93biIsIl9tb3VzZURvd24iLCJyZW1vdmVFdmVudExpc3RlbmVyIiwicmVtb3ZlRWxlbWVudCIsImluZGV4Iiwic29ydCIsImNoaWxkcmVuIiwibGVuZ3RoIiwiYXBwZW5kQ2hpbGQiLCJpbnNlcnRCZWZvcmUiLCJpZCIsIm9yZGVySWQiLCJkcmFnT3JkZXIiLCJnZXRBdHRyaWJ1dGUiLCJvcmRlcklkSXNOdW1iZXIiLCJwYXJzZUZsb2F0IiwiZm91bmQiLCJyZXZlcnNlT3JkZXIiLCJpIiwiY2hpbGREcmFnT3JkZXIiLCJvcmRlcklzTnVtYmVyIiwicGFyZW50Tm9kZSIsIl9fc29ydGFibGUiLCJvcmlnaW5hbCIsInNvcnRhYmxlIiwiZHJhZ1N0YXJ0IiwiX2RyYWdTdGFydCIsIl9tYXhpbXVtQ291bnRlciIsIm5hbWUiLCJ0cmFja2VyIiwiY291bnRlciIsImNvcHkiLCJzZXRBdHRyaWJ1dGUiLCJkcmFnTW92ZSIsImRyYWdJbWFnZSIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImJvZHkiLCJfYm9keURyYWdPdmVyIiwiX2JvZHlEcm9wIiwibGlzdCIsInB1c2giLCJkYXRhVHJhbnNmZXIiLCJ0eXBlcyIsImdldEVsZW1lbnRCeUlkIiwiX2ZpbmRDbG9zZXN0IiwibGFzdCIsIk1hdGgiLCJhYnMiLCJ4IiwicGFnZVgiLCJ0aHJlc2hvbGQiLCJ5IiwicGFnZVkiLCJfdXBkYXRlRHJhZ2dpbmciLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsIl9wbGFjZUluTGlzdCIsImRyb3BFZmZlY3QiLCJfbm9Ecm9wIiwiY2FuY2VsIiwiX3NldEljb24iLCJvZmZMaXN0IiwiZGlzcGxheSIsImVtaXQiLCJfcmVwbGFjZUluTGlzdCIsImN1cnJlbnQiLCJfY2xlYXJNYXhpbXVtUGVuZGluZyIsIl9yZW1vdmVEcmFnZ2luZyIsInJlbW92ZSIsImN1cnJlbnRUYXJnZXQiLCJkcmFnZ2luZyIsImNsb25lTm9kZSIsImRyYWdTdHlsZSIsInBvcyIsInRvR2xvYmFsIiwibGVmdCIsInRvcCIsIm9mZnNldCIsInVzZUljb25zIiwiaW1hZ2UiLCJJbWFnZSIsInNyYyIsImljb25zIiwicmVvcmRlciIsInBvc2l0aW9uIiwidHJhbnNmb3JtIiwib2Zmc2V0TGVmdCIsIm9mZnNldFdpZHRoIiwib2Zmc2V0VG9wIiwib2Zmc2V0SGVpZ2h0IiwiaWNvbiIsInRhcmdldCIsImlzQ29weSIsImNsZWFyRGF0YSIsInNldERhdGEiLCJzZXREcmFnSW1hZ2UiLCJfZ2V0SW5kZXgiLCJfbWF4aW11bSIsIm1pbiIsIkluZmluaXR5IiwicmVsYXRlZCIsImluc2lkZSIsImNhbGN1bGF0ZSIsImRpc3RhbmNlVG9DbG9zZXN0Q29ybmVyIiwiX3BsYWNlSW5Tb3J0YWJsZUxpc3QiLCJfcGxhY2VJbk9yZGVyZWRMaXN0IiwiYmFzZSIsInNlYXJjaCIsInJlc3VsdHMiLCJpbmRleE9mIiwiY2xhc3NOYW1lIiwiX3RyYXZlcnNlQ2hpbGRyZW4iLCJvcmRlciIsImRlZXBTZWFyY2giLCJvcmRlckNsYXNzIiwiX21heGltdW1QZW5kaW5nIiwiY3Vyc29yIiwieGExIiwieWExIiwieGEyIiwieWEyIiwibGFyZ2VzdCIsImNsb3Nlc3QiLCJpc0JlZm9yZSIsImluZGljYXRvciIsInhiMSIsInliMSIsInhiMiIsInliMiIsInBlcmNlbnRhZ2UiLCJuZXh0U2libGluZyIsImRpc3RhbmNlIiwibWVhc3VyZSIsIl9wbGFjZUJ5RGlzdGFuY2UiLCJkZWxldGUiLCJtb3ZlIiwiY291bnQiLCJtYXhpbXVtIiwicmVtb3ZlUGVuZGluZyIsInBvcCIsInNhdmVQZW5kaW5nIiwic2xpY2UiLCJtYXhpbXVtRklGTyIsImEiLCJiIiwiaGlkZSIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxTQUFTQyxRQUFRLGVBQVIsQ0FBZjs7QUFFQSxJQUFNQyxXQUFXRCxRQUFRLFlBQVIsQ0FBakI7QUFDQSxJQUFNRSxRQUFRRixRQUFRLFNBQVIsQ0FBZDs7SUFFTUcsUTs7O0FBRUY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUEyQ0Esc0JBQVlDLE9BQVosRUFBcUJDLE9BQXJCLEVBQ0E7QUFBQTs7QUFBQTs7QUFFSSxjQUFLQSxPQUFMLEdBQWVILE1BQU1HLE9BQU4sQ0FBY0EsT0FBZCxFQUF1QkosUUFBdkIsQ0FBZjtBQUNBLGNBQUtHLE9BQUwsR0FBZUEsT0FBZjtBQUNBLGNBQUtFLG1CQUFMO0FBQ0EsWUFBTUMsV0FBVyxNQUFLQyxZQUFMLEVBQWpCO0FBTEo7QUFBQTtBQUFBOztBQUFBO0FBTUksaUNBQWtCRCxRQUFsQiw4SEFDQTtBQUFBLG9CQURTRSxLQUNUOztBQUNJLG9CQUFJLENBQUMsTUFBS0osT0FBTCxDQUFhSyxTQUFkLElBQTJCUixNQUFNUyxpQkFBTixDQUF3QkYsS0FBeEIsRUFBK0IsTUFBS0osT0FBTCxDQUFhSyxTQUE1QyxDQUEvQixFQUNBO0FBQ0ksMEJBQUtFLGFBQUwsQ0FBbUJILEtBQW5CO0FBQ0g7QUFDSjtBQVpMO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBYUksY0FBS0ksTUFBTCxH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akIsRUFDQTtBQUNJdEIsc0JBQU11QixLQUFOLENBQVlWLEVBQUVpRixhQUFkLEVBQTZCLFFBQTdCLEVBQXVDLEtBQUszRixPQUFMLENBQWFxQixVQUFwRDtBQUNIO0FBQ0o7Ozs7O0FBLy9CRDs7Ozs7K0JBS2NuQixRLEVBQVVGLE8sRUFDeEI7QUFDSSxnQkFBTWtJLFVBQVUsRUFBaEI7QUFESjtBQUFBO0FBQUE7O0FBQUE7QUFFSSx1Q0FBb0JoSSxRQUFwQix3SUFDQTtBQUFBLHdCQURTSCxPQUNUOztBQUNJbUksNEJBQVFwRSxJQUFSLENBQWEsSUFBSWhFLFFBQUosQ0FBYUMsT0FBYixFQUFzQkMsT0FBdEIsQ0FBYjtBQUNIO0FBTEw7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFNSSxtQkFBT2tJLE9BQVA7QUFDSDs7OzRCQWpCRDtBQUNJLG1CQUFPdEksUUFBUDtBQUNIOzs7O0VBdkdrQkYsTTs7QUEybUN2Qjs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOEssT0FBT0MsT0FBUCxHQUFpQjNLLFFBQWpCIiwiZmlsZSI6InNvcnRhYmxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgRXZlbnRzID0gcmVxdWlyZSgnZXZlbnRlbWl0dGVyMycpXHJcblxyXG5jb25zdCBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vZGVmYXVsdHMnKVxyXG5jb25zdCB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxyXG5cclxuY2xhc3MgU29ydGFibGUgZXh0ZW5kcyBFdmVudHNcclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgc29ydGFibGUgbGlzdFxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLm5hbWU9c29ydGFibGVdIGRyYWdnaW5nIGlzIGFsbG93ZWQgYmV0d2VlbiBTb3J0YWJsZXMgd2l0aCB0aGUgc2FtZSBuYW1lXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuZHJhZ0NsYXNzXSBpZiBzZXQgdGhlbiBkcmFnIG9ubHkgaXRlbXMgd2l0aCB0aGlzIGNsYXNzTmFtZSB1bmRlciBlbGVtZW50OyBvdGhlcndpc2UgZHJhZyBhbGwgY2hpbGRyZW5cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5vcmRlckNsYXNzXSB1c2UgdGhpcyBjbGFzcyB0byBpbmNsdWRlIGVsZW1lbnRzIGluIG9yZGVyaW5nIGJ1dCBub3QgZHJhZ2dpbmc7IG90aGVyd2lzZSBhbGwgY2hpbGRyZW4gZWxlbWVudHMgYXJlIGluY2x1ZGVkIGluIHdoZW4gc29ydGluZyBhbmQgb3JkZXJpbmdcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuZGVlcFNlYXJjaF0gaWYgZHJhZ0NsYXNzIGFuZCBkZWVwU2VhcmNoIHRoZW4gc2VhcmNoIGFsbCBkZXNjZW5kZW50cyBvZiBlbGVtZW50IGZvciBkcmFnQ2xhc3NcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuc29ydD10cnVlXSBhbGxvdyBzb3J0aW5nIHdpdGhpbiBsaXN0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmRyb3A9dHJ1ZV0gYWxsb3cgZHJvcCBmcm9tIHJlbGF0ZWQgc29ydGFibGVzIChkb2Vzbid0IGltcGFjdCByZW9yZGVyaW5nIHRoaXMgc29ydGFibGUncyBjaGlsZHJlbiB1bnRpbCB0aGUgY2hpbGRyZW4gYXJlIG1vdmVkIHRvIGEgZGlmZmVyZW4gc29ydGFibGUpXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmNvcHk9ZmFsc2VdIGNyZWF0ZSBjb3B5IHdoZW4gZHJhZ2dpbmcgYW4gaXRlbSAodGhpcyBkaXNhYmxlcyBzb3J0PXRydWUgZm9yIHRoaXMgc29ydGFibGUpXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMub3JkZXJJZD1kYXRhLW9yZGVyXSBmb3Igb3JkZXJlZCBsaXN0cywgdXNlIHRoaXMgZGF0YSBpZCB0byBmaWd1cmUgb3V0IHNvcnQgb3JkZXJcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMub3JkZXJJZElzTnVtYmVyPXRydWVdIHVzZSBwYXJzZUludCBvbiBvcHRpb25zLnNvcnRJZCB0byBwcm9wZXJseSBzb3J0IG51bWJlcnNcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5yZXZlcnNlT3JkZXJdIHJldmVyc2Ugc29ydCB0aGUgb3JkZXJJZFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLm9mZkxpc3Q9Y2xvc2VzdF0gaG93IHRvIGhhbmRsZSB3aGVuIGFuIGVsZW1lbnQgaXMgZHJvcHBlZCBvdXRzaWRlIGEgc29ydGFibGU6IGNsb3Nlc3Q9ZHJvcCBpbiBjbG9zZXN0IHNvcnRhYmxlOyBjYW5jZWw9cmV0dXJuIHRvIHN0YXJ0aW5nIHNvcnRhYmxlOyBkZWxldGU9cmVtb3ZlIGZyb20gYWxsIHNvcnRhYmxlc1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1heGltdW1dIG1heGltdW0gbnVtYmVyIG9mIGVsZW1lbnRzIGFsbG93ZWQgaW4gYSBzb3J0YWJsZSBsaXN0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLm1heGltdW1GSUZPXSBkaXJlY3Rpb24gb2Ygc2VhcmNoIHRvIGNob29zZSB3aGljaCBpdGVtIHRvIHJlbW92ZSB3aGVuIG1heGltdW0gaXMgcmVhY2hlZFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmN1cnNvckhvdmVyPWdyYWIgLXdlYmtpdC1ncmFiIHBvaW50ZXJdIHVzZSB0aGlzIGN1cnNvciBsaXN0IHRvIHNldCBjdXJzb3Igd2hlbiBob3ZlcmluZyBvdmVyIGEgc29ydGFibGUgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmN1cnNvckRvd249Z3JhYmJpbmcgLXdlYmtpdC1ncmFiYmluZyBwb2ludGVyXSB1c2UgdGhpcyBjdXJzb3IgbGlzdCB0byBzZXQgY3Vyc29yIHdoZW4gbW91c2Vkb3duL3RvdWNoZG93biBvdmVyIGEgc29ydGFibGUgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy51c2VJY29ucz10cnVlXSBzaG93IGljb25zIHdoZW4gZHJhZ2dpbmdcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9ucy5pY29uc10gZGVmYXVsdCBzZXQgb2YgaWNvbnNcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5pY29ucy5yZW9yZGVyXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmljb25zLm1vdmVdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuaWNvbnMuY29weV1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5pY29ucy5kZWxldGVdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuY3VzdG9tSWNvbl0gc291cmNlIG9mIGN1c3RvbSBpbWFnZSB3aGVuIG92ZXIgdGhpcyBzb3J0YWJsZVxyXG4gICAgICogQGZpcmVzIHBpY2t1cFxyXG4gICAgICogQGZpcmVzIG9yZGVyXHJcbiAgICAgKiBAZmlyZXMgYWRkXHJcbiAgICAgKiBAZmlyZXMgcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgdXBkYXRlXHJcbiAgICAgKiBAZmlyZXMgZGVsZXRlXHJcbiAgICAgKiBAZmlyZXMgY29weVxyXG4gICAgICogQGZpcmVzIG1heGltdW0tcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgb3JkZXItcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIGFkZC1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgcmVtb3ZlLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyBhZGQtcmVtb3ZlLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyB1cGRhdGUtcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIGRlbGV0ZS1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgY29weS1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgbWF4aW11bS1yZW1vdmUtcGVuZGluZ1xyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyKClcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSB1dGlscy5vcHRpb25zKG9wdGlvbnMsIGRlZmF1bHRzKVxyXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnRcclxuICAgICAgICB0aGlzLl9hZGRUb0dsb2JhbFRyYWNrZXIoKVxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnRzID0gdGhpcy5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGVsZW1lbnRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzIHx8IHV0aWxzLmNvbnRhaW5zQ2xhc3NOYW1lKGNoaWxkLCB0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hdHRhY2hFbGVtZW50KGNoaWxkKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZXZlbnRzID0ge1xyXG4gICAgICAgICAgICBkcmFnT3ZlcjogKGUpID0+IHRoaXMuX2RyYWdPdmVyKGUpLFxyXG4gICAgICAgICAgICBkcm9wOiAoZSkgPT4gdGhpcy5fZHJvcChlKSxcclxuICAgICAgICAgICAgZHJhZ0xlYXZlOiAoZSkgPT4gdGhpcy5fZHJhZ0xlYXZlKGUpLFxyXG4gICAgICAgICAgICBtb3VzZU92ZXI6IChlKSA9PiB0aGlzLl9tb3VzZUVudGVyKGUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCB0aGlzLmV2ZW50cy5kcmFnT3ZlcilcclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLmV2ZW50cy5kcm9wKVxyXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ2xlYXZlJywgdGhpcy5ldmVudHMuZHJhZ0xlYXZlKVxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY3Vyc29ySG92ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiB0aGlzLl9nZXRDaGlsZHJlbigpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB1dGlscy5zdHlsZShjaGlsZCwgJ2N1cnNvcicsIHRoaXMub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY3Vyc29yRG93bilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCAoZSkgPT4gdGhpcy5fbW91c2VEb3duKGUpKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVtb3ZlcyBhbGwgZXZlbnQgaGFuZGxlcnMgZnJvbSB0aGlzLmVsZW1lbnQgYW5kIGNoaWxkcmVuXHJcbiAgICAgKi9cclxuICAgIGRlc3Ryb3koKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIHRoaXMuZXZlbnRzLmRyYWdPdmVyKVxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdkcm9wJywgdGhpcy5ldmVudHMuZHJvcClcclxuICAgICAgICBjb25zdCBlbGVtZW50cyA9IHRoaXMuX2dldENoaWxkcmVuKClcclxuICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBlbGVtZW50cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRWxlbWVudChjaGlsZClcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gdG9kbzogcmVtb3ZlIFNvcnRhYmxlLnRyYWNrZXIgYW5kIHJlbGF0ZWQgZXZlbnQgaGFuZGxlcnMgaWYgbm8gbW9yZSBzb3J0YWJsZXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHRoZSBnbG9iYWwgZGVmYXVsdHMgZm9yIG5ldyBTb3J0YWJsZSBvYmplY3RzXHJcbiAgICAgKiBAdHlwZSB7RGVmYXVsdE9wdGlvbnN9XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBnZXQgZGVmYXVsdHMoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBkZWZhdWx0c1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY3JlYXRlIG11bHRpcGxlIHNvcnRhYmxlIGVsZW1lbnRzXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50c1tdfSBlbGVtZW50c1xyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgLSBzZWUgY29uc3RydWN0b3IgZm9yIG9wdGlvbnNcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGNyZWF0ZShlbGVtZW50cywgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBjb25zdCByZXN1bHRzID0gW11cclxuICAgICAgICBmb3IgKGxldCBlbGVtZW50IG9mIGVsZW1lbnRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKG5ldyBTb3J0YWJsZShlbGVtZW50LCBvcHRpb25zKSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdHNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFkZCBhbiBlbGVtZW50IGFzIGEgY2hpbGQgb2YgdGhlIHNvcnRhYmxlIGVsZW1lbnQ7IGNhbiBhbHNvIGJlIHVzZWQgdG8gc3dhcCBiZXR3ZWVuIHNvcnRhYmxlc1xyXG4gICAgICogTk9URTogdGhpcyBtYXkgbm90IHdvcmsgd2l0aCBkZWVwU2VhcmNoIG5vbi1vcmRlcmVkIGVsZW1lbnRzOyB1c2UgYXR0YWNoRWxlbWVudCBpbnN0ZWFkXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXhcclxuICAgICAqL1xyXG4gICAgYWRkKGVsZW1lbnQsIGluZGV4KVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuYXR0YWNoRWxlbWVudChlbGVtZW50KVxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc29ydClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaW5kZXggPT09ICd1bmRlZmluZWQnIHx8IGluZGV4ID49IHRoaXMuZWxlbWVudC5jaGlsZHJlbi5sZW5ndGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChlbGVtZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50Lmluc2VydEJlZm9yZShlbGVtZW50LCB0aGlzLmVsZW1lbnQuY2hpbGRyZW5baW5kZXggKyAxXSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IHRoaXMub3B0aW9ucy5vcmRlcklkXHJcbiAgICAgICAgICAgIGxldCBkcmFnT3JkZXIgPSBlbGVtZW50LmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICAgICAgZHJhZ09yZGVyID0gdGhpcy5vcHRpb25zLm9yZGVySWRJc051bWJlciA/IHBhcnNlRmxvYXQoZHJhZ09yZGVyKSA6IGRyYWdPcmRlclxyXG4gICAgICAgICAgICBsZXQgZm91bmRcclxuICAgICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLl9nZXRDaGlsZHJlbih0cnVlKVxyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJldmVyc2VPcmRlcilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IGNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gY2hpbGRyZW5baV1cclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGREcmFnT3JkZXIgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGREcmFnT3JkZXIgPSB0aGlzLm9wdGlvbnMub3JkZXJJc051bWJlciA/IHBhcnNlRmxvYXQoY2hpbGREcmFnT3JkZXIpIDogY2hpbGREcmFnT3JkZXJcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ09yZGVyID4gY2hpbGREcmFnT3JkZXIpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShlbGVtZW50LCBjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgY2hpbGRyZW4pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkRHJhZ09yZGVyID0gY2hpbGQuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkRHJhZ09yZGVyID0gdGhpcy5vcHRpb25zLm9yZGVySXNOdW1iZXIgPyBwYXJzZUZsb2F0KGNoaWxkRHJhZ09yZGVyKSA6IGNoaWxkRHJhZ09yZGVyXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdPcmRlciA8IGNoaWxkRHJhZ09yZGVyKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZWxlbWVudCwgY2hpbGQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWZvdW5kKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZWxlbWVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGF0dGFjaGVzIGFuIEhUTUwgZWxlbWVudCB0byB0aGUgc29ydGFibGU7IGNhbiBhbHNvIGJlIHVzZWQgdG8gc3dhcCBiZXR3ZWVuIHNvcnRhYmxlc1xyXG4gICAgICogTk9URTogeW91IG5lZWQgdG8gbWFudWFsbHkgaW5zZXJ0IHRoZSBlbGVtZW50IGludG8gdGhpcy5lbGVtZW50ICh0aGlzIGlzIHVzZWZ1bCB3aGVuIHlvdSBoYXZlIGEgZGVlcCBzdHJ1Y3R1cmUpXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKi9cclxuICAgIGF0dGFjaEVsZW1lbnQoZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsID0gdGhpc1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUgPSB7XHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZTogdGhpcyxcclxuICAgICAgICAgICAgICAgIG9yaWdpbmFsOiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgZHJhZ1N0YXJ0OiAoZSkgPT4gdGhpcy5fZHJhZ1N0YXJ0KGUpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGFkZCBhIGNvdW50ZXIgZm9yIG1heGltdW1cclxuICAgICAgICAgICAgdGhpcy5fbWF4aW11bUNvdW50ZXIoZWxlbWVudCwgdGhpcylcclxuXHJcbiAgICAgICAgICAgIC8vIGVuc3VyZSBldmVyeSBlbGVtZW50IGhhcyBhbiBpZFxyXG4gICAgICAgICAgICBpZiAoIWVsZW1lbnQuaWQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuaWQgPSAnX19zb3J0YWJsZS0nICsgdGhpcy5vcHRpb25zLm5hbWUgKyAnLScgKyBTb3J0YWJsZS50cmFja2VyW3RoaXMub3B0aW9ucy5uYW1lXS5jb3VudGVyXHJcbiAgICAgICAgICAgICAgICBTb3J0YWJsZS50cmFja2VyW3RoaXMub3B0aW9ucy5uYW1lXS5jb3VudGVyKytcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmNvcHkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5jb3B5ID0gMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ3N0YXJ0JywgZWxlbWVudC5fX3NvcnRhYmxlLmRyYWdTdGFydClcclxuICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RyYWdnYWJsZScsIHRydWUpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVtb3ZlcyBhbGwgZXZlbnRzIGZyb20gYW4gSFRNTCBlbGVtZW50XHJcbiAgICAgKiBOT1RFOiBkb2VzIG5vdCByZW1vdmUgdGhlIGVsZW1lbnQgZnJvbSBpdHMgcGFyZW50XHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKi9cclxuICAgIHJlbW92ZUVsZW1lbnQoZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGVsZW1lbnQuZHJhZ01vdmUpXHJcbiAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgZWxlbWVudC5kcmFnTW92ZSlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFkZCBzb3J0YWJsZSB0byBnbG9iYWwgbGlzdCB0aGF0IHRyYWNrcyBhbGwgc29ydGFibGVzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfYWRkVG9HbG9iYWxUcmFja2VyKClcclxuICAgIHtcclxuICAgICAgICBpZiAoIVNvcnRhYmxlLnRyYWNrZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBTb3J0YWJsZS5kcmFnSW1hZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICAgICAgICBTb3J0YWJsZS5kcmFnSW1hZ2UuaWQgPSAnc29ydGFibGUtZHJhZ0ltYWdlJ1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKFNvcnRhYmxlLmRyYWdJbWFnZSlcclxuICAgICAgICAgICAgU29ydGFibGUudHJhY2tlciA9IHt9XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCAoZSkgPT4gdGhpcy5fYm9keURyYWdPdmVyKGUpKVxyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCAoZSkgPT4gdGhpcy5fYm9keURyb3AoZSkpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChTb3J0YWJsZS50cmFja2VyW3RoaXMub3B0aW9ucy5uYW1lXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFNvcnRhYmxlLnRyYWNrZXJbdGhpcy5vcHRpb25zLm5hbWVdLmxpc3QucHVzaCh0aGlzKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBTb3J0YWJsZS50cmFja2VyW3RoaXMub3B0aW9ucy5uYW1lXSA9IHsgbGlzdDogW3RoaXNdLCBjb3VudGVyOiAwIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBkZWZhdWx0IGRyYWcgb3ZlciBmb3IgdGhlIGJvZHlcclxuICAgICAqIEBwYXJhbSB7RHJhZ0V2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfYm9keURyYWdPdmVyKGUpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzBdXHJcbiAgICAgICAgaWYgKG5hbWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzFdXHJcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZClcclxuICAgICAgICAgICAgY29uc3Qgc29ydGFibGUgPSB0aGlzLl9maW5kQ2xvc2VzdChlLCBTb3J0YWJsZS50cmFja2VyW25hbWVdLmxpc3QsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNvcnRhYmxlLmxhc3QgJiYgTWF0aC5hYnMoc29ydGFibGUubGFzdC54IC0gZS5wYWdlWCkgPCBzb3J0YWJsZS5vcHRpb25zLnRocmVzaG9sZCAmJiBNYXRoLmFicyhzb3J0YWJsZS5sYXN0LnkgLSBlLnBhZ2VZKSA8IHNvcnRhYmxlLm9wdGlvbnMudGhyZXNob2xkKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc29ydGFibGUuX3VwZGF0ZURyYWdnaW5nKGUsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZS5sYXN0ID0geyB4OiBlLnBhZ2VYLCB5OiBlLnBhZ2VZIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9wbGFjZUluTGlzdChzb3J0YWJsZSwgZS5wYWdlWCwgZS5wYWdlWSwgZWxlbWVudClcclxuICAgICAgICAgICAgICAgICAgICBlLmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ21vdmUnXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlRHJhZ2dpbmcoZSwgZWxlbWVudClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ub0Ryb3AoZSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIG5vIGRyb3BcclxuICAgICAqIEBwYXJhbSB7VUlFdmVudH0gZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2FuY2VsXSBmb3JjZSBjYW5jZWwgKGZvciBvcHRpb25zLmNvcHkpXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfbm9Ecm9wKGUsIGNhbmNlbClcclxuICAgIHtcclxuICAgICAgICBlLmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ21vdmUnXHJcbiAgICAgICAgY29uc3QgaWQgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1sxXVxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZClcclxuICAgICAgICBpZiAoZWxlbWVudClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZURyYWdnaW5nKGUsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgIHRoaXMuX3NldEljb24oZWxlbWVudCwgbnVsbCwgY2FuY2VsKVxyXG4gICAgICAgICAgICBpZiAoIWNhbmNlbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbC5vcHRpb25zLm9mZkxpc3QgPT09ICdkZWxldGUnKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheSA9IGVsZW1lbnQuc3R5bGUuZGlzcGxheSB8fCAndW5zZXQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwuZW1pdCgnZGVsZXRlLXBlbmRpbmcnLCBlbGVtZW50LCBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoIWVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbC5vcHRpb25zLmNvcHkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVwbGFjZUluTGlzdChlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jbGVhck1heGltdW1QZW5kaW5nKGVsZW1lbnQuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmN1cnJlbnQuZW1pdCgnYWRkLXJlbW92ZS1wZW5kaW5nJywgZWxlbWVudCwgZWxlbWVudC5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuY3VycmVudC5lbWl0KCd1cGRhdGUtcGVuZGluZycsIGVsZW1lbnQsIGVsZW1lbnQuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmN1cnJlbnQgPSBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBkZWZhdWx0IGRyb3AgZm9yIHRoZSBib2R5XHJcbiAgICAgKiBAcGFyYW0ge0RyYWdFdmVudH0gZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2JvZHlEcm9wKGUpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzBdXHJcbiAgICAgICAgaWYgKG5hbWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzFdXHJcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZClcclxuICAgICAgICAgICAgY29uc3Qgc29ydGFibGUgPSB0aGlzLl9maW5kQ2xvc2VzdChlLCBTb3J0YWJsZS50cmFja2VyW25hbWVdLmxpc3QsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZW1vdmVEcmFnZ2luZyhlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlKClcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheVxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5ID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbC5lbWl0KCdkZWxldGUnLCBlbGVtZW50LCBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwpXHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc3RhcnQgZHJhZ1xyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZHJhZ1N0YXJ0KGUpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3Qgc29ydGFibGUgPSBlLmN1cnJlbnRUYXJnZXQuX19zb3J0YWJsZS5vcmlnaW5hbFxyXG4gICAgICAgIGNvbnN0IGRyYWdnaW5nID0gZS5jdXJyZW50VGFyZ2V0LmNsb25lTm9kZSh0cnVlKVxyXG4gICAgICAgIGZvciAobGV0IHN0eWxlIGluIHNvcnRhYmxlLm9wdGlvbnMuZHJhZ1N0eWxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZHJhZ2dpbmcuc3R5bGVbc3R5bGVdID0gc29ydGFibGUub3B0aW9ucy5kcmFnU3R5bGVbc3R5bGVdXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHBvcyA9IHV0aWxzLnRvR2xvYmFsKGUuY3VycmVudFRhcmdldClcclxuICAgICAgICBkcmFnZ2luZy5zdHlsZS5sZWZ0ID0gcG9zLnggKyAncHgnXHJcbiAgICAgICAgZHJhZ2dpbmcuc3R5bGUudG9wID0gcG9zLnkgKyAncHgnXHJcbiAgICAgICAgY29uc3Qgb2Zmc2V0ID0geyB4OiBwb3MueCAtIGUucGFnZVgsIHk6IHBvcy55IC0gZS5wYWdlWSB9XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkcmFnZ2luZylcclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy51c2VJY29ucylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGltYWdlID0gbmV3IEltYWdlKClcclxuICAgICAgICAgICAgaW1hZ2Uuc3JjID0gc29ydGFibGUub3B0aW9ucy5pY29ucy5yZW9yZGVyXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xyXG4gICAgICAgICAgICBpbWFnZS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKC01MCUsIC01MCUpJ1xyXG4gICAgICAgICAgICBpbWFnZS5zdHlsZS5sZWZ0ID0gZHJhZ2dpbmcub2Zmc2V0TGVmdCArIGRyYWdnaW5nLm9mZnNldFdpZHRoICsgJ3B4J1xyXG4gICAgICAgICAgICBpbWFnZS5zdHlsZS50b3AgPSBkcmFnZ2luZy5vZmZzZXRUb3AgKyBkcmFnZ2luZy5vZmZzZXRIZWlnaHQgKyAncHgnXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaW1hZ2UpXHJcbiAgICAgICAgICAgIGRyYWdnaW5nLmljb24gPSBpbWFnZVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHV0aWxzLnN0eWxlKGUuY3VycmVudFRhcmdldCwgJ2N1cnNvcicsIHNvcnRhYmxlLm9wdGlvbnMuY3Vyc29ySG92ZXIpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB0YXJnZXQgPSBlLmN1cnJlbnRUYXJnZXRcclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5jb3B5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGFyZ2V0ID0gZS5jdXJyZW50VGFyZ2V0LmNsb25lTm9kZSh0cnVlKVxyXG4gICAgICAgICAgICB0YXJnZXQuaWQgPSBlLmN1cnJlbnRUYXJnZXQuaWQgKyAnLWNvcHktJyArIGUuY3VycmVudFRhcmdldC5fX3NvcnRhYmxlLmNvcHlcclxuICAgICAgICAgICAgZS5jdXJyZW50VGFyZ2V0Ll9fc29ydGFibGUuY29weSsrXHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmF0dGFjaEVsZW1lbnQodGFyZ2V0KVxyXG4gICAgICAgICAgICB0YXJnZXQuX19zb3J0YWJsZS5pc0NvcHkgPSB0cnVlXHJcbiAgICAgICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLm9yaWdpbmFsID0gdGhpc1xyXG4gICAgICAgICAgICB0YXJnZXQuX19zb3J0YWJsZS5kaXNwbGF5ID0gdGFyZ2V0LnN0eWxlLmRpc3BsYXkgfHwgJ3Vuc2V0J1xyXG4gICAgICAgICAgICB0YXJnZXQuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRhcmdldClcclxuICAgICAgICB9XHJcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuY2xlYXJEYXRhKClcclxuICAgICAgICBlLmRhdGFUcmFuc2Zlci5zZXREYXRhKHNvcnRhYmxlLm9wdGlvbnMubmFtZSwgc29ydGFibGUub3B0aW9ucy5uYW1lKVxyXG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLnNldERhdGEodGFyZ2V0LmlkLCB0YXJnZXQuaWQpXHJcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuc2V0RHJhZ0ltYWdlKFNvcnRhYmxlLmRyYWdJbWFnZSwgMCwgMClcclxuICAgICAgICB0YXJnZXQuX19zb3J0YWJsZS5jdXJyZW50ID0gdGhpc1xyXG4gICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLmluZGV4ID0gc29ydGFibGUub3B0aW9ucy5jb3B5ID8gLTEgOiBzb3J0YWJsZS5fZ2V0SW5kZXgodGFyZ2V0KVxyXG4gICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLmRyYWdnaW5nID0gZHJhZ2dpbmdcclxuICAgICAgICB0YXJnZXQuX19zb3J0YWJsZS5vZmZzZXQgPSBvZmZzZXRcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSBkcmFnIGxlYXZlIGV2ZW50cyBmb3Igc29ydGFibGUgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtEcmFnRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kcmFnTGVhdmUoZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBzb3J0YWJsZSA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzBdXHJcbiAgICAgICAgaWYgKHNvcnRhYmxlICYmIHNvcnRhYmxlID09PSB0aGlzLm9wdGlvbnMubmFtZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NsZWFyTWF4aW11bVBlbmRpbmcoc29ydGFibGUpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIGRyYWcgb3ZlciBldmVudHMgZm9yIHNvcnRhYmxlIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7RHJhZ0V2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZHJhZ092ZXIoZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBzb3J0YWJsZSA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzBdXHJcbiAgICAgICAgaWYgKHNvcnRhYmxlICYmIHNvcnRhYmxlID09PSB0aGlzLm9wdGlvbnMubmFtZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMV1cclxuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxyXG4gICAgICAgICAgICBpZiAodGhpcy5sYXN0ICYmIE1hdGguYWJzKHRoaXMubGFzdC54IC0gZS5wYWdlWCkgPCB0aGlzLm9wdGlvbnMudGhyZXNob2xkICYmIE1hdGguYWJzKHRoaXMubGFzdC55IC0gZS5wYWdlWSkgPCB0aGlzLm9wdGlvbnMudGhyZXNob2xkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVEcmFnZ2luZyhlLCBlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmxhc3QgPSB7IHg6IGUucGFnZVgsIHk6IGUucGFnZVkgfVxyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLmlzQ29weSAmJiBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgPT09IHRoaXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX25vRHJvcChlLCB0cnVlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMub3B0aW9ucy5kcm9wIHx8IGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9PT0gdGhpcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcGxhY2VJbkxpc3QodGhpcywgZS5wYWdlWCwgZS5wYWdlWSwgZWxlbWVudClcclxuICAgICAgICAgICAgICAgIGUuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSBlbGVtZW50Ll9fc29ydGFibGUuaXNDb3B5ID8gJ2NvcHknIDogJ21vdmUnXHJcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVEcmFnZ2luZyhlLCBlbGVtZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbm9Ecm9wKGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB1cGRhdGUgdGhlIGRyYWdnaW5nIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7VUlFdmVudH0gZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3VwZGF0ZURyYWdnaW5nKGUsIGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgZHJhZ2dpbmcgPSBlbGVtZW50Ll9fc29ydGFibGUuZHJhZ2dpbmdcclxuICAgICAgICBjb25zdCBvZmZzZXQgPSBlbGVtZW50Ll9fc29ydGFibGUub2Zmc2V0XHJcbiAgICAgICAgaWYgKGRyYWdnaW5nKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZHJhZ2dpbmcuc3R5bGUubGVmdCA9IGUucGFnZVggKyBvZmZzZXQueCArICdweCdcclxuICAgICAgICAgICAgZHJhZ2dpbmcuc3R5bGUudG9wID0gZS5wYWdlWSArIG9mZnNldC55ICsgJ3B4J1xyXG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcuaWNvbilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zdHlsZS5sZWZ0ID0gZHJhZ2dpbmcub2Zmc2V0TGVmdCArIGRyYWdnaW5nLm9mZnNldFdpZHRoICsgJ3B4J1xyXG4gICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zdHlsZS50b3AgPSBkcmFnZ2luZy5vZmZzZXRUb3AgKyBkcmFnZ2luZy5vZmZzZXRIZWlnaHQgKyAncHgnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZW1vdmUgdGhlIGRyYWdnaW5nIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9yZW1vdmVEcmFnZ2luZyhlbGVtZW50KVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGRyYWdnaW5nID0gZWxlbWVudC5fX3NvcnRhYmxlLmRyYWdnaW5nXHJcbiAgICAgICAgZHJhZ2dpbmcucmVtb3ZlKClcclxuICAgICAgICBpZiAoZHJhZ2dpbmcuaWNvbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGRyYWdnaW5nLmljb24ucmVtb3ZlKClcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmRyYWdnaW5nID0gbnVsbFxyXG4gICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5pc0NvcHkgPSBmYWxzZVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZHJvcCB0aGUgZWxlbWVudCBpbnRvIGEgc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kcm9wKGUpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzBdXHJcbiAgICAgICAgaWYgKG5hbWUgJiYgbmFtZSA9PT0gdGhpcy5vcHRpb25zLm5hbWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzFdXHJcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZClcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCAhPT0gdGhpcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsLmVtaXQoJ3JlbW92ZScsIGVsZW1lbnQsIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbClcclxuICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgnYWRkJywgZWxlbWVudCwgdGhpcylcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9IHRoaXNcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc29ydClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ29yZGVyJywgZWxlbWVudCwgdGhpcylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUuaXNDb3B5KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgnY29weScsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9tYXhpbXVtKGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ3VwZGF0ZScsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLmluZGV4ICE9PSB0aGlzLl9nZXRJbmRleChlLmN1cnJlbnRUYXJnZXQpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgnb3JkZXInLCBlbGVtZW50LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgndXBkYXRlJywgZWxlbWVudCwgdGhpcylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVEcmFnZ2luZyhlbGVtZW50KVxyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGZpbmQgY2xvc2VzdCBTb3J0YWJsZSB0byBzY3JlZW4gbG9jYXRpb25cclxuICAgICAqIEBwYXJhbSB7VUlFdmVudH0gZVxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZVtdfSBsaXN0IG9mIHJlbGF0ZWQgU29ydGFibGVzXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZmluZENsb3Nlc3QoZSwgbGlzdCwgZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBsZXQgbWluID0gSW5maW5pdHksIGZvdW5kXHJcbiAgICAgICAgZm9yIChsZXQgcmVsYXRlZCBvZiBsaXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCghcmVsYXRlZC5vcHRpb25zLmRyb3AgJiYgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsICE9PSByZWxhdGVkKSB8fFxyXG4gICAgICAgICAgICAgICAgKGVsZW1lbnQuX19zb3J0YWJsZS5pc0NvcHkgJiYgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsID09PSByZWxhdGVkKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29udGludWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodXRpbHMuaW5zaWRlKGUucGFnZVgsIGUucGFnZVksIHJlbGF0ZWQuZWxlbWVudCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZWxhdGVkXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAocmVsYXRlZC5vcHRpb25zLm9mZkxpc3QgPT09ICdjbG9zZXN0JylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2FsY3VsYXRlID0gdXRpbHMuZGlzdGFuY2VUb0Nsb3Nlc3RDb3JuZXIoZS5wYWdlWCwgZS5wYWdlWSwgcmVsYXRlZC5lbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgaWYgKGNhbGN1bGF0ZSA8IG1pbilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtaW4gPSBjYWxjdWxhdGVcclxuICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHJlbGF0ZWRcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZm91bmRcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBsYWNlIGluZGljYXRvciBpbiB0aGUgc29ydGFibGUgbGlzdCBhY2NvcmRpbmcgdG8gb3B0aW9ucy5zb3J0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGxhY2VJbkxpc3Qoc29ydGFibGUsIHgsIHksIGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkgPT09ICd1bnNldCcgPyAnJyA6IGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5XHJcbiAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5ID0gbnVsbFxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNvcnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLl9wbGFjZUluU29ydGFibGVMaXN0KHNvcnRhYmxlLCB4LCB5LCBlbGVtZW50KVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLl9wbGFjZUluT3JkZXJlZExpc3Qoc29ydGFibGUsIGVsZW1lbnQpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3NldEljb24oZWxlbWVudCwgc29ydGFibGUpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZXBsYWNlIGl0ZW0gaW4gbGlzdCBhdCBvcmlnaW5hbCBpbmRleCBwb3NpdGlvblxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3JlcGxhY2VJbkxpc3Qoc29ydGFibGUsIGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IGVsZW1lbnQuX19zb3J0YWJsZS5pbmRleFxyXG4gICAgICAgICAgICBpZiAoaW5kZXggPCBjaGlsZHJlbi5sZW5ndGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkcmVuW2luZGV4XS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShlbGVtZW50LCBjaGlsZHJlbltpbmRleF0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlblswXS5hcHBlbmRDaGlsZChlbGVtZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZWxlbWVudClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjb3VudCB0aGUgaW5kZXggb2YgdGhlIGNoaWxkIGluIHRoZSBsaXN0IG9mIGNoaWxkcmVuXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjaGlsZFxyXG4gICAgICogQHJldHVybiB7bnVtYmVyfVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2dldEluZGV4KGNoaWxkKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoY2hpbGRyZW5baV0gPT09IGNoaWxkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdHJhdmVyc2UgYW5kIHNlYXJjaCBkZXNjZW5kZW50cyBpbiBET01cclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGJhc2VcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzZWFyY2hcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnRbXX0gcmVzdWx0cyB0byByZXR1cm5cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF90cmF2ZXJzZUNoaWxkcmVuKGJhc2UsIHNlYXJjaCwgcmVzdWx0cylcclxuICAgIHtcclxuICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBiYXNlLmNoaWxkcmVuKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHNlYXJjaC5sZW5ndGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzZWFyY2guaW5kZXhPZihjaGlsZC5jbGFzc05hbWUpICE9PSAtMSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goY2hpbGQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goY2hpbGQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fdHJhdmVyc2VDaGlsZHJlbihjaGlsZCwgc2VhcmNoLCByZXN1bHRzKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGZpbmQgY2hpbGRyZW4gaW4gZGl2XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3JkZXJdIHNlYXJjaCBmb3IgZHJhZ09yZGVyIGFzIHdlbGxcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9nZXRDaGlsZHJlbihvcmRlcilcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBTZWFyY2gpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgc2VhcmNoID0gW11cclxuICAgICAgICAgICAgaWYgKG9yZGVyICYmIHRoaXMub3B0aW9ucy5vcmRlckNsYXNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2gucHVzaCh0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKG9yZGVyICYmIHRoaXMub3B0aW9ucy5vcmRlckNsYXNzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaC5wdXNoKHRoaXMub3B0aW9ucy5vcmRlckNsYXNzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKCFvcmRlciAmJiB0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzZWFyY2gucHVzaCh0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXVxyXG4gICAgICAgICAgICB0aGlzLl90cmF2ZXJzZUNoaWxkcmVuKHRoaXMuZWxlbWVudCwgc2VhcmNoLCByZXN1bHRzKVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0c1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGV0IGxpc3QgPSBbXVxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5lbGVtZW50LmNoaWxkcmVuKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh1dGlscy5jb250YWluc0NsYXNzTmFtZShjaGlsZCwgdGhpcy5vcHRpb25zLmRyYWdDbGFzcykgfHwgKG9yZGVyICYmICF0aGlzLm9wdGlvbnMub3JkZXJDbGFzcyB8fCAob3JkZXIgJiYgdGhpcy5vcHRpb25zLm9yZGVyQ2xhc3MgJiYgdXRpbHMuY29udGFpbnNDbGFzc05hbWUoY2hpbGQsIHRoaXMub3B0aW9ucy5vcmRlckNsYXNzKSkpKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGlzdC5wdXNoKGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBsaXN0XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBsaXN0ID0gW11cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIHRoaXMuZWxlbWVudC5jaGlsZHJlbilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsaXN0LnB1c2goY2hpbGQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbGlzdFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGxhY2UgaW5kaWNhdG9yIGluIGFuIG9yZGVyZWQgbGlzdFxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGxhY2VJbk9yZGVyZWRMaXN0KHNvcnRhYmxlLCBkcmFnZ2luZylcclxuICAgIHtcclxuICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50ICE9PSBzb3J0YWJsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gc29ydGFibGUub3B0aW9ucy5vcmRlcklkXHJcbiAgICAgICAgICAgIGxldCBkcmFnT3JkZXIgPSBkcmFnZ2luZy5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgICAgIGRyYWdPcmRlciA9IHNvcnRhYmxlLm9wdGlvbnMub3JkZXJJZElzTnVtYmVyID8gcGFyc2VGbG9hdChkcmFnT3JkZXIpIDogZHJhZ09yZGVyXHJcbiAgICAgICAgICAgIGxldCBmb3VuZFxyXG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHNvcnRhYmxlLl9nZXRDaGlsZHJlbih0cnVlKVxyXG4gICAgICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5yZXZlcnNlT3JkZXIpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSBjaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZCA9IGNoaWxkcmVuW2ldXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkRHJhZ09yZGVyID0gY2hpbGQuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkRHJhZ09yZGVyID0gc29ydGFibGUub3B0aW9ucy5vcmRlcklzTnVtYmVyID8gcGFyc2VGbG9hdChjaGlsZERyYWdPcmRlcikgOiBjaGlsZERyYWdPcmRlclxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnT3JkZXIgPiBjaGlsZERyYWdPcmRlcilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGRyYWdnaW5nLCBjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgY2hpbGRyZW4pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkRHJhZ09yZGVyID0gY2hpbGQuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkRHJhZ09yZGVyID0gc29ydGFibGUub3B0aW9ucy5vcmRlcklzTnVtYmVyID8gcGFyc2VGbG9hdChjaGlsZERyYWdPcmRlcikgOiBjaGlsZERyYWdPcmRlclxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnT3JkZXIgPCBjaGlsZERyYWdPcmRlcilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGRyYWdnaW5nLCBjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghZm91bmQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZHJhZ2dpbmcpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudCAhPT0gZHJhZ2dpbmcuX19zb3J0YWJsZS5vcmlnaW5hbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQuZW1pdCgnYWRkLXJlbW92ZS1wZW5kaW5nJywgZHJhZ2dpbmcsIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQuZW1pdCgncmVtb3ZlLXBlbmRpbmcnLCBkcmFnZ2luZywgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ2FkZC1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5pc0NvcHkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ2NvcHktcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgPSBzb3J0YWJsZVxyXG4gICAgICAgICAgICB0aGlzLl9tYXhpbXVtUGVuZGluZyhkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ3VwZGF0ZS1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNlYXJjaCBmb3Igd2hlcmUgdG8gcGxhY2UgdXNpbmcgcGVyY2VudGFnZVxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSAwID0gbm90IGZvdW5kOyAxID0gbm90aGluZyB0byBkbzsgMiA9IG1vdmVkXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGxhY2VCeVBlcmNlbnRhZ2Uoc29ydGFibGUsIGRyYWdnaW5nKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGN1cnNvciA9IGRyYWdnaW5nLl9fc29ydGFibGUuZHJhZ2dpbmdcclxuICAgICAgICBjb25zdCB4YTEgPSBjdXJzb3Iub2Zmc2V0TGVmdFxyXG4gICAgICAgIGNvbnN0IHlhMSA9IGN1cnNvci5vZmZzZXRUb3BcclxuICAgICAgICBjb25zdCB4YTIgPSBjdXJzb3Iub2Zmc2V0TGVmdCArIGN1cnNvci5vZmZzZXRXaWR0aFxyXG4gICAgICAgIGNvbnN0IHlhMiA9IGN1cnNvci5vZmZzZXRUb3AgKyBjdXJzb3Iub2Zmc2V0SGVpZ2h0XHJcbiAgICAgICAgbGV0IGxhcmdlc3QgPSAwLCBjbG9zZXN0LCBpc0JlZm9yZSwgaW5kaWNhdG9yXHJcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHNvcnRhYmxlLmVsZW1lbnRcclxuICAgICAgICBjb25zdCBlbGVtZW50cyA9IHNvcnRhYmxlLl9nZXRDaGlsZHJlbih0cnVlKVxyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGVsZW1lbnRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGNoaWxkID09PSBkcmFnZ2luZylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW5kaWNhdG9yID0gdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHBvcyA9IHV0aWxzLnRvR2xvYmFsKGNoaWxkKVxyXG4gICAgICAgICAgICBjb25zdCB4YjEgPSBwb3MueFxyXG4gICAgICAgICAgICBjb25zdCB5YjEgPSBwb3MueVxyXG4gICAgICAgICAgICBjb25zdCB4YjIgPSBwb3MueCArIGNoaWxkLm9mZnNldFdpZHRoXHJcbiAgICAgICAgICAgIGNvbnN0IHliMiA9IHBvcy55ICsgY2hpbGQub2Zmc2V0SGVpZ2h0XHJcbiAgICAgICAgICAgIGNvbnN0IHBlcmNlbnRhZ2UgPSB1dGlscy5wZXJjZW50YWdlKHhhMSwgeWExLCB4YTIsIHlhMiwgeGIxLCB5YjEsIHhiMiwgeWIyKVxyXG4gICAgICAgICAgICBpZiAocGVyY2VudGFnZSA+IGxhcmdlc3QpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxhcmdlc3QgPSBwZXJjZW50YWdlXHJcbiAgICAgICAgICAgICAgICBjbG9zZXN0ID0gY2hpbGRcclxuICAgICAgICAgICAgICAgIGlzQmVmb3JlID0gaW5kaWNhdG9yXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNsb3Nlc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoY2xvc2VzdCA9PT0gZHJhZ2dpbmcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAxXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGlzQmVmb3JlICYmIGNsb3Nlc3QubmV4dFNpYmxpbmcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKGRyYWdnaW5nLCBjbG9zZXN0Lm5leHRTaWJsaW5nKVxyXG4gICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnb3JkZXItcGVuZGluZycsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5pbnNlcnRCZWZvcmUoZHJhZ2dpbmcsIGNsb3Nlc3QpXHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdvcmRlci1wZW5kaW5nJywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIDJcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIDBcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzZWFyY2ggZm9yIHdoZXJlIHRvIHBsYWNlIHVzaW5nIGRpc3RhbmNlXHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmdcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gZmFsc2U9bm90aGluZyB0byBkb1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BsYWNlQnlEaXN0YW5jZShzb3J0YWJsZSwgZHJhZ2dpbmcsIHgsIHkpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHV0aWxzLmluc2lkZSh4LCB5LCBkcmFnZ2luZykpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgaW5kZXggPSAtMVxyXG4gICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgPT09IHNvcnRhYmxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaW5kZXggPSBzb3J0YWJsZS5fZ2V0SW5kZXgoZHJhZ2dpbmcpXHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZHJhZ2dpbmcpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBkaXN0YW5jZSA9IEluZmluaXR5LCBjbG9zZXN0XHJcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHNvcnRhYmxlLmVsZW1lbnRcclxuICAgICAgICBjb25zdCBlbGVtZW50cyA9IHNvcnRhYmxlLl9nZXRDaGlsZHJlbih0cnVlKVxyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGVsZW1lbnRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHV0aWxzLmluc2lkZSh4LCB5LCBjaGlsZCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNsb3Nlc3QgPSBjaGlsZFxyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG1lYXN1cmUgPSB1dGlscy5kaXN0YW5jZVRvQ2xvc2VzdENvcm5lcih4LCB5LCBjaGlsZClcclxuICAgICAgICAgICAgICAgIGlmIChtZWFzdXJlIDwgZGlzdGFuY2UpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xvc2VzdCA9IGNoaWxkXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2UgPSBtZWFzdXJlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxlbWVudC5pbnNlcnRCZWZvcmUoZHJhZ2dpbmcsIGNsb3Nlc3QpXHJcbiAgICAgICAgaWYgKGluZGV4ID09PSBzb3J0YWJsZS5fZ2V0SW5kZXgoZHJhZ2dpbmcpKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbWF4aW11bVBlbmRpbmcoZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgIHNvcnRhYmxlLmVtaXQoJ29yZGVyLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwbGFjZSBpbmRpY2F0b3IgaW4gYW4gc29ydGFibGUgbGlzdFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BsYWNlSW5Tb3J0YWJsZUxpc3Qoc29ydGFibGUsIHgsIHksIGRyYWdnaW5nKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBzb3J0YWJsZS5lbGVtZW50XHJcbiAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgIGlmICghY2hpbGRyZW4ubGVuZ3RoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChkcmFnZ2luZylcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gY29uc3QgcGVyY2VudGFnZSA9IHRoaXMuX3BsYWNlQnlQZXJjZW50YWdlKHNvcnRhYmxlLCBkcmFnZ2luZylcclxuICAgICAgICAgICAgaWYgKHRoaXMuX3BsYWNlQnlEaXN0YW5jZShzb3J0YWJsZSwgZHJhZ2dpbmcsIHgsIHkpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50ICE9PSBzb3J0YWJsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ2FkZC1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5pc0NvcHkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ2NvcHktcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50ICE9PSBkcmFnZ2luZy5fX3NvcnRhYmxlLm9yaWdpbmFsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudC5lbWl0KCdhZGQtcmVtb3ZlLXBlbmRpbmcnLCBkcmFnZ2luZywgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudC5lbWl0KCdyZW1vdmUtcGVuZGluZycsIGRyYWdnaW5nLCBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50ID0gc29ydGFibGVcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbWF4aW11bVBlbmRpbmcoZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgIHNvcnRhYmxlLmVtaXQoJ3VwZGF0ZS1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2V0IGljb24gaWYgYXZhaWxhYmxlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NhbmNlbF0gZm9yY2UgY2FuY2VsIChmb3Igb3B0aW9ucy5jb3B5KVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3NldEljb24oZWxlbWVudCwgc29ydGFibGUsIGNhbmNlbClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBkcmFnZ2luZyA9IGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnZ2luZ1xyXG4gICAgICAgIGlmIChkcmFnZ2luZyAmJiBkcmFnZ2luZy5pY29uKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCFzb3J0YWJsZSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc29ydGFibGUgPSBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWxcclxuICAgICAgICAgICAgICAgIGlmIChjYW5jZWwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zcmMgPSBzb3J0YWJsZS5vcHRpb25zLmljb25zLmNhbmNlbFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnaW5nLmljb24uc3JjID0gc29ydGFibGUub3B0aW9ucy5vZmZMaXN0ID09PSAnZGVsZXRlJyA/IHNvcnRhYmxlLm9wdGlvbnMuaWNvbnMuZGVsZXRlIDogc29ydGFibGUub3B0aW9ucy5pY29ucy5jYW5jZWxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUuaXNDb3B5KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnaW5nLmljb24uc3JjID0gc29ydGFibGUub3B0aW9ucy5pY29ucy5jb3B5XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zcmMgPSBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgPT09IHNvcnRhYmxlID8gc29ydGFibGUub3B0aW9ucy5pY29ucy5yZW9yZGVyIDogc29ydGFibGUub3B0aW9ucy5pY29ucy5tb3ZlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhZGQgYSBtYXhpbXVtIGNvdW50ZXIgdG8gdGhlIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfbWF4aW11bUNvdW50ZXIoZWxlbWVudCwgc29ydGFibGUpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IGNvdW50ID0gLTFcclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5tYXhpbXVtKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBjaGlsZHJlbilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkICE9PSBlbGVtZW50ICYmIGNoaWxkLl9fc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY291bnQgPSBjaGlsZC5fX3NvcnRhYmxlLm1heGltdW0gPiBjb3VudCA/IGNoaWxkLl9fc29ydGFibGUubWF4aW11bSA6IGNvdW50XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLm1heGltdW0gPSBjb3VudCArIDFcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSBtYXhpbXVtXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfbWF4aW11bShlbGVtZW50LCBzb3J0YWJsZSlcclxuICAgIHtcclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5tYXhpbXVtKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoID4gc29ydGFibGUub3B0aW9ucy5tYXhpbXVtKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc29ydGFibGUucmVtb3ZlUGVuZGluZylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoc29ydGFibGUucmVtb3ZlUGVuZGluZy5sZW5ndGgpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZCA9IHNvcnRhYmxlLnJlbW92ZVBlbmRpbmcucG9wKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQuc3R5bGUuZGlzcGxheSA9IGNoaWxkLl9fc29ydGFibGUuZGlzcGxheSA9PT0gJ3Vuc2V0JyA/ICcnIDogY2hpbGQuX19zb3J0YWJsZS5kaXNwbGF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLl9fc29ydGFibGUuZGlzcGxheSA9IG51bGxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQucmVtb3ZlKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnbWF4aW11bS1yZW1vdmUnLCBjaGlsZCwgc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlLnJlbW92ZVBlbmRpbmcgPSBudWxsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fbWF4aW11bUNvdW50ZXIoZWxlbWVudCwgc29ydGFibGUpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2xlYXIgcGVuZGluZyBsaXN0XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2NsZWFyTWF4aW11bVBlbmRpbmcoc29ydGFibGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHNvcnRhYmxlLnJlbW92ZVBlbmRpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB3aGlsZSAoc29ydGFibGUucmVtb3ZlUGVuZGluZy5sZW5ndGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gc29ydGFibGUucmVtb3ZlUGVuZGluZy5wb3AoKVxyXG4gICAgICAgICAgICAgICAgY2hpbGQuc3R5bGUuZGlzcGxheSA9IGNoaWxkLl9fc29ydGFibGUuZGlzcGxheSA9PT0gJ3Vuc2V0JyA/ICcnIDogY2hpbGQuX19zb3J0YWJsZS5kaXNwbGF5XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5fX3NvcnRhYmxlLmRpc3BsYXkgPSBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc29ydGFibGUucmVtb3ZlUGVuZGluZyA9IG51bGxcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgcGVuZGluZyBtYXhpbXVtXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX21heGltdW1QZW5kaW5nKGVsZW1lbnQsIHNvcnRhYmxlKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLm1heGltdW0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHNvcnRhYmxlLl9nZXRDaGlsZHJlbigpXHJcbiAgICAgICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPiBzb3J0YWJsZS5vcHRpb25zLm1heGltdW0pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNhdmVQZW5kaW5nID0gc29ydGFibGUucmVtb3ZlUGVuZGluZyA/IHNvcnRhYmxlLnJlbW92ZVBlbmRpbmcuc2xpY2UoMCkgOiBbXVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fY2xlYXJNYXhpbXVtUGVuZGluZyhzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlLnJlbW92ZVBlbmRpbmcgPSBbXVxyXG4gICAgICAgICAgICAgICAgbGV0IHNvcnRcclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLm1heGltdW1GSUZPKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNvcnQgPSBjaGlsZHJlbi5zb3J0KChhLCBiKSA9PiB7IHJldHVybiBhID09PSBlbGVtZW50ID8gMSA6IGEuX19zb3J0YWJsZS5tYXhpbXVtIC0gYi5fX3NvcnRhYmxlLm1heGltdW0gfSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzb3J0ID0gY2hpbGRyZW4uc29ydCgoYSwgYikgPT4geyByZXR1cm4gYSA9PT0gZWxlbWVudCA/IDEgOiBiLl9fc29ydGFibGUubWF4aW11bSAtIGEuX19zb3J0YWJsZS5tYXhpbXVtIH0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aCAtIHNvcnRhYmxlLm9wdGlvbnMubWF4aW11bTsgaSsrKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhpZGUgPSBzb3J0W2ldXHJcbiAgICAgICAgICAgICAgICAgICAgaGlkZS5fX3NvcnRhYmxlLmRpc3BsYXkgPSBoaWRlLnN0eWxlLmRpc3BsYXkgfHwgJ3Vuc2V0J1xyXG4gICAgICAgICAgICAgICAgICAgIGhpZGUuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlLnJlbW92ZVBlbmRpbmcucHVzaChoaWRlKVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzYXZlUGVuZGluZy5pbmRleE9mKGhpZGUpID09PSAtMSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ21heGltdW0tcmVtb3ZlLXBlbmRpbmcnLCBoaWRlLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGFuZ2UgY3Vyc29yIGR1cmluZyBtb3VzZWRvd25cclxuICAgICAqIEBwYXJhbSB7TW91c2VFdmVudH0gZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX21vdXNlRG93bihlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY3Vyc29ySG92ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB1dGlscy5zdHlsZShlLmN1cnJlbnRUYXJnZXQsICdjdXJzb3InLCB0aGlzLm9wdGlvbnMuY3Vyc29yRG93bilcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgcGlja2VkIHVwIGJlY2F1c2UgaXQgd2FzIG1vdmVkIGJleW9uZCB0aGUgb3B0aW9ucy50aHJlc2hvbGRcclxuICogQGV2ZW50IFNvcnRhYmxlI3BpY2t1cFxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHNvcnRhYmxlIGlzIHJlb3JkZXJlZFxyXG4gKiBAZXZlbnQgU29ydGFibGUjb3JkZXJcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCB0aGF0IHdhcyByZW9yZGVyZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgcGxhY2VkXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyBhZGRlZCB0byB0aGlzIHNvcnRhYmxlXHJcbiAqIEBldmVudCBTb3J0YWJsZSNhZGRcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBhZGRlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyBhZGRlZFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgcmVtb3ZlZCBmcm9tIHRoaXMgc29ydGFibGVcclxuICogQGV2ZW50IFNvcnRhYmxlI3JlbW92ZVxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHJlbW92ZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgcmVtb3ZlZFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgcmVtb3ZlZCBmcm9tIGFsbCBzb3J0YWJsZXNcclxuICogQGV2ZW50IFNvcnRhYmxlI2RlbGV0ZVxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHJlbW92ZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgZHJhZ2dlZCBmcm9tXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBjb3B5IG9mIGFuIGVsZW1lbnQgaXMgZHJvcHBlZFxyXG4gKiBAZXZlbnQgU29ydGFibGUjY29weVxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHJlbW92ZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgZHJhZ2dlZCBmcm9tXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gdGhlIHNvcnRhYmxlIGlzIHVwZGF0ZWQgd2l0aCBhbiBhZGQsIHJlbW92ZSwgb3Igb3JkZXIgY2hhbmdlXHJcbiAqIEBldmVudCBTb3J0YWJsZSN1cGRhdGVcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBjaGFuZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdpdGggZWxlbWVudFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgcmVtb3ZlZCBiZWNhdXNlIG1heGltdW0gd2FzIHJlYWNoZWQgZm9yIHRoZSBzb3J0YWJsZVxyXG4gKiBAZXZlbnQgU29ydGFibGUjbWF4aW11bS1yZW1vdmVcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCByZW1vdmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIGRyYWdnZWQgZnJvbVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIG9yZGVyIHdhcyBjaGFuZ2VkIGJ1dCBlbGVtZW50IHdhcyBub3QgZHJvcHBlZCB5ZXRcclxuICogQGV2ZW50IFNvcnRhYmxlI29yZGVyLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gZWxlbWVudCBpcyBhZGRlZCBidXQgbm90IGRyb3BwZWQgeWV0XHJcbiAqIEBldmVudCBTb3J0YWJsZSNhZGQtcGVuZGluZ1xyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBlbGVtZW50IGlzIHJlbW92ZWQgYnV0IG5vdCBkcm9wcGVkIHlldFxyXG4gKiBAZXZlbnQgU29ydGFibGUjcmVtb3ZlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gZWxlbWVudCBpcyByZW1vdmVkIGFmdGVyIGJlaW5nIHRlbXBvcmFyaWx5IGFkZGVkXHJcbiAqIEBldmVudCBTb3J0YWJsZSNhZGQtcmVtb3ZlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyBhYm91dCB0byBiZSByZW1vdmVkIGZyb20gYWxsIHNvcnRhYmxlc1xyXG4gKiBAZXZlbnQgU29ydGFibGUjZGVsZXRlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCByZW1vdmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIGRyYWdnZWQgZnJvbVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgYWRkZWQsIHJlbW92ZWQsIG9yIHJlb3JkZXIgYnV0IGVsZW1lbnQgaGFzIG5vdCBkcm9wcGVkIHlldFxyXG4gKiBAZXZlbnQgU29ydGFibGUjdXBkYXRlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBjb3B5IG9mIGFuIGVsZW1lbnQgaXMgYWJvdXQgdG8gZHJvcFxyXG4gKiBAZXZlbnQgU29ydGFibGUjY29weS1wZW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgcmVtb3ZlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyBkcmFnZ2VkIGZyb21cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIGFib3V0IHRvIGJlIHJlbW92ZWQgYmVjYXVzZSBtYXhpbXVtIHdhcyByZWFjaGVkIGZvciB0aGUgc29ydGFibGVcclxuICogQGV2ZW50IFNvcnRhYmxlI21heGltdW0tcmVtb3ZlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCByZW1vdmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIGRyYWdnZWQgZnJvbVxyXG4gKi9cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU29ydGFibGUiXX0=