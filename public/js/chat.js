//Makes the WebSocket connection. Sends and receives events.
const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput =  $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')

const $locationButton = document.querySelector('#send-location')

const $messagesContainer = document.querySelector('#messages-container')

const $sidebar = document.querySelector('#sidebar')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

//Options
const { username, room } =  Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    //New message element
    const $newMessage = $messagesContainer.lastElementChild

    //Height of the new message

    //We start by getting the margin (line below). Better not to hard-code it, in case there are future changes.
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible height
    const visibleHeight = $messagesContainer.offsetHeight
    console.log(newMessageMargin)

    //Height of message container
    const containerHeight = $messagesContainer.scrollHeight

    //Now we calculate the difference. (How much the user has scrolled)
    const scrollOffset = $messagesContainer.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {        
        //Scroll the user to the bottom.
        $messagesContainer.scrollTop = $messagesContainer.scrollHeight
    }
}

socket.on('messageFromServer', (messageShevo) => { 
    console.log(messageShevo)    
    const html = Mustache.render(messageTemplate, {
        username: messageShevo.shevoName,
        message: messageShevo.text,
        createdAt: moment(messageShevo.createdAt).format('HH:mm')
    })
    $messagesContainer.insertAdjacentHTML('beforeend', html) //Inside of the div.
    autoscroll()
})

socket.on('locationMessage', (locationMessage) => { 
    console.log(locationMessage)   
    const html = Mustache.render(locationTemplate, {
        username: locationMessage.shevoName,
        url: locationMessage.urlShevo,
        createdAt: moment(locationMessage.createdAt).format('HH:mm')
    })     
    $messagesContainer.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, usersList })  => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users: usersList
    })
    $sidebar.innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {    
    e.preventDefault()

    //Disable button
    $messageFormButton.setAttribute('disabled', 'disabled')
    
    //const $messageShevo = e.target.elements.messageShevo.value //target is the form; messageShevo is the name of the textbox.
    socket.emit('sendMessageShevo', $messageFormInput.value, (error) => {
        //Enable button
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    }) //We fire the event 'incrementShevo', which is to be listened on the server.
})



$locationButton.addEventListener('click', () => {   

    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }    

    //Disable
    $locationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {        
        latitude = position.coords.latitude
        longitude = position.coords.longitude
        socket.emit('sendLocation', {
            "latitude": position.coords.latitude,
            "longitude": position.coords.longitude
        }, (error) => {
            if (error) {
                return console.log(error)
            }

            console.log('Location shared!')

            //Enable button
            $locationButton.removeAttribute('disabled')
        })
    })    
})

socket.emit('join', { username, room }, error => {
    if (error) {
        return console.log(error)
    }
})