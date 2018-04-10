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
     */
    _setIcon(dragging, sortable) {
        if (dragging.icon) {
            dragging.icon.src = dragging.original === sortable ? sortable.options.icons.reorder : sortable.options.icons.move;
            dragging.current = sortable;
        }
        if (dragging.original === sortable) {
            sortable.emit('reorder-pending', dragging, sortable);
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
                        this.emit('reorder', this.dragging, this);
                        this.emit('update', this.dragging, this);
                    } else {
                        this.dragging.original.emit('remove', this.dragging, this.dragging.original);
                        this.dragging.original.emit('update', this.dragging, this.dragging.original);
                        this.emit('add', this.dragging, this);
                        this.emit('update', this.dragging, this);
                    }
                } else {
                    this.emit('remove', this.dragging, this);
                    this.indicator.remove();
                    this.indicator = null;
                    this.dragging.remove();
                    this.dragging.original = null;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3J0YWJsZS5qcyJdLCJuYW1lcyI6WyJFdmVudHMiLCJyZXF1aXJlIiwidG9HbG9iYWwiLCJkZWZhdWx0cyIsIlNvcnRhYmxlIiwiY29uc3RydWN0b3IiLCJlbGVtZW50Iiwib3B0aW9ucyIsIm9wdGlvbiIsInNvcnRhYmxlIiwiZWxlbWVudHMiLCJfZ2V0Q2hpbGRyZW4iLCJjaGlsZCIsImRyYWdDbGFzcyIsImNsYXNzTmFtZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJlIiwiX2RyYWdTdGFydCIsImNoaWxkcmVuU3R5bGVzIiwic3R5bGUiLCJvcmlnaW5hbCIsImRvY3VtZW50IiwiYm9keSIsIl9kcmFnTW92ZSIsIl9kcmFnVXAiLCJsaXN0IiwicHVzaCIsImRyYWdnaW5nIiwiY3VycmVudFRhcmdldCIsInBpY2t1cCIsInN0YXJ0IiwieCIsInBhZ2VYIiwieSIsInBhZ2VZIiwiY3Vyc29yIiwicHJldmVudERlZmF1bHQiLCJfcGlja3VwIiwiaW5kaWNhdG9yIiwiY2xvbmVOb2RlIiwicG9zIiwicG9zaXRpb24iLCJvZmZzZXQiLCJsZWZ0IiwidG9wIiwiZHJhZ1N0eWxlIiwicGFyZW50Tm9kZSIsImluc2VydEJlZm9yZSIsImFwcGVuZENoaWxkIiwidXNlSWNvbnMiLCJpbWFnZSIsIkltYWdlIiwic3JjIiwiaWNvbnMiLCJyZW9yZGVyIiwidHJhbnNmb3JtIiwib2Zmc2V0V2lkdGgiLCJvZmZzZXRIZWlnaHQiLCJpY29uIiwiZW1pdCIsIl9kaXN0YW5jZSIsIngxIiwieTEiLCJ4MiIsInkyIiwiTWF0aCIsInNxcnQiLCJwb3ciLCJfZGlzdGFuY2VUb0Nsb3Nlc3RDb3JuZXIiLCJ0b3BMZWZ0Iiwib2Zmc2V0TGVmdCIsIm9mZnNldFRvcCIsInRvcFJpZ2h0IiwiYm90dG9tTGVmdCIsImJvdHRvbVJpZ2h0IiwibWluIiwiX2luc2lkZSIsIncxIiwiaDEiLCJ3MiIsImgyIiwiX2ZpbmRDbG9zZXN0IiwiSW5maW5pdHkiLCJmb3VuZCIsInJlbGF0ZWQiLCJhbHdheXNJbkxpc3QiLCJjYWxjdWxhdGUiLCJfcGVyY2VudGFnZSIsInhhMSIsInlhMSIsInhhMiIsInlhMiIsInhiMSIsInliMSIsInhiMiIsInliMiIsInNhIiwic2IiLCJzaSIsIm1heCIsInVuaW9uIiwiX3BsYWNlSW5MaXN0Iiwic29ydCIsIl9wbGFjZUluU29ydGFibGVMaXN0IiwiX3BsYWNlSW5PcmRlcmVkTGlzdCIsIl90cmF2ZXJzZUNoaWxkcmVuIiwiYmFzZSIsInNlYXJjaCIsInJlc3VsdHMiLCJjaGlsZHJlbiIsImxlbmd0aCIsImluZGV4T2YiLCJvcmRlciIsImRlZXBTZWFyY2giLCJvcmRlckNsYXNzIiwiaWQiLCJvcmRlcklkIiwicmVtb3ZlIiwiZHJhZ09yZGVyIiwiZ2V0QXR0cmlidXRlIiwib3JkZXJJZElzTnVtYmVyIiwicGFyc2VGbG9hdCIsInJldmVyc2VPcmRlciIsImkiLCJjaGlsZERyYWdPcmRlciIsIm9yZGVySXNOdW1iZXIiLCJfc2V0SWNvbiIsIl9nZXRMYXN0Q2hpbGQiLCJtb3ZlIiwiY3VycmVudCIsImxhc3RDaGlsZCIsImZpcnN0Q2hpbGQiLCJsYXJnZXN0IiwiY2xvc2VzdCIsImlzQmVmb3JlIiwicGVyY2VudGFnZSIsIm5leHRTaWJsaW5nIiwidGhyZXNob2xkIiwibmFtZSIsImRlbGV0ZSIsInN0b3BQcm9wYWdhdGlvbiIsInpJbmRleCIsImJveFNoYWRvdyIsIm9wYWNpdHkiLCJjcmVhdGUiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQSxNQUFNQSxTQUFTQyxRQUFRLGVBQVIsQ0FBZjs7QUFFQSxNQUFNQyxXQUFXRCxRQUFRLFlBQVIsQ0FBakI7QUFDQSxNQUFNRSxXQUFXRixRQUFRLFdBQVIsQ0FBakI7O0FBRUEsTUFBTUcsUUFBTixTQUF1QkosTUFBdkIsQ0FDQTtBQUNJOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTZCQUssZ0JBQVlDLE9BQVosRUFBcUJDLE9BQXJCLEVBQ0E7QUFDSTtBQUNBLGFBQUtBLE9B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QUFuQztBQUNBLHlCQUFLVyxTQUFMLENBQWUrRSxNQUFmO0FBQ0EseUJBQUsvRSxTQUFMLEdBQWlCLElBQWpCO0FBQ0EseUJBQUtYLFFBQUwsQ0FBYzBGLE1BQWQ7QUFDQSx5QkFBSzFGLFFBQUwsQ0FBY1AsUUFBZCxHQUF5QixJQUF6QjtBQUNIO0FBQ0Qsb0JBQUksS0FBS08sUUFBTCxDQUFjK0IsSUFBbEIsRUFDQTtBQUNJLHlCQUFLL0IsUUFBTCxDQUFjK0IsSUFBZCxDQUFtQjJELE1BQW5CO0FBQ0g7QUFDSixhQXJDRCxNQXVDQTtBQUNJLHFCQUFLMUQsSUFBTCxDQUFVLFNBQVYsRUFBcUIsS0FBS2hDLFFBQTFCLEVBQW9DLElBQXBDO0FBQ0g7QUFDRCxpQkFBS0EsUUFBTCxHQUFnQixJQUFoQjtBQUNBWCxjQUFFb0IsY0FBRjtBQUNIO0FBQ0o7O0FBRUQ7Ozs7QUFJQSxlQUFXakMsUUFBWCxHQUNBO0FBQ0ksZUFBT0EsUUFBUDtBQUNIOztBQUVEOzs7OztBQUtBLFdBQU82SSxNQUFQLENBQWN0SSxRQUFkLEVBQXdCSCxPQUF4QixFQUNBO0FBQ0ksY0FBTXFHLFVBQVUsRUFBaEI7QUFDQSxhQUFLLElBQUl0RyxPQUFULElBQW9CSSxRQUFwQixFQUNBO0FBQ0lrRyxvQkFBUWxGLElBQVIsQ0FBYSxJQUFJdEIsUUFBSixDQUFhRSxPQUFiLEVBQXNCQyxPQUF0QixDQUFiO0FBQ0g7QUFDRCxlQUFPcUcsT0FBUDtBQUNIO0FBcHFCTDs7QUF1cUJBcUMsT0FBT0MsT0FBUCxHQUFpQjlJLFFBQWpCIiwiZmlsZSI6InNvcnRhYmxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgRXZlbnRzID0gcmVxdWlyZSgnZXZlbnRlbWl0dGVyMycpXHJcblxyXG5jb25zdCB0b0dsb2JhbCA9IHJlcXVpcmUoJy4vdG9HbG9iYWwnKVxyXG5jb25zdCBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vb3B0aW9ucycpXHJcblxyXG5jbGFzcyBTb3J0YWJsZSBleHRlbmRzIEV2ZW50c1xyXG57XHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBzb3J0YWJsZSBsaXN0XHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMubmFtZT1zb3J0YWJsZV0gZHJhZ2dpbmcgaXMgYWxsb3dlZCBiZXR3ZWVuIFNvcnRhYmxlcyB3aXRoIHRoZSBzYW1lIG5hbWVcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuc29ydD10cnVlXSBhbGxvdyBzb3J0aW5nIHdpdGhpbiBsaXN0XHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuZHJhZ0NsYXNzXSBpZiBzZXQgdGhlbiBkcmFnIG9ubHkgaXRlbXMgd2l0aCB0aGlzIGNsYXNzTmFtZSB1bmRlciBlbGVtZW50LCBvdGhlcndpc2UgdXNlIGFsbCBjaGlsZHJlblxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5kZWVwU2VhcmNoXSBpZiBkcmFnQ2xhc3MgYW5kIGRlZXBTZWFyY2ggdGhlbiBzZWFyY2ggYWxsIGRlc2NlbmRlbnRzIG9mIGVsZW1lbnQgZm9yIGRyYWdDbGFzc1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLm9yZGVySWQ9ZGF0YS1vcmRlcl0gZm9yIG5vbi1zb3J0aW5nIGxpc3RzLCB1c2UgdGhpcyBkYXRhIGlkIHRvIGZpZ3VyZSBvdXQgc29ydCBvcmRlclxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5vcmRlcklkSXNOdW1iZXI9dHJ1ZV0gdXNlIHBhcnNlSW50IG9uIG9wdGlvbnMub3JkZXJJZCB0byBwcm9wZXJseSBzb3J0IG51bWJlcnNcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5yZXZlcnNlT3JkZXJdIHJldmVyc2Ugc29ydCB0aGUgb3JkZXJJZFxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5hbHdheXNJbkxpc3Q9dHJ1ZV0gcGxhY2UgZWxlbWVudCBpbnNpZGUgY2xvc2VzdCByZWxhdGVkIFNvcnRhYmxlIG9iamVjdDsgaWYgc2V0IHRvIGZhbHNlIHRoZW4gdGhlIG9iamVjdCBpcyByZW1vdmVkIGlmIGRyb3BwZWQgb3V0c2lkZSByZWxhdGVkIHNvcnRhYmxlc1xyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zLmNoaWxkcmVuU3R5bGVzXSBzdHlsZXMgdG8gYXBwbHkgdG8gY2hpbGRyZW4gZWxlbWVudHMgb2YgU29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9ucy5pY29uc10gZGVmYXVsdCBzZXQgb2YgaWNvbnNcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5pY29ucy5yZW9yZGVyXSBzb3VyY2Ugb2YgaW1hZ2VcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5pY29ucy5tb3ZlXSBzb3VyY2Ugb2YgaW1hZ2VcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5pY29ucy5jb3B5XSBzb3VyY2Ugb2YgaW1hZ2VcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5pY29ucy5kZWxldGVdIHNvdXJjZSBvZiBpbWFnZVxyXG4gICAgICogQGZpcmVzIGNsaWNrZWRcclxuICAgICAqIEBmaXJlcyBwaWNrdXBcclxuICAgICAqIEBmaXJlcyBvcmRlclxyXG4gICAgICogQGZpcmVzIGFkZFxyXG4gICAgICogQGZpcmVzIHJlbW92ZVxyXG4gICAgICogQGZpcmVzIHVwZGF0ZVxyXG4gICAgICogQGZpcmVzIG9yZGVyLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyBhZGQtcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIHJlbW92ZS1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgdXBkYXRlLXBlbmRpbmdcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBzdXBlcigpXHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIGZvciAobGV0IG9wdGlvbiBpbiBkZWZhdWx0cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9uc1tvcHRpb25dID0gdHlwZW9mIHRoaXMub3B0aW9uc1tvcHRpb25dICE9PSAndW5kZWZpbmVkJyA/IG9wdGlvbnNbb3B0aW9uXSA6IGRlZmF1bHRzW29wdGlvbl1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudFxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zb3J0YWJsZSA9IHRoaXNcclxuICAgICAgICBjb25zdCBlbGVtZW50cyA9IHRoaXMuX2dldENoaWxkcmVuKHRoaXMpXHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgZWxlbWVudHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5kcmFnQ2xhc3MgfHwgY2hpbGQuY2xhc3NOYW1lID09PSB0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCAoZSkgPT4gdGhpcy5fZHJhZ1N0YXJ0KGUpKVxyXG4gICAgICAgICAgICAgICAgY2hpbGQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIChlKSA9PiB0aGlzLl9kcmFnU3RhcnQoZSkpXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBvcHRpb24gaW4gdGhpcy5vcHRpb25zLmNoaWxkcmVuU3R5bGVzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkLnN0eWxlW29wdGlvbl0gPSB0aGlzLm9wdGlvbnMuY2hpbGRyZW5TdHlsZXNbb3B0aW9uXVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2hpbGQub3JpZ2luYWwgPSB0aGlzXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCAoZSkgPT4gdGhpcy5fZHJhZ01vdmUoZSkpXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCAoZSkgPT4gdGhpcy5fZHJhZ01vdmUoZSkpXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHVwJywgKGUpID0+IHRoaXMuX2RyYWdVcChlKSlcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgKGUpID0+IHRoaXMuX2RyYWdVcChlKSlcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCAoZSkgPT4gdGhpcy5fZHJhZ1VwKGUpKVxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VjYW5jZWwnLCAoZSkgPT4gdGhpcy5fZHJhZ1VwKGUpKVxyXG5cclxuICAgICAgICBpZiAoIVNvcnRhYmxlLmxpc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBTb3J0YWJsZS5saXN0ID0gW11cclxuICAgICAgICB9XHJcbiAgICAgICAgU29ydGFibGUubGlzdC5wdXNoKHRoaXMpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzdGFydCBkcmFnXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kcmFnU3RhcnQoZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLmRyYWdnaW5nID0gZS5jdXJyZW50VGFyZ2V0XHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZy5waWNrdXAgPSBmYWxzZVxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcuc3RhcnQgPSB7IHg6IGUucGFnZVgsIHk6IGUucGFnZVkgfVxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcuc3R5bGUuY3Vyc29yID0gJ25vLWN1cnNvcidcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBpY2t1cCBhbmQgY2xvbmUgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGlja3VwKGUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5pbmRpY2F0b3IgPSB0aGlzLmRyYWdnaW5nLmNsb25lTm9kZSh0cnVlKVxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcuaW5kaWNhdG9yID0gdGhpcy5pbmRpY2F0b3JcclxuICAgICAgICBjb25zdCBwb3MgPSB0b0dsb2JhbCh0aGlzLmRyYWdnaW5nKVxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXHJcbiAgICAgICAgdGhpcy5vZmZzZXQgPSB7IHg6IHBvcy54IC0gZS5wYWdlWCwgeTogcG9zLnkgLSBlLnBhZ2VZIH1cclxuICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLmxlZnQgPSBwb3MueCArICdweCdcclxuICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLnRvcCA9IHBvcy55ICsgJ3B4J1xyXG4gICAgICAgIGZvciAobGV0IG9wdGlvbiBpbiB0aGlzLm9wdGlvbnMuZHJhZ1N0eWxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5zdHlsZVtvcHRpb25dID0gdGhpcy5vcHRpb25zLmRyYWdTdHlsZVtvcHRpb25dXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGhpcy5pbmRpY2F0b3IsIHRoaXMuZHJhZ2dpbmcpXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmRyYWdnaW5nKVxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMudXNlSWNvbnMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBpbWFnZSA9IG5ldyBJbWFnZSgpXHJcbiAgICAgICAgICAgIGltYWdlLnNyYyA9IHRoaXMub3B0aW9ucy5pY29ucy5yZW9yZGVyXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xyXG4gICAgICAgICAgICBpbWFnZS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKC01MCUsIC01MCUpJ1xyXG4gICAgICAgICAgICBpbWFnZS5zdHlsZS5sZWZ0ID0gcG9zLnggKyB0aGlzLmRyYWdnaW5nLm9mZnNldFdpZHRoICsgJ3B4J1xyXG4gICAgICAgICAgICBpbWFnZS5zdHlsZS50b3AgPSBwb3MueSArIHRoaXMuZHJhZ2dpbmcub2Zmc2V0SGVpZ2h0ICsgJ3B4J1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGltYWdlKVxyXG4gICAgICAgICAgICB0aGlzLmRyYWdnaW5nLmljb24gPSBpbWFnZVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmRyYWdnaW5nLnBpY2t1cCA9IHRydWVcclxuICAgICAgICB0aGlzLmVtaXQoJ3BpY2t1cCcsIHRoaXMuZHJhZ2dpbmcsIHRoaXMpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBtZWFzdXJlIGRpc3RhbmNlIGJldHdlZW4gdHdvIHBvaW50c1xyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHgxXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geTFcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4MlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHkyXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZGlzdGFuY2UoeDEsIHkxLCB4MiwgeTIpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyh4MSAtIHgyLCAyKSArIE1hdGgucG93KHkxIC0geTIsIDIpKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZmluZCBjbG9zZXN0IGRpc3RhbmNlIGZyb20gVUlFdmVudCB0byBhIGNvcm5lciBvZiBhbiBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge0hUTUxVTGlzdEVsZW1lbnR9IGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kaXN0YW5jZVRvQ2xvc2VzdENvcm5lcihlLCBlbGVtZW50KVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHRvcExlZnQgPSB0aGlzLl9kaXN0YW5jZShlLnBhZ2VYLCBlLnBhZ2VZLCBlbGVtZW50Lm9mZnNldExlZnQsIGVsZW1lbnQub2Zmc2V0VG9wKVxyXG4gICAgICAgIGNvbnN0IHRvcFJpZ2h0ID0gdGhpcy5fZGlzdGFuY2UoZS5wYWdlWCwgZS5wYWdlWSwgZWxlbWVudC5vZmZzZXRMZWZ0ICsgZWxlbWVudC5vZmZzZXRXaWR0aCwgZWxlbWVudC5vZmZzZXRUb3ApXHJcbiAgICAgICAgY29uc3QgYm90dG9tTGVmdCA9IHRoaXMuX2Rpc3RhbmNlKGUucGFnZVgsIGUucGFnZVksIGVsZW1lbnQub2Zmc2V0TGVmdCwgZWxlbWVudC5vZmZzZXRUb3AgKyBlbGVtZW50Lm9mZnNldEhlaWdodClcclxuICAgICAgICBjb25zdCBib3R0b21SaWdodCA9IHRoaXMuX2Rpc3RhbmNlKGUucGFnZVgsIGUucGFnZVksIGVsZW1lbnQub2Zmc2V0TGVmdCArIGVsZW1lbnQub2Zmc2V0V2lkdGgsIGVsZW1lbnQub2Zmc2V0VG9wICsgZWxlbWVudC5vZmZzZXRIZWlnaHQpXHJcbiAgICAgICAgcmV0dXJuIE1hdGgubWluKHRvcExlZnQsIHRvcFJpZ2h0LCBib3R0b21MZWZ0LCBib3R0b21SaWdodClcclxuICAgIH1cclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBkZXRlcm1pbmUgd2hldGhlciB0aGVzZSBpcyBvdmVybGFwIGJldHdlZW4gdHdvIGVsZW1lbnRzXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2luc2lkZShkcmFnZ2luZywgZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBjb25zdCB4MSA9IGRyYWdnaW5nLm9mZnNldExlZnRcclxuICAgICAgICBjb25zdCB5MSA9IGRyYWdnaW5nLm9mZnNldFRvcFxyXG4gICAgICAgIGNvbnN0IHcxID0gZHJhZ2dpbmcub2Zmc2V0V2lkdGhcclxuICAgICAgICBjb25zdCBoMSA9IGRyYWdnaW5nLm9mZnNldEhlaWdodFxyXG4gICAgICAgIGNvbnN0IHBvcyA9IHRvR2xvYmFsKGVsZW1lbnQpXHJcbiAgICAgICAgY29uc3QgeDIgPSBwb3MueFxyXG4gICAgICAgIGNvbnN0IHkyID0gcG9zLnlcclxuICAgICAgICBjb25zdCB3MiA9IGVsZW1lbnQub2Zmc2V0V2lkdGhcclxuICAgICAgICBjb25zdCBoMiA9IGVsZW1lbnQub2Zmc2V0SGVpZ2h0XHJcbiAgICAgICAgcmV0dXJuIHgxIDwgeDIgKyB3MiAmJiB4MSArIHcxID4geDIgJiYgeTEgPCB5MiArIGgyICYmIHkxICsgaDEgPiB5MlxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZmluZCBjbG9zZXN0IFNvcnRhYmxlIHRvIHNjcmVlbiBsb2NhdGlvblxyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZVtdfSBsaXN0IG9mIHJlbGF0ZWQgU29ydGFibGVzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZmluZENsb3Nlc3QoZSwgZHJhZ2dpbmcsIGxpc3QpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IG1pbiA9IEluZmluaXR5LCBmb3VuZFxyXG4gICAgICAgIGZvciAobGV0IHJlbGF0ZWQgb2YgbGlzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9pbnNpZGUoZHJhZ2dpbmcsIHJlbGF0ZWQuZWxlbWVudCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZWxhdGVkXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAocmVsYXRlZC5vcHRpb25zLmFsd2F5c0luTGlzdClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2FsY3VsYXRlID0gdGhpcy5fZGlzdGFuY2VUb0Nsb3Nlc3RDb3JuZXIoZSwgcmVsYXRlZC5lbGVtZW50KVxyXG4gICAgICAgICAgICAgICAgaWYgKGNhbGN1bGF0ZSA8IG1pbilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtaW4gPSBjYWxjdWxhdGVcclxuICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHJlbGF0ZWRcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZm91bmRcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4YTFcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5YTFcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4YTJcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4YTJcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4YjFcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5YjFcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4YjJcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5YjJcclxuICAgICAqIGNhbGN1bGF0ZSBwZXJjZW50YWdlIG9mIG92ZXJsYXAgYmV0d2VlbiB0d28gYm94ZXNcclxuICAgICAqIGZyb20gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzIxMjIwMDA0LzE5NTU5OTdcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9wZXJjZW50YWdlKHhhMSwgeWExLCB4YTIsIHlhMiwgeGIxLCB5YjEsIHhiMiwgeWIyKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHNhID0gKHhhMiAtIHhhMSkgKiAoeWEyIC0geWExKVxyXG4gICAgICAgIGNvbnN0IHNiID0gKHhiMiAtIHhiMSkgKiAoeWIyIC0geWIxKVxyXG4gICAgICAgIGNvbnN0IHNpID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oeGEyLCB4YjIpIC0gTWF0aC5tYXgoeGExLCB4YjEpKSAqIE1hdGgubWF4KDAsIE1hdGgubWluKHlhMiwgeWIyKSAtIE1hdGgubWF4KHlhMSwgeWIxKSlcclxuICAgICAgICBjb25zdCB1bmlvbiA9IHNhICsgc2IgLSBzaVxyXG4gICAgICAgIHJldHVybiBzaSAvIHVuaW9uXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwbGFjZSBpbmRpY2F0b3IgaW4gdGhlIHNvcnRhYmxlIGxpc3QgYWNjb3JkaW5nIHRvIG9wdGlvbnMuc29ydFxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nIGVsZW1lbnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9wbGFjZUluTGlzdChzb3J0YWJsZSwgZHJhZ2dpbmcpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMuc29ydClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuX3BsYWNlSW5Tb3J0YWJsZUxpc3Qoc29ydGFibGUsIGRyYWdnaW5nKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLl9wbGFjZUluT3JkZXJlZExpc3Qoc29ydGFibGUsIGRyYWdnaW5nKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfdHJhdmVyc2VDaGlsZHJlbihiYXNlLCBzZWFyY2gsIHJlc3VsdHMpXHJcbiAgICB7XHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgYmFzZS5jaGlsZHJlbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChzZWFyY2gubGVuZ3RoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2VhcmNoLmluZGV4T2YoY2hpbGQuY2xhc3NOYW1lKSAhPT0gLTEpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGNoaWxkKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3RyYXZlcnNlQ2hpbGRyZW4oY2hpbGQsIHNlYXJjaCwgcmVzdWx0cylcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmaW5kIGNoaWxkcmVuIGluIGRpdlxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29yZGVyXSBzZWFyY2ggZm9yIGRyYWdPcmRlciBhcyB3ZWxsXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZ2V0Q2hpbGRyZW4oc29ydGFibGUsIG9yZGVyKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLmRlZXBTZWFyY2gpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgc2VhcmNoID0gW11cclxuICAgICAgICAgICAgaWYgKG9yZGVyICYmIHNvcnRhYmxlLm9wdGlvbnMub3JkZXJDbGFzcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaC5wdXNoKHNvcnRhYmxlLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKG9yZGVyICYmIHNvcnRhYmxlLm9wdGlvbnMub3JkZXJDbGFzcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2gucHVzaChzb3J0YWJsZS5vcHRpb25zLm9yZGVyQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoIW9yZGVyICYmIHNvcnRhYmxlLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzZWFyY2gucHVzaChzb3J0YWJsZS5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCByZXN1bHRzID0gW11cclxuICAgICAgICAgICAgdGhpcy5fdHJhdmVyc2VDaGlsZHJlbihzb3J0YWJsZS5lbGVtZW50LCBzZWFyY2gsIHJlc3VsdHMpXHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGV0IGxpc3QgPSBbXVxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2Ygc29ydGFibGUuZWxlbWVudC5jaGlsZHJlbilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGQuY2xhc3NOYW1lID09PSBzb3J0YWJsZS5vcHRpb25zLmRyYWdDbGFzcyB8fCAoKG9yZGVyIHx8ICFzb3J0YWJsZS5vcHRpb25zLm9yZGVyQ2xhc3MpIHx8IChvcmRlciAmJiBzb3J0YWJsZS5vcHRpb25zLm9yZGVyQ2xhc3MgJiYgY2hpbGQuY2xhc3NOYW1lID09PSBzb3J0YWJsZS5vcHRpb25zLm9yZGVyQ2xhc3MpKSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpc3QucHVzaChjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbGlzdFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNvcnRhYmxlLmVsZW1lbnQuY2hpbGRyZW5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBsYWNlIGluZGljYXRvciBpbiBhbiBvcmRlcmVkIGxpc3RcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BsYWNlSW5PcmRlcmVkTGlzdChzb3J0YWJsZSwgZHJhZ2dpbmcpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgaWQgPSBzb3J0YWJsZS5vcHRpb25zLm9yZGVySWRcclxuICAgICAgICBkcmFnZ2luZy5pbmRpY2F0b3IucmVtb3ZlKClcclxuICAgICAgICBzb3J0YWJsZS5pbmRpY2F0b3IgPSBkcmFnZ2luZy5pbmRpY2F0b3JcclxuICAgICAgICBsZXQgZHJhZ09yZGVyID0gc29ydGFibGUuaW5kaWNhdG9yLmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICBkcmFnT3JkZXIgPSBzb3J0YWJsZS5vcHRpb25zLm9yZGVySWRJc051bWJlciA/IHBhcnNlRmxvYXQoZHJhZ09yZGVyKSA6IGRyYWdPcmRlclxyXG4gICAgICAgIGxldCBmb3VuZFxyXG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5fZ2V0Q2hpbGRyZW4oc29ydGFibGUsIHRydWUpXHJcbiAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMucmV2ZXJzZU9yZGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IGNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZCA9IGNoaWxkcmVuW2ldXHJcbiAgICAgICAgICAgICAgICBsZXQgY2hpbGREcmFnT3JkZXIgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoaWQpXHJcbiAgICAgICAgICAgICAgICBjaGlsZERyYWdPcmRlciA9IHNvcnRhYmxlLm9wdGlvbnMub3JkZXJJc051bWJlciA/IHBhcnNlRmxvYXQoY2hpbGREcmFnT3JkZXIpIDogY2hpbGREcmFnT3JkZXJcclxuICAgICAgICAgICAgICAgIGlmIChkcmFnT3JkZXIgPiBjaGlsZERyYWdPcmRlcilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShzb3J0YWJsZS5pbmRpY2F0b3IsIGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldEljb24oZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgY2hpbGRyZW4pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxldCBjaGlsZERyYWdPcmRlciA9IGNoaWxkLmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICAgICAgICAgIGNoaWxkRHJhZ09yZGVyID0gc29ydGFibGUub3B0aW9ucy5vcmRlcklzTnVtYmVyID8gcGFyc2VGbG9hdChjaGlsZERyYWdPcmRlcikgOiBjaGlsZERyYWdPcmRlclxyXG4gICAgICAgICAgICAgICAgaWYgKGRyYWdPcmRlciA8IGNoaWxkRHJhZ09yZGVyKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHNvcnRhYmxlLmluZGljYXRvciwgY2hpbGQpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0SWNvbihkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWZvdW5kKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc29ydGFibGUuZWxlbWVudC5hcHBlbmRDaGlsZChzb3J0YWJsZS5pbmRpY2F0b3IpXHJcbiAgICAgICAgICAgIHRoaXMuX3NldEljb24oZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGZpbmQgbGFzdCBjaGlsZCB0aGF0IGlzIG9mIHR5cGUgZHJhZ0NsYXNzIChpZiBzZXQpXHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2dldExhc3RDaGlsZChzb3J0YWJsZSlcclxuICAgIHtcclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5kZWVwU2VhcmNoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3Qgc2VhcmNoID0gW11cclxuICAgICAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzZWFyY2gucHVzaChzb3J0YWJsZS5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCByZXN1bHRzID0gW11cclxuICAgICAgICAgICAgdGhpcy5fdHJhdmVyc2VDaGlsZHJlbihzb3J0YWJsZS5lbGVtZW50LCBzZWFyY2gsIHJlc3VsdHMpXHJcbiAgICAgICAgICAgIGlmIChyZXN1bHRzLmxlbmd0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHNbcmVzdWx0cy5sZW5ndGggLSAxXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSBzb3J0YWJsZS5lbGVtZW50LmNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gc29ydGFibGUuZWxlbWVudC5jaGlsZHJlbltpXVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZC5jbGFzc05hbWUgPT09IHNvcnRhYmxlLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNoaWxkXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZS5lbGVtZW50LmNoaWxkcmVuLmxlbmd0aClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc29ydGFibGUuZWxlbWVudC5jaGlsZHJlbltzb3J0YWJsZS5lbGVtZW50LmNoaWxkcmVuLmxlbmd0aCAtIDFdXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNldCBpY29uIGlmIGF2YWlsYWJsZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmdcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKi9cclxuICAgIF9zZXRJY29uKGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgIHtcclxuICAgICAgICBpZiAoZHJhZ2dpbmcuaWNvbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGRyYWdnaW5nLmljb24uc3JjID0gZHJhZ2dpbmcub3JpZ2luYWwgPT09IHNvcnRhYmxlID8gc29ydGFibGUub3B0aW9ucy5pY29ucy5yZW9yZGVyIDogc29ydGFibGUub3B0aW9ucy5pY29ucy5tb3ZlXHJcbiAgICAgICAgICAgIGRyYWdnaW5nLmN1cnJlbnQgPSBzb3J0YWJsZVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZHJhZ2dpbmcub3JpZ2luYWwgPT09IHNvcnRhYmxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc29ydGFibGUuZW1pdCgncmVvcmRlci1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCd1cGRhdGUtcGVuZGluZycsIHNvcnRhYmxlKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdhZGQtcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgZHJhZ2dpbmcub3JpZ2luYWwuZW1pdCgncmVtb3ZlLXBlbmRpbmcnLCBkcmFnZ2luZywgZHJhZ2dpbmcub3JpZ2luYWwpXHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ3VwZGF0ZS1wZW5kaW5nJylcclxuICAgICAgICAgICAgZHJhZ2dpbmcub3JpZ2luYWwuZW1pdCgndXBkYXRlLXBlbmRpbmcnKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBsYWNlIGluZGljYXRvciBpbiBhbiBzb3J0YWJsZSBsaXN0XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmdcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9wbGFjZUluU29ydGFibGVMaXN0KHNvcnRhYmxlLCBkcmFnZ2luZylcclxuICAgIHtcclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gc29ydGFibGUuZWxlbWVudFxyXG4gICAgICAgIHNvcnRhYmxlLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZHJhZ2dpbmcuaW5kaWNhdG9yKVxyXG4gICAgICAgIHNvcnRhYmxlLmluZGljYXRvciA9IGRyYWdnaW5nLmluZGljYXRvclxyXG4gICAgICAgIGNvbnN0IGxhc3RDaGlsZCA9IHRoaXMuX2dldExhc3RDaGlsZChzb3J0YWJsZSlcclxuICAgICAgICBpZiAoIWxhc3RDaGlsZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoc29ydGFibGUuaW5kaWNhdG9yKVxyXG4gICAgICAgICAgICB0aGlzLl9zZXRJY29uKGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGRyYWdnaW5nLm9mZnNldFRvcCA+PSBlbGVtZW50Lm9mZnNldFRvcCArIGVsZW1lbnQub2Zmc2V0SGVpZ2h0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKHNvcnRhYmxlLmluZGljYXRvcilcclxuICAgICAgICAgICAgICAgIHRoaXMuX3NldEljb24oZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGRyYWdnaW5nLm9mZnNldFRvcCArIGRyYWdnaW5nLm9mZnNldEhlaWdodCA8IGVsZW1lbnQub2Zmc2V0VG9wKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Lmluc2VydEJlZm9yZShzb3J0YWJsZS5pbmRpY2F0b3IsIGVsZW1lbnQuZmlyc3RDaGlsZClcclxuICAgICAgICAgICAgICAgIHRoaXMuX3NldEljb24oZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgeGExID0gZHJhZ2dpbmcub2Zmc2V0TGVmdFxyXG4gICAgICAgICAgICAgICAgY29uc3QgeWExID0gZHJhZ2dpbmcub2Zmc2V0VG9wXHJcbiAgICAgICAgICAgICAgICBjb25zdCB4YTIgPSBkcmFnZ2luZy5vZmZzZXRMZWZ0ICsgZHJhZ2dpbmcub2Zmc2V0V2lkdGhcclxuICAgICAgICAgICAgICAgIGNvbnN0IHlhMiA9IGRyYWdnaW5nLm9mZnNldFRvcCArIGRyYWdnaW5nLm9mZnNldEhlaWdodFxyXG4gICAgICAgICAgICAgICAgbGV0IGxhcmdlc3QgPSAwLCBjbG9zZXN0LCBpc0JlZm9yZSA9IHRydWUsIGluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2VhcmNoID0gW11cclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2gucHVzaChzb3J0YWJsZS5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLm9yZGVyQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoLnB1c2goc29ydGFibGUub3B0aW9ucy5vcmRlckNsYXNzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3QgZWxlbWVudHMgPSB0aGlzLl9nZXRDaGlsZHJlbihzb3J0YWJsZSwgdHJ1ZSlcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGVsZW1lbnRzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZCA9PT0gc29ydGFibGUuaW5kaWNhdG9yKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kaWNhdG9yID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwb3MgPSB0b0dsb2JhbChjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB4YjEgPSBwb3MueFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHliMSA9IHBvcy55XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeGIyID0gcG9zLnggKyBjaGlsZC5vZmZzZXRXaWR0aFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHliMiA9IHBvcy55ICsgY2hpbGQub2Zmc2V0SGVpZ2h0XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGVyY2VudGFnZSA9IHRoaXMuX3BlcmNlbnRhZ2UoeGExLCB5YTEsIHhhMiwgeWEyLCB4YjEsIHliMSwgeGIyLCB5YjIpXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBlcmNlbnRhZ2UgPiBsYXJnZXN0KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFyZ2VzdCA9IHBlcmNlbnRhZ2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VzdCA9IGNoaWxkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzQmVmb3JlID0gaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGNsb3Nlc3QgJiYgY2xvc2VzdCAhPT0gc29ydGFibGUuaW5kaWNhdG9yKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0JlZm9yZSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKHNvcnRhYmxlLmluZGljYXRvciwgY2xvc2VzdC5uZXh0U2libGluZylcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0SWNvbihkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ2RyYWdnaW5nLW9yZGVyLWNoYW5nZScsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lmluc2VydEJlZm9yZShzb3J0YWJsZS5pbmRpY2F0b3IsIGNsb3Nlc3QpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldEljb24oZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdkcmFnZ2luZy1vcmRlci1jaGFuZ2UnLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc29ydGFibGUuZWxlbWVudC5hcHBlbmRDaGlsZChkcmFnZ2luZy5pbmRpY2F0b3IpXHJcbiAgICAgICAgICAgICAgICAgICAgc29ydGFibGUuaW5kaWNhdG9yID0gZHJhZ2dpbmcuaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0SWNvbihkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgbW92ZVxyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZHJhZ01vdmUoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5kcmFnZ2luZylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5kcmFnZ2luZy5waWNrdXApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9kaXN0YW5jZSh0aGlzLmRyYWdnaW5nLnN0YXJ0LngsIHRoaXMuZHJhZ2dpbmcuc3RhcnQueSwgZS5wYWdlWCwgZS5wYWdlWSkgPiB0aGlzLm9wdGlvbnMudGhyZXNob2xkKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3BpY2t1cChlKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuc3R5bGUubGVmdCA9IGUucGFnZVggKyB0aGlzLm9mZnNldC54ICsgJ3B4J1xyXG4gICAgICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLnRvcCA9IGUucGFnZVkgKyB0aGlzLm9mZnNldC55ICsgJ3B4J1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kcmFnZ2luZy5pY29uKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLmljb24uc3R5bGUubGVmdCA9IGUucGFnZVggKyB0aGlzLm9mZnNldC54ICsgdGhpcy5kcmFnZ2luZy5vZmZzZXRXaWR0aCArICdweCdcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuaWNvbi5zdHlsZS50b3AgPSBlLnBhZ2VZICsgdGhpcy5vZmZzZXQueSArIHRoaXMuZHJhZ2dpbmcub2Zmc2V0SGVpZ2h0ICsgJ3B4J1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGxpc3QgPSBbXVxyXG4gICAgICAgICAgICBmb3IgKGxldCBzb3J0YWJsZSBvZiBTb3J0YWJsZS5saXN0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5uYW1lID09PSB0aGlzLm9wdGlvbnMubmFtZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsaXN0LnB1c2goc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmFsd2F5c0luTGlzdCB8fCB0aGlzLl9pbnNpZGUodGhpcy5kcmFnZ2luZywgdGhpcy5lbGVtZW50KSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9wbGFjZUluTGlzdCh0aGlzLCB0aGlzLmRyYWdnaW5nKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuaW5kaWNhdG9yLnJlbW92ZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmcuaWNvbilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuaWNvbi5zcmMgPSB0aGlzLm9wdGlvbnMuaWNvbnMuZGVsZXRlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2xvc2VzdCA9IHRoaXMuX2ZpbmRDbG9zZXN0KGUsIHRoaXMuZHJhZ2dpbmcsIGxpc3QpXHJcbiAgICAgICAgICAgICAgICBpZiAoY2xvc2VzdClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9wbGFjZUluTGlzdChjbG9zZXN0LCB0aGlzLmRyYWdnaW5nKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuaW5kaWNhdG9yLnJlbW92ZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmcuaWNvbilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuaWNvbi5zcmMgPSB0aGlzLm9wdGlvbnMuaWNvbnMuZGVsZXRlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIHVwXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kcmFnVXAoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5kcmFnZ2luZylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRyYWdnaW5nLnBpY2t1cClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5zdHlsZS5wb3NpdGlvbiA9ICcnXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLnpJbmRleCA9ICcnXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLmJveFNoYWRvdyA9ICcnXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLm9wYWNpdHkgPSAnJ1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5kaWNhdG9yLnBhcmVudE5vZGUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3IucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGhpcy5kcmFnZ2luZywgdGhpcy5pbmRpY2F0b3IpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5vcmlnaW5hbCA9IHRoaXMuZHJhZ2dpbmcuY3VycmVudFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5kaWNhdG9yLnJlbW92ZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3IgPSBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmcub3JpZ2luYWwgPT09IHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ3Jlb3JkZXInLCB0aGlzLmRyYWdnaW5nLCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ3VwZGF0ZScsIHRoaXMuZHJhZ2dpbmcsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcub3JpZ2luYWwuZW1pdCgncmVtb3ZlJywgdGhpcy5kcmFnZ2luZywgdGhpcy5kcmFnZ2luZy5vcmlnaW5hbClcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5vcmlnaW5hbC5lbWl0KCd1cGRhdGUnLCB0aGlzLmRyYWdnaW5nLCB0aGlzLmRyYWdnaW5nLm9yaWdpbmFsKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2FkZCcsIHRoaXMuZHJhZ2dpbmcsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgndXBkYXRlJywgdGhpcy5kcmFnZ2luZywgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdyZW1vdmUnLCB0aGlzLmRyYWdnaW5nLCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5kaWNhdG9yLnJlbW92ZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3IgPSBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5yZW1vdmUoKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcub3JpZ2luYWwgPSBudWxsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kcmFnZ2luZy5pY29uKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuaWNvbi5yZW1vdmUoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdjbGlja2VkJywgdGhpcy5kcmFnZ2luZywgdGhpcylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmRyYWdnaW5nID0gbnVsbFxyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB0aGUgZ2xvYmFsIGRlZmF1bHRzIGZvciBuZXcgU29ydGFibGUgb2JqZWN0c1xyXG4gICAgICogQHR5cGUge0RlZmF1bHRPcHRpb25zfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0IGRlZmF1bHRzKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gZGVmYXVsdHNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNyZWF0ZSBtdWx0aXBsZSBzb3J0YWJsZSBlbGVtZW50c1xyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudHNbXX0gZWxlbWVudHNcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIC0gc2VlIGNvbnN0cnVjdG9yIGZvciBvcHRpb25zXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBjcmVhdGUoZWxlbWVudHMsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdXHJcbiAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiBlbGVtZW50cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaChuZXcgU29ydGFibGUoZWxlbWVudCwgb3B0aW9ucykpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHRzXHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU29ydGFibGUiXX0=