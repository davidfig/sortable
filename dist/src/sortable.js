const Events = require('eventemitter3');

const toGlobal = require('./toGlobal');

/**
 * Options for Sortable
 * @typedef {object} DefaultOptions
 * @property {string} [options.name=sortable] dragging is allowed between Sortables with the same name
 * @property {string} [options.dragClass] if set then drag only items with this className under element, otherwise drag all children
 * @property {boolean} [options.sort=true] allow sorting within list
 * @property {string} [options.sortId=data-order] for non-sorting lists, use this data id to figure out sort order
 * @property {boolean} [alwaysInList] place element inside closest related Sortable object, even if outside object's element
 * @property {object} [options.childrenStyles] styles to apply to children elements of Sortable
 */
const defaults = {
    name: 'sortable',
    sort: true,
    sortId: 'data-order',
    threshold: 10,
    dragStyle: {
        boxShadow: '3px 3px 5px rgba(0,0,0,0.25)',
        opacity: 0.85
    },
    childrenStyles: {
        cursor: 'pointer'
    }
};

module.exports = class Sortable extends Events {
    /**
     * Create sortable list
     * @param {HTMLElement} element
     * @param {DefaultOptions} [options]
    //  * @param {string} [options.name=sortable] dragging is allowed between Sortables with the same name
    //  * @param {boolean} [options.sort=true] allow sorting within list
    //  * @param {string} [options.dragClass] if set then drag only items with this className under element, otherwise use all children
    //  * @param {string} [options.sortId=data-order] for non-sorting lists, use this data id to figure out sort order
    //  * @param {boolean} [alwaysInList] place element inside closest related Sortable object, even if outside object's element
    //  * @param {object} [options.childrenStyles] styles to apply to children elements of Sortable
     * @fires dropped
     * @fires dragging-order-changed
     */
    constructor(element, options) {
        super();
        this.options = options || {};
        for (let option in defaults) {
            this.options[option] = typeof this.options[option] !== 'undefined' ? options[option] : defaults[option];
        }
        for (let child of element.children) {
            if (!this.options.dragClass || child.className === this.options.dragClass) {
                child.addEventListener('mousedown', e => this._dragStart(e));
                child.addEventListener('touchstart', e => this._dragStart(e));
                for (let option in this.options.childrenStyles) {
                    child.style[option] = this.options.childrenStyles[option];
                }
            }
        }
        document.body.addEventListener('mousemove', e => this._dragMove(e));
        document.body.addEventListener('touchmove', e => this._dragMove(e));
        document.body.addEventListener('touchup', e => this._dragUp(e));
        document.body.addEventListener('touchcancel', e => this._dragUp(e));
        document.body.addEventListener('mouseup', e => this._dragUp(e));
        document.body.addEventListener('mousecancel', e => this._dragUp(e));
        this.element = element;

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
     * @param {Sortable[]} list of related Sortables
     * @private
     */
    _findClosest(e, list) {
        function inside(element) {
            const x1 = e.pageX;
            const y1 = e.pageY;
            const x2 = element.offsetLeft;
            const y2 = element.offsetTop;
            const h1 = element.offsetWidth;
            const w1 = element.offsetHeight;
            return x2 >= x1 && x2 <= x1 + w1 && y2 >= y1 && y2 <= y1 + h1;
        }

        let min = Infinity,
            found;
        for (let related of list) {
            if (inside(related)) {
                return related;
            } else {
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
    static _percentage(xa1, ya1, xa2, ya2, xb1, yb1, xb2, yb2) {
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
    static _placeInList(sortable, place) {
        if (sortable.options.sort) {
            Sortable._placeInSortableList(sortable, place);
        } else {
            Sortable._placeInOrderedList(sortable, place);
        }
    }

    /**
     * place indicator in an ordered list
     * @param {Sortable} sortable
     * @param {HTMLElement} dragging
     * @private
     */
    static _placeInOrderedList(sortable, dragging) {
        const id = sortable.options.sortId;
        dragging.indicator.remove();
        sortable.indicator = dragging.indicator;
        const dragOrder = sortable.indicator.getAttribute(id);
        let found;
        for (let child of sortable.element.children) {
            if (dragOrder < child.getAttribute(id)) {
                sortable.element.insertBefore(sortable.indicator, child);
                found = true;
                break;
            }
        }
        if (!found) {
            sortable.element.appendChild(sortable.indicator);
        }
    }

    /**
     * find last child that is of type dragClass (if set)
     * @param {Sortable} sortable
     * @param {HTMLElement} element
     * @private
     */
    static _getLastChild(sortable, element) {
        let i = element.children.length - 1;
        if (i < 0) {
            return null;
        }
        while (i > 0 && sortable.options.dragClass && element.children[i].className !== sortable.options.dragClass) {
            i--;
        }
        return element.children[i];
    }

    /**
     * place indicator in an sortable list
     * @param {Sortable} sortable
     * @param {HTMLElement} dragging
     * @private
     */
    static _placeInSortableList(sortable, dragging) {
        const element = sortable.element;
        sortable.element.appendChild(dragging.indicator);
        sortable.indicator = dragging.indicator;
        const lastChild = Sortable._getLastChild(sortable, element);
        if (!lastChild) {
            element.appendChild(sortable.indicator);
        } else {
            if (dragging.offsetTop >= element.offsetTop + element.offsetHeight) {
                element.appendChild(sortable.indicator);
            } else if (dragging.offsetTop + dragging.offsetHeight < element.offsetTop) {
                element.insertBefore(sortable.indicator, element.firstChild);
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
                for (let child of element.children) {
                    if (child === sortable.indicator) {
                        indicator = true;
                    }
                    const pos = toGlobal(child);
                    const xb1 = pos.x;
                    const yb1 = pos.y;
                    const xb2 = pos.x + child.offsetWidth;
                    const yb2 = pos.y + child.offsetHeight;
                    const percentage = Sortable._percentage(xa1, ya1, xa2, ya2, xb1, yb1, xb2, yb2);
                    if (percentage > largest) {
                        largest = percentage;
                        closest = child;
                        isBefore = indicator;
                    }
                }
                if (closest && closest !== sortable.indicator) {
                    if (isBefore) {
                        element.insertBefore(sortable.indicator, closest.nextSibling);
                        sortable.emit('dragging-order-change', sortable);
                    } else {
                        element.insertBefore(sortable.indicator, closest);
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
            const list = [];
            for (let sortable of Sortable.list) {
                if (sortable.options.name === this.options.name) {
                    list.push(sortable);
                }
            }
            if (list.length === 1) {
                Sortable._placeInList(this, this.dragging);
            } else {
                Sortable._placeInList(this._findClosest(e, list), this.dragging);
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
                this.indicator.parentNode.insertBefore(this.dragging, this.indicator);
                this.dragging.style.position = '';
                this.dragging.style.zIndex = '';
                this.dragging.style.boxShadow = '';
                this.dragging.style.opacity = '';
                this.indicator.remove();
                this.indicator = null;
                this.emit('dropped', this.dragging);
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
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zb3J0YWJsZS5qcyJdLCJuYW1lcyI6WyJFdmVudHMiLCJyZXF1aXJlIiwidG9HbG9iYWwiLCJkZWZhdWx0cyIsIm5hbWUiLCJzb3J0Iiwic29ydElkIiwidGhyZXNob2xkIiwiZHJhZ1N0eWxlIiwiYm94U2hhZG93Iiwib3BhY2l0eSIsImNoaWxkcmVuU3R5bGVzIiwiY3Vyc29yIiwibW9kdWxlIiwiZXhwb3J0cyIsIlNvcnRhYmxlIiwiY29uc3RydWN0b3IiLCJlbGVtZW50Iiwib3B0aW9ucyIsIm9wdGlvbiIsImNoaWxkIiwiY2hpbGRyZW4iLCJkcmFnQ2xhc3MiLCJjbGFzc05hbWUiLCJhZGRFdmVudExpc3RlbmVyIiwiZSIsIl9kcmFnU3RhcnQiLCJzdHlsZSIsImRvY3VtZW50IiwiYm9keSIsIl9kcmFnTW92ZSIsIl9kcmFnVXAiLCJsaXN0IiwicHVzaCIsImRyYWdnaW5nIiwiY3VycmVudFRhcmdldCIsInBpY2t1cCIsInN0YXJ0IiwieCIsInBhZ2VYIiwieSIsInBhZ2VZIiwicHJldmVudERlZmF1bHQiLCJfcGlja3VwIiwiaW5kaWNhdG9yIiwiY2xvbmVOb2RlIiwicG9zIiwicG9zaXRpb24iLCJvZmZzZXQiLCJsZWZ0IiwidG9wIiwicGFyZW50Tm9kZSIsImluc2VydEJlZm9yZSIsImFwcGVuZENoaWxkIiwiX2Rpc3RhbmNlIiwieDEiLCJ5MSIsIngyIiwieTIiLCJNYXRoIiwic3FydCIsInBvdyIsIl9kaXN0YW5jZVRvQ2xvc2VzdENvcm5lciIsInRvcExlZnQiLCJvZmZzZXRMZWZ0Iiwib2Zmc2V0VG9wIiwidG9wUmlnaHQiLCJvZmZzZXRXaWR0aCIsImJvdHRvbUxlZnQiLCJvZmZzZXRIZWlnaHQiLCJib3R0b21SaWdodCIsIm1pbiIsIl9maW5kQ2xvc2VzdCIsImluc2lkZSIsImgxIiwidzEiLCJJbmZpbml0eSIsImZvdW5kIiwicmVsYXRlZCIsImNhbGN1bGF0ZSIsIl9wZXJjZW50YWdlIiwieGExIiwieWExIiwieGEyIiwieWEyIiwieGIxIiwieWIxIiwieGIyIiwieWIyIiwic2EiLCJzYiIsInNpIiwibWF4IiwidW5pb24iLCJfcGxhY2VJbkxpc3QiLCJzb3J0YWJsZSIsInBsYWNlIiwiX3BsYWNlSW5Tb3J0YWJsZUxpc3QiLCJfcGxhY2VJbk9yZGVyZWRMaXN0IiwiaWQiLCJyZW1vdmUiLCJkcmFnT3JkZXIiLCJnZXRBdHRyaWJ1dGUiLCJfZ2V0TGFzdENoaWxkIiwiaSIsImxlbmd0aCIsImxhc3RDaGlsZCIsImZpcnN0Q2hpbGQiLCJsYXJnZXN0IiwiY2xvc2VzdCIsImlzQmVmb3JlIiwicGVyY2VudGFnZSIsIm5leHRTaWJsaW5nIiwiZW1pdCIsInN0b3BQcm9wYWdhdGlvbiIsInpJbmRleCJdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTUEsU0FBU0MsUUFBUSxlQUFSLENBQWY7O0FBRUEsTUFBTUMsV0FBV0QsUUFBUSxZQUFSLENBQWpCOztBQUVBOzs7Ozs7Ozs7O0FBVUEsTUFBTUUsV0FBVztBQUNiQyxVQUFNLFVBRE87QUFFYkMsVUFBTSxJQUZPO0FBR2JDLFlBQVEsWUFISztBQUliQyxlQUFXLEVBSkU7QUFLYkMsZUFBVztBQUNQQyxtQkFBVyw4QkFESjtBQUVQQyxpQkFBUztBQUZGLEtBTEU7QUFTYkMsb0JBQWdCO0FBQ1pDLGdCQUFRO0FBREk7QUFUSCxDQUFqQjs7QUFjQUMsT0FBT0MsT0FBUCxHQUFpQixNQUFNQyxRQUFOLFNBQXVCZixNQUF2QixDQUNqQjtBQUNJOzs7Ozs7Ozs7Ozs7O0FBYUFnQixnQkFBWUMsT0FBWixFQUFxQkMsT0FBckIsRUFDQTtBQUNJO0FBQ0EsYUFBS0EsT0FBTCxHQUFlQSxXQUFXLEVBQTFCO0FBQ0EsYUFBSyxJQUFJQyxNQUFULElBQW1CaEIsUUFBbkIsRUFDQTtBQUNJLGlCQUFLZSxPQUFMLENBQWFDLE1BQWIsSUFBdUIsT0FBTyxLQUFLRCxPQUFMLENBQWFDLE1BQWIsQ0FBUCxLQUFnQyxXQUFoQyxHQUE4Q0QsUUFBUUMsTUFBUixDQUE5QyxHQUFnRWhCLFNBQVNnQixNQUFU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QztBQUNILGFBSEQsTUFLQTtBQUNJbkIseUJBQVMrRSxZQUFULENBQXNCLEtBQUt0QixZQUFMLENBQWtCL0MsQ0FBbEIsRUFBcUJPLElBQXJCLENBQXRCLEVBQWtELEtBQUtFLFFBQXZEO0FBQ0g7QUFDRFQsY0FBRWlCLGNBQUY7QUFDQWpCLGNBQUV5RixlQUFGO0FBQ0g7QUFDSjs7QUFFRDs7Ozs7QUFLQW5GLFlBQVFOLENBQVIsRUFDQTtBQUNJLFlBQUksS0FBS1MsUUFBVCxFQUNBO0FBQ0ksZ0JBQUksS0FBS0EsUUFBTCxDQUFjRSxNQUFsQixFQUNBO0FBQ0kscUJBQUtRLFNBQUwsQ0FBZU8sVUFBZixDQUEwQkMsWUFBMUIsQ0FBdUMsS0FBS2xCLFFBQTVDLEVBQXNELEtBQUtVLFNBQTNEO0FBQ0EscUJBQUtWLFFBQUwsQ0FBY1AsS0FBZCxDQUFvQm9CLFFBQXBCLEdBQStCLEVBQS9CO0FBQ0EscUJBQUtiLFFBQUwsQ0FBY1AsS0FBZCxDQUFvQndGLE1BQXBCLEdBQTZCLEVBQTdCO0FBQ0EscUJBQUtqRixRQUFMLENBQWNQLEtBQWQsQ0FBb0JsQixTQUFwQixHQUFnQyxFQUFoQztBQUNBLHFCQUFLeUIsUUFBTCxDQUFjUCxLQUFkLENBQW9CakIsT0FBcEIsR0FBOEIsRUFBOUI7QUFDQSxxQkFBS2tDLFNBQUwsQ0FBZXdELE1BQWY7QUFDQSxxQkFBS3hELFNBQUwsR0FBaUIsSUFBakI7QUFDQSxxQkFBS3FFLElBQUwsQ0FBVSxTQUFWLEVBQXFCLEtBQUsvRSxRQUExQjtBQUNIO0FBQ0QsaUJBQUtBLFFBQUwsR0FBZ0IsSUFBaEI7QUFDQVQsY0FBRWlCLGNBQUY7QUFDSDtBQUNKOztBQUVEOzs7O0FBSUEsZUFBV3ZDLFFBQVgsR0FDQTtBQUNJLGVBQU9BLFFBQVA7QUFDSDtBQW5ZTCxDQURBIiwiZmlsZSI6InNvcnRhYmxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgRXZlbnRzID0gcmVxdWlyZSgnZXZlbnRlbWl0dGVyMycpXHJcblxyXG5jb25zdCB0b0dsb2JhbCA9IHJlcXVpcmUoJy4vdG9HbG9iYWwnKVxyXG5cclxuLyoqXHJcbiAqIE9wdGlvbnMgZm9yIFNvcnRhYmxlXHJcbiAqIEB0eXBlZGVmIHtvYmplY3R9IERlZmF1bHRPcHRpb25zXHJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbb3B0aW9ucy5uYW1lPXNvcnRhYmxlXSBkcmFnZ2luZyBpcyBhbGxvd2VkIGJldHdlZW4gU29ydGFibGVzIHdpdGggdGhlIHNhbWUgbmFtZVxyXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW29wdGlvbnMuZHJhZ0NsYXNzXSBpZiBzZXQgdGhlbiBkcmFnIG9ubHkgaXRlbXMgd2l0aCB0aGlzIGNsYXNzTmFtZSB1bmRlciBlbGVtZW50LCBvdGhlcndpc2UgZHJhZyBhbGwgY2hpbGRyZW5cclxuICogQHByb3BlcnR5IHtib29sZWFufSBbb3B0aW9ucy5zb3J0PXRydWVdIGFsbG93IHNvcnRpbmcgd2l0aGluIGxpc3RcclxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtvcHRpb25zLnNvcnRJZD1kYXRhLW9yZGVyXSBmb3Igbm9uLXNvcnRpbmcgbGlzdHMsIHVzZSB0aGlzIGRhdGEgaWQgdG8gZmlndXJlIG91dCBzb3J0IG9yZGVyXHJcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW2Fsd2F5c0luTGlzdF0gcGxhY2UgZWxlbWVudCBpbnNpZGUgY2xvc2VzdCByZWxhdGVkIFNvcnRhYmxlIG9iamVjdCwgZXZlbiBpZiBvdXRzaWRlIG9iamVjdCdzIGVsZW1lbnRcclxuICogQHByb3BlcnR5IHtvYmplY3R9IFtvcHRpb25zLmNoaWxkcmVuU3R5bGVzXSBzdHlsZXMgdG8gYXBwbHkgdG8gY2hpbGRyZW4gZWxlbWVudHMgb2YgU29ydGFibGVcclxuICovXHJcbmNvbnN0IGRlZmF1bHRzID0ge1xyXG4gICAgbmFtZTogJ3NvcnRhYmxlJyxcclxuICAgIHNvcnQ6IHRydWUsXHJcbiAgICBzb3J0SWQ6ICdkYXRhLW9yZGVyJyxcclxuICAgIHRocmVzaG9sZDogMTAsXHJcbiAgICBkcmFnU3R5bGU6IHtcclxuICAgICAgICBib3hTaGFkb3c6ICczcHggM3B4IDVweCByZ2JhKDAsMCwwLDAuMjUpJyxcclxuICAgICAgICBvcGFjaXR5OiAwLjg1XHJcbiAgICB9LFxyXG4gICAgY2hpbGRyZW5TdHlsZXM6IHtcclxuICAgICAgICBjdXJzb3I6ICdwb2ludGVyJ1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFNvcnRhYmxlIGV4dGVuZHMgRXZlbnRzXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIHNvcnRhYmxlIGxpc3RcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSB7RGVmYXVsdE9wdGlvbnN9IFtvcHRpb25zXVxyXG4gICAgLy8gICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLm5hbWU9c29ydGFibGVdIGRyYWdnaW5nIGlzIGFsbG93ZWQgYmV0d2VlbiBTb3J0YWJsZXMgd2l0aCB0aGUgc2FtZSBuYW1lXHJcbiAgICAvLyAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnNvcnQ9dHJ1ZV0gYWxsb3cgc29ydGluZyB3aXRoaW4gbGlzdFxyXG4gICAgLy8gICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmRyYWdDbGFzc10gaWYgc2V0IHRoZW4gZHJhZyBvbmx5IGl0ZW1zIHdpdGggdGhpcyBjbGFzc05hbWUgdW5kZXIgZWxlbWVudCwgb3RoZXJ3aXNlIHVzZSBhbGwgY2hpbGRyZW5cclxuICAgIC8vICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5zb3J0SWQ9ZGF0YS1vcmRlcl0gZm9yIG5vbi1zb3J0aW5nIGxpc3RzLCB1c2UgdGhpcyBkYXRhIGlkIHRvIGZpZ3VyZSBvdXQgc29ydCBvcmRlclxyXG4gICAgLy8gICogQHBhcmFtIHtib29sZWFufSBbYWx3YXlzSW5MaXN0XSBwbGFjZSBlbGVtZW50IGluc2lkZSBjbG9zZXN0IHJlbGF0ZWQgU29ydGFibGUgb2JqZWN0LCBldmVuIGlmIG91dHNpZGUgb2JqZWN0J3MgZWxlbWVudFxyXG4gICAgLy8gICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zLmNoaWxkcmVuU3R5bGVzXSBzdHlsZXMgdG8gYXBwbHkgdG8gY2hpbGRyZW4gZWxlbWVudHMgb2YgU29ydGFibGVcclxuICAgICAqIEBmaXJlcyBkcm9wcGVkXHJcbiAgICAgKiBAZmlyZXMgZHJhZ2dpbmctb3JkZXItY2hhbmdlZFxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIHN1cGVyKClcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgZm9yIChsZXQgb3B0aW9uIGluIGRlZmF1bHRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zW29wdGlvbl0gPSB0eXBlb2YgdGhpcy5vcHRpb25zW29wdGlvbl0gIT09ICd1bmRlZmluZWQnID8gb3B0aW9uc1tvcHRpb25dIDogZGVmYXVsdHNbb3B0aW9uXVxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBlbGVtZW50LmNoaWxkcmVuKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuZHJhZ0NsYXNzIHx8IGNoaWxkLmNsYXNzTmFtZSA9PT0gdGhpcy5vcHRpb25zLmRyYWdDbGFzcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKGUpID0+IHRoaXMuX2RyYWdTdGFydChlKSlcclxuICAgICAgICAgICAgICAgIGNoaWxkLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCAoZSkgPT4gdGhpcy5fZHJhZ1N0YXJ0KGUpKVxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgb3B0aW9uIGluIHRoaXMub3B0aW9ucy5jaGlsZHJlblN0eWxlcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZC5zdHlsZVtvcHRpb25dID0gdGhpcy5vcHRpb25zLmNoaWxkcmVuU3R5bGVzW29wdGlvbl1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIChlKSA9PiB0aGlzLl9kcmFnTW92ZShlKSlcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIChlKSA9PiB0aGlzLl9kcmFnTW92ZShlKSlcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNodXAnLCAoZSkgPT4gdGhpcy5fZHJhZ1VwKGUpKVxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hjYW5jZWwnLCAoZSkgPT4gdGhpcy5fZHJhZ1VwKGUpKVxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIChlKSA9PiB0aGlzLl9kcmFnVXAoZSkpXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWNhbmNlbCcsIChlKSA9PiB0aGlzLl9kcmFnVXAoZSkpXHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudFxyXG5cclxuICAgICAgICBpZiAoIVNvcnRhYmxlLmxpc3QpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBTb3J0YWJsZS5saXN0ID0gW11cclxuICAgICAgICB9XHJcbiAgICAgICAgU29ydGFibGUubGlzdC5wdXNoKHRoaXMpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzdGFydCBkcmFnXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kcmFnU3RhcnQoZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLmRyYWdnaW5nID0gZS5jdXJyZW50VGFyZ2V0XHJcbiAgICAgICAgdGhpcy5kcmFnZ2luZy5waWNrdXAgPSBmYWxzZVxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcuc3RhcnQgPSB7IHg6IGUucGFnZVgsIHk6IGUucGFnZVkgfVxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcuc3R5bGUuY3Vyc29yID0gJ25vLWN1cnNvcidcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBpY2t1cCBhbmQgY2xvbmUgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtVSUV2ZW50fSBlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfcGlja3VwKGUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5pbmRpY2F0b3IgPSB0aGlzLmRyYWdnaW5nLmNsb25lTm9kZSh0cnVlKVxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcuaW5kaWNhdG9yID0gdGhpcy5pbmRpY2F0b3JcclxuICAgICAgICBjb25zdCBwb3MgPSB0b0dsb2JhbCh0aGlzLmRyYWdnaW5nKVxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXHJcbiAgICAgICAgdGhpcy5vZmZzZXQgPSB7IHg6IHBvcy54IC0gZS5wYWdlWCwgeTogcG9zLnkgLSBlLnBhZ2VZIH1cclxuICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLmxlZnQgPSBwb3MueCArICdweCdcclxuICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLnRvcCA9IHBvcy55ICsgJ3B4J1xyXG4gICAgICAgIGZvciAobGV0IG9wdGlvbiBpbiB0aGlzLm9wdGlvbnMuZHJhZ1N0eWxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5zdHlsZVtvcHRpb25dID0gdGhpcy5vcHRpb25zLmRyYWdTdHlsZVtvcHRpb25dXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGhpcy5pbmRpY2F0b3IsIHRoaXMuZHJhZ2dpbmcpXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmRyYWdnaW5nKVxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcucGlja3VwID0gdHJ1ZVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogbWVhc3VyZSBkaXN0YW5jZSBiZXR3ZWVuIHR3byBwb2ludHNcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB4MVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHkxXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0geDJcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB5MlxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2Rpc3RhbmNlKHgxLCB5MSwgeDIsIHkyKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3coeDEgLSB4MiwgMikgKyBNYXRoLnBvdyh5MSAtIHkyLCAyKSlcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGZpbmQgY2xvc2VzdCBkaXN0YW5jZSBmcm9tIFVJRXZlbnQgdG8gYSBjb3JuZXIgb2YgYW4gZWxlbWVudFxyXG4gICAgICogQHBhcmFtIHtIVE1MVUxpc3RFbGVtZW50fSBlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBfZGlzdGFuY2VUb0Nsb3Nlc3RDb3JuZXIoZSwgZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBjb25zdCB0b3BMZWZ0ID0gdGhpcy5fZGlzdGFuY2UoZS5wYWdlWCwgZS5wYWdlWSwgZWxlbWVudC5vZmZzZXRMZWZ0LCBlbGVtZW50Lm9mZnNldFRvcClcclxuICAgICAgICBjb25zdCB0b3BSaWdodCA9IHRoaXMuX2Rpc3RhbmNlKGUucGFnZVgsIGUucGFnZVksIGVsZW1lbnQub2Zmc2V0TGVmdCArIGVsZW1lbnQub2Zmc2V0V2lkdGgsIGVsZW1lbnQub2Zmc2V0VG9wKVxyXG4gICAgICAgIGNvbnN0IGJvdHRvbUxlZnQgPSB0aGlzLl9kaXN0YW5jZShlLnBhZ2VYLCBlLnBhZ2VZLCBlbGVtZW50Lm9mZnNldExlZnQsIGVsZW1lbnQub2Zmc2V0VG9wICsgZWxlbWVudC5vZmZzZXRIZWlnaHQpXHJcbiAgICAgICAgY29uc3QgYm90dG9tUmlnaHQgPSB0aGlzLl9kaXN0YW5jZShlLnBhZ2VYLCBlLnBhZ2VZLCBlbGVtZW50Lm9mZnNldExlZnQgKyBlbGVtZW50Lm9mZnNldFdpZHRoLCBlbGVtZW50Lm9mZnNldFRvcCArIGVsZW1lbnQub2Zmc2V0SGVpZ2h0KVxyXG4gICAgICAgIHJldHVybiBNYXRoLm1pbih0b3BMZWZ0LCB0b3BSaWdodCwgYm90dG9tTGVmdCwgYm90dG9tUmlnaHQpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmaW5kIGNsb3Nlc3QgU29ydGFibGUgdG8gc2NyZWVuIGxvY2F0aW9uXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGVbXX0gbGlzdCBvZiByZWxhdGVkIFNvcnRhYmxlc1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2ZpbmRDbG9zZXN0KGUsIGxpc3QpXHJcbiAgICB7XHJcbiAgICAgICAgZnVuY3Rpb24gaW5zaWRlKGVsZW1lbnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCB4MSA9IGUucGFnZVhcclxuICAgICAgICAgICAgY29uc3QgeTEgPSBlLnBhZ2VZXHJcbiAgICAgICAgICAgIGNvbnN0IHgyID0gZWxlbWVudC5vZmZzZXRMZWZ0XHJcbiAgICAgICAgICAgIGNvbnN0IHkyID0gZWxlbWVudC5vZmZzZXRUb3BcclxuICAgICAgICAgICAgY29uc3QgaDEgPSBlbGVtZW50Lm9mZnNldFdpZHRoXHJcbiAgICAgICAgICAgIGNvbnN0IHcxID0gZWxlbWVudC5vZmZzZXRIZWlnaHRcclxuICAgICAgICAgICAgcmV0dXJuIHgyID49IHgxICYmIHgyIDw9IHgxICsgdzEgJiYgeTIgPj0geTEgJiYgeTIgPD0geTEgKyBoMVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG1pbiA9IEluZmluaXR5LCBmb3VuZFxyXG4gICAgICAgIGZvciAobGV0IHJlbGF0ZWQgb2YgbGlzdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChpbnNpZGUocmVsYXRlZCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZWxhdGVkXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjYWxjdWxhdGUgPSB0aGlzLl9kaXN0YW5jZVRvQ2xvc2VzdENvcm5lcihlLCByZWxhdGVkLmVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICBpZiAoY2FsY3VsYXRlIDwgbWluKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG1pbiA9IGNhbGN1bGF0ZVxyXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gcmVsYXRlZFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmb3VuZFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhhMVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHlhMVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhhMlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhhMlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhiMVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHliMVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHhiMlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHliMlxyXG4gICAgICogY2FsY3VsYXRlIHBlcmNlbnRhZ2Ugb2Ygb3ZlcmxhcCBiZXR3ZWVuIHR3byBib3hlc1xyXG4gICAgICogZnJvbSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjEyMjAwMDQvMTk1NTk5N1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgc3RhdGljIF9wZXJjZW50YWdlKHhhMSwgeWExLCB4YTIsIHlhMiwgeGIxLCB5YjEsIHhiMiwgeWIyKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHNhID0gKHhhMiAtIHhhMSkgKiAoeWEyIC0geWExKVxyXG4gICAgICAgIGNvbnN0IHNiID0gKHhiMiAtIHhiMSkgKiAoeWIyIC0geWIxKVxyXG4gICAgICAgIGNvbnN0IHNpID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oeGEyLCB4YjIpIC0gTWF0aC5tYXgoeGExLCB4YjEpKSAqIE1hdGgubWF4KDAsIE1hdGgubWluKHlhMiwgeWIyKSAtIE1hdGgubWF4KHlhMSwgeWIxKSlcclxuICAgICAgICBjb25zdCB1bmlvbiA9IHNhICsgc2IgLSBzaVxyXG4gICAgICAgIHJldHVybiBzaSAvIHVuaW9uXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBwbGFjZSBpbmRpY2F0b3IgaW4gdGhlIHNvcnRhYmxlIGxpc3QgYWNjb3JkaW5nIHRvIG9wdGlvbnMuc29ydFxyXG4gICAgICogQHBhcmFtIHtTb3J0YWJsZX0gc29ydGFibGVcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGRyYWdnaW5nIGVsZW1lbnRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBfcGxhY2VJbkxpc3Qoc29ydGFibGUsIHBsYWNlKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLnNvcnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBTb3J0YWJsZS5fcGxhY2VJblNvcnRhYmxlTGlzdChzb3J0YWJsZSwgcGxhY2UpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFNvcnRhYmxlLl9wbGFjZUluT3JkZXJlZExpc3Qoc29ydGFibGUsIHBsYWNlKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBsYWNlIGluZGljYXRvciBpbiBhbiBvcmRlcmVkIGxpc3RcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBkcmFnZ2luZ1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgc3RhdGljIF9wbGFjZUluT3JkZXJlZExpc3Qoc29ydGFibGUsIGRyYWdnaW5nKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGlkID0gc29ydGFibGUub3B0aW9ucy5zb3J0SWRcclxuICAgICAgICBkcmFnZ2luZy5pbmRpY2F0b3IucmVtb3ZlKClcclxuICAgICAgICBzb3J0YWJsZS5pbmRpY2F0b3IgPSBkcmFnZ2luZy5pbmRpY2F0b3JcclxuICAgICAgICBjb25zdCBkcmFnT3JkZXIgPSBzb3J0YWJsZS5pbmRpY2F0b3IuZ2V0QXR0cmlidXRlKGlkKVxyXG4gICAgICAgIGxldCBmb3VuZFxyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIHNvcnRhYmxlLmVsZW1lbnQuY2hpbGRyZW4pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoZHJhZ09yZGVyIDwgY2hpbGQuZ2V0QXR0cmlidXRlKGlkKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc29ydGFibGUuZWxlbWVudC5pbnNlcnRCZWZvcmUoc29ydGFibGUuaW5kaWNhdG9yLCBjaGlsZClcclxuICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWZvdW5kKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc29ydGFibGUuZWxlbWVudC5hcHBlbmRDaGlsZChzb3J0YWJsZS5pbmRpY2F0b3IpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZmluZCBsYXN0IGNoaWxkIHRoYXQgaXMgb2YgdHlwZSBkcmFnQ2xhc3MgKGlmIHNldClcclxuICAgICAqIEBwYXJhbSB7U29ydGFibGV9IHNvcnRhYmxlXHJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgX2dldExhc3RDaGlsZChzb3J0YWJsZSwgZWxlbWVudClcclxuICAgIHtcclxuICAgICAgICBsZXQgaSA9IGVsZW1lbnQuY2hpbGRyZW4ubGVuZ3RoIC0gMVxyXG4gICAgICAgIGlmIChpIDwgMClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdoaWxlIChpID4gMCAmJiBzb3J0YWJsZS5vcHRpb25zLmRyYWdDbGFzcyAmJiBlbGVtZW50LmNoaWxkcmVuW2ldLmNsYXNzTmFtZSAhPT0gc29ydGFibGUub3B0aW9ucy5kcmFnQ2xhc3MpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpLS1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQuY2hpbGRyZW5baV1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHBsYWNlIGluZGljYXRvciBpbiBhbiBzb3J0YWJsZSBsaXN0XHJcbiAgICAgKiBAcGFyYW0ge1NvcnRhYmxlfSBzb3J0YWJsZVxyXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZHJhZ2dpbmdcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBfcGxhY2VJblNvcnRhYmxlTGlzdChzb3J0YWJsZSwgZHJhZ2dpbmcpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHNvcnRhYmxlLmVsZW1lbnRcclxuICAgICAgICBzb3J0YWJsZS5lbGVtZW50LmFwcGVuZENoaWxkKGRyYWdnaW5nLmluZGljYXRvcilcclxuICAgICAgICBzb3J0YWJsZS5pbmRpY2F0b3IgPSBkcmFnZ2luZy5pbmRpY2F0b3JcclxuICAgICAgICBjb25zdCBsYXN0Q2hpbGQgPSBTb3J0YWJsZS5fZ2V0TGFzdENoaWxkKHNvcnRhYmxlLCBlbGVtZW50KVxyXG4gICAgICAgIGlmICghbGFzdENoaWxkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChzb3J0YWJsZS5pbmRpY2F0b3IpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZy5vZmZzZXRUb3AgPj0gZWxlbWVudC5vZmZzZXRUb3AgKyBlbGVtZW50Lm9mZnNldEhlaWdodClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChzb3J0YWJsZS5pbmRpY2F0b3IpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoZHJhZ2dpbmcub2Zmc2V0VG9wICsgZHJhZ2dpbmcub2Zmc2V0SGVpZ2h0IDwgZWxlbWVudC5vZmZzZXRUb3ApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKHNvcnRhYmxlLmluZGljYXRvciwgZWxlbWVudC5maXJzdENoaWxkKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc29ydGFibGUuZWxlbWVudC5hcHBlbmRDaGlsZChkcmFnZ2luZy5pbmRpY2F0b3IpXHJcbiAgICAgICAgICAgICAgICBzb3J0YWJsZS5pbmRpY2F0b3IgPSBkcmFnZ2luZy5pbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgIGNvbnN0IHhhMSA9IGRyYWdnaW5nLm9mZnNldExlZnRcclxuICAgICAgICAgICAgICAgIGNvbnN0IHlhMSA9IGRyYWdnaW5nLm9mZnNldFRvcFxyXG4gICAgICAgICAgICAgICAgY29uc3QgeGEyID0gZHJhZ2dpbmcub2Zmc2V0TGVmdCArIGRyYWdnaW5nLm9mZnNldFdpZHRoXHJcbiAgICAgICAgICAgICAgICBjb25zdCB5YTIgPSBkcmFnZ2luZy5vZmZzZXRUb3AgKyBkcmFnZ2luZy5vZmZzZXRIZWlnaHRcclxuICAgICAgICAgICAgICAgIGxldCBsYXJnZXN0ID0gMCwgY2xvc2VzdCwgaXNCZWZvcmUgPSB0cnVlLCBpbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIGVsZW1lbnQuY2hpbGRyZW4pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkID09PSBzb3J0YWJsZS5pbmRpY2F0b3IpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRpY2F0b3IgPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvcyA9IHRvR2xvYmFsKGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHhiMSA9IHBvcy54XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeWIxID0gcG9zLnlcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB4YjIgPSBwb3MueCArIGNoaWxkLm9mZnNldFdpZHRoXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeWIyID0gcG9zLnkgKyBjaGlsZC5vZmZzZXRIZWlnaHRcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwZXJjZW50YWdlID0gU29ydGFibGUuX3BlcmNlbnRhZ2UoeGExLCB5YTEsIHhhMiwgeWEyLCB4YjEsIHliMSwgeGIyLCB5YjIpXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBlcmNlbnRhZ2UgPiBsYXJnZXN0KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFyZ2VzdCA9IHBlcmNlbnRhZ2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VzdCA9IGNoaWxkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzQmVmb3JlID0gaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGNsb3Nlc3QgJiYgY2xvc2VzdCAhPT0gc29ydGFibGUuaW5kaWNhdG9yKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0JlZm9yZSlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKHNvcnRhYmxlLmluZGljYXRvciwgY2xvc2VzdC5uZXh0U2libGluZylcclxuICAgICAgICAgICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnZHJhZ2dpbmctb3JkZXItY2hhbmdlJywgc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKHNvcnRhYmxlLmluZGljYXRvciwgY2xvc2VzdClcclxuICAgICAgICAgICAgICAgICAgICAgICAgc29ydGFibGUuZW1pdCgnZHJhZ2dpbmctb3JkZXItY2hhbmdlJywgc29ydGFibGUpXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIG1vdmVcclxuICAgICAqIEBwYXJhbSB7VUlFdmVudH0gZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgX2RyYWdNb3ZlKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZHJhZ2dpbmcucGlja3VwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fZGlzdGFuY2UodGhpcy5kcmFnZ2luZy5zdGFydC54LCB0aGlzLmRyYWdnaW5nLnN0YXJ0LnksIGUucGFnZVgsIGUucGFnZVkpID4gdGhpcy5vcHRpb25zLnRocmVzaG9sZClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9waWNrdXAoZSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLmxlZnQgPSBlLnBhZ2VYICsgdGhpcy5vZmZzZXQueCArICdweCdcclxuICAgICAgICAgICAgdGhpcy5kcmFnZ2luZy5zdHlsZS50b3AgPSBlLnBhZ2VZICsgdGhpcy5vZmZzZXQueSArICdweCdcclxuICAgICAgICAgICAgY29uc3QgbGlzdCA9IFtdXHJcbiAgICAgICAgICAgIGZvciAobGV0IHNvcnRhYmxlIG9mIFNvcnRhYmxlLmxpc3QpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChzb3J0YWJsZS5vcHRpb25zLm5hbWUgPT09IHRoaXMub3B0aW9ucy5uYW1lKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGxpc3QucHVzaChzb3J0YWJsZSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIFNvcnRhYmxlLl9wbGFjZUluTGlzdCh0aGlzLCB0aGlzLmRyYWdnaW5nKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgU29ydGFibGUuX3BsYWNlSW5MaXN0KHRoaXMuX2ZpbmRDbG9zZXN0KGUsIGxpc3QpLCB0aGlzLmRyYWdnaW5nKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaGFuZGxlIHVwXHJcbiAgICAgKiBAcGFyYW0ge1VJRXZlbnR9IGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIF9kcmFnVXAoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5kcmFnZ2luZylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRyYWdnaW5nLnBpY2t1cClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3IucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGhpcy5kcmFnZ2luZywgdGhpcy5pbmRpY2F0b3IpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nLnN0eWxlLnBvc2l0aW9uID0gJydcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuc3R5bGUuekluZGV4ID0gJydcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuc3R5bGUuYm94U2hhZG93ID0gJydcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcuc3R5bGUub3BhY2l0eSA9ICcnXHJcbiAgICAgICAgICAgICAgICB0aGlzLmluZGljYXRvci5yZW1vdmUoKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5pbmRpY2F0b3IgPSBudWxsXHJcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2Ryb3BwZWQnLCB0aGlzLmRyYWdnaW5nKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcgPSBudWxsXHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHRoZSBnbG9iYWwgZGVmYXVsdHMgZm9yIG5ldyBTb3J0YWJsZSBvYmplY3RzXHJcbiAgICAgKiBAdHlwZSB7RGVmYXVsdE9wdGlvbnN9XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBnZXQgZGVmYXVsdHMoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBkZWZhdWx0c1xyXG4gICAgfVxyXG59Il19