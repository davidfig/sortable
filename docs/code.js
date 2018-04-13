const Sortable = require('../src/sortable')
const Highlight = require('./highlight')

function test()
{
    const one = document.getElementById('example-1')
    const a1 = new Sortable(one)
    events(one, [a1])

    const two = document.getElementById('example-2')
    const a2 = new Sortable(two.children[0], { name: 'list-2' })
    const b2 = new Sortable(two.children[1], { name: 'list-2' })
    const c2 = new Sortable(two.children[2], { name: 'list-2' })
    events(two, [a2, b2, c2])

    const three = document.getElementById('example-3')
    const a3 = new Sortable(three.children[0], { name: 'list-3' })
    const b3 = new Sortable(three.children[1], { name: 'list-3', sort: false })
    events(three, [a3, b3])

    const four = document.getElementById('example-4')
    const a4 = new Sortable(four.children[0], { name: 'list-4' })
    const b4 = new Sortable(four.children[1], { name: 'list-4' })
    events(four, [a4, b4])

    const five = document.getElementById('example-5')
    const a5 = new Sortable(five.children[0], { name: 'list-5', dragClass: 'entry' })
    const b5 = new Sortable(five.children[1], { name: 'list-5', dragClass: 'entry', sort: false, orderClass: 'skip' })
    events(five, [a5, b5])

    const six = document.getElementById('example-6')
    const a6 = new Sortable(six.children[0], { name: 'list-6', dragClass: 'entry' })
    const b6 = new Sortable(six.children[1], { name: 'list-6', dragClass: 'entry', deepSearch: true, sort: false })
    events(six, [a6, b6])

    const seven = document.getElementById('example-7')
    const a7 = new Sortable(seven.children[0], { name: 'list-7', dragClass: 'entry' })
    const b7 = new Sortable(seven.children[1], { name: 'list-7', dragClass: 'entry', sort: false, reverseOrder: true })
    events(seven, [a7, b7])

    const eight = document.getElementById('example-8')
    const a8 = new Sortable(eight.children[0], { name: 'list-8', offList: 'cancel' })
    const b8 = new Sortable(eight.children[1], { name: 'list-8', offList: 'cancel' })
    events(eight, [a8, b8])

    const nine = document.getElementById('example-9')
    const a9 = new Sortable(nine, { name: 'list-9', offList: 'delete' })
    events(nine, [a9])

    const ten = document.getElementById('example-10')
    const a10 = new Sortable(ten.children[0], { name: 'list-10' })
    const b10 = new Sortable(ten.children[1], { name: 'list-10', drop: false })
    events(ten, [a10, b10])

    const eleven = document.getElementById('example-11')
    const a11 = new Sortable(eleven.children[0], { name: 'list-11' })
    const b11 = new Sortable(eleven.children[1], { name: 'list-11', copy: true })
    events(eleven, [a11, b11])
}

/**
 * show events
 * @param {HTMLElement} div
 * @param {Sortable[]} sortables
 */
function events(div, sortables)
{
    function on(name, i)
    {
        const letters = 'ABCDEF'
        sortables[i].on(name, () =>
        {
            events.innerHTML += '<div>' + letters[i] + ': ' + name + '</div>\n'
            events.scrollTop = events.scrollHeight
        })
    }

    const events = document.getElementById(div.id + '-events')
    events.innerHTML = '<div style="font-weight:bold">events listed here...</div>'
    for (let i = 0; i < sortables.length; i++)
    {
        on('add-pending', i)
        on('remove-pending', i)
        on('delete-pending', i)
        on('order-pending', i)
        on('update-pending', i)
        on('add', i)
        on('remove', i)
        on('delete', i)
        on('order', i)
        on('update', i)
    }
}

window.onload = function ()
{
    test()
    Highlight()
}