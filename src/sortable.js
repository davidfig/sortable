const Events = require('eventemitter3')

const defaults = require('./defaults')
const utils = require('./utils')

class Sortable extends Events
{
    /**
     * Create sortable list
     * @param {HTMLElement} element
     * @param {object} [options]
     * @param {string} [options.name=sortable] dragging is allowed between Sortables with the same name
     * @param {string} [options.dragClass] if set then drag only items with this className under element; otherwise drag all children
     * @param {string} [options.orderClass] use this class to include elements in ordering but not dragging; otherwise all children elements are included in when sorting and ordering
     * @param {boolean} [options.deepSearch] if dragClass and deepSearch then search all descendents of element for dragClass
     * @param {boolean} [options.sort=true] allow sorting within list
     * @param {boolean} [options.drop=true] allow drop from related sortables (doesn't impact reordering this sortable's children until the children are moved to a differen sortable)
     * @param {boolean} [options.copy=false] create copy when dragging an item (this disables sort=true for this sortable)
     * @param {string} [options.orderId=data-order] for ordered lists, use this data id to figure out sort order
     * @param {boolean} [options.orderIdIsNumber=true] use parseInt on options.sortId to properly sort numbers
     * @param {string} [options.reverseOrder] reverse sort the orderId
     * @param {string} [options.offList=closest] how to handle when an element is dropped outside a sortable: closest=drop in closest sortable; cancel=return to starting sortable; delete=remove from all sortables
     * @param {number} [options.maximum] maximum number of elements allowed in a sortable list
     * @param {boolean} [options.maximumFIFO] direction of search to choose which item to remove when maximum is reached
     * @param {string} [options.cursorHover=grab -webkit-grab pointer] use this cursor list to set cursor when hovering over a sortable element
     * @param {string} [options.cursorDown=grabbing -webkit-grabbing pointer] use this cursor list to set cursor when mousedown/touchdown over a sortable element
     * @param {boolean} [options.useIcons=true] show icons when dragging
     * @param {object} [options.icons] default set of icons
     * @param {string} [options.icons.reorder]
     * @param {string} [options.icons.move]
     * @param {string} [options.icons.copy]
     * @param {string} [options.icons.delete]
     * @param {string} [options.customIcon] source of custom image when over this sortable
     * @fires pickup
     * @fires order
     * @fires add
     * @fires remove
     * @fires update
     * @fires delete
     * @fires copy
     * @fires maximum-remove
     * @fires order-pending
     * @fires add-pending
     * @fires remove-pending
     * @fires add-remove-pending
     * @fires update-pending
     * @fires delete-pending
     * @fires copy-pending
     * @fires maximum-remove-pending
     * @fires clicked
     */
    constructor(element, options)
    {
        super()
        this.options = utils.options(options, defaults)
        this.element = element
        this._addToGlobalTracker()
        const elements = this._getChildren()
        this.events = {
            dragStart: (e) => this._dragStart(e),
            dragEnd: (e) => this._dragEnd(e),
            dragOver: (e) => this._dragOver(e),
            drop: (e) => this._drop(e),
            dragLeave: (e) => this._dragLeave(e),
            mouseDown: (e) => this._mouseDown(e),
            mouseUp: (e) => this._mouseUp(e)
        }
        for (let child of elements)
        {
            if (!this.options.dragClass || utils.containsClassName(child, this.options.dragClass))
            {
                this.attachElement(child)
            }
        }
        element.addEventListener('dragover', this.events.dragOver)
        element.addEventListener('drop', this.events.drop)
        element.addEventListener('dragleave', this.events.dragLeave)
        if (this.options.cursorHover)
        {
            for (let child of this._getChildren())
            {
                utils.style(child, 'cursor', this.options.cursorHover)
                if (this.options.cursorDown)
                {
                    child.addEventListener('mousedown', this.events.mouseDown)
                }
                child.addEventListener('mouseup', this.events.mouseUp)
            }
        }
    }

    /**
     * removes all event handlers from this.element and children
     */
    destroy()
    {
        this.element.removeEventListener('dragover', this.events.dragOver)
        this.element.removeEventListener('drop', this.events.drop)
        const elements = this._getChildren()
        for (let child of elements)
        {
            this.removeElement(child)
        }
        // todo: remove Sortable.tracker and related event handlers if no more sortables
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

    /**
     * add an element as a child of the sortable element; can also be used to swap between sortables
     * NOTE: this may not work with deepSearch non-ordered elements; use attachElement instead
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
            const children = this._getChildren(true)
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
        if (element.__sortable)
        {
            element.__sortable.original = this
        }
        else
        {
            element.__sortable = {
                sortable: this,
                original: this
            }

            // add a counter for maximum
            this._maximumCounter(element, this)

            // ensure every element has an id
            if (!element.id)
            {
                element.id = '__sortable-' + this.options.name + '-' + Sortable.tracker[this.options.name].counter
                Sortable.tracker[this.options.name].counter++
            }
            if (this.options.copy)
            {
                element.__sortable.copy = 0
            }
            element.addEventListener('dragstart', this.events.dragStart)
            element.addEventListener('dragend', this.events.dragEnd)
            element.setAttribute('draggable', true)
        }
    }

    /**
     * removes all events from an HTML element
     * NOTE: does not remove the element from its parent
     * @param {HTMLElement} element
     */
    removeElement(element)
    {
        element.removeEventListener('dragstart', this.events.dragStart)
        element.removeEventListener('dragend', this.events.dragEnd)
        element.setAttribute('draggable', false)
    }

    /**
     * add sortable to global list that tracks all sortables
     * @private
     */
    _addToGlobalTracker()
    {
        if (!Sortable.tracker || !document.getElementById('sortable-dragImage'))
        {
            Sortable.dragImage = document.createElement('div')
            Sortable.dragImage.style.background = 'transparent'
            Sortable.dragImage.style.position = 'fixed'
            Sortable.dragImage.style.left = -10
            Sortable.dragImage.style.top = -10
            Sortable.dragImage.style.width = Sortable.dragImage.style.height = '5px'
            Sortable.dragImage.style.zIndex = -1
            Sortable.dragImage.id = 'sortable-dragImage'
            document.body.appendChild(Sortable.dragImage)
            Sortable.tracker = {}
            document.body.addEventListener('dragover', (e) => this._bodyDragOver(e))
            document.body.addEventListener('drop', (e) => this._bodyDrop(e))
        }
        if (Sortable.tracker[this.options.name])
        {
            Sortable.tracker[this.options.name].list.push(this)
        }
        else
        {
            Sortable.tracker[this.options.name] = { list: [this], counter: 0 }
        }
    }

    /**
     * default drag over for the body
     * @param {DragEvent} e
     * @private
     */
    _bodyDragOver(e)
    {
        const name = e.dataTransfer.types[0]
        if (Sortable.tracker[name])
        {
            const id = e.dataTransfer.types[1]
            const element = document.getElementById(id)
            const sortable = this._findClosest(e, Sortable.tracker[name].list, element)
            if (element)
            {
                if (sortable)
                {
                    if (sortable.last && Math.abs(sortable.last.x - e.pageX) < sortable.options.threshold && Math.abs(sortable.last.y - e.pageY) < sortable.options.threshold)
                    {
                        sortable._updateDragging(e, element)
                        e.preventDefault()
                        e.stopPropagation()
                        return
                    }
                    sortable.last = { x: e.pageX, y: e.pageY }
                    sortable._placeInList(sortable, e.pageX, e.pageY, element)
                    e.dataTransfer.dropEffect = 'move'
                    sortable._updateDragging(e, element)
                }
                else
                {
                    this._noDrop(e)
                }
                e.preventDefault()
            }
        }
    }

    /**
     * handle no drop
     * @param {UIEvent} e
     * @param {boolean} [cancel] force cancel (for options.copy)
     * @private
     */
    _noDrop(e, cancel)
    {
        e.dataTransfer.dropEffect = 'move'
        const id = e.dataTransfer.types[1]
        const element = document.getElementById(id)
        if (element)
        {
            this._updateDragging(e, element)
            this._setIcon(element, null, cancel)
            if (!cancel)
            {
                if (element.__sortable.original.options.offList === 'delete')
                {
                    if (!element.__sortable.display)
                    {
                        element.__sortable.display = element.style.display || 'unset'
                        element.style.display = 'none'
                        element.__sortable.original.emit('delete-pending', element, element.__sortable.original)
                    }
                }
                else if (!element.__sortable.original.options.copy)
                {
                    this._replaceInList(element.__sortable.original, element)
                }
            }
            if (element.__sortable.current)
            {
                this._clearMaximumPending(element.__sortable.current)
                element.__sortable.current.emit('add-remove-pending', element, element.__sortable.current)
                element.__sortable.current.emit('update-pending', element, element.__sortable.current)
                element.__sortable.current = null
            }
        }
    }

    /**
     * default drop for the body
     * @param {DragEvent} e
     * @private
     */
    _bodyDrop(e)
    {
        const name = e.dataTransfer.types[0]
        if (Sortable.tracker[name])
        {
            const id = e.dataTransfer.types[1]
            const element = document.getElementById(id)
            const sortable = this._findClosest(e, Sortable.tracker[name].list, element)
            if (element)
            {
                if (sortable)
                {
                    e.preventDefault()
                }
                this._removeDragging(element)
                if (element.__sortable.display)
                {
                    element.remove()
                    element.style.display = element.__sortable.display
                    element.__sortable.display = null
                    element.__sortable.original.emit('delete', element, element.__sortable.original)
                    element.__sortable.original.emit('update', element, element.__sortable.original)
                    element.__sortable.original = null
                }
            }
        }
    }

    /**
     * end drag
     * @param {UIEvent} e
     * @private
     */
    _dragEnd(e)
    {
        const element = e.currentTarget
        const dragging = element.__sortable.dragging
        if (dragging)
        {
            dragging.remove()
            if (dragging.icon)
            {
                dragging.icon.remove()
            }
            element.__sortable.dragging = null
        }
        if (this.options.cursorHover)
        {
            utils.style(e.currentTarget, 'cursor', this.options.cursorHover)
        }
    }

    /**
     * start drag
     * @param {UIEvent} e
     * @private
     */
    _dragStart(e)
    {
        const sortable = e.currentTarget.__sortable.original
        const dragging = e.currentTarget.cloneNode(true)
        for (let style in sortable.options.dragStyle)
        {
            dragging.style[style] = sortable.options.dragStyle[style]
        }
        const pos = utils.toGlobal(e.currentTarget)
        dragging.style.left = pos.x + 'px'
        dragging.style.top = pos.y + 'px'
        const offset = { x: pos.x - e.pageX, y: pos.y - e.pageY }
        document.body.appendChild(dragging)
        if (sortable.options.useIcons)
        {
            const image = new Image()
            image.src = sortable.options.icons.reorder
            image.style.position = 'absolute'
            image.style.transform = 'translate(-50%, -50%)'
            image.style.left = dragging.offsetLeft + dragging.offsetWidth + 'px'
            image.style.top = dragging.offsetTop + dragging.offsetHeight + 'px'
            document.body.appendChild(image)
            dragging.icon = image
        }
        if (sortable.options.cursorHover)
        {
            utils.style(e.currentTarget, 'cursor', sortable.options.cursorHover)
        }
        let target = e.currentTarget
        if (sortable.options.copy)
        {
            target = e.currentTarget.cloneNode(true)
            target.id = e.currentTarget.id + '-copy-' + e.currentTarget.__sortable.copy
            e.currentTarget.__sortable.copy++
            sortable.attachElement(target)
            target.__sortable.isCopy = true
            target.__sortable.original = this
            target.__sortable.display = target.style.display || 'unset'
            target.style.display = 'none'
            document.body.appendChild(target)
        }
        e.dataTransfer.clearData()
        e.dataTransfer.setData(sortable.options.name, sortable.options.name)
        e.dataTransfer.setData(target.id, target.id)
        e.dataTransfer.setDragImage(document.getElementById('sortable-dragImage'), 0, 0)
        target.__sortable.current = this
        target.__sortable.index = sortable.options.copy ? -1 : sortable._getIndex(target)
        target.__sortable.dragging = dragging
        target.__sortable.offset = offset
    }

    /**
     * handle drag leave events for sortable element
     * @param {DragEvent} e
     * @private
     */
    _dragLeave(e)
    {
        // const id = e.dataTransfer.types[1]
        // if (id)
        // {
        //     const element = document.getElementById(id)
        //     if (element)
        //     {
        //         const sortable = element.__sortable.current
        //         sortable._maximumPending(element, sortable)
        //     }
        // }
    }

    /**
     * handle drag over events for sortable element
     * @param {DragEvent} e
     * @private
     */
    _dragOver(e)
    {
        const sortable = e.dataTransfer.types[0]
        if (sortable && sortable === this.options.name)
        {
            const id = e.dataTransfer.types[1]
            const element = document.getElementById(id)
            if (this.last && Math.abs(this.last.x - e.pageX) < this.options.threshold && Math.abs(this.last.y - e.pageY) < this.options.threshold)
            {
                this._updateDragging(e, element)
                e.preventDefault()
                e.stopPropagation()
                return
            }
            this.last = { x: e.pageX, y: e.pageY }
            if (element.__sortable.isCopy && element.__sortable.original === this)
            {
                this._noDrop(e, true)
            }
            else if (this.options.drop || element.__sortable.original === this)
            {
                this._placeInList(this, e.pageX, e.pageY, element)
                e.dataTransfer.dropEffect = element.__sortable.isCopy ? 'copy' : 'move'
                this._updateDragging(e, element)
            }
            else
            {
                this._noDrop(e)
            }
            e.preventDefault()
            e.stopPropagation()
        }
    }

    /**
     * update the dragging element
     * @param {UIEvent} e
     * @param {HTMLElement} element
     * @private
     */
    _updateDragging(e, element)
    {
        const dragging = element.__sortable.dragging
        const offset = element.__sortable.offset
        if (dragging)
        {
            dragging.style.left = e.pageX + offset.x + 'px'
            dragging.style.top = e.pageY + offset.y + 'px'
            if (dragging.icon)
            {
                dragging.icon.style.left = dragging.offsetLeft + dragging.offsetWidth + 'px'
                dragging.icon.style.top = dragging.offsetTop + dragging.offsetHeight + 'px'
            }
        }
    }

    /**
     * remove the dragging element
     * @param {HTMLElement} element
     * @private
     */
    _removeDragging(element)
    {
        const dragging = element.__sortable.dragging
        if (dragging)
        {
            dragging.remove()
            if (dragging.icon)
            {
                dragging.icon.remove()
            }
            element.__sortable.dragging = null
        }
        element.__sortable.isCopy = false
    }

    /**
     * drop the element into a sortable
     * @param {HTMLElement} e
     * @private
     */
    _drop(e)
    {
        const name = e.dataTransfer.types[0]
        if (Sortable.tracker[name] && name === this.options.name)
        {
            const id = e.dataTransfer.types[1]
            const element = document.getElementById(id)
            if (element.__sortable.current)
            {
                if (element.__sortable.original !== this)
                {
                    element.__sortable.original.emit('remove', element, element.__sortable.original)
                    this.emit('add', element, this)
                    element.__sortable.original = this
                    if (this.options.sort)
                    {
                        this.emit('order', element, this)
                    }
                    if (element.__sortable.isCopy)
                    {
                        this.emit('copy', element, this)
                    }
                    this._maximum(element, this)
                    this.emit('update', element, this)
                }
                else
                {
                    if (element.__sortable.index !== this._getIndex(e.currentTarget))
                    {
                        this.emit('order', element, this)
                        this.emit('update', element, this)
                    }
                }
            }
            this._removeDragging(element)
            e.preventDefault()
            e.stopPropagation()
        }
    }

    /**
     * find closest Sortable to screen location
     * @param {UIEvent} e
     * @param {Sortable[]} list of related Sortables
     * @param {HTMLElement} element
     * @private
     */
    _findClosest(e, list, element)
    {
        let min = Infinity, found
        for (let related of list)
        {
            if ((!related.options.drop && element.__sortable.original !== related) ||
                (element.__sortable.isCopy && element.__sortable.original === related))
            {
                continue
            }
            if (utils.inside(e.pageX, e.pageY, related.element))
            {
                return related
            }
            else if (related.options.offList === 'closest')
            {
                const calculate = utils.distanceToClosestCorner(e.pageX, e.pageY, related.element)
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
     * place indicator in the sortable list according to options.sort
     * @param {number} x
     * @param {number} y
     * @param {Sortable} sortable
     * @param {HTMLElement} element
     * @private
     */
    _placeInList(sortable, x, y, element)
    {
        if (this.options.sort)
        {
            this._placeInSortableList(sortable, x, y, element)
        }
        else
        {
            this._placeInOrderedList(sortable, element)
        }
        this._setIcon(element, sortable)
        if (element.__sortable.display)
        {
            element.style.display = element.__sortable.display === 'unset' ? '' : element.__sortable.display
            element.__sortable.display = null
        }
    }

    /**
     * replace item in list at original index position
     * @private
     */
    _replaceInList(sortable, element)
    {
        const children = sortable._getChildren()
        if (children.length)
        {
            const index = element.__sortable.index
            if (index < children.length)
            {
                children[index].parentNode.insertBefore(element, children[index])
            }
            else
            {
                children[0].appendChild(element)
            }
        }
        else
        {
            sortable.element.appendChild(element)
        }
    }

    /**
     * count the index of the child in the list of children
     * @param {HTMLElement} child
     * @return {number}
     * @private
     */
    _getIndex(child)
    {
        const children = this._getChildren()
        for (let i = 0; i < children.length; i++)
        {
            if (children[i] === child)
            {
                return i
            }
        }
    }

    /**
     * traverse and search descendents in DOM
     * @param {HTMLElement} base
     * @param {string} search
     * @param {HTMLElement[]} results to return
     * @private
     */
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
    _getChildren(order)
    {
        if (this.options.deepSearch)
        {
            let search = []
            if (order && this.options.orderClass)
            {
                if (this.options.dragClass)
                {
                    search.push(this.options.dragClass)
                }
                if (order && this.options.orderClass)
                {
                    search.push(this.options.orderClass)
                }
            }
            else if (!order && this.options.dragClass)
            {
                search.push(this.options.dragClass)
            }
            const results = []
            this._traverseChildren(this.element, search, results)
            return results
        }
        else
        {
            if (this.options.dragClass)
            {
                let list = []
                for (let child of this.element.children)
                {
                    if (utils.containsClassName(child, this.options.dragClass) || (order && !this.options.orderClass || (order && this.options.orderClass && utils.containsClassName(child, this.options.orderClass))))
                    {
                        list.push(child)
                    }
                }
                return list
            }
            else
            {
                const list = []
                for (let child of this.element.children)
                {
                    list.push(child)
                }
                return list
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
        if (dragging.__sortable.current !== sortable)
        {
            const id = sortable.options.orderId
            let dragOrder = dragging.getAttribute(id)
            dragOrder = sortable.options.orderIdIsNumber ? parseFloat(dragOrder) : dragOrder
            let found
            const children = sortable._getChildren(true)
            if (sortable.options.reverseOrder)
            {
                for (let i = children.length - 1; i >= 0; i--)
                {
                    const child = children[i]
                    let childDragOrder = child.getAttribute(id)
                    childDragOrder = sortable.options.orderIsNumber ? parseFloat(childDragOrder) : childDragOrder
                    if (dragOrder > childDragOrder)
                    {
                        child.parentNode.insertBefore(dragging, child)
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
                        child.parentNode.insertBefore(dragging, child)
                        found = true
                        break
                    }
                }
            }
            if (!found)
            {
                sortable.element.appendChild(dragging)
            }
            if (dragging.__sortable.current)
            {
                if (dragging.__sortable.current !== dragging.__sortable.original)
                {
                    dragging.__sortable.current.emit('add-remove-pending', dragging, dragging.__sortable.current)
                }
                else
                {
                    dragging.__sortable.current.emit('remove-pending', dragging, dragging.__sortable.current)
                }
                this._clearMaximumPending(dragging.__sortable.current)
                this._maximum(null, dragging.__sortable.current)
            }
            sortable.emit('add-pending', dragging, sortable)
            if (dragging.__sortable.isCopy)
            {
                sortable.emit('copy-pending', dragging, sortable)
            }
            dragging.__sortable.current = sortable
            this._maximumPending(dragging, sortable)
            sortable.emit('update-pending', dragging, sortable)
        }
    }

    /**
     * search for where to place using percentage
     * @param {Sortable} sortable
     * @param {HTMLElement} dragging
     * @returns {number} 0 = not found; 1 = nothing to do; 2 = moved
     * @private
     */
    _placeByPercentage(sortable, dragging)
    {
        const cursor = dragging.__sortable.dragging
        const xa1 = cursor.offsetLeft
        const ya1 = cursor.offsetTop
        const xa2 = cursor.offsetLeft + cursor.offsetWidth
        const ya2 = cursor.offsetTop + cursor.offsetHeight
        let largest = 0, closest, isBefore, indicator
        const element = sortable.element
        const elements = sortable._getChildren(true)
        for (let child of elements)
        {
            if (child === dragging)
            {
                indicator = true
            }
            const pos = utils.toGlobal(child)
            const xb1 = pos.x
            const yb1 = pos.y
            const xb2 = pos.x + child.offsetWidth
            const yb2 = pos.y + child.offsetHeight
            const percentage = utils.percentage(xa1, ya1, xa2, ya2, xb1, yb1, xb2, yb2)
            if (percentage > largest)
            {
                largest = percentage
                closest = child
                isBefore = indicator
            }
        }
        if (closest)
        {
            if (closest === dragging)
            {
                return 1
            }
            if (isBefore && closest.nextSibling)
            {
                element.insertBefore(dragging, closest.nextSibling)
                sortable.emit('order-pending', sortable)
            }
            else
            {
                element.insertBefore(dragging, closest)
                sortable.emit('order-pending', sortable)
            }
            return 2
        }
        else
        {
            return 0
        }
    }

    /**
     * search for where to place using distance
     * @param {Sortable} sortable
     * @param {HTMLElement} dragging
     * @param {number} x
     * @param {number} y
     * @return {boolean} false=nothing to do
     * @private
     */
    _placeByDistance(sortable, dragging, x, y)
    {
        if (utils.inside(x, y, dragging))
        {
            return true
        }
        let index = -1
        if (dragging.__sortable.current === sortable)
        {
            index = sortable._getIndex(dragging)
            sortable.element.appendChild(dragging)
        }
        let distance = Infinity, closest
        const element = sortable.element
        const elements = sortable._getChildren(true)
        for (let child of elements)
        {
            if (utils.inside(x, y, child))
            {
                closest = child
                break
            }
            else
            {
                const measure = utils.distanceToClosestCorner(x, y, child)
                if (measure < distance)
                {
                    closest = child
                    distance = measure
                }
            }
        }
        element.insertBefore(dragging, closest)
        if (index === sortable._getIndex(dragging))
        {
            return true
        }
        this._maximumPending(dragging, sortable)
        sortable.emit('order-pending', dragging, sortable)
    }

    /**
     * place indicator in an sortable list
     * @param {number} x
     * @param {number} y
     * @param {HTMLElement} dragging
     * @private
     */
    _placeInSortableList(sortable, x, y, dragging)
    {
        const element = sortable.element
        const children = sortable._getChildren()
        if (!children.length)
        {
            element.appendChild(dragging)
        }
        else
        {
            // const percentage = this._placeByPercentage(sortable, dragging)
            if (this._placeByDistance(sortable, dragging, x, y))
            {
                return
            }
        }
        if (dragging.__sortable.current !== sortable)
        {
            sortable.emit('add-pending', dragging, sortable)
            if (dragging.__sortable.isCopy)
            {
                sortable.emit('copy-pending', dragging, sortable)
            }
            if (dragging.__sortable.current)
            {
                if (dragging.__sortable.current !== dragging.__sortable.original)
                {
                    dragging.__sortable.current.emit('add-remove-pending', dragging, dragging.__sortable.current)
                }
                else
                {
                    dragging.__sortable.current.emit('remove-pending', dragging, dragging.__sortable.current)
                }
                this._clearMaximumPending(dragging.__sortable.current)
                this._maximum(null, dragging.__sortable.current)
            }
            dragging.__sortable.current = sortable
        }
        this._maximumPending(dragging, sortable)
        sortable.emit('update-pending', dragging, sortable)
    }

    /**
     * set icon if available
     * @param {HTMLElement} dragging
     * @param {Sortable} sortable
     * @param {boolean} [cancel] force cancel (for options.copy)
     * @private
     */
    _setIcon(element, sortable, cancel)
    {
        const dragging = element.__sortable.dragging
        if (dragging && dragging.icon)
        {
            if (!sortable)
            {
                sortable = element.__sortable.original
                if (cancel)
                {
                    dragging.icon.src = sortable.options.icons.cancel
                }
                else
                {
                    dragging.icon.src = sortable.options.offList === 'delete' ? sortable.options.icons.delete : sortable.options.icons.cancel
                }
            }
            else
            {
                if (element.__sortable.isCopy)
                {
                    dragging.icon.src = sortable.options.icons.copy
                }
                else
                {
                    dragging.icon.src = element.__sortable.original === sortable ? sortable.options.icons.reorder : sortable.options.icons.move
                }
            }
        }
    }

    /**
     * add a maximum counter to the element
     * @param {HTMLElement} element
     * @param {Sortable} sortable
     * @private
     */
    _maximumCounter(element, sortable)
    {
        let count = -1
        if (sortable.options.maximum)
        {
            const children = sortable._getChildren()
            for (let child of children)
            {
                if (child !== element && child.__sortable)
                {
                    count = child.__sortable.maximum > count ? child.__sortable.maximum : count
                }
            }
        }
        element.__sortable.maximum = count + 1
    }

    /**
     * handle maximum
     * @private
     */
    _maximum(element, sortable)
    {
        if (sortable.options.maximum)
        {
            const children = sortable._getChildren()
            if (children.length > sortable.options.maximum)
            {
                if (sortable.removePending)
                {
                    while (sortable.removePending.length)
                    {
                        const child = sortable.removePending.pop()
                        child.style.display = child.__sortable.display === 'unset' ? '' : child.__sortable.display
                        child.__sortable.display = null
                        child.remove()
                        sortable.emit('maximum-remove', child, sortable)
                    }
                    sortable.removePending = null
                }
            }
            if (element)
            {
                this._maximumCounter(element, sortable)
            }
        }
    }

    /**
     * clear pending list
     * @param {Sortable} sortable
     * @private
     */
    _clearMaximumPending(sortable)
    {
        if (sortable.removePending)
        {
            while (sortable.removePending.length)
            {
                const child = sortable.removePending.pop()
                child.style.display = child.__sortable.display === 'unset' ? '' : child.__sortable.display
                child.__sortable.display = null
            }
            sortable.removePending = null
        }
    }

    /**
     * handle pending maximum
     * @param {HTMLElement} element
     * @param {Sortable} sortable
     * @private
     */
    _maximumPending(element, sortable)
    {
        if (sortable.options.maximum)
        {
            const children = sortable._getChildren()
            if (children.length > sortable.options.maximum)
            {
                const savePending = sortable.removePending ? sortable.removePending.slice(0) : []
                this._clearMaximumPending(sortable)
                sortable.removePending = []
                let sort
                if (sortable.options.maximumFIFO)
                {
                    sort = children.sort((a, b) => { return a === element ? 1 : a.__sortable.maximum - b.__sortable.maximum })
                }
                else
                {
                    sort = children.sort((a, b) => { return a === element ? 1 : b.__sortable.maximum - a.__sortable.maximum })
                }
                for (let i = 0; i < children.length - sortable.options.maximum; i++)
                {
                    const hide = sort[i]
                    hide.__sortable.display = hide.style.display || 'unset'
                    hide.style.display = 'none'
                    sortable.removePending.push(hide)
                    if (savePending.indexOf(hide) === -1)
                    {
                        sortable.emit('maximum-remove-pending', hide, sortable)
                    }
                }
            }
        }
    }

    /**
     * change cursor during mousedown
     * @param {MouseEvent} e
     * @private
     */
    _mouseDown(e)
    {
        if (this.options.cursorHover)
        {
            utils.style(e.currentTarget, 'cursor', this.options.cursorDown)
        }
    }

    /**
     * change cursor during mouseup
     * @param {MouseEvent} e
     * @private
     */
    _mouseUp(e)
    {
        this.emit('clicked', e.currentTarget, this)
        if (this.options.cursorHover)
        {
            utils.style(e.currentTarget, 'cursor', this.options.cursorHover)
        }
    }
}

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
 * fires when an element is removed from all sortables
 * @event Sortable#delete
 * @property {HTMLElement} element removed
 * @property {Sortable} sortable where element was dragged from
 */

/**
 * fires when a copy of an element is dropped
 * @event Sortable#copy
 * @property {HTMLElement} element removed
 * @property {Sortable} sortable where element was dragged from
 */

/**
 * fires when the sortable is updated with an add, remove, or order change
 * @event Sortable#update
 * @property {HTMLElement} element changed
 * @property {Sortable} sortable with element
 */

/**
 * fires when an element is removed because maximum was reached for the sortable
 * @event Sortable#maximum-remove
 * @property {HTMLElement} element removed
 * @property {Sortable} sortable where element was dragged from
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
 * fires when element is removed after being temporarily added
 * @event Sortable#add-remove-pending
 * @property {HTMLElement} element being dragged
 * @property {Sortable} current sortable with element placeholder
 */

/**
 * fires when an element is about to be removed from all sortables
 * @event Sortable#delete-pending
 * @property {HTMLElement} element removed
 * @property {Sortable} sortable where element was dragged from
 */

/**
 * fires when an element is added, removed, or reorder but element has not dropped yet
 * @event Sortable#update-pending
 * @property {HTMLElement} element being dragged
 * @property {Sortable} current sortable with element placeholder
 */

/**
 * fires when a copy of an element is about to drop
 * @event Sortable#copy-pending
 * @property {HTMLElement} element removed
 * @property {Sortable} sortable where element was dragged from
 */

/**
 * fires when an element is about to be removed because maximum was reached for the sortable
 * @event Sortable#maximum-remove-pending
 * @property {HTMLElement} element removed
 * @property {Sortable} sortable where element was dragged from
 */

/**
 * fires when an element is clicked without dragging
 * @event Sortable#clicked
 * @property {HTMLElement} element clicked
 * @property {Sortable} sortable where element is a child
 */

module.exports = Sortable