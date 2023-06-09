export const formatTime = (time) => {
  const hours = time.split(":")[0];
  const minutes = time.split(":")[1];
  const ampm = hours >= 12 ? "pm" : "am";
  const hours12 = hours % 12 || 12;
  const minutesStr = minutes < 10 ? "0" + minutes : minutes;
  return hours12 + ":" + minutesStr + " " + ampm;
};

export const formatDate = (dateString) => {
  const date = new Date(dateString).toDateString();
  const dateFormatted = date.split(" ").slice(1, -1).join("-");
  const time = new Date(dateString).toTimeString();
  const timeFormatted = time.split(":").slice(0, 2).join(":");

  const now = new Date();
  const diffInMs = now - new Date(dateString);
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

  if (diffInMinutes <= 60) {
    return `${diffInMinutes} minutes ago`;
  } else if (diffInMinutes <= 60 * 24) {
    const diffInHours = Math.floor(diffInMinutes / 60);
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  } else {
    return formatTime(timeFormatted) + " " + `[${dateFormatted}]`;
  }
};

export const getCurTime = () => {
  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const time = `${hours}:${minutes}`;

  return formatTime(time);
};
