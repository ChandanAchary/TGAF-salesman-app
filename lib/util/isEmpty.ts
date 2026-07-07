function isEmpty(...strings: string[]): boolean {
  for (const str of strings) {
    if (str !== "" && str !== " ") {
      return true;
    }
  }
  return false;
}