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
 * @param {number} x
 * @param {number} y
 * @param {HTMLElement} element
 */
export function distanceToClosestCorner(x, y, element)
{
    const pos = toGlobal(element)
    const topLeft = distance(x, y, pos.x, pos.y)
    const topRight = distance(x, y, pos.x + element.offsetWidth, pos.y)
    const bottomLeft = distance(x, y, pos.x, pos.y + element.offsetHeight)
    const bottomRight = distance(x, y, pos.x + element.offsetWidth, pos.y + element.offsetHeight)
    return Math.min(topLeft, topRight, bottomLeft, bottomRight)
}


/**
 * determine whether the mouse is inside an element
     * @param {HTMLElement} dragging
 * @param {HTMLElement} element
 */
export function inside(x, y, element)
{
    const pos = toGlobal(element)
    const x1 = pos.x
    const y1 = pos.y
    const w1 = element.offsetWidth
    const h1 = element.offsetHeight
    return x >= x1 && x <= x1 + w1 && y >= y1 && y <= y1 + h1}

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

/**
 * set a style on an element
 * @param {HTMLElement} element
 * @param {string} style
 * @param {(string|string[])} value - single value or list of possible values (test each one in order to see if it works)
 */
export function style(element, style, value)
{
    if (Array.isArray(value))
    {
        for (let entry of value)
        {
            element.style[style] = entry
            if (element.style[style] === entry)
            {
                break
            }
        }
    }
    else
    {
        element.style[style] = value
    }
}