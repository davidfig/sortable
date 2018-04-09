const Events = require('eventemitter3')

const toGlobal = require('./toGlobal')

const defaults = {
    name: 'sortable',
    sort: true,
    threshold: 10,
    dragStyle: {
        boxShadow: '3px 3px 5px rgba(0,0,0,0.25)',
        opacity: 0.85
    },
    childrenStyles: {
        cursor: 'pointer'
    }
}

module.exports = class Sortable extends Events
{
    /**
     * Create sortable list
     * @param {HTMLElement} element
     * @param {object} [options]
     * @param {Sortable[]} [options.related] allow drag and drop between these lists
     * @param {boolean} [options.sort=true] allow sorting within list
     * @param {string} [options.sortId=data-order] for non-sorting lists, use this data id to figure out sort order
     * @param {boolean} [alwaysInList] place element inside closest related Sortable object, even if outside object's element
     * @param {object} [options.childrenStyles] styles to apply to children elements of Sortable
     * @fires dropped
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
            child.addEventListener('mousedown', (e) => this._dragStart(e))
            child.addEventListener('touchstart', (e) => this._dragStart(e))
            for (let option in this.options.childrenStyles)
            {
                child.style[option] = this.options.childrenStyles[option]
            }
        }
        document.body.addEventListener('mousemove', (e) => this._dragMove(e))
        document.body.addEventListener('touchmove', (e) => this._dragMove(e))
        document.body.addEventListener('touchup', (e) => this._dragUp(e))
        document.body.addEventListener('touchcancel', (e) => this._dragUp(e))
        document.body.addEventListener('mouseup', (e) => this._dragUp(e))
        document.body.addEventListener('mousecancel', (e) => this._dragUp(e))
        this.element = element
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

    _pickup(e)
    {
        this.indicator = this.dragging.cloneNode(true)
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

    _distance(x1, y1, x2, y2)
    {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
    }

    /**
     * find closest Sortable to screen location
     * @param {UIEvent} e
     */
    _findClosest(e)
    {
        function inside(element)
        {
            const x1 = e.pageX
            const y1 = e.pageY
            const x2 = element.offsetLeft
            const y2 = element.offsetTop
            const h1 = element.offsetWidth
            const w1 = element.offsetHeight
            return x2 >= x1 && x2 <= x1 + w1 && y2 >= y1 && y2 <= y1 + h1
        }

        function distance(element)
        {
            const topLeft = this._distance(e.pageX, e.pageY, element.offsetLeft, element.offsetTop)
            const topRight = this._distance(e.pageX, e.pageY, element.offsetLeft + element.offsetWidth, element.offsetTop)
            const bottomLeft = this._distance(e.pageX, e.pageY, element.offsetLeft, element.offsetTop + element.offsetHeight)
            const bottomRight = this._distance(e.pageX, e.pageY, element.offsetLeft + element.offsetWidth, element.offsetTop + element.offsetHeight)
            return Math.min(topLeft, topRight, bottomLeft, bottomRight)
        }

        if (this.options.related)
        {
            let min = Infinity, found
            for (let related of this.options.related.concat(this.element))
            {
                if (inside(related))
                {
                    return related
                }
                else
                {
                    const calculate = distance(related)
                    if (calculate < min)
                    {
                        min = calculate
                        found = related
                    }
                }
            }
            return found
        }
        else
        {
            return this.element
        }
    }

    /**
     * percentage of overlap between two boxes
     * from https://stackoverflow.com/a/21220004/1955997
     */
    _percentage(xa1, ya1, xa2, ya2, xb1, yb1, xb2, yb2)
    {
        const sa = (xa2 - xa1) * (ya2 - ya1)
        const sb = (xb2 - xb1) * (yb2 - yb1)
        const si = Math.max(0, Math.min(xa2, xb2) - Math.max(xa1, xb1)) * Math.max(0, Math.min(ya2, yb2) - Math.max(ya1, yb1))
        const union = sa + sb - si
        return si / union
    }

    _placeInList()
    {
        const lastChild = this.element.children[this.element.children.length - 1]
        if (!lastChild)
        {
            this.element.appendChild(this.indicator)
        }
        else
        {
            if (this.dragging.offsetTop >= this.element.offsetTop + this.element.offsetHeight)
            {
                this.element.appendChild(this.indicator)
            }
            else if (this.dragging.offsetTop + this.dragging.offsetHeight < this.element.offsetTop)
            {
                this.element.insertBefore(this.indicator, this.element.firstChild)
            }
            else
            {
                const xa1 = this.dragging.offsetLeft
                const ya1 = this.dragging.offsetTop
                const xa2 = this.dragging.offsetLeft + this.dragging.offsetWidth
                const ya2 = this.dragging.offsetTop + this.dragging.offsetHeight
                let largest = 0, closest, isBefore = true, indicator
                for (let element of this.element.children)
                {
                    if (element === this.indicator)
                    {
                        indicator = true
                    }
                    const pos = toGlobal(element)
                    const xb1 = pos.x
                    const yb1 = pos.y
                    const xb2 = pos.x + element.offsetWidth
                    const yb2 = pos.y + element.offsetHeight
                    const percentage = this._percentage(xa1, ya1, xa2, ya2, xb1, yb1, xb2, yb2)
                    if (percentage > largest)
                    {
                        largest = percentage
                        closest = element
                        isBefore = indicator
                    }
                }
                if (closest !== this.indicator)
                {
                    if (isBefore)
                    {
                        this.element.insertBefore(this.indicator, closest.nextSibling)
                    }
                    else
                    {
                        this.element.insertBefore(this.indicator, closest)
                    }
                }
            }
        }
    }

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
            if (!this.options.related)
            {
                this._placeInList()
            }
            e.preventDefault()
        }
    }

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
                this.emit('dropped', this.dragging)
            }
            this.dragging = null
            e.preventDefault()
        }
    }

    /**
     * the global defaults for new Sortable objects
     * @type {object}
     */
    static get defaults()
    {
        return defaults
    }
}