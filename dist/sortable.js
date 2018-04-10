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
                        sortable.emit('dragging-order-change', sortable);
                    } else {
                        element.insertBefore(sortable.indicator, closest);
                        this._setIcon(dragging, sortable);
                        sortable.emit('dragging-order-change', sortable);
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
                    this._placeInList(closest, this.dragging);
                } else {
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
                this.dragging.style.position = '';
                this.dragging.style.zIndex = '';
                this.dragging.style.boxShadow = '';
                this.dragging.style.opacity = '';
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
                        this.emit('add', this.dragging, this);
                        this.emit('update', this.dragging, this);
                    }
                } else {
                    this.dragging.remove();
                    this.dragging.original = null;
                    this.indicator.remove();
                    this.indicator = null;
                    this.emit('remove', this.dragging, this);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3J0YWJsZS5qcyJdLCJuYW1lcyI6WyJFdmVudHMiLCJyZXF1aXJlIiwidG9HbG9iYWwiLCJkZWZhdWx0cyIsIlNvcnRhYmxlIiwiY29uc3RydWN0b3IiLCJlbGVtZW50Iiwib3B0aW9ucyIsIm9wdGlvbiIsInNvcnRhYmxlIiwiZWxlbWVudHMiLCJfZ2V0Q2hpbGRyZW4iLCJjaGlsZCIsImRyYWdDbGFzcyIsIl9jb250YWluc0NsYXNzTmFtZSIsIl9faXNTb3J0YWJsZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJlIiwiX2RyYWdTdGFydCIsImNoaWxkcmVuU3R5bGVzIiwic3R5bGUiLCJvcmlnaW5hbCIsImRvY3VtZW50IiwiYm9keSIsIl9kcmFnTW92ZSIsIl9kcmFnVXAiLCJsaXN0IiwicHVzaCIsIm5hbWUiLCJjbGFzc05hbWUiLCJzcGxpdCIsImVudHJ5IiwiYWRkIiwiaW5kZXgiLCJhdHRhY2hFbGVtZW50IiwiY2hpbGRyZW4iLCJsZW5ndGgiLCJhcHBlbmRDaGlsZCIsImluc2VydEJlZm9yZSIsImRyYWdnaW5nIiwiY3VycmVudFRhcmdldCIsInBpY2t1cCIsInN0YXJ0IiwieCIsInBhZ2VYIiwieSIsInBhZ2VZIiwiY3Vyc29yIiwicHJldmVudERlZmF1bHQiLCJfcGlja3VwIiwiaW5kaWNhdG9yIiwiY2xvbmVOb2RlIiwicG9zIiwicG9zaXRpb24iLCJvZmZzZXQiLCJsZWZ0IiwidG9wIiwiZHJhZ1N0eWxlIiwicGFyZW50Tm9kZSIsInVzZUljb25zIiwiaW1hZ2UiLCJJbWFnZSIsInNyYyIsImljb25zIiwicmVvcmRlciIsInRyYW5zZm9ybSIsIm9mZnNldFdpZHRoIiwib2Zmc2V0SGVpZ2h0IiwiaWNvbiIsImVtaXQiLCJfZGlzdGFuY2UiLCJ4MSIsInkxIiwieDIiLCJ5MiIsIk1hdGgiLCJzcXJ0IiwicG93IiwiX2Rpc3RhbmNlVG9DbG9zZXN0Q29ybmVyIiwidG9wTGVmdCIsIm9mZnNldExlZnQiLCJvZmZzZXRUb3AiLCJ0b3BSaWdodCIsImJvdHRvbUxlZnQiLCJib3R0b21SaWdodCIsIm1pbiIsIl9pbnNpZGUiLCJ3MSIsImgxIiwidzIiLCJoMiIsIl9maW5kQ2xvc2VzdCIsIkluZmluaXR5IiwiZm91bmQiLCJyZWxhdGVkIiwiYWx3YXlzSW5MaXN0IiwiY2FsY3VsYXRlIiwiX3BlcmNlbnRhZ2UiLCJ4YTEiLCJ5YTEiLCJ4YTIiLCJ5YTIiLCJ4YjEiLCJ5YjEiLCJ4YjIiLCJ5YjIiLCJzYSIsInNiIiwic2kiLCJtYXgiLCJ1bmlvbiIsIl9wbGFjZUluTGlzdCIsInNvcnQiLCJfcGxhY2VJblNvcnRhYmxlTGlzdCIsIl9wbGFjZUluT3JkZXJlZExpc3QiLCJfdHJhdmVyc2VDaGlsZHJlbiIsImJhc2UiLCJzZWFyY2giLCJyZXN1bHRzIiwiaW5kZXhPZiIsIm9yZGVyIiwiZGVlcFNlYXJjaCIsIm9yZGVyQ2xhc3MiLCJpZCIsIm9yZGVySWQiLCJyZW1vdmUiLCJkcmFnT3JkZXIiLCJnZXRBdHRyaWJ1dGUiLCJvcmRlcklkSXNOdW1iZXIiLCJwYXJzZUZsb2F0IiwicmV2ZXJzZU9yZGVyIiwiaSIsImNoaWxkRHJhZ09yZGVyIiwib3JkZXJJc051bWJlciIsIl9zZXRJY29uIiwiX2dldExhc3RDaGlsZCIsIm1vdmUiLCJjdXJyZW50IiwibGFzdENoaWxkIiwiZmlyc3RDaGlsZCIsImxhcmdlc3QiLCJjbG9zZXN0IiwiaXNCZWZvcmUiLCJwZXJjZW50YWdlIiwibmV4dFNpYmxpbmciLCJ0aHJlc2hvbGQiLCJkZWxldGUiLCJzdG9wUHJvcGFnYXRpb24iLCJ6SW5kZXgiLCJib3hTaGFkb3ciLCJvcGFjaXR5IiwiY3JlYXRlIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTUEsU0FBU0MsUUFBUSxlQUFSLENBQWY7O0FBRUEsTUFBTUMsV0FBV0QsUUFBUSxZQUFSLENBQWpCO0FBQ0EsTUFBTUUsV0FBV0YsUUFBUSxXQUFSLENBQWpCOztBQUVBLE1BQU1HLFFBQU4sU0FBdUJKLE1BQXZCLENBQ0E7QUFDSTs7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SUFBUixDQUFhLElBQUl2QixRQUFKLENBQWFFLE9BQWIsRUFBc0JDLE9BQXRCLENBQWI7QUFDSDtBQUNELGVBQU8rRyxPQUFQO0FBQ0g7QUFydUJMOztBQXd1QkFrQyxPQUFPQyxPQUFQLEdBQWlCckosUUFBakI7O0FBRUE7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0EiLCJmaWxlIjoic29ydGFibGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBFdmVudHMgPSByZXF1aXJlKCdldmVudGVtaXR0ZXIzJylcclxuXHJcbmNvbnN0IHRvR2xvYmFsID0gcmVxdWlyZSgnLi90b0dsb2JhbCcpXHJcbmNvbnN0IGRlZmF1bHRzID0gcmVxdWlyZSgnLi9vcHRpb25zJylcclxuXHJcbmNsYXNzIFNvcnRhYmxlIGV4dGVuZHMgRXZlbnRzXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIHNvcnRhYmxlIGxpc3RcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5uYW1lPXNvcnRhYmxlXSBkcmFnZ2luZyBpcyBhbGxvd2VkIGJldHdlZW4gU29ydGFibGVzIHdpdGggdGhlIHNhbWUgbmFtZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5zb3J0PXRydWVdIGFsbG93IHNvcnRpbmcgd2l0aGluIGxpc3RcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5kcmFnQ2xhc3NdIGlmIHNldCB0aGVuIGRyYWcgb25seSBpdGVtcyB3aXRoIHRoaXMgY2xhc3NOYW1lIHVuZGVyIGVsZW1lbnQsIG90aGVyd2lzZSB1c2UgYWxsIGNoaWxkcmVuXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmRlZXBTZWFyY2hdIGlmIGRyYWdDbGFzcyBhbmQgZGVlcFNlYXJjaCB0aGVuIHNlYXJjaCBhbGwgZGVzY2VuZGVudHMgb2YgZWxlbWVudCBmb3IgZHJhZ0NsYXNzXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMub3JkZXJJZD1kYXRhLW9yZGVyXSBmb3Igbm9uLXNvcnRpbmcgbGlzdHMsIHVzZSB0aGlzIGRhdGEgaWQgdG8gZmlndXJlIG91dCBzb3J0IG9yZGVyXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLm9yZGVySWRJc051bWJlcj10cnVlXSB1c2UgcGFyc2VJbnQgb24gb3B0aW9ucy5vcmRlcklkIHRvIHByb3Blcmx5IHNvcnQgbnVtYmVyc1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnJldmVyc2VPcmRlcl0gcmV2ZXJzZSBzb3J0IHRoZSBvcmRlcklkXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmFsd2F5c0luTGlzdD10cnVlXSBwbGFjZSBlbGVtZW50IGluc2lkZSBjbG9zZXN0IHJlbGF0ZWQgU29ydGFibGUgb2JqZWN0OyBpZiBzZXQgdG8gZmFsc2UgdGhlbiB0aGUgb2JqZWN0IGlzIHJlbW92ZWQgaWYgZHJvcHBlZCBvdXRzaWRlIHJlbGF0ZWQgc29ydGFibGVzXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnMuY2hpbGRyZW5TdHlsZXNdIHN0eWxlcyB0byBhcHBseSB0byBjaGlsZHJlbiBlbGVtZW50cyBvZiBTb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zLmljb25zXSBkZWZhdWx0IHNldCBvZiBpY29uc1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmljb25zLnJlb3JkZXJdIHNvdXJjZSBvZiBpbWFnZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmljb25zLm1vdmVdIHNvdXJjZSBvZiBpbWFnZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmljb25zLmNvcHldIHNvdXJjZSBvZiBpbWFnZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmljb25zLmRlbGV0ZV0gc291cmNlIG9mIGltYWdlXHJcbiAgICAgKiBAZmlyZXMgY2xpY2tlZFxyXG4gICAgICogQGZpcmVzIHBpY2t1cFxyXG4gICAgICogQGZpcmVzIG9yZGVyXHJcbiAgICAgKiBAZmlyZXMgYWRkXHJcbiAgICAgKiBAZmlyZXMgcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgdXBkYXRlXHJcbiAgICAgKiBAZmlyZXMgb3JkZXItcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIGFkZC1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgcmVtb3ZlLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyB1cGRhdGUtcGVuZGluZ1xyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyKClcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgZm9yIChsZXQgb3B0aW9uIGluIGRlZmF1bHRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zW29wdGlvbl0gPSB0eXBlb2YgdGhpcy5vcHRpb25zW29wdGlvbl0gIT09ICd1bmRlZmluZWQnID8gb3B0aW9uc1tvcHRpb25dIDogZGVmYXVsdHNbb3B0aW9uXVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnNvcnRhYmxlID0gdGhpc1xyXG4gICAgICAgIGNvbnN0IGVsZW1lbnRzID0gdGhpcy5fZ2V0Q2hpbGRyZW4odGhpcylcclxuICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBlbGVtZW50cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5vcHRpb25zLmRyYWdDbGFzcyB8fCB0aGlzLl9jb250YWluc0NsYXNzTmFtZShjaGlsZCwgdGhpcy5vcHRpb25zLmRyYWdDbGFzcykpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkLl9faXNTb3J0YWJsZSA9IHRydWVcclxuICAgICAgICAgICAgICAgIGNoaWxkLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChlKSA9PiB0aGlzLl9kcmFnU3RhcnQoZSkpXHJcbiAgICAgICAgICAgICAgICBjaGlsZC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgKGUpID0+IHRoaXMuX2RyYWdTdGFydChlKSlcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IG9wdGlvbiBpbiB0aGlzLm9wdGlvbnMuY2hpbGRyZW5TdHlsZXMpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQuc3R5bGVbb3B0aW9uXSA9IHRoaXMub3B0aW9ucy5jaGlsZHJlblN0eWxlc1tvcHRpb25dXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5vcmlnaW5hbCA9IHRoaXNcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIChlKSA9PiB0aGlzLl9kcmFnTW92ZShlKSlcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIChlKSA9PiB0aGlzLl9kcmFnTW92ZShlKSlcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNodXAnLCAoZSkgPT4gdGhpcy5fZHJhZ1VwKGUpKVxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hjYW5jZWwnLCAoZSkgPT4gdGhpcy5fZHJhZ1VwKGUpKVxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIChlKSA9PiB0aGlzLl9kcmFnVXAoZSkpXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWNhbmNlbCcsIChlKSA9PiB0aGlzLl9kcmFnVXAoZSkpXHJcblxyXG4gICAgICAgIGlmICghU29ydGFibGUubGlzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFNvcnRhYmxlLmxpc3QgPSBbXVxyXG4gICAgICAgIH1cclxuICAgICAgICBTb3J0YWJsZS5saXN0LnB1c2godGhpcylcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFdoZXRoZXIgZWxlbWVudCBjb250YWlucyBjbGFzc25hbWVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9jb250YWluc0NsYXNzTmFtZShlLCBuYW1lKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGxpc3QgPSBlLmNsYXNzTmFtZS5zcGxpdCgnICcpXHJcbiAgICAgICAgZm9yIChsZXQgZW50cnkgb2YgbGlzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChlbnRyeSA9PT0gbmFtZSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFkZCBhbiBlbGVtZW50IGFzIGEgY2hpbGQgb2YgdGhlIHNvcnRhYmxlIGVsZW1lbnQ7IGNhbiBhbHNvIGJlIHVzZWQgdG8gc3dhcCBiZXR3ZWVuIHNvcnRhYmxlc1xyXG4gICAgICogTk9URTogdGhpcyB3aWxsIG5vdCB3b3JrIHdpdGggZGVlcC10eXBlIGVsZW1lbnRzOyB1c2UgYXR0YWNoRWxlbWVudCBpbnN0ZWFkXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXhcclxuICAgICAqL1xyXG4gICAgYWRkKGVsZW1lbnQsIGluZGV4KVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuYXR0YWNoRWxlbWVudChlbGVtZW50KVxyXG4gICAgICAgIGlmICh0eXBlb2YgaW5kZXggPT09ICd1bmRlZmluZWQnIHx8IGluZGV4ID49IHRoaXMuZWxlbWVudC5jaGlsZHJlbi5sZW5ndGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZWxlbWVudClcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50Lmluc2VydEJlZm9yZShlbGVtZW50LCB0aGlzLmVsZW1lbnQuY2hpbGRyZW5baW5kZXggKyAxXSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhdHRhY2hlcyBhbiBIVE1MIGVsZW1lbnQgdG8gdGhlIHNvcnRhYmxlOyBjYW4gYWxzbyBiZSB1c2VkIHRvIHN3YXAgYmV0d2VlbiBzb3J0YWJsZXNcclxuICAgICAqIE5PVEU6IHlvdSBuZWVkIHRvIG1hbnVhbGx5IGluc2VydCB0aGUgZWxlbWVudCBpbnRvIHRoaXMuZWxlbWVudCAodGhpcyBpcyB1c2VmdWwgd2hlbiB5b3UgaGF2ZSBhIGRlZXAgc3RydWN0dXJlKVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICovXHJcbiAgICBhdHRhY2hFbGVtZW50KGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGVsZW1lbnQuX19pc1NvcnRhYmxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZWxlbWVudC5vcmlnaW5hbCA9IHRoaXNcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZWxlbWVudC5fX2lzU29ydGFibGUgPSB0cnVlXHJcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKGUpID0+IHRoaXMuX2RyYWdTdGFydChlKSlcclxuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgKGUpID0+IHRoaXMuX2RyYWdTdGFydChlKSlcclxuICAgICAgICAgICAgZm9yIChsZXQgb3B0aW9uIGluIHRoaXMub3B0aW9ucy5jaGlsZHJlblN0eWxlcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5zdHlsZVtvcHRpb25dID0gdGhpcy5vcHRpb25zLmNoaWxkcmVuU3R5bGVzW29wdGlvbl1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbGVtZW50Lm9yaWdpbmFsID0gdGhpc1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHN0YXJ0IGRyYWdcclxuICAgICAqIEBwYXJhbSB7VUlFdmVudH0gZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2RyYWdTdGFydChlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcgPSBlLmN1cnJlbnRUYXJnZXRcclxuICAgICAgICB0aGlzLmRyYWdnaW5nLnBpY2t1cCA9IGZhbHNlXHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZy5zdGFydCA9IHsgeDogZS5wYWdlWCwgeTogZS5wYWdlWSB9XHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZy5zdHlsZS5jdXJzb3IgPSAnbm8tY3Vyc29yJ1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGlja3VwIGFuZCBjbG9uZSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9waWNrdXAoZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLmluZGljYXRvciA9IHRoaXMuZHJhZ2dpbmcuY2xvbmVOb2RlKHRydWUpXHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZy5pbmRpY2F0b3IgPSB0aGlzLmluZGljYXRvclxyXG4gICAgICAgIGNvbnN0IHBvcyA9IHRvR2xvYmFsKHRoaXMuZHJhZ2dpbmcpXHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZy5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcclxuICAgICAgICB0aGlzLm9mZnNldCA9IHsgeDogcG9zLnggLSBlLnBhZ2VYLCB5OiBwb3MueSAtIGUucGFnZVkgfVxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcuc3R5bGUubGVmdCA9IHBvcy54ICsgJ3B4J1xyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcuc3R5bGUudG9wID0gcG9zLnkgKyAncHgnXHJcbiAgICAgICAgZm9yIChsZXQgb3B0aW9uIGluIHRoaXMub3B0aW9ucy5kcmFnU3R5bGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlW29wdGlvbl0gPSB0aGlzLm9wdGlvbnMuZHJhZ1N0eWxlW29wdGlvbl1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZy5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0aGlzLmluZGljYXRvciwgdGhpcy5kcmFnZ2luZylcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuZHJhZ2dpbmcpXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy51c2VJY29ucylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGltYWdlID0gbmV3IEltYWdlKClcclxuICAgICAgICAgICAgaW1hZ2Uuc3JjID0gdGhpcy5vcHRpb25zLmljb25zLnJlb3JkZXJcclxuICAgICAgICAgICAgaW1hZ2Uuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoLTUwJSwgLTUwJSknXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLmxlZnQgPSBwb3MueCArIHRoaXMuZHJhZ2dpbmcub2Zmc2V0V2lkdGggKyAncHgnXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLnRvcCA9IHBvcy55ICsgdGhpcy5kcmFnZ2luZy5vZmZzZXRIZWlnaHQgKyAncHgnXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaW1hZ2UpXHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuaWNvbiA9IGltYWdlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcucGlja3VwID0gdHJ1ZVxyXG4gICAgICAgIHRoaXMuZW1pdCgncGlja3VwJywgdGhpcy5kcmFnZ2luZywgdGhpcylcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIG1lYXN1cmUgZGlzdGFuY2UgYmV0d2VlbiB0d28gcG9pbnRzXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geDFcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5MVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHgyXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geTJcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kaXN0YW5jZSh4MSwgeTEsIHgyLCB5MilcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KHgxIC0geDIsIDIpICsgTWF0aC5wb3coeTEgLSB5MiwgMikpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmaW5kIGNsb3Nlc3QgZGlzdGFuY2UgZnJvbSBVSUV2ZW50IHRvIGEgY29ybmVyIG9mIGFuIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7SFRNTFVMaXN0RWxlbWVudH0gZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2Rpc3RhbmNlVG9DbG9zZXN0Q29ybmVyKGUsIGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgdG9wTGVmdCA9IHRoaXMuX2Rpc3RhbmNlKGUucGFnZVgsIGUucGFnZVksIGVsZW1lbnQub2Zmc2V0TGVmdCwgZWxlbWVudC5vZmZzZXRUb3ApXHJcbiAgICAgICAgY29uc3QgdG9wUmlnaHQgPSB0aGlzLl9kaXN0YW5jZShlLnBhZ2VYLCBlLnBhZ2VZLCBlbGVtZW50Lm9mZnNldExlZnQgKyBlbGVtZW50Lm9mZnNldFdpZHRoLCBlbGVtZW50Lm9mZnNldFRvcClcclxuICAgICAgICBjb25zdCBib3R0b21MZWZ0ID0gdGhpcy5fZGlzdGFuY2UoZS5wYWdlWCwgZS5wYWdlWSwgZWxlbWVudC5vZmZzZXRMZWZ0LCBlbGVtZW50Lm9mZnNldFRvcCArIGVsZW1lbnQub2Zmc2V0SGVpZ2h0KVxyXG4gICAgICAgIGNvbnN0IGJvdHRvbVJpZ2h0ID0gdGhpcy5fZGlzdGFuY2UoZS5wYWdlWCwgZS5wYWdlWSwgZWxlbWVudC5vZmZzZXRMZWZ0ICsgZWxlbWVudC5vZmZzZXRXaWR0aCwgZWxlbWVudC5vZmZzZXRUb3AgKyBlbGVtZW50Lm9mZnNldEhlaWdodClcclxuICAgICAgICByZXR1cm4gTWF0aC5taW4odG9wTGVmdCwgdG9wUmlnaHQsIGJvdHRvbUxlZnQsIGJvdHRvbVJpZ2h0KVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIGRldGVybWluZSB3aGV0aGVyIHRoZXNlIGlzIG92ZXJsYXAgYmV0d2VlbiB0d28gZWxlbWVudHNcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfaW5zaWRlKGRyYWdnaW5nLCBlbGVtZW50KVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHgxID0gZHJhZ2dpbmcub2Zmc2V0TGVmdFxyXG4gICAgICAgIGNvbnN0IHkxID0gZHJhZ2dpbmcub2Zmc2V0VG9wXHJcbiAgICAgICAgY29uc3QgdzEgPSBkcmFnZ2luZy5vZmZzZXRXaWR0aFxyXG4gICAgICAgIGNvbnN0IGgxID0gZHJhZ2dpbmcub2Zmc2V0SGVpZ2h0XHJcbiAgICAgICAgY29uc3QgcG9zID0gdG9HbG9iYWwoZWxlbWVudClcclxuICAgICAgICBjb25zdCB4MiA9IHBvcy54XHJcbiAgICAgICAgY29uc3QgeTIgPSBwb3MueVxyXG4gICAgICAgIGNvbnN0IHcyID0gZWxlbWVudC5vZmZzZXRXaWR0aFxyXG4gICAgICAgIGNvbnN0IGgyID0gZWxlbWVudC5vZmZzZXRIZWlnaHRcclxuICAgICAgICByZXR1cm4geDEgPCB4MiArIHcyICYmIHgxICsgdzEgPiB4MiAmJiB5MSA8IHkyICsgaDIgJiYgeTEgKyBoMSA+IHkyXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmaW5kIGNsb3Nlc3QgU29ydGFibGUgdG8gc2NyZWVuIGxvY2F0aW9uXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlW119IGxpc3Qgb2YgcmVsYXRlZCBTb3J0YWJsZXNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9maW5kQ2xvc2VzdChlLCBkcmFnZ2luZywgbGlzdClcclxuICAgIHtcclxuICAgICAgICBsZXQgbWluID0gSW5maW5pdHksIGZvdW5kXHJcbiAgICAgICAgZm9yIChsZXQgcmVsYXRlZCBvZiBsaXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2luc2lkZShkcmFnZ2luZywgcmVsYXRlZC5lbGVtZW50KSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlbGF0ZWRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChyZWxhdGVkLm9wdGlvbnMuYWx3YXlzSW5MaXN0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjYWxjdWxhdGUgPSB0aGlzLl9kaXN0YW5jZVRvQ2xvc2VzdENvcm5lcihlLCByZWxhdGVkLmVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICBpZiAoY2FsY3VsYXRlIDwgbWluKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG1pbiA9IGNhbGN1bGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gcmVsYXRlZFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmb3VuZFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhhMVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlhMVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhhMlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhhMlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhiMVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHliMVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhiMlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHliMlxyXG4gICAgICogY2FsY3VsYXRlIHBlcmNlbnRhZ2Ugb2Ygb3ZlcmxhcCBiZXR3ZWVuIHR3byBib3hlc1xyXG4gICAgICogZnJvbSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjEyMjAwMDQvMTk1NTk5N1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BlcmNlbnRhZ2UoeGExLCB5YTEsIHhhMiwgeWEyLCB4YjEsIHliMSwgeGIyLCB5YjIpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3Qgc2EgPSAoeGEyIC0geGExKSAqICh5YTIgLSB5YTEpXHJcbiAgICAgICAgY29uc3Qgc2IgPSAoeGIyIC0geGIxKSAqICh5YjIgLSB5YjEpXHJcbiAgICAgICAgY29uc3Qgc2kgPSBNYXRoLm1heCgwLCBNYXRoLm1pbih4YTIsIHhiMikgLSBNYXRoLm1heCh4YTEsIHhiMSkpICogTWF0aC5tYXgoMCwgTWF0aC5taW4oeWEyLCB5YjIpIC0gTWF0aC5tYXgoeWExLCB5YjEpKVxyXG4gICAgICAgIGNvbnN0IHVuaW9uID0gc2EgKyBzYiAtIHNpXHJcbiAgICAgICAgcmV0dXJuIHNpIC8gdW5pb25cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBsYWNlIGluZGljYXRvciBpbiB0aGUgc29ydGFibGUgbGlzdCBhY2NvcmRpbmcgdG8gb3B0aW9ucy5zb3J0XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmcgZWxlbWVudFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BsYWNlSW5MaXN0KHNvcnRhYmxlLCBkcmFnZ2luZylcclxuICAgIHtcclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5zb3J0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fcGxhY2VJblNvcnRhYmxlTGlzdChzb3J0YWJsZSwgZHJhZ2dpbmcpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuX3BsYWNlSW5PcmRlcmVkTGlzdChzb3J0YWJsZSwgZHJhZ2dpbmcpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIF90cmF2ZXJzZUNoaWxkcmVuKGJhc2UsIHNlYXJjaCwgcmVzdWx0cylcclxuICAgIHtcclxuICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBiYXNlLmNoaWxkcmVuKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHNlYXJjaC5sZW5ndGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzZWFyY2guaW5kZXhPZihjaGlsZC5jbGFzc05hbWUpICE9PSAtMSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goY2hpbGQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goY2hpbGQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fdHJhdmVyc2VDaGlsZHJlbihjaGlsZCwgc2VhcmNoLCByZXN1bHRzKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGZpbmQgY2hpbGRyZW4gaW4gZGl2XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3JkZXJdIHNlYXJjaCBmb3IgZHJhZ09yZGVyIGFzIHdlbGxcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9nZXRDaGlsZHJlbihzb3J0YWJsZSwgb3JkZXIpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMuZGVlcFNlYXJjaClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBzZWFyY2ggPSBbXVxyXG4gICAgICAgICAgICBpZiAob3JkZXIgJiYgc29ydGFibGUub3B0aW9ucy5vcmRlckNsYXNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoLnB1c2goc29ydGFibGUub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAob3JkZXIgJiYgc29ydGFibGUub3B0aW9ucy5vcmRlckNsYXNzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaC5wdXNoKHNvcnRhYmxlLm9wdGlvbnMub3JkZXJDbGFzcylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICghb3JkZXIgJiYgc29ydGFibGUub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNlYXJjaC5wdXNoKHNvcnRhYmxlLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXVxyXG4gICAgICAgICAgICB0aGlzLl90cmF2ZXJzZUNoaWxkcmVuKHNvcnRhYmxlLmVsZW1lbnQsIHNlYXJjaCwgcmVzdWx0cylcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHNcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbGlzdCA9IFtdXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBzb3J0YWJsZS5lbGVtZW50LmNoaWxkcmVuKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9jb250YWluc0NsYXNzTmFtZShjaGlsZCwgc29ydGFibGUub3B0aW9ucy5kcmFnQ2xhc3MpIHx8ICgob3JkZXIgfHwgIXNvcnRhYmxlLm9wdGlvbnMub3JkZXJDbGFzcykgfHwgKG9yZGVyICYmIHNvcnRhYmxlLm9wdGlvbnMub3JkZXJDbGFzcyAmJiB0aGlzLl9jb250YWluc0NsYXNzTmFtZShjaGlsZCwgc29ydGFibGUub3B0aW9ucy5vcmRlckNsYXNzKSkpKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGlzdC5wdXNoKGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBsaXN0XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc29ydGFibGUuZWxlbWVudC5jaGlsZHJlblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGxhY2UgaW5kaWNhdG9yIGluIGFuIG9yZGVyZWQgbGlzdFxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGxhY2VJbk9yZGVyZWRMaXN0KHNvcnRhYmxlLCBkcmFnZ2luZylcclxuICAgIHtcclxuICAgICAgICBjb25zdCBpZCA9IHNvcnRhYmxlLm9wdGlvbnMub3JkZXJJZFxyXG4gICAgICAgIGRyYWdnaW5nLmluZGljYXRvci5yZW1vdmUoKVxyXG4gICAgICAgIHNvcnRhYmxlLmluZGljYXRvciA9IGRyYWdnaW5nLmluZGljYXRvclxyXG4gICAgICAgIGxldCBkcmFnT3JkZXIgPSBzb3J0YWJsZS5pbmRpY2F0b3IuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgIGRyYWdPcmRlciA9IHNvcnRhYmxlLm9wdGlvbnMub3JkZXJJZElzTnVtYmVyID8gcGFyc2VGbG9hdChkcmFnT3JkZXIpIDogZHJhZ09yZGVyXHJcbiAgICAgICAgbGV0IGZvdW5kXHJcbiAgICAgICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLl9nZXRDaGlsZHJlbihzb3J0YWJsZSwgdHJ1ZSlcclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5yZXZlcnNlT3JkZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gY2hpbGRyZW5baV1cclxuICAgICAgICAgICAgICAgIGxldCBjaGlsZERyYWdPcmRlciA9IGNoaWxkLmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICAgICAgICAgIGNoaWxkRHJhZ09yZGVyID0gc29ydGFibGUub3B0aW9ucy5vcmRlcklzTnVtYmVyID8gcGFyc2VGbG9hdChjaGlsZERyYWdPcmRlcikgOiBjaGlsZERyYWdPcmRlclxyXG4gICAgICAgICAgICAgICAgaWYgKGRyYWdPcmRlciA+IGNoaWxkRHJhZ09yZGVyKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHNvcnRhYmxlLmluZGljYXRvciwgY2hpbGQpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0SWNvbihkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBjaGlsZHJlbilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNoaWxkRHJhZ09yZGVyID0gY2hpbGQuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICAgICAgY2hpbGREcmFnT3JkZXIgPSBzb3J0YWJsZS5vcHRpb25zLm9yZGVySXNOdW1iZXIgPyBwYXJzZUZsb2F0KGNoaWxkRHJhZ09yZGVyKSA6IGNoaWxkRHJhZ09yZGVyXHJcbiAgICAgICAgICAgICAgICBpZiAoZHJhZ09yZGVyIDwgY2hpbGREcmFnT3JkZXIpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoc29ydGFibGUuaW5kaWNhdG9yLCBjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRJY29uKGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghZm91bmQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbGVtZW50LmFwcGVuZENoaWxkKHNvcnRhYmxlLmluZGljYXRvcilcclxuICAgICAgICAgICAgdGhpcy5fc2V0SWNvbihkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZmluZCBsYXN0IGNoaWxkIHRoYXQgaXMgb2YgdHlwZSBkcmFnQ2xhc3MgKGlmIHNldClcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZ2V0TGFzdENoaWxkKHNvcnRhYmxlKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLmRlZXBTZWFyY2gpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBzZWFyY2ggPSBbXVxyXG4gICAgICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNlYXJjaC5wdXNoKHNvcnRhYmxlLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXVxyXG4gICAgICAgICAgICB0aGlzLl90cmF2ZXJzZUNoaWxkcmVuKHNvcnRhYmxlLmVsZW1lbnQsIHNlYXJjaCwgcmVzdWx0cylcclxuICAgICAgICAgICAgaWYgKHJlc3VsdHMubGVuZ3RoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0c1tyZXN1bHRzLmxlbmd0aCAtIDFdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IHNvcnRhYmxlLmVsZW1lbnQuY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBzb3J0YWJsZS5lbGVtZW50LmNoaWxkcmVuW2ldXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2NvbnRhaW5zQ2xhc3NOYW1lKGNoaWxkLCBzb3J0YWJsZS5vcHRpb25zLmRyYWdDbGFzcykpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2hpbGRcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHNvcnRhYmxlLmVsZW1lbnQuY2hpbGRyZW4ubGVuZ3RoKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzb3J0YWJsZS5lbGVtZW50LmNoaWxkcmVuW3NvcnRhYmxlLmVsZW1lbnQuY2hpbGRyZW4ubGVuZ3RoIC0gMV1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2V0IGljb24gaWYgYXZhaWxhYmxlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9zZXRJY29uKGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgIHtcclxuICAgICAgICBpZiAoZHJhZ2dpbmcuaWNvbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGRyYWdnaW5nLmljb24uc3JjID0gZHJhZ2dpbmcub3JpZ2luYWwgPT09IHNvcnRhYmxlID8gc29ydGFibGUub3B0aW9ucy5pY29ucy5yZW9yZGVyIDogc29ydGFibGUub3B0aW9ucy5pY29ucy5tb3ZlXHJcbiAgICAgICAgICAgIGRyYWdnaW5nLmN1cnJlbnQgPSBzb3J0YWJsZVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZHJhZ2dpbmcub3JpZ2luYWwgPT09IHNvcnRhYmxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnb3JkZXItcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgc29ydGFibGUuZW1pdCgndXBkYXRlLXBlbmRpbmcnLCBzb3J0YWJsZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnYWRkLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIGRyYWdnaW5nLm9yaWdpbmFsLmVtaXQoJ3JlbW92ZS1wZW5kaW5nJywgZHJhZ2dpbmcsIGRyYWdnaW5nLm9yaWdpbmFsKVxyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCd1cGRhdGUtcGVuZGluZycpXHJcbiAgICAgICAgICAgIGRyYWdnaW5nLm9yaWdpbmFsLmVtaXQoJ3VwZGF0ZS1wZW5kaW5nJylcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwbGFjZSBpbmRpY2F0b3IgaW4gYW4gc29ydGFibGUgbGlzdFxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGxhY2VJblNvcnRhYmxlTGlzdChzb3J0YWJsZSwgZHJhZ2dpbmcpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHNvcnRhYmxlLmVsZW1lbnRcclxuICAgICAgICBzb3J0YWJsZS5lbGVtZW50LmFwcGVuZENoaWxkKGRyYWdnaW5nLmluZGljYXRvcilcclxuICAgICAgICBzb3J0YWJsZS5pbmRpY2F0b3IgPSBkcmFnZ2luZy5pbmRpY2F0b3JcclxuICAgICAgICBjb25zdCBsYXN0Q2hpbGQgPSB0aGlzLl9nZXRMYXN0Q2hpbGQoc29ydGFibGUpXHJcbiAgICAgICAgaWYgKCFsYXN0Q2hpbGQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKHNvcnRhYmxlLmluZGljYXRvcilcclxuICAgICAgICAgICAgdGhpcy5fc2V0SWNvbihkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZy5vZmZzZXRUb3AgPj0gZWxlbWVudC5vZmZzZXRUb3AgKyBlbGVtZW50Lm9mZnNldEhlaWdodClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChzb3J0YWJsZS5pbmRpY2F0b3IpXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRJY29uKGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChkcmFnZ2luZy5vZmZzZXRUb3AgKyBkcmFnZ2luZy5vZmZzZXRIZWlnaHQgPCBlbGVtZW50Lm9mZnNldFRvcClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5pbnNlcnRCZWZvcmUoc29ydGFibGUuaW5kaWNhdG9yLCBlbGVtZW50LmZpcnN0Q2hpbGQpXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRJY29uKGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHhhMSA9IGRyYWdnaW5nLm9mZnNldExlZnRcclxuICAgICAgICAgICAgICAgIGNvbnN0IHlhMSA9IGRyYWdnaW5nLm9mZnNldFRvcFxyXG4gICAgICAgICAgICAgICAgY29uc3QgeGEyID0gZHJhZ2dpbmcub2Zmc2V0TGVmdCArIGRyYWdnaW5nLm9mZnNldFdpZHRoXHJcbiAgICAgICAgICAgICAgICBjb25zdCB5YTIgPSBkcmFnZ2luZy5vZmZzZXRUb3AgKyBkcmFnZ2luZy5vZmZzZXRIZWlnaHRcclxuICAgICAgICAgICAgICAgIGxldCBsYXJnZXN0ID0gMCwgY2xvc2VzdCwgaXNCZWZvcmUgPSB0cnVlLCBpbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNlYXJjaCA9IFtdXHJcbiAgICAgICAgICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoLnB1c2goc29ydGFibGUub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5vcmRlckNsYXNzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaC5wdXNoKHNvcnRhYmxlLm9wdGlvbnMub3JkZXJDbGFzcylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IGVsZW1lbnRzID0gdGhpcy5fZ2V0Q2hpbGRyZW4oc29ydGFibGUsIHRydWUpXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBlbGVtZW50cylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGQgPT09IHNvcnRhYmxlLmluZGljYXRvcilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGljYXRvciA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcG9zID0gdG9HbG9iYWwoY2hpbGQpXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeGIxID0gcG9zLnhcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB5YjEgPSBwb3MueVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHhiMiA9IHBvcy54ICsgY2hpbGQub2Zmc2V0V2lkdGhcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB5YjIgPSBwb3MueSArIGNoaWxkLm9mZnNldEhlaWdodFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBlcmNlbnRhZ2UgPSB0aGlzLl9wZXJjZW50YWdlKHhhMSwgeWExLCB4YTIsIHlhMiwgeGIxLCB5YjEsIHhiMiwgeWIyKVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwZXJjZW50YWdlID4gbGFyZ2VzdClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhcmdlc3QgPSBwZXJjZW50YWdlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb3Nlc3QgPSBjaGlsZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpc0JlZm9yZSA9IGluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChjbG9zZXN0ICYmIGNsb3Nlc3QgIT09IHNvcnRhYmxlLmluZGljYXRvcilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNCZWZvcmUpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lmluc2VydEJlZm9yZShzb3J0YWJsZS5pbmRpY2F0b3IsIGNsb3Nlc3QubmV4dFNpYmxpbmcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldEljb24oZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdkcmFnZ2luZy1vcmRlci1jaGFuZ2UnLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5pbnNlcnRCZWZvcmUoc29ydGFibGUuaW5kaWNhdG9yLCBjbG9zZXN0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRJY29uKGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnZHJhZ2dpbmctb3JkZXItY2hhbmdlJywgc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZHJhZ2dpbmcuaW5kaWNhdG9yKVxyXG4gICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlLmluZGljYXRvciA9IGRyYWdnaW5nLmluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldEljb24oZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIG1vdmVcclxuICAgICAqIEBwYXJhbSB7VUlFdmVudH0gZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2RyYWdNb3ZlKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZHJhZ2dpbmcucGlja3VwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fZGlzdGFuY2UodGhpcy5kcmFnZ2luZy5zdGFydC54LCB0aGlzLmRyYWdnaW5nLnN0YXJ0LnksIGUucGFnZVgsIGUucGFnZVkpID4gdGhpcy5vcHRpb25zLnRocmVzaG9sZClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9waWNrdXAoZSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLmxlZnQgPSBlLnBhZ2VYICsgdGhpcy5vZmZzZXQueCArICdweCdcclxuICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5zdHlsZS50b3AgPSBlLnBhZ2VZICsgdGhpcy5vZmZzZXQueSArICdweCdcclxuICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmcuaWNvbilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5pY29uLnN0eWxlLmxlZnQgPSBlLnBhZ2VYICsgdGhpcy5vZmZzZXQueCArIHRoaXMuZHJhZ2dpbmcub2Zmc2V0V2lkdGggKyAncHgnXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLmljb24uc3R5bGUudG9wID0gZS5wYWdlWSArIHRoaXMub2Zmc2V0LnkgKyB0aGlzLmRyYWdnaW5nLm9mZnNldEhlaWdodCArICdweCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gW11cclxuICAgICAgICAgICAgZm9yIChsZXQgc29ydGFibGUgb2YgU29ydGFibGUubGlzdClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMubmFtZSA9PT0gdGhpcy5vcHRpb25zLm5hbWUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGlzdC5wdXNoKHNvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hbHdheXNJbkxpc3QgfHwgdGhpcy5faW5zaWRlKHRoaXMuZHJhZ2dpbmcsIHRoaXMuZWxlbWVudCkpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGxhY2VJbkxpc3QodGhpcywgdGhpcy5kcmFnZ2luZylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLmluZGljYXRvci5yZW1vdmUoKVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmRyYWdnaW5nLmljb24pXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLmljb24uc3JjID0gdGhpcy5vcHRpb25zLmljb25zLmRlbGV0ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNsb3Nlc3QgPSB0aGlzLl9maW5kQ2xvc2VzdChlLCB0aGlzLmRyYWdnaW5nLCBsaXN0KVxyXG4gICAgICAgICAgICAgICAgaWYgKGNsb3Nlc3QpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGxhY2VJbkxpc3QoY2xvc2VzdCwgdGhpcy5kcmFnZ2luZylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLmluZGljYXRvci5yZW1vdmUoKVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmRyYWdnaW5nLmljb24pXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLmljb24uc3JjID0gdGhpcy5vcHRpb25zLmljb25zLmRlbGV0ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSB1cFxyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZHJhZ1VwKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kcmFnZ2luZy5waWNrdXApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuc3R5bGUucG9zaXRpb24gPSAnJ1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5zdHlsZS56SW5kZXggPSAnJ1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5zdHlsZS5ib3hTaGFkb3cgPSAnJ1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5zdHlsZS5vcGFjaXR5ID0gJydcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmluZGljYXRvci5wYXJlbnROb2RlKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5kaWNhdG9yLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHRoaXMuZHJhZ2dpbmcsIHRoaXMuaW5kaWNhdG9yKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcub3JpZ2luYWwgPSB0aGlzLmRyYWdnaW5nLmN1cnJlbnRcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGljYXRvci5yZW1vdmUoKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5kaWNhdG9yID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmRyYWdnaW5nLm9yaWdpbmFsID09PSB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdvcmRlcicsIHRoaXMuZHJhZ2dpbmcsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgndXBkYXRlJywgdGhpcy5kcmFnZ2luZywgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5vcmlnaW5hbC5lbWl0KCdyZW1vdmUnLCB0aGlzLmRyYWdnaW5nLCB0aGlzLmRyYWdnaW5nLm9yaWdpbmFsKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLm9yaWdpbmFsLmVtaXQoJ3VwZGF0ZScsIHRoaXMuZHJhZ2dpbmcsIHRoaXMuZHJhZ2dpbmcub3JpZ2luYWwpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgnYWRkJywgdGhpcy5kcmFnZ2luZywgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCd1cGRhdGUnLCB0aGlzLmRyYWdnaW5nLCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLnJlbW92ZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5vcmlnaW5hbCA9IG51bGxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGljYXRvci5yZW1vdmUoKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5kaWNhdG9yID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgncmVtb3ZlJywgdGhpcy5kcmFnZ2luZywgdGhpcylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRyYWdnaW5nLmljb24pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5pY29uLnJlbW92ZSgpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2NsaWNrZWQnLCB0aGlzLmRyYWdnaW5nLCB0aGlzKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcgPSBudWxsXHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHRoZSBnbG9iYWwgZGVmYXVsdHMgZm9yIG5ldyBTb3J0YWJsZSBvYmplY3RzXHJcbiAgICAgKiBAdHlwZSB7RGVmYXVsdE9wdGlvbnN9XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBnZXQgZGVmYXVsdHMoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBkZWZhdWx0c1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY3JlYXRlIG11bHRpcGxlIHNvcnRhYmxlIGVsZW1lbnRzXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50c1tdfSBlbGVtZW50c1xyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgLSBzZWUgY29uc3RydWN0b3IgZm9yIG9wdGlvbnNcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGNyZWF0ZShlbGVtZW50cywgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBjb25zdCByZXN1bHRzID0gW11cclxuICAgICAgICBmb3IgKGxldCBlbGVtZW50IG9mIGVsZW1lbnRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKG5ldyBTb3J0YWJsZShlbGVtZW50LCBvcHRpb25zKSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdHNcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTb3J0YWJsZVxyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyBjbGlja2VkIGJ1dCBub3QgbW92ZWQgYmV5b25kIHRoZSBvcHRpb25zLnRocmVzaG9sZFxyXG4gKiBAZXZlbnQgU29ydGFibGUjY2xpY2tlZFxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGNsaWNrZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgY29udGFpbmluZyBlbGVtZW50XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyBwaWNrZWQgdXAgYmVjYXVzZSBpdCB3YXMgbW92ZWQgYmV5b25kIHRoZSBvcHRpb25zLnRocmVzaG9sZFxyXG4gKiBAZXZlbnQgU29ydGFibGUjcGlja3VwXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgYmVpbmcgZHJhZ2dlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBjdXJyZW50IHNvcnRhYmxlIHdpdGggZWxlbWVudCBwbGFjZWhvbGRlclxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGEgc29ydGFibGUgaXMgcmVvcmRlcmVkXHJcbiAqIEBldmVudCBTb3J0YWJsZSNvcmRlclxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IHRoYXQgd2FzIHJlb3JkZXJlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyBwbGFjZWRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIGFkZGVkIHRvIHRoaXMgc29ydGFibGVcclxuICogQGV2ZW50IFNvcnRhYmxlI2FkZFxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGFkZGVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIGFkZGVkXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyByZW1vdmVkIGZyb20gdGhpcyBzb3J0YWJsZVxyXG4gKiBAZXZlbnQgU29ydGFibGUjcmVtb3ZlXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgcmVtb3ZlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSB3aGVyZSBlbGVtZW50IHdhcyByZW1vdmVkXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gdGhlIHNvcnRhYmxlIGlzIHVwZGF0ZWQgd2l0aCBhbiBhZGQsIHJlbW92ZSwgb3Igb3JkZXIgY2hhbmdlXHJcbiAqIEBldmVudCBTb3J0YWJsZSN1cGRhdGVcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBjaGFuZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdpdGggZWxlbWVudFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIG9yZGVyIHdhcyBjaGFuZ2VkIGJ1dCBlbGVtZW50IHdhcyBub3QgZHJvcHBlZCB5ZXRcclxuICogQGV2ZW50IFNvcnRhYmxlI29yZGVyLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gZWxlbWVudCBpcyBhZGRlZCBidXQgbm90IGRyb3BwZWQgeWV0XHJcbiAqIEBldmVudCBTb3J0YWJsZSNhZGQtcGVuZGluZ1xyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBlbGVtZW50IGlzIHJlbW92ZWQgYnV0IG5vdCBkcm9wcGVkIHlldFxyXG4gKiBAZXZlbnQgU29ydGFibGUjcmVtb3ZlLXBlbmRpbmdcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYW4gZWxlbWVudCBpcyBhZGRlZCwgcmVtb3ZlZCwgb3IgcmVvcmRlciBidXQgZWxlbWVudCBoYXMgbm90IGRyb3BwZWQgeWV0XHJcbiAqIEBldmVudCBTb3J0YWJsZSN1cGRhdGUtcGVuZGluZ1xyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovIl19