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
                Sortable.dragImage.style.background = 'transparent';
                Sortable.dragImage.style.position = 'fixed';
                Sortable.dragImage.style.left = -10;
                Sortable.dragImage.style.top = -10;
                Sortable.dragImage.style.width = Sortable.dragImage.style.height = '5px';
                Sortable.dragImage.style.zIndex = -1;
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
                        sortable._placeInList(sortable, e.pageX, e.pageY, element);
                        e.dataTransfer.dropEffect = 'move';
                        sortable._updateDragging(e, element);
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
            if (this.options.cursorHover) {
                utils.style(e.currentTarget, 'cursor', this.options.cursorHover);
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
                // sortable.element.appendChild(dragging)
                dragging.remove();
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

/**
 * fires when an element is clicked without dragging
 * @event Sortable#clicked
 * @property {HTMLElement} element clicked
 * @property {Sortable} sortable where element is a child
 */

module.exports = Sortable;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3J0YWJsZS5qcyJdLCJuYW1lcyI6WyJFdmVudHMiLCJyZXF1aXJlIiwiZGVmYXVsdHMiLCJ1dGlscyIsIlNvcnRhYmxlIiwiZWxlbWVudCIsIm9wdGlvbnMiLCJfYWRkVG9HbG9iYWxUcmFja2VyIiwiZWxlbWVudHMiLCJfZ2V0Q2hpbGRyZW4iLCJldmVudHMiLCJkcmFnU3RhcnQiLCJlIiwiX2RyYWdTdGFydCIsImRyYWdFbmQiLCJfZHJhZ0VuZCIsImRyYWdPdmVyIiwiX2RyYWdPdmVyIiwiZHJvcCIsIl9kcm9wIiwiZHJhZ0xlYXZlIiwiX2RyYWdMZWF2ZSIsIm1vdXNlRG93biIsIl9tb3VzZURvd24iLCJtb3VzZVVwIiwiX21vdXNlVXAiLCJjaGlsZCIsImRyYWdDbGFzcyIsImNvbnRhaW5zQ2xhc3NOYW1lIiwiYXR0YWNoRWxlbWVudCIsImFkZEV2ZW50TGlzdGVuZXIiLCJjdXJzb3JIb3ZlciIsInN0eWxlIiwiY3Vyc29yRG93biIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJyZW1vdmVFbGVtZW50IiwiaW5kZXgiLCJzb3J0IiwiY2hpbGRyZW4iLCJsZW5ndGgiLCJhcHBlbmRDaGlsZCIsImluc2VydEJlZm9yZSIsImlkIiwib3JkZXJJZCIsImRyYWdPcmRlciIsImdldEF0dHJpYnV0ZSIsIm9yZGVySWRJc051bWJlciIsInBhcnNlRmxvYXQiLCJmb3VuZCIsInJldmVyc2VPcmRlciIsImkiLCJjaGlsZERyYWdPcmRlciIsIm9yZGVySXNOdW1iZXIiLCJwYXJlbnROb2RlIiwiX19zb3J0YWJsZSIsIm9yaWdpbmFsIiwic29ydGFibGUiLCJfbWF4aW11bUNvdW50ZXIiLCJuYW1lIiwidHJhY2tlciIsImNvdW50ZXIiLCJjb3B5Iiwic2V0QXR0cmlidXRlIiwiZHJhZ0ltYWdlIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiYmFja2dyb3VuZCIsInBvc2l0aW9uIiwibGVmdCIsInRvcCIsIndpZHRoIiwiaGVpZ2h0IiwiekluZGV4IiwiYm9keSIsIl9ib2R5RHJhZ092ZXIiLCJfYm9keURyb3AiLCJsaXN0IiwicHVzaCIsImRhdGFUcmFuc2ZlciIsInR5cGVzIiwiZ2V0RWxlbWVudEJ5SWQiLCJfZmluZENsb3Nlc3QiLCJsYXN0IiwiTWF0aCIsImFicyIsIngiLCJwYWdlWCIsInRocmVzaG9sZCIsInkiLCJwYWdlWSIsIl91cGRhdGVEcmFnZ2luZyIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwiX3BsYWNlSW5MaXN0IiwiZHJvcEVmZmVjdCIsIl9ub0Ryb3AiLCJjYW5jZWwiLCJfc2V0SWNvbiIsIm9mZkxpc3QiLCJkaXNwbGF5IiwiZW1pdCIsIl9yZXBsYWNlSW5MaXN0IiwiY3VycmVudCIsIl9jbGVhck1heGltdW1QZW5kaW5nIiwiX3JlbW92ZURyYWdnaW5nIiwicmVtb3ZlIiwiY3VycmVudFRhcmdldCIsImRyYWdnaW5nIiwiaWNvbiIsImNsb25lTm9kZSIsImRyYWdTdHlsZSIsInBvcyIsInRvR2xvYmFsIiwib2Zmc2V0IiwidXNlSWNvbnMiLCJpbWFnZSIsIkltYWdlIiwic3JjIiwiaWNvbnMiLCJyZW9yZGVyIiwidHJhbnNmb3JtIiwib2Zmc2V0TGVmdCIsIm9mZnNldFdpZHRoIiwib2Zmc2V0VG9wIiwib2Zmc2V0SGVpZ2h0IiwidGFyZ2V0IiwiaXNDb3B5IiwiY2xlYXJEYXRhIiwic2V0RGF0YSIsInNldERyYWdJbWFnZSIsIl9nZXRJbmRleCIsIl9tYXhpbXVtIiwibWluIiwiSW5maW5pdHkiLCJyZWxhdGVkIiwiaW5zaWRlIiwiY2FsY3VsYXRlIiwiZGlzdGFuY2VUb0Nsb3Nlc3RDb3JuZXIiLCJfcGxhY2VJblNvcnRhYmxlTGlzdCIsIl9wbGFjZUluT3JkZXJlZExpc3QiLCJiYXNlIiwic2VhcmNoIiwicmVzdWx0cyIsImluZGV4T2YiLCJjbGFzc05hbWUiLCJfdHJhdmVyc2VDaGlsZHJlbiIsIm9yZGVyIiwiZGVlcFNlYXJjaCIsIm9yZGVyQ2xhc3MiLCJfbWF4aW11bVBlbmRpbmciLCJjdXJzb3IiLCJ4YTEiLCJ5YTEiLCJ4YTIiLCJ5YTIiLCJsYXJnZXN0IiwiY2xvc2VzdCIsImlzQmVmb3JlIiwiaW5kaWNhdG9yIiwieGIxIiwieWIxIiwieGIyIiwieWIyIiwicGVyY2VudGFnZSIsIm5leHRTaWJsaW5nIiwiZGlzdGFuY2UiLCJtZWFzdXJlIiwiX3BsYWNlQnlEaXN0YW5jZSIsImRlbGV0ZSIsIm1vdmUiLCJjb3VudCIsIm1heGltdW0iLCJyZW1vdmVQZW5kaW5nIiwicG9wIiwic2F2ZVBlbmRpbmciLCJzbGljZSIsIm1heGltdW1GSUZPIiwiYSIsImIiLCJoaWRlIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLElBQU1BLFNBQVNDLFFBQVEsZUFBUixDQUFmOztBQUVBLElBQU1DLFdBQVdELFFBQVEsWUFBUixDQUFqQjtBQUNBLElBQU1FLFFBQVFGLFFBQVEsU0FBUixDQUFkOztJQUVNRyxROzs7QUFFRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE0Q0Esc0JBQVlDLE9BQVosRUFBcUJDLE9BQXJCLEVBQ0E7QUFBQTs7QUFBQTs7QUFFSSxjQUFLQSxPQUFMLEdBQWVILE1BQU1HLE9BQU4sQ0FBY0EsT0FBZCxFQUF1QkosUUFBdkIsQ0FBZjtBQUNBLGNBQUtHLE9BQUwsR0FBZUEsT0FBZjtBQUNBLGNBQUtFLG1CQUFMO0FBQ0EsWUFBTUMsV0FBVyxNQUFLQyxZQUFMLEVBQWpCO0FBQ0EsY0FBS0MsTUFBTCxHQUFjO0FBQ1ZDLHVCQUFXLG1CQUFDQyxDQUFEO0FBQUEsdUJBQU8sTUFBS0MsVUFBTCxDQUFnQkQsQ0FBaEIsQ0FBUDtBQUFBLGFBREQ7QUFFVkUscUJBQVMsaUJBQUNGLENBQUQ7QUFBQSx1QkFBTyxNQUFLRyxRQUFMLENBQWNILENBQWQsQ0FBUDtBQUFBLGFBRkM7QUFHVkksc0JBQVUsa0JBQUNKLENBQUQ7QUFBQSx1QkFBTyxNQUFLSyxTQUFMLENBQWVMLENBQWYsQ0FBUDtBQUFBLGFBSEE7QUFJVk0s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RUFBc0JDLE9BQXRCLENBQWI7QUFDSDtBQUxMO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBTUksbUJBQU93SSxPQUFQO0FBQ0g7Ozs0QkFqQkQ7QUFDSSxtQkFBTzVJLFFBQVA7QUFDSDs7OztFQTVHa0JGLE07O0FBb3FDdkI7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9Bb0wsT0FBT0MsT0FBUCxHQUFpQmpMLFFBQWpCIiwiZmlsZSI6InNvcnRhYmxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgRXZlbnRzID0gcmVxdWlyZSgnZXZlbnRlbWl0dGVyMycpXHJcblxyXG5jb25zdCBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vZGVmYXVsdHMnKVxyXG5jb25zdCB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxyXG5cclxuY2xhc3MgU29ydGFibGUgZXh0ZW5kcyBFdmVudHNcclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgc29ydGFibGUgbGlzdFxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLm5hbWU9c29ydGFibGVdIGRyYWdnaW5nIGlzIGFsbG93ZWQgYmV0d2VlbiBTb3J0YWJsZXMgd2l0aCB0aGUgc2FtZSBuYW1lXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuZHJhZ0NsYXNzXSBpZiBzZXQgdGhlbiBkcmFnIG9ubHkgaXRlbXMgd2l0aCB0aGlzIGNsYXNzTmFtZSB1bmRlciBlbGVtZW50OyBvdGhlcndpc2UgZHJhZyBhbGwgY2hpbGRyZW5cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5vcmRlckNsYXNzXSB1c2UgdGhpcyBjbGFzcyB0byBpbmNsdWRlIGVsZW1lbnRzIGluIG9yZGVyaW5nIGJ1dCBub3QgZHJhZ2dpbmc7IG90aGVyd2lzZSBhbGwgY2hpbGRyZW4gZWxlbWVudHMgYXJlIGluY2x1ZGVkIGluIHdoZW4gc29ydGluZyBhbmQgb3JkZXJpbmdcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuZGVlcFNlYXJjaF0gaWYgZHJhZ0NsYXNzIGFuZCBkZWVwU2VhcmNoIHRoZW4gc2VhcmNoIGFsbCBkZXNjZW5kZW50cyBvZiBlbGVtZW50IGZvciBkcmFnQ2xhc3NcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuc29ydD10cnVlXSBhbGxvdyBzb3J0aW5nIHdpdGhpbiBsaXN0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmRyb3A9dHJ1ZV0gYWxsb3cgZHJvcCBmcm9tIHJlbGF0ZWQgc29ydGFibGVzIChkb2Vzbid0IGltcGFjdCByZW9yZGVyaW5nIHRoaXMgc29ydGFibGUncyBjaGlsZHJlbiB1bnRpbCB0aGUgY2hpbGRyZW4gYXJlIG1vdmVkIHRvIGEgZGlmZmVyZW4gc29ydGFibGUpXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmNvcHk9ZmFsc2VdIGNyZWF0ZSBjb3B5IHdoZW4gZHJhZ2dpbmcgYW4gaXRlbSAodGhpcyBkaXNhYmxlcyBzb3J0PXRydWUgZm9yIHRoaXMgc29ydGFibGUpXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMub3JkZXJJZD1kYXRhLW9yZGVyXSBmb3Igb3JkZXJlZCBsaXN0cywgdXNlIHRoaXMgZGF0YSBpZCB0byBmaWd1cmUgb3V0IHNvcnQgb3JkZXJcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMub3JkZXJJZElzTnVtYmVyPXRydWVdIHVzZSBwYXJzZUludCBvbiBvcHRpb25zLnNvcnRJZCB0byBwcm9wZXJseSBzb3J0IG51bWJlcnNcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5yZXZlcnNlT3JkZXJdIHJldmVyc2Ugc29ydCB0aGUgb3JkZXJJZFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLm9mZkxpc3Q9Y2xvc2VzdF0gaG93IHRvIGhhbmRsZSB3aGVuIGFuIGVsZW1lbnQgaXMgZHJvcHBlZCBvdXRzaWRlIGEgc29ydGFibGU6IGNsb3Nlc3Q9ZHJvcCBpbiBjbG9zZXN0IHNvcnRhYmxlOyBjYW5jZWw9cmV0dXJuIHRvIHN0YXJ0aW5nIHNvcnRhYmxlOyBkZWxldGU9cmVtb3ZlIGZyb20gYWxsIHNvcnRhYmxlc1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1heGltdW1dIG1heGltdW0gbnVtYmVyIG9mIGVsZW1lbnRzIGFsbG93ZWQgaW4gYSBzb3J0YWJsZSBsaXN0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLm1heGltdW1GSUZPXSBkaXJlY3Rpb24gb2Ygc2VhcmNoIHRvIGNob29zZSB3aGljaCBpdGVtIHRvIHJlbW92ZSB3aGVuIG1heGltdW0gaXMgcmVhY2hlZFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmN1cnNvckhvdmVyPWdyYWIgLXdlYmtpdC1ncmFiIHBvaW50ZXJdIHVzZSB0aGlzIGN1cnNvciBsaXN0IHRvIHNldCBjdXJzb3Igd2hlbiBob3ZlcmluZyBvdmVyIGEgc29ydGFibGUgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmN1cnNvckRvd249Z3JhYmJpbmcgLXdlYmtpdC1ncmFiYmluZyBwb2ludGVyXSB1c2UgdGhpcyBjdXJzb3IgbGlzdCB0byBzZXQgY3Vyc29yIHdoZW4gbW91c2Vkb3duL3RvdWNoZG93biBvdmVyIGEgc29ydGFibGUgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy51c2VJY29ucz10cnVlXSBzaG93IGljb25zIHdoZW4gZHJhZ2dpbmdcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9ucy5pY29uc10gZGVmYXVsdCBzZXQgb2YgaWNvbnNcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5pY29ucy5yZW9yZGVyXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmljb25zLm1vdmVdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuaWNvbnMuY29weV1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5pY29ucy5kZWxldGVdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuY3VzdG9tSWNvbl0gc291cmNlIG9mIGN1c3RvbSBpbWFnZSB3aGVuIG92ZXIgdGhpcyBzb3J0YWJsZVxyXG4gICAgICogQGZpcmVzIHBpY2t1cFxyXG4gICAgICogQGZpcmVzIG9yZGVyXHJcbiAgICAgKiBAZmlyZXMgYWRkXHJcbiAgICAgKiBAZmlyZXMgcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgdXBkYXRlXHJcbiAgICAgKiBAZmlyZXMgZGVsZXRlXHJcbiAgICAgKiBAZmlyZXMgY29weVxyXG4gICAgICogQGZpcmVzIG1heGltdW0tcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgb3JkZXItcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIGFkZC1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgcmVtb3ZlLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyBhZGQtcmVtb3ZlLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyB1cGRhdGUtcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIGRlbGV0ZS1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgY29weS1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgbWF4aW11bS1yZW1vdmUtcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIGNsaWNrZWRcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBzdXBlcigpXHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gdXRpbHMub3B0aW9ucyhvcHRpb25zLCBkZWZhdWx0cylcclxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50XHJcbiAgICAgICAgdGhpcy5fYWRkVG9HbG9iYWxUcmFja2VyKClcclxuICAgICAgICBjb25zdCBlbGVtZW50cyA9IHRoaXMuX2dldENoaWxkcmVuKClcclxuICAgICAgICB0aGlzLmV2ZW50cyA9IHtcclxuICAgICAgICAgICAgZHJhZ1N0YXJ0OiAoZSkgPT4gdGhpcy5fZHJhZ1N0YXJ0KGUpLFxyXG4gICAgICAgICAgICBkcmFnRW5kOiAoZSkgPT4gdGhpcy5fZHJhZ0VuZChlKSxcclxuICAgICAgICAgICAgZHJhZ092ZXI6IChlKSA9PiB0aGlzLl9kcmFnT3ZlcihlKSxcclxuICAgICAgICAgICAgZHJvcDogKGUpID0+IHRoaXMuX2Ryb3AoZSksXHJcbiAgICAgICAgICAgIGRyYWdMZWF2ZTogKGUpID0+IHRoaXMuX2RyYWdMZWF2ZShlKSxcclxuICAgICAgICAgICAgbW91c2VEb3duOiAoZSkgPT4gdGhpcy5fbW91c2VEb3duKGUpLFxyXG4gICAgICAgICAgICBtb3VzZVVwOiAoZSkgPT4gdGhpcy5fbW91c2VVcChlKVxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBlbGVtZW50cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5vcHRpb25zLmRyYWdDbGFzcyB8fCB1dGlscy5jb250YWluc0NsYXNzTmFtZShjaGlsZCwgdGhpcy5vcHRpb25zLmRyYWdDbGFzcykpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYXR0YWNoRWxlbWVudChjaGlsZClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgdGhpcy5ldmVudHMuZHJhZ092ZXIpXHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywgdGhpcy5ldmVudHMuZHJvcClcclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdsZWF2ZScsIHRoaXMuZXZlbnRzLmRyYWdMZWF2ZSlcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmN1cnNvckhvdmVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5fZ2V0Q2hpbGRyZW4oKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdXRpbHMuc3R5bGUoY2hpbGQsICdjdXJzb3InLCB0aGlzLm9wdGlvbnMuY3Vyc29ySG92ZXIpXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmN1cnNvckRvd24pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5ldmVudHMubW91c2VEb3duKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2hpbGQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuZXZlbnRzLm1vdXNlVXApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZW1vdmVzIGFsbCBldmVudCBoYW5kbGVycyBmcm9tIHRoaXMuZWxlbWVudCBhbmQgY2hpbGRyZW5cclxuICAgICAqL1xyXG4gICAgZGVzdHJveSgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgdGhpcy5ldmVudHMuZHJhZ092ZXIpXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLmV2ZW50cy5kcm9wKVxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnRzID0gdGhpcy5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGVsZW1lbnRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVFbGVtZW50KGNoaWxkKVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB0b2RvOiByZW1vdmUgU29ydGFibGUudHJhY2tlciBhbmQgcmVsYXRlZCBldmVudCBoYW5kbGVycyBpZiBubyBtb3JlIHNvcnRhYmxlc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdGhlIGdsb2JhbCBkZWZhdWx0cyBmb3IgbmV3IFNvcnRhYmxlIG9iamVjdHNcclxuICAgICAqIEB0eXBlIHtEZWZhdWx0T3B0aW9uc31cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldCBkZWZhdWx0cygpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjcmVhdGUgbXVsdGlwbGUgc29ydGFibGUgZWxlbWVudHNcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnRzW119IGVsZW1lbnRzXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyAtIHNlZSBjb25zdHJ1Y3RvciBmb3Igb3B0aW9uc1xyXG4gICAgICovXHJcbiAgICBzdGF0aWMgY3JlYXRlKGVsZW1lbnRzLCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXVxyXG4gICAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgZWxlbWVudHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXN1bHRzLnB1c2gobmV3IFNvcnRhYmxlKGVsZW1lbnQsIG9wdGlvbnMpKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0c1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYWRkIGFuIGVsZW1lbnQgYXMgYSBjaGlsZCBvZiB0aGUgc29ydGFibGUgZWxlbWVudDsgY2FuIGFsc28gYmUgdXNlZCB0byBzd2FwIGJldHdlZW4gc29ydGFibGVzXHJcbiAgICAgKiBOT1RFOiB0aGlzIG1heSBub3Qgd29yayB3aXRoIGRlZXBTZWFyY2ggbm9uLW9yZGVyZWQgZWxlbWVudHM7IHVzZSBhdHRhY2hFbGVtZW50IGluc3RlYWRcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleFxyXG4gICAgICovXHJcbiAgICBhZGQoZWxlbWVudCwgaW5kZXgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5hdHRhY2hFbGVtZW50KGVsZW1lbnQpXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zb3J0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBpbmRleCA9PT0gJ3VuZGVmaW5lZCcgfHwgaW5kZXggPj0gdGhpcy5lbGVtZW50LmNoaWxkcmVuLmxlbmd0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuaW5zZXJ0QmVmb3JlKGVsZW1lbnQsIHRoaXMuZWxlbWVudC5jaGlsZHJlbltpbmRleCArIDFdKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gdGhpcy5vcHRpb25zLm9yZGVySWRcclxuICAgICAgICAgICAgbGV0IGRyYWdPcmRlciA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICBkcmFnT3JkZXIgPSB0aGlzLm9wdGlvbnMub3JkZXJJZElzTnVtYmVyID8gcGFyc2VGbG9hdChkcmFnT3JkZXIpIDogZHJhZ09yZGVyXHJcbiAgICAgICAgICAgIGxldCBmb3VuZFxyXG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuX2dldENoaWxkcmVuKHRydWUpXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmV2ZXJzZU9yZGVyKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBjaGlsZHJlbltpXVxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZERyYWdPcmRlciA9IGNoaWxkLmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZERyYWdPcmRlciA9IHRoaXMub3B0aW9ucy5vcmRlcklzTnVtYmVyID8gcGFyc2VGbG9hdChjaGlsZERyYWdPcmRlcikgOiBjaGlsZERyYWdPcmRlclxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnT3JkZXIgPiBjaGlsZERyYWdPcmRlcilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGVsZW1lbnQsIGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBjaGlsZHJlbilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGREcmFnT3JkZXIgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGREcmFnT3JkZXIgPSB0aGlzLm9wdGlvbnMub3JkZXJJc051bWJlciA/IHBhcnNlRmxvYXQoY2hpbGREcmFnT3JkZXIpIDogY2hpbGREcmFnT3JkZXJcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ09yZGVyIDwgY2hpbGREcmFnT3JkZXIpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShlbGVtZW50LCBjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghZm91bmQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChlbGVtZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYXR0YWNoZXMgYW4gSFRNTCBlbGVtZW50IHRvIHRoZSBzb3J0YWJsZTsgY2FuIGFsc28gYmUgdXNlZCB0byBzd2FwIGJldHdlZW4gc29ydGFibGVzXHJcbiAgICAgKiBOT1RFOiB5b3UgbmVlZCB0byBtYW51YWxseSBpbnNlcnQgdGhlIGVsZW1lbnQgaW50byB0aGlzLmVsZW1lbnQgKHRoaXMgaXMgdXNlZnVsIHdoZW4geW91IGhhdmUgYSBkZWVwIHN0cnVjdHVyZSlcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqL1xyXG4gICAgYXR0YWNoRWxlbWVudChlbGVtZW50KVxyXG4gICAge1xyXG4gICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgPSB0aGlzXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZSA9IHtcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlOiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgb3JpZ2luYWw6IHRoaXNcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gYWRkIGEgY291bnRlciBmb3IgbWF4aW11bVxyXG4gICAgICAgICAgICB0aGlzLl9tYXhpbXVtQ291bnRlcihlbGVtZW50LCB0aGlzKVxyXG5cclxuICAgICAgICAgICAgLy8gZW5zdXJlIGV2ZXJ5IGVsZW1lbnQgaGFzIGFuIGlkXHJcbiAgICAgICAgICAgIGlmICghZWxlbWVudC5pZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5pZCA9ICdfX3NvcnRhYmxlLScgKyB0aGlzLm9wdGlvbnMubmFtZSArICctJyArIFNvcnRhYmxlLnRyYWNrZXJbdGhpcy5vcHRpb25zLm5hbWVdLmNvdW50ZXJcclxuICAgICAgICAgICAgICAgIFNvcnRhYmxlLnRyYWNrZXJbdGhpcy5vcHRpb25zLm5hbWVdLmNvdW50ZXIrK1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY29weSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmNvcHkgPSAwXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdkcmFnc3RhcnQnLCB0aGlzLmV2ZW50cy5kcmFnU3RhcnQpXHJcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ2VuZCcsIHRoaXMuZXZlbnRzLmRyYWdFbmQpXHJcbiAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdkcmFnZ2FibGUnLCB0cnVlKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlbW92ZXMgYWxsIGV2ZW50cyBmcm9tIGFuIEhUTUwgZWxlbWVudFxyXG4gICAgICogTk9URTogZG9lcyBub3QgcmVtb3ZlIHRoZSBlbGVtZW50IGZyb20gaXRzIHBhcmVudFxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICovXHJcbiAgICByZW1vdmVFbGVtZW50KGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdkcmFnc3RhcnQnLCB0aGlzLmV2ZW50cy5kcmFnU3RhcnQpXHJcbiAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdkcmFnZW5kJywgdGhpcy5ldmVudHMuZHJhZ0VuZClcclxuICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnZHJhZ2dhYmxlJywgZmFsc2UpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhZGQgc29ydGFibGUgdG8gZ2xvYmFsIGxpc3QgdGhhdCB0cmFja3MgYWxsIHNvcnRhYmxlc1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2FkZFRvR2xvYmFsVHJhY2tlcigpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKCFTb3J0YWJsZS50cmFja2VyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgU29ydGFibGUuZHJhZ0ltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgICAgICAgICAgU29ydGFibGUuZHJhZ0ltYWdlLnN0eWxlLmJhY2tncm91bmQgPSAndHJhbnNwYXJlbnQnXHJcbiAgICAgICAgICAgIFNvcnRhYmxlLmRyYWdJbWFnZS5zdHlsZS5wb3NpdGlvbiA9ICdmaXhlZCdcclxuICAgICAgICAgICAgU29ydGFibGUuZHJhZ0ltYWdlLnN0eWxlLmxlZnQgPSAtMTBcclxuICAgICAgICAgICAgU29ydGFibGUuZHJhZ0ltYWdlLnN0eWxlLnRvcCA9IC0xMFxyXG4gICAgICAgICAgICBTb3J0YWJsZS5kcmFnSW1hZ2Uuc3R5bGUud2lkdGggPSBTb3J0YWJsZS5kcmFnSW1hZ2Uuc3R5bGUuaGVpZ2h0ID0gJzVweCdcclxuICAgICAgICAgICAgU29ydGFibGUuZHJhZ0ltYWdlLnN0eWxlLnpJbmRleCA9IC0xXHJcbiAgICAgICAgICAgIFNvcnRhYmxlLmRyYWdJbWFnZS5pZCA9ICdzb3J0YWJsZS1kcmFnSW1hZ2UnXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoU29ydGFibGUuZHJhZ0ltYWdlKVxyXG4gICAgICAgICAgICBTb3J0YWJsZS50cmFja2VyID0ge31cclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIChlKSA9PiB0aGlzLl9ib2R5RHJhZ092ZXIoZSkpXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIChlKSA9PiB0aGlzLl9ib2R5RHJvcChlKSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKFNvcnRhYmxlLnRyYWNrZXJbdGhpcy5vcHRpb25zLm5hbWVdKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgU29ydGFibGUudHJhY2tlclt0aGlzLm9wdGlvbnMubmFtZV0ubGlzdC5wdXNoKHRoaXMpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFNvcnRhYmxlLnRyYWNrZXJbdGhpcy5vcHRpb25zLm5hbWVdID0geyBsaXN0OiBbdGhpc10sIGNvdW50ZXI6IDAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGRlZmF1bHQgZHJhZyBvdmVyIGZvciB0aGUgYm9keVxyXG4gICAgICogQHBhcmFtIHtEcmFnRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9ib2R5RHJhZ092ZXIoZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBuYW1lID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMF1cclxuICAgICAgICBpZiAoU29ydGFibGUudHJhY2tlcltuYW1lXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMV1cclxuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxyXG4gICAgICAgICAgICBjb25zdCBzb3J0YWJsZSA9IHRoaXMuX2ZpbmRDbG9zZXN0KGUsIFNvcnRhYmxlLnRyYWNrZXJbbmFtZV0ubGlzdCwgZWxlbWVudClcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc29ydGFibGUubGFzdCAmJiBNYXRoLmFicyhzb3J0YWJsZS5sYXN0LnggLSBlLnBhZ2VYKSA8IHNvcnRhYmxlLm9wdGlvbnMudGhyZXNob2xkICYmIE1hdGguYWJzKHNvcnRhYmxlLmxhc3QueSAtIGUucGFnZVkpIDwgc29ydGFibGUub3B0aW9ucy50aHJlc2hvbGQpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZS5fdXBkYXRlRHJhZ2dpbmcoZSwgZWxlbWVudClcclxuICAgICAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlLmxhc3QgPSB7IHg6IGUucGFnZVgsIHk6IGUucGFnZVkgfVxyXG4gICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlLl9wbGFjZUluTGlzdChzb3J0YWJsZSwgZS5wYWdlWCwgZS5wYWdlWSwgZWxlbWVudClcclxuICAgICAgICAgICAgICAgICAgICBlLmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ21vdmUnXHJcbiAgICAgICAgICAgICAgICAgICAgc29ydGFibGUuX3VwZGF0ZURyYWdnaW5nKGUsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbm9Ecm9wKGUpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSBubyBkcm9wXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NhbmNlbF0gZm9yY2UgY2FuY2VsIChmb3Igb3B0aW9ucy5jb3B5KVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX25vRHJvcChlLCBjYW5jZWwpXHJcbiAgICB7XHJcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9ICdtb3ZlJ1xyXG4gICAgICAgIGNvbnN0IGlkID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMV1cclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXHJcbiAgICAgICAgaWYgKGVsZW1lbnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLl91cGRhdGVEcmFnZ2luZyhlLCBlbGVtZW50KVxyXG4gICAgICAgICAgICB0aGlzLl9zZXRJY29uKGVsZW1lbnQsIG51bGwsIGNhbmNlbClcclxuICAgICAgICAgICAgaWYgKCFjYW5jZWwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwub3B0aW9ucy5vZmZMaXN0ID09PSAnZGVsZXRlJylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkgPSBlbGVtZW50LnN0eWxlLmRpc3BsYXkgfHwgJ3Vuc2V0J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsLmVtaXQoJ2RlbGV0ZS1wZW5kaW5nJywgZWxlbWVudCwgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKCFlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwub3B0aW9ucy5jb3B5KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlcGxhY2VJbkxpc3QoZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsLCBlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fY2xlYXJNYXhpbXVtUGVuZGluZyhlbGVtZW50Ll9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5jdXJyZW50LmVtaXQoJ2FkZC1yZW1vdmUtcGVuZGluZycsIGVsZW1lbnQsIGVsZW1lbnQuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmN1cnJlbnQuZW1pdCgndXBkYXRlLXBlbmRpbmcnLCBlbGVtZW50LCBlbGVtZW50Ll9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5jdXJyZW50ID0gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZGVmYXVsdCBkcm9wIGZvciB0aGUgYm9keVxyXG4gICAgICogQHBhcmFtIHtEcmFnRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9ib2R5RHJvcChlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IG5hbWUgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1swXVxyXG4gICAgICAgIGlmIChTb3J0YWJsZS50cmFja2VyW25hbWVdKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1sxXVxyXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXHJcbiAgICAgICAgICAgIGNvbnN0IHNvcnRhYmxlID0gdGhpcy5fZmluZENsb3Nlc3QoZSwgU29ydGFibGUudHJhY2tlcltuYW1lXS5saXN0LCBlbGVtZW50KVxyXG4gICAgICAgICAgICBpZiAoZWxlbWVudClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHNvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVtb3ZlRHJhZ2dpbmcoZWxlbWVudClcclxuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXlcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheSA9IG51bGxcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwuZW1pdCgnZGVsZXRlJywgZWxlbWVudCwgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsKVxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9IG51bGxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGVuZCBkcmFnXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kcmFnRW5kKGUpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGUuY3VycmVudFRhcmdldFxyXG4gICAgICAgIGNvbnN0IGRyYWdnaW5nID0gZWxlbWVudC5fX3NvcnRhYmxlLmRyYWdnaW5nXHJcbiAgICAgICAgaWYgKGRyYWdnaW5nKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZHJhZ2dpbmcucmVtb3ZlKClcclxuICAgICAgICAgICAgaWYgKGRyYWdnaW5nLmljb24pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGRyYWdnaW5nLmljb24ucmVtb3ZlKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuZHJhZ2dpbmcgPSBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY3Vyc29ySG92ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB1dGlscy5zdHlsZShlLmN1cnJlbnRUYXJnZXQsICdjdXJzb3InLCB0aGlzLm9wdGlvbnMuY3Vyc29ySG92ZXIpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc3RhcnQgZHJhZ1xyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZHJhZ1N0YXJ0KGUpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3Qgc29ydGFibGUgPSBlLmN1cnJlbnRUYXJnZXQuX19zb3J0YWJsZS5vcmlnaW5hbFxyXG4gICAgICAgIGNvbnN0IGRyYWdnaW5nID0gZS5jdXJyZW50VGFyZ2V0LmNsb25lTm9kZSh0cnVlKVxyXG4gICAgICAgIGZvciAobGV0IHN0eWxlIGluIHNvcnRhYmxlLm9wdGlvbnMuZHJhZ1N0eWxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZHJhZ2dpbmcuc3R5bGVbc3R5bGVdID0gc29ydGFibGUub3B0aW9ucy5kcmFnU3R5bGVbc3R5bGVdXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHBvcyA9IHV0aWxzLnRvR2xvYmFsKGUuY3VycmVudFRhcmdldClcclxuICAgICAgICBkcmFnZ2luZy5zdHlsZS5sZWZ0ID0gcG9zLnggKyAncHgnXHJcbiAgICAgICAgZHJhZ2dpbmcuc3R5bGUudG9wID0gcG9zLnkgKyAncHgnXHJcbiAgICAgICAgY29uc3Qgb2Zmc2V0ID0geyB4OiBwb3MueCAtIGUucGFnZVgsIHk6IHBvcy55IC0gZS5wYWdlWSB9XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkcmFnZ2luZylcclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy51c2VJY29ucylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGltYWdlID0gbmV3IEltYWdlKClcclxuICAgICAgICAgICAgaW1hZ2Uuc3JjID0gc29ydGFibGUub3B0aW9ucy5pY29ucy5yZW9yZGVyXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xyXG4gICAgICAgICAgICBpbWFnZS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKC01MCUsIC01MCUpJ1xyXG4gICAgICAgICAgICBpbWFnZS5zdHlsZS5sZWZ0ID0gZHJhZ2dpbmcub2Zmc2V0TGVmdCArIGRyYWdnaW5nLm9mZnNldFdpZHRoICsgJ3B4J1xyXG4gICAgICAgICAgICBpbWFnZS5zdHlsZS50b3AgPSBkcmFnZ2luZy5vZmZzZXRUb3AgKyBkcmFnZ2luZy5vZmZzZXRIZWlnaHQgKyAncHgnXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaW1hZ2UpXHJcbiAgICAgICAgICAgIGRyYWdnaW5nLmljb24gPSBpbWFnZVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHV0aWxzLnN0eWxlKGUuY3VycmVudFRhcmdldCwgJ2N1cnNvcicsIHNvcnRhYmxlLm9wdGlvbnMuY3Vyc29ySG92ZXIpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB0YXJnZXQgPSBlLmN1cnJlbnRUYXJnZXRcclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5jb3B5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGFyZ2V0ID0gZS5jdXJyZW50VGFyZ2V0LmNsb25lTm9kZSh0cnVlKVxyXG4gICAgICAgICAgICB0YXJnZXQuaWQgPSBlLmN1cnJlbnRUYXJnZXQuaWQgKyAnLWNvcHktJyArIGUuY3VycmVudFRhcmdldC5fX3NvcnRhYmxlLmNvcHlcclxuICAgICAgICAgICAgZS5jdXJyZW50VGFyZ2V0Ll9fc29ydGFibGUuY29weSsrXHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmF0dGFjaEVsZW1lbnQodGFyZ2V0KVxyXG4gICAgICAgICAgICB0YXJnZXQuX19zb3J0YWJsZS5pc0NvcHkgPSB0cnVlXHJcbiAgICAgICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLm9yaWdpbmFsID0gdGhpc1xyXG4gICAgICAgICAgICB0YXJnZXQuX19zb3J0YWJsZS5kaXNwbGF5ID0gdGFyZ2V0LnN0eWxlLmRpc3BsYXkgfHwgJ3Vuc2V0J1xyXG4gICAgICAgICAgICB0YXJnZXQuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRhcmdldClcclxuICAgICAgICB9XHJcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuY2xlYXJEYXRhKClcclxuICAgICAgICBlLmRhdGFUcmFuc2Zlci5zZXREYXRhKHNvcnRhYmxlLm9wdGlvbnMubmFtZSwgc29ydGFibGUub3B0aW9ucy5uYW1lKVxyXG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLnNldERhdGEodGFyZ2V0LmlkLCB0YXJnZXQuaWQpXHJcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuc2V0RHJhZ0ltYWdlKFNvcnRhYmxlLmRyYWdJbWFnZSwgMCwgMClcclxuICAgICAgICB0YXJnZXQuX19zb3J0YWJsZS5jdXJyZW50ID0gdGhpc1xyXG4gICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLmluZGV4ID0gc29ydGFibGUub3B0aW9ucy5jb3B5ID8gLTEgOiBzb3J0YWJsZS5fZ2V0SW5kZXgodGFyZ2V0KVxyXG4gICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLmRyYWdnaW5nID0gZHJhZ2dpbmdcclxuICAgICAgICB0YXJnZXQuX19zb3J0YWJsZS5vZmZzZXQgPSBvZmZzZXRcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSBkcmFnIGxlYXZlIGV2ZW50cyBmb3Igc29ydGFibGUgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtEcmFnRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kcmFnTGVhdmUoZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBzb3J0YWJsZSA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzBdXHJcbiAgICAgICAgaWYgKHNvcnRhYmxlICYmIHNvcnRhYmxlID09PSB0aGlzLm9wdGlvbnMubmFtZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NsZWFyTWF4aW11bVBlbmRpbmcoc29ydGFibGUpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIGRyYWcgb3ZlciBldmVudHMgZm9yIHNvcnRhYmxlIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7RHJhZ0V2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZHJhZ092ZXIoZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBzb3J0YWJsZSA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzBdXHJcbiAgICAgICAgaWYgKHNvcnRhYmxlICYmIHNvcnRhYmxlID09PSB0aGlzLm9wdGlvbnMubmFtZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMV1cclxuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxyXG4gICAgICAgICAgICBpZiAodGhpcy5sYXN0ICYmIE1hdGguYWJzKHRoaXMubGFzdC54IC0gZS5wYWdlWCkgPCB0aGlzLm9wdGlvbnMudGhyZXNob2xkICYmIE1hdGguYWJzKHRoaXMubGFzdC55IC0gZS5wYWdlWSkgPCB0aGlzLm9wdGlvbnMudGhyZXNob2xkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVEcmFnZ2luZyhlLCBlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmxhc3QgPSB7IHg6IGUucGFnZVgsIHk6IGUucGFnZVkgfVxyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLmlzQ29weSAmJiBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgPT09IHRoaXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX25vRHJvcChlLCB0cnVlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMub3B0aW9ucy5kcm9wIHx8IGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9PT0gdGhpcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcGxhY2VJbkxpc3QodGhpcywgZS5wYWdlWCwgZS5wYWdlWSwgZWxlbWVudClcclxuICAgICAgICAgICAgICAgIGUuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSBlbGVtZW50Ll9fc29ydGFibGUuaXNDb3B5ID8gJ2NvcHknIDogJ21vdmUnXHJcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVEcmFnZ2luZyhlLCBlbGVtZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbm9Ecm9wKGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB1cGRhdGUgdGhlIGRyYWdnaW5nIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7VUlFdmVudH0gZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3VwZGF0ZURyYWdnaW5nKGUsIGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgZHJhZ2dpbmcgPSBlbGVtZW50Ll9fc29ydGFibGUuZHJhZ2dpbmdcclxuICAgICAgICBjb25zdCBvZmZzZXQgPSBlbGVtZW50Ll9fc29ydGFibGUub2Zmc2V0XHJcbiAgICAgICAgaWYgKGRyYWdnaW5nKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZHJhZ2dpbmcuc3R5bGUubGVmdCA9IGUucGFnZVggKyBvZmZzZXQueCArICdweCdcclxuICAgICAgICAgICAgZHJhZ2dpbmcuc3R5bGUudG9wID0gZS5wYWdlWSArIG9mZnNldC55ICsgJ3B4J1xyXG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcuaWNvbilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zdHlsZS5sZWZ0ID0gZHJhZ2dpbmcub2Zmc2V0TGVmdCArIGRyYWdnaW5nLm9mZnNldFdpZHRoICsgJ3B4J1xyXG4gICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zdHlsZS50b3AgPSBkcmFnZ2luZy5vZmZzZXRUb3AgKyBkcmFnZ2luZy5vZmZzZXRIZWlnaHQgKyAncHgnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZW1vdmUgdGhlIGRyYWdnaW5nIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9yZW1vdmVEcmFnZ2luZyhlbGVtZW50KVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGRyYWdnaW5nID0gZWxlbWVudC5fX3NvcnRhYmxlLmRyYWdnaW5nXHJcbiAgICAgICAgaWYgKGRyYWdnaW5nKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZHJhZ2dpbmcucmVtb3ZlKClcclxuICAgICAgICAgICAgaWYgKGRyYWdnaW5nLmljb24pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGRyYWdnaW5nLmljb24ucmVtb3ZlKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuZHJhZ2dpbmcgPSBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5pc0NvcHkgPSBmYWxzZVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZHJvcCB0aGUgZWxlbWVudCBpbnRvIGEgc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kcm9wKGUpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzBdXHJcbiAgICAgICAgaWYgKFNvcnRhYmxlLnRyYWNrZXJbbmFtZV0gJiYgbmFtZSA9PT0gdGhpcy5vcHRpb25zLm5hbWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzFdXHJcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZClcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsICE9PSB0aGlzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbC5lbWl0KCdyZW1vdmUnLCBlbGVtZW50LCBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdhZGQnLCBlbGVtZW50LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9IHRoaXNcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNvcnQpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ29yZGVyJywgZWxlbWVudCwgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5pc0NvcHkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2NvcHknLCBlbGVtZW50LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9tYXhpbXVtKGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCd1cGRhdGUnLCBlbGVtZW50LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUuaW5kZXggIT09IHRoaXMuX2dldEluZGV4KGUuY3VycmVudFRhcmdldCkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ29yZGVyJywgZWxlbWVudCwgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCd1cGRhdGUnLCBlbGVtZW50LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVEcmFnZ2luZyhlbGVtZW50KVxyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGZpbmQgY2xvc2VzdCBTb3J0YWJsZSB0byBzY3JlZW4gbG9jYXRpb25cclxuICAgICAqIEBwYXJhbSB7VUlFdmVudH0gZVxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZVtdfSBsaXN0IG9mIHJlbGF0ZWQgU29ydGFibGVzXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZmluZENsb3Nlc3QoZSwgbGlzdCwgZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBsZXQgbWluID0gSW5maW5pdHksIGZvdW5kXHJcbiAgICAgICAgZm9yIChsZXQgcmVsYXRlZCBvZiBsaXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCghcmVsYXRlZC5vcHRpb25zLmRyb3AgJiYgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsICE9PSByZWxhdGVkKSB8fFxyXG4gICAgICAgICAgICAgICAgKGVsZW1lbnQuX19zb3J0YWJsZS5pc0NvcHkgJiYgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsID09PSByZWxhdGVkKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29udGludWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodXRpbHMuaW5zaWRlKGUucGFnZVgsIGUucGFnZVksIHJlbGF0ZWQuZWxlbWVudCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZWxhdGVkXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAocmVsYXRlZC5vcHRpb25zLm9mZkxpc3QgPT09ICdjbG9zZXN0JylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2FsY3VsYXRlID0gdXRpbHMuZGlzdGFuY2VUb0Nsb3Nlc3RDb3JuZXIoZS5wYWdlWCwgZS5wYWdlWSwgcmVsYXRlZC5lbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgaWYgKGNhbGN1bGF0ZSA8IG1pbilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtaW4gPSBjYWxjdWxhdGVcclxuICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHJlbGF0ZWRcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZm91bmRcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBsYWNlIGluZGljYXRvciBpbiB0aGUgc29ydGFibGUgbGlzdCBhY2NvcmRpbmcgdG8gb3B0aW9ucy5zb3J0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGxhY2VJbkxpc3Qoc29ydGFibGUsIHgsIHksIGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zb3J0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fcGxhY2VJblNvcnRhYmxlTGlzdChzb3J0YWJsZSwgeCwgeSwgZWxlbWVudClcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fcGxhY2VJbk9yZGVyZWRMaXN0KHNvcnRhYmxlLCBlbGVtZW50KVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9zZXRJY29uKGVsZW1lbnQsIHNvcnRhYmxlKVxyXG4gICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5ID09PSAndW5zZXQnID8gJycgOiBlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheVxyXG4gICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheSA9IG51bGxcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZXBsYWNlIGl0ZW0gaW4gbGlzdCBhdCBvcmlnaW5hbCBpbmRleCBwb3NpdGlvblxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3JlcGxhY2VJbkxpc3Qoc29ydGFibGUsIGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IGVsZW1lbnQuX19zb3J0YWJsZS5pbmRleFxyXG4gICAgICAgICAgICBpZiAoaW5kZXggPCBjaGlsZHJlbi5sZW5ndGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkcmVuW2luZGV4XS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShlbGVtZW50LCBjaGlsZHJlbltpbmRleF0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlblswXS5hcHBlbmRDaGlsZChlbGVtZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZWxlbWVudClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjb3VudCB0aGUgaW5kZXggb2YgdGhlIGNoaWxkIGluIHRoZSBsaXN0IG9mIGNoaWxkcmVuXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjaGlsZFxyXG4gICAgICogQHJldHVybiB7bnVtYmVyfVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2dldEluZGV4KGNoaWxkKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoY2hpbGRyZW5baV0gPT09IGNoaWxkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdHJhdmVyc2UgYW5kIHNlYXJjaCBkZXNjZW5kZW50cyBpbiBET01cclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGJhc2VcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzZWFyY2hcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnRbXX0gcmVzdWx0cyB0byByZXR1cm5cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF90cmF2ZXJzZUNoaWxkcmVuKGJhc2UsIHNlYXJjaCwgcmVzdWx0cylcclxuICAgIHtcclxuICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBiYXNlLmNoaWxkcmVuKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHNlYXJjaC5sZW5ndGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzZWFyY2guaW5kZXhPZihjaGlsZC5jbGFzc05hbWUpICE9PSAtMSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goY2hpbGQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goY2hpbGQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fdHJhdmVyc2VDaGlsZHJlbihjaGlsZCwgc2VhcmNoLCByZXN1bHRzKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGZpbmQgY2hpbGRyZW4gaW4gZGl2XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3JkZXJdIHNlYXJjaCBmb3IgZHJhZ09yZGVyIGFzIHdlbGxcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9nZXRDaGlsZHJlbihvcmRlcilcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBTZWFyY2gpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgc2VhcmNoID0gW11cclxuICAgICAgICAgICAgaWYgKG9yZGVyICYmIHRoaXMub3B0aW9ucy5vcmRlckNsYXNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2gucHVzaCh0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKG9yZGVyICYmIHRoaXMub3B0aW9ucy5vcmRlckNsYXNzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaC5wdXNoKHRoaXMub3B0aW9ucy5vcmRlckNsYXNzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKCFvcmRlciAmJiB0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzZWFyY2gucHVzaCh0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXVxyXG4gICAgICAgICAgICB0aGlzLl90cmF2ZXJzZUNoaWxkcmVuKHRoaXMuZWxlbWVudCwgc2VhcmNoLCByZXN1bHRzKVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0c1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGV0IGxpc3QgPSBbXVxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5lbGVtZW50LmNoaWxkcmVuKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh1dGlscy5jb250YWluc0NsYXNzTmFtZShjaGlsZCwgdGhpcy5vcHRpb25zLmRyYWdDbGFzcykgfHwgKG9yZGVyICYmICF0aGlzLm9wdGlvbnMub3JkZXJDbGFzcyB8fCAob3JkZXIgJiYgdGhpcy5vcHRpb25zLm9yZGVyQ2xhc3MgJiYgdXRpbHMuY29udGFpbnNDbGFzc05hbWUoY2hpbGQsIHRoaXMub3B0aW9ucy5vcmRlckNsYXNzKSkpKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGlzdC5wdXNoKGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBsaXN0XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBsaXN0ID0gW11cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIHRoaXMuZWxlbWVudC5jaGlsZHJlbilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsaXN0LnB1c2goY2hpbGQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbGlzdFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGxhY2UgaW5kaWNhdG9yIGluIGFuIG9yZGVyZWQgbGlzdFxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGxhY2VJbk9yZGVyZWRMaXN0KHNvcnRhYmxlLCBkcmFnZ2luZylcclxuICAgIHtcclxuICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50ICE9PSBzb3J0YWJsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gc29ydGFibGUub3B0aW9ucy5vcmRlcklkXHJcbiAgICAgICAgICAgIGxldCBkcmFnT3JkZXIgPSBkcmFnZ2luZy5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgICAgIGRyYWdPcmRlciA9IHNvcnRhYmxlLm9wdGlvbnMub3JkZXJJZElzTnVtYmVyID8gcGFyc2VGbG9hdChkcmFnT3JkZXIpIDogZHJhZ09yZGVyXHJcbiAgICAgICAgICAgIGxldCBmb3VuZFxyXG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHNvcnRhYmxlLl9nZXRDaGlsZHJlbih0cnVlKVxyXG4gICAgICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5yZXZlcnNlT3JkZXIpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSBjaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZCA9IGNoaWxkcmVuW2ldXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkRHJhZ09yZGVyID0gY2hpbGQuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkRHJhZ09yZGVyID0gc29ydGFibGUub3B0aW9ucy5vcmRlcklzTnVtYmVyID8gcGFyc2VGbG9hdChjaGlsZERyYWdPcmRlcikgOiBjaGlsZERyYWdPcmRlclxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnT3JkZXIgPiBjaGlsZERyYWdPcmRlcilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGRyYWdnaW5nLCBjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgY2hpbGRyZW4pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkRHJhZ09yZGVyID0gY2hpbGQuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkRHJhZ09yZGVyID0gc29ydGFibGUub3B0aW9ucy5vcmRlcklzTnVtYmVyID8gcGFyc2VGbG9hdChjaGlsZERyYWdPcmRlcikgOiBjaGlsZERyYWdPcmRlclxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnT3JkZXIgPCBjaGlsZERyYWdPcmRlcilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGRyYWdnaW5nLCBjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghZm91bmQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZHJhZ2dpbmcpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudCAhPT0gZHJhZ2dpbmcuX19zb3J0YWJsZS5vcmlnaW5hbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQuZW1pdCgnYWRkLXJlbW92ZS1wZW5kaW5nJywgZHJhZ2dpbmcsIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQuZW1pdCgncmVtb3ZlLXBlbmRpbmcnLCBkcmFnZ2luZywgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ2FkZC1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5pc0NvcHkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ2NvcHktcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgPSBzb3J0YWJsZVxyXG4gICAgICAgICAgICB0aGlzLl9tYXhpbXVtUGVuZGluZyhkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ3VwZGF0ZS1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNlYXJjaCBmb3Igd2hlcmUgdG8gcGxhY2UgdXNpbmcgcGVyY2VudGFnZVxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSAwID0gbm90IGZvdW5kOyAxID0gbm90aGluZyB0byBkbzsgMiA9IG1vdmVkXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGxhY2VCeVBlcmNlbnRhZ2Uoc29ydGFibGUsIGRyYWdnaW5nKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGN1cnNvciA9IGRyYWdnaW5nLl9fc29ydGFibGUuZHJhZ2dpbmdcclxuICAgICAgICBjb25zdCB4YTEgPSBjdXJzb3Iub2Zmc2V0TGVmdFxyXG4gICAgICAgIGNvbnN0IHlhMSA9IGN1cnNvci5vZmZzZXRUb3BcclxuICAgICAgICBjb25zdCB4YTIgPSBjdXJzb3Iub2Zmc2V0TGVmdCArIGN1cnNvci5vZmZzZXRXaWR0aFxyXG4gICAgICAgIGNvbnN0IHlhMiA9IGN1cnNvci5vZmZzZXRUb3AgKyBjdXJzb3Iub2Zmc2V0SGVpZ2h0XHJcbiAgICAgICAgbGV0IGxhcmdlc3QgPSAwLCBjbG9zZXN0LCBpc0JlZm9yZSwgaW5kaWNhdG9yXHJcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHNvcnRhYmxlLmVsZW1lbnRcclxuICAgICAgICBjb25zdCBlbGVtZW50cyA9IHNvcnRhYmxlLl9nZXRDaGlsZHJlbih0cnVlKVxyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGVsZW1lbnRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGNoaWxkID09PSBkcmFnZ2luZylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW5kaWNhdG9yID0gdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHBvcyA9IHV0aWxzLnRvR2xvYmFsKGNoaWxkKVxyXG4gICAgICAgICAgICBjb25zdCB4YjEgPSBwb3MueFxyXG4gICAgICAgICAgICBjb25zdCB5YjEgPSBwb3MueVxyXG4gICAgICAgICAgICBjb25zdCB4YjIgPSBwb3MueCArIGNoaWxkLm9mZnNldFdpZHRoXHJcbiAgICAgICAgICAgIGNvbnN0IHliMiA9IHBvcy55ICsgY2hpbGQub2Zmc2V0SGVpZ2h0XHJcbiAgICAgICAgICAgIGNvbnN0IHBlcmNlbnRhZ2UgPSB1dGlscy5wZXJjZW50YWdlKHhhMSwgeWExLCB4YTIsIHlhMiwgeGIxLCB5YjEsIHhiMiwgeWIyKVxyXG4gICAgICAgICAgICBpZiAocGVyY2VudGFnZSA+IGxhcmdlc3QpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxhcmdlc3QgPSBwZXJjZW50YWdlXHJcbiAgICAgICAgICAgICAgICBjbG9zZXN0ID0gY2hpbGRcclxuICAgICAgICAgICAgICAgIGlzQmVmb3JlID0gaW5kaWNhdG9yXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNsb3Nlc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoY2xvc2VzdCA9PT0gZHJhZ2dpbmcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAxXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGlzQmVmb3JlICYmIGNsb3Nlc3QubmV4dFNpYmxpbmcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKGRyYWdnaW5nLCBjbG9zZXN0Lm5leHRTaWJsaW5nKVxyXG4gICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnb3JkZXItcGVuZGluZycsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5pbnNlcnRCZWZvcmUoZHJhZ2dpbmcsIGNsb3Nlc3QpXHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdvcmRlci1wZW5kaW5nJywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIDJcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIDBcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzZWFyY2ggZm9yIHdoZXJlIHRvIHBsYWNlIHVzaW5nIGRpc3RhbmNlXHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmdcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gZmFsc2U9bm90aGluZyB0byBkb1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BsYWNlQnlEaXN0YW5jZShzb3J0YWJsZSwgZHJhZ2dpbmcsIHgsIHkpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHV0aWxzLmluc2lkZSh4LCB5LCBkcmFnZ2luZykpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgaW5kZXggPSAtMVxyXG4gICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgPT09IHNvcnRhYmxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaW5kZXggPSBzb3J0YWJsZS5fZ2V0SW5kZXgoZHJhZ2dpbmcpXHJcbiAgICAgICAgICAgIC8vIHNvcnRhYmxlLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZHJhZ2dpbmcpXHJcbiAgICAgICAgICAgIGRyYWdnaW5nLnJlbW92ZSgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBkaXN0YW5jZSA9IEluZmluaXR5LCBjbG9zZXN0XHJcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHNvcnRhYmxlLmVsZW1lbnRcclxuICAgICAgICBjb25zdCBlbGVtZW50cyA9IHNvcnRhYmxlLl9nZXRDaGlsZHJlbih0cnVlKVxyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGVsZW1lbnRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHV0aWxzLmluc2lkZSh4LCB5LCBjaGlsZCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNsb3Nlc3QgPSBjaGlsZFxyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG1lYXN1cmUgPSB1dGlscy5kaXN0YW5jZVRvQ2xvc2VzdENvcm5lcih4LCB5LCBjaGlsZClcclxuICAgICAgICAgICAgICAgIGlmIChtZWFzdXJlIDwgZGlzdGFuY2UpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xvc2VzdCA9IGNoaWxkXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2UgPSBtZWFzdXJlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxlbWVudC5pbnNlcnRCZWZvcmUoZHJhZ2dpbmcsIGNsb3Nlc3QpXHJcbiAgICAgICAgaWYgKGluZGV4ID09PSBzb3J0YWJsZS5fZ2V0SW5kZXgoZHJhZ2dpbmcpKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbWF4aW11bVBlbmRpbmcoZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgIHNvcnRhYmxlLmVtaXQoJ29yZGVyLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwbGFjZSBpbmRpY2F0b3IgaW4gYW4gc29ydGFibGUgbGlzdFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BsYWNlSW5Tb3J0YWJsZUxpc3Qoc29ydGFibGUsIHgsIHksIGRyYWdnaW5nKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBzb3J0YWJsZS5lbGVtZW50XHJcbiAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgIGlmICghY2hpbGRyZW4ubGVuZ3RoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChkcmFnZ2luZylcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gY29uc3QgcGVyY2VudGFnZSA9IHRoaXMuX3BsYWNlQnlQZXJjZW50YWdlKHNvcnRhYmxlLCBkcmFnZ2luZylcclxuICAgICAgICAgICAgaWYgKHRoaXMuX3BsYWNlQnlEaXN0YW5jZShzb3J0YWJsZSwgZHJhZ2dpbmcsIHgsIHkpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50ICE9PSBzb3J0YWJsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ2FkZC1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5pc0NvcHkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ2NvcHktcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50ICE9PSBkcmFnZ2luZy5fX3NvcnRhYmxlLm9yaWdpbmFsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudC5lbWl0KCdhZGQtcmVtb3ZlLXBlbmRpbmcnLCBkcmFnZ2luZywgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudC5lbWl0KCdyZW1vdmUtcGVuZGluZycsIGRyYWdnaW5nLCBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50ID0gc29ydGFibGVcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbWF4aW11bVBlbmRpbmcoZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgIHNvcnRhYmxlLmVtaXQoJ3VwZGF0ZS1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2V0IGljb24gaWYgYXZhaWxhYmxlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NhbmNlbF0gZm9yY2UgY2FuY2VsIChmb3Igb3B0aW9ucy5jb3B5KVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3NldEljb24oZWxlbWVudCwgc29ydGFibGUsIGNhbmNlbClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBkcmFnZ2luZyA9IGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnZ2luZ1xyXG4gICAgICAgIGlmIChkcmFnZ2luZyAmJiBkcmFnZ2luZy5pY29uKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCFzb3J0YWJsZSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc29ydGFibGUgPSBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWxcclxuICAgICAgICAgICAgICAgIGlmIChjYW5jZWwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zcmMgPSBzb3J0YWJsZS5vcHRpb25zLmljb25zLmNhbmNlbFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnaW5nLmljb24uc3JjID0gc29ydGFibGUub3B0aW9ucy5vZmZMaXN0ID09PSAnZGVsZXRlJyA/IHNvcnRhYmxlLm9wdGlvbnMuaWNvbnMuZGVsZXRlIDogc29ydGFibGUub3B0aW9ucy5pY29ucy5jYW5jZWxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUuaXNDb3B5KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnaW5nLmljb24uc3JjID0gc29ydGFibGUub3B0aW9ucy5pY29ucy5jb3B5XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zcmMgPSBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgPT09IHNvcnRhYmxlID8gc29ydGFibGUub3B0aW9ucy5pY29ucy5yZW9yZGVyIDogc29ydGFibGUub3B0aW9ucy5pY29ucy5tb3ZlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhZGQgYSBtYXhpbXVtIGNvdW50ZXIgdG8gdGhlIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfbWF4aW11bUNvdW50ZXIoZWxlbWVudCwgc29ydGFibGUpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IGNvdW50ID0gLTFcclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5tYXhpbXVtKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBjaGlsZHJlbilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkICE9PSBlbGVtZW50ICYmIGNoaWxkLl9fc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY291bnQgPSBjaGlsZC5fX3NvcnRhYmxlLm1heGltdW0gPiBjb3VudCA/IGNoaWxkLl9fc29ydGFibGUubWF4aW11bSA6IGNvdW50XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLm1heGltdW0gPSBjb3VudCArIDFcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSBtYXhpbXVtXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfbWF4aW11bShlbGVtZW50LCBzb3J0YWJsZSlcclxuICAgIHtcclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5tYXhpbXVtKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoID4gc29ydGFibGUub3B0aW9ucy5tYXhpbXVtKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc29ydGFibGUucmVtb3ZlUGVuZGluZylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoc29ydGFibGUucmVtb3ZlUGVuZGluZy5sZW5ndGgpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZCA9IHNvcnRhYmxlLnJlbW92ZVBlbmRpbmcucG9wKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQuc3R5bGUuZGlzcGxheSA9IGNoaWxkLl9fc29ydGFibGUuZGlzcGxheSA9PT0gJ3Vuc2V0JyA/ICcnIDogY2hpbGQuX19zb3J0YWJsZS5kaXNwbGF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLl9fc29ydGFibGUuZGlzcGxheSA9IG51bGxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQucmVtb3ZlKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnbWF4aW11bS1yZW1vdmUnLCBjaGlsZCwgc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlLnJlbW92ZVBlbmRpbmcgPSBudWxsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fbWF4aW11bUNvdW50ZXIoZWxlbWVudCwgc29ydGFibGUpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2xlYXIgcGVuZGluZyBsaXN0XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2NsZWFyTWF4aW11bVBlbmRpbmcoc29ydGFibGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHNvcnRhYmxlLnJlbW92ZVBlbmRpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB3aGlsZSAoc29ydGFibGUucmVtb3ZlUGVuZGluZy5sZW5ndGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gc29ydGFibGUucmVtb3ZlUGVuZGluZy5wb3AoKVxyXG4gICAgICAgICAgICAgICAgY2hpbGQuc3R5bGUuZGlzcGxheSA9IGNoaWxkLl9fc29ydGFibGUuZGlzcGxheSA9PT0gJ3Vuc2V0JyA/ICcnIDogY2hpbGQuX19zb3J0YWJsZS5kaXNwbGF5XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5fX3NvcnRhYmxlLmRpc3BsYXkgPSBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc29ydGFibGUucmVtb3ZlUGVuZGluZyA9IG51bGxcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgcGVuZGluZyBtYXhpbXVtXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX21heGltdW1QZW5kaW5nKGVsZW1lbnQsIHNvcnRhYmxlKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLm1heGltdW0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHNvcnRhYmxlLl9nZXRDaGlsZHJlbigpXHJcbiAgICAgICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPiBzb3J0YWJsZS5vcHRpb25zLm1heGltdW0pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNhdmVQZW5kaW5nID0gc29ydGFibGUucmVtb3ZlUGVuZGluZyA/IHNvcnRhYmxlLnJlbW92ZVBlbmRpbmcuc2xpY2UoMCkgOiBbXVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fY2xlYXJNYXhpbXVtUGVuZGluZyhzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlLnJlbW92ZVBlbmRpbmcgPSBbXVxyXG4gICAgICAgICAgICAgICAgbGV0IHNvcnRcclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLm1heGltdW1GSUZPKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNvcnQgPSBjaGlsZHJlbi5zb3J0KChhLCBiKSA9PiB7IHJldHVybiBhID09PSBlbGVtZW50ID8gMSA6IGEuX19zb3J0YWJsZS5tYXhpbXVtIC0gYi5fX3NvcnRhYmxlLm1heGltdW0gfSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzb3J0ID0gY2hpbGRyZW4uc29ydCgoYSwgYikgPT4geyByZXR1cm4gYSA9PT0gZWxlbWVudCA/IDEgOiBiLl9fc29ydGFibGUubWF4aW11bSAtIGEuX19zb3J0YWJsZS5tYXhpbXVtIH0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aCAtIHNvcnRhYmxlLm9wdGlvbnMubWF4aW11bTsgaSsrKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhpZGUgPSBzb3J0W2ldXHJcbiAgICAgICAgICAgICAgICAgICAgaGlkZS5fX3NvcnRhYmxlLmRpc3BsYXkgPSBoaWRlLnN0eWxlLmRpc3BsYXkgfHwgJ3Vuc2V0J1xyXG4gICAgICAgICAgICAgICAgICAgIGhpZGUuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlLnJlbW92ZVBlbmRpbmcucHVzaChoaWRlKVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzYXZlUGVuZGluZy5pbmRleE9mKGhpZGUpID09PSAtMSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ21heGltdW0tcmVtb3ZlLXBlbmRpbmcnLCBoaWRlLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGFuZ2UgY3Vyc29yIGR1cmluZyBtb3VzZWRvd25cclxuICAgICAqIEBwYXJhbSB7TW91c2VFdmVudH0gZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX21vdXNlRG93bihlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY3Vyc29ySG92ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB1dGlscy5zdHlsZShlLmN1cnJlbnRUYXJnZXQsICdjdXJzb3InLCB0aGlzLm9wdGlvbnMuY3Vyc29yRG93bilcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGFuZ2UgY3Vyc29yIGR1cmluZyBtb3VzZXVwXHJcbiAgICAgKiBAcGFyYW0ge01vdXNlRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9tb3VzZVVwKGUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5lbWl0KCdjbGlja2VkJywgZS5jdXJyZW50VGFyZ2V0LCB0aGlzKVxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY3Vyc29ySG92ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB1dGlscy5zdHlsZShlLmN1cnJlbnRUYXJnZXQsICdjdXJzb3InLCB0aGlzLm9wdGlvbnMuY3Vyc29ySG92ZXIpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIHBpY2tlZCB1cCBiZWNhdXNlIGl0IHdhcyBtb3ZlZCBiZXlvbmQgdGhlIG9wdGlvbnMudGhyZXNob2xkXHJcbiAqIEBldmVudCBTb3J0YWJsZSNwaWNrdXBcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBzb3J0YWJsZSBpcyByZW9yZGVyZWRcclxuICogQGV2ZW50IFNvcnRhYmxlI29yZGVyXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgdGhhdCB3YXMgcmVvcmRlcmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIHBsYWNlZFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgYWRkZWQgdG8gdGhpcyBzb3J0YWJsZVxyXG4gKiBAZXZlbnQgU29ydGFibGUjYWRkXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgYWRkZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgYWRkZWRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIHJlbW92ZWQgZnJvbSB0aGlzIHNvcnRhYmxlXHJcbiAqIEBldmVudCBTb3J0YWJsZSNyZW1vdmVcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCByZW1vdmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIHJlbW92ZWRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIHJlbW92ZWQgZnJvbSBhbGwgc29ydGFibGVzXHJcbiAqIEBldmVudCBTb3J0YWJsZSNkZWxldGVcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCByZW1vdmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIGRyYWdnZWQgZnJvbVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgY29weSBvZiBhbiBlbGVtZW50IGlzIGRyb3BwZWRcclxuICogQGV2ZW50IFNvcnRhYmxlI2NvcHlcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCByZW1vdmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIGRyYWdnZWQgZnJvbVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIHRoZSBzb3J0YWJsZSBpcyB1cGRhdGVkIHdpdGggYW4gYWRkLCByZW1vdmUsIG9yIG9yZGVyIGNoYW5nZVxyXG4gKiBAZXZlbnQgU29ydGFibGUjdXBkYXRlXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgY2hhbmdlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aXRoIGVsZW1lbnRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIHJlbW92ZWQgYmVjYXVzZSBtYXhpbXVtIHdhcyByZWFjaGVkIGZvciB0aGUgc29ydGFibGVcclxuICogQGV2ZW50IFNvcnRhYmxlI21heGltdW0tcmVtb3ZlXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgcmVtb3ZlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyBkcmFnZ2VkIGZyb21cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBvcmRlciB3YXMgY2hhbmdlZCBidXQgZWxlbWVudCB3YXMgbm90IGRyb3BwZWQgeWV0XHJcbiAqIEBldmVudCBTb3J0YWJsZSNvcmRlci1wZW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgYmVpbmcgZHJhZ2dlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBjdXJyZW50IHNvcnRhYmxlIHdpdGggZWxlbWVudCBwbGFjZWhvbGRlclxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGVsZW1lbnQgaXMgYWRkZWQgYnV0IG5vdCBkcm9wcGVkIHlldFxyXG4gKiBAZXZlbnQgU29ydGFibGUjYWRkLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gZWxlbWVudCBpcyByZW1vdmVkIGJ1dCBub3QgZHJvcHBlZCB5ZXRcclxuICogQGV2ZW50IFNvcnRhYmxlI3JlbW92ZS1wZW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgYmVpbmcgZHJhZ2dlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBjdXJyZW50IHNvcnRhYmxlIHdpdGggZWxlbWVudCBwbGFjZWhvbGRlclxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGVsZW1lbnQgaXMgcmVtb3ZlZCBhZnRlciBiZWluZyB0ZW1wb3JhcmlseSBhZGRlZFxyXG4gKiBAZXZlbnQgU29ydGFibGUjYWRkLXJlbW92ZS1wZW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgYmVpbmcgZHJhZ2dlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBjdXJyZW50IHNvcnRhYmxlIHdpdGggZWxlbWVudCBwbGFjZWhvbGRlclxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgYWJvdXQgdG8gYmUgcmVtb3ZlZCBmcm9tIGFsbCBzb3J0YWJsZXNcclxuICogQGV2ZW50IFNvcnRhYmxlI2RlbGV0ZS1wZW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgcmVtb3ZlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyBkcmFnZ2VkIGZyb21cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIGFkZGVkLCByZW1vdmVkLCBvciByZW9yZGVyIGJ1dCBlbGVtZW50IGhhcyBub3QgZHJvcHBlZCB5ZXRcclxuICogQGV2ZW50IFNvcnRhYmxlI3VwZGF0ZS1wZW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgYmVpbmcgZHJhZ2dlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBjdXJyZW50IHNvcnRhYmxlIHdpdGggZWxlbWVudCBwbGFjZWhvbGRlclxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgY29weSBvZiBhbiBlbGVtZW50IGlzIGFib3V0IHRvIGRyb3BcclxuICogQGV2ZW50IFNvcnRhYmxlI2NvcHktcGVuZGluZ1xyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHJlbW92ZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgZHJhZ2dlZCBmcm9tXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyBhYm91dCB0byBiZSByZW1vdmVkIGJlY2F1c2UgbWF4aW11bSB3YXMgcmVhY2hlZCBmb3IgdGhlIHNvcnRhYmxlXHJcbiAqIEBldmVudCBTb3J0YWJsZSNtYXhpbXVtLXJlbW92ZS1wZW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgcmVtb3ZlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyBkcmFnZ2VkIGZyb21cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIGNsaWNrZWQgd2l0aG91dCBkcmFnZ2luZ1xyXG4gKiBAZXZlbnQgU29ydGFibGUjY2xpY2tlZFxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGNsaWNrZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCBpcyBhIGNoaWxkXHJcbiAqL1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTb3J0YWJsZSJdfQ==