'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _icons = require('./icons');

var _icons2 = _interopRequireDefault(_icons);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
 * @property {boolean} [options.alwaysInList=true] place element inside closest related Sortable object; if set to false then the object is removed if dropped outside related sortables
 * @property {boolean} [options.returnToOriginal=true] if alwaysInList=false and element is dropped where there are no sortables then the element is returned to its starting sortable
 * @property {string} [options.cursorHover=grab -webkit-grab pointer] use this cursor list to set cursor when hovering over a sortable element
 * @property {string} [options.cursorDown=grabbing -webkit-grabbing pointer] use this cursor list to set cursor when mousedown/touchdown over a sortable element
 * @property {boolean} [options.useIcons=true] show icons when dragging
 * @property {object} [options.icons] default set of icons
 * @property {string} [options.icons.reorder]
 * @property {string} [options.icons.move]
 * @property {string} [options.icons.copy]
 * @property {string} [options.icons.delete]
 * @property {string} [options.customIcon] source of custom image when over this sortable
 */
exports.default = {
    name: 'sortable',
    sort: true,
    drop: true,
    copy: false,
    orderId: 'data-order',
    orderIdIsNumber: true,
    threshold: 10,
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
    icons: _icons2.default
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kZWZhdWx0cy5qcyJdLCJuYW1lcyI6WyJuYW1lIiwic29ydCIsImRyb3AiLCJjb3B5Iiwib3JkZXJJZCIsIm9yZGVySWRJc051bWJlciIsInRocmVzaG9sZCIsImRyYWdDbGFzcyIsIm9yZGVyQ2xhc3MiLCJvZmZMaXN0IiwiZGVlcFNlYXJjaCIsImRyYWdTdHlsZSIsImJveFNoYWRvdyIsIm9wYWNpdHkiLCJwb3NpdGlvbiIsInBvaW50ZXJFdmVudHMiLCJjdXJzb3JIb3ZlciIsImN1cnNvckRvd24iLCJ1c2VJY29ucyIsImljb25zIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7Ozs7O0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7a0JBeUJlO0FBQ1hBLFVBQU0sVUFESztBQUVYQyxVQUFNLElBRks7QUFHWEMsVUFBTSxJQUhLO0FBSVhDLFVBQU0sS0FKSztBQUtYQyxhQUFTLFlBTEU7QUFNWEMscUJBQWlCLElBTk47QUFPWEMsZUFBVyxFQVBBO0FBUVhDLGVBQVcsSUFSQTtBQVNYQyxnQkFBWSxJQVREO0FBVVhDLGFBQVMsU0FWRTtBQVdYQyxnQkFBWSxLQVhEO0FBWVhDLGVBQVc7QUFDUEMsbUJBQVcsOEJBREo7QUFFUEMsaUJBQVMsSUFGRjtBQUdQQyxrQkFBVSxVQUhIO0FBSVBDLHVCQUFlO0FBSlIsS0FaQTtBQWtCWEMsaUJBQWEsQ0FBQyxNQUFELEVBQVMsY0FBVCxFQUF5QixTQUF6QixDQWxCRjtBQW1CWEMsZ0JBQVksQ0FBQyxVQUFELEVBQWEsa0JBQWIsRUFBaUMsU0FBakMsQ0FuQkQ7QUFvQlhDLGNBQVUsSUFwQkM7QUFxQlhDO0FBckJXLEMiLCJmaWxlIjoiZGVmYXVsdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaWNvbnMgZnJvbSAnLi9pY29ucydcclxuXHJcbi8qKlxyXG4gKiBPcHRpb25zIGZvciBTb3J0YWJsZVxyXG4gKiBAdHlwZWRlZiB7b2JqZWN0fSBTb3J0YWJsZX5EZWZhdWx0T3B0aW9uc1xyXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW29wdGlvbnMubmFtZT1zb3J0YWJsZV0gZHJhZ2dpbmcgaXMgYWxsb3dlZCBiZXR3ZWVuIFNvcnRhYmxlcyB3aXRoIHRoZSBzYW1lIG5hbWVcclxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtvcHRpb25zLmRyYWdDbGFzc10gaWYgc2V0IHRoZW4gZHJhZyBvbmx5IGl0ZW1zIHdpdGggdGhpcyBjbGFzc05hbWUgdW5kZXIgZWxlbWVudDsgb3RoZXJ3aXNlIGRyYWcgYWxsIGNoaWxkcmVuXHJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbb3B0aW9ucy5vcmRlckNsYXNzXSB1c2UgdGhpcyBjbGFzcyB0byBpbmNsdWRlIGVsZW1lbnRzIGluIG9yZGVyaW5nIGJ1dCBub3QgZHJhZ2dpbmc7IG90aGVyd2lzZSBhbGwgY2hpbGRyZW4gZWxlbWVudHMgYXJlIGluY2x1ZGVkIGluIHdoZW4gc29ydGluZyBhbmQgb3JkZXJpbmdcclxuICogQHByb3BlcnR5IHtib29sZWFufSBbb3B0aW9ucy5kZWVwU2VhcmNoXSBpZiBkcmFnQ2xhc3MgYW5kIGRlZXBTZWFyY2ggdGhlbiBzZWFyY2ggYWxsIGRlc2NlbmRlbnRzIG9mIGVsZW1lbnQgZm9yIGRyYWdDbGFzc1xyXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IFtvcHRpb25zLnNvcnQ9dHJ1ZV0gYWxsb3cgc29ydGluZyB3aXRoaW4gbGlzdFxyXG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IFtvcHRpb25zLmRyb3A9dHJ1ZV0gYWxsb3cgZHJvcCBmcm9tIHJlbGF0ZWQgc29ydGFibGVzIChkb2Vzbid0IGltcGFjdCByZW9yZGVyaW5nIHRoaXMgc29ydGFibGUncyBjaGlsZHJlbiB1bnRpbCB0aGUgY2hpbGRyZW4gYXJlIG1vdmVkIHRvIGEgZGlmZmVyZW4gc29ydGFibGUpXHJcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW29wdGlvbnMuY29weT1mYWxzZV0gY3JlYXRlIGNvcHkgd2hlbiBkcmFnZ2luZyBhbiBpdGVtICh0aGlzIGRpc2FibGVzIHNvcnQ9dHJ1ZSBmb3IgdGhpcyBzb3J0YWJsZSlcclxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtvcHRpb25zLm9yZGVySWQ9ZGF0YS1vcmRlcl0gZm9yIG9yZGVyZWQgbGlzdHMsIHVzZSB0aGlzIGRhdGEgaWQgdG8gZmlndXJlIG91dCBzb3J0IG9yZGVyXHJcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW29wdGlvbnMub3JkZXJJZElzTnVtYmVyPXRydWVdIHVzZSBwYXJzZUludCBvbiBvcHRpb25zLnNvcnRJZCB0byBwcm9wZXJseSBzb3J0IG51bWJlcnNcclxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtvcHRpb25zLnJldmVyc2VPcmRlcl0gcmV2ZXJzZSBzb3J0IHRoZSBvcmRlcklkXHJcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW29wdGlvbnMuYWx3YXlzSW5MaXN0PXRydWVdIHBsYWNlIGVsZW1lbnQgaW5zaWRlIGNsb3Nlc3QgcmVsYXRlZCBTb3J0YWJsZSBvYmplY3Q7IGlmIHNldCB0byBmYWxzZSB0aGVuIHRoZSBvYmplY3QgaXMgcmVtb3ZlZCBpZiBkcm9wcGVkIG91dHNpZGUgcmVsYXRlZCBzb3J0YWJsZXNcclxuICogQHByb3BlcnR5IHtib29sZWFufSBbb3B0aW9ucy5yZXR1cm5Ub09yaWdpbmFsPXRydWVdIGlmIGFsd2F5c0luTGlzdD1mYWxzZSBhbmQgZWxlbWVudCBpcyBkcm9wcGVkIHdoZXJlIHRoZXJlIGFyZSBubyBzb3J0YWJsZXMgdGhlbiB0aGUgZWxlbWVudCBpcyByZXR1cm5lZCB0byBpdHMgc3RhcnRpbmcgc29ydGFibGVcclxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtvcHRpb25zLmN1cnNvckhvdmVyPWdyYWIgLXdlYmtpdC1ncmFiIHBvaW50ZXJdIHVzZSB0aGlzIGN1cnNvciBsaXN0IHRvIHNldCBjdXJzb3Igd2hlbiBob3ZlcmluZyBvdmVyIGEgc29ydGFibGUgZWxlbWVudFxyXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW29wdGlvbnMuY3Vyc29yRG93bj1ncmFiYmluZyAtd2Via2l0LWdyYWJiaW5nIHBvaW50ZXJdIHVzZSB0aGlzIGN1cnNvciBsaXN0IHRvIHNldCBjdXJzb3Igd2hlbiBtb3VzZWRvd24vdG91Y2hkb3duIG92ZXIgYSBzb3J0YWJsZSBlbGVtZW50XHJcbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW29wdGlvbnMudXNlSWNvbnM9dHJ1ZV0gc2hvdyBpY29ucyB3aGVuIGRyYWdnaW5nXHJcbiAqIEBwcm9wZXJ0eSB7b2JqZWN0fSBbb3B0aW9ucy5pY29uc10gZGVmYXVsdCBzZXQgb2YgaWNvbnNcclxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtvcHRpb25zLmljb25zLnJlb3JkZXJdXHJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbb3B0aW9ucy5pY29ucy5tb3ZlXVxyXG4gKiBAcHJvcGVydHkge3N0cmluZ30gW29wdGlvbnMuaWNvbnMuY29weV1cclxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtvcHRpb25zLmljb25zLmRlbGV0ZV1cclxuICogQHByb3BlcnR5IHtzdHJpbmd9IFtvcHRpb25zLmN1c3RvbUljb25dIHNvdXJjZSBvZiBjdXN0b20gaW1hZ2Ugd2hlbiBvdmVyIHRoaXMgc29ydGFibGVcclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICAgIG5hbWU6ICdzb3J0YWJsZScsXHJcbiAgICBzb3J0OiB0cnVlLFxyXG4gICAgZHJvcDogdHJ1ZSxcclxuICAgIGNvcHk6IGZhbHNlLFxyXG4gICAgb3JkZXJJZDogJ2RhdGEtb3JkZXInLFxyXG4gICAgb3JkZXJJZElzTnVtYmVyOiB0cnVlLFxyXG4gICAgdGhyZXNob2xkOiAxMCxcclxuICAgIGRyYWdDbGFzczogbnVsbCxcclxuICAgIG9yZGVyQ2xhc3M6IG51bGwsXHJcbiAgICBvZmZMaXN0OiAnY2xvc2VzdCcsXHJcbiAgICBkZWVwU2VhcmNoOiBmYWxzZSxcclxuICAgIGRyYWdTdHlsZToge1xyXG4gICAgICAgIGJveFNoYWRvdzogJzNweCAzcHggNXB4IHJnYmEoMCwwLDAsMC4yNSknLFxyXG4gICAgICAgIG9wYWNpdHk6IDAuODUsXHJcbiAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgcG9pbnRlckV2ZW50czogJ25vbmUnXHJcbiAgICB9LFxyXG4gICAgY3Vyc29ySG92ZXI6IFsnZ3JhYicsICctd2Via2l0LWdyYWInLCAncG9pbnRlciddLFxyXG4gICAgY3Vyc29yRG93bjogWydncmFiYmluZycsICctd2Via2l0LWdyYWJiaW5nJywgJ3BvaW50ZXInXSxcclxuICAgIHVzZUljb25zOiB0cnVlLFxyXG4gICAgaWNvbnNcclxufSJdfQ==