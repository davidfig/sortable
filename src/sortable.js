const Events = require('eventemitter3')

const toGlobal = require('./toGlobal')
const defaults = require('./options')

class Sortable extends Events
{
    /**
     * Create sortable list
     * @param {HTMLElement} element
     * @param {object} [options]
     * @param {string} [options.name=sortable] dragging is allowed between Sortables with the same name
     * @param {boolean} [options.sort=true] allow sorting within list
     * @param {boolean} [options.copy=false] create a copy when dragging an item
     * @param {boolean} [options.drop=true] allow drop from related sortables
     * @param {string} [options.dragClass] if set then drag only items with this className under element, otherwise use all children
     * @param {boolean} [options.deepSearch] if dragClass and deepSearch then search all descendents of element for dragClass
     * @param {string} [options.orderId=data-order] for non-sorting lists, use this data id to figure out sort order
     * @param {boolean} [options.orderIdIsNumber=true] use parseInt on options.orderId to properly sort numbers
     * @param {string} [options.reverseOrder] reverse sort the orderId
     * @param {boolean} [options.alwaysInList=true] place element inside closest related sortable; if set to false then the object is removed if dropped outside related sortables
     * @param {object} [options.childrenStyles] styles to apply to children elements of Sortable
     * @param {boolean} [options.useIcons=true] show icons when dragging
     * @param {boolean} [options.useDeleteIcon=false] use delete icon instead of cancel icon when not over a sortable
     * @param {object} [options.icons] default set of icons
     * @param {string} [options.icons.reorder] source of image
     * @param {string} [options.icons.move] source of image
     * @param {string} [options.icons.copy] source of image
     * @param {string} [options.icons.cancel] source of image
     * @param {string} [options.icons.delete] source of image
     * @param {string} [options.customIcon] source of custom image when over this sortable
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
    constructor(element, options)
    {
        super()
        this.options = options || {}
        for (let option in defaults)
        {
            this.options[option] = typeof this.options[option] !== 'undefined' ? options[option] : defaults[option]
        }
        this.element = element
        this.element.sortable = this
        const elements = this._getChildren(this)
        for (let child of elements)
        {
            if (!this.options.dragClass || this._containsClassName(child, this.options.dragClass))
            {
                child.__isSortable = true
                child.addEventListener('mousedown', (e) => this._dragStart(e))
                child.addEventListener('touchstart', (e) => this._dragStart(e))
                for (let option in this.options.childrenStyles)
                {
                    child.style[option] = this.options.childrenStyles[option]
                }
                child.original = this
            }
        }
        document.body.addEventListener('mousemove', (e) => this._dragMove(e))
        document.body.addEventListener('touchmove', (e) => this._dragMove(e))
        document.body.addEventListener('touchup', (e) => this._dragUp(e))
        document.body.addEventListener('touchcancel', (e) => this._dragUp(e))
        document.body.addEventListener('mouseup', (e) => this._dragUp(e))
        document.body.addEventListener('mousecancel', (e) => this._dragUp(e))

        if (!Sortable.list)
        {
            Sortable.list = []
        }
        Sortable.list.push(this)
    }

    /**
     * Whether element contains classname
     * @param {HTMLElement} e
     * @param {string} name
     * @returns {boolean}
     * @private
     */
    _containsClassName(e, name)
    {
        const list = e.className.split(' ')
        for (let entry of list)
        {
            if (entry === name)
            {
                return true
            }
        }
        return false
    }

    /**
     * add an element as a child of the sortable element; can also be used to swap between sortables
     * NOTE: this will not work with deep-type elements; use attachElement instead
     * @param {HTMLElement} element
     * @param {number} index
     */
    add(element, index)
    {
        this.attachElement(element)
        if (this.options.sort)
        {
            if (typeof index === 'undefined' || index >= this.element.children.length)
            {
                this.element.appendChild(element)
            }
            else
            {
                this.element.insertBefore(element, this.element.children[index + 1])
            }
        }
        else
        {
            const id = this.options.orderId
            let dragOrder = element.getAttribute(id)
            dragOrder = this.options.orderIdIsNumber ? parseFloat(dragOrder) : dragOrder
            let found
            const children = this._getChildren(this, true)
            if (this.options.reverseOrder)
            {
                for (let i = children.length - 1; i >= 0; i--)
                {
                    const child = children[i]
                    let childDragOrder = child.getAttribute(id)
                    childDragOrder = this.options.orderIsNumber ? parseFloat(childDragOrder) : childDragOrder
                    if (dragOrder > childDragOrder)
                    {
                        child.parentNode.insertBefore(element, child)
                        found = true
                        break
                    }
                }
            }
            else
            {
                for (let child of children)
                {
                    let childDragOrder = child.getAttribute(id)
                    childDragOrder = this.options.orderIsNumber ? parseFloat(childDragOrder) : childDragOrder
                    if (dragOrder < childDragOrder)
                    {
                        child.parentNode.insertBefore(element, child)
                        found = true
                        break
                    }
                }
            }
            if (!found)
            {
                this.element.appendChild(element)
            }
        }
    }

    /**
     * attaches an HTML element to the sortable; can also be used to swap between sortables
     * NOTE: you need to manually insert the element into this.element (this is useful when you have a deep structure)
     * @param {HTMLElement} element
     */
    attachElement(element)
    {
        if (element.__isSortable)
        {
            element.original = this
        }
        else
        {
            element.__isSortable = true
            element.dragStart = (e) => this._dragStart(e)
            element.addEventListener('mousedown', element.dragStart)
            element.addEventListener('touchstart', element.dragStart)
            for (let option in this.options.childrenStyles)
            {
                element.style[option] = this.options.childrenStyles[option]
            }
            element.original = this
        }
    }

    /**
     * removes an HTML element from the sortable and related keyboard/mouse events
     * @param {HTMLElement} element
     */
    removeElement(element)
    {
        element.remove()
        element.removeEventListener('mousedown', element.dragStart)
        element.removeEventListener('touchstart', element.dragStart)
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
        if (this.options.useIcons)
        {
            const image = new Image()
            image.src = this.options.icons.reorder
            image.style.position = 'absolute'
            image.style.transform = 'translate(-50%, -50%)'
            image.style.left = pos.x + this.dragging.offsetWidth + 'px'
            image.style.top = pos.y + this.dragging.offsetHeight + 'px'
            document.body.appendChild(image)
            this.dragging.icon = image
        }
        this.dragging.pickup = true
        this.emit('pickup', this.dragging, this.dragging.sortable)
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
     * determine whether these is overlap between two elements
     * @param {HTMLElement} dragging
     * @param {HTMLElement} element
     * @private
     */
    _inside(dragging, element)
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

    /**
     * find closest Sortable to screen location
     * @param {UIEvent} e
     * @param {HTMLElement} dragging
     * @param {Sortable[]} list of related Sortables
     * @private
     */
    _findClosest(e, dragging, list)
    {
        let min = Infinity, found
        for (let related of list)
        {
            if (this._inside(dragging, related.element))
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
    _percentage(xa1, ya1, xa2, ya2, xb1, yb1, xb2, yb2)
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
    _placeInList(sortable, dragging)
    {
        if (sortable.options.sort)
        {
            this._placeInSortableList(sortable, dragging)
        }
        else
        {
            this._placeInOrderedList(sortable, dragging)
        }
    }

    _traverseChildren(base, search, results)
    {
        for (let child of base.children)
        {
            if (search.length)
            {
                if (search.indexOf(child.className) !== -1)
                {
                    results.push(child)
                }
            }
            else
            {
                results.push(child)
            }
            this._traverseChildren(child, search, results)
        }
    }

    /**
     * find children in div
     * @param {Sortable} sortable
     * @param {boolean} [order] search for dragOrder as well
     * @private
     */
    _getChildren(sortable, order)
    {
        if (sortable.options.deepSearch)
        {
            let search = []
            if (order && sortable.options.orderClass)
            {
                if (sortable.options.dragClass)
                {
                    search.push(sortable.options.dragClass)
                }
                if (order && sortable.options.orderClass)
                {
                    search.push(sortable.options.orderClass)
                }
            }
            else if (!order && sortable.options.dragClass)
            {
                search.push(sortable.options.dragClass)
            }
            const results = []
            this._traverseChildren(sortable.element, search, results)
            return results
        }
        else
        {
            if (sortable.options.dragClass)
            {
                let list = []
                for (let child of sortable.element.children)
                {
                    if (this._containsClassName(child, sortable.options.dragClass) || ((order || !sortable.options.orderClass) || (order && sortable.options.orderClass && this._containsClassName(child, sortable.options.orderClass))))
                    {
                        list.push(child)
                    }
                }
                return list
            }
            else
            {
                return sortable.element.children
            }
        }
    }

    /**
     * place indicator in an ordered list
     * @param {Sortable} sortable
     * @param {HTMLElement} dragging
     * @private
     */
    _placeInOrderedList(sortable, dragging)
    {
        const id = sortable.options.orderId
        dragging.indicator.remove()
        sortable.indicator = dragging.indicator
        let dragOrder = sortable.indicator.getAttribute(id)
        dragOrder = sortable.options.orderIdIsNumber ? parseFloat(dragOrder) : dragOrder
        let found
        const children = this._getChildren(sortable, true)
        if (sortable.options.reverseOrder)
        {
            for (let i = children.length - 1; i >= 0; i--)
            {
                const child = children[i]
                let childDragOrder = child.getAttribute(id)
                childDragOrder = sortable.options.orderIsNumber ? parseFloat(childDragOrder) : childDragOrder
                if (dragOrder > childDragOrder)
                {
                    child.parentNode.insertBefore(sortable.indicator, child)
                    this._setIcon(dragging, sortable)
                    found = true
                    break
                }
            }
        }
        else
        {
            for (let child of children)
            {
                let childDragOrder = child.getAttribute(id)
                childDragOrder = sortable.options.orderIsNumber ? parseFloat(childDragOrder) : childDragOrder
                if (dragOrder < childDragOrder)
                {
                    child.parentNode.insertBefore(sortable.indicator, child)
                    this._setIcon(dragging, sortable)
                    found = true
                    break
                }
            }
        }
        if (!found)
        {
            sortable.element.appendChild(sortable.indicator)
            this._setIcon(dragging, sortable)
        }
    }

    /**
     * find last child that is of type dragClass (if set)
     * @param {Sortable} sortable
     * @private
     */
    _getLastChild(sortable)
    {
        if (sortable.options.deepSearch)
        {
            const search = []
            if (sortable.options.dragClass)
            {
                search.push(sortable.options.dragClass)
            }
            const results = []
            this._traverseChildren(sortable.element, search, results)
            if (results.length)
            {
                return results[results.length - 1]
            }
            else
            {
                return null
            }
        }
        else
        {
            if (sortable.options.dragClass)
            {
                for (let i = sortable.element.children.length - 1; i >= 0; i--)
                {
                    const child = sortable.element.children[i]
                    if (this._containsClassName(child, sortable.options.dragClass))
                    {
                        return child
                    }
                }
                return null
            }
            else
            {
                if (sortable.element.children.length)
                {
                    return sortable.element.children[sortable.element.children.length - 1]
                }
                else
                {
                    return null
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
    _setIcon(dragging, sortable)
    {
        if (dragging.current && dragging.current !== sortable)
        {
            dragging.current.emit('remove-pending', dragging, dragging.current)
        }
        if (dragging.icon)
        {
            if (sortable.options.customIcon)
            {
                dragging.icon.src = sortable.options.customIcon
            }
            else
            {
                dragging.icon.src = dragging.original === sortable ? sortable.options.icons.reorder : sortable.options.icons.move
            }
            dragging.current = sortable
        }
        if (dragging.original === sortable)
        {
            sortable.emit('order-pending', dragging, sortable)
            sortable.emit('update-pending', sortable)
        }
        else
        {
            sortable.emit('add-pending', dragging, sortable)
            sortable.emit('update-pending')
        }
    }

    /**
     * place indicator in an sortable list
     * @param {Sortable} sortable
     * @param {HTMLElement} dragging
     * @private
     */
    _placeInSortableList(sortable, dragging)
    {
        const element = sortable.element
        sortable.element.appendChild(dragging.indicator)
        sortable.indicator = dragging.indicator
        const lastChild = this._getLastChild(sortable)
        if (!lastChild)
        {
            element.appendChild(sortable.indicator)
            this._setIcon(dragging, sortable)
        }
        else
        {
            if (dragging.offsetTop >= element.offsetTop + element.offsetHeight)
            {
                element.appendChild(sortable.indicator)
                this._setIcon(dragging, sortable)
            }
            else if (dragging.offsetTop + dragging.offsetHeight < element.offsetTop)
            {
                element.insertBefore(sortable.indicator, element.firstChild)
                this._setIcon(dragging, sortable)
            }
            else
            {
                const xa1 = dragging.offsetLeft
                const ya1 = dragging.offsetTop
                const xa2 = dragging.offsetLeft + dragging.offsetWidth
                const ya2 = dragging.offsetTop + dragging.offsetHeight
                let largest = 0, closest, isBefore = true, indicator
                const search = []
                if (sortable.options.dragClass)
                {
                    search.push(sortable.options.dragClass)
                }
                if (sortable.options.orderClass)
                {
                    search.push(sortable.options.orderClass)
                }
                const elements = this._getChildren(sortable, true)
                for (let child of elements)
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
                    const percentage = this._percentage(xa1, ya1, xa2, ya2, xb1, yb1, xb2, yb2)
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
                        this._setIcon(dragging, sortable)
                        sortable.emit('order-pending', sortable)
                    }
                    else
                    {
                        element.insertBefore(sortable.indicator, closest)
                        this._setIcon(dragging, sortable)
                        sortable.emit('order-pending', sortable)
                    }
                }
                else
                {
                    sortable.element.appendChild(dragging.indicator)
                    sortable.indicator = dragging.indicator
                    this._setIcon(dragging, sortable)
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
            if (this.dragging.icon)
            {
                this.dragging.icon.style.left = e.pageX + this.offset.x + this.dragging.offsetWidth + 'px'
                this.dragging.icon.style.top = e.pageY + this.offset.y + this.dragging.offsetHeight + 'px'
            }
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
                if (this.options.alwaysInList || this._inside(this.dragging, this.element))
                {
                    this.dragging.sortable = this
                    this._placeInList(this, this.dragging)
                }
                else
                {
                    this.dragging.indicator.remove()
                    if (this.dragging.icon)
                    {
                        this.dragging.icon.src = this.options.useDeleteIcon ? this.options.icons.delete : this.options.icons.cancel
                    }
                }
            }
            else
            {
                const closest = this._findClosest(e, this.dragging, list)
                if (closest)
                {
                    this.dragging.sortable = closest
                    this._placeInList(closest, this.dragging)
                }
                else
                {
                    this.dragging.sortable = null
                    this.dragging.indicator.remove()
                    if (this.dragging.icon)
                    {
                        this.dragging.icon.src = this.options.useDeleteIcon ? this.options.icons.delete : this.options.icons.cancel
                    }
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
                this.dragging.style.position = 'unset'
                this.dragging.style.zIndex = 'unset'
                this.dragging.style.boxShadow = 'unset'
                this.dragging.style.opacity = 'unset'
                if (this.indicator.parentNode)
                {
                    this.indicator.parentNode.insertBefore(this.dragging, this.indicator)
                    this.dragging.original = this.dragging.current
                    this.indicator.remove()
                    this.indicator = null
                    if (this.dragging.original === this)
                    {
                        this.emit('order', this.dragging, this)
                        this.emit('update', this.dragging, this)
                    }
                    else
                    {
                        this.dragging.original.emit('remove', this.dragging, this.dragging.original)
                        this.dragging.original.emit('update', this.dragging, this.dragging.original)
                        this.dragging.sortable.emit('add', this.dragging, this)
                        this.dragging.sortable.emit('update', this.dragging, this)
                    }
                }
                else
                {
                    this.dragging.remove()
                    this.dragging.original = null
                    this.indicator.remove()
                    this.indicator = null
                    this.dragging.original.emit('remove', this.dragging, this)
                }
                if (this.dragging.icon)
                {
                    this.dragging.icon.remove()
                }
            }
            else
            {
                this.emit('clicked', this.dragging, this)
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

    /**
     * create multiple sortable elements
     * @param {HTMLElements[]} elements
     * @param {object} options - see constructor for options
     */
    static create(elements, options)
    {
        const results = []
        for (let element of elements)
        {
            results.push(new Sortable(element, options))
        }
        return results
    }
}

module.exports = Sortable

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