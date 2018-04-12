import Sortable from '../src/sortable'
import Highlight from './highlight'

function test()
{
    new Sortable(document.getElementById('example-1'))

    const two = document.getElementById('example-2')
    new Sortable(two.children[0], { name: 'list-2' })
    new Sortable(two.children[1], { name: 'list-2' })
    new Sortable(two.children[2], { name: 'list-2' })

    const three = document.getElementById('example-3')
    new Sortable(three.children[0], { name: 'list-3', alwaysInList: false })
    new Sortable(three.children[1], { name: 'list-3', sort: false, alwaysInList: false })

    const four = document.getElementById('example-4')
    new Sortable(four.children[0], { name: 'list-4' })
    new Sortable(four.children[1], { name: 'list-4' })

    const five = document.getElementById('example-5')
    new Sortable(five.children[0], { name: 'list-5', dragClass: 'entry' })
    new Sortable(five.children[1], { name: 'list-5', dragClass: 'entry', sort: false, orderClass: 'skip' })

    const six = document.getElementById('example-6')
    new Sortable(six.children[0], { name: 'list-6', dragClass: 'entry' })
    new Sortable(six.children[1], { name: 'list-6', dragClass: 'entry', deepSearch: true, sort: false })

    const seven = document.getElementById('example-7')
    new Sortable(seven.children[0], { name: 'list-7', dragClass: 'entry' })
    new Sortable(seven.children[1], { name: 'list-7', dragClass: 'entry', sort: false, reverseOrder: true })

    const eight = document.getElementById('example-8')
    new Sortable(eight, { name: 'list-8', alwaysInList: false })

    const nine = document.getElementById('example-9')
    new Sortable(nine.children[0], { name: 'list-9', copy: true })
    new Sortable(nine.children[1], { name: 'list-9' })

}

window.onload = function ()
{
    test()
    Highlight()
}