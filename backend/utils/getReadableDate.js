const getReadableDate = () => {
    const now = new Date();

    // Options for formatting the date and time
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZoneName: 'short',
    };
  
    // Format the date using the options
    const readableDate = now.toLocaleDateString('en-US', options);
  
    return readableDate;
}

module.exports = getReadableDate;