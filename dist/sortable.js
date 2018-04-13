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
        if (this.options.sort) {
            if (typeof index === 'undefined' || index >= this.element.children.length) {
                this.element.appendChild(element);
            } else {
                this.element.insertBefore(element, this.element.children[index + 1]);
            }
        } else {
            const id = this.options.orderId;
            let dragOrder = element.getAttribute(id);
            dragOrder = this.options.orderIdIsNumber ? parseFloat(dragOrder) : dragOrder;
            let found;
            const children = this._getChildren(this, true);
            if (this.options.reverseOrder) {
                for (let i = children.length - 1; i >= 0; i--) {
                    const child = children[i];
                    let childDragOrder = child.getAttribute(id);
                    childDragOrder = this.options.orderIsNumber ? parseFloat(childDragOrder) : childDragOrder;
                    if (dragOrder > childDragOrder) {
                        child.parentNode.insertBefore(element, child);
                        found = true;
                        break;
                    }
                }
            } else {
                for (let child of children) {
                    let childDragOrder = child.getAttribute(id);
                    childDragOrder = this.options.orderIsNumber ? parseFloat(childDragOrder) : childDragOrder;
                    if (dragOrder < childDragOrder) {
                        child.parentNode.insertBefore(element, child);
                        found = true;
                        break;
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
        if (dragging.current && dragging.current !== sortable) {
            dragging.current.emit('remove-pending', dragging, dragging.current);
        }
        if (dragging.icon) {
            dragging.icon.src = dragging.original === sortable ? sortable.options.icons.reorder : sortable.options.icons.move;
            dragging.current = sortable;
        }
        if (dragging.original === sortable) {
            sortable.emit('order-pending', dragging, sortable);
            sortable.emit('update-pending', sortable);
        } else {
            sortable.emit('add-pending', dragging, sortable);
            sortable.emit('update-pending');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3J0YWJsZS5qcyJdLCJuYW1lcyI6WyJFdmVudHMiLCJyZXF1aXJlIiwidG9HbG9iYWwiLCJkZWZhdWx0cyIsIlNvcnRhYmxlIiwiY29uc3RydWN0b3IiLCJlbGVtZW50Iiwib3B0aW9ucyIsIm9wdGlvbiIsInNvcnRhYmxlIiwiZWxlbWVudHMiLCJfZ2V0Q2hpbGRyZW4iLCJjaGlsZCIsImRyYWdDbGFzcyIsIl9jb250YWluc0NsYXNzTmFtZSIsIl9faXNTb3J0YWJsZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJlIiwiX2RyYWdTdGFydCIsImNoaWxkcmVuU3R5bGVzIiwic3R5bGUiLCJvcmlnaW5hbCIsImRvY3VtZW50IiwiYm9keSIsIl9kcmFnTW92ZSIsIl9kcmFnVXAiLCJsaXN0IiwicHVzaCIsIm5hbWUiLCJjbGFzc05hbWUiLCJzcGxpdCIsImVudHJ5IiwiYWRkIiwiaW5kZXgiLCJhdHRhY2hFbGVtZW50Iiwic29ydCIsImNoaWxkcmVuIiwibGVuZ3RoIiwiYXBwZW5kQ2hpbGQiLCJpbnNlcnRCZWZvcmUiLCJpZCIsIm9yZGVySWQiLCJkcmFnT3JkZXIiLCJnZXRBdHRyaWJ1dGUiLCJvcmRlcklkSXNOdW1iZXIiLCJwYXJzZUZsb2F0IiwiZm91bmQiLCJyZXZlcnNlT3JkZXIiLCJpIiwiY2hpbGREcmFnT3JkZXIiLCJvcmRlcklzTnVtYmVyIiwicGFyZW50Tm9kZSIsImRyYWdnaW5nIiwiY3VycmVudFRhcmdldCIsInBpY2t1cCIsInN0YXJ0IiwieCIsInBhZ2VYIiwieSIsInBhZ2VZIiwiY3Vyc29yIiwicHJldmVudERlZmF1bHQiLCJfcGlja3VwIiwiaW5kaWNhdG9yIiwiY2xvbmVOb2RlIiwicG9zIiwicG9zaXRpb24iLCJvZmZzZXQiLCJsZWZ0IiwidG9wIiwiZHJhZ1N0eWxlIiwidXNlSWNvbnMiLCJpbWFnZSIsIkltYWdlIiwic3JjIiwiaWNvbnMiLCJyZW9yZGVyIiwidHJhbnNmb3JtIiwib2Zmc2V0V2lkdGgiLCJvZmZzZXRIZWlnaHQiLCJpY29uIiwiZW1pdCIsIl9kaXN0YW5jZSIsIngxIiwieTEiLCJ4MiIsInkyIiwiTWF0aCIsInNxcnQiLCJwb3ciLCJfZGlzdGFuY2VUb0Nsb3Nlc3RDb3JuZXIiLCJ0b3BMZWZ0Iiwib2Zmc2V0TGVmdCIsIm9mZnNldFRvcCIsInRvcFJpZ2h0IiwiYm90dG9tTGVmdCIsImJvdHRvbVJpZ2h0IiwibWluIiwiX2luc2lkZSIsIncxIiwiaDEiLCJ3MiIsImgyIiwiX2ZpbmRDbG9zZXN0IiwiSW5maW5pdHkiLCJyZWxhdGVkIiwiYWx3YXlzSW5MaXN0IiwiY2FsY3VsYXRlIiwiX3BlcmNlbnRhZ2UiLCJ4YTEiLCJ5YTEiLCJ4YTIiLCJ5YTIiLCJ4YjEiLCJ5YjEiLCJ4YjIiLCJ5YjIiLCJzYSIsInNiIiwic2kiLCJtYXgiLCJ1bmlvbiIsIl9wbGFjZUluTGlzdCIsIl9wbGFjZUluU29ydGFibGVMaXN0IiwiX3BsYWNlSW5PcmRlcmVkTGlzdCIsIl90cmF2ZXJzZUNoaWxkcmVuIiwiYmFzZSIsInNlYXJjaCIsInJlc3VsdHMiLCJpbmRleE9mIiwib3JkZXIiLCJkZWVwU2VhcmNoIiwib3JkZXJDbGFzcyIsInJlbW92ZSIsIl9zZXRJY29uIiwiX2dldExhc3RDaGlsZCIsImN1cnJlbnQiLCJtb3ZlIiwibGFzdENoaWxkIiwiZmlyc3RDaGlsZCIsImxhcmdlc3QiLCJjbG9zZXN0IiwiaXNCZWZvcmUiLCJwZXJjZW50YWdlIiwibmV4dFNpYmxpbmciLCJ0aHJlc2hvbGQiLCJkZWxldGUiLCJzdG9wUHJvcGFnYXRpb24iLCJ6SW5kZXgiLCJib3hTaGFkb3ciLCJvcGFjaXR5IiwiY3JlYXRlIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTUEsU0FBU0MsUUFBUSxlQUFSLENBQWY7O0FBRUEsTUFBTUMsV0FBV0QsUUFBUSxZQUFSLENBQWpCO0FBQ0EsTUFBTUUsV0FBV0YsUUFBUSxXQUFSLENBQWpCOztBQUVBLE1BQU1HLFFBQU4sU0FBdUJKLE1BQXZCLENBQ0E7QUFDSTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE2QkFLLGdCQUFZQyxPQUFaLEVBQXFCQyxPQUFyQixFQUNBO0FBQ0k7QUFDQSxhQUFLQSxPQUFMLEdBQWVBLFdBQVcsRUFBMUI7QUFDQSxhQUFLLElBQUlDLE1BQVQsSUFBbUJMLFFBQW5CLEVBQ0E7QUFDSSxpQkFBS0ksT0FBTCxDQUFhQyxNQUFiLElBQXVCLE9BQU8sS0FBS0QsT0FBTCxDQUFhQyxNQUFiLENBQVAsS0FBZ0MsV0FBaEMsR0FBOENELFFBQVFDLE1BQVIsQ0FBOUMsR0FBZ0VMLFNBQVNLLE1BQVQsQ0FBdkY7QUFDSDtBQUNELGFBQUtGLE9BQUwsR0FBZUEsT0FBZjtBQUNBLGFBQUtBLE9BQUwsQ0FBYUcsUUFBYixHQUF3QixJQUF4QjtBQUNBLGNBQU1DLFdBQVcsS0FBS0MsWUFBTCxDQUFrQixJQUFsQixDQUFqQjtBQUNBLGFBQUssSUFBSUMsS0FBVCxJQUFrQkYsUUFBbEIsRUFDQTtBQUNJLGdCQUFJLENBQUMsS0FBS0gsT0FBTCxDQUFhTSxTQUFkLElBQTJCLEtBQUtDLGtCQUFMLENBQXdCRixLQUF4QixFQUErQixLQUFLTCxPQUFMLENBQWFNLFNBQTVDLENBQS9CLEVBQ0E7QUFDSUQsc0JBQU1HLFlBQU4sR0FBcUIsSUFBckI7QUFDQUgsc0JBQU1JLGdCQUFOLENBQXVCLFdBQXZCLEVBQXFDQyxDQUFELElBQU8sS0FBS0MsVUFBTCxDQUFnQkQsQ0FBaEIsQ0FBM0M7QUFDQUwsc0JBQU1JLGdCQUFOLENBQXVCLFlBQXZCLEVBQXNDQyxDQUFELElBQU8sS0FBS0MsVUFBTCxDQUFnQkQsQ0FBaEIsQ0FBNUM7QUFDQSxxQkFBSyxJQUFJVCxNQUFULElBQW1CLEtBQUtELE9BQUwsQ0FBYVksY0FBaEMsRUFDQTtBQUNJUCwwQkFBTVEsS0FBTixDQUFZWixNQUFaLElBQXNCLEtBQUtELE9BQUwsQ0FBYVksY0FBYixDQUE0QlgsTUFBNUIsQ0FBdEI7QUFDSDtBQUNESSxzQkFBTVMsUUFBTixHQUFpQixJQUFqQjtBQUNIO0FBQ0o7QUFDREMsaUJBQVNDLElBQVQsQ0FBY1AsZ0JBQWQsQ0FBK0IsV0FBL0IsRUFBNkNDLENBQUQsSUFBTyxLQUFLTyxTQUFMLENBQWVQLENBQWYsQ0FBbkQ7QUFDQUssaUJBQVNDLElBQVQsQ0FBY1AsZ0JBQWQsQ0FBK0IsV0FBL0IsRUFBNkNDLENBQUQsSUFBTyxLQUFLTyxTQUFMLENBQWVQLENBQWYsQ0FBbkQ7QUFDQUssaUJBQVNDLElBQVQsQ0FBY1AsZ0JBQWQsQ0FBK0IsU0FBL0IsRUFBMkNDLENBQUQsSUFBTyxLQUFLUSxPQUFMLENBQWFSLENBQWIsQ0FBakQ7QUFDQUssaUJBQVNDLElBQVQsQ0FBY1AsZ0JBQWQsQ0FBK0IsYUFBL0IsRUFBK0NDLENBQUQsSUFBTyxLQUFLUSxPQUFMLENBQWFSLENBQWIsQ0FBckQ7QUFDQUssaUJBQVNDLElBQVQsQ0FBY1AsZ0JBQWQsQ0FBK0IsU0FBL0IsRUFBMkNDLENBQUQsSUFBTyxLQUFLUSxPQUFMLENBQWFSLENBQWIsQ0FBakQ7QUFDQUssaUJBQVNDLElBQVQsQ0FBY1AsZ0JBQWQsQ0FBK0IsYUFBL0IsRUFBK0NDLENBQUQsSUFBTyxLQUFLUSxPQUFMLENBQWFSLENBQWIsQ0FBckQ7O0FBRUEsWUFBSSxDQUFDYixTQUFTc0IsSUFBZCxFQUNBO0FBQ0l0QixxQkFBU3NCLElBQVQsR0FBZ0IsRUFBaEI7QUFDSDtBQUNEdEIsaUJBQVNzQixJQUFULENBQWNDLElBQWQsQ0FBbUIsSUFBbkI7QUFDSDs7QUFFRDs7Ozs7OztBQU9BYix1QkFBbUJHLENBQW5CLEVBQXNCVyxJQUF0QixFQUNBO0FBQ0ksY0FBTUYsT0FBT1QsRUFBRVksU0FBRixDQUFZQyxLQUFaLENBQWtCLEdBQWxCLENBQWI7QUFDQSxhQUFLLElBQUlDLEtBQVQsSUFBa0JMLElBQWxCLEVBQ0E7QUFDSSxnQkFBSUssVUFBVUgsSUFBZCxFQUNBO0FBQ0ksdUJBQU8sSUFBUDtBQUNIO0FBQ0o7QUFDRCxlQUFPLEtBQVA7QUFDSDs7QUFFRDs7Ozs7O0FBTUFJLFFBQUkxQixPQUFKLEVBQWEyQixLQUFiLEVBQ0E7QUFDSSxhQUFLQyxhQUFMLENBQW1CNUIsT0FBbkI7QUFDQSxZQUFJLEtBQUtDLE9BQUwsQ0FBYTRCLElBQWpCLEVBQ0E7QUFDSSxnQkFBSSxPQUFPRixLQUFQLEtBQWlCLFdBQWpCLElBQWdDQSxTQUFTLEtBQUszQixPQUFMLENBQWE4QixRQUFiLENBQXNCQyxNQUFuRSxFQUNBO0FBQ0kscUJBQUsvQixPQUFMLENBQWFnQyxXQUFiLENBQXlCaEMsT0FBekI7QUFDSCxhQUhELE1BS0E7QUFDSSxxQkFBS0EsT0FBTCxDQUFhaUMsWUFBYixDQUEwQmpDLE9BQTFCLEVBQW1DLEtBQUtBLE9BQUwsQ0FBYThCLFFBQWIsQ0FBc0JILFFBQVEsQ0FBOUIsQ0FBbkM7QUFDSDtBQUNKLFNBVkQsTUFZQTtBQUNJLGtCQUFNTyxLQUFLLEtBQUtqQyxPQUFMLENBQWFrQyxPQUF4QjtBQUNBLGdCQUFJQyxZQUFZcEMsUUFBUXFDLFlBQVIsQ0FBcUJILEVBQXJCLENBQWhCO0FBQ0FFLHdCQUFZLEtBQUtuQyxPQUFMLENBQWFxQyxlQUFiLEdBQStCQyxXQUFXSCxTQUFYLENBQS9CLEdBQXVEQSxTQUFuRTtBQUNBLGdCQUFJSSxLQUFKO0FBQ0Esa0JBQU1WLFdBQVcsS0FBS3pCLFlBQUwsQ0FBa0IsSUFBbEIsRUFBd0IsSUFBeEIsQ0FBakI7QUFDQSxnQkFBSSxLQUFLSixPQUFMLENBQWF3QyxZQUFqQixFQUNBO0FBQ0kscUJBQUssSUFBSUMsSUFBSVosU0FBU0MsTUFBVCxHQUFrQixDQUEvQixFQUFrQ1csS0FBSyxDQUF2QyxFQUEwQ0EsR0FBMUMsRUFDQTtBQUNJLDBCQUFNcEMsUUFBUXdCLFNBQVNZLENBQVQsQ0FBZDtBQUNBLHdCQUFJQyxpQkFBaUJyQyxNQUFNK0IsWUFBTixDQUFtQkgsRUFBbkIsQ0FBckI7QUFDQVMscUNBQWlCLEtBQUsxQyxPQUFMLENBQWEyQyxhQUFiLEdBQTZCTCxXQUFXSSxjQUFYLENBQTdCLEdBQTBEQSxjQUEzRTtBQUNBLHdCQUFJUCxZQUFZTyxjQUFoQixFQUNBO0FBQ0lyQyw4QkFBTXVDLFVBQU4sQ0FBaUJaLFlBQWpCLENBQThCakMsT0FBOUIsRUFBdUNNLEtBQXZDO0FBQ0FrQyxnQ0FBUSxJQUFSO0FBQ0E7QUFDSDtBQUNKO0FBQ0osYUFkRCxNQWdCQTtBQUNJLHFCQUFLLElBQUlsQyxLQUFULElBQWtCd0IsUUFBbEIsRUFDQTtBQUNJLHdCQUFJYSxpQkFBaUJyQyxNQUFNK0IsWUFBTixDQUFtQkgsRUFBbkIsQ0FBckI7QUFDQVMscUNBQWlCLEtBQUsxQyxPQUFMLENBQWEyQyxhQUFiLEdBQTZCTCxXQUFXSSxjQUFYLENBQTdCLEdBQTBEQSxjQUEzRTtBQUNBLHdCQUFJUCxZQUFZTyxjQUFoQixFQUNBO0FBQ0lyQyw4QkFBTXVDLFVBQU4sQ0FBaUJaLFlBQWpCLENBQThCakMsT0FBOUIsRUFBdUNNLEtBQXZDO0FBQ0FrQyxnQ0FBUSxJQUFSO0FBQ0E7QUFDSDtBQUNKO0FBQ0o7QUFDRCxnQkFBSSxDQUFDQSxLQUFMLEVBQ0E7QUFDSSxxQkFBS3hDLE9BQUwsQ0FBYWdDLFdBQWIsQ0FBeUJoQyxPQUF6QjtBQUNIO0FBQ0o7QUFDSjs7QUFFRDs7Ozs7QUFLQTRCLGtCQUFjNUIsT0FBZCxFQUNBO0FBQ0ksWUFBSUEsUUFBUVMsWUFBWixFQUNBO0FBQ0lULG9CQUFRZSxRQUFSLEdBQW1CLElBQW5CO0FBQ0gsU0FIRCxNQUtBO0FBQ0lmLG9CQUFRUyxZQUFSLEdBQXVCLElBQXZCO0FBQ0FULG9CQUFRVSxnQkFBUixDQUF5QixXQUF6QixFQUF1Q0MsQ0FBRCxJQUFPLEtBQUtDLFVBQUwsQ0FBZ0JELENBQWhCLENBQTdDO0FBQ0FYLG9CQUFRVSxnQkFBUixDQUF5QixZQUF6QixFQUF3Q0MsQ0FBRCxJQUFPLEtBQUtDLFVBQUwsQ0FBZ0JELENBQWhCLENBQTlDO0FBQ0EsaUJBQUssSUFBSVQsTUFBVCxJQUFtQixLQUFLRCxPQUFMLENBQWFZLGNBQWhDLEVBQ0E7QUFDSWIsd0JBQVFjLEtBQVIsQ0FBY1osTUFBZCxJQUF3QixLQUFLRCxPQUFMLENBQWFZLGNBQWIsQ0FBNEJYLE1BQTVCLENBQXhCO0FBQ0g7QUFDREYsb0JBQVFlLFFBQVIsR0FBbUIsSUFBbkI7QUFDSDtBQUNKOztBQUVEOzs7OztBQUtBSCxlQUFXRCxDQUFYLEVBQ0E7QUFDSSxhQUFLbUMsUUFBTCxHQUFnQm5DLEVBQUVvQyxhQUFsQjtBQUNBLGFBQUtELFFBQUwsQ0FBY0UsTUFBZCxHQUF1QixLQUF2QjtBQUNBLGFBQUtGLFFBQUwsQ0FBY0csS0FBZCxHQUFzQixFQUFFQyxHQUFHdkMsRUFBRXdDLEtBQVAsRUFBY0MsR0FBR3pDLEVBQUUwQyxLQUFuQixFQUF0QjtBQUNBLGFBQUtQLFFBQUwsQ0FBY2hDLEtBQWQsQ0FBb0J3QyxNQUFwQixHQUE2QixXQUE3QjtBQUNBM0MsVUFBRTRDLGNBQUY7QUFDSDs7QUFFRDs7Ozs7QUFLQUMsWUFBUTdDLENBQVIsRUFDQTtBQUNJLGFBQUs4QyxTQUFMLEdBQWlCLEtBQUtYLFFBQUwsQ0FBY1ksU0FBZCxDQUF3QixJQUF4QixDQUFqQjtBQUNBLGFBQUtaLFFBQUwsQ0FBY1csU0FBZCxHQUEwQixLQUFLQSxTQUEvQjtBQUNBLGNBQU1FLE1BQU0vRCxTQUFTLEtBQUtrRCxRQUFkLENBQVo7QUFDQSxhQUFLQSxRQUFMLENBQWNoQyxLQUFkLENBQW9COEMsUUFBcEIsR0FBK0IsVUFBL0I7QUFDQSxhQUFLQyxNQUFMLEdBQWMsRUFBRVgsR0FBR1MsSUFBSVQsQ0FBSixHQUFRdkMsRUFBRXdDLEtBQWYsRUFBc0JDLEdBQUdPLElBQUlQLENBQUosR0FBUXpDLEVBQUUwQyxLQUFuQyxFQUFkO0FBQ0EsYUFBS1AsUUFBTCxDQUFjaEMsS0FBZCxDQUFvQmdELElBQXBCLEdBQTJCSCxJQUFJVCxDQUFKLEdBQVEsSUFBbkM7QUFDQSxhQUFLSixRQUFMLENBQWNoQyxLQUFkLENBQW9CaUQsR0FBcEIsR0FBMEJKLElBQUlQLENBQUosR0FBUSxJQUFsQztBQUNBLGFBQUssSUFBSWxELE1BQVQsSUFBbUIsS0FBS0QsT0FBTCxDQUFhK0QsU0FBaEMsRUFDQTtBQUNJLGlCQUFLbEIsUUFBTCxDQUFjaEMsS0FBZCxDQUFvQlosTUFBcEIsSUFBOEIsS0FBS0QsT0FBTCxDQUFhK0QsU0FBYixDQUF1QjlELE1BQXZCLENBQTlCO0FBQ0g7QUFDRCxhQUFLNEMsUUFBTCxDQUFjRCxVQUFkLENBQXlCWixZQUF6QixDQUFzQyxLQUFLd0IsU0FBM0MsRUFBc0QsS0FBS1gsUUFBM0Q7QUFDQTlCLGlCQUFTQyxJQUFULENBQWNlLFdBQWQsQ0FBMEIsS0FBS2MsUUFBL0I7QUFDQSxZQUFJLEtBQUs3QyxPQUFMLENBQWFnRSxRQUFqQixFQUNBO0FBQ0ksa0JBQU1DLFFBQVEsSUFBSUMsS0FBSixFQUFkO0FBQ0FELGtCQUFNRSxHQUFOLEdBQVksS0FBS25FLE9BQUwsQ0FBYW9FLEtBQWIsQ0FBbUJDLE9BQS9CO0FBQ0FKLGtCQUFNcEQsS0FBTixDQUFZOEMsUUFBWixHQUF1QixVQUF2QjtBQUNBTSxrQkFBTXBELEtBQU4sQ0FBWXlELFNBQVosR0FBd0IsdUJBQXhCO0FBQ0FMLGtCQUFNcEQsS0FBTixDQUFZZ0QsSUFBWixHQUFtQkgsSUFBSVQsQ0FBSixHQUFRLEtBQUtKLFFBQUwsQ0FBYzBCLFdBQXRCLEdBQW9DLElBQXZEO0FBQ0FOLGtCQUFNcEQsS0FBTixDQUFZaUQsR0FBWixHQUFrQkosSUFBSVAsQ0FBSixHQUFRLEtBQUtOLFFBQUwsQ0FBYzJCLFlBQXRCLEdBQXFDLElBQXZEO0FBQ0F6RCxxQkFBU0MsSUFBVCxDQUFjZSxXQUFkLENBQTBCa0MsS0FBMUI7QUFDQSxpQkFBS3BCLFFBQUwsQ0FBYzRCLElBQWQsR0FBcUJSLEtBQXJCO0FBQ0g7QUFDRCxhQUFLcEIsUUFBTCxDQUFjRSxNQUFkLEdBQXVCLElBQXZCO0FBQ0EsYUFBSzJCLElBQUwsQ0FBVSxRQUFWLEVBQW9CLEtBQUs3QixRQUF6QixFQUFtQyxJQUFuQztBQUNIOztBQUVEOzs7Ozs7OztBQVFBOEIsY0FBVUMsRUFBVixFQUFjQyxFQUFkLEVBQWtCQyxFQUFsQixFQUFzQkMsRUFBdEIsRUFDQTtBQUNJLGVBQU9DLEtBQUtDLElBQUwsQ0FBVUQsS0FBS0UsR0FBTCxDQUFTTixLQUFLRSxFQUFkLEVBQWtCLENBQWxCLElBQXVCRSxLQUFLRSxHQUFMLENBQVNMLEtBQUtFLEVBQWQsRUFBa0IsQ0FBbEIsQ0FBakMsQ0FBUDtBQUNIOztBQUVEOzs7Ozs7QUFNQUksNkJBQXlCekUsQ0FBekIsRUFBNEJYLE9BQTVCLEVBQ0E7QUFDSSxjQUFNcUYsVUFBVSxLQUFLVCxTQUFMLENBQWVqRSxFQUFFd0MsS0FBakIsRUFBd0J4QyxFQUFFMEMsS0FBMUIsRUFBaUNyRCxRQUFRc0YsVUFBekMsRUFBcUR0RixRQUFRdUYsU0FBN0QsQ0FBaEI7QUFDQSxjQUFNQyxXQUFXLEtBQUtaLFNBQUwsQ0FBZWpFLEVBQUV3QyxLQUFqQixFQUF3QnhDLEVBQUUwQyxLQUExQixFQUFpQ3JELFFBQVFzRixVQUFSLEdBQXFCdEYsUUFBUXdFLFdBQTlELEVBQTJFeEUsUUFBUXVGLFNBQW5GLENBQWpCO0FBQ0EsY0FBTUUsYUFBYSxLQUFLYixTQUFMLENBQWVqRSxFQUFFd0MsS0FBakIsRUFBd0J4QyxFQUFFMEMsS0FBMUIsRUFBaUNyRCxRQUFRc0YsVUFBekMsRUFBcUR0RixRQUFRdUYsU0FBUixHQUFvQnZGLFFBQVF5RSxZQUFqRixDQUFuQjtBQUNBLGNBQU1pQixjQUFjLEtBQUtkLFNBQUwsQ0FBZWpFLEVBQUV3QyxLQUFqQixFQUF3QnhDLEVBQUUwQyxLQUExQixFQUFpQ3JELFFBQVFzRixVQUFSLEdBQXFCdEYsUUFBUXdFLFdBQTlELEVBQTJFeEUsUUFBUXVGLFNBQVIsR0FBb0J2RixRQUFReUUsWUFBdkcsQ0FBcEI7QUFDQSxlQUFPUSxLQUFLVSxHQUFMLENBQVNOLE9BQVQsRUFBa0JHLFFBQWxCLEVBQTRCQyxVQUE1QixFQUF3Q0MsV0FBeEMsQ0FBUDtBQUNIOztBQUdEOzs7Ozs7QUFNQUUsWUFBUTlDLFFBQVIsRUFBa0I5QyxPQUFsQixFQUNBO0FBQ0ksY0FBTTZFLEtBQUsvQixTQUFTd0MsVUFBcEI7QUFDQSxjQUFNUixLQUFLaEMsU0FBU3lDLFNBQXBCO0FBQ0EsY0FBTU0sS0FBSy9DLFNBQVMwQixXQUFwQjtBQUNBLGNBQU1zQixLQUFLaEQsU0FBUzJCLFlBQXBCO0FBQ0EsY0FBTWQsTUFBTS9ELFNBQVNJLE9BQVQsQ0FBWjtBQUNBLGNBQU0rRSxLQUFLcEIsSUFBSVQsQ0FBZjtBQUNBLGNBQU04QixLQUFLckIsSUFBSVAsQ0FBZjtBQUNBLGNBQU0yQyxLQUFLL0YsUUFBUXdFLFdBQW5CO0FBQ0EsY0FBTXdCLEtBQUtoRyxRQUFReUUsWUFBbkI7QUFDQSxlQUFPSSxLQUFLRSxLQUFLZ0IsRUFBVixJQUFnQmxCLEtBQUtnQixFQUFMLEdBQVVkLEVBQTFCLElBQWdDRCxLQUFLRSxLQUFLZ0IsRUFBMUMsSUFBZ0RsQixLQUFLZ0IsRUFBTCxHQUFVZCxFQUFqRTtBQUNIOztBQUVEOzs7Ozs7O0FBT0FpQixpQkFBYXRGLENBQWIsRUFBZ0JtQyxRQUFoQixFQUEwQjFCLElBQTFCLEVBQ0E7QUFDSSxZQUFJdUUsTUFBTU8sUUFBVjtBQUFBLFlBQW9CMUQsS0FBcEI7QUFDQSxhQUFLLElBQUkyRCxPQUFULElBQW9CL0UsSUFBcEIsRUFDQTtBQUNJLGdCQUFJLEtBQUt3RSxPQUFMLENBQWE5QyxRQUFiLEVBQXVCcUQsUUFBUW5HLE9BQS9CLENBQUosRUFDQTtBQUNJLHVCQUFPbUcsT0FBUDtBQUNILGFBSEQsTUFJSyxJQUFJQSxRQUFRbEcsT0FBUixDQUFnQm1HLFlBQXBCLEVBQ0w7QUFDSSxzQkFBTUMsWUFBWSxLQUFLakIsd0JBQUwsQ0FBOEJ6RSxDQUE5QixFQUFpQ3dGLFFBQVFuRyxPQUF6QyxDQUFsQjtBQUNBLG9CQUFJcUcsWUFBWVYsR0FBaEIsRUFDQTtBQUNJQSwwQkFBTVUsU0FBTjtBQUNBN0QsNEJBQVEyRCxPQUFSO0FBQ0g7QUFDSjtBQUNKO0FBQ0QsZUFBTzNELEtBQVA7QUFDSDs7QUFFRDs7Ozs7Ozs7Ozs7OztBQWFBOEQsZ0JBQVlDLEdBQVosRUFBaUJDLEdBQWpCLEVBQXNCQyxHQUF0QixFQUEyQkMsR0FBM0IsRUFBZ0NDLEdBQWhDLEVBQXFDQyxHQUFyQyxFQUEwQ0MsR0FBMUMsRUFBK0NDLEdBQS9DLEVBQ0E7QUFDSSxjQUFNQyxLQUFLLENBQUNOLE1BQU1GLEdBQVAsS0FBZUcsTUFBTUYsR0FBckIsQ0FBWDtBQUNBLGNBQU1RLEtBQUssQ0FBQ0gsTUFBTUYsR0FBUCxLQUFlRyxNQUFNRixHQUFyQixDQUFYO0FBQ0EsY0FBTUssS0FBS2hDLEtBQUtpQyxHQUFMLENBQVMsQ0FBVCxFQUFZakMsS0FBS1UsR0FBTCxDQUFTYyxHQUFULEVBQWNJLEdBQWQsSUFBcUI1QixLQUFLaUMsR0FBTCxDQUFTWCxHQUFULEVBQWNJLEdBQWQsQ0FBakMsSUFBdUQxQixLQUFLaUMsR0FBTCxDQUFTLENBQVQsRUFBWWpDLEtBQUtVLEdBQUwsQ0FBU2UsR0FBVCxFQUFjSSxHQUFkLElBQXFCN0IsS0FBS2lDLEdBQUwsQ0FBU1YsR0FBVCxFQUFjSSxHQUFkLENBQWpDLENBQWxFO0FBQ0EsY0FBTU8sUUFBUUosS0FBS0MsRUFBTCxHQUFVQyxFQUF4QjtBQUNBLGVBQU9BLEtBQUtFLEtBQVo7QUFDSDs7QUFFRDs7Ozs7O0FBTUFDLGlCQUFhakgsUUFBYixFQUF1QjJDLFFBQXZCLEVBQ0E7QUFDSSxZQUFJM0MsU0FBU0YsT0FBVCxDQUFpQjRCLElBQXJCLEVBQ0E7QUFDSSxpQkFBS3dGLG9CQUFMLENBQTBCbEgsUUFBMUIsRUFBb0MyQyxRQUFwQztBQUNILFNBSEQsTUFLQTtBQUNJLGlCQUFLd0UsbUJBQUwsQ0FBeUJuSCxRQUF6QixFQUFtQzJDLFFBQW5DO0FBQ0g7QUFDSjs7QUFFRHlFLHNCQUFrQkMsSUFBbEIsRUFBd0JDLE1BQXhCLEVBQWdDQyxPQUFoQyxFQUNBO0FBQ0ksYUFBSyxJQUFJcEgsS0FBVCxJQUFrQmtILEtBQUsxRixRQUF2QixFQUNBO0FBQ0ksZ0JBQUkyRixPQUFPMUYsTUFBWCxFQUNBO0FBQ0ksb0JBQUkwRixPQUFPRSxPQUFQLENBQWVySCxNQUFNaUIsU0FBckIsTUFBb0MsQ0FBQyxDQUF6QyxFQUNBO0FBQ0ltRyw0QkFBUXJHLElBQVIsQ0FBYWYsS0FBYjtBQUNIO0FBQ0osYUFORCxNQVFBO0FBQ0lvSCx3QkFBUXJHLElBQVIsQ0FBYWYsS0FBYjtBQUNIO0FBQ0QsaUJBQUtpSCxpQkFBTCxDQUF1QmpILEtBQXZCLEVBQThCbUgsTUFBOUIsRUFBc0NDLE9BQXRDO0FBQ0g7QUFDSjs7QUFFRDs7Ozs7O0FBTUFySCxpQkFBYUYsUUFBYixFQUF1QnlILEtBQXZCLEVBQ0E7QUFDSSxZQUFJekgsU0FBU0YsT0FBVCxDQUFpQjRILFVBQXJCLEVBQ0E7QUFDSSxnQkFBSUosU0FBUyxFQUFiO0FBQ0EsZ0JBQUlHLFNBQVN6SCxTQUFTRixPQUFULENBQWlCNkgsVUFBOUIsRUFDQTtBQUNJLG9CQUFJM0gsU0FBU0YsT0FBVCxDQUFpQk0sU0FBckIsRUFDQTtBQUNJa0gsMkJBQU9wRyxJQUFQLENBQVlsQixTQUFTRixPQUFULENBQWlCTSxTQUE3QjtBQUNIO0FBQ0Qsb0JBQUlxSCxTQUFTekgsU0FBU0YsT0FBVCxDQUFpQjZILFVBQTlCLEVBQ0E7QUFDSUwsMkJBQU9wRyxJQUFQLENBQVlsQixTQUFTRixPQUFULENBQWlCNkgsVUFBN0I7QUFDSDtBQUNKLGFBVkQsTUFXSyxJQUFJLENBQUNGLEtBQUQsSUFBVXpILFNBQVNGLE9BQVQsQ0FBaUJNLFNBQS9CLEVBQ0w7QUFDSWtILHVCQUFPcEcsSUFBUCxDQUFZbEIsU0FBU0YsT0FBVCxDQUFpQk0sU0FBN0I7QUFDSDtBQUNELGtCQUFNbUgsVUFBVSxFQUFoQjtBQUNBLGlCQUFLSCxpQkFBTCxDQUF1QnBILFNBQVNILE9BQWhDLEVBQXlDeUgsTUFBekMsRUFBaURDLE9BQWpEO0FBQ0EsbUJBQU9BLE9BQVA7QUFDSCxTQXJCRCxNQXVCQTtBQUNJLGdCQUFJdkgsU0FBU0YsT0FBVCxDQUFpQk0sU0FBckIsRUFDQTtBQUNJLG9CQUFJYSxPQUFPLEVBQVg7QUFDQSxxQkFBSyxJQUFJZCxLQUFULElBQWtCSCxTQUFTSCxPQUFULENBQWlCOEIsUUFBbkMsRUFDQTtBQUNJLHdCQUFJLEtBQUt0QixrQkFBTCxDQUF3QkYsS0FBeEIsRUFBK0JILFNBQVNGLE9BQVQsQ0FBaUJNLFNBQWhELEtBQWdFcUgsU0FBUyxDQUFDekgsU0FBU0YsT0FBVCxDQUFpQjZILFVBQTVCLElBQTRDRixTQUFTekgsU0FBU0YsT0FBVCxDQUFpQjZILFVBQTFCLElBQXdDLEtBQUt0SCxrQkFBTCxDQUF3QkYsS0FBeEIsRUFBK0JILFNBQVNGLE9BQVQsQ0FBaUI2SCxVQUFoRCxDQUF2SixFQUNBO0FBQ0kxRyw2QkFBS0MsSUFBTCxDQUFVZixLQUFWO0FBQ0g7QUFDSjtBQUNELHVCQUFPYyxJQUFQO0FBQ0gsYUFYRCxNQWFBO0FBQ0ksdUJBQU9qQixTQUFTSCxPQUFULENBQWlCOEIsUUFBeEI7QUFDSDtBQUNKO0FBQ0o7O0FBRUQ7Ozs7OztBQU1Bd0Ysd0JBQW9CbkgsUUFBcEIsRUFBOEIyQyxRQUE5QixFQUNBO0FBQ0ksY0FBTVosS0FBSy9CLFNBQVNGLE9BQVQsQ0FBaUJrQyxPQUE1QjtBQUNBVyxpQkFBU1csU0FBVCxDQUFtQnNFLE1BQW5CO0FBQ0E1SCxpQkFBU3NELFNBQVQsR0FBcUJYLFNBQVNXLFNBQTlCO0FBQ0EsWUFBSXJCLFlBQVlqQyxTQUFTc0QsU0FBVCxDQUFtQnBCLFlBQW5CLENBQWdDSCxFQUFoQyxDQUFoQjtBQUNBRSxvQkFBWWpDLFNBQVNGLE9BQVQsQ0FBaUJxQyxlQUFqQixHQUFtQ0MsV0FBV0gsU0FBWCxDQUFuQyxHQUEyREEsU0FBdkU7QUFDQSxZQUFJSSxLQUFKO0FBQ0EsY0FBTVYsV0FBVyxLQUFLekIsWUFBTCxDQUFrQkYsUUFBbEIsRUFBNEIsSUFBNUIsQ0FBakI7QUFDQSxZQUFJQSxTQUFTRixPQUFULENBQWlCd0MsWUFBckIsRUFDQTtBQUNJLGlCQUFLLElBQUlDLElBQUlaLFNBQVNDLE1BQVQsR0FBa0IsQ0FBL0IsRUFBa0NXLEtBQUssQ0FBdkMsRUFBMENBLEdBQTFDLEVBQ0E7QUFDSSxzQkFBTXBDLFFBQVF3QixTQUFTWSxDQUFULENBQWQ7QUFDQSxvQkFBSUMsaUJBQWlCckMsTUFBTStCLFlBQU4sQ0FBbUJILEVBQW5CLENBQXJCO0FBQ0FTLGlDQUFpQnhDLFNBQVNGLE9BQVQsQ0FBaUIyQyxhQUFqQixHQUFpQ0wsV0FBV0ksY0FBWCxDQUFqQyxHQUE4REEsY0FBL0U7QUFDQSxvQkFBSVAsWUFBWU8sY0FBaEIsRUFDQTtBQUNJckMsMEJBQU11QyxVQUFOLENBQWlCWixZQUFqQixDQUE4QjlCLFNBQVNzRCxTQUF2QyxFQUFrRG5ELEtBQWxEO0FBQ0EseUJBQUswSCxRQUFMLENBQWNsRixRQUFkLEVBQXdCM0MsUUFBeEI7QUFDQXFDLDRCQUFRLElBQVI7QUFDQTtBQUNIO0FBQ0o7QUFDSixTQWZELE1BaUJBO0FBQ0ksaUJBQUssSUFBSWxDLEtBQVQsSUFBa0J3QixRQUFsQixFQUNBO0FBQ0ksb0JBQUlhLGlCQUFpQnJDLE1BQU0rQixZQUFOLENBQW1CSCxFQUFuQixDQUFyQjtBQUNBUyxpQ0FBaUJ4QyxTQUFTRixPQUFULENBQWlCMkMsYUFBakIsR0FBaUNMLFdBQVdJLGNBQVgsQ0FBakMsR0FBOERBLGNBQS9FO0FBQ0Esb0JBQUlQLFlBQVlPLGNBQWhCLEVBQ0E7QUFDSXJDLDBCQUFNdUMsVUFBTixDQUFpQlosWUFBakIsQ0FBOEI5QixTQUFTc0QsU0FBdkMsRUFBa0RuRCxLQUFsRDtBQUNBLHlCQUFLMEgsUUFBTCxDQUFjbEYsUUFBZCxFQUF3QjNDLFFBQXhCO0FBQ0FxQyw0QkFBUSxJQUFSO0FBQ0E7QUFDSDtBQUNKO0FBQ0o7QUFDRCxZQUFJLENBQUNBLEtBQUwsRUFDQTtBQUNJckMscUJBQVNILE9BQVQsQ0FBaUJnQyxXQUFqQixDQUE2QjdCLFNBQVNzRCxTQUF0QztBQUNBLGlCQUFLdUUsUUFBTCxDQUFjbEYsUUFBZCxFQUF3QjNDLFFBQXhCO0FBQ0g7QUFDSjs7QUFFRDs7Ozs7QUFLQThILGtCQUFjOUgsUUFBZCxFQUNBO0FBQ0ksWUFBSUEsU0FBU0YsT0FBVCxDQUFpQjRILFVBQXJCLEVBQ0E7QUFDSSxrQkFBTUosU0FBUyxFQUFmO0FBQ0EsZ0JBQUl0SCxTQUFTRixPQUFULENBQWlCTSxTQUFyQixFQUNBO0FBQ0lrSCx1QkFBT3BHLElBQVAsQ0FBWWxCLFNBQVNGLE9BQVQsQ0FBaUJNLFNBQTdCO0FBQ0g7QUFDRCxrQkFBTW1ILFVBQVUsRUFBaEI7QUFDQSxpQkFBS0gsaUJBQUwsQ0FBdUJwSCxTQUFTSCxPQUFoQyxFQUF5Q3lILE1BQXpDLEVBQWlEQyxPQUFqRDtBQUNBLGdCQUFJQSxRQUFRM0YsTUFBWixFQUNBO0FBQ0ksdUJBQU8yRixRQUFRQSxRQUFRM0YsTUFBUixHQUFpQixDQUF6QixDQUFQO0FBQ0gsYUFIRCxNQUtBO0FBQ0ksdUJBQU8sSUFBUDtBQUNIO0FBQ0osU0FqQkQsTUFtQkE7QUFDSSxnQkFBSTVCLFNBQVNGLE9BQVQsQ0FBaUJNLFNBQXJCLEVBQ0E7QUFDSSxxQkFBSyxJQUFJbUMsSUFBSXZDLFNBQVNILE9BQVQsQ0FBaUI4QixRQUFqQixDQUEwQkMsTUFBMUIsR0FBbUMsQ0FBaEQsRUFBbURXLEtBQUssQ0FBeEQsRUFBMkRBLEdBQTNELEVBQ0E7QUFDSSwwQkFBTXBDLFFBQVFILFNBQVNILE9BQVQsQ0FBaUI4QixRQUFqQixDQUEwQlksQ0FBMUIsQ0FBZDtBQUNBLHdCQUFJLEtBQUtsQyxrQkFBTCxDQUF3QkYsS0FBeEIsRUFBK0JILFNBQVNGLE9BQVQsQ0FBaUJNLFNBQWhELENBQUosRUFDQTtBQUNJLCtCQUFPRCxLQUFQO0FBQ0g7QUFDSjtBQUNELHVCQUFPLElBQVA7QUFDSCxhQVhELE1BYUE7QUFDSSxvQkFBSUgsU0FBU0gsT0FBVCxDQUFpQjhCLFFBQWpCLENBQTBCQyxNQUE5QixFQUNBO0FBQ0ksMkJBQU81QixTQUFTSCxPQUFULENBQWlCOEIsUUFBakIsQ0FBMEIzQixTQUFTSCxPQUFULENBQWlCOEIsUUFBakIsQ0FBMEJDLE1BQTFCLEdBQW1DLENBQTdELENBQVA7QUFDSCxpQkFIRCxNQUtBO0FBQ0ksMkJBQU8sSUFBUDtBQUNIO0FBQ0o7QUFDSjtBQUNKOztBQUVEOzs7Ozs7QUFNQWlHLGFBQVNsRixRQUFULEVBQW1CM0MsUUFBbkIsRUFDQTtBQUNJLFlBQUkyQyxTQUFTb0YsT0FBVCxJQUFvQnBGLFNBQVNvRixPQUFULEtBQXFCL0gsUUFBN0MsRUFDQTtBQUNJMkMscUJBQVNvRixPQUFULENBQWlCdkQsSUFBakIsQ0FBc0IsZ0JBQXRCLEVBQXdDN0IsUUFBeEMsRUFBa0RBLFNBQVNvRixPQUEzRDtBQUNIO0FBQ0QsWUFBSXBGLFNBQVM0QixJQUFiLEVBQ0E7QUFDSTVCLHFCQUFTNEIsSUFBVCxDQUFjTixHQUFkLEdBQW9CdEIsU0FBUy9CLFFBQVQsS0FBc0JaLFFBQXRCLEdBQWlDQSxTQUFTRixPQUFULENBQWlCb0UsS0FBakIsQ0FBdUJDLE9BQXhELEdBQWtFbkUsU0FBU0YsT0FBVCxDQUFpQm9FLEtBQWpCLENBQXVCOEQsSUFBN0c7QUFDQXJGLHFCQUFTb0YsT0FBVCxHQUFtQi9ILFFBQW5CO0FBQ0g7QUFDRCxZQUFJMkMsU0FBUy9CLFFBQVQsS0FBc0JaLFFBQTFCLEVBQ0E7QUFDSUEscUJBQVN3RSxJQUFULENBQWMsZUFBZCxFQUErQjdCLFFBQS9CLEVBQXlDM0MsUUFBekM7QUFDQUEscUJBQVN3RSxJQUFULENBQWMsZ0JBQWQsRUFBZ0N4RSxRQUFoQztBQUNILFNBSkQsTUFNQTtBQUNJQSxxQkFBU3dFLElBQVQsQ0FBYyxhQUFkLEVBQTZCN0IsUUFBN0IsRUFBdUMzQyxRQUF2QztBQUNBQSxxQkFBU3dFLElBQVQsQ0FBYyxnQkFBZDtBQUNIO0FBQ0o7O0FBRUQ7Ozs7OztBQU1BMEMseUJBQXFCbEgsUUFBckIsRUFBK0IyQyxRQUEvQixFQUNBO0FBQ0ksY0FBTTlDLFVBQVVHLFNBQVNILE9BQXpCO0FBQ0FHLGlCQUFTSCxPQUFULENBQWlCZ0MsV0FBakIsQ0FBNkJjLFNBQVNXLFNBQXRDO0FBQ0F0RCxpQkFBU3NELFNBQVQsR0FBcUJYLFNBQVNXLFNBQTlCO0FBQ0EsY0FBTTJFLFlBQVksS0FBS0gsYUFBTCxDQUFtQjlILFFBQW5CLENBQWxCO0FBQ0EsWUFBSSxDQUFDaUksU0FBTCxFQUNBO0FBQ0lwSSxvQkFBUWdDLFdBQVIsQ0FBb0I3QixTQUFTc0QsU0FBN0I7QUFDQSxpQkFBS3VFLFFBQUwsQ0FBY2xGLFFBQWQsRUFBd0IzQyxRQUF4QjtBQUNILFNBSkQsTUFNQTtBQUNJLGdCQUFJMkMsU0FBU3lDLFNBQVQsSUFBc0J2RixRQUFRdUYsU0FBUixHQUFvQnZGLFFBQVF5RSxZQUF0RCxFQUNBO0FBQ0l6RSx3QkFBUWdDLFdBQVIsQ0FBb0I3QixTQUFTc0QsU0FBN0I7QUFDQSxxQkFBS3VFLFFBQUwsQ0FBY2xGLFFBQWQsRUFBd0IzQyxRQUF4QjtBQUNILGFBSkQsTUFLSyxJQUFJMkMsU0FBU3lDLFNBQVQsR0FBcUJ6QyxTQUFTMkIsWUFBOUIsR0FBNkN6RSxRQUFRdUYsU0FBekQsRUFDTDtBQUNJdkYsd0JBQVFpQyxZQUFSLENBQXFCOUIsU0FBU3NELFNBQTlCLEVBQXlDekQsUUFBUXFJLFVBQWpEO0FBQ0EscUJBQUtMLFFBQUwsQ0FBY2xGLFFBQWQsRUFBd0IzQyxRQUF4QjtBQUNILGFBSkksTUFNTDtBQUNJLHNCQUFNb0csTUFBTXpELFNBQVN3QyxVQUFyQjtBQUNBLHNCQUFNa0IsTUFBTTFELFNBQVN5QyxTQUFyQjtBQUNBLHNCQUFNa0IsTUFBTTNELFNBQVN3QyxVQUFULEdBQXNCeEMsU0FBUzBCLFdBQTNDO0FBQ0Esc0JBQU1rQyxNQUFNNUQsU0FBU3lDLFNBQVQsR0FBcUJ6QyxTQUFTMkIsWUFBMUM7QUFDQSxvQkFBSTZELFVBQVUsQ0FBZDtBQUFBLG9CQUFpQkMsT0FBakI7QUFBQSxvQkFBMEJDLFdBQVcsSUFBckM7QUFBQSxvQkFBMkMvRSxTQUEzQztBQUNBLHNCQUFNZ0UsU0FBUyxFQUFmO0FBQ0Esb0JBQUl0SCxTQUFTRixPQUFULENBQWlCTSxTQUFyQixFQUNBO0FBQ0lrSCwyQkFBT3BHLElBQVAsQ0FBWWxCLFNBQVNGLE9BQVQsQ0FBaUJNLFNBQTdCO0FBQ0g7QUFDRCxvQkFBSUosU0FBU0YsT0FBVCxDQUFpQjZILFVBQXJCLEVBQ0E7QUFDSUwsMkJBQU9wRyxJQUFQLENBQVlsQixTQUFTRixPQUFULENBQWlCNkgsVUFBN0I7QUFDSDtBQUNELHNCQUFNMUgsV0FBVyxLQUFLQyxZQUFMLENBQWtCRixRQUFsQixFQUE0QixJQUE1QixDQUFqQjtBQUNBLHFCQUFLLElBQUlHLEtBQVQsSUFBa0JGLFFBQWxCLEVBQ0E7QUFDSSx3QkFBSUUsVUFBVUgsU0FBU3NELFNBQXZCLEVBQ0E7QUFDSUEsb0NBQVksSUFBWjtBQUNIO0FBQ0QsMEJBQU1FLE1BQU0vRCxTQUFTVSxLQUFULENBQVo7QUFDQSwwQkFBTXFHLE1BQU1oRCxJQUFJVCxDQUFoQjtBQUNBLDBCQUFNMEQsTUFBTWpELElBQUlQLENBQWhCO0FBQ0EsMEJBQU15RCxNQUFNbEQsSUFBSVQsQ0FBSixHQUFRNUMsTUFBTWtFLFdBQTFCO0FBQ0EsMEJBQU1zQyxNQUFNbkQsSUFBSVAsQ0FBSixHQUFROUMsTUFBTW1FLFlBQTFCO0FBQ0EsMEJBQU1nRSxhQUFhLEtBQUtuQyxXQUFMLENBQWlCQyxHQUFqQixFQUFzQkMsR0FBdEIsRUFBMkJDLEdBQTNCLEVBQWdDQyxHQUFoQyxFQUFxQ0MsR0FBckMsRUFBMENDLEdBQTFDLEVBQStDQyxHQUEvQyxFQUFvREMsR0FBcEQsQ0FBbkI7QUFDQSx3QkFBSTJCLGFBQWFILE9BQWpCLEVBQ0E7QUFDSUEsa0NBQVVHLFVBQVY7QUFDQUYsa0NBQVVqSSxLQUFWO0FBQ0FrSSxtQ0FBVy9FLFNBQVg7QUFDSDtBQUNKO0FBQ0Qsb0JBQUk4RSxXQUFXQSxZQUFZcEksU0FBU3NELFNBQXBDLEVBQ0E7QUFDSSx3QkFBSStFLFFBQUosRUFDQTtBQUNJeEksZ0NBQVFpQyxZQUFSLENBQXFCOUIsU0FBU3NELFNBQTlCLEVBQXlDOEUsUUFBUUcsV0FBakQ7QUFDQSw2QkFBS1YsUUFBTCxDQUFjbEYsUUFBZCxFQUF3QjNDLFFBQXhCO0FBQ0FBLGlDQUFTd0UsSUFBVCxDQUFjLGVBQWQsRUFBK0J4RSxRQUEvQjtBQUNILHFCQUxELE1BT0E7QUFDSUgsZ0NBQVFpQyxZQUFSLENBQXFCOUIsU0FBU3NELFNBQTlCLEVBQXlDOEUsT0FBekM7QUFDQSw2QkFBS1AsUUFBTCxDQUFjbEYsUUFBZCxFQUF3QjNDLFFBQXhCO0FBQ0FBLGlDQUFTd0UsSUFBVCxDQUFjLGVBQWQsRUFBK0J4RSxRQUEvQjtBQUNIO0FBQ0osaUJBZEQsTUFnQkE7QUFDSUEsNkJBQVNILE9BQVQsQ0FBaUJnQyxXQUFqQixDQUE2QmMsU0FBU1csU0FBdEM7QUFDQXRELDZCQUFTc0QsU0FBVCxHQUFxQlgsU0FBU1csU0FBOUI7QUFDQSx5QkFBS3VFLFFBQUwsQ0FBY2xGLFFBQWQsRUFBd0IzQyxRQUF4QjtBQUNIO0FBQ0o7QUFDSjtBQUNKOztBQUVEOzs7OztBQUtBZSxjQUFVUCxDQUFWLEVBQ0E7QUFDSSxZQUFJLEtBQUttQyxRQUFULEVBQ0E7QUFDSSxnQkFBSSxDQUFDLEtBQUtBLFFBQUwsQ0FBY0UsTUFBbkIsRUFDQTtBQUNJLG9CQUFJLEtBQUs0QixTQUFMLENBQWUsS0FBSzlCLFFBQUwsQ0FBY0csS0FBZCxDQUFvQkMsQ0FBbkMsRUFBc0MsS0FBS0osUUFBTCxDQUFjRyxLQUFkLENBQW9CRyxDQUExRCxFQUE2RHpDLEVBQUV3QyxLQUEvRCxFQUFzRXhDLEVBQUUwQyxLQUF4RSxJQUFpRixLQUFLcEQsT0FBTCxDQUFhMEksU0FBbEcsRUFDQTtBQUNJLHlCQUFLbkYsT0FBTCxDQUFhN0MsQ0FBYjtBQUNILGlCQUhELE1BS0E7QUFDSTtBQUNIO0FBQ0o7QUFDRCxpQkFBS21DLFFBQUwsQ0FBY2hDLEtBQWQsQ0FBb0JnRCxJQUFwQixHQUEyQm5ELEVBQUV3QyxLQUFGLEdBQVUsS0FBS1UsTUFBTCxDQUFZWCxDQUF0QixHQUEwQixJQUFyRDtBQUNBLGlCQUFLSixRQUFMLENBQWNoQyxLQUFkLENBQW9CaUQsR0FBcEIsR0FBMEJwRCxFQUFFMEMsS0FBRixHQUFVLEtBQUtRLE1BQUwsQ0FBWVQsQ0FBdEIsR0FBMEIsSUFBcEQ7QUFDQSxnQkFBSSxLQUFLTixRQUFMLENBQWM0QixJQUFsQixFQUNBO0FBQ0kscUJBQUs1QixRQUFMLENBQWM0QixJQUFkLENBQW1CNUQsS0FBbkIsQ0FBeUJnRCxJQUF6QixHQUFnQ25ELEVBQUV3QyxLQUFGLEdBQVUsS0FBS1UsTUFBTCxDQUFZWCxDQUF0QixHQUEwQixLQUFLSixRQUFMLENBQWMwQixXQUF4QyxHQUFzRCxJQUF0RjtBQUNBLHFCQUFLMUIsUUFBTCxDQUFjNEIsSUFBZCxDQUFtQjVELEtBQW5CLENBQXlCaUQsR0FBekIsR0FBK0JwRCxFQUFFMEMsS0FBRixHQUFVLEtBQUtRLE1BQUwsQ0FBWVQsQ0FBdEIsR0FBMEIsS0FBS04sUUFBTCxDQUFjMkIsWUFBeEMsR0FBdUQsSUFBdEY7QUFDSDtBQUNELGtCQUFNckQsT0FBTyxFQUFiO0FBQ0EsaUJBQUssSUFBSWpCLFFBQVQsSUFBcUJMLFNBQVNzQixJQUE5QixFQUNBO0FBQ0ksb0JBQUlqQixTQUFTRixPQUFULENBQWlCcUIsSUFBakIsS0FBMEIsS0FBS3JCLE9BQUwsQ0FBYXFCLElBQTNDLEVBQ0E7QUFDSUYseUJBQUtDLElBQUwsQ0FBVWxCLFFBQVY7QUFDSDtBQUNKO0FBQ0QsZ0JBQUlpQixLQUFLVyxNQUFMLEtBQWdCLENBQXBCLEVBQ0E7QUFDSSxvQkFBSSxLQUFLOUIsT0FBTCxDQUFhbUcsWUFBYixJQUE2QixLQUFLUixPQUFMLENBQWEsS0FBSzlDLFFBQWxCLEVBQTRCLEtBQUs5QyxPQUFqQyxDQUFqQyxFQUNBO0FBQ0kseUJBQUs4QyxRQUFMLENBQWMzQyxRQUFkLEdBQXlCLElBQXpCO0FBQ0EseUJBQUtpSCxZQUFMLENBQWtCLElBQWxCLEVBQXdCLEtBQUt0RSxRQUE3QjtBQUNILGlCQUpELE1BTUE7QUFDSSx5QkFBS0EsUUFBTCxDQUFjVyxTQUFkLENBQXdCc0UsTUFBeEI7QUFDQSx3QkFBSSxLQUFLakYsUUFBTCxDQUFjNEIsSUFBbEIsRUFDQTtBQUNJLDZCQUFLNUIsUUFBTCxDQUFjNEIsSUFBZCxDQUFtQk4sR0FBbkIsR0FBeUIsS0FBS25FLE9BQUwsQ0FBYW9FLEtBQWIsQ0FBbUJ1RSxNQUE1QztBQUNIO0FBQ0o7QUFDSixhQWZELE1BaUJBO0FBQ0ksc0JBQU1MLFVBQVUsS0FBS3RDLFlBQUwsQ0FBa0J0RixDQUFsQixFQUFxQixLQUFLbUMsUUFBMUIsRUFBb0MxQixJQUFwQyxDQUFoQjtBQUNBLG9CQUFJbUgsT0FBSixFQUNBO0FBQ0kseUJBQUt6RixRQUFMLENBQWMzQyxRQUFkLEdBQXlCb0ksT0FBekI7QUFDQSx5QkFBS25CLFlBQUwsQ0FBa0JtQixPQUFsQixFQUEyQixLQUFLekYsUUFBaEM7QUFDSCxpQkFKRCxNQU1BO0FBQ0kseUJBQUtBLFFBQUwsQ0FBYzNDLFFBQWQsR0FBeUIsSUFBekI7QUFDQSx5QkFBSzJDLFFBQUwsQ0FBY1csU0FBZCxDQUF3QnNFLE1BQXhCO0FBQ0Esd0JBQUksS0FBS2pGLFFBQUwsQ0FBYzRCLElBQWxCLEVBQ0E7QUFDSSw2QkFBSzVCLFFBQUwsQ0FBYzRCLElBQWQsQ0FBbUJOLEdBQW5CLEdBQXlCLEtBQUtuRSxPQUFMLENBQWFvRSxLQUFiLENBQW1CdUUsTUFBNUM7QUFDSDtBQUNKO0FBQ0o7QUFDRGpJLGNBQUU0QyxjQUFGO0FBQ0E1QyxjQUFFa0ksZUFBRjtBQUNIO0FBQ0o7O0FBRUQ7Ozs7O0FBS0ExSCxZQUFRUixDQUFSLEVBQ0E7QUFDSSxZQUFJLEtBQUttQyxRQUFULEVBQ0E7QUFDSSxnQkFBSSxLQUFLQSxRQUFMLENBQWNFLE1BQWxCLEVBQ0E7QUFDSSxxQkFBS0YsUUFBTCxDQUFjaEMsS0FBZCxDQUFvQjhDLFFBQXBCLEdBQStCLE9BQS9CO0FBQ0EscUJBQUtkLFFBQUwsQ0FBY2hDLEtBQWQsQ0FBb0JnSSxNQUFwQixHQUE2QixPQUE3QjtBQUNBLHFCQUFLaEcsUUFBTCxDQUFjaEMsS0FBZCxDQUFvQmlJLFNBQXBCLEdBQWdDLE9BQWhDO0FBQ0EscUJBQUtqRyxRQUFMLENBQWNoQyxLQUFkLENBQW9Ca0ksT0FBcEIsR0FBOEIsT0FBOUI7QUFDQSxvQkFBSSxLQUFLdkYsU0FBTCxDQUFlWixVQUFuQixFQUNBO0FBQ0kseUJBQUtZLFNBQUwsQ0FBZVosVUFBZixDQUEwQlosWUFBMUIsQ0FBdUMsS0FBS2EsUUFBNUMsRUFBc0QsS0FBS1csU0FBM0Q7QUFDQSx5QkFBS1gsUUFBTCxDQUFjL0IsUUFBZCxHQUF5QixLQUFLK0IsUUFBTCxDQUFjb0YsT0FBdkM7QUFDQSx5QkFBS3pFLFNBQUwsQ0FBZXNFLE1BQWY7QUFDQSx5QkFBS3RFLFNBQUwsR0FBaUIsSUFBakI7QUFDQSx3QkFBSSxLQUFLWCxRQUFMLENBQWMvQixRQUFkLEtBQTJCLElBQS9CLEVBQ0E7QUFDSSw2QkFBSzRELElBQUwsQ0FBVSxPQUFWLEVBQW1CLEtBQUs3QixRQUF4QixFQUFrQyxJQUFsQztBQUNBLDZCQUFLNkIsSUFBTCxDQUFVLFFBQVYsRUFBb0IsS0FBSzdCLFFBQXpCLEVBQW1DLElBQW5DO0FBQ0gscUJBSkQsTUFNQTtBQUNJLDZCQUFLQSxRQUFMLENBQWMvQixRQUFkLENBQXVCNEQsSUFBdkIsQ0FBNEIsUUFBNUIsRUFBc0MsS0FBSzdCLFFBQTNDLEVBQXFELEtBQUtBLFFBQUwsQ0FBYy9CLFFBQW5FO0FBQ0EsNkJBQUsrQixRQUFMLENBQWMvQixRQUFkLENBQXVCNEQsSUFBdkIsQ0FBNEIsUUFBNUIsRUFBc0MsS0FBSzdCLFFBQTNDLEVBQXFELEtBQUtBLFFBQUwsQ0FBYy9CLFFBQW5FO0FBQ0EsNkJBQUsrQixRQUFMLENBQWMzQyxRQUFkLENBQXVCd0UsSUFBdkIsQ0FBNEIsS0FBNUIsRUFBbUMsS0FBSzdCLFFBQXhDLEVBQWtELElBQWxEO0FBQ0EsNkJBQUtBLFFBQUwsQ0FBYzNDLFFBQWQsQ0FBdUJ3RSxJQUF2QixDQUE0QixRQUE1QixFQUFzQyxLQUFLN0IsUUFBM0MsRUFBcUQsSUFBckQ7QUFDSDtBQUNKLGlCQWxCRCxNQW9CQTtBQUNJLHlCQUFLQSxRQUFMLENBQWNpRixNQUFkO0FBQ0EseUJBQUtqRixRQUFMLENBQWMvQixRQUFkLEdBQXlCLElBQXpCO0FBQ0EseUJBQUswQyxTQUFMLENBQWVzRSxNQUFmO0FBQ0EseUJBQUt0RSxTQUFMLEdBQWlCLElBQWpCO0FBQ0EseUJBQUtYLFFBQUwsQ0FBYy9CLFFBQWQsQ0FBdUI0RCxJQUF2QixDQUE0QixRQUE1QixFQUFzQyxLQUFLN0IsUUFBM0MsRUFBcUQsSUFBckQ7QUFDSDtBQUNELG9CQUFJLEtBQUtBLFFBQUwsQ0FBYzRCLElBQWxCLEVBQ0E7QUFDSSx5QkFBSzVCLFFBQUwsQ0FBYzRCLElBQWQsQ0FBbUJxRCxNQUFuQjtBQUNIO0FBQ0osYUFyQ0QsTUF1Q0E7QUFDSSxxQkFBS3BELElBQUwsQ0FBVSxTQUFWLEVBQXFCLEtBQUs3QixRQUExQixFQUFvQyxJQUFwQztBQUNIO0FBQ0QsaUJBQUtBLFFBQUwsR0FBZ0IsSUFBaEI7QUFDQW5DLGNBQUU0QyxjQUFGO0FBQ0g7QUFDSjs7QUFFRDs7OztBQUlBLGVBQVcxRCxRQUFYLEdBQ0E7QUFDSSxlQUFPQSxRQUFQO0FBQ0g7O0FBRUQ7Ozs7O0FBS0EsV0FBT29KLE1BQVAsQ0FBYzdJLFFBQWQsRUFBd0JILE9BQXhCLEVBQ0E7QUFDSSxjQUFNeUgsVUFBVSxFQUFoQjtBQUNBLGFBQUssSUFBSTFILE9BQVQsSUFBb0JJLFFBQXBCLEVBQ0E7QUFDSXNILG9CQUFRckcsSUFBUixDQUFhLElBQUl2QixRQUFKLENBQWFFLE9BQWIsRUFBc0JDLE9BQXRCLENBQWI7QUFDSDtBQUNELGVBQU95SCxPQUFQO0FBQ0g7QUF0eEJMOztBQXl4QkF3QixPQUFPQyxPQUFQLEdBQWlCckosUUFBakI7O0FBRUE7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0EiLCJmaWxlIjoic29ydGFibGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBFdmVudHMgPSByZXF1aXJlKCdldmVudGVtaXR0ZXIzJylcclxuXHJcbmNvbnN0IHRvR2xvYmFsID0gcmVxdWlyZSgnLi90b0dsb2JhbCcpXHJcbmNvbnN0IGRlZmF1bHRzID0gcmVxdWlyZSgnLi9vcHRpb25zJylcclxuXHJcbmNsYXNzIFNvcnRhYmxlIGV4dGVuZHMgRXZlbnRzXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIHNvcnRhYmxlIGxpc3RcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5uYW1lPXNvcnRhYmxlXSBkcmFnZ2luZyBpcyBhbGxvd2VkIGJldHdlZW4gU29ydGFibGVzIHdpdGggdGhlIHNhbWUgbmFtZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5zb3J0PXRydWVdIGFsbG93IHNvcnRpbmcgd2l0aGluIGxpc3RcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5kcmFnQ2xhc3NdIGlmIHNldCB0aGVuIGRyYWcgb25seSBpdGVtcyB3aXRoIHRoaXMgY2xhc3NOYW1lIHVuZGVyIGVsZW1lbnQsIG90aGVyd2lzZSB1c2UgYWxsIGNoaWxkcmVuXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmRlZXBTZWFyY2hdIGlmIGRyYWdDbGFzcyBhbmQgZGVlcFNlYXJjaCB0aGVuIHNlYXJjaCBhbGwgZGVzY2VuZGVudHMgb2YgZWxlbWVudCBmb3IgZHJhZ0NsYXNzXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMub3JkZXJJZD1kYXRhLW9yZGVyXSBmb3Igbm9uLXNvcnRpbmcgbGlzdHMsIHVzZSB0aGlzIGRhdGEgaWQgdG8gZmlndXJlIG91dCBzb3J0IG9yZGVyXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLm9yZGVySWRJc051bWJlcj10cnVlXSB1c2UgcGFyc2VJbnQgb24gb3B0aW9ucy5vcmRlcklkIHRvIHByb3Blcmx5IHNvcnQgbnVtYmVyc1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnJldmVyc2VPcmRlcl0gcmV2ZXJzZSBzb3J0IHRoZSBvcmRlcklkXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmFsd2F5c0luTGlzdD10cnVlXSBwbGFjZSBlbGVtZW50IGluc2lkZSBjbG9zZXN0IHJlbGF0ZWQgU29ydGFibGUgb2JqZWN0OyBpZiBzZXQgdG8gZmFsc2UgdGhlbiB0aGUgb2JqZWN0IGlzIHJlbW92ZWQgaWYgZHJvcHBlZCBvdXRzaWRlIHJlbGF0ZWQgc29ydGFibGVzXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnMuY2hpbGRyZW5TdHlsZXNdIHN0eWxlcyB0byBhcHBseSB0byBjaGlsZHJlbiBlbGVtZW50cyBvZiBTb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zLmljb25zXSBkZWZhdWx0IHNldCBvZiBpY29uc1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmljb25zLnJlb3JkZXJdIHNvdXJjZSBvZiBpbWFnZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmljb25zLm1vdmVdIHNvdXJjZSBvZiBpbWFnZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmljb25zLmNvcHldIHNvdXJjZSBvZiBpbWFnZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmljb25zLmRlbGV0ZV0gc291cmNlIG9mIGltYWdlXHJcbiAgICAgKiBAZmlyZXMgY2xpY2tlZFxyXG4gICAgICogQGZpcmVzIHBpY2t1cFxyXG4gICAgICogQGZpcmVzIG9yZGVyXHJcbiAgICAgKiBAZmlyZXMgYWRkXHJcbiAgICAgKiBAZmlyZXMgcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgdXBkYXRlXHJcbiAgICAgKiBAZmlyZXMgb3JkZXItcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIGFkZC1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgcmVtb3ZlLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyB1cGRhdGUtcGVuZGluZ1xyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyKClcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgZm9yIChsZXQgb3B0aW9uIGluIGRlZmF1bHRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zW29wdGlvbl0gPSB0eXBlb2YgdGhpcy5vcHRpb25zW29wdGlvbl0gIT09ICd1bmRlZmluZWQnID8gb3B0aW9uc1tvcHRpb25dIDogZGVmYXVsdHNbb3B0aW9uXVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnNvcnRhYmxlID0gdGhpc1xyXG4gICAgICAgIGNvbnN0IGVsZW1lbnRzID0gdGhpcy5fZ2V0Q2hpbGRyZW4odGhpcylcclxuICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBlbGVtZW50cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5vcHRpb25zLmRyYWdDbGFzcyB8fCB0aGlzLl9jb250YWluc0NsYXNzTmFtZShjaGlsZCwgdGhpcy5vcHRpb25zLmRyYWdDbGFzcykpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkLl9faXNTb3J0YWJsZSA9IHRydWVcclxuICAgICAgICAgICAgICAgIGNoaWxkLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChlKSA9PiB0aGlzLl9kcmFnU3RhcnQoZSkpXHJcbiAgICAgICAgICAgICAgICBjaGlsZC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgKGUpID0+IHRoaXMuX2RyYWdTdGFydChlKSlcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IG9wdGlvbiBpbiB0aGlzLm9wdGlvbnMuY2hpbGRyZW5TdHlsZXMpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQuc3R5bGVbb3B0aW9uXSA9IHRoaXMub3B0aW9ucy5jaGlsZHJlblN0eWxlc1tvcHRpb25dXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5vcmlnaW5hbCA9IHRoaXNcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIChlKSA9PiB0aGlzLl9kcmFnTW92ZShlKSlcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIChlKSA9PiB0aGlzLl9kcmFnTW92ZShlKSlcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNodXAnLCAoZSkgPT4gdGhpcy5fZHJhZ1VwKGUpKVxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hjYW5jZWwnLCAoZSkgPT4gdGhpcy5fZHJhZ1VwKGUpKVxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIChlKSA9PiB0aGlzLl9kcmFnVXAoZSkpXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWNhbmNlbCcsIChlKSA9PiB0aGlzLl9kcmFnVXAoZSkpXHJcblxyXG4gICAgICAgIGlmICghU29ydGFibGUubGlzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFNvcnRhYmxlLmxpc3QgPSBbXVxyXG4gICAgICAgIH1cclxuICAgICAgICBTb3J0YWJsZS5saXN0LnB1c2godGhpcylcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFdoZXRoZXIgZWxlbWVudCBjb250YWlucyBjbGFzc25hbWVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9jb250YWluc0NsYXNzTmFtZShlLCBuYW1lKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGxpc3QgPSBlLmNsYXNzTmFtZS5zcGxpdCgnICcpXHJcbiAgICAgICAgZm9yIChsZXQgZW50cnkgb2YgbGlzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChlbnRyeSA9PT0gbmFtZSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFkZCBhbiBlbGVtZW50IGFzIGEgY2hpbGQgb2YgdGhlIHNvcnRhYmxlIGVsZW1lbnQ7IGNhbiBhbHNvIGJlIHVzZWQgdG8gc3dhcCBiZXR3ZWVuIHNvcnRhYmxlc1xyXG4gICAgICogTk9URTogdGhpcyB3aWxsIG5vdCB3b3JrIHdpdGggZGVlcC10eXBlIGVsZW1lbnRzOyB1c2UgYXR0YWNoRWxlbWVudCBpbnN0ZWFkXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXhcclxuICAgICAqL1xyXG4gICAgYWRkKGVsZW1lbnQsIGluZGV4KVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuYXR0YWNoRWxlbWVudChlbGVtZW50KVxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc29ydClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaW5kZXggPT09ICd1bmRlZmluZWQnIHx8IGluZGV4ID49IHRoaXMuZWxlbWVudC5jaGlsZHJlbi5sZW5ndGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChlbGVtZW50KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50Lmluc2VydEJlZm9yZShlbGVtZW50LCB0aGlzLmVsZW1lbnQuY2hpbGRyZW5baW5kZXggKyAxXSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IHRoaXMub3B0aW9ucy5vcmRlcklkXHJcbiAgICAgICAgICAgIGxldCBkcmFnT3JkZXIgPSBlbGVtZW50LmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICAgICAgZHJhZ09yZGVyID0gdGhpcy5vcHRpb25zLm9yZGVySWRJc051bWJlciA/IHBhcnNlRmxvYXQoZHJhZ09yZGVyKSA6IGRyYWdPcmRlclxyXG4gICAgICAgICAgICBsZXQgZm91bmRcclxuICAgICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLl9nZXRDaGlsZHJlbih0aGlzLCB0cnVlKVxyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJldmVyc2VPcmRlcilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IGNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gY2hpbGRyZW5baV1cclxuICAgICAgICAgICAgICAgICAgICBsZXQgY2hpbGREcmFnT3JkZXIgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGREcmFnT3JkZXIgPSB0aGlzLm9wdGlvbnMub3JkZXJJc051bWJlciA/IHBhcnNlRmxvYXQoY2hpbGREcmFnT3JkZXIpIDogY2hpbGREcmFnT3JkZXJcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZHJhZ09yZGVyID4gY2hpbGREcmFnT3JkZXIpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShlbGVtZW50LCBjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgY2hpbGRyZW4pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkRHJhZ09yZGVyID0gY2hpbGQuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkRHJhZ09yZGVyID0gdGhpcy5vcHRpb25zLm9yZGVySXNOdW1iZXIgPyBwYXJzZUZsb2F0KGNoaWxkRHJhZ09yZGVyKSA6IGNoaWxkRHJhZ09yZGVyXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRyYWdPcmRlciA8IGNoaWxkRHJhZ09yZGVyKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZWxlbWVudCwgY2hpbGQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIWZvdW5kKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZWxlbWVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGF0dGFjaGVzIGFuIEhUTUwgZWxlbWVudCB0byB0aGUgc29ydGFibGU7IGNhbiBhbHNvIGJlIHVzZWQgdG8gc3dhcCBiZXR3ZWVuIHNvcnRhYmxlc1xyXG4gICAgICogTk9URTogeW91IG5lZWQgdG8gbWFudWFsbHkgaW5zZXJ0IHRoZSBlbGVtZW50IGludG8gdGhpcy5lbGVtZW50ICh0aGlzIGlzIHVzZWZ1bCB3aGVuIHlvdSBoYXZlIGEgZGVlcCBzdHJ1Y3R1cmUpXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKi9cclxuICAgIGF0dGFjaEVsZW1lbnQoZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBpZiAoZWxlbWVudC5fX2lzU29ydGFibGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBlbGVtZW50Lm9yaWdpbmFsID0gdGhpc1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBlbGVtZW50Ll9faXNTb3J0YWJsZSA9IHRydWVcclxuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCAoZSkgPT4gdGhpcy5fZHJhZ1N0YXJ0KGUpKVxyXG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCAoZSkgPT4gdGhpcy5fZHJhZ1N0YXJ0KGUpKVxyXG4gICAgICAgICAgICBmb3IgKGxldCBvcHRpb24gaW4gdGhpcy5vcHRpb25zLmNoaWxkcmVuU3R5bGVzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LnN0eWxlW29wdGlvbl0gPSB0aGlzLm9wdGlvbnMuY2hpbGRyZW5TdHlsZXNbb3B0aW9uXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsZW1lbnQub3JpZ2luYWwgPSB0aGlzXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc3RhcnQgZHJhZ1xyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZHJhZ1N0YXJ0KGUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZyA9IGUuY3VycmVudFRhcmdldFxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcucGlja3VwID0gZmFsc2VcclxuICAgICAgICB0aGlzLmRyYWdnaW5nLnN0YXJ0ID0geyB4OiBlLnBhZ2VYLCB5OiBlLnBhZ2VZIH1cclxuICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLmN1cnNvciA9ICduby1jdXJzb3InXHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwaWNrdXAgYW5kIGNsb25lIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7VUlFdmVudH0gZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BpY2t1cChlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuaW5kaWNhdG9yID0gdGhpcy5kcmFnZ2luZy5jbG9uZU5vZGUodHJ1ZSlcclxuICAgICAgICB0aGlzLmRyYWdnaW5nLmluZGljYXRvciA9IHRoaXMuaW5kaWNhdG9yXHJcbiAgICAgICAgY29uc3QgcG9zID0gdG9HbG9iYWwodGhpcy5kcmFnZ2luZylcclxuICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xyXG4gICAgICAgIHRoaXMub2Zmc2V0ID0geyB4OiBwb3MueCAtIGUucGFnZVgsIHk6IHBvcy55IC0gZS5wYWdlWSB9XHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZy5zdHlsZS5sZWZ0ID0gcG9zLnggKyAncHgnXHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZy5zdHlsZS50b3AgPSBwb3MueSArICdweCdcclxuICAgICAgICBmb3IgKGxldCBvcHRpb24gaW4gdGhpcy5vcHRpb25zLmRyYWdTdHlsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuc3R5bGVbb3B0aW9uXSA9IHRoaXMub3B0aW9ucy5kcmFnU3R5bGVbb3B0aW9uXVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmRyYWdnaW5nLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHRoaXMuaW5kaWNhdG9yLCB0aGlzLmRyYWdnaW5nKVxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5kcmFnZ2luZylcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnVzZUljb25zKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKVxyXG4gICAgICAgICAgICBpbWFnZS5zcmMgPSB0aGlzLm9wdGlvbnMuaWNvbnMucmVvcmRlclxyXG4gICAgICAgICAgICBpbWFnZS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcclxuICAgICAgICAgICAgaW1hZ2Uuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgtNTAlLCAtNTAlKSdcclxuICAgICAgICAgICAgaW1hZ2Uuc3R5bGUubGVmdCA9IHBvcy54ICsgdGhpcy5kcmFnZ2luZy5vZmZzZXRXaWR0aCArICdweCdcclxuICAgICAgICAgICAgaW1hZ2Uuc3R5bGUudG9wID0gcG9zLnkgKyB0aGlzLmRyYWdnaW5nLm9mZnNldEhlaWdodCArICdweCdcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpbWFnZSlcclxuICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5pY29uID0gaW1hZ2VcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZy5waWNrdXAgPSB0cnVlXHJcbiAgICAgICAgdGhpcy5lbWl0KCdwaWNrdXAnLCB0aGlzLmRyYWdnaW5nLCB0aGlzKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogbWVhc3VyZSBkaXN0YW5jZSBiZXR3ZWVuIHR3byBwb2ludHNcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4MVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHkxXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geDJcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5MlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2Rpc3RhbmNlKHgxLCB5MSwgeDIsIHkyKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3coeDEgLSB4MiwgMikgKyBNYXRoLnBvdyh5MSAtIHkyLCAyKSlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGZpbmQgY2xvc2VzdCBkaXN0YW5jZSBmcm9tIFVJRXZlbnQgdG8gYSBjb3JuZXIgb2YgYW4gZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtIVE1MVUxpc3RFbGVtZW50fSBlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZGlzdGFuY2VUb0Nsb3Nlc3RDb3JuZXIoZSwgZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBjb25zdCB0b3BMZWZ0ID0gdGhpcy5fZGlzdGFuY2UoZS5wYWdlWCwgZS5wYWdlWSwgZWxlbWVudC5vZmZzZXRMZWZ0LCBlbGVtZW50Lm9mZnNldFRvcClcclxuICAgICAgICBjb25zdCB0b3BSaWdodCA9IHRoaXMuX2Rpc3RhbmNlKGUucGFnZVgsIGUucGFnZVksIGVsZW1lbnQub2Zmc2V0TGVmdCArIGVsZW1lbnQub2Zmc2V0V2lkdGgsIGVsZW1lbnQub2Zmc2V0VG9wKVxyXG4gICAgICAgIGNvbnN0IGJvdHRvbUxlZnQgPSB0aGlzLl9kaXN0YW5jZShlLnBhZ2VYLCBlLnBhZ2VZLCBlbGVtZW50Lm9mZnNldExlZnQsIGVsZW1lbnQub2Zmc2V0VG9wICsgZWxlbWVudC5vZmZzZXRIZWlnaHQpXHJcbiAgICAgICAgY29uc3QgYm90dG9tUmlnaHQgPSB0aGlzLl9kaXN0YW5jZShlLnBhZ2VYLCBlLnBhZ2VZLCBlbGVtZW50Lm9mZnNldExlZnQgKyBlbGVtZW50Lm9mZnNldFdpZHRoLCBlbGVtZW50Lm9mZnNldFRvcCArIGVsZW1lbnQub2Zmc2V0SGVpZ2h0KVxyXG4gICAgICAgIHJldHVybiBNYXRoLm1pbih0b3BMZWZ0LCB0b3BSaWdodCwgYm90dG9tTGVmdCwgYm90dG9tUmlnaHQpXHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZGV0ZXJtaW5lIHdoZXRoZXIgdGhlc2UgaXMgb3ZlcmxhcCBiZXR3ZWVuIHR3byBlbGVtZW50c1xyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmdcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9pbnNpZGUoZHJhZ2dpbmcsIGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgeDEgPSBkcmFnZ2luZy5vZmZzZXRMZWZ0XHJcbiAgICAgICAgY29uc3QgeTEgPSBkcmFnZ2luZy5vZmZzZXRUb3BcclxuICAgICAgICBjb25zdCB3MSA9IGRyYWdnaW5nLm9mZnNldFdpZHRoXHJcbiAgICAgICAgY29uc3QgaDEgPSBkcmFnZ2luZy5vZmZzZXRIZWlnaHRcclxuICAgICAgICBjb25zdCBwb3MgPSB0b0dsb2JhbChlbGVtZW50KVxyXG4gICAgICAgIGNvbnN0IHgyID0gcG9zLnhcclxuICAgICAgICBjb25zdCB5MiA9IHBvcy55XHJcbiAgICAgICAgY29uc3QgdzIgPSBlbGVtZW50Lm9mZnNldFdpZHRoXHJcbiAgICAgICAgY29uc3QgaDIgPSBlbGVtZW50Lm9mZnNldEhlaWdodFxyXG4gICAgICAgIHJldHVybiB4MSA8IHgyICsgdzIgJiYgeDEgKyB3MSA+IHgyICYmIHkxIDwgeTIgKyBoMiAmJiB5MSArIGgxID4geTJcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGZpbmQgY2xvc2VzdCBTb3J0YWJsZSB0byBzY3JlZW4gbG9jYXRpb25cclxuICAgICAqIEBwYXJhbSB7VUlFdmVudH0gZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmdcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGVbXX0gbGlzdCBvZiByZWxhdGVkIFNvcnRhYmxlc1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2ZpbmRDbG9zZXN0KGUsIGRyYWdnaW5nLCBsaXN0KVxyXG4gICAge1xyXG4gICAgICAgIGxldCBtaW4gPSBJbmZpbml0eSwgZm91bmRcclxuICAgICAgICBmb3IgKGxldCByZWxhdGVkIG9mIGxpc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5faW5zaWRlKGRyYWdnaW5nLCByZWxhdGVkLmVsZW1lbnQpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVsYXRlZFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHJlbGF0ZWQub3B0aW9ucy5hbHdheXNJbkxpc3QpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNhbGN1bGF0ZSA9IHRoaXMuX2Rpc3RhbmNlVG9DbG9zZXN0Q29ybmVyKGUsIHJlbGF0ZWQuZWxlbWVudClcclxuICAgICAgICAgICAgICAgIGlmIChjYWxjdWxhdGUgPCBtaW4pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWluID0gY2FsY3VsYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgZm91bmQgPSByZWxhdGVkXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZvdW5kXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geGExXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geWExXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geGEyXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geGEyXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geGIxXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geWIxXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geGIyXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geWIyXHJcbiAgICAgKiBjYWxjdWxhdGUgcGVyY2VudGFnZSBvZiBvdmVybGFwIGJldHdlZW4gdHdvIGJveGVzXHJcbiAgICAgKiBmcm9tIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMTIyMDAwNC8xOTU1OTk3XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGVyY2VudGFnZSh4YTEsIHlhMSwgeGEyLCB5YTIsIHhiMSwgeWIxLCB4YjIsIHliMilcclxuICAgIHtcclxuICAgICAgICBjb25zdCBzYSA9ICh4YTIgLSB4YTEpICogKHlhMiAtIHlhMSlcclxuICAgICAgICBjb25zdCBzYiA9ICh4YjIgLSB4YjEpICogKHliMiAtIHliMSlcclxuICAgICAgICBjb25zdCBzaSA9IE1hdGgubWF4KDAsIE1hdGgubWluKHhhMiwgeGIyKSAtIE1hdGgubWF4KHhhMSwgeGIxKSkgKiBNYXRoLm1heCgwLCBNYXRoLm1pbih5YTIsIHliMikgLSBNYXRoLm1heCh5YTEsIHliMSkpXHJcbiAgICAgICAgY29uc3QgdW5pb24gPSBzYSArIHNiIC0gc2lcclxuICAgICAgICByZXR1cm4gc2kgLyB1bmlvblxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGxhY2UgaW5kaWNhdG9yIGluIHRoZSBzb3J0YWJsZSBsaXN0IGFjY29yZGluZyB0byBvcHRpb25zLnNvcnRcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZyBlbGVtZW50XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGxhY2VJbkxpc3Qoc29ydGFibGUsIGRyYWdnaW5nKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLnNvcnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLl9wbGFjZUluU29ydGFibGVMaXN0KHNvcnRhYmxlLCBkcmFnZ2luZylcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fcGxhY2VJbk9yZGVyZWRMaXN0KHNvcnRhYmxlLCBkcmFnZ2luZylcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgX3RyYXZlcnNlQ2hpbGRyZW4oYmFzZSwgc2VhcmNoLCByZXN1bHRzKVxyXG4gICAge1xyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGJhc2UuY2hpbGRyZW4pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoc2VhcmNoLmxlbmd0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHNlYXJjaC5pbmRleE9mKGNoaWxkLmNsYXNzTmFtZSkgIT09IC0xKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChjaGlsZClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChjaGlsZClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl90cmF2ZXJzZUNoaWxkcmVuKGNoaWxkLCBzZWFyY2gsIHJlc3VsdHMpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZmluZCBjaGlsZHJlbiBpbiBkaXZcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcmRlcl0gc2VhcmNoIGZvciBkcmFnT3JkZXIgYXMgd2VsbFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2dldENoaWxkcmVuKHNvcnRhYmxlLCBvcmRlcilcclxuICAgIHtcclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5kZWVwU2VhcmNoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IHNlYXJjaCA9IFtdXHJcbiAgICAgICAgICAgIGlmIChvcmRlciAmJiBzb3J0YWJsZS5vcHRpb25zLm9yZGVyQ2xhc3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2gucHVzaChzb3J0YWJsZS5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChvcmRlciAmJiBzb3J0YWJsZS5vcHRpb25zLm9yZGVyQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoLnB1c2goc29ydGFibGUub3B0aW9ucy5vcmRlckNsYXNzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKCFvcmRlciAmJiBzb3J0YWJsZS5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc2VhcmNoLnB1c2goc29ydGFibGUub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdXHJcbiAgICAgICAgICAgIHRoaXMuX3RyYXZlcnNlQ2hpbGRyZW4oc29ydGFibGUuZWxlbWVudCwgc2VhcmNoLCByZXN1bHRzKVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0c1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxldCBsaXN0ID0gW11cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIHNvcnRhYmxlLmVsZW1lbnQuY2hpbGRyZW4pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2NvbnRhaW5zQ2xhc3NOYW1lKGNoaWxkLCBzb3J0YWJsZS5vcHRpb25zLmRyYWdDbGFzcykgfHwgKChvcmRlciB8fCAhc29ydGFibGUub3B0aW9ucy5vcmRlckNsYXNzKSB8fCAob3JkZXIgJiYgc29ydGFibGUub3B0aW9ucy5vcmRlckNsYXNzICYmIHRoaXMuX2NvbnRhaW5zQ2xhc3NOYW1lKGNoaWxkLCBzb3J0YWJsZS5vcHRpb25zLm9yZGVyQ2xhc3MpKSkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaXN0LnB1c2goY2hpbGQpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGxpc3RcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzb3J0YWJsZS5lbGVtZW50LmNoaWxkcmVuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwbGFjZSBpbmRpY2F0b3IgaW4gYW4gb3JkZXJlZCBsaXN0XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmdcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9wbGFjZUluT3JkZXJlZExpc3Qoc29ydGFibGUsIGRyYWdnaW5nKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGlkID0gc29ydGFibGUub3B0aW9ucy5vcmRlcklkXHJcbiAgICAgICAgZHJhZ2dpbmcuaW5kaWNhdG9yLnJlbW92ZSgpXHJcbiAgICAgICAgc29ydGFibGUuaW5kaWNhdG9yID0gZHJhZ2dpbmcuaW5kaWNhdG9yXHJcbiAgICAgICAgbGV0IGRyYWdPcmRlciA9IHNvcnRhYmxlLmluZGljYXRvci5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgZHJhZ09yZGVyID0gc29ydGFibGUub3B0aW9ucy5vcmRlcklkSXNOdW1iZXIgPyBwYXJzZUZsb2F0KGRyYWdPcmRlcikgOiBkcmFnT3JkZXJcclxuICAgICAgICBsZXQgZm91bmRcclxuICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuX2dldENoaWxkcmVuKHNvcnRhYmxlLCB0cnVlKVxyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLnJldmVyc2VPcmRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBjaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBjaGlsZHJlbltpXVxyXG4gICAgICAgICAgICAgICAgbGV0IGNoaWxkRHJhZ09yZGVyID0gY2hpbGQuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICAgICAgY2hpbGREcmFnT3JkZXIgPSBzb3J0YWJsZS5vcHRpb25zLm9yZGVySXNOdW1iZXIgPyBwYXJzZUZsb2F0KGNoaWxkRHJhZ09yZGVyKSA6IGNoaWxkRHJhZ09yZGVyXHJcbiAgICAgICAgICAgICAgICBpZiAoZHJhZ09yZGVyID4gY2hpbGREcmFnT3JkZXIpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoc29ydGFibGUuaW5kaWNhdG9yLCBjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRJY29uKGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGNoaWxkcmVuKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2hpbGREcmFnT3JkZXIgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgICAgICAgICBjaGlsZERyYWdPcmRlciA9IHNvcnRhYmxlLm9wdGlvbnMub3JkZXJJc051bWJlciA/IHBhcnNlRmxvYXQoY2hpbGREcmFnT3JkZXIpIDogY2hpbGREcmFnT3JkZXJcclxuICAgICAgICAgICAgICAgIGlmIChkcmFnT3JkZXIgPCBjaGlsZERyYWdPcmRlcilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShzb3J0YWJsZS5pbmRpY2F0b3IsIGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldEljb24oZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFmb3VuZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVsZW1lbnQuYXBwZW5kQ2hpbGQoc29ydGFibGUuaW5kaWNhdG9yKVxyXG4gICAgICAgICAgICB0aGlzLl9zZXRJY29uKGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmaW5kIGxhc3QgY2hpbGQgdGhhdCBpcyBvZiB0eXBlIGRyYWdDbGFzcyAoaWYgc2V0KVxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9nZXRMYXN0Q2hpbGQoc29ydGFibGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMuZGVlcFNlYXJjaClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNlYXJjaCA9IFtdXHJcbiAgICAgICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc2VhcmNoLnB1c2goc29ydGFibGUub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdXHJcbiAgICAgICAgICAgIHRoaXMuX3RyYXZlcnNlQ2hpbGRyZW4oc29ydGFibGUuZWxlbWVudCwgc2VhcmNoLCByZXN1bHRzKVxyXG4gICAgICAgICAgICBpZiAocmVzdWx0cy5sZW5ndGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRzW3Jlc3VsdHMubGVuZ3RoIC0gMV1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gc29ydGFibGUuZWxlbWVudC5jaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZCA9IHNvcnRhYmxlLmVsZW1lbnQuY2hpbGRyZW5baV1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fY29udGFpbnNDbGFzc05hbWUoY2hpbGQsIHNvcnRhYmxlLm9wdGlvbnMuZHJhZ0NsYXNzKSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjaGlsZFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc29ydGFibGUuZWxlbWVudC5jaGlsZHJlbi5sZW5ndGgpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNvcnRhYmxlLmVsZW1lbnQuY2hpbGRyZW5bc29ydGFibGUuZWxlbWVudC5jaGlsZHJlbi5sZW5ndGggLSAxXVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzZXQgaWNvbiBpZiBhdmFpbGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3NldEljb24oZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChkcmFnZ2luZy5jdXJyZW50ICYmIGRyYWdnaW5nLmN1cnJlbnQgIT09IHNvcnRhYmxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZHJhZ2dpbmcuY3VycmVudC5lbWl0KCdyZW1vdmUtcGVuZGluZycsIGRyYWdnaW5nLCBkcmFnZ2luZy5jdXJyZW50KVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZHJhZ2dpbmcuaWNvbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGRyYWdnaW5nLmljb24uc3JjID0gZHJhZ2dpbmcub3JpZ2luYWwgPT09IHNvcnRhYmxlID8gc29ydGFibGUub3B0aW9ucy5pY29ucy5yZW9yZGVyIDogc29ydGFibGUub3B0aW9ucy5pY29ucy5tb3ZlXHJcbiAgICAgICAgICAgIGRyYWdnaW5nLmN1cnJlbnQgPSBzb3J0YWJsZVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZHJhZ2dpbmcub3JpZ2luYWwgPT09IHNvcnRhYmxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnb3JkZXItcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgc29ydGFibGUuZW1pdCgndXBkYXRlLXBlbmRpbmcnLCBzb3J0YWJsZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnYWRkLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ3VwZGF0ZS1wZW5kaW5nJylcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwbGFjZSBpbmRpY2F0b3IgaW4gYW4gc29ydGFibGUgbGlzdFxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGxhY2VJblNvcnRhYmxlTGlzdChzb3J0YWJsZSwgZHJhZ2dpbmcpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHNvcnRhYmxlLmVsZW1lbnRcclxuICAgICAgICBzb3J0YWJsZS5lbGVtZW50LmFwcGVuZENoaWxkKGRyYWdnaW5nLmluZGljYXRvcilcclxuICAgICAgICBzb3J0YWJsZS5pbmRpY2F0b3IgPSBkcmFnZ2luZy5pbmRpY2F0b3JcclxuICAgICAgICBjb25zdCBsYXN0Q2hpbGQgPSB0aGlzLl9nZXRMYXN0Q2hpbGQoc29ydGFibGUpXHJcbiAgICAgICAgaWYgKCFsYXN0Q2hpbGQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKHNvcnRhYmxlLmluZGljYXRvcilcclxuICAgICAgICAgICAgdGhpcy5fc2V0SWNvbihkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZy5vZmZzZXRUb3AgPj0gZWxlbWVudC5vZmZzZXRUb3AgKyBlbGVtZW50Lm9mZnNldEhlaWdodClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChzb3J0YWJsZS5pbmRpY2F0b3IpXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRJY29uKGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChkcmFnZ2luZy5vZmZzZXRUb3AgKyBkcmFnZ2luZy5vZmZzZXRIZWlnaHQgPCBlbGVtZW50Lm9mZnNldFRvcClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5pbnNlcnRCZWZvcmUoc29ydGFibGUuaW5kaWNhdG9yLCBlbGVtZW50LmZpcnN0Q2hpbGQpXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRJY29uKGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHhhMSA9IGRyYWdnaW5nLm9mZnNldExlZnRcclxuICAgICAgICAgICAgICAgIGNvbnN0IHlhMSA9IGRyYWdnaW5nLm9mZnNldFRvcFxyXG4gICAgICAgICAgICAgICAgY29uc3QgeGEyID0gZHJhZ2dpbmcub2Zmc2V0TGVmdCArIGRyYWdnaW5nLm9mZnNldFdpZHRoXHJcbiAgICAgICAgICAgICAgICBjb25zdCB5YTIgPSBkcmFnZ2luZy5vZmZzZXRUb3AgKyBkcmFnZ2luZy5vZmZzZXRIZWlnaHRcclxuICAgICAgICAgICAgICAgIGxldCBsYXJnZXN0ID0gMCwgY2xvc2VzdCwgaXNCZWZvcmUgPSB0cnVlLCBpbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNlYXJjaCA9IFtdXHJcbiAgICAgICAgICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoLnB1c2goc29ydGFibGUub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5vcmRlckNsYXNzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaC5wdXNoKHNvcnRhYmxlLm9wdGlvbnMub3JkZXJDbGFzcylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IGVsZW1lbnRzID0gdGhpcy5fZ2V0Q2hpbGRyZW4oc29ydGFibGUsIHRydWUpXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBlbGVtZW50cylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGQgPT09IHNvcnRhYmxlLmluZGljYXRvcilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGljYXRvciA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9zID0gdG9HbG9iYWwoY2hpbGQpXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeGIxID0gcG9zLnhcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB5YjEgPSBwb3MueVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHhiMiA9IHBvcy54ICsgY2hpbGQub2Zmc2V0V2lkdGhcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB5YjIgPSBwb3MueSArIGNoaWxkLm9mZnNldEhlaWdodFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBlcmNlbnRhZ2UgPSB0aGlzLl9wZXJjZW50YWdlKHhhMSwgeWExLCB4YTIsIHlhMiwgeGIxLCB5YjEsIHhiMiwgeWIyKVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwZXJjZW50YWdlID4gbGFyZ2VzdClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcmdlc3QgPSBwZXJjZW50YWdlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb3Nlc3QgPSBjaGlsZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpc0JlZm9yZSA9IGluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChjbG9zZXN0ICYmIGNsb3Nlc3QgIT09IHNvcnRhYmxlLmluZGljYXRvcilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNCZWZvcmUpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lmluc2VydEJlZm9yZShzb3J0YWJsZS5pbmRpY2F0b3IsIGNsb3Nlc3QubmV4dFNpYmxpbmcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldEljb24oZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdvcmRlci1wZW5kaW5nJywgc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKHNvcnRhYmxlLmluZGljYXRvciwgY2xvc2VzdClcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0SWNvbihkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ29yZGVyLXBlbmRpbmcnLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc29ydGFibGUuZWxlbWVudC5hcHBlbmRDaGlsZChkcmFnZ2luZy5pbmRpY2F0b3IpXHJcbiAgICAgICAgICAgICAgICAgICAgc29ydGFibGUuaW5kaWNhdG9yID0gZHJhZ2dpbmcuaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0SWNvbihkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgbW92ZVxyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZHJhZ01vdmUoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5kcmFnZ2luZylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5kcmFnZ2luZy5waWNrdXApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9kaXN0YW5jZSh0aGlzLmRyYWdnaW5nLnN0YXJ0LngsIHRoaXMuZHJhZ2dpbmcuc3RhcnQueSwgZS5wYWdlWCwgZS5wYWdlWSkgPiB0aGlzLm9wdGlvbnMudGhyZXNob2xkKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3BpY2t1cChlKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuc3R5bGUubGVmdCA9IGUucGFnZVggKyB0aGlzLm9mZnNldC54ICsgJ3B4J1xyXG4gICAgICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLnRvcCA9IGUucGFnZVkgKyB0aGlzLm9mZnNldC55ICsgJ3B4J1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kcmFnZ2luZy5pY29uKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLmljb24uc3R5bGUubGVmdCA9IGUucGFnZVggKyB0aGlzLm9mZnNldC54ICsgdGhpcy5kcmFnZ2luZy5vZmZzZXRXaWR0aCArICdweCdcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuaWNvbi5zdHlsZS50b3AgPSBlLnBhZ2VZICsgdGhpcy5vZmZzZXQueSArIHRoaXMuZHJhZ2dpbmcub2Zmc2V0SGVpZ2h0ICsgJ3B4J1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGxpc3QgPSBbXVxyXG4gICAgICAgICAgICBmb3IgKGxldCBzb3J0YWJsZSBvZiBTb3J0YWJsZS5saXN0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5uYW1lID09PSB0aGlzLm9wdGlvbnMubmFtZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsaXN0LnB1c2goc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmFsd2F5c0luTGlzdCB8fCB0aGlzLl9pbnNpZGUodGhpcy5kcmFnZ2luZywgdGhpcy5lbGVtZW50KSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLnNvcnRhYmxlID0gdGhpc1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3BsYWNlSW5MaXN0KHRoaXMsIHRoaXMuZHJhZ2dpbmcpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5pbmRpY2F0b3IucmVtb3ZlKClcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5kcmFnZ2luZy5pY29uKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5pY29uLnNyYyA9IHRoaXMub3B0aW9ucy5pY29ucy5kZWxldGVcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjbG9zZXN0ID0gdGhpcy5fZmluZENsb3Nlc3QoZSwgdGhpcy5kcmFnZ2luZywgbGlzdClcclxuICAgICAgICAgICAgICAgIGlmIChjbG9zZXN0KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuc29ydGFibGUgPSBjbG9zZXN0XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGxhY2VJbkxpc3QoY2xvc2VzdCwgdGhpcy5kcmFnZ2luZylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLnNvcnRhYmxlID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuaW5kaWNhdG9yLnJlbW92ZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmcuaWNvbilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuaWNvbi5zcmMgPSB0aGlzLm9wdGlvbnMuaWNvbnMuZGVsZXRlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIHVwXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kcmFnVXAoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5kcmFnZ2luZylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRyYWdnaW5nLnBpY2t1cClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5zdHlsZS5wb3NpdGlvbiA9ICd1bnNldCdcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuc3R5bGUuekluZGV4ID0gJ3Vuc2V0J1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5zdHlsZS5ib3hTaGFkb3cgPSAndW5zZXQnXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLm9wYWNpdHkgPSAndW5zZXQnXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pbmRpY2F0b3IucGFyZW50Tm9kZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGljYXRvci5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0aGlzLmRyYWdnaW5nLCB0aGlzLmluZGljYXRvcilcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLm9yaWdpbmFsID0gdGhpcy5kcmFnZ2luZy5jdXJyZW50XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3IucmVtb3ZlKClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGljYXRvciA9IG51bGxcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5kcmFnZ2luZy5vcmlnaW5hbCA9PT0gdGhpcylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgnb3JkZXInLCB0aGlzLmRyYWdnaW5nLCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ3VwZGF0ZScsIHRoaXMuZHJhZ2dpbmcsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcub3JpZ2luYWwuZW1pdCgncmVtb3ZlJywgdGhpcy5kcmFnZ2luZywgdGhpcy5kcmFnZ2luZy5vcmlnaW5hbClcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5vcmlnaW5hbC5lbWl0KCd1cGRhdGUnLCB0aGlzLmRyYWdnaW5nLCB0aGlzLmRyYWdnaW5nLm9yaWdpbmFsKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLnNvcnRhYmxlLmVtaXQoJ2FkZCcsIHRoaXMuZHJhZ2dpbmcsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuc29ydGFibGUuZW1pdCgndXBkYXRlJywgdGhpcy5kcmFnZ2luZywgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5yZW1vdmUoKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcub3JpZ2luYWwgPSBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3IucmVtb3ZlKClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGljYXRvciA9IG51bGxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLm9yaWdpbmFsLmVtaXQoJ3JlbW92ZScsIHRoaXMuZHJhZ2dpbmcsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kcmFnZ2luZy5pY29uKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuaWNvbi5yZW1vdmUoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdjbGlja2VkJywgdGhpcy5kcmFnZ2luZywgdGhpcylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmRyYWdnaW5nID0gbnVsbFxyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB0aGUgZ2xvYmFsIGRlZmF1bHRzIGZvciBuZXcgU29ydGFibGUgb2JqZWN0c1xyXG4gICAgICogQHR5cGUge0RlZmF1bHRPcHRpb25zfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0IGRlZmF1bHRzKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gZGVmYXVsdHNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNyZWF0ZSBtdWx0aXBsZSBzb3J0YWJsZSBlbGVtZW50c1xyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudHNbXX0gZWxlbWVudHNcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIC0gc2VlIGNvbnN0cnVjdG9yIGZvciBvcHRpb25zXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBjcmVhdGUoZWxlbWVudHMsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdXHJcbiAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiBlbGVtZW50cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaChuZXcgU29ydGFibGUoZWxlbWVudCwgb3B0aW9ucykpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHRzXHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU29ydGFibGVcclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgY2xpY2tlZCBidXQgbm90IG1vdmVkIGJleW9uZCB0aGUgb3B0aW9ucy50aHJlc2hvbGRcclxuICogQGV2ZW50IFNvcnRhYmxlI2NsaWNrZWRcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBjbGlja2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIGNvbnRhaW5pbmcgZWxlbWVudFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgcGlja2VkIHVwIGJlY2F1c2UgaXQgd2FzIG1vdmVkIGJleW9uZCB0aGUgb3B0aW9ucy50aHJlc2hvbGRcclxuICogQGV2ZW50IFNvcnRhYmxlI3BpY2t1cFxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhIHNvcnRhYmxlIGlzIHJlb3JkZXJlZFxyXG4gKiBAZXZlbnQgU29ydGFibGUjb3JkZXJcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCB0aGF0IHdhcyByZW9yZGVyZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgcGxhY2VkXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyBhZGRlZCB0byB0aGlzIHNvcnRhYmxlXHJcbiAqIEBldmVudCBTb3J0YWJsZSNhZGRcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBhZGRlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyBhZGRlZFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgcmVtb3ZlZCBmcm9tIHRoaXMgc29ydGFibGVcclxuICogQGV2ZW50IFNvcnRhYmxlI3JlbW92ZVxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHJlbW92ZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgcmVtb3ZlZFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIHRoZSBzb3J0YWJsZSBpcyB1cGRhdGVkIHdpdGggYW4gYWRkLCByZW1vdmUsIG9yIG9yZGVyIGNoYW5nZVxyXG4gKiBAZXZlbnQgU29ydGFibGUjdXBkYXRlXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgY2hhbmdlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aXRoIGVsZW1lbnRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBvcmRlciB3YXMgY2hhbmdlZCBidXQgZWxlbWVudCB3YXMgbm90IGRyb3BwZWQgeWV0XHJcbiAqIEBldmVudCBTb3J0YWJsZSNvcmRlci1wZW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgYmVpbmcgZHJhZ2dlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBjdXJyZW50IHNvcnRhYmxlIHdpdGggZWxlbWVudCBwbGFjZWhvbGRlclxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGVsZW1lbnQgaXMgYWRkZWQgYnV0IG5vdCBkcm9wcGVkIHlldFxyXG4gKiBAZXZlbnQgU29ydGFibGUjYWRkLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gZWxlbWVudCBpcyByZW1vdmVkIGJ1dCBub3QgZHJvcHBlZCB5ZXRcclxuICogQGV2ZW50IFNvcnRhYmxlI3JlbW92ZS1wZW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgYmVpbmcgZHJhZ2dlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBjdXJyZW50IHNvcnRhYmxlIHdpdGggZWxlbWVudCBwbGFjZWhvbGRlclxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgYWRkZWQsIHJlbW92ZWQsIG9yIHJlb3JkZXIgYnV0IGVsZW1lbnQgaGFzIG5vdCBkcm9wcGVkIHlldFxyXG4gKiBAZXZlbnQgU29ydGFibGUjdXBkYXRlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqLyJdfQ==