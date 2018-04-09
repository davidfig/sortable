const Events = require('eventemitter3')

const toGlobal = require('./toGlobal')

/**
 * Options for Sortable
 * @typedef {object} Sortable~DefaultOptions
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
}

class Sortable extends Events
{
    /**
     * Create sortable list
     * @param {HTMLElement} element
     * @param {object} [options]
     * @param {string} [options.name=sortable] dragging is allowed between Sortables with the same name
     * @param {boolean} [options.sort=true] allow sorting within list
     * @param {string} [options.dragClass] if set then drag only items with this className under element, otherwise use all children
     * @param {string} [options.sortId=data-order] for non-sorting lists, use this data id to figure out sort order
     * @param {boolean} [alwaysInList] place element inside closest related Sortable object, even if outside object's element
     * @param {object} [options.childrenStyles] styles to apply to children elements of Sortable
     * @fires dropped
     * @fires dragging-order-changed
     */
    constructor(element, options)
    {
        super()
        this.options = options || {}
        for (let option in defaults)
        {
            this.options[option] = typeof this.options[option] !== 'undefined' ? options[option] : defaults[option]
        }
        for (let child of element.children)
        {
            if (!this.options.dragClass || child.className === this.options.dragClass)
            {
                child.addEventListener('mousedown', (e) => this._dragStart(e))
                child.addEventListener('touchstart', (e) => this._dragStart(e))
                for (let option in this.options.childrenStyles)
                {
                    child.style[option] = this.options.childrenStyles[option]
                }
            }
        }
        document.body.addEventListener('mousemove', (e) => this._dragMove(e))
        document.body.addEventListener('touchmove', (e) => this._dragMove(e))
        document.body.addEventListener('touchup', (e) => this._dragUp(e))
        document.body.addEventListener('touchcancel', (e) => this._dragUp(e))
        document.body.addEventListener('mouseup', (e) => this._dragUp(e))
        document.body.addEventListener('mousecancel', (e) => this._dragUp(e))
        this.element = element

        if (!Sortable.list)
        {
            Sortable.list = []
        }
        Sortable.list.push(this)
    }

    /**
     * start drag
     * @param {UIEvent} e
     * @private
     */
    _dragStart(e)
    {
        this.dragging = e.currentTarget
        this.dragging.pickup = false
        this.dragging.start = { x: e.pageX, y: e.pageY }
        this.dragging.style.cursor = 'no-cursor'
        e.preventDefault()
    }

    /**
     * pickup and clone element
     * @param {UIEvent} e
     * @private
     */
    _pickup(e)
    {
        this.indicator = this.dragging.cloneNode(true)
        this.dragging.indicator = this.indicator
        const pos = toGlobal(this.dragging)
        this.dragging.style.position = 'absolute'
        this.offset = { x: pos.x - e.pageX, y: pos.y - e.pageY }
        this.dragging.style.left = pos.x + 'px'
        this.dragging.style.top = pos.y + 'px'
        for (let option in this.options.dragStyle)
        {
            this.dragging.style[option] = this.options.dragStyle[option]
        }
        this.dragging.parentNode.insertBefore(this.indicator, this.dragging)
        document.body.appendChild(this.dragging)
        this.dragging.pickup = true
    }

    /**
     * measure distance between two points
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @private
     */
    _distance(x1, y1, x2, y2)
    {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
    }

    /**
     * find closest distance from UIEvent to a corner of an element
     * @param {HTMLUListElement} e
     * @param {HTMLElement} element
     * @private
     */
    _distanceToClosestCorner(e, element)
    {
        const topLeft = this._distance(e.pageX, e.pageY, element.offsetLeft, element.offsetTop)
        const topRight = this._distance(e.pageX, e.pageY, element.offsetLeft + element.offsetWidth, element.offsetTop)
        const bottomLeft = this._distance(e.pageX, e.pageY, element.offsetLeft, element.offsetTop + element.offsetHeight)
        const bottomRight = this._distance(e.pageX, e.pageY, element.offsetLeft + element.offsetWidth, element.offsetTop + element.offsetHeight)
        return Math.min(topLeft, topRight, bottomLeft, bottomRight)
    }

    /**
     * find closest Sortable to screen location
     * @param {UIEvent} e
     * @param {HTMLElement} dragging
     * @param {Sortable[]} list of related Sortables
     * @private
     */
    _findClosest(e, dragging, list)
    {
        function inside(element)
        {
            const x1 = dragging.offsetLeft
            const y1 = dragging.offsetTop
            const w1 = dragging.offsetWidth
            const h1 = dragging.offsetHeight
            const pos = toGlobal(element)
            const x2 = pos.x
            const y2 = pos.y
            const w2 = element.offsetWidth
            const h2 = element.offsetHeight
            return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2
        }

        let min = Infinity, found
        for (let related of list)
        {
            if (inside(related.element))
            {
                return related
            }
            else if (related.options.alwaysInList)
            {
                const calculate = this._distanceToClosestCorner(e, related.element)
                if (calculate < min)
                {
                    min = calculate
                    found = related
                }
            }
        }
        return found
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
    static _percentage(xa1, ya1, xa2, ya2, xb1, yb1, xb2, yb2)
    {
        const sa = (xa2 - xa1) * (ya2 - ya1)
        const sb = (xb2 - xb1) * (yb2 - yb1)
        const si = Math.max(0, Math.min(xa2, xb2) - Math.max(xa1, xb1)) * Math.max(0, Math.min(ya2, yb2) - Math.max(ya1, yb1))
        const union = sa + sb - si
        return si / union
    }

    /**
     * place indicator in the sortable list according to options.sort
     * @param {Sortable} sortable
     * @param {HTMLElement} dragging element
     * @private
     */
    static _placeInList(sortable, place)
    {
        if (sortable.options.sort)
        {
            Sortable._placeInSortableList(sortable, place)
        }
        else
        {
            Sortable._placeInOrderedList(sortable, place)
        }
    }

    /**
     * place indicator in an ordered list
     * @param {Sortable} sortable
     * @param {HTMLElement} dragging
     * @private
     */
    static _placeInOrderedList(sortable, dragging)
    {
        const id = sortable.options.sortId
        dragging.indicator.remove()
        sortable.indicator = dragging.indicator
        const dragOrder = sortable.indicator.getAttribute(id)
        let found
        for (let child of sortable.element.children)
        {
            if (dragOrder < child.getAttribute(id))
            {
                sortable.element.insertBefore(sortable.indicator, child)
                found = true
                break
            }
        }
        if (!found)
        {
            sortable.element.appendChild(sortable.indicator)
        }
    }

    /**
     * find last child that is of type dragClass (if set)
     * @param {Sortable} sortable
     * @param {HTMLElement} element
     * @private
     */
    static _getLastChild(sortable, element)
    {
        let i = element.children.length - 1
        if (i < 0)
        {
            return null
        }
        while (i > 0 && sortable.options.dragClass && element.children[i].className !== sortable.options.dragClass)
        {
            i--
        }
        return element.children[i]
    }

    /**
     * place indicator in an sortable list
     * @param {Sortable} sortable
     * @param {HTMLElement} dragging
     * @private
     */
    static _placeInSortableList(sortable, dragging)
    {
        const element = sortable.element
        sortable.element.appendChild(dragging.indicator)
        sortable.indicator = dragging.indicator
        const lastChild = Sortable._getLastChild(sortable, element)
        if (!lastChild)
        {
            element.appendChild(sortable.indicator)
        }
        else
        {
            if (dragging.offsetTop >= element.offsetTop + element.offsetHeight)
            {
                element.appendChild(sortable.indicator)
            }
            else if (dragging.offsetTop + dragging.offsetHeight < element.offsetTop)
            {
                element.insertBefore(sortable.indicator, element.firstChild)
            }
            else
            {
                sortable.element.appendChild(dragging.indicator)
                sortable.indicator = dragging.indicator
                const xa1 = dragging.offsetLeft
                const ya1 = dragging.offsetTop
                const xa2 = dragging.offsetLeft + dragging.offsetWidth
                const ya2 = dragging.offsetTop + dragging.offsetHeight
                let largest = 0, closest, isBefore = true, indicator
                for (let child of element.children)
                {
                    if (child === sortable.indicator)
                    {
                        indicator = true
                    }
                    const pos = toGlobal(child)
                    const xb1 = pos.x
                    const yb1 = pos.y
                    const xb2 = pos.x + child.offsetWidth
                    const yb2 = pos.y + child.offsetHeight
                    const percentage = Sortable._percentage(xa1, ya1, xa2, ya2, xb1, yb1, xb2, yb2)
                    if (percentage > largest)
                    {
                        largest = percentage
                        closest = child
                        isBefore = indicator
                    }
                }
                if (closest && closest !== sortable.indicator)
                {
                    if (isBefore)
                    {
                        element.insertBefore(sortable.indicator, closest.nextSibling)
                        sortable.emit('dragging-order-change', sortable)
                    }
                    else
                    {
                        element.insertBefore(sortable.indicator, closest)
                        sortable.emit('dragging-order-change', sortable)
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
    _dragMove(e)
    {
        if (this.dragging)
        {
            if (!this.dragging.pickup)
            {
                if (this._distance(this.dragging.start.x, this.dragging.start.y, e.pageX, e.pageY) > this.options.threshold)
                {
                    this._pickup(e)
                }
                else
                {
                    return
                }
            }
            this.dragging.style.left = e.pageX + this.offset.x + 'px'
            this.dragging.style.top = e.pageY + this.offset.y + 'px'
            const list = []
            for (let sortable of Sortable.list)
            {
                if (sortable.options.name === this.options.name)
                {
                    list.push(sortable)
                }
            }
            if (list.length === 1)
            {
                Sortable._placeInList(this, this.dragging)
            }
            else
            {
                const closest = this._findClosest(e, this.dragging, list)
                if (closest)
                {
                    Sortable._placeInList(closest, this.dragging)
                }
                else
                {
                    this.dragging.indicator.remove()
                }
            }
            e.preventDefault()
            e.stopPropagation()
        }
    }

    /**
     * handle up
     * @param {UIEvent} e
     * @private
     */
    _dragUp(e)
    {
        if (this.dragging)
        {
            if (this.dragging.pickup)
            {
                this.indicator.parentNode.insertBefore(this.dragging, this.indicator)
                this.dragging.style.position = ''
                this.dragging.style.zIndex = ''
                this.dragging.style.boxShadow = ''
                this.dragging.style.opacity = ''
                this.indicator.remove()
                this.indicator = null
                this.emit('dropped', this.dragging)
            }
            this.dragging = null
            e.preventDefault()
        }
    }

    /**
     * the global defaults for new Sortable objects
     * @type {DefaultOptions}
     */
    static get defaults()
    {
        return defaults
    }
}

module.exports = Sortable