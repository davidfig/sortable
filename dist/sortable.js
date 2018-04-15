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
                        sortable._noDrop(e);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3J0YWJsZS5qcyJdLCJuYW1lcyI6WyJFdmVudHMiLCJyZXF1aXJlIiwiZGVmYXVsdHMiLCJ1dGlscyIsIlNvcnRhYmxlIiwiZWxlbWVudCIsIm9wdGlvbnMiLCJfYWRkVG9HbG9iYWxUcmFja2VyIiwiZWxlbWVudHMiLCJfZ2V0Q2hpbGRyZW4iLCJldmVudHMiLCJkcmFnU3RhcnQiLCJlIiwiX2RyYWdTdGFydCIsImRyYWdFbmQiLCJfZHJhZ0VuZCIsImRyYWdPdmVyIiwiX2RyYWdPdmVyIiwiZHJvcCIsIl9kcm9wIiwiZHJhZ0xlYXZlIiwiX2RyYWdMZWF2ZSIsIm1vdXNlRG93biIsIl9tb3VzZURvd24iLCJtb3VzZVVwIiwiX21vdXNlVXAiLCJjaGlsZCIsImRyYWdDbGFzcyIsImNvbnRhaW5zQ2xhc3NOYW1lIiwiYXR0YWNoRWxlbWVudCIsImFkZEV2ZW50TGlzdGVuZXIiLCJjdXJzb3JIb3ZlciIsInN0eWxlIiwiY3Vyc29yRG93biIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJyZW1vdmVFbGVtZW50IiwiaW5kZXgiLCJzb3J0IiwiY2hpbGRyZW4iLCJsZW5ndGgiLCJhcHBlbmRDaGlsZCIsImluc2VydEJlZm9yZSIsImlkIiwib3JkZXJJZCIsImRyYWdPcmRlciIsImdldEF0dHJpYnV0ZSIsIm9yZGVySWRJc051bWJlciIsInBhcnNlRmxvYXQiLCJmb3VuZCIsInJldmVyc2VPcmRlciIsImkiLCJjaGlsZERyYWdPcmRlciIsIm9yZGVySXNOdW1iZXIiLCJwYXJlbnROb2RlIiwiX19zb3J0YWJsZSIsIm9yaWdpbmFsIiwic29ydGFibGUiLCJfbWF4aW11bUNvdW50ZXIiLCJuYW1lIiwidHJhY2tlciIsImNvdW50ZXIiLCJjb3B5Iiwic2V0QXR0cmlidXRlIiwiZHJhZ0ltYWdlIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiYmFja2dyb3VuZCIsInBvc2l0aW9uIiwibGVmdCIsInRvcCIsIndpZHRoIiwiaGVpZ2h0IiwiekluZGV4IiwiYm9keSIsIl9ib2R5RHJhZ092ZXIiLCJfYm9keURyb3AiLCJsaXN0IiwicHVzaCIsImRhdGFUcmFuc2ZlciIsInR5cGVzIiwiZ2V0RWxlbWVudEJ5SWQiLCJfZmluZENsb3Nlc3QiLCJsYXN0IiwiTWF0aCIsImFicyIsIngiLCJwYWdlWCIsInRocmVzaG9sZCIsInkiLCJwYWdlWSIsIl91cGRhdGVEcmFnZ2luZyIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwiX3BsYWNlSW5MaXN0IiwiZHJvcEVmZmVjdCIsIl9ub0Ryb3AiLCJjYW5jZWwiLCJfc2V0SWNvbiIsIm9mZkxpc3QiLCJkaXNwbGF5IiwiZW1pdCIsIl9yZXBsYWNlSW5MaXN0IiwiY3VycmVudCIsIl9jbGVhck1heGltdW1QZW5kaW5nIiwiX3JlbW92ZURyYWdnaW5nIiwicmVtb3ZlIiwiY3VycmVudFRhcmdldCIsImRyYWdnaW5nIiwiaWNvbiIsImNsb25lTm9kZSIsImRyYWdTdHlsZSIsInBvcyIsInRvR2xvYmFsIiwib2Zmc2V0IiwidXNlSWNvbnMiLCJpbWFnZSIsIkltYWdlIiwic3JjIiwiaWNvbnMiLCJyZW9yZGVyIiwidHJhbnNmb3JtIiwib2Zmc2V0TGVmdCIsIm9mZnNldFdpZHRoIiwib2Zmc2V0VG9wIiwib2Zmc2V0SGVpZ2h0IiwidGFyZ2V0IiwiaXNDb3B5IiwiY2xlYXJEYXRhIiwic2V0RGF0YSIsInNldERyYWdJbWFnZSIsIl9nZXRJbmRleCIsIl9tYXhpbXVtIiwibWluIiwiSW5maW5pdHkiLCJyZWxhdGVkIiwiaW5zaWRlIiwiY2FsY3VsYXRlIiwiZGlzdGFuY2VUb0Nsb3Nlc3RDb3JuZXIiLCJfcGxhY2VJblNvcnRhYmxlTGlzdCIsIl9wbGFjZUluT3JkZXJlZExpc3QiLCJiYXNlIiwic2VhcmNoIiwicmVzdWx0cyIsImluZGV4T2YiLCJjbGFzc05hbWUiLCJfdHJhdmVyc2VDaGlsZHJlbiIsIm9yZGVyIiwiZGVlcFNlYXJjaCIsIm9yZGVyQ2xhc3MiLCJfbWF4aW11bVBlbmRpbmciLCJjdXJzb3IiLCJ4YTEiLCJ5YTEiLCJ4YTIiLCJ5YTIiLCJsYXJnZXN0IiwiY2xvc2VzdCIsImlzQmVmb3JlIiwiaW5kaWNhdG9yIiwieGIxIiwieWIxIiwieGIyIiwieWIyIiwicGVyY2VudGFnZSIsIm5leHRTaWJsaW5nIiwiZGlzdGFuY2UiLCJtZWFzdXJlIiwiX3BsYWNlQnlEaXN0YW5jZSIsImRlbGV0ZSIsIm1vdmUiLCJjb3VudCIsIm1heGltdW0iLCJyZW1vdmVQZW5kaW5nIiwicG9wIiwic2F2ZVBlbmRpbmciLCJzbGljZSIsIm1heGltdW1GSUZPIiwiYSIsImIiLCJoaWRlIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLElBQU1BLFNBQVNDLFFBQVEsZUFBUixDQUFmOztBQUVBLElBQU1DLFdBQVdELFFBQVEsWUFBUixDQUFqQjtBQUNBLElBQU1FLFFBQVFGLFFBQVEsU0FBUixDQUFkOztJQUVNRyxROzs7QUFFRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE0Q0Esc0JBQVlDLE9BQVosRUFBcUJDLE9BQXJCLEVBQ0E7QUFBQTs7QUFBQTs7QUFFSSxjQUFLQSxPQUFMLEdBQWVILE1BQU1HLE9BQU4sQ0FBY0EsT0FBZCxFQUF1QkosUUFBdkIsQ0FBZjtBQUNBLGNBQUtHLE9BQUwsR0FBZUEsT0FBZjtBQUNBLGNBQUtFLG1CQUFMO0FBQ0EsWUFBTUMsV0FBVyxNQUFLQyxZQUFMLEVBQWpCO0FBQ0EsY0FBS0MsTUFBTCxHQUFjO0FBQ1ZDLHVCQUFXLG1CQUFDQyxDQUFEO0FBQUEsdUJBQU8sTUFBS0MsVUFBTCxDQUFnQkQsQ0FBaEIsQ0FBUDtBQUFBLGFBREQ7QUFFVkUscUJBQVMsaUJBQUNGLENBQUQ7QUFBQSx1QkFBTyxNQUFLRyxRQUFMLENBQWNILENBQWQsQ0FBUDtBQUFBLGFBRkM7QUFHVkksc0JBQVUsa0JBQUNKLENBQUQ7QUFBQSx1QkFBTyxNQUFLSyxTQUFMLENBQWVMLENBQWYsQ0FBUDtBQUFBLGFBSEE7QUFJVk0s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QUFiLEVBQXNCQyxPQUF0QixDQUFiO0FBQ0g7QUFMTDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQU1JLG1CQUFPd0ksT0FBUDtBQUNIOzs7NEJBakJEO0FBQ0ksbUJBQU81SSxRQUFQO0FBQ0g7Ozs7RUE1R2tCRixNOztBQW9xQ3ZCOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQW9MLE9BQU9DLE9BQVAsR0FBaUJqTCxRQUFqQiIsImZpbGUiOiJzb3J0YWJsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IEV2ZW50cyA9IHJlcXVpcmUoJ2V2ZW50ZW1pdHRlcjMnKVxyXG5cclxuY29uc3QgZGVmYXVsdHMgPSByZXF1aXJlKCcuL2RlZmF1bHRzJylcclxuY29uc3QgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJylcclxuXHJcbmNsYXNzIFNvcnRhYmxlIGV4dGVuZHMgRXZlbnRzXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIHNvcnRhYmxlIGxpc3RcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5uYW1lPXNvcnRhYmxlXSBkcmFnZ2luZyBpcyBhbGxvd2VkIGJldHdlZW4gU29ydGFibGVzIHdpdGggdGhlIHNhbWUgbmFtZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmRyYWdDbGFzc10gaWYgc2V0IHRoZW4gZHJhZyBvbmx5IGl0ZW1zIHdpdGggdGhpcyBjbGFzc05hbWUgdW5kZXIgZWxlbWVudDsgb3RoZXJ3aXNlIGRyYWcgYWxsIGNoaWxkcmVuXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMub3JkZXJDbGFzc10gdXNlIHRoaXMgY2xhc3MgdG8gaW5jbHVkZSBlbGVtZW50cyBpbiBvcmRlcmluZyBidXQgbm90IGRyYWdnaW5nOyBvdGhlcndpc2UgYWxsIGNoaWxkcmVuIGVsZW1lbnRzIGFyZSBpbmNsdWRlZCBpbiB3aGVuIHNvcnRpbmcgYW5kIG9yZGVyaW5nXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmRlZXBTZWFyY2hdIGlmIGRyYWdDbGFzcyBhbmQgZGVlcFNlYXJjaCB0aGVuIHNlYXJjaCBhbGwgZGVzY2VuZGVudHMgb2YgZWxlbWVudCBmb3IgZHJhZ0NsYXNzXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnNvcnQ9dHJ1ZV0gYWxsb3cgc29ydGluZyB3aXRoaW4gbGlzdFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5kcm9wPXRydWVdIGFsbG93IGRyb3AgZnJvbSByZWxhdGVkIHNvcnRhYmxlcyAoZG9lc24ndCBpbXBhY3QgcmVvcmRlcmluZyB0aGlzIHNvcnRhYmxlJ3MgY2hpbGRyZW4gdW50aWwgdGhlIGNoaWxkcmVuIGFyZSBtb3ZlZCB0byBhIGRpZmZlcmVuIHNvcnRhYmxlKVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5jb3B5PWZhbHNlXSBjcmVhdGUgY29weSB3aGVuIGRyYWdnaW5nIGFuIGl0ZW0gKHRoaXMgZGlzYWJsZXMgc29ydD10cnVlIGZvciB0aGlzIHNvcnRhYmxlKVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLm9yZGVySWQ9ZGF0YS1vcmRlcl0gZm9yIG9yZGVyZWQgbGlzdHMsIHVzZSB0aGlzIGRhdGEgaWQgdG8gZmlndXJlIG91dCBzb3J0IG9yZGVyXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLm9yZGVySWRJc051bWJlcj10cnVlXSB1c2UgcGFyc2VJbnQgb24gb3B0aW9ucy5zb3J0SWQgdG8gcHJvcGVybHkgc29ydCBudW1iZXJzXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMucmV2ZXJzZU9yZGVyXSByZXZlcnNlIHNvcnQgdGhlIG9yZGVySWRcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5vZmZMaXN0PWNsb3Nlc3RdIGhvdyB0byBoYW5kbGUgd2hlbiBhbiBlbGVtZW50IGlzIGRyb3BwZWQgb3V0c2lkZSBhIHNvcnRhYmxlOiBjbG9zZXN0PWRyb3AgaW4gY2xvc2VzdCBzb3J0YWJsZTsgY2FuY2VsPXJldHVybiB0byBzdGFydGluZyBzb3J0YWJsZTsgZGVsZXRlPXJlbW92ZSBmcm9tIGFsbCBzb3J0YWJsZXNcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5tYXhpbXVtXSBtYXhpbXVtIG51bWJlciBvZiBlbGVtZW50cyBhbGxvd2VkIGluIGEgc29ydGFibGUgbGlzdFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5tYXhpbXVtRklGT10gZGlyZWN0aW9uIG9mIHNlYXJjaCB0byBjaG9vc2Ugd2hpY2ggaXRlbSB0byByZW1vdmUgd2hlbiBtYXhpbXVtIGlzIHJlYWNoZWRcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5jdXJzb3JIb3Zlcj1ncmFiIC13ZWJraXQtZ3JhYiBwb2ludGVyXSB1c2UgdGhpcyBjdXJzb3IgbGlzdCB0byBzZXQgY3Vyc29yIHdoZW4gaG92ZXJpbmcgb3ZlciBhIHNvcnRhYmxlIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5jdXJzb3JEb3duPWdyYWJiaW5nIC13ZWJraXQtZ3JhYmJpbmcgcG9pbnRlcl0gdXNlIHRoaXMgY3Vyc29yIGxpc3QgdG8gc2V0IGN1cnNvciB3aGVuIG1vdXNlZG93bi90b3VjaGRvd24gb3ZlciBhIHNvcnRhYmxlIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMudXNlSWNvbnM9dHJ1ZV0gc2hvdyBpY29ucyB3aGVuIGRyYWdnaW5nXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnMuaWNvbnNdIGRlZmF1bHQgc2V0IG9mIGljb25zXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuaWNvbnMucmVvcmRlcl1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5pY29ucy5tb3ZlXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmljb25zLmNvcHldXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuaWNvbnMuZGVsZXRlXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmN1c3RvbUljb25dIHNvdXJjZSBvZiBjdXN0b20gaW1hZ2Ugd2hlbiBvdmVyIHRoaXMgc29ydGFibGVcclxuICAgICAqIEBmaXJlcyBwaWNrdXBcclxuICAgICAqIEBmaXJlcyBvcmRlclxyXG4gICAgICogQGZpcmVzIGFkZFxyXG4gICAgICogQGZpcmVzIHJlbW92ZVxyXG4gICAgICogQGZpcmVzIHVwZGF0ZVxyXG4gICAgICogQGZpcmVzIGRlbGV0ZVxyXG4gICAgICogQGZpcmVzIGNvcHlcclxuICAgICAqIEBmaXJlcyBtYXhpbXVtLXJlbW92ZVxyXG4gICAgICogQGZpcmVzIG9yZGVyLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyBhZGQtcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIHJlbW92ZS1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgYWRkLXJlbW92ZS1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgdXBkYXRlLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyBkZWxldGUtcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIGNvcHktcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIG1heGltdW0tcmVtb3ZlLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyBjbGlja2VkXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgc3VwZXIoKVxyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IHV0aWxzLm9wdGlvbnMob3B0aW9ucywgZGVmYXVsdHMpXHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudFxyXG4gICAgICAgIHRoaXMuX2FkZFRvR2xvYmFsVHJhY2tlcigpXHJcbiAgICAgICAgY29uc3QgZWxlbWVudHMgPSB0aGlzLl9nZXRDaGlsZHJlbigpXHJcbiAgICAgICAgdGhpcy5ldmVudHMgPSB7XHJcbiAgICAgICAgICAgIGRyYWdTdGFydDogKGUpID0+IHRoaXMuX2RyYWdTdGFydChlKSxcclxuICAgICAgICAgICAgZHJhZ0VuZDogKGUpID0+IHRoaXMuX2RyYWdFbmQoZSksXHJcbiAgICAgICAgICAgIGRyYWdPdmVyOiAoZSkgPT4gdGhpcy5fZHJhZ092ZXIoZSksXHJcbiAgICAgICAgICAgIGRyb3A6IChlKSA9PiB0aGlzLl9kcm9wKGUpLFxyXG4gICAgICAgICAgICBkcmFnTGVhdmU6IChlKSA9PiB0aGlzLl9kcmFnTGVhdmUoZSksXHJcbiAgICAgICAgICAgIG1vdXNlRG93bjogKGUpID0+IHRoaXMuX21vdXNlRG93bihlKSxcclxuICAgICAgICAgICAgbW91c2VVcDogKGUpID0+IHRoaXMuX21vdXNlVXAoZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgZWxlbWVudHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5kcmFnQ2xhc3MgfHwgdXRpbHMuY29udGFpbnNDbGFzc05hbWUoY2hpbGQsIHRoaXMub3B0aW9ucy5kcmFnQ2xhc3MpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmF0dGFjaEVsZW1lbnQoY2hpbGQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIHRoaXMuZXZlbnRzLmRyYWdPdmVyKVxyXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIHRoaXMuZXZlbnRzLmRyb3ApXHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdkcmFnbGVhdmUnLCB0aGlzLmV2ZW50cy5kcmFnTGVhdmUpXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIHRoaXMuX2dldENoaWxkcmVuKCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHV0aWxzLnN0eWxlKGNoaWxkLCAnY3Vyc29yJywgdGhpcy5vcHRpb25zLmN1cnNvckhvdmVyKVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jdXJzb3JEb3duKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuZXZlbnRzLm1vdXNlRG93bilcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNoaWxkLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLmV2ZW50cy5tb3VzZVVwKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVtb3ZlcyBhbGwgZXZlbnQgaGFuZGxlcnMgZnJvbSB0aGlzLmVsZW1lbnQgYW5kIGNoaWxkcmVuXHJcbiAgICAgKi9cclxuICAgIGRlc3Ryb3koKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIHRoaXMuZXZlbnRzLmRyYWdPdmVyKVxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdkcm9wJywgdGhpcy5ldmVudHMuZHJvcClcclxuICAgICAgICBjb25zdCBlbGVtZW50cyA9IHRoaXMuX2dldENoaWxkcmVuKClcclxuICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBlbGVtZW50cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRWxlbWVudChjaGlsZClcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gdG9kbzogcmVtb3ZlIFNvcnRhYmxlLnRyYWNrZXIgYW5kIHJlbGF0ZWQgZXZlbnQgaGFuZGxlcnMgaWYgbm8gbW9yZSBzb3J0YWJsZXNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHRoZSBnbG9iYWwgZGVmYXVsdHMgZm9yIG5ldyBTb3J0YWJsZSBvYmplY3RzXHJcbiAgICAgKiBAdHlwZSB7RGVmYXVsdE9wdGlvbnN9XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBnZXQgZGVmYXVsdHMoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBkZWZhdWx0c1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY3JlYXRlIG11bHRpcGxlIHNvcnRhYmxlIGVsZW1lbnRzXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50c1tdfSBlbGVtZW50c1xyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgLSBzZWUgY29uc3RydWN0b3IgZm9yIG9wdGlvbnNcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGNyZWF0ZShlbGVtZW50cywgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBjb25zdCByZXN1bHRzID0gW11cclxuICAgICAgICBmb3IgKGxldCBlbGVtZW50IG9mIGVsZW1lbnRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKG5ldyBTb3J0YWJsZShlbGVtZW50LCBvcHRpb25zKSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdHNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFkZCBhbiBlbGVtZW50IGFzIGEgY2hpbGQgb2YgdGhlIHNvcnRhYmxlIGVsZW1lbnQ7IGNhbiBhbHNvIGJlIHVzZWQgdG8gc3dhcCBiZXR3ZWVuIHNvcnRhYmxlc1xyXG4gICAgICogTk9URTogdGhpcyBtYXkgbm90IHdvcmsgd2l0aCBkZWVwU2VhcmNoIG5vbi1vcmRlcmVkIGVsZW1lbnRzOyB1c2UgYXR0YWNoRWxlbWVudCBpbnN0ZWFkXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXhcclxuICAgICAqL1xyXG4gICAgYWRkKGVsZW1lbnQsIGluZGV4KVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuYXR0YWNoRWxlbWVudChlbGVtZW50KVxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc29ydClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaW5kZXggPT09ICd1bmRlZmluZWQnIHx8IGluZGV4ID49IHRoaXMuZWxlbWVudC5jaGlsZHJlbi5sZW5ndGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChlbGVtZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50Lmluc2VydEJlZm9yZShlbGVtZW50LCB0aGlzLmVsZW1lbnQuY2hpbGRyZW5baW5kZXggKyAxXSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IHRoaXMub3B0aW9ucy5vcmRlcklkXHJcbiAgICAgICAgICAgIGxldCBkcmFnT3JkZXIgPSBlbGVtZW50LmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICAgICAgZHJhZ09yZGVyID0gdGhpcy5vcHRpb25zLm9yZGVySWRJc051bWJlciA/IHBhcnNlRmxvYXQoZHJhZ09yZGVyKSA6IGRyYWdPcmRlclxyXG4gICAgICAgICAgICBsZXQgZm91bmRcclxuICAgICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLl9nZXRDaGlsZHJlbih0cnVlKVxyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJldmVyc2VPcmRlcilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IGNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gY2hpbGRyZW5baV1cclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGREcmFnT3JkZXIgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGREcmFnT3JkZXIgPSB0aGlzLm9wdGlvbnMub3JkZXJJc051bWJlciA/IHBhcnNlRmxvYXQoY2hpbGREcmFnT3JkZXIpIDogY2hpbGREcmFnT3JkZXJcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ09yZGVyID4gY2hpbGREcmFnT3JkZXIpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShlbGVtZW50LCBjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgY2hpbGRyZW4pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkRHJhZ09yZGVyID0gY2hpbGQuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkRHJhZ09yZGVyID0gdGhpcy5vcHRpb25zLm9yZGVySXNOdW1iZXIgPyBwYXJzZUZsb2F0KGNoaWxkRHJhZ09yZGVyKSA6IGNoaWxkRHJhZ09yZGVyXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdPcmRlciA8IGNoaWxkRHJhZ09yZGVyKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZWxlbWVudCwgY2hpbGQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWZvdW5kKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZWxlbWVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGF0dGFjaGVzIGFuIEhUTUwgZWxlbWVudCB0byB0aGUgc29ydGFibGU7IGNhbiBhbHNvIGJlIHVzZWQgdG8gc3dhcCBiZXR3ZWVuIHNvcnRhYmxlc1xyXG4gICAgICogTk9URTogeW91IG5lZWQgdG8gbWFudWFsbHkgaW5zZXJ0IHRoZSBlbGVtZW50IGludG8gdGhpcy5lbGVtZW50ICh0aGlzIGlzIHVzZWZ1bCB3aGVuIHlvdSBoYXZlIGEgZGVlcCBzdHJ1Y3R1cmUpXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKi9cclxuICAgIGF0dGFjaEVsZW1lbnQoZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsID0gdGhpc1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUgPSB7XHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZTogdGhpcyxcclxuICAgICAgICAgICAgICAgIG9yaWdpbmFsOiB0aGlzXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGFkZCBhIGNvdW50ZXIgZm9yIG1heGltdW1cclxuICAgICAgICAgICAgdGhpcy5fbWF4aW11bUNvdW50ZXIoZWxlbWVudCwgdGhpcylcclxuXHJcbiAgICAgICAgICAgIC8vIGVuc3VyZSBldmVyeSBlbGVtZW50IGhhcyBhbiBpZFxyXG4gICAgICAgICAgICBpZiAoIWVsZW1lbnQuaWQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuaWQgPSAnX19zb3J0YWJsZS0nICsgdGhpcy5vcHRpb25zLm5hbWUgKyAnLScgKyBTb3J0YWJsZS50cmFja2VyW3RoaXMub3B0aW9ucy5uYW1lXS5jb3VudGVyXHJcbiAgICAgICAgICAgICAgICBTb3J0YWJsZS50cmFja2VyW3RoaXMub3B0aW9ucy5uYW1lXS5jb3VudGVyKytcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmNvcHkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5jb3B5ID0gMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ3N0YXJ0JywgdGhpcy5ldmVudHMuZHJhZ1N0YXJ0KVxyXG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdlbmQnLCB0aGlzLmV2ZW50cy5kcmFnRW5kKVxyXG4gICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnZHJhZ2dhYmxlJywgdHJ1ZSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZW1vdmVzIGFsbCBldmVudHMgZnJvbSBhbiBIVE1MIGVsZW1lbnRcclxuICAgICAqIE5PVEU6IGRvZXMgbm90IHJlbW92ZSB0aGUgZWxlbWVudCBmcm9tIGl0cyBwYXJlbnRcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqL1xyXG4gICAgcmVtb3ZlRWxlbWVudChlbGVtZW50KVxyXG4gICAge1xyXG4gICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJhZ3N0YXJ0JywgdGhpcy5ldmVudHMuZHJhZ1N0YXJ0KVxyXG4gICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJhZ2VuZCcsIHRoaXMuZXZlbnRzLmRyYWdFbmQpXHJcbiAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RyYWdnYWJsZScsIGZhbHNlKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYWRkIHNvcnRhYmxlIHRvIGdsb2JhbCBsaXN0IHRoYXQgdHJhY2tzIGFsbCBzb3J0YWJsZXNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9hZGRUb0dsb2JhbFRyYWNrZXIoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICghU29ydGFibGUudHJhY2tlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFNvcnRhYmxlLmRyYWdJbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgICAgICAgIFNvcnRhYmxlLmRyYWdJbWFnZS5zdHlsZS5iYWNrZ3JvdW5kID0gJ3RyYW5zcGFyZW50J1xyXG4gICAgICAgICAgICBTb3J0YWJsZS5kcmFnSW1hZ2Uuc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnXHJcbiAgICAgICAgICAgIFNvcnRhYmxlLmRyYWdJbWFnZS5zdHlsZS5sZWZ0ID0gLTEwXHJcbiAgICAgICAgICAgIFNvcnRhYmxlLmRyYWdJbWFnZS5zdHlsZS50b3AgPSAtMTBcclxuICAgICAgICAgICAgU29ydGFibGUuZHJhZ0ltYWdlLnN0eWxlLndpZHRoID0gU29ydGFibGUuZHJhZ0ltYWdlLnN0eWxlLmhlaWdodCA9ICc1cHgnXHJcbiAgICAgICAgICAgIFNvcnRhYmxlLmRyYWdJbWFnZS5zdHlsZS56SW5kZXggPSAtMVxyXG4gICAgICAgICAgICBTb3J0YWJsZS5kcmFnSW1hZ2UuaWQgPSAnc29ydGFibGUtZHJhZ0ltYWdlJ1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKFNvcnRhYmxlLmRyYWdJbWFnZSlcclxuICAgICAgICAgICAgU29ydGFibGUudHJhY2tlciA9IHt9XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCAoZSkgPT4gdGhpcy5fYm9keURyYWdPdmVyKGUpKVxyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCAoZSkgPT4gdGhpcy5fYm9keURyb3AoZSkpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChTb3J0YWJsZS50cmFja2VyW3RoaXMub3B0aW9ucy5uYW1lXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFNvcnRhYmxlLnRyYWNrZXJbdGhpcy5vcHRpb25zLm5hbWVdLmxpc3QucHVzaCh0aGlzKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBTb3J0YWJsZS50cmFja2VyW3RoaXMub3B0aW9ucy5uYW1lXSA9IHsgbGlzdDogW3RoaXNdLCBjb3VudGVyOiAwIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBkZWZhdWx0IGRyYWcgb3ZlciBmb3IgdGhlIGJvZHlcclxuICAgICAqIEBwYXJhbSB7RHJhZ0V2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfYm9keURyYWdPdmVyKGUpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzBdXHJcbiAgICAgICAgaWYgKFNvcnRhYmxlLnRyYWNrZXJbbmFtZV0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzFdXHJcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZClcclxuICAgICAgICAgICAgY29uc3Qgc29ydGFibGUgPSB0aGlzLl9maW5kQ2xvc2VzdChlLCBTb3J0YWJsZS50cmFja2VyW25hbWVdLmxpc3QsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNvcnRhYmxlLmxhc3QgJiYgTWF0aC5hYnMoc29ydGFibGUubGFzdC54IC0gZS5wYWdlWCkgPCBzb3J0YWJsZS5vcHRpb25zLnRocmVzaG9sZCAmJiBNYXRoLmFicyhzb3J0YWJsZS5sYXN0LnkgLSBlLnBhZ2VZKSA8IHNvcnRhYmxlLm9wdGlvbnMudGhyZXNob2xkKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc29ydGFibGUuX3VwZGF0ZURyYWdnaW5nKGUsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZS5sYXN0ID0geyB4OiBlLnBhZ2VYLCB5OiBlLnBhZ2VZIH1cclxuICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZS5fcGxhY2VJbkxpc3Qoc29ydGFibGUsIGUucGFnZVgsIGUucGFnZVksIGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgZS5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9ICdtb3ZlJ1xyXG4gICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlLl91cGRhdGVEcmFnZ2luZyhlLCBlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlLl9ub0Ryb3AoZSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIG5vIGRyb3BcclxuICAgICAqIEBwYXJhbSB7VUlFdmVudH0gZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2FuY2VsXSBmb3JjZSBjYW5jZWwgKGZvciBvcHRpb25zLmNvcHkpXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfbm9Ecm9wKGUsIGNhbmNlbClcclxuICAgIHtcclxuICAgICAgICBlLmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ21vdmUnXHJcbiAgICAgICAgY29uc3QgaWQgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1sxXVxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZClcclxuICAgICAgICBpZiAoZWxlbWVudClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZURyYWdnaW5nKGUsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgIHRoaXMuX3NldEljb24oZWxlbWVudCwgbnVsbCwgY2FuY2VsKVxyXG4gICAgICAgICAgICBpZiAoIWNhbmNlbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbC5vcHRpb25zLm9mZkxpc3QgPT09ICdkZWxldGUnKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheSA9IGVsZW1lbnQuc3R5bGUuZGlzcGxheSB8fCAndW5zZXQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwuZW1pdCgnZGVsZXRlLXBlbmRpbmcnLCBlbGVtZW50LCBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoIWVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbC5vcHRpb25zLmNvcHkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVwbGFjZUluTGlzdChlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jbGVhck1heGltdW1QZW5kaW5nKGVsZW1lbnQuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmN1cnJlbnQuZW1pdCgnYWRkLXJlbW92ZS1wZW5kaW5nJywgZWxlbWVudCwgZWxlbWVudC5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuY3VycmVudC5lbWl0KCd1cGRhdGUtcGVuZGluZycsIGVsZW1lbnQsIGVsZW1lbnQuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmN1cnJlbnQgPSBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBkZWZhdWx0IGRyb3AgZm9yIHRoZSBib2R5XHJcbiAgICAgKiBAcGFyYW0ge0RyYWdFdmVudH0gZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2JvZHlEcm9wKGUpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzBdXHJcbiAgICAgICAgaWYgKFNvcnRhYmxlLnRyYWNrZXJbbmFtZV0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzFdXHJcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZClcclxuICAgICAgICAgICAgY29uc3Qgc29ydGFibGUgPSB0aGlzLl9maW5kQ2xvc2VzdChlLCBTb3J0YWJsZS50cmFja2VyW25hbWVdLmxpc3QsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZW1vdmVEcmFnZ2luZyhlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlKClcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheVxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5ID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbC5lbWl0KCdkZWxldGUnLCBlbGVtZW50LCBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwpXHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZW5kIGRyYWdcclxuICAgICAqIEBwYXJhbSB7VUlFdmVudH0gZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2RyYWdFbmQoZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gZS5jdXJyZW50VGFyZ2V0XHJcbiAgICAgICAgY29uc3QgZHJhZ2dpbmcgPSBlbGVtZW50Ll9fc29ydGFibGUuZHJhZ2dpbmdcclxuICAgICAgICBpZiAoZHJhZ2dpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5yZW1vdmUoKVxyXG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcuaWNvbilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5yZW1vdmUoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnZ2luZyA9IG51bGxcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHV0aWxzLnN0eWxlKGUuY3VycmVudFRhcmdldCwgJ2N1cnNvcicsIHRoaXMub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzdGFydCBkcmFnXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kcmFnU3RhcnQoZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBzb3J0YWJsZSA9IGUuY3VycmVudFRhcmdldC5fX3NvcnRhYmxlLm9yaWdpbmFsXHJcbiAgICAgICAgY29uc3QgZHJhZ2dpbmcgPSBlLmN1cnJlbnRUYXJnZXQuY2xvbmVOb2RlKHRydWUpXHJcbiAgICAgICAgZm9yIChsZXQgc3R5bGUgaW4gc29ydGFibGUub3B0aW9ucy5kcmFnU3R5bGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5zdHlsZVtzdHlsZV0gPSBzb3J0YWJsZS5vcHRpb25zLmRyYWdTdHlsZVtzdHlsZV1cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcG9zID0gdXRpbHMudG9HbG9iYWwoZS5jdXJyZW50VGFyZ2V0KVxyXG4gICAgICAgIGRyYWdnaW5nLnN0eWxlLmxlZnQgPSBwb3MueCArICdweCdcclxuICAgICAgICBkcmFnZ2luZy5zdHlsZS50b3AgPSBwb3MueSArICdweCdcclxuICAgICAgICBjb25zdCBvZmZzZXQgPSB7IHg6IHBvcy54IC0gZS5wYWdlWCwgeTogcG9zLnkgLSBlLnBhZ2VZIH1cclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRyYWdnaW5nKVxyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLnVzZUljb25zKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKVxyXG4gICAgICAgICAgICBpbWFnZS5zcmMgPSBzb3J0YWJsZS5vcHRpb25zLmljb25zLnJlb3JkZXJcclxuICAgICAgICAgICAgaW1hZ2Uuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoLTUwJSwgLTUwJSknXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLmxlZnQgPSBkcmFnZ2luZy5vZmZzZXRMZWZ0ICsgZHJhZ2dpbmcub2Zmc2V0V2lkdGggKyAncHgnXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLnRvcCA9IGRyYWdnaW5nLm9mZnNldFRvcCArIGRyYWdnaW5nLm9mZnNldEhlaWdodCArICdweCdcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpbWFnZSlcclxuICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbiA9IGltYWdlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLmN1cnNvckhvdmVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdXRpbHMuc3R5bGUoZS5jdXJyZW50VGFyZ2V0LCAnY3Vyc29yJywgc29ydGFibGUub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHRhcmdldCA9IGUuY3VycmVudFRhcmdldFxyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLmNvcHkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0YXJnZXQgPSBlLmN1cnJlbnRUYXJnZXQuY2xvbmVOb2RlKHRydWUpXHJcbiAgICAgICAgICAgIHRhcmdldC5pZCA9IGUuY3VycmVudFRhcmdldC5pZCArICctY29weS0nICsgZS5jdXJyZW50VGFyZ2V0Ll9fc29ydGFibGUuY29weVxyXG4gICAgICAgICAgICBlLmN1cnJlbnRUYXJnZXQuX19zb3J0YWJsZS5jb3B5KytcclxuICAgICAgICAgICAgc29ydGFibGUuYXR0YWNoRWxlbWVudCh0YXJnZXQpXHJcbiAgICAgICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLmlzQ29weSA9IHRydWVcclxuICAgICAgICAgICAgdGFyZ2V0Ll9fc29ydGFibGUub3JpZ2luYWwgPSB0aGlzXHJcbiAgICAgICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLmRpc3BsYXkgPSB0YXJnZXQuc3R5bGUuZGlzcGxheSB8fCAndW5zZXQnXHJcbiAgICAgICAgICAgIHRhcmdldC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGFyZ2V0KVxyXG4gICAgICAgIH1cclxuICAgICAgICBlLmRhdGFUcmFuc2Zlci5jbGVhckRhdGEoKVxyXG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLnNldERhdGEoc29ydGFibGUub3B0aW9ucy5uYW1lLCBzb3J0YWJsZS5vcHRpb25zLm5hbWUpXHJcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuc2V0RGF0YSh0YXJnZXQuaWQsIHRhcmdldC5pZClcclxuICAgICAgICBlLmRhdGFUcmFuc2Zlci5zZXREcmFnSW1hZ2UoU29ydGFibGUuZHJhZ0ltYWdlLCAwLCAwKVxyXG4gICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLmN1cnJlbnQgPSB0aGlzXHJcbiAgICAgICAgdGFyZ2V0Ll9fc29ydGFibGUuaW5kZXggPSBzb3J0YWJsZS5vcHRpb25zLmNvcHkgPyAtMSA6IHNvcnRhYmxlLl9nZXRJbmRleCh0YXJnZXQpXHJcbiAgICAgICAgdGFyZ2V0Ll9fc29ydGFibGUuZHJhZ2dpbmcgPSBkcmFnZ2luZ1xyXG4gICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLm9mZnNldCA9IG9mZnNldFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIGRyYWcgbGVhdmUgZXZlbnRzIGZvciBzb3J0YWJsZSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge0RyYWdFdmVudH0gZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2RyYWdMZWF2ZShlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHNvcnRhYmxlID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMF1cclxuICAgICAgICBpZiAoc29ydGFibGUgJiYgc29ydGFibGUgPT09IHRoaXMub3B0aW9ucy5uYW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fY2xlYXJNYXhpbXVtUGVuZGluZyhzb3J0YWJsZSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgZHJhZyBvdmVyIGV2ZW50cyBmb3Igc29ydGFibGUgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtEcmFnRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kcmFnT3ZlcihlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHNvcnRhYmxlID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMF1cclxuICAgICAgICBpZiAoc29ydGFibGUgJiYgc29ydGFibGUgPT09IHRoaXMub3B0aW9ucy5uYW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1sxXVxyXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmxhc3QgJiYgTWF0aC5hYnModGhpcy5sYXN0LnggLSBlLnBhZ2VYKSA8IHRoaXMub3B0aW9ucy50aHJlc2hvbGQgJiYgTWF0aC5hYnModGhpcy5sYXN0LnkgLSBlLnBhZ2VZKSA8IHRoaXMub3B0aW9ucy50aHJlc2hvbGQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZURyYWdnaW5nKGUsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMubGFzdCA9IHsgeDogZS5wYWdlWCwgeTogZS5wYWdlWSB9XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUuaXNDb3B5ICYmIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9PT0gdGhpcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbm9Ecm9wKGUsIHRydWUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5vcHRpb25zLmRyb3AgfHwgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsID09PSB0aGlzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wbGFjZUluTGlzdCh0aGlzLCBlLnBhZ2VYLCBlLnBhZ2VZLCBlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgZS5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9IGVsZW1lbnQuX19zb3J0YWJsZS5pc0NvcHkgPyAnY29weScgOiAnbW92ZSdcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZURyYWdnaW5nKGUsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9ub0Ryb3AoZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHVwZGF0ZSB0aGUgZHJhZ2dpbmcgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfdXBkYXRlRHJhZ2dpbmcoZSwgZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBkcmFnZ2luZyA9IGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnZ2luZ1xyXG4gICAgICAgIGNvbnN0IG9mZnNldCA9IGVsZW1lbnQuX19zb3J0YWJsZS5vZmZzZXRcclxuICAgICAgICBpZiAoZHJhZ2dpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5zdHlsZS5sZWZ0ID0gZS5wYWdlWCArIG9mZnNldC54ICsgJ3B4J1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5zdHlsZS50b3AgPSBlLnBhZ2VZICsgb2Zmc2V0LnkgKyAncHgnXHJcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZy5pY29uKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnN0eWxlLmxlZnQgPSBkcmFnZ2luZy5vZmZzZXRMZWZ0ICsgZHJhZ2dpbmcub2Zmc2V0V2lkdGggKyAncHgnXHJcbiAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnN0eWxlLnRvcCA9IGRyYWdnaW5nLm9mZnNldFRvcCArIGRyYWdnaW5nLm9mZnNldEhlaWdodCArICdweCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlbW92ZSB0aGUgZHJhZ2dpbmcgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3JlbW92ZURyYWdnaW5nKGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgZHJhZ2dpbmcgPSBlbGVtZW50Ll9fc29ydGFibGUuZHJhZ2dpbmdcclxuICAgICAgICBpZiAoZHJhZ2dpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5yZW1vdmUoKVxyXG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcuaWNvbilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5yZW1vdmUoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnZ2luZyA9IG51bGxcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmlzQ29weSA9IGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBkcm9wIHRoZSBlbGVtZW50IGludG8gYSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2Ryb3AoZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBuYW1lID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMF1cclxuICAgICAgICBpZiAoU29ydGFibGUudHJhY2tlcltuYW1lXSAmJiBuYW1lID09PSB0aGlzLm9wdGlvbnMubmFtZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMV1cclxuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgIT09IHRoaXMpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsLmVtaXQoJ3JlbW92ZScsIGVsZW1lbnQsIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2FkZCcsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsID0gdGhpc1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc29ydClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgnb3JkZXInLCBlbGVtZW50LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLmlzQ29weSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgnY29weScsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX21heGltdW0oZWxlbWVudCwgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ3VwZGF0ZScsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5pbmRleCAhPT0gdGhpcy5fZ2V0SW5kZXgoZS5jdXJyZW50VGFyZ2V0KSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgnb3JkZXInLCBlbGVtZW50LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ3VwZGF0ZScsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3JlbW92ZURyYWdnaW5nKGVsZW1lbnQpXHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZmluZCBjbG9zZXN0IFNvcnRhYmxlIHRvIHNjcmVlbiBsb2NhdGlvblxyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBlXHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlW119IGxpc3Qgb2YgcmVsYXRlZCBTb3J0YWJsZXNcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9maW5kQ2xvc2VzdChlLCBsaXN0LCBlbGVtZW50KVxyXG4gICAge1xyXG4gICAgICAgIGxldCBtaW4gPSBJbmZpbml0eSwgZm91bmRcclxuICAgICAgICBmb3IgKGxldCByZWxhdGVkIG9mIGxpc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoKCFyZWxhdGVkLm9wdGlvbnMuZHJvcCAmJiBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgIT09IHJlbGF0ZWQpIHx8XHJcbiAgICAgICAgICAgICAgICAoZWxlbWVudC5fX3NvcnRhYmxlLmlzQ29weSAmJiBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgPT09IHJlbGF0ZWQpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh1dGlscy5pbnNpZGUoZS5wYWdlWCwgZS5wYWdlWSwgcmVsYXRlZC5lbGVtZW50KSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlbGF0ZWRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChyZWxhdGVkLm9wdGlvbnMub2ZmTGlzdCA9PT0gJ2Nsb3Nlc3QnKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjYWxjdWxhdGUgPSB1dGlscy5kaXN0YW5jZVRvQ2xvc2VzdENvcm5lcihlLnBhZ2VYLCBlLnBhZ2VZLCByZWxhdGVkLmVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICBpZiAoY2FsY3VsYXRlIDwgbWluKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG1pbiA9IGNhbGN1bGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gcmVsYXRlZFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmb3VuZFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGxhY2UgaW5kaWNhdG9yIGluIHRoZSBzb3J0YWJsZSBsaXN0IGFjY29yZGluZyB0byBvcHRpb25zLnNvcnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9wbGFjZUluTGlzdChzb3J0YWJsZSwgeCwgeSwgZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNvcnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLl9wbGFjZUluU29ydGFibGVMaXN0KHNvcnRhYmxlLCB4LCB5LCBlbGVtZW50KVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLl9wbGFjZUluT3JkZXJlZExpc3Qoc29ydGFibGUsIGVsZW1lbnQpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3NldEljb24oZWxlbWVudCwgc29ydGFibGUpXHJcbiAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkgPT09ICd1bnNldCcgPyAnJyA6IGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5XHJcbiAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5ID0gbnVsbFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlcGxhY2UgaXRlbSBpbiBsaXN0IGF0IG9yaWdpbmFsIGluZGV4IHBvc2l0aW9uXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcmVwbGFjZUluTGlzdChzb3J0YWJsZSwgZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHNvcnRhYmxlLl9nZXRDaGlsZHJlbigpXHJcbiAgICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gZWxlbWVudC5fX3NvcnRhYmxlLmluZGV4XHJcbiAgICAgICAgICAgIGlmIChpbmRleCA8IGNoaWxkcmVuLmxlbmd0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2hpbGRyZW5baW5kZXhdLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGVsZW1lbnQsIGNoaWxkcmVuW2luZGV4XSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkcmVuWzBdLmFwcGVuZENoaWxkKGVsZW1lbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc29ydGFibGUuZWxlbWVudC5hcHBlbmRDaGlsZChlbGVtZW50KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNvdW50IHRoZSBpbmRleCBvZiB0aGUgY2hpbGQgaW4gdGhlIGxpc3Qgb2YgY2hpbGRyZW5cclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNoaWxkXHJcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZ2V0SW5kZXgoY2hpbGQpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLl9nZXRDaGlsZHJlbigpXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChjaGlsZHJlbltpXSA9PT0gY2hpbGQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB0cmF2ZXJzZSBhbmQgc2VhcmNoIGRlc2NlbmRlbnRzIGluIERPTVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gYmFzZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNlYXJjaFxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudFtdfSByZXN1bHRzIHRvIHJldHVyblxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3RyYXZlcnNlQ2hpbGRyZW4oYmFzZSwgc2VhcmNoLCByZXN1bHRzKVxyXG4gICAge1xyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGJhc2UuY2hpbGRyZW4pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoc2VhcmNoLmxlbmd0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHNlYXJjaC5pbmRleE9mKGNoaWxkLmNsYXNzTmFtZSkgIT09IC0xKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChjaGlsZClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChjaGlsZClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl90cmF2ZXJzZUNoaWxkcmVuKGNoaWxkLCBzZWFyY2gsIHJlc3VsdHMpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZmluZCBjaGlsZHJlbiBpbiBkaXZcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcmRlcl0gc2VhcmNoIGZvciBkcmFnT3JkZXIgYXMgd2VsbFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2dldENoaWxkcmVuKG9yZGVyKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZGVlcFNlYXJjaClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBzZWFyY2ggPSBbXVxyXG4gICAgICAgICAgICBpZiAob3JkZXIgJiYgdGhpcy5vcHRpb25zLm9yZGVyQ2xhc3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaC5wdXNoKHRoaXMub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAob3JkZXIgJiYgdGhpcy5vcHRpb25zLm9yZGVyQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoLnB1c2godGhpcy5vcHRpb25zLm9yZGVyQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoIW9yZGVyICYmIHRoaXMub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNlYXJjaC5wdXNoKHRoaXMub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdXHJcbiAgICAgICAgICAgIHRoaXMuX3RyYXZlcnNlQ2hpbGRyZW4odGhpcy5lbGVtZW50LCBzZWFyY2gsIHJlc3VsdHMpXHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbGlzdCA9IFtdXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiB0aGlzLmVsZW1lbnQuY2hpbGRyZW4pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHV0aWxzLmNvbnRhaW5zQ2xhc3NOYW1lKGNoaWxkLCB0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKSB8fCAob3JkZXIgJiYgIXRoaXMub3B0aW9ucy5vcmRlckNsYXNzIHx8IChvcmRlciAmJiB0aGlzLm9wdGlvbnMub3JkZXJDbGFzcyAmJiB1dGlscy5jb250YWluc0NsYXNzTmFtZShjaGlsZCwgdGhpcy5vcHRpb25zLm9yZGVyQ2xhc3MpKSkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaXN0LnB1c2goY2hpbGQpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGxpc3RcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGxpc3QgPSBbXVxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5lbGVtZW50LmNoaWxkcmVuKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGxpc3QucHVzaChjaGlsZClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBsaXN0XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwbGFjZSBpbmRpY2F0b3IgaW4gYW4gb3JkZXJlZCBsaXN0XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmdcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9wbGFjZUluT3JkZXJlZExpc3Qoc29ydGFibGUsIGRyYWdnaW5nKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgIT09IHNvcnRhYmxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSBzb3J0YWJsZS5vcHRpb25zLm9yZGVySWRcclxuICAgICAgICAgICAgbGV0IGRyYWdPcmRlciA9IGRyYWdnaW5nLmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICAgICAgZHJhZ09yZGVyID0gc29ydGFibGUub3B0aW9ucy5vcmRlcklkSXNOdW1iZXIgPyBwYXJzZUZsb2F0KGRyYWdPcmRlcikgOiBkcmFnT3JkZXJcclxuICAgICAgICAgICAgbGV0IGZvdW5kXHJcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gc29ydGFibGUuX2dldENoaWxkcmVuKHRydWUpXHJcbiAgICAgICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLnJldmVyc2VPcmRlcilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IGNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gY2hpbGRyZW5baV1cclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGREcmFnT3JkZXIgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGREcmFnT3JkZXIgPSBzb3J0YWJsZS5vcHRpb25zLm9yZGVySXNOdW1iZXIgPyBwYXJzZUZsb2F0KGNoaWxkRHJhZ09yZGVyKSA6IGNoaWxkRHJhZ09yZGVyXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdPcmRlciA+IGNoaWxkRHJhZ09yZGVyKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZHJhZ2dpbmcsIGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBjaGlsZHJlbilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGREcmFnT3JkZXIgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGREcmFnT3JkZXIgPSBzb3J0YWJsZS5vcHRpb25zLm9yZGVySXNOdW1iZXIgPyBwYXJzZUZsb2F0KGNoaWxkRHJhZ09yZGVyKSA6IGNoaWxkRHJhZ09yZGVyXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdPcmRlciA8IGNoaWxkRHJhZ09yZGVyKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZHJhZ2dpbmcsIGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFmb3VuZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc29ydGFibGUuZWxlbWVudC5hcHBlbmRDaGlsZChkcmFnZ2luZylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50ICE9PSBkcmFnZ2luZy5fX3NvcnRhYmxlLm9yaWdpbmFsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudC5lbWl0KCdhZGQtcmVtb3ZlLXBlbmRpbmcnLCBkcmFnZ2luZywgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudC5lbWl0KCdyZW1vdmUtcGVuZGluZycsIGRyYWdnaW5nLCBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnYWRkLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmlzQ29weSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnY29weS1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudCA9IHNvcnRhYmxlXHJcbiAgICAgICAgICAgIHRoaXMuX21heGltdW1QZW5kaW5nKGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgc29ydGFibGUuZW1pdCgndXBkYXRlLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2VhcmNoIGZvciB3aGVyZSB0byBwbGFjZSB1c2luZyBwZXJjZW50YWdlXHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmdcclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IDAgPSBub3QgZm91bmQ7IDEgPSBub3RoaW5nIHRvIGRvOyAyID0gbW92ZWRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9wbGFjZUJ5UGVyY2VudGFnZShzb3J0YWJsZSwgZHJhZ2dpbmcpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgY3Vyc29yID0gZHJhZ2dpbmcuX19zb3J0YWJsZS5kcmFnZ2luZ1xyXG4gICAgICAgIGNvbnN0IHhhMSA9IGN1cnNvci5vZmZzZXRMZWZ0XHJcbiAgICAgICAgY29uc3QgeWExID0gY3Vyc29yLm9mZnNldFRvcFxyXG4gICAgICAgIGNvbnN0IHhhMiA9IGN1cnNvci5vZmZzZXRMZWZ0ICsgY3Vyc29yLm9mZnNldFdpZHRoXHJcbiAgICAgICAgY29uc3QgeWEyID0gY3Vyc29yLm9mZnNldFRvcCArIGN1cnNvci5vZmZzZXRIZWlnaHRcclxuICAgICAgICBsZXQgbGFyZ2VzdCA9IDAsIGNsb3Nlc3QsIGlzQmVmb3JlLCBpbmRpY2F0b3JcclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gc29ydGFibGUuZWxlbWVudFxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnRzID0gc29ydGFibGUuX2dldENoaWxkcmVuKHRydWUpXHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgZWxlbWVudHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoY2hpbGQgPT09IGRyYWdnaW5nKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbmRpY2F0b3IgPSB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgcG9zID0gdXRpbHMudG9HbG9iYWwoY2hpbGQpXHJcbiAgICAgICAgICAgIGNvbnN0IHhiMSA9IHBvcy54XHJcbiAgICAgICAgICAgIGNvbnN0IHliMSA9IHBvcy55XHJcbiAgICAgICAgICAgIGNvbnN0IHhiMiA9IHBvcy54ICsgY2hpbGQub2Zmc2V0V2lkdGhcclxuICAgICAgICAgICAgY29uc3QgeWIyID0gcG9zLnkgKyBjaGlsZC5vZmZzZXRIZWlnaHRcclxuICAgICAgICAgICAgY29uc3QgcGVyY2VudGFnZSA9IHV0aWxzLnBlcmNlbnRhZ2UoeGExLCB5YTEsIHhhMiwgeWEyLCB4YjEsIHliMSwgeGIyLCB5YjIpXHJcbiAgICAgICAgICAgIGlmIChwZXJjZW50YWdlID4gbGFyZ2VzdClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGFyZ2VzdCA9IHBlcmNlbnRhZ2VcclxuICAgICAgICAgICAgICAgIGNsb3Nlc3QgPSBjaGlsZFxyXG4gICAgICAgICAgICAgICAgaXNCZWZvcmUgPSBpbmRpY2F0b3JcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY2xvc2VzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChjbG9zZXN0ID09PSBkcmFnZ2luZylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaXNCZWZvcmUgJiYgY2xvc2VzdC5uZXh0U2libGluZylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5pbnNlcnRCZWZvcmUoZHJhZ2dpbmcsIGNsb3Nlc3QubmV4dFNpYmxpbmcpXHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdvcmRlci1wZW5kaW5nJywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Lmluc2VydEJlZm9yZShkcmFnZ2luZywgY2xvc2VzdClcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ29yZGVyLXBlbmRpbmcnLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gMlxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gMFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNlYXJjaCBmb3Igd2hlcmUgdG8gcGxhY2UgdXNpbmcgZGlzdGFuY2VcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSBmYWxzZT1ub3RoaW5nIHRvIGRvXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGxhY2VCeURpc3RhbmNlKHNvcnRhYmxlLCBkcmFnZ2luZywgeCwgeSlcclxuICAgIHtcclxuICAgICAgICBpZiAodXRpbHMuaW5zaWRlKHgsIHksIGRyYWdnaW5nKSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBpbmRleCA9IC0xXHJcbiAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudCA9PT0gc29ydGFibGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpbmRleCA9IHNvcnRhYmxlLl9nZXRJbmRleChkcmFnZ2luZylcclxuICAgICAgICAgICAgLy8gc29ydGFibGUuZWxlbWVudC5hcHBlbmRDaGlsZChkcmFnZ2luZylcclxuICAgICAgICAgICAgZHJhZ2dpbmcucmVtb3ZlKClcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGRpc3RhbmNlID0gSW5maW5pdHksIGNsb3Nlc3RcclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gc29ydGFibGUuZWxlbWVudFxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnRzID0gc29ydGFibGUuX2dldENoaWxkcmVuKHRydWUpXHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgZWxlbWVudHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodXRpbHMuaW5zaWRlKHgsIHksIGNoaWxkKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2xvc2VzdCA9IGNoaWxkXHJcbiAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbWVhc3VyZSA9IHV0aWxzLmRpc3RhbmNlVG9DbG9zZXN0Q29ybmVyKHgsIHksIGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgaWYgKG1lYXN1cmUgPCBkaXN0YW5jZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjbG9zZXN0ID0gY2hpbGRcclxuICAgICAgICAgICAgICAgICAgICBkaXN0YW5jZSA9IG1lYXN1cmVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbGVtZW50Lmluc2VydEJlZm9yZShkcmFnZ2luZywgY2xvc2VzdClcclxuICAgICAgICBpZiAoaW5kZXggPT09IHNvcnRhYmxlLl9nZXRJbmRleChkcmFnZ2luZykpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9tYXhpbXVtUGVuZGluZyhkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgc29ydGFibGUuZW1pdCgnb3JkZXItcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBsYWNlIGluZGljYXRvciBpbiBhbiBzb3J0YWJsZSBsaXN0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGxhY2VJblNvcnRhYmxlTGlzdChzb3J0YWJsZSwgeCwgeSwgZHJhZ2dpbmcpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHNvcnRhYmxlLmVsZW1lbnRcclxuICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHNvcnRhYmxlLl9nZXRDaGlsZHJlbigpXHJcbiAgICAgICAgaWYgKCFjaGlsZHJlbi5sZW5ndGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKGRyYWdnaW5nKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBjb25zdCBwZXJjZW50YWdlID0gdGhpcy5fcGxhY2VCeVBlcmNlbnRhZ2Uoc29ydGFibGUsIGRyYWdnaW5nKVxyXG4gICAgICAgICAgICBpZiAodGhpcy5fcGxhY2VCeURpc3RhbmNlKHNvcnRhYmxlLCBkcmFnZ2luZywgeCwgeSkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgIT09IHNvcnRhYmxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnYWRkLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmlzQ29weSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnY29weS1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgIT09IGRyYWdnaW5nLl9fc29ydGFibGUub3JpZ2luYWwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50LmVtaXQoJ2FkZC1yZW1vdmUtcGVuZGluZycsIGRyYWdnaW5nLCBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50LmVtaXQoJ3JlbW92ZS1wZW5kaW5nJywgZHJhZ2dpbmcsIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgPSBzb3J0YWJsZVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9tYXhpbXVtUGVuZGluZyhkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgc29ydGFibGUuZW1pdCgndXBkYXRlLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzZXQgaWNvbiBpZiBhdmFpbGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2FuY2VsXSBmb3JjZSBjYW5jZWwgKGZvciBvcHRpb25zLmNvcHkpXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfc2V0SWNvbihlbGVtZW50LCBzb3J0YWJsZSwgY2FuY2VsKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGRyYWdnaW5nID0gZWxlbWVudC5fX3NvcnRhYmxlLmRyYWdnaW5nXHJcbiAgICAgICAgaWYgKGRyYWdnaW5nICYmIGRyYWdnaW5nLmljb24pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoIXNvcnRhYmxlKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZSA9IGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbFxyXG4gICAgICAgICAgICAgICAgaWYgKGNhbmNlbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnNyYyA9IHNvcnRhYmxlLm9wdGlvbnMuaWNvbnMuY2FuY2VsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zcmMgPSBzb3J0YWJsZS5vcHRpb25zLm9mZkxpc3QgPT09ICdkZWxldGUnID8gc29ydGFibGUub3B0aW9ucy5pY29ucy5kZWxldGUgOiBzb3J0YWJsZS5vcHRpb25zLmljb25zLmNhbmNlbFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5pc0NvcHkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zcmMgPSBzb3J0YWJsZS5vcHRpb25zLmljb25zLmNvcHlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnNyYyA9IGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9PT0gc29ydGFibGUgPyBzb3J0YWJsZS5vcHRpb25zLmljb25zLnJlb3JkZXIgOiBzb3J0YWJsZS5vcHRpb25zLmljb25zLm1vdmVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFkZCBhIG1heGltdW0gY291bnRlciB0byB0aGUgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9tYXhpbXVtQ291bnRlcihlbGVtZW50LCBzb3J0YWJsZSlcclxuICAgIHtcclxuICAgICAgICBsZXQgY291bnQgPSAtMVxyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLm1heGltdW0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHNvcnRhYmxlLl9nZXRDaGlsZHJlbigpXHJcbiAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGNoaWxkcmVuKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGQgIT09IGVsZW1lbnQgJiYgY2hpbGQuX19zb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb3VudCA9IGNoaWxkLl9fc29ydGFibGUubWF4aW11bSA+IGNvdW50ID8gY2hpbGQuX19zb3J0YWJsZS5tYXhpbXVtIDogY291bnRcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUubWF4aW11bSA9IGNvdW50ICsgMVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIG1heGltdW1cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9tYXhpbXVtKGVsZW1lbnQsIHNvcnRhYmxlKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLm1heGltdW0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHNvcnRhYmxlLl9nZXRDaGlsZHJlbigpXHJcbiAgICAgICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPiBzb3J0YWJsZS5vcHRpb25zLm1heGltdW0pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZS5yZW1vdmVQZW5kaW5nKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChzb3J0YWJsZS5yZW1vdmVQZW5kaW5nLmxlbmd0aClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gc29ydGFibGUucmVtb3ZlUGVuZGluZy5wb3AoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5zdHlsZS5kaXNwbGF5ID0gY2hpbGQuX19zb3J0YWJsZS5kaXNwbGF5ID09PSAndW5zZXQnID8gJycgOiBjaGlsZC5fX3NvcnRhYmxlLmRpc3BsYXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQuX19zb3J0YWJsZS5kaXNwbGF5ID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5yZW1vdmUoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdtYXhpbXVtLXJlbW92ZScsIGNoaWxkLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgc29ydGFibGUucmVtb3ZlUGVuZGluZyA9IG51bGxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9tYXhpbXVtQ291bnRlcihlbGVtZW50LCBzb3J0YWJsZSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjbGVhciBwZW5kaW5nIGxpc3RcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfY2xlYXJNYXhpbXVtUGVuZGluZyhzb3J0YWJsZSlcclxuICAgIHtcclxuICAgICAgICBpZiAoc29ydGFibGUucmVtb3ZlUGVuZGluZylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHdoaWxlIChzb3J0YWJsZS5yZW1vdmVQZW5kaW5nLmxlbmd0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBzb3J0YWJsZS5yZW1vdmVQZW5kaW5nLnBvcCgpXHJcbiAgICAgICAgICAgICAgICBjaGlsZC5zdHlsZS5kaXNwbGF5ID0gY2hpbGQuX19zb3J0YWJsZS5kaXNwbGF5ID09PSAndW5zZXQnID8gJycgOiBjaGlsZC5fX3NvcnRhYmxlLmRpc3BsYXlcclxuICAgICAgICAgICAgICAgIGNoaWxkLl9fc29ydGFibGUuZGlzcGxheSA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzb3J0YWJsZS5yZW1vdmVQZW5kaW5nID0gbnVsbFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSBwZW5kaW5nIG1heGltdW1cclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfbWF4aW11bVBlbmRpbmcoZWxlbWVudCwgc29ydGFibGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMubWF4aW11bSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gc29ydGFibGUuX2dldENoaWxkcmVuKClcclxuICAgICAgICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA+IHNvcnRhYmxlLm9wdGlvbnMubWF4aW11bSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2F2ZVBlbmRpbmcgPSBzb3J0YWJsZS5yZW1vdmVQZW5kaW5nID8gc29ydGFibGUucmVtb3ZlUGVuZGluZy5zbGljZSgwKSA6IFtdXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jbGVhck1heGltdW1QZW5kaW5nKHNvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAgc29ydGFibGUucmVtb3ZlUGVuZGluZyA9IFtdXHJcbiAgICAgICAgICAgICAgICBsZXQgc29ydFxyXG4gICAgICAgICAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMubWF4aW11bUZJRk8pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc29ydCA9IGNoaWxkcmVuLnNvcnQoKGEsIGIpID0+IHsgcmV0dXJuIGEgPT09IGVsZW1lbnQgPyAxIDogYS5fX3NvcnRhYmxlLm1heGltdW0gLSBiLl9fc29ydGFibGUubWF4aW11bSB9KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNvcnQgPSBjaGlsZHJlbi5zb3J0KChhLCBiKSA9PiB7IHJldHVybiBhID09PSBlbGVtZW50ID8gMSA6IGIuX19zb3J0YWJsZS5tYXhpbXVtIC0gYS5fX3NvcnRhYmxlLm1heGltdW0gfSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoIC0gc29ydGFibGUub3B0aW9ucy5tYXhpbXVtOyBpKyspXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaGlkZSA9IHNvcnRbaV1cclxuICAgICAgICAgICAgICAgICAgICBoaWRlLl9fc29ydGFibGUuZGlzcGxheSA9IGhpZGUuc3R5bGUuZGlzcGxheSB8fCAndW5zZXQnXHJcbiAgICAgICAgICAgICAgICAgICAgaGlkZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgICAgICAgICAgICAgICAgICAgc29ydGFibGUucmVtb3ZlUGVuZGluZy5wdXNoKGhpZGUpXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNhdmVQZW5kaW5nLmluZGV4T2YoaGlkZSkgPT09IC0xKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnbWF4aW11bS1yZW1vdmUtcGVuZGluZycsIGhpZGUsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSBjdXJzb3IgZHVyaW5nIG1vdXNlZG93blxyXG4gICAgICogQHBhcmFtIHtNb3VzZUV2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfbW91c2VEb3duKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHV0aWxzLnN0eWxlKGUuY3VycmVudFRhcmdldCwgJ2N1cnNvcicsIHRoaXMub3B0aW9ucy5jdXJzb3JEb3duKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSBjdXJzb3IgZHVyaW5nIG1vdXNldXBcclxuICAgICAqIEBwYXJhbSB7TW91c2VFdmVudH0gZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX21vdXNlVXAoZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLmVtaXQoJ2NsaWNrZWQnLCBlLmN1cnJlbnRUYXJnZXQsIHRoaXMpXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHV0aWxzLnN0eWxlKGUuY3VycmVudFRhcmdldCwgJ2N1cnNvcicsIHRoaXMub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgcGlja2VkIHVwIGJlY2F1c2UgaXQgd2FzIG1vdmVkIGJleW9uZCB0aGUgb3B0aW9ucy50aHJlc2hvbGRcclxuICogQGV2ZW50IFNvcnRhYmxlI3BpY2t1cFxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHNvcnRhYmxlIGlzIHJlb3JkZXJlZFxyXG4gKiBAZXZlbnQgU29ydGFibGUjb3JkZXJcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCB0aGF0IHdhcyByZW9yZGVyZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgcGxhY2VkXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyBhZGRlZCB0byB0aGlzIHNvcnRhYmxlXHJcbiAqIEBldmVudCBTb3J0YWJsZSNhZGRcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBhZGRlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyBhZGRlZFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgcmVtb3ZlZCBmcm9tIHRoaXMgc29ydGFibGVcclxuICogQGV2ZW50IFNvcnRhYmxlI3JlbW92ZVxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHJlbW92ZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgcmVtb3ZlZFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgcmVtb3ZlZCBmcm9tIGFsbCBzb3J0YWJsZXNcclxuICogQGV2ZW50IFNvcnRhYmxlI2RlbGV0ZVxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHJlbW92ZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgZHJhZ2dlZCBmcm9tXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBjb3B5IG9mIGFuIGVsZW1lbnQgaXMgZHJvcHBlZFxyXG4gKiBAZXZlbnQgU29ydGFibGUjY29weVxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHJlbW92ZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgZHJhZ2dlZCBmcm9tXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gdGhlIHNvcnRhYmxlIGlzIHVwZGF0ZWQgd2l0aCBhbiBhZGQsIHJlbW92ZSwgb3Igb3JkZXIgY2hhbmdlXHJcbiAqIEBldmVudCBTb3J0YWJsZSN1cGRhdGVcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBjaGFuZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdpdGggZWxlbWVudFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgcmVtb3ZlZCBiZWNhdXNlIG1heGltdW0gd2FzIHJlYWNoZWQgZm9yIHRoZSBzb3J0YWJsZVxyXG4gKiBAZXZlbnQgU29ydGFibGUjbWF4aW11bS1yZW1vdmVcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCByZW1vdmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIGRyYWdnZWQgZnJvbVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIG9yZGVyIHdhcyBjaGFuZ2VkIGJ1dCBlbGVtZW50IHdhcyBub3QgZHJvcHBlZCB5ZXRcclxuICogQGV2ZW50IFNvcnRhYmxlI29yZGVyLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gZWxlbWVudCBpcyBhZGRlZCBidXQgbm90IGRyb3BwZWQgeWV0XHJcbiAqIEBldmVudCBTb3J0YWJsZSNhZGQtcGVuZGluZ1xyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBlbGVtZW50IGlzIHJlbW92ZWQgYnV0IG5vdCBkcm9wcGVkIHlldFxyXG4gKiBAZXZlbnQgU29ydGFibGUjcmVtb3ZlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gZWxlbWVudCBpcyByZW1vdmVkIGFmdGVyIGJlaW5nIHRlbXBvcmFyaWx5IGFkZGVkXHJcbiAqIEBldmVudCBTb3J0YWJsZSNhZGQtcmVtb3ZlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyBhYm91dCB0byBiZSByZW1vdmVkIGZyb20gYWxsIHNvcnRhYmxlc1xyXG4gKiBAZXZlbnQgU29ydGFibGUjZGVsZXRlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCByZW1vdmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIGRyYWdnZWQgZnJvbVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgYWRkZWQsIHJlbW92ZWQsIG9yIHJlb3JkZXIgYnV0IGVsZW1lbnQgaGFzIG5vdCBkcm9wcGVkIHlldFxyXG4gKiBAZXZlbnQgU29ydGFibGUjdXBkYXRlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBjb3B5IG9mIGFuIGVsZW1lbnQgaXMgYWJvdXQgdG8gZHJvcFxyXG4gKiBAZXZlbnQgU29ydGFibGUjY29weS1wZW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgcmVtb3ZlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyBkcmFnZ2VkIGZyb21cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIGFib3V0IHRvIGJlIHJlbW92ZWQgYmVjYXVzZSBtYXhpbXVtIHdhcyByZWFjaGVkIGZvciB0aGUgc29ydGFibGVcclxuICogQGV2ZW50IFNvcnRhYmxlI21heGltdW0tcmVtb3ZlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCByZW1vdmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIGRyYWdnZWQgZnJvbVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgY2xpY2tlZCB3aXRob3V0IGRyYWdnaW5nXHJcbiAqIEBldmVudCBTb3J0YWJsZSNjbGlja2VkXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgY2xpY2tlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IGlzIGEgY2hpbGRcclxuICovXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNvcnRhYmxlIl19