/**
 * Whether element contains classname
 * @param {HTMLElement} e
 * @param {string} name
 * @returns {boolean}
 * @private
 */
export function containsClassName(e, name)
{
    if (e.className)
    {
        const list = e.className.split(' ')
        for (let entry of list)
        {
            if (entry === name)
            {
                return true
            }
        }
    }
    return false
}

/**
 * measure distance between two points
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 */
export function distance(x1, y1, x2, y2)
{
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
}

/**
 * find closest distance from UIEvent to a corner of an element
 * @param {HTMLUListElement} e
 * @param {HTMLElement} element
 */
export function distanceToClosestCorner(e, element)
{
    const topLeft = distance(e.pageX, e.pageY, element.offsetLeft, element.offsetTop)
    const topRight = distance(e.pageX, e.pageY, element.offsetLeft + element.offsetWidth, element.offsetTop)
    const bottomLeft = distance(e.pageX, e.pageY, element.offsetLeft, element.offsetTop + element.offsetHeight)
    const bottomRight = distance(e.pageX, e.pageY, element.offsetLeft + element.offsetWidth, element.offsetTop + element.offsetHeight)
    return Math.min(topLeft, topRight, bottomLeft, bottomRight)
}


/**
 * determine whether these is overlap between two elements
 * @param {HTMLElement} dragging
 * @param {HTMLElement} element
 */
export function inside(dragging, element)
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
 * determines global location of a div
 * from https://stackoverflow.com/a/26230989/1955997
 * @param {HTMLElement} e
 * @returns {PointLike}
 */
export function toGlobal(e)
{
    const box = e.getBoundingClientRect()

    const body = document.body
    const docEl = document.documentElement

    const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop
    const scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft

    const clientTop = docEl.clientTop || body.clientTop || 0
    const clientLeft = docEl.clientLeft || body.clientLeft || 0

    const top = box.top + scrollTop - clientTop
    const left = box.left + scrollLeft - clientLeft

    return { y: Math.round(top), x: Math.round(left) }
}

/**
 * @typedef {object} PointLike
 * @property {number} x
 * @property {number} y
 */

/**
 * combines options and default options
 * @param {object} options
 * @param {object} defaults
 * @returns {object} options+defaults
 */
export function options(options, defaults)
{
    options = options || {}
    for (let option in defaults)
    {
        options[option] = typeof options[option] !== 'undefined' ? options[option] : defaults[option]
    }
    return options
}