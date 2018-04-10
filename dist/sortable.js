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
            if (!this.options.dragClass || child.className === this.options.dragClass) {
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
                    if (child.className === sortable.options.dragClass || order || !sortable.options.orderClass || order && sortable.options.orderClass && child.className === sortable.options.orderClass) {
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
                    if (child.className === sortable.options.dragClass) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3J0YWJsZS5qcyJdLCJuYW1lcyI6WyJFdmVudHMiLCJyZXF1aXJlIiwidG9HbG9iYWwiLCJkZWZhdWx0cyIsIlNvcnRhYmxlIiwiY29uc3RydWN0b3IiLCJlbGVtZW50Iiwib3B0aW9ucyIsIm9wdGlvbiIsInNvcnRhYmxlIiwiZWxlbWVudHMiLCJfZ2V0Q2hpbGRyZW4iLCJjaGlsZCIsImRyYWdDbGFzcyIsImNsYXNzTmFtZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJlIiwiX2RyYWdTdGFydCIsImNoaWxkcmVuU3R5bGVzIiwic3R5bGUiLCJvcmlnaW5hbCIsImRvY3VtZW50IiwiYm9keSIsIl9kcmFnTW92ZSIsIl9kcmFnVXAiLCJsaXN0IiwicHVzaCIsImRyYWdnaW5nIiwiY3VycmVudFRhcmdldCIsInBpY2t1cCIsInN0YXJ0IiwieCIsInBhZ2VYIiwieSIsInBhZ2VZIiwiY3Vyc29yIiwicHJldmVudERlZmF1bHQiLCJfcGlja3VwIiwiaW5kaWNhdG9yIiwiY2xvbmVOb2RlIiwicG9zIiwicG9zaXRpb24iLCJvZmZzZXQiLCJsZWZ0IiwidG9wIiwiZHJhZ1N0eWxlIiwicGFyZW50Tm9kZSIsImluc2VydEJlZm9yZSIsImFwcGVuZENoaWxkIiwidXNlSWNvbnMiLCJpbWFnZSIsIkltYWdlIiwic3JjIiwiaWNvbnMiLCJyZW9yZGVyIiwidHJhbnNmb3JtIiwib2Zmc2V0V2lkdGgiLCJvZmZzZXRIZWlnaHQiLCJpY29uIiwiZW1pdCIsIl9kaXN0YW5jZSIsIngxIiwieTEiLCJ4MiIsInkyIiwiTWF0aCIsInNxcnQiLCJwb3ciLCJfZGlzdGFuY2VUb0Nsb3Nlc3RDb3JuZXIiLCJ0b3BMZWZ0Iiwib2Zmc2V0TGVmdCIsIm9mZnNldFRvcCIsInRvcFJpZ2h0IiwiYm90dG9tTGVmdCIsImJvdHRvbVJpZ2h0IiwibWluIiwiX2luc2lkZSIsIncxIiwiaDEiLCJ3MiIsImgyIiwiX2ZpbmRDbG9zZXN0IiwiSW5maW5pdHkiLCJmb3VuZCIsInJlbGF0ZWQiLCJhbHdheXNJbkxpc3QiLCJjYWxjdWxhdGUiLCJfcGVyY2VudGFnZSIsInhhMSIsInlhMSIsInhhMiIsInlhMiIsInhiMSIsInliMSIsInhiMiIsInliMiIsInNhIiwic2IiLCJzaSIsIm1heCIsInVuaW9uIiwiX3BsYWNlSW5MaXN0Iiwic29ydCIsIl9wbGFjZUluU29ydGFibGVMaXN0IiwiX3BsYWNlSW5PcmRlcmVkTGlzdCIsIl90cmF2ZXJzZUNoaWxkcmVuIiwiYmFzZSIsInNlYXJjaCIsInJlc3VsdHMiLCJjaGlsZHJlbiIsImxlbmd0aCIsImluZGV4T2YiLCJvcmRlciIsImRlZXBTZWFyY2giLCJvcmRlckNsYXNzIiwiaWQiLCJvcmRlcklkIiwicmVtb3ZlIiwiZHJhZ09yZGVyIiwiZ2V0QXR0cmlidXRlIiwib3JkZXJJZElzTnVtYmVyIiwicGFyc2VGbG9hdCIsInJldmVyc2VPcmRlciIsImkiLCJjaGlsZERyYWdPcmRlciIsIm9yZGVySXNOdW1iZXIiLCJfc2V0SWNvbiIsIl9nZXRMYXN0Q2hpbGQiLCJtb3ZlIiwiY3VycmVudCIsImxhc3RDaGlsZCIsImZpcnN0Q2hpbGQiLCJsYXJnZXN0IiwiY2xvc2VzdCIsImlzQmVmb3JlIiwicGVyY2VudGFnZSIsIm5leHRTaWJsaW5nIiwidGhyZXNob2xkIiwibmFtZSIsImRlbGV0ZSIsInN0b3BQcm9wYWdhdGlvbiIsInpJbmRleCIsImJveFNoYWRvdyIsIm9wYWNpdHkiLCJjcmVhdGUiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQSxNQUFNQSxTQUFTQyxRQUFRLGVBQVIsQ0FBZjs7QUFFQSxNQUFNQyxXQUFXRCxRQUFRLFlBQVIsQ0FBakI7QUFDQSxNQUFNRSxXQUFXRixRQUFRLFdBQVIsQ0FBakI7O0FBRUEsTUFBTUcsUUFBTixTQUF1QkosTUFBdkIsQ0FDQTtBQUNJOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTZCQUssZ0JBQVlDLE9BQVosRUFBcUJDLE9BQXJCLEVBQ0E7QUFDSTtBQUNBLGFBQUtBLE9B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QUFkLEdBQXlCLElBQXpCO0FBQ0EseUJBQUtrQixTQUFMLENBQWUrRSxNQUFmO0FBQ0EseUJBQUsvRSxTQUFMLEdBQWlCLElBQWpCO0FBQ0EseUJBQUtxQixJQUFMLENBQVUsUUFBVixFQUFvQixLQUFLaEMsUUFBekIsRUFBbUMsSUFBbkM7QUFDSDtBQUNELG9CQUFJLEtBQUtBLFFBQUwsQ0FBYytCLElBQWxCLEVBQ0E7QUFDSSx5QkFBSy9CLFFBQUwsQ0FBYytCLElBQWQsQ0FBbUIyRCxNQUFuQjtBQUNIO0FBQ0osYUFyQ0QsTUF1Q0E7QUFDSSxxQkFBSzFELElBQUwsQ0FBVSxTQUFWLEVBQXFCLEtBQUtoQyxRQUExQixFQUFvQyxJQUFwQztBQUNIO0FBQ0QsaUJBQUtBLFFBQUwsR0FBZ0IsSUFBaEI7QUFDQVgsY0FBRW9CLGNBQUY7QUFDSDtBQUNKOztBQUVEOzs7O0FBSUEsZUFBV2pDLFFBQVgsR0FDQTtBQUNJLGVBQU9BLFFBQVA7QUFDSDs7QUFFRDs7Ozs7QUFLQSxXQUFPNkksTUFBUCxDQUFjdEksUUFBZCxFQUF3QkgsT0FBeEIsRUFDQTtBQUNJLGNBQU1xRyxVQUFVLEVBQWhCO0FBQ0EsYUFBSyxJQUFJdEcsT0FBVCxJQUFvQkksUUFBcEIsRUFDQTtBQUNJa0csb0JBQVFsRixJQUFSLENBQWEsSUFBSXRCLFFBQUosQ0FBYUUsT0FBYixFQUFzQkMsT0FBdEIsQ0FBYjtBQUNIO0FBQ0QsZUFBT3FHLE9BQVA7QUFDSDtBQXJxQkw7O0FBd3FCQXFDLE9BQU9DLE9BQVAsR0FBaUI5SSxRQUFqQjs7QUFFQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQTs7Ozs7OztBQU9BOzs7Ozs7O0FBT0E7Ozs7Ozs7QUFPQSIsImZpbGUiOiJzb3J0YWJsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IEV2ZW50cyA9IHJlcXVpcmUoJ2V2ZW50ZW1pdHRlcjMnKVxyXG5cclxuY29uc3QgdG9HbG9iYWwgPSByZXF1aXJlKCcuL3RvR2xvYmFsJylcclxuY29uc3QgZGVmYXVsdHMgPSByZXF1aXJlKCcuL29wdGlvbnMnKVxyXG5cclxuY2xhc3MgU29ydGFibGUgZXh0ZW5kcyBFdmVudHNcclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgc29ydGFibGUgbGlzdFxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLm5hbWU9c29ydGFibGVdIGRyYWdnaW5nIGlzIGFsbG93ZWQgYmV0d2VlbiBTb3J0YWJsZXMgd2l0aCB0aGUgc2FtZSBuYW1lXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnNvcnQ9dHJ1ZV0gYWxsb3cgc29ydGluZyB3aXRoaW4gbGlzdFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmRyYWdDbGFzc10gaWYgc2V0IHRoZW4gZHJhZyBvbmx5IGl0ZW1zIHdpdGggdGhpcyBjbGFzc05hbWUgdW5kZXIgZWxlbWVudCwgb3RoZXJ3aXNlIHVzZSBhbGwgY2hpbGRyZW5cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuZGVlcFNlYXJjaF0gaWYgZHJhZ0NsYXNzIGFuZCBkZWVwU2VhcmNoIHRoZW4gc2VhcmNoIGFsbCBkZXNjZW5kZW50cyBvZiBlbGVtZW50IGZvciBkcmFnQ2xhc3NcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5vcmRlcklkPWRhdGEtb3JkZXJdIGZvciBub24tc29ydGluZyBsaXN0cywgdXNlIHRoaXMgZGF0YSBpZCB0byBmaWd1cmUgb3V0IHNvcnQgb3JkZXJcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMub3JkZXJJZElzTnVtYmVyPXRydWVdIHVzZSBwYXJzZUludCBvbiBvcHRpb25zLm9yZGVySWQgdG8gcHJvcGVybHkgc29ydCBudW1iZXJzXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMucmV2ZXJzZU9yZGVyXSByZXZlcnNlIHNvcnQgdGhlIG9yZGVySWRcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuYWx3YXlzSW5MaXN0PXRydWVdIHBsYWNlIGVsZW1lbnQgaW5zaWRlIGNsb3Nlc3QgcmVsYXRlZCBTb3J0YWJsZSBvYmplY3Q7IGlmIHNldCB0byBmYWxzZSB0aGVuIHRoZSBvYmplY3QgaXMgcmVtb3ZlZCBpZiBkcm9wcGVkIG91dHNpZGUgcmVsYXRlZCBzb3J0YWJsZXNcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9ucy5jaGlsZHJlblN0eWxlc10gc3R5bGVzIHRvIGFwcGx5IHRvIGNoaWxkcmVuIGVsZW1lbnRzIG9mIFNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnMuaWNvbnNdIGRlZmF1bHQgc2V0IG9mIGljb25zXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuaWNvbnMucmVvcmRlcl0gc291cmNlIG9mIGltYWdlXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuaWNvbnMubW92ZV0gc291cmNlIG9mIGltYWdlXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuaWNvbnMuY29weV0gc291cmNlIG9mIGltYWdlXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuaWNvbnMuZGVsZXRlXSBzb3VyY2Ugb2YgaW1hZ2VcclxuICAgICAqIEBmaXJlcyBjbGlja2VkXHJcbiAgICAgKiBAZmlyZXMgcGlja3VwXHJcbiAgICAgKiBAZmlyZXMgb3JkZXJcclxuICAgICAqIEBmaXJlcyBhZGRcclxuICAgICAqIEBmaXJlcyByZW1vdmVcclxuICAgICAqIEBmaXJlcyB1cGRhdGVcclxuICAgICAqIEBmaXJlcyBvcmRlci1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgYWRkLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyByZW1vdmUtcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIHVwZGF0ZS1wZW5kaW5nXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgc3VwZXIoKVxyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICBmb3IgKGxldCBvcHRpb24gaW4gZGVmYXVsdHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnNbb3B0aW9uXSA9IHR5cGVvZiB0aGlzLm9wdGlvbnNbb3B0aW9uXSAhPT0gJ3VuZGVmaW5lZCcgPyBvcHRpb25zW29wdGlvbl0gOiBkZWZhdWx0c1tvcHRpb25dXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnRcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc29ydGFibGUgPSB0aGlzXHJcbiAgICAgICAgY29uc3QgZWxlbWVudHMgPSB0aGlzLl9nZXRDaGlsZHJlbih0aGlzKVxyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGVsZW1lbnRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzIHx8IGNoaWxkLmNsYXNzTmFtZSA9PT0gdGhpcy5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKGUpID0+IHRoaXMuX2RyYWdTdGFydChlKSlcclxuICAgICAgICAgICAgICAgIGNoaWxkLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCAoZSkgPT4gdGhpcy5fZHJhZ1N0YXJ0KGUpKVxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgb3B0aW9uIGluIHRoaXMub3B0aW9ucy5jaGlsZHJlblN0eWxlcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZC5zdHlsZVtvcHRpb25dID0gdGhpcy5vcHRpb25zLmNoaWxkcmVuU3R5bGVzW29wdGlvbl1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNoaWxkLm9yaWdpbmFsID0gdGhpc1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgKGUpID0+IHRoaXMuX2RyYWdNb3ZlKGUpKVxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgKGUpID0+IHRoaXMuX2RyYWdNb3ZlKGUpKVxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2h1cCcsIChlKSA9PiB0aGlzLl9kcmFnVXAoZSkpXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsIChlKSA9PiB0aGlzLl9kcmFnVXAoZSkpXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgKGUpID0+IHRoaXMuX2RyYWdVcChlKSlcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlY2FuY2VsJywgKGUpID0+IHRoaXMuX2RyYWdVcChlKSlcclxuXHJcbiAgICAgICAgaWYgKCFTb3J0YWJsZS5saXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgU29ydGFibGUubGlzdCA9IFtdXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFNvcnRhYmxlLmxpc3QucHVzaCh0aGlzKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc3RhcnQgZHJhZ1xyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZHJhZ1N0YXJ0KGUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZyA9IGUuY3VycmVudFRhcmdldFxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcucGlja3VwID0gZmFsc2VcclxuICAgICAgICB0aGlzLmRyYWdnaW5nLnN0YXJ0ID0geyB4OiBlLnBhZ2VYLCB5OiBlLnBhZ2VZIH1cclxuICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLmN1cnNvciA9ICduby1jdXJzb3InXHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwaWNrdXAgYW5kIGNsb25lIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7VUlFdmVudH0gZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BpY2t1cChlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuaW5kaWNhdG9yID0gdGhpcy5kcmFnZ2luZy5jbG9uZU5vZGUodHJ1ZSlcclxuICAgICAgICB0aGlzLmRyYWdnaW5nLmluZGljYXRvciA9IHRoaXMuaW5kaWNhdG9yXHJcbiAgICAgICAgY29uc3QgcG9zID0gdG9HbG9iYWwodGhpcy5kcmFnZ2luZylcclxuICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xyXG4gICAgICAgIHRoaXMub2Zmc2V0ID0geyB4OiBwb3MueCAtIGUucGFnZVgsIHk6IHBvcy55IC0gZS5wYWdlWSB9XHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZy5zdHlsZS5sZWZ0ID0gcG9zLnggKyAncHgnXHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZy5zdHlsZS50b3AgPSBwb3MueSArICdweCdcclxuICAgICAgICBmb3IgKGxldCBvcHRpb24gaW4gdGhpcy5vcHRpb25zLmRyYWdTdHlsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuc3R5bGVbb3B0aW9uXSA9IHRoaXMub3B0aW9ucy5kcmFnU3R5bGVbb3B0aW9uXVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmRyYWdnaW5nLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHRoaXMuaW5kaWNhdG9yLCB0aGlzLmRyYWdnaW5nKVxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5kcmFnZ2luZylcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnVzZUljb25zKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKVxyXG4gICAgICAgICAgICBpbWFnZS5zcmMgPSB0aGlzLm9wdGlvbnMuaWNvbnMucmVvcmRlclxyXG4gICAgICAgICAgICBpbWFnZS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcclxuICAgICAgICAgICAgaW1hZ2Uuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgtNTAlLCAtNTAlKSdcclxuICAgICAgICAgICAgaW1hZ2Uuc3R5bGUubGVmdCA9IHBvcy54ICsgdGhpcy5kcmFnZ2luZy5vZmZzZXRXaWR0aCArICdweCdcclxuICAgICAgICAgICAgaW1hZ2Uuc3R5bGUudG9wID0gcG9zLnkgKyB0aGlzLmRyYWdnaW5nLm9mZnNldEhlaWdodCArICdweCdcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpbWFnZSlcclxuICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5pY29uID0gaW1hZ2VcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZy5waWNrdXAgPSB0cnVlXHJcbiAgICAgICAgdGhpcy5lbWl0KCdwaWNrdXAnLCB0aGlzLmRyYWdnaW5nLCB0aGlzKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogbWVhc3VyZSBkaXN0YW5jZSBiZXR3ZWVuIHR3byBwb2ludHNcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4MVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHkxXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geDJcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5MlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2Rpc3RhbmNlKHgxLCB5MSwgeDIsIHkyKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3coeDEgLSB4MiwgMikgKyBNYXRoLnBvdyh5MSAtIHkyLCAyKSlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGZpbmQgY2xvc2VzdCBkaXN0YW5jZSBmcm9tIFVJRXZlbnQgdG8gYSBjb3JuZXIgb2YgYW4gZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtIVE1MVUxpc3RFbGVtZW50fSBlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZGlzdGFuY2VUb0Nsb3Nlc3RDb3JuZXIoZSwgZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBjb25zdCB0b3BMZWZ0ID0gdGhpcy5fZGlzdGFuY2UoZS5wYWdlWCwgZS5wYWdlWSwgZWxlbWVudC5vZmZzZXRMZWZ0LCBlbGVtZW50Lm9mZnNldFRvcClcclxuICAgICAgICBjb25zdCB0b3BSaWdodCA9IHRoaXMuX2Rpc3RhbmNlKGUucGFnZVgsIGUucGFnZVksIGVsZW1lbnQub2Zmc2V0TGVmdCArIGVsZW1lbnQub2Zmc2V0V2lkdGgsIGVsZW1lbnQub2Zmc2V0VG9wKVxyXG4gICAgICAgIGNvbnN0IGJvdHRvbUxlZnQgPSB0aGlzLl9kaXN0YW5jZShlLnBhZ2VYLCBlLnBhZ2VZLCBlbGVtZW50Lm9mZnNldExlZnQsIGVsZW1lbnQub2Zmc2V0VG9wICsgZWxlbWVudC5vZmZzZXRIZWlnaHQpXHJcbiAgICAgICAgY29uc3QgYm90dG9tUmlnaHQgPSB0aGlzLl9kaXN0YW5jZShlLnBhZ2VYLCBlLnBhZ2VZLCBlbGVtZW50Lm9mZnNldExlZnQgKyBlbGVtZW50Lm9mZnNldFdpZHRoLCBlbGVtZW50Lm9mZnNldFRvcCArIGVsZW1lbnQub2Zmc2V0SGVpZ2h0KVxyXG4gICAgICAgIHJldHVybiBNYXRoLm1pbih0b3BMZWZ0LCB0b3BSaWdodCwgYm90dG9tTGVmdCwgYm90dG9tUmlnaHQpXHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZGV0ZXJtaW5lIHdoZXRoZXIgdGhlc2UgaXMgb3ZlcmxhcCBiZXR3ZWVuIHR3byBlbGVtZW50c1xyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmdcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9pbnNpZGUoZHJhZ2dpbmcsIGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgeDEgPSBkcmFnZ2luZy5vZmZzZXRMZWZ0XHJcbiAgICAgICAgY29uc3QgeTEgPSBkcmFnZ2luZy5vZmZzZXRUb3BcclxuICAgICAgICBjb25zdCB3MSA9IGRyYWdnaW5nLm9mZnNldFdpZHRoXHJcbiAgICAgICAgY29uc3QgaDEgPSBkcmFnZ2luZy5vZmZzZXRIZWlnaHRcclxuICAgICAgICBjb25zdCBwb3MgPSB0b0dsb2JhbChlbGVtZW50KVxyXG4gICAgICAgIGNvbnN0IHgyID0gcG9zLnhcclxuICAgICAgICBjb25zdCB5MiA9IHBvcy55XHJcbiAgICAgICAgY29uc3QgdzIgPSBlbGVtZW50Lm9mZnNldFdpZHRoXHJcbiAgICAgICAgY29uc3QgaDIgPSBlbGVtZW50Lm9mZnNldEhlaWdodFxyXG4gICAgICAgIHJldHVybiB4MSA8IHgyICsgdzIgJiYgeDEgKyB3MSA+IHgyICYmIHkxIDwgeTIgKyBoMiAmJiB5MSArIGgxID4geTJcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGZpbmQgY2xvc2VzdCBTb3J0YWJsZSB0byBzY3JlZW4gbG9jYXRpb25cclxuICAgICAqIEBwYXJhbSB7VUlFdmVudH0gZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmdcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGVbXX0gbGlzdCBvZiByZWxhdGVkIFNvcnRhYmxlc1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2ZpbmRDbG9zZXN0KGUsIGRyYWdnaW5nLCBsaXN0KVxyXG4gICAge1xyXG4gICAgICAgIGxldCBtaW4gPSBJbmZpbml0eSwgZm91bmRcclxuICAgICAgICBmb3IgKGxldCByZWxhdGVkIG9mIGxpc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5faW5zaWRlKGRyYWdnaW5nLCByZWxhdGVkLmVsZW1lbnQpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVsYXRlZFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHJlbGF0ZWQub3B0aW9ucy5hbHdheXNJbkxpc3QpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNhbGN1bGF0ZSA9IHRoaXMuX2Rpc3RhbmNlVG9DbG9zZXN0Q29ybmVyKGUsIHJlbGF0ZWQuZWxlbWVudClcclxuICAgICAgICAgICAgICAgIGlmIChjYWxjdWxhdGUgPCBtaW4pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWluID0gY2FsY3VsYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgZm91bmQgPSByZWxhdGVkXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZvdW5kXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geGExXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geWExXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geGEyXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geGEyXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geGIxXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geWIxXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geGIyXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geWIyXHJcbiAgICAgKiBjYWxjdWxhdGUgcGVyY2VudGFnZSBvZiBvdmVybGFwIGJldHdlZW4gdHdvIGJveGVzXHJcbiAgICAgKiBmcm9tIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMTIyMDAwNC8xOTU1OTk3XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGVyY2VudGFnZSh4YTEsIHlhMSwgeGEyLCB5YTIsIHhiMSwgeWIxLCB4YjIsIHliMilcclxuICAgIHtcclxuICAgICAgICBjb25zdCBzYSA9ICh4YTIgLSB4YTEpICogKHlhMiAtIHlhMSlcclxuICAgICAgICBjb25zdCBzYiA9ICh4YjIgLSB4YjEpICogKHliMiAtIHliMSlcclxuICAgICAgICBjb25zdCBzaSA9IE1hdGgubWF4KDAsIE1hdGgubWluKHhhMiwgeGIyKSAtIE1hdGgubWF4KHhhMSwgeGIxKSkgKiBNYXRoLm1heCgwLCBNYXRoLm1pbih5YTIsIHliMikgLSBNYXRoLm1heCh5YTEsIHliMSkpXHJcbiAgICAgICAgY29uc3QgdW5pb24gPSBzYSArIHNiIC0gc2lcclxuICAgICAgICByZXR1cm4gc2kgLyB1bmlvblxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGxhY2UgaW5kaWNhdG9yIGluIHRoZSBzb3J0YWJsZSBsaXN0IGFjY29yZGluZyB0byBvcHRpb25zLnNvcnRcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZyBlbGVtZW50XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGxhY2VJbkxpc3Qoc29ydGFibGUsIGRyYWdnaW5nKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLnNvcnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLl9wbGFjZUluU29ydGFibGVMaXN0KHNvcnRhYmxlLCBkcmFnZ2luZylcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fcGxhY2VJbk9yZGVyZWRMaXN0KHNvcnRhYmxlLCBkcmFnZ2luZylcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgX3RyYXZlcnNlQ2hpbGRyZW4oYmFzZSwgc2VhcmNoLCByZXN1bHRzKVxyXG4gICAge1xyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGJhc2UuY2hpbGRyZW4pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoc2VhcmNoLmxlbmd0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHNlYXJjaC5pbmRleE9mKGNoaWxkLmNsYXNzTmFtZSkgIT09IC0xKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChjaGlsZClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChjaGlsZClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl90cmF2ZXJzZUNoaWxkcmVuKGNoaWxkLCBzZWFyY2gsIHJlc3VsdHMpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZmluZCBjaGlsZHJlbiBpbiBkaXZcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcmRlcl0gc2VhcmNoIGZvciBkcmFnT3JkZXIgYXMgd2VsbFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2dldENoaWxkcmVuKHNvcnRhYmxlLCBvcmRlcilcclxuICAgIHtcclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5kZWVwU2VhcmNoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IHNlYXJjaCA9IFtdXHJcbiAgICAgICAgICAgIGlmIChvcmRlciAmJiBzb3J0YWJsZS5vcHRpb25zLm9yZGVyQ2xhc3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2gucHVzaChzb3J0YWJsZS5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChvcmRlciAmJiBzb3J0YWJsZS5vcHRpb25zLm9yZGVyQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoLnB1c2goc29ydGFibGUub3B0aW9ucy5vcmRlckNsYXNzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKCFvcmRlciAmJiBzb3J0YWJsZS5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc2VhcmNoLnB1c2goc29ydGFibGUub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdXHJcbiAgICAgICAgICAgIHRoaXMuX3RyYXZlcnNlQ2hpbGRyZW4oc29ydGFibGUuZWxlbWVudCwgc2VhcmNoLCByZXN1bHRzKVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0c1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxldCBsaXN0ID0gW11cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIHNvcnRhYmxlLmVsZW1lbnQuY2hpbGRyZW4pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkLmNsYXNzTmFtZSA9PT0gc29ydGFibGUub3B0aW9ucy5kcmFnQ2xhc3MgfHwgKChvcmRlciB8fCAhc29ydGFibGUub3B0aW9ucy5vcmRlckNsYXNzKSB8fCAob3JkZXIgJiYgc29ydGFibGUub3B0aW9ucy5vcmRlckNsYXNzICYmIGNoaWxkLmNsYXNzTmFtZSA9PT0gc29ydGFibGUub3B0aW9ucy5vcmRlckNsYXNzKSkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaXN0LnB1c2goY2hpbGQpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGxpc3RcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzb3J0YWJsZS5lbGVtZW50LmNoaWxkcmVuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwbGFjZSBpbmRpY2F0b3IgaW4gYW4gb3JkZXJlZCBsaXN0XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmdcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9wbGFjZUluT3JkZXJlZExpc3Qoc29ydGFibGUsIGRyYWdnaW5nKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGlkID0gc29ydGFibGUub3B0aW9ucy5vcmRlcklkXHJcbiAgICAgICAgZHJhZ2dpbmcuaW5kaWNhdG9yLnJlbW92ZSgpXHJcbiAgICAgICAgc29ydGFibGUuaW5kaWNhdG9yID0gZHJhZ2dpbmcuaW5kaWNhdG9yXHJcbiAgICAgICAgbGV0IGRyYWdPcmRlciA9IHNvcnRhYmxlLmluZGljYXRvci5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgZHJhZ09yZGVyID0gc29ydGFibGUub3B0aW9ucy5vcmRlcklkSXNOdW1iZXIgPyBwYXJzZUZsb2F0KGRyYWdPcmRlcikgOiBkcmFnT3JkZXJcclxuICAgICAgICBsZXQgZm91bmRcclxuICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuX2dldENoaWxkcmVuKHNvcnRhYmxlLCB0cnVlKVxyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLnJldmVyc2VPcmRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBjaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBjaGlsZHJlbltpXVxyXG4gICAgICAgICAgICAgICAgbGV0IGNoaWxkRHJhZ09yZGVyID0gY2hpbGQuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICAgICAgY2hpbGREcmFnT3JkZXIgPSBzb3J0YWJsZS5vcHRpb25zLm9yZGVySXNOdW1iZXIgPyBwYXJzZUZsb2F0KGNoaWxkRHJhZ09yZGVyKSA6IGNoaWxkRHJhZ09yZGVyXHJcbiAgICAgICAgICAgICAgICBpZiAoZHJhZ09yZGVyID4gY2hpbGREcmFnT3JkZXIpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoc29ydGFibGUuaW5kaWNhdG9yLCBjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRJY29uKGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGNoaWxkcmVuKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2hpbGREcmFnT3JkZXIgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgICAgICAgICBjaGlsZERyYWdPcmRlciA9IHNvcnRhYmxlLm9wdGlvbnMub3JkZXJJc051bWJlciA/IHBhcnNlRmxvYXQoY2hpbGREcmFnT3JkZXIpIDogY2hpbGREcmFnT3JkZXJcclxuICAgICAgICAgICAgICAgIGlmIChkcmFnT3JkZXIgPCBjaGlsZERyYWdPcmRlcilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShzb3J0YWJsZS5pbmRpY2F0b3IsIGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldEljb24oZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFmb3VuZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVsZW1lbnQuYXBwZW5kQ2hpbGQoc29ydGFibGUuaW5kaWNhdG9yKVxyXG4gICAgICAgICAgICB0aGlzLl9zZXRJY29uKGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmaW5kIGxhc3QgY2hpbGQgdGhhdCBpcyBvZiB0eXBlIGRyYWdDbGFzcyAoaWYgc2V0KVxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9nZXRMYXN0Q2hpbGQoc29ydGFibGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMuZGVlcFNlYXJjaClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNlYXJjaCA9IFtdXHJcbiAgICAgICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc2VhcmNoLnB1c2goc29ydGFibGUub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdXHJcbiAgICAgICAgICAgIHRoaXMuX3RyYXZlcnNlQ2hpbGRyZW4oc29ydGFibGUuZWxlbWVudCwgc2VhcmNoLCByZXN1bHRzKVxyXG4gICAgICAgICAgICBpZiAocmVzdWx0cy5sZW5ndGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRzW3Jlc3VsdHMubGVuZ3RoIC0gMV1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gc29ydGFibGUuZWxlbWVudC5jaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZCA9IHNvcnRhYmxlLmVsZW1lbnQuY2hpbGRyZW5baV1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGQuY2xhc3NOYW1lID09PSBzb3J0YWJsZS5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjaGlsZFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc29ydGFibGUuZWxlbWVudC5jaGlsZHJlbi5sZW5ndGgpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNvcnRhYmxlLmVsZW1lbnQuY2hpbGRyZW5bc29ydGFibGUuZWxlbWVudC5jaGlsZHJlbi5sZW5ndGggLSAxXVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzZXQgaWNvbiBpZiBhdmFpbGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3NldEljb24oZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChkcmFnZ2luZy5pY29uKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zcmMgPSBkcmFnZ2luZy5vcmlnaW5hbCA9PT0gc29ydGFibGUgPyBzb3J0YWJsZS5vcHRpb25zLmljb25zLnJlb3JkZXIgOiBzb3J0YWJsZS5vcHRpb25zLmljb25zLm1vdmVcclxuICAgICAgICAgICAgZHJhZ2dpbmcuY3VycmVudCA9IHNvcnRhYmxlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkcmFnZ2luZy5vcmlnaW5hbCA9PT0gc29ydGFibGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdvcmRlci1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCd1cGRhdGUtcGVuZGluZycsIHNvcnRhYmxlKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdhZGQtcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgZHJhZ2dpbmcub3JpZ2luYWwuZW1pdCgncmVtb3ZlLXBlbmRpbmcnLCBkcmFnZ2luZywgZHJhZ2dpbmcub3JpZ2luYWwpXHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ3VwZGF0ZS1wZW5kaW5nJylcclxuICAgICAgICAgICAgZHJhZ2dpbmcub3JpZ2luYWwuZW1pdCgndXBkYXRlLXBlbmRpbmcnKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBsYWNlIGluZGljYXRvciBpbiBhbiBzb3J0YWJsZSBsaXN0XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmdcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9wbGFjZUluU29ydGFibGVMaXN0KHNvcnRhYmxlLCBkcmFnZ2luZylcclxuICAgIHtcclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gc29ydGFibGUuZWxlbWVudFxyXG4gICAgICAgIHNvcnRhYmxlLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZHJhZ2dpbmcuaW5kaWNhdG9yKVxyXG4gICAgICAgIHNvcnRhYmxlLmluZGljYXRvciA9IGRyYWdnaW5nLmluZGljYXRvclxyXG4gICAgICAgIGNvbnN0IGxhc3RDaGlsZCA9IHRoaXMuX2dldExhc3RDaGlsZChzb3J0YWJsZSlcclxuICAgICAgICBpZiAoIWxhc3RDaGlsZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoc29ydGFibGUuaW5kaWNhdG9yKVxyXG4gICAgICAgICAgICB0aGlzLl9zZXRJY29uKGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGRyYWdnaW5nLm9mZnNldFRvcCA+PSBlbGVtZW50Lm9mZnNldFRvcCArIGVsZW1lbnQub2Zmc2V0SGVpZ2h0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKHNvcnRhYmxlLmluZGljYXRvcilcclxuICAgICAgICAgICAgICAgIHRoaXMuX3NldEljb24oZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGRyYWdnaW5nLm9mZnNldFRvcCArIGRyYWdnaW5nLm9mZnNldEhlaWdodCA8IGVsZW1lbnQub2Zmc2V0VG9wKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Lmluc2VydEJlZm9yZShzb3J0YWJsZS5pbmRpY2F0b3IsIGVsZW1lbnQuZmlyc3RDaGlsZClcclxuICAgICAgICAgICAgICAgIHRoaXMuX3NldEljb24oZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgeGExID0gZHJhZ2dpbmcub2Zmc2V0TGVmdFxyXG4gICAgICAgICAgICAgICAgY29uc3QgeWExID0gZHJhZ2dpbmcub2Zmc2V0VG9wXHJcbiAgICAgICAgICAgICAgICBjb25zdCB4YTIgPSBkcmFnZ2luZy5vZmZzZXRMZWZ0ICsgZHJhZ2dpbmcub2Zmc2V0V2lkdGhcclxuICAgICAgICAgICAgICAgIGNvbnN0IHlhMiA9IGRyYWdnaW5nLm9mZnNldFRvcCArIGRyYWdnaW5nLm9mZnNldEhlaWdodFxyXG4gICAgICAgICAgICAgICAgbGV0IGxhcmdlc3QgPSAwLCBjbG9zZXN0LCBpc0JlZm9yZSA9IHRydWUsIGluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2VhcmNoID0gW11cclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2gucHVzaChzb3J0YWJsZS5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLm9yZGVyQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoLnB1c2goc29ydGFibGUub3B0aW9ucy5vcmRlckNsYXNzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3QgZWxlbWVudHMgPSB0aGlzLl9nZXRDaGlsZHJlbihzb3J0YWJsZSwgdHJ1ZSlcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGVsZW1lbnRzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZCA9PT0gc29ydGFibGUuaW5kaWNhdG9yKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kaWNhdG9yID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwb3MgPSB0b0dsb2JhbChjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB4YjEgPSBwb3MueFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHliMSA9IHBvcy55XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeGIyID0gcG9zLnggKyBjaGlsZC5vZmZzZXRXaWR0aFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHliMiA9IHBvcy55ICsgY2hpbGQub2Zmc2V0SGVpZ2h0XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGVyY2VudGFnZSA9IHRoaXMuX3BlcmNlbnRhZ2UoeGExLCB5YTEsIHhhMiwgeWEyLCB4YjEsIHliMSwgeGIyLCB5YjIpXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBlcmNlbnRhZ2UgPiBsYXJnZXN0KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFyZ2VzdCA9IHBlcmNlbnRhZ2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VzdCA9IGNoaWxkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzQmVmb3JlID0gaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGNsb3Nlc3QgJiYgY2xvc2VzdCAhPT0gc29ydGFibGUuaW5kaWNhdG9yKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0JlZm9yZSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKHNvcnRhYmxlLmluZGljYXRvciwgY2xvc2VzdC5uZXh0U2libGluZylcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0SWNvbihkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ2RyYWdnaW5nLW9yZGVyLWNoYW5nZScsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lmluc2VydEJlZm9yZShzb3J0YWJsZS5pbmRpY2F0b3IsIGNsb3Nlc3QpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldEljb24oZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdkcmFnZ2luZy1vcmRlci1jaGFuZ2UnLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc29ydGFibGUuZWxlbWVudC5hcHBlbmRDaGlsZChkcmFnZ2luZy5pbmRpY2F0b3IpXHJcbiAgICAgICAgICAgICAgICAgICAgc29ydGFibGUuaW5kaWNhdG9yID0gZHJhZ2dpbmcuaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0SWNvbihkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgbW92ZVxyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZHJhZ01vdmUoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5kcmFnZ2luZylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5kcmFnZ2luZy5waWNrdXApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9kaXN0YW5jZSh0aGlzLmRyYWdnaW5nLnN0YXJ0LngsIHRoaXMuZHJhZ2dpbmcuc3RhcnQueSwgZS5wYWdlWCwgZS5wYWdlWSkgPiB0aGlzLm9wdGlvbnMudGhyZXNob2xkKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3BpY2t1cChlKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuc3R5bGUubGVmdCA9IGUucGFnZVggKyB0aGlzLm9mZnNldC54ICsgJ3B4J1xyXG4gICAgICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLnRvcCA9IGUucGFnZVkgKyB0aGlzLm9mZnNldC55ICsgJ3B4J1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kcmFnZ2luZy5pY29uKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLmljb24uc3R5bGUubGVmdCA9IGUucGFnZVggKyB0aGlzLm9mZnNldC54ICsgdGhpcy5kcmFnZ2luZy5vZmZzZXRXaWR0aCArICdweCdcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuaWNvbi5zdHlsZS50b3AgPSBlLnBhZ2VZICsgdGhpcy5vZmZzZXQueSArIHRoaXMuZHJhZ2dpbmcub2Zmc2V0SGVpZ2h0ICsgJ3B4J1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGxpc3QgPSBbXVxyXG4gICAgICAgICAgICBmb3IgKGxldCBzb3J0YWJsZSBvZiBTb3J0YWJsZS5saXN0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5uYW1lID09PSB0aGlzLm9wdGlvbnMubmFtZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsaXN0LnB1c2goc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmFsd2F5c0luTGlzdCB8fCB0aGlzLl9pbnNpZGUodGhpcy5kcmFnZ2luZywgdGhpcy5lbGVtZW50KSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9wbGFjZUluTGlzdCh0aGlzLCB0aGlzLmRyYWdnaW5nKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuaW5kaWNhdG9yLnJlbW92ZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmcuaWNvbilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuaWNvbi5zcmMgPSB0aGlzLm9wdGlvbnMuaWNvbnMuZGVsZXRlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2xvc2VzdCA9IHRoaXMuX2ZpbmRDbG9zZXN0KGUsIHRoaXMuZHJhZ2dpbmcsIGxpc3QpXHJcbiAgICAgICAgICAgICAgICBpZiAoY2xvc2VzdClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9wbGFjZUluTGlzdChjbG9zZXN0LCB0aGlzLmRyYWdnaW5nKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuaW5kaWNhdG9yLnJlbW92ZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmcuaWNvbilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuaWNvbi5zcmMgPSB0aGlzLm9wdGlvbnMuaWNvbnMuZGVsZXRlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIHVwXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kcmFnVXAoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5kcmFnZ2luZylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRyYWdnaW5nLnBpY2t1cClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5zdHlsZS5wb3NpdGlvbiA9ICcnXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLnpJbmRleCA9ICcnXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLmJveFNoYWRvdyA9ICcnXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLm9wYWNpdHkgPSAnJ1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5kaWNhdG9yLnBhcmVudE5vZGUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3IucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGhpcy5kcmFnZ2luZywgdGhpcy5pbmRpY2F0b3IpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5vcmlnaW5hbCA9IHRoaXMuZHJhZ2dpbmcuY3VycmVudFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5kaWNhdG9yLnJlbW92ZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3IgPSBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmcub3JpZ2luYWwgPT09IHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ29yZGVyJywgdGhpcy5kcmFnZ2luZywgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCd1cGRhdGUnLCB0aGlzLmRyYWdnaW5nLCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLm9yaWdpbmFsLmVtaXQoJ3JlbW92ZScsIHRoaXMuZHJhZ2dpbmcsIHRoaXMuZHJhZ2dpbmcub3JpZ2luYWwpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcub3JpZ2luYWwuZW1pdCgndXBkYXRlJywgdGhpcy5kcmFnZ2luZywgdGhpcy5kcmFnZ2luZy5vcmlnaW5hbClcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdhZGQnLCB0aGlzLmRyYWdnaW5nLCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ3VwZGF0ZScsIHRoaXMuZHJhZ2dpbmcsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcucmVtb3ZlKClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLm9yaWdpbmFsID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5kaWNhdG9yLnJlbW92ZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3IgPSBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdyZW1vdmUnLCB0aGlzLmRyYWdnaW5nLCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmcuaWNvbilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLmljb24ucmVtb3ZlKClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgnY2xpY2tlZCcsIHRoaXMuZHJhZ2dpbmcsIHRoaXMpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5kcmFnZ2luZyA9IG51bGxcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdGhlIGdsb2JhbCBkZWZhdWx0cyBmb3IgbmV3IFNvcnRhYmxlIG9iamVjdHNcclxuICAgICAqIEB0eXBlIHtEZWZhdWx0T3B0aW9uc31cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldCBkZWZhdWx0cygpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjcmVhdGUgbXVsdGlwbGUgc29ydGFibGUgZWxlbWVudHNcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnRzW119IGVsZW1lbnRzXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyAtIHNlZSBjb25zdHJ1Y3RvciBmb3Igb3B0aW9uc1xyXG4gICAgICovXHJcbiAgICBzdGF0aWMgY3JlYXRlKGVsZW1lbnRzLCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXVxyXG4gICAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgZWxlbWVudHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXN1bHRzLnB1c2gobmV3IFNvcnRhYmxlKGVsZW1lbnQsIG9wdGlvbnMpKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0c1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNvcnRhYmxlXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIGNsaWNrZWQgYnV0IG5vdCBtb3ZlZCBiZXlvbmQgdGhlIG9wdGlvbnMudGhyZXNob2xkXHJcbiAqIEBldmVudCBTb3J0YWJsZSNjbGlja2VkXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgY2xpY2tlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBzb3J0YWJsZSBjb250YWluaW5nIGVsZW1lbnRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIHBpY2tlZCB1cCBiZWNhdXNlIGl0IHdhcyBtb3ZlZCBiZXlvbmQgdGhlIG9wdGlvbnMudGhyZXNob2xkXHJcbiAqIEBldmVudCBTb3J0YWJsZSNwaWNrdXBcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCBiZWluZyBkcmFnZ2VkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IGN1cnJlbnQgc29ydGFibGUgd2l0aCBlbGVtZW50IHBsYWNlaG9sZGVyXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gYSBzb3J0YWJsZSBpcyByZW9yZGVyZWRcclxuICogQGV2ZW50IFNvcnRhYmxlI29yZGVyXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgdGhhdCB3YXMgcmVvcmRlcmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIHBsYWNlZFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGFuIGVsZW1lbnQgaXMgYWRkZWQgdG8gdGhpcyBzb3J0YWJsZVxyXG4gKiBAZXZlbnQgU29ydGFibGUjYWRkXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgYWRkZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2hlcmUgZWxlbWVudCB3YXMgYWRkZWRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIHJlbW92ZWQgZnJvbSB0aGlzIHNvcnRhYmxlXHJcbiAqIEBldmVudCBTb3J0YWJsZSNyZW1vdmVcclxuICogQHByb3BlcnR5IHtIVE1MRWxlbWVudH0gZWxlbWVudCByZW1vdmVkXHJcbiAqIEBwcm9wZXJ0eSB7U29ydGFibGV9IHNvcnRhYmxlIHdoZXJlIGVsZW1lbnQgd2FzIHJlbW92ZWRcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiB0aGUgc29ydGFibGUgaXMgdXBkYXRlZCB3aXRoIGFuIGFkZCwgcmVtb3ZlLCBvciBvcmRlciBjaGFuZ2VcclxuICogQGV2ZW50IFNvcnRhYmxlI3VwZGF0ZVxyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGNoYW5nZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gc29ydGFibGUgd2l0aCBlbGVtZW50XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIGZpcmVzIHdoZW4gb3JkZXIgd2FzIGNoYW5nZWQgYnV0IGVsZW1lbnQgd2FzIG5vdCBkcm9wcGVkIHlldFxyXG4gKiBAZXZlbnQgU29ydGFibGUjb3JkZXItcGVuZGluZ1xyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBlbGVtZW50IGlzIGFkZGVkIGJ1dCBub3QgZHJvcHBlZCB5ZXRcclxuICogQGV2ZW50IFNvcnRhYmxlI2FkZC1wZW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgYmVpbmcgZHJhZ2dlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBjdXJyZW50IHNvcnRhYmxlIHdpdGggZWxlbWVudCBwbGFjZWhvbGRlclxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBmaXJlcyB3aGVuIGVsZW1lbnQgaXMgcmVtb3ZlZCBidXQgbm90IGRyb3BwZWQgeWV0XHJcbiAqIEBldmVudCBTb3J0YWJsZSNyZW1vdmUtcGVuZGluZ1xyXG4gKiBAcHJvcGVydHkge0hUTUxFbGVtZW50fSBlbGVtZW50IGJlaW5nIGRyYWdnZWRcclxuICogQHByb3BlcnR5IHtTb3J0YWJsZX0gY3VycmVudCBzb3J0YWJsZSB3aXRoIGVsZW1lbnQgcGxhY2Vob2xkZXJcclxuICovXHJcblxyXG4vKipcclxuICogZmlyZXMgd2hlbiBhbiBlbGVtZW50IGlzIGFkZGVkLCByZW1vdmVkLCBvciByZW9yZGVyIGJ1dCBlbGVtZW50IGhhcyBub3QgZHJvcHBlZCB5ZXRcclxuICogQGV2ZW50IFNvcnRhYmxlI3VwZGF0ZS1wZW5kaW5nXHJcbiAqIEBwcm9wZXJ0eSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgYmVpbmcgZHJhZ2dlZFxyXG4gKiBAcHJvcGVydHkge1NvcnRhYmxlfSBjdXJyZW50IHNvcnRhYmxlIHdpdGggZWxlbWVudCBwbGFjZWhvbGRlclxyXG4gKi8iXX0=