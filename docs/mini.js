const digests = {
    popular: {filename: 'shared.json', id: 'popular', title: 'popular', subtitle: 'in the past 24 hours'},
    latest: {filename: 'latest.json', id: 'latest', title: 'latest', subtitle: '200 links'},
    code: {filename: 'code.json', id: 'code', title: 'code', subtitle: 'latest'},
    research: {filename: 'research.json', id: 'research', title: 'research', subtitle: 'latest'},
    videos: {filename: 'videos.json', id: 'videos', title: 'videos', subtitle: 'latest'}
}

let current_stream
let posts = {}
let openPost

newElement = (element, classList) => {
    const el = document.createElement(element)
    el.classList = classList
    return el
}

render_post = (el, url) => {

    const post = newElement('a', ['post'])
    post.href = url
    post.target = '_blank'

    const post_content = newElement('div', ['post_content'])
    post_content.innerHTML = posts[url]

    post.addEventListener('click', (e) => {
        e.stopPropagation()
    })
    post.appendChild(post_content)

    el.closest('.content').appendChild(post)
    openPost = url

}

linkHandler = (e) => {
    e.stopPropagation()
    var postUrl  = e.target.closest('.content').dataset.url
    if (openPost == postUrl) {
        const reading = document.querySelector('.post')
        if (reading) {
            reading.remove()
        }
        openPost = ''
    } else {
        const reading = document.querySelector('.post')
        if (reading) {
            reading.remove()
        }
        render_post(e.target, postUrl)
    }
}

renderEntry = (entry) => {

    date = new Date(entry['latest'])

    const link = newElement('a', 'entry')
    link.addEventListener('click', linkHandler)

    const target = newElement('a', 'target')
    target.href = entry.link
    target.target = '_blank'
    link.appendChild(target)
    
    const content = newElement('div', 'content')
    content.dataset.url = entry.last_post.url

    const header = newElement('div', 'header')

    const title = newElement('div','title')
    title.textContent = entry.title
    header.appendChild(title)

    const published = newElement('div', ['published'])
    published.textContent = dateString = date.toLocaleTimeString("en-US", {hour: '2-digit', minute:'2-digit', hourCycle: 'h23'})
    published.title = `Last shared on ${date.toLocaleDateString('en-US', {hour:"numeric", minute:"numeric", day: "numeric", month: 'long', hourCycle: 'h23'})}`
    header.appendChild(published)
    
    content.appendChild(header)

    const context = newElement('div','context')

    const peoplediv = newElement('div','peoplediv')

    const prefix = newElement('span', 'prefix')
    prefix.textContent = 'Shared by'
    peoplediv.appendChild(prefix)

    entry.people.map((person, i) => {
        if (i > 0) {
            let separator = newElement('span','prefix')
            separator.textContent = '·'
            peoplediv.appendChild(separator)
        }
        let persondiv = newElement('a', 'person')
        persondiv.href = person.url
        persondiv.target = '_blank'
        persondiv.textContent = person.display_name
        peoplediv.appendChild(persondiv)
    })

    // const post = newElement('a', ['post'])
    // post.href = entry.last_post.url
    // post.target = '_blank'

    // const post_content = newElement('div', ['post_content'])
    // post_content.innerHTML = entry.last_post.content

    // post.appendChild(post_content)

    context.appendChild(peoplediv)
    // context.appendChild(post)
    content.appendChild(context)
    link.appendChild(content)
    posts[entry.last_post.url] = entry.last_post.content

    return link
}

download_and_render = (url, container) => {    
    fetch(url).then((response) => {
	response.json().then((entries) => {
	    entries.forEach(e => {
            var link = renderEntry(e, container)
            container.appendChild(link)
        })
	})})
    return container
}

var nav = document.querySelector('.nav')
var streams = document.querySelector('.streams')

render_digest = (digest_name) => {

    const digest = digests[digest_name]

    var stream = newElement('div','stream')
    var anchor = newElement('a', 'anchor')
    anchor.id = digest.id

    var streamTitle = newElement('div', 'streamTitle')
    streamTitle.textContent = digest.title
    stream.appendChild(streamTitle)

    var streamSubtitle = newElement('div', 'streamSubtitle')
    streamSubtitle.textContent = digest.subtitle
    stream.appendChild(streamSubtitle)

    var links = newElement('div','links')
    links = download_and_render(digest.filename, links)
    stream.appendChild(links)
    streams.appendChild(anchor)
    streams.appendChild(stream)

    current_stream = digest_name
}

navUpdate = (digest_name) => {
    const active = document.querySelector('.activenav')
    if (active) {
        active.classList.remove('activenav')
    }
    document.querySelector(`[data-digest="${digest_name}"]`).classList.add('activenav')
}

navHandler = (e) => {
    var digest_name  = e.target.dataset.digest
    if (current_stream != digest_name) {
        navUpdate(digest_name)
        document.querySelector('.stream').remove()
        render_digest(digest_name)
    }
}

Object.keys(digests).forEach(digest_name => {

    var digest = digests[digest_name]
    var navlink = newElement('a', 'navlink')
    navlink.textContent = digest.title
    navlink.dataset.digest = digest_name
    navlink.addEventListener('click', navHandler)
    
    nav.appendChild(navlink)

})

render_digest('popular')
navUpdate('popular')