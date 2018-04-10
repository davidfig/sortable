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
     * @param {string} [options.sortId=data-order] for non-sorting lists, use this data id to figure out sort order
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3J0YWJsZS5qcyJdLCJuYW1lcyI6WyJFdmVudHMiLCJyZXF1aXJlIiwidG9HbG9iYWwiLCJkZWZhdWx0cyIsIlNvcnRhYmxlIiwiY29uc3RydWN0b3IiLCJlbGVtZW50Iiwib3B0aW9ucyIsIm9wdGlvbiIsInNvcnRhYmxlIiwiZWxlbWVudHMiLCJfZ2V0Q2hpbGRyZW4iLCJjaGlsZCIsImRyYWdDbGFzcyIsImNsYXNzTmFtZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJlIiwiX2RyYWdTdGFydCIsImNoaWxkcmVuU3R5bGVzIiwic3R5bGUiLCJvcmlnaW5hbCIsImRvY3VtZW50IiwiYm9keSIsIl9kcmFnTW92ZSIsIl9kcmFnVXAiLCJsaXN0IiwicHVzaCIsImRyYWdnaW5nIiwiY3VycmVudFRhcmdldCIsInBpY2t1cCIsInN0YXJ0IiwieCIsInBhZ2VYIiwieSIsInBhZ2VZIiwiY3Vyc29yIiwicHJldmVudERlZmF1bHQiLCJfcGlja3VwIiwiaW5kaWNhdG9yIiwiY2xvbmVOb2RlIiwicG9zIiwicG9zaXRpb24iLCJvZmZzZXQiLCJsZWZ0IiwidG9wIiwiZHJhZ1N0eWxlIiwicGFyZW50Tm9kZSIsImluc2VydEJlZm9yZSIsImFwcGVuZENoaWxkIiwidXNlSWNvbnMiLCJpbWFnZSIsIkltYWdlIiwic3JjIiwiaWNvbnMiLCJyZW9yZGVyIiwidHJhbnNmb3JtIiwib2Zmc2V0V2lkdGgiLCJvZmZzZXRIZWlnaHQiLCJpY29uIiwiZW1pdCIsIl9kaXN0YW5jZSIsIngxIiwieTEiLCJ4MiIsInkyIiwiTWF0aCIsInNxcnQiLCJwb3ciLCJfZGlzdGFuY2VUb0Nsb3Nlc3RDb3JuZXIiLCJ0b3BMZWZ0Iiwib2Zmc2V0TGVmdCIsIm9mZnNldFRvcCIsInRvcFJpZ2h0IiwiYm90dG9tTGVmdCIsImJvdHRvbVJpZ2h0IiwibWluIiwiX2ZpbmRDbG9zZXN0IiwiaW5zaWRlIiwidzEiLCJoMSIsIncyIiwiaDIiLCJJbmZpbml0eSIsImZvdW5kIiwicmVsYXRlZCIsImFsd2F5c0luTGlzdCIsImNhbGN1bGF0ZSIsIl9wZXJjZW50YWdlIiwieGExIiwieWExIiwieGEyIiwieWEyIiwieGIxIiwieWIxIiwieGIyIiwieWIyIiwic2EiLCJzYiIsInNpIiwibWF4IiwidW5pb24iLCJfcGxhY2VJbkxpc3QiLCJzb3J0IiwiX3BsYWNlSW5Tb3J0YWJsZUxpc3QiLCJfcGxhY2VJbk9yZGVyZWRMaXN0IiwiX3RyYXZlcnNlQ2hpbGRyZW4iLCJiYXNlIiwic2VhcmNoIiwicmVzdWx0cyIsImNoaWxkcmVuIiwibGVuZ3RoIiwiaW5kZXhPZiIsIm9yZGVyIiwiZGVlcFNlYXJjaCIsIm9yZGVyQ2xhc3MiLCJpZCIsInNvcnRJZCIsInJlbW92ZSIsImRyYWdPcmRlciIsImdldEF0dHJpYnV0ZSIsInNvcnRJZElzTnVtYmVyIiwicGFyc2VJbnQiLCJfc2V0SWNvbiIsIl9nZXRMYXN0Q2hpbGQiLCJpIiwibW92ZSIsImN1cnJlbnQiLCJsYXN0Q2hpbGQiLCJmaXJzdENoaWxkIiwibGFyZ2VzdCIsImNsb3Nlc3QiLCJpc0JlZm9yZSIsInBlcmNlbnRhZ2UiLCJuZXh0U2libGluZyIsInRocmVzaG9sZCIsIm5hbWUiLCJkZWxldGUiLCJzdG9wUHJvcGFnYXRpb24iLCJ6SW5kZXgiLCJib3hTaGFkb3ciLCJvcGFjaXR5IiwiY3JlYXRlIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTUEsU0FBU0MsUUFBUSxlQUFSLENBQWY7O0FBRUEsTUFBTUMsV0FBV0QsUUFBUSxZQUFSLENBQWpCO0FBQ0EsTUFBTUUsV0FBV0YsUUFBUSxXQUFSLENBQWpCOztBQUVBLE1BQU1HLFFBQU4sU0FBdUJKLE1BQXZCLENBQ0E7QUFDSTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMkJBSyxnQkFBWUMsT0FBWixFQUFxQkMsT0FBckIsRUFDQTtBQUNJO0FBQ0EsYUFBS0EsT0FBTCxHQUFlQSxXQUFXLEVBQTFCO0FBQ0EsYUFBSyxJQUFJQyxNQUFULElBQW1CTCxRQUFuQixF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LFNBQUwsR0FBaUIsSUFBakI7QUFDQSx5QkFBS1gsUUFBTCxDQUFjMEYsTUFBZDtBQUNBLHlCQUFLMUYsUUFBTCxDQUFjUCxRQUFkLEdBQXlCLElBQXpCO0FBQ0g7QUFDRCxvQkFBSSxLQUFLTyxRQUFMLENBQWMrQixJQUFsQixFQUNBO0FBQ0kseUJBQUsvQixRQUFMLENBQWMrQixJQUFkLENBQW1CMkQsTUFBbkI7QUFDSDtBQUNKLGFBckNELE1BdUNBO0FBQ0kscUJBQUsxRCxJQUFMLENBQVUsU0FBVixFQUFxQixLQUFLaEMsUUFBMUIsRUFBb0MsSUFBcEM7QUFDSDtBQUNELGlCQUFLQSxRQUFMLEdBQWdCLElBQWhCO0FBQ0FYLGNBQUVvQixjQUFGO0FBQ0g7QUFDSjs7QUFFRDs7OztBQUlBLGVBQVdqQyxRQUFYLEdBQ0E7QUFDSSxlQUFPQSxRQUFQO0FBQ0g7O0FBRUQ7Ozs7O0FBS0EsV0FBTzBJLE1BQVAsQ0FBY25JLFFBQWQsRUFBd0JILE9BQXhCLEVBQ0E7QUFDSSxjQUFNcUcsVUFBVSxFQUFoQjtBQUNBLGFBQUssSUFBSXRHLE9BQVQsSUFBb0JJLFFBQXBCLEVBQ0E7QUFDSWtHLG9CQUFRbEYsSUFBUixDQUFhLElBQUl0QixRQUFKLENBQWFFLE9BQWIsRUFBc0JDLE9BQXRCLENBQWI7QUFDSDtBQUNELGVBQU9xRyxPQUFQO0FBQ0g7QUExbkJMOztBQTZuQkFrQyxPQUFPQyxPQUFQLEdBQWlCM0ksUUFBakIiLCJmaWxlIjoic29ydGFibGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBFdmVudHMgPSByZXF1aXJlKCdldmVudGVtaXR0ZXIzJylcclxuXHJcbmNvbnN0IHRvR2xvYmFsID0gcmVxdWlyZSgnLi90b0dsb2JhbCcpXHJcbmNvbnN0IGRlZmF1bHRzID0gcmVxdWlyZSgnLi9vcHRpb25zJylcclxuXHJcbmNsYXNzIFNvcnRhYmxlIGV4dGVuZHMgRXZlbnRzXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIHNvcnRhYmxlIGxpc3RcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5uYW1lPXNvcnRhYmxlXSBkcmFnZ2luZyBpcyBhbGxvd2VkIGJldHdlZW4gU29ydGFibGVzIHdpdGggdGhlIHNhbWUgbmFtZVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5zb3J0PXRydWVdIGFsbG93IHNvcnRpbmcgd2l0aGluIGxpc3RcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5kcmFnQ2xhc3NdIGlmIHNldCB0aGVuIGRyYWcgb25seSBpdGVtcyB3aXRoIHRoaXMgY2xhc3NOYW1lIHVuZGVyIGVsZW1lbnQsIG90aGVyd2lzZSB1c2UgYWxsIGNoaWxkcmVuXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmRlZXBTZWFyY2hdIGlmIGRyYWdDbGFzcyBhbmQgZGVlcFNlYXJjaCB0aGVuIHNlYXJjaCBhbGwgZGVzY2VuZGVudHMgb2YgZWxlbWVudCBmb3IgZHJhZ0NsYXNzXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuc29ydElkPWRhdGEtb3JkZXJdIGZvciBub24tc29ydGluZyBsaXN0cywgdXNlIHRoaXMgZGF0YSBpZCB0byBmaWd1cmUgb3V0IHNvcnQgb3JkZXJcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuYWx3YXlzSW5MaXN0PXRydWVdIHBsYWNlIGVsZW1lbnQgaW5zaWRlIGNsb3Nlc3QgcmVsYXRlZCBTb3J0YWJsZSBvYmplY3Q7IGlmIHNldCB0byBmYWxzZSB0aGVuIHRoZSBvYmplY3QgaXMgcmVtb3ZlZCBpZiBkcm9wcGVkIG91dHNpZGUgcmVsYXRlZCBzb3J0YWJsZXNcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9ucy5jaGlsZHJlblN0eWxlc10gc3R5bGVzIHRvIGFwcGx5IHRvIGNoaWxkcmVuIGVsZW1lbnRzIG9mIFNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnMuaWNvbnNdIGRlZmF1bHQgc2V0IG9mIGljb25zXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuaWNvbnMucmVvcmRlcl0gc291cmNlIG9mIGltYWdlXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuaWNvbnMubW92ZV0gc291cmNlIG9mIGltYWdlXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuaWNvbnMuY29weV0gc291cmNlIG9mIGltYWdlXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuaWNvbnMuZGVsZXRlXSBzb3VyY2Ugb2YgaW1hZ2VcclxuICAgICAqIEBmaXJlcyBjbGlja2VkXHJcbiAgICAgKiBAZmlyZXMgcGlja3VwXHJcbiAgICAgKiBAZmlyZXMgb3JkZXJcclxuICAgICAqIEBmaXJlcyBhZGRcclxuICAgICAqIEBmaXJlcyByZW1vdmVcclxuICAgICAqIEBmaXJlcyB1cGRhdGVcclxuICAgICAqIEBmaXJlcyBvcmRlci1wZW5kaW5nXHJcbiAgICAgKiBAZmlyZXMgYWRkLXBlbmRpbmdcclxuICAgICAqIEBmaXJlcyByZW1vdmUtcGVuZGluZ1xyXG4gICAgICogQGZpcmVzIHVwZGF0ZS1wZW5kaW5nXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgc3VwZXIoKVxyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICBmb3IgKGxldCBvcHRpb24gaW4gZGVmYXVsdHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnNbb3B0aW9uXSA9IHR5cGVvZiB0aGlzLm9wdGlvbnNbb3B0aW9uXSAhPT0gJ3VuZGVmaW5lZCcgPyBvcHRpb25zW29wdGlvbl0gOiBkZWZhdWx0c1tvcHRpb25dXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnRcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc29ydGFibGUgPSB0aGlzXHJcbiAgICAgICAgY29uc3QgZWxlbWVudHMgPSB0aGlzLl9nZXRDaGlsZHJlbih0aGlzKVxyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGVsZW1lbnRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzIHx8IGNoaWxkLmNsYXNzTmFtZSA9PT0gdGhpcy5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKGUpID0+IHRoaXMuX2RyYWdTdGFydChlKSlcclxuICAgICAgICAgICAgICAgIGNoaWxkLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCAoZSkgPT4gdGhpcy5fZHJhZ1N0YXJ0KGUpKVxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgb3B0aW9uIGluIHRoaXMub3B0aW9ucy5jaGlsZHJlblN0eWxlcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZC5zdHlsZVtvcHRpb25dID0gdGhpcy5vcHRpb25zLmNoaWxkcmVuU3R5bGVzW29wdGlvbl1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNoaWxkLm9yaWdpbmFsID0gdGhpc1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgKGUpID0+IHRoaXMuX2RyYWdNb3ZlKGUpKVxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgKGUpID0+IHRoaXMuX2RyYWdNb3ZlKGUpKVxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2h1cCcsIChlKSA9PiB0aGlzLl9kcmFnVXAoZSkpXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsIChlKSA9PiB0aGlzLl9kcmFnVXAoZSkpXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgKGUpID0+IHRoaXMuX2RyYWdVcChlKSlcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlY2FuY2VsJywgKGUpID0+IHRoaXMuX2RyYWdVcChlKSlcclxuXHJcbiAgICAgICAgaWYgKCFTb3J0YWJsZS5saXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgU29ydGFibGUubGlzdCA9IFtdXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFNvcnRhYmxlLmxpc3QucHVzaCh0aGlzKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc3RhcnQgZHJhZ1xyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZHJhZ1N0YXJ0KGUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZyA9IGUuY3VycmVudFRhcmdldFxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcucGlja3VwID0gZmFsc2VcclxuICAgICAgICB0aGlzLmRyYWdnaW5nLnN0YXJ0ID0geyB4OiBlLnBhZ2VYLCB5OiBlLnBhZ2VZIH1cclxuICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLmN1cnNvciA9ICduby1jdXJzb3InXHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwaWNrdXAgYW5kIGNsb25lIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7VUlFdmVudH0gZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX3BpY2t1cChlKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuaW5kaWNhdG9yID0gdGhpcy5kcmFnZ2luZy5jbG9uZU5vZGUodHJ1ZSlcclxuICAgICAgICB0aGlzLmRyYWdnaW5nLmluZGljYXRvciA9IHRoaXMuaW5kaWNhdG9yXHJcbiAgICAgICAgY29uc3QgcG9zID0gdG9HbG9iYWwodGhpcy5kcmFnZ2luZylcclxuICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xyXG4gICAgICAgIHRoaXMub2Zmc2V0ID0geyB4OiBwb3MueCAtIGUucGFnZVgsIHk6IHBvcy55IC0gZS5wYWdlWSB9XHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZy5zdHlsZS5sZWZ0ID0gcG9zLnggKyAncHgnXHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZy5zdHlsZS50b3AgPSBwb3MueSArICdweCdcclxuICAgICAgICBmb3IgKGxldCBvcHRpb24gaW4gdGhpcy5vcHRpb25zLmRyYWdTdHlsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuc3R5bGVbb3B0aW9uXSA9IHRoaXMub3B0aW9ucy5kcmFnU3R5bGVbb3B0aW9uXVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmRyYWdnaW5nLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHRoaXMuaW5kaWNhdG9yLCB0aGlzLmRyYWdnaW5nKVxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5kcmFnZ2luZylcclxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnVzZUljb25zKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKVxyXG4gICAgICAgICAgICBpbWFnZS5zcmMgPSB0aGlzLm9wdGlvbnMuaWNvbnMucmVvcmRlclxyXG4gICAgICAgICAgICBpbWFnZS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcclxuICAgICAgICAgICAgaW1hZ2Uuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZSgtNTAlLCAtNTAlKSdcclxuICAgICAgICAgICAgaW1hZ2Uuc3R5bGUubGVmdCA9IHBvcy54ICsgdGhpcy5kcmFnZ2luZy5vZmZzZXRXaWR0aCArICdweCdcclxuICAgICAgICAgICAgaW1hZ2Uuc3R5bGUudG9wID0gcG9zLnkgKyB0aGlzLmRyYWdnaW5nLm9mZnNldEhlaWdodCArICdweCdcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpbWFnZSlcclxuICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5pY29uID0gaW1hZ2VcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZy5waWNrdXAgPSB0cnVlXHJcbiAgICAgICAgdGhpcy5lbWl0KCdwaWNrdXAnLCB0aGlzLmRyYWdnaW5nLCB0aGlzKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogbWVhc3VyZSBkaXN0YW5jZSBiZXR3ZWVuIHR3byBwb2ludHNcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4MVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHkxXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geDJcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5MlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2Rpc3RhbmNlKHgxLCB5MSwgeDIsIHkyKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3coeDEgLSB4MiwgMikgKyBNYXRoLnBvdyh5MSAtIHkyLCAyKSlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGZpbmQgY2xvc2VzdCBkaXN0YW5jZSBmcm9tIFVJRXZlbnQgdG8gYSBjb3JuZXIgb2YgYW4gZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtIVE1MVUxpc3RFbGVtZW50fSBlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZGlzdGFuY2VUb0Nsb3Nlc3RDb3JuZXIoZSwgZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBjb25zdCB0b3BMZWZ0ID0gdGhpcy5fZGlzdGFuY2UoZS5wYWdlWCwgZS5wYWdlWSwgZWxlbWVudC5vZmZzZXRMZWZ0LCBlbGVtZW50Lm9mZnNldFRvcClcclxuICAgICAgICBjb25zdCB0b3BSaWdodCA9IHRoaXMuX2Rpc3RhbmNlKGUucGFnZVgsIGUucGFnZVksIGVsZW1lbnQub2Zmc2V0TGVmdCArIGVsZW1lbnQub2Zmc2V0V2lkdGgsIGVsZW1lbnQub2Zmc2V0VG9wKVxyXG4gICAgICAgIGNvbnN0IGJvdHRvbUxlZnQgPSB0aGlzLl9kaXN0YW5jZShlLnBhZ2VYLCBlLnBhZ2VZLCBlbGVtZW50Lm9mZnNldExlZnQsIGVsZW1lbnQub2Zmc2V0VG9wICsgZWxlbWVudC5vZmZzZXRIZWlnaHQpXHJcbiAgICAgICAgY29uc3QgYm90dG9tUmlnaHQgPSB0aGlzLl9kaXN0YW5jZShlLnBhZ2VYLCBlLnBhZ2VZLCBlbGVtZW50Lm9mZnNldExlZnQgKyBlbGVtZW50Lm9mZnNldFdpZHRoLCBlbGVtZW50Lm9mZnNldFRvcCArIGVsZW1lbnQub2Zmc2V0SGVpZ2h0KVxyXG4gICAgICAgIHJldHVybiBNYXRoLm1pbih0b3BMZWZ0LCB0b3BSaWdodCwgYm90dG9tTGVmdCwgYm90dG9tUmlnaHQpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmaW5kIGNsb3Nlc3QgU29ydGFibGUgdG8gc2NyZWVuIGxvY2F0aW9uXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nXHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlW119IGxpc3Qgb2YgcmVsYXRlZCBTb3J0YWJsZXNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9maW5kQ2xvc2VzdChlLCBkcmFnZ2luZywgbGlzdClcclxuICAgIHtcclxuICAgICAgICBmdW5jdGlvbiBpbnNpZGUoZWxlbWVudClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHgxID0gZHJhZ2dpbmcub2Zmc2V0TGVmdFxyXG4gICAgICAgICAgICBjb25zdCB5MSA9IGRyYWdnaW5nLm9mZnNldFRvcFxyXG4gICAgICAgICAgICBjb25zdCB3MSA9IGRyYWdnaW5nLm9mZnNldFdpZHRoXHJcbiAgICAgICAgICAgIGNvbnN0IGgxID0gZHJhZ2dpbmcub2Zmc2V0SGVpZ2h0XHJcbiAgICAgICAgICAgIGNvbnN0IHBvcyA9IHRvR2xvYmFsKGVsZW1lbnQpXHJcbiAgICAgICAgICAgIGNvbnN0IHgyID0gcG9zLnhcclxuICAgICAgICAgICAgY29uc3QgeTIgPSBwb3MueVxyXG4gICAgICAgICAgICBjb25zdCB3MiA9IGVsZW1lbnQub2Zmc2V0V2lkdGhcclxuICAgICAgICAgICAgY29uc3QgaDIgPSBlbGVtZW50Lm9mZnNldEhlaWdodFxyXG4gICAgICAgICAgICByZXR1cm4geDEgPCB4MiArIHcyICYmIHgxICsgdzEgPiB4MiAmJiB5MSA8IHkyICsgaDIgJiYgeTEgKyBoMSA+IHkyXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgbWluID0gSW5maW5pdHksIGZvdW5kXHJcbiAgICAgICAgZm9yIChsZXQgcmVsYXRlZCBvZiBsaXN0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGluc2lkZShyZWxhdGVkLmVsZW1lbnQpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVsYXRlZFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHJlbGF0ZWQub3B0aW9ucy5hbHdheXNJbkxpc3QpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNhbGN1bGF0ZSA9IHRoaXMuX2Rpc3RhbmNlVG9DbG9zZXN0Q29ybmVyKGUsIHJlbGF0ZWQuZWxlbWVudClcclxuICAgICAgICAgICAgICAgIGlmIChjYWxjdWxhdGUgPCBtaW4pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWluID0gY2FsY3VsYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgZm91bmQgPSByZWxhdGVkXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZvdW5kXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geGExXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geWExXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geGEyXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geGEyXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geGIxXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geWIxXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geGIyXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geWIyXHJcbiAgICAgKiBjYWxjdWxhdGUgcGVyY2VudGFnZSBvZiBvdmVybGFwIGJldHdlZW4gdHdvIGJveGVzXHJcbiAgICAgKiBmcm9tIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMTIyMDAwNC8xOTU1OTk3XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGVyY2VudGFnZSh4YTEsIHlhMSwgeGEyLCB5YTIsIHhiMSwgeWIxLCB4YjIsIHliMilcclxuICAgIHtcclxuICAgICAgICBjb25zdCBzYSA9ICh4YTIgLSB4YTEpICogKHlhMiAtIHlhMSlcclxuICAgICAgICBjb25zdCBzYiA9ICh4YjIgLSB4YjEpICogKHliMiAtIHliMSlcclxuICAgICAgICBjb25zdCBzaSA9IE1hdGgubWF4KDAsIE1hdGgubWluKHhhMiwgeGIyKSAtIE1hdGgubWF4KHhhMSwgeGIxKSkgKiBNYXRoLm1heCgwLCBNYXRoLm1pbih5YTIsIHliMikgLSBNYXRoLm1heCh5YTEsIHliMSkpXHJcbiAgICAgICAgY29uc3QgdW5pb24gPSBzYSArIHNiIC0gc2lcclxuICAgICAgICByZXR1cm4gc2kgLyB1bmlvblxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcGxhY2UgaW5kaWNhdG9yIGluIHRoZSBzb3J0YWJsZSBsaXN0IGFjY29yZGluZyB0byBvcHRpb25zLnNvcnRcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZyBlbGVtZW50XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGxhY2VJbkxpc3Qoc29ydGFibGUsIGRyYWdnaW5nKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLnNvcnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLl9wbGFjZUluU29ydGFibGVMaXN0KHNvcnRhYmxlLCBkcmFnZ2luZylcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fcGxhY2VJbk9yZGVyZWRMaXN0KHNvcnRhYmxlLCBkcmFnZ2luZylcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgX3RyYXZlcnNlQ2hpbGRyZW4oYmFzZSwgc2VhcmNoLCByZXN1bHRzKVxyXG4gICAge1xyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGJhc2UuY2hpbGRyZW4pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoc2VhcmNoLmxlbmd0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHNlYXJjaC5pbmRleE9mKGNoaWxkLmNsYXNzTmFtZSkgIT09IC0xKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChjaGlsZClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChjaGlsZClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLl90cmF2ZXJzZUNoaWxkcmVuKGNoaWxkLCBzZWFyY2gsIHJlc3VsdHMpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZmluZCBjaGlsZHJlbiBpbiBkaXZcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcmRlcl0gc2VhcmNoIGZvciBkcmFnT3JkZXIgYXMgd2VsbFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2dldENoaWxkcmVuKHNvcnRhYmxlLCBvcmRlcilcclxuICAgIHtcclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5kZWVwU2VhcmNoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IHNlYXJjaCA9IFtdXHJcbiAgICAgICAgICAgIGlmIChvcmRlciAmJiBzb3J0YWJsZS5vcHRpb25zLm9yZGVyQ2xhc3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2gucHVzaChzb3J0YWJsZS5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChvcmRlciAmJiBzb3J0YWJsZS5vcHRpb25zLm9yZGVyQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoLnB1c2goc29ydGFibGUub3B0aW9ucy5vcmRlckNsYXNzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKCFvcmRlciAmJiBzb3J0YWJsZS5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc2VhcmNoLnB1c2goc29ydGFibGUub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdXHJcbiAgICAgICAgICAgIHRoaXMuX3RyYXZlcnNlQ2hpbGRyZW4oc29ydGFibGUuZWxlbWVudCwgc2VhcmNoLCByZXN1bHRzKVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0c1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxldCBsaXN0ID0gW11cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIHNvcnRhYmxlLmVsZW1lbnQuY2hpbGRyZW4pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkLmNsYXNzTmFtZSA9PT0gc29ydGFibGUub3B0aW9ucy5kcmFnQ2xhc3MgfHwgKChvcmRlciB8fCAhc29ydGFibGUub3B0aW9ucy5vcmRlckNsYXNzKSB8fCAob3JkZXIgJiYgc29ydGFibGUub3B0aW9ucy5vcmRlckNsYXNzICYmIGNoaWxkLmNsYXNzTmFtZSA9PT0gc29ydGFibGUub3B0aW9ucy5vcmRlckNsYXNzKSkpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaXN0LnB1c2goY2hpbGQpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGxpc3RcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzb3J0YWJsZS5lbGVtZW50LmNoaWxkcmVuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwbGFjZSBpbmRpY2F0b3IgaW4gYW4gb3JkZXJlZCBsaXN0XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmdcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9wbGFjZUluT3JkZXJlZExpc3Qoc29ydGFibGUsIGRyYWdnaW5nKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGlkID0gc29ydGFibGUub3B0aW9ucy5zb3J0SWRcclxuICAgICAgICBkcmFnZ2luZy5pbmRpY2F0b3IucmVtb3ZlKClcclxuICAgICAgICBzb3J0YWJsZS5pbmRpY2F0b3IgPSBkcmFnZ2luZy5pbmRpY2F0b3JcclxuICAgICAgICBjb25zdCBkcmFnT3JkZXIgPSBzb3J0YWJsZS5pbmRpY2F0b3IuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgIGxldCBmb3VuZFxyXG4gICAgICAgIGNvbnN0IGVsZW1lbnRzID0gdGhpcy5fZ2V0Q2hpbGRyZW4oc29ydGFibGUsIHRydWUpXHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgZWxlbWVudHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5zb3J0SWRJc051bWJlciA/IHBhcnNlSW50KGRyYWdPcmRlcikgPCBwYXJzZUludChjaGlsZC5nZXRBdHRyaWJ1dGUoaWQpKSA6IGRyYWdPcmRlciA8IGNoaWxkLmdldEF0dHJpYnV0ZShpZCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHNvcnRhYmxlLmluZGljYXRvciwgY2hpbGQpXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRJY29uKGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWZvdW5kKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc29ydGFibGUuZWxlbWVudC5hcHBlbmRDaGlsZChzb3J0YWJsZS5pbmRpY2F0b3IpXHJcbiAgICAgICAgICAgIHRoaXMuX3NldEljb24oZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGZpbmQgbGFzdCBjaGlsZCB0aGF0IGlzIG9mIHR5cGUgZHJhZ0NsYXNzIChpZiBzZXQpXHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2dldExhc3RDaGlsZChzb3J0YWJsZSlcclxuICAgIHtcclxuICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5kZWVwU2VhcmNoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3Qgc2VhcmNoID0gW11cclxuICAgICAgICAgICAgaWYgKHNvcnRhYmxlLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzZWFyY2gucHVzaChzb3J0YWJsZS5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCByZXN1bHRzID0gW11cclxuICAgICAgICAgICAgdGhpcy5fdHJhdmVyc2VDaGlsZHJlbihzb3J0YWJsZS5lbGVtZW50LCBzZWFyY2gsIHJlc3VsdHMpXHJcbiAgICAgICAgICAgIGlmIChyZXN1bHRzLmxlbmd0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHNbcmVzdWx0cy5sZW5ndGggLSAxXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSBzb3J0YWJsZS5lbGVtZW50LmNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkID0gc29ydGFibGUuZWxlbWVudC5jaGlsZHJlbltpXVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZC5jbGFzc05hbWUgPT09IHNvcnRhYmxlLm9wdGlvbnMuZHJhZ0NsYXNzKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNoaWxkXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZS5lbGVtZW50LmNoaWxkcmVuLmxlbmd0aClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc29ydGFibGUuZWxlbWVudC5jaGlsZHJlbltzb3J0YWJsZS5lbGVtZW50LmNoaWxkcmVuLmxlbmd0aCAtIDFdXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNldCBpY29uIGlmIGF2YWlsYWJsZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmdcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKi9cclxuICAgIF9zZXRJY29uKGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgIHtcclxuICAgICAgICBpZiAoZHJhZ2dpbmcuaWNvbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGRyYWdnaW5nLmljb24uc3JjID0gZHJhZ2dpbmcub3JpZ2luYWwgPT09IHNvcnRhYmxlID8gc29ydGFibGUub3B0aW9ucy5pY29ucy5yZW9yZGVyIDogc29ydGFibGUub3B0aW9ucy5pY29ucy5tb3ZlXHJcbiAgICAgICAgICAgIGRyYWdnaW5nLmN1cnJlbnQgPSBzb3J0YWJsZVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZHJhZ2dpbmcub3JpZ2luYWwgPT09IHNvcnRhYmxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc29ydGFibGUuZW1pdCgncmVvcmRlci1wZW5kaW5nJywgZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCd1cGRhdGUtcGVuZGluZycsIHNvcnRhYmxlKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdhZGQtcGVuZGluZycsIGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgZHJhZ2dpbmcub3JpZ2luYWwuZW1pdCgncmVtb3ZlLXBlbmRpbmcnLCBkcmFnZ2luZywgZHJhZ2dpbmcub3JpZ2luYWwpXHJcbiAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ3VwZGF0ZS1wZW5kaW5nJylcclxuICAgICAgICAgICAgZHJhZ2dpbmcub3JpZ2luYWwuZW1pdCgndXBkYXRlLXBlbmRpbmcnKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBsYWNlIGluZGljYXRvciBpbiBhbiBzb3J0YWJsZSBsaXN0XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmdcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9wbGFjZUluU29ydGFibGVMaXN0KHNvcnRhYmxlLCBkcmFnZ2luZylcclxuICAgIHtcclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gc29ydGFibGUuZWxlbWVudFxyXG4gICAgICAgIHNvcnRhYmxlLmVsZW1lbnQuYXBwZW5kQ2hpbGQoZHJhZ2dpbmcuaW5kaWNhdG9yKVxyXG4gICAgICAgIHNvcnRhYmxlLmluZGljYXRvciA9IGRyYWdnaW5nLmluZGljYXRvclxyXG4gICAgICAgIGNvbnN0IGxhc3RDaGlsZCA9IHRoaXMuX2dldExhc3RDaGlsZChzb3J0YWJsZSlcclxuICAgICAgICBpZiAoIWxhc3RDaGlsZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoc29ydGFibGUuaW5kaWNhdG9yKVxyXG4gICAgICAgICAgICB0aGlzLl9zZXRJY29uKGRyYWdnaW5nLCBzb3J0YWJsZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGRyYWdnaW5nLm9mZnNldFRvcCA+PSBlbGVtZW50Lm9mZnNldFRvcCArIGVsZW1lbnQub2Zmc2V0SGVpZ2h0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKHNvcnRhYmxlLmluZGljYXRvcilcclxuICAgICAgICAgICAgICAgIHRoaXMuX3NldEljb24oZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGRyYWdnaW5nLm9mZnNldFRvcCArIGRyYWdnaW5nLm9mZnNldEhlaWdodCA8IGVsZW1lbnQub2Zmc2V0VG9wKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Lmluc2VydEJlZm9yZShzb3J0YWJsZS5pbmRpY2F0b3IsIGVsZW1lbnQuZmlyc3RDaGlsZClcclxuICAgICAgICAgICAgICAgIHRoaXMuX3NldEljb24oZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgeGExID0gZHJhZ2dpbmcub2Zmc2V0TGVmdFxyXG4gICAgICAgICAgICAgICAgY29uc3QgeWExID0gZHJhZ2dpbmcub2Zmc2V0VG9wXHJcbiAgICAgICAgICAgICAgICBjb25zdCB4YTIgPSBkcmFnZ2luZy5vZmZzZXRMZWZ0ICsgZHJhZ2dpbmcub2Zmc2V0V2lkdGhcclxuICAgICAgICAgICAgICAgIGNvbnN0IHlhMiA9IGRyYWdnaW5nLm9mZnNldFRvcCArIGRyYWdnaW5nLm9mZnNldEhlaWdodFxyXG4gICAgICAgICAgICAgICAgbGV0IGxhcmdlc3QgPSAwLCBjbG9zZXN0LCBpc0JlZm9yZSA9IHRydWUsIGluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2VhcmNoID0gW11cclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2gucHVzaChzb3J0YWJsZS5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLm9yZGVyQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoLnB1c2goc29ydGFibGUub3B0aW9ucy5vcmRlckNsYXNzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3QgZWxlbWVudHMgPSB0aGlzLl9nZXRDaGlsZHJlbihzb3J0YWJsZSwgdHJ1ZSlcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGVsZW1lbnRzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZCA9PT0gc29ydGFibGUuaW5kaWNhdG9yKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kaWNhdG9yID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwb3MgPSB0b0dsb2JhbChjaGlsZClcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB4YjEgPSBwb3MueFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHliMSA9IHBvcy55XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeGIyID0gcG9zLnggKyBjaGlsZC5vZmZzZXRXaWR0aFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHliMiA9IHBvcy55ICsgY2hpbGQub2Zmc2V0SGVpZ2h0XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGVyY2VudGFnZSA9IHRoaXMuX3BlcmNlbnRhZ2UoeGExLCB5YTEsIHhhMiwgeWEyLCB4YjEsIHliMSwgeGIyLCB5YjIpXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBlcmNlbnRhZ2UgPiBsYXJnZXN0KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFyZ2VzdCA9IHBlcmNlbnRhZ2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VzdCA9IGNoaWxkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzQmVmb3JlID0gaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGNsb3Nlc3QgJiYgY2xvc2VzdCAhPT0gc29ydGFibGUuaW5kaWNhdG9yKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0JlZm9yZSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKHNvcnRhYmxlLmluZGljYXRvciwgY2xvc2VzdC5uZXh0U2libGluZylcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0SWNvbihkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRhYmxlLmVtaXQoJ2RyYWdnaW5nLW9yZGVyLWNoYW5nZScsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lmluc2VydEJlZm9yZShzb3J0YWJsZS5pbmRpY2F0b3IsIGNsb3Nlc3QpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3NldEljb24oZHJhZ2dpbmcsIHNvcnRhYmxlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3J0YWJsZS5lbWl0KCdkcmFnZ2luZy1vcmRlci1jaGFuZ2UnLCBzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgc29ydGFibGUuZWxlbWVudC5hcHBlbmRDaGlsZChkcmFnZ2luZy5pbmRpY2F0b3IpXHJcbiAgICAgICAgICAgICAgICAgICAgc29ydGFibGUuaW5kaWNhdG9yID0gZHJhZ2dpbmcuaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2V0SWNvbihkcmFnZ2luZywgc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoYW5kbGUgbW92ZVxyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZHJhZ01vdmUoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5kcmFnZ2luZylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5kcmFnZ2luZy5waWNrdXApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9kaXN0YW5jZSh0aGlzLmRyYWdnaW5nLnN0YXJ0LngsIHRoaXMuZHJhZ2dpbmcuc3RhcnQueSwgZS5wYWdlWCwgZS5wYWdlWSkgPiB0aGlzLm9wdGlvbnMudGhyZXNob2xkKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3BpY2t1cChlKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuc3R5bGUubGVmdCA9IGUucGFnZVggKyB0aGlzLm9mZnNldC54ICsgJ3B4J1xyXG4gICAgICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLnRvcCA9IGUucGFnZVkgKyB0aGlzLm9mZnNldC55ICsgJ3B4J1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kcmFnZ2luZy5pY29uKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLmljb24uc3R5bGUubGVmdCA9IGUucGFnZVggKyB0aGlzLm9mZnNldC54ICsgdGhpcy5kcmFnZ2luZy5vZmZzZXRXaWR0aCArICdweCdcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuaWNvbi5zdHlsZS50b3AgPSBlLnBhZ2VZICsgdGhpcy5vZmZzZXQueSArIHRoaXMuZHJhZ2dpbmcub2Zmc2V0SGVpZ2h0ICsgJ3B4J1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGxpc3QgPSBbXVxyXG4gICAgICAgICAgICBmb3IgKGxldCBzb3J0YWJsZSBvZiBTb3J0YWJsZS5saXN0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc29ydGFibGUub3B0aW9ucy5uYW1lID09PSB0aGlzLm9wdGlvbnMubmFtZSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsaXN0LnB1c2goc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wbGFjZUluTGlzdCh0aGlzLCB0aGlzLmRyYWdnaW5nKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2xvc2VzdCA9IHRoaXMuX2ZpbmRDbG9zZXN0KGUsIHRoaXMuZHJhZ2dpbmcsIGxpc3QpXHJcbiAgICAgICAgICAgICAgICBpZiAoY2xvc2VzdClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9wbGFjZUluTGlzdChjbG9zZXN0LCB0aGlzLmRyYWdnaW5nKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuaW5kaWNhdG9yLnJlbW92ZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmcuaWNvbilcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuaWNvbi5zcmMgPSB0aGlzLm9wdGlvbnMuaWNvbnMuZGVsZXRlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIHVwXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kcmFnVXAoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5kcmFnZ2luZylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRyYWdnaW5nLnBpY2t1cClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5zdHlsZS5wb3NpdGlvbiA9ICcnXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLnpJbmRleCA9ICcnXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLmJveFNoYWRvdyA9ICcnXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLm9wYWNpdHkgPSAnJ1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5kaWNhdG9yLnBhcmVudE5vZGUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3IucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGhpcy5kcmFnZ2luZywgdGhpcy5pbmRpY2F0b3IpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5vcmlnaW5hbCA9IHRoaXMuZHJhZ2dpbmcuY3VycmVudFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5kaWNhdG9yLnJlbW92ZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3IgPSBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmcub3JpZ2luYWwgPT09IHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ3Jlb3JkZXInLCB0aGlzLmRyYWdnaW5nLCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ3VwZGF0ZScsIHRoaXMuZHJhZ2dpbmcsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcub3JpZ2luYWwuZW1pdCgncmVtb3ZlJywgdGhpcy5kcmFnZ2luZywgdGhpcy5kcmFnZ2luZy5vcmlnaW5hbClcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5vcmlnaW5hbC5lbWl0KCd1cGRhdGUnLCB0aGlzLmRyYWdnaW5nLCB0aGlzLmRyYWdnaW5nLm9yaWdpbmFsKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2FkZCcsIHRoaXMuZHJhZ2dpbmcsIHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgndXBkYXRlJywgdGhpcy5kcmFnZ2luZywgdGhpcylcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdyZW1vdmUnLCB0aGlzLmRyYWdnaW5nLCB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5kaWNhdG9yLnJlbW92ZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3IgPSBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5yZW1vdmUoKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcub3JpZ2luYWwgPSBudWxsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kcmFnZ2luZy5pY29uKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuaWNvbi5yZW1vdmUoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdjbGlja2VkJywgdGhpcy5kcmFnZ2luZywgdGhpcylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmRyYWdnaW5nID0gbnVsbFxyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB0aGUgZ2xvYmFsIGRlZmF1bHRzIGZvciBuZXcgU29ydGFibGUgb2JqZWN0c1xyXG4gICAgICogQHR5cGUge0RlZmF1bHRPcHRpb25zfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0IGRlZmF1bHRzKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gZGVmYXVsdHNcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNyZWF0ZSBtdWx0aXBsZSBzb3J0YWJsZSBlbGVtZW50c1xyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudHNbXX0gZWxlbWVudHNcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIC0gc2VlIGNvbnN0cnVjdG9yIGZvciBvcHRpb25zXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBjcmVhdGUoZWxlbWVudHMsIG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdXHJcbiAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiBlbGVtZW50cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaChuZXcgU29ydGFibGUoZWxlbWVudCwgb3B0aW9ucykpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHRzXHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU29ydGFibGUiXX0=