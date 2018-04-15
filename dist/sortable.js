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
            if (name && name === this.options.name) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3J0YWJsZS5qcyJdLCJuYW1lcyI6WyJFdmVudHMiLCJyZXF1aXJlIiwiZGVmYXVsdHMiLCJ1dGlscyIsIlNvcnRhYmxlIiwiZWxlbWVudCIsIm9wdGlvbnMiLCJfYWRkVG9HbG9iYWxUcmFja2VyIiwiZWxlbWVudHMiLCJfZ2V0Q2hpbGRyZW4iLCJldmVudHMiLCJkcmFnU3RhcnQiLCJlIiwiX2RyYWdTdGFydCIsImRyYWdFbmQiLCJfZHJhZ0VuZCIsImRyYWdPdmVyIiwiX2RyYWdPdmVyIiwiZHJvcCIsIl9kcm9wIiwiZHJhZ0xlYXZlIiwiX2RyYWdMZWF2ZSIsIm1vdXNlT3ZlciIsIl9tb3VzZUVudGVyIiwibW91c2VEb3duIiwiX21vdXNlRG93biIsIm1vdXNlVXAiLCJfbW91c2VVcCIsImNoaWxkIiwiZHJhZ0NsYXNzIiwiY29udGFpbnNDbGFzc05hbWUiLCJhdHRhY2hFbGVtZW50IiwiYWRkRXZlbnRMaXN0ZW5lciIsImN1cnNvckhvdmVyIiwic3R5bGUiLCJjdXJzb3JEb3duIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsInJlbW92ZUVsZW1lbnQiLCJpbmRleCIsInNvcnQiLCJjaGlsZHJlbiIsImxlbmd0aCIsImFwcGVuZENoaWxkIiwiaW5zZXJ0QmVmb3JlIiwiaWQiLCJvcmRlcklkIiwiZHJhZ09yZGVyIiwiZ2V0QXR0cmlidXRlIiwib3JkZXJJZElzTnVtYmVyIiwicGFyc2VGbG9hdCIsImZvdW5kIiwicmV2ZXJzZU9yZGVyIiwiaSIsImNoaWxkRHJhZ09yZGVyIiwib3JkZXJJc051bWJlciIsInBhcmVudE5vZGUiLCJfX3NvcnRhYmxlIiwib3JpZ2luYWwiLCJzb3J0YWJsZSIsIl9tYXhpbXVtQ291bnRlciIsIm5hbWUiLCJ0cmFja2VyIiwiY291bnRlciIsImNvcHkiLCJzZXRBdHRyaWJ1dGUiLCJkcmFnSW1hZ2UiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJib2R5IiwiX2JvZHlEcmFnT3ZlciIsIl9ib2R5RHJvcCIsImxpc3QiLCJwdXNoIiwiZGF0YVRyYW5zZmVyIiwidHlwZXMiLCJnZXRFbGVtZW50QnlJZCIsIl9maW5kQ2xvc2VzdCIsImxhc3QiLCJNYXRoIiwiYWJzIiwieCIsInBhZ2VYIiwidGhyZXNob2xkIiwieSIsInBhZ2VZIiwiX3VwZGF0ZURyYWdnaW5nIiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJfcGxhY2VJbkxpc3QiLCJkcm9wRWZmZWN0IiwiX25vRHJvcCIsImNhbmNlbCIsIl9zZXRJY29uIiwib2ZmTGlzdCIsImRpc3BsYXkiLCJlbWl0IiwiX3JlcGxhY2VJbkxpc3QiLCJjdXJyZW50IiwiX2NsZWFyTWF4aW11bVBlbmRpbmciLCJfcmVtb3ZlRHJhZ2dpbmciLCJyZW1vdmUiLCJjdXJyZW50VGFyZ2V0IiwiZHJhZ2dpbmciLCJpY29uIiwiY2xvbmVOb2RlIiwiZHJhZ1N0eWxlIiwicG9zIiwidG9HbG9iYWwiLCJsZWZ0IiwidG9wIiwib2Zmc2V0IiwidXNlSWNvbnMiLCJpbWFnZSIsIkltYWdlIiwic3JjIiwiaWNvbnMiLCJyZW9yZGVyIiwicG9zaXRpb24iLCJ0cmFuc2Zvcm0iLCJvZmZzZXRMZWZ0Iiwib2Zmc2V0V2lkdGgiLCJvZmZzZXRUb3AiLCJvZmZzZXRIZWlnaHQiLCJ0YXJnZXQiLCJpc0NvcHkiLCJjbGVhckRhdGEiLCJzZXREYXRhIiwic2V0RHJhZ0ltYWdlIiwiX2dldEluZGV4IiwiX21heGltdW0iLCJtaW4iLCJJbmZpbml0eSIsInJlbGF0ZWQiLCJpbnNpZGUiLCJjYWxjdWxhdGUiLCJkaXN0YW5jZVRvQ2xvc2VzdENvcm5lciIsIl9wbGFjZUluU29ydGFibGVMaXN0IiwiX3BsYWNlSW5PcmRlcmVkTGlzdCIsImJhc2UiLCJzZWFyY2giLCJyZXN1bHRzIiwiaW5kZXhPZiIsImNsYXNzTmFtZSIsIl90cmF2ZXJzZUNoaWxkcmVuIiwib3JkZXIiLCJkZWVwU2VhcmNoIiwib3JkZXJDbGFzcyIsIl9tYXhpbXVtUGVuZGluZyIsImN1cnNvciIsInhhMSIsInlhMSIsInhhMiIsInlhMiIsImxhcmdlc3QiLCJjbG9zZXN0IiwiaXNCZWZvcmUiLCJpbmRpY2F0b3IiLCJ4YjEiLCJ5YjEiLCJ4YjIiLCJ5YjIiLCJwZXJjZW50YWdlIiwibmV4dFNpYmxpbmciLCJkaXN0YW5jZSIsIm1lYXN1cmUiLCJfcGxhY2VCeURpc3RhbmNlIiwiZGVsZXRlIiwibW92ZSIsImNvdW50IiwibWF4aW11bSIsInJlbW92ZVBlbmRpbmciLCJwb3AiLCJzYXZlUGVuZGluZyIsInNsaWNlIiwibWF4aW11bUZJRk8iLCJhIiwiYiIsImhpZGUiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxlQUFSLENBQWY7O0FBRUEsSUFBTUMsV0FBV0QsUUFBUSxZQUFSLENBQWpCO0FBQ0EsSUFBTUUsUUFBUUYsUUFBUSxTQUFSLENBQWQ7O0lBRU1HLFE7OztBQUVGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTRDQSxzQkFBWUMsT0FBWixFQUFxQkMsT0FBckIsRUFDQTtBQUFBOztBQUFBOztBQUVJLGNBQUtBLE9BQUwsR0FBZUgsTUFBTUcsT0FBTixDQUFjQSxPQUFkLEVBQXVCSixRQUF2QixDQUFmO0FBQ0EsY0FBS0csT0FBTCxHQUFlQSxPQUFmO0FBQ0EsY0FBS0UsbUJBQUw7QUFDQSxZQUFNQyxXQUFXLE1BQUtDLFlBQUwsRUFBakI7QUFDQSxjQUFLQyxNQUFMLEdBQWM7QUFDVkMsdUJBQVcsbUJBQUNDLENBQUQ7QUFBQSx1QkFBTyxNQUFLQyxVQUFMLENBQWdCRCxDQUFoQixDQUFQO0FBQUEsYUFERDtBQUVWRSxxQkFBUyxpQkFBQ0YsQ0FBRDtBQUFBLHVCQUFPLE1BQUtHLFFBQUwsQ0FBY0gsQ0FBZCxDQUFQO0FBQUEsYUFGQztBQUdWSSxzQkFBVSxrQkFBQ0osQ0FBRDtBQUFBLHVCQUFPLE1BQUtLLFNBQUwsQ0FBZUwsQ0FBZixDQUFQO0FBQUEsYUFIQTtBQUlWTSxrQkFBTSxjQUFDTixD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QUFxQm5GLEVBQUV5RixhQUF2QixFQUFzQyxJQUF0QztBQUNBLGdCQUFJLEtBQUsvRixPQUFMLENBQWEyQixXQUFqQixFQUNBO0FBQ0k5QixzQkFBTStCLEtBQU4sQ0FBWXRCLEVBQUV5RixhQUFkLEVBQTZCLFFBQTdCLEVBQXVDLEtBQUsvRixPQUFMLENBQWEyQixXQUFwRDtBQUNIO0FBQ0o7Ozs7O0FBeGlDRDs7Ozs7K0JBS2N6QixRLEVBQVVGLE8sRUFDeEI7QUFDSSxnQkFBTXNJLFVBQVUsRUFBaEI7QUFESjtBQUFBO0FBQUE7O0FBQUE7QUFFSSx1Q0FBb0JwSSxRQUFwQix3SUFDQTtBQUFBLHdCQURTSCxPQUNUOztBQUNJdUksNEJBQVFwRSxJQUFSLENBQWEsSUFBSXBFLFFBQUosQ0FBYUMsT0FBYixFQUFzQkMsT0FBdEIsQ0FBYjtBQUNIO0FBTEw7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFNSSxtQkFBT3NJLE9BQVA7QUFDSDs7OzRCQWpCRDtBQUNJLG1CQUFPMUksUUFBUDtBQUNIOzs7O0VBN0drQkYsTTs7QUEwcEN2Qjs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9Ba0wsT0FBT0MsT0FBUCxHQUFpQi9LLFFBQWpCIiwiZmlsZSI6InNvcnRhYmxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgRXZlbnRzID0gcmVxdWlyZSgnZXZlbnRlbWl0dGVyMycpXHJcblxyXG5jb25zdCBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vZGVmYXVsdHMnKVxyXG5jb25zdCB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKVxyXG5cclxuY2xhc3MgU29ydGFibGUgZXh0ZW5kcyBFdmVudHNcclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgc29ydGFibGUgbGlzdFxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLm5hbWU9c29ydGFibGVdIGRyYWdnaW5nIGlzIGFsbG93ZWQgYmV0d2VlbiBTb3J0YWJsZXMgd2l0aCB0aGUgc2FtZSBuYW1lXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuZHJhZ0NsYXNzXSBpZiBzZXQgdGhlbiBkcmFnIG9ubHkgaXRlbXMgd2l0aCB0aGlzIGNsYXNzTmFtZSB1bmRlciBlbGVtZW50OyBvdGhlcndpc2UgZHJhZyBhbGwgY2hpbGRyZW5cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5vcmRlckNsYXNzXSB1c2UgdGhpcyBjbGFzcyB0byBpbmNsdWRlIGVsZW1lbnRzIGluIG9yZGVyaW5nIGJ1dCBub3QgZHJhZ2dpbmc7IG90aGVyd2lzZSBhbGwgY2hpbGRyZW4gZWxlbWVudHMgYXJlIGluY2x1ZGVkIGluIHdoZW4gc29ydGluZyBhbmQgb3JkZXJpbmdcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuZGVlcFNlYXJjaF0gaWYgZHJhZ0NsYXNzIGFuZCBkZWVwU2VhcmNoIHRoZW4gc2VhcmNoIGFsbCBkZXNjZW5kZW50cyBvZiBlbGVtZW50IGZvciBkcmFnQ2xhc3NcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuc29ydD10cnVlXSBhbGxvdyBzb3J0aW5nIHdpdGhpbiBsaXN0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmRyb3A9dHJ1ZV0gYWxsb3cgZHJvcCBmcm9tIHJlbGF0ZWQgc29ydGFibGVzIChkb2Vzbid0IGltcGFjdCByZW9yZGVyaW5nIHRoaXMgc29ydGFibGUncyBjaGlsZHJlbiB1bnRpbCB0aGUgY2hpbGRyZW4gYXJlIG1vdmVkIHRvIGEgZGlmZmVyZW4gc29ydGFibGUpXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmNvcHk9ZmFsc2VdIGNyZWF0ZSBjb3B5IHdoZW4gZHJhZ2dpbmcgYW4gaXRlbSAodGhpcyBkaXNhYmxlcyBzb3J0PXRydWUgZm9yIHRoaXMgc29ydGFibGUpXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMub3JkZXJJZD1kYXRhLW9yZGVyXSBmb3Igb3JkZXJlZCBsaXN0cywgdXNlIHRoaXMgZGF0YSBpZCB0byBmaWd1cmUgb3V0IHNvcnQgb3JkZXJcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMub3JkZXJJZElzTnVtYmVyPXRydWVdIHVzZSBwYXJzZUludCBvbiBvcHRpb25zLnNvcnRJZCB0byBwcm9wZXJseSBzb3J0IG51bWJlcnNcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5yZXZlcnNlT3JkZXJdIHJldmVyc2Ugc29ydCB0aGUgb3JkZXJJZFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLm9mZkxpc3Q9Y2xvc2VzdF0gaG93IHRvIGhhbmRsZSB3aGVuIGFuIGVsZW1lbnQgaXMgZHJvcHBlZCBvdXRzaWRlIGEgc29ydGFibGU6IGNsb3Nlc3Q9ZHJvcCBpbiBjbG9zZXN0IHNvcnRhYmxlOyBjYW5jZWw9cmV0dXJuIHRvIHN0YXJ0aW5nIHNvcnRhYmxlOyBkZWxldGU9cmVtb3ZlIGZyb20gYWxsIHNvcnRhYmxlc1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1heGltdW1dIG1heGltdW0gbnVtYmVyIG9mIGVsZW1lbnRzIGFsbG93ZWQgaW4gYSBzb3J0YWJsZSBsaXN0XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLm1heGltdW1GSUZPXSBkaXJlY3Rpb24gb2Ygc2VhcmNoIHRvIGNob29zZSB3aGljaCBpdGVtIHRvIHJlbW92ZSB3aGVuIG1heGltdW0gaXMgcmVhY2hlZFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmN1cnNvckhvdmVyPWdyYWIgLXdlYmtpdC1ncmFiIHBvaW50ZXJdIHVzZSB0aGlzIGN1cnNvciBsaXN0IHRvIHNldCBjdXJzb3Igd2hlbiBob3ZlcmluZyBvdmVyIGEgc29ydGFibGUgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmN1cnNvckRvd249Z3JhYmJpbmcgLXdlYmtpdC1ncmFiYmluZyBwb2ludGVyXSB1c2UgdGhpcyBjdXJzb3IgbGlzdCB0byBzZXQgY3Vyc29yIHdoZW4gbW91c2Vkb3duL3RvdWNoZG93biBvdmVyIGEgc29ydGFibGUgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy51c2VJY29ucz10cnVlXSBzaG93IGljb25zIHdoZW4gZHJhZ2dpbmdcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9ucy5pY29uc10gZGVmYXVsdCBzZXQgb2YgaWNvbnNcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5pY29ucy5yZW9yZGVyXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmljb25zLm1vdmVdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuaWNvbnMuY29weV1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5pY29ucy5kZWxldGVdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuY3VzdG9tSWNvbl0gc291cmNlIG9mIGN1c3RvbSBpbWFnZSB3aGVuIG92ZXIgdGhpcyBzb3J0YWJsZVxyXG4gICAgICogQGZpcmVzIHBpY2t1cFxyXG4gICAgICogQGZpcmVzIG9yZGVyXHJcbiAgICAgKiBAZmlyZXMgYWRkXHJcbiAgICAgKiBAZmlyZXMgcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgdXBkYXRlXHJcbiAgICAgKiBAZmlyZXMgZGVsZXRlXHJcbiAgICAgKiBAZmlyZXMgY29weVxyXG4gICAgICogQGZpcmVzIG1heGltdW0tcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgb3JkZXItcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIGFkZC1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgcmVtb3ZlLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyBhZGQtcmVtb3ZlLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyB1cGRhdGUtcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIGRlbGV0ZS1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgY29weS1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgbWF4aW11bS1yZW1vdmUtcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIGNsaWNrZWRcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBzdXBlcigpXHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gdXRpbHMub3B0aW9ucyhvcHRpb25zLCBkZWZhdWx0cylcclxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50XHJcbiAgICAgICAgdGhpcy5fYWRkVG9HbG9iYWxUcmFja2VyKClcclxuICAgICAgICBjb25zdCBlbGVtZW50cyA9IHRoaXMuX2dldENoaWxkcmVuKClcclxuICAgICAgICB0aGlzLmV2ZW50cyA9IHtcclxuICAgICAgICAgICAgZHJhZ1N0YXJ0OiAoZSkgPT4gdGhpcy5fZHJhZ1N0YXJ0KGUpLFxyXG4gICAgICAgICAgICBkcmFnRW5kOiAoZSkgPT4gdGhpcy5fZHJhZ0VuZChlKSxcclxuICAgICAgICAgICAgZHJhZ092ZXI6IChlKSA9PiB0aGlzLl9kcmFnT3ZlcihlKSxcclxuICAgICAgICAgICAgZHJvcDogKGUpID0+IHRoaXMuX2Ryb3AoZSksXHJcbiAgICAgICAgICAgIGRyYWdMZWF2ZTogKGUpID0+IHRoaXMuX2RyYWdMZWF2ZShlKSxcclxuICAgICAgICAgICAgbW91c2VPdmVyOiAoZSkgPT4gdGhpcy5fbW91c2VFbnRlcihlKSxcclxuICAgICAgICAgICAgbW91c2VEb3duOiAoZSkgPT4gdGhpcy5fbW91c2VEb3duKGUpLFxyXG4gICAgICAgICAgICBtb3VzZVVwOiAoZSkgPT4gdGhpcy5fbW91c2VVcChlKVxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBlbGVtZW50cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5vcHRpb25zLmRyYWdDbGFzcyB8fCB1dGlscy5jb250YWluc0NsYXNzTmFtZShjaGlsZCwgdGhpcy5vcHRpb25zLmRyYWdDbGFzcykpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYXR0YWNoRWxlbWVudChjaGlsZClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgdGhpcy5ldmVudHMuZHJhZ092ZXIpXHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywgdGhpcy5ldmVudHMuZHJvcClcclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdsZWF2ZScsIHRoaXMuZXZlbnRzLmRyYWdMZWF2ZSlcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmN1cnNvckhvdmVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5fZ2V0Q2hpbGRyZW4oKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdXRpbHMuc3R5bGUoY2hpbGQsICdjdXJzb3InLCB0aGlzLm9wdGlvbnMuY3Vyc29ySG92ZXIpXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmN1cnNvckRvd24pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5ldmVudHMubW91c2VEb3duKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2hpbGQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuZXZlbnRzLm1vdXNlVXApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZW1vdmVzIGFsbCBldmVudCBoYW5kbGVycyBmcm9tIHRoaXMuZWxlbWVudCBhbmQgY2hpbGRyZW5cclxuICAgICAqL1xyXG4gICAgZGVzdHJveSgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgdGhpcy5ldmVudHMuZHJhZ092ZXIpXHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLmV2ZW50cy5kcm9wKVxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnRzID0gdGhpcy5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGVsZW1lbnRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVFbGVtZW50KGNoaWxkKVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB0b2RvOiByZW1vdmUgU29ydGFibGUudHJhY2tlciBhbmQgcmVsYXRlZCBldmVudCBoYW5kbGVycyBpZiBubyBtb3JlIHNvcnRhYmxlc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdGhlIGdsb2JhbCBkZWZhdWx0cyBmb3IgbmV3IFNvcnRhYmxlIG9iamVjdHNcclxuICAgICAqIEB0eXBlIHtEZWZhdWx0T3B0aW9uc31cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldCBkZWZhdWx0cygpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjcmVhdGUgbXVsdGlwbGUgc29ydGFibGUgZWxlbWVudHNcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnRzW119IGVsZW1lbnRzXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyAtIHNlZSBjb25zdHJ1Y3RvciBmb3Igb3B0aW9uc1xyXG4gICAgICovXHJcbiAgICBzdGF0aWMgY3JlYXRlKGVsZW1lbnRzLCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXVxyXG4gICAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgZWxlbWVudHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXN1bHRzLnB1c2gobmV3IFNvcnRhYmxlKGVsZW1lbnQsIG9wdGlvbnMpKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0c1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYWRkIGFuIGVsZW1lbnQgYXMgYSBjaGlsZCBvZiB0aGUgc29ydGFibGUgZWxlbWVudDsgY2FuIGFsc28gYmUgdXNlZCB0byBzd2FwIGJldHdlZW4gc29ydGFibGVzXHJcbiAgICAgKiBOT1RFOiB0aGlzIG1heSBub3Qgd29yayB3aXRoIGRlZXBTZWFyY2ggbm9uLW9yZGVyZWQgZWxlbWVudHM7IHVzZSBhdHRhY2hFbGVtZW50IGluc3RlYWRcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleFxyXG4gICAgICovXHJcbiAgICBhZGQoZWxlbWVudCwgaW5kZXgpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5hdHRhY2hFbGVtZW50KGVsZW1lbnQpXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zb3J0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBpbmRleCA9PT0gJ3VuZGVmaW5lZCcgfHwgaW5kZXggPj0gdGhpcy5lbGVtZW50LmNoaWxkcmVuLmxlbmd0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuaW5zZXJ0QmVmb3JlKGVsZW1lbnQsIHRoaXMuZWxlbWVudC5jaGlsZHJlbltpbmRleCArIDFdKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gdGhpcy5vcHRpb25zLm9yZGVySWRcclxuICAgICAgICAgICAgbGV0IGRyYWdPcmRlciA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICBkcmFnT3JkZXIgPSB0aGlzLm9wdGlvbnMub3JkZXJJZElzTnVtYmVyID8gcGFyc2VGbG9hdChkcmFnT3JkZXIpIDogZHJhZ09yZGVyXHJcbiAgICAgICAgICAgIGxldCBmb3VuZFxyXG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuX2dldENoaWxkcmVuKHRydWUpXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmV2ZXJzZU9yZGVyKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBjaGlsZHJlbltpXVxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZERyYWdPcmRlciA9IGNoaWxkLmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZERyYWdPcmRlciA9IHRoaXMub3B0aW9ucy5vcmRlcklzTnVtYmVyID8gcGFyc2VGbG9hdChjaGlsZERyYWdPcmRlcikgOiBjaGlsZERyYWdPcmRlclxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnT3JkZXIgPiBjaGlsZERyYWdPcmRlcilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGVsZW1lbnQsIGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBjaGlsZHJlbilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGREcmFnT3JkZXIgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGREcmFnT3JkZXIgPSB0aGlzLm9wdGlvbnMub3JkZXJJc051bWJlciA/IHBhcnNlRmxvYXQoY2hpbGREcmFnT3JkZXIpIDogY2hpbGREcmFnT3JkZXJcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ09yZGVyIDwgY2hpbGREcmFnT3JkZXIpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShlbGVtZW50LCBjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghZm91bmQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChlbGVtZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYXR0YWNoZXMgYW4gSFRNTCBlbGVtZW50IHRvIHRoZSBzb3J0YWJsZTsgY2FuIGFsc28gYmUgdXNlZCB0byBzd2FwIGJldHdlZW4gc29ydGFibGVzXHJcbiAgICAgKiBOT1RFOiB5b3UgbmVlZCB0byBtYW51YWxseSBpbnNlcnQgdGhlIGVsZW1lbnQgaW50byB0aGlzLmVsZW1lbnQgKHRoaXMgaXMgdXNlZnVsIHdoZW4geW91IGhhdmUgYSBkZWVwIHN0cnVjdHVyZSlcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqL1xyXG4gICAgYXR0YWNoRWxlbWVudChlbGVtZW50KVxyXG4gICAge1xyXG4gICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgPSB0aGlzXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZSA9IHtcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlOiB0aGlzLFxyXG4gICAgICAgICAgICAgICAgb3JpZ2luYWw6IHRoaXNcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gYWRkIGEgY291bnRlciBmb3IgbWF4aW11bVxyXG4gICAgICAgICAgICB0aGlzLl9tYXhpbXVtQ291bnRlcihlbGVtZW50LCB0aGlzKVxyXG5cclxuICAgICAgICAgICAgLy8gZW5zdXJlIGV2ZXJ5IGVsZW1lbnQgaGFzIGFuIGlkXHJcbiAgICAgICAgICAgIGlmICghZWxlbWVudC5pZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5pZCA9ICdfX3NvcnRhYmxlLScgKyB0aGlzLm9wdGlvbnMubmFtZSArICctJyArIFNvcnRhYmxlLnRyYWNrZXJbdGhpcy5vcHRpb25zLm5hbWVdLmNvdW50ZXJcclxuICAgICAgICAgICAgICAgIFNvcnRhYmxlLnRyYWNrZXJbdGhpcy5vcHRpb25zLm5hbWVdLmNvdW50ZXIrK1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY29weSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmNvcHkgPSAwXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdkcmFnc3RhcnQnLCB0aGlzLmV2ZW50cy5kcmFnU3RhcnQpXHJcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ2VuZCcsIHRoaXMuZXZlbnRzLmRyYWdFbmQpXHJcbiAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdkcmFnZ2FibGUnLCB0cnVlKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlbW92ZXMgYWxsIGV2ZW50cyBmcm9tIGFuIEhUTUwgZWxlbWVudFxyXG4gICAgICogTk9URTogZG9lcyBub3QgcmVtb3ZlIHRoZSBlbGVtZW50IGZyb20gaXRzIHBhcmVudFxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICovXHJcbiAgICByZW1vdmVFbGVtZW50KGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdkcmFnc3RhcnQnLCB0aGlzLmV2ZW50cy5kcmFnU3RhcnQpXHJcbiAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdkcmFnZW5kJywgdGhpcy5ldmVudHMuZHJhZ0VuZClcclxuICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSgnZHJhZ2dhYmxlJywgZmFsc2UpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhZGQgc29ydGFibGUgdG8gZ2xvYmFsIGxpc3QgdGhhdCB0cmFja3MgYWxsIHNvcnRhYmxlc1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2FkZFRvR2xvYmFsVHJhY2tlcigpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKCFTb3J0YWJsZS50cmFja2VyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgU29ydGFibGUuZHJhZ0ltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgICAgICAgICAgU29ydGFibGUuZHJhZ0ltYWdlLmlkID0gJ3NvcnRhYmxlLWRyYWdJbWFnZSdcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChTb3J0YWJsZS5kcmFnSW1hZ2UpXHJcbiAgICAgICAgICAgIFNvcnRhYmxlLnRyYWNrZXIgPSB7fVxyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgKGUpID0+IHRoaXMuX2JvZHlEcmFnT3ZlcihlKSlcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywgKGUpID0+IHRoaXMuX2JvZHlEcm9wKGUpKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoU29ydGFibGUudHJhY2tlclt0aGlzLm9wdGlvbnMubmFtZV0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBTb3J0YWJsZS50cmFja2VyW3RoaXMub3B0aW9ucy5uYW1lXS5saXN0LnB1c2godGhpcylcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgU29ydGFibGUudHJhY2tlclt0aGlzLm9wdGlvbnMubmFtZV0gPSB7IGxpc3Q6IFt0aGlzXSwgY291bnRlcjogMCB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZGVmYXVsdCBkcmFnIG92ZXIgZm9yIHRoZSBib2R5XHJcbiAgICAgKiBAcGFyYW0ge0RyYWdFdmVudH0gZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2JvZHlEcmFnT3ZlcihlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IG5hbWUgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1swXVxyXG4gICAgICAgIGlmIChuYW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1sxXVxyXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXHJcbiAgICAgICAgICAgIGNvbnN0IHNvcnRhYmxlID0gdGhpcy5fZmluZENsb3Nlc3QoZSwgU29ydGFibGUudHJhY2tlcltuYW1lXS5saXN0LCBlbGVtZW50KVxyXG4gICAgICAgICAgICBpZiAoZWxlbWVudClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHNvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZS5sYXN0ICYmIE1hdGguYWJzKHNvcnRhYmxlLmxhc3QueCAtIGUucGFnZVgpIDwgc29ydGFibGUub3B0aW9ucy50aHJlc2hvbGQgJiYgTWF0aC5hYnMoc29ydGFibGUubGFzdC55IC0gZS5wYWdlWSkgPCBzb3J0YWJsZS5vcHRpb25zLnRocmVzaG9sZClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlLl91cGRhdGVEcmFnZ2luZyhlLCBlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgc29ydGFibGUubGFzdCA9IHsgeDogZS5wYWdlWCwgeTogZS5wYWdlWSB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGxhY2VJbkxpc3Qoc29ydGFibGUsIGUucGFnZVgsIGUucGFnZVksIGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgZS5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9ICdtb3ZlJ1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZURyYWdnaW5nKGUsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbm9Ecm9wKGUpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSBubyBkcm9wXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NhbmNlbF0gZm9yY2UgY2FuY2VsIChmb3Igb3B0aW9ucy5jb3B5KVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX25vRHJvcChlLCBjYW5jZWwpXHJcbiAgICB7XHJcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9ICdtb3ZlJ1xyXG4gICAgICAgIGNvbnN0IGlkID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMV1cclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXHJcbiAgICAgICAgaWYgKGVsZW1lbnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLl91cGRhdGVEcmFnZ2luZyhlLCBlbGVtZW50KVxyXG4gICAgICAgICAgICB0aGlzLl9zZXRJY29uKGVsZW1lbnQsIG51bGwsIGNhbmNlbClcclxuICAgICAgICAgICAgaWYgKCFjYW5jZWwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwub3B0aW9ucy5vZmZMaXN0ID09PSAnZGVsZXRlJylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkgPSBlbGVtZW50LnN0eWxlLmRpc3BsYXkgfHwgJ3Vuc2V0J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsLmVtaXQoJ2RlbGV0ZS1wZW5kaW5nJywgZWxlbWVudCwgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKCFlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwub3B0aW9ucy5jb3B5KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3JlcGxhY2VJbkxpc3QoZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsLCBlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fY2xlYXJNYXhpbXVtUGVuZGluZyhlbGVtZW50Ll9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5jdXJyZW50LmVtaXQoJ2FkZC1yZW1vdmUtcGVuZGluZycsIGVsZW1lbnQsIGVsZW1lbnQuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmN1cnJlbnQuZW1pdCgndXBkYXRlLXBlbmRpbmcnLCBlbGVtZW50LCBlbGVtZW50Ll9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5jdXJyZW50ID0gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZGVmYXVsdCBkcm9wIGZvciB0aGUgYm9keVxyXG4gICAgICogQHBhcmFtIHtEcmFnRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9ib2R5RHJvcChlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IG5hbWUgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1swXVxyXG4gICAgICAgIGlmIChuYW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1sxXVxyXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXHJcbiAgICAgICAgICAgIGNvbnN0IHNvcnRhYmxlID0gdGhpcy5fZmluZENsb3Nlc3QoZSwgU29ydGFibGUudHJhY2tlcltuYW1lXS5saXN0LCBlbGVtZW50KVxyXG4gICAgICAgICAgICBpZiAoZWxlbWVudClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHNvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVtb3ZlRHJhZ2dpbmcoZWxlbWVudClcclxuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXlcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheSA9IG51bGxcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwuZW1pdCgnZGVsZXRlJywgZWxlbWVudCwgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsKVxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9IG51bGxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGVuZCBkcmFnXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kcmFnRW5kKGUpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGUuY3VycmVudFRhcmdldFxyXG4gICAgICAgIGNvbnN0IGRyYWdnaW5nID0gZWxlbWVudC5fX3NvcnRhYmxlLmRyYWdnaW5nXHJcbiAgICAgICAgaWYgKGRyYWdnaW5nKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZHJhZ2dpbmcucmVtb3ZlKClcclxuICAgICAgICAgICAgaWYgKGRyYWdnaW5nLmljb24pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGRyYWdnaW5nLmljb24ucmVtb3ZlKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuZHJhZ2dpbmcgPSBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc3RhcnQgZHJhZ1xyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZHJhZ1N0YXJ0KGUpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3Qgc29ydGFibGUgPSBlLmN1cnJlbnRUYXJnZXQuX19zb3J0YWJsZS5vcmlnaW5hbFxyXG4gICAgICAgIGNvbnN0IGRyYWdnaW5nID0gZS5jdXJyZW50VGFyZ2V0LmNsb25lTm9kZSh0cnVlKVxyXG4gICAgICAgIGZvciAobGV0IHN0eWxlIGluIHNvcnRhYmxlLm9wdGlvbnMuZHJhZ1N0eWxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZHJhZ2dpbmcuc3R5bGVbc3R5bGVdID0gc29ydGFibGUub3B0aW9ucy5kcmFnU3R5bGVbc3R5bGVdXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHBvcyA9IHV0aWxzLnRvR2xvYmFsKGUuY3VycmVudFRhcmdldClcclxuICAgICAgICBkcmFnZ2luZy5zdHlsZS5sZWZ0ID0gcG9zLnggKyAncHgnXHJcbiAgICAgICAgZHJhZ2dpbmcuc3R5bGUudG9wID0gcG9zLnkgKyAncHgnXHJcbiAgICAgICAgY29uc3Qgb2Zmc2V0ID0geyB4OiBwb3MueCAtIGUucGFnZVgsIHk6IHBvcy55IC0gZS5wYWdlWSB9XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkcmFnZ2luZylcclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy51c2VJY29ucylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGltYWdlID0gbmV3IEltYWdlKClcclxuICAgICAgICAgICAgaW1hZ2Uuc3JjID0gc29ydGFibGUub3B0aW9ucy5pY29ucy5yZW9yZGVyXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xyXG4gICAgICAgICAgICBpbWFnZS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKC01MCUsIC01MCUpJ1xyXG4gICAgICAgICAgICBpbWFnZS5zdHlsZS5sZWZ0ID0gZHJhZ2dpbmcub2Zmc2V0TGVmdCArIGRyYWdnaW5nLm9mZnNldFdpZHRoICsgJ3B4J1xyXG4gICAgICAgICAgICBpbWFnZS5zdHlsZS50b3AgPSBkcmFnZ2luZy5vZmZzZXRUb3AgKyBkcmFnZ2luZy5vZmZzZXRIZWlnaHQgKyAncHgnXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaW1hZ2UpXHJcbiAgICAgICAgICAgIGRyYWdnaW5nLmljb24gPSBpbWFnZVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHV0aWxzLnN0eWxlKGUuY3VycmVudFRhcmdldCwgJ2N1cnNvcicsIHNvcnRhYmxlLm9wdGlvbnMuY3Vyc29ySG92ZXIpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB0YXJnZXQgPSBlLmN1cnJlbnRUYXJnZXRcclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5jb3B5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGFyZ2V0ID0gZS5jdXJyZW50VGFyZ2V0LmNsb25lTm9kZSh0cnVlKVxyXG4gICAgICAgICAgICB0YXJnZXQuaWQgPSBlLmN1cnJlbnRUYXJnZXQuaWQgKyAnLWNvcHktJyArIGUuY3VycmVudFRhcmdldC5fX3NvcnRhYmxlLmNvcHlcclxuICAgICAgICAgICAgZS5jdXJyZW50VGFyZ2V0Ll9fc29ydGFibGUuY29weSsrXHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmF0dGFjaEVsZW1lbnQodGFyZ2V0KVxyXG4gICAgICAgICAgICB0YXJnZXQuX19zb3J0YWJsZS5pc0NvcHkgPSB0cnVlXHJcbiAgICAgICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLm9yaWdpbmFsID0gdGhpc1xyXG4gICAgICAgICAgICB0YXJnZXQuX19zb3J0YWJsZS5kaXNwbGF5ID0gdGFyZ2V0LnN0eWxlLmRpc3BsYXkgfHwgJ3Vuc2V0J1xyXG4gICAgICAgICAgICB0YXJnZXQuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRhcmdldClcclxuICAgICAgICB9XHJcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuY2xlYXJEYXRhKClcclxuICAgICAgICBlLmRhdGFUcmFuc2Zlci5zZXREYXRhKHNvcnRhYmxlLm9wdGlvbnMubmFtZSwgc29ydGFibGUub3B0aW9ucy5uYW1lKVxyXG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLnNldERhdGEodGFyZ2V0LmlkLCB0YXJnZXQuaWQpXHJcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuc2V0RHJhZ0ltYWdlKFNvcnRhYmxlLmRyYWdJbWFnZSwgMCwgMClcclxuICAgICAgICB0YXJnZXQuX19zb3J0YWJsZS5jdXJyZW50ID0gdGhpc1xyXG4gICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLmluZGV4ID0gc29ydGFibGUub3B0aW9ucy5jb3B5ID8gLTEgOiBzb3J0YWJsZS5fZ2V0SW5kZXgodGFyZ2V0KVxyXG4gICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLmRyYWdnaW5nID0gZHJhZ2dpbmdcclxuICAgICAgICB0YXJnZXQuX19zb3J0YWJsZS5vZmZzZXQgPSBvZmZzZXRcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSBkcmFnIGxlYXZlIGV2ZW50cyBmb3Igc29ydGFibGUgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtEcmFnRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kcmFnTGVhdmUoZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBzb3J0YWJsZSA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzBdXHJcbiAgICAgICAgaWYgKHNvcnRhYmxlICYmIHNvcnRhYmxlID09PSB0aGlzLm9wdGlvbnMubmFtZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NsZWFyTWF4aW11bVBlbmRpbmcoc29ydGFibGUpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIGRyYWcgb3ZlciBldmVudHMgZm9yIHNvcnRhYmxlIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7RHJhZ0V2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZHJhZ092ZXIoZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBzb3J0YWJsZSA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzBdXHJcbiAgICAgICAgaWYgKHNvcnRhYmxlICYmIHNvcnRhYmxlID09PSB0aGlzLm9wdGlvbnMubmFtZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMV1cclxuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxyXG4gICAgICAgICAgICBpZiAodGhpcy5sYXN0ICYmIE1hdGguYWJzKHRoaXMubGFzdC54IC0gZS5wYWdlWCkgPCB0aGlzLm9wdGlvbnMudGhyZXNob2xkICYmIE1hdGguYWJzKHRoaXMubGFzdC55IC0gZS5wYWdlWSkgPCB0aGlzLm9wdGlvbnMudGhyZXNob2xkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVEcmFnZ2luZyhlLCBlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmxhc3QgPSB7IHg6IGUucGFnZVgsIHk6IGUucGFnZVkgfVxyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLmlzQ29weSAmJiBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgPT09IHRoaXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX25vRHJvcChlLCB0cnVlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMub3B0aW9ucy5kcm9wIHx8IGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9PT0gdGhpcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcGxhY2VJbkxpc3QodGhpcywgZS5wYWdlWCwgZS5wYWdlWSwgZWxlbWVudClcclxuICAgICAgICAgICAgICAgIGUuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSBlbGVtZW50Ll9fc29ydGFibGUuaXNDb3B5ID8gJ2NvcHknIDogJ21vdmUnXHJcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVEcmFnZ2luZyhlLCBlbGVtZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbm9Ecm9wKGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB1cGRhdGUgdGhlIGRyYWdnaW5nIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7VUlFdmVudH0gZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3VwZGF0ZURyYWdnaW5nKGUsIGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgZHJhZ2dpbmcgPSBlbGVtZW50Ll9fc29ydGFibGUuZHJhZ2dpbmdcclxuICAgICAgICBjb25zdCBvZmZzZXQgPSBlbGVtZW50Ll9fc29ydGFibGUub2Zmc2V0XHJcbiAgICAgICAgaWYgKGRyYWdnaW5nKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZHJhZ2dpbmcuc3R5bGUubGVmdCA9IGUucGFnZVggKyBvZmZzZXQueCArICdweCdcclxuICAgICAgICAgICAgZHJhZ2dpbmcuc3R5bGUudG9wID0gZS5wYWdlWSArIG9mZnNldC55ICsgJ3B4J1xyXG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcuaWNvbilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zdHlsZS5sZWZ0ID0gZHJhZ2dpbmcub2Zmc2V0TGVmdCArIGRyYWdnaW5nLm9mZnNldFdpZHRoICsgJ3B4J1xyXG4gICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zdHlsZS50b3AgPSBkcmFnZ2luZy5vZmZzZXRUb3AgKyBkcmFnZ2luZy5vZmZzZXRIZWlnaHQgKyAncHgnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZW1vdmUgdGhlIGRyYWdnaW5nIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9yZW1vdmVEcmFnZ2luZyhlbGVtZW50KVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGRyYWdnaW5nID0gZWxlbWVudC5fX3NvcnRhYmxlLmRyYWdnaW5nXHJcbiAgICAgICAgaWYgKGRyYWdnaW5nKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZHJhZ2dpbmcucmVtb3ZlKClcclxuICAgICAgICAgICAgaWYgKGRyYWdnaW5nLmljb24pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGRyYWdnaW5nLmljb24ucmVtb3ZlKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuZHJhZ2dpbmcgPSBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5pc0NvcHkgPSBmYWxzZVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZHJvcCB0aGUgZWxlbWVudCBpbnRvIGEgc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kcm9wKGUpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzBdXHJcbiAgICAgICAgaWYgKG5hbWUgJiYgbmFtZSA9PT0gdGhpcy5vcHRpb25zLm5hbWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzFdXHJcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZClcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsICE9PSB0aGlzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbC5lbWl0KCdyZW1vdmUnLCBlbGVtZW50LCBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdhZGQnLCBlbGVtZW50LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9IHRoaXNcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNvcnQpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ29yZGVyJywgZWxlbWVudCwgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5pc0NvcHkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2NvcHknLCBlbGVtZW50LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9tYXhpbXVtKGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCd1cGRhdGUnLCBlbGVtZW50LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUuaW5kZXggIT09IHRoaXMuX2dldEluZGV4KGUuY3VycmVudFRhcmdldCkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ29yZGVyJywgZWxlbWVudCwgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCd1cGRhdGUnLCBlbGVtZW50LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVEcmFnZ2luZyhlbGVtZW50KVxyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGZpbmQgY2xvc2VzdCBTb3J0YWJsZSB0byBzY3JlZW4gbG9jYXRpb25cclxuICAgICAqIEBwYXJhbSB7VUlFdmVudH0gZVxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZVtdfSBsaXN0IG9mIHJlbGF0ZWQgU29ydGFibGVzXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZmluZENsb3Nlc3QoZSwgbGlzdCwgZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBsZXQgbWluID0gSW5maW5pdHksIGZvdW5kXHJcbiAgICAgICAgZm9yIChsZXQgcmVsYXRlZCBvZiBsaXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCghcmVsYXRlZC5vcHRpb25zLmRyb3AgJiYgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsICE9PSByZWxhdGVkKSB8fFxyXG4gICAgICAgICAgICAgICAgKGVsZW1lbnQuX19zb3J0YWJsZS5pc0NvcHkgJiYgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsID09PSByZWxhdGVkKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29udGludWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodXRpbHMuaW5zaWRlKGUucGFnZVgsIGUucGFnZVksIHJlbGF0ZWQuZWxlbWVudCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZWxhdGVkXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAocmVsYXRlZC5vcHRpb25zLm9mZkxpc3QgPT09ICdjbG9zZXN0JylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2FsY3VsYXRlID0gdXRpbHMuZGlzdGFuY2VUb0Nsb3Nlc3RDb3JuZXIoZS5wYWdlWCwgZS5wYWdlWSwgcmVsYXRlZC5lbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgaWYgKGNhbGN1bGF0ZSA8IG1pbilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtaW4gPSBjYWxjdWxhdGVcclxuICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHJlbGF0ZWRcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZm91bmRcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBsYWNlIGluZGljYXRvciBpbiB0aGUgc29ydGFibGUgbGlzdCBhY2NvcmRpbmcgdG8gb3B0aW9ucy5zb3J0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGxhY2VJbkxpc3Qoc29ydGFibGUsIHgsIHksIGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zb3J0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fcGxhY2VJblNvcnRhYmxlTGlzdChzb3J0YWJsZSwgeCwgeSwgZWxlbWVudClcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fcGxhY2VJbk9yZGVyZWRMaXN0KHNvcnRhYmxlLCBlbGVtZW50KVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9zZXRJY29uKGVsZW1lbnQsIHNvcnRhYmxlKVxyXG4gICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5ID09PSAndW5zZXQnID8gJycgOiBlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheVxyXG4gICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheSA9IG51bGxcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZXBsYWNlIGl0ZW0gaW4gbGlzdCBhdCBvcmlnaW5hbCBpbmRleCBwb3NpdGlvblxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3JlcGxhY2VJbkxpc3Qoc29ydGFibGUsIGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IGVsZW1lbnQuX19zb3J0YWJsZS5pbmRleFxyXG4gICAgICAgICAgICBpZiAoaW5kZXggPCBjaGlsZHJlbi5sZW5ndGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkcmVuW2luZGV4XS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShlbGVtZW50LCBjaGlsZHJlbltpbmRleF0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlblswXS5hcHBlbmRDaGlsZChlbGVtZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZWxlbWVudClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjb3VudCB0aGUgaW5kZXggb2YgdGhlIGNoaWxkIGluIHRoZSBsaXN0IG9mIGNoaWxkcmVuXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjaGlsZFxyXG4gICAgICogQHJldHVybiB7bnVtYmVyfVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2dldEluZGV4KGNoaWxkKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoY2hpbGRyZW5baV0gPT09IGNoaWxkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdHJhdmVyc2UgYW5kIHNlYXJjaCBkZXNjZW5kZW50cyBpbiBET01cclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGJhc2VcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzZWFyY2hcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnRbXX0gcmVzdWx0cyB0byByZXR1cm5cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF90cmF2ZXJzZUNoaWxkcmVuKGJhc2UsIHNlYXJjaCwgcmVzdWx0cylcclxuICAgIHtcclxuICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBiYXNlLmNoaWxkcmVuKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHNlYXJjaC5sZW5ndGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzZWFyY2guaW5kZXhPZihjaGlsZC5jbGFzc05hbWUpICE9PSAtMSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goY2hpbGQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goY2hpbGQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fdHJhdmVyc2VDaGlsZHJlbihjaGlsZCwgc2VhcmNoLCByZXN1bHRzKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGZpbmQgY2hpbGRyZW4gaW4gZGl2XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3JkZXJdIHNlYXJjaCBmb3IgZHJhZ09yZGVyIGFzIHdlbGxcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9nZXRDaGlsZHJlbihvcmRlcilcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBTZWFyY2gpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgc2VhcmNoID0gW11cclxuICAgICAgICAgICAgaWYgKG9yZGVyICYmIHRoaXMub3B0aW9ucy5vcmRlckNsYXNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2gucHVzaCh0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKG9yZGVyICYmIHRoaXMub3B0aW9ucy5vcmRlckNsYXNzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaC5wdXNoKHRoaXMub3B0aW9ucy5vcmRlckNsYXNzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKCFvcmRlciAmJiB0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzZWFyY2gucHVzaCh0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXVxyXG4gICAgICAgICAgICB0aGlzLl90cmF2ZXJzZUNoaWxkcmVuKHRoaXMuZWxlbWVudCwgc2VhcmNoLCByZXN1bHRzKVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0c1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGV0IGxpc3QgPSBbXVxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5lbGVtZW50LmNoaWxkcmVuKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh1dGlscy5jb250YWluc0NsYXNzTmFtZShjaGlsZCwgdGhpcy5vcHRpb25zLmRyYWdDbGFzcykgfHwgKG9yZGVyICYmICF0aGlzLm9wdGlvbnMub3JkZXJDbGFzcyB8fCAob3JkZXIgJiYgdGhpcy5vcHRpb25zLm9yZGVyQ2xhc3MgJiYgdXRpbHMuY29udGFpbnNDbGFzc05hbWUoY2hpbGQsIHRoaXMub3B0aW9ucy5vcmRlckNsYXNzKSkpKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGlzdC5wdXNoKGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBsaXN0XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBsaXN0ID0gW11cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIHRoaXMuZWxlbWVudC5jaGlsZHJlbilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsaXN0LnB1c2goY2hpbGQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbGlzdFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGxhY2UgaW5kaWNhdG9yIGluIGFuIG9yZGVyZWQgbGlzdFxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGxhY2VJbk9yZGVyZWRMaXN0KHNvcnRhYmxlLCBkcmFnZ2luZylcclxuICAgIHtcclxuICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50ICE9PSBzb3J0YWJsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gc29ydGFibGUub3B0aW9ucy5vcmRlcklkXHJcbiAgICAgICAgICAgIGxldCBkcmFnT3JkZXIgPSBkcmFnZ2luZy5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgICAgIGRyYWdPcmRlciA9IHNvcnRhYmxlLm9wdGlvbnMub3JkZXJJZElzTnVtYmVyID8gcGFyc2VGbG9hdChkcmFnT3JkZXIpIDogZHJhZ09yZGVyXHJcbiAgICAgICAgICAgIGxldCBmb3VuZFxyXG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHNvcnRhYmxlLl9nZXRDaGlsZHJlbih0cnVlKVxyXG4gICAgICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5yZXZlcnNlT3JkZXIpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSBjaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZCA9IGNoaWxkcmVuW2ldXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkRHJhZ09yZGVyID0gY2hpbGQuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkRHJhZ09yZGVyID0gc29ydGFibGUub3B0aW9ucy5vcmRlcklzTnVtYmVyID8gcGFyc2VGbG9hdChjaGlsZERyYWdPcmRlcikgOiBjaGlsZERyYWdPcmRlclxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnT3JkZXIgPiBjaGlsZERyYWdPcmRlcilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGRyYWdnaW5nLCBjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgY2hpbGRyZW4pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkRHJhZ09yZGVyID0gY2hpbGQuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkRHJhZ09yZGVyID0gc29ydGFibGUub3B0aW9ucy5vcmRlcklzTnVtYmVyID8gcGFyc2VGbG9hdChjaGlsZERyYWdPcmRlcikgOiBjaGlsZERyYWdPcmRlclxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnT3JkZXIgPCBjaGlsZERyYWdPcmRlcilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGRyYWdnaW5nLCBjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghZm91bmQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZHJhZ2dpbmcpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudCAhPT0gZHJhZ2dpbmcuX19zb3J0YWJsZS5vcmlnaW5hbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQuZW1pdCgnYWRkLXJlbW92ZS1wZW5kaW5nJywgZHJhZ2dpbmcsIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQuZW1pdCgncmVtb3ZlLXBlbmRpbmcnLCBkcmFnZ2luZywgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ2FkZC1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5pc0NvcHkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ2NvcHktcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgPSBzb3J0YWJsZVxyXG4gICAgICAgICAgICB0aGlzLl9tYXhpbXVtUGVuZGluZyhkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ3VwZGF0ZS1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNlYXJjaCBmb3Igd2hlcmUgdG8gcGxhY2UgdXNpbmcgcGVyY2VudGFnZVxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSAwID0gbm90IGZvdW5kOyAxID0gbm90aGluZyB0byBkbzsgMiA9IG1vdmVkXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGxhY2VCeVBlcmNlbnRhZ2Uoc29ydGFibGUsIGRyYWdnaW5nKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGN1cnNvciA9IGRyYWdnaW5nLl9fc29ydGFibGUuZHJhZ2dpbmdcclxuICAgICAgICBjb25zdCB4YTEgPSBjdXJzb3Iub2Zmc2V0TGVmdFxyXG4gICAgICAgIGNvbnN0IHlhMSA9IGN1cnNvci5vZmZzZXRUb3BcclxuICAgICAgICBjb25zdCB4YTIgPSBjdXJzb3Iub2Zmc2V0TGVmdCArIGN1cnNvci5vZmZzZXRXaWR0aFxyXG4gICAgICAgIGNvbnN0IHlhMiA9IGN1cnNvci5vZmZzZXRUb3AgKyBjdXJzb3Iub2Zmc2V0SGVpZ2h0XHJcbiAgICAgICAgbGV0IGxhcmdlc3QgPSAwLCBjbG9zZXN0LCBpc0JlZm9yZSwgaW5kaWNhdG9yXHJcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHNvcnRhYmxlLmVsZW1lbnRcclxuICAgICAgICBjb25zdCBlbGVtZW50cyA9IHNvcnRhYmxlLl9nZXRDaGlsZHJlbih0cnVlKVxyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGVsZW1lbnRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGNoaWxkID09PSBkcmFnZ2luZylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW5kaWNhdG9yID0gdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHBvcyA9IHV0aWxzLnRvR2xvYmFsKGNoaWxkKVxyXG4gICAgICAgICAgICBjb25zdCB4YjEgPSBwb3MueFxyXG4gICAgICAgICAgICBjb25zdCB5YjEgPSBwb3MueVxyXG4gICAgICAgICAgICBjb25zdCB4YjIgPSBwb3MueCArIGNoaWxkLm9mZnNldFdpZHRoXHJcbiAgICAgICAgICAgIGNvbnN0IHliMiA9IHBvcy55ICsgY2hpbGQub2Zmc2V0SGVpZ2h0XHJcbiAgICAgICAgICAgIGNvbnN0IHBlcmNlbnRhZ2UgPSB1dGlscy5wZXJjZW50YWdlKHhhMSwgeWExLCB4YTIsIHlhMiwgeGIxLCB5YjEsIHhiMiwgeWIyKVxyXG4gICAgICAgICAgICBpZiAocGVyY2VudGFnZSA+IGxhcmdlc3QpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxhcmdlc3QgPSBwZXJjZW50YWdlXHJcbiAgICAgICAgICAgICAgICBjbG9zZXN0ID0gY2hpbGRcclxuICAgICAgICAgICAgICAgIGlzQmVmb3JlID0gaW5kaWNhdG9yXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNsb3Nlc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoY2xvc2VzdCA9PT0gZHJhZ2dpbmcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAxXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGlzQmVmb3JlICYmIGNsb3Nlc3QubmV4dFNpYmxpbmcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKGRyYWdnaW5nLCBjbG9zZXN0Lm5leHRTaWJsaW5nKVxyXG4gICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnb3JkZXItcGVuZGluZycsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5pbnNlcnRCZWZvcmUoZHJhZ2dpbmcsIGNsb3Nlc3QpXHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdvcmRlci1wZW5kaW5nJywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIDJcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIDBcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzZWFyY2ggZm9yIHdoZXJlIHRvIHBsYWNlIHVzaW5nIGRpc3RhbmNlXHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmdcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gZmFsc2U9bm90aGluZyB0byBkb1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BsYWNlQnlEaXN0YW5jZShzb3J0YWJsZSwgZHJhZ2dpbmcsIHgsIHkpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHV0aWxzLmluc2lkZSh4LCB5LCBkcmFnZ2luZykpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgaW5kZXggPSAtMVxyXG4gICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgPT09IHNvcnRhYmxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaW5kZXggPSBzb3J0YWJsZS5fZ2V0SW5kZXgoZHJhZ2dpbmcpXHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZHJhZ2dpbmcpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBkaXN0YW5jZSA9IEluZmluaXR5LCBjbG9zZXN0XHJcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHNvcnRhYmxlLmVsZW1lbnRcclxuICAgICAgICBjb25zdCBlbGVtZW50cyA9IHNvcnRhYmxlLl9nZXRDaGlsZHJlbih0cnVlKVxyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGVsZW1lbnRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHV0aWxzLmluc2lkZSh4LCB5LCBjaGlsZCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNsb3Nlc3QgPSBjaGlsZFxyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG1lYXN1cmUgPSB1dGlscy5kaXN0YW5jZVRvQ2xvc2VzdENvcm5lcih4LCB5LCBjaGlsZClcclxuICAgICAgICAgICAgICAgIGlmIChtZWFzdXJlIDwgZGlzdGFuY2UpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xvc2VzdCA9IGNoaWxkXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2UgPSBtZWFzdXJlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxlbWVudC5pbnNlcnRCZWZvcmUoZHJhZ2dpbmcsIGNsb3Nlc3QpXHJcbiAgICAgICAgaWYgKGluZGV4ID09PSBzb3J0YWJsZS5fZ2V0SW5kZXgoZHJhZ2dpbmcpKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbWF4aW11bVBlbmRpbmcoZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgIHNvcnRhYmxlLmVtaXQoJ29yZGVyLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwbGFjZSBpbmRpY2F0b3IgaW4gYW4gc29ydGFibGUgbGlzdFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BsYWNlSW5Tb3J0YWJsZUxpc3Qoc29ydGFibGUsIHgsIHksIGRyYWdnaW5nKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBzb3J0YWJsZS5lbGVtZW50XHJcbiAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgIGlmICghY2hpbGRyZW4ubGVuZ3RoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChkcmFnZ2luZylcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gY29uc3QgcGVyY2VudGFnZSA9IHRoaXMuX3BsYWNlQnlQZXJjZW50YWdlKHNvcnRhYmxlLCBkcmFnZ2luZylcclxuICAgICAgICAgICAgaWYgKHRoaXMuX3BsYWNlQnlEaXN0YW5jZShzb3J0YWJsZSwgZHJhZ2dpbmcsIHgsIHkpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50ICE9PSBzb3J0YWJsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ2FkZC1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5pc0NvcHkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ2NvcHktcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50ICE9PSBkcmFnZ2luZy5fX3NvcnRhYmxlLm9yaWdpbmFsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudC5lbWl0KCdhZGQtcmVtb3ZlLXBlbmRpbmcnLCBkcmFnZ2luZywgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudC5lbWl0KCdyZW1vdmUtcGVuZGluZycsIGRyYWdnaW5nLCBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50ID0gc29ydGFibGVcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fbWF4aW11bVBlbmRpbmcoZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgIHNvcnRhYmxlLmVtaXQoJ3VwZGF0ZS1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2V0IGljb24gaWYgYXZhaWxhYmxlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2NhbmNlbF0gZm9yY2UgY2FuY2VsIChmb3Igb3B0aW9ucy5jb3B5KVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3NldEljb24oZWxlbWVudCwgc29ydGFibGUsIGNhbmNlbClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBkcmFnZ2luZyA9IGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnZ2luZ1xyXG4gICAgICAgIGlmIChkcmFnZ2luZyAmJiBkcmFnZ2luZy5pY29uKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCFzb3J0YWJsZSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc29ydGFibGUgPSBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWxcclxuICAgICAgICAgICAgICAgIGlmIChjYW5jZWwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zcmMgPSBzb3J0YWJsZS5vcHRpb25zLmljb25zLmNhbmNlbFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnaW5nLmljb24uc3JjID0gc29ydGFibGUub3B0aW9ucy5vZmZMaXN0ID09PSAnZGVsZXRlJyA/IHNvcnRhYmxlLm9wdGlvbnMuaWNvbnMuZGVsZXRlIDogc29ydGFibGUub3B0aW9ucy5pY29ucy5jYW5jZWxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUuaXNDb3B5KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnaW5nLmljb24uc3JjID0gc29ydGFibGUub3B0aW9ucy5pY29ucy5jb3B5XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zcmMgPSBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgPT09IHNvcnRhYmxlID8gc29ydGFibGUub3B0aW9ucy5pY29ucy5yZW9yZGVyIDogc29ydGFibGUub3B0aW9ucy5pY29ucy5tb3ZlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhZGQgYSBtYXhpbXVtIGNvdW50ZXIgdG8gdGhlIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfbWF4aW11bUNvdW50ZXIoZWxlbWVudCwgc29ydGFibGUpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IGNvdW50ID0gLTFcclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5tYXhpbXVtKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBjaGlsZHJlbilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkICE9PSBlbGVtZW50ICYmIGNoaWxkLl9fc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY291bnQgPSBjaGlsZC5fX3NvcnRhYmxlLm1heGltdW0gPiBjb3VudCA/IGNoaWxkLl9fc29ydGFibGUubWF4aW11bSA6IGNvdW50XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLm1heGltdW0gPSBjb3VudCArIDFcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSBtYXhpbXVtXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfbWF4aW11bShlbGVtZW50LCBzb3J0YWJsZSlcclxuICAgIHtcclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5tYXhpbXVtKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoID4gc29ydGFibGUub3B0aW9ucy5tYXhpbXVtKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc29ydGFibGUucmVtb3ZlUGVuZGluZylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoc29ydGFibGUucmVtb3ZlUGVuZGluZy5sZW5ndGgpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZCA9IHNvcnRhYmxlLnJlbW92ZVBlbmRpbmcucG9wKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQuc3R5bGUuZGlzcGxheSA9IGNoaWxkLl9fc29ydGFibGUuZGlzcGxheSA9PT0gJ3Vuc2V0JyA/ICcnIDogY2hpbGQuX19zb3J0YWJsZS5kaXNwbGF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLl9fc29ydGFibGUuZGlzcGxheSA9IG51bGxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQucmVtb3ZlKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnbWF4aW11bS1yZW1vdmUnLCBjaGlsZCwgc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlLnJlbW92ZVBlbmRpbmcgPSBudWxsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fbWF4aW11bUNvdW50ZXIoZWxlbWVudCwgc29ydGFibGUpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2xlYXIgcGVuZGluZyBsaXN0XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2NsZWFyTWF4aW11bVBlbmRpbmcoc29ydGFibGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHNvcnRhYmxlLnJlbW92ZVBlbmRpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB3aGlsZSAoc29ydGFibGUucmVtb3ZlUGVuZGluZy5sZW5ndGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gc29ydGFibGUucmVtb3ZlUGVuZGluZy5wb3AoKVxyXG4gICAgICAgICAgICAgICAgY2hpbGQuc3R5bGUuZGlzcGxheSA9IGNoaWxkLl9fc29ydGFibGUuZGlzcGxheSA9PT0gJ3Vuc2V0JyA/ICcnIDogY2hpbGQuX19zb3J0YWJsZS5kaXNwbGF5XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5fX3NvcnRhYmxlLmRpc3BsYXkgPSBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc29ydGFibGUucmVtb3ZlUGVuZGluZyA9IG51bGxcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgcGVuZGluZyBtYXhpbXVtXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX21heGltdW1QZW5kaW5nKGVsZW1lbnQsIHNvcnRhYmxlKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLm1heGltdW0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHNvcnRhYmxlLl9nZXRDaGlsZHJlbigpXHJcbiAgICAgICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPiBzb3J0YWJsZS5vcHRpb25zLm1heGltdW0pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNhdmVQZW5kaW5nID0gc29ydGFibGUucmVtb3ZlUGVuZGluZyA/IHNvcnRhYmxlLnJlbW92ZVBlbmRpbmcuc2xpY2UoMCkgOiBbXVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fY2xlYXJNYXhpbXVtUGVuZGluZyhzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlLnJlbW92ZVBlbmRpbmcgPSBbXVxyXG4gICAgICAgICAgICAgICAgbGV0IHNvcnRcclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLm1heGltdW1GSUZPKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNvcnQgPSBjaGlsZHJlbi5zb3J0KChhLCBiKSA9PiB7IHJldHVybiBhID09PSBlbGVtZW50ID8gMSA6IGEuX19zb3J0YWJsZS5tYXhpbXVtIC0gYi5fX3NvcnRhYmxlLm1heGltdW0gfSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzb3J0ID0gY2hpbGRyZW4uc29ydCgoYSwgYikgPT4geyByZXR1cm4gYSA9PT0gZWxlbWVudCA/IDEgOiBiLl9fc29ydGFibGUubWF4aW11bSAtIGEuX19zb3J0YWJsZS5tYXhpbXVtIH0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aCAtIHNvcnRhYmxlLm9wdGlvbnMubWF4aW11bTsgaSsrKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhpZGUgPSBzb3J0W2ldXHJcbiAgICAgICAgICAgICAgICAgICAgaGlkZS5fX3NvcnRhYmxlLmRpc3BsYXkgPSBoaWRlLnN0eWxlLmRpc3BsYXkgfHwgJ3Vuc2V0J1xyXG4gICAgICAgICAgICAgICAgICAgIGhpZGUuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlLnJlbW92ZVBlbmRpbmcucHVzaChoaWRlKVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzYXZlUGVuZGluZy5pbmRleE9mKGhpZGUpID09PSAtMSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ21heGltdW0tcmVtb3ZlLXBlbmRpbmcnLCBoaWRlLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGFuZ2UgY3Vyc29yIGR1cmluZyBtb3VzZWRvd25cclxuICAgICAqIEBwYXJhbSB7TW91c2VFdmVudH0gZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX21vdXNlRG93bihlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY3Vyc29ySG92ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB1dGlscy5zdHlsZShlLmN1cnJlbnRUYXJnZXQsICdjdXJzb3InLCB0aGlzLm9wdGlvbnMuY3Vyc29yRG93bilcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjaGFuZ2UgY3Vyc29yIGR1cmluZyBtb3VzZXVwXHJcbiAgICAgKiBAcGFyYW0ge01vdXNlRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9tb3VzZVVwKGUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5lbWl0KCdjbGlja2VkJywgZS5jdXJyZW50VGFyZ2V0LCB0aGlzKVxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY3Vyc29ySG92ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB1dGlscy5zdHlsZShlLmN1cnJlbnRUYXJnZXQsICdjdXJzb3InLCB0aGlzLm9wdGlvbnMuY3Vyc29ySG92ZXIpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIHBpY2tlZCB1cCBiZWNhdXNlIGl0IHdhcyBtb3ZlZCBiZXlvbmQgdGhlIG9wdGlvbnMudGhyZXNob2xkXHJcbiAqIEBldmVudCBTb3J0YWJsZSNwaWNrdXBcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBzb3J0YWJsZSBpcyByZW9yZGVyZWRcclxuICogQGV2ZW50IFNvcnRhYmxlI29yZGVyXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgdGhhdCB3YXMgcmVvcmRlcmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIHBsYWNlZFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgYWRkZWQgdG8gdGhpcyBzb3J0YWJsZVxyXG4gKiBAZXZlbnQgU29ydGFibGUjYWRkXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgYWRkZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgYWRkZWRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIHJlbW92ZWQgZnJvbSB0aGlzIHNvcnRhYmxlXHJcbiAqIEBldmVudCBTb3J0YWJsZSNyZW1vdmVcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCByZW1vdmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIHJlbW92ZWRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIHJlbW92ZWQgZnJvbSBhbGwgc29ydGFibGVzXHJcbiAqIEBldmVudCBTb3J0YWJsZSNkZWxldGVcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCByZW1vdmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIGRyYWdnZWQgZnJvbVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgY29weSBvZiBhbiBlbGVtZW50IGlzIGRyb3BwZWRcclxuICogQGV2ZW50IFNvcnRhYmxlI2NvcHlcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCByZW1vdmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIGRyYWdnZWQgZnJvbVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIHRoZSBzb3J0YWJsZSBpcyB1cGRhdGVkIHdpdGggYW4gYWRkLCByZW1vdmUsIG9yIG9yZGVyIGNoYW5nZVxyXG4gKiBAZXZlbnQgU29ydGFibGUjdXBkYXRlXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgY2hhbmdlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aXRoIGVsZW1lbnRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIHJlbW92ZWQgYmVjYXVzZSBtYXhpbXVtIHdhcyByZWFjaGVkIGZvciB0aGUgc29ydGFibGVcclxuICogQGV2ZW50IFNvcnRhYmxlI21heGltdW0tcmVtb3ZlXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgcmVtb3ZlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyBkcmFnZ2VkIGZyb21cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBvcmRlciB3YXMgY2hhbmdlZCBidXQgZWxlbWVudCB3YXMgbm90IGRyb3BwZWQgeWV0XHJcbiAqIEBldmVudCBTb3J0YWJsZSNvcmRlci1wZW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgYmVpbmcgZHJhZ2dlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBjdXJyZW50IHNvcnRhYmxlIHdpdGggZWxlbWVudCBwbGFjZWhvbGRlclxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGVsZW1lbnQgaXMgYWRkZWQgYnV0IG5vdCBkcm9wcGVkIHlldFxyXG4gKiBAZXZlbnQgU29ydGFibGUjYWRkLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gZWxlbWVudCBpcyByZW1vdmVkIGJ1dCBub3QgZHJvcHBlZCB5ZXRcclxuICogQGV2ZW50IFNvcnRhYmxlI3JlbW92ZS1wZW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgYmVpbmcgZHJhZ2dlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBjdXJyZW50IHNvcnRhYmxlIHdpdGggZWxlbWVudCBwbGFjZWhvbGRlclxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGVsZW1lbnQgaXMgcmVtb3ZlZCBhZnRlciBiZWluZyB0ZW1wb3JhcmlseSBhZGRlZFxyXG4gKiBAZXZlbnQgU29ydGFibGUjYWRkLXJlbW92ZS1wZW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgYmVpbmcgZHJhZ2dlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBjdXJyZW50IHNvcnRhYmxlIHdpdGggZWxlbWVudCBwbGFjZWhvbGRlclxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgYWJvdXQgdG8gYmUgcmVtb3ZlZCBmcm9tIGFsbCBzb3J0YWJsZXNcclxuICogQGV2ZW50IFNvcnRhYmxlI2RlbGV0ZS1wZW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgcmVtb3ZlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyBkcmFnZ2VkIGZyb21cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIGFkZGVkLCByZW1vdmVkLCBvciByZW9yZGVyIGJ1dCBlbGVtZW50IGhhcyBub3QgZHJvcHBlZCB5ZXRcclxuICogQGV2ZW50IFNvcnRhYmxlI3VwZGF0ZS1wZW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgYmVpbmcgZHJhZ2dlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBjdXJyZW50IHNvcnRhYmxlIHdpdGggZWxlbWVudCBwbGFjZWhvbGRlclxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgY29weSBvZiBhbiBlbGVtZW50IGlzIGFib3V0IHRvIGRyb3BcclxuICogQGV2ZW50IFNvcnRhYmxlI2NvcHktcGVuZGluZ1xyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHJlbW92ZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgZHJhZ2dlZCBmcm9tXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyBhYm91dCB0byBiZSByZW1vdmVkIGJlY2F1c2UgbWF4aW11bSB3YXMgcmVhY2hlZCBmb3IgdGhlIHNvcnRhYmxlXHJcbiAqIEBldmVudCBTb3J0YWJsZSNtYXhpbXVtLXJlbW92ZS1wZW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgcmVtb3ZlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyBkcmFnZ2VkIGZyb21cclxuICovXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNvcnRhYmxlIl19