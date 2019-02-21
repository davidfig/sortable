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

            if (!Sortable.tracker || !document.getElementById('sortable-dragImage')) {
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
                        element.__sortable.original.emit('update', element, element.__sortable.original);
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
            e.dataTransfer.setDragImage(document.getElementById('sortable-dragImage'), 0, 0);
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
        value: function _dragLeave(e) {}
        // const id = e.dataTransfer.types[1]
        // if (id)
        // {
        //     const element = document.getElementById(id)
        //     if (element)
        //     {
        //         const sortable = element.__sortable.current
        //         sortable._maximumPending(element, sortable)
        //     }
        // }


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
                    this._clearMaximumPending(dragging.__sortable.current);
                    this._maximum(null, dragging.__sortable.current);
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
                    this._clearMaximumPending(dragging.__sortable.current);
                    this._maximum(null, dragging.__sortable.current);
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
                if (element) {
                    this._maximumCounter(element, sortable);
                }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3J0YWJsZS5qcyJdLCJuYW1lcyI6WyJFdmVudHMiLCJyZXF1aXJlIiwiZGVmYXVsdHMiLCJ1dGlscyIsIlNvcnRhYmxlIiwiZWxlbWVudCIsIm9wdGlvbnMiLCJfYWRkVG9HbG9iYWxUcmFja2VyIiwiZWxlbWVudHMiLCJfZ2V0Q2hpbGRyZW4iLCJldmVudHMiLCJkcmFnU3RhcnQiLCJlIiwiX2RyYWdTdGFydCIsImRyYWdFbmQiLCJfZHJhZ0VuZCIsImRyYWdPdmVyIiwiX2RyYWdPdmVyIiwiZHJvcCIsIl9kcm9wIiwiZHJhZ0xlYXZlIiwiX2RyYWdMZWF2ZSIsIm1vdXNlRG93biIsIl9tb3VzZURvd24iLCJtb3VzZVVwIiwiX21vdXNlVXAiLCJjaGlsZCIsImRyYWdDbGFzcyIsImNvbnRhaW5zQ2xhc3NOYW1lIiwiYXR0YWNoRWxlbWVudCIsImFkZEV2ZW50TGlzdGVuZXIiLCJjdXJzb3JIb3ZlciIsInN0eWxlIiwiY3Vyc29yRG93biIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJyZW1vdmVFbGVtZW50IiwiaW5kZXgiLCJzb3J0IiwiY2hpbGRyZW4iLCJsZW5ndGgiLCJhcHBlbmRDaGlsZCIsImluc2VydEJlZm9yZSIsImlkIiwib3JkZXJJZCIsImRyYWdPcmRlciIsImdldEF0dHJpYnV0ZSIsIm9yZGVySWRJc051bWJlciIsInBhcnNlRmxvYXQiLCJmb3VuZCIsInJldmVyc2VPcmRlciIsImkiLCJjaGlsZERyYWdPcmRlciIsIm9yZGVySXNOdW1iZXIiLCJwYXJlbnROb2RlIiwiX19zb3J0YWJsZSIsIm9yaWdpbmFsIiwic29ydGFibGUiLCJfbWF4aW11bUNvdW50ZXIiLCJuYW1lIiwidHJhY2tlciIsImNvdW50ZXIiLCJjb3B5Iiwic2V0QXR0cmlidXRlIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImRyYWdJbWFnZSIsImNyZWF0ZUVsZW1lbnQiLCJiYWNrZ3JvdW5kIiwicG9zaXRpb24iLCJsZWZ0IiwidG9wIiwid2lkdGgiLCJoZWlnaHQiLCJ6SW5kZXgiLCJib2R5IiwiX2JvZHlEcmFnT3ZlciIsIl9ib2R5RHJvcCIsImxpc3QiLCJwdXNoIiwiZGF0YVRyYW5zZmVyIiwidHlwZXMiLCJfZmluZENsb3Nlc3QiLCJsYXN0IiwiTWF0aCIsImFicyIsIngiLCJwYWdlWCIsInRocmVzaG9sZCIsInkiLCJwYWdlWSIsIl91cGRhdGVEcmFnZ2luZyIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwiX3BsYWNlSW5MaXN0IiwiZHJvcEVmZmVjdCIsIl9ub0Ryb3AiLCJjYW5jZWwiLCJfc2V0SWNvbiIsIm9mZkxpc3QiLCJkaXNwbGF5IiwiZW1pdCIsIl9yZXBsYWNlSW5MaXN0IiwiY3VycmVudCIsIl9jbGVhck1heGltdW1QZW5kaW5nIiwiX3JlbW92ZURyYWdnaW5nIiwicmVtb3ZlIiwiY3VycmVudFRhcmdldCIsImRyYWdnaW5nIiwiaWNvbiIsImNsb25lTm9kZSIsImRyYWdTdHlsZSIsInBvcyIsInRvR2xvYmFsIiwib2Zmc2V0IiwidXNlSWNvbnMiLCJpbWFnZSIsIkltYWdlIiwic3JjIiwiaWNvbnMiLCJyZW9yZGVyIiwidHJhbnNmb3JtIiwib2Zmc2V0TGVmdCIsIm9mZnNldFdpZHRoIiwib2Zmc2V0VG9wIiwib2Zmc2V0SGVpZ2h0IiwidGFyZ2V0IiwiaXNDb3B5IiwiY2xlYXJEYXRhIiwic2V0RGF0YSIsInNldERyYWdJbWFnZSIsIl9nZXRJbmRleCIsIl9tYXhpbXVtIiwibWluIiwiSW5maW5pdHkiLCJyZWxhdGVkIiwiaW5zaWRlIiwiY2FsY3VsYXRlIiwiZGlzdGFuY2VUb0Nsb3Nlc3RDb3JuZXIiLCJfcGxhY2VJblNvcnRhYmxlTGlzdCIsIl9wbGFjZUluT3JkZXJlZExpc3QiLCJiYXNlIiwic2VhcmNoIiwicmVzdWx0cyIsImluZGV4T2YiLCJjbGFzc05hbWUiLCJfdHJhdmVyc2VDaGlsZHJlbiIsIm9yZGVyIiwiZGVlcFNlYXJjaCIsIm9yZGVyQ2xhc3MiLCJfbWF4aW11bVBlbmRpbmciLCJjdXJzb3IiLCJ4YTEiLCJ5YTEiLCJ4YTIiLCJ5YTIiLCJsYXJnZXN0IiwiY2xvc2VzdCIsImlzQmVmb3JlIiwiaW5kaWNhdG9yIiwieGIxIiwieWIxIiwieGIyIiwieWIyIiwicGVyY2VudGFnZSIsIm5leHRTaWJsaW5nIiwiZGlzdGFuY2UiLCJtZWFzdXJlIiwiX3BsYWNlQnlEaXN0YW5jZSIsImRlbGV0ZSIsIm1vdmUiLCJjb3VudCIsIm1heGltdW0iLCJyZW1vdmVQZW5kaW5nIiwicG9wIiwic2F2ZVBlbmRpbmciLCJzbGljZSIsIm1heGltdW1GSUZPIiwiYSIsImIiLCJoaWRlIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLElBQU1BLFNBQVNDLFFBQVEsZUFBUixDQUFmOztBQUVBLElBQU1DLFdBQVdELFFBQVEsWUFBUixDQUFqQjtBQUNBLElBQU1FLFFBQVFGLFFBQVEsU0FBUixDQUFkOztJQUVNRyxROzs7QUFFRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE0Q0Esc0JBQVlDLE9BQVosRUFBcUJDLE9BQXJCLEVBQ0E7QUFBQTs7QUFBQTs7QUFFSSxjQUFLQSxPQUFMLEdBQWVILE1BQU1HLE9BQU4sQ0FBY0EsT0FBZCxFQUF1QkosUUFBdkIsQ0FBZjtBQUNBLGNBQUtHLE9BQUwsR0FBZUEsT0FBZjtBQUNBLGNBQUtFLG1CQUFMO0FBQ0EsWUFBTUMsV0FBVyxNQUFLQyxZQUFMLEVBQWpCO0FBQ0EsY0FBS0MsTUFBTCxHQUFjO0FBQ1ZDLHVCQUFXLG1CQUFDQyxDQUFEO0FBQUEsdUJBQU8sTUFBS0MsVUFBTCxDQUFnQkQsQ0FBaEIsQ0FBUDtBQUFBLGFBREQ7QUFFVkUscUJBQVMsaUJBQUNGLENBQUQ7QUFBQSx1QkFBTyxNQUFLRyxRQUFMLENBQWNILENBQWQsQ0FBUDtBQUFBLGFBRkM7QUFHVkksc0JBQVUsa0JBQUNKLENBQUQ7QUFBQSx1QkFBTyxNQUFLSyxTQUFMLENBQWVMLENBQWYsQ0FBUDtBQUFBLGFBSEE7QUFJVk0s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QUU4RixhQUF2QixFQUFzQyxJQUF0QztBQUNBLGdCQUFJLEtBQUtwRyxPQUFMLENBQWF5QixXQUFqQixFQUNBO0FBQ0k1QixzQkFBTTZCLEtBQU4sQ0FBWXBCLEVBQUU4RixhQUFkLEVBQTZCLFFBQTdCLEVBQXVDLEtBQUtwRyxPQUFMLENBQWF5QixXQUFwRDtBQUNIO0FBQ0o7Ozs7O0FBL2pDRDs7Ozs7K0JBS2N2QixRLEVBQVVGLE8sRUFDeEI7QUFDSSxnQkFBTXdJLFVBQVUsRUFBaEI7QUFESjtBQUFBO0FBQUE7O0FBQUE7QUFFSSx1Q0FBb0J0SSxRQUFwQix3SUFDQTtBQUFBLHdCQURTSCxPQUNUOztBQUNJeUksNEJBQVFoRSxJQUFSLENBQWEsSUFBSTFFLFFBQUosQ0FBYUMsT0FBYixFQUFzQkMsT0FBdEIsQ0FBYjtBQUNIO0FBTEw7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFNSSxtQkFBT3dJLE9BQVA7QUFDSDs7OzRCQWpCRDtBQUNJLG1CQUFPNUksUUFBUDtBQUNIOzs7O0VBNUdrQkYsTTs7QUFnckN2Qjs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0FvTCxPQUFPQyxPQUFQLEdBQWlCakwsUUFBakIiLCJmaWxlIjoic29ydGFibGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBFdmVudHMgPSByZXF1aXJlKCdldmVudGVtaXR0ZXIzJylcclxuXHJcbmNvbnN0IGRlZmF1bHRzID0gcmVxdWlyZSgnLi9kZWZhdWx0cycpXHJcbmNvbnN0IHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpXHJcblxyXG5jbGFzcyBTb3J0YWJsZSBleHRlbmRzIEV2ZW50c1xyXG57XHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBzb3J0YWJsZSBsaXN0XHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMubmFtZT1zb3J0YWJsZV0gZHJhZ2dpbmcgaXMgYWxsb3dlZCBiZXR3ZWVuIFNvcnRhYmxlcyB3aXRoIHRoZSBzYW1lIG5hbWVcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5kcmFnQ2xhc3NdIGlmIHNldCB0aGVuIGRyYWcgb25seSBpdGVtcyB3aXRoIHRoaXMgY2xhc3NOYW1lIHVuZGVyIGVsZW1lbnQ7IG90aGVyd2lzZSBkcmFnIGFsbCBjaGlsZHJlblxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLm9yZGVyQ2xhc3NdIHVzZSB0aGlzIGNsYXNzIHRvIGluY2x1ZGUgZWxlbWVudHMgaW4gb3JkZXJpbmcgYnV0IG5vdCBkcmFnZ2luZzsgb3RoZXJ3aXNlIGFsbCBjaGlsZHJlbiBlbGVtZW50cyBhcmUgaW5jbHVkZWQgaW4gd2hlbiBzb3J0aW5nIGFuZCBvcmRlcmluZ1xyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5kZWVwU2VhcmNoXSBpZiBkcmFnQ2xhc3MgYW5kIGRlZXBTZWFyY2ggdGhlbiBzZWFyY2ggYWxsIGRlc2NlbmRlbnRzIG9mIGVsZW1lbnQgZm9yIGRyYWdDbGFzc1xyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5zb3J0PXRydWVdIGFsbG93IHNvcnRpbmcgd2l0aGluIGxpc3RcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuZHJvcD10cnVlXSBhbGxvdyBkcm9wIGZyb20gcmVsYXRlZCBzb3J0YWJsZXMgKGRvZXNuJ3QgaW1wYWN0IHJlb3JkZXJpbmcgdGhpcyBzb3J0YWJsZSdzIGNoaWxkcmVuIHVudGlsIHRoZSBjaGlsZHJlbiBhcmUgbW92ZWQgdG8gYSBkaWZmZXJlbiBzb3J0YWJsZSlcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuY29weT1mYWxzZV0gY3JlYXRlIGNvcHkgd2hlbiBkcmFnZ2luZyBhbiBpdGVtICh0aGlzIGRpc2FibGVzIHNvcnQ9dHJ1ZSBmb3IgdGhpcyBzb3J0YWJsZSlcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5vcmRlcklkPWRhdGEtb3JkZXJdIGZvciBvcmRlcmVkIGxpc3RzLCB1c2UgdGhpcyBkYXRhIGlkIHRvIGZpZ3VyZSBvdXQgc29ydCBvcmRlclxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5vcmRlcklkSXNOdW1iZXI9dHJ1ZV0gdXNlIHBhcnNlSW50IG9uIG9wdGlvbnMuc29ydElkIHRvIHByb3Blcmx5IHNvcnQgbnVtYmVyc1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnJldmVyc2VPcmRlcl0gcmV2ZXJzZSBzb3J0IHRoZSBvcmRlcklkXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMub2ZmTGlzdD1jbG9zZXN0XSBob3cgdG8gaGFuZGxlIHdoZW4gYW4gZWxlbWVudCBpcyBkcm9wcGVkIG91dHNpZGUgYSBzb3J0YWJsZTogY2xvc2VzdD1kcm9wIGluIGNsb3Nlc3Qgc29ydGFibGU7IGNhbmNlbD1yZXR1cm4gdG8gc3RhcnRpbmcgc29ydGFibGU7IGRlbGV0ZT1yZW1vdmUgZnJvbSBhbGwgc29ydGFibGVzXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWF4aW11bV0gbWF4aW11bSBudW1iZXIgb2YgZWxlbWVudHMgYWxsb3dlZCBpbiBhIHNvcnRhYmxlIGxpc3RcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMubWF4aW11bUZJRk9dIGRpcmVjdGlvbiBvZiBzZWFyY2ggdG8gY2hvb3NlIHdoaWNoIGl0ZW0gdG8gcmVtb3ZlIHdoZW4gbWF4aW11bSBpcyByZWFjaGVkXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuY3Vyc29ySG92ZXI9Z3JhYiAtd2Via2l0LWdyYWIgcG9pbnRlcl0gdXNlIHRoaXMgY3Vyc29yIGxpc3QgdG8gc2V0IGN1cnNvciB3aGVuIGhvdmVyaW5nIG92ZXIgYSBzb3J0YWJsZSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuY3Vyc29yRG93bj1ncmFiYmluZyAtd2Via2l0LWdyYWJiaW5nIHBvaW50ZXJdIHVzZSB0aGlzIGN1cnNvciBsaXN0IHRvIHNldCBjdXJzb3Igd2hlbiBtb3VzZWRvd24vdG91Y2hkb3duIG92ZXIgYSBzb3J0YWJsZSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnVzZUljb25zPXRydWVdIHNob3cgaWNvbnMgd2hlbiBkcmFnZ2luZ1xyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zLmljb25zXSBkZWZhdWx0IHNldCBvZiBpY29uc1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmljb25zLnJlb3JkZXJdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuaWNvbnMubW92ZV1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5pY29ucy5jb3B5XVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmljb25zLmRlbGV0ZV1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5jdXN0b21JY29uXSBzb3VyY2Ugb2YgY3VzdG9tIGltYWdlIHdoZW4gb3ZlciB0aGlzIHNvcnRhYmxlXHJcbiAgICAgKiBAZmlyZXMgcGlja3VwXHJcbiAgICAgKiBAZmlyZXMgb3JkZXJcclxuICAgICAqIEBmaXJlcyBhZGRcclxuICAgICAqIEBmaXJlcyByZW1vdmVcclxuICAgICAqIEBmaXJlcyB1cGRhdGVcclxuICAgICAqIEBmaXJlcyBkZWxldGVcclxuICAgICAqIEBmaXJlcyBjb3B5XHJcbiAgICAgKiBAZmlyZXMgbWF4aW11bS1yZW1vdmVcclxuICAgICAqIEBmaXJlcyBvcmRlci1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgYWRkLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyByZW1vdmUtcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIGFkZC1yZW1vdmUtcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIHVwZGF0ZS1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgZGVsZXRlLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyBjb3B5LXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyBtYXhpbXVtLXJlbW92ZS1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgY2xpY2tlZFxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyKClcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSB1dGlscy5vcHRpb25zKG9wdGlvbnMsIGRlZmF1bHRzKVxyXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnRcclxuICAgICAgICB0aGlzLl9hZGRUb0dsb2JhbFRyYWNrZXIoKVxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnRzID0gdGhpcy5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgIHRoaXMuZXZlbnRzID0ge1xyXG4gICAgICAgICAgICBkcmFnU3RhcnQ6IChlKSA9PiB0aGlzLl9kcmFnU3RhcnQoZSksXHJcbiAgICAgICAgICAgIGRyYWdFbmQ6IChlKSA9PiB0aGlzLl9kcmFnRW5kKGUpLFxyXG4gICAgICAgICAgICBkcmFnT3ZlcjogKGUpID0+IHRoaXMuX2RyYWdPdmVyKGUpLFxyXG4gICAgICAgICAgICBkcm9wOiAoZSkgPT4gdGhpcy5fZHJvcChlKSxcclxuICAgICAgICAgICAgZHJhZ0xlYXZlOiAoZSkgPT4gdGhpcy5fZHJhZ0xlYXZlKGUpLFxyXG4gICAgICAgICAgICBtb3VzZURvd246IChlKSA9PiB0aGlzLl9tb3VzZURvd24oZSksXHJcbiAgICAgICAgICAgIG1vdXNlVXA6IChlKSA9PiB0aGlzLl9tb3VzZVVwKGUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGVsZW1lbnRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzIHx8IHV0aWxzLmNvbnRhaW5zQ2xhc3NOYW1lKGNoaWxkLCB0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hdHRhY2hFbGVtZW50KGNoaWxkKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCB0aGlzLmV2ZW50cy5kcmFnT3ZlcilcclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLmV2ZW50cy5kcm9wKVxyXG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ2xlYXZlJywgdGhpcy5ldmVudHMuZHJhZ0xlYXZlKVxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY3Vyc29ySG92ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiB0aGlzLl9nZXRDaGlsZHJlbigpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB1dGlscy5zdHlsZShjaGlsZCwgJ2N1cnNvcicsIHRoaXMub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY3Vyc29yRG93bilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLmV2ZW50cy5tb3VzZURvd24pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5ldmVudHMubW91c2VVcClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlbW92ZXMgYWxsIGV2ZW50IGhhbmRsZXJzIGZyb20gdGhpcy5lbGVtZW50IGFuZCBjaGlsZHJlblxyXG4gICAgICovXHJcbiAgICBkZXN0cm95KClcclxuICAgIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCB0aGlzLmV2ZW50cy5kcmFnT3ZlcilcclxuICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJvcCcsIHRoaXMuZXZlbnRzLmRyb3ApXHJcbiAgICAgICAgY29uc3QgZWxlbWVudHMgPSB0aGlzLl9nZXRDaGlsZHJlbigpXHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgZWxlbWVudHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUVsZW1lbnQoY2hpbGQpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHRvZG86IHJlbW92ZSBTb3J0YWJsZS50cmFja2VyIGFuZCByZWxhdGVkIGV2ZW50IGhhbmRsZXJzIGlmIG5vIG1vcmUgc29ydGFibGVzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB0aGUgZ2xvYmFsIGRlZmF1bHRzIGZvciBuZXcgU29ydGFibGUgb2JqZWN0c1xyXG4gICAgICogQHR5cGUge0RlZmF1bHRPcHRpb25zfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0IGRlZmF1bHRzKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gZGVmYXVsdHNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNyZWF0ZSBtdWx0aXBsZSBzb3J0YWJsZSBlbGVtZW50c1xyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudHNbXX0gZWxlbWVudHNcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIC0gc2VlIGNvbnN0cnVjdG9yIGZvciBvcHRpb25zXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBjcmVhdGUoZWxlbWVudHMsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdXHJcbiAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiBlbGVtZW50cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaChuZXcgU29ydGFibGUoZWxlbWVudCwgb3B0aW9ucykpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHRzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhZGQgYW4gZWxlbWVudCBhcyBhIGNoaWxkIG9mIHRoZSBzb3J0YWJsZSBlbGVtZW50OyBjYW4gYWxzbyBiZSB1c2VkIHRvIHN3YXAgYmV0d2VlbiBzb3J0YWJsZXNcclxuICAgICAqIE5PVEU6IHRoaXMgbWF5IG5vdCB3b3JrIHdpdGggZGVlcFNlYXJjaCBub24tb3JkZXJlZCBlbGVtZW50czsgdXNlIGF0dGFjaEVsZW1lbnQgaW5zdGVhZFxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4XHJcbiAgICAgKi9cclxuICAgIGFkZChlbGVtZW50LCBpbmRleClcclxuICAgIHtcclxuICAgICAgICB0aGlzLmF0dGFjaEVsZW1lbnQoZWxlbWVudClcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNvcnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGluZGV4ID09PSAndW5kZWZpbmVkJyB8fCBpbmRleCA+PSB0aGlzLmVsZW1lbnQuY2hpbGRyZW4ubGVuZ3RoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZWxlbWVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5pbnNlcnRCZWZvcmUoZWxlbWVudCwgdGhpcy5lbGVtZW50LmNoaWxkcmVuW2luZGV4ICsgMV0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSB0aGlzLm9wdGlvbnMub3JkZXJJZFxyXG4gICAgICAgICAgICBsZXQgZHJhZ09yZGVyID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgICAgIGRyYWdPcmRlciA9IHRoaXMub3B0aW9ucy5vcmRlcklkSXNOdW1iZXIgPyBwYXJzZUZsb2F0KGRyYWdPcmRlcikgOiBkcmFnT3JkZXJcclxuICAgICAgICAgICAgbGV0IGZvdW5kXHJcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5fZ2V0Q2hpbGRyZW4odHJ1ZSlcclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yZXZlcnNlT3JkZXIpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSBjaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZCA9IGNoaWxkcmVuW2ldXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkRHJhZ09yZGVyID0gY2hpbGQuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkRHJhZ09yZGVyID0gdGhpcy5vcHRpb25zLm9yZGVySXNOdW1iZXIgPyBwYXJzZUZsb2F0KGNoaWxkRHJhZ09yZGVyKSA6IGNoaWxkRHJhZ09yZGVyXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdPcmRlciA+IGNoaWxkRHJhZ09yZGVyKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZWxlbWVudCwgY2hpbGQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGNoaWxkcmVuKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjaGlsZERyYWdPcmRlciA9IGNoaWxkLmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZERyYWdPcmRlciA9IHRoaXMub3B0aW9ucy5vcmRlcklzTnVtYmVyID8gcGFyc2VGbG9hdChjaGlsZERyYWdPcmRlcikgOiBjaGlsZERyYWdPcmRlclxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnT3JkZXIgPCBjaGlsZERyYWdPcmRlcilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGVsZW1lbnQsIGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFmb3VuZClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhdHRhY2hlcyBhbiBIVE1MIGVsZW1lbnQgdG8gdGhlIHNvcnRhYmxlOyBjYW4gYWxzbyBiZSB1c2VkIHRvIHN3YXAgYmV0d2VlbiBzb3J0YWJsZXNcclxuICAgICAqIE5PVEU6IHlvdSBuZWVkIHRvIG1hbnVhbGx5IGluc2VydCB0aGUgZWxlbWVudCBpbnRvIHRoaXMuZWxlbWVudCAodGhpcyBpcyB1c2VmdWwgd2hlbiB5b3UgaGF2ZSBhIGRlZXAgc3RydWN0dXJlKVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICovXHJcbiAgICBhdHRhY2hFbGVtZW50KGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9IHRoaXNcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlID0ge1xyXG4gICAgICAgICAgICAgICAgc29ydGFibGU6IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBvcmlnaW5hbDogdGhpc1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBhZGQgYSBjb3VudGVyIGZvciBtYXhpbXVtXHJcbiAgICAgICAgICAgIHRoaXMuX21heGltdW1Db3VudGVyKGVsZW1lbnQsIHRoaXMpXHJcblxyXG4gICAgICAgICAgICAvLyBlbnN1cmUgZXZlcnkgZWxlbWVudCBoYXMgYW4gaWRcclxuICAgICAgICAgICAgaWYgKCFlbGVtZW50LmlkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmlkID0gJ19fc29ydGFibGUtJyArIHRoaXMub3B0aW9ucy5uYW1lICsgJy0nICsgU29ydGFibGUudHJhY2tlclt0aGlzLm9wdGlvbnMubmFtZV0uY291bnRlclxyXG4gICAgICAgICAgICAgICAgU29ydGFibGUudHJhY2tlclt0aGlzLm9wdGlvbnMubmFtZV0uY291bnRlcisrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jb3B5KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuY29weSA9IDBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdzdGFydCcsIHRoaXMuZXZlbnRzLmRyYWdTdGFydClcclxuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdkcmFnZW5kJywgdGhpcy5ldmVudHMuZHJhZ0VuZClcclxuICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RyYWdnYWJsZScsIHRydWUpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVtb3ZlcyBhbGwgZXZlbnRzIGZyb20gYW4gSFRNTCBlbGVtZW50XHJcbiAgICAgKiBOT1RFOiBkb2VzIG5vdCByZW1vdmUgdGhlIGVsZW1lbnQgZnJvbSBpdHMgcGFyZW50XHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKi9cclxuICAgIHJlbW92ZUVsZW1lbnQoZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RyYWdzdGFydCcsIHRoaXMuZXZlbnRzLmRyYWdTdGFydClcclxuICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RyYWdlbmQnLCB0aGlzLmV2ZW50cy5kcmFnRW5kKVxyXG4gICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdkcmFnZ2FibGUnLCBmYWxzZSlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFkZCBzb3J0YWJsZSB0byBnbG9iYWwgbGlzdCB0aGF0IHRyYWNrcyBhbGwgc29ydGFibGVzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfYWRkVG9HbG9iYWxUcmFja2VyKClcclxuICAgIHtcclxuICAgICAgICBpZiAoIVNvcnRhYmxlLnRyYWNrZXIgfHwgIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzb3J0YWJsZS1kcmFnSW1hZ2UnKSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFNvcnRhYmxlLmRyYWdJbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgICAgICAgIFNvcnRhYmxlLmRyYWdJbWFnZS5zdHlsZS5iYWNrZ3JvdW5kID0gJ3RyYW5zcGFyZW50J1xyXG4gICAgICAgICAgICBTb3J0YWJsZS5kcmFnSW1hZ2Uuc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnXHJcbiAgICAgICAgICAgIFNvcnRhYmxlLmRyYWdJbWFnZS5zdHlsZS5sZWZ0ID0gLTEwXHJcbiAgICAgICAgICAgIFNvcnRhYmxlLmRyYWdJbWFnZS5zdHlsZS50b3AgPSAtMTBcclxuICAgICAgICAgICAgU29ydGFibGUuZHJhZ0ltYWdlLnN0eWxlLndpZHRoID0gU29ydGFibGUuZHJhZ0ltYWdlLnN0eWxlLmhlaWdodCA9ICc1cHgnXHJcbiAgICAgICAgICAgIFNvcnRhYmxlLmRyYWdJbWFnZS5zdHlsZS56SW5kZXggPSAtMVxyXG4gICAgICAgICAgICBTb3J0YWJsZS5kcmFnSW1hZ2UuaWQgPSAnc29ydGFibGUtZHJhZ0ltYWdlJ1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKFNvcnRhYmxlLmRyYWdJbWFnZSlcclxuICAgICAgICAgICAgU29ydGFibGUudHJhY2tlciA9IHt9XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCAoZSkgPT4gdGhpcy5fYm9keURyYWdPdmVyKGUpKVxyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCAoZSkgPT4gdGhpcy5fYm9keURyb3AoZSkpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChTb3J0YWJsZS50cmFja2VyW3RoaXMub3B0aW9ucy5uYW1lXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFNvcnRhYmxlLnRyYWNrZXJbdGhpcy5vcHRpb25zLm5hbWVdLmxpc3QucHVzaCh0aGlzKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBTb3J0YWJsZS50cmFja2VyW3RoaXMub3B0aW9ucy5uYW1lXSA9IHsgbGlzdDogW3RoaXNdLCBjb3VudGVyOiAwIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBkZWZhdWx0IGRyYWcgb3ZlciBmb3IgdGhlIGJvZHlcclxuICAgICAqIEBwYXJhbSB7RHJhZ0V2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfYm9keURyYWdPdmVyKGUpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzBdXHJcbiAgICAgICAgaWYgKFNvcnRhYmxlLnRyYWNrZXJbbmFtZV0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzFdXHJcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZClcclxuICAgICAgICAgICAgY29uc3Qgc29ydGFibGUgPSB0aGlzLl9maW5kQ2xvc2VzdChlLCBTb3J0YWJsZS50cmFja2VyW25hbWVdLmxpc3QsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNvcnRhYmxlLmxhc3QgJiYgTWF0aC5hYnMoc29ydGFibGUubGFzdC54IC0gZS5wYWdlWCkgPCBzb3J0YWJsZS5vcHRpb25zLnRocmVzaG9sZCAmJiBNYXRoLmFicyhzb3J0YWJsZS5sYXN0LnkgLSBlLnBhZ2VZKSA8IHNvcnRhYmxlLm9wdGlvbnMudGhyZXNob2xkKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc29ydGFibGUuX3VwZGF0ZURyYWdnaW5nKGUsIGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZS5sYXN0ID0geyB4OiBlLnBhZ2VYLCB5OiBlLnBhZ2VZIH1cclxuICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZS5fcGxhY2VJbkxpc3Qoc29ydGFibGUsIGUucGFnZVgsIGUucGFnZVksIGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgZS5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9ICdtb3ZlJ1xyXG4gICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlLl91cGRhdGVEcmFnZ2luZyhlLCBlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX25vRHJvcChlKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgbm8gZHJvcFxyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBlXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtjYW5jZWxdIGZvcmNlIGNhbmNlbCAoZm9yIG9wdGlvbnMuY29weSlcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9ub0Ryb3AoZSwgY2FuY2VsKVxyXG4gICAge1xyXG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSAnbW92ZSdcclxuICAgICAgICBjb25zdCBpZCA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzFdXHJcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxyXG4gICAgICAgIGlmIChlbGVtZW50KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fdXBkYXRlRHJhZ2dpbmcoZSwgZWxlbWVudClcclxuICAgICAgICAgICAgdGhpcy5fc2V0SWNvbihlbGVtZW50LCBudWxsLCBjYW5jZWwpXHJcbiAgICAgICAgICAgIGlmICghY2FuY2VsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsLm9wdGlvbnMub2ZmTGlzdCA9PT0gJ2RlbGV0ZScpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5ID0gZWxlbWVudC5zdHlsZS5kaXNwbGF5IHx8ICd1bnNldCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbC5lbWl0KCdkZWxldGUtcGVuZGluZycsIGVsZW1lbnQsIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbClcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmICghZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsLm9wdGlvbnMuY29weSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZXBsYWNlSW5MaXN0KGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCwgZWxlbWVudClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2NsZWFyTWF4aW11bVBlbmRpbmcoZWxlbWVudC5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuY3VycmVudC5lbWl0KCdhZGQtcmVtb3ZlLXBlbmRpbmcnLCBlbGVtZW50LCBlbGVtZW50Ll9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5jdXJyZW50LmVtaXQoJ3VwZGF0ZS1wZW5kaW5nJywgZWxlbWVudCwgZWxlbWVudC5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuY3VycmVudCA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGRlZmF1bHQgZHJvcCBmb3IgdGhlIGJvZHlcclxuICAgICAqIEBwYXJhbSB7RHJhZ0V2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfYm9keURyb3AoZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBuYW1lID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMF1cclxuICAgICAgICBpZiAoU29ydGFibGUudHJhY2tlcltuYW1lXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMV1cclxuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxyXG4gICAgICAgICAgICBjb25zdCBzb3J0YWJsZSA9IHRoaXMuX2ZpbmRDbG9zZXN0KGUsIFNvcnRhYmxlLnRyYWNrZXJbbmFtZV0ubGlzdCwgZWxlbWVudClcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlbW92ZURyYWdnaW5nKGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmUoKVxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLmRpc3BsYXkgPSBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsLmVtaXQoJ2RlbGV0ZScsIGVsZW1lbnQsIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbClcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwuZW1pdCgndXBkYXRlJywgZWxlbWVudCwgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsKVxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9IG51bGxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGVuZCBkcmFnXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kcmFnRW5kKGUpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGUuY3VycmVudFRhcmdldFxyXG4gICAgICAgIGNvbnN0IGRyYWdnaW5nID0gZWxlbWVudC5fX3NvcnRhYmxlLmRyYWdnaW5nXHJcbiAgICAgICAgaWYgKGRyYWdnaW5nKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZHJhZ2dpbmcucmVtb3ZlKClcclxuICAgICAgICAgICAgaWYgKGRyYWdnaW5nLmljb24pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGRyYWdnaW5nLmljb24ucmVtb3ZlKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuZHJhZ2dpbmcgPSBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY3Vyc29ySG92ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB1dGlscy5zdHlsZShlLmN1cnJlbnRUYXJnZXQsICdjdXJzb3InLCB0aGlzLm9wdGlvbnMuY3Vyc29ySG92ZXIpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc3RhcnQgZHJhZ1xyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZHJhZ1N0YXJ0KGUpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3Qgc29ydGFibGUgPSBlLmN1cnJlbnRUYXJnZXQuX19zb3J0YWJsZS5vcmlnaW5hbFxyXG4gICAgICAgIGNvbnN0IGRyYWdnaW5nID0gZS5jdXJyZW50VGFyZ2V0LmNsb25lTm9kZSh0cnVlKVxyXG4gICAgICAgIGZvciAobGV0IHN0eWxlIGluIHNvcnRhYmxlLm9wdGlvbnMuZHJhZ1N0eWxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZHJhZ2dpbmcuc3R5bGVbc3R5bGVdID0gc29ydGFibGUub3B0aW9ucy5kcmFnU3R5bGVbc3R5bGVdXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHBvcyA9IHV0aWxzLnRvR2xvYmFsKGUuY3VycmVudFRhcmdldClcclxuICAgICAgICBkcmFnZ2luZy5zdHlsZS5sZWZ0ID0gcG9zLnggKyAncHgnXHJcbiAgICAgICAgZHJhZ2dpbmcuc3R5bGUudG9wID0gcG9zLnkgKyAncHgnXHJcbiAgICAgICAgY29uc3Qgb2Zmc2V0ID0geyB4OiBwb3MueCAtIGUucGFnZVgsIHk6IHBvcy55IC0gZS5wYWdlWSB9XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkcmFnZ2luZylcclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy51c2VJY29ucylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGltYWdlID0gbmV3IEltYWdlKClcclxuICAgICAgICAgICAgaW1hZ2Uuc3JjID0gc29ydGFibGUub3B0aW9ucy5pY29ucy5yZW9yZGVyXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xyXG4gICAgICAgICAgICBpbWFnZS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKC01MCUsIC01MCUpJ1xyXG4gICAgICAgICAgICBpbWFnZS5zdHlsZS5sZWZ0ID0gZHJhZ2dpbmcub2Zmc2V0TGVmdCArIGRyYWdnaW5nLm9mZnNldFdpZHRoICsgJ3B4J1xyXG4gICAgICAgICAgICBpbWFnZS5zdHlsZS50b3AgPSBkcmFnZ2luZy5vZmZzZXRUb3AgKyBkcmFnZ2luZy5vZmZzZXRIZWlnaHQgKyAncHgnXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaW1hZ2UpXHJcbiAgICAgICAgICAgIGRyYWdnaW5nLmljb24gPSBpbWFnZVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHV0aWxzLnN0eWxlKGUuY3VycmVudFRhcmdldCwgJ2N1cnNvcicsIHNvcnRhYmxlLm9wdGlvbnMuY3Vyc29ySG92ZXIpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB0YXJnZXQgPSBlLmN1cnJlbnRUYXJnZXRcclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5jb3B5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGFyZ2V0ID0gZS5jdXJyZW50VGFyZ2V0LmNsb25lTm9kZSh0cnVlKVxyXG4gICAgICAgICAgICB0YXJnZXQuaWQgPSBlLmN1cnJlbnRUYXJnZXQuaWQgKyAnLWNvcHktJyArIGUuY3VycmVudFRhcmdldC5fX3NvcnRhYmxlLmNvcHlcclxuICAgICAgICAgICAgZS5jdXJyZW50VGFyZ2V0Ll9fc29ydGFibGUuY29weSsrXHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmF0dGFjaEVsZW1lbnQodGFyZ2V0KVxyXG4gICAgICAgICAgICB0YXJnZXQuX19zb3J0YWJsZS5pc0NvcHkgPSB0cnVlXHJcbiAgICAgICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLm9yaWdpbmFsID0gdGhpc1xyXG4gICAgICAgICAgICB0YXJnZXQuX19zb3J0YWJsZS5kaXNwbGF5ID0gdGFyZ2V0LnN0eWxlLmRpc3BsYXkgfHwgJ3Vuc2V0J1xyXG4gICAgICAgICAgICB0YXJnZXQuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRhcmdldClcclxuICAgICAgICB9XHJcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuY2xlYXJEYXRhKClcclxuICAgICAgICBlLmRhdGFUcmFuc2Zlci5zZXREYXRhKHNvcnRhYmxlLm9wdGlvbnMubmFtZSwgc29ydGFibGUub3B0aW9ucy5uYW1lKVxyXG4gICAgICAgIGUuZGF0YVRyYW5zZmVyLnNldERhdGEodGFyZ2V0LmlkLCB0YXJnZXQuaWQpXHJcbiAgICAgICAgZS5kYXRhVHJhbnNmZXIuc2V0RHJhZ0ltYWdlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzb3J0YWJsZS1kcmFnSW1hZ2UnKSwgMCwgMClcclxuICAgICAgICB0YXJnZXQuX19zb3J0YWJsZS5jdXJyZW50ID0gdGhpc1xyXG4gICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLmluZGV4ID0gc29ydGFibGUub3B0aW9ucy5jb3B5ID8gLTEgOiBzb3J0YWJsZS5fZ2V0SW5kZXgodGFyZ2V0KVxyXG4gICAgICAgIHRhcmdldC5fX3NvcnRhYmxlLmRyYWdnaW5nID0gZHJhZ2dpbmdcclxuICAgICAgICB0YXJnZXQuX19zb3J0YWJsZS5vZmZzZXQgPSBvZmZzZXRcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSBkcmFnIGxlYXZlIGV2ZW50cyBmb3Igc29ydGFibGUgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtEcmFnRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kcmFnTGVhdmUoZSlcclxuICAgIHtcclxuICAgICAgICAvLyBjb25zdCBpZCA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzFdXHJcbiAgICAgICAgLy8gaWYgKGlkKVxyXG4gICAgICAgIC8vIHtcclxuICAgICAgICAvLyAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxyXG4gICAgICAgIC8vICAgICBpZiAoZWxlbWVudClcclxuICAgICAgICAvLyAgICAge1xyXG4gICAgICAgIC8vICAgICAgICAgY29uc3Qgc29ydGFibGUgPSBlbGVtZW50Ll9fc29ydGFibGUuY3VycmVudFxyXG4gICAgICAgIC8vICAgICAgICAgc29ydGFibGUuX21heGltdW1QZW5kaW5nKGVsZW1lbnQsIHNvcnRhYmxlKVxyXG4gICAgICAgIC8vICAgICB9XHJcbiAgICAgICAgLy8gfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIGRyYWcgb3ZlciBldmVudHMgZm9yIHNvcnRhYmxlIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7RHJhZ0V2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZHJhZ092ZXIoZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBzb3J0YWJsZSA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzBdXHJcbiAgICAgICAgaWYgKHNvcnRhYmxlICYmIHNvcnRhYmxlID09PSB0aGlzLm9wdGlvbnMubmFtZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gZS5kYXRhVHJhbnNmZXIudHlwZXNbMV1cclxuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKVxyXG4gICAgICAgICAgICBpZiAodGhpcy5sYXN0ICYmIE1hdGguYWJzKHRoaXMubGFzdC54IC0gZS5wYWdlWCkgPCB0aGlzLm9wdGlvbnMudGhyZXNob2xkICYmIE1hdGguYWJzKHRoaXMubGFzdC55IC0gZS5wYWdlWSkgPCB0aGlzLm9wdGlvbnMudGhyZXNob2xkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVEcmFnZ2luZyhlLCBlbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmxhc3QgPSB7IHg6IGUucGFnZVgsIHk6IGUucGFnZVkgfVxyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLmlzQ29weSAmJiBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwgPT09IHRoaXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX25vRHJvcChlLCB0cnVlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMub3B0aW9ucy5kcm9wIHx8IGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9PT0gdGhpcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcGxhY2VJbkxpc3QodGhpcywgZS5wYWdlWCwgZS5wYWdlWSwgZWxlbWVudClcclxuICAgICAgICAgICAgICAgIGUuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSBlbGVtZW50Ll9fc29ydGFibGUuaXNDb3B5ID8gJ2NvcHknIDogJ21vdmUnXHJcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVEcmFnZ2luZyhlLCBlbGVtZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbm9Ecm9wKGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB1cGRhdGUgdGhlIGRyYWdnaW5nIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7VUlFdmVudH0gZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3VwZGF0ZURyYWdnaW5nKGUsIGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgZHJhZ2dpbmcgPSBlbGVtZW50Ll9fc29ydGFibGUuZHJhZ2dpbmdcclxuICAgICAgICBjb25zdCBvZmZzZXQgPSBlbGVtZW50Ll9fc29ydGFibGUub2Zmc2V0XHJcbiAgICAgICAgaWYgKGRyYWdnaW5nKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZHJhZ2dpbmcuc3R5bGUubGVmdCA9IGUucGFnZVggKyBvZmZzZXQueCArICdweCdcclxuICAgICAgICAgICAgZHJhZ2dpbmcuc3R5bGUudG9wID0gZS5wYWdlWSArIG9mZnNldC55ICsgJ3B4J1xyXG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcuaWNvbilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zdHlsZS5sZWZ0ID0gZHJhZ2dpbmcub2Zmc2V0TGVmdCArIGRyYWdnaW5nLm9mZnNldFdpZHRoICsgJ3B4J1xyXG4gICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zdHlsZS50b3AgPSBkcmFnZ2luZy5vZmZzZXRUb3AgKyBkcmFnZ2luZy5vZmZzZXRIZWlnaHQgKyAncHgnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZW1vdmUgdGhlIGRyYWdnaW5nIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9yZW1vdmVEcmFnZ2luZyhlbGVtZW50KVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGRyYWdnaW5nID0gZWxlbWVudC5fX3NvcnRhYmxlLmRyYWdnaW5nXHJcbiAgICAgICAgaWYgKGRyYWdnaW5nKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZHJhZ2dpbmcucmVtb3ZlKClcclxuICAgICAgICAgICAgaWYgKGRyYWdnaW5nLmljb24pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGRyYWdnaW5nLmljb24ucmVtb3ZlKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuZHJhZ2dpbmcgPSBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5pc0NvcHkgPSBmYWxzZVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZHJvcCB0aGUgZWxlbWVudCBpbnRvIGEgc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kcm9wKGUpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzBdXHJcbiAgICAgICAgaWYgKFNvcnRhYmxlLnRyYWNrZXJbbmFtZV0gJiYgbmFtZSA9PT0gdGhpcy5vcHRpb25zLm5hbWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IGUuZGF0YVRyYW5zZmVyLnR5cGVzWzFdXHJcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZClcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsICE9PSB0aGlzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbC5lbWl0KCdyZW1vdmUnLCBlbGVtZW50LCBlbGVtZW50Ll9fc29ydGFibGUub3JpZ2luYWwpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdhZGQnLCBlbGVtZW50LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9IHRoaXNcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNvcnQpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ29yZGVyJywgZWxlbWVudCwgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5pc0NvcHkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2NvcHknLCBlbGVtZW50LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9tYXhpbXVtKGVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCd1cGRhdGUnLCBlbGVtZW50LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUuaW5kZXggIT09IHRoaXMuX2dldEluZGV4KGUuY3VycmVudFRhcmdldCkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ29yZGVyJywgZWxlbWVudCwgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCd1cGRhdGUnLCBlbGVtZW50LCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl9yZW1vdmVEcmFnZ2luZyhlbGVtZW50KVxyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGZpbmQgY2xvc2VzdCBTb3J0YWJsZSB0byBzY3JlZW4gbG9jYXRpb25cclxuICAgICAqIEBwYXJhbSB7VUlFdmVudH0gZVxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZVtdfSBsaXN0IG9mIHJlbGF0ZWQgU29ydGFibGVzXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZmluZENsb3Nlc3QoZSwgbGlzdCwgZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBsZXQgbWluID0gSW5maW5pdHksIGZvdW5kXHJcbiAgICAgICAgZm9yIChsZXQgcmVsYXRlZCBvZiBsaXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCghcmVsYXRlZC5vcHRpb25zLmRyb3AgJiYgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsICE9PSByZWxhdGVkKSB8fFxyXG4gICAgICAgICAgICAgICAgKGVsZW1lbnQuX19zb3J0YWJsZS5pc0NvcHkgJiYgZWxlbWVudC5fX3NvcnRhYmxlLm9yaWdpbmFsID09PSByZWxhdGVkKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29udGludWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodXRpbHMuaW5zaWRlKGUucGFnZVgsIGUucGFnZVksIHJlbGF0ZWQuZWxlbWVudCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZWxhdGVkXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAocmVsYXRlZC5vcHRpb25zLm9mZkxpc3QgPT09ICdjbG9zZXN0JylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2FsY3VsYXRlID0gdXRpbHMuZGlzdGFuY2VUb0Nsb3Nlc3RDb3JuZXIoZS5wYWdlWCwgZS5wYWdlWSwgcmVsYXRlZC5lbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgaWYgKGNhbGN1bGF0ZSA8IG1pbilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtaW4gPSBjYWxjdWxhdGVcclxuICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHJlbGF0ZWRcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZm91bmRcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBsYWNlIGluZGljYXRvciBpbiB0aGUgc29ydGFibGUgbGlzdCBhY2NvcmRpbmcgdG8gb3B0aW9ucy5zb3J0XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGxhY2VJbkxpc3Qoc29ydGFibGUsIHgsIHksIGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zb3J0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fcGxhY2VJblNvcnRhYmxlTGlzdChzb3J0YWJsZSwgeCwgeSwgZWxlbWVudClcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fcGxhY2VJbk9yZGVyZWRMaXN0KHNvcnRhYmxlLCBlbGVtZW50KVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9zZXRJY29uKGVsZW1lbnQsIHNvcnRhYmxlKVxyXG4gICAgICAgIGlmIChlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IGVsZW1lbnQuX19zb3J0YWJsZS5kaXNwbGF5ID09PSAndW5zZXQnID8gJycgOiBlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheVxyXG4gICAgICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUuZGlzcGxheSA9IG51bGxcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZXBsYWNlIGl0ZW0gaW4gbGlzdCBhdCBvcmlnaW5hbCBpbmRleCBwb3NpdGlvblxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3JlcGxhY2VJbkxpc3Qoc29ydGFibGUsIGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IGVsZW1lbnQuX19zb3J0YWJsZS5pbmRleFxyXG4gICAgICAgICAgICBpZiAoaW5kZXggPCBjaGlsZHJlbi5sZW5ndGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkcmVuW2luZGV4XS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShlbGVtZW50LCBjaGlsZHJlbltpbmRleF0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlblswXS5hcHBlbmRDaGlsZChlbGVtZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZWxlbWVudClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjb3VudCB0aGUgaW5kZXggb2YgdGhlIGNoaWxkIGluIHRoZSBsaXN0IG9mIGNoaWxkcmVuXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBjaGlsZFxyXG4gICAgICogQHJldHVybiB7bnVtYmVyfVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2dldEluZGV4KGNoaWxkKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5fZ2V0Q2hpbGRyZW4oKVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoY2hpbGRyZW5baV0gPT09IGNoaWxkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdHJhdmVyc2UgYW5kIHNlYXJjaCBkZXNjZW5kZW50cyBpbiBET01cclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGJhc2VcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzZWFyY2hcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnRbXX0gcmVzdWx0cyB0byByZXR1cm5cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF90cmF2ZXJzZUNoaWxkcmVuKGJhc2UsIHNlYXJjaCwgcmVzdWx0cylcclxuICAgIHtcclxuICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBiYXNlLmNoaWxkcmVuKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHNlYXJjaC5sZW5ndGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzZWFyY2guaW5kZXhPZihjaGlsZC5jbGFzc05hbWUpICE9PSAtMSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goY2hpbGQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goY2hpbGQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fdHJhdmVyc2VDaGlsZHJlbihjaGlsZCwgc2VhcmNoLCByZXN1bHRzKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGZpbmQgY2hpbGRyZW4gaW4gZGl2XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3JkZXJdIHNlYXJjaCBmb3IgZHJhZ09yZGVyIGFzIHdlbGxcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9nZXRDaGlsZHJlbihvcmRlcilcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBTZWFyY2gpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgc2VhcmNoID0gW11cclxuICAgICAgICAgICAgaWYgKG9yZGVyICYmIHRoaXMub3B0aW9ucy5vcmRlckNsYXNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2gucHVzaCh0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKG9yZGVyICYmIHRoaXMub3B0aW9ucy5vcmRlckNsYXNzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaC5wdXNoKHRoaXMub3B0aW9ucy5vcmRlckNsYXNzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKCFvcmRlciAmJiB0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzZWFyY2gucHVzaCh0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXVxyXG4gICAgICAgICAgICB0aGlzLl90cmF2ZXJzZUNoaWxkcmVuKHRoaXMuZWxlbWVudCwgc2VhcmNoLCByZXN1bHRzKVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0c1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGV0IGxpc3QgPSBbXVxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5lbGVtZW50LmNoaWxkcmVuKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh1dGlscy5jb250YWluc0NsYXNzTmFtZShjaGlsZCwgdGhpcy5vcHRpb25zLmRyYWdDbGFzcykgfHwgKG9yZGVyICYmICF0aGlzLm9wdGlvbnMub3JkZXJDbGFzcyB8fCAob3JkZXIgJiYgdGhpcy5vcHRpb25zLm9yZGVyQ2xhc3MgJiYgdXRpbHMuY29udGFpbnNDbGFzc05hbWUoY2hpbGQsIHRoaXMub3B0aW9ucy5vcmRlckNsYXNzKSkpKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGlzdC5wdXNoKGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBsaXN0XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBsaXN0ID0gW11cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIHRoaXMuZWxlbWVudC5jaGlsZHJlbilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsaXN0LnB1c2goY2hpbGQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbGlzdFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGxhY2UgaW5kaWNhdG9yIGluIGFuIG9yZGVyZWQgbGlzdFxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGxhY2VJbk9yZGVyZWRMaXN0KHNvcnRhYmxlLCBkcmFnZ2luZylcclxuICAgIHtcclxuICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50ICE9PSBzb3J0YWJsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gc29ydGFibGUub3B0aW9ucy5vcmRlcklkXHJcbiAgICAgICAgICAgIGxldCBkcmFnT3JkZXIgPSBkcmFnZ2luZy5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgICAgIGRyYWdPcmRlciA9IHNvcnRhYmxlLm9wdGlvbnMub3JkZXJJZElzTnVtYmVyID8gcGFyc2VGbG9hdChkcmFnT3JkZXIpIDogZHJhZ09yZGVyXHJcbiAgICAgICAgICAgIGxldCBmb3VuZFxyXG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHNvcnRhYmxlLl9nZXRDaGlsZHJlbih0cnVlKVxyXG4gICAgICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5yZXZlcnNlT3JkZXIpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSBjaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZCA9IGNoaWxkcmVuW2ldXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkRHJhZ09yZGVyID0gY2hpbGQuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkRHJhZ09yZGVyID0gc29ydGFibGUub3B0aW9ucy5vcmRlcklzTnVtYmVyID8gcGFyc2VGbG9hdChjaGlsZERyYWdPcmRlcikgOiBjaGlsZERyYWdPcmRlclxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnT3JkZXIgPiBjaGlsZERyYWdPcmRlcilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGRyYWdnaW5nLCBjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgY2hpbGRyZW4pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkRHJhZ09yZGVyID0gY2hpbGQuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkRHJhZ09yZGVyID0gc29ydGFibGUub3B0aW9ucy5vcmRlcklzTnVtYmVyID8gcGFyc2VGbG9hdChjaGlsZERyYWdPcmRlcikgOiBjaGlsZERyYWdPcmRlclxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnT3JkZXIgPCBjaGlsZERyYWdPcmRlcilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGRyYWdnaW5nLCBjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghZm91bmQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZHJhZ2dpbmcpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudCAhPT0gZHJhZ2dpbmcuX19zb3J0YWJsZS5vcmlnaW5hbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQuZW1pdCgnYWRkLXJlbW92ZS1wZW5kaW5nJywgZHJhZ2dpbmcsIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQuZW1pdCgncmVtb3ZlLXBlbmRpbmcnLCBkcmFnZ2luZywgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fY2xlYXJNYXhpbXVtUGVuZGluZyhkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9tYXhpbXVtKG51bGwsIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdhZGQtcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuaXNDb3B5KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdjb3B5LXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50ID0gc29ydGFibGVcclxuICAgICAgICAgICAgdGhpcy5fbWF4aW11bVBlbmRpbmcoZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCd1cGRhdGUtcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzZWFyY2ggZm9yIHdoZXJlIHRvIHBsYWNlIHVzaW5nIHBlcmNlbnRhZ2VcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHJldHVybnMge251bWJlcn0gMCA9IG5vdCBmb3VuZDsgMSA9IG5vdGhpbmcgdG8gZG87IDIgPSBtb3ZlZFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BsYWNlQnlQZXJjZW50YWdlKHNvcnRhYmxlLCBkcmFnZ2luZylcclxuICAgIHtcclxuICAgICAgICBjb25zdCBjdXJzb3IgPSBkcmFnZ2luZy5fX3NvcnRhYmxlLmRyYWdnaW5nXHJcbiAgICAgICAgY29uc3QgeGExID0gY3Vyc29yLm9mZnNldExlZnRcclxuICAgICAgICBjb25zdCB5YTEgPSBjdXJzb3Iub2Zmc2V0VG9wXHJcbiAgICAgICAgY29uc3QgeGEyID0gY3Vyc29yLm9mZnNldExlZnQgKyBjdXJzb3Iub2Zmc2V0V2lkdGhcclxuICAgICAgICBjb25zdCB5YTIgPSBjdXJzb3Iub2Zmc2V0VG9wICsgY3Vyc29yLm9mZnNldEhlaWdodFxyXG4gICAgICAgIGxldCBsYXJnZXN0ID0gMCwgY2xvc2VzdCwgaXNCZWZvcmUsIGluZGljYXRvclxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBzb3J0YWJsZS5lbGVtZW50XHJcbiAgICAgICAgY29uc3QgZWxlbWVudHMgPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4odHJ1ZSlcclxuICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBlbGVtZW50cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChjaGlsZCA9PT0gZHJhZ2dpbmcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGluZGljYXRvciA9IHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBwb3MgPSB1dGlscy50b0dsb2JhbChjaGlsZClcclxuICAgICAgICAgICAgY29uc3QgeGIxID0gcG9zLnhcclxuICAgICAgICAgICAgY29uc3QgeWIxID0gcG9zLnlcclxuICAgICAgICAgICAgY29uc3QgeGIyID0gcG9zLnggKyBjaGlsZC5vZmZzZXRXaWR0aFxyXG4gICAgICAgICAgICBjb25zdCB5YjIgPSBwb3MueSArIGNoaWxkLm9mZnNldEhlaWdodFxyXG4gICAgICAgICAgICBjb25zdCBwZXJjZW50YWdlID0gdXRpbHMucGVyY2VudGFnZSh4YTEsIHlhMSwgeGEyLCB5YTIsIHhiMSwgeWIxLCB4YjIsIHliMilcclxuICAgICAgICAgICAgaWYgKHBlcmNlbnRhZ2UgPiBsYXJnZXN0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsYXJnZXN0ID0gcGVyY2VudGFnZVxyXG4gICAgICAgICAgICAgICAgY2xvc2VzdCA9IGNoaWxkXHJcbiAgICAgICAgICAgICAgICBpc0JlZm9yZSA9IGluZGljYXRvclxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjbG9zZXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGNsb3Nlc3QgPT09IGRyYWdnaW5nKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpc0JlZm9yZSAmJiBjbG9zZXN0Lm5leHRTaWJsaW5nKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Lmluc2VydEJlZm9yZShkcmFnZ2luZywgY2xvc2VzdC5uZXh0U2libGluZylcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ29yZGVyLXBlbmRpbmcnLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKGRyYWdnaW5nLCBjbG9zZXN0KVxyXG4gICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnb3JkZXItcGVuZGluZycsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAyXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiAwXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2VhcmNoIGZvciB3aGVyZSB0byBwbGFjZSB1c2luZyBkaXN0YW5jZVxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlcclxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IGZhbHNlPW5vdGhpbmcgdG8gZG9cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9wbGFjZUJ5RGlzdGFuY2Uoc29ydGFibGUsIGRyYWdnaW5nLCB4LCB5KVxyXG4gICAge1xyXG4gICAgICAgIGlmICh1dGlscy5pbnNpZGUoeCwgeSwgZHJhZ2dpbmcpKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGluZGV4ID0gLTFcclxuICAgICAgICBpZiAoZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50ID09PSBzb3J0YWJsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGluZGV4ID0gc29ydGFibGUuX2dldEluZGV4KGRyYWdnaW5nKVxyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbGVtZW50LmFwcGVuZENoaWxkKGRyYWdnaW5nKVxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgZGlzdGFuY2UgPSBJbmZpbml0eSwgY2xvc2VzdFxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBzb3J0YWJsZS5lbGVtZW50XHJcbiAgICAgICAgY29uc3QgZWxlbWVudHMgPSBzb3J0YWJsZS5fZ2V0Q2hpbGRyZW4odHJ1ZSlcclxuICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBlbGVtZW50cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh1dGlscy5pbnNpZGUoeCwgeSwgY2hpbGQpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjbG9zZXN0ID0gY2hpbGRcclxuICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBtZWFzdXJlID0gdXRpbHMuZGlzdGFuY2VUb0Nsb3Nlc3RDb3JuZXIoeCwgeSwgY2hpbGQpXHJcbiAgICAgICAgICAgICAgICBpZiAobWVhc3VyZSA8IGRpc3RhbmNlKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsb3Nlc3QgPSBjaGlsZFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc3RhbmNlID0gbWVhc3VyZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKGRyYWdnaW5nLCBjbG9zZXN0KVxyXG4gICAgICAgIGlmIChpbmRleCA9PT0gc29ydGFibGUuX2dldEluZGV4KGRyYWdnaW5nKSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX21heGltdW1QZW5kaW5nKGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICBzb3J0YWJsZS5lbWl0KCdvcmRlci1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGxhY2UgaW5kaWNhdG9yIGluIGFuIHNvcnRhYmxlIGxpc3RcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmdcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9wbGFjZUluU29ydGFibGVMaXN0KHNvcnRhYmxlLCB4LCB5LCBkcmFnZ2luZylcclxuICAgIHtcclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gc29ydGFibGUuZWxlbWVudFxyXG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gc29ydGFibGUuX2dldENoaWxkcmVuKClcclxuICAgICAgICBpZiAoIWNoaWxkcmVuLmxlbmd0aClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoZHJhZ2dpbmcpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIGNvbnN0IHBlcmNlbnRhZ2UgPSB0aGlzLl9wbGFjZUJ5UGVyY2VudGFnZShzb3J0YWJsZSwgZHJhZ2dpbmcpXHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9wbGFjZUJ5RGlzdGFuY2Uoc29ydGFibGUsIGRyYWdnaW5nLCB4LCB5KSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudCAhPT0gc29ydGFibGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdhZGQtcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuaXNDb3B5KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdjb3B5LXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudCAhPT0gZHJhZ2dpbmcuX19zb3J0YWJsZS5vcmlnaW5hbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQuZW1pdCgnYWRkLXJlbW92ZS1wZW5kaW5nJywgZHJhZ2dpbmcsIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQuZW1pdCgncmVtb3ZlLXBlbmRpbmcnLCBkcmFnZ2luZywgZHJhZ2dpbmcuX19zb3J0YWJsZS5jdXJyZW50KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fY2xlYXJNYXhpbXVtUGVuZGluZyhkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQpXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9tYXhpbXVtKG51bGwsIGRyYWdnaW5nLl9fc29ydGFibGUuY3VycmVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkcmFnZ2luZy5fX3NvcnRhYmxlLmN1cnJlbnQgPSBzb3J0YWJsZVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9tYXhpbXVtUGVuZGluZyhkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgc29ydGFibGUuZW1pdCgndXBkYXRlLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzZXQgaWNvbiBpZiBhdmFpbGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbY2FuY2VsXSBmb3JjZSBjYW5jZWwgKGZvciBvcHRpb25zLmNvcHkpXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfc2V0SWNvbihlbGVtZW50LCBzb3J0YWJsZSwgY2FuY2VsKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGRyYWdnaW5nID0gZWxlbWVudC5fX3NvcnRhYmxlLmRyYWdnaW5nXHJcbiAgICAgICAgaWYgKGRyYWdnaW5nICYmIGRyYWdnaW5nLmljb24pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoIXNvcnRhYmxlKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZSA9IGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbFxyXG4gICAgICAgICAgICAgICAgaWYgKGNhbmNlbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnNyYyA9IHNvcnRhYmxlLm9wdGlvbnMuaWNvbnMuY2FuY2VsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zcmMgPSBzb3J0YWJsZS5vcHRpb25zLm9mZkxpc3QgPT09ICdkZWxldGUnID8gc29ydGFibGUub3B0aW9ucy5pY29ucy5kZWxldGUgOiBzb3J0YWJsZS5vcHRpb25zLmljb25zLmNhbmNlbFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuX19zb3J0YWJsZS5pc0NvcHkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zcmMgPSBzb3J0YWJsZS5vcHRpb25zLmljb25zLmNvcHlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2luZy5pY29uLnNyYyA9IGVsZW1lbnQuX19zb3J0YWJsZS5vcmlnaW5hbCA9PT0gc29ydGFibGUgPyBzb3J0YWJsZS5vcHRpb25zLmljb25zLnJlb3JkZXIgOiBzb3J0YWJsZS5vcHRpb25zLmljb25zLm1vdmVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFkZCBhIG1heGltdW0gY291bnRlciB0byB0aGUgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9tYXhpbXVtQ291bnRlcihlbGVtZW50LCBzb3J0YWJsZSlcclxuICAgIHtcclxuICAgICAgICBsZXQgY291bnQgPSAtMVxyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLm1heGltdW0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHNvcnRhYmxlLl9nZXRDaGlsZHJlbigpXHJcbiAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGNoaWxkcmVuKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGQgIT09IGVsZW1lbnQgJiYgY2hpbGQuX19zb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb3VudCA9IGNoaWxkLl9fc29ydGFibGUubWF4aW11bSA+IGNvdW50ID8gY2hpbGQuX19zb3J0YWJsZS5tYXhpbXVtIDogY291bnRcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbGVtZW50Ll9fc29ydGFibGUubWF4aW11bSA9IGNvdW50ICsgMVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIG1heGltdW1cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9tYXhpbXVtKGVsZW1lbnQsIHNvcnRhYmxlKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLm1heGltdW0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHNvcnRhYmxlLl9nZXRDaGlsZHJlbigpXHJcbiAgICAgICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPiBzb3J0YWJsZS5vcHRpb25zLm1heGltdW0pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZS5yZW1vdmVQZW5kaW5nKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChzb3J0YWJsZS5yZW1vdmVQZW5kaW5nLmxlbmd0aClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gc29ydGFibGUucmVtb3ZlUGVuZGluZy5wb3AoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5zdHlsZS5kaXNwbGF5ID0gY2hpbGQuX19zb3J0YWJsZS5kaXNwbGF5ID09PSAndW5zZXQnID8gJycgOiBjaGlsZC5fX3NvcnRhYmxlLmRpc3BsYXlcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQuX19zb3J0YWJsZS5kaXNwbGF5ID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5yZW1vdmUoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdtYXhpbXVtLXJlbW92ZScsIGNoaWxkLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgc29ydGFibGUucmVtb3ZlUGVuZGluZyA9IG51bGxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZWxlbWVudClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbWF4aW11bUNvdW50ZXIoZWxlbWVudCwgc29ydGFibGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjbGVhciBwZW5kaW5nIGxpc3RcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfY2xlYXJNYXhpbXVtUGVuZGluZyhzb3J0YWJsZSlcclxuICAgIHtcclxuICAgICAgICBpZiAoc29ydGFibGUucmVtb3ZlUGVuZGluZylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHdoaWxlIChzb3J0YWJsZS5yZW1vdmVQZW5kaW5nLmxlbmd0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBzb3J0YWJsZS5yZW1vdmVQZW5kaW5nLnBvcCgpXHJcbiAgICAgICAgICAgICAgICBjaGlsZC5zdHlsZS5kaXNwbGF5ID0gY2hpbGQuX19zb3J0YWJsZS5kaXNwbGF5ID09PSAndW5zZXQnID8gJycgOiBjaGlsZC5fX3NvcnRhYmxlLmRpc3BsYXlcclxuICAgICAgICAgICAgICAgIGNoaWxkLl9fc29ydGFibGUuZGlzcGxheSA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzb3J0YWJsZS5yZW1vdmVQZW5kaW5nID0gbnVsbFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSBwZW5kaW5nIG1heGltdW1cclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfbWF4aW11bVBlbmRpbmcoZWxlbWVudCwgc29ydGFibGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMubWF4aW11bSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gc29ydGFibGUuX2dldENoaWxkcmVuKClcclxuICAgICAgICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA+IHNvcnRhYmxlLm9wdGlvbnMubWF4aW11bSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2F2ZVBlbmRpbmcgPSBzb3J0YWJsZS5yZW1vdmVQZW5kaW5nID8gc29ydGFibGUucmVtb3ZlUGVuZGluZy5zbGljZSgwKSA6IFtdXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jbGVhck1heGltdW1QZW5kaW5nKHNvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAgc29ydGFibGUucmVtb3ZlUGVuZGluZyA9IFtdXHJcbiAgICAgICAgICAgICAgICBsZXQgc29ydFxyXG4gICAgICAgICAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMubWF4aW11bUZJRk8pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc29ydCA9IGNoaWxkcmVuLnNvcnQoKGEsIGIpID0+IHsgcmV0dXJuIGEgPT09IGVsZW1lbnQgPyAxIDogYS5fX3NvcnRhYmxlLm1heGltdW0gLSBiLl9fc29ydGFibGUubWF4aW11bSB9KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNvcnQgPSBjaGlsZHJlbi5zb3J0KChhLCBiKSA9PiB7IHJldHVybiBhID09PSBlbGVtZW50ID8gMSA6IGIuX19zb3J0YWJsZS5tYXhpbXVtIC0gYS5fX3NvcnRhYmxlLm1heGltdW0gfSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoIC0gc29ydGFibGUub3B0aW9ucy5tYXhpbXVtOyBpKyspXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaGlkZSA9IHNvcnRbaV1cclxuICAgICAgICAgICAgICAgICAgICBoaWRlLl9fc29ydGFibGUuZGlzcGxheSA9IGhpZGUuc3R5bGUuZGlzcGxheSB8fCAndW5zZXQnXHJcbiAgICAgICAgICAgICAgICAgICAgaGlkZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgICAgICAgICAgICAgICAgICAgc29ydGFibGUucmVtb3ZlUGVuZGluZy5wdXNoKGhpZGUpXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNhdmVQZW5kaW5nLmluZGV4T2YoaGlkZSkgPT09IC0xKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnbWF4aW11bS1yZW1vdmUtcGVuZGluZycsIGhpZGUsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSBjdXJzb3IgZHVyaW5nIG1vdXNlZG93blxyXG4gICAgICogQHBhcmFtIHtNb3VzZUV2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfbW91c2VEb3duKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHV0aWxzLnN0eWxlKGUuY3VycmVudFRhcmdldCwgJ2N1cnNvcicsIHRoaXMub3B0aW9ucy5jdXJzb3JEb3duKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNoYW5nZSBjdXJzb3IgZHVyaW5nIG1vdXNldXBcclxuICAgICAqIEBwYXJhbSB7TW91c2VFdmVudH0gZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX21vdXNlVXAoZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLmVtaXQoJ2NsaWNrZWQnLCBlLmN1cnJlbnRUYXJnZXQsIHRoaXMpXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHV0aWxzLnN0eWxlKGUuY3VycmVudFRhcmdldCwgJ2N1cnNvcicsIHRoaXMub3B0aW9ucy5jdXJzb3JIb3ZlcilcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgcGlja2VkIHVwIGJlY2F1c2UgaXQgd2FzIG1vdmVkIGJleW9uZCB0aGUgb3B0aW9ucy50aHJlc2hvbGRcclxuICogQGV2ZW50IFNvcnRhYmxlI3BpY2t1cFxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHNvcnRhYmxlIGlzIHJlb3JkZXJlZFxyXG4gKiBAZXZlbnQgU29ydGFibGUjb3JkZXJcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCB0aGF0IHdhcyByZW9yZGVyZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgcGxhY2VkXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyBhZGRlZCB0byB0aGlzIHNvcnRhYmxlXHJcbiAqIEBldmVudCBTb3J0YWJsZSNhZGRcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBhZGRlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyBhZGRlZFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgcmVtb3ZlZCBmcm9tIHRoaXMgc29ydGFibGVcclxuICogQGV2ZW50IFNvcnRhYmxlI3JlbW92ZVxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHJlbW92ZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgcmVtb3ZlZFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgcmVtb3ZlZCBmcm9tIGFsbCBzb3J0YWJsZXNcclxuICogQGV2ZW50IFNvcnRhYmxlI2RlbGV0ZVxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHJlbW92ZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgZHJhZ2dlZCBmcm9tXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBjb3B5IG9mIGFuIGVsZW1lbnQgaXMgZHJvcHBlZFxyXG4gKiBAZXZlbnQgU29ydGFibGUjY29weVxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHJlbW92ZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgZHJhZ2dlZCBmcm9tXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gdGhlIHNvcnRhYmxlIGlzIHVwZGF0ZWQgd2l0aCBhbiBhZGQsIHJlbW92ZSwgb3Igb3JkZXIgY2hhbmdlXHJcbiAqIEBldmVudCBTb3J0YWJsZSN1cGRhdGVcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBjaGFuZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdpdGggZWxlbWVudFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgcmVtb3ZlZCBiZWNhdXNlIG1heGltdW0gd2FzIHJlYWNoZWQgZm9yIHRoZSBzb3J0YWJsZVxyXG4gKiBAZXZlbnQgU29ydGFibGUjbWF4aW11bS1yZW1vdmVcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCByZW1vdmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIGRyYWdnZWQgZnJvbVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIG9yZGVyIHdhcyBjaGFuZ2VkIGJ1dCBlbGVtZW50IHdhcyBub3QgZHJvcHBlZCB5ZXRcclxuICogQGV2ZW50IFNvcnRhYmxlI29yZGVyLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gZWxlbWVudCBpcyBhZGRlZCBidXQgbm90IGRyb3BwZWQgeWV0XHJcbiAqIEBldmVudCBTb3J0YWJsZSNhZGQtcGVuZGluZ1xyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBlbGVtZW50IGlzIHJlbW92ZWQgYnV0IG5vdCBkcm9wcGVkIHlldFxyXG4gKiBAZXZlbnQgU29ydGFibGUjcmVtb3ZlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gZWxlbWVudCBpcyByZW1vdmVkIGFmdGVyIGJlaW5nIHRlbXBvcmFyaWx5IGFkZGVkXHJcbiAqIEBldmVudCBTb3J0YWJsZSNhZGQtcmVtb3ZlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyBhYm91dCB0byBiZSByZW1vdmVkIGZyb20gYWxsIHNvcnRhYmxlc1xyXG4gKiBAZXZlbnQgU29ydGFibGUjZGVsZXRlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCByZW1vdmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIGRyYWdnZWQgZnJvbVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgYWRkZWQsIHJlbW92ZWQsIG9yIHJlb3JkZXIgYnV0IGVsZW1lbnQgaGFzIG5vdCBkcm9wcGVkIHlldFxyXG4gKiBAZXZlbnQgU29ydGFibGUjdXBkYXRlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBjb3B5IG9mIGFuIGVsZW1lbnQgaXMgYWJvdXQgdG8gZHJvcFxyXG4gKiBAZXZlbnQgU29ydGFibGUjY29weS1wZW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgcmVtb3ZlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyBkcmFnZ2VkIGZyb21cclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIGFib3V0IHRvIGJlIHJlbW92ZWQgYmVjYXVzZSBtYXhpbXVtIHdhcyByZWFjaGVkIGZvciB0aGUgc29ydGFibGVcclxuICogQGV2ZW50IFNvcnRhYmxlI21heGltdW0tcmVtb3ZlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCByZW1vdmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIGRyYWdnZWQgZnJvbVxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgY2xpY2tlZCB3aXRob3V0IGRyYWdnaW5nXHJcbiAqIEBldmVudCBTb3J0YWJsZSNjbGlja2VkXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgY2xpY2tlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IGlzIGEgY2hpbGRcclxuICovXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNvcnRhYmxlIl19