const Events = require('eventemitter3');

const toGlobal = require('./toGlobal');
const icons = require('./icons');

/**
 * Options for Sortable
 * @typedef {object} Sortable~DefaultOptions
 * @property {string} [options.name=sortable] dragging is allowed between Sortables with the same name
 * @property {string} [options.dragClass] if set then drag only items with this className under element; otherwise drag all children
 * @property {string} [options.orderClass] use this class to include elements in ordering but not dragging; otherwise all children elements are included in when sorting and ordering
 * @property {boolean} [options.deepSearch] if dragClass and deepSearch then search all descendents of element for dragClass
 * @property {boolean} [options.sort=true] allow sorting within list
 * @property {string} [options.sortId=data-order] for ordered lists, use this data id to figure out sort order
 * @property {boolean} [options.sortIdIsNumber=true] use parseInt on options.sortId to properly sort numbers
 * @property {boolean} [options.alwaysInList=true] place element inside closest related Sortable object; if set to false then the object is removed if dropped outside related sortables
 * @property {object} [options.childrenStyles] styles to apply to children elements of Sortable
 * @property {boolean} [options.useIcons=true] show icons when dragging
 * @property {object} [options.icons] default set of icons
 * @property {string} [options.icons.reorder]
 * @property {string} [options.icons.move]
 * @property {string} [options.icons.copy]
 * @property {string} [options.icons.delete]
 */
const defaults = {
    name: 'sortable',
    sort: true,
    sortId: 'data-order',
    sortIdIsNumber: true,
    threshold: 10,
    alwaysInList: true,
    dragClass: null,
    orderClass: null,
    returnHome: true,
    deepSearch: false,
    dragStyle: {
        boxShadow: '3px 3px 5px rgba(0,0,0,0.25)',
        opacity: 0.85
    },
    childrenStyles: {
        cursor: 'pointer'
    },
    useIcons: true,
    icons
};

class Sortable extends Events {
    /**
     * Create sortable list
     * @param {HTMLElement} element
     * @param {object} [options]
     * @param {string} [options.name=sortable] dragging is allowed between Sortables with the same name
     * @param {boolean} [options.sort=true] allow sorting within list
     * @param {string} [options.dragClass] if set then drag only items with this className under element, otherwise use all children
     * @param {boolean} [options.deepSearch] if dragClass and deepSearch then search all descendents of element for dragClass
     * @param {string} [options.sortId=data-order] for non-sorting lists, use this data id to figure out sort order
     * @param {boolean} [options.alwaysInList=true] place element inside closest related Sortable object; if set to false then the object is removed if dropped outside related sortables
     * @param {object} [options.childrenStyles] styles to apply to children elements of Sortable
     * @param {object} [options.icons] default set of icons
     * @param {string} [options.icons.reorder] source of image
     * @param {string} [options.icons.move] source of image
     * @param {string} [options.icons.copy] source of image
     * @param {string} [options.icons.delete] source of image
     * @fires order
     * @fires add
     * @fires remove
     * @fires order-pending
     * @fires add-pending
     * @fires remove-pending
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
        const id = sortable.options.sortId;
        dragging.indicator.remove();
        sortable.indicator = dragging.indicator;
        const dragOrder = sortable.indicator.getAttribute(id);
        let found;
        const elements = this._getChildren(sortable, true);
        for (let child of elements) {
            if (sortable.options.sortIdIsNumber ? parseInt(dragOrder) < parseInt(child.getAttribute(id)) : dragOrder < child.getAttribute(id)) {
                child.parentNode.insertBefore(sortable.indicator, child);
                this._setIcon(dragging, sortable);
                found = true;
                break;
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
                sortable.element.appendChild(dragging.indicator);
                sortable.indicator = dragging.indicator;
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
                if (this.indicator.parentNode) {
                    this.indicator.parentNode.insertBefore(this.dragging, this.indicator);
                    this.dragging.original = this.dragging.current;
                } else {
                    this.emit('removed', this.dragging, this);
                    this.dragging.remove();
                    this.dragging.original = null;
                }
                this.dragging.style.position = '';
                this.dragging.style.zIndex = '';
                this.dragging.style.boxShadow = '';
                this.dragging.style.opacity = '';
                this.indicator.remove();
                this.indicator = null;
                if (this.dragging.icon) {
                    this.dragging.icon.remove();
                }
                this.emit('dropped', this.dragging, this);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zb3J0YWJsZS5qcyJdLCJuYW1lcyI6WyJFdmVudHMiLCJyZXF1aXJlIiwidG9HbG9iYWwiLCJpY29ucyIsImRlZmF1bHRzIiwibmFtZSIsInNvcnQiLCJzb3J0SWQiLCJzb3J0SWRJc051bWJlciIsInRocmVzaG9sZCIsImFsd2F5c0luTGlzdCIsImRyYWdDbGFzcyIsIm9yZGVyQ2xhc3MiLCJyZXR1cm5Ib21lIiwiZGVlcFNlYXJjaCIsImRyYWdTdHlsZSIsImJveFNoYWRvdyIsIm9wYWNpdHkiLCJjaGlsZHJlblN0eWxlcyIsImN1cnNvciIsInVzZUljb25zIiwiU29ydGFibGUiLCJjb25zdHJ1Y3RvciIsImVsZW1lbnQiLCJvcHRpb25zIiwib3B0aW9uIiwic29ydGFibGUiLCJlbGVtZW50cyIsIl9nZXRDaGlsZHJlbiIsImNoaWxkIiwiY2xhc3NOYW1lIiwiYWRkRXZlbnRMaXN0ZW5lciIsImUiLCJfZHJhZ1N0YXJ0Iiwic3R5bGUiLCJvcmlnaW5hbCIsImRvY3VtZW50IiwiYm9keSIsIl9kcmFnTW92ZSIsIl9kcmFnVXAiLCJsaXN0IiwicHVzaCIsImRyYWdnaW5nIiwiY3VycmVudFRhcmdldCIsInBpY2t1cCIsInN0YXJ0IiwieCIsInBhZ2VYIiwieSIsInBhZ2VZIiwicHJldmVudERlZmF1bHQiLCJfcGlja3VwIiwiaW5kaWNhdG9yIiwiY2xvbmVOb2RlIiwicG9zIiwicG9zaXRpb24iLCJvZmZzZXQiLCJsZWZ0IiwidG9wIiwicGFyZW50Tm9kZSIsImluc2VydEJlZm9yZSIsImFwcGVuZENoaWxkIiwiaW1hZ2UiLCJJbWFnZSIsInNyYyIsInJlb3JkZXIiLCJ0cmFuc2Zvcm0iLCJvZmZzZXRXaWR0aCIsIm9mZnNldEhlaWdodCIsImljb24iLCJfZGlzdGFuY2UiLCJ4MSIsInkxIiwieDIiLCJ5MiIsIk1hdGgiLCJzcXJ0IiwicG93IiwiX2Rpc3RhbmNlVG9DbG9zZXN0Q29ybmVyIiwidG9wTGVmdCIsIm9mZnNldExlZnQiLCJvZmZzZXRUb3AiLCJ0b3BSaWdodCIsImJvdHRvbUxlZnQiLCJib3R0b21SaWdodCIsIm1pbiIsIl9maW5kQ2xvc2VzdCIsImluc2lkZSIsIncxIiwiaDEiLCJ3MiIsImgyIiwiSW5maW5pdHkiLCJmb3VuZCIsInJlbGF0ZWQiLCJjYWxjdWxhdGUiLCJfcGVyY2VudGFnZSIsInhhMSIsInlhMSIsInhhMiIsInlhMiIsInhiMSIsInliMSIsInhiMiIsInliMiIsInNhIiwic2IiLCJzaSIsIm1heCIsInVuaW9uIiwiX3BsYWNlSW5MaXN0IiwiX3BsYWNlSW5Tb3J0YWJsZUxpc3QiLCJfcGxhY2VJbk9yZGVyZWRMaXN0IiwiX3RyYXZlcnNlQ2hpbGRyZW4iLCJiYXNlIiwic2VhcmNoIiwicmVzdWx0cyIsImNoaWxkcmVuIiwibGVuZ3RoIiwiaW5kZXhPZiIsIm9yZGVyIiwiaWQiLCJyZW1vdmUiLCJkcmFnT3JkZXIiLCJnZXRBdHRyaWJ1dGUiLCJwYXJzZUludCIsIl9zZXRJY29uIiwiX2dldExhc3RDaGlsZCIsImkiLCJtb3ZlIiwiY3VycmVudCIsImxhc3RDaGlsZCIsImZpcnN0Q2hpbGQiLCJsYXJnZXN0IiwiY2xvc2VzdCIsImlzQmVmb3JlIiwicGVyY2VudGFnZSIsIm5leHRTaWJsaW5nIiwiZW1pdCIsImRlbGV0ZSIsInN0b3BQcm9wYWdhdGlvbiIsInpJbmRleCIsImNyZWF0ZSIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiJBQUFBLE1BQU1BLFNBQVNDLFFBQVEsZUFBUixDQUFmOztBQUVBLE1BQU1DLFdBQVdELFFBQVEsWUFBUixDQUFqQjtBQUNBLE1BQU1FLFFBQVFGLFFBQVEsU0FBUixDQUFkOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUJBLE1BQU1HLFdBQVc7QUFDYkMsVUFBTSxVQURPO0FBRWJDLFVBQU0sSUFGTztBQUdiQyxZQUFRLFlBSEs7QUFJYkMsb0JBQWdCLElBSkg7QUFLYkMsZUFBVyxFQUxFO0FBTWJDLGtCQUFjLElBTkQ7QUFPYkMsZUFBVyxJQVBFO0FBUWJD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QnFCLFFBQXBCLEdBQStCLEVBQS9CO0FBQ0EscUJBQUtiLFFBQUwsQ0FBY1IsS0FBZCxDQUFvQjJHLE1BQXBCLEdBQTZCLEVBQTdCO0FBQ0EscUJBQUtuRyxRQUFMLENBQWNSLEtBQWQsQ0FBb0JsQixTQUFwQixHQUFnQyxFQUFoQztBQUNBLHFCQUFLMEIsUUFBTCxDQUFjUixLQUFkLENBQW9CakIsT0FBcEIsR0FBOEIsRUFBOUI7QUFDQSxxQkFBS21DLFNBQUwsQ0FBZXNFLE1BQWY7QUFDQSxxQkFBS3RFLFNBQUwsR0FBaUIsSUFBakI7QUFDQSxvQkFBSSxLQUFLVixRQUFMLENBQWMyQixJQUFsQixFQUNBO0FBQ0kseUJBQUszQixRQUFMLENBQWMyQixJQUFkLENBQW1CcUQsTUFBbkI7QUFDSDtBQUNELHFCQUFLZ0IsSUFBTCxDQUFVLFNBQVYsRUFBcUIsS0FBS2hHLFFBQTFCLEVBQW9DLElBQXBDO0FBQ0g7QUFDRCxpQkFBS0EsUUFBTCxHQUFnQixJQUFoQjtBQUNBVixjQUFFa0IsY0FBRjtBQUNIO0FBQ0o7O0FBRUQ7Ozs7QUFJQSxlQUFXOUMsUUFBWCxHQUNBO0FBQ0ksZUFBT0EsUUFBUDtBQUNIOztBQUVEOzs7OztBQUtBLFdBQU8wSSxNQUFQLENBQWNuSCxRQUFkLEVBQXdCSCxPQUF4QixFQUNBO0FBQ0ksY0FBTTRGLFVBQVUsRUFBaEI7QUFDQSxhQUFLLElBQUk3RixPQUFULElBQW9CSSxRQUFwQixFQUNBO0FBQ0l5RixvQkFBUTNFLElBQVIsQ0FBYSxJQUFJcEIsUUFBSixDQUFhRSxPQUFiLEVBQXNCQyxPQUF0QixDQUFiO0FBQ0g7QUFDRCxlQUFPNEYsT0FBUDtBQUNIO0FBcGxCTDs7QUF1bEJBMkIsT0FBT0MsT0FBUCxHQUFpQjNILFFBQWpCIiwiZmlsZSI6InNvcnRhYmxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgRXZlbnRzID0gcmVxdWlyZSgnZXZlbnRlbWl0dGVyMycpXHJcblxyXG5jb25zdCB0b0dsb2JhbCA9IHJlcXVpcmUoJy4vdG9HbG9iYWwnKVxyXG5jb25zdCBpY29ucyA9IHJlcXVpcmUoJy4vaWNvbnMnKVxyXG5cclxuLyoqXHJcbiAqIE9wdGlvbnMgZm9yIFNvcnRhYmxlXHJcbiAqIEB0eXBlZGVmIHtvYmplY3R9IFNvcnRhYmxlfkRlZmF1bHRPcHRpb25zXHJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbb3B0aW9ucy5uYW1lPXNvcnRhYmxlXSBkcmFnZ2luZyBpcyBhbGxvd2VkIGJldHdlZW4gU29ydGFibGVzIHdpdGggdGhlIHNhbWUgbmFtZVxyXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW29wdGlvbnMuZHJhZ0NsYXNzXSBpZiBzZXQgdGhlbiBkcmFnIG9ubHkgaXRlbXMgd2l0aCB0aGlzIGNsYXNzTmFtZSB1bmRlciBlbGVtZW50OyBvdGhlcndpc2UgZHJhZyBhbGwgY2hpbGRyZW5cclxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtvcHRpb25zLm9yZGVyQ2xhc3NdIHVzZSB0aGlzIGNsYXNzIHRvIGluY2x1ZGUgZWxlbWVudHMgaW4gb3JkZXJpbmcgYnV0IG5vdCBkcmFnZ2luZzsgb3RoZXJ3aXNlIGFsbCBjaGlsZHJlbiBlbGVtZW50cyBhcmUgaW5jbHVkZWQgaW4gd2hlbiBzb3J0aW5nIGFuZCBvcmRlcmluZ1xyXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IFtvcHRpb25zLmRlZXBTZWFyY2hdIGlmIGRyYWdDbGFzcyBhbmQgZGVlcFNlYXJjaCB0aGVuIHNlYXJjaCBhbGwgZGVzY2VuZGVudHMgb2YgZWxlbWVudCBmb3IgZHJhZ0NsYXNzXHJcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW29wdGlvbnMuc29ydD10cnVlXSBhbGxvdyBzb3J0aW5nIHdpdGhpbiBsaXN0XHJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbb3B0aW9ucy5zb3J0SWQ9ZGF0YS1vcmRlcl0gZm9yIG9yZGVyZWQgbGlzdHMsIHVzZSB0aGlzIGRhdGEgaWQgdG8gZmlndXJlIG91dCBzb3J0IG9yZGVyXHJcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW29wdGlvbnMuc29ydElkSXNOdW1iZXI9dHJ1ZV0gdXNlIHBhcnNlSW50IG9uIG9wdGlvbnMuc29ydElkIHRvIHByb3Blcmx5IHNvcnQgbnVtYmVyc1xyXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IFtvcHRpb25zLmFsd2F5c0luTGlzdD10cnVlXSBwbGFjZSBlbGVtZW50IGluc2lkZSBjbG9zZXN0IHJlbGF0ZWQgU29ydGFibGUgb2JqZWN0OyBpZiBzZXQgdG8gZmFsc2UgdGhlbiB0aGUgb2JqZWN0IGlzIHJlbW92ZWQgaWYgZHJvcHBlZCBvdXRzaWRlIHJlbGF0ZWQgc29ydGFibGVzXHJcbiAqIEBwcm9wZXJ0eSB7b2JqZWN0fSBbb3B0aW9ucy5jaGlsZHJlblN0eWxlc10gc3R5bGVzIHRvIGFwcGx5IHRvIGNoaWxkcmVuIGVsZW1lbnRzIG9mIFNvcnRhYmxlXHJcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW29wdGlvbnMudXNlSWNvbnM9dHJ1ZV0gc2hvdyBpY29ucyB3aGVuIGRyYWdnaW5nXHJcbiAqIEBwcm9wZXJ0eSB7b2JqZWN0fSBbb3B0aW9ucy5pY29uc10gZGVmYXVsdCBzZXQgb2YgaWNvbnNcclxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtvcHRpb25zLmljb25zLnJlb3JkZXJdXHJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbb3B0aW9ucy5pY29ucy5tb3ZlXVxyXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW29wdGlvbnMuaWNvbnMuY29weV1cclxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtvcHRpb25zLmljb25zLmRlbGV0ZV1cclxuICovXHJcbmNvbnN0IGRlZmF1bHRzID0ge1xyXG4gICAgbmFtZTogJ3NvcnRhYmxlJyxcclxuICAgIHNvcnQ6IHRydWUsXHJcbiAgICBzb3J0SWQ6ICdkYXRhLW9yZGVyJyxcclxuICAgIHNvcnRJZElzTnVtYmVyOiB0cnVlLFxyXG4gICAgdGhyZXNob2xkOiAxMCxcclxuICAgIGFsd2F5c0luTGlzdDogdHJ1ZSxcclxuICAgIGRyYWdDbGFzczogbnVsbCxcclxuICAgIG9yZGVyQ2xhc3M6IG51bGwsXHJcbiAgICByZXR1cm5Ib21lOiB0cnVlLFxyXG4gICAgZGVlcFNlYXJjaDogZmFsc2UsXHJcbiAgICBkcmFnU3R5bGU6IHtcclxuICAgICAgICBib3hTaGFkb3c6ICczcHggM3B4IDVweCByZ2JhKDAsMCwwLDAuMjUpJyxcclxuICAgICAgICBvcGFjaXR5OiAwLjg1XHJcbiAgICB9LFxyXG4gICAgY2hpbGRyZW5TdHlsZXM6IHtcclxuICAgICAgICBjdXJzb3I6ICdwb2ludGVyJ1xyXG4gICAgfSxcclxuICAgIHVzZUljb25zOiB0cnVlLFxyXG4gICAgaWNvbnNcclxufVxyXG5cclxuY2xhc3MgU29ydGFibGUgZXh0ZW5kcyBFdmVudHNcclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgc29ydGFibGUgbGlzdFxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLm5hbWU9c29ydGFibGVdIGRyYWdnaW5nIGlzIGFsbG93ZWQgYmV0d2VlbiBTb3J0YWJsZXMgd2l0aCB0aGUgc2FtZSBuYW1lXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnNvcnQ9dHJ1ZV0gYWxsb3cgc29ydGluZyB3aXRoaW4gbGlzdFxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmRyYWdDbGFzc10gaWYgc2V0IHRoZW4gZHJhZyBvbmx5IGl0ZW1zIHdpdGggdGhpcyBjbGFzc05hbWUgdW5kZXIgZWxlbWVudCwgb3RoZXJ3aXNlIHVzZSBhbGwgY2hpbGRyZW5cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuZGVlcFNlYXJjaF0gaWYgZHJhZ0NsYXNzIGFuZCBkZWVwU2VhcmNoIHRoZW4gc2VhcmNoIGFsbCBkZXNjZW5kZW50cyBvZiBlbGVtZW50IGZvciBkcmFnQ2xhc3NcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5zb3J0SWQ9ZGF0YS1vcmRlcl0gZm9yIG5vbi1zb3J0aW5nIGxpc3RzLCB1c2UgdGhpcyBkYXRhIGlkIHRvIGZpZ3VyZSBvdXQgc29ydCBvcmRlclxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5hbHdheXNJbkxpc3Q9dHJ1ZV0gcGxhY2UgZWxlbWVudCBpbnNpZGUgY2xvc2VzdCByZWxhdGVkIFNvcnRhYmxlIG9iamVjdDsgaWYgc2V0IHRvIGZhbHNlIHRoZW4gdGhlIG9iamVjdCBpcyByZW1vdmVkIGlmIGRyb3BwZWQgb3V0c2lkZSByZWxhdGVkIHNvcnRhYmxlc1xyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zLmNoaWxkcmVuU3R5bGVzXSBzdHlsZXMgdG8gYXBwbHkgdG8gY2hpbGRyZW4gZWxlbWVudHMgb2YgU29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9ucy5pY29uc10gZGVmYXVsdCBzZXQgb2YgaWNvbnNcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5pY29ucy5yZW9yZGVyXSBzb3VyY2Ugb2YgaW1hZ2VcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5pY29ucy5tb3ZlXSBzb3VyY2Ugb2YgaW1hZ2VcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5pY29ucy5jb3B5XSBzb3VyY2Ugb2YgaW1hZ2VcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5pY29ucy5kZWxldGVdIHNvdXJjZSBvZiBpbWFnZVxyXG4gICAgICogQGZpcmVzIG9yZGVyXHJcbiAgICAgKiBAZmlyZXMgYWRkXHJcbiAgICAgKiBAZmlyZXMgcmVtb3ZlXHJcbiAgICAgKiBAZmlyZXMgb3JkZXItcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIGFkZC1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgcmVtb3ZlLXBlbmRpbmdcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBzdXBlcigpXHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIGZvciAobGV0IG9wdGlvbiBpbiBkZWZhdWx0cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMub3B0aW9uc1tvcHRpb25dID0gdHlwZW9mIHRoaXMub3B0aW9uc1tvcHRpb25dICE9PSAndW5kZWZpbmVkJyA/IG9wdGlvbnNbb3B0aW9uXSA6IGRlZmF1bHRzW29wdGlvbl1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudFxyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zb3J0YWJsZSA9IHRoaXNcclxuICAgICAgICBjb25zdCBlbGVtZW50cyA9IHRoaXMuX2dldENoaWxkcmVuKHRoaXMpXHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgZWxlbWVudHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5kcmFnQ2xhc3MgfHwgY2hpbGQuY2xhc3NOYW1lID09PSB0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCAoZSkgPT4gdGhpcy5fZHJhZ1N0YXJ0KGUpKVxyXG4gICAgICAgICAgICAgICAgY2hpbGQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIChlKSA9PiB0aGlzLl9kcmFnU3RhcnQoZSkpXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBvcHRpb24gaW4gdGhpcy5vcHRpb25zLmNoaWxkcmVuU3R5bGVzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkLnN0eWxlW29wdGlvbl0gPSB0aGlzLm9wdGlvbnMuY2hpbGRyZW5TdHlsZXNbb3B0aW9uXVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2hpbGQub3JpZ2luYWwgPSB0aGlzXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCAoZSkgPT4gdGhpcy5fZHJhZ01vdmUoZSkpXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCAoZSkgPT4gdGhpcy5fZHJhZ01vdmUoZSkpXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHVwJywgKGUpID0+IHRoaXMuX2RyYWdVcChlKSlcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgKGUpID0+IHRoaXMuX2RyYWdVcChlKSlcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCAoZSkgPT4gdGhpcy5fZHJhZ1VwKGUpKVxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VjYW5jZWwnLCAoZSkgPT4gdGhpcy5fZHJhZ1VwKGUpKVxyXG5cclxuICAgICAgICBpZiAoIVNvcnRhYmxlLmxpc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBTb3J0YWJsZS5saXN0ID0gW11cclxuICAgICAgICB9XHJcbiAgICAgICAgU29ydGFibGUubGlzdC5wdXNoKHRoaXMpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzdGFydCBkcmFnXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kcmFnU3RhcnQoZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLmRyYWdnaW5nID0gZS5jdXJyZW50VGFyZ2V0XHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZy5waWNrdXAgPSBmYWxzZVxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcuc3RhcnQgPSB7IHg6IGUucGFnZVgsIHk6IGUucGFnZVkgfVxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcuc3R5bGUuY3Vyc29yID0gJ25vLWN1cnNvcidcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBpY2t1cCBhbmQgY2xvbmUgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGlja3VwKGUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5pbmRpY2F0b3IgPSB0aGlzLmRyYWdnaW5nLmNsb25lTm9kZSh0cnVlKVxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcuaW5kaWNhdG9yID0gdGhpcy5pbmRpY2F0b3JcclxuICAgICAgICBjb25zdCBwb3MgPSB0b0dsb2JhbCh0aGlzLmRyYWdnaW5nKVxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXHJcbiAgICAgICAgdGhpcy5vZmZzZXQgPSB7IHg6IHBvcy54IC0gZS5wYWdlWCwgeTogcG9zLnkgLSBlLnBhZ2VZIH1cclxuICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLmxlZnQgPSBwb3MueCArICdweCdcclxuICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLnRvcCA9IHBvcy55ICsgJ3B4J1xyXG4gICAgICAgIGZvciAobGV0IG9wdGlvbiBpbiB0aGlzLm9wdGlvbnMuZHJhZ1N0eWxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5zdHlsZVtvcHRpb25dID0gdGhpcy5vcHRpb25zLmRyYWdTdHlsZVtvcHRpb25dXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGhpcy5pbmRpY2F0b3IsIHRoaXMuZHJhZ2dpbmcpXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmRyYWdnaW5nKVxyXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMudXNlSWNvbnMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBpbWFnZSA9IG5ldyBJbWFnZSgpXHJcbiAgICAgICAgICAgIGltYWdlLnNyYyA9IHRoaXMub3B0aW9ucy5pY29ucy5yZW9yZGVyXHJcbiAgICAgICAgICAgIGltYWdlLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xyXG4gICAgICAgICAgICBpbWFnZS5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlKC01MCUsIC01MCUpJ1xyXG4gICAgICAgICAgICBpbWFnZS5zdHlsZS5sZWZ0ID0gcG9zLnggKyB0aGlzLmRyYWdnaW5nLm9mZnNldFdpZHRoICsgJ3B4J1xyXG4gICAgICAgICAgICBpbWFnZS5zdHlsZS50b3AgPSBwb3MueSArIHRoaXMuZHJhZ2dpbmcub2Zmc2V0SGVpZ2h0ICsgJ3B4J1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGltYWdlKVxyXG4gICAgICAgICAgICB0aGlzLmRyYWdnaW5nLmljb24gPSBpbWFnZVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmRyYWdnaW5nLnBpY2t1cCA9IHRydWVcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIG1lYXN1cmUgZGlzdGFuY2UgYmV0d2VlbiB0d28gcG9pbnRzXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geDFcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5MVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHgyXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geTJcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kaXN0YW5jZSh4MSwgeTEsIHgyLCB5MilcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KHgxIC0geDIsIDIpICsgTWF0aC5wb3coeTEgLSB5MiwgMikpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmaW5kIGNsb3Nlc3QgZGlzdGFuY2UgZnJvbSBVSUV2ZW50IHRvIGEgY29ybmVyIG9mIGFuIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7SFRNTFVMaXN0RWxlbWVudH0gZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2Rpc3RhbmNlVG9DbG9zZXN0Q29ybmVyKGUsIGVsZW1lbnQpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgdG9wTGVmdCA9IHRoaXMuX2Rpc3RhbmNlKGUucGFnZVgsIGUucGFnZVksIGVsZW1lbnQub2Zmc2V0TGVmdCwgZWxlbWVudC5vZmZzZXRUb3ApXHJcbiAgICAgICAgY29uc3QgdG9wUmlnaHQgPSB0aGlzLl9kaXN0YW5jZShlLnBhZ2VYLCBlLnBhZ2VZLCBlbGVtZW50Lm9mZnNldExlZnQgKyBlbGVtZW50Lm9mZnNldFdpZHRoLCBlbGVtZW50Lm9mZnNldFRvcClcclxuICAgICAgICBjb25zdCBib3R0b21MZWZ0ID0gdGhpcy5fZGlzdGFuY2UoZS5wYWdlWCwgZS5wYWdlWSwgZWxlbWVudC5vZmZzZXRMZWZ0LCBlbGVtZW50Lm9mZnNldFRvcCArIGVsZW1lbnQub2Zmc2V0SGVpZ2h0KVxyXG4gICAgICAgIGNvbnN0IGJvdHRvbVJpZ2h0ID0gdGhpcy5fZGlzdGFuY2UoZS5wYWdlWCwgZS5wYWdlWSwgZWxlbWVudC5vZmZzZXRMZWZ0ICsgZWxlbWVudC5vZmZzZXRXaWR0aCwgZWxlbWVudC5vZmZzZXRUb3AgKyBlbGVtZW50Lm9mZnNldEhlaWdodClcclxuICAgICAgICByZXR1cm4gTWF0aC5taW4odG9wTGVmdCwgdG9wUmlnaHQsIGJvdHRvbUxlZnQsIGJvdHRvbVJpZ2h0KVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZmluZCBjbG9zZXN0IFNvcnRhYmxlIHRvIHNjcmVlbiBsb2NhdGlvblxyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZVtdfSBsaXN0IG9mIHJlbGF0ZWQgU29ydGFibGVzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZmluZENsb3Nlc3QoZSwgZHJhZ2dpbmcsIGxpc3QpXHJcbiAgICB7XHJcbiAgICAgICAgZnVuY3Rpb24gaW5zaWRlKGVsZW1lbnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCB4MSA9IGRyYWdnaW5nLm9mZnNldExlZnRcclxuICAgICAgICAgICAgY29uc3QgeTEgPSBkcmFnZ2luZy5vZmZzZXRUb3BcclxuICAgICAgICAgICAgY29uc3QgdzEgPSBkcmFnZ2luZy5vZmZzZXRXaWR0aFxyXG4gICAgICAgICAgICBjb25zdCBoMSA9IGRyYWdnaW5nLm9mZnNldEhlaWdodFxyXG4gICAgICAgICAgICBjb25zdCBwb3MgPSB0b0dsb2JhbChlbGVtZW50KVxyXG4gICAgICAgICAgICBjb25zdCB4MiA9IHBvcy54XHJcbiAgICAgICAgICAgIGNvbnN0IHkyID0gcG9zLnlcclxuICAgICAgICAgICAgY29uc3QgdzIgPSBlbGVtZW50Lm9mZnNldFdpZHRoXHJcbiAgICAgICAgICAgIGNvbnN0IGgyID0gZWxlbWVudC5vZmZzZXRIZWlnaHRcclxuICAgICAgICAgICAgcmV0dXJuIHgxIDwgeDIgKyB3MiAmJiB4MSArIHcxID4geDIgJiYgeTEgPCB5MiArIGgyICYmIHkxICsgaDEgPiB5MlxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG1pbiA9IEluZmluaXR5LCBmb3VuZFxyXG4gICAgICAgIGZvciAobGV0IHJlbGF0ZWQgb2YgbGlzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChpbnNpZGUocmVsYXRlZC5lbGVtZW50KSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlbGF0ZWRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChyZWxhdGVkLm9wdGlvbnMuYWx3YXlzSW5MaXN0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjYWxjdWxhdGUgPSB0aGlzLl9kaXN0YW5jZVRvQ2xvc2VzdENvcm5lcihlLCByZWxhdGVkLmVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICBpZiAoY2FsY3VsYXRlIDwgbWluKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG1pbiA9IGNhbGN1bGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gcmVsYXRlZFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmb3VuZFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhhMVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlhMVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhhMlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhhMlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhiMVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHliMVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhiMlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHliMlxyXG4gICAgICogY2FsY3VsYXRlIHBlcmNlbnRhZ2Ugb2Ygb3ZlcmxhcCBiZXR3ZWVuIHR3byBib3hlc1xyXG4gICAgICogZnJvbSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjEyMjAwMDQvMTk1NTk5N1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BlcmNlbnRhZ2UoeGExLCB5YTEsIHhhMiwgeWEyLCB4YjEsIHliMSwgeGIyLCB5YjIpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3Qgc2EgPSAoeGEyIC0geGExKSAqICh5YTIgLSB5YTEpXHJcbiAgICAgICAgY29uc3Qgc2IgPSAoeGIyIC0geGIxKSAqICh5YjIgLSB5YjEpXHJcbiAgICAgICAgY29uc3Qgc2kgPSBNYXRoLm1heCgwLCBNYXRoLm1pbih4YTIsIHhiMikgLSBNYXRoLm1heCh4YTEsIHhiMSkpICogTWF0aC5tYXgoMCwgTWF0aC5taW4oeWEyLCB5YjIpIC0gTWF0aC5tYXgoeWExLCB5YjEpKVxyXG4gICAgICAgIGNvbnN0IHVuaW9uID0gc2EgKyBzYiAtIHNpXHJcbiAgICAgICAgcmV0dXJuIHNpIC8gdW5pb25cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBsYWNlIGluZGljYXRvciBpbiB0aGUgc29ydGFibGUgbGlzdCBhY2NvcmRpbmcgdG8gb3B0aW9ucy5zb3J0XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmcgZWxlbWVudFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BsYWNlSW5MaXN0KHNvcnRhYmxlLCBkcmFnZ2luZylcclxuICAgIHtcclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5zb3J0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fcGxhY2VJblNvcnRhYmxlTGlzdChzb3J0YWJsZSwgZHJhZ2dpbmcpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuX3BsYWNlSW5PcmRlcmVkTGlzdChzb3J0YWJsZSwgZHJhZ2dpbmcpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIF90cmF2ZXJzZUNoaWxkcmVuKGJhc2UsIHNlYXJjaCwgcmVzdWx0cylcclxuICAgIHtcclxuICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBiYXNlLmNoaWxkcmVuKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHNlYXJjaC5sZW5ndGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzZWFyY2guaW5kZXhPZihjaGlsZC5jbGFzc05hbWUpICE9PSAtMSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goY2hpbGQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goY2hpbGQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fdHJhdmVyc2VDaGlsZHJlbihjaGlsZCwgc2VhcmNoLCByZXN1bHRzKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGZpbmQgY2hpbGRyZW4gaW4gZGl2XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3JkZXJdIHNlYXJjaCBmb3IgZHJhZ09yZGVyIGFzIHdlbGxcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9nZXRDaGlsZHJlbihzb3J0YWJsZSwgb3JkZXIpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMuZGVlcFNlYXJjaClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBzZWFyY2ggPSBbXVxyXG4gICAgICAgICAgICBpZiAob3JkZXIgJiYgc29ydGFibGUub3B0aW9ucy5vcmRlckNsYXNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoLnB1c2goc29ydGFibGUub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAob3JkZXIgJiYgc29ydGFibGUub3B0aW9ucy5vcmRlckNsYXNzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaC5wdXNoKHNvcnRhYmxlLm9wdGlvbnMub3JkZXJDbGFzcylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICghb3JkZXIgJiYgc29ydGFibGUub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNlYXJjaC5wdXNoKHNvcnRhYmxlLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXVxyXG4gICAgICAgICAgICB0aGlzLl90cmF2ZXJzZUNoaWxkcmVuKHNvcnRhYmxlLmVsZW1lbnQsIHNlYXJjaCwgcmVzdWx0cylcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHNcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbGlzdCA9IFtdXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBzb3J0YWJsZS5lbGVtZW50LmNoaWxkcmVuKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZC5jbGFzc05hbWUgPT09IHNvcnRhYmxlLm9wdGlvbnMuZHJhZ0NsYXNzIHx8ICgob3JkZXIgfHwgIXNvcnRhYmxlLm9wdGlvbnMub3JkZXJDbGFzcykgfHwgKG9yZGVyICYmIHNvcnRhYmxlLm9wdGlvbnMub3JkZXJDbGFzcyAmJiBjaGlsZC5jbGFzc05hbWUgPT09IHNvcnRhYmxlLm9wdGlvbnMub3JkZXJDbGFzcykpKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGlzdC5wdXNoKGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBsaXN0XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc29ydGFibGUuZWxlbWVudC5jaGlsZHJlblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGxhY2UgaW5kaWNhdG9yIGluIGFuIG9yZGVyZWQgbGlzdFxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGxhY2VJbk9yZGVyZWRMaXN0KHNvcnRhYmxlLCBkcmFnZ2luZylcclxuICAgIHtcclxuICAgICAgICBjb25zdCBpZCA9IHNvcnRhYmxlLm9wdGlvbnMuc29ydElkXHJcbiAgICAgICAgZHJhZ2dpbmcuaW5kaWNhdG9yLnJlbW92ZSgpXHJcbiAgICAgICAgc29ydGFibGUuaW5kaWNhdG9yID0gZHJhZ2dpbmcuaW5kaWNhdG9yXHJcbiAgICAgICAgY29uc3QgZHJhZ09yZGVyID0gc29ydGFibGUuaW5kaWNhdG9yLmdldEF0dHJpYnV0ZShpZClcclxuICAgICAgICBsZXQgZm91bmRcclxuICAgICAgICBjb25zdCBlbGVtZW50cyA9IHRoaXMuX2dldENoaWxkcmVuKHNvcnRhYmxlLCB0cnVlKVxyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGVsZW1lbnRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMuc29ydElkSXNOdW1iZXIgPyBwYXJzZUludChkcmFnT3JkZXIpIDwgcGFyc2VJbnQoY2hpbGQuZ2V0QXR0cmlidXRlKGlkKSkgOiBkcmFnT3JkZXIgPCBjaGlsZC5nZXRBdHRyaWJ1dGUoaWQpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShzb3J0YWJsZS5pbmRpY2F0b3IsIGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0SWNvbihkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWVcclxuICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFmb3VuZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVsZW1lbnQuYXBwZW5kQ2hpbGQoc29ydGFibGUuaW5kaWNhdG9yKVxyXG4gICAgICAgICAgICB0aGlzLl9zZXRJY29uKGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmaW5kIGxhc3QgY2hpbGQgdGhhdCBpcyBvZiB0eXBlIGRyYWdDbGFzcyAoaWYgc2V0KVxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9nZXRMYXN0Q2hpbGQoc29ydGFibGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMuZGVlcFNlYXJjaClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNlYXJjaCA9IFtdXHJcbiAgICAgICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc2VhcmNoLnB1c2goc29ydGFibGUub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdXHJcbiAgICAgICAgICAgIHRoaXMuX3RyYXZlcnNlQ2hpbGRyZW4oc29ydGFibGUuZWxlbWVudCwgc2VhcmNoLCByZXN1bHRzKVxyXG4gICAgICAgICAgICBpZiAocmVzdWx0cy5sZW5ndGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRzW3Jlc3VsdHMubGVuZ3RoIC0gMV1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gc29ydGFibGUuZWxlbWVudC5jaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZCA9IHNvcnRhYmxlLmVsZW1lbnQuY2hpbGRyZW5baV1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGQuY2xhc3NOYW1lID09PSBzb3J0YWJsZS5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjaGlsZFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc29ydGFibGUuZWxlbWVudC5jaGlsZHJlbi5sZW5ndGgpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNvcnRhYmxlLmVsZW1lbnQuY2hpbGRyZW5bc29ydGFibGUuZWxlbWVudC5jaGlsZHJlbi5sZW5ndGggLSAxXVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzZXQgaWNvbiBpZiBhdmFpbGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICovXHJcbiAgICBfc2V0SWNvbihkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGRyYWdnaW5nLmljb24pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkcmFnZ2luZy5pY29uLnNyYyA9IGRyYWdnaW5nLm9yaWdpbmFsID09PSBzb3J0YWJsZSA/IHNvcnRhYmxlLm9wdGlvbnMuaWNvbnMucmVvcmRlciA6IHNvcnRhYmxlLm9wdGlvbnMuaWNvbnMubW92ZVxyXG4gICAgICAgICAgICBkcmFnZ2luZy5jdXJyZW50ID0gc29ydGFibGVcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwbGFjZSBpbmRpY2F0b3IgaW4gYW4gc29ydGFibGUgbGlzdFxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGxhY2VJblNvcnRhYmxlTGlzdChzb3J0YWJsZSwgZHJhZ2dpbmcpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHNvcnRhYmxlLmVsZW1lbnRcclxuICAgICAgICBzb3J0YWJsZS5lbGVtZW50LmFwcGVuZENoaWxkKGRyYWdnaW5nLmluZGljYXRvcilcclxuICAgICAgICBzb3J0YWJsZS5pbmRpY2F0b3IgPSBkcmFnZ2luZy5pbmRpY2F0b3JcclxuICAgICAgICBjb25zdCBsYXN0Q2hpbGQgPSB0aGlzLl9nZXRMYXN0Q2hpbGQoc29ydGFibGUpXHJcbiAgICAgICAgaWYgKCFsYXN0Q2hpbGQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKHNvcnRhYmxlLmluZGljYXRvcilcclxuICAgICAgICAgICAgdGhpcy5fc2V0SWNvbihkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZy5vZmZzZXRUb3AgPj0gZWxlbWVudC5vZmZzZXRUb3AgKyBlbGVtZW50Lm9mZnNldEhlaWdodClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChzb3J0YWJsZS5pbmRpY2F0b3IpXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRJY29uKGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChkcmFnZ2luZy5vZmZzZXRUb3AgKyBkcmFnZ2luZy5vZmZzZXRIZWlnaHQgPCBlbGVtZW50Lm9mZnNldFRvcClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5pbnNlcnRCZWZvcmUoc29ydGFibGUuaW5kaWNhdG9yLCBlbGVtZW50LmZpcnN0Q2hpbGQpXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRJY29uKGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZHJhZ2dpbmcuaW5kaWNhdG9yKVxyXG4gICAgICAgICAgICAgICAgc29ydGFibGUuaW5kaWNhdG9yID0gZHJhZ2dpbmcuaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICBjb25zdCB4YTEgPSBkcmFnZ2luZy5vZmZzZXRMZWZ0XHJcbiAgICAgICAgICAgICAgICBjb25zdCB5YTEgPSBkcmFnZ2luZy5vZmZzZXRUb3BcclxuICAgICAgICAgICAgICAgIGNvbnN0IHhhMiA9IGRyYWdnaW5nLm9mZnNldExlZnQgKyBkcmFnZ2luZy5vZmZzZXRXaWR0aFxyXG4gICAgICAgICAgICAgICAgY29uc3QgeWEyID0gZHJhZ2dpbmcub2Zmc2V0VG9wICsgZHJhZ2dpbmcub2Zmc2V0SGVpZ2h0XHJcbiAgICAgICAgICAgICAgICBsZXQgbGFyZ2VzdCA9IDAsIGNsb3Nlc3QsIGlzQmVmb3JlID0gdHJ1ZSwgaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICBjb25zdCBzZWFyY2ggPSBbXVxyXG4gICAgICAgICAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaC5wdXNoKHNvcnRhYmxlLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMub3JkZXJDbGFzcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2gucHVzaChzb3J0YWJsZS5vcHRpb25zLm9yZGVyQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCBlbGVtZW50cyA9IHRoaXMuX2dldENoaWxkcmVuKHNvcnRhYmxlLCB0cnVlKVxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgZWxlbWVudHMpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkID09PSBzb3J0YWJsZS5pbmRpY2F0b3IpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRpY2F0b3IgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvcyA9IHRvR2xvYmFsKGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHhiMSA9IHBvcy54XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeWIxID0gcG9zLnlcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB4YjIgPSBwb3MueCArIGNoaWxkLm9mZnNldFdpZHRoXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeWIyID0gcG9zLnkgKyBjaGlsZC5vZmZzZXRIZWlnaHRcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwZXJjZW50YWdlID0gdGhpcy5fcGVyY2VudGFnZSh4YTEsIHlhMSwgeGEyLCB5YTIsIHhiMSwgeWIxLCB4YjIsIHliMilcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGVyY2VudGFnZSA+IGxhcmdlc3QpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXJnZXN0ID0gcGVyY2VudGFnZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9zZXN0ID0gY2hpbGRcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXNCZWZvcmUgPSBpbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoY2xvc2VzdCAmJiBjbG9zZXN0ICE9PSBzb3J0YWJsZS5pbmRpY2F0b3IpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzQmVmb3JlKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5pbnNlcnRCZWZvcmUoc29ydGFibGUuaW5kaWNhdG9yLCBjbG9zZXN0Lm5leHRTaWJsaW5nKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRJY29uKGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnZHJhZ2dpbmctb3JkZXItY2hhbmdlJywgc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKHNvcnRhYmxlLmluZGljYXRvciwgY2xvc2VzdClcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0SWNvbihkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ2RyYWdnaW5nLW9yZGVyLWNoYW5nZScsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGhhbmRsZSBtb3ZlXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kcmFnTW92ZShlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLmRyYWdnaW5nKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmRyYWdnaW5nLnBpY2t1cClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2Rpc3RhbmNlKHRoaXMuZHJhZ2dpbmcuc3RhcnQueCwgdGhpcy5kcmFnZ2luZy5zdGFydC55LCBlLnBhZ2VYLCBlLnBhZ2VZKSA+IHRoaXMub3B0aW9ucy50aHJlc2hvbGQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGlja3VwKGUpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5zdHlsZS5sZWZ0ID0gZS5wYWdlWCArIHRoaXMub2Zmc2V0LnggKyAncHgnXHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuc3R5bGUudG9wID0gZS5wYWdlWSArIHRoaXMub2Zmc2V0LnkgKyAncHgnXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRyYWdnaW5nLmljb24pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuaWNvbi5zdHlsZS5sZWZ0ID0gZS5wYWdlWCArIHRoaXMub2Zmc2V0LnggKyB0aGlzLmRyYWdnaW5nLm9mZnNldFdpZHRoICsgJ3B4J1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5pY29uLnN0eWxlLnRvcCA9IGUucGFnZVkgKyB0aGlzLm9mZnNldC55ICsgdGhpcy5kcmFnZ2luZy5vZmZzZXRIZWlnaHQgKyAncHgnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgbGlzdCA9IFtdXHJcbiAgICAgICAgICAgIGZvciAobGV0IHNvcnRhYmxlIG9mIFNvcnRhYmxlLmxpc3QpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLm5hbWUgPT09IHRoaXMub3B0aW9ucy5uYW1lKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGxpc3QucHVzaChzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3BsYWNlSW5MaXN0KHRoaXMsIHRoaXMuZHJhZ2dpbmcpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjbG9zZXN0ID0gdGhpcy5fZmluZENsb3Nlc3QoZSwgdGhpcy5kcmFnZ2luZywgbGlzdClcclxuICAgICAgICAgICAgICAgIGlmIChjbG9zZXN0KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3BsYWNlSW5MaXN0KGNsb3Nlc3QsIHRoaXMuZHJhZ2dpbmcpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5pbmRpY2F0b3IucmVtb3ZlKClcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5kcmFnZ2luZy5pY29uKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5pY29uLnNyYyA9IHRoaXMub3B0aW9ucy5pY29ucy5kZWxldGVcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgdXBcclxuICAgICAqIEBwYXJhbSB7VUlFdmVudH0gZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2RyYWdVcChlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLmRyYWdnaW5nKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmcucGlja3VwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pbmRpY2F0b3IucGFyZW50Tm9kZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGljYXRvci5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0aGlzLmRyYWdnaW5nLCB0aGlzLmluZGljYXRvcilcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLm9yaWdpbmFsID0gdGhpcy5kcmFnZ2luZy5jdXJyZW50XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdyZW1vdmVkJywgdGhpcy5kcmFnZ2luZywgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLnJlbW92ZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5vcmlnaW5hbCA9IG51bGxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuc3R5bGUucG9zaXRpb24gPSAnJ1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5zdHlsZS56SW5kZXggPSAnJ1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5zdHlsZS5ib3hTaGFkb3cgPSAnJ1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5zdHlsZS5vcGFjaXR5ID0gJydcclxuICAgICAgICAgICAgICAgIHRoaXMuaW5kaWNhdG9yLnJlbW92ZSgpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmluZGljYXRvciA9IG51bGxcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRyYWdnaW5nLmljb24pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5pY29uLnJlbW92ZSgpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2Ryb3BwZWQnLCB0aGlzLmRyYWdnaW5nLCB0aGlzKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcgPSBudWxsXHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHRoZSBnbG9iYWwgZGVmYXVsdHMgZm9yIG5ldyBTb3J0YWJsZSBvYmplY3RzXHJcbiAgICAgKiBAdHlwZSB7RGVmYXVsdE9wdGlvbnN9XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBnZXQgZGVmYXVsdHMoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBkZWZhdWx0c1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY3JlYXRlIG11bHRpcGxlIHNvcnRhYmxlIGVsZW1lbnRzXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50c1tdfSBlbGVtZW50c1xyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgLSBzZWUgY29uc3RydWN0b3IgZm9yIG9wdGlvbnNcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGNyZWF0ZShlbGVtZW50cywgb3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBjb25zdCByZXN1bHRzID0gW11cclxuICAgICAgICBmb3IgKGxldCBlbGVtZW50IG9mIGVsZW1lbnRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKG5ldyBTb3J0YWJsZShlbGVtZW50LCBvcHRpb25zKSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdHNcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTb3J0YWJsZSJdfQ==