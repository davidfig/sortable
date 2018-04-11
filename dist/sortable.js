const Events = require('eventemitter3');

const toGlobal = require('./toGlobal');
const defaults = require('./options');

class Sortable extends Events {
    /**
     * Create sortable list
     * @param {HTMLElement} element
     * @param {object} [options]
     * @param {string} [options.name=sortable] dragging is allowed between Sortables with the same name
     * @param {boolean} [options.sort=true] allow sorting within list
     * @param {string} [options.dragClass] if set then drag only items with this className under element, otherwise use all children
     * @param {boolean} [options.deepSearch] if dragClass and deepSearch then search all descendents of element for dragClass
     * @param {string} [options.orderId=data-order] for non-sorting lists, use this data id to figure out sort order
     * @param {boolean} [options.orderIdIsNumber=true] use parseInt on options.orderId to properly sort numbers
     * @param {string} [options.reverseOrder] reverse sort the orderId
     * @param {boolean} [options.alwaysInList=true] place element inside closest related Sortable object; if set to false then the object is removed if dropped outside related sortables
     * @param {object} [options.childrenStyles] styles to apply to children elements of Sortable
     * @param {object} [options.icons] default set of icons
     * @param {string} [options.icons.reorder] source of image
     * @param {string} [options.icons.move] source of image
     * @param {string} [options.icons.copy] source of image
     * @param {string} [options.icons.delete] source of image
     * @fires clicked
     * @fires pickup
     * @fires order
     * @fires add
     * @fires remove
     * @fires update
     * @fires order-pending
     * @fires add-pending
     * @fires remove-pending
     * @fires update-pending
     */
    constructor(element, options) {
        super();
        this.options = options || {};
        for (let option in defaults) {
            this.options[option] = typeof this.options[option] !== 'undefined' ? options[option] : defaults[option];
        }
        this.element = element;
        this.element.sortable = this;
        const elements = this._getChildren(this);
        for (let child of elements) {
            if (!this.options.dragClass || this._containsClassName(child, this.options.dragClass)) {
                child.__isSortable = true;
                child.addEventListener('mousedown', e => this._dragStart(e));
                child.addEventListener('touchstart', e => this._dragStart(e));
                for (let option in this.options.childrenStyles) {
                    child.style[option] = this.options.childrenStyles[option];
                }
                child.original = this;
            }
        }
        document.body.addEventListener('mousemove', e => this._dragMove(e));
        document.body.addEventListener('touchmove', e => this._dragMove(e));
        document.body.addEventListener('touchup', e => this._dragUp(e));
        document.body.addEventListener('touchcancel', e => this._dragUp(e));
        document.body.addEventListener('mouseup', e => this._dragUp(e));
        document.body.addEventListener('mousecancel', e => this._dragUp(e));

        if (!Sortable.list) {
            Sortable.list = [];
        }
        Sortable.list.push(this);
    }

    /**
     * Whether element contains classname
     * @param {HTMLElement} e
     * @param {string} name
     * @returns {boolean}
     * @private
     */
    _containsClassName(e, name) {
        const list = e.className.split(' ');
        for (let entry of list) {
            if (entry === name) {
                return true;
            }
        }
        return false;
    }

    /**
     * add an element as a child of the sortable element; can also be used to swap between sortables
     * NOTE: this will not work with deep-type elements; use attachElement instead
     * @param {HTMLElement} element
     * @param {number} index
     */
    add(element, index) {
        this.attachElement(element);
        if (typeof index === 'undefined' || index >= this.element.children.length) {
            this.element.appendChild(element);
        } else {
            this.element.insertBefore(element, this.element.children[index + 1]);
        }
    }

    /**
     * attaches an HTML element to the sortable; can also be used to swap between sortables
     * NOTE: you need to manually insert the element into this.element (this is useful when you have a deep structure)
     * @param {HTMLElement} element
     */
    attachElement(element) {
        if (element.__isSortable) {
            element.original = this;
        } else {
            element.__isSortable = true;
            element.addEventListener('mousedown', e => this._dragStart(e));
            element.addEventListener('touchstart', e => this._dragStart(e));
            for (let option in this.options.childrenStyles) {
                element.style[option] = this.options.childrenStyles[option];
            }
            element.original = this;
        }
    }

    /**
     * start drag
     * @param {UIEvent} e
     * @private
     */
    _dragStart(e) {
        this.dragging = e.currentTarget;
        this.dragging.pickup = false;
        this.dragging.start = { x: e.pageX, y: e.pageY };
        this.dragging.style.cursor = 'no-cursor';
        e.preventDefault();
    }

    /**
     * pickup and clone element
     * @param {UIEvent} e
     * @private
     */
    _pickup(e) {
        this.indicator = this.dragging.cloneNode(true);
        this.dragging.indicator = this.indicator;
        const pos = toGlobal(this.dragging);
        this.dragging.style.position = 'absolute';
        this.offset = { x: pos.x - e.pageX, y: pos.y - e.pageY };
        this.dragging.style.left = pos.x + 'px';
        this.dragging.style.top = pos.y + 'px';
        for (let option in this.options.dragStyle) {
            this.dragging.style[option] = this.options.dragStyle[option];
        }
        this.dragging.parentNode.insertBefore(this.indicator, this.dragging);
        document.body.appendChild(this.dragging);
        if (this.options.useIcons) {
            const image = new Image();
            image.src = this.options.icons.reorder;
            image.style.position = 'absolute';
            image.style.transform = 'translate(-50%, -50%)';
            image.style.left = pos.x + this.dragging.offsetWidth + 'px';
            image.style.top = pos.y + this.dragging.offsetHeight + 'px';
            document.body.appendChild(image);
            this.dragging.icon = image;
        }
        this.dragging.pickup = true;
        this.emit('pickup', this.dragging, this);
    }

    /**
     * measure distance between two points
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @private
     */
    _distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    }

    /**
     * find closest distance from UIEvent to a corner of an element
     * @param {HTMLUListElement} e
     * @param {HTMLElement} element
     * @private
     */
    _distanceToClosestCorner(e, element) {
        const topLeft = this._distance(e.pageX, e.pageY, element.offsetLeft, element.offsetTop);
        const topRight = this._distance(e.pageX, e.pageY, element.offsetLeft + element.offsetWidth, element.offsetTop);
        const bottomLeft = this._distance(e.pageX, e.pageY, element.offsetLeft, element.offsetTop + element.offsetHeight);
        const bottomRight = this._distance(e.pageX, e.pageY, element.offsetLeft + element.offsetWidth, element.offsetTop + element.offsetHeight);
        return Math.min(topLeft, topRight, bottomLeft, bottomRight);
    }

    /**
     * determine whether these is overlap between two elements
     * @param {HTMLElement} dragging
     * @param {HTMLElement} element
     * @private
     */
    _inside(dragging, element) {
        const x1 = dragging.offsetLeft;
        const y1 = dragging.offsetTop;
        const w1 = dragging.offsetWidth;
        const h1 = dragging.offsetHeight;
        const pos = toGlobal(element);
        const x2 = pos.x;
        const y2 = pos.y;
        const w2 = element.offsetWidth;
        const h2 = element.offsetHeight;
        return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    }

    /**
     * find closest Sortable to screen location
     * @param {UIEvent} e
     * @param {HTMLElement} dragging
     * @param {Sortable[]} list of related Sortables
     * @private
     */
    _findClosest(e, dragging, list) {
        let min = Infinity,
            found;
        for (let related of list) {
            if (this._inside(dragging, related.element)) {
                return related;
            } else if (related.options.alwaysInList) {
                const calculate = this._distanceToClosestCorner(e, related.element);
                if (calculate < min) {
                    min = calculate;
                    found = related;
                }
            }
        }
        return found;
    }

    /**
     * @param {number} xa1
     * @param {number} ya1
     * @param {number} xa2
     * @param {number} xa2
     * @param {number} xb1
     * @param {number} yb1
     * @param {number} xb2
     * @param {number} yb2
     * calculate percentage of overlap between two boxes
     * from https://stackoverflow.com/a/21220004/1955997
     * @private
     */
    _percentage(xa1, ya1, xa2, ya2, xb1, yb1, xb2, yb2) {
        const sa = (xa2 - xa1) * (ya2 - ya1);
        const sb = (xb2 - xb1) * (yb2 - yb1);
        const si = Math.max(0, Math.min(xa2, xb2) - Math.max(xa1, xb1)) * Math.max(0, Math.min(ya2, yb2) - Math.max(ya1, yb1));
        const union = sa + sb - si;
        return si / union;
    }

    /**
     * place indicator in the sortable list according to options.sort
     * @param {Sortable} sortable
     * @param {HTMLElement} dragging element
     * @private
     */
    _placeInList(sortable, dragging) {
        if (sortable.options.sort) {
            this._placeInSortableList(sortable, dragging);
        } else {
            this._placeInOrderedList(sortable, dragging);
        }
    }

    _traverseChildren(base, search, results) {
        for (let child of base.children) {
            if (search.length) {
                if (search.indexOf(child.className) !== -1) {
                    results.push(child);
                }
            } else {
                results.push(child);
            }
            this._traverseChildren(child, search, results);
        }
    }

    /**
     * find children in div
     * @param {Sortable} sortable
     * @param {boolean} [order] search for dragOrder as well
     * @private
     */
    _getChildren(sortable, order) {
        if (sortable.options.deepSearch) {
            let search = [];
            if (order && sortable.options.orderClass) {
                if (sortable.options.dragClass) {
                    search.push(sortable.options.dragClass);
                }
                if (order && sortable.options.orderClass) {
                    search.push(sortable.options.orderClass);
                }
            } else if (!order && sortable.options.dragClass) {
                search.push(sortable.options.dragClass);
            }
            const results = [];
            this._traverseChildren(sortable.element, search, results);
            return results;
        } else {
            if (sortable.options.dragClass) {
                let list = [];
                for (let child of sortable.element.children) {
                    if (this._containsClassName(child, sortable.options.dragClass) || order || !sortable.options.orderClass || order && sortable.options.orderClass && this._containsClassName(child, sortable.options.orderClass)) {
                        list.push(child);
                    }
                }
                return list;
            } else {
                return sortable.element.children;
            }
        }
    }

    /**
     * place indicator in an ordered list
     * @param {Sortable} sortable
     * @param {HTMLElement} dragging
     * @private
     */
    _placeInOrderedList(sortable, dragging) {
        const id = sortable.options.orderId;
        dragging.indicator.remove();
        sortable.indicator = dragging.indicator;
        let dragOrder = sortable.indicator.getAttribute(id);
        dragOrder = sortable.options.orderIdIsNumber ? parseFloat(dragOrder) : dragOrder;
        let found;
        const children = this._getChildren(sortable, true);
        if (sortable.options.reverseOrder) {
            for (let i = children.length - 1; i >= 0; i--) {
                const child = children[i];
                let childDragOrder = child.getAttribute(id);
                childDragOrder = sortable.options.orderIsNumber ? parseFloat(childDragOrder) : childDragOrder;
                if (dragOrder > childDragOrder) {
                    child.parentNode.insertBefore(sortable.indicator, child);
                    this._setIcon(dragging, sortable);
                    found = true;
                    break;
                }
            }
        } else {
            for (let child of children) {
                let childDragOrder = child.getAttribute(id);
                childDragOrder = sortable.options.orderIsNumber ? parseFloat(childDragOrder) : childDragOrder;
                if (dragOrder < childDragOrder) {
                    child.parentNode.insertBefore(sortable.indicator, child);
                    this._setIcon(dragging, sortable);
                    found = true;
                    break;
                }
            }
        }
        if (!found) {
            sortable.element.appendChild(sortable.indicator);
            this._setIcon(dragging, sortable);
        }
    }

    /**
     * find last child that is of type dragClass (if set)
     * @param {Sortable} sortable
     * @private
     */
    _getLastChild(sortable) {
        if (sortable.options.deepSearch) {
            const search = [];
            if (sortable.options.dragClass) {
                search.push(sortable.options.dragClass);
            }
            const results = [];
            this._traverseChildren(sortable.element, search, results);
            if (results.length) {
                return results[results.length - 1];
            } else {
                return null;
            }
        } else {
            if (sortable.options.dragClass) {
                for (let i = sortable.element.children.length - 1; i >= 0; i--) {
                    const child = sortable.element.children[i];
                    if (this._containsClassName(child, sortable.options.dragClass)) {
                        return child;
                    }
                }
                return null;
            } else {
                if (sortable.element.children.length) {
                    return sortable.element.children[sortable.element.children.length - 1];
                } else {
                    return null;
                }
            }
        }
    }

    /**
     * set icon if available
     * @param {HTMLElement} dragging
     * @param {Sortable} sortable
     * @private
     */
    _setIcon(dragging, sortable) {
        if (dragging.icon) {
            dragging.icon.src = dragging.original === sortable ? sortable.options.icons.reorder : sortable.options.icons.move;
            dragging.current = sortable;
        }
        if (dragging.original === sortable) {
            sortable.emit('order-pending', dragging, sortable);
            sortable.emit('update-pending', sortable);
        } else {
            sortable.emit('add-pending', dragging, sortable);
            dragging.original.emit('remove-pending', dragging, dragging.original);
            sortable.emit('update-pending');
            dragging.original.emit('update-pending');
        }
    }

    /**
     * place indicator in an sortable list
     * @param {Sortable} sortable
     * @param {HTMLElement} dragging
     * @private
     */
    _placeInSortableList(sortable, dragging) {
        const element = sortable.element;
        sortable.element.appendChild(dragging.indicator);
        sortable.indicator = dragging.indicator;
        const lastChild = this._getLastChild(sortable);
        if (!lastChild) {
            element.appendChild(sortable.indicator);
            this._setIcon(dragging, sortable);
        } else {
            if (dragging.offsetTop >= element.offsetTop + element.offsetHeight) {
                element.appendChild(sortable.indicator);
                this._setIcon(dragging, sortable);
            } else if (dragging.offsetTop + dragging.offsetHeight < element.offsetTop) {
                element.insertBefore(sortable.indicator, element.firstChild);
                this._setIcon(dragging, sortable);
            } else {
                const xa1 = dragging.offsetLeft;
                const ya1 = dragging.offsetTop;
                const xa2 = dragging.offsetLeft + dragging.offsetWidth;
                const ya2 = dragging.offsetTop + dragging.offsetHeight;
                let largest = 0,
                    closest,
                    isBefore = true,
                    indicator;
                const search = [];
                if (sortable.options.dragClass) {
                    search.push(sortable.options.dragClass);
                }
                if (sortable.options.orderClass) {
                    search.push(sortable.options.orderClass);
                }
                const elements = this._getChildren(sortable, true);
                for (let child of elements) {
                    if (child === sortable.indicator) {
                        indicator = true;
                    }
                    const pos = toGlobal(child);
                    const xb1 = pos.x;
                    const yb1 = pos.y;
                    const xb2 = pos.x + child.offsetWidth;
                    const yb2 = pos.y + child.offsetHeight;
                    const percentage = this._percentage(xa1, ya1, xa2, ya2, xb1, yb1, xb2, yb2);
                    if (percentage > largest) {
                        largest = percentage;
                        closest = child;
                        isBefore = indicator;
                    }
                }
                if (closest && closest !== sortable.indicator) {
                    if (isBefore) {
                        element.insertBefore(sortable.indicator, closest.nextSibling);
                        this._setIcon(dragging, sortable);
                        sortable.emit('order-pending', sortable);
                    } else {
                        element.insertBefore(sortable.indicator, closest);
                        this._setIcon(dragging, sortable);
                        sortable.emit('order-pending', sortable);
                    }
                } else {
                    sortable.element.appendChild(dragging.indicator);
                    sortable.indicator = dragging.indicator;
                    this._setIcon(dragging, sortable);
                }
            }
        }
    }

    /**
     * handle move
     * @param {UIEvent} e
     * @private
     */
    _dragMove(e) {
        if (this.dragging) {
            if (!this.dragging.pickup) {
                if (this._distance(this.dragging.start.x, this.dragging.start.y, e.pageX, e.pageY) > this.options.threshold) {
                    this._pickup(e);
                } else {
                    return;
                }
            }
            this.dragging.style.left = e.pageX + this.offset.x + 'px';
            this.dragging.style.top = e.pageY + this.offset.y + 'px';
            if (this.dragging.icon) {
                this.dragging.icon.style.left = e.pageX + this.offset.x + this.dragging.offsetWidth + 'px';
                this.dragging.icon.style.top = e.pageY + this.offset.y + this.dragging.offsetHeight + 'px';
            }
            const list = [];
            for (let sortable of Sortable.list) {
                if (sortable.options.name === this.options.name) {
                    list.push(sortable);
                }
            }
            if (list.length === 1) {
                if (this.options.alwaysInList || this._inside(this.dragging, this.element)) {
                    this.dragging.sortable = this;
                    this._placeInList(this, this.dragging);
                } else {
                    this.dragging.indicator.remove();
                    if (this.dragging.icon) {
                        this.dragging.icon.src = this.options.icons.delete;
                    }
                }
            } else {
                const closest = this._findClosest(e, this.dragging, list);
                if (closest) {
                    this.dragging.sortable = closest;
                    this._placeInList(closest, this.dragging);
                } else {
                    this.dragging.sortable = null;
                    this.dragging.indicator.remove();
                    if (this.dragging.icon) {
                        this.dragging.icon.src = this.options.icons.delete;
                    }
                }
            }
            e.preventDefault();
            e.stopPropagation();
        }
    }

    /**
     * handle up
     * @param {UIEvent} e
     * @private
     */
    _dragUp(e) {
        if (this.dragging) {
            if (this.dragging.pickup) {
                this.dragging.style.position = 'unset';
                this.dragging.style.zIndex = 'unset';
                this.dragging.style.boxShadow = 'unset';
                this.dragging.style.opacity = 'unset';
                if (this.indicator.parentNode) {
                    this.indicator.parentNode.insertBefore(this.dragging, this.indicator);
                    this.dragging.original = this.dragging.current;
                    this.indicator.remove();
                    this.indicator = null;
                    if (this.dragging.original === this) {
                        this.emit('order', this.dragging, this);
                        this.emit('update', this.dragging, this);
                    } else {
                        this.dragging.original.emit('remove', this.dragging, this.dragging.original);
                        this.dragging.original.emit('update', this.dragging, this.dragging.original);
                        this.dragging.sortable.emit('add', this.dragging, this);
                        this.dragging.sortable.emit('update', this.dragging, this);
                    }
                } else {
                    this.dragging.remove();
                    this.dragging.original = null;
                    this.indicator.remove();
                    this.indicator = null;
                    this.dragging.original.emit('remove', this.dragging, this);
                }
                if (this.dragging.icon) {
                    this.dragging.icon.remove();
                }
            } else {
                this.emit('clicked', this.dragging, this);
            }
            this.dragging = null;
            e.preventDefault();
        }
    }

    /**
     * the global defaults for new Sortable objects
     * @type {DefaultOptions}
     */
    static get defaults() {
        return defaults;
    }

    /**
     * create multiple sortable elements
     * @param {HTMLElements[]} elements
     * @param {object} options - see constructor for options
     */
    static create(elements, options) {
        const results = [];
        for (let element of elements) {
            results.push(new Sortable(element, options));
        }
        return results;
    }
}

module.exports = Sortable;

/**
 * fires when an element is clicked but not moved beyond the options.threshold
 * @event Sortable#clicked
 * @property {HTMLElement} element clicked
 * @property {Sortable} sortable containing element
 */

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
 * fires when an element is added, removed, or reorder but element has not dropped yet
 * @event Sortable#update-pending
 * @property {HTMLElement} element being dragged
 * @property {Sortable} current sortable with element placeholder
 */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3J0YWJsZS5qcyJdLCJuYW1lcyI6WyJFdmVudHMiLCJyZXF1aXJlIiwidG9HbG9iYWwiLCJkZWZhdWx0cyIsIlNvcnRhYmxlIiwiY29uc3RydWN0b3IiLCJlbGVtZW50Iiwib3B0aW9ucyIsIm9wdGlvbiIsInNvcnRhYmxlIiwiZWxlbWVudHMiLCJfZ2V0Q2hpbGRyZW4iLCJjaGlsZCIsImRyYWdDbGFzcyIsIl9jb250YWluc0NsYXNzTmFtZSIsIl9faXNTb3J0YWJsZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJlIiwiX2RyYWdTdGFydCIsImNoaWxkcmVuU3R5bGVzIiwic3R5bGUiLCJvcmlnaW5hbCIsImRvY3VtZW50IiwiYm9keSIsIl9kcmFnTW92ZSIsIl9kcmFnVXAiLCJsaXN0IiwicHVzaCIsIm5hbWUiLCJjbGFzc05hbWUiLCJzcGxpdCIsImVudHJ5IiwiYWRkIiwiaW5kZXgiLCJhdHRhY2hFbGVtZW50IiwiY2hpbGRyZW4iLCJsZW5ndGgiLCJhcHBlbmRDaGlsZCIsImluc2VydEJlZm9yZSIsImRyYWdnaW5nIiwiY3VycmVudFRhcmdldCIsInBpY2t1cCIsInN0YXJ0IiwieCIsInBhZ2VYIiwieSIsInBhZ2VZIiwiY3Vyc29yIiwicHJldmVudERlZmF1bHQiLCJfcGlja3VwIiwiaW5kaWNhdG9yIiwiY2xvbmVOb2RlIiwicG9zIiwicG9zaXRpb24iLCJvZmZzZXQiLCJsZWZ0IiwidG9wIiwiZHJhZ1N0eWxlIiwicGFyZW50Tm9kZSIsInVzZUljb25zIiwiaW1hZ2UiLCJJbWFnZSIsInNyYyIsImljb25zIiwicmVvcmRlciIsInRyYW5zZm9ybSIsIm9mZnNldFdpZHRoIiwib2Zmc2V0SGVpZ2h0IiwiaWNvbiIsImVtaXQiLCJfZGlzdGFuY2UiLCJ4MSIsInkxIiwieDIiLCJ5MiIsIk1hdGgiLCJzcXJ0IiwicG93IiwiX2Rpc3RhbmNlVG9DbG9zZXN0Q29ybmVyIiwidG9wTGVmdCIsIm9mZnNldExlZnQiLCJvZmZzZXRUb3AiLCJ0b3BSaWdodCIsImJvdHRvbUxlZnQiLCJib3R0b21SaWdodCIsIm1pbiIsIl9pbnNpZGUiLCJ3MSIsImgxIiwidzIiLCJoMiIsIl9maW5kQ2xvc2VzdCIsIkluZmluaXR5IiwiZm91bmQiLCJyZWxhdGVkIiwiYWx3YXlzSW5MaXN0IiwiY2FsY3VsYXRlIiwiX3BlcmNlbnRhZ2UiLCJ4YTEiLCJ5YTEiLCJ4YTIiLCJ5YTIiLCJ4YjEiLCJ5YjEiLCJ4YjIiLCJ5YjIiLCJzYSIsInNiIiwic2kiLCJtYXgiLCJ1bmlvbiIsIl9wbGFjZUluTGlzdCIsInNvcnQiLCJfcGxhY2VJblNvcnRhYmxlTGlzdCIsIl9wbGFjZUluT3JkZXJlZExpc3QiLCJfdHJhdmVyc2VDaGlsZHJlbiIsImJhc2UiLCJzZWFyY2giLCJyZXN1bHRzIiwiaW5kZXhPZiIsIm9yZGVyIiwiZGVlcFNlYXJjaCIsIm9yZGVyQ2xhc3MiLCJpZCIsIm9yZGVySWQiLCJyZW1vdmUiLCJkcmFnT3JkZXIiLCJnZXRBdHRyaWJ1dGUiLCJvcmRlcklkSXNOdW1iZXIiLCJwYXJzZUZsb2F0IiwicmV2ZXJzZU9yZGVyIiwiaSIsImNoaWxkRHJhZ09yZGVyIiwib3JkZXJJc051bWJlciIsIl9zZXRJY29uIiwiX2dldExhc3RDaGlsZCIsIm1vdmUiLCJjdXJyZW50IiwibGFzdENoaWxkIiwiZmlyc3RDaGlsZCIsImxhcmdlc3QiLCJjbG9zZXN0IiwiaXNCZWZvcmUiLCJwZXJjZW50YWdlIiwibmV4dFNpYmxpbmciLCJ0aHJlc2hvbGQiLCJkZWxldGUiLCJzdG9wUHJvcGFnYXRpb24iLCJ6SW5kZXgiLCJib3hTaGFkb3ciLCJvcGFjaXR5IiwiY3JlYXRlIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTUEsU0FBU0MsUUFBUSxlQUFSLENBQWY7O0FBRUEsTUFBTUMsV0FBV0QsUUFBUSxZQUFSLENBQWpCO0FBQ0EsTUFBTUUsV0FBV0YsUUFBUSxXQUFSLENBQWpCOztBQUVBLE1BQU1HLFFBQU4sU0FBdUJKLE1BQXZCLENBQ0E7QUFDSTs7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QUFFK0IsY0FBRjtBQUNIO0FBQ0o7O0FBRUQ7Ozs7QUFJQSxlQUFXN0MsUUFBWCxHQUNBO0FBQ0ksZUFBT0EsUUFBUDtBQUNIOztBQUVEOzs7OztBQUtBLFdBQU9vSixNQUFQLENBQWM3SSxRQUFkLEVBQXdCSCxPQUF4QixFQUNBO0FBQ0ksY0FBTStHLFVBQVUsRUFBaEI7QUFDQSxhQUFLLElBQUloSCxPQUFULElBQW9CSSxRQUFwQixFQUNBO0FBQ0k0RyxvQkFBUTNGLElBQVIsQ0FBYSxJQUFJdkIsUUFBSixDQUFhRSxPQUFiLEVBQXNCQyxPQUF0QixDQUFiO0FBQ0g7QUFDRCxlQUFPK0csT0FBUDtBQUNIO0FBeHVCTDs7QUEydUJBa0MsT0FBT0MsT0FBUCxHQUFpQnJKLFFBQWpCOztBQUVBOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BIiwiZmlsZSI6InNvcnRhYmxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgRXZlbnRzID0gcmVxdWlyZSgnZXZlbnRlbWl0dGVyMycpXHJcblxyXG5jb25zdCB0b0dsb2JhbCA9IHJlcXVpcmUoJy4vdG9HbG9iYWwnKVxyXG5jb25zdCBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vb3B0aW9ucycpXHJcblxyXG5jbGFzcyBTb3J0YWJsZSBleHRlbmRzIEV2ZW50c1xyXG57XHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBzb3J0YWJsZSBsaXN0XHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMubmFtZT1zb3J0YWJsZV0gZHJhZ2dpbmcgaXMgYWxsb3dlZCBiZXR3ZWVuIFNvcnRhYmxlcyB3aXRoIHRoZSBzYW1lIG5hbWVcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuc29ydD10cnVlXSBhbGxvdyBzb3J0aW5nIHdpdGhpbiBsaXN0XHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuZHJhZ0NsYXNzXSBpZiBzZXQgdGhlbiBkcmFnIG9ubHkgaXRlbXMgd2l0aCB0aGlzIGNsYXNzTmFtZSB1bmRlciBlbGVtZW50LCBvdGhlcndpc2UgdXNlIGFsbCBjaGlsZHJlblxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5kZWVwU2VhcmNoXSBpZiBkcmFnQ2xhc3MgYW5kIGRlZXBTZWFyY2ggdGhlbiBzZWFyY2ggYWxsIGRlc2NlbmRlbnRzIG9mIGVsZW1lbnQgZm9yIGRyYWdDbGFzc1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLm9yZGVySWQ9ZGF0YS1vcmRlcl0gZm9yIG5vbi1zb3J0aW5nIGxpc3RzLCB1c2UgdGhpcyBkYXRhIGlkIHRvIGZpZ3VyZSBvdXQgc29ydCBvcmRlclxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5vcmRlcklkSXNOdW1iZXI9dHJ1ZV0gdXNlIHBhcnNlSW50IG9uIG9wdGlvbnMub3JkZXJJZCB0byBwcm9wZXJseSBzb3J0IG51bWJlcnNcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5yZXZlcnNlT3JkZXJdIHJldmVyc2Ugc29ydCB0aGUgb3JkZXJJZFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5hbHdheXNJbkxpc3Q9dHJ1ZV0gcGxhY2UgZWxlbWVudCBpbnNpZGUgY2xvc2VzdCByZWxhdGVkIFNvcnRhYmxlIG9iamVjdDsgaWYgc2V0IHRvIGZhbHNlIHRoZW4gdGhlIG9iamVjdCBpcyByZW1vdmVkIGlmIGRyb3BwZWQgb3V0c2lkZSByZWxhdGVkIHNvcnRhYmxlc1xyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zLmNoaWxkcmVuU3R5bGVzXSBzdHlsZXMgdG8gYXBwbHkgdG8gY2hpbGRyZW4gZWxlbWVudHMgb2YgU29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9ucy5pY29uc10gZGVmYXVsdCBzZXQgb2YgaWNvbnNcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5pY29ucy5yZW9yZGVyXSBzb3VyY2Ugb2YgaW1hZ2VcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5pY29ucy5tb3ZlXSBzb3VyY2Ugb2YgaW1hZ2VcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5pY29ucy5jb3B5XSBzb3VyY2Ugb2YgaW1hZ2VcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5pY29ucy5kZWxldGVdIHNvdXJjZSBvZiBpbWFnZVxyXG4gICAgICogQGZpcmVzIGNsaWNrZWRcclxuICAgICAqIEBmaXJlcyBwaWNrdXBcclxuICAgICAqIEBmaXJlcyBvcmRlclxyXG4gICAgICogQGZpcmVzIGFkZFxyXG4gICAgICogQGZpcmVzIHJlbW92ZVxyXG4gICAgICogQGZpcmVzIHVwZGF0ZVxyXG4gICAgICogQGZpcmVzIG9yZGVyLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyBhZGQtcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIHJlbW92ZS1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgdXBkYXRlLXBlbmRpbmdcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBzdXBlcigpXHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIGZvciAobGV0IG9wdGlvbiBpbiBkZWZhdWx0cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9uc1tvcHRpb25dID0gdHlwZW9mIHRoaXMub3B0aW9uc1tvcHRpb25dICE9PSAndW5kZWZpbmVkJyA/IG9wdGlvbnNbb3B0aW9uXSA6IGRlZmF1bHRzW29wdGlvbl1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudFxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zb3J0YWJsZSA9IHRoaXNcclxuICAgICAgICBjb25zdCBlbGVtZW50cyA9IHRoaXMuX2dldENoaWxkcmVuKHRoaXMpXHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgZWxlbWVudHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5kcmFnQ2xhc3MgfHwgdGhpcy5fY29udGFpbnNDbGFzc05hbWUoY2hpbGQsIHRoaXMub3B0aW9ucy5kcmFnQ2xhc3MpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5fX2lzU29ydGFibGUgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICBjaGlsZC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCAoZSkgPT4gdGhpcy5fZHJhZ1N0YXJ0KGUpKVxyXG4gICAgICAgICAgICAgICAgY2hpbGQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIChlKSA9PiB0aGlzLl9kcmFnU3RhcnQoZSkpXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBvcHRpb24gaW4gdGhpcy5vcHRpb25zLmNoaWxkcmVuU3R5bGVzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkLnN0eWxlW29wdGlvbl0gPSB0aGlzLm9wdGlvbnMuY2hpbGRyZW5TdHlsZXNbb3B0aW9uXVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2hpbGQub3JpZ2luYWwgPSB0aGlzXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCAoZSkgPT4gdGhpcy5fZHJhZ01vdmUoZSkpXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCAoZSkgPT4gdGhpcy5fZHJhZ01vdmUoZSkpXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHVwJywgKGUpID0+IHRoaXMuX2RyYWdVcChlKSlcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgKGUpID0+IHRoaXMuX2RyYWdVcChlKSlcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCAoZSkgPT4gdGhpcy5fZHJhZ1VwKGUpKVxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VjYW5jZWwnLCAoZSkgPT4gdGhpcy5fZHJhZ1VwKGUpKVxyXG5cclxuICAgICAgICBpZiAoIVNvcnRhYmxlLmxpc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBTb3J0YWJsZS5saXN0ID0gW11cclxuICAgICAgICB9XHJcbiAgICAgICAgU29ydGFibGUubGlzdC5wdXNoKHRoaXMpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXaGV0aGVyIGVsZW1lbnQgY29udGFpbnMgY2xhc3NuYW1lXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfY29udGFpbnNDbGFzc05hbWUoZSwgbmFtZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBsaXN0ID0gZS5jbGFzc05hbWUuc3BsaXQoJyAnKVxyXG4gICAgICAgIGZvciAobGV0IGVudHJ5IG9mIGxpc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoZW50cnkgPT09IG5hbWUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhZGQgYW4gZWxlbWVudCBhcyBhIGNoaWxkIG9mIHRoZSBzb3J0YWJsZSBlbGVtZW50OyBjYW4gYWxzbyBiZSB1c2VkIHRvIHN3YXAgYmV0d2VlbiBzb3J0YWJsZXNcclxuICAgICAqIE5PVEU6IHRoaXMgd2lsbCBub3Qgd29yayB3aXRoIGRlZXAtdHlwZSBlbGVtZW50czsgdXNlIGF0dGFjaEVsZW1lbnQgaW5zdGVhZFxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4XHJcbiAgICAgKi9cclxuICAgIGFkZChlbGVtZW50LCBpbmRleClcclxuICAgIHtcclxuICAgICAgICB0aGlzLmF0dGFjaEVsZW1lbnQoZWxlbWVudClcclxuICAgICAgICBpZiAodHlwZW9mIGluZGV4ID09PSAndW5kZWZpbmVkJyB8fCBpbmRleCA+PSB0aGlzLmVsZW1lbnQuY2hpbGRyZW4ubGVuZ3RoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5pbnNlcnRCZWZvcmUoZWxlbWVudCwgdGhpcy5lbGVtZW50LmNoaWxkcmVuW2luZGV4ICsgMV0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYXR0YWNoZXMgYW4gSFRNTCBlbGVtZW50IHRvIHRoZSBzb3J0YWJsZTsgY2FuIGFsc28gYmUgdXNlZCB0byBzd2FwIGJldHdlZW4gc29ydGFibGVzXHJcbiAgICAgKiBOT1RFOiB5b3UgbmVlZCB0byBtYW51YWxseSBpbnNlcnQgdGhlIGVsZW1lbnQgaW50byB0aGlzLmVsZW1lbnQgKHRoaXMgaXMgdXNlZnVsIHdoZW4geW91IGhhdmUgYSBkZWVwIHN0cnVjdHVyZSlcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqL1xyXG4gICAgYXR0YWNoRWxlbWVudChlbGVtZW50KVxyXG4gICAge1xyXG4gICAgICAgIGlmIChlbGVtZW50Ll9faXNTb3J0YWJsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQub3JpZ2luYWwgPSB0aGlzXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuX19pc1NvcnRhYmxlID0gdHJ1ZVxyXG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChlKSA9PiB0aGlzLl9kcmFnU3RhcnQoZSkpXHJcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIChlKSA9PiB0aGlzLl9kcmFnU3RhcnQoZSkpXHJcbiAgICAgICAgICAgIGZvciAobGV0IG9wdGlvbiBpbiB0aGlzLm9wdGlvbnMuY2hpbGRyZW5TdHlsZXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuc3R5bGVbb3B0aW9uXSA9IHRoaXMub3B0aW9ucy5jaGlsZHJlblN0eWxlc1tvcHRpb25dXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxlbWVudC5vcmlnaW5hbCA9IHRoaXNcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzdGFydCBkcmFnXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kcmFnU3RhcnQoZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLmRyYWdnaW5nID0gZS5jdXJyZW50VGFyZ2V0XHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZy5waWNrdXAgPSBmYWxzZVxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcuc3RhcnQgPSB7IHg6IGUucGFnZVgsIHk6IGUucGFnZVkgfVxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcuc3R5bGUuY3Vyc29yID0gJ25vLWN1cnNvcidcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBpY2t1cCBhbmQgY2xvbmUgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGlja3VwKGUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5pbmRpY2F0b3IgPSB0aGlzLmRyYWdnaW5nLmNsb25lTm9kZSh0cnVlKVxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcuaW5kaWNhdG9yID0gdGhpcy5pbmRpY2F0b3JcclxuICAgICAgICBjb25zdCBwb3MgPSB0b0dsb2JhbCh0aGlzLmRyYWdnaW5nKVxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXHJcbiAgICAgICAgdGhpcy5vZmZzZXQgPSB7IHg6IHBvcy54IC0gZS5wYWdlWCwgeTogcG9zLnkgLSBlLnBhZ2VZIH1cclxuICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLmxlZnQgPSBwb3MueCArICdweCdcclxuICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLnRvcCA9IHBvcy55ICsgJ3B4J1xyXG4gICAgICAgIGZvciAobGV0IG9wdGlvbiBpbiB0aGlzLm9wdGlvbnMuZHJhZ1N0eWxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5zdHlsZVtvcHRpb25dID0gdGhpcy5vcHRpb25zLmRyYWdTdHlsZVtvcHRpb25dXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGhpcy5pbmRpY2F0b3IsIHRoaXMuZHJhZ2dpbmcpXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmRyYWdnaW5nKVxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMudXNlSWNvbnMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBpbWFnZSA9IG5ldyBJbWFnZSgpXHJcbiAgICAgICAgICAgIGltYWdlLnNyYyA9IHRoaXMub3B0aW9ucy5pY29ucy5yZW9yZGVyXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xyXG4gICAgICAgICAgICBpbWFnZS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKC01MCUsIC01MCUpJ1xyXG4gICAgICAgICAgICBpbWFnZS5zdHlsZS5sZWZ0ID0gcG9zLnggKyB0aGlzLmRyYWdnaW5nLm9mZnNldFdpZHRoICsgJ3B4J1xyXG4gICAgICAgICAgICBpbWFnZS5zdHlsZS50b3AgPSBwb3MueSArIHRoaXMuZHJhZ2dpbmcub2Zmc2V0SGVpZ2h0ICsgJ3B4J1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGltYWdlKVxyXG4gICAgICAgICAgICB0aGlzLmRyYWdnaW5nLmljb24gPSBpbWFnZVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmRyYWdnaW5nLnBpY2t1cCA9IHRydWVcclxuICAgICAgICB0aGlzLmVtaXQoJ3BpY2t1cCcsIHRoaXMuZHJhZ2dpbmcsIHRoaXMpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBtZWFzdXJlIGRpc3RhbmNlIGJldHdlZW4gdHdvIHBvaW50c1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHgxXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geTFcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4MlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHkyXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZGlzdGFuY2UoeDEsIHkxLCB4MiwgeTIpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyh4MSAtIHgyLCAyKSArIE1hdGgucG93KHkxIC0geTIsIDIpKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZmluZCBjbG9zZXN0IGRpc3RhbmNlIGZyb20gVUlFdmVudCB0byBhIGNvcm5lciBvZiBhbiBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge0hUTUxVTGlzdEVsZW1lbnR9IGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kaXN0YW5jZVRvQ2xvc2VzdENvcm5lcihlLCBlbGVtZW50KVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHRvcExlZnQgPSB0aGlzLl9kaXN0YW5jZShlLnBhZ2VYLCBlLnBhZ2VZLCBlbGVtZW50Lm9mZnNldExlZnQsIGVsZW1lbnQub2Zmc2V0VG9wKVxyXG4gICAgICAgIGNvbnN0IHRvcFJpZ2h0ID0gdGhpcy5fZGlzdGFuY2UoZS5wYWdlWCwgZS5wYWdlWSwgZWxlbWVudC5vZmZzZXRMZWZ0ICsgZWxlbWVudC5vZmZzZXRXaWR0aCwgZWxlbWVudC5vZmZzZXRUb3ApXHJcbiAgICAgICAgY29uc3QgYm90dG9tTGVmdCA9IHRoaXMuX2Rpc3RhbmNlKGUucGFnZVgsIGUucGFnZVksIGVsZW1lbnQub2Zmc2V0TGVmdCwgZWxlbWVudC5vZmZzZXRUb3AgKyBlbGVtZW50Lm9mZnNldEhlaWdodClcclxuICAgICAgICBjb25zdCBib3R0b21SaWdodCA9IHRoaXMuX2Rpc3RhbmNlKGUucGFnZVgsIGUucGFnZVksIGVsZW1lbnQub2Zmc2V0TGVmdCArIGVsZW1lbnQub2Zmc2V0V2lkdGgsIGVsZW1lbnQub2Zmc2V0VG9wICsgZWxlbWVudC5vZmZzZXRIZWlnaHQpXHJcbiAgICAgICAgcmV0dXJuIE1hdGgubWluKHRvcExlZnQsIHRvcFJpZ2h0LCBib3R0b21MZWZ0LCBib3R0b21SaWdodClcclxuICAgIH1cclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBkZXRlcm1pbmUgd2hldGhlciB0aGVzZSBpcyBvdmVybGFwIGJldHdlZW4gdHdvIGVsZW1lbnRzXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2luc2lkZShkcmFnZ2luZywgZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBjb25zdCB4MSA9IGRyYWdnaW5nLm9mZnNldExlZnRcclxuICAgICAgICBjb25zdCB5MSA9IGRyYWdnaW5nLm9mZnNldFRvcFxyXG4gICAgICAgIGNvbnN0IHcxID0gZHJhZ2dpbmcub2Zmc2V0V2lkdGhcclxuICAgICAgICBjb25zdCBoMSA9IGRyYWdnaW5nLm9mZnNldEhlaWdodFxyXG4gICAgICAgIGNvbnN0IHBvcyA9IHRvR2xvYmFsKGVsZW1lbnQpXHJcbiAgICAgICAgY29uc3QgeDIgPSBwb3MueFxyXG4gICAgICAgIGNvbnN0IHkyID0gcG9zLnlcclxuICAgICAgICBjb25zdCB3MiA9IGVsZW1lbnQub2Zmc2V0V2lkdGhcclxuICAgICAgICBjb25zdCBoMiA9IGVsZW1lbnQub2Zmc2V0SGVpZ2h0XHJcbiAgICAgICAgcmV0dXJuIHgxIDwgeDIgKyB3MiAmJiB4MSArIHcxID4geDIgJiYgeTEgPCB5MiArIGgyICYmIHkxICsgaDEgPiB5MlxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZmluZCBjbG9zZXN0IFNvcnRhYmxlIHRvIHNjcmVlbiBsb2NhdGlvblxyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZVtdfSBsaXN0IG9mIHJlbGF0ZWQgU29ydGFibGVzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZmluZENsb3Nlc3QoZSwgZHJhZ2dpbmcsIGxpc3QpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IG1pbiA9IEluZmluaXR5LCBmb3VuZFxyXG4gICAgICAgIGZvciAobGV0IHJlbGF0ZWQgb2YgbGlzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9pbnNpZGUoZHJhZ2dpbmcsIHJlbGF0ZWQuZWxlbWVudCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZWxhdGVkXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAocmVsYXRlZC5vcHRpb25zLmFsd2F5c0luTGlzdClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2FsY3VsYXRlID0gdGhpcy5fZGlzdGFuY2VUb0Nsb3Nlc3RDb3JuZXIoZSwgcmVsYXRlZC5lbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgaWYgKGNhbGN1bGF0ZSA8IG1pbilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtaW4gPSBjYWxjdWxhdGVcclxuICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHJlbGF0ZWRcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZm91bmRcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4YTFcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5YTFcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4YTJcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4YTJcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4YjFcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5YjFcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4YjJcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5YjJcclxuICAgICAqIGNhbGN1bGF0ZSBwZXJjZW50YWdlIG9mIG92ZXJsYXAgYmV0d2VlbiB0d28gYm94ZXNcclxuICAgICAqIGZyb20gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzIxMjIwMDA0LzE5NTU5OTdcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9wZXJjZW50YWdlKHhhMSwgeWExLCB4YTIsIHlhMiwgeGIxLCB5YjEsIHhiMiwgeWIyKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHNhID0gKHhhMiAtIHhhMSkgKiAoeWEyIC0geWExKVxyXG4gICAgICAgIGNvbnN0IHNiID0gKHhiMiAtIHhiMSkgKiAoeWIyIC0geWIxKVxyXG4gICAgICAgIGNvbnN0IHNpID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oeGEyLCB4YjIpIC0gTWF0aC5tYXgoeGExLCB4YjEpKSAqIE1hdGgubWF4KDAsIE1hdGgubWluKHlhMiwgeWIyKSAtIE1hdGgubWF4KHlhMSwgeWIxKSlcclxuICAgICAgICBjb25zdCB1bmlvbiA9IHNhICsgc2IgLSBzaVxyXG4gICAgICAgIHJldHVybiBzaSAvIHVuaW9uXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwbGFjZSBpbmRpY2F0b3IgaW4gdGhlIHNvcnRhYmxlIGxpc3QgYWNjb3JkaW5nIHRvIG9wdGlvbnMuc29ydFxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nIGVsZW1lbnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9wbGFjZUluTGlzdChzb3J0YWJsZSwgZHJhZ2dpbmcpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMuc29ydClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuX3BsYWNlSW5Tb3J0YWJsZUxpc3Qoc29ydGFibGUsIGRyYWdnaW5nKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLl9wbGFjZUluT3JkZXJlZExpc3Qoc29ydGFibGUsIGRyYWdnaW5nKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfdHJhdmVyc2VDaGlsZHJlbihiYXNlLCBzZWFyY2gsIHJlc3VsdHMpXHJcbiAgICB7XHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgYmFzZS5jaGlsZHJlbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChzZWFyY2gubGVuZ3RoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2VhcmNoLmluZGV4T2YoY2hpbGQuY2xhc3NOYW1lKSAhPT0gLTEpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGNoaWxkKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3RyYXZlcnNlQ2hpbGRyZW4oY2hpbGQsIHNlYXJjaCwgcmVzdWx0cylcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmaW5kIGNoaWxkcmVuIGluIGRpdlxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29yZGVyXSBzZWFyY2ggZm9yIGRyYWdPcmRlciBhcyB3ZWxsXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZ2V0Q2hpbGRyZW4oc29ydGFibGUsIG9yZGVyKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLmRlZXBTZWFyY2gpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgc2VhcmNoID0gW11cclxuICAgICAgICAgICAgaWYgKG9yZGVyICYmIHNvcnRhYmxlLm9wdGlvbnMub3JkZXJDbGFzcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaC5wdXNoKHNvcnRhYmxlLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKG9yZGVyICYmIHNvcnRhYmxlLm9wdGlvbnMub3JkZXJDbGFzcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2gucHVzaChzb3J0YWJsZS5vcHRpb25zLm9yZGVyQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoIW9yZGVyICYmIHNvcnRhYmxlLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzZWFyY2gucHVzaChzb3J0YWJsZS5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCByZXN1bHRzID0gW11cclxuICAgICAgICAgICAgdGhpcy5fdHJhdmVyc2VDaGlsZHJlbihzb3J0YWJsZS5lbGVtZW50LCBzZWFyY2gsIHJlc3VsdHMpXHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGV0IGxpc3QgPSBbXVxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2Ygc29ydGFibGUuZWxlbWVudC5jaGlsZHJlbilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fY29udGFpbnNDbGFzc05hbWUoY2hpbGQsIHNvcnRhYmxlLm9wdGlvbnMuZHJhZ0NsYXNzKSB8fCAoKG9yZGVyIHx8ICFzb3J0YWJsZS5vcHRpb25zLm9yZGVyQ2xhc3MpIHx8IChvcmRlciAmJiBzb3J0YWJsZS5vcHRpb25zLm9yZGVyQ2xhc3MgJiYgdGhpcy5fY29udGFpbnNDbGFzc05hbWUoY2hpbGQsIHNvcnRhYmxlLm9wdGlvbnMub3JkZXJDbGFzcykpKSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpc3QucHVzaChjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbGlzdFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNvcnRhYmxlLmVsZW1lbnQuY2hpbGRyZW5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBsYWNlIGluZGljYXRvciBpbiBhbiBvcmRlcmVkIGxpc3RcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BsYWNlSW5PcmRlcmVkTGlzdChzb3J0YWJsZSwgZHJhZ2dpbmcpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgaWQgPSBzb3J0YWJsZS5vcHRpb25zLm9yZGVySWRcclxuICAgICAgICBkcmFnZ2luZy5pbmRpY2F0b3IucmVtb3ZlKClcclxuICAgICAgICBzb3J0YWJsZS5pbmRpY2F0b3IgPSBkcmFnZ2luZy5pbmRpY2F0b3JcclxuICAgICAgICBsZXQgZHJhZ09yZGVyID0gc29ydGFibGUuaW5kaWNhdG9yLmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICBkcmFnT3JkZXIgPSBzb3J0YWJsZS5vcHRpb25zLm9yZGVySWRJc051bWJlciA/IHBhcnNlRmxvYXQoZHJhZ09yZGVyKSA6IGRyYWdPcmRlclxyXG4gICAgICAgIGxldCBmb3VuZFxyXG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5fZ2V0Q2hpbGRyZW4oc29ydGFibGUsIHRydWUpXHJcbiAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMucmV2ZXJzZU9yZGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZCA9IGNoaWxkcmVuW2ldXHJcbiAgICAgICAgICAgICAgICBsZXQgY2hpbGREcmFnT3JkZXIgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgICAgICAgICBjaGlsZERyYWdPcmRlciA9IHNvcnRhYmxlLm9wdGlvbnMub3JkZXJJc051bWJlciA/IHBhcnNlRmxvYXQoY2hpbGREcmFnT3JkZXIpIDogY2hpbGREcmFnT3JkZXJcclxuICAgICAgICAgICAgICAgIGlmIChkcmFnT3JkZXIgPiBjaGlsZERyYWdPcmRlcilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShzb3J0YWJsZS5pbmRpY2F0b3IsIGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldEljb24oZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgY2hpbGRyZW4pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxldCBjaGlsZERyYWdPcmRlciA9IGNoaWxkLmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICAgICAgICAgIGNoaWxkRHJhZ09yZGVyID0gc29ydGFibGUub3B0aW9ucy5vcmRlcklzTnVtYmVyID8gcGFyc2VGbG9hdChjaGlsZERyYWdPcmRlcikgOiBjaGlsZERyYWdPcmRlclxyXG4gICAgICAgICAgICAgICAgaWYgKGRyYWdPcmRlciA8IGNoaWxkRHJhZ09yZGVyKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHNvcnRhYmxlLmluZGljYXRvciwgY2hpbGQpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0SWNvbihkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWZvdW5kKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc29ydGFibGUuZWxlbWVudC5hcHBlbmRDaGlsZChzb3J0YWJsZS5pbmRpY2F0b3IpXHJcbiAgICAgICAgICAgIHRoaXMuX3NldEljb24oZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGZpbmQgbGFzdCBjaGlsZCB0aGF0IGlzIG9mIHR5cGUgZHJhZ0NsYXNzIChpZiBzZXQpXHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2dldExhc3RDaGlsZChzb3J0YWJsZSlcclxuICAgIHtcclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5kZWVwU2VhcmNoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3Qgc2VhcmNoID0gW11cclxuICAgICAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzZWFyY2gucHVzaChzb3J0YWJsZS5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCByZXN1bHRzID0gW11cclxuICAgICAgICAgICAgdGhpcy5fdHJhdmVyc2VDaGlsZHJlbihzb3J0YWJsZS5lbGVtZW50LCBzZWFyY2gsIHJlc3VsdHMpXHJcbiAgICAgICAgICAgIGlmIChyZXN1bHRzLmxlbmd0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHNbcmVzdWx0cy5sZW5ndGggLSAxXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSBzb3J0YWJsZS5lbGVtZW50LmNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gc29ydGFibGUuZWxlbWVudC5jaGlsZHJlbltpXVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9jb250YWluc0NsYXNzTmFtZShjaGlsZCwgc29ydGFibGUub3B0aW9ucy5kcmFnQ2xhc3MpKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNoaWxkXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZS5lbGVtZW50LmNoaWxkcmVuLmxlbmd0aClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc29ydGFibGUuZWxlbWVudC5jaGlsZHJlbltzb3J0YWJsZS5lbGVtZW50LmNoaWxkcmVuLmxlbmd0aCAtIDFdXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNldCBpY29uIGlmIGF2YWlsYWJsZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmdcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfc2V0SWNvbihkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGRyYWdnaW5nLmljb24pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5pY29uLnNyYyA9IGRyYWdnaW5nLm9yaWdpbmFsID09PSBzb3J0YWJsZSA/IHNvcnRhYmxlLm9wdGlvbnMuaWNvbnMucmVvcmRlciA6IHNvcnRhYmxlLm9wdGlvbnMuaWNvbnMubW92ZVxyXG4gICAgICAgICAgICBkcmFnZ2luZy5jdXJyZW50ID0gc29ydGFibGVcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRyYWdnaW5nLm9yaWdpbmFsID09PSBzb3J0YWJsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ29yZGVyLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ3VwZGF0ZS1wZW5kaW5nJywgc29ydGFibGUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ2FkZC1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICBkcmFnZ2luZy5vcmlnaW5hbC5lbWl0KCdyZW1vdmUtcGVuZGluZycsIGRyYWdnaW5nLCBkcmFnZ2luZy5vcmlnaW5hbClcclxuICAgICAgICAgICAgc29ydGFibGUuZW1pdCgndXBkYXRlLXBlbmRpbmcnKVxyXG4gICAgICAgICAgICBkcmFnZ2luZy5vcmlnaW5hbC5lbWl0KCd1cGRhdGUtcGVuZGluZycpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGxhY2UgaW5kaWNhdG9yIGluIGFuIHNvcnRhYmxlIGxpc3RcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BsYWNlSW5Tb3J0YWJsZUxpc3Qoc29ydGFibGUsIGRyYWdnaW5nKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBzb3J0YWJsZS5lbGVtZW50XHJcbiAgICAgICAgc29ydGFibGUuZWxlbWVudC5hcHBlbmRDaGlsZChkcmFnZ2luZy5pbmRpY2F0b3IpXHJcbiAgICAgICAgc29ydGFibGUuaW5kaWNhdG9yID0gZHJhZ2dpbmcuaW5kaWNhdG9yXHJcbiAgICAgICAgY29uc3QgbGFzdENoaWxkID0gdGhpcy5fZ2V0TGFzdENoaWxkKHNvcnRhYmxlKVxyXG4gICAgICAgIGlmICghbGFzdENoaWxkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChzb3J0YWJsZS5pbmRpY2F0b3IpXHJcbiAgICAgICAgICAgIHRoaXMuX3NldEljb24oZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcub2Zmc2V0VG9wID49IGVsZW1lbnQub2Zmc2V0VG9wICsgZWxlbWVudC5vZmZzZXRIZWlnaHQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoc29ydGFibGUuaW5kaWNhdG9yKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0SWNvbihkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoZHJhZ2dpbmcub2Zmc2V0VG9wICsgZHJhZ2dpbmcub2Zmc2V0SGVpZ2h0IDwgZWxlbWVudC5vZmZzZXRUb3ApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKHNvcnRhYmxlLmluZGljYXRvciwgZWxlbWVudC5maXJzdENoaWxkKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0SWNvbihkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB4YTEgPSBkcmFnZ2luZy5vZmZzZXRMZWZ0XHJcbiAgICAgICAgICAgICAgICBjb25zdCB5YTEgPSBkcmFnZ2luZy5vZmZzZXRUb3BcclxuICAgICAgICAgICAgICAgIGNvbnN0IHhhMiA9IGRyYWdnaW5nLm9mZnNldExlZnQgKyBkcmFnZ2luZy5vZmZzZXRXaWR0aFxyXG4gICAgICAgICAgICAgICAgY29uc3QgeWEyID0gZHJhZ2dpbmcub2Zmc2V0VG9wICsgZHJhZ2dpbmcub2Zmc2V0SGVpZ2h0XHJcbiAgICAgICAgICAgICAgICBsZXQgbGFyZ2VzdCA9IDAsIGNsb3Nlc3QsIGlzQmVmb3JlID0gdHJ1ZSwgaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICBjb25zdCBzZWFyY2ggPSBbXVxyXG4gICAgICAgICAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaC5wdXNoKHNvcnRhYmxlLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMub3JkZXJDbGFzcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2gucHVzaChzb3J0YWJsZS5vcHRpb25zLm9yZGVyQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCBlbGVtZW50cyA9IHRoaXMuX2dldENoaWxkcmVuKHNvcnRhYmxlLCB0cnVlKVxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgZWxlbWVudHMpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkID09PSBzb3J0YWJsZS5pbmRpY2F0b3IpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRpY2F0b3IgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvcyA9IHRvR2xvYmFsKGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHhiMSA9IHBvcy54XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeWIxID0gcG9zLnlcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB4YjIgPSBwb3MueCArIGNoaWxkLm9mZnNldFdpZHRoXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeWIyID0gcG9zLnkgKyBjaGlsZC5vZmZzZXRIZWlnaHRcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwZXJjZW50YWdlID0gdGhpcy5fcGVyY2VudGFnZSh4YTEsIHlhMSwgeGEyLCB5YTIsIHhiMSwgeWIxLCB4YjIsIHliMilcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGVyY2VudGFnZSA+IGxhcmdlc3QpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJnZXN0ID0gcGVyY2VudGFnZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9zZXN0ID0gY2hpbGRcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXNCZWZvcmUgPSBpbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoY2xvc2VzdCAmJiBjbG9zZXN0ICE9PSBzb3J0YWJsZS5pbmRpY2F0b3IpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzQmVmb3JlKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5pbnNlcnRCZWZvcmUoc29ydGFibGUuaW5kaWNhdG9yLCBjbG9zZXN0Lm5leHRTaWJsaW5nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRJY29uKGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnb3JkZXItcGVuZGluZycsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lmluc2VydEJlZm9yZShzb3J0YWJsZS5pbmRpY2F0b3IsIGNsb3Nlc3QpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldEljb24oZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdvcmRlci1wZW5kaW5nJywgc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZHJhZ2dpbmcuaW5kaWNhdG9yKVxyXG4gICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlLmluZGljYXRvciA9IGRyYWdnaW5nLmluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldEljb24oZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIG1vdmVcclxuICAgICAqIEBwYXJhbSB7VUlFdmVudH0gZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2RyYWdNb3ZlKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZHJhZ2dpbmcucGlja3VwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fZGlzdGFuY2UodGhpcy5kcmFnZ2luZy5zdGFydC54LCB0aGlzLmRyYWdnaW5nLnN0YXJ0LnksIGUucGFnZVgsIGUucGFnZVkpID4gdGhpcy5vcHRpb25zLnRocmVzaG9sZClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9waWNrdXAoZSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLmxlZnQgPSBlLnBhZ2VYICsgdGhpcy5vZmZzZXQueCArICdweCdcclxuICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5zdHlsZS50b3AgPSBlLnBhZ2VZICsgdGhpcy5vZmZzZXQueSArICdweCdcclxuICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmcuaWNvbilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5pY29uLnN0eWxlLmxlZnQgPSBlLnBhZ2VYICsgdGhpcy5vZmZzZXQueCArIHRoaXMuZHJhZ2dpbmcub2Zmc2V0V2lkdGggKyAncHgnXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLmljb24uc3R5bGUudG9wID0gZS5wYWdlWSArIHRoaXMub2Zmc2V0LnkgKyB0aGlzLmRyYWdnaW5nLm9mZnNldEhlaWdodCArICdweCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gW11cclxuICAgICAgICAgICAgZm9yIChsZXQgc29ydGFibGUgb2YgU29ydGFibGUubGlzdClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMubmFtZSA9PT0gdGhpcy5vcHRpb25zLm5hbWUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGlzdC5wdXNoKHNvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hbHdheXNJbkxpc3QgfHwgdGhpcy5faW5zaWRlKHRoaXMuZHJhZ2dpbmcsIHRoaXMuZWxlbWVudCkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5zb3J0YWJsZSA9IHRoaXNcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9wbGFjZUluTGlzdCh0aGlzLCB0aGlzLmRyYWdnaW5nKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuaW5kaWNhdG9yLnJlbW92ZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmcuaWNvbilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuaWNvbi5zcmMgPSB0aGlzLm9wdGlvbnMuaWNvbnMuZGVsZXRlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2xvc2VzdCA9IHRoaXMuX2ZpbmRDbG9zZXN0KGUsIHRoaXMuZHJhZ2dpbmcsIGxpc3QpXHJcbiAgICAgICAgICAgICAgICBpZiAoY2xvc2VzdClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLnNvcnRhYmxlID0gY2xvc2VzdFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3BsYWNlSW5MaXN0KGNsb3Nlc3QsIHRoaXMuZHJhZ2dpbmcpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5zb3J0YWJsZSA9IG51bGxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLmluZGljYXRvci5yZW1vdmUoKVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmRyYWdnaW5nLmljb24pXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLmljb24uc3JjID0gdGhpcy5vcHRpb25zLmljb25zLmRlbGV0ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSB1cFxyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZHJhZ1VwKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kcmFnZ2luZy5waWNrdXApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuc3R5bGUucG9zaXRpb24gPSAndW5zZXQnXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLnpJbmRleCA9ICd1bnNldCdcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuc3R5bGUuYm94U2hhZG93ID0gJ3Vuc2V0J1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5zdHlsZS5vcGFjaXR5ID0gJ3Vuc2V0J1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5kaWNhdG9yLnBhcmVudE5vZGUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3IucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGhpcy5kcmFnZ2luZywgdGhpcy5pbmRpY2F0b3IpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5vcmlnaW5hbCA9IHRoaXMuZHJhZ2dpbmcuY3VycmVudFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5kaWNhdG9yLnJlbW92ZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3IgPSBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmcub3JpZ2luYWwgPT09IHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ29yZGVyJywgdGhpcy5kcmFnZ2luZywgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCd1cGRhdGUnLCB0aGlzLmRyYWdnaW5nLCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLm9yaWdpbmFsLmVtaXQoJ3JlbW92ZScsIHRoaXMuZHJhZ2dpbmcsIHRoaXMuZHJhZ2dpbmcub3JpZ2luYWwpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcub3JpZ2luYWwuZW1pdCgndXBkYXRlJywgdGhpcy5kcmFnZ2luZywgdGhpcy5kcmFnZ2luZy5vcmlnaW5hbClcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5zb3J0YWJsZS5lbWl0KCdhZGQnLCB0aGlzLmRyYWdnaW5nLCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLnNvcnRhYmxlLmVtaXQoJ3VwZGF0ZScsIHRoaXMuZHJhZ2dpbmcsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcucmVtb3ZlKClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLm9yaWdpbmFsID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5kaWNhdG9yLnJlbW92ZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3IgPSBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5vcmlnaW5hbC5lbWl0KCdyZW1vdmUnLCB0aGlzLmRyYWdnaW5nLCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmcuaWNvbilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLmljb24ucmVtb3ZlKClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgnY2xpY2tlZCcsIHRoaXMuZHJhZ2dpbmcsIHRoaXMpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5kcmFnZ2luZyA9IG51bGxcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdGhlIGdsb2JhbCBkZWZhdWx0cyBmb3IgbmV3IFNvcnRhYmxlIG9iamVjdHNcclxuICAgICAqIEB0eXBlIHtEZWZhdWx0T3B0aW9uc31cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldCBkZWZhdWx0cygpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjcmVhdGUgbXVsdGlwbGUgc29ydGFibGUgZWxlbWVudHNcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnRzW119IGVsZW1lbnRzXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyAtIHNlZSBjb25zdHJ1Y3RvciBmb3Igb3B0aW9uc1xyXG4gICAgICovXHJcbiAgICBzdGF0aWMgY3JlYXRlKGVsZW1lbnRzLCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXVxyXG4gICAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgZWxlbWVudHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXN1bHRzLnB1c2gobmV3IFNvcnRhYmxlKGVsZW1lbnQsIG9wdGlvbnMpKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0c1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNvcnRhYmxlXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIGNsaWNrZWQgYnV0IG5vdCBtb3ZlZCBiZXlvbmQgdGhlIG9wdGlvbnMudGhyZXNob2xkXHJcbiAqIEBldmVudCBTb3J0YWJsZSNjbGlja2VkXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgY2xpY2tlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSBjb250YWluaW5nIGVsZW1lbnRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIHBpY2tlZCB1cCBiZWNhdXNlIGl0IHdhcyBtb3ZlZCBiZXlvbmQgdGhlIG9wdGlvbnMudGhyZXNob2xkXHJcbiAqIEBldmVudCBTb3J0YWJsZSNwaWNrdXBcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBzb3J0YWJsZSBpcyByZW9yZGVyZWRcclxuICogQGV2ZW50IFNvcnRhYmxlI29yZGVyXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgdGhhdCB3YXMgcmVvcmRlcmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIHBsYWNlZFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgYWRkZWQgdG8gdGhpcyBzb3J0YWJsZVxyXG4gKiBAZXZlbnQgU29ydGFibGUjYWRkXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgYWRkZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgYWRkZWRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIHJlbW92ZWQgZnJvbSB0aGlzIHNvcnRhYmxlXHJcbiAqIEBldmVudCBTb3J0YWJsZSNyZW1vdmVcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCByZW1vdmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIHJlbW92ZWRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiB0aGUgc29ydGFibGUgaXMgdXBkYXRlZCB3aXRoIGFuIGFkZCwgcmVtb3ZlLCBvciBvcmRlciBjaGFuZ2VcclxuICogQGV2ZW50IFNvcnRhYmxlI3VwZGF0ZVxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGNoYW5nZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2l0aCBlbGVtZW50XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gb3JkZXIgd2FzIGNoYW5nZWQgYnV0IGVsZW1lbnQgd2FzIG5vdCBkcm9wcGVkIHlldFxyXG4gKiBAZXZlbnQgU29ydGFibGUjb3JkZXItcGVuZGluZ1xyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBlbGVtZW50IGlzIGFkZGVkIGJ1dCBub3QgZHJvcHBlZCB5ZXRcclxuICogQGV2ZW50IFNvcnRhYmxlI2FkZC1wZW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgYmVpbmcgZHJhZ2dlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBjdXJyZW50IHNvcnRhYmxlIHdpdGggZWxlbWVudCBwbGFjZWhvbGRlclxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGVsZW1lbnQgaXMgcmVtb3ZlZCBidXQgbm90IGRyb3BwZWQgeWV0XHJcbiAqIEBldmVudCBTb3J0YWJsZSNyZW1vdmUtcGVuZGluZ1xyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIGFkZGVkLCByZW1vdmVkLCBvciByZW9yZGVyIGJ1dCBlbGVtZW50IGhhcyBub3QgZHJvcHBlZCB5ZXRcclxuICogQGV2ZW50IFNvcnRhYmxlI3VwZGF0ZS1wZW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgYmVpbmcgZHJhZ2dlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBjdXJyZW50IHNvcnRhYmxlIHdpdGggZWxlbWVudCBwbGFjZWhvbGRlclxyXG4gKi8iXX0=