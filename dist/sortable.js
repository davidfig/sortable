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
     * @fires clicked
     */
    function Sortable(element, options) {
        _classCallCheck(this, Sortable);

        var _this = _possibleConstructorReturn(this, (Sortable.__proto__ || Object.getPrototypeOf(Sortable)).call(this));

        _this.options = utils.options(options, defaults);
        _this.element = element;
        _this._addToGlobalTracker();
        var elements = _this._getChildren();
        _this.events = {
            dragStart: function dragStart(e) {
                return _this._dragStart(e);
            },
            dragEnd: function dragEnd(e) {
                return _this._dragEnd(e);
            },
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
            },
            mouseDown: function mouseDown(e) {
                return _this._mouseDown(e);
            },
            mouseUp: function mouseUp(e) {
                return _this._mouseUp(e);
            }
        };
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
                        _child.addEventListener('mousedown', _this.events.mouseDown);
                    }
                    _child.addEventListener('mouseup', _this.events.mouseUp);
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
            if (element.__sortable) {
                element.__sortable.original = this;
            } else {
                element.__sortable = {
                    sortable: this,
                    original: this

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
                element.addEventListener('dragstart', this.events.dragStart);
                element.addEventListener('dragend', this.events.dragEnd);
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
            element.removeEventListener('dragstart', this.events.dragStart);
            element.removeEventListener('dragend', this.events.dragEnd);
            element.setAttribute('draggable', false);
        }

        /**
         * add sortable to global list that tracks all sortables
         * @private
         */

    }, {
        key: '_addToGlobalTracker',
        value: function _addToGlobalTracker() {
            var _this2 = this;

            if (!Sortable.tracker) {
                Sortable.dragImage = document.createElement('div');
                Sortable.dragImage.id = 'sortable-dragImage';
                document.body.appendChild(Sortable.dragImage);
                Sortable.tracker = {};
                document.body.addEventListener('dragover', function (e) {
                    return _this2._bodyDragOver(e);
                });
                document.body.addEventListener('drop', function (e) {
                    return _this2._bodyDrop(e);
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
            if (Sortable.tracker[name]) {
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
            if (Sortable.tracker[name]) {
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
         * end drag
         * @param {UIEvent} e
         * @private
         */

    }, {
        key: '_dragEnd',
        value: function _dragEnd(e) {
            var element = e.currentTarget;
            var dragging = element.__sortable.dragging;
            if (dragging) {
                dragging.remove();
                if (dragging.icon) {
                    dragging.icon.remove();
                }
                element.__sortable.dragging = null;
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
            if (dragging) {
                dragging.remove();
                if (dragging.icon) {
                    dragging.icon.remove();
                }
                element.__sortable.dragging = null;
            }
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
            if (Sortable.tracker[name] && name === this.options.name) {
                var id = e.dataTransfer.types[1];
                var element = document.getElementById(id);
                if (element.__sortable.current) {
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
            if (this.options.sort) {
                this._placeInSortableList(sortable, x, y, element);
            } else {
                this._placeInOrderedList(sortable, element);
            }
            this._setIcon(element, sortable);
            if (element.__sortable.display) {
                element.style.display = element.__sortable.display === 'unset' ? '' : element.__sortable.display;
                element.__sortable.display = null;
            }
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

        /**
         * change cursor during mouseup
         * @param {MouseEvent} e
         * @private
         */

    }, {
        key: '_mouseUp',
        value: function _mouseUp(e) {
            this.emit('clicked', e.currentTarget, this);
            if (this.options.cursorHover) {
                utils.style(e.currentTarget, 'cursor', this.options.cursorHover);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3J0YWJsZS5qcyJdLCJuYW1lcyI6WyJFdmVudHMiLCJyZXF1aXJlIiwiZGVmYXVsdHMiLCJ1dGlscyIsIlNvcnRhYmxlIiwiZWxlbWVudCIsIm9wdGlvbnMiLCJfYWRkVG9HbG9iYWxUcmFja2VyIiwiZWxlbWVudHMiLCJfZ2V0Q2hpbGRyZW4iLCJldmVudHMiLCJkcmFnU3RhcnQiLCJlIiwiX2RyYWdTdGFydCIsImRyYWdFbmQiLCJfZHJhZ0VuZCIsImRyYWdPdmVyIiwiX2RyYWdPdmVyIiwiZHJvcCIsIl9kcm9wIiwiZHJhZ0xlYXZlIiwiX2RyYWdMZWF2ZSIsIm1vdXNlT3ZlciIsIl9tb3VzZUVudGVyIiwibW91c2VEb3duIiwiX21vdXNlRG93biIsIm1vdXNlVXAiLCJfbW91c2VVcCIsImNoaWxkIiwiZHJhZ0NsYXNzIiwiY29udGFpbnNDbGFzc05hbWUiLCJhdHRhY2hFbGVtZW50IiwiYWRkRXZlbnRMaXN0ZW5lciIsImN1cnNvckhvdmVyIiwic3R5bGUiLCJjdXJzb3JEb3duIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsInJlbW92ZUVsZW1lbnQiLCJpbmRleCIsInNvcnQiLCJjaGlsZHJlbiIsImxlbmd0aCIsImFwcGVuZENoaWxkIiwiaW5zZXJ0QmVmb3JlIiwiaWQiLCJvcmRlcklkIiwiZHJhZ09yZGVyIiwiZ2V0QXR0cmlidXRlIiwib3JkZXJJZElzTnVtYmVyIiwicGFyc2VGbG9hdCIsImZvdW5kIiwicmV2ZXJzZU9yZGVyIiwiaSIsImNoaWxkRHJhZ09yZGVyIiwib3JkZXJJc051bWJlciIsInBhcmVudE5vZGUiLCJfX3NvcnRhYmxlIiwib3JpZ2luYWwiLCJzb3J0YWJsZSIsIl9tYXhpbXVtQ291bnRlciIsIm5hbWUiLCJ0cmFja2VyIiwiY291bnRlciIsImNvcHkiLCJzZXRBdHRyaWJ1dGUiLCJkcmFnSW1hZ2UiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJib2R5IiwiX2JvZHlEcmFnT3ZlciIsIl9ib2R5RHJvcCIsImxpc3QiLCJwdXNoIiwiZGF0YVRyYW5zZmVyIiwidHlwZXMiLCJnZXRFbGVtZW50QnlJZCIsIl9maW5kQ2xvc2VzdCIsImxhc3QiLCJNYXRoIiwiYWJzIiwieCIsInBhZ2VYIiwidGhyZXNob2xkIiwieSIsInBhZ2VZIiwiX3VwZGF0ZURyYWdnaW5nIiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJfcGxhY2VJbkxpc3QiLCJkcm9wRWZmZWN0IiwiX25vRHJvcCIsImNhbmNlbCIsIl9zZXRJY29uIiwib2ZmTGlzdCIsImRpc3BsYXkiLCJlbWl0IiwiX3JlcGxhY2VJbkxpc3QiLCJjdXJyZW50IiwiX2NsZWFyTWF4aW11bVBlbmRpbmciLCJfcmVtb3ZlRHJhZ2dpbmciLCJyZW1vdmUiLCJjdXJyZW50VGFyZ2V0IiwiZHJhZ2dpbmciLCJpY29uIiwiY2xvbmVOb2RlIiwiZHJhZ1N0eWxlIiwicG9zIiwidG9HbG9iYWwiLCJsZWZ0IiwidG9wIiwib2Zmc2V0IiwidXNlSWNvbnMiLCJpbWFnZSIsIkltYWdlIiwic3JjIiwiaWNvbnMiLCJyZW9yZGVyIiwicG9zaXRpb24iLCJ0cmFuc2Zvcm0iLCJvZmZzZXRMZWZ0Iiwib2Zmc2V0V2lkdGgiLCJvZmZzZXRUb3AiLCJvZmZzZXRIZWlnaHQiLCJ0YXJnZXQiLCJpc0NvcHkiLCJjbGVhckRhdGEiLCJzZXREYXRhIiwic2V0RHJhZ0ltYWdlIiwiX2dldEluZGV4IiwiX21heGltdW0iLCJtaW4iLCJJbmZpbml0eSIsInJlbGF0ZWQiLCJpbnNpZGUiLCJjYWxjdWxhdGUiLCJkaXN0YW5jZVRvQ2xvc2VzdENvcm5lciIsIl9wbGFjZUluU29ydGFibGVMaXN0IiwiX3BsYWNlSW5PcmRlcmVkTGlzdCIsImJhc2UiLCJzZWFyY2giLCJyZXN1bHRzIiwiaW5kZXhPZiIsImNsYXNzTmFtZSIsIl90cmF2ZXJzZUNoaWxkcmVuIiwib3JkZXIiLCJkZWVwU2VhcmNoIiwib3JkZXJDbGFzcyIsIl9tYXhpbXVtUGVuZGluZyIsImN1cnNvciIsInhhMSIsInlhMSIsInhhMiIsInlhMiIsImxhcmdlc3QiLCJjbG9zZXN0IiwiaXNCZWZvcmUiLCJpbmRpY2F0b3IiLCJ4YjEiLCJ5YjEiLCJ4YjIiLCJ5YjIiLCJwZXJjZW50YWdlIiwibmV4dFNpYmxpbmciLCJkaXN0YW5jZSIsIm1lYXN1cmUiLCJfcGxhY2VCeURpc3RhbmNlIiwiZGVsZXRlIiwibW92ZSIsImNvdW50IiwibWF4aW11bSIsInJlbW92ZVBlbmRpbmciLCJwb3AiLCJzYXZlUGVuZGluZyIsInNsaWNlIiwibWF4aW11bUZJRk8iLCJhIiwiYiIsImhpZGUiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxlQUFSLENBQWY7O0FBRUEsSUFBTUMsV0FBV0QsUUFBUSxZQUFSLENBQWpCO0FBQ0EsSUFBTUUsUUFBUUYsUUFBUSxTQUFSLENBQWQ7O0lBRU1HLFE7OztBQUVGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTRDQSxzQkFBWUMsT0FBWixFQUFxQkMsT0FBckIsRUFDQTtBQUFBOztBQUFBOztBQUVJLGNBQUtBLE9BQUwsR0FBZUgsTUFBTUcsT0FBTixDQUFjQSxPQUFkLEVBQXVCSixRQUF2QixDQUFmO0FBQ0EsY0FBS0csT0FBTCxHQUFlQSxPQUFmO0FBQ0EsY0FBS0UsbUJBQUw7QUFDQSxZQUFNQyxXQUFXLE1BQUtDLFlBQUwsRUFBakI7QUFDQSxjQUFLQyxNQUFMLEdBQWM7QUFDVkMsdUJBQVcsbUJBQUNDLENBQUQ7QUFBQSx1QkFBTyxNQUFLQyxVQUFMLENBQWdCRCxDQUFoQixDQUFQO0FBQUEsYUFERDtBQUVWRSxxQkFBUyxpQkFBQ0YsQ0FBRDtBQUFBLHVCQUFPLE1BQUtHLFFBQUwsQ0FBY0gsQ0FBZCxDQUFQO0FBQUEsYUFGQztBQUdWSSxzQkFBVSxrQkFBQ0osQ0FBRDtBQUFBLHVCQUFPLE1BQUtLLFNBQUwsQ0FBZUwsQ0FBZixDQUFQO0FBQUEsYUFIQTtBQUlWTSxrQkFBTSxjQUFDTixD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QUFhNkIsVUFBcEQ7QUFDSDtBQUNKOztBQUVEOzs7Ozs7OztpQ0FLU3ZCLEMsRUFDVDtBQUNJLGlCQUFLbUYsSUFBTCxDQUFVLFNBQVYsRUFBcUJuRixFQUFFeUYsYUFBdkIsRUFBc0MsSUFBdEM7QUFDQSxnQkFBSSxLQUFLL0YsT0FBTCxDQUFhMkIsV0FBakIsRUFDQTtBQUNJOUIsc0JBQU0rQixLQUFOLENBQVl0QixFQUFFeUYsYUFBZCxFQUE2QixRQUE3QixFQUF1QyxLQUFLL0YsT0FBTCxDQUFhMkIsV0FBcEQ7QUFDSDtBQUNKOzs7OztBQXhpQ0Q7Ozs7OytCQUtjekIsUSxFQUFVRixPLEVBQ3hCO0FBQ0ksZ0JBQU1zSSxVQUFVLEVBQWhCO0FBREo7QUFBQTtBQUFBOztBQUFBO0FBRUksdUNBQW9CcEksUUFBcEIsd0lBQ0E7QUFBQSx3QkFEU0gsT0FDVDs7QUFDSXVJLDRCQUFRcEUsSUFBUixDQUFhLElBQUlwRSxRQUFKLENBQWFDLE9BQWIsRUFBc0JDLE9BQXRCLENBQWI7QUFDSDtBQUxMO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBTUksbUJBQU9zSSxPQUFQO0FBQ0g7Ozs0QkFqQkQ7QUFDSSxtQkFBTzFJLFFBQVA7QUFDSDs7OztFQTdHa0JGLE07O0FBMHBDdkI7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQWtMLE9BQU9DLE9BQVAsR0FBaUIvSyxRQUFqQiIsImZpbGUiOiJzb3J0YWJsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IEV2ZW50cyA9IHJlcXVpcmUoJ2V2ZW50ZW1pdHRlcjMnKVxyXG5cclxuY29uc3QgZGVmYXVsdHMgPSByZXF1aXJlKCcuL2RlZmF1bHRzJylcclxuY29uc3QgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcclxuXHJcbmNsYXNzIFNvcnRhYmxlIGV4dGVuZHMgRXZlbnRzXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIHNvcnRhYmxlIGxpc3RcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5uYW1lPXNvcnRhYmxlXSBkcmFnZ2luZyBpcyBhbGxvd2VkIGJldHdlZW4gU29ydGFibGVzIHdpdGggdGhlIHNhbWUgbmFtZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmRyYWdDbGFzc10gaWYgc2V0IHRoZW4gZHJhZyBvbmx5IGl0ZW1zIHdpdGggdGhpcyBjbGFzc05hbWUgdW5kZXIgZWxlbWVudDsgb3RoZXJ3aXNlIGRyYWcgYWxsIGNoaWxkcmVuXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMub3JkZXJDbGFzc10gdXNlIHRoaXMgY2xhc3MgdG8gaW5jbHVkZSBlbGVtZW50cyBpbiBvcmRlcmluZyBidXQgbm90IGRyYWdnaW5nOyBvdGhlcndpc2UgYWxsIGNoaWxkcmVuIGVsZW1lbnRzIGFyZSBpbmNsdWRlZCBpbiB3aGVuIHNvcnRpbmcgYW5kIG9yZGVyaW5nXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmRlZXBTZWFyY2hdIGlmIGRyYWdDbGFzcyBhbmQgZGVlcFNlYXJjaCB0aGVuIHNlYXJjaCBhbGwgZGVzY2VuZGVudHMgb2YgZWxlbWVudCBmb3IgZHJhZ0NsYXNzXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnNvcnQ9dHJ1ZV0gYWxsb3cgc29ydGluZyB3aXRoaW4gbGlzdFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5kcm9wPXRydWVdIGFsbG93IGRyb3AgZnJvbSByZWxhdGVkIHNvcnRhYmxlcyAoZG9lc24ndCBpbXBhY3QgcmVvcmRlcmluZyB0aGlzIHNvcnRhYmxlJ3MgY2hpbGRyZW4gdW50aWwgdGhlIGNoaWxkcmVuIGFyZSBtb3ZlZCB0byBhIGRpZmZlcmVuIHNvcnRhYmxlKVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5jb3B5PWZhbHNlXSBjcmVhdGUgY29weSB3aGVuIGRyYWdnaW5nIGFuIGl0ZW0gKHRoaXMgZGlzYWJsZXMgc29ydD10cnVlIGZvciB0aGlzIHNvcnRhYmxlKVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLm9yZGVySWQ9ZGF0YS1vcmRlcl0gZm9yIG9yZGVyZWQgbGlzdHMsIHVzZSB0aGlzIGRhdGEgaWQgdG8gZmlndXJlIG91dCBzb3J0IG9yZGVyXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLm9yZGVySWRJc051bWJlcj10cnVlXSB1c2UgcGFyc2VJbnQgb24gb3B0aW9ucy5zb3J0SWQgdG8gcHJvcGVybHkgc29ydCBudW1iZXJzXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMucmV2ZXJzZU9yZGVyXSByZXZlcnNlIHNvcnQgdGhlIG9yZGVySWRcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5vZmZMaXN0PWNsb3Nlc3RdIGhvdyB0byBoYW5kbGUgd2hlbiBhbiBlbGVtZW50IGlzIGRyb3BwZWQgb3V0c2lkZSBhIHNvcnRhYmxlOiBjbG9zZXN0PWRyb3AgaW4gY2xvc2VzdCBzb3J0YWJsZTsgY2FuY2VsPXJldHVybiB0byBzdGFydGluZyBzb3J0YWJsZTsgZGVsZXRlPXJlbW92ZSBmcm9tIGFsbCBzb3J0YWJsZXNcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5tYXhpbXVtXSBtYXhpbXVtIG51bWJlciBvZiBlbGVtZW50cyBhbGxvd2VkIGluIGEgc29ydGFibGUgbGlzdFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5tYXhpbXVtRklGT10gZGlyZWN0aW9uIG9mIHNlYXJjaCB0byBjaG9vc2Ugd2hpY2ggaXRlbSB0byByZW1vdmUgd2hlbiBtYXhpbXVtIGlzIHJlYWNoZWRcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5jdXJzb3JIb3Zlcj1ncmFiIC13ZWJraXQtZ3JhYiBwb2ludGVyXSB1c2UgdGhpcyBjdXJzb3IgbGlzdCB0byBzZXQgY3Vyc29yIHdoZW4gaG92ZXJpbmcgb3ZlciBhIHNvcnRhYmxlIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5jdXJzb3JEb3duPWdyYWJiaW5nIC13ZWJraXQtZ3JhYmJpbmcgcG9pbnRlcl0gdXNlIHRoaXMgY3Vyc29yIGxpc3QgdG8gc2V0IGN1cnNvciB3aGVuIG1vdXNlZG93bi90b3VjaGRvd24gb3ZlciBhIHNvcnRhYmxlIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMudXNlSWNvbnM9dHJ1ZV0gc2hvdyBpY29ucyB3aGVuIGRyYWdnaW5nXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnMuaWNvbnNdIGRlZmF1bHQgc2V0IG9mIGljb25zXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuaWNvbnMucmVvcmRlcl1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5pY29ucy5tb3ZlXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmljb25zLmNvcHldXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuaWNvbnMuZGVsZXRlXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmN1c3RvbUljb25dIHNvdXJjZSBvZiBjdXN0b20gaW1hZ2Ugd2hlbiBvdmVyIHRoaXMgc29ydGFibGVcclxuICAgICAqIEBmaXJlcyBwaWNrdXBcclxuICAgICAqIEBmaXJlcyBvcmRlclxyXG4gICAgICogQGZpcmVzIGFkZFxyXG4gICAgICogQGZpcmVzIHJlbW92ZVxyXG4gICAgICogQGZpcmVzIHVwZGF0ZVxyXG4gICAgICogQGZpcmVzIGRlbGV0ZVxyXG4gICAgICogQGZpcmVzIGNvcHlcclxuICAgICAqIEBmaXJlcyBtYXhpbXVtLXJlbW92ZVxyXG4gICAgICogQGZpcmVzIG9yZGVyLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyBhZGQtcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIHJlbW92ZS1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgYWRkLXJlbW92ZS1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgdXBkYXRlLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyBkZWxldGUtcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIGNvcHktcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIG1heGltdW0tcmVtb3ZlLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyBjbGlja2VkXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgc3VwZXIoKVxyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IHV0aWxzLm9wdGlvbnMob3B0aW9ucywgZGVmYXVsdHMpXHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudFxyXG4gICAgICAgIHRoaXMuX2FkZFRvR2xvYmFsVHJhY2tlcigpXHJcbiAgICAgICAgY29uc3QgZWxlbWVudHMgPSB0aGlzLl9nZXRDaGlsZHJlbigpXHJcbiAgICAgICAgdGhpcy5ldmVudHMgPSB7XHJcbiAgICAgICAgICAgIGRyYWdTdGFydDogKGUpID0+IHRoaXMuX2RyYWdTdGFydChlKSxcclxuICAgICAgICAgICAgZHJhZ0VuZDogKGUpID0+IHRoaXMuX2RyYWdFbmQoZSksXHJcbiAgICAgICAgICAgIGRyYWdPdmVyOiAoZSkgPT4gdGhpcy5fZHJhZ092ZXIoZSksXHJcbiAgICAgICAgICAgIGRyb3A6IChlKSA9PiB0aGlzLl9kcm9wKGUpLFxyXG4gICAgICAgICAgICBkcmFnTGVhdmU6IChlKSA9PiB0aGlzLl9kcmFnTGVhdmUoZSksXHJcbiAgICAgICAgICAgIG1vdXNlT3ZlcjogKGUpID0+IHRoaXMuX21vdXNlRW50ZXIoZSksXHJcbiAgICAgICAgICAgIG1vdXNlRG93bjogKGUpID0+IHRoaXMuX21vdXNlRG93bihlKSxcclxuICAgICAgICAgICAgbW91c2VVcDogKGUpID0+IHRoaXMuX21vdXNlVXAoZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgZWxlbWVudHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5kcmFnQ2xhc3MgfHwgdXRpbHMuY29udGFpbnNDbGFzc05hbWUoY2hpbGQsIHRoaXMub3B0aW9ucy5kcmFnQ2xhc3MpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmF0dGFjaEVsZW1lbnQoY2hpbGQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIHRoaXMuZXZlbnRzLmRyYWdPdmVyKVxyXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIHRoaXMuZXZlbnRzLmRyb3ApXHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdkcmFnbGVhdmUnLCB0aGlzLmV2ZW50cy5kcmFnTGVhdmUpXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIHRoaXMuX2dldENoaWxkcmVuKCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHV0aWxzLnN0eWxlKGNoaWxkLCAnY3Vyc29yJywgdGhpcy5vcHRpb25zLmN1cnNvckhvdmVyKVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jdXJzb3JEb3duKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuZXZlbnRzLm1vdXNlRG93bilcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNoaWxkLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLmV2ZW50cy5tb3VzZVVwKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVtb3ZlcyBhbGwgZXZlbnQgaGFuZGxlcnMgZnJvbSB0aGlzLmVsZW1lbnQgYW5kIGNoaWxkcmVuXHJcbiAgICAgKi9cclxuICAgIGRlc3Ryb3koKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIHRoaXMuZXZlbnRzLmRyYWdPdmVyKVxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdkcm9wJywgdGhpcy5ldmVudHMuZHJvcClcclxuICAgICAgICBjb25zdCBlbGVtZW50cyA9IHRoaXMuX2dldENoaWxkcmVuKClcclxuICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBlbGVtZW50cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRWxlbWVudChjaGlsZClcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gdG9kbzogcmVtb3ZlIFNvcnRhYmxlLnRyYWNrZXIgYW5kIHJlbGF0ZWQgZXZlbnQgaGFuZGxlcnMgaWYgbm8gbW9yZSBzb3J0YWJsZXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHRoZSBnbG9iYWwgZGVmYXVsdHMgZm9yIG5ldyBTb3J0YWJsZSBvYmplY3RzXHJcbiAgICAgKiBAdHlwZSB7RGVmYXVsdE9wdGlvbnN9XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBnZXQgZGVmYXVsdHMoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBkZWZhdWx0c1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY3JlYXRlIG11bHRpcGxlIHNvcnRhYmxlIGVsZW1lbnRzXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50c1tdfSBlbGVtZW50c1xyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgLSBzZWUgY29uc3RydWN0b3IgZm9yIG9wdGlvbnNcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGNyZWF0ZShlbGVtZW50cywgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBjb25zdCByZXN1bHRzID0gW11cclxuICAgICAgICBmb3IgKGxldCBlbGVtZW50IG9mIGVsZW1lbnRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKG5ldyBTb3J0YWJsZShlbGVtZW50LCBvcHRpb25zKSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdHNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFkZCBhbiBlbGVtZW50IGFzIGEgY2hpbGQgb2YgdGhlIHNvcnRhYmxlIGVsZW1lbnQ7IGNhbiBhbHNvIGJlIHVzZWQgdG8gc3dhcCBiZXR3ZWVuIHNvcnRhYmxlc1xyXG4gICAgICogTk9URTogdGhpcyBtYXkgbm90IHdvcmsgd2l0aCBkZWVwU2VhcmNoIG5vbi1vcmRlcmVkIGVsZW1lbnRzOyB1c2UgYXR0YWNoRWxlbWVudCBpbnN0ZWFkXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXhcclxuICAgICAqL1xyXG4gICAgYWRkKGVsZW1lbnQsIGluZGV4KVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuYXR0YWNoRWxlbWVudChlbGVtZW50KVxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc29ydClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaW5kZXggPT09ICd1bmRlZmluZWQnIHx8IGluZGV4ID49IHRoaXMuZWxlbWVudC5jaGlsZHJlbi5sZW5ndGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChlbGVtZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50Lmluc2VydEJlZm9yZShlbGVtZW50LCB0aGlzLmVsZW1lbnQuY2hpbGRyZW5baW5kZXggKyAxXSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IHRoaXMub3B0aW9ucy5vcmRlcklkXHJcbiAgICAgICAgICAgIGxldCBkcmFnT3JkZXIgPSBlbGVtZW50LmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICAgICAgZHJhZ09yZGVyID0gdGhpcy5vcHRpb25zLm9yZGVySWRJc051bWJlciA/IHBhcnNlRmxvYXQoZHJhZ09yZGVyKSA6IGRyYWdPcmRlclxyXG4gICAgICAgICAgICBsZXQgZm91bmRcclxuICAgICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLl9nZXRDaGlsZHJlbih0cnVlKVxyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJldmVyc2VPcmRlcilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IGNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gY2hpbGRyZW5baV1cclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGREcmFnT3JkZXIgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGREcmFnT3JkZXIgPSB0aGlzLm9wdGlvbnMub3JkZXJJc051bWJlciA/IHBhcnNlRmxvYXQoY2hpbGREcmFnT3JkZXIpIDogY2hpbGREcmFnT3JkZXJcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ09yZGVyID4gY2hpbGREcmFnT3JkZXIpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShlbGVtZW50LCBjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgY2hpbGRyZW4pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkRHJhZ09yZGVyID0gY2hpbGQuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkRHJhZ09yZGVyID0gdGhpcy5vcHRpb25zLm9yZGVySXNOdW1iZXIgPyBwYXJzZUZsb2F0KGNoaWxkRHJhZ09yZGVyKSA6IGNoaWxkRHJhZ09yZGVyXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdPcmRlciA8IGNoaWxkRHJhZ09yZGVyKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZWxlbWVudCwgY2hpbGQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWZvdW5kKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZWxlbWVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGF0dGFjaGVzIGFuIEhUTUwgZWxlbWVudCB0byB0aGUgc29ydGFibGU7IGNhbiBhbHNvIGJlIHVzZWQgdG8gc3dhcCBiZXR3ZWVuIHNvcnRhYmxlc1xyXG4gICAgICogTk9URTogeW91IG5lZWQgdG8gbWFudWFsbHkgaW5zZXJ0IHRoZSBlbGVtZW50IGludG8gdGhpcy5lbGVtZW50ICh0aGlzIGlzIHVzZWZ1bCB3aGVuIHlvdSBoYXZlIGEgZGVlcCBzdHJ1Y3R1cmUpXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKi9cclxuICAgIGF0dGFjaEVsZW1lbnQoZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsID0gdGhpc1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUgPSB7XHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZTogdGhpcyxcclxuICAgICAgICAgICAgICAgIG9yaWdpbmFsOiB0aGlzXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGFkZCBhIGNvdW50ZXIgZm9yIG1heGltdW1cclxuICAgICAgICAgICAgdGhpcy5fbWF4aW11bUNvdW50ZXIoZWxlbWVudCwgdGhpcylcclxuXHJcbiAgICAgICAgICAgIC8vIGVuc3VyZSBldmVyeSBlbGVtZW50IGhhcyBhbiBpZFxyXG4gICAgICAgICAgICBpZiAoIWVsZW1lbnQuaWQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuaWQgPSAnX19zb3J0YWJsZS0nICsgdGhpcy5vcHRpb25zLm5hbWUgKyAnLScgKyBTb3J0YWJsZS50cmFja2VyW3RoaXMub3B0aW9ucy5uYW1lXS5jb3VudGVyXHJcbiAgICAgICAgICAgICAgICBTb3J0YWJsZS50cmFja2VyW3RoaXMub3B0aW9ucy5uYW1lXS5jb3VudGVyKytcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmNvcHkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5jb3B5ID0gMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ3N0YXJ0JywgdGhpcy5ldmVudHMuZHJhZ1N0YXJ0KVxyXG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdlbmQnLCB0aGlzLmV2ZW50cy5kcmFnRW5kKVxyXG4gICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnZHJhZ2dhYmxlJywgdHJ1ZSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZW1vdmVzIGFsbCBldmVudHMgZnJvbSBhbiBIVE1MIGVsZW1lbnRcclxuICAgICAqIE5PVEU6IGRvZXMgbm90IHJlbW92ZSB0aGUgZWxlbWVudCBmcm9tIGl0cyBwYXJlbnRcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqL1xyXG4gICAgcmVtb3ZlRWxlbWVudChlbGVtZW50KVxyXG4gICAge1xyXG4gICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJhZ3N0YXJ0JywgdGhpcy5ldmVudHMuZHJhZ1N0YXJ0KVxyXG4gICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJhZ2VuZCcsIHRoaXMuZXZlbnRzLmRyYWdFbmQpXHJcbiAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RyYWdnYWJsZScsIGZhbHNlKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYWRkIHNvcnRhYmxlIHRvIGdsb2JhbCBsaXN0IHRoYXQgdHJhY2tzIGFsbCBzb3J0YWJsZXNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9hZGRUb0dsb2JhbFRyYWNrZXIoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICghU29ydGFibGUudHJhY2tlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFNvcnRhYmxlLmRyYWdJbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgICAgICAgIFNvcnRhYmxlLmRyYWdJbWFnZS5pZCA9ICdzb3J0YWJsZS1kcmFnSW1hZ2UnXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoU29ydGFibGUuZHJhZ0ltYWdlKVxyXG4gICAgICAgICAgICBTb3J0YWJsZS50cmFja2VyID0ge31cclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIChlKSA9PiB0aGlzLl9ib2R5RHJhZ092ZXIoZSkpXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIChlKSA9PiB0aGlzLl9ib2R5RHJvcChlKSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKFNvcnRhYmxlLnRyYWNrZXJbdGhpcy5vcHRpb25zLm5hbWVdKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgU29ydGFibGUudHJhY2tlclt0aGlzLm9wdGlvbnMubmFtZV0ubGlzdC5wdXNoKHRoaXMpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFNvcnRhYmxlLnRyYWNrZXJbdGhpcy5vcHRpb25zLm5hbWVdID0geyBsaXN0OiBbdGhpc10sIGNvdW50ZXI6IDAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGRlZmF1bHQgZHJhZyBvdmVyIGZvciB0aGUgYm9keVxyXG4gICAgICogQHBhcmFtIHtEcmFnRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9ib2R5RHJhZ092ZXIoZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBuYW1lID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMF1cclxuICAgICAgICBpZiAoU29ydGFibGUudHJhY2tlcltuYW1lXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMV1cclxuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxyXG4gICAgICAgICAgICBjb25zdCBzb3J0YWJsZSA9IHRoaXMuX2ZpbmRDbG9zZXN0KGUsIFNvcnRhYmxlLnRyYWNrZXJbbmFtZV0ubGlzdCwgZWxlbWVudClcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc29ydGFibGUubGFzdCAmJiBNYXRoLmFicyhzb3J0YWJsZS5sYXN0LnggLSBlLnBhZ2VYKSA8IHNvcnRhYmxlLm9wdGlvbnMudGhyZXNob2xkICYmIE1hdGguYWJzKHNvcnRhYmxlLmxhc3QueSAtIGUucGFnZVkpIDwgc29ydGFibGUub3B0aW9ucy50aHJlc2hvbGQpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZS5fdXBkYXRlRHJhZ2dpbmcoZSwgZWxlbWVudClcclxuICAgICAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlLmxhc3QgPSB7IHg6IGUucGFnZVgsIHk6IGUucGFnZVkgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3BsYWNlSW5MaXN0KHNvcnRhYmxlLCBlLnBhZ2VYLCBlLnBhZ2VZLCBlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgICAgIGUuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSAnbW92ZSdcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVEcmFnZ2luZyhlLCBlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX25vRHJvcChlKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgbm8gZHJvcFxyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBlXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjYW5jZWxdIGZvcmNlIGNhbmNlbCAoZm9yIG9wdGlvbnMuY29weSlcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9ub0Ryb3AoZSwgY2FuY2VsKVxyXG4gICAge1xyXG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSAnbW92ZSdcclxuICAgICAgICBjb25zdCBpZCA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzFdXHJcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxyXG4gICAgICAgIGlmIChlbGVtZW50KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlRHJhZ2dpbmcoZSwgZWxlbWVudClcclxuICAgICAgICAgICAgdGhpcy5fc2V0SWNvbihlbGVtZW50LCBudWxsLCBjYW5jZWwpXHJcbiAgICAgICAgICAgIGlmICghY2FuY2VsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsLm9wdGlvbnMub2ZmTGlzdCA9PT0gJ2RlbGV0ZScpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5ID0gZWxlbWVudC5zdHlsZS5kaXNwbGF5IHx8ICd1bnNldCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbC5lbWl0KCdkZWxldGUtcGVuZGluZycsIGVsZW1lbnQsIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbClcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmICghZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsLm9wdGlvbnMuY29weSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZXBsYWNlSW5MaXN0KGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCwgZWxlbWVudClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2NsZWFyTWF4aW11bVBlbmRpbmcoZWxlbWVudC5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuY3VycmVudC5lbWl0KCdhZGQtcmVtb3ZlLXBlbmRpbmcnLCBlbGVtZW50LCBlbGVtZW50Ll9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5jdXJyZW50LmVtaXQoJ3VwZGF0ZS1wZW5kaW5nJywgZWxlbWVudCwgZWxlbWVudC5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuY3VycmVudCA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGRlZmF1bHQgZHJvcCBmb3IgdGhlIGJvZHlcclxuICAgICAqIEBwYXJhbSB7RHJhZ0V2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfYm9keURyb3AoZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBuYW1lID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMF1cclxuICAgICAgICBpZiAoU29ydGFibGUudHJhY2tlcltuYW1lXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMV1cclxuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxyXG4gICAgICAgICAgICBjb25zdCBzb3J0YWJsZSA9IHRoaXMuX2ZpbmRDbG9zZXN0KGUsIFNvcnRhYmxlLnRyYWNrZXJbbmFtZV0ubGlzdCwgZWxlbWVudClcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlbW92ZURyYWdnaW5nKGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmUoKVxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkgPSBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsLmVtaXQoJ2RlbGV0ZScsIGVsZW1lbnQsIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbClcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgPSBudWxsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBlbmQgZHJhZ1xyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZHJhZ0VuZChlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBlLmN1cnJlbnRUYXJnZXRcclxuICAgICAgICBjb25zdCBkcmFnZ2luZyA9IGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnZ2luZ1xyXG4gICAgICAgIGlmIChkcmFnZ2luZylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGRyYWdnaW5nLnJlbW92ZSgpXHJcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZy5pY29uKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnJlbW92ZSgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmRyYWdnaW5nID0gbnVsbFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHN0YXJ0IGRyYWdcclxuICAgICAqIEBwYXJhbSB7VUlFdmVudH0gZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2RyYWdTdGFydChlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHNvcnRhYmxlID0gZS5jdXJyZW50VGFyZ2V0Ll9fc29ydGFibGUub3JpZ2luYWxcclxuICAgICAgICBjb25zdCBkcmFnZ2luZyA9IGUuY3VycmVudFRhcmdldC5jbG9uZU5vZGUodHJ1ZSlcclxuICAgICAgICBmb3IgKGxldCBzdHlsZSBpbiBzb3J0YWJsZS5vcHRpb25zLmRyYWdTdHlsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGRyYWdnaW5nLnN0eWxlW3N0eWxlXSA9IHNvcnRhYmxlLm9wdGlvbnMuZHJhZ1N0eWxlW3N0eWxlXVxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBwb3MgPSB1dGlscy50b0dsb2JhbChlLmN1cnJlbnRUYXJnZXQpXHJcbiAgICAgICAgZHJhZ2dpbmcuc3R5bGUubGVmdCA9IHBvcy54ICsgJ3B4J1xyXG4gICAgICAgIGRyYWdnaW5nLnN0eWxlLnRvcCA9IHBvcy55ICsgJ3B4J1xyXG4gICAgICAgIGNvbnN0IG9mZnNldCA9IHsgeDogcG9zLnggLSBlLnBhZ2VYLCB5OiBwb3MueSAtIGUucGFnZVkgfVxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZHJhZ2dpbmcpXHJcbiAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMudXNlSWNvbnMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBpbWFnZSA9IG5ldyBJbWFnZSgpXHJcbiAgICAgICAgICAgIGltYWdlLnNyYyA9IHNvcnRhYmxlLm9wdGlvbnMuaWNvbnMucmVvcmRlclxyXG4gICAgICAgICAgICBpbWFnZS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcclxuICAgICAgICAgICAgaW1hZ2Uuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgtNTAlLCAtNTAlKSdcclxuICAgICAgICAgICAgaW1hZ2Uuc3R5bGUubGVmdCA9IGRyYWdnaW5nLm9mZnNldExlZnQgKyBkcmFnZ2luZy5vZmZzZXRXaWR0aCArICdweCdcclxuICAgICAgICAgICAgaW1hZ2Uuc3R5bGUudG9wID0gZHJhZ2dpbmcub2Zmc2V0VG9wICsgZHJhZ2dpbmcub2Zmc2V0SGVpZ2h0ICsgJ3B4J1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGltYWdlKVxyXG4gICAgICAgICAgICBkcmFnZ2luZy5pY29uID0gaW1hZ2VcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMuY3Vyc29ySG92ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB1dGlscy5zdHlsZShlLmN1cnJlbnRUYXJnZXQsICdjdXJzb3InLCBzb3J0YWJsZS5vcHRpb25zLmN1cnNvckhvdmVyKVxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdGFyZ2V0ID0gZS5jdXJyZW50VGFyZ2V0XHJcbiAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMuY29weSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRhcmdldCA9IGUuY3VycmVudFRhcmdldC5jbG9uZU5vZGUodHJ1ZSlcclxuICAgICAgICAgICAgdGFyZ2V0LmlkID0gZS5jdXJyZW50VGFyZ2V0LmlkICsgJy1jb3B5LScgKyBlLmN1cnJlbnRUYXJnZXQuX19zb3J0YWJsZS5jb3B5XHJcbiAgICAgICAgICAgIGUuY3VycmVudFRhcmdldC5fX3NvcnRhYmxlLmNvcHkrK1xyXG4gICAgICAgICAgICBzb3J0YWJsZS5hdHRhY2hFbGVtZW50KHRhcmdldClcclxuICAgICAgICAgICAgdGFyZ2V0Ll9fc29ydGFibGUuaXNDb3B5ID0gdHJ1ZVxyXG4gICAgICAgICAgICB0YXJnZXQuX19zb3J0YWJsZS5vcmlnaW5hbCA9IHRoaXNcclxuICAgICAgICAgICAgdGFyZ2V0Ll9fc29ydGFibGUuZGlzcGxheSA9IHRhcmdldC5zdHlsZS5kaXNwbGF5IHx8ICd1bnNldCdcclxuICAgICAgICAgICAgdGFyZ2V0LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0YXJnZXQpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLmNsZWFyRGF0YSgpXHJcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuc2V0RGF0YShzb3J0YWJsZS5vcHRpb25zLm5hbWUsIHNvcnRhYmxlLm9wdGlvbnMubmFtZSlcclxuICAgICAgICBlLmRhdGFUcmFuc2Zlci5zZXREYXRhKHRhcmdldC5pZCwgdGFyZ2V0LmlkKVxyXG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLnNldERyYWdJbWFnZShTb3J0YWJsZS5kcmFnSW1hZ2UsIDAsIDApXHJcbiAgICAgICAgdGFyZ2V0Ll9fc29ydGFibGUuY3VycmVudCA9IHRoaXNcclxuICAgICAgICB0YXJnZXQuX19zb3J0YWJsZS5pbmRleCA9IHNvcnRhYmxlLm9wdGlvbnMuY29weSA/IC0xIDogc29ydGFibGUuX2dldEluZGV4KHRhcmdldClcclxuICAgICAgICB0YXJnZXQuX19zb3J0YWJsZS5kcmFnZ2luZyA9IGRyYWdnaW5nXHJcbiAgICAgICAgdGFyZ2V0Ll9fc29ydGFibGUub2Zmc2V0ID0gb2Zmc2V0XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgZHJhZyBsZWF2ZSBldmVudHMgZm9yIHNvcnRhYmxlIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7RHJhZ0V2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZHJhZ0xlYXZlKGUpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3Qgc29ydGFibGUgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1swXVxyXG4gICAgICAgIGlmIChzb3J0YWJsZSAmJiBzb3J0YWJsZSA9PT0gdGhpcy5vcHRpb25zLm5hbWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLl9jbGVhck1heGltdW1QZW5kaW5nKHNvcnRhYmxlKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSBkcmFnIG92ZXIgZXZlbnRzIGZvciBzb3J0YWJsZSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge0RyYWdFdmVudH0gZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2RyYWdPdmVyKGUpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3Qgc29ydGFibGUgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1swXVxyXG4gICAgICAgIGlmIChzb3J0YWJsZSAmJiBzb3J0YWJsZSA9PT0gdGhpcy5vcHRpb25zLm5hbWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzFdXHJcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZClcclxuICAgICAgICAgICAgaWYgKHRoaXMubGFzdCAmJiBNYXRoLmFicyh0aGlzLmxhc3QueCAtIGUucGFnZVgpIDwgdGhpcy5vcHRpb25zLnRocmVzaG9sZCAmJiBNYXRoLmFicyh0aGlzLmxhc3QueSAtIGUucGFnZVkpIDwgdGhpcy5vcHRpb25zLnRocmVzaG9sZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlRHJhZ2dpbmcoZSwgZWxlbWVudClcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5sYXN0ID0geyB4OiBlLnBhZ2VYLCB5OiBlLnBhZ2VZIH1cclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5pc0NvcHkgJiYgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsID09PSB0aGlzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9ub0Ryb3AoZSwgdHJ1ZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLm9wdGlvbnMuZHJvcCB8fCBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgPT09IHRoaXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3BsYWNlSW5MaXN0KHRoaXMsIGUucGFnZVgsIGUucGFnZVksIGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICBlLmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gZWxlbWVudC5fX3NvcnRhYmxlLmlzQ29weSA/ICdjb3B5JyA6ICdtb3ZlJ1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlRHJhZ2dpbmcoZSwgZWxlbWVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX25vRHJvcChlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdXBkYXRlIHRoZSBkcmFnZ2luZyBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF91cGRhdGVEcmFnZ2luZyhlLCBlbGVtZW50KVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGRyYWdnaW5nID0gZWxlbWVudC5fX3NvcnRhYmxlLmRyYWdnaW5nXHJcbiAgICAgICAgY29uc3Qgb2Zmc2V0ID0gZWxlbWVudC5fX3NvcnRhYmxlLm9mZnNldFxyXG4gICAgICAgIGlmIChkcmFnZ2luZylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGRyYWdnaW5nLnN0eWxlLmxlZnQgPSBlLnBhZ2VYICsgb2Zmc2V0LnggKyAncHgnXHJcbiAgICAgICAgICAgIGRyYWdnaW5nLnN0eWxlLnRvcCA9IGUucGFnZVkgKyBvZmZzZXQueSArICdweCdcclxuICAgICAgICAgICAgaWYgKGRyYWdnaW5nLmljb24pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGRyYWdnaW5nLmljb24uc3R5bGUubGVmdCA9IGRyYWdnaW5nLm9mZnNldExlZnQgKyBkcmFnZ2luZy5vZmZzZXRXaWR0aCArICdweCdcclxuICAgICAgICAgICAgICAgIGRyYWdnaW5nLmljb24uc3R5bGUudG9wID0gZHJhZ2dpbmcub2Zmc2V0VG9wICsgZHJhZ2dpbmcub2Zmc2V0SGVpZ2h0ICsgJ3B4J1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVtb3ZlIHRoZSBkcmFnZ2luZyBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcmVtb3ZlRHJhZ2dpbmcoZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBkcmFnZ2luZyA9IGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnZ2luZ1xyXG4gICAgICAgIGlmIChkcmFnZ2luZylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGRyYWdnaW5nLnJlbW92ZSgpXHJcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZy5pY29uKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnJlbW92ZSgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmRyYWdnaW5nID0gbnVsbFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuaXNDb3B5ID0gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGRyb3AgdGhlIGVsZW1lbnQgaW50byBhIHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZHJvcChlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IG5hbWUgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1swXVxyXG4gICAgICAgIGlmIChTb3J0YWJsZS50cmFja2VyW25hbWVdICYmIG5hbWUgPT09IHRoaXMub3B0aW9ucy5uYW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1sxXVxyXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCAhPT0gdGhpcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwuZW1pdCgncmVtb3ZlJywgZWxlbWVudCwgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgnYWRkJywgZWxlbWVudCwgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgPSB0aGlzXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zb3J0KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdvcmRlcicsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUuaXNDb3B5KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdjb3B5JywgZWxlbWVudCwgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbWF4aW11bShlbGVtZW50LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgndXBkYXRlJywgZWxlbWVudCwgdGhpcylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLmluZGV4ICE9PSB0aGlzLl9nZXRJbmRleChlLmN1cnJlbnRUYXJnZXQpKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdvcmRlcicsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgndXBkYXRlJywgZWxlbWVudCwgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fcmVtb3ZlRHJhZ2dpbmcoZWxlbWVudClcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmaW5kIGNsb3Nlc3QgU29ydGFibGUgdG8gc2NyZWVuIGxvY2F0aW9uXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGVbXX0gbGlzdCBvZiByZWxhdGVkIFNvcnRhYmxlc1xyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2ZpbmRDbG9zZXN0KGUsIGxpc3QsIGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IG1pbiA9IEluZmluaXR5LCBmb3VuZFxyXG4gICAgICAgIGZvciAobGV0IHJlbGF0ZWQgb2YgbGlzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICgoIXJlbGF0ZWQub3B0aW9ucy5kcm9wICYmIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCAhPT0gcmVsYXRlZCkgfHxcclxuICAgICAgICAgICAgICAgIChlbGVtZW50Ll9fc29ydGFibGUuaXNDb3B5ICYmIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9PT0gcmVsYXRlZCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHV0aWxzLmluc2lkZShlLnBhZ2VYLCBlLnBhZ2VZLCByZWxhdGVkLmVsZW1lbnQpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVsYXRlZFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHJlbGF0ZWQub3B0aW9ucy5vZmZMaXN0ID09PSAnY2xvc2VzdCcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNhbGN1bGF0ZSA9IHV0aWxzLmRpc3RhbmNlVG9DbG9zZXN0Q29ybmVyKGUucGFnZVgsIGUucGFnZVksIHJlbGF0ZWQuZWxlbWVudClcclxuICAgICAgICAgICAgICAgIGlmIChjYWxjdWxhdGUgPCBtaW4pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWluID0gY2FsY3VsYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgZm91bmQgPSByZWxhdGVkXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZvdW5kXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwbGFjZSBpbmRpY2F0b3IgaW4gdGhlIHNvcnRhYmxlIGxpc3QgYWNjb3JkaW5nIHRvIG9wdGlvbnMuc29ydFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BsYWNlSW5MaXN0KHNvcnRhYmxlLCB4LCB5LCBlbGVtZW50KVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc29ydClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuX3BsYWNlSW5Tb3J0YWJsZUxpc3Qoc29ydGFibGUsIHgsIHksIGVsZW1lbnQpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuX3BsYWNlSW5PcmRlcmVkTGlzdChzb3J0YWJsZSwgZWxlbWVudClcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fc2V0SWNvbihlbGVtZW50LCBzb3J0YWJsZSlcclxuICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheSA9PT0gJ3Vuc2V0JyA/ICcnIDogZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXlcclxuICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkgPSBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVwbGFjZSBpdGVtIGluIGxpc3QgYXQgb3JpZ2luYWwgaW5kZXggcG9zaXRpb25cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9yZXBsYWNlSW5MaXN0KHNvcnRhYmxlLCBlbGVtZW50KVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gc29ydGFibGUuX2dldENoaWxkcmVuKClcclxuICAgICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaW5kZXggPSBlbGVtZW50Ll9fc29ydGFibGUuaW5kZXhcclxuICAgICAgICAgICAgaWYgKGluZGV4IDwgY2hpbGRyZW4ubGVuZ3RoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlbltpbmRleF0ucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZWxlbWVudCwgY2hpbGRyZW5baW5kZXhdKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2hpbGRyZW5bMF0uYXBwZW5kQ2hpbGQoZWxlbWVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbGVtZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY291bnQgdGhlIGluZGV4IG9mIHRoZSBjaGlsZCBpbiB0aGUgbGlzdCBvZiBjaGlsZHJlblxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gY2hpbGRcclxuICAgICAqIEByZXR1cm4ge251bWJlcn1cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9nZXRJbmRleChjaGlsZClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuX2dldENoaWxkcmVuKClcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGNoaWxkcmVuW2ldID09PSBjaGlsZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHRyYXZlcnNlIGFuZCBzZWFyY2ggZGVzY2VuZGVudHMgaW4gRE9NXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBiYXNlXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2VhcmNoXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50W119IHJlc3VsdHMgdG8gcmV0dXJuXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfdHJhdmVyc2VDaGlsZHJlbihiYXNlLCBzZWFyY2gsIHJlc3VsdHMpXHJcbiAgICB7XHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgYmFzZS5jaGlsZHJlbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChzZWFyY2gubGVuZ3RoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2VhcmNoLmluZGV4T2YoY2hpbGQuY2xhc3NOYW1lKSAhPT0gLTEpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGNoaWxkKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3RyYXZlcnNlQ2hpbGRyZW4oY2hpbGQsIHNlYXJjaCwgcmVzdWx0cylcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmaW5kIGNoaWxkcmVuIGluIGRpdlxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29yZGVyXSBzZWFyY2ggZm9yIGRyYWdPcmRlciBhcyB3ZWxsXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZ2V0Q2hpbGRyZW4ob3JkZXIpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kZWVwU2VhcmNoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IHNlYXJjaCA9IFtdXHJcbiAgICAgICAgICAgIGlmIChvcmRlciAmJiB0aGlzLm9wdGlvbnMub3JkZXJDbGFzcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoLnB1c2godGhpcy5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChvcmRlciAmJiB0aGlzLm9wdGlvbnMub3JkZXJDbGFzcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2gucHVzaCh0aGlzLm9wdGlvbnMub3JkZXJDbGFzcylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICghb3JkZXIgJiYgdGhpcy5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc2VhcmNoLnB1c2godGhpcy5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCByZXN1bHRzID0gW11cclxuICAgICAgICAgICAgdGhpcy5fdHJhdmVyc2VDaGlsZHJlbih0aGlzLmVsZW1lbnQsIHNlYXJjaCwgcmVzdWx0cylcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHNcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxldCBsaXN0ID0gW11cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIHRoaXMuZWxlbWVudC5jaGlsZHJlbilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodXRpbHMuY29udGFpbnNDbGFzc05hbWUoY2hpbGQsIHRoaXMub3B0aW9ucy5kcmFnQ2xhc3MpIHx8IChvcmRlciAmJiAhdGhpcy5vcHRpb25zLm9yZGVyQ2xhc3MgfHwgKG9yZGVyICYmIHRoaXMub3B0aW9ucy5vcmRlckNsYXNzICYmIHV0aWxzLmNvbnRhaW5zQ2xhc3NOYW1lKGNoaWxkLCB0aGlzLm9wdGlvbnMub3JkZXJDbGFzcykpKSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpc3QucHVzaChjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbGlzdFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbGlzdCA9IFtdXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiB0aGlzLmVsZW1lbnQuY2hpbGRyZW4pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGlzdC5wdXNoKGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGxpc3RcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBsYWNlIGluZGljYXRvciBpbiBhbiBvcmRlcmVkIGxpc3RcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BsYWNlSW5PcmRlcmVkTGlzdChzb3J0YWJsZSwgZHJhZ2dpbmcpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudCAhPT0gc29ydGFibGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IHNvcnRhYmxlLm9wdGlvbnMub3JkZXJJZFxyXG4gICAgICAgICAgICBsZXQgZHJhZ09yZGVyID0gZHJhZ2dpbmcuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICBkcmFnT3JkZXIgPSBzb3J0YWJsZS5vcHRpb25zLm9yZGVySWRJc051bWJlciA/IHBhcnNlRmxvYXQoZHJhZ09yZGVyKSA6IGRyYWdPcmRlclxyXG4gICAgICAgICAgICBsZXQgZm91bmRcclxuICAgICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4odHJ1ZSlcclxuICAgICAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMucmV2ZXJzZU9yZGVyKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBjaGlsZHJlbltpXVxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZERyYWdPcmRlciA9IGNoaWxkLmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZERyYWdPcmRlciA9IHNvcnRhYmxlLm9wdGlvbnMub3JkZXJJc051bWJlciA/IHBhcnNlRmxvYXQoY2hpbGREcmFnT3JkZXIpIDogY2hpbGREcmFnT3JkZXJcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ09yZGVyID4gY2hpbGREcmFnT3JkZXIpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShkcmFnZ2luZywgY2hpbGQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGNoaWxkcmVuKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZERyYWdPcmRlciA9IGNoaWxkLmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZERyYWdPcmRlciA9IHNvcnRhYmxlLm9wdGlvbnMub3JkZXJJc051bWJlciA/IHBhcnNlRmxvYXQoY2hpbGREcmFnT3JkZXIpIDogY2hpbGREcmFnT3JkZXJcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ09yZGVyIDwgY2hpbGREcmFnT3JkZXIpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShkcmFnZ2luZywgY2hpbGQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWZvdW5kKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbGVtZW50LmFwcGVuZENoaWxkKGRyYWdnaW5nKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgIT09IGRyYWdnaW5nLl9fc29ydGFibGUub3JpZ2luYWwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50LmVtaXQoJ2FkZC1yZW1vdmUtcGVuZGluZycsIGRyYWdnaW5nLCBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50LmVtaXQoJ3JlbW92ZS1wZW5kaW5nJywgZHJhZ2dpbmcsIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdhZGQtcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuaXNDb3B5KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdjb3B5LXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50ID0gc29ydGFibGVcclxuICAgICAgICAgICAgdGhpcy5fbWF4aW11bVBlbmRpbmcoZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCd1cGRhdGUtcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzZWFyY2ggZm9yIHdoZXJlIHRvIHBsYWNlIHVzaW5nIHBlcmNlbnRhZ2VcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHJldHVybnMge251bWJlcn0gMCA9IG5vdCBmb3VuZDsgMSA9IG5vdGhpbmcgdG8gZG87IDIgPSBtb3ZlZFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BsYWNlQnlQZXJjZW50YWdlKHNvcnRhYmxlLCBkcmFnZ2luZylcclxuICAgIHtcclxuICAgICAgICBjb25zdCBjdXJzb3IgPSBkcmFnZ2luZy5fX3NvcnRhYmxlLmRyYWdnaW5nXHJcbiAgICAgICAgY29uc3QgeGExID0gY3Vyc29yLm9mZnNldExlZnRcclxuICAgICAgICBjb25zdCB5YTEgPSBjdXJzb3Iub2Zmc2V0VG9wXHJcbiAgICAgICAgY29uc3QgeGEyID0gY3Vyc29yLm9mZnNldExlZnQgKyBjdXJzb3Iub2Zmc2V0V2lkdGhcclxuICAgICAgICBjb25zdCB5YTIgPSBjdXJzb3Iub2Zmc2V0VG9wICsgY3Vyc29yLm9mZnNldEhlaWdodFxyXG4gICAgICAgIGxldCBsYXJnZXN0ID0gMCwgY2xvc2VzdCwgaXNCZWZvcmUsIGluZGljYXRvclxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBzb3J0YWJsZS5lbGVtZW50XHJcbiAgICAgICAgY29uc3QgZWxlbWVudHMgPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4odHJ1ZSlcclxuICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBlbGVtZW50cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChjaGlsZCA9PT0gZHJhZ2dpbmcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGluZGljYXRvciA9IHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBwb3MgPSB1dGlscy50b0dsb2JhbChjaGlsZClcclxuICAgICAgICAgICAgY29uc3QgeGIxID0gcG9zLnhcclxuICAgICAgICAgICAgY29uc3QgeWIxID0gcG9zLnlcclxuICAgICAgICAgICAgY29uc3QgeGIyID0gcG9zLnggKyBjaGlsZC5vZmZzZXRXaWR0aFxyXG4gICAgICAgICAgICBjb25zdCB5YjIgPSBwb3MueSArIGNoaWxkLm9mZnNldEhlaWdodFxyXG4gICAgICAgICAgICBjb25zdCBwZXJjZW50YWdlID0gdXRpbHMucGVyY2VudGFnZSh4YTEsIHlhMSwgeGEyLCB5YTIsIHhiMSwgeWIxLCB4YjIsIHliMilcclxuICAgICAgICAgICAgaWYgKHBlcmNlbnRhZ2UgPiBsYXJnZXN0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsYXJnZXN0ID0gcGVyY2VudGFnZVxyXG4gICAgICAgICAgICAgICAgY2xvc2VzdCA9IGNoaWxkXHJcbiAgICAgICAgICAgICAgICBpc0JlZm9yZSA9IGluZGljYXRvclxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjbG9zZXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGNsb3Nlc3QgPT09IGRyYWdnaW5nKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpc0JlZm9yZSAmJiBjbG9zZXN0Lm5leHRTaWJsaW5nKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Lmluc2VydEJlZm9yZShkcmFnZ2luZywgY2xvc2VzdC5uZXh0U2libGluZylcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ29yZGVyLXBlbmRpbmcnLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKGRyYWdnaW5nLCBjbG9zZXN0KVxyXG4gICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnb3JkZXItcGVuZGluZycsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAyXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiAwXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2VhcmNoIGZvciB3aGVyZSB0byBwbGFjZSB1c2luZyBkaXN0YW5jZVxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IGZhbHNlPW5vdGhpbmcgdG8gZG9cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9wbGFjZUJ5RGlzdGFuY2Uoc29ydGFibGUsIGRyYWdnaW5nLCB4LCB5KVxyXG4gICAge1xyXG4gICAgICAgIGlmICh1dGlscy5pbnNpZGUoeCwgeSwgZHJhZ2dpbmcpKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGluZGV4ID0gLTFcclxuICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50ID09PSBzb3J0YWJsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGluZGV4ID0gc29ydGFibGUuX2dldEluZGV4KGRyYWdnaW5nKVxyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbGVtZW50LmFwcGVuZENoaWxkKGRyYWdnaW5nKVxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgZGlzdGFuY2UgPSBJbmZpbml0eSwgY2xvc2VzdFxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBzb3J0YWJsZS5lbGVtZW50XHJcbiAgICAgICAgY29uc3QgZWxlbWVudHMgPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4odHJ1ZSlcclxuICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBlbGVtZW50cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh1dGlscy5pbnNpZGUoeCwgeSwgY2hpbGQpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjbG9zZXN0ID0gY2hpbGRcclxuICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBtZWFzdXJlID0gdXRpbHMuZGlzdGFuY2VUb0Nsb3Nlc3RDb3JuZXIoeCwgeSwgY2hpbGQpXHJcbiAgICAgICAgICAgICAgICBpZiAobWVhc3VyZSA8IGRpc3RhbmNlKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsb3Nlc3QgPSBjaGlsZFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc3RhbmNlID0gbWVhc3VyZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKGRyYWdnaW5nLCBjbG9zZXN0KVxyXG4gICAgICAgIGlmIChpbmRleCA9PT0gc29ydGFibGUuX2dldEluZGV4KGRyYWdnaW5nKSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX21heGltdW1QZW5kaW5nKGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICBzb3J0YWJsZS5lbWl0KCdvcmRlci1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGxhY2UgaW5kaWNhdG9yIGluIGFuIHNvcnRhYmxlIGxpc3RcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmdcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9wbGFjZUluU29ydGFibGVMaXN0KHNvcnRhYmxlLCB4LCB5LCBkcmFnZ2luZylcclxuICAgIHtcclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gc29ydGFibGUuZWxlbWVudFxyXG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gc29ydGFibGUuX2dldENoaWxkcmVuKClcclxuICAgICAgICBpZiAoIWNoaWxkcmVuLmxlbmd0aClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoZHJhZ2dpbmcpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIGNvbnN0IHBlcmNlbnRhZ2UgPSB0aGlzLl9wbGFjZUJ5UGVyY2VudGFnZShzb3J0YWJsZSwgZHJhZ2dpbmcpXHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9wbGFjZUJ5RGlzdGFuY2Uoc29ydGFibGUsIGRyYWdnaW5nLCB4LCB5KSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudCAhPT0gc29ydGFibGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdhZGQtcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuaXNDb3B5KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdjb3B5LXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudCAhPT0gZHJhZ2dpbmcuX19zb3J0YWJsZS5vcmlnaW5hbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQuZW1pdCgnYWRkLXJlbW92ZS1wZW5kaW5nJywgZHJhZ2dpbmcsIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQuZW1pdCgncmVtb3ZlLXBlbmRpbmcnLCBkcmFnZ2luZywgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudCA9IHNvcnRhYmxlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX21heGltdW1QZW5kaW5nKGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICBzb3J0YWJsZS5lbWl0KCd1cGRhdGUtcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNldCBpY29uIGlmIGF2YWlsYWJsZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmdcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjYW5jZWxdIGZvcmNlIGNhbmNlbCAoZm9yIG9wdGlvbnMuY29weSlcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9zZXRJY29uKGVsZW1lbnQsIHNvcnRhYmxlLCBjYW5jZWwpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgZHJhZ2dpbmcgPSBlbGVtZW50Ll9fc29ydGFibGUuZHJhZ2dpbmdcclxuICAgICAgICBpZiAoZHJhZ2dpbmcgJiYgZHJhZ2dpbmcuaWNvbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICghc29ydGFibGUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlID0gZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsXHJcbiAgICAgICAgICAgICAgICBpZiAoY2FuY2VsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnaW5nLmljb24uc3JjID0gc29ydGFibGUub3B0aW9ucy5pY29ucy5jYW5jZWxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnNyYyA9IHNvcnRhYmxlLm9wdGlvbnMub2ZmTGlzdCA9PT0gJ2RlbGV0ZScgPyBzb3J0YWJsZS5vcHRpb25zLmljb25zLmRlbGV0ZSA6IHNvcnRhYmxlLm9wdGlvbnMuaWNvbnMuY2FuY2VsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLmlzQ29weSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnNyYyA9IHNvcnRhYmxlLm9wdGlvbnMuaWNvbnMuY29weVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnaW5nLmljb24uc3JjID0gZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsID09PSBzb3J0YWJsZSA/IHNvcnRhYmxlLm9wdGlvbnMuaWNvbnMucmVvcmRlciA6IHNvcnRhYmxlLm9wdGlvbnMuaWNvbnMubW92ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYWRkIGEgbWF4aW11bSBjb3VudGVyIHRvIHRoZSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX21heGltdW1Db3VudGVyKGVsZW1lbnQsIHNvcnRhYmxlKVxyXG4gICAge1xyXG4gICAgICAgIGxldCBjb3VudCA9IC0xXHJcbiAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMubWF4aW11bSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gc29ydGFibGUuX2dldENoaWxkcmVuKClcclxuICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgY2hpbGRyZW4pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChjaGlsZCAhPT0gZWxlbWVudCAmJiBjaGlsZC5fX3NvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvdW50ID0gY2hpbGQuX19zb3J0YWJsZS5tYXhpbXVtID4gY291bnQgPyBjaGlsZC5fX3NvcnRhYmxlLm1heGltdW0gOiBjb3VudFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5tYXhpbXVtID0gY291bnQgKyAxXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgbWF4aW11bVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX21heGltdW0oZWxlbWVudCwgc29ydGFibGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMubWF4aW11bSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gc29ydGFibGUuX2dldENoaWxkcmVuKClcclxuICAgICAgICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA+IHNvcnRhYmxlLm9wdGlvbnMubWF4aW11bSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHNvcnRhYmxlLnJlbW92ZVBlbmRpbmcpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKHNvcnRhYmxlLnJlbW92ZVBlbmRpbmcubGVuZ3RoKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBzb3J0YWJsZS5yZW1vdmVQZW5kaW5nLnBvcCgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLnN0eWxlLmRpc3BsYXkgPSBjaGlsZC5fX3NvcnRhYmxlLmRpc3BsYXkgPT09ICd1bnNldCcgPyAnJyA6IGNoaWxkLl9fc29ydGFibGUuZGlzcGxheVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5fX3NvcnRhYmxlLmRpc3BsYXkgPSBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLnJlbW92ZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ21heGltdW0tcmVtb3ZlJywgY2hpbGQsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZS5yZW1vdmVQZW5kaW5nID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX21heGltdW1Db3VudGVyKGVsZW1lbnQsIHNvcnRhYmxlKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNsZWFyIHBlbmRpbmcgbGlzdFxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9jbGVhck1heGltdW1QZW5kaW5nKHNvcnRhYmxlKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChzb3J0YWJsZS5yZW1vdmVQZW5kaW5nKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgd2hpbGUgKHNvcnRhYmxlLnJlbW92ZVBlbmRpbmcubGVuZ3RoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZCA9IHNvcnRhYmxlLnJlbW92ZVBlbmRpbmcucG9wKClcclxuICAgICAgICAgICAgICAgIGNoaWxkLnN0eWxlLmRpc3BsYXkgPSBjaGlsZC5fX3NvcnRhYmxlLmRpc3BsYXkgPT09ICd1bnNldCcgPyAnJyA6IGNoaWxkLl9fc29ydGFibGUuZGlzcGxheVxyXG4gICAgICAgICAgICAgICAgY2hpbGQuX19zb3J0YWJsZS5kaXNwbGF5ID0gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNvcnRhYmxlLnJlbW92ZVBlbmRpbmcgPSBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIHBlbmRpbmcgbWF4aW11bVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9tYXhpbXVtUGVuZGluZyhlbGVtZW50LCBzb3J0YWJsZSlcclxuICAgIHtcclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5tYXhpbXVtKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoID4gc29ydGFibGUub3B0aW9ucy5tYXhpbXVtKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzYXZlUGVuZGluZyA9IHNvcnRhYmxlLnJlbW92ZVBlbmRpbmcgPyBzb3J0YWJsZS5yZW1vdmVQZW5kaW5nLnNsaWNlKDApIDogW11cclxuICAgICAgICAgICAgICAgIHRoaXMuX2NsZWFyTWF4aW11bVBlbmRpbmcoc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZS5yZW1vdmVQZW5kaW5nID0gW11cclxuICAgICAgICAgICAgICAgIGxldCBzb3J0XHJcbiAgICAgICAgICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5tYXhpbXVtRklGTylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzb3J0ID0gY2hpbGRyZW4uc29ydCgoYSwgYikgPT4geyByZXR1cm4gYSA9PT0gZWxlbWVudCA/IDEgOiBhLl9fc29ydGFibGUubWF4aW11bSAtIGIuX19zb3J0YWJsZS5tYXhpbXVtIH0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc29ydCA9IGNoaWxkcmVuLnNvcnQoKGEsIGIpID0+IHsgcmV0dXJuIGEgPT09IGVsZW1lbnQgPyAxIDogYi5fX3NvcnRhYmxlLm1heGltdW0gLSBhLl9fc29ydGFibGUubWF4aW11bSB9KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGggLSBzb3J0YWJsZS5vcHRpb25zLm1heGltdW07IGkrKylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBoaWRlID0gc29ydFtpXVxyXG4gICAgICAgICAgICAgICAgICAgIGhpZGUuX19zb3J0YWJsZS5kaXNwbGF5ID0gaGlkZS5zdHlsZS5kaXNwbGF5IHx8ICd1bnNldCdcclxuICAgICAgICAgICAgICAgICAgICBoaWRlLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZS5yZW1vdmVQZW5kaW5nLnB1c2goaGlkZSlcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2F2ZVBlbmRpbmcuaW5kZXhPZihoaWRlKSA9PT0gLTEpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdtYXhpbXVtLXJlbW92ZS1wZW5kaW5nJywgaGlkZSwgc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2hhbmdlIGN1cnNvciBkdXJpbmcgbW91c2Vkb3duXHJcbiAgICAgKiBAcGFyYW0ge01vdXNlRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9tb3VzZURvd24oZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmN1cnNvckhvdmVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdXRpbHMuc3R5bGUoZS5jdXJyZW50VGFyZ2V0LCAnY3Vyc29yJywgdGhpcy5vcHRpb25zLmN1cnNvckRvd24pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2hhbmdlIGN1cnNvciBkdXJpbmcgbW91c2V1cFxyXG4gICAgICogQHBhcmFtIHtNb3VzZUV2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfbW91c2VVcChlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuZW1pdCgnY2xpY2tlZCcsIGUuY3VycmVudFRhcmdldCwgdGhpcylcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmN1cnNvckhvdmVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdXRpbHMuc3R5bGUoZS5jdXJyZW50VGFyZ2V0LCAnY3Vyc29yJywgdGhpcy5vcHRpb25zLmN1cnNvckhvdmVyKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyBwaWNrZWQgdXAgYmVjYXVzZSBpdCB3YXMgbW92ZWQgYmV5b25kIHRoZSBvcHRpb25zLnRocmVzaG9sZFxyXG4gKiBAZXZlbnQgU29ydGFibGUjcGlja3VwXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgYmVpbmcgZHJhZ2dlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBjdXJyZW50IHNvcnRhYmxlIHdpdGggZWxlbWVudCBwbGFjZWhvbGRlclxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgc29ydGFibGUgaXMgcmVvcmRlcmVkXHJcbiAqIEBldmVudCBTb3J0YWJsZSNvcmRlclxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHRoYXQgd2FzIHJlb3JkZXJlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyBwbGFjZWRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIGFkZGVkIHRvIHRoaXMgc29ydGFibGVcclxuICogQGV2ZW50IFNvcnRhYmxlI2FkZFxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGFkZGVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIGFkZGVkXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyByZW1vdmVkIGZyb20gdGhpcyBzb3J0YWJsZVxyXG4gKiBAZXZlbnQgU29ydGFibGUjcmVtb3ZlXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgcmVtb3ZlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyByZW1vdmVkXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyByZW1vdmVkIGZyb20gYWxsIHNvcnRhYmxlc1xyXG4gKiBAZXZlbnQgU29ydGFibGUjZGVsZXRlXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgcmVtb3ZlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyBkcmFnZ2VkIGZyb21cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIGNvcHkgb2YgYW4gZWxlbWVudCBpcyBkcm9wcGVkXHJcbiAqIEBldmVudCBTb3J0YWJsZSNjb3B5XHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgcmVtb3ZlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyBkcmFnZ2VkIGZyb21cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiB0aGUgc29ydGFibGUgaXMgdXBkYXRlZCB3aXRoIGFuIGFkZCwgcmVtb3ZlLCBvciBvcmRlciBjaGFuZ2VcclxuICogQGV2ZW50IFNvcnRhYmxlI3VwZGF0ZVxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGNoYW5nZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2l0aCBlbGVtZW50XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyByZW1vdmVkIGJlY2F1c2UgbWF4aW11bSB3YXMgcmVhY2hlZCBmb3IgdGhlIHNvcnRhYmxlXHJcbiAqIEBldmVudCBTb3J0YWJsZSNtYXhpbXVtLXJlbW92ZVxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHJlbW92ZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgZHJhZ2dlZCBmcm9tXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gb3JkZXIgd2FzIGNoYW5nZWQgYnV0IGVsZW1lbnQgd2FzIG5vdCBkcm9wcGVkIHlldFxyXG4gKiBAZXZlbnQgU29ydGFibGUjb3JkZXItcGVuZGluZ1xyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBlbGVtZW50IGlzIGFkZGVkIGJ1dCBub3QgZHJvcHBlZCB5ZXRcclxuICogQGV2ZW50IFNvcnRhYmxlI2FkZC1wZW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgYmVpbmcgZHJhZ2dlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBjdXJyZW50IHNvcnRhYmxlIHdpdGggZWxlbWVudCBwbGFjZWhvbGRlclxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGVsZW1lbnQgaXMgcmVtb3ZlZCBidXQgbm90IGRyb3BwZWQgeWV0XHJcbiAqIEBldmVudCBTb3J0YWJsZSNyZW1vdmUtcGVuZGluZ1xyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBlbGVtZW50IGlzIHJlbW92ZWQgYWZ0ZXIgYmVpbmcgdGVtcG9yYXJpbHkgYWRkZWRcclxuICogQGV2ZW50IFNvcnRhYmxlI2FkZC1yZW1vdmUtcGVuZGluZ1xyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIGFib3V0IHRvIGJlIHJlbW92ZWQgZnJvbSBhbGwgc29ydGFibGVzXHJcbiAqIEBldmVudCBTb3J0YWJsZSNkZWxldGUtcGVuZGluZ1xyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHJlbW92ZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgZHJhZ2dlZCBmcm9tXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyBhZGRlZCwgcmVtb3ZlZCwgb3IgcmVvcmRlciBidXQgZWxlbWVudCBoYXMgbm90IGRyb3BwZWQgeWV0XHJcbiAqIEBldmVudCBTb3J0YWJsZSN1cGRhdGUtcGVuZGluZ1xyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIGNvcHkgb2YgYW4gZWxlbWVudCBpcyBhYm91dCB0byBkcm9wXHJcbiAqIEBldmVudCBTb3J0YWJsZSNjb3B5LXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCByZW1vdmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIGRyYWdnZWQgZnJvbVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgYWJvdXQgdG8gYmUgcmVtb3ZlZCBiZWNhdXNlIG1heGltdW0gd2FzIHJlYWNoZWQgZm9yIHRoZSBzb3J0YWJsZVxyXG4gKiBAZXZlbnQgU29ydGFibGUjbWF4aW11bS1yZW1vdmUtcGVuZGluZ1xyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHJlbW92ZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgZHJhZ2dlZCBmcm9tXHJcbiAqL1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTb3J0YWJsZSJdfQ==