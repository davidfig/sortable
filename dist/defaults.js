'use strict';

var icons = require('./icons');

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
    icons: icons
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kZWZhdWx0cy5qcyJdLCJuYW1lcyI6WyJpY29ucyIsInJlcXVpcmUiLCJtb2R1bGUiLCJleHBvcnRzIiwibmFtZSIsInNvcnQiLCJkcm9wIiwiY29weSIsIm9yZGVySWQiLCJvcmRlcklkSXNOdW1iZXIiLCJ0aHJlc2hvbGQiLCJkcmFnQ2xhc3MiLCJvcmRlckNsYXNzIiwib2ZmTGlzdCIsImRlZXBTZWFyY2giLCJkcmFnU3R5bGUiLCJib3hTaGFkb3ciLCJvcGFjaXR5IiwicG9zaXRpb24iLCJwb2ludGVyRXZlbnRzIiwiY3Vyc29ySG92ZXIiLCJjdXJzb3JEb3duIiwidXNlSWNvbnMiXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBTUEsUUFBUUMsUUFBUSxTQUFSLENBQWQ7O0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF5QkFDLE9BQU9DLE9BQVAsR0FBaUI7QUFDYkMsVUFBTSxVQURPO0FBRWJDLFVBQU0sSUFGTztBQUdiQyxVQUFNLElBSE87QUFJYkMsVUFBTSxLQUpPO0FBS2JDLGFBQVMsWUFMSTtBQU1iQyxxQkFBaUIsSUFOSjtBQU9iQyxlQUFXLENBUEU7QUFRYkMsZUFBVyxJQVJFO0FBU2JDLGdCQUFZLElBVEM7QUFVYkMsYUFBUyxTQVZJO0FBV2JDLGdCQUFZLEtBWEM7QUFZYkMsZUFBVztBQUNQQyxtQkFBVyw4QkFESjtBQUVQQyxpQkFBUyxJQUZGO0FBR1BDLGtCQUFVLFVBSEg7QUFJUEMsdUJBQWU7QUFKUixLQVpFO0FBa0JiQyxpQkFBYSxDQUFDLE1BQUQsRUFBUyxjQUFULEVBQXlCLFNBQXpCLENBbEJBO0FBbUJiQyxnQkFBWSxDQUFDLFVBQUQsRUFBYSxrQkFBYixFQUFpQyxTQUFqQyxDQW5CQztBQW9CYkMsY0FBVSxJQXBCRztBQXFCYnRCO0FBckJhLENBQWpCIiwiZmlsZSI6ImRlZmF1bHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgaWNvbnMgPSByZXF1aXJlKCcuL2ljb25zJylcclxuXHJcbi8qKlxyXG4gKiBPcHRpb25zIGZvciBTb3J0YWJsZVxyXG4gKiBAdHlwZWRlZiB7b2JqZWN0fSBTb3J0YWJsZX5EZWZhdWx0T3B0aW9uc1xyXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW29wdGlvbnMubmFtZT1zb3J0YWJsZV0gZHJhZ2dpbmcgaXMgYWxsb3dlZCBiZXR3ZWVuIFNvcnRhYmxlcyB3aXRoIHRoZSBzYW1lIG5hbWVcclxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtvcHRpb25zLmRyYWdDbGFzc10gaWYgc2V0IHRoZW4gZHJhZyBvbmx5IGl0ZW1zIHdpdGggdGhpcyBjbGFzc05hbWUgdW5kZXIgZWxlbWVudDsgb3RoZXJ3aXNlIGRyYWcgYWxsIGNoaWxkcmVuXHJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbb3B0aW9ucy5vcmRlckNsYXNzXSB1c2UgdGhpcyBjbGFzcyB0byBpbmNsdWRlIGVsZW1lbnRzIGluIG9yZGVyaW5nIGJ1dCBub3QgZHJhZ2dpbmc7IG90aGVyd2lzZSBhbGwgY2hpbGRyZW4gZWxlbWVudHMgYXJlIGluY2x1ZGVkIGluIHdoZW4gc29ydGluZyBhbmQgb3JkZXJpbmdcclxuICogQHByb3BlcnR5IHtib29sZWFufSBbb3B0aW9ucy5kZWVwU2VhcmNoXSBpZiBkcmFnQ2xhc3MgYW5kIGRlZXBTZWFyY2ggdGhlbiBzZWFyY2ggYWxsIGRlc2NlbmRlbnRzIG9mIGVsZW1lbnQgZm9yIGRyYWdDbGFzc1xyXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IFtvcHRpb25zLnNvcnQ9dHJ1ZV0gYWxsb3cgc29ydGluZyB3aXRoaW4gbGlzdFxyXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IFtvcHRpb25zLmRyb3A9dHJ1ZV0gYWxsb3cgZHJvcCBmcm9tIHJlbGF0ZWQgc29ydGFibGVzIChkb2Vzbid0IGltcGFjdCByZW9yZGVyaW5nIHRoaXMgc29ydGFibGUncyBjaGlsZHJlbiB1bnRpbCB0aGUgY2hpbGRyZW4gYXJlIG1vdmVkIHRvIGEgZGlmZmVyZW4gc29ydGFibGUpXHJcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW29wdGlvbnMuY29weT1mYWxzZV0gY3JlYXRlIGNvcHkgd2hlbiBkcmFnZ2luZyBhbiBpdGVtICh0aGlzIGRpc2FibGVzIHNvcnQ9dHJ1ZSBmb3IgdGhpcyBzb3J0YWJsZSlcclxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtvcHRpb25zLm9yZGVySWQ9ZGF0YS1vcmRlcl0gZm9yIG9yZGVyZWQgbGlzdHMsIHVzZSB0aGlzIGRhdGEgaWQgdG8gZmlndXJlIG91dCBzb3J0IG9yZGVyXHJcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW29wdGlvbnMub3JkZXJJZElzTnVtYmVyPXRydWVdIHVzZSBwYXJzZUludCBvbiBvcHRpb25zLnNvcnRJZCB0byBwcm9wZXJseSBzb3J0IG51bWJlcnNcclxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtvcHRpb25zLnJldmVyc2VPcmRlcl0gcmV2ZXJzZSBzb3J0IHRoZSBvcmRlcklkXHJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbb3B0aW9ucy5vZmZMaXN0PWNsb3Nlc3RdIGhvdyB0byBoYW5kbGUgd2hlbiBhbiBlbGVtZW50IGlzIGRyb3BwZWQgb3V0c2lkZSBhIHNvcnRhYmxlOiBjbG9zZXN0PWRyb3AgaW4gY2xvc2VzdCBzb3J0YWJsZTsgY2FuY2VsPXJldHVybiB0byBzdGFydGluZyBzb3J0YWJsZTsgZGVsZXRlPXJlbW92ZSBmcm9tIGFsbCBzb3J0YWJsZXNcclxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtvcHRpb25zLmN1cnNvckhvdmVyPWdyYWIgLXdlYmtpdC1ncmFiIHBvaW50ZXJdIHVzZSB0aGlzIGN1cnNvciBsaXN0IHRvIHNldCBjdXJzb3Igd2hlbiBob3ZlcmluZyBvdmVyIGEgc29ydGFibGUgZWxlbWVudFxyXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW29wdGlvbnMuY3Vyc29yRG93bj1ncmFiYmluZyAtd2Via2l0LWdyYWJiaW5nIHBvaW50ZXJdIHVzZSB0aGlzIGN1cnNvciBsaXN0IHRvIHNldCBjdXJzb3Igd2hlbiBtb3VzZWRvd24vdG91Y2hkb3duIG92ZXIgYSBzb3J0YWJsZSBlbGVtZW50XHJcbiAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbb3B0aW9ucy50aHJlc2hvbGQ9MTBdIG1pbmltdW0gbW92ZW1lbnQgZGlzdGFuY2UgaW4gcGl4ZWxzIGJlZm9yZSBjYWxjdWxhdGluZyBhIG1vdmVtZW50XHJcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW29wdGlvbnMudXNlSWNvbnM9dHJ1ZV0gc2hvdyBpY29ucyB3aGVuIGRyYWdnaW5nXHJcbiAqIEBwcm9wZXJ0eSB7b2JqZWN0fSBbb3B0aW9ucy5pY29uc10gZGVmYXVsdCBzZXQgb2YgaWNvbnNcclxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtvcHRpb25zLmljb25zLnJlb3JkZXJdXHJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbb3B0aW9ucy5pY29ucy5tb3ZlXVxyXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW29wdGlvbnMuaWNvbnMuY29weV1cclxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtvcHRpb25zLmljb25zLmRlbGV0ZV1cclxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtvcHRpb25zLmN1c3RvbUljb25dIHNvdXJjZSBvZiBjdXN0b20gaW1hZ2Ugd2hlbiBvdmVyIHRoaXMgc29ydGFibGVcclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgbmFtZTogJ3NvcnRhYmxlJyxcclxuICAgIHNvcnQ6IHRydWUsXHJcbiAgICBkcm9wOiB0cnVlLFxyXG4gICAgY29weTogZmFsc2UsXHJcbiAgICBvcmRlcklkOiAnZGF0YS1vcmRlcicsXHJcbiAgICBvcmRlcklkSXNOdW1iZXI6IHRydWUsXHJcbiAgICB0aHJlc2hvbGQ6IDUsXHJcbiAgICBkcmFnQ2xhc3M6IG51bGwsXHJcbiAgICBvcmRlckNsYXNzOiBudWxsLFxyXG4gICAgb2ZmTGlzdDogJ2Nsb3Nlc3QnLFxyXG4gICAgZGVlcFNlYXJjaDogZmFsc2UsXHJcbiAgICBkcmFnU3R5bGU6IHtcclxuICAgICAgICBib3hTaGFkb3c6ICczcHggM3B4IDVweCByZ2JhKDAsMCwwLDAuMjUpJyxcclxuICAgICAgICBvcGFjaXR5OiAwLjg1LFxyXG4gICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgIHBvaW50ZXJFdmVudHM6ICdub25lJ1xyXG4gICAgfSxcclxuICAgIGN1cnNvckhvdmVyOiBbJ2dyYWInLCAnLXdlYmtpdC1ncmFiJywgJ3BvaW50ZXInXSxcclxuICAgIGN1cnNvckRvd246IFsnZ3JhYmJpbmcnLCAnLXdlYmtpdC1ncmFiYmluZycsICdwb2ludGVyJ10sXHJcbiAgICB1c2VJY29uczogdHJ1ZSxcclxuICAgIGljb25zXHJcbn0iXX0=