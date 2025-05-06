export const hashString = (str) => {
  // Jika string lebih pendek atau sama dengan 8, tidak ada yang perlu dihash
  if (str.length <= 8) {
    return str;
  }

  // Ambil 3 karakter depan dan 4 karakter belakang
  const firstThree = str.slice(0, 4);
  const lastThree = str.slice(-4);

  // Hitung berapa karakter yang perlu di hash di tengah
  const middleLength = str.length - 8;

  // Buat hash untuk karakter tengah
  const hashedMiddle = "*".repeat(middleLength);

  // Gabungkan bagian yang tidak di hash dan bagian yang di hash
  return `${firstThree}${hashedMiddle}${lastThree}`;
};

export const splitFullName = (str) => {
  const nameParts = str.trim().split(" ");

  if (nameParts.length === 1) {
    return { firstname: nameParts[0], lastname: "" };
  }

  const firstname = nameParts[0];
  const lastname = nameParts.slice(1).join(" ");

  return { firstname, lastname };
};

export const setFullName = (firstName?: string, lastName?: string) => {
  let fullName = [];
  if (firstName) {
    const firstLetter = firstName.charAt(0).toUpperCase();
    const rest = firstName.slice(1);
    fullName.push(firstLetter + rest);
  }
  if (lastName) {
    const firstLetter = lastName.charAt(0).toUpperCase();
    const rest = lastName.slice(1);
    fullName.push(firstLetter + rest);
  }
  return fullName.join(' ');
};

export const generateRandomString = (length: number): string => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const charactersLength = characters.length;
  let result = "";

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

export const formatIndonesiaPhoneNumber = (phoneNumber: string): string => {
  if (phoneNumber.charAt(0) === '0') {
    return '62' + phoneNumber.slice(1);
  }
  return phoneNumber;
}