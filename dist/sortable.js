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
     * find closest Sortable to screen location
     * @param {UIEvent} e
     * @param {HTMLElement} dragging
     * @param {Sortable[]} list of related Sortables
     * @private
     */
    _findClosest(e, dragging, list) {
        function inside(element) {
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

        let min = Infinity,
            found;
        for (let related of list) {
            if (inside(related.element)) {
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
                this._placeInList(this, this.dragging);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3J0YWJsZS5qcyJdLCJuYW1lcyI6WyJFdmVudHMiLCJyZXF1aXJlIiwidG9HbG9iYWwiLCJkZWZhdWx0cyIsIlNvcnRhYmxlIiwiY29uc3RydWN0b3IiLCJlbGVtZW50Iiwib3B0aW9ucyIsIm9wdGlvbiIsInNvcnRhYmxlIiwiZWxlbWVudHMiLCJfZ2V0Q2hpbGRyZW4iLCJjaGlsZCIsImRyYWdDbGFzcyIsImNsYXNzTmFtZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJlIiwiX2RyYWdTdGFydCIsImNoaWxkcmVuU3R5bGVzIiwic3R5bGUiLCJvcmlnaW5hbCIsImRvY3VtZW50IiwiYm9keSIsIl9kcmFnTW92ZSIsIl9kcmFnVXAiLCJsaXN0IiwicHVzaCIsImRyYWdnaW5nIiwiY3VycmVudFRhcmdldCIsInBpY2t1cCIsInN0YXJ0IiwieCIsInBhZ2VYIiwieSIsInBhZ2VZIiwiY3Vyc29yIiwicHJldmVudERlZmF1bHQiLCJfcGlja3VwIiwiaW5kaWNhdG9yIiwiY2xvbmVOb2RlIiwicG9zIiwicG9zaXRpb24iLCJvZmZzZXQiLCJsZWZ0IiwidG9wIiwiZHJhZ1N0eWxlIiwicGFyZW50Tm9kZSIsImluc2VydEJlZm9yZSIsImFwcGVuZENoaWxkIiwidXNlSWNvbnMiLCJpbWFnZSIsIkltYWdlIiwic3JjIiwiaWNvbnMiLCJyZW9yZGVyIiwidHJhbnNmb3JtIiwib2Zmc2V0V2lkdGgiLCJvZmZzZXRIZWlnaHQiLCJpY29uIiwiZW1pdCIsIl9kaXN0YW5jZSIsIngxIiwieTEiLCJ4MiIsInkyIiwiTWF0aCIsInNxcnQiLCJwb3ciLCJfZGlzdGFuY2VUb0Nsb3Nlc3RDb3JuZXIiLCJ0b3BMZWZ0Iiwib2Zmc2V0TGVmdCIsIm9mZnNldFRvcCIsInRvcFJpZ2h0IiwiYm90dG9tTGVmdCIsImJvdHRvbVJpZ2h0IiwibWluIiwiX2ZpbmRDbG9zZXN0IiwiaW5zaWRlIiwidzEiLCJoMSIsIncyIiwiaDIiLCJJbmZpbml0eSIsImZvdW5kIiwicmVsYXRlZCIsImFsd2F5c0luTGlzdCIsImNhbGN1bGF0ZSIsIl9wZXJjZW50YWdlIiwieGExIiwieWExIiwieGEyIiwieWEyIiwieGIxIiwieWIxIiwieGIyIiwieWIyIiwic2EiLCJzYiIsInNpIiwibWF4IiwidW5pb24iLCJfcGxhY2VJbkxpc3QiLCJzb3J0IiwiX3BsYWNlSW5Tb3J0YWJsZUxpc3QiLCJfcGxhY2VJbk9yZGVyZWRMaXN0IiwiX3RyYXZlcnNlQ2hpbGRyZW4iLCJiYXNlIiwic2VhcmNoIiwicmVzdWx0cyIsImNoaWxkcmVuIiwibGVuZ3RoIiwiaW5kZXhPZiIsIm9yZGVyIiwiZGVlcFNlYXJjaCIsIm9yZGVyQ2xhc3MiLCJpZCIsIm9yZGVySWQiLCJyZW1vdmUiLCJkcmFnT3JkZXIiLCJnZXRBdHRyaWJ1dGUiLCJvcmRlcklkSXNOdW1iZXIiLCJwYXJzZUZsb2F0IiwicmV2ZXJzZU9yZGVyIiwiaSIsImNoaWxkRHJhZ09yZGVyIiwib3JkZXJJc051bWJlciIsIl9zZXRJY29uIiwiX2dldExhc3RDaGlsZCIsIm1vdmUiLCJjdXJyZW50IiwibGFzdENoaWxkIiwiZmlyc3RDaGlsZCIsImxhcmdlc3QiLCJjbG9zZXN0IiwiaXNCZWZvcmUiLCJwZXJjZW50YWdlIiwibmV4dFNpYmxpbmciLCJ0aHJlc2hvbGQiLCJuYW1lIiwiZGVsZXRlIiwic3RvcFByb3BhZ2F0aW9uIiwiekluZGV4IiwiYm94U2hhZG93Iiwib3BhY2l0eSIsImNyZWF0ZSIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiJBQUFBLE1BQU1BLFNBQVNDLFFBQVEsZUFBUixDQUFmOztBQUVBLE1BQU1DLFdBQVdELFFBQVEsWUFBUixDQUFqQjtBQUNBLE1BQU1FLFdBQVdGLFFBQVEsV0FBUixDQUFqQjs7QUFFQSxNQUFNRyxRQUFOLFNBQXVCSixNQUF2QixDQUNBO0FBQ0k7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNkJBSyxnQkFBWUMsT0FBWixFQUFxQkMsT0FBckIsRUFDQTtBQUNJO0FBQ0EsYUFBS0EsT0FB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LEdBQWdCLElBQWhCO0FBQ0FYLGNBQUVvQixjQUFGO0FBQ0g7QUFDSjs7QUFFRDs7OztBQUlBLGVBQVdqQyxRQUFYLEdBQ0E7QUFDSSxlQUFPQSxRQUFQO0FBQ0g7O0FBRUQ7Ozs7O0FBS0EsV0FBTzZJLE1BQVAsQ0FBY3RJLFFBQWQsRUFBd0JILE9BQXhCLEVBQ0E7QUFDSSxjQUFNcUcsVUFBVSxFQUFoQjtBQUNBLGFBQUssSUFBSXRHLE9BQVQsSUFBb0JJLFFBQXBCLEVBQ0E7QUFDSWtHLG9CQUFRbEYsSUFBUixDQUFhLElBQUl0QixRQUFKLENBQWFFLE9BQWIsRUFBc0JDLE9BQXRCLENBQWI7QUFDSDtBQUNELGVBQU9xRyxPQUFQO0FBQ0g7QUFscEJMOztBQXFwQkFxQyxPQUFPQyxPQUFQLEdBQWlCOUksUUFBakIiLCJmaWxlIjoic29ydGFibGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBFdmVudHMgPSByZXF1aXJlKCdldmVudGVtaXR0ZXIzJylcclxuXHJcbmNvbnN0IHRvR2xvYmFsID0gcmVxdWlyZSgnLi90b0dsb2JhbCcpXHJcbmNvbnN0IGRlZmF1bHRzID0gcmVxdWlyZSgnLi9vcHRpb25zJylcclxuXHJcbmNsYXNzIFNvcnRhYmxlIGV4dGVuZHMgRXZlbnRzXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIHNvcnRhYmxlIGxpc3RcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5uYW1lPXNvcnRhYmxlXSBkcmFnZ2luZyBpcyBhbGxvd2VkIGJldHdlZW4gU29ydGFibGVzIHdpdGggdGhlIHNhbWUgbmFtZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5zb3J0PXRydWVdIGFsbG93IHNvcnRpbmcgd2l0aGluIGxpc3RcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5kcmFnQ2xhc3NdIGlmIHNldCB0aGVuIGRyYWcgb25seSBpdGVtcyB3aXRoIHRoaXMgY2xhc3NOYW1lIHVuZGVyIGVsZW1lbnQsIG90aGVyd2lzZSB1c2UgYWxsIGNoaWxkcmVuXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmRlZXBTZWFyY2hdIGlmIGRyYWdDbGFzcyBhbmQgZGVlcFNlYXJjaCB0aGVuIHNlYXJjaCBhbGwgZGVzY2VuZGVudHMgb2YgZWxlbWVudCBmb3IgZHJhZ0NsYXNzXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMub3JkZXJJZD1kYXRhLW9yZGVyXSBmb3Igbm9uLXNvcnRpbmcgbGlzdHMsIHVzZSB0aGlzIGRhdGEgaWQgdG8gZmlndXJlIG91dCBzb3J0IG9yZGVyXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLm9yZGVySWRJc051bWJlcj10cnVlXSB1c2UgcGFyc2VJbnQgb24gb3B0aW9ucy5vcmRlcklkIHRvIHByb3Blcmx5IHNvcnQgbnVtYmVyc1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnJldmVyc2VPcmRlcl0gcmV2ZXJzZSBzb3J0IHRoZSBvcmRlcklkXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmFsd2F5c0luTGlzdD10cnVlXSBwbGFjZSBlbGVtZW50IGluc2lkZSBjbG9zZXN0IHJlbGF0ZWQgU29ydGFibGUgb2JqZWN0OyBpZiBzZXQgdG8gZmFsc2UgdGhlbiB0aGUgb2JqZWN0IGlzIHJlbW92ZWQgaWYgZHJvcHBlZCBvdXRzaWRlIHJlbGF0ZWQgc29ydGFibGVzXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnMuY2hpbGRyZW5TdHlsZXNdIHN0eWxlcyB0byBhcHBseSB0byBjaGlsZHJlbiBlbGVtZW50cyBvZiBTb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zLmljb25zXSBkZWZhdWx0IHNldCBvZiBpY29uc1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmljb25zLnJlb3JkZXJdIHNvdXJjZSBvZiBpbWFnZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmljb25zLm1vdmVdIHNvdXJjZSBvZiBpbWFnZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmljb25zLmNvcHldIHNvdXJjZSBvZiBpbWFnZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmljb25zLmRlbGV0ZV0gc291cmNlIG9mIGltYWdlXHJcbiAgICAgKiBAZmlyZXMgY2xpY2tlZFxyXG4gICAgICogQGZpcmVzIHBpY2t1cFxyXG4gICAgICogQGZpcmVzIG9yZGVyXHJcbiAgICAgKiBAZmlyZXMgYWRkXHJcbiAgICAgKiBAZmlyZXMgcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgdXBkYXRlXHJcbiAgICAgKiBAZmlyZXMgb3JkZXItcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIGFkZC1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgcmVtb3ZlLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyB1cGRhdGUtcGVuZGluZ1xyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyKClcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgZm9yIChsZXQgb3B0aW9uIGluIGRlZmF1bHRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zW29wdGlvbl0gPSB0eXBlb2YgdGhpcy5vcHRpb25zW29wdGlvbl0gIT09ICd1bmRlZmluZWQnID8gb3B0aW9uc1tvcHRpb25dIDogZGVmYXVsdHNbb3B0aW9uXVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnNvcnRhYmxlID0gdGhpc1xyXG4gICAgICAgIGNvbnN0IGVsZW1lbnRzID0gdGhpcy5fZ2V0Q2hpbGRyZW4odGhpcylcclxuICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBlbGVtZW50cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5vcHRpb25zLmRyYWdDbGFzcyB8fCBjaGlsZC5jbGFzc05hbWUgPT09IHRoaXMub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChlKSA9PiB0aGlzLl9kcmFnU3RhcnQoZSkpXHJcbiAgICAgICAgICAgICAgICBjaGlsZC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgKGUpID0+IHRoaXMuX2RyYWdTdGFydChlKSlcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IG9wdGlvbiBpbiB0aGlzLm9wdGlvbnMuY2hpbGRyZW5TdHlsZXMpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQuc3R5bGVbb3B0aW9uXSA9IHRoaXMub3B0aW9ucy5jaGlsZHJlblN0eWxlc1tvcHRpb25dXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5vcmlnaW5hbCA9IHRoaXNcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIChlKSA9PiB0aGlzLl9kcmFnTW92ZShlKSlcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIChlKSA9PiB0aGlzLl9kcmFnTW92ZShlKSlcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNodXAnLCAoZSkgPT4gdGhpcy5fZHJhZ1VwKGUpKVxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hjYW5jZWwnLCAoZSkgPT4gdGhpcy5fZHJhZ1VwKGUpKVxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIChlKSA9PiB0aGlzLl9kcmFnVXAoZSkpXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWNhbmNlbCcsIChlKSA9PiB0aGlzLl9kcmFnVXAoZSkpXHJcblxyXG4gICAgICAgIGlmICghU29ydGFibGUubGlzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFNvcnRhYmxlLmxpc3QgPSBbXVxyXG4gICAgICAgIH1cclxuICAgICAgICBTb3J0YWJsZS5saXN0LnB1c2godGhpcylcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHN0YXJ0IGRyYWdcclxuICAgICAqIEBwYXJhbSB7VUlFdmVudH0gZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2RyYWdTdGFydChlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcgPSBlLmN1cnJlbnRUYXJnZXRcclxuICAgICAgICB0aGlzLmRyYWdnaW5nLnBpY2t1cCA9IGZhbHNlXHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZy5zdGFydCA9IHsgeDogZS5wYWdlWCwgeTogZS5wYWdlWSB9XHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZy5zdHlsZS5jdXJzb3IgPSAnbm8tY3Vyc29yJ1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGlja3VwIGFuZCBjbG9uZSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9waWNrdXAoZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLmluZGljYXRvciA9IHRoaXMuZHJhZ2dpbmcuY2xvbmVOb2RlKHRydWUpXHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZy5pbmRpY2F0b3IgPSB0aGlzLmluZGljYXRvclxyXG4gICAgICAgIGNvbnN0IHBvcyA9IHRvR2xvYmFsKHRoaXMuZHJhZ2dpbmcpXHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZy5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcclxuICAgICAgICB0aGlzLm9mZnNldCA9IHsgeDogcG9zLnggLSBlLnBhZ2VYLCB5OiBwb3MueSAtIGUucGFnZVkgfVxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcuc3R5bGUubGVmdCA9IHBvcy54ICsgJ3B4J1xyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcuc3R5bGUudG9wID0gcG9zLnkgKyAncHgnXHJcbiAgICAgICAgZm9yIChsZXQgb3B0aW9uIGluIHRoaXMub3B0aW9ucy5kcmFnU3R5bGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlW29wdGlvbl0gPSB0aGlzLm9wdGlvbnMuZHJhZ1N0eWxlW29wdGlvbl1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZy5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0aGlzLmluZGljYXRvciwgdGhpcy5kcmFnZ2luZylcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuZHJhZ2dpbmcpXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy51c2VJY29ucylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGltYWdlID0gbmV3IEltYWdlKClcclxuICAgICAgICAgICAgaW1hZ2Uuc3JjID0gdGhpcy5vcHRpb25zLmljb25zLnJlb3JkZXJcclxuICAgICAgICAgICAgaW1hZ2Uuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUoLTUwJSwgLTUwJSknXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLmxlZnQgPSBwb3MueCArIHRoaXMuZHJhZ2dpbmcub2Zmc2V0V2lkdGggKyAncHgnXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLnRvcCA9IHBvcy55ICsgdGhpcy5kcmFnZ2luZy5vZmZzZXRIZWlnaHQgKyAncHgnXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaW1hZ2UpXHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuaWNvbiA9IGltYWdlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcucGlja3VwID0gdHJ1ZVxyXG4gICAgICAgIHRoaXMuZW1pdCgncGlja3VwJywgdGhpcy5kcmFnZ2luZywgdGhpcylcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIG1lYXN1cmUgZGlzdGFuY2UgYmV0d2VlbiB0d28gcG9pbnRzXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geDFcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5MVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHgyXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geTJcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kaXN0YW5jZSh4MSwgeTEsIHgyLCB5MilcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KHgxIC0geDIsIDIpICsgTWF0aC5wb3coeTEgLSB5MiwgMikpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmaW5kIGNsb3Nlc3QgZGlzdGFuY2UgZnJvbSBVSUV2ZW50IHRvIGEgY29ybmVyIG9mIGFuIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7SFRNTFVMaXN0RWxlbWVudH0gZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2Rpc3RhbmNlVG9DbG9zZXN0Q29ybmVyKGUsIGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgdG9wTGVmdCA9IHRoaXMuX2Rpc3RhbmNlKGUucGFnZVgsIGUucGFnZVksIGVsZW1lbnQub2Zmc2V0TGVmdCwgZWxlbWVudC5vZmZzZXRUb3ApXHJcbiAgICAgICAgY29uc3QgdG9wUmlnaHQgPSB0aGlzLl9kaXN0YW5jZShlLnBhZ2VYLCBlLnBhZ2VZLCBlbGVtZW50Lm9mZnNldExlZnQgKyBlbGVtZW50Lm9mZnNldFdpZHRoLCBlbGVtZW50Lm9mZnNldFRvcClcclxuICAgICAgICBjb25zdCBib3R0b21MZWZ0ID0gdGhpcy5fZGlzdGFuY2UoZS5wYWdlWCwgZS5wYWdlWSwgZWxlbWVudC5vZmZzZXRMZWZ0LCBlbGVtZW50Lm9mZnNldFRvcCArIGVsZW1lbnQub2Zmc2V0SGVpZ2h0KVxyXG4gICAgICAgIGNvbnN0IGJvdHRvbVJpZ2h0ID0gdGhpcy5fZGlzdGFuY2UoZS5wYWdlWCwgZS5wYWdlWSwgZWxlbWVudC5vZmZzZXRMZWZ0ICsgZWxlbWVudC5vZmZzZXRXaWR0aCwgZWxlbWVudC5vZmZzZXRUb3AgKyBlbGVtZW50Lm9mZnNldEhlaWdodClcclxuICAgICAgICByZXR1cm4gTWF0aC5taW4odG9wTGVmdCwgdG9wUmlnaHQsIGJvdHRvbUxlZnQsIGJvdHRvbVJpZ2h0KVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZmluZCBjbG9zZXN0IFNvcnRhYmxlIHRvIHNjcmVlbiBsb2NhdGlvblxyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZVtdfSBsaXN0IG9mIHJlbGF0ZWQgU29ydGFibGVzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZmluZENsb3Nlc3QoZSwgZHJhZ2dpbmcsIGxpc3QpXHJcbiAgICB7XHJcbiAgICAgICAgZnVuY3Rpb24gaW5zaWRlKGVsZW1lbnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCB4MSA9IGRyYWdnaW5nLm9mZnNldExlZnRcclxuICAgICAgICAgICAgY29uc3QgeTEgPSBkcmFnZ2luZy5vZmZzZXRUb3BcclxuICAgICAgICAgICAgY29uc3QgdzEgPSBkcmFnZ2luZy5vZmZzZXRXaWR0aFxyXG4gICAgICAgICAgICBjb25zdCBoMSA9IGRyYWdnaW5nLm9mZnNldEhlaWdodFxyXG4gICAgICAgICAgICBjb25zdCBwb3MgPSB0b0dsb2JhbChlbGVtZW50KVxyXG4gICAgICAgICAgICBjb25zdCB4MiA9IHBvcy54XHJcbiAgICAgICAgICAgIGNvbnN0IHkyID0gcG9zLnlcclxuICAgICAgICAgICAgY29uc3QgdzIgPSBlbGVtZW50Lm9mZnNldFdpZHRoXHJcbiAgICAgICAgICAgIGNvbnN0IGgyID0gZWxlbWVudC5vZmZzZXRIZWlnaHRcclxuICAgICAgICAgICAgcmV0dXJuIHgxIDwgeDIgKyB3MiAmJiB4MSArIHcxID4geDIgJiYgeTEgPCB5MiArIGgyICYmIHkxICsgaDEgPiB5MlxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG1pbiA9IEluZmluaXR5LCBmb3VuZFxyXG4gICAgICAgIGZvciAobGV0IHJlbGF0ZWQgb2YgbGlzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChpbnNpZGUocmVsYXRlZC5lbGVtZW50KSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlbGF0ZWRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChyZWxhdGVkLm9wdGlvbnMuYWx3YXlzSW5MaXN0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjYWxjdWxhdGUgPSB0aGlzLl9kaXN0YW5jZVRvQ2xvc2VzdENvcm5lcihlLCByZWxhdGVkLmVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICBpZiAoY2FsY3VsYXRlIDwgbWluKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG1pbiA9IGNhbGN1bGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gcmVsYXRlZFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmb3VuZFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhhMVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlhMVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhhMlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhhMlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhiMVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHliMVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhiMlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHliMlxyXG4gICAgICogY2FsY3VsYXRlIHBlcmNlbnRhZ2Ugb2Ygb3ZlcmxhcCBiZXR3ZWVuIHR3byBib3hlc1xyXG4gICAgICogZnJvbSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjEyMjAwMDQvMTk1NTk5N1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BlcmNlbnRhZ2UoeGExLCB5YTEsIHhhMiwgeWEyLCB4YjEsIHliMSwgeGIyLCB5YjIpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3Qgc2EgPSAoeGEyIC0geGExKSAqICh5YTIgLSB5YTEpXHJcbiAgICAgICAgY29uc3Qgc2IgPSAoeGIyIC0geGIxKSAqICh5YjIgLSB5YjEpXHJcbiAgICAgICAgY29uc3Qgc2kgPSBNYXRoLm1heCgwLCBNYXRoLm1pbih4YTIsIHhiMikgLSBNYXRoLm1heCh4YTEsIHhiMSkpICogTWF0aC5tYXgoMCwgTWF0aC5taW4oeWEyLCB5YjIpIC0gTWF0aC5tYXgoeWExLCB5YjEpKVxyXG4gICAgICAgIGNvbnN0IHVuaW9uID0gc2EgKyBzYiAtIHNpXHJcbiAgICAgICAgcmV0dXJuIHNpIC8gdW5pb25cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBsYWNlIGluZGljYXRvciBpbiB0aGUgc29ydGFibGUgbGlzdCBhY2NvcmRpbmcgdG8gb3B0aW9ucy5zb3J0XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmcgZWxlbWVudFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BsYWNlSW5MaXN0KHNvcnRhYmxlLCBkcmFnZ2luZylcclxuICAgIHtcclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5zb3J0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fcGxhY2VJblNvcnRhYmxlTGlzdChzb3J0YWJsZSwgZHJhZ2dpbmcpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuX3BsYWNlSW5PcmRlcmVkTGlzdChzb3J0YWJsZSwgZHJhZ2dpbmcpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIF90cmF2ZXJzZUNoaWxkcmVuKGJhc2UsIHNlYXJjaCwgcmVzdWx0cylcclxuICAgIHtcclxuICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBiYXNlLmNoaWxkcmVuKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHNlYXJjaC5sZW5ndGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzZWFyY2guaW5kZXhPZihjaGlsZC5jbGFzc05hbWUpICE9PSAtMSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goY2hpbGQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goY2hpbGQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fdHJhdmVyc2VDaGlsZHJlbihjaGlsZCwgc2VhcmNoLCByZXN1bHRzKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGZpbmQgY2hpbGRyZW4gaW4gZGl2XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3JkZXJdIHNlYXJjaCBmb3IgZHJhZ09yZGVyIGFzIHdlbGxcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9nZXRDaGlsZHJlbihzb3J0YWJsZSwgb3JkZXIpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMuZGVlcFNlYXJjaClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBzZWFyY2ggPSBbXVxyXG4gICAgICAgICAgICBpZiAob3JkZXIgJiYgc29ydGFibGUub3B0aW9ucy5vcmRlckNsYXNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoLnB1c2goc29ydGFibGUub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAob3JkZXIgJiYgc29ydGFibGUub3B0aW9ucy5vcmRlckNsYXNzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaC5wdXNoKHNvcnRhYmxlLm9wdGlvbnMub3JkZXJDbGFzcylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICghb3JkZXIgJiYgc29ydGFibGUub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNlYXJjaC5wdXNoKHNvcnRhYmxlLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXVxyXG4gICAgICAgICAgICB0aGlzLl90cmF2ZXJzZUNoaWxkcmVuKHNvcnRhYmxlLmVsZW1lbnQsIHNlYXJjaCwgcmVzdWx0cylcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHNcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbGlzdCA9IFtdXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBzb3J0YWJsZS5lbGVtZW50LmNoaWxkcmVuKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZC5jbGFzc05hbWUgPT09IHNvcnRhYmxlLm9wdGlvbnMuZHJhZ0NsYXNzIHx8ICgob3JkZXIgfHwgIXNvcnRhYmxlLm9wdGlvbnMub3JkZXJDbGFzcykgfHwgKG9yZGVyICYmIHNvcnRhYmxlLm9wdGlvbnMub3JkZXJDbGFzcyAmJiBjaGlsZC5jbGFzc05hbWUgPT09IHNvcnRhYmxlLm9wdGlvbnMub3JkZXJDbGFzcykpKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGlzdC5wdXNoKGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBsaXN0XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc29ydGFibGUuZWxlbWVudC5jaGlsZHJlblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGxhY2UgaW5kaWNhdG9yIGluIGFuIG9yZGVyZWQgbGlzdFxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGxhY2VJbk9yZGVyZWRMaXN0KHNvcnRhYmxlLCBkcmFnZ2luZylcclxuICAgIHtcclxuICAgICAgICBjb25zdCBpZCA9IHNvcnRhYmxlLm9wdGlvbnMub3JkZXJJZFxyXG4gICAgICAgIGRyYWdnaW5nLmluZGljYXRvci5yZW1vdmUoKVxyXG4gICAgICAgIHNvcnRhYmxlLmluZGljYXRvciA9IGRyYWdnaW5nLmluZGljYXRvclxyXG4gICAgICAgIGxldCBkcmFnT3JkZXIgPSBzb3J0YWJsZS5pbmRpY2F0b3IuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgIGRyYWdPcmRlciA9IHNvcnRhYmxlLm9wdGlvbnMub3JkZXJJZElzTnVtYmVyID8gcGFyc2VGbG9hdChkcmFnT3JkZXIpIDogZHJhZ09yZGVyXHJcbiAgICAgICAgbGV0IGZvdW5kXHJcbiAgICAgICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLl9nZXRDaGlsZHJlbihzb3J0YWJsZSwgdHJ1ZSlcclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5yZXZlcnNlT3JkZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gY2hpbGRyZW5baV1cclxuICAgICAgICAgICAgICAgIGxldCBjaGlsZERyYWdPcmRlciA9IGNoaWxkLmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICAgICAgICAgIGNoaWxkRHJhZ09yZGVyID0gc29ydGFibGUub3B0aW9ucy5vcmRlcklzTnVtYmVyID8gcGFyc2VGbG9hdChjaGlsZERyYWdPcmRlcikgOiBjaGlsZERyYWdPcmRlclxyXG4gICAgICAgICAgICAgICAgaWYgKGRyYWdPcmRlciA+IGNoaWxkRHJhZ09yZGVyKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHNvcnRhYmxlLmluZGljYXRvciwgY2hpbGQpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0SWNvbihkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBjaGlsZHJlbilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNoaWxkRHJhZ09yZGVyID0gY2hpbGQuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgICAgICAgICAgY2hpbGREcmFnT3JkZXIgPSBzb3J0YWJsZS5vcHRpb25zLm9yZGVySXNOdW1iZXIgPyBwYXJzZUZsb2F0KGNoaWxkRHJhZ09yZGVyKSA6IGNoaWxkRHJhZ09yZGVyXHJcbiAgICAgICAgICAgICAgICBpZiAoZHJhZ09yZGVyIDwgY2hpbGREcmFnT3JkZXIpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoc29ydGFibGUuaW5kaWNhdG9yLCBjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRJY29uKGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghZm91bmQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbGVtZW50LmFwcGVuZENoaWxkKHNvcnRhYmxlLmluZGljYXRvcilcclxuICAgICAgICAgICAgdGhpcy5fc2V0SWNvbihkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZmluZCBsYXN0IGNoaWxkIHRoYXQgaXMgb2YgdHlwZSBkcmFnQ2xhc3MgKGlmIHNldClcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZ2V0TGFzdENoaWxkKHNvcnRhYmxlKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLmRlZXBTZWFyY2gpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBzZWFyY2ggPSBbXVxyXG4gICAgICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNlYXJjaC5wdXNoKHNvcnRhYmxlLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXVxyXG4gICAgICAgICAgICB0aGlzLl90cmF2ZXJzZUNoaWxkcmVuKHNvcnRhYmxlLmVsZW1lbnQsIHNlYXJjaCwgcmVzdWx0cylcclxuICAgICAgICAgICAgaWYgKHJlc3VsdHMubGVuZ3RoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0c1tyZXN1bHRzLmxlbmd0aCAtIDFdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IHNvcnRhYmxlLmVsZW1lbnQuY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBzb3J0YWJsZS5lbGVtZW50LmNoaWxkcmVuW2ldXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkLmNsYXNzTmFtZSA9PT0gc29ydGFibGUub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2hpbGRcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHNvcnRhYmxlLmVsZW1lbnQuY2hpbGRyZW4ubGVuZ3RoKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzb3J0YWJsZS5lbGVtZW50LmNoaWxkcmVuW3NvcnRhYmxlLmVsZW1lbnQuY2hpbGRyZW4ubGVuZ3RoIC0gMV1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2V0IGljb24gaWYgYXZhaWxhYmxlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqL1xyXG4gICAgX3NldEljb24oZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChkcmFnZ2luZy5pY29uKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZHJhZ2dpbmcuaWNvbi5zcmMgPSBkcmFnZ2luZy5vcmlnaW5hbCA9PT0gc29ydGFibGUgPyBzb3J0YWJsZS5vcHRpb25zLmljb25zLnJlb3JkZXIgOiBzb3J0YWJsZS5vcHRpb25zLmljb25zLm1vdmVcclxuICAgICAgICAgICAgZHJhZ2dpbmcuY3VycmVudCA9IHNvcnRhYmxlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkcmFnZ2luZy5vcmlnaW5hbCA9PT0gc29ydGFibGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdyZW9yZGVyLXBlbmRpbmcnLCBkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ3VwZGF0ZS1wZW5kaW5nJywgc29ydGFibGUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ2FkZC1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICBkcmFnZ2luZy5vcmlnaW5hbC5lbWl0KCdyZW1vdmUtcGVuZGluZycsIGRyYWdnaW5nLCBkcmFnZ2luZy5vcmlnaW5hbClcclxuICAgICAgICAgICAgc29ydGFibGUuZW1pdCgndXBkYXRlLXBlbmRpbmcnKVxyXG4gICAgICAgICAgICBkcmFnZ2luZy5vcmlnaW5hbC5lbWl0KCd1cGRhdGUtcGVuZGluZycpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGxhY2UgaW5kaWNhdG9yIGluIGFuIHNvcnRhYmxlIGxpc3RcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BsYWNlSW5Tb3J0YWJsZUxpc3Qoc29ydGFibGUsIGRyYWdnaW5nKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBzb3J0YWJsZS5lbGVtZW50XHJcbiAgICAgICAgc29ydGFibGUuZWxlbWVudC5hcHBlbmRDaGlsZChkcmFnZ2luZy5pbmRpY2F0b3IpXHJcbiAgICAgICAgc29ydGFibGUuaW5kaWNhdG9yID0gZHJhZ2dpbmcuaW5kaWNhdG9yXHJcbiAgICAgICAgY29uc3QgbGFzdENoaWxkID0gdGhpcy5fZ2V0TGFzdENoaWxkKHNvcnRhYmxlKVxyXG4gICAgICAgIGlmICghbGFzdENoaWxkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChzb3J0YWJsZS5pbmRpY2F0b3IpXHJcbiAgICAgICAgICAgIHRoaXMuX3NldEljb24oZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcub2Zmc2V0VG9wID49IGVsZW1lbnQub2Zmc2V0VG9wICsgZWxlbWVudC5vZmZzZXRIZWlnaHQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoc29ydGFibGUuaW5kaWNhdG9yKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0SWNvbihkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoZHJhZ2dpbmcub2Zmc2V0VG9wICsgZHJhZ2dpbmcub2Zmc2V0SGVpZ2h0IDwgZWxlbWVudC5vZmZzZXRUb3ApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKHNvcnRhYmxlLmluZGljYXRvciwgZWxlbWVudC5maXJzdENoaWxkKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0SWNvbihkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB4YTEgPSBkcmFnZ2luZy5vZmZzZXRMZWZ0XHJcbiAgICAgICAgICAgICAgICBjb25zdCB5YTEgPSBkcmFnZ2luZy5vZmZzZXRUb3BcclxuICAgICAgICAgICAgICAgIGNvbnN0IHhhMiA9IGRyYWdnaW5nLm9mZnNldExlZnQgKyBkcmFnZ2luZy5vZmZzZXRXaWR0aFxyXG4gICAgICAgICAgICAgICAgY29uc3QgeWEyID0gZHJhZ2dpbmcub2Zmc2V0VG9wICsgZHJhZ2dpbmcub2Zmc2V0SGVpZ2h0XHJcbiAgICAgICAgICAgICAgICBsZXQgbGFyZ2VzdCA9IDAsIGNsb3Nlc3QsIGlzQmVmb3JlID0gdHJ1ZSwgaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICBjb25zdCBzZWFyY2ggPSBbXVxyXG4gICAgICAgICAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaC5wdXNoKHNvcnRhYmxlLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMub3JkZXJDbGFzcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2gucHVzaChzb3J0YWJsZS5vcHRpb25zLm9yZGVyQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCBlbGVtZW50cyA9IHRoaXMuX2dldENoaWxkcmVuKHNvcnRhYmxlLCB0cnVlKVxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgZWxlbWVudHMpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkID09PSBzb3J0YWJsZS5pbmRpY2F0b3IpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRpY2F0b3IgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvcyA9IHRvR2xvYmFsKGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHhiMSA9IHBvcy54XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeWIxID0gcG9zLnlcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB4YjIgPSBwb3MueCArIGNoaWxkLm9mZnNldFdpZHRoXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeWIyID0gcG9zLnkgKyBjaGlsZC5vZmZzZXRIZWlnaHRcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwZXJjZW50YWdlID0gdGhpcy5fcGVyY2VudGFnZSh4YTEsIHlhMSwgeGEyLCB5YTIsIHhiMSwgeWIxLCB4YjIsIHliMilcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGVyY2VudGFnZSA+IGxhcmdlc3QpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJnZXN0ID0gcGVyY2VudGFnZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9zZXN0ID0gY2hpbGRcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXNCZWZvcmUgPSBpbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoY2xvc2VzdCAmJiBjbG9zZXN0ICE9PSBzb3J0YWJsZS5pbmRpY2F0b3IpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzQmVmb3JlKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5pbnNlcnRCZWZvcmUoc29ydGFibGUuaW5kaWNhdG9yLCBjbG9zZXN0Lm5leHRTaWJsaW5nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRJY29uKGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnZHJhZ2dpbmctb3JkZXItY2hhbmdlJywgc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKHNvcnRhYmxlLmluZGljYXRvciwgY2xvc2VzdClcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0SWNvbihkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ2RyYWdnaW5nLW9yZGVyLWNoYW5nZScsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbGVtZW50LmFwcGVuZENoaWxkKGRyYWdnaW5nLmluZGljYXRvcilcclxuICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZS5pbmRpY2F0b3IgPSBkcmFnZ2luZy5pbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRJY29uKGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSBtb3ZlXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kcmFnTW92ZShlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLmRyYWdnaW5nKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmRyYWdnaW5nLnBpY2t1cClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2Rpc3RhbmNlKHRoaXMuZHJhZ2dpbmcuc3RhcnQueCwgdGhpcy5kcmFnZ2luZy5zdGFydC55LCBlLnBhZ2VYLCBlLnBhZ2VZKSA+IHRoaXMub3B0aW9ucy50aHJlc2hvbGQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGlja3VwKGUpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5zdHlsZS5sZWZ0ID0gZS5wYWdlWCArIHRoaXMub2Zmc2V0LnggKyAncHgnXHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuc3R5bGUudG9wID0gZS5wYWdlWSArIHRoaXMub2Zmc2V0LnkgKyAncHgnXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRyYWdnaW5nLmljb24pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuaWNvbi5zdHlsZS5sZWZ0ID0gZS5wYWdlWCArIHRoaXMub2Zmc2V0LnggKyB0aGlzLmRyYWdnaW5nLm9mZnNldFdpZHRoICsgJ3B4J1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5pY29uLnN0eWxlLnRvcCA9IGUucGFnZVkgKyB0aGlzLm9mZnNldC55ICsgdGhpcy5kcmFnZ2luZy5vZmZzZXRIZWlnaHQgKyAncHgnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgbGlzdCA9IFtdXHJcbiAgICAgICAgICAgIGZvciAobGV0IHNvcnRhYmxlIG9mIFNvcnRhYmxlLmxpc3QpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLm5hbWUgPT09IHRoaXMub3B0aW9ucy5uYW1lKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGxpc3QucHVzaChzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3BsYWNlSW5MaXN0KHRoaXMsIHRoaXMuZHJhZ2dpbmcpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjbG9zZXN0ID0gdGhpcy5fZmluZENsb3Nlc3QoZSwgdGhpcy5kcmFnZ2luZywgbGlzdClcclxuICAgICAgICAgICAgICAgIGlmIChjbG9zZXN0KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3BsYWNlSW5MaXN0KGNsb3Nlc3QsIHRoaXMuZHJhZ2dpbmcpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5pbmRpY2F0b3IucmVtb3ZlKClcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5kcmFnZ2luZy5pY29uKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5pY29uLnNyYyA9IHRoaXMub3B0aW9ucy5pY29ucy5kZWxldGVcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgdXBcclxuICAgICAqIEBwYXJhbSB7VUlFdmVudH0gZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2RyYWdVcChlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLmRyYWdnaW5nKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmcucGlja3VwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLnBvc2l0aW9uID0gJydcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuc3R5bGUuekluZGV4ID0gJydcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuc3R5bGUuYm94U2hhZG93ID0gJydcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuc3R5bGUub3BhY2l0eSA9ICcnXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pbmRpY2F0b3IucGFyZW50Tm9kZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGljYXRvci5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0aGlzLmRyYWdnaW5nLCB0aGlzLmluZGljYXRvcilcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLm9yaWdpbmFsID0gdGhpcy5kcmFnZ2luZy5jdXJyZW50XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3IucmVtb3ZlKClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGljYXRvciA9IG51bGxcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5kcmFnZ2luZy5vcmlnaW5hbCA9PT0gdGhpcylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgncmVvcmRlcicsIHRoaXMuZHJhZ2dpbmcsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgndXBkYXRlJywgdGhpcy5kcmFnZ2luZywgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5vcmlnaW5hbC5lbWl0KCdyZW1vdmUnLCB0aGlzLmRyYWdnaW5nLCB0aGlzLmRyYWdnaW5nLm9yaWdpbmFsKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLm9yaWdpbmFsLmVtaXQoJ3VwZGF0ZScsIHRoaXMuZHJhZ2dpbmcsIHRoaXMuZHJhZ2dpbmcub3JpZ2luYWwpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgnYWRkJywgdGhpcy5kcmFnZ2luZywgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCd1cGRhdGUnLCB0aGlzLmRyYWdnaW5nLCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ3JlbW92ZScsIHRoaXMuZHJhZ2dpbmcsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3IucmVtb3ZlKClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGljYXRvciA9IG51bGxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLnJlbW92ZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5vcmlnaW5hbCA9IG51bGxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRyYWdnaW5nLmljb24pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5pY29uLnJlbW92ZSgpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2NsaWNrZWQnLCB0aGlzLmRyYWdnaW5nLCB0aGlzKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcgPSBudWxsXHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHRoZSBnbG9iYWwgZGVmYXVsdHMgZm9yIG5ldyBTb3J0YWJsZSBvYmplY3RzXHJcbiAgICAgKiBAdHlwZSB7RGVmYXVsdE9wdGlvbnN9XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBnZXQgZGVmYXVsdHMoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBkZWZhdWx0c1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY3JlYXRlIG11bHRpcGxlIHNvcnRhYmxlIGVsZW1lbnRzXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50c1tdfSBlbGVtZW50c1xyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgLSBzZWUgY29uc3RydWN0b3IgZm9yIG9wdGlvbnNcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGNyZWF0ZShlbGVtZW50cywgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBjb25zdCByZXN1bHRzID0gW11cclxuICAgICAgICBmb3IgKGxldCBlbGVtZW50IG9mIGVsZW1lbnRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKG5ldyBTb3J0YWJsZShlbGVtZW50LCBvcHRpb25zKSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdHNcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTb3J0YWJsZSJdfQ==