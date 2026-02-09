module.exports = (balance) => ({
  subject: 'Low Balance Alert',
  body: `Your wallet balance is low: $${balance}\n\nPlease add funds soon.\n\nBanking App`,
});
