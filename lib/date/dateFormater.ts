export const formatDate = (date: Date) => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = [
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"
  ];

  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = date.getHours() >= 12 ? "PM" : "AM";
  const hour12 = (date.getHours() % 12 || 12).toString(); // Convert to 12-hour format

  return {
    fullDate: `${dayName}, ${day} ${monthName}`,
    timeOnly: `${hour12}:${minutes} ${ampm}`
  };
};