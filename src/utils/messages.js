const generateMessage  = (shevoName, text) => {
    return {
        shevoName,
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage  = (shevoName, urlShevo) => {
    return {
        shevoName,
        urlShevo,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}