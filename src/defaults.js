const icons = require('./icons')

/**
 * Options for Sortable
 * @typedef {object} Sortable~DefaultOptions
 * @property {string} [options.name=sortable] dragging is allowed between Sortables with the same name
 * @property {string} [options.dragClass] if set then drag only items with this className under element; otherwise drag all children
 * @property {string} [options.orderClass] use this class to include elements in ordering but not dragging; otherwise all children elements are included in when sorting and ordering
 * @property {boolean} [options.deepSearch] if dragClass and deepSearch then search all descendents of element for dragClass
 * @property {boolean} [options.sort=true] allow sorting within list
 * @property {boolean} [options.drop=true] allow drop from related sortables (doesn't impact reordering this sortable's children until the children are moved to a differen sortable)
 * @property {boolean} [options.copy=false] create copy when dragging an item (this disables sort=true for this sortable)
 * @property {string} [options.orderId=data-order] for ordered lists, use this data id to figure out sort order
 * @property {boolean} [options.orderIdIsNumber=true] use parseInt on options.sortId to properly sort numbers
 * @property {string} [options.reverseOrder] reverse sort the orderId
 * @property {string} [options.offList=closest] how to handle when an element is dropped outside a sortable: closest=drop in closest sortable; cancel=return to starting sortable; delete=remove from all sortables
 * @property {number} [options.maximum] maximum number of elements allowed in a sortable list
 * @property {boolean} [options.maximumFIFO] whether to use first-in-first-out (or last-in-first-out) to choose which item to remove when maximum is reached
 * @property {string} [options.cursorHover=grab -webkit-grab pointer] use this cursor list to set cursor when hovering over a sortable element
 * @property {string} [options.cursorDown=grabbing -webkit-grabbing pointer] use this cursor list to set cursor when mousedown/touchdown over a sortable element
 * @property {number} [options.threshold=10] minimum movement distance in pixels before calculating a movement
 * @property {boolean} [options.useIcons=true] show icons when dragging
 * @property {object} [options.icons] default set of icons
 * @property {string} [options.icons.reorder]
 * @property {string} [options.icons.move]
 * @property {string} [options.icons.copy]
 * @property {string} [options.icons.delete]
 * @property {string} [options.customIcon] source of custom image when over this sortable
 */
module.exports = {
    name: 'sortable',
    sort: true,
    drop: true,
    copy: false,
    orderId: 'data-order',
    orderIdIsNumber: true,
    threshold: 5,
    dragClass: null,
    orderClass: null,
    offList: 'closest',
    maximum: null,
    maximumFIFO: true,
    deepSearch: false,
    dragStyle: {
        boxShadow: '3px 3px 5px rgba(0,0,0,0.25)',
        opacity: 0.85,
        position: 'absolute',
        pointerEvents: 'none'
    },
    cursorHover: ['grab', '-webkit-grab', 'pointer'],
    cursorDown: ['grabbing', '-webkit-grabbing', 'pointer'],
    useIcons: true,
    icons
}