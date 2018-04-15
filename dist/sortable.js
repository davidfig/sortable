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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3J0YWJsZS5qcyJdLCJuYW1lcyI6WyJFdmVudHMiLCJyZXF1aXJlIiwiZGVmYXVsdHMiLCJ1dGlscyIsIlNvcnRhYmxlIiwiZWxlbWVudCIsIm9wdGlvbnMiLCJfYWRkVG9HbG9iYWxUcmFja2VyIiwiZWxlbWVudHMiLCJfZ2V0Q2hpbGRyZW4iLCJldmVudHMiLCJkcmFnU3RhcnQiLCJlIiwiX2RyYWdTdGFydCIsImRyYWdFbmQiLCJfZHJhZ0VuZCIsImRyYWdPdmVyIiwiX2RyYWdPdmVyIiwiZHJvcCIsIl9kcm9wIiwiZHJhZ0xlYXZlIiwiX2RyYWdMZWF2ZSIsIm1vdXNlT3ZlciIsIl9tb3VzZUVudGVyIiwibW91c2VEb3duIiwiX21vdXNlRG93biIsIm1vdXNlVXAiLCJfbW91c2VVcCIsImNoaWxkIiwiZHJhZ0NsYXNzIiwiY29udGFpbnNDbGFzc05hbWUiLCJhdHRhY2hFbGVtZW50IiwiYWRkRXZlbnRMaXN0ZW5lciIsImN1cnNvckhvdmVyIiwic3R5bGUiLCJjdXJzb3JEb3duIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsInJlbW92ZUVsZW1lbnQiLCJpbmRleCIsInNvcnQiLCJjaGlsZHJlbiIsImxlbmd0aCIsImFwcGVuZENoaWxkIiwiaW5zZXJ0QmVmb3JlIiwiaWQiLCJvcmRlcklkIiwiZHJhZ09yZGVyIiwiZ2V0QXR0cmlidXRlIiwib3JkZXJJZElzTnVtYmVyIiwicGFyc2VGbG9hdCIsImZvdW5kIiwicmV2ZXJzZU9yZGVyIiwiaSIsImNoaWxkRHJhZ09yZGVyIiwib3JkZXJJc051bWJlciIsInBhcmVudE5vZGUiLCJfX3NvcnRhYmxlIiwib3JpZ2luYWwiLCJzb3J0YWJsZSIsIl9tYXhpbXVtQ291bnRlciIsIm5hbWUiLCJ0cmFja2VyIiwiY291bnRlciIsImNvcHkiLCJzZXRBdHRyaWJ1dGUiLCJkcmFnSW1hZ2UiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJib2R5IiwiX2JvZHlEcmFnT3ZlciIsIl9ib2R5RHJvcCIsImxpc3QiLCJwdXNoIiwiZGF0YVRyYW5zZmVyIiwidHlwZXMiLCJnZXRFbGVtZW50QnlJZCIsIl9maW5kQ2xvc2VzdCIsImxhc3QiLCJNYXRoIiwiYWJzIiwieCIsInBhZ2VYIiwidGhyZXNob2xkIiwieSIsInBhZ2VZIiwiX3VwZGF0ZURyYWdnaW5nIiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJfcGxhY2VJbkxpc3QiLCJkcm9wRWZmZWN0IiwiX25vRHJvcCIsImNhbmNlbCIsIl9zZXRJY29uIiwib2ZmTGlzdCIsImRpc3BsYXkiLCJlbWl0IiwiX3JlcGxhY2VJbkxpc3QiLCJjdXJyZW50IiwiX2NsZWFyTWF4aW11bVBlbmRpbmciLCJfcmVtb3ZlRHJhZ2dpbmciLCJyZW1vdmUiLCJjdXJyZW50VGFyZ2V0IiwiZHJhZ2dpbmciLCJpY29uIiwiY2xvbmVOb2RlIiwiZHJhZ1N0eWxlIiwicG9zIiwidG9HbG9iYWwiLCJsZWZ0IiwidG9wIiwib2Zmc2V0IiwidXNlSWNvbnMiLCJpbWFnZSIsIkltYWdlIiwic3JjIiwiaWNvbnMiLCJyZW9yZGVyIiwicG9zaXRpb24iLCJ0cmFuc2Zvcm0iLCJvZmZzZXRMZWZ0Iiwib2Zmc2V0V2lkdGgiLCJvZmZzZXRUb3AiLCJvZmZzZXRIZWlnaHQiLCJ0YXJnZXQiLCJpc0NvcHkiLCJjbGVhckRhdGEiLCJzZXREYXRhIiwic2V0RHJhZ0ltYWdlIiwiX2dldEluZGV4IiwiX21heGltdW0iLCJtaW4iLCJJbmZpbml0eSIsInJlbGF0ZWQiLCJpbnNpZGUiLCJjYWxjdWxhdGUiLCJkaXN0YW5jZVRvQ2xvc2VzdENvcm5lciIsIl9wbGFjZUluU29ydGFibGVMaXN0IiwiX3BsYWNlSW5PcmRlcmVkTGlzdCIsImJhc2UiLCJzZWFyY2giLCJyZXN1bHRzIiwiaW5kZXhPZiIsImNsYXNzTmFtZSIsIl90cmF2ZXJzZUNoaWxkcmVuIiwib3JkZXIiLCJkZWVwU2VhcmNoIiwib3JkZXJDbGFzcyIsIl9tYXhpbXVtUGVuZGluZyIsImN1cnNvciIsInhhMSIsInlhMSIsInhhMiIsInlhMiIsImxhcmdlc3QiLCJjbG9zZXN0IiwiaXNCZWZvcmUiLCJpbmRpY2F0b3IiLCJ4YjEiLCJ5YjEiLCJ4YjIiLCJ5YjIiLCJwZXJjZW50YWdlIiwibmV4dFNpYmxpbmciLCJkaXN0YW5jZSIsIm1lYXN1cmUiLCJfcGxhY2VCeURpc3RhbmNlIiwiZGVsZXRlIiwibW92ZSIsImNvdW50IiwibWF4aW11bSIsInJlbW92ZVBlbmRpbmciLCJwb3AiLCJzYXZlUGVuZGluZyIsInNsaWNlIiwibWF4aW11bUZJRk8iLCJhIiwiYiIsImhpZGUiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBTUEsU0FBU0MsUUFBUSxlQUFSLENBQWY7O0FBRUEsSUFBTUMsV0FBV0QsUUFBUSxZQUFSLENBQWpCO0FBQ0EsSUFBTUUsUUFBUUYsUUFBUSxTQUFSLENBQWQ7O0lBRU1HLFE7OztBQUVGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTRDQSxzQkFBWUMsT0FBWixFQUFxQkMsT0FBckIsRUFDQTtBQUFBOztBQUFBOztBQUVJLGNBQUtBLE9BQUwsR0FBZUgsTUFBTUcsT0FBTixDQUFjQSxPQUFkLEVBQXVCSixRQUF2QixDQUFmO0FBQ0EsY0FBS0csT0FBTCxHQUFlQSxPQUFmO0FBQ0EsY0FBS0UsbUJBQUw7QUFDQSxZQUFNQyxXQUFXLE1BQUtDLFlBQUwsRUFBakI7QUFDQSxjQUFLQyxNQUFMLEdBQWM7QUFDVkMsdUJBQVcsbUJBQUNDLENBQUQ7QUFBQSx1QkFBTyxNQUFLQyxVQUFMLENBQWdCRCxDQUFoQixDQUFQO0FBQUEsYUFERDtBQUVWRSxxQkFBUyxpQkFBQ0YsQ0FBRDtBQUFBLHVCQUFPLE1BQUtHLFFBQUwsQ0FBY0gsQ0FBZCxDQUFQO0FBQUEsYUFGQztBQUdWSSxzQkFBVSxrQkFBQ0osQ0FBRDtBQUFBLHVCQUFPLE1BQUtLLFNBQUwsQ0FBZUwsQ0FBZixDQUFQO0FBQUEsYUFIQTtBQUlWTSxrQkFBTSxjQUFDTixD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QXFCbkYsRUFBRXlGLGFBQXZCLEVBQXNDLElBQXRDO0FBQ0EsZ0JBQUksS0FBSy9GLE9BQUwsQ0FBYTJCLFdBQWpCLEVBQ0E7QUFDSTlCLHNCQUFNK0IsS0FBTixDQUFZdEIsRUFBRXlGLGFBQWQsRUFBNkIsUUFBN0IsRUFBdUMsS0FBSy9GLE9BQUwsQ0FBYTJCLFdBQXBEO0FBQ0g7QUFDSjs7Ozs7QUF4aUNEOzs7OzsrQkFLY3pCLFEsRUFBVUYsTyxFQUN4QjtBQUNJLGdCQUFNc0ksVUFBVSxFQUFoQjtBQURKO0FBQUE7QUFBQTs7QUFBQTtBQUVJLHVDQUFvQnBJLFFBQXBCLHdJQUNBO0FBQUEsd0JBRFNILE9BQ1Q7O0FBQ0l1SSw0QkFBUXBFLElBQVIsQ0FBYSxJQUFJcEUsUUFBSixDQUFhQyxPQUFiLEVBQXNCQyxPQUF0QixDQUFiO0FBQ0g7QUFMTDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQU1JLG1CQUFPc0ksT0FBUDtBQUNIOzs7NEJBakJEO0FBQ0ksbUJBQU8xSSxRQUFQO0FBQ0g7Ozs7RUE3R2tCRixNOztBQTBwQ3ZCOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0FrTCxPQUFPQyxPQUFQLEdBQWlCL0ssUUFBakIiLCJmaWxlIjoic29ydGFibGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBFdmVudHMgPSByZXF1aXJlKCdldmVudGVtaXR0ZXIzJylcclxuXHJcbmNvbnN0IGRlZmF1bHRzID0gcmVxdWlyZSgnLi9kZWZhdWx0cycpXHJcbmNvbnN0IHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXHJcblxyXG5jbGFzcyBTb3J0YWJsZSBleHRlbmRzIEV2ZW50c1xyXG57XHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBzb3J0YWJsZSBsaXN0XHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMubmFtZT1zb3J0YWJsZV0gZHJhZ2dpbmcgaXMgYWxsb3dlZCBiZXR3ZWVuIFNvcnRhYmxlcyB3aXRoIHRoZSBzYW1lIG5hbWVcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5kcmFnQ2xhc3NdIGlmIHNldCB0aGVuIGRyYWcgb25seSBpdGVtcyB3aXRoIHRoaXMgY2xhc3NOYW1lIHVuZGVyIGVsZW1lbnQ7IG90aGVyd2lzZSBkcmFnIGFsbCBjaGlsZHJlblxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLm9yZGVyQ2xhc3NdIHVzZSB0aGlzIGNsYXNzIHRvIGluY2x1ZGUgZWxlbWVudHMgaW4gb3JkZXJpbmcgYnV0IG5vdCBkcmFnZ2luZzsgb3RoZXJ3aXNlIGFsbCBjaGlsZHJlbiBlbGVtZW50cyBhcmUgaW5jbHVkZWQgaW4gd2hlbiBzb3J0aW5nIGFuZCBvcmRlcmluZ1xyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5kZWVwU2VhcmNoXSBpZiBkcmFnQ2xhc3MgYW5kIGRlZXBTZWFyY2ggdGhlbiBzZWFyY2ggYWxsIGRlc2NlbmRlbnRzIG9mIGVsZW1lbnQgZm9yIGRyYWdDbGFzc1xyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5zb3J0PXRydWVdIGFsbG93IHNvcnRpbmcgd2l0aGluIGxpc3RcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuZHJvcD10cnVlXSBhbGxvdyBkcm9wIGZyb20gcmVsYXRlZCBzb3J0YWJsZXMgKGRvZXNuJ3QgaW1wYWN0IHJlb3JkZXJpbmcgdGhpcyBzb3J0YWJsZSdzIGNoaWxkcmVuIHVudGlsIHRoZSBjaGlsZHJlbiBhcmUgbW92ZWQgdG8gYSBkaWZmZXJlbiBzb3J0YWJsZSlcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuY29weT1mYWxzZV0gY3JlYXRlIGNvcHkgd2hlbiBkcmFnZ2luZyBhbiBpdGVtICh0aGlzIGRpc2FibGVzIHNvcnQ9dHJ1ZSBmb3IgdGhpcyBzb3J0YWJsZSlcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5vcmRlcklkPWRhdGEtb3JkZXJdIGZvciBvcmRlcmVkIGxpc3RzLCB1c2UgdGhpcyBkYXRhIGlkIHRvIGZpZ3VyZSBvdXQgc29ydCBvcmRlclxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5vcmRlcklkSXNOdW1iZXI9dHJ1ZV0gdXNlIHBhcnNlSW50IG9uIG9wdGlvbnMuc29ydElkIHRvIHByb3Blcmx5IHNvcnQgbnVtYmVyc1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnJldmVyc2VPcmRlcl0gcmV2ZXJzZSBzb3J0IHRoZSBvcmRlcklkXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMub2ZmTGlzdD1jbG9zZXN0XSBob3cgdG8gaGFuZGxlIHdoZW4gYW4gZWxlbWVudCBpcyBkcm9wcGVkIG91dHNpZGUgYSBzb3J0YWJsZTogY2xvc2VzdD1kcm9wIGluIGNsb3Nlc3Qgc29ydGFibGU7IGNhbmNlbD1yZXR1cm4gdG8gc3RhcnRpbmcgc29ydGFibGU7IGRlbGV0ZT1yZW1vdmUgZnJvbSBhbGwgc29ydGFibGVzXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWF4aW11bV0gbWF4aW11bSBudW1iZXIgb2YgZWxlbWVudHMgYWxsb3dlZCBpbiBhIHNvcnRhYmxlIGxpc3RcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubWF4aW11bUZJRk9dIGRpcmVjdGlvbiBvZiBzZWFyY2ggdG8gY2hvb3NlIHdoaWNoIGl0ZW0gdG8gcmVtb3ZlIHdoZW4gbWF4aW11bSBpcyByZWFjaGVkXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuY3Vyc29ySG92ZXI9Z3JhYiAtd2Via2l0LWdyYWIgcG9pbnRlcl0gdXNlIHRoaXMgY3Vyc29yIGxpc3QgdG8gc2V0IGN1cnNvciB3aGVuIGhvdmVyaW5nIG92ZXIgYSBzb3J0YWJsZSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuY3Vyc29yRG93bj1ncmFiYmluZyAtd2Via2l0LWdyYWJiaW5nIHBvaW50ZXJdIHVzZSB0aGlzIGN1cnNvciBsaXN0IHRvIHNldCBjdXJzb3Igd2hlbiBtb3VzZWRvd24vdG91Y2hkb3duIG92ZXIgYSBzb3J0YWJsZSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnVzZUljb25zPXRydWVdIHNob3cgaWNvbnMgd2hlbiBkcmFnZ2luZ1xyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zLmljb25zXSBkZWZhdWx0IHNldCBvZiBpY29uc1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmljb25zLnJlb3JkZXJdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuaWNvbnMubW92ZV1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5pY29ucy5jb3B5XVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmljb25zLmRlbGV0ZV1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5jdXN0b21JY29uXSBzb3VyY2Ugb2YgY3VzdG9tIGltYWdlIHdoZW4gb3ZlciB0aGlzIHNvcnRhYmxlXHJcbiAgICAgKiBAZmlyZXMgcGlja3VwXHJcbiAgICAgKiBAZmlyZXMgb3JkZXJcclxuICAgICAqIEBmaXJlcyBhZGRcclxuICAgICAqIEBmaXJlcyByZW1vdmVcclxuICAgICAqIEBmaXJlcyB1cGRhdGVcclxuICAgICAqIEBmaXJlcyBkZWxldGVcclxuICAgICAqIEBmaXJlcyBjb3B5XHJcbiAgICAgKiBAZmlyZXMgbWF4aW11bS1yZW1vdmVcclxuICAgICAqIEBmaXJlcyBvcmRlci1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgYWRkLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyByZW1vdmUtcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIGFkZC1yZW1vdmUtcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIHVwZGF0ZS1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgZGVsZXRlLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyBjb3B5LXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyBtYXhpbXVtLXJlbW92ZS1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgY2xpY2tlZFxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyKClcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSB1dGlscy5vcHRpb25zKG9wdGlvbnMsIGRlZmF1bHRzKVxyXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnRcclxuICAgICAgICB0aGlzLl9hZGRUb0dsb2JhbFRyYWNrZXIoKVxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnRzID0gdGhpcy5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgIHRoaXMuZXZlbnRzID0ge1xyXG4gICAgICAgICAgICBkcmFnU3RhcnQ6IChlKSA9PiB0aGlzLl9kcmFnU3RhcnQoZSksXHJcbiAgICAgICAgICAgIGRyYWdFbmQ6IChlKSA9PiB0aGlzLl9kcmFnRW5kKGUpLFxyXG4gICAgICAgICAgICBkcmFnT3ZlcjogKGUpID0+IHRoaXMuX2RyYWdPdmVyKGUpLFxyXG4gICAgICAgICAgICBkcm9wOiAoZSkgPT4gdGhpcy5fZHJvcChlKSxcclxuICAgICAgICAgICAgZHJhZ0xlYXZlOiAoZSkgPT4gdGhpcy5fZHJhZ0xlYXZlKGUpLFxyXG4gICAgICAgICAgICBtb3VzZU92ZXI6IChlKSA9PiB0aGlzLl9tb3VzZUVudGVyKGUpLFxyXG4gICAgICAgICAgICBtb3VzZURvd246IChlKSA9PiB0aGlzLl9tb3VzZURvd24oZSksXHJcbiAgICAgICAgICAgIG1vdXNlVXA6IChlKSA9PiB0aGlzLl9tb3VzZVVwKGUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGVsZW1lbnRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzIHx8IHV0aWxzLmNvbnRhaW5zQ2xhc3NOYW1lKGNoaWxkLCB0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hdHRhY2hFbGVtZW50KGNoaWxkKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCB0aGlzLmV2ZW50cy5kcmFnT3ZlcilcclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLmV2ZW50cy5kcm9wKVxyXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ2xlYXZlJywgdGhpcy5ldmVudHMuZHJhZ0xlYXZlKVxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY3Vyc29ySG92ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiB0aGlzLl9nZXRDaGlsZHJlbigpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB1dGlscy5zdHlsZShjaGlsZCwgJ2N1cnNvcicsIHRoaXMub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY3Vyc29yRG93bilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLmV2ZW50cy5tb3VzZURvd24pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5ldmVudHMubW91c2VVcClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlbW92ZXMgYWxsIGV2ZW50IGhhbmRsZXJzIGZyb20gdGhpcy5lbGVtZW50IGFuZCBjaGlsZHJlblxyXG4gICAgICovXHJcbiAgICBkZXN0cm95KClcclxuICAgIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCB0aGlzLmV2ZW50cy5kcmFnT3ZlcilcclxuICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJvcCcsIHRoaXMuZXZlbnRzLmRyb3ApXHJcbiAgICAgICAgY29uc3QgZWxlbWVudHMgPSB0aGlzLl9nZXRDaGlsZHJlbigpXHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgZWxlbWVudHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUVsZW1lbnQoY2hpbGQpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHRvZG86IHJlbW92ZSBTb3J0YWJsZS50cmFja2VyIGFuZCByZWxhdGVkIGV2ZW50IGhhbmRsZXJzIGlmIG5vIG1vcmUgc29ydGFibGVzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB0aGUgZ2xvYmFsIGRlZmF1bHRzIGZvciBuZXcgU29ydGFibGUgb2JqZWN0c1xyXG4gICAgICogQHR5cGUge0RlZmF1bHRPcHRpb25zfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0IGRlZmF1bHRzKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gZGVmYXVsdHNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNyZWF0ZSBtdWx0aXBsZSBzb3J0YWJsZSBlbGVtZW50c1xyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudHNbXX0gZWxlbWVudHNcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIC0gc2VlIGNvbnN0cnVjdG9yIGZvciBvcHRpb25zXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBjcmVhdGUoZWxlbWVudHMsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdXHJcbiAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiBlbGVtZW50cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaChuZXcgU29ydGFibGUoZWxlbWVudCwgb3B0aW9ucykpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHRzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhZGQgYW4gZWxlbWVudCBhcyBhIGNoaWxkIG9mIHRoZSBzb3J0YWJsZSBlbGVtZW50OyBjYW4gYWxzbyBiZSB1c2VkIHRvIHN3YXAgYmV0d2VlbiBzb3J0YWJsZXNcclxuICAgICAqIE5PVEU6IHRoaXMgbWF5IG5vdCB3b3JrIHdpdGggZGVlcFNlYXJjaCBub24tb3JkZXJlZCBlbGVtZW50czsgdXNlIGF0dGFjaEVsZW1lbnQgaW5zdGVhZFxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4XHJcbiAgICAgKi9cclxuICAgIGFkZChlbGVtZW50LCBpbmRleClcclxuICAgIHtcclxuICAgICAgICB0aGlzLmF0dGFjaEVsZW1lbnQoZWxlbWVudClcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNvcnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGluZGV4ID09PSAndW5kZWZpbmVkJyB8fCBpbmRleCA+PSB0aGlzLmVsZW1lbnQuY2hpbGRyZW4ubGVuZ3RoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZWxlbWVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5pbnNlcnRCZWZvcmUoZWxlbWVudCwgdGhpcy5lbGVtZW50LmNoaWxkcmVuW2luZGV4ICsgMV0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSB0aGlzLm9wdGlvbnMub3JkZXJJZFxyXG4gICAgICAgICAgICBsZXQgZHJhZ09yZGVyID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgICAgIGRyYWdPcmRlciA9IHRoaXMub3B0aW9ucy5vcmRlcklkSXNOdW1iZXIgPyBwYXJzZUZsb2F0KGRyYWdPcmRlcikgOiBkcmFnT3JkZXJcclxuICAgICAgICAgICAgbGV0IGZvdW5kXHJcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5fZ2V0Q2hpbGRyZW4odHJ1ZSlcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yZXZlcnNlT3JkZXIpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSBjaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZCA9IGNoaWxkcmVuW2ldXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkRHJhZ09yZGVyID0gY2hpbGQuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkRHJhZ09yZGVyID0gdGhpcy5vcHRpb25zLm9yZGVySXNOdW1iZXIgPyBwYXJzZUZsb2F0KGNoaWxkRHJhZ09yZGVyKSA6IGNoaWxkRHJhZ09yZGVyXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdPcmRlciA+IGNoaWxkRHJhZ09yZGVyKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZWxlbWVudCwgY2hpbGQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGNoaWxkcmVuKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZERyYWdPcmRlciA9IGNoaWxkLmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZERyYWdPcmRlciA9IHRoaXMub3B0aW9ucy5vcmRlcklzTnVtYmVyID8gcGFyc2VGbG9hdChjaGlsZERyYWdPcmRlcikgOiBjaGlsZERyYWdPcmRlclxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnT3JkZXIgPCBjaGlsZERyYWdPcmRlcilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGVsZW1lbnQsIGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFmb3VuZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhdHRhY2hlcyBhbiBIVE1MIGVsZW1lbnQgdG8gdGhlIHNvcnRhYmxlOyBjYW4gYWxzbyBiZSB1c2VkIHRvIHN3YXAgYmV0d2VlbiBzb3J0YWJsZXNcclxuICAgICAqIE5PVEU6IHlvdSBuZWVkIHRvIG1hbnVhbGx5IGluc2VydCB0aGUgZWxlbWVudCBpbnRvIHRoaXMuZWxlbWVudCAodGhpcyBpcyB1c2VmdWwgd2hlbiB5b3UgaGF2ZSBhIGRlZXAgc3RydWN0dXJlKVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICovXHJcbiAgICBhdHRhY2hFbGVtZW50KGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9IHRoaXNcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlID0ge1xyXG4gICAgICAgICAgICAgICAgc29ydGFibGU6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBvcmlnaW5hbDogdGhpc1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBhZGQgYSBjb3VudGVyIGZvciBtYXhpbXVtXHJcbiAgICAgICAgICAgIHRoaXMuX21heGltdW1Db3VudGVyKGVsZW1lbnQsIHRoaXMpXHJcblxyXG4gICAgICAgICAgICAvLyBlbnN1cmUgZXZlcnkgZWxlbWVudCBoYXMgYW4gaWRcclxuICAgICAgICAgICAgaWYgKCFlbGVtZW50LmlkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmlkID0gJ19fc29ydGFibGUtJyArIHRoaXMub3B0aW9ucy5uYW1lICsgJy0nICsgU29ydGFibGUudHJhY2tlclt0aGlzLm9wdGlvbnMubmFtZV0uY291bnRlclxyXG4gICAgICAgICAgICAgICAgU29ydGFibGUudHJhY2tlclt0aGlzLm9wdGlvbnMubmFtZV0uY291bnRlcisrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jb3B5KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuY29weSA9IDBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdzdGFydCcsIHRoaXMuZXZlbnRzLmRyYWdTdGFydClcclxuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdkcmFnZW5kJywgdGhpcy5ldmVudHMuZHJhZ0VuZClcclxuICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RyYWdnYWJsZScsIHRydWUpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVtb3ZlcyBhbGwgZXZlbnRzIGZyb20gYW4gSFRNTCBlbGVtZW50XHJcbiAgICAgKiBOT1RFOiBkb2VzIG5vdCByZW1vdmUgdGhlIGVsZW1lbnQgZnJvbSBpdHMgcGFyZW50XHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKi9cclxuICAgIHJlbW92ZUVsZW1lbnQoZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RyYWdzdGFydCcsIHRoaXMuZXZlbnRzLmRyYWdTdGFydClcclxuICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RyYWdlbmQnLCB0aGlzLmV2ZW50cy5kcmFnRW5kKVxyXG4gICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdkcmFnZ2FibGUnLCBmYWxzZSlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFkZCBzb3J0YWJsZSB0byBnbG9iYWwgbGlzdCB0aGF0IHRyYWNrcyBhbGwgc29ydGFibGVzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfYWRkVG9HbG9iYWxUcmFja2VyKClcclxuICAgIHtcclxuICAgICAgICBpZiAoIVNvcnRhYmxlLnRyYWNrZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBTb3J0YWJsZS5kcmFnSW1hZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICAgICAgICBTb3J0YWJsZS5kcmFnSW1hZ2UuaWQgPSAnc29ydGFibGUtZHJhZ0ltYWdlJ1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKFNvcnRhYmxlLmRyYWdJbWFnZSlcclxuICAgICAgICAgICAgU29ydGFibGUudHJhY2tlciA9IHt9XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCAoZSkgPT4gdGhpcy5fYm9keURyYWdPdmVyKGUpKVxyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCAoZSkgPT4gdGhpcy5fYm9keURyb3AoZSkpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChTb3J0YWJsZS50cmFja2VyW3RoaXMub3B0aW9ucy5uYW1lXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFNvcnRhYmxlLnRyYWNrZXJbdGhpcy5vcHRpb25zLm5hbWVdLmxpc3QucHVzaCh0aGlzKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBTb3J0YWJsZS50cmFja2VyW3RoaXMub3B0aW9ucy5uYW1lXSA9IHsgbGlzdDogW3RoaXNdLCBjb3VudGVyOiAwIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBkZWZhdWx0IGRyYWcgb3ZlciBmb3IgdGhlIGJvZHlcclxuICAgICAqIEBwYXJhbSB7RHJhZ0V2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfYm9keURyYWdPdmVyKGUpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzBdXHJcbiAgICAgICAgaWYgKG5hbWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzFdXHJcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZClcclxuICAgICAgICAgICAgY29uc3Qgc29ydGFibGUgPSB0aGlzLl9maW5kQ2xvc2VzdChlLCBTb3J0YWJsZS50cmFja2VyW25hbWVdLmxpc3QsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNvcnRhYmxlLmxhc3QgJiYgTWF0aC5hYnMoc29ydGFibGUubGFzdC54IC0gZS5wYWdlWCkgPCBzb3J0YWJsZS5vcHRpb25zLnRocmVzaG9sZCAmJiBNYXRoLmFicyhzb3J0YWJsZS5sYXN0LnkgLSBlLnBhZ2VZKSA8IHNvcnRhYmxlLm9wdGlvbnMudGhyZXNob2xkKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc29ydGFibGUuX3VwZGF0ZURyYWdnaW5nKGUsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZS5sYXN0ID0geyB4OiBlLnBhZ2VYLCB5OiBlLnBhZ2VZIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9wbGFjZUluTGlzdChzb3J0YWJsZSwgZS5wYWdlWCwgZS5wYWdlWSwgZWxlbWVudClcclxuICAgICAgICAgICAgICAgICAgICBlLmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ21vdmUnXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlRHJhZ2dpbmcoZSwgZWxlbWVudClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ub0Ryb3AoZSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIG5vIGRyb3BcclxuICAgICAqIEBwYXJhbSB7VUlFdmVudH0gZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2FuY2VsXSBmb3JjZSBjYW5jZWwgKGZvciBvcHRpb25zLmNvcHkpXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfbm9Ecm9wKGUsIGNhbmNlbClcclxuICAgIHtcclxuICAgICAgICBlLmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ21vdmUnXHJcbiAgICAgICAgY29uc3QgaWQgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1sxXVxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZClcclxuICAgICAgICBpZiAoZWxlbWVudClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZURyYWdnaW5nKGUsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgIHRoaXMuX3NldEljb24oZWxlbWVudCwgbnVsbCwgY2FuY2VsKVxyXG4gICAgICAgICAgICBpZiAoIWNhbmNlbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbC5vcHRpb25zLm9mZkxpc3QgPT09ICdkZWxldGUnKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheSA9IGVsZW1lbnQuc3R5bGUuZGlzcGxheSB8fCAndW5zZXQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwuZW1pdCgnZGVsZXRlLXBlbmRpbmcnLCBlbGVtZW50LCBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoIWVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbC5vcHRpb25zLmNvcHkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVwbGFjZUluTGlzdChlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jbGVhck1heGltdW1QZW5kaW5nKGVsZW1lbnQuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmN1cnJlbnQuZW1pdCgnYWRkLXJlbW92ZS1wZW5kaW5nJywgZWxlbWVudCwgZWxlbWVudC5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuY3VycmVudC5lbWl0KCd1cGRhdGUtcGVuZGluZycsIGVsZW1lbnQsIGVsZW1lbnQuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmN1cnJlbnQgPSBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBkZWZhdWx0IGRyb3AgZm9yIHRoZSBib2R5XHJcbiAgICAgKiBAcGFyYW0ge0RyYWdFdmVudH0gZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2JvZHlEcm9wKGUpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzBdXHJcbiAgICAgICAgaWYgKG5hbWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzFdXHJcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZClcclxuICAgICAgICAgICAgY29uc3Qgc29ydGFibGUgPSB0aGlzLl9maW5kQ2xvc2VzdChlLCBTb3J0YWJsZS50cmFja2VyW25hbWVdLmxpc3QsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9yZW1vdmVEcmFnZ2luZyhlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlKClcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheVxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5ID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbC5lbWl0KCdkZWxldGUnLCBlbGVtZW50LCBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwpXHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZW5kIGRyYWdcclxuICAgICAqIEBwYXJhbSB7VUlFdmVudH0gZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2RyYWdFbmQoZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gZS5jdXJyZW50VGFyZ2V0XHJcbiAgICAgICAgY29uc3QgZHJhZ2dpbmcgPSBlbGVtZW50Ll9fc29ydGFibGUuZHJhZ2dpbmdcclxuICAgICAgICBpZiAoZHJhZ2dpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5yZW1vdmUoKVxyXG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcuaWNvbilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5yZW1vdmUoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnZ2luZyA9IG51bGxcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzdGFydCBkcmFnXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kcmFnU3RhcnQoZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBzb3J0YWJsZSA9IGUuY3VycmVudFRhcmdldC5fX3NvcnRhYmxlLm9yaWdpbmFsXHJcbiAgICAgICAgY29uc3QgZHJhZ2dpbmcgPSBlLmN1cnJlbnRUYXJnZXQuY2xvbmVOb2RlKHRydWUpXHJcbiAgICAgICAgZm9yIChsZXQgc3R5bGUgaW4gc29ydGFibGUub3B0aW9ucy5kcmFnU3R5bGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5zdHlsZVtzdHlsZV0gPSBzb3J0YWJsZS5vcHRpb25zLmRyYWdTdHlsZVtzdHlsZV1cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcG9zID0gdXRpbHMudG9HbG9iYWwoZS5jdXJyZW50VGFyZ2V0KVxyXG4gICAgICAgIGRyYWdnaW5nLnN0eWxlLmxlZnQgPSBwb3MueCArICdweCdcclxuICAgICAgICBkcmFnZ2luZy5zdHlsZS50b3AgPSBwb3MueSArICdweCdcclxuICAgICAgICBjb25zdCBvZmZzZXQgPSB7IHg6IHBvcy54IC0gZS5wYWdlWCwgeTogcG9zLnkgLSBlLnBhZ2VZIH1cclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRyYWdnaW5nKVxyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLnVzZUljb25zKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKVxyXG4gICAgICAgICAgICBpbWFnZS5zcmMgPSBzb3J0YWJsZS5vcHRpb25zLmljb25zLnJlb3JkZXJcclxuICAgICAgICAgICAgaW1hZ2Uuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoLTUwJSwgLTUwJSknXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLmxlZnQgPSBkcmFnZ2luZy5vZmZzZXRMZWZ0ICsgZHJhZ2dpbmcub2Zmc2V0V2lkdGggKyAncHgnXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLnRvcCA9IGRyYWdnaW5nLm9mZnNldFRvcCArIGRyYWdnaW5nLm9mZnNldEhlaWdodCArICdweCdcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpbWFnZSlcclxuICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbiA9IGltYWdlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLmN1cnNvckhvdmVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdXRpbHMuc3R5bGUoZS5jdXJyZW50VGFyZ2V0LCAnY3Vyc29yJywgc29ydGFibGUub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHRhcmdldCA9IGUuY3VycmVudFRhcmdldFxyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLmNvcHkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0YXJnZXQgPSBlLmN1cnJlbnRUYXJnZXQuY2xvbmVOb2RlKHRydWUpXHJcbiAgICAgICAgICAgIHRhcmdldC5pZCA9IGUuY3VycmVudFRhcmdldC5pZCArICctY29weS0nICsgZS5jdXJyZW50VGFyZ2V0Ll9fc29ydGFibGUuY29weVxyXG4gICAgICAgICAgICBlLmN1cnJlbnRUYXJnZXQuX19zb3J0YWJsZS5jb3B5KytcclxuICAgICAgICAgICAgc29ydGFibGUuYXR0YWNoRWxlbWVudCh0YXJnZXQpXHJcbiAgICAgICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLmlzQ29weSA9IHRydWVcclxuICAgICAgICAgICAgdGFyZ2V0Ll9fc29ydGFibGUub3JpZ2luYWwgPSB0aGlzXHJcbiAgICAgICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLmRpc3BsYXkgPSB0YXJnZXQuc3R5bGUuZGlzcGxheSB8fCAndW5zZXQnXHJcbiAgICAgICAgICAgIHRhcmdldC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGFyZ2V0KVxyXG4gICAgICAgIH1cclxuICAgICAgICBlLmRhdGFUcmFuc2Zlci5jbGVhckRhdGEoKVxyXG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLnNldERhdGEoc29ydGFibGUub3B0aW9ucy5uYW1lLCBzb3J0YWJsZS5vcHRpb25zLm5hbWUpXHJcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuc2V0RGF0YSh0YXJnZXQuaWQsIHRhcmdldC5pZClcclxuICAgICAgICBlLmRhdGFUcmFuc2Zlci5zZXREcmFnSW1hZ2UoU29ydGFibGUuZHJhZ0ltYWdlLCAwLCAwKVxyXG4gICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLmN1cnJlbnQgPSB0aGlzXHJcbiAgICAgICAgdGFyZ2V0Ll9fc29ydGFibGUuaW5kZXggPSBzb3J0YWJsZS5vcHRpb25zLmNvcHkgPyAtMSA6IHNvcnRhYmxlLl9nZXRJbmRleCh0YXJnZXQpXHJcbiAgICAgICAgdGFyZ2V0Ll9fc29ydGFibGUuZHJhZ2dpbmcgPSBkcmFnZ2luZ1xyXG4gICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLm9mZnNldCA9IG9mZnNldFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIGRyYWcgbGVhdmUgZXZlbnRzIGZvciBzb3J0YWJsZSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge0RyYWdFdmVudH0gZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2RyYWdMZWF2ZShlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHNvcnRhYmxlID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMF1cclxuICAgICAgICBpZiAoc29ydGFibGUgJiYgc29ydGFibGUgPT09IHRoaXMub3B0aW9ucy5uYW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fY2xlYXJNYXhpbXVtUGVuZGluZyhzb3J0YWJsZSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgZHJhZyBvdmVyIGV2ZW50cyBmb3Igc29ydGFibGUgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtEcmFnRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kcmFnT3ZlcihlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHNvcnRhYmxlID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMF1cclxuICAgICAgICBpZiAoc29ydGFibGUgJiYgc29ydGFibGUgPT09IHRoaXMub3B0aW9ucy5uYW1lKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSBlLmRhdGFUcmFuc2Zlci50eXBlc1sxXVxyXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmxhc3QgJiYgTWF0aC5hYnModGhpcy5sYXN0LnggLSBlLnBhZ2VYKSA8IHRoaXMub3B0aW9ucy50aHJlc2hvbGQgJiYgTWF0aC5hYnModGhpcy5sYXN0LnkgLSBlLnBhZ2VZKSA8IHRoaXMub3B0aW9ucy50aHJlc2hvbGQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZURyYWdnaW5nKGUsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMubGFzdCA9IHsgeDogZS5wYWdlWCwgeTogZS5wYWdlWSB9XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUuaXNDb3B5ICYmIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9PT0gdGhpcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbm9Ecm9wKGUsIHRydWUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5vcHRpb25zLmRyb3AgfHwgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsID09PSB0aGlzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wbGFjZUluTGlzdCh0aGlzLCBlLnBhZ2VYLCBlLnBhZ2VZLCBlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgZS5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9IGVsZW1lbnQuX19zb3J0YWJsZS5pc0NvcHkgPyAnY29weScgOiAnbW92ZSdcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZURyYWdnaW5nKGUsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9ub0Ryb3AoZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHVwZGF0ZSB0aGUgZHJhZ2dpbmcgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfdXBkYXRlRHJhZ2dpbmcoZSwgZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBkcmFnZ2luZyA9IGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnZ2luZ1xyXG4gICAgICAgIGNvbnN0IG9mZnNldCA9IGVsZW1lbnQuX19zb3J0YWJsZS5vZmZzZXRcclxuICAgICAgICBpZiAoZHJhZ2dpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5zdHlsZS5sZWZ0ID0gZS5wYWdlWCArIG9mZnNldC54ICsgJ3B4J1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5zdHlsZS50b3AgPSBlLnBhZ2VZICsgb2Zmc2V0LnkgKyAncHgnXHJcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZy5pY29uKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnN0eWxlLmxlZnQgPSBkcmFnZ2luZy5vZmZzZXRMZWZ0ICsgZHJhZ2dpbmcub2Zmc2V0V2lkdGggKyAncHgnXHJcbiAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnN0eWxlLnRvcCA9IGRyYWdnaW5nLm9mZnNldFRvcCArIGRyYWdnaW5nLm9mZnNldEhlaWdodCArICdweCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlbW92ZSB0aGUgZHJhZ2dpbmcgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3JlbW92ZURyYWdnaW5nKGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgZHJhZ2dpbmcgPSBlbGVtZW50Ll9fc29ydGFibGUuZHJhZ2dpbmdcclxuICAgICAgICBpZiAoZHJhZ2dpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5yZW1vdmUoKVxyXG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcuaWNvbilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5yZW1vdmUoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5kcmFnZ2luZyA9IG51bGxcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmlzQ29weSA9IGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBkcm9wIHRoZSBlbGVtZW50IGludG8gYSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2Ryb3AoZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBuYW1lID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMF1cclxuICAgICAgICBpZiAobmFtZSAmJiBuYW1lID09PSB0aGlzLm9wdGlvbnMubmFtZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMV1cclxuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgIT09IHRoaXMpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsLmVtaXQoJ3JlbW92ZScsIGVsZW1lbnQsIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2FkZCcsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsID0gdGhpc1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc29ydClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgnb3JkZXInLCBlbGVtZW50LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLmlzQ29weSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgnY29weScsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX21heGltdW0oZWxlbWVudCwgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ3VwZGF0ZScsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5pbmRleCAhPT0gdGhpcy5fZ2V0SW5kZXgoZS5jdXJyZW50VGFyZ2V0KSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgnb3JkZXInLCBlbGVtZW50LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ3VwZGF0ZScsIGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3JlbW92ZURyYWdnaW5nKGVsZW1lbnQpXHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZmluZCBjbG9zZXN0IFNvcnRhYmxlIHRvIHNjcmVlbiBsb2NhdGlvblxyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBlXHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlW119IGxpc3Qgb2YgcmVsYXRlZCBTb3J0YWJsZXNcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9maW5kQ2xvc2VzdChlLCBsaXN0LCBlbGVtZW50KVxyXG4gICAge1xyXG4gICAgICAgIGxldCBtaW4gPSBJbmZpbml0eSwgZm91bmRcclxuICAgICAgICBmb3IgKGxldCByZWxhdGVkIG9mIGxpc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoKCFyZWxhdGVkLm9wdGlvbnMuZHJvcCAmJiBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgIT09IHJlbGF0ZWQpIHx8XHJcbiAgICAgICAgICAgICAgICAoZWxlbWVudC5fX3NvcnRhYmxlLmlzQ29weSAmJiBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgPT09IHJlbGF0ZWQpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh1dGlscy5pbnNpZGUoZS5wYWdlWCwgZS5wYWdlWSwgcmVsYXRlZC5lbGVtZW50KSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlbGF0ZWRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChyZWxhdGVkLm9wdGlvbnMub2ZmTGlzdCA9PT0gJ2Nsb3Nlc3QnKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjYWxjdWxhdGUgPSB1dGlscy5kaXN0YW5jZVRvQ2xvc2VzdENvcm5lcihlLnBhZ2VYLCBlLnBhZ2VZLCByZWxhdGVkLmVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICBpZiAoY2FsY3VsYXRlIDwgbWluKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG1pbiA9IGNhbGN1bGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gcmVsYXRlZFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmb3VuZFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGxhY2UgaW5kaWNhdG9yIGluIHRoZSBzb3J0YWJsZSBsaXN0IGFjY29yZGluZyB0byBvcHRpb25zLnNvcnRcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9wbGFjZUluTGlzdChzb3J0YWJsZSwgeCwgeSwgZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSBlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheSA9PT0gJ3Vuc2V0JyA/ICcnIDogZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXlcclxuICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkgPSBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc29ydClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuX3BsYWNlSW5Tb3J0YWJsZUxpc3Qoc29ydGFibGUsIHgsIHksIGVsZW1lbnQpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuX3BsYWNlSW5PcmRlcmVkTGlzdChzb3J0YWJsZSwgZWxlbWVudClcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fc2V0SWNvbihlbGVtZW50LCBzb3J0YWJsZSlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlcGxhY2UgaXRlbSBpbiBsaXN0IGF0IG9yaWdpbmFsIGluZGV4IHBvc2l0aW9uXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcmVwbGFjZUluTGlzdChzb3J0YWJsZSwgZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHNvcnRhYmxlLl9nZXRDaGlsZHJlbigpXHJcbiAgICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gZWxlbWVudC5fX3NvcnRhYmxlLmluZGV4XHJcbiAgICAgICAgICAgIGlmIChpbmRleCA8IGNoaWxkcmVuLmxlbmd0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2hpbGRyZW5baW5kZXhdLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGVsZW1lbnQsIGNoaWxkcmVuW2luZGV4XSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkcmVuWzBdLmFwcGVuZENoaWxkKGVsZW1lbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc29ydGFibGUuZWxlbWVudC5hcHBlbmRDaGlsZChlbGVtZW50KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNvdW50IHRoZSBpbmRleCBvZiB0aGUgY2hpbGQgaW4gdGhlIGxpc3Qgb2YgY2hpbGRyZW5cclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGNoaWxkXHJcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZ2V0SW5kZXgoY2hpbGQpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLl9nZXRDaGlsZHJlbigpXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChjaGlsZHJlbltpXSA9PT0gY2hpbGQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB0cmF2ZXJzZSBhbmQgc2VhcmNoIGRlc2NlbmRlbnRzIGluIERPTVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gYmFzZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNlYXJjaFxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudFtdfSByZXN1bHRzIHRvIHJldHVyblxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3RyYXZlcnNlQ2hpbGRyZW4oYmFzZSwgc2VhcmNoLCByZXN1bHRzKVxyXG4gICAge1xyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGJhc2UuY2hpbGRyZW4pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoc2VhcmNoLmxlbmd0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHNlYXJjaC5pbmRleE9mKGNoaWxkLmNsYXNzTmFtZSkgIT09IC0xKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChjaGlsZClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChjaGlsZClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl90cmF2ZXJzZUNoaWxkcmVuKGNoaWxkLCBzZWFyY2gsIHJlc3VsdHMpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZmluZCBjaGlsZHJlbiBpbiBkaXZcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcmRlcl0gc2VhcmNoIGZvciBkcmFnT3JkZXIgYXMgd2VsbFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2dldENoaWxkcmVuKG9yZGVyKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZGVlcFNlYXJjaClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBzZWFyY2ggPSBbXVxyXG4gICAgICAgICAgICBpZiAob3JkZXIgJiYgdGhpcy5vcHRpb25zLm9yZGVyQ2xhc3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaC5wdXNoKHRoaXMub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAob3JkZXIgJiYgdGhpcy5vcHRpb25zLm9yZGVyQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoLnB1c2godGhpcy5vcHRpb25zLm9yZGVyQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoIW9yZGVyICYmIHRoaXMub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNlYXJjaC5wdXNoKHRoaXMub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdXHJcbiAgICAgICAgICAgIHRoaXMuX3RyYXZlcnNlQ2hpbGRyZW4odGhpcy5lbGVtZW50LCBzZWFyY2gsIHJlc3VsdHMpXHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbGlzdCA9IFtdXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiB0aGlzLmVsZW1lbnQuY2hpbGRyZW4pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHV0aWxzLmNvbnRhaW5zQ2xhc3NOYW1lKGNoaWxkLCB0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKSB8fCAob3JkZXIgJiYgIXRoaXMub3B0aW9ucy5vcmRlckNsYXNzIHx8IChvcmRlciAmJiB0aGlzLm9wdGlvbnMub3JkZXJDbGFzcyAmJiB1dGlscy5jb250YWluc0NsYXNzTmFtZShjaGlsZCwgdGhpcy5vcHRpb25zLm9yZGVyQ2xhc3MpKSkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaXN0LnB1c2goY2hpbGQpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGxpc3RcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGxpc3QgPSBbXVxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5lbGVtZW50LmNoaWxkcmVuKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGxpc3QucHVzaChjaGlsZClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBsaXN0XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwbGFjZSBpbmRpY2F0b3IgaW4gYW4gb3JkZXJlZCBsaXN0XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmdcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9wbGFjZUluT3JkZXJlZExpc3Qoc29ydGFibGUsIGRyYWdnaW5nKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgIT09IHNvcnRhYmxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSBzb3J0YWJsZS5vcHRpb25zLm9yZGVySWRcclxuICAgICAgICAgICAgbGV0IGRyYWdPcmRlciA9IGRyYWdnaW5nLmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICAgICAgZHJhZ09yZGVyID0gc29ydGFibGUub3B0aW9ucy5vcmRlcklkSXNOdW1iZXIgPyBwYXJzZUZsb2F0KGRyYWdPcmRlcikgOiBkcmFnT3JkZXJcclxuICAgICAgICAgICAgbGV0IGZvdW5kXHJcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gc29ydGFibGUuX2dldENoaWxkcmVuKHRydWUpXHJcbiAgICAgICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLnJldmVyc2VPcmRlcilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IGNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gY2hpbGRyZW5baV1cclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGREcmFnT3JkZXIgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGREcmFnT3JkZXIgPSBzb3J0YWJsZS5vcHRpb25zLm9yZGVySXNOdW1iZXIgPyBwYXJzZUZsb2F0KGNoaWxkRHJhZ09yZGVyKSA6IGNoaWxkRHJhZ09yZGVyXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdPcmRlciA+IGNoaWxkRHJhZ09yZGVyKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZHJhZ2dpbmcsIGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBjaGlsZHJlbilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGREcmFnT3JkZXIgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGREcmFnT3JkZXIgPSBzb3J0YWJsZS5vcHRpb25zLm9yZGVySXNOdW1iZXIgPyBwYXJzZUZsb2F0KGNoaWxkRHJhZ09yZGVyKSA6IGNoaWxkRHJhZ09yZGVyXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdPcmRlciA8IGNoaWxkRHJhZ09yZGVyKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZHJhZ2dpbmcsIGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFmb3VuZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc29ydGFibGUuZWxlbWVudC5hcHBlbmRDaGlsZChkcmFnZ2luZylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50ICE9PSBkcmFnZ2luZy5fX3NvcnRhYmxlLm9yaWdpbmFsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudC5lbWl0KCdhZGQtcmVtb3ZlLXBlbmRpbmcnLCBkcmFnZ2luZywgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudC5lbWl0KCdyZW1vdmUtcGVuZGluZycsIGRyYWdnaW5nLCBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnYWRkLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmlzQ29weSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnY29weS1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudCA9IHNvcnRhYmxlXHJcbiAgICAgICAgICAgIHRoaXMuX21heGltdW1QZW5kaW5nKGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgc29ydGFibGUuZW1pdCgndXBkYXRlLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2VhcmNoIGZvciB3aGVyZSB0byBwbGFjZSB1c2luZyBwZXJjZW50YWdlXHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmdcclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IDAgPSBub3QgZm91bmQ7IDEgPSBub3RoaW5nIHRvIGRvOyAyID0gbW92ZWRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9wbGFjZUJ5UGVyY2VudGFnZShzb3J0YWJsZSwgZHJhZ2dpbmcpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgY3Vyc29yID0gZHJhZ2dpbmcuX19zb3J0YWJsZS5kcmFnZ2luZ1xyXG4gICAgICAgIGNvbnN0IHhhMSA9IGN1cnNvci5vZmZzZXRMZWZ0XHJcbiAgICAgICAgY29uc3QgeWExID0gY3Vyc29yLm9mZnNldFRvcFxyXG4gICAgICAgIGNvbnN0IHhhMiA9IGN1cnNvci5vZmZzZXRMZWZ0ICsgY3Vyc29yLm9mZnNldFdpZHRoXHJcbiAgICAgICAgY29uc3QgeWEyID0gY3Vyc29yLm9mZnNldFRvcCArIGN1cnNvci5vZmZzZXRIZWlnaHRcclxuICAgICAgICBsZXQgbGFyZ2VzdCA9IDAsIGNsb3Nlc3QsIGlzQmVmb3JlLCBpbmRpY2F0b3JcclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gc29ydGFibGUuZWxlbWVudFxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnRzID0gc29ydGFibGUuX2dldENoaWxkcmVuKHRydWUpXHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgZWxlbWVudHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoY2hpbGQgPT09IGRyYWdnaW5nKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbmRpY2F0b3IgPSB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgcG9zID0gdXRpbHMudG9HbG9iYWwoY2hpbGQpXHJcbiAgICAgICAgICAgIGNvbnN0IHhiMSA9IHBvcy54XHJcbiAgICAgICAgICAgIGNvbnN0IHliMSA9IHBvcy55XHJcbiAgICAgICAgICAgIGNvbnN0IHhiMiA9IHBvcy54ICsgY2hpbGQub2Zmc2V0V2lkdGhcclxuICAgICAgICAgICAgY29uc3QgeWIyID0gcG9zLnkgKyBjaGlsZC5vZmZzZXRIZWlnaHRcclxuICAgICAgICAgICAgY29uc3QgcGVyY2VudGFnZSA9IHV0aWxzLnBlcmNlbnRhZ2UoeGExLCB5YTEsIHhhMiwgeWEyLCB4YjEsIHliMSwgeGIyLCB5YjIpXHJcbiAgICAgICAgICAgIGlmIChwZXJjZW50YWdlID4gbGFyZ2VzdClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGFyZ2VzdCA9IHBlcmNlbnRhZ2VcclxuICAgICAgICAgICAgICAgIGNsb3Nlc3QgPSBjaGlsZFxyXG4gICAgICAgICAgICAgICAgaXNCZWZvcmUgPSBpbmRpY2F0b3JcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY2xvc2VzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChjbG9zZXN0ID09PSBkcmFnZ2luZylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaXNCZWZvcmUgJiYgY2xvc2VzdC5uZXh0U2libGluZylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5pbnNlcnRCZWZvcmUoZHJhZ2dpbmcsIGNsb3Nlc3QubmV4dFNpYmxpbmcpXHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdvcmRlci1wZW5kaW5nJywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Lmluc2VydEJlZm9yZShkcmFnZ2luZywgY2xvc2VzdClcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ29yZGVyLXBlbmRpbmcnLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gMlxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gMFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNlYXJjaCBmb3Igd2hlcmUgdG8gcGxhY2UgdXNpbmcgZGlzdGFuY2VcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5XHJcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSBmYWxzZT1ub3RoaW5nIHRvIGRvXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGxhY2VCeURpc3RhbmNlKHNvcnRhYmxlLCBkcmFnZ2luZywgeCwgeSlcclxuICAgIHtcclxuICAgICAgICBpZiAodXRpbHMuaW5zaWRlKHgsIHksIGRyYWdnaW5nKSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBpbmRleCA9IC0xXHJcbiAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudCA9PT0gc29ydGFibGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpbmRleCA9IHNvcnRhYmxlLl9nZXRJbmRleChkcmFnZ2luZylcclxuICAgICAgICAgICAgc29ydGFibGUuZWxlbWVudC5hcHBlbmRDaGlsZChkcmFnZ2luZylcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGRpc3RhbmNlID0gSW5maW5pdHksIGNsb3Nlc3RcclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gc29ydGFibGUuZWxlbWVudFxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnRzID0gc29ydGFibGUuX2dldENoaWxkcmVuKHRydWUpXHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgZWxlbWVudHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodXRpbHMuaW5zaWRlKHgsIHksIGNoaWxkKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2xvc2VzdCA9IGNoaWxkXHJcbiAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbWVhc3VyZSA9IHV0aWxzLmRpc3RhbmNlVG9DbG9zZXN0Q29ybmVyKHgsIHksIGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgaWYgKG1lYXN1cmUgPCBkaXN0YW5jZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjbG9zZXN0ID0gY2hpbGRcclxuICAgICAgICAgICAgICAgICAgICBkaXN0YW5jZSA9IG1lYXN1cmVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbGVtZW50Lmluc2VydEJlZm9yZShkcmFnZ2luZywgY2xvc2VzdClcclxuICAgICAgICBpZiAoaW5kZXggPT09IHNvcnRhYmxlLl9nZXRJbmRleChkcmFnZ2luZykpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9tYXhpbXVtUGVuZGluZyhkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgc29ydGFibGUuZW1pdCgnb3JkZXItcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBsYWNlIGluZGljYXRvciBpbiBhbiBzb3J0YWJsZSBsaXN0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGxhY2VJblNvcnRhYmxlTGlzdChzb3J0YWJsZSwgeCwgeSwgZHJhZ2dpbmcpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHNvcnRhYmxlLmVsZW1lbnRcclxuICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHNvcnRhYmxlLl9nZXRDaGlsZHJlbigpXHJcbiAgICAgICAgaWYgKCFjaGlsZHJlbi5sZW5ndGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKGRyYWdnaW5nKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBjb25zdCBwZXJjZW50YWdlID0gdGhpcy5fcGxhY2VCeVBlcmNlbnRhZ2Uoc29ydGFibGUsIGRyYWdnaW5nKVxyXG4gICAgICAgICAgICBpZiAodGhpcy5fcGxhY2VCeURpc3RhbmNlKHNvcnRhYmxlLCBkcmFnZ2luZywgeCwgeSkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgIT09IHNvcnRhYmxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnYWRkLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmlzQ29weSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnY29weS1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgIT09IGRyYWdnaW5nLl9fc29ydGFibGUub3JpZ2luYWwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50LmVtaXQoJ2FkZC1yZW1vdmUtcGVuZGluZycsIGRyYWdnaW5nLCBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50LmVtaXQoJ3JlbW92ZS1wZW5kaW5nJywgZHJhZ2dpbmcsIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgPSBzb3J0YWJsZVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9tYXhpbXVtUGVuZGluZyhkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgc29ydGFibGUuZW1pdCgndXBkYXRlLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzZXQgaWNvbiBpZiBhdmFpbGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2FuY2VsXSBmb3JjZSBjYW5jZWwgKGZvciBvcHRpb25zLmNvcHkpXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfc2V0SWNvbihlbGVtZW50LCBzb3J0YWJsZSwgY2FuY2VsKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGRyYWdnaW5nID0gZWxlbWVudC5fX3NvcnRhYmxlLmRyYWdnaW5nXHJcbiAgICAgICAgaWYgKGRyYWdnaW5nICYmIGRyYWdnaW5nLmljb24pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoIXNvcnRhYmxlKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZSA9IGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbFxyXG4gICAgICAgICAgICAgICAgaWYgKGNhbmNlbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnNyYyA9IHNvcnRhYmxlLm9wdGlvbnMuaWNvbnMuY2FuY2VsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zcmMgPSBzb3J0YWJsZS5vcHRpb25zLm9mZkxpc3QgPT09ICdkZWxldGUnID8gc29ydGFibGUub3B0aW9ucy5pY29ucy5kZWxldGUgOiBzb3J0YWJsZS5vcHRpb25zLmljb25zLmNhbmNlbFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5pc0NvcHkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zcmMgPSBzb3J0YWJsZS5vcHRpb25zLmljb25zLmNvcHlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnNyYyA9IGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9PT0gc29ydGFibGUgPyBzb3J0YWJsZS5vcHRpb25zLmljb25zLnJlb3JkZXIgOiBzb3J0YWJsZS5vcHRpb25zLmljb25zLm1vdmVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFkZCBhIG1heGltdW0gY291bnRlciB0byB0aGUgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9tYXhpbXVtQ291bnRlcihlbGVtZW50LCBzb3J0YWJsZSlcclxuICAgIHtcclxuICAgICAgICBsZXQgY291bnQgPSAtMVxyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLm1heGltdW0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHNvcnRhYmxlLl9nZXRDaGlsZHJlbigpXHJcbiAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGNoaWxkcmVuKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGQgIT09IGVsZW1lbnQgJiYgY2hpbGQuX19zb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb3VudCA9IGNoaWxkLl9fc29ydGFibGUubWF4aW11bSA+IGNvdW50ID8gY2hpbGQuX19zb3J0YWJsZS5tYXhpbXVtIDogY291bnRcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUubWF4aW11bSA9IGNvdW50ICsgMVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIG1heGltdW1cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9tYXhpbXVtKGVsZW1lbnQsIHNvcnRhYmxlKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLm1heGltdW0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHNvcnRhYmxlLl9nZXRDaGlsZHJlbigpXHJcbiAgICAgICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPiBzb3J0YWJsZS5vcHRpb25zLm1heGltdW0pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZS5yZW1vdmVQZW5kaW5nKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChzb3J0YWJsZS5yZW1vdmVQZW5kaW5nLmxlbmd0aClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gc29ydGFibGUucmVtb3ZlUGVuZGluZy5wb3AoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5zdHlsZS5kaXNwbGF5ID0gY2hpbGQuX19zb3J0YWJsZS5kaXNwbGF5ID09PSAndW5zZXQnID8gJycgOiBjaGlsZC5fX3NvcnRhYmxlLmRpc3BsYXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQuX19zb3J0YWJsZS5kaXNwbGF5ID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5yZW1vdmUoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdtYXhpbXVtLXJlbW92ZScsIGNoaWxkLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgc29ydGFibGUucmVtb3ZlUGVuZGluZyA9IG51bGxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9tYXhpbXVtQ291bnRlcihlbGVtZW50LCBzb3J0YWJsZSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjbGVhciBwZW5kaW5nIGxpc3RcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfY2xlYXJNYXhpbXVtUGVuZGluZyhzb3J0YWJsZSlcclxuICAgIHtcclxuICAgICAgICBpZiAoc29ydGFibGUucmVtb3ZlUGVuZGluZylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHdoaWxlIChzb3J0YWJsZS5yZW1vdmVQZW5kaW5nLmxlbmd0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBzb3J0YWJsZS5yZW1vdmVQZW5kaW5nLnBvcCgpXHJcbiAgICAgICAgICAgICAgICBjaGlsZC5zdHlsZS5kaXNwbGF5ID0gY2hpbGQuX19zb3J0YWJsZS5kaXNwbGF5ID09PSAndW5zZXQnID8gJycgOiBjaGlsZC5fX3NvcnRhYmxlLmRpc3BsYXlcclxuICAgICAgICAgICAgICAgIGNoaWxkLl9fc29ydGFibGUuZGlzcGxheSA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzb3J0YWJsZS5yZW1vdmVQZW5kaW5nID0gbnVsbFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSBwZW5kaW5nIG1heGltdW1cclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfbWF4aW11bVBlbmRpbmcoZWxlbWVudCwgc29ydGFibGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMubWF4aW11bSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gc29ydGFibGUuX2dldENoaWxkcmVuKClcclxuICAgICAgICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA+IHNvcnRhYmxlLm9wdGlvbnMubWF4aW11bSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2F2ZVBlbmRpbmcgPSBzb3J0YWJsZS5yZW1vdmVQZW5kaW5nID8gc29ydGFibGUucmVtb3ZlUGVuZGluZy5zbGljZSgwKSA6IFtdXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jbGVhck1heGltdW1QZW5kaW5nKHNvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAgc29ydGFibGUucmVtb3ZlUGVuZGluZyA9IFtdXHJcbiAgICAgICAgICAgICAgICBsZXQgc29ydFxyXG4gICAgICAgICAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMubWF4aW11bUZJRk8pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc29ydCA9IGNoaWxkcmVuLnNvcnQoKGEsIGIpID0+IHsgcmV0dXJuIGEgPT09IGVsZW1lbnQgPyAxIDogYS5fX3NvcnRhYmxlLm1heGltdW0gLSBiLl9fc29ydGFibGUubWF4aW11bSB9KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNvcnQgPSBjaGlsZHJlbi5zb3J0KChhLCBiKSA9PiB7IHJldHVybiBhID09PSBlbGVtZW50ID8gMSA6IGIuX19zb3J0YWJsZS5tYXhpbXVtIC0gYS5fX3NvcnRhYmxlLm1heGltdW0gfSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoIC0gc29ydGFibGUub3B0aW9ucy5tYXhpbXVtOyBpKyspXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaGlkZSA9IHNvcnRbaV1cclxuICAgICAgICAgICAgICAgICAgICBoaWRlLl9fc29ydGFibGUuZGlzcGxheSA9IGhpZGUuc3R5bGUuZGlzcGxheSB8fCAndW5zZXQnXHJcbiAgICAgICAgICAgICAgICAgICAgaGlkZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgICAgICAgICAgICAgICAgICAgc29ydGFibGUucmVtb3ZlUGVuZGluZy5wdXNoKGhpZGUpXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNhdmVQZW5kaW5nLmluZGV4T2YoaGlkZSkgPT09IC0xKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnbWF4aW11bS1yZW1vdmUtcGVuZGluZycsIGhpZGUsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSBjdXJzb3IgZHVyaW5nIG1vdXNlZG93blxyXG4gICAgICogQHBhcmFtIHtNb3VzZUV2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfbW91c2VEb3duKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHV0aWxzLnN0eWxlKGUuY3VycmVudFRhcmdldCwgJ2N1cnNvcicsIHRoaXMub3B0aW9ucy5jdXJzb3JEb3duKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSBjdXJzb3IgZHVyaW5nIG1vdXNldXBcclxuICAgICAqIEBwYXJhbSB7TW91c2VFdmVudH0gZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX21vdXNlVXAoZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLmVtaXQoJ2NsaWNrZWQnLCBlLmN1cnJlbnRUYXJnZXQsIHRoaXMpXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHV0aWxzLnN0eWxlKGUuY3VycmVudFRhcmdldCwgJ2N1cnNvcicsIHRoaXMub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgcGlja2VkIHVwIGJlY2F1c2UgaXQgd2FzIG1vdmVkIGJleW9uZCB0aGUgb3B0aW9ucy50aHJlc2hvbGRcclxuICogQGV2ZW50IFNvcnRhYmxlI3BpY2t1cFxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHNvcnRhYmxlIGlzIHJlb3JkZXJlZFxyXG4gKiBAZXZlbnQgU29ydGFibGUjb3JkZXJcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCB0aGF0IHdhcyByZW9yZGVyZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgcGxhY2VkXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyBhZGRlZCB0byB0aGlzIHNvcnRhYmxlXHJcbiAqIEBldmVudCBTb3J0YWJsZSNhZGRcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBhZGRlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyBhZGRlZFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgcmVtb3ZlZCBmcm9tIHRoaXMgc29ydGFibGVcclxuICogQGV2ZW50IFNvcnRhYmxlI3JlbW92ZVxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHJlbW92ZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgcmVtb3ZlZFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgcmVtb3ZlZCBmcm9tIGFsbCBzb3J0YWJsZXNcclxuICogQGV2ZW50IFNvcnRhYmxlI2RlbGV0ZVxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHJlbW92ZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgZHJhZ2dlZCBmcm9tXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBjb3B5IG9mIGFuIGVsZW1lbnQgaXMgZHJvcHBlZFxyXG4gKiBAZXZlbnQgU29ydGFibGUjY29weVxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHJlbW92ZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgZHJhZ2dlZCBmcm9tXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gdGhlIHNvcnRhYmxlIGlzIHVwZGF0ZWQgd2l0aCBhbiBhZGQsIHJlbW92ZSwgb3Igb3JkZXIgY2hhbmdlXHJcbiAqIEBldmVudCBTb3J0YWJsZSN1cGRhdGVcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBjaGFuZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdpdGggZWxlbWVudFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgcmVtb3ZlZCBiZWNhdXNlIG1heGltdW0gd2FzIHJlYWNoZWQgZm9yIHRoZSBzb3J0YWJsZVxyXG4gKiBAZXZlbnQgU29ydGFibGUjbWF4aW11bS1yZW1vdmVcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCByZW1vdmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIGRyYWdnZWQgZnJvbVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIG9yZGVyIHdhcyBjaGFuZ2VkIGJ1dCBlbGVtZW50IHdhcyBub3QgZHJvcHBlZCB5ZXRcclxuICogQGV2ZW50IFNvcnRhYmxlI29yZGVyLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gZWxlbWVudCBpcyBhZGRlZCBidXQgbm90IGRyb3BwZWQgeWV0XHJcbiAqIEBldmVudCBTb3J0YWJsZSNhZGQtcGVuZGluZ1xyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBlbGVtZW50IGlzIHJlbW92ZWQgYnV0IG5vdCBkcm9wcGVkIHlldFxyXG4gKiBAZXZlbnQgU29ydGFibGUjcmVtb3ZlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gZWxlbWVudCBpcyByZW1vdmVkIGFmdGVyIGJlaW5nIHRlbXBvcmFyaWx5IGFkZGVkXHJcbiAqIEBldmVudCBTb3J0YWJsZSNhZGQtcmVtb3ZlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyBhYm91dCB0byBiZSByZW1vdmVkIGZyb20gYWxsIHNvcnRhYmxlc1xyXG4gKiBAZXZlbnQgU29ydGFibGUjZGVsZXRlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCByZW1vdmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIGRyYWdnZWQgZnJvbVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgYWRkZWQsIHJlbW92ZWQsIG9yIHJlb3JkZXIgYnV0IGVsZW1lbnQgaGFzIG5vdCBkcm9wcGVkIHlldFxyXG4gKiBAZXZlbnQgU29ydGFibGUjdXBkYXRlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBjb3B5IG9mIGFuIGVsZW1lbnQgaXMgYWJvdXQgdG8gZHJvcFxyXG4gKiBAZXZlbnQgU29ydGFibGUjY29weS1wZW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgcmVtb3ZlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyBkcmFnZ2VkIGZyb21cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIGFib3V0IHRvIGJlIHJlbW92ZWQgYmVjYXVzZSBtYXhpbXVtIHdhcyByZWFjaGVkIGZvciB0aGUgc29ydGFibGVcclxuICogQGV2ZW50IFNvcnRhYmxlI21heGltdW0tcmVtb3ZlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCByZW1vdmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIGRyYWdnZWQgZnJvbVxyXG4gKi9cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU29ydGFibGUiXX0=