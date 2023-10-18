export const getIP = async () => {
  const res = await fetch('https://checkip.amazonaws.com/')
  return res.text()
}
