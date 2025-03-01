export const isSolanaAddress = (address: string) => {
  return false
}

export const isEvmAddress = (address: string) =>{
  return address.startsWith('0x')
}
