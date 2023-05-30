export function isValidEthereumAddress(address) {
    // Remove 0x prefix if present
    if (address.startsWith("0x")) {
      address = address.slice(2);
    }
    // Check if the address is a 40-character hexadecimal string
    const regex = /^[0-9a-fA-F]{40}$/;
    return regex.test(address);
  }