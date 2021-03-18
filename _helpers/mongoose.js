
module.exports = {
    Account:require('../user.auth/user.model'),
    RefreshToken:require('../user.auth/refresh-token.model'),
    isValidId}

function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}