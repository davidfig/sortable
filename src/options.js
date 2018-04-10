const icons = require('./icons')

/**
 * Options for Sortable
 * @typedef {object} Sortable~DefaultOptions
 * @property {string} [options.name=sortable] dragging is allowed between Sortables with the same name
 * @property {string} [options.dragClass] if set then drag only items with this className under element; otherwise drag all children
 * @property {string} [options.orderClass] use this class to include elements in ordering but not dragging; otherwise all children elements are included in when sorting and ordering
 * @property {boolean} [options.deepSearch] if dragClass and deepSearch then search all descendents of element for dragClass
 * @property {boolean} [options.sort=true] allow sorting within list
 * @property {string} [options.orderId=data-order] for ordered lists, use this data id to figure out sort order
 * @property {boolean} [options.orderIdIsNumber=true] use parseInt on options.sortId to properly sort numbers
 * @property {string} [options.reverseOrder] reverse sort the orderId
 * @property {boolean} [options.alwaysInList=true] place element inside closest related Sortable object; if set to false then the object is removed if dropped outside related sortables
 * @property {object} [options.childrenStyles] styles to apply to children elements of Sortable
 * @property {boolean} [options.useIcons=true] show icons when dragging
 * @property {object} [options.icons] default set of icons
 * @property {string} [options.icons.reorder]
 * @property {string} [options.icons.move]
 * @property {string} [options.icons.copy]
 * @property {string} [options.icons.delete]
 */
module.exports = {
    name: 'sortable',
    sort: true,
    orderId: 'data-order',
    orderIdIsNumber: true,
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
}