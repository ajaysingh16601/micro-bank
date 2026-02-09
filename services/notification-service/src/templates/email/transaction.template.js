module.exports = (type, amount, balance) => ({
  subject: `${type} Transaction Notification`,
  body: `Your wallet has been ${type === 'CREDIT' ? 'credited' : 'debited'} with $${amount}.\n\nCurrent balance: $${balance}\n\nThank you,\nBanking App`,
});
