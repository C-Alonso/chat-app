const users = []

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
    //Pre-process the data
    username = username.trim().toLowerCase() //Trim: removes spaces before and after. toLowerCase: so Shevo === shevo.
    room = room.trim().toLowerCase()

    //Validate
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    //Check for existing user
    const existingUser = users.find((user) => {
        return user.username === username && user.room === room
    })

    //Validate username
    if (existingUser) {
        return {
            error: 'Username already taken!'
        }
    }

    //Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const indexExists = users.findIndex((user) => user.id === id) //-1: No match. >-1 Match.
    //Note: Stops searching after it finds a match; hence it's more convenient that 'filter'.
    
    if (indexExists !== -1) {
        console.log('Match found. Removing user...')
        return users.splice(indexExists, 1)[0] //Returns an array of all the items removed (1 for this case).
    }
    
}

const getUser = (id) => {
    const theUser = users.find((user) => user.id === id)

    if (!theUser) {
        return {
            error: 'User not found'
        }
    }

    return(theUser)
}

const getUsersInRoom = (room) => {
    //Pre-process the room
    room = room.trim().toLowerCase()
    const theUsers = users.filter((user) => user.room === room)

    if (!theUsers) {
        return {
            error: 'No users found'
        }
    }

    console.log('User(s) found:')
    return(theUsers)
}

module.exports = {
    addUser,
    getUser,
    getUsersInRoom,
    removeUser
}

//TEST DATA

// addUser({
//     id: 23,
//     username: '    Shevo #1',
//     room: 'Berlin   '
// })

// addUser({
//     id: 32,
//     username: '    Shevo #2',
//     room: 'Berlin   '
// })

// addUser({
//     id: 22,
//     username: '    Shevo #3',
//     room: 'Bologna   '
// })

// console.log(users)
// const wantedUser = getUser(23)
// console.log(wantedUser)
// const wantedUsers = getUsersInRoom('Berlin')
// console.log(wantedUsers)
// const removedUser = removeUser(23)
// console.log(removedUser)
// console.log(users)